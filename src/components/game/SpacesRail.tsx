import { ReactNode, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation, useNavigate } from "react-router-dom";
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
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
        label: "OFFER",
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
                "w-[72px] lg:w-[280px] flex flex-col border-r border-white/10",
                "liquid-glass bg-black/50",
                className
            )}
        >
            {/* User Profile */}
            <div className="p-2 md:p-3">
                <Link
                    to="/game/me"
                    className="flex items-center gap-2 hover:bg-white/10 rounded-lg p-1.5 -m-1.5 transition-colors"
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
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white/50" />
                        </div>
                    )}
                    <div className="hidden md:block overflow-hidden flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{displayName}</p>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-white/50">
                                {userLevel ? `Level ${userLevel}` : 'Member'}
                            </span>
                            {userXp !== undefined && (
                                <span className="text-white/30">
                                    {userXp} XP
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
                <div className="flex flex-col items-center gap-1 mt-2 md:hidden">
                    <span className="text-[10px] text-white/50">
                        {userLevel ? `Level ${userLevel}` : 'Member'}
                    </span>
                    {userXp !== undefined && (
                        <span className="text-[10px] text-white/30">
                            {userXp} XP
                        </span>
                    )}
                </div>
            </div>

            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-1 p-2 md:p-3">
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
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group",
                                "justify-center md:justify-start",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
                                isLocked
                                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                                    : active
                                        ? "liquid-glass-strong text-white shadow-lg shadow-white/10 ring-1 ring-white/20"
                                        : hasNudge
                                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:translate-y-[-1px] active:translate-y-0"
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
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/30 animate-ping" />
                            )}
                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/30" />
                            )}

                            {/* Active indicator */}
                            {active && (
                                <div className="absolute left-0 w-1 h-8 bg-white rounded-r-full -translate-x-1/2" />
                            )}
                        </button>
                    );
                })}
            </nav>
            </ScrollArea>

            {/* Settings Button */}
            <div className="p-2 md:p-3 border-t border-white/10 space-y-1">
                <button
                    onClick={() => navigate("/game/settings")}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full",
                        "justify-center md:justify-start",
                        "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                    )}
                    title="Settings"
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:block text-sm font-medium">Settings</span>
                </button>
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        navigate("/");
                    }}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full",
                        "justify-center md:justify-start",
                        "text-white/30 hover:bg-red-500/20 hover:text-red-300"
                    )}
                    title="Log Out"
                >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden md:block text-xs font-medium">Log Out</span>
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
