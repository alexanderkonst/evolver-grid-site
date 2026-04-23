import { ReactNode, memo, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Lock,
    Settings,
    LogOut,
    LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GlyphIcon from "./GlyphIcon";
// Day 48 (Sasha): brand logo (orb + "FIND YOUR TOP TALENT" wordmark)
// now sits at the top of the rail, replacing the avatar + stacked
// text lockup. Single asset, renders at native aspect ratio.
import brandLogo from "@/assets/find-your-top-talent-logo.png";

interface SpaceItem {
    id: string;
    label: string;
    icon: ReactNode;
    path: string;
}

// Sasha's chosen glyphs (2026-04-21, v2):
//   JOURNEY     ✵
//   ME          ❂
//   LEARN       ✹
//   MEET        ⚭
//   COLLABORATE ⇶
//   BUILD       ⬢
//   OFFER       ⚛
const SPACES: SpaceItem[] = [
    {
        id: "journey",
        label: "JOURNEY",
        icon: <GlyphIcon glyph="✵" color="hsl(175, 80%, 60%)" />,
        path: "/game/journey",
    },
    // Hidden until built — uncomment to re-enable
    // {
    //     id: "next-move",
    //     label: "MY NEXT MOVE",
    //     icon: <GlyphIcon glyph="⟡" color="hsl(210, 75%, 65%)" />,
    //     path: "/game/next-move",
    // },
    {
        id: "grow",
        label: "ME",
        icon: <GlyphIcon glyph="❂" color="hsl(265, 70%, 72%)" />,
        path: "/game/me",
    },
    {
        id: "learn",
        label: "LEARN",
        icon: <GlyphIcon glyph="✹" color="hsl(210, 75%, 68%)" />,
        path: "/game/learn",
    },
    {
        id: "meet",
        label: "MEET",
        icon: <GlyphIcon glyph="⚭" color="hsl(145, 65%, 60%)" />,
        path: "/game/meet",
    },
    {
        id: "collaborate",
        label: "COLLABORATE",
        icon: <GlyphIcon glyph="⇶" color="hsl(325, 65%, 65%)" />,
        path: "/game/collaborate",
    },
    {
        id: "build",
        label: "BUILD",
        icon: <GlyphIcon glyph="⬢" color="hsl(45, 90%, 62%)" />,
        path: "/game/build",
    },
    {
        id: "buysell",
        label: "OFFER",
        icon: <GlyphIcon glyph="⚛" color="hsl(15, 85%, 65%)" />,
        path: "/game/marketplace",
    },
];

interface SpacesRailProps {
    activeSpaceId?: string;
    onSpaceSelect?: (spaceId: string) => void;
    unlockStatus?: Record<string, boolean>;
    /** Tooltip hints for locked spaces — e.g. "Unlocks after Step 1" */
    unlockHints?: Record<string, string>;
    /** Spaces that have a new unlock waiting (shows badge/glow) */
    nudgeBadges?: string[];
    /** Spaces to completely hide from the rail (gradual reveal) */
    hiddenSpaces?: string[];
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
    unlockHints = {},
    nudgeBadges = [],
    hiddenSpaces = [],
    className,
    userName,
    userAvatarUrl,
    userLevel,
    userXp,
}: SpacesRailProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Track live auth state so the Log In / Log Out button reflects reality
    // regardless of what props the parent happens to pass in.
    const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
    useEffect(() => {
        let cancelled = false;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!cancelled) setIsAuthed(!!session?.user);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthed(!!session?.user);
        });
        return () => {
            cancelled = true;
            listener.subscription.unsubscribe();
        };
    }, []);

    const isActive = (path: string) => {
        if (activeSpaceId) {
            return SPACES.find(s => s.path === path)?.id === activeSpaceId;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className={cn(
                "w-[72px] lg:w-[280px] flex flex-col",
                "liquid-glass",
                className
            )}
            /* Day 48 later (Sasha): Pane 1 pulls --skin-panel-1-bg (marine
               navy in both skins) + a warm gold right-edge glow so the
               seam between rail and content reads like the mockup. */
            style={{
                backgroundColor: "var(--skin-panel-1-bg, rgba(8, 20, 44, 0.86))",
                boxShadow:
                    "inset -1px 0 0 rgba(212, 175, 55, 0.22), 3px 0 24px -10px rgba(244, 212, 114, 0.18)",
            }}
        >
            {/* Brand logo — Day 48 (Sasha, later): centered in the rail
                with a harmonized max-width (148px) so it sits as a
                visual centerpiece rather than a left-anchored slab.
                Mobile keeps the 32×32 orb crop for the 72px rail. */}
            <div className="px-3 pt-4 pb-2">
                <Link
                    to="/"
                    className="block group transition-all hover:opacity-90"
                    aria-label="Find Your Top Talent — home"
                >
                    {/* Mobile: square orb crop from the left of the image. */}
                    <div
                        className="md:hidden w-8 h-8 mx-auto overflow-hidden"
                        style={{
                            backgroundImage: `url(${brandLogo})`,
                            backgroundSize: "auto 100%",
                            backgroundPosition: "left center",
                            backgroundRepeat: "no-repeat",
                        }}
                        aria-hidden="true"
                    />
                    {/* Desktop: full logo (orb + wordmark), centered. */}
                    <img
                        src={brandLogo}
                        alt="Find Your Top Talent"
                        className="hidden md:block h-auto object-contain mx-auto"
                        style={{ width: "100%", maxWidth: "148px" }}
                        draggable={false}
                    />
                </Link>
            </div>

            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-1 p-2 md:p-3">
                {SPACES.filter(space => !hiddenSpaces.includes(space.id)).map((space) => {
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
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
                                isLocked
                                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                                    : active
                                        // Day 48 (Sasha): active chip gains a gold ring + gold
                                        // halo, matching the mockup's warm-metal accent on the
                                        // marine rail. Text bumps to cream-white so it reads
                                        // against the gold frame.
                                        ? "bg-white/5 text-white ring-1 ring-[#d4af37]/55 shadow-[0_0_22px_-6px_rgba(244,212,114,0.55),0_0_48px_-14px_rgba(212,175,55,0.35)]"
                                        : hasNudge
                                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:ring-1 hover:ring-[#d4af37]/25 hover:translate-y-[-1px] active:translate-y-0"
                            )}
                            title={isLocked ? (unlockHints[space.id] || `${space.label} — locked`) : space.label}
                        >
                            {/* Icon — always show the space's own icon, dim when locked */}
                            <span className="relative flex-shrink-0">
                                <span className={cn(isLocked && "opacity-30")}>
                                    {space.icon}
                                </span>
                                {isLocked && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-black/60 rounded-full flex items-center justify-center border border-white/10">
                                        <Lock className="w-2 h-2 text-white/40" />
                                    </span>
                                )}
                            </span>

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

                            {/* Active indicator — gold pip, centered on the
                                chip's vertical midline. Day 48 (Sasha) fix:
                                without `top-1/2 -translate-y-1/2` the pip
                                defaulted to top:0 and cut through the chip's
                                top-left corner — visible as a "glow glitch". */}
                            {active && (
                                <div className="absolute left-0 top-1/2 w-1 h-8 rounded-r-full -translate-x-1/2 -translate-y-1/2 bg-[#d4af37] shadow-[0_0_8px_rgba(244,212,114,0.7)]" />
                            )}
                        </button>
                    );
                })}
            </nav>
            </ScrollArea>

            {/* Footer — Day 47 late pass (Sasha): hard border-t divider removed;
                Settings chip now matches the nav item styling (same padding,
                same rounded-xl, same bg treatment) so the rail reads as one
                continuous column rather than "nav above / footer below". */}
            <div className="p-2 md:p-3 space-y-1">
                <button
                    onClick={() => navigate("/game/settings")}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all w-full",
                        "justify-center md:justify-start",
                        "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:translate-y-[-1px] active:translate-y-0"
                    )}
                    title="Settings"
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden md:block text-sm font-medium">Settings</span>
                </button>
                {(() => {
                    // Hide Log In on pages that are part of the unauthenticated
                    // funnel (landing + ZoG reveal + playbook + path + settings)
                    // so visitors don't get pulled out of the flow. Log Out
                    // stays visible everywhere for authenticated users.
                    // Day 48 (Sasha): /game/settings added — guests can tour
                    // Appearance without a Log In nag.
                    const isLandingPage =
                        location.pathname === "/" ||
                        location.pathname.startsWith("/game/journey") ||
                        location.pathname.startsWith("/zone-of-genius") ||
                        location.pathname.startsWith("/playbook") ||
                        location.pathname === "/path" ||
                        location.pathname === "/game/settings";

                    if (isAuthed === null) {
                        // Initial auth check — placeholder prevents rail jump.
                        return <div className="h-[32px]" aria-hidden="true" />;
                    }
                    if (isAuthed) {
                        return (
                            <button
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    toast({
                                        title: "You're logged out",
                                        description: "See you when you're back.",
                                    });
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
                        );
                    }
                    // Unauthenticated + on landing → hide entirely (don't divert from the funnel).
                    if (isLandingPage) {
                        return null;
                    }
                    // Unauthenticated + elsewhere → Log In is useful navigation.
                    return (
                        <button
                            onClick={() => navigate("/auth")}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full",
                                "justify-center md:justify-start",
                                "text-white/60 hover:bg-white/10 hover:text-white"
                            )}
                            title="Log In"
                        >
                            <LogIn className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden md:block text-xs font-medium">Log In</span>
                        </button>
                    );
                })()}
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
    // Check unlockHints
    const prevHintKeys = Object.keys(prev.unlockHints || {});
    const nextHintKeys = Object.keys(next.unlockHints || {});
    if (prevHintKeys.length !== nextHintKeys.length) return false;
    for (const key of prevHintKeys) {
        if (prev.unlockHints?.[key] !== next.unlockHints?.[key]) return false;
    }
    // Check hiddenSpaces
    const prevHidden = prev.hiddenSpaces || [];
    const nextHidden = next.hiddenSpaces || [];
    if (prevHidden.length !== nextHidden.length) return false;
    for (const h of prevHidden) {
        if (!nextHidden.includes(h)) return false;
    }
    return true;
};

export default memo(SpacesRail, areEqual);
export { SPACES };
export type { SpaceItem };
