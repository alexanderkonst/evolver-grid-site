import { ReactNode, memo, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { PLAYBOOK_STEPS } from "@/data/playbookSteps";
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
                // Monetization, Visual Codes, and Elevator Pitch removed
                // from the snapshot (they were diluting essence with
                // career-advisory and redundant articulations). The nav
                // items are dropped here too so the rail matches reality.
                // Mastery Stages, Roles & Environments, and Complementary
                // Partner stay — Sasha called these load-bearing.
                subSections: [
                    { id: "tt-overview", label: "Overview", path: "/game/me/zone-of-genius" },
                    { id: "tt-bullseye", label: "Bullseye Sentence", path: "/game/me/zone-of-genius/bullseye" },
                    { id: "tt-vibrational-key", label: "Vibrational Key", path: "/game/me/zone-of-genius/vibrational-key" },
                    { id: "tt-three-lenses", label: "Three Lenses", path: "/game/me/zone-of-genius/three-lenses" },
                    { id: "tt-appreciated-for", label: "Appreciated For", path: "/game/me/zone-of-genius/appreciated-for" },
                    { id: "tt-mastery", label: "Mastery Stages", path: "/game/me/zone-of-genius/mastery" },
                    { id: "tt-roles", label: "Roles & Environments", path: "/game/me/zone-of-genius/roles" },
                    { id: "tt-partner", label: "Complementary Partner", path: "/game/me/zone-of-genius/partner" },
                    { id: "tt-life-scene", label: "Life Scene", path: "/game/me/zone-of-genius/life-scene" },
                ],
            },
        ],
    },
    // LEARN Space
    // Day 51 (Sasha 2026-04-25): Activations live here as educational apps
    // in the Planetary OS. Body / Emotions / Mind / Talent / Spirit themes
    // remain as future-grouping placeholders below.
    learn: {
        title: "LEARN",
        sections: [
            { id: "activations", label: "Activations", path: "/activations" },
            { id: "overview", label: "Growth Sequence", path: "/game/learn" },
            {
                id: "body",
                label: "Body",
                path: "/game/learn/path/body",
                subSections: [
                    { id: "body-overview", label: "Coming soon", path: "/game/learn/path/body" },
                ],
            },
            {
                id: "emotions",
                label: "Emotions",
                path: "/game/learn/path/emotions",
                subSections: [
                    { id: "emotions-overview", label: "Coming soon", path: "/game/learn/path/emotions" },
                ],
            },
            {
                id: "mind",
                label: "Mind",
                path: "/game/learn/path/mind",
                subSections: [
                    { id: "mind-overview", label: "Coming soon", path: "/game/learn/path/mind" },
                ],
            },
            {
                id: "talent",
                label: "Talent",
                path: "/game/learn/path/genius",
                subSections: [
                    { id: "talent-overview", label: "Coming soon", path: "/game/learn/path/genius" },
                ],
            },
            {
                id: "spirit",
                label: "Spirit",
                path: "/game/learn/path/spirit",
                subSections: [
                    { id: "spirit-overview", label: "Coming soon", path: "/game/learn/path/spirit" },
                ],
            },
        ],
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
            { id: "ignite", label: "Ignition Session", path: "/game/marketplace/ignite" },
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
const buildJourneySections = (_currentPath: string): Section[] => {
    // Day 50 late (Sasha): five permanent rail items, no hide gating.
    // The rail is the same on every Journey-family page — including
    // the landing — so nothing appears/disappears as the user navigates.
    // Order: Start · Playbook · Path · AI OS · Dashboard.
    // Day 50 later (Sasha): two locked teasers added at the tail —
    // Mission Discovery (#6, unlocks after first session booking) and
    // Asset Mapper (#7, sequenced after Mission Discovery). Locked rows
    // render dimmed with a Radix tooltip showing the unlock hint.
    return [
        { id: "journey-start-here",        label: "1. Start",             path: "/" },
        { id: "journey-the-playbook",      label: "2. Playbook",          path: "/playbook" },
        { id: "journey-the-path",          label: "3. Path",              path: "/path" },
        { id: "journey-ai-os",             label: "4. AI OS",             path: "/ai-os" },
        { id: "journey-dashboard",         label: "5. Dashboard",         path: "/dashboard" },
        {
            id: "journey-mission-discovery",
            label: "6. Mission Discovery",
            path: "/mission-discovery",
            locked: true,
            lockedHint: "Unlocks after your high-precision Top Talent.",
        },
        {
            id: "journey-asset-mapper",
            label: "7. Asset Mapper",
            path: "/asset-mapping",
            locked: true,
            lockedHint: "Unlocks after Mission Discovery.",
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
                "liquid-glass",
                className
            )}
            /* Day 48 iter 8 (Sasha): Pane 2 now pulls the lit-navy overlay
               (--skin-panel-2-bg). The flat 1px inset gold line retired
               in favor of a vertical gradient "spine" (absolute-positioned
               below) that mirrors pane 1 — both panes now read as the
               same backlit book-binding. */
            // Day 51 (Sasha 2026-04-25 r2): bg lowered further 0.30 → 0.18
            // — Sasha likes the "curtain" effect where bg figure peeks
            // through. Combined with backdrop-blur, reads as silk veil
            // over the animated stream. border: none — same fix as Pane 1,
            // removes liquid-glass's 0.5px white top border.
            //
            // Day 51 r3 (Sasha 2026-04-25 night): z-30 added so Pane 2 always
            // sits above page-owned background overlays (e.g. /ai-os's
            // z-[1] gradient + vignette + noise + StarryBackground). Without
            // this, on /ai-os the overlays were drawn over the panel and
            // Sasha saw the panel "disappear." On page-owned-bg routes the
            // bg is also bumped from 0.18 → 0.55 so the section list stays
            // legible on busy dark imagery — 0.18 alone got washed into
            // invisibility against /ai-os's editorial scene.
            style={{
                backgroundColor: pageOwnsBackground
                    ? "rgba(12, 26, 56, 0.55)"
                    : "rgba(14, 32, 68, 0.18)",
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

            {/* Bottom continuation fade — Day 51 night v2 (Sasha 2026-04-26):
                pane 2 used to read as terminating at a hard horizontal bottom
                edge, which made the column feel finite. A 96px gradient at the
                bottom (transparent → deeper navy) implies "the column keeps
                going" without forcing a literal scroll. Pointer-events-none
                so it never blocks interaction with the items above. */}
            <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, rgba(8, 18, 38, 0) 0%, rgba(8, 18, 38, 0.30) 50%, rgba(8, 18, 38, 0.62) 100%)",
                }}
            />

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
                {spaceData.sections.map((section) => {
                    const hasSubSections = section.subSections && section.subSections.length > 0;
                    const isExpanded = expandedSections[section.id] ?? false;
                    const sectionActive = isActive(section.path);
                    const isLocked = section.locked === true;
                    const { number, text: sectionText } = parseNumberedLabel(section.label);

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

                            {/* Sub-sections — gold hairline rail. */}
                            {hasSubSections && isExpanded && !isLocked && (
                                <div
                                    className="ml-8"
                                    style={{
                                        borderLeft: "1px solid rgba(212, 175, 55, 0.14)",
                                    }}
                                >
                                    {section.subSections!.map((sub) => {
                                        const subActive = isActive(sub.path);
                                        return (
                                            <div
                                                key={sub.id}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 ml-2 rounded-md cursor-pointer transition-colors",
                                                    subActive
                                                        ? "text-white"
                                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                                )}
                                                style={
                                                    subActive
                                                        ? {
                                                              backgroundColor: "rgba(212, 175, 55, 0.10)",
                                                          }
                                                        : undefined
                                                }
                                                onClick={() => onSectionSelect?.(sub.path)}
                                            >
                                                <span
                                                    className="text-[15px] leading-snug"
                                                    style={{
                                                        fontFamily: "'Cormorant Garamond', serif",
                                                        fontWeight: subActive ? 600 : 500,
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
