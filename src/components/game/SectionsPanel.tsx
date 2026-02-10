import { ReactNode, memo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
    "next-move": {
        title: "My Next Move",
        sections: [
            { id: "recommended", label: "Recommended Action", path: "/game/next-move" },
        ],
    },
    // ME Space (was Profile/GROW)
    grow: {
        title: "ME",
        sections: [
            { id: "overview", label: "Overview", path: "/game/me" },
            { id: "mission", label: "My Mission", path: "/game/me/mission" },
            {
                id: "zog",
                label: "Zone of Genius",
                path: "/game/me/zone-of-genius",
                subSections: [
                    { id: "zog-overview", label: "Overview", path: "/game/me/zone-of-genius" },
                    { id: "zog-bullseye", label: "Bullseye Sentence", path: "/game/me/zone-of-genius/bullseye" },
                    { id: "zog-vibrational-key", label: "Vibrational Key", path: "/game/me/zone-of-genius/vibrational-key" },
                    { id: "zog-three-lenses", label: "Three Lenses", path: "/game/me/zone-of-genius/three-lenses" },
                    { id: "zog-appreciated-for", label: "Appreciated For", path: "/game/me/zone-of-genius/appreciated-for" },
                    { id: "zog-mastery", label: "Mastery Stages", path: "/game/me/zone-of-genius/mastery" },
                    { id: "zog-activities", label: "Professional Activities", path: "/game/me/zone-of-genius/activities" },
                    { id: "zog-roles", label: "Roles & Environments", path: "/game/me/zone-of-genius/roles" },
                    { id: "zog-partner", label: "Complementary Partner", path: "/game/me/zone-of-genius/partner" },
                    { id: "zog-monetization", label: "Monetization", path: "/game/me/zone-of-genius/monetization" },
                    { id: "zog-life-scene", label: "Life Scene", path: "/game/me/zone-of-genius/life-scene" },
                    { id: "zog-visual-codes", label: "Visual Codes", path: "/game/me/zone-of-genius/visual-codes" },
                    { id: "zog-elevator-pitch", label: "Elevator Pitch", path: "/game/me/zone-of-genius/elevator-pitch" },
                ],
            },
            {
                id: "genius-business",
                label: "Genius Business",
                path: "/game/me/genius-business",
                subSections: [
                    { id: "gb-overview", label: "Overview", path: "/game/me/genius-business" },
                    { id: "gb-audience", label: "Ideal Client", path: "/game/me/genius-business/audience" },
                    { id: "gb-promise", label: "Promise", path: "/game/me/genius-business/promise" },
                    { id: "gb-channels", label: "Channels", path: "/game/me/genius-business/channels" },
                    { id: "gb-vision", label: "Vision", path: "/game/me/genius-business/vision" },
                ],
            },
            {
                id: "qol",
                label: "Quality of Life",
                path: "/quality-of-life-map/assessment",
                subSections: [
                    { id: "assessment", label: "Assessment", path: "/quality-of-life-map/assessment" },
                    { id: "results", label: "Results", path: "/quality-of-life-map/results" },
                ],
            },
            { id: "assets", label: "Assets", path: "/game/me/assets" },
            { id: "settings", label: "Settings", path: "/game/me/settings" },
        ],
    },
    // LEARN Space (was Transformation)
    learn: {
        title: "LEARN",
        sections: [
            { id: "today", label: "Today's Practice", path: "/game/learn/today" },
            {
                id: "paths",
                label: "Growth Paths",
                path: "/game/learn/paths",
                subSections: [
                    { id: "body", label: "Body", path: "/game/learn/path/body" },
                    { id: "emotions", label: "Emotions", path: "/game/learn/path/emotions" },
                    { id: "mind", label: "Mind", path: "/game/learn/path/mind" },
                    { id: "genius", label: "Genius", path: "/game/learn/path/genius" },
                    { id: "spirit", label: "Spirit", path: "/game/learn/path/spirit" },
                ],
            },
            { id: "library", label: "Practice Library", path: "/game/learn/library" },
            { id: "tests", label: "Personality Tests", path: "/game/learn/tests" },
            {
                id: "qol-map",
                label: "Quality of Life Map",
                path: "/game/learn/qol-assessment",
                subSections: [
                    { id: "qol-assessment", label: "Assessment", path: "/game/learn/qol-assessment" },
                    { id: "qol-results", label: "Results", path: "/game/learn/qol-results" },
                ],
            },
            {
                id: "zog-assessment",
                label: "Zone of Genius",
                path: "/game/learn/genius-assessment/step-0",
                subSections: [
                    { id: "zog-assessment", label: "Assessment", path: "/game/learn/genius-assessment/step-0" },
                    { id: "zog-snapshot", label: "Snapshot", path: "/game/learn/genius-assessment/step-4" },
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
            { id: "product-builder", label: "Product Builder", path: "/game/build/product-builder" },
        ],
    },
    // BUY & SELL Space (was Marketplace)
    buysell: {
        title: "BUY & SELL",
        sections: [
            { id: "browse", label: "Browse Guides", path: "/game/marketplace/browse" },
            { id: "genius-offer", label: "Genius Offer", path: "/zone-of-genius/entry" },
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

const SectionsPanel = ({
    activeSpaceId,
    onSectionSelect,
    onClose,
    className,
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
                // Panel 2: Lighter than Panel 1 - Royal Blue base
                "w-[260px] flex flex-col",
                "bg-gradient-to-b from-[#29549f]/95 via-[#1e4374]/90 to-[#1a2f4a]/95",
                "backdrop-blur-sm border-r border-[#6894d0]/30",
                className
            )}
        >
            {/* Close button (only when onClose provided) */}
            {onClose && (
                <div className="h-10 px-4 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="p-1.5 text-[#a7cbd4] hover:text-white hover:bg-[#29549f]/60 rounded-md transition-colors"
                        title="Hide sidebar (⌘B)"
                        aria-label="Hide sidebar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Sections - custom scrollbar */}
            <nav className="flex-1 overflow-y-auto py-2 pt-4 scrollbar-thin">
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
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6894d0]/50",
                                    sectionActive && !hasSubSections
                                        ? "bg-[#1e4374]/80 text-white border-l-2 border-[#a7cbd4]"
                                        : "text-[#a7cbd4] hover:bg-[#1e4374]/60 hover:text-white hover:translate-x-0.5"
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
                                <div className="ml-8 border-l border-[#6894d0]/30">
                                    {section.subSections!.map((sub) => {
                                        const subActive = isActive(sub.path);
                                        return (
                                            <div
                                                key={sub.id}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 ml-2 rounded-md cursor-pointer transition-colors",
                                                    subActive
                                                        ? "bg-[#1e4374]/80 text-white"
                                                        : "text-[#6894d0] hover:bg-[#1e4374]/60 hover:text-white"
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
