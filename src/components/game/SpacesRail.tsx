import { ReactNode, memo } from "react";
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
    ChevronDown,
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
        label: "Co-op",
        icon: <Building2 className="w-5 h-5 flex-shrink-0" />,
        path: "/game/coop",
    },
];

interface SpacesRailProps {
    activeSpaceId?: string;
    onSpaceSelect?: (spaceId: string) => void;
    unlockStatus?: Record<string, boolean>;
    className?: string;
    // Optional user data props
    userName?: string;
    userAvatarUrl?: string;
    userLevel?: number;
    userXp?: number;
}

const SpacesRail = ({
    activeSpaceId,
    onSpaceSelect,
    unlockStatus = {},
    className,
    userName,
    userAvatarUrl,
    userLevel,
    userXp,
}: SpacesRailProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        if (activeSpaceId) {
            return SPACES.find(s => s.path === path)?.id === activeSpaceId;
        }
        return location.pathname.startsWith(path);
    };

    const displayName = userName || 'Guest';
    const avatarUrl = userAvatarUrl;


    return (
        <div
            className={cn(
                // Mobile: narrow with icons only, Desktop: wider with labels
                "w-[72px] md:w-[240px] bg-slate-900 flex flex-col border-r border-slate-800",
                className
            )}
        >
            {/* User Profile + Community Header */}
            <div className="p-3 md:p-4 border-b border-slate-800">
                {/* Community */}
                <Link
                    to="/game"
                    className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
                >
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <div className="hidden md:block overflow-hidden">
                        <p className="text-white font-semibold text-sm truncate">Evolver Grid</p>
                        <p className="text-slate-500 text-xs truncate">Community</p>
                    </div>
                    <ChevronDown className="hidden md:block w-4 h-4 text-slate-500 ml-auto flex-shrink-0" />
                </Link>

                {/* Divider between community and profile */}
                <div className="hidden md:block h-px bg-slate-800 mb-3" />

                {/* User Profile */}
                <Link
                    to="/game/profile"
                    className="flex items-center gap-2 hover:bg-slate-800/50 rounded-lg p-1.5 -m-1.5 transition-colors"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                            }}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-slate-400" />
                        </div>
                    )}
                    <div className="hidden md:block overflow-hidden flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{displayName}</p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#8460ea]">
                                {userLevel ? `Lv ${userLevel}` : 'Member'}
                            </span>
                            {userXp !== undefined && (
                                <span className="text-[#a4a3d0]">
                                    {userXp} XP
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
                <div className="flex flex-col items-center gap-1 mt-2 md:hidden">
                    <span className="text-[10px] text-[#8460ea]">
                        {userLevel ? `Lv ${userLevel}` : 'Member'}
                    </span>
                    {userXp !== undefined && (
                        <span className="text-[10px] text-[#a4a3d0]">
                            {userXp} XP
                        </span>
                    )}
                </div>
            </div>

            {/* Spaces Navigation */}
            <nav className="flex-1 flex flex-col gap-1 p-2 md:p-3 overflow-y-auto">
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

                            {/* Label - hidden on mobile, shown on desktop with truncation */}
                            <span className="hidden md:block text-sm font-medium truncate">
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
        </div>
    );
};

const areEqual = (prev: SpacesRailProps, next: SpacesRailProps) => {
    if (prev.activeSpaceId !== next.activeSpaceId) return false;
    if (prev.onSpaceSelect !== next.onSpaceSelect) return false;
    if (prev.className !== next.className) return false;
    const prevKeys = Object.keys(prev.unlockStatus || {});
    const nextKeys = Object.keys(next.unlockStatus || {});
    if (prevKeys.length !== nextKeys.length) return false;
    for (const key of prevKeys) {
        if (prev.unlockStatus?.[key] !== next.unlockStatus?.[key]) return false;
    }
    return true;
};

export default memo(SpacesRail, areEqual);
export { SPACES };
export type { SpaceItem };
