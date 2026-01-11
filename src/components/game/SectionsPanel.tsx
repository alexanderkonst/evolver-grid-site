import { ReactNode, useState } from "react";
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
            { id: "assets", label: "Assets", path: "/asset-mapping" },
            { id: "settings", label: "Settings", path: "/game/profile" },
        ],
    },
    transformation: {
        title: "Transformation",
        sections: [
            { id: "library", label: "Practice Library", path: "/library" },
            {
                id: "paths",
                label: "Growth Paths",
                path: "/growth-paths",
                subSections: [
                    { id: "body", label: "Body", path: "/game/path/body" },
                    { id: "mind", label: "Mind", path: "/game/path/mind" },
                    { id: "emotions", label: "Emotions", path: "/game/path/emotions" },
                    { id: "spirit", label: "Spirit", path: "/game/path/spirit" },
                    { id: "genius", label: "Uniqueness", path: "/game/path/genius" },
                ],
            },
        ],
    },
    marketplace: {
        title: "Marketplace",
        sections: [
            { id: "browse", label: "Browse", path: "/game/marketplace" },
            { id: "my-offers", label: "My Offers", path: "/game/marketplace" },
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

    return (
        <div
            className={cn(
                "w-[240px] bg-slate-800 flex flex-col border-r border-slate-700",
                className
            )}
        >
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-700">
                <h2 className="text-white font-semibold truncate">{spaceData.title}</h2>
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

            {/* Search (optional) */}
            <div className="px-3 py-2 border-b border-slate-700">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-lg">
                    <Search className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">Search</span>
                </div>
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
                                <span className="text-sm flex-1 truncate">{section.label}</span>
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
                                                <span className="text-sm truncate">{sub.label}</span>
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
