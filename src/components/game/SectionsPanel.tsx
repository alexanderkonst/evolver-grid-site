import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, Search, X } from "lucide-react";
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
    profile: {
        title: "Profile",
        sections: [
            { id: "overview", label: "Overview", path: "/game/profile" },
            { id: "mission", label: "My Mission", path: "/game/profile/mission" },
            {
                id: "zog",
                label: "Zone of Genius",
                path: "/zone-of-genius/entry",
                subSections: [
                    { id: "appleseed", label: "Appleseed", path: "/zone-of-genius/appleseed" },
                    { id: "excalibur", label: "Excalibur", path: "/zone-of-genius/excalibur" },
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
            { id: "assets", label: "Assets", path: "/game/profile/assets" },
        ],
    },
    transformation: {
        title: "Transformation",
        sections: [
            { id: "today", label: "Today's Practice", path: "/game/transformation/today" },
            {
                id: "paths",
                label: "Growth Paths",
                path: "/game/transformation/paths",
                subSections: [
                    { id: "body", label: "Body", path: "/game/transformation/path/body" },
                    { id: "emotions", label: "Emotions", path: "/game/transformation/path/emotions" },
                    { id: "mind", label: "Mind", path: "/game/transformation/path/mind" },
                    { id: "genius", label: "Genius", path: "/game/transformation/path/genius" },
                    { id: "spirit", label: "Spirit", path: "/game/transformation/path/spirit" },
                ],
            },
            { id: "library", label: "Practice Library", path: "/game/transformation/library" },
            { id: "tests", label: "Personality Tests", path: "/game/transformation/tests" },
        ],
    },
    marketplace: {
        title: "Marketplace",
        sections: [
            { id: "genius-offer", label: "Genius Offer", path: "/genius-offer" },
            { id: "public-page", label: "My Public Page", path: "/marketplace/create-page" },
            { id: "browse", label: "Browse Guides", path: "/game/marketplace/browse" },
        ],
    },
    teams: {
        title: "Teams",
        sections: [
            { id: "people", label: "People Directory", path: "/community/people" },
            { id: "connections", label: "Connections", path: "/connections" },
            { id: "genius-match", label: "Genius Match", path: "/game/teams" },
        ],
    },
    events: {
        title: "Events",
        sections: [
            { id: "browse", label: "Browse Events", path: "/game/events" },
            { id: "my-rsvps", label: "My RSVPs", path: "/game/events/my-rsvps" },
            { id: "create", label: "Create Event", path: "/game/events/create" },
        ],
    },
    coop: {
        title: "Startup Co-op",
        sections: [
            { id: "about", label: "About", path: "/game/coop" },
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
    if (!spaceData) return null;

    const toggleExpand = (sectionId: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

    useEffect(() => {
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

    return (
        <div
            className={cn(
                "w-[260px] bg-slate-800 flex flex-col border-r border-slate-700",
                className
            )}
        >
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-700">
                <h2 className="text-white font-semibold">{spaceData.title}</h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                        title="Hide sidebar (⌘B)"
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
                                    "flex items-center gap-2 px-3 py-2 mx-2 rounded-md cursor-pointer transition-colors",
                                    sectionActive && !hasSubSections
                                        ? "bg-slate-700 text-white"
                                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                                )}
                                onClick={() => {
                                    if (hasSubSections) {
                                        toggleExpand(section.id);
                                    } else if (onSectionSelect) {
                                        onSectionSelect(section.path);
                                    }
                                }}
                            >
                                {hasSubSections && (
                                    <span className="w-4 h-4 flex items-center justify-center">
                                        {isExpanded ? (
                                            <ChevronDown className="w-3 h-3" />
                                        ) : (
                                            <ChevronRight className="w-3 h-3" />
                                        )}
                                    </span>
                                )}
                                {section.icon}
                                <span className="text-sm flex-1">{section.label}</span>
                            </div>

                            {/* Sub-sections with indent */}
                            {hasSubSections && isExpanded && (
                                <div className="ml-4 border-l border-slate-700">
                                    {section.subSections!.map((sub) => {
                                        const subActive = isActive(sub.path);
                                        return (
                                            <div
                                                key={sub.id}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 ml-2 rounded-md cursor-pointer transition-colors",
                                                    subActive
                                                        ? "bg-slate-700 text-white"
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

export default SectionsPanel;
export { SPACE_SECTIONS };
