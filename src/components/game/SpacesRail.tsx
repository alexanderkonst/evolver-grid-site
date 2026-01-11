import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    Compass,
    User,
    Sparkles,
    Store,
    Users,
    CalendarDays,
    Building2,
    Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SpaceItem {
    id: string;
    label: string;
    icon: ReactNode;
    path: string;
}

const SPACES: SpaceItem[] = [
    {
        id: "next-move",
        label: "My Next Move",
        icon: <Compass className="w-5 h-5" />,
        path: "/game/next-move",
    },
    {
        id: "profile",
        label: "Profile",
        icon: <User className="w-5 h-5" />,
        path: "/game/profile",
    },
    {
        id: "transformation",
        label: "Transformation",
        icon: <Sparkles className="w-5 h-5" />,
        path: "/game/transformation",
    },
    {
        id: "marketplace",
        label: "Marketplace",
        icon: <Store className="w-5 h-5" />,
        path: "/game/marketplace",
    },
    {
        id: "teams",
        label: "Teams",
        icon: <Users className="w-5 h-5" />,
        path: "/game/teams",
    },
    {
        id: "events",
        label: "Events",
        icon: <CalendarDays className="w-5 h-5" />,
        path: "/game/events",
    },
    {
        id: "coop",
        label: "Startup Co-op",
        icon: <Building2 className="w-5 h-5" />,
        path: "/game/coop",
    },
];

interface SpacesRailProps {
    activeSpaceId?: string;
    onSpaceSelect?: (spaceId: string) => void;
    unlockStatus?: Record<string, boolean>;
    className?: string;
}

const SpacesRail = ({
    activeSpaceId,
    onSpaceSelect,
    unlockStatus = {},
    className,
}: SpacesRailProps) => {
    const location = useLocation();

    const isActive = (path: string) => {
        if (activeSpaceId) {
            return SPACES.find(s => s.path === path)?.id === activeSpaceId;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className={cn(
                "w-[72px] bg-slate-900 flex flex-col items-center py-4 border-r border-slate-800",
                className
            )}
        >
            {/* Logo */}
            <Link
                to="/game"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 hover:scale-105 transition-transform"
            >
                <span className="text-white font-bold text-lg">E</span>
            </Link>

            {/* Divider */}
            <div className="w-8 h-px bg-slate-700 mb-4" />

            {/* Spaces */}
            <nav className="flex-1 flex flex-col items-center gap-2">
                {SPACES.map((space) => {
                    const isLocked = unlockStatus[space.id] === false;
                    const active = isActive(space.path);

                    return (
                        <button
                            key={space.id}
                            onClick={() => {
                                if (!isLocked && onSpaceSelect) {
                                    onSpaceSelect(space.id);
                                }
                            }}
                            disabled={isLocked}
                            className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all relative group",
                                isLocked
                                    ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                                    : active
                                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                            )}
                            title={space.label}
                        >
                            {isLocked ? (
                                <Lock className="w-4 h-4" />
                            ) : (
                                space.icon
                            )}

                            {/* Active indicator */}
                            {active && (
                                <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full -translate-x-1/2" />
                            )}

                            {/* Tooltip */}
                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                {space.label}
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* User avatar placeholder */}
            <div className="mt-4 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
            </div>
        </div>
    );
};

export default SpacesRail;
export { SPACES };
export type { SpaceItem };
