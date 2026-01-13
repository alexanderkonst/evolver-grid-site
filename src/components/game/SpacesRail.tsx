import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
        icon: <Compass className="w-5 h-5 flex-shrink-0" />,
        path: "/game/next-move",
    },
    {
        id: "profile",
        label: "Profile",
        icon: <User className="w-5 h-5 flex-shrink-0" />,
        path: "/game/profile",
    },
    {
        id: "transformation",
        label: "Transformation",
        icon: <Sparkles className="w-5 h-5 flex-shrink-0" />,
        path: "/game/transformation",
    },
    {
        id: "marketplace",
        label: "Marketplace",
        icon: <Store className="w-5 h-5 flex-shrink-0" />,
        path: "/game/marketplace",
    },
    {
        id: "teams",
        label: "Teams",
        icon: <Users className="w-5 h-5 flex-shrink-0" />,
        path: "/game/teams",
    },
    {
        id: "events",
        label: "Events",
        icon: <CalendarDays className="w-5 h-5 flex-shrink-0" />,
        path: "/game/events",
    },
    {
        id: "coop",
        label: "Startup Co-op",
        icon: <Building2 className="w-5 h-5 flex-shrink-0" />,
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
    const navigate = useNavigate();

    const isActive = (path: string) => {
        if (activeSpaceId) {
            return SPACES.find(s => s.path === path)?.id === activeSpaceId;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className={cn(
                // Mobile: narrow with icons only, Desktop: wider with labels
                "w-[72px] md:w-[200px] bg-slate-900 flex flex-col py-4 border-r border-slate-800",
                className
            )}
        >
            {/* Logo */}
            <Link
                to="/game"
                className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center mx-auto md:mx-4 mb-4 hover:scale-105 transition-transform"
            >
                <span className="text-white font-bold text-lg">E</span>
            </Link>

            {/* Divider */}
            <div className="w-8 md:w-auto h-px bg-slate-700 mb-4 mx-auto md:mx-4" />

            {/* Spaces */}
            <nav className="flex-1 flex flex-col gap-1 px-2 md:px-3">
                {SPACES.map((space) => {
                    const isLocked = unlockStatus[space.id] === false;
                    const active = isActive(space.path);

                    const handleSpaceClick = () => {
                        if (isLocked) return;
                        onSpaceSelect?.(space.id);
                        navigate(space.path);
                    };

                    return (
                        <button
                            key={space.id}
                            onClick={handleSpaceClick}
                            disabled={isLocked}
                            className={cn(
                                // Mobile: centered icon, Desktop: icon + label
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative",
                                "justify-center md:justify-start",
                                isLocked
                                    ? "bg-slate-800/40 text-slate-600 cursor-not-allowed"
                                    : active
                                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                                        : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white"
                            )}
                            title={space.label}
                        >
                            {isLocked ? (
                                <Lock className="w-5 h-5 flex-shrink-0" />
                            ) : (
                                space.icon
                            )}

                            {/* Label - hidden on mobile, shown on desktop */}
                            <span className="hidden md:block text-sm font-medium whitespace-nowrap">
                                {space.label}
                            </span>

                            {/* Active indicator */}
                            {active && (
                                <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full -translate-x-1/2" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User avatar placeholder */}
            <div className="mt-4 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mx-auto md:mx-4">
                <User className="w-5 h-5 text-slate-400" />
            </div>
        </div>
    );
};

export default SpacesRail;
export { SPACES };
export type { SpaceItem };

