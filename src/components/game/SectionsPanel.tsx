import { ReactNode, memo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    // GROW Space (was Profile)
    grow: {
        title: "GROW",
        sections: [
            { id: "overview", label: "Overview", path: "/game/grow" },
            { id: "mission", label: "My Mission", path: "/game/grow/mission" },
            {
                id: "zog",
                label: "Zone of Genius",
                path: "/game/grow/zone-of-genius",
                subSections: [
                    { id: "zog-overview", label: "Overview", path: "/game/grow/zone-of-genius" },
                    { id: "zog-bullseye", label: "Bullseye Sentence", path: "/game/grow/zone-of-genius/bullseye" },
                    { id: "zog-vibrational-key", label: "Vibrational Key", path: "/game/grow/zone-of-genius/vibrational-key" },
                    { id: "zog-three-lenses", label: "Three Lenses", path: "/game/grow/zone-of-genius/three-lenses" },
                    { id: "zog-appreciated-for", label: "Appreciated For", path: "/game/grow/zone-of-genius/appreciated-for" },
                    { id: "zog-mastery", label: "Mastery Stages", path: "/game/grow/zone-of-genius/mastery" },
                    { id: "zog-activities", label: "Professional Activities", path: "/game/grow/zone-of-genius/activities" },
                    { id: "zog-roles", label: "Roles & Environments", path: "/game/grow/zone-of-genius/roles" },
                    { id: "zog-partner", label: "Complementary Partner", path: "/game/grow/zone-of-genius/partner" },
                    { id: "zog-monetization", label: "Monetization", path: "/game/grow/zone-of-genius/monetization" },
                    { id: "zog-life-scene", label: "Life Scene", path: "/game/grow/zone-of-genius/life-scene" },
                    { id: "zog-visual-codes", label: "Visual Codes", path: "/game/grow/zone-of-genius/visual-codes" },
                    { id: "zog-elevator-pitch", label: "Elevator Pitch", path: "/game/grow/zone-of-genius/elevator-pitch" },
                ],
            },
            {
                id: "genius-business",
                label: "Genius Business",
                path: "/game/grow/genius-business",
                subSections: [
                    { id: "gb-overview", label: "Overview", path: "/game/grow/genius-business" },
                    { id: "gb-audience", label: "Ideal Client", path: "/game/grow/genius-business/audience" },
                    { id: "gb-promise", label: "Promise", path: "/game/grow/genius-business/promise" },
                    { id: "gb-channels", label: "Channels", path: "/game/grow/genius-business/channels" },
                    { id: "gb-vision", label: "Vision", path: "/game/grow/genius-business/vision" },
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
            { id: "assets", label: "Assets", path: "/game/grow/assets" },
            { id: "settings", label: "Settings", path: "/game/grow/settings" },
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
            { id: "overview", label: "Overview", path: "/game/build" },
            { id: "product-builder", label: "Product Builder", path: "/product-builder" },
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

    const spaceData = SPACE_SECTIONS[activeSpaceId];

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
                // Brandbook: Navigation uses Deep Navy gradient
                "w-[260px] flex flex-col",
                "bg-gradient-to-b from-[#1e4374]/95 via-[#1a2f4a]/95 to-[#0e1f35]/95",
                "backdrop-blur-sm border-r border-slate-700/50",
                className
            )}
        >
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-700/50">
                <h2 className="text-white font-semibold">{spaceData.title}</h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                        title="Hide sidebar (⌘B)"
                        aria-label="Hide sidebar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Sections */}
            <nav className="flex-1 overflow-y-auto py-2">
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
                                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8460ea]/50",
                                    sectionActive && !hasSubSections
                                        ? "bg-slate-700/80 text-white border-l-2 border-[#8460ea]"
                                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white hover:translate-x-0.5"
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
                                <div className="ml-8 border-l border-slate-700/50">
                                    {section.subSections!.map((sub) => {
                                        const subActive = isActive(sub.path);
                                        return (
                                            <div
                                                key={sub.id}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 ml-2 rounded-md cursor-pointer transition-colors",
                                                    subActive
                                                        ? "bg-slate-700/80 text-white"
                                                        : "text-slate-500 hover:bg-slate-700/50 hover:text-white"
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
