import { ReactNode, memo, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Settings,
    LogOut,
    LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import GlyphIcon from "./GlyphIcon";
// Day 48 (Sasha): brand logo sits at the top of the rail.
// Desktop uses the full orb + wordmark lockup.
// Mobile (rail compressed to 72px) uses the standalone torus image
// — the wordmark would crop off on a 72px column, so a dedicated
// mark-only asset is cleaner.
import brandLogo from "@/assets/find-your-top-talent-logo.png";
import brandMark from "@/assets/find-your-top-talent-torus.png";
// Day 48 iter 7 (Sasha): JOURNEY + ME spaces now render with custom
// image assets (gold-tinted) instead of typographic glyphs — keeps
// them coherent with the gold-signature identity while the other
// five spaces retain their color-coded rainbow glyphs (they're
// locked + colorful-by-design).
import journeyIcon from "@/assets/journey-icon.png";
import meIcon from "@/assets/me-icon.png";

/**
 * ImageIcon — inline <img> used for spaces whose glyph is better
 * expressed as a custom image (JOURNEY + ME). Matches GlyphIcon's
 * 28×28 footprint so it slots into the same grid cell. Optional
 * `glow` adds a warm gold drop-shadow halo around the mark.
 */
const ImageIcon = ({
    src,
    alt,
    glow = false,
}: {
    src: string;
    alt: string;
    glow?: boolean;
}) => (
    <img
        src={src}
        alt={alt}
        aria-hidden="true"
        draggable={false}
        // Day 48 iter 9 (Sasha): `.gentle-spin` applies the shared 60s
        // rotation used for every geometric image site-wide.
        className="flex-shrink-0 select-none object-contain gentle-spin"
        style={{
            width: 28,
            height: 28,
            filter: glow
                ? "drop-shadow(0 0 8px rgba(244, 212, 114, 0.7)) drop-shadow(0 0 2px rgba(212, 175, 55, 0.9))"
                : "drop-shadow(0 0 4px rgba(244, 212, 114, 0.3))",
        }}
    />
);

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
        // Day 48 iter 7 (Sasha): teal ✵ glyph replaced with the custom
        // gold-with-blue-hints journey icon asset. Asset ships with its
        // own warm palette so no extra glow is needed.
        icon: <ImageIcon src={journeyIcon} alt="Journey" />,
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
        // Day 48 iter 7 (Sasha): purple ❂ glyph replaced with the custom
        // ME icon asset. Sasha asked for a warm gold glow around the
        // mark — rendered via drop-shadow on the <img> (see ImageIcon).
        icon: <ImageIcon src={meIcon} alt="Me" glow />,
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
                "w-[72px] lg:w-[280px] flex flex-col relative",
                "liquid-glass",
                className
            )}
            /* Day 48 later (Sasha): Pane 1 pulls --skin-panel-1-bg (marine
               navy in both skins). Day 48 iter 7 (Sasha): the flat 1px
               inset gold line retired in favor of a vertical gradient
               "spine" rendered as an absolute-positioned element below.
               Outer gold glow preserved via boxShadow. */
            style={{
                backgroundColor: "var(--skin-panel-1-bg, rgba(8, 20, 44, 0.86))",
                boxShadow:
                    "3px 0 28px -10px rgba(244, 212, 114, 0.22)",
            }}
        >
            {/* Gold spine — Day 48 iter 7 (Sasha):
                Right-edge accent as a vertical gradient. Strongest in
                the upper-middle (where the eye naturally lands — near
                the active JOURNEY chip), softer at top and bottom so
                the pane reads as a backlit "book spine" rather than a
                flat ruled line. Positioned absolute on the inner
                right edge; pointer-events-none so it never blocks
                interaction. */}
            <span
                aria-hidden="true"
                className="absolute top-0 right-0 h-full w-px pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(180deg, rgba(212, 175, 55, 0) 0%, rgba(212, 175, 55, 0.18) 16%, rgba(244, 212, 114, 0.55) 40%, rgba(212, 175, 55, 0.38) 62%, rgba(212, 175, 55, 0.12) 88%, rgba(212, 175, 55, 0) 100%)",
                }}
            />
            {/* Brand logo — Day 48 (Sasha): back to the original
                left-anchored placement (inside the p-2 md:p-3 padding),
                then -11% size. Desktop: full wordmark fills rail width
                naturally minus 11% via `max-w-[89%]`. Mobile: 32×32
                orb crop kept small. */}
            <div className="p-2 md:p-3">
                <Link
                    to="/"
                    className="block group transition-all hover:opacity-90"
                    aria-label="Find Your Top Talent — home"
                >
                    {/* Mobile: dedicated torus mark, no wordmark — avoids
                        the wordmark-cropping bug on a 72px rail.
                        Day 48 iter 7 (Sasha): torus now carries BOTH a
                        slow 60s rotation and a gentle 6s breath so the
                        rail feels like a living object, not a nav bar. */}
                    <img
                        src={brandMark}
                        alt="Find Your Top Talent"
                        className="md:hidden w-10 h-10 mx-auto object-contain brand-spin-slow"
                        draggable={false}
                    />
                    {/* Desktop: full wordmark — breath only (no rotation,
                        since spinning text reads as broken). The 6s
                        scale pulse adds depth without compromising the
                        wordmark's legibility. */}
                    <img
                        src={brandLogo}
                        alt="Find Your Top Talent"
                        className="hidden md:block h-auto object-contain brand-breath"
                        style={{ width: "89%" }}
                        draggable={false}
                    />
                </Link>
            </div>

            {/* Day 48 iter 8 (Sasha) — chip refinements:
                • gap between chips bumped (gap-1 → gap-1.5) so the
                  active gold halo has room to breathe.
                • rounded-xl → rounded-2xl — matches the CTA-pill radius
                  family, reads as editorial instead of cornery.
                • Labels shift to Cormorant Garamond uppercase with
                  0.14em tracking — same voice as the landing CTA.
                • Active chip gets a faint gold inset tint on the
                  interior so the halo + body bond into one lit object.
                • Hover adds a soft outer gold glow (not just a ring).
                • Lock badge retired — dimmed icon + tooltip hint
                  already communicate locked state; the black disc was
                  reading as Bootstrap debris.
                • Label transition-opacity 500ms → rewards unlock. */}
            <ScrollArea className="flex-1">
              <nav className="flex flex-col gap-1.5 p-2 md:p-3">
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
                                "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 relative group",
                                "justify-center md:justify-start",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
                                isLocked
                                    ? "bg-white/5 text-white/30 cursor-not-allowed"
                                    : active
                                        // Active: gold ring + halo + faint
                                        // gold inset tint on the interior.
                                        ? "text-white ring-1 ring-[#d4af37]/60 shadow-[0_0_22px_-6px_rgba(244,212,114,0.55),0_0_48px_-14px_rgba(212,175,55,0.35)]"
                                        : hasNudge
                                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                                            // Hover: soft outer gold glow
                                            // in addition to the ring.
                                            : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white hover:ring-1 hover:ring-[#d4af37]/30 hover:shadow-[0_0_16px_-4px_rgba(244,212,114,0.28)] hover:translate-y-[-1px] active:translate-y-0"
                            )}
                            style={
                                active
                                    ? {
                                          // Gold inset tint bonds the halo
                                          // to the chip body. Without it,
                                          // the gold ring read as "floating
                                          // outline around white/5," not
                                          // "this chip is lit from within."
                                          backgroundColor: "rgba(212, 175, 55, 0.08)",
                                      }
                                    : undefined
                            }
                            title={isLocked ? (unlockHints[space.id] || `${space.label} — locked`) : space.label}
                        >
                            {/* Icon — lock badge retired (dim + tooltip
                                handles the message cleanly). */}
                            <span className="relative flex-shrink-0">
                                <span
                                    className={cn(
                                        "transition-opacity duration-500",
                                        isLocked && "opacity-30",
                                    )}
                                >
                                    {space.icon}
                                </span>
                            </span>

                            {/* Label — Cormorant Garamond uppercase tracked.
                                Same small-caps treatment as the primary CTA
                                label, so the rail chips rhyme with every
                                CTA across the funnel. */}
                            <span
                                className="hidden md:block truncate transition-opacity duration-500"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: active ? 700 : 600,
                                    fontSize: "0.78rem",
                                    letterSpacing: "0.14em",
                                    textTransform: "uppercase",
                                }}
                            >
                                {space.label}
                            </span>

                            {/* Nudge Badge - new unlock indicator */}
                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/30 animate-ping" />
                            )}
                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/30" />
                            )}

                            {/* Active indicator — gold pip, centered on
                                the chip's vertical midline. */}
                            {active && (
                                <div className="absolute left-0 top-1/2 w-1 h-8 rounded-r-full -translate-x-1/2 -translate-y-1/2 bg-[#d4af37] shadow-[0_0_8px_rgba(244,212,114,0.7)]" />
                            )}
                        </button>
                    );
                })}
            </nav>
            </ScrollArea>

            {/* Footer — Day 47 late pass (Sasha): hard border-t divider removed;
                Settings chip now matches the nav item styling.
                Day 48 iter 8 (Sasha): since Settings is utility (not a space),
                (a) subtle gold hairline rule added above to create clear
                "spaces ↑ / utility ↓" hierarchy; (b) text dropped from
                white/60 → white/45 so the hierarchy is also expressed in
                the chip's own weight. Rule uses a horizontal gradient
                that fades to transparent at both ends — rhymes with the
                ornament bookend on the landing. */}
            <div className="p-2 md:p-3 space-y-1">
                <div
                    aria-hidden="true"
                    className="h-px mx-2 mb-2"
                    style={{
                        backgroundImage:
                            "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.22) 50%, transparent 100%)",
                    }}
                />
                {/* Day 48 iter 9 (Sasha): Settings chip upgraded to match
                    the chip register — rounded-2xl, Cormorant Garamond
                    uppercase tracked. Kept dimmer (white/45) so the
                    "utility ↓ / spaces ↑" hierarchy still reads
                    through weight, not through visual-family mismatch. */}
                <button
                    onClick={() => navigate("/game/settings")}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 w-full",
                        "justify-center md:justify-start",
                        "bg-white/[0.03] text-white/45 hover:bg-white/10 hover:text-white/80 hover:translate-y-[-1px] active:translate-y-0"
                    )}
                    title="Settings"
                >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span
                        className="hidden md:block truncate"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                        }}
                    >
                        Settings
                    </span>
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
