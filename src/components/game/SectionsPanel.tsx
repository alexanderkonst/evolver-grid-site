import { ReactNode, memo, useEffect, useRef, useState } from "react";
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
import { useDeepProfileActivated } from "@/hooks/useDeepProfileActivated";
import { useJourneyProgress, type JourneyProgress } from "@/hooks/useJourneyProgress";
import { useEntryPath } from "@/contexts/EntryPathContext";
import {
    TooltipProvider,
} from "@/components/ui/tooltip";
// Day 55 (Sasha 2026-04-29): locked-row hints migrated from Tooltip
// to Popover. Reasons:
//   1. Popover has Portal built into shadcn's primitive — escapes
//      pane 2's `overflow-hidden` wrapper without manual portal wrap.
//   2. Popover supports controlled `open` state cleanly, so we can
//      drive it from BOTH hover (desktop) and click (mobile) handlers
//      via a single shared state.
//   3. Tooltip's hover-only model fails on touch (Radix tooltip fires
//      pointer-enter on tap-down but pointer-leave on tap-up, so the
//      popup flashes briefly — unusable on phone).
// Tooltip primitives kept imported for any non-locked-row uses
// elsewhere (none currently in this file, but the imports are
// referenced in the shared TooltipProvider wrapper at the panel root).
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
     * Day 80 Wave 2.2 (Sasha 2026-05-22): visual variant.
     *   - undefined / "default" — numbered step in the JOURNEY path.
     *   - "sidequest"            — optional paid offering. Renders
     *     without a number pip (uses a ✦ glyph), smaller height,
     *     gold-tinted background, italic subtitle, right-aligned
     *     price chip. Doesn't break the numbered 1→2→3→4→5 flow;
     *     reads as "this exists alongside the path."
     * Currently set only for the journey-activation row.
     */
    variant?: "sidequest";
    /** Italic subtitle, sidequest variant only. */
    subtitle?: string;
    /** Right-aligned gold price chip, sidequest variant only. */
    priceChip?: string;
    /**
     * Day 65 (Sasha 2026-05-15): when true, the row renders with
     * a gentle-but-very-visible strikethrough — the user has
     * accomplished this step. Currently set only for JOURNEY items
     * whose game_profiles signal exists (top-talent reveal, asset
     * mapping, QoL assessment, mission discovery). Other panes
     * (BUILD, ME, AI OS, etc.) don't use this field — its absence
     * is harmless.
     */
    completed?: boolean;
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
                label: "AI Skills",
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
                // Day 65 (Sasha 2026-05-14): subSections RESTORED on pane 2.
                // Mobile users had no way to discover the 11 deep subpages —
                // the only entry point was in-page navigation that's hidden
                // until you scroll. Restoring the disclosure dropdown so the
                // ME · Top Talent surface is the same on desktop and mobile.
                // Order mirrors ZOG_SUBPAGE_ORDER in
                // src/components/profile/ReadNextSectionButton.tsx — keep
                // these two lists in sync.
                subSections: [
                    { id: "tt-start-here", label: "Start Here", path: "/game/me/zone-of-genius/start-here" },
                    { id: "tt-overview", label: "Overview", path: "/game/me/zone-of-genius" },
                    { id: "tt-how-it-shows-up", label: "How It Shows Up", path: "/game/me/zone-of-genius/how-it-shows-up" },
                    { id: "tt-three-key-talents", label: "Three Talents in Depth", path: "/game/me/zone-of-genius/three-key-talents" },
                    { id: "tt-top-shadow", label: "Top Shadow", path: "/game/me/zone-of-genius/top-shadow" },
                    { id: "tt-mastery", label: "Path of Mastery", path: "/game/me/zone-of-genius/mastery" },
                    { id: "tt-one-action", label: "One Action", path: "/game/me/zone-of-genius/one-action" },
                    { id: "tt-roles", label: "Ideal Environments", path: "/game/me/zone-of-genius/roles" },
                    { id: "tt-partner", label: "Complementary Partner", path: "/game/me/zone-of-genius/partner" },
                    { id: "tt-monetization", label: "Monetization", path: "/game/me/zone-of-genius/monetization" },
                    // Day 68 (Sasha 2026-05-15): Unifying Role added between
                    // Monetization and What's Next. Mirrors ZOG_SUBPAGE_ORDER
                    // in src/components/profile/ReadNextSectionButton.tsx.
                    { id: "tt-unifying-role", label: "Your Unifying Role", path: "/game/me/zone-of-genius/unifying-role" },
                    { id: "tt-whats-next", label: "What's Next?", path: "/game/me/zone-of-genius/whats-next" },
                ],
            },
            // Day 77 (Sasha 2026-05-20): "Mission" added as the SECOND
            // top-level ME-space section, sitting between Top Talent and
            // Quality of Life — mirrors JOURNEY's T-M-A-Q order so
            // identity (Top Talent) → direction (Mission) → resources
            // (Assets) → state (QoL) flows consistently across both
            // panes. The route /game/me/mission renders
            // ProfileMissionSection, which reads mission_statement from
            // game_profiles (the canonical source the Day 66 wave-M
            // Mission Discovery flow writes to).
            {
                id: "me-mission",
                label: "Mission",
                path: "/game/me/mission",
            },
            // Day 64 (Sasha 2026-05-07): "My Quality of Life" added as a
            // SECOND top-level ME-space section. Single landing surface
            // (no subsections) — clicking the row routes to the Results
            // page, which renders the latest qol_snapshot. User downloads
            // PDFs over time as their personal historical record (no
            // in-app history view yet — keep simple). See
            // docs/specs/quality-of-life-map/results_revamp_spec.md.
            {
                id: "qol-results",
                label: "Quality of Life",
                path: "/game/me/quality-of-life",
            },
            // Day 63 (Sasha 2026-05-07): "My Assets" added as a THIRD
            // top-level ME-space section, mirroring QoL's pattern —
            // single landing surface, no subsections. Routes to the
            // existing /game/me/assets page (ProfileAssetsSection.tsx,
            // also reskinned today to Aurora register). Companion to
            // the JOURNEY pane row #7 "Map your assets": the JOURNEY row
            // is the ACTION surface (entry into the mapping flow); this
            // ME row is the STORAGE surface (the saved-assets library).
            {
                id: "me-assets",
                label: "Assets",
                path: "/game/me/assets",
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
    // Day 63 evening (Sasha 2026-05-07): Connections / People Directory /
    // Mission Groups locked. The reasoning: Genius Match is the working
    // surface today; the other three are aspirational containers that
    // need their own maturation before they earn user attention. Locked
    // rows render dimmed with the fog-of-war pattern + tooltip hint.
    // Genius Match is unlocked at the SPACE level by hasAssets gating
    // (see GameShellV2.tsx unlockStatus). Within an unlocked space, only
    // Genius Match is currently usable.
    collaborate: {
        title: "COLLABORATE",
        sections: [
            { id: "genius-match", label: "Find Collaborators", path: "/game/collaborate" },
            {
                id: "connections",
                label: "Connections",
                path: "/game/collaborate/connections",
                locked: true,
                lockedHint: "Coming soon — connection-tracking surface in progress.",
            },
            {
                id: "people",
                label: "People Directory",
                path: "/game/collaborate/people",
                locked: true,
                lockedHint: "Coming soon — directory needs profile permissions before it ships.",
            },
            {
                id: "mission",
                label: "Mission Groups",
                path: "/game/collaborate/mission",
                locked: true,
                lockedHint: "Coming soon — group-formation flow not yet ready.",
            },
        ],
    },
    // BUILD Space (was Coop/Incubator)
    // Day 64 (Sasha 2026-05-07): UBB moved to position 1 — it is the
    // canonical BUILD experience. The four predecessors (canvas,
    // product-builder, my-business, refine) are flat-locked as
    // retired stubs: their /game/build/* routes still resolve via
    // direct URL (RequireAuth gated) so any deep links don't 404,
    // but the rail signals clearly that they've been replaced. No
    // dynamic gate on these four — the lock is unconditional.
    // (BUILD pane 2 swaps to UBB phase navigation when the user is
    // actually inside /ubb*, see the activeSpaceId === "build" branch
    // in getSections — these five items are what shows when BUILD is
    // active but the user is on a /game/build/* legacy path.)
    build: {
        title: "BUILD",
        sections: [
            // Funnel v2 (Day 77, Sasha 2026-05-20 evening): BUILD pane
            // order per Sasha's call — AVB first (the canonical builder),
            // then the methodology rows (Path / Playbook / Dashboard /
            // Ignite), Equilibrium last (sibling tool, not on the build
            // arc). Path / Playbook / Dashboard / Ignite moved here from
            // JOURNEY when the funnel reshaped into matching-as-hero;
            // their existing routes resolve unchanged.
            // Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.3.
            { id: "ubb-v2",           label: "Automated Venture Builder",         path: "/ubb" },
            { id: "build-path",       label: "The path to your unique business", path: "/path" },
            { id: "build-playbook",   label: "Take the exact playbook",           path: "/playbook" },
            { id: "build-dashboard",  label: "See the dashboard",                 path: "/dashboard" },
            { id: "build-ignite",     label: "Productize Yourself Session",       path: "/ignite" },
            { id: "equilibrium-v2",   label: "Equilibrium",                       path: "/build/equilibrium" },
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
    // Day 65 wave 6 (Sasha 2026-05-15): BUILD pane 2 restructured.
    // The six phase groups are no longer top-level rows — they're now
    // sub-items disclosed under a single parent row "Automated Venture
    // Builder" (matching the dropdown pattern used by ME → Top Talent
    // and AI OS → Prompt Suites). Equilibrium joins as the second
    // top-level row alongside AVB.
    //
    // Day 65 wave 7 (Sasha 2026-05-15): per-phase progress fractions
    // (the "0/8", "0/3" right-aligned counts that used to render on
    // each phase row) are now consolidated onto the AVB parent row
    // as a single overall fraction (e.g., "3/19"). One signal at the
    // level that matters; sub-rows stay clean. Total comes from
    // useCanvasProgressLite's totalLocked + total.
    const totalProgress =
        progress && !progress.isLoading && progress.total > 0
            ? { locked: progress.totalLocked, total: progress.total }
            : undefined;

    return [
        {
            id: "ubb-builder",
            label: "Automated Venture Builder",
            path: "/ubb",
            progress: totalProgress,
            subSections: [
                { id: "ubb-canvas",         label: "Canvas",         path: "/ubb" },
                { id: "ubb-session",        label: "1st Session",    path: "/ubb/session" },
                { id: "ubb-marketing",      label: "Marketing",      path: "/ubb/marketing" },
                { id: "ubb-distribution",   label: "Distribution",   path: "/ubb/distribution" },
                { id: "ubb-communications", label: "Communications", path: "/ubb/communications" },
                { id: "ubb-landing",        label: "Landing Page",   path: "/ubb/landing-page" },
            ],
        },
        {
            id: "equilibrium",
            label: "Equilibrium",
            path: "/build/equilibrium",
        },
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

type EntryPath = "match" | null;

const buildJourneySections = (
    _currentPath: string,
    _deepProfileActivated: boolean,
    journeyProgress: JourneyProgress = {},
    entryPath: EntryPath = null,
): Section[] => {
    // Funnel v2 (Day 77, Sasha 2026-05-20) + Day 80 path-awareness:
    // JOURNEY restructured as the matching-onboarding sequence
    // (T → optional Activation → M → A → Q → Build OR Find Collaborators).
    //
    //   1.  Start by finding your top talent  — entry, always unlocked
    //   1.5 Activate your top talent ($37)    — OPTIONAL, paid digital
    //                                           deepening; no lock
    //   2.  Discover your mission             — locked until #1 completes
    //   3.  Map your assets                   — locked until #2 completes
    //   4.  Assess your quality of life       — locked until #3 completes
    //   5.  PATH-AWARE TERMINUS:
    //        build path: "Build a business off your top talent" → /path
    //                    (lock: !topTalentDone)
    //        match path: "Find collaborators" → /game/collaborate/matches
    //                    (lock: !assetsDone — engine needs T+M+A minimum
    //                     so the first 10 heads-ups carry enough signal)
    //
    // Locks are advisory, not access-gating: any authenticated user can
    // navigate directly to /mission-discovery, /asset-mapping,
    // /quality-of-life-map, /ubb, /game/collaborate/matches regardless of
    // JOURNEY lock state. The lock state only colors the row in the pane
    // (strikethrough + dim + popover hint).
    //
    // Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.2.
    const topTalentDone = !!journeyProgress["journey-start-here"];
    const missionDone = !!journeyProgress["journey-mission-discovery"];
    const assetsDone = !!journeyProgress["journey-asset-mapper"];

    const isMatch = entryPath === "match";

    const terminusItem: Section = isMatch
        ? {
              // Day 80 (Sasha 2026-05-22): match-path #5 = Find collaborators.
              // Locks on assets-done because the matching engine needs
              // T+M+A minimum for a decent AI-why; the first 10 heads-ups
              // sent must be perfect (trust ritual) so we don't open the
              // gate before the profile carries enough signal.
              // Completion signal: journey-find-collaborators flag set on
              // first match_interests insert by the user.
              id: "journey-find-collaborators",
              label: "5. Find collaborators",
              path: "/game/collaborate/matches",
              locked: !assetsDone,
              lockedHint: "Unlocks after you map your assets.",
              completed: !!journeyProgress["journey-find-collaborators"],
          }
        : {
              // Day 80 (Sasha 2026-05-22): build-path #5 destination
              // moved from /ubb → /path. /path shows the full 7-step
              // visual with conversion CTAs and works whether or not
              // the user has paid for Build; /ubb requires Build
              // entitlement to render anything meaningful.
              id: "journey-build-business",
              label: "5. Build a business off your top talent",
              path: "/path",
              locked: !topTalentDone,
              lockedHint: "Unlocks after you find your top talent.",
              completed: !!journeyProgress["journey-build-business"],
          };

    return [
        {
            id: "journey-start-here",
            label: "1. Start by finding your top talent",
            path: "/",
            completed: topTalentDone,
        },
        {
            // Day 80 Wave 2.2 (Sasha 2026-05-22): optional $37 Top Talent
            // Activation step rendered as a "sidequest" variant — gold-
            // accented, ✦ glyph (no number), italic subtitle, right-
            // aligned price chip. Doesn't break the numbered 1→2→3→4→5
            // path flow; reads as "this exists alongside, optional, paid."
            //
            // Per alexanders_unique_business.md Branch B: deeper digital
            // profile (Three Talents in Depth, How It Shows Up, Path of
            // Mastery, Roles, Partner, Monetization, What's Next).
            //
            // Routes to /game/me/zone-of-genius — the user's existing
            // Top Talent reveal in the platform shell, where the
            // Activation CTA lives in context (not the /ignite sales
            // page). Sasha's call: "in-context deepening, not bait-
            // and-switch to the booking page."
            id: "journey-activation",
            // Day 80 Wave 2.3 (Sasha 2026-05-22): copy + visual revisions:
            //  - label rewritten to Sasha's exact wording (matches the
            //    AppleseedDisplay $37 CTA section's headline)
            //  - subtitle dropped — was making the row visually larger
            //    than step #1; sidequest should be a SIBLING of the
            //    numbered steps, not a dominating element
            //  - priceChip retained on the right for premium signal
            //  - route swapped to /zone-of-genius#activate where the
            //    actual $37 CTA section lives in AppleseedDisplay
            //    (NOT /game/me/zone-of-genius which only has $555 CTAs)
            label: "Find out how to monetize your top talent",
            priceChip: "$37",
            variant: "sidequest",
            // Day 80 Wave 2.4: route to the dedicated standalone page,
            // not the AppleseedDisplay anchor (which surrounds the
            // $37 offer with the $555 funnel + other CTAs).
            path: "/activate-top-talent",
            completed: !!journeyProgress["journey-activation"],
        },
        {
            id: "journey-mission-discovery",
            label: "2. Discover your mission",
            path: "/mission-discovery",
            locked: !topTalentDone,
            lockedHint: "Unlocks after you find your top talent.",
            completed: missionDone,
        },
        {
            id: "journey-asset-mapper",
            label: "3. Map your assets",
            path: "/asset-mapping",
            locked: !missionDone,
            lockedHint: "Unlocks after you discover your mission.",
            completed: assetsDone,
        },
        {
            // Day 77 (Sasha 2026-05-20): "Improves match quality" badge
            // removed — Sasha flagged it as redundant ornamentation.
            // The position in the sequence already signals its role.
            id: "journey-qol-assess",
            label: "4. Assess your quality of life",
            path: "/quality-of-life-map/assessment",
            locked: !assetsDone,
            lockedHint: "Unlocks after you map your assets.",
            completed: !!journeyProgress["journey-qol-assess"],
        },
        terminusItem,
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

    // Day 64 (Sasha 2026-05-07): deeper-Top-Talent-view gate for the
    // JOURNEY #5 ("Build a business off your top talent") soft-lock.
    // Same hook is consumed by GameShellV2 to gate the BUILD space
    // chip — single source of truth across the funnel boundary.
    const { activated: deepProfileActivated } = useDeepProfileActivated();

    // Day 80 (Sasha 2026-05-22): entry-path context for the path-aware
    // JOURNEY terminus (#5). match path → "Find collaborators"; build
    // path → "Build a business". Read here, threaded into
    // buildJourneySections.
    const { path: entryPath } = useEntryPath();

    // Day 79 (Sasha 2026-05-22): one-shot expansion of ME → Top Talent
    // sub-list right after the user unlocks the deeper view.
    // Default for top-talent is now collapsed (was: auto-expand
    // whenever any sub-route was active). Sasha's call: the 12-item
    // sub-list is visual noise on every ME visit; the only moment it
    // should pop open is the first time after activation, when the
    // user is meant to discover what they just gained access to.
    // Sessionstorage flag survives navigation inside the tab but
    // resets on a new tab / new session, so a second login session
    // gets one fresh reveal too. User's explicit chevron toggle
    // (recorded in `expandedSections`) always wins.
    const TT_DROPDOWN_REVEALED_KEY = "fytt:tt-dropdown-revealed";
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!deepProfileActivated) return;
        if (activeSpaceId !== "grow") return;
        try {
            if (window.sessionStorage.getItem(TT_DROPDOWN_REVEALED_KEY) === "true") return;
        } catch {
            return;
        }
        setExpandedSections((prev) => {
            // Respect explicit user toggle — only auto-expand if the
            // user hasn't touched the chevron yet this session.
            if (prev["top-talent"] !== undefined) return prev;
            try {
                window.sessionStorage.setItem(TT_DROPDOWN_REVEALED_KEY, "true");
            } catch {
                // localStorage / sessionStorage can throw in private mode —
                // accept the flag won't persist and just expand once for
                // this render cycle.
            }
            return { ...prev, "top-talent": true };
        });
    }, [deepProfileActivated, activeSpaceId]);

    // Day 65 (Sasha 2026-05-15): per-item progress for the JOURNEY pane.
    // Drives the strikethrough on rows the user has accomplished
    // (Top Talent reveal, asset mapping, QoL assessment, mission
    // discovery — items with clear data signals in game_profiles).
    // Items without a signal (Playbook, Path, Dashboard view pages,
    // and UBB's 18-artifact completion arc) simply never strike through.
    const { progress: journeyProgress } = useJourneyProgress();

    // Day 66 wave M (Sasha 2026-05-16): draw-in animation for items
    // that JUST flipped from un-completed to completed during this
    // session (e.g., after the user saves their mission, item #8's
    // strikethrough animates in). Rows already-completed-on-mount
    // render with the static strikethrough — no animation, no
    // distraction. Track the previous progress map in a ref and
    // diff on every update; any id whose `completed` flipped
    // false→true gets added to `animatingIds` for a short window.
    const prevProgressRef = useRef<JourneyProgress>({});
    const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
    useEffect(() => {
        const prev = prevProgressRef.current;
        const justCompleted: string[] = [];
        for (const id of Object.keys(journeyProgress)) {
            if (journeyProgress[id] && !prev[id]) justCompleted.push(id);
        }
        // Skip the initial-mount diff — `prev` is empty, so every
        // already-completed item would falsely appear "just completed."
        // The check below: only animate if prev had at least one entry
        // (meaning a previous render happened — this is a real transition).
        const isInitialDiff = Object.keys(prev).length === 0;
        prevProgressRef.current = journeyProgress;
        if (isInitialDiff || justCompleted.length === 0) return;
        setAnimatingIds((current) => {
            const next = new Set(current);
            justCompleted.forEach((id) => next.add(id));
            return next;
        });
        const timer = window.setTimeout(() => {
            setAnimatingIds((current) => {
                const next = new Set(current);
                justCompleted.forEach((id) => next.delete(id));
                return next;
            });
        }, 1000); // animation duration + small buffer
        return () => window.clearTimeout(timer);
    }, [journeyProgress]);

    // Day 55 (Sasha 2026-04-29): touch detection for locked-row popover
    // side switch. Desktop → "right" (popover floats into pane 3's
    // empty area, escaping pane 2's overflow via Popover's built-in
    // Portal). Touch → "bottom" (drops below the row; "right" has no
    // viewport room when pane 2 takes the full mobile width).
    const [isTouchDevice] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia?.("(pointer: coarse)").matches ?? false;
    });

    // Which locked row currently has its hint popover open. Single
    // string lets us enforce "only one open at a time" without
    // tracking open state per-row. Cleared on hover-leave (desktop)
    // or click-outside (mobile, via Popover's onOpenChange).
    const [openLockedHintId, setOpenLockedHintId] = useState<string | null>(null);

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
                sections: buildJourneySections(location.pathname, deepProfileActivated, journeyProgress, entryPath),
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

    // Auto-expand a section when the user lands on one of its sub-routes.
    // Day 58 (Sasha 2026-05-02) bug fix: was running on every re-render
    // because `spaceData` came from getSections() which returns a fresh
    // reference each render — so any manual collapse was immediately
    // re-expanded by this effect. Now keyed on pathname only: nav
    // changes auto-expand, manual chevron clicks stay respected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
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
    }, [location.pathname]);

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

                Day 55 (Sasha 2026-04-29): an iter-1/iter-2 attempt to
                grow this header (h-16 → h-[124px] → h-[160px]) so the
                title would share a Y line with pane 1's wordmark orb
                was reverted. It worked for alignment but introduced a
                large empty zone above the first nav item, breaking the
                pane's compactness. Plan B: keep pane 2's compact h-16
                header at its natural Y, and align the top-right
                rotating logo to *this* Y instead. */}
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
                    // Day 58 (Sasha 2026-05-02 evening): default to "expanded
                    // when there's an active child" so the dropdown opens
                    // automatically the moment the user lands on a sub-route
                    // — no flash of collapsed state, no waiting for the
                    // useEffect tick. The user's explicit toggle still wins
                    // (entry in `expandedSections` overrides the default).
                    const hasActiveChild = !!section.subSections?.some((sub) => isActive(sub.path));
                    // Day 79 (Sasha 2026-05-22): top-talent defaults to
                    // collapsed even when on a sub-route. The dropdown
                    // is only auto-opened by the one-shot useEffect
                    // above (first ME visit after deepProfileActivated
                    // flips true). Other sections (AI OS Suites, UBB
                    // phases, LEARN paths) keep the hasActiveChild
                    // auto-expand so they pop open when the user lands
                    // on a relevant sub-route.
                    const defaultExpanded =
                        section.id === "top-talent" ? false : hasActiveChild;
                    const isExpanded = expandedSections[section.id] ?? defaultExpanded;
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

                    // Day 80 Wave 2.2 (Sasha 2026-05-22): sidequest variant
                    // render branch. Optional paid offerings (today: the
                    // $37 Activation step) get gold-tinted background,
                    // ✦ glyph instead of a number, italic subtitle below
                    // the title, right-aligned gold price chip, smaller
                    // height (py-2 vs py-3). Doesn't interrupt the
                    // numbered 1→2→3→4→5 path reading.
                    // Day 80 Wave 2.3 (Sasha 2026-05-22): sidequest row
                    // shrunk to match step #1 height — same px-3 py-3
                    // padding, same overall vertical real estate. Drops
                    // the subtitle slot (was creating extra height that
                    // made the row visually dominate the numbered path).
                    // Result: a true sibling row with ✦ glyph, label
                    // (italic, slightly muted to differentiate from
                    // numbered steps), and right-aligned price chip.
                    // Day 80 Wave 2.4 (Sasha 2026-05-22): indented LEFT
                    // (ml-8) so the row reads as a CHILD/option of the
                    // step above it, not an equal sibling row. Combined
                    // with the smaller text size + italic register +
                    // ✦ glyph, the visual hierarchy now reads as:
                    //     1. Required step
                    //         ↳ optional sidequest
                    //     2. Required step
                    const isSidequest = section.variant === "sidequest";
                    const sidequestRowContent = isSidequest ? (
                        <div
                            className={cn(
                                "group flex items-center gap-2.5 px-3 py-2 ml-8 mr-2 rounded-2xl transition-all duration-300 relative cursor-pointer",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
                                "bg-white/[0.03] hover:bg-white/[0.06] hover:translate-y-[-1px] hover:shadow-[0_0_10px_-4px_rgba(244,212,114,0.25)]",
                            )}
                            onClick={handleSectionClick}
                        >
                            <span className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0">
                                <span
                                    className="inline-flex items-center justify-center w-[22px] h-[22px]"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: "15px",
                                        color: "rgba(244, 212, 114, 0.85)",
                                        textShadow:
                                            "0 0 6px rgba(244, 212, 114, 0.40)",
                                    }}
                                    aria-hidden="true"
                                >
                                    ✦
                                </span>
                            </span>
                            <span
                                className="flex-1 text-[16px] leading-snug italic min-w-0"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 500,
                                    letterSpacing: "0.012em",
                                    color: "rgba(255, 255, 255, 0.80)",
                                }}
                            >
                                {section.label}
                            </span>
                            {section.priceChip && (
                                <span
                                    className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-md flex-shrink-0"
                                    style={{
                                        fontFamily: "'DM Sans', system-ui, sans-serif",
                                        fontVariantNumeric: "tabular-nums lining-nums",
                                        fontSize: "10.5px",
                                        fontWeight: 700,
                                        letterSpacing: "0.03em",
                                        color: "rgba(244, 212, 114, 0.92)",
                                        background:
                                            "rgba(244, 212, 114, 0.10)",
                                        border:
                                            "0.5px solid rgba(212, 175, 55, 0.45)",
                                    }}
                                >
                                    {section.priceChip}
                                </span>
                            )}
                        </div>
                    ) : null;

                    // Day 50 later (Sasha): pane 2 rows now mirror the
                    // SPACES chips on pane 1 — rounded-2xl pill, bg-white/5
                    // baseline so each row reads as its own discrete
                    // object, hover gets a gold ring + soft halo + 1px
                    // lift, active gets a gold ring + larger halo + the
                    // absolute gold left-pill marker (matching pane 1's
                    // active treatment exactly). Locked rows: chip still
                    // visible but text dim + no hover lift.
                    const standardRowContent = (
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
                                    ? { backgroundColor: "var(--skin-selected-bg, rgba(212, 175, 55, 0.08))" }
                                    : isLocked
                                        ? { opacity: fogOpacity }
                                        : undefined
                            }
                            onClick={handleSectionClick}
                            aria-disabled={isLocked || undefined}
                            // Day 55 (Sasha 2026-04-29): hover handlers
                            // for desktop locked-row popover. Touch
                            // devices skip these (no hover semantics);
                            // tap is handled by PopoverTrigger below.
                            onMouseEnter={
                                isLocked && !isTouchDevice
                                    ? () => setOpenLockedHintId(section.id)
                                    : undefined
                            }
                            onMouseLeave={
                                isLocked && !isTouchDevice
                                    ? () => setOpenLockedHintId(null)
                                    : undefined
                            }
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
                                            // Day 67 (Sasha 2026-05-16, bug fix):
                                            // completed pip dimmed aggressively so it
                                            // reads "settled / quest done." Previously
                                            // the pip stayed bright gold on completed
                                            // rows, making the strikethrough look like
                                            // a glitch instead of a state. Precedence:
                                            // locked > active > completed > default.
                                            background: isLocked
                                                ? "rgba(212, 175, 55, 0.14)"
                                                : sectionActive && !hasSubSections
                                                    ? "linear-gradient(135deg, rgba(244, 212, 114, 0.55) 0%, rgba(212, 175, 55, 0.32) 100%)"
                                                    : section.completed
                                                        ? "linear-gradient(135deg, rgba(244, 212, 114, 0.10) 0%, rgba(212, 175, 55, 0.05) 100%)"
                                                        : "linear-gradient(135deg, rgba(244, 212, 114, 0.34) 0%, rgba(212, 175, 55, 0.20) 100%)",
                                            color: isLocked
                                                ? "rgba(244, 212, 114, 0.70)"
                                                : section.completed && !sectionActive
                                                    ? "rgba(244, 212, 114, 0.50)"
                                                    : "#f4d472",
                                            border: isLocked
                                                ? "0.5px solid rgba(212, 175, 55, 0.40)"
                                                : sectionActive && !hasSubSections
                                                    ? "0.5px solid rgba(212, 175, 55, 0.95)"
                                                    : section.completed
                                                        ? "0.5px solid rgba(212, 175, 55, 0.25)"
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
                                                    : section.completed
                                                        // No halo on completed — pip should
                                                        // sit quietly in the row, not glow.
                                                        ? undefined
                                                        : "0 0 8px -2px rgba(244, 212, 114, 0.32), inset 0 0 6px -2px rgba(244, 212, 114, 0.22)",
                                            textShadow: isLocked || (section.completed && !sectionActive)
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
                                    // Day 67 (Sasha 2026-05-16, bug fix): completed
                                    // rows use native text-decoration (per-line strike)
                                    // instead of the .fytt-strikethrough overlay span.
                                    // The overlay used `top: 55%` which sits BETWEEN
                                    // the two lines of a wrapped label — Sasha:
                                    // "if the text is in two lines, then it crosses
                                    // in a weird way that doesn't look like a crossing."
                                    // Text-decoration cleanly strikes each line on its
                                    // own center, regardless of wrap. Color tuned to
                                    // gold so the strike reads as decisive at 1.5px.
                                    // Label color also pushed harder (was 0.70 → 0.40)
                                    // so the row reads as "quest done" not "minor tint."
                                    color: section.completed && !sectionActive
                                        ? "rgba(255, 255, 255, 0.40)"
                                        : undefined,
                                    textDecorationLine: section.completed && !sectionActive
                                        ? "line-through"
                                        : undefined,
                                    textDecorationColor: section.completed && !sectionActive
                                        ? "var(--skin-strike-color, rgba(244, 212, 114, 0.75))"
                                        : undefined,
                                    textDecorationThickness: section.completed && !sectionActive
                                        ? "1.5px"
                                        : undefined,
                                    textUnderlineOffset: "auto",
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

                    // Day 80 Wave 2.2: unify back into one rowContent so
                    // the downstream PopoverTrigger and rowWithTooltip
                    // ternary stay variant-agnostic.
                    const rowContent = isSidequest
                        ? sidequestRowContent
                        : standardRowContent;

                    // Day 55 (Sasha 2026-04-29): locked-row hint popover.
                    // Controlled by `openLockedHintId` state — desktop
                    // hover handlers (on rowContent above) drive it,
                    // mobile uses PopoverTrigger's native click toggle.
                    // Both paths converge through `onOpenChange` so
                    // click-outside dismissal works on touch.
                    // Visual: identical to the previous Tooltip — same
                    // gold-on-navy gradient pill with Cormorant text.
                    const rowWithTooltip = isLocked ? (
                        <Popover
                            open={openLockedHintId === section.id}
                            onOpenChange={(open) => {
                                setOpenLockedHintId(open ? section.id : null);
                            }}
                        >
                            <PopoverTrigger asChild>{rowContent}</PopoverTrigger>
                            <PopoverContent
                                side={isTouchDevice ? "bottom" : "right"}
                                align="center"
                                sideOffset={12}
                                collisionPadding={16}
                                onOpenAutoFocus={(e) => e.preventDefault()}
                                className="w-auto max-w-[260px] rounded-xl border-none p-0 shadow-none bg-transparent"
                            >
                                <div
                                    className="rounded-xl px-4 py-3"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.88) 50%, rgba(10,22,40,0.92) 100%)",
                                        border: "1px solid rgba(212, 175, 55, 0.35)",
                                        boxShadow:
                                            "0 0 0 1px rgba(212, 175, 55, 0.15), 0 8px 28px -8px rgba(10, 22, 40, 0.6), 0 0 24px -6px rgba(244, 212, 114, 0.25)",
                                    }}
                                >
                                    {/* Day 55 (Sasha 2026-04-29): redundant
                                        "[SECTION] · LOCKED" eyebrow retired
                                        — the row itself already names the
                                        section, and "Locked" is implied by
                                        the hint sentence ("Unlocks after…").
                                        Hint inherits the golden register
                                        (Cormorant + gold color + gold halo)
                                        from the retired eyebrow but stays
                                        in natural case + italic for
                                        readability — uppercase + 0.22em
                                        tracking on a full sentence would
                                        wrap and read as shouted. */}
                                    <p
                                        className="text-[13px] italic leading-snug"
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontWeight: 500,
                                            color: "#f4d472",
                                            textShadow: "0 0 10px rgba(244, 212, 114, 0.35), 0 1px 2px rgba(10,22,40,0.5)",
                                        }}
                                    >
                                        {section.lockedHint || "Locked"}
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
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
                                        // Day 58 (Sasha 2026-05-02) bug fix:
                                        // sub-items use EXACT match only.
                                        // Was using `isActive` (prefix match)
                                        // which made the Overview light up
                                        // on every sub-route because every
                                        // sub-path starts with the parent
                                        // /game/me/zone-of-genius prefix.
                                        const subActive = location.pathname === sub.path;
                                        const subNumber = subIdx + 1;
                                        // Day 58 (Sasha 2026-05-02): "Start Here"
                                        // gets a subtle persistent glow even
                                        // when not active — it's the activation
                                        // home, so the side-nav signals "this is
                                        // where you return to."
                                        // Day 61 (Sasha 2026-05-04 12:00):
                                        // "What's Next?" added as the second
                                        // emphasized node — bookend treatment.
                                        // Start Here = where you arrive; What's
                                        // Next? = where you decide to act.
                                        const isHomeNode =
                                            sub.id === "tt-start-here" ||
                                            sub.id === "tt-whats-next";
                                        return (
                                            <div
                                                key={sub.id}
                                                className={cn(
                                                    "group flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-2xl transition-all duration-300 relative cursor-pointer",
                                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
                                                    subActive
                                                        ? "text-white ring-1 ring-[#d4af37]/60 shadow-[0_0_22px_-6px_rgba(244,212,114,0.55),0_0_48px_-14px_rgba(212,175,55,0.35)]"
                                                        : isHomeNode
                                                            ? "bg-[rgba(212,175,55,0.06)] text-white/95 ring-1 ring-[#d4af37]/25 shadow-[0_0_14px_-4px_rgba(244,212,114,0.28)] hover:bg-[rgba(212,175,55,0.10)] hover:ring-[#d4af37]/45 hover:shadow-[0_0_20px_-4px_rgba(244,212,114,0.40)] hover:translate-y-[-1px] active:translate-y-0"
                                                            : "bg-white/[0.05] text-white/95 hover:bg-white/[0.10] hover:text-white hover:ring-1 hover:ring-[#d4af37]/30 hover:shadow-[0_0_16px_-4px_rgba(244,212,114,0.28)] hover:translate-y-[-1px] active:translate-y-0"
                                                )}
                                                style={
                                                    subActive
                                                        ? { backgroundColor: "var(--skin-selected-bg, rgba(212, 175, 55, 0.08))" }
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
