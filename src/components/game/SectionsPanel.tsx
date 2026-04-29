import { ReactNode, memo, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { PLAYBOOK_STEPS } from "@/data/playbookSteps";
import { GROWTH_STEPS } from "@/modules/library/growthSteps";
// Day 53 night iter 3 (Sasha 2026-04-27): pane 2 phase progress decorations.
// Hook returns null when not on /ubb*, so this import is free on every
// other route — the hook is the gate, not a wrapper.
import { useCanvasProgressLite } from "@/modules/unique-business-builder/useCanvasProgressLite";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubSection {
    id: string;
    label: string;
    path: string;
}

interface Section {
    id: string;
    label: string;
    path: string;
    icon?: ReactNode;
    badge?: string;
    subSections?: SubSection[];
    locked?: boolean;
    lockedHint?: string;
    /**
     * Day 53 night iter 3 (Sasha 2026-04-27): right-aligned progress
     * fraction for UBB phase rows ("6/7", "0/3"). When set, the row
     * also renders a thin gold progress bar beneath the label —
     * visible at-a-glance signal of how locked each phase is. JOURNEY
     * and ME panes don't use this field, so its absence is harmless.
     */
    progress?: { locked: number; total: number };
}

interface SpaceSections {
    [spaceId: string]: {
        title: string;
        sections: Section[];
    };
}

const SPACE_SECTIONS: SpaceSections = {
    // JOURNEY Space — the 7-step methodology sequence.
    //
    // NOTE: the journey sections are BUILT DYNAMICALLY inside the
    // component based on `useJourneyProgression().currentStep`, so this
    // static entry is intentionally empty (keeping the key alive so the
    // lookup doesn't return null). See `buildJourneySections()` below.
    journey: {
        title: "JOURNEY",
        sections: [],
    },
    // AI OS Space — Day 54 (Sasha 2026-04-28): elevated from JOURNEY
    // step #4 to its own Space. Pane 2 separates the substrate
    // (Install) from the toolkit on top (Suites) from the proof
    // (Benchmark) from the upgrade path (Pricing). The Suites parent
    // mirrors the ME `top-talent` parent-with-children pattern.
    "ai-os": {
        title: "AI OS",
        sections: [
            {
                id: "ai-os-install",
                label: "60-second install",
                path: "/ai-os",
            },
            {
                id: "ai-os-suites",
                label: "Prompt Suites",
                // Parent path is intentionally a non-resolved sentinel —
                // clicks toggle expand/collapse rather than navigating.
                // The sub-sections own the real routes.
                path: "/ai-os/suites",
                subSections: [
                    { id: "ai-os-clarity", label: "Clarify", path: "/ai-os/clarity" },
                    { id: "ai-os-iteration", label: "Iterate", path: "/ai-os/iteration" },
                    { id: "ai-os-vibe-code", label: "Vibe Code", path: "/ai-os/vibe-code" },
                    { id: "ai-os-design", label: "Design", path: "/ai-os/design" },
                ],
            },
            {
                id: "ai-os-benchmark",
                label: "Benchmarking",
                path: "/ai-os/benchmark",
            },
            {
                id: "ai-os-pricing",
                label: "Work with us",
                path: "/ai-os/work-with-us",
            },
        ],
    },
    // Hidden until built — uncomment to re-enable
    // "next-move": {
    //     title: "My Next Move",
    //     sections: [
    //         { id: "recommended", label: "Recommended Action", path: "/game/next-move" },
    //     ],
    // },
    // ME Space — Day 47 late pass (Sasha): collapsed to ONLY Top Talent.
    // The Me space is now a single-focus view: your Top Talent profile.
    // Other sections (My Mission, Genius Business, Quality of Life, Assets,
    // Settings) retired from the Me rail until the user has earned those
    // capabilities. Settings still reachable via Panel 1 footer button.
    // URL paths kept as `/game/me/zone-of-genius/*` for backwards compat;
    // UI labels renamed to "Top Talent" per the rename pass.
    grow: {
        title: "ME",
        sections: [
            {
                id: "top-talent",
                label: "Top Talent",
                path: "/game/me/zone-of-genius",
                // Day 52 (Sasha 2026-04-26): Professional Activities,
                // Visual Codes, and Elevator Pitch removed from the
                // snapshot (career-advisory pollution and redundant
                // articulations). Monetization restored later same day
                // with a sharpened prompt (intro/signature/scale tiers).
                // Mastery Stages, Roles & Environments, Complementary
                // Partner, and Monetization stay — load-bearing per Sasha.
                subSections: [
                    { id: "tt-overview", label: "Overview", path: "/game/me/zone-of-genius" },
                    { id: "tt-bullseye", label: "Bullseye Sentence", path: "/game/me/zone-of-genius/bullseye" },
                    { id: "tt-vibrational-key", label: "Vibrational Key", path: "/game/me/zone-of-genius/vibrational-key" },
                    { id: "tt-three-lenses", label: "Three Lenses", path: "/game/me/zone-of-genius/three-lenses" },
                    { id: "tt-appreciated-for", label: "Appreciated For", path: "/game/me/zone-of-genius/appreciated-for" },
                    { id: "tt-mastery", label: "Mastery Stages", path: "/game/me/zone-of-genius/mastery" },
                    { id: "tt-roles", label: "Roles & Environments", path: "/game/me/zone-of-genius/roles" },
                    { id: "tt-partner", label: "Complementary Partner", path: "/game/me/zone-of-genius/partner" },
                    { id: "tt-monetization", label: "Monetization", path: "/game/me/zone-of-genius/monetization" },
                    { id: "tt-life-scene", label: "Life Scene", path: "/game/me/zone-of-genius/life-scene" },
                ],
            },
        ],
    },
    // LEARN Space
    // Day 56 (Sasha 2026-04-28): the 6-step Growth Sequence (Library) is
    // promoted from a stacked accordion in pane 3 to first-class pane 2
    // items. Each step is its own row with a numbered gold pip, mirroring
    // JOURNEY's editorial register. Locked steps render with the same
    // fog-of-war opacity gradient + lockedHint tooltip as JOURNEY's locked
    // teasers — one consistent visual language for "what you're earning
    // toward." The 5 Growth Paths (Body / Emotions / Mind / Talent / Spirit)
    // remain below as a separate group of placeholders.
    //
    // Sections built dynamically from GROWTH_STEPS in `getSections()` so
    // there's a single source of truth for the steps (also read by Library.tsx
    // when rendering the active step's content in pane 3).
    learn: {
        title: "LEARN",
        sections: [],
    },
    // MEET Space (was Events)
    meet: {
        title: "MEET",
        sections: [
            { id: "browse", label: "Browse Events", path: "/game/meet" },
            { id: "my-rsvps", label: "My RSVPs", path: "/game/meet/my-rsvps" },
            { id: "create", label: "Create Event", path: "/game/meet/create" },
        ],
    },
    // COLLABORATE Space (was Teams)
    collaborate: {
        title: "COLLABORATE",
        sections: [
            { id: "genius-match", label: "Genius Match", path: "/game/collaborate" },
            { id: "connections", label: "Connections", path: "/game/collaborate/connections" },
            { id: "people", label: "People Directory", path: "/game/collaborate/people" },
            { id: "mission", label: "Mission Groups", path: "/game/collaborate/mission" },
        ],
    },
    // BUILD Space (was Coop/Incubator)
    build: {
        title: "BUILD",
        sections: [
            { id: "canvas", label: "Unique Business Canvas", path: "/game/build/canvas" },
            { id: "ubb-v2", label: "Unique Business Builder", path: "/ubb", badge: "v2" },
            { id: "product-builder", label: "Product Builder", path: "/game/build/product-builder" },
            { id: "my-business", label: "My Genius Business", path: "/game/build/my-business" },
            { id: "refine", label: "Refine My Business", path: "/game/build/refine" },
        ],
    },
    // OFFER Space (was Marketplace)
    buysell: {
        title: "OFFER",
        sections: [
            { id: "overview", label: "Overview", path: "/game/marketplace" },
            { id: "my-products", label: "My Products", path: "/game/marketplace/my-products" },
            { id: "ignite", label: "Productize Yourself Session", path: "/game/marketplace/ignite" },
            { id: "public-page", label: "My Public Page", path: "/marketplace/create-page" },
        ],
    },
};

interface SectionsPanelProps {
    activeSpaceId: string;
    onSectionSelect?: (path: string) => void;
    onClose?: () => void;
    className?: string;
    /**
     * When the parent page renders its own full-screen background (e.g.
     * /ai-os HLS scene), Pane 2's default 0.18 alpha gets washed out into
     * invisibility against busy dark imagery. This flag bumps the panel to
     * a more substantive glass tint so the section list stays visible.
     * Day 51 r3 (Sasha 2026-04-25 night): without this, Sasha saw both
     * panels disappear on /ai-os.
     */
    pageOwnsBackground?: boolean;
}

/**
 * Build the JOURNEY pane sections.
 *
 * Rule (Sasha, Day 48 final): exactly three items during onboarding —
 * same list for guests and authenticated users.
 *   1. Start Here     → /         (the landing page)
 *   2. The Playbook   → /playbook (the full 7-step methodology)
 *   3. The Path       → /path     (the value ladder)
 *
 * "My Artifacts" retired from the sidebar — not part of the onboarding
 * trio. Still reachable via its URL for users who want it.
 * Deeper progressive "Step N: ..." list also stays retired.
 */
/**
 * Build the BUILD pane sections when the user is inside the Unique
 * Business Builder (/ubb*).
 *
 * Sasha, Day 52 (2026-04-26): UBB lives in BUILD space. Pane 2 holds
 * the SIX phase groups (not the 18 individual artifacts — those live
 * in pane 3 alongside their wizards). The groups follow the canonical
 * playbook arc:
 *
 *   1. Canvas              — Phase A · 7 artifacts (uniqueness, myth,
 *                            tribe, pain, promise, lead-magnet,
 *                            value-ladder). Routes to /ubb (the
 *                            CanvasOverviewScreen which lists all 7
 *                            with their wizards).
 *   2. 1st Session Design  — Phase B · 1 compound. Routes to /ubb/session.
 *   3. Marketing           — Phase C · 3 pillars (core belief, packaging,
 *                            frictionless purchase). Routes to /ubb/marketing.
 *   4. Distribution        — Phase C · 3 pillars (reach, delivery, spread).
 *                            Routes to /ubb/distribution.
 *   5. Communications      — Phase C · 3 pillars (surface inventory,
 *                            tuning fork, golden DM). Routes to
 *                            /ubb/communications.
 *   6. Landing Page        — Phase D · 1 artifact. Routes to /ubb/landing-page.
 *
 * The Dossier is reachable from inside /ubb (as a publication exit),
 * not from pane 2 — it's an output, not a navigation peer.
 */
/**
 * Day 53 night iter 3 (Sasha 2026-04-27): UBB phase rows now carry
 * live progress (e.g. "6/7" for Canvas) when the founder is inside
 * /ubb*. Progress is fed by `useCanvasProgressLite` — a targeted
 * Supabase fetch that only runs on /ubb routes. Outside /ubb the
 * `progress` field is undefined and rows render plain.
 *
 * Per-phase total is taken from the live data, not hardcoded — keeps
 * the row labels honest if `ALL_ARTIFACT_KEYS` ever shifts.
 */
const buildUbbSections = (
    progress: ReturnType<typeof useCanvasProgressLite>,
): Section[] => {
    const get = (phaseKey: string): { locked: number; total: number } | undefined => {
        if (!progress || progress.isLoading) return undefined;
        const p = progress.perPhase[phaseKey];
        // Don't render the bar if total is zero (would imply taxonomy drift)
        if (!p || p.total === 0) return undefined;
        return { locked: p.locked, total: p.total };
    };
    return [
        { id: "ubb-canvas",         label: "1. Canvas",            path: "/ubb",                progress: get("canvas") },
        { id: "ubb-session",        label: "2. 1st Session",       path: "/ubb/session",        progress: get("session") },
        { id: "ubb-marketing",      label: "3. Marketing",         path: "/ubb/marketing",      progress: get("marketing") },
        { id: "ubb-distribution",   label: "4. Distribution",      path: "/ubb/distribution",   progress: get("distribution") },
        { id: "ubb-communications", label: "5. Communications",    path: "/ubb/communications", progress: get("communications") },
        { id: "ubb-landing",        label: "6. Landing Page",      path: "/ubb/landing-page",   progress: get("publication") },
    ];
};

/**
 * Day 56 (Sasha 2026-04-28): LEARN pane 2 sections.
 *
 * The 6 Growth Sequence steps render as numbered pane 2 rows — same gold
 * pip + Cormorant label register as JOURNEY. Locked steps carry their
 * `lockedHint` from the shared growthSteps module, which surfaces in the
 * locked-row tooltip (already implemented downstream in this file).
 *
 * Public route: `/library/:stepId`
 * Authed route: `/game/learn/library/:stepId`
 *
 * The pathBase is selected by the caller based on whether the user is
 * inside an authed `/game/*` route — keeps a single visual structure for
 * both surfaces while routing them to their respective scopes.
 *
 * Below the 6 steps, the 5 Growth Paths (Body / Emotions / Mind / Talent /
 * Spirit) hang as future-grouping placeholders, unchanged from before.
 */
const buildLearnSections = (pathBase: "/library" | "/game/learn/library"): Section[] => {
    const stepRows: Section[] = GROWTH_STEPS.map((step) => ({
        id: `learn-step-${step.id}`,
        label: `${step.number}. ${step.shortLabel}`,
        path: `${pathBase}/${step.id}`,
        locked: step.locked,
        lockedHint: step.lockedHint,
    }));

    const pathRows: Section[] = [
        {
            id: "body",
            label: "Body",
            path: "/game/learn/path/body",
            subSections: [{ id: "body-overview", label: "Coming soon", path: "/game/learn/path/body" }],
        },
        {
            id: "emotions",
            label: "Emotions",
            path: "/game/learn/path/emotions",
            subSections: [{ id: "emotions-overview", label: "Coming soon", path: "/game/learn/path/emotions" }],
        },
        {
            id: "mind",
            label: "Mind",
            path: "/game/learn/path/mind",
            subSections: [{ id: "mind-overview", label: "Coming soon", path: "/game/learn/path/mind" }],
        },
        {
            id: "talent",
            label: "Talent",
            path: "/game/learn/path/genius",
            subSections: [{ id: "talent-overview", label: "Coming soon", path: "/game/learn/path/genius" }],
        },
        {
            id: "spirit",
            label: "Spirit",
            path: "/game/learn/path/spirit",
            subSections: [{ id: "spirit-overview", label: "Coming soon", path: "/game/learn/path/spirit" }],
        },
    ];

    return [...stepRows, ...pathRows];
};

const buildJourneySections = (_currentPath: string): Section[] => {
    // Day 50 late (Sasha): five permanent rail items, no hide gating.
    // The rail is the same on every Journey-family page — including
    // the landing — so nothing appears/disappears as the user navigates.
    // Order: Start · Playbook · Path · AI OS · Dashboard.
    // Day 50 later (Sasha): two locked teasers added at the tail —
    // Mission Discovery (#6, unlocks after first session booking) and
    // Asset Mapper (#7, sequenced after Mission Discovery). Locked rows
    // render dimmed with a Radix tooltip showing the unlock hint.
    // Day 52 (Sasha 2026-04-26): item #6 inserted — "Build a business off
    // your top talent" — the bridge from JOURNEY into BUILD. Routes to
    // /ubb. All three trailing items (#6, #7, #8) are LOCKED and rendered
    // with graduated opacity to create a "fog of war" effect: the rail
    // visually conveys that there is more methodology ahead, with the
    // further items receding into fainter visibility. Hints sequence the
    // unlocks along the Integrated Stack (Domain 83) arc:
    //   6 → after Top Talent reaches 9+ specificity
    //   7 → after Build a business
    //   8 → after Mission Discovery
    //
    // Eventual behavior (when UBB is production-ready): #6 becomes a
    // SOFT lock — visible and active for anyone authed with a Top Talent
    // saved (it's the natural next step in the linear walk). Hard-locked
    // here for now because the Builder is not yet shipped to public users.
    // To switch over: gate the `locked` field on the user's Top Talent
    // state instead of hardcoding `true`.
    // Day 54 (Sasha 2026-04-28): AI OS removed from this list — elevated
    // to its own Space (see SPACES array in SpacesRail.tsx and the
    // SPACE_SECTIONS["ai-os"] config above). Items 5-8 renumbered to 4-7.
    // Day 55 (Sasha 2026-04-29): Journey pane 2 labels re-cast as
    // action+outcome promises (was: short noun-tags). Pattern matches
    // existing item 5 ("Build a business off your top talent"). Each
    // row now teaches the user what they'll *get* by clicking, not just
    // where they'll land. Order preserved — Dashboard sits at #4 as the
    // last unlocked item before the locked progression (5–7), keeping
    // the fog-of-war fade intact.
    return [
        { id: "journey-start-here",        label: "1. Start by finding your top talent", path: "/" },
        { id: "journey-the-playbook",      label: "2. Take the whole playbook",          path: "/playbook" },
        { id: "journey-the-path",          label: "3. See the path to your business",    path: "/path" },
        { id: "journey-dashboard",         label: "4. See how we're building this",      path: "/dashboard" },
        {
            id: "journey-build-business",
            label: "5. Build a business off your top talent",
            path: "/ubb",
            locked: true,
            lockedHint: "Unlocks after your Top Talent reaches 9+ specificity.",
        },
        {
            id: "journey-mission-discovery",
            label: "6. Discover your mission",
            path: "/mission-discovery",
            locked: true,
            lockedHint: "Unlocks after you build a business off your top talent.",
        },
        {
            id: "journey-asset-mapper",
            label: "7. Map your essence",
            path: "/asset-mapping",
            locked: true,
            lockedHint: "Unlocks after you discover your mission.",
        },
    ];
};

const SectionsPanel = ({
    activeSpaceId,
    onSectionSelect,
    onClose,
    className,
    pageOwnsBackground = false,
}: SectionsPanelProps) => {
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Day 53 night iter 3 (Sasha 2026-04-27): pane 2 phase progress.
    // Hook returns null when not on /ubb*; only fires its Supabase fetch
    // there. Drives the right-aligned "6/7" + thin gold progress bar on
    // each UBB phase row.
    const ubbProgress = useCanvasProgressLite();

    // Check user email for feature gating
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email || null);
        });
    }, []);

    // Build sections with conditional items based on user
    const getSections = () => {
        const baseData = SPACE_SECTIONS[activeSpaceId];
        if (!baseData) return null;

        // JOURNEY → fixed trio (Start Here · The Playbook · The Path).
        // Day 48 (Sasha): same list for guests and authed users. No
        // My Artifacts, no progression-aware reveal, no extras.
        if (activeSpaceId === "journey") {
            return {
                ...baseData,
                sections: buildJourneySections(location.pathname),
            };
        }

        // LEARN → 6-step Growth Sequence (Library) + 5 Growth Paths.
        // The pane 2 rows are built dynamically from GROWTH_STEPS so the
        // step list is a single source of truth shared with Library.tsx
        // (which renders each step's content in pane 3). Path base
        // depends on whether the user is inside an authed /game/* route
        // or browsing the public /library surface — same pane structure,
        // different scope. Sasha, Day 56 (2026-04-28).
        if (activeSpaceId === "learn") {
            const insideAuthed =
                location.pathname === "/game/learn" || location.pathname.startsWith("/game/learn/");
            const pathBase = insideAuthed ? "/game/learn/library" : "/library";
            return {
                title: "LEARN",
                sections: buildLearnSections(pathBase),
            };
        }

        // BUILD ∩ /ubb → UBB phase groups (Canvas · Session · Marketing ·
        // Distribution · Communications · Landing Page). When the user
        // is anywhere inside the Unique Business Builder, pane 2 owns
        // the phase-group navigation; pane 3 hosts the artifacts and
        // their wizards. Outside /ubb, BUILD pane 2 falls back to the
        // legacy build items (canvas/product-builder/my-business/refine)
        // which still have live routes under /game/build/*. Sasha,
        // Day 52 (2026-04-26).
        if (
            activeSpaceId === "build" &&
            (location.pathname === "/ubb" || location.pathname.startsWith("/ubb/"))
        ) {
            return {
                title: "BUILD",
                sections: buildUbbSections(ubbProgress),
            };
        }

        // Add Art section only for alexanderkonst@gmail.com in ME space
        if (activeSpaceId === "grow" && userEmail === "alexanderkonst@gmail.com") {
            return {
                ...baseData,
                sections: [
                    ...baseData.sections,
                    {
                        id: "art",
                        label: "🎨 Art",
                        path: "/art",
                        subSections: [
                            { id: "art-gallery", label: "Gallery", path: "/art" },
                            { id: "art-ceremonial", label: "Ceremonial Spaces", path: "/art/ceremonial-space-designs" },
                            { id: "art-illustrations", label: "Illustrations", path: "/art/digital-illustrations-stickers" },
                            { id: "art-starcodes", label: "Star Codes", path: "/art/star-code-jewellery" },
                            { id: "art-webportals", label: "Webportals", path: "/art/webportals" },
                        ],
                    },
                ],
            };
        }

        return baseData;
    };

    const spaceData = getSections();

    const toggleExpand = (sectionId: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

    useEffect(() => {
        // Guard against null spaceData inside effect
        if (!spaceData) return;

        const nextExpanded: Record<string, boolean> = {};

        spaceData.sections.forEach((section) => {
            if (!section.subSections) return;
            const hasActiveChild = section.subSections.some((sub) => isActive(sub.path));
            if (hasActiveChild) {
                nextExpanded[section.id] = true;
            }
        });

        if (Object.keys(nextExpanded).length > 0) {
            setExpandedSections((prev) => ({ ...prev, ...nextExpanded }));
        }
    }, [location.pathname, spaceData]);

    // Early return AFTER all hooks (Rules of Hooks compliance)
    if (!spaceData) return null;

    // Day 48 iter 8 (Sasha): parse numeric prefix from section labels
    // ("1. Start" → { number: "1", text: "Start" }) so the numeral can
    // render as a small gold step-pip on the left, freeing the label
    // text to read as an editorial chapter title. Labels without a
    // leading number pass through unchanged.
    const parseNumberedLabel = (label: string): { number?: string; text: string } => {
        const match = label.match(/^(\d+)\.\s+(.+)$/);
        if (match) return { number: match[1], text: match[2] };
        return { text: label };
    };

    return (
        <div
            className={cn(
                "w-[260px] flex flex-col relative z-30",
                // Day 55 (Sasha 2026-04-29): `liquid-glass` (backdrop-filter
                // blur) suppressed on page-owned-bg routes — its viewport-
                // tall backdrop-filter region was the second cause (after
                // Spotlight) of the "panes vanish on /ai-os scroll" Chrome
                // desktop bug. Solid bg via inline backgroundColor below
                // does the visual job without the GPU compositing trap.
                pageOwnsBackground ? "" : "liquid-glass",
                /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                   DO NOT REVERT — pane 2 background-color rules.
                   This has been silently re-broken three times by deploy
                   commits replacing the responsive Tailwind classes with a
                   single inline rgba(14,32,68,0.18). Each time, Sasha sees
                   pane 2 mobile washed out against the bright bg-image
                   frames ("I see the absence of an overlay on the second
                   pane"). The bg MUST be route- + viewport-responsive —
                   not a single inline value.

                   Why:
                     • Desktop default routes: 0.42 alpha — backdrop-blur
                       gives glassmorphism, the lower opacity preserves
                       bg-stream peek-through.
                     • Mobile default routes: 0.55 alpha — backdrop-blur is
                       disabled on mobile (perf, see .liquid-glass media
                       query in index.css), so opacity carries all the
                       weight. 0.18 disappears in the bg-cycle's bright
                       cream zones; 0.55 holds the section list legibility.
                     • Page-owned-bg routes (/ai-os): 0.78 across both
                       viewports — the page mounts its own z-[1] full-
                       screen overlays + starfield, eating the silk veil.
                       Pane 2 needs a heavier anchor regardless of size.

                   If you change these, test BOTH /ai-os AND the landing
                   on BOTH mobile (390px) AND desktop (1440px). Otherwise
                   you'll re-break the issue Sasha keeps catching. Keep
                   the Tailwind responsive classes — inline single value
                   is what gets reverted.
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
                pageOwnsBackground
                    ? "bg-[rgba(6,12,28,0.94)]"
                    : "bg-[rgba(14,32,68,0.55)] lg:bg-[rgba(14,32,68,0.42)]",
                className
            )}
            style={{
                border: "none",
                boxShadow:
                    "2px 0 22px -10px rgba(244, 212, 114, 0.22)",
            }}
        >
            {/* Gold spine — mirrors the pane 1 treatment. Strongest in
                the upper-middle, fades at top and bottom. */}
            <span
                aria-hidden="true"
                className="absolute top-0 right-0 h-full w-px pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, rgba(212, 175, 55, 0) 0%, rgba(212, 175, 55, 0.18) 16%, rgba(244, 212, 114, 0.52) 40%, rgba(212, 175, 55, 0.32) 64%, rgba(212, 175, 55, 0.10) 88%, rgba(212, 175, 55, 0) 100%)",
                }}
            />

            {/* Day 52 (Sasha 2026-04-27): bottom fade gradient retired.
                It read as the pane "disappearing" — the gradient was being
                multiplied by locked items' fogOpacity, so chips 6/7/8 (which
                land in the bottom 96px) washed into the navy and looked
                literally cut off. Locked items keep their developmental
                gating; we just stop double-erasing them with the overlay. */}

            {/* Header — Day 48 iter 8 (Sasha):
                The lone X in the top-right was visually orphaned. The
                header now self-identifies the pane: title on the left
                (space name in tracked small-caps gold), close X on the
                right. Readers always know what they're inside.

                Day 48 iter 15 (Sasha): header height bumped h-10 → h-16
                so pane 2's first nav item lines up with pane 1's first
                chip (which sits under the taller brand-wordmark area).
                Both first-items now share the same Y — the panes read
                as a single coherent grid row. */}
            <div className="h-16 px-4 flex items-center justify-between">
                <span
                    className="text-[11px] font-semibold"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "#f4d472",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        textShadow: "0 0 12px rgba(244, 212, 114, 0.35)",
                    }}
                >
                    {spaceData.title}
                </span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        title="Hide sidebar (⌘B)"
                        aria-label="Hide sidebar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <ScrollArea className="flex-1">
            {/* Day 50 (Sasha): TooltipProvider wraps the pane so locked
                section rows can render the same dark-glass + gold-hairline
                tooltip as the locked space chips on pane 1. */}
            <TooltipProvider delayDuration={150} skipDelayDuration={0}>
            <nav className="py-2 pt-1">
                {/* Day 52 (Sasha 2026-04-26): Fog-of-war effect.
                    Locked items in pane 2 are dimmed progressively: the
                    first locked item is clearly readable (still soft), and
                    each subsequent locked item recedes further into the
                    background. Visually conveys "there is more methodology
                    ahead, and the further you look the less is yet
                    visible." The opacity multiplier is computed inline per
                    row from each locked item's 0-indexed position among
                    locked items. */}
                {spaceData.sections.map((section) => {
                    const hasSubSections = section.subSections && section.subSections.length > 0;
                    const isExpanded = expandedSections[section.id] ?? false;
                    // Day 52 (Sasha 2026-04-26): when sibling sections share a
                    // common path prefix (e.g. UBB pane 2: /ubb, /ubb/session,
                    // /ubb/marketing, …), plain isActive() false-positives the
                    // shorter parent for any deeper child path. Resolve by
                    // longest-match: a section is active only if no sibling
                    // with a longer matching path also matches the current
                    // pathname. JOURNEY/ME panes are unaffected (their sibling
                    // paths don't share prefixes).
                    const sectionActive = (() => {
                        if (!isActive(section.path)) return false;
                        const moreSpecific = spaceData.sections.some(
                            (s) =>
                                s.id !== section.id &&
                                s.path.length > section.path.length &&
                                isActive(s.path),
                        );
                        return !moreSpecific;
                    })();
                    const isLocked = section.locked === true;
                    const { number, text: sectionText } = parseNumberedLabel(section.label);

                    // Fog-of-war opacity for locked items. 1st locked stays
                    // clearly readable (0.85), each next one fainter. Anything
                    // beyond the third caps at 0.30 so it doesn't disappear.
                    const lockedFogIndex = isLocked
                        ? spaceData.sections.filter(
                              (s, i) => s.locked && i < spaceData.sections.indexOf(section),
                          ).length
                        : -1;
                    const FOG_OPACITY: number[] = [0.85, 0.60, 0.40, 0.30];
                    const fogOpacity = isLocked
                        ? (FOG_OPACITY[lockedFogIndex] ?? 0.30)
                        : 1;

                    const handleSectionClick = () => {
                        if (isLocked) return;
                        if (hasSubSections) {
                            toggleExpand(section.id);
                        } else if (onSectionSelect) {
                            onSectionSelect(section.path);
                        }
                    };

                    // Day 50 later (Sasha): pane 2 rows now mirror the
                    // SPACES chips on pane 1 — rounded-2xl pill, bg-white/5
                    // baseline so each row reads as its own discrete
                    // object, hover gets a gold ring + soft halo + 1px
                    // lift, active gets a gold ring + larger halo + the
                    // absolute gold left-pill marker (matching pane 1's
                    // active treatment exactly). Locked rows: chip still
                    // visible but text dim + no hover lift.
                    const rowContent = (
                        <div
                            className={cn(
                                "group flex items-center gap-2.5 px-3 py-3 mx-2 rounded-2xl transition-all duration-300 relative",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
                                // Day 51 (Sasha 2026-04-25): legibility pass.
                                // Now that pane 2 is fully opaque dark navy on
                                // every route, the previous translucency budget
                                // we left for the wash is gone — text needs to
                                // sit cleanly on solid navy. Inactive bumped
                                // /80 → /95, locked /35 → /60. Inactive chip
                                // also gets a faint bg-white/5 baseline so
                                // each row reads as a discrete object even
                                // before hover.
                                isLocked
                                    ? "cursor-not-allowed bg-white/[0.04] text-white/60"
                                    : sectionActive && !hasSubSections
                                        ? "cursor-pointer text-white ring-1 ring-[#d4af37]/60 shadow-[0_0_22px_-6px_rgba(244,212,114,0.55),0_0_48px_-14px_rgba(212,175,55,0.35)]"
                                        : "cursor-pointer bg-white/[0.05] text-white/95 hover:bg-white/[0.10] hover:text-white hover:ring-1 hover:ring-[#d4af37]/30 hover:shadow-[0_0_16px_-4px_rgba(244,212,114,0.28)] hover:translate-y-[-1px] active:translate-y-0"
                            )}
                            style={
                                sectionActive && !hasSubSections && !isLocked
                                    ? { backgroundColor: "rgba(212, 175, 55, 0.08)" }
                                    : isLocked
                                        ? { opacity: fogOpacity }
                                        : undefined
                            }
                            onClick={handleSectionClick}
                            aria-disabled={isLocked || undefined}
                        >
                            {sectionActive && !hasSubSections && !isLocked && (
                                <div className="absolute left-0 top-1/2 w-1 h-8 rounded-r-full -translate-x-1/2 -translate-y-1/2 bg-[#d4af37] shadow-[0_0_8px_rgba(244,212,114,0.7)]" />
                            )}
                            <span className="w-[22px] h-[22px] flex items-center justify-center">
                                {hasSubSections ? (
                                    isExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    )
                                ) : number ? (
                                    <span
                                        className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-[11px] font-semibold transition-all duration-200"
                                        style={{
                                            background: isLocked
                                                ? "rgba(212, 175, 55, 0.14)"
                                                : sectionActive && !hasSubSections
                                                    ? "linear-gradient(135deg, rgba(244, 212, 114, 0.55) 0%, rgba(212, 175, 55, 0.32) 100%)"
                                                    : "linear-gradient(135deg, rgba(244, 212, 114, 0.34) 0%, rgba(212, 175, 55, 0.20) 100%)",
                                            color: isLocked ? "rgba(244, 212, 114, 0.70)" : "#f4d472",
                                            border: isLocked
                                                ? "0.5px solid rgba(212, 175, 55, 0.40)"
                                                : sectionActive && !hasSubSections
                                                    ? "0.5px solid rgba(212, 175, 55, 0.95)"
                                                    : "0.5px solid rgba(212, 175, 55, 0.70)",
                                            // Day 51 night (Sasha 2026-04-25): pip digits switched
                                            // from Cormorant Garamond to DM Sans (same family used
                                            // for the Venture Growth Dashboard KPI numbers).
                                            // Cormorant's "1" reads as "I" at small sizes and the
                                            // figures don't sit at uniform height — fine in prose,
                                            // bad in a number badge. DM Sans tabular-nums gives
                                            // crisp uniform-width digits that work at 11px.
                                            fontFamily: "'DM Sans', system-ui, sans-serif",
                                            fontVariantNumeric: "tabular-nums lining-nums",
                                            fontFeatureSettings: '"tnum" 1, "lnum" 1',
                                            boxShadow: isLocked
                                                ? undefined
                                                : sectionActive && !hasSubSections
                                                    ? "0 0 14px -2px rgba(244, 212, 114, 0.55), inset 0 0 8px -2px rgba(244, 212, 114, 0.35)"
                                                    : "0 0 8px -2px rgba(244, 212, 114, 0.32), inset 0 0 6px -2px rgba(244, 212, 114, 0.22)",
                                            textShadow: isLocked
                                                ? undefined
                                                : "0 0 6px rgba(244, 212, 114, 0.35)",
                                        }}
                                    >
                                        {number}
                                    </span>
                                ) : null}
                            </span>
                            {section.icon}
                            <span
                                className="flex-1 text-[18px] leading-snug"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: sectionActive && !isLocked ? 700 : 600,
                                    letterSpacing: "0.012em",
                                }}
                            >
                                {sectionText}
                            </span>
                            {section.badge && (
                                <span
                                    className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                                    style={{
                                        backgroundColor: "rgba(132, 96, 234, 0.18)",
                                        color: "#c8b7ff",
                                        border: "0.5px solid rgba(132, 96, 234, 0.42)",
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                >
                                    {section.badge}
                                </span>
                            )}
                            {/* Day 53 night iter 3 (Sasha 2026-04-27): UBB
                                phase progress chip — right-aligned "6/7"
                                in DM Sans tabular nums. Only renders for
                                rows that pass `progress` (UBB phase rows
                                inside /ubb*). Color shifts with state:
                                  · gold when fully complete (locked = total)
                                  · soft cream-gold when partial
                                  · faint when none locked yet (just numerals) */}
                            {section.progress && !isLocked && (
                                <span
                                    className="ml-1 inline-flex items-center"
                                    style={{
                                        fontFamily: "'DM Sans', system-ui, sans-serif",
                                        fontVariantNumeric: "tabular-nums lining-nums",
                                        fontFeatureSettings: '"tnum" 1, "lnum" 1',
                                        fontSize: "10.5px",
                                        fontWeight: 500,
                                        letterSpacing: "0.04em",
                                        color: section.progress.locked === section.progress.total
                                            ? "#f4d472"
                                            : section.progress.locked > 0
                                                ? "rgba(244, 212, 114, 0.85)"
                                                : "rgba(255, 255, 255, 0.40)",
                                        textShadow: section.progress.locked === section.progress.total
                                            ? "0 0 6px rgba(244, 212, 114, 0.55)"
                                            : "none",
                                    }}
                                    title={`${section.progress.locked} of ${section.progress.total} locked`}
                                >
                                    {section.progress.locked}/{section.progress.total}
                                </span>
                            )}
                        </div>
                    );

                    const rowWithTooltip = isLocked ? (
                        <Tooltip>
                            <TooltipTrigger asChild>{rowContent}</TooltipTrigger>
                            <TooltipContent
                                side="right"
                                align="center"
                                sideOffset={12}
                                className="max-w-[260px] rounded-xl border-none p-0 shadow-none bg-transparent animate-in fade-in-0 zoom-in-95"
                            >
                                <div
                                    className="liquid-glass-dark rounded-xl px-4 py-3"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.88) 50%, rgba(10,22,40,0.92) 100%)",
                                        border: "1px solid rgba(212, 175, 55, 0.35)",
                                        boxShadow:
                                            "0 0 0 1px rgba(212, 175, 55, 0.15), 0 8px 28px -8px rgba(10, 22, 40, 0.6), 0 0 24px -6px rgba(244, 212, 114, 0.25)",
                                    }}
                                >
                                    <p
                                        className="text-[11px] mb-1"
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontWeight: 600,
                                            letterSpacing: "0.22em",
                                            textTransform: "uppercase",
                                            color: "#f4d472",
                                            textShadow: "0 0 10px rgba(244, 212, 114, 0.4)",
                                        }}
                                    >
                                        {sectionText} · Locked
                                    </p>
                                    <p
                                        className="text-[13px] italic leading-snug"
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontWeight: 400,
                                            color: "rgba(245, 241, 232, 0.92)",
                                        }}
                                    >
                                        {section.lockedHint || "Locked"}
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ) : rowContent;

                    return (
                        <div key={section.id}>
                            {rowWithTooltip}

                            {/* Day 53 night iter 3 (Sasha 2026-04-27): thin
                                gold progress bar beneath UBB phase rows.
                                Renders just the filled portion (no track) so
                                the bar reads as "this much earned" rather
                                than "this much remaining." Position: just
                                below the row, indented to align with the
                                label text. Hidden on locked rows + rows
                                with no progress data. */}
                            {section.progress && !isLocked && section.progress.total > 0 && (
                                <div className="mx-2 -mt-0.5 mb-0.5 px-3">
                                    <div
                                        className="h-px relative"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.06)",
                                        }}
                                    >
                                        <div
                                            className="absolute left-0 top-0 h-full transition-[width] duration-500"
                                            style={{
                                                width: `${(section.progress.locked / section.progress.total) * 100}%`,
                                                background: section.progress.locked === section.progress.total
                                                    ? "linear-gradient(90deg, rgba(244, 212, 114, 0.45) 0%, rgba(244, 212, 114, 0.85) 100%)"
                                                    : "linear-gradient(90deg, rgba(244, 212, 114, 0.30) 0%, rgba(244, 212, 114, 0.55) 100%)",
                                                boxShadow: section.progress.locked === section.progress.total
                                                    ? "0 0 6px rgba(244, 212, 114, 0.50)"
                                                    : "0 0 4px rgba(244, 212, 114, 0.25)",
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Sub-sections — Day 52 (Sasha 2026-04-26):
                                editorial register matched to JOURNEY pane 2.
                                Sub-sections now render as numbered chapter
                                rows: gold step-pip + 18px Cormorant + chip
                                hover lift + active gold ring + halo. The
                                gold hairline rail is retired — the pip
                                column carries the visual sequence on its
                                own. The container indent is tightened
                                (ml-8 → ml-3) so sub-sections read as
                                first-class items in the same scan column
                                as the parent, not as a typographic
                                indentation layer below it. */}
                            {hasSubSections && isExpanded && !isLocked && (
                                <div className="ml-3 mt-1 mb-2">
                                    {section.subSections!.map((sub, subIdx) => {
                                        const subActive = isActive(sub.path);
                                        const subNumber = subIdx + 1;
                                        return (
                                            <div
                                                key={sub.id}
                                                className={cn(
                                                    "group flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-2xl transition-all duration-300 relative cursor-pointer",
                                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
                                                    subActive
                                                        ? "text-white ring-1 ring-[#d4af37]/60 shadow-[0_0_22px_-6px_rgba(244,212,114,0.55),0_0_48px_-14px_rgba(212,175,55,0.35)]"
                                                        : "bg-white/[0.05] text-white/95 hover:bg-white/[0.10] hover:text-white hover:ring-1 hover:ring-[#d4af37]/30 hover:shadow-[0_0_16px_-4px_rgba(244,212,114,0.28)] hover:translate-y-[-1px] active:translate-y-0"
                                                )}
                                                style={
                                                    subActive
                                                        ? { backgroundColor: "rgba(212, 175, 55, 0.08)" }
                                                        : undefined
                                                }
                                                onClick={() => onSectionSelect?.(sub.path)}
                                            >
                                                {subActive && (
                                                    <div className="absolute left-0 top-1/2 w-1 h-8 rounded-r-full -translate-x-1/2 -translate-y-1/2 bg-[#d4af37] shadow-[0_0_8px_rgba(244,212,114,0.7)]" />
                                                )}
                                                <span className="w-[22px] h-[22px] flex items-center justify-center">
                                                    <span
                                                        className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-[11px] font-semibold transition-all duration-200"
                                                        style={{
                                                            background: subActive
                                                                ? "linear-gradient(135deg, rgba(244, 212, 114, 0.55) 0%, rgba(212, 175, 55, 0.32) 100%)"
                                                                : "linear-gradient(135deg, rgba(244, 212, 114, 0.34) 0%, rgba(212, 175, 55, 0.20) 100%)",
                                                            color: "#f4d472",
                                                            border: subActive
                                                                ? "0.5px solid rgba(212, 175, 55, 0.95)"
                                                                : "0.5px solid rgba(212, 175, 55, 0.70)",
                                                            fontFamily: "'DM Sans', system-ui, sans-serif",
                                                            fontVariantNumeric: "tabular-nums lining-nums",
                                                            fontFeatureSettings: '"tnum" 1, "lnum" 1',
                                                            boxShadow: subActive
                                                                ? "0 0 14px -2px rgba(244, 212, 114, 0.55), inset 0 0 8px -2px rgba(244, 212, 114, 0.35)"
                                                                : "0 0 8px -2px rgba(244, 212, 114, 0.32), inset 0 0 6px -2px rgba(244, 212, 114, 0.22)",
                                                            textShadow: "0 0 6px rgba(244, 212, 114, 0.35)",
                                                        }}
                                                    >
                                                        {subNumber}
                                                    </span>
                                                </span>
                                                <span
                                                    className="flex-1 text-[18px] leading-snug"
                                                    style={{
                                                        fontFamily: "'Cormorant Garamond', serif",
                                                        fontWeight: subActive ? 700 : 600,
                                                        letterSpacing: "0.012em",
                                                    }}
                                                >
                                                    {sub.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
            </TooltipProvider>
            </ScrollArea>
        </div>
    );
};

const areEqual = (prev: SectionsPanelProps, next: SectionsPanelProps) => (
    prev.activeSpaceId === next.activeSpaceId &&
    prev.onSectionSelect === next.onSectionSelect &&
    prev.onClose === next.onClose &&
    prev.className === next.className
);

export default memo(SectionsPanel, areEqual);
export { SPACE_SECTIONS };
