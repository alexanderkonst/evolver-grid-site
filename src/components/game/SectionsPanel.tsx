import { ReactNode, memo, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useJourneyProgression } from "@/hooks/useJourneyProgression";
import { PLAYBOOK_STEPS } from "@/data/playbookSteps";

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
    subSections?: SubSection[];
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
                subSections: [
                    { id: "tt-overview", label: "Overview", path: "/game/me/zone-of-genius" },
                    { id: "tt-bullseye", label: "Bullseye Sentence", path: "/game/me/zone-of-genius/bullseye" },
                    { id: "tt-vibrational-key", label: "Vibrational Key", path: "/game/me/zone-of-genius/vibrational-key" },
                    { id: "tt-three-lenses", label: "Three Lenses", path: "/game/me/zone-of-genius/three-lenses" },
                    { id: "tt-appreciated-for", label: "Appreciated For", path: "/game/me/zone-of-genius/appreciated-for" },
                    { id: "tt-mastery", label: "Mastery Stages", path: "/game/me/zone-of-genius/mastery" },
                    { id: "tt-activities", label: "Professional Activities", path: "/game/me/zone-of-genius/activities" },
                    { id: "tt-roles", label: "Roles & Environments", path: "/game/me/zone-of-genius/roles" },
                    { id: "tt-partner", label: "Complementary Partner", path: "/game/me/zone-of-genius/partner" },
                    { id: "tt-monetization", label: "Monetization", path: "/game/me/zone-of-genius/monetization" },
                    { id: "tt-life-scene", label: "Life Scene", path: "/game/me/zone-of-genius/life-scene" },
                    { id: "tt-visual-codes", label: "Visual Codes", path: "/game/me/zone-of-genius/visual-codes" },
                    { id: "tt-elevator-pitch", label: "Elevator Pitch", path: "/game/me/zone-of-genius/elevator-pitch" },
                ],
            },
        ],
    },
    // LEARN Space
    learn: {
        title: "LEARN",
        sections: [
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
}

/**
 * Build the JOURNEY pane sections.
 *
 * Rule (Sasha, 2026-04-21 v2): three items, always shown in this order:
 *   1. Start here         → /             (the landing page)
 *   2. The playbook       → /playbook     (the full 7-step methodology)
 *   3. The path           → /path         (the value ladder)
 *
 * If the user is authenticated, "My Artifacts" is appended at the end.
 * The deeper progressive "Step N: ..." list is retired — it lived in a
 * separate phase of the design. Can return later as a sub-section if
 * Sasha calls for it.
 *
 * `currentStep` is kept in the signature for now in case we reintroduce
 * progression-aware reveals; currently unused.
 */
const buildJourneySections = (
    _currentStep: number,
    showAuthedExtras: boolean,
): Section[] => {
    const sections: Section[] = [
        {
            id: "journey-start-here",
            label: "1. Start Here",
            path: "/",
        },
        {
            id: "journey-the-playbook",
            label: "2. The Playbook",
            path: "/playbook",
        },
        {
            id: "journey-the-path",
            label: "3. The Path",
            path: "/path",
        },
    ];

    // "My Artifacts" requires auth — each user's own artifacts, RLS-scoped.
    if (showAuthedExtras) {
        sections.push({
            id: "journey-my-artifacts",
            label: `${sections.length + 1}. My Artifacts`,
            path: "/my-artifacts",
        });
    }

    return sections;
};

const SectionsPanel = ({
    activeSpaceId,
    onSectionSelect,
    onClose,
    className,
}: SectionsPanelProps) => {
    const location = useLocation();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const { currentStep } = useJourneyProgression();

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

        // JOURNEY → progressive reveal driven by onboarding_stage.
        // "The Path" is always appended (public). "My Artifacts" requires
        // authentication since it reads RLS-scoped user rows.
        if (activeSpaceId === "journey") {
            const showAuthedExtras = !!userEmail;
            return {
                ...baseData,
                sections: buildJourneySections(currentStep, showAuthedExtras),
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

    return (
        <div
            className={cn(
                "w-[260px] flex flex-col",
                "liquid-glass",
                className
            )}
            /* Day 48 later (Sasha): Pane 2 now pulls the lit-navy overlay
               (--skin-panel-2-bg) with a subtle gold right-edge seam that
               mirrors the mockup. When minimized the same treatment reads
               as a thin gold line between rail and content. */
            style={{
                backgroundColor: "var(--skin-panel-2-bg, rgba(14, 32, 68, 0.42))",
                boxShadow:
                    "inset -1px 0 0 rgba(212, 175, 55, 0.25), 2px 0 18px -8px rgba(244, 212, 114, 0.22)",
            }}
        >
            {/* Close button (only when onClose provided) */}
            {onClose && (
                <div className="h-10 px-4 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                        title="Hide sidebar (⌘B)"
                        aria-label="Hide sidebar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <ScrollArea className="flex-1">
            <nav className="py-2 pt-4">
                {spaceData.sections.map((section) => {
                    const hasSubSections = section.subSections && section.subSections.length > 0;
                    const isExpanded = expandedSections[section.id] ?? false;
                    const sectionActive = isActive(section.path);

                    return (
                        <div key={section.id}>
                            {/* Section item */}
                            <div
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 mx-2 rounded-md cursor-pointer transition-all duration-150",
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                                    sectionActive && !hasSubSections
                                        ? "bg-white/15 text-white border-l-2 border-white/40"
                                        : "text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-0.5"
                                )}
                                onClick={() => {
                                    if (hasSubSections) {
                                        toggleExpand(section.id);
                                    } else if (onSectionSelect) {
                                        onSectionSelect(section.path);
                                    }
                                }}
                            >
                                <span className="w-4 h-4 flex items-center justify-center">
                                    {hasSubSections ? (
                                        isExpanded ? (
                                            <ChevronDown className="w-3 h-3" />
                                        ) : (
                                            <ChevronRight className="w-3 h-3" />
                                        )
                                    ) : null}
                                </span>
                                {section.icon}
                                <span className="text-sm flex-1">{section.label}</span>
                            </div>

                            {/* Sub-sections with indent */}
                            {hasSubSections && isExpanded && (
                                <div className="ml-8 border-l border-white/10">
                                    {section.subSections!.map((sub) => {
                                        const subActive = isActive(sub.path);
                                        return (
                                            <div
                                                key={sub.id}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 ml-2 rounded-md cursor-pointer transition-colors",
                                                    subActive
                                                        ? "bg-white/15 text-white"
                                                        : "text-white/40 hover:bg-white/10 hover:text-white"
                                                )}
                                                onClick={() => onSectionSelect?.(sub.path)}
                                            >
                                                <span className="text-sm">{sub.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
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
