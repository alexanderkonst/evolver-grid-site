import { ReactNode, memo, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LogOut,
    LogIn,
    MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import GlyphIcon from "./GlyphIcon";
// Day 58+ (Sasha 2026-05-03): custom minimal SoundCloud player. Hides
// the default iframe entirely (waveform / privacy-policy link / SC
// branding gone) and drives playback via the SC Widget JS API. We
// render only a gold play/pause button + a Cormorant track title —
// in-register with the navy/gold rail.
import SoundCloudMinimalPlayer from "@/components/SoundCloudMinimalPlayer";
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
// Day 54 (Sasha 2026-04-28): AI OS elevated from JOURNEY step #4 to its
// own Space. The merkaba — rainbow harmonic geometry inside a circle —
// signals the substrate it is (cognitive scaffold), not a stop on the
// value ladder.
import aiOsIcon from "@/assets/mc-merkaba.png";
// Day 48 iter 10 (Sasha): Settings gear (lucide) replaced with a
// custom gold settings mark. Does NOT rotate — Sasha's explicit note.
import settingsIcon from "@/assets/settings-icon.png";

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
    // Day 48 iter 14 (Sasha): rotation is now applied via INLINE style
    // (in addition to the .gentle-spin class) — the class rule wasn't
    // landing in Sasha's preview. Inline styles bypass the entire
    // cascade and can only be beaten by !important inline, which
    // nothing else sets.
    <img
        src={src}
        alt={alt}
        aria-hidden="true"
        draggable={false}
        // Day 54 (Sasha 2026-04-28): switched from `.gentle-spin` to
        // `.gentle-spin-always` — the rail emblems carry brand identity
        // through their slow rotation; this class re-asserts the spin
        // even when the user has prefers-reduced-motion enabled. See
        // index.css for the full rationale and scope guidance.
        className="flex-shrink-0 select-none object-contain gentle-spin-always"
        style={{
            width: 28,
            height: 28,
            // Day 54+ (Sasha 2026-04-28 evening): glow softened. Was 8px@0.7 +
            // 2px@0.9 — too hot, the icons read as competing with the wordmark.
            // Now 5px@0.4 + 1px@0.55: the gold ring stays present (paired-set
            // identity for JOURNEY · AI OS · ME holds), but the halo no longer
            // dominates the rail.
            filter: glow
                ? "drop-shadow(0 0 5px rgba(244, 212, 114, 0.4)) drop-shadow(0 0 1px rgba(212, 175, 55, 0.55))"
                : "drop-shadow(0 0 4px rgba(244, 212, 114, 0.3))",
            animation: "gentle-spin 60s linear infinite",
            willChange: "transform",
            transformOrigin: "center",
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
        // gold-with-blue-hints journey icon asset.
        // Day 50 (Sasha): warm gold glow now matches ME — the two
        // gold-tinted icons (JOURNEY + ME) read as a paired set.
        icon: <ImageIcon src={journeyIcon} alt="Journey" glow />,
        path: "/game/journey",
    },
    {
        id: "ai-os",
        label: "AI OS",
        // Day 54 (Sasha 2026-04-28): AI OS elevated to its own Space,
        // sitting between JOURNEY and ME — process / substrate / being,
        // the three foundational doors. The merkaba carries the rainbow
        // harmonic geometry already established elsewhere on site; gold
        // glow matches the JOURNEY + ME paired-set treatment so all
        // three foundational icons read as siblings.
        icon: <ImageIcon src={aiOsIcon} alt="AI OS" glow />,
        path: "/ai-os",
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
        // Day 52 (Sasha 2026-04-26): BUILD chip lands on the Unique
        // Business Builder. UBB is the canonical BUILD experience —
        // legacy /game/build/* paths still resolve for back-compat
        // but are no longer the primary destination.
        path: "/ubb",
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
    /**
     * When the parent page renders its OWN full-screen background (e.g. /ai-os
     * with the HLS editorial scene), Pane 1 should not paint a near-opaque navy
     * block over it. Setting this to true switches the rail to a glass-morphic
     * tint that lets the page bg bleed through, matching how Pane 2 already
     * behaves. Day 51 (Sasha 2026-04-25): this fixes the "black column" bug
     * Sasha flagged on /ai-os in the Lovable preview.
     */
    pageOwnsBackground?: boolean;
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
    pageOwnsBackground = false,
    userName,
    userAvatarUrl,
    userLevel,
    userXp,
}: SpacesRailProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Day 54+++ (Sasha 2026-04-28 night): backdrop-filter disabled on touch
    // devices. iOS WebKit's backdrop-filter on a full-viewport-height region
    // (the rail is `h-dvh sticky`) accumulates GPU tile memory over time —
    // the prime suspect for the 15s cumulative OOM that only hit /ai-os
    // (the only route where pageOwnsBackground was true, gating the
    // expensive blur(20px) saturate(140%) filter on this rail). Solid
    // backgroundColor stays; the glass effect is a desktop affordance only.
    const [isTouchDevice] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia?.('(hover: none) and (pointer: coarse)').matches ?? false;
    });

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
                "w-[72px] lg:w-[280px] flex flex-col relative z-30",
                "liquid-glass",
                className
            )}
            /* Day 48 later (Sasha): Pane 1 pulls --skin-panel-1-bg (marine
               navy in both skins). Day 48 iter 7 (Sasha): the flat 1px
               inset gold line retired in favor of a vertical gradient
               "spine" rendered as an absolute-positioned element below.
               Outer gold glow preserved via boxShadow. */
            // Day 51 (Sasha 2026-04-25): Pane 1 bg hardcoded near-solid navy
            // so the animated bg video doesn't bleed through. Mockup pixel-
            // match: Pane 1 solid (brand owns), Pane 2 glass (video shows).
            // border: none — removes liquid-glass's 0.5px white border that
            // was painting a visible line across the top of the viewport.
            //
            // Day 51 r3 (Sasha 2026-04-25 night): rail must STAY VISIBLE on
            // /ai-os. The previous 0.62 + 18px blur dropped the rail
            // ENTIRELY behind the page's z-[1] gradient overlay — Sasha
            // saw both panels "disappear." Two corrections: (a) z-30 on the
            // rail so it always sits above page-owned background overlays
            // (which are z-[1] inside <main>); (b) opacity bumped to 0.86
            // — still glass-morphic enough that the editorial scene
            // breathes through subtly, but solid enough that the brand
            // logo, JOURNEY chip, and labels read clearly against the
            // busy dark scene.
            style={{
                // Day 55 (Sasha 2026-04-29): bumped pageOwnsBackground alpha
                // 0.86 → 0.96 so the rail holds its weight without help
                // from a backdrop-filter (which has been retired entirely
                // — see below).
                backgroundColor: pageOwnsBackground
                    ? "rgba(10, 22, 48, 0.96)"
                    : "rgba(10, 22, 50, 0.98)",
                // Day 55 (Sasha 2026-04-29): backdrop-filter retired entirely
                // (was already off on touch). On Chrome desktop too, the
                // viewport-tall blurred backdrop region was contributing to
                // the "/ai-os panes vanish on scroll" stacking-context bug.
                // Solid bg color does the visual work; the blur effect was
                // imperceptible against the dark page bg anyway.
                border: "none",
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
                orb crop kept small.
                Day 55 (Sasha 2026-04-29): an iter-1/iter-2 attempt to
                drag this lockup onto a shared Y with pane 2 title and
                the top-right rotating logo was reverted. The wordmark
                is a brand lockup (orb + text as one unit, vertically
                self-centered) — forcing it onto the same line as a
                small chip-header title and a navigation icon meant
                deforming pane 2's compact header to compensate, which
                broke that panel's design. Plan B: leave the wordmark
                in its natural editorial position; align ONLY the two
                flexible elements (pane 2 title + top-right logo). */}
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
            {/* Day 48 iter 16 (Sasha): `TooltipProvider` wraps the whole
                nav so any chip can opt into a custom tooltip. Delay 150ms
                so hover feels crisp but not jumpy. `skipDelayDuration=0`
                so moving between adjacent chips doesn't re-flash the
                delay. */}
            <ScrollArea className="flex-1">
              <TooltipProvider delayDuration={150} skipDelayDuration={0}>
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

                    const chipButton = (
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
                                    ? "text-white/30 cursor-not-allowed"
                                    : active
                                        ? "text-white ring-1 ring-[#d4af37]/60 shadow-[0_0_22px_-6px_rgba(244,212,114,0.55),0_0_48px_-14px_rgba(212,175,55,0.35)]"
                                        : hasNudge
                                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                                            : "text-white/55 hover:bg-white/[0.04] hover:text-white/95 hover:ring-1 hover:ring-[#d4af37]/30 hover:shadow-[0_0_16px_-4px_rgba(244,212,114,0.28)] hover:translate-y-[-1px] active:translate-y-0"
                            )}
                            style={
                                active
                                    ? { backgroundColor: "rgba(212, 175, 55, 0.08)" }
                                    : undefined
                            }
                            // Day 48 iter 16: native `title` attribute retired for
                            // locked chips (replaced by the Radix Tooltip below).
                            // Non-locked chips keep the native title as a simple
                            // accessibility fallback for mobile where the label
                            // column is hidden.
                            title={!isLocked ? space.label : undefined}
                            aria-label={isLocked ? (unlockHints[space.id] || `${space.label} — locked`) : space.label}
                        >
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

                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/30 animate-ping" />
                            )}
                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/30" />
                            )}

                            {active && (
                                <div className="absolute left-0 top-1/2 w-1 h-8 rounded-r-full -translate-x-1/2 -translate-y-1/2 bg-[#d4af37] shadow-[0_0_8px_rgba(244,212,114,0.7)]" />
                            )}
                        </button>
                    );

                    // Day 48 iter 16 (Sasha): custom Radix tooltip for locked
                    // chips. Replaces the system `title=` tooltip (ugly black
                    // rectangle, cursor overlap). Premium register: dark glass
                    // pill + gold hairline + Cormorant italic text. Positioned
                    // on the RIGHT of the chip (side="right") so the cursor
                    // (over the chip itself) never covers the message. Small
                    // side-offset so it doesn't touch the rail edge.
                    if (isLocked) {
                        const hint = unlockHints[space.id] || `${space.label} — locked`;
                        return (
                            <Tooltip key={space.id}>
                                <TooltipTrigger asChild>
                                    {chipButton}
                                </TooltipTrigger>
                                <TooltipContent
                                    side="right"
                                    align="center"
                                    sideOffset={12}
                                    className="max-w-[260px] rounded-xl border-none p-0 shadow-none bg-transparent animate-in fade-in-0 zoom-in-95"
                                >
                                    <div
                                        className="liquid-glass-dark rounded-xl px-4 py-3"
                                        style={{
                                            backgroundImage:
                                                "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.88) 50%, rgba(10,22,40,0.92) 100%)",
                                            border: "1px solid rgba(212, 175, 55, 0.35)",
                                            boxShadow:
                                                "0 0 0 1px rgba(212, 175, 55, 0.15), 0 8px 28px -8px rgba(10, 22, 40, 0.6), 0 0 24px -6px rgba(244, 212, 114, 0.25)",
                                        }}
                                    >
                                        <p
                                            className="text-[11px] mb-1"
                                            style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontWeight: 600,
                                                letterSpacing: "0.22em",
                                                textTransform: "uppercase",
                                                color: "#f4d472",
                                                textShadow: "0 0 10px rgba(244, 212, 114, 0.4)",
                                            }}
                                        >
                                            {space.label} · Locked
                                        </p>
                                        <p
                                            className="text-[13px] italic leading-snug"
                                            style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontWeight: 500,
                                                color: "rgba(245, 241, 232, 0.92)",
                                            }}
                                        >
                                            {hint}
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return chipButton;
                })}
                </nav>
              </TooltipProvider>
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
                {/* Day 58+ (Sasha 2026-05-03 → 2026-05-04): SoundCloud
                    playlist — `findyourtoptalent.com`. Sits ABOVE
                    "chat with us" in the utility row when visible.
                    Custom in-register player: gold play/pause +
                    Cormorant title + skip + tiny SC attribution mark.
                    The audio engine lives in SoundCloudPlayerProvider
                    at App root (not in this component) so playback
                    persists across navigation; this component is a
                    thin context consumer.
                    Visibility rules (handled inside the component):
                      • Hidden entirely on non-shell routes (landing /
                        ignite / zone-of-genius funnel / auth) — no
                        stuck-loading state on sales pages, honors the
                        "no music on sales pages" rule visually.
                      • On shell mobile (<md), only the play button
                        renders centered in the 72px icon column;
                        title / skip / attribution glyph are hidden. */}
                <SoundCloudMinimalPlayer />

                {/* Day 51 (Sasha 2026-04-25): Request Guidance — direct
                    Telegram DM to Aleksandr. Zero backend, zero widget.
                    Aligned with Holonic Commons: open access, no SaaS.
                    Slightly warmer opacity (white/55) than Settings to
                    invite contact while staying within utility row. */}
                <a
                    href="https://t.me/integralevolution"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-300 w-full",
                        "justify-center md:justify-start",
                        "text-white/55 hover:bg-white/[0.04] hover:text-white/85 hover:translate-y-[-1px] active:translate-y-0"
                    )}
                    title="Direct message Aleksandr on Telegram"
                >
                    <MessageCircle
                        className="flex-shrink-0"
                        style={{
                            width: 22,
                            height: 22,
                            opacity: 0.8,
                            filter: "drop-shadow(0 0 4px rgba(244, 212, 114, 0.25))",
                        }}
                        aria-hidden="true"
                    />
                    <span
                        className="hidden md:block truncate"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            letterSpacing: "0.06em",
                            textTransform: "lowercase",
                        }}
                    >
                        chat with us
                    </span>
                </a>
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
                        "text-white/45 hover:bg-white/[0.04] hover:text-white/80 hover:translate-y-[-1px] active:translate-y-0"
                    )}
                    title="Settings"
                >
                    {/* Day 48 iter 10 (Sasha): custom gold settings
                        mark in place of the lucide gear. Static — no
                        rotation per Sasha's explicit note. */}
                    <img
                        src={settingsIcon}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        className="flex-shrink-0 select-none object-contain"
                        style={{
                            width: 22,
                            height: 22,
                            filter: "drop-shadow(0 0 4px rgba(244, 212, 114, 0.25))",
                            opacity: 0.75,
                        }}
                    />
                    <span
                        className="hidden md:block truncate"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            letterSpacing: "0.06em",
                            textTransform: "lowercase",
                        }}
                    >
                        settings
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
    if (prev.pageOwnsBackground !== next.pageOwnsBackground) return false;
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
