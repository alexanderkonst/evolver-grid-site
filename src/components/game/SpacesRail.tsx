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
    Settings,
    Rocket,
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
        label: "MY NEXT MOVE",
        icon: <Compass className="w-5 h-5 flex-shrink-0" />,
        path: "/game/next-move",
    },
    {
        id: "grow",
        label: "ME",
        icon: <User className="w-5 h-5 flex-shrink-0" />,
        path: "/game/me",
    },
    {
        id: "learn",
        label: "LEARN",
        icon: <Sparkles className="w-5 h-5 flex-shrink-0" />,
        path: "/game/learn",
    },
    {
        id: "meet",
        label: "MEET",
        icon: <CalendarDays className="w-5 h-5 flex-shrink-0" />,
        path: "/game/meet",
    },
    {
        id: "collaborate",
        label: "COLLABORATE",
        icon: <Users className="w-5 h-5 flex-shrink-0" />,
        path: "/game/collaborate",
    },
    {
        id: "build",
        label: "BUILD",
        icon: <Rocket className="w-5 h-5 flex-shrink-0" />,
        path: "/game/build",
    },
    {
        id: "buysell",
        label: "BUY & SELL",
        icon: <Store className="w-5 h-5 flex-shrink-0" />,
        path: "/game/marketplace",
    },
];

interface SpacesRailProps {
    activeSpaceId?: string;
    onSpaceSelect?: (spaceId: string) => void;
    unlockStatus?: Record<string, boolean>;
    /** Spaces that have a new unlock waiting (shows badge/glow) */
    nudgeBadges?: string[];
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
    nudgeBadges = [],
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
                // Brandbook: Navigation uses slate palette, Deep Navy for dark mode
                "w-[72px] lg:w-[280px] flex flex-col border-r border-[#a4a3d0]/30",
                "bg-gradient-to-b from-[#1e4374] via-[#1a2f4a] to-[#0e1f35]",
                className
            )}
        >
            {/* User Profile + Community Header */}
            <div className="p-3 md:p-4 border-b border-[#a4a3d0]/30">
                {/* Community - Placeholder (not clickable) */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                            src="/community-avatar.jpg"
                            alt="Community"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="hidden md:block overflow-hidden">
                        <p className="text-white font-semibold text-sm truncate">Alexander Konstantinov's</p>
                        <p className="text-[#a4a3d0] text-xs truncate">Community</p>
                    </div>
                </div>

                {/* Divider between community and profile */}
                <div className="hidden md:block h-px bg-[#a4a3d0]/30 mb-3" />

                {/* User Profile */}
                <Link
                    to="/game/profile"
                    className="flex items-center gap-2 hover:bg-[#29549f]/30 rounded-lg p-1.5 -m-1.5 transition-colors"
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
                        <div className="w-8 h-8 rounded-full bg-[#2c3150] flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-[#a4a3d0]" />
                        </div>
                    )}
                    <div className="hidden md:block overflow-hidden flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{displayName}</p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[#6894d0]">
                                {userLevel ? `Level ${userLevel}` : 'Member'}
                            </span>
                            {userXp !== undefined && (
                                <span className="text-[#a7cbd4]">
                                    {userXp} XP
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
                <div className="flex flex-col items-center gap-1 mt-2 md:hidden">
                    <span className="text-[10px] text-[#6894d0]">
                        {userLevel ? `Level ${userLevel}` : 'Member'}
                    </span>
                    {userXp !== undefined && (
                        <span className="text-[10px] text-[#a7cbd4]">
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
                    const hasNudge = nudgeBadges.includes(space.id);

                    const handleSpaceClick = () => {
                        if (isLocked) return;
                        onSpaceSelect?.(space.id);
                        navigate(space.path);
                    };

                    return (
                        <button
                            key={space.id}
                            data-tour-id={space.id}
                            onClick={handleSpaceClick}
                            disabled={isLocked}
                            className={cn(
                                // Mobile: centered icon, Desktop: icon + label
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                                "justify-center md:justify-start",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6894d0]/50",
                                isLocked
                                    ? "bg-[#1e4374]/40 text-[#6894d0]/50 cursor-not-allowed"
                                    : active
                                        ? space.id === "next-move"
                                            ? "bg-[#29549f] text-white shadow-lg shadow-[#29549f]/40 ring-2 ring-[#6894d0]/60"
                                            : "bg-[#29549f]/80 text-white border-l-2 border-[#a7cbd4] shadow-md"
                                        : hasNudge
                                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                                            : space.id === "next-move"
                                                ? "bg-[#1e4374]/60 text-[#a7cbd4] hover:bg-[#29549f]/60 hover:text-white hover:translate-y-[-1px] ring-1 ring-[#6894d0]/30"
                                                : "bg-[#1e4374]/60 text-[#a7cbd4] hover:bg-[#29549f]/60 hover:text-white hover:translate-y-[-1px] active:translate-y-0"
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

                            {/* Nudge Badge - new unlock indicator */}
                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1e4374] animate-ping" />
                            )}
                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1e4374]" />
                            )}

                            {/* Active indicator */}
                            {active && (
                                <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full -translate-x-1/2" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Settings Button */}
            <div className="p-2 md:p-3 border-t border-[#29549f]/30">
                <button
                    onClick={() => navigate("/game/settings")}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full",
                        "justify-center md:justify-start",
                        "bg-[#1e4374]/40 text-[#a7cbd4] hover:bg-[#29549f]/60 hover:text-white"
                    )}
                    title="Settings"
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:block text-sm font-medium">Settings</span>
                </button>
            </div>
        </div>
    );
};

const areEqual = (prev: SpacesRailProps, next: SpacesRailProps) => {
    if (prev.activeSpaceId !== next.activeSpaceId) return false;
    if (prev.onSpaceSelect !== next.onSpaceSelect) return false;
    if (prev.className !== next.className) return false;
    // Check nudgeBadges
    const prevNudges = prev.nudgeBadges || [];
    const nextNudges = next.nudgeBadges || [];
    if (prevNudges.length !== nextNudges.length) return false;
    for (const badge of prevNudges) {
        if (!nextNudges.includes(badge)) return false;
    }
    // Check unlockStatus
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
