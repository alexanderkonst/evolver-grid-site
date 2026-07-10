import { ReactNode, memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    LogOut,
    LogIn,
    MessageCircle,
    Moon,
    Sun,
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
import { useSkin } from "@/contexts/SkinContext";
// White-label demo (2026-05-19, Sasha): when skin is `network-school`,
// the rail brand mark swaps to the official NS flag asset hosted on
// ns-assets.com. Sasha provided the URL directly — no local copy.
const NS_LOGO_URL = "https://ns-assets.com/auth-privy/network-school-black-flag-white-background-privy.png";

// Day 84 v3 (Sasha 2026-05-25): LATAM Impact official lockup + mark
// assets. Retired the V2 inline SVG placeholder — the brand has its
// own composed lockup and we use it as shipped. Desktop rail uses
// the full lockup (pyramid + LATAM IMPACT wordmark). Mobile pill
// uses the pyramid-only mark. Both PNGs ship with a forest-green
// background baked in — sits on the daouniverse pane-1 forest bg
// without visible seam.
import latamLockup from "@/assets/latam-impact-lockup.png";
import latamPyramid from "@/assets/latam-impact-pyramid.png";
// Day 84 (Sasha 2026-05-25): Planetir white-label brand asset. Single
// horizontal lockup (olive shield + "Planetir" wordmark, transparent bg
// via Adobe Express). Used at both desktop rail and mobile pill — the
// lockup is small enough horizontally to read on the 72px column.
import planetirLogo from "@/assets/planetir-logo.png";
import techstarsLogo from "@/assets/techstars-logo.png";
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
    size = 28,
}: {
    src: string;
    alt: string;
    glow?: boolean;
    /** Override the default 28×28 footprint. Used by AI OS to render
        slightly smaller (Sasha 2026-05-19) — the merkaba mark fills
        its box more aggressively than the JOURNEY star / ME crystal,
        which made it read as larger in the rail row. */
    size?: number;
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
            width: size,
            height: size,
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
    labelKey: string;
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
        labelKey: "spacesRail.journey",
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
        labelKey: "spacesRail.aiOs",
        // Day 54 (Sasha 2026-04-28): AI OS elevated to its own Space,
        // sitting between JOURNEY and ME — process / substrate / being,
        // the three foundational doors. The merkaba carries the rainbow
        // harmonic geometry already established elsewhere on site; gold
        // glow matches the JOURNEY + ME paired-set treatment so all
        // three foundational icons read as siblings.
        icon: <ImageIcon src={aiOsIcon} alt="AI OS" glow size={22} />,
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
        labelKey: "spacesRail.me",
        // Day 48 iter 7 (Sasha): purple ❂ glyph replaced with the custom
        // ME icon asset. Sasha asked for a warm gold glow around the
        // mark — rendered via drop-shadow on the <img> (see ImageIcon).
        icon: <ImageIcon src={meIcon} alt="Me" glow />,
        path: "/game/me",
    },
    {
        id: "meet",
        label: "MEET",
        labelKey: "spacesRail.meet",
        icon: <GlyphIcon glyph="⚭" color="hsl(145, 65%, 60%)" />,
        path: "/game/meet",
    },
    {
        // Day 65 (Sasha 2026-05-09): COLLABORATE chip now routes
        // directly to the matches surface (was: /game/collaborate, the
        // TeamsSpace landing — a separate page that overlapped with
        // /game/collaborate/matches and confused users). The COLLABORATE
        // value proposition IS the matches; the landing was a stale
        // intermediate. /game/collaborate route also redirects to the
        // matches surface as a safety net (see App.tsx).
        id: "collaborate",
        label: "COLLABORATE",
        labelKey: "spacesRail.collaborate",
        icon: <GlyphIcon glyph="⇶" color="hsl(325, 65%, 65%)" />,
        path: "/game/collaborate/matches",
    },
    {
        // Day 119 (Sasha 2026-07-09): GROW space enabled — was LEARN,
        // sat between ME and MEET, gated behind LEARN_VISIBLE (off).
        // Repositioned between COLLABORATE and BUILD, relabeled GROW,
        // re-gated to unlock together with COLLABORATE/BUILD (T+M+A
        // complete). Internal id stays "learn" — routes, GATED_SPACES,
        // SectionsPanel keys, etc. all key off it; only label/position/
        // gate changed. See GameShellV2.tsx unlockStatus["learn"].
        id: "learn",
        label: "GROW",
        labelKey: "spacesRail.grow",
        icon: <GlyphIcon glyph="✹" color="hsl(210, 75%, 68%)" />,
        path: "/game/learn",
    },
    {
        id: "build",
        label: "BUILD",
        labelKey: "spacesRail.build",
        icon: <GlyphIcon glyph="⬢" color="hsl(45, 90%, 62%)" size={32} />,
        // Day 52 (Sasha 2026-04-26): BUILD chip lands on the Unique
        // Business Builder. UBB is the canonical BUILD experience —
        // legacy /game/build/* paths still resolve for back-compat
        // but are no longer the primary destination.
        path: "/ubb",
    },
    {
        id: "buysell",
        label: "OFFER",
        labelKey: "spacesRail.offer",
        icon: <GlyphIcon glyph="⚛" color="hsl(15, 85%, 65%)" />,
        path: "/game/marketplace",
    },
];

interface SpacesRailProps {
    activeSpaceId?: string;
    onSpaceSelect?: (spaceId: string) => void;
    unlockStatus?: Record<string, boolean>;
    /**
     * Day 82 v4 (Sasha 2026-05-24): when true, the rail collapses to the
     * mobile-equivalent slim icon-only width on desktop (overriding the
     * lg:w-[280px] expansion) and hides all md:block labels via a
     * data-rail-compact attribute + matching CSS rule in index.css.
     */
    compact?: boolean;
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
    compact: compactRequested = false,
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
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { skin, setSkin } = useSkin();
    const isNS = skin === "network-school";
    const isDao = skin === "daouniverse";
    const isPlanetir = skin === "planetir";
    const isTechstars = skin === "techstars";

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

    // Day 119 (Sasha 2026-07-09): label fade on minimize/expand. The rail
    // width animates over 200ms (transition-[width] from GameShellV2), but
    // labels used to unmount instantly — a visual pop. Two-phase switch:
    //   COLLAPSE: compactRequested flips true → labels fade to opacity-0
    //     (150ms) while the rail narrows; after 200ms the layout flips to
    //     the compact 48px-cell grid (labels unmount).
    //   EXPAND: layout flips back to rows immediately (labels mount at
    //     opacity-0), then fade in on the next tick.
    // `compact` below aliases the DELAYED layout state so every existing
    // compact-layout branch switches in sync; width + data-rail-compact
    // stay on compactRequested (immediate) so the CSS width transition and
    // the kept attribute-scoped rules track the user's intent frame-one.
    const [compactLayout, setCompactLayout] = useState(compactRequested);
    const [labelsVisible, setLabelsVisible] = useState(!compactRequested);
    useEffect(() => {
        if (compactRequested) {
            setLabelsVisible(false);
            const id = window.setTimeout(() => setCompactLayout(true), 200);
            return () => window.clearTimeout(id);
        }
        setCompactLayout(false);
        const id = window.setTimeout(() => setLabelsVisible(true), 20);
        return () => window.clearTimeout(id);
    }, [compactRequested]);
    const compact = compactLayout;

    const isActive = (path: string) => {
        if (activeSpaceId) {
            return SPACES.find(s => s.path === path)?.id === activeSpaceId;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div
            data-rail-compact={compactRequested ? "true" : undefined}
            className={cn(
                compactRequested ? "w-[72px] flex flex-col relative z-30" : "w-[72px] lg:w-[280px] flex flex-col relative z-30",
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
                    ? "var(--skin-panel-1-bg, rgba(10, 22, 48, 0.96))"
                    : "var(--skin-panel-1-bg, rgba(10, 22, 50, 0.98))",
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
            {/* V4 (Sasha 2026-05-19): logo wrapper padding reduced from
                p-2/md:p-3 → p-1/md:p-1.5 to tighten vertical space
                before the SPACES nav starts. Applies platform-wide
                because Sasha asked for the change "not only in the
                skin but also in the platform itself." */}
            {/* Day 119 (Sasha 2026-07-09): compact mode made first-class —
                single centered 48px cell axis, replacing the index.css
                !important patch layer. The brand logo, every nav chip, and
                every utility-row item now share one `w-[48px] h-[48px]
                mx-auto grid place-items-center` cell when `compact` is true,
                instead of relying on ~150 lines of
                `[data-rail-compact="true"]` selectors to force each icon's
                different box model into alignment after the fact.
                Day 119 v2 (Sasha 2026-07-09): compact cells sized in
                absolute px, not rem — user browser font-size settings
                (Sasha runs 24px root) inflated 3rem cells to 72px inside
                the fixed 72px rail. */}
            <div className={compact ? "p-[6px]" : "p-1 md:p-1.5"}>
                <Link
                    to="/"
                    className={cn(
                        "block group transition-all hover:opacity-90",
                        compact && "grid place-items-center w-[48px] h-[48px] mx-auto p-0"
                    )}
                    aria-label={isNS ? "Network School home" : isDao ? "LATAM Impact home" : isPlanetir ? "Planetir home" : isTechstars ? "Techstars home" : "Find Your Top Talent home"}
                >
                    {isTechstars ? (
                        <>
                            {/* Day 91 (Sasha 2026-06-08): Techstars wordmark
                                (white wordmark + green underscore, designed for
                                dark surfaces). Mobile (72px column): crops to a
                                centered narrow band that still reads as the
                                star + first letter of the wordmark. Desktop:
                                full wordmark. */}
                            <div className="md:hidden flex items-center justify-center px-3 py-2.5">
                                <img
                                    src={techstarsLogo}
                                    alt="Techstars"
                                    className="h-7 w-auto object-contain object-left flex-shrink-0"
                                    style={{ maxWidth: "48px" }}
                                    draggable={false}
                                />
                            </div>
                            <div className="hidden md:flex items-center justify-start px-3 py-2.5">
                                <img
                                    src={techstarsLogo}
                                    alt="Techstars"
                                    className="h-7 w-auto object-contain flex-shrink-0"
                                    draggable={false}
                                />
                            </div>
                        </>
                    ) : isPlanetir ? (
                        <>
                            {/* Day 84 (Sasha 2026-05-25): Planetir lockup
                                (olive shield + wordmark, transparent bg).
                                Mobile (72px) crops to icon-only via object
                                positioning; desktop shows full lockup. */}
                            <div className="md:hidden flex items-center justify-center px-3 py-2.5">
                                <img
                                    src={planetirLogo}
                                    alt="Planetir"
                                    className="h-9 w-auto object-contain object-left flex-shrink-0"
                                    style={{ maxWidth: "40px" }}
                                    draggable={false}
                                />
                            </div>
                            <div className="hidden md:flex items-center justify-start px-3 py-2.5">
                                <img
                                    src={planetirLogo}
                                    alt="Planetir"
                                    className="h-10 w-auto object-contain flex-shrink-0"
                                    draggable={false}
                                />
                            </div>
                        </>
                    ) : isDao ? (
                        <>
                            {/* Day 84 v3 (Sasha 2026-05-25): LATAM Impact
                                official brand assets, sourced directly from
                                the LATAM Impact brand sheet. Mobile (72px
                                column constraint): pyramid-only mark.
                                Desktop: full lockup (pyramid + wordmark
                                composed by the brand). No inline wordmark
                                rendering — the lockup already carries it,
                                avoiding font-family mismatch with the canonical
                                LATAM Impact wordmark. */}
                            <div className="md:hidden flex items-center justify-center px-3 py-2.5">
                                <img
                                    src={latamPyramid}
                                    alt="LATAM Impact"
                                    className="w-10 h-10 object-contain flex-shrink-0"
                                    draggable={false}
                                />
                            </div>
                            <div className="hidden md:flex items-center justify-start px-3 py-2.5">
                                <img
                                    src={latamLockup}
                                    alt="LATAM Impact"
                                    className="h-12 w-auto object-contain flex-shrink-0"
                                    draggable={false}
                                />
                            </div>
                        </>
                    ) : isNS ? (
                        <>
                            {/* V6 (Sasha 2026-05-19): reverted to the actual
                                NS PNG asset (the "wavy" black flag from
                                ns-assets.com) per Sasha — the inline SVG was
                                a simple square + cross which doesn't carry
                                NS's actual brand mark. The PNG ships with the
                                aspect/curvature of NS's real flag.

                                Also restructured to reuse the SAME flex
                                layout as the SPACES chip buttons below
                                (`flex items-center gap-3 px-3 py-2.5`) so
                                the flag's center auto-aligns with the
                                JOURNEY/AI OS/ME/BUILD icon column — no
                                hand-tuned padding required. */}
                            <div className="md:hidden flex items-center justify-center px-3 py-2.5">
                                <img
                                    src={NS_LOGO_URL}
                                    alt="Network School"
                                    className="w-9 h-9 object-contain flex-shrink-0"
                                    draggable={false}
                                />
                            </div>
                            {/* V7 (Sasha 2026-05-19): flag bumped w-7 → w-8 (28 → 32px).
                                Sasha called the v6 28px "a bit smaller than I want." 32px
                                matches BUILD's GlyphIcon size and sits at the upper end of
                                the chip-icon visual weight range (22–32). */}
                            <div className="hidden md:flex items-center gap-3 px-3 py-2.5">
                                <img
                                    src={NS_LOGO_URL}
                                    alt="Network School"
                                    className="w-8 h-8 object-contain flex-shrink-0"
                                    draggable={false}
                                />
                                <span
                                    className="select-none truncate"
                                    style={{
                                        fontFamily: '"Newsreader", "Source Serif Pro", Georgia, serif',
                                        fontWeight: 600,
                                        fontSize: "26px",
                                        lineHeight: 1,
                                        color: "#0a0a0a",
                                        letterSpacing: "-0.015em",
                                    }}
                                >
                                    ns.com
                                </span>
                            </div>
                        </>
                    ) : compact ? (
                        /* Day 119 (Sasha 2026-07-09): compact mode shows the
                           torus mark at every viewport width (was previously
                           forced via a CSS override toggling img.md:hidden's
                           `display` back on). 28px icon, centered in the 48px
                           cell above. Halo kept via the drop-shadow filter
                           (previously a Karime-scoped CSS rule targeting this
                           same img). */
                        <img
                            src={brandMark}
                            alt="Find Your Top Talent"
                            className="w-7 h-7 object-contain brand-spin-slow"
                            draggable={false}
                            style={{
                                filter:
                                    "drop-shadow(0 0 8px rgba(244, 212, 114, 0.55)) drop-shadow(0 0 14px rgba(212, 175, 55, 0.32)) drop-shadow(0 0 1px rgba(122, 81, 8, 0.45))",
                            }}
                        />
                    ) : (
                        <>
                            {/* Mobile: torus mark, slow rotation + breath. */}
                            <img
                                src={brandMark}
                                alt="Find Your Top Talent"
                                className="md:hidden w-10 h-10 mx-auto object-contain brand-spin-slow"
                                draggable={false}
                            />
                            {/* Desktop: full wordmark — breath only. */}
                            <img
                                src={brandLogo}
                                alt="Find Your Top Talent"
                                className="hidden md:block h-auto object-contain brand-breath"
                                style={{ width: "89%", marginLeft: "8px" }}
                                draggable={false}
                            />
                        </>
                    )}
                </Link>
            </div>

            {/* V6 (Sasha 2026-05-19): horizontal hairline separating the
                logo block from the SPACES nav. Mirrors the existing rule
                above the music player so the rail reads as three sections
                top-to-bottom: brand → spaces → utility. Skin-aware via
                the gold-by-default / neutral-on-NS color token. */}
            <div
                aria-hidden="true"
                className="h-px mx-2 mb-1"
                style={{
                    backgroundImage:
                        "linear-gradient(90deg, transparent 0%, var(--skin-rule-medium, rgba(212, 175, 55, 0.22)) 50%, transparent 100%)",
                }}
            />

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
                <nav className={compact ? "flex flex-col gap-[8px] p-[8px]" : "flex flex-col gap-1.5 p-2 md:p-3"}>
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
                                "transition-all duration-300 relative group",
                                compact
                                    ? "grid place-items-center w-[48px] h-[48px] mx-auto rounded-full p-0"
                                    : "flex items-center gap-3 px-3 py-2.5 rounded-2xl justify-center md:justify-start",
                                // Day 119 (Sasha 2026-07-09): during the 200ms
                                // collapse fade (width already narrowing, layout
                                // still row) clip the fading label instead of
                                // letting it spill over the pane edge.
                                compactRequested && !compact && "overflow-hidden",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
                                isLocked
                                    ? "text-white/30 cursor-not-allowed"
                                    : active
                                        // Day 119 (Sasha 2026-07-09): in compact, the
                                        // 22-48px glow radius bled past the 72px pane's
                                        // right edge (48px cell + 12px margin leaves no
                                        // room). Tighter contained glow; same gold ring.
                                        ? compact
                                            ? "text-white ring-1 ring-[#d4af37]/60 shadow-[0_0_10px_-2px_rgba(244,212,114,0.5)]"
                                            : "text-white ring-1 ring-[#d4af37]/60 shadow-[0_0_22px_-6px_rgba(244,212,114,0.55),0_0_48px_-14px_rgba(212,175,55,0.35)]"
                                        : hasNudge
                                            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300 ring-1 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse"
                                            : "text-white/55 hover:bg-white/[0.04] hover:text-white/95 hover:ring-1 hover:ring-[#d4af37]/30 hover:shadow-[0_0_16px_-4px_rgba(244,212,114,0.28)] hover:translate-y-[-1px] active:translate-y-0"
                            )}
                            style={
                                active
                                    ? { backgroundColor: "var(--skin-selected-bg, rgba(212, 175, 55, 0.08))" }
                                    : undefined
                            }
                            // Day 48 iter 16: native `title` attribute retired for
                            // locked chips (replaced by the Radix Tooltip below).
                            // Non-locked chips keep the native title as a simple
                            // accessibility fallback for mobile where the label
                            // column is hidden.
                            // Day 119 (Sasha 2026-07-09): also dropped in compact
                            // — the Radix label tooltip below covers it, and the
                            // native one would double up.
                            title={!isLocked && !compact ? t(space.labelKey) : undefined}
                            aria-label={isLocked ? (unlockHints[space.id] || t('spacesRail.lockedLabel', { space: t(space.labelKey) })) : t(space.labelKey)}
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

                            {!compact && (
                                <span
                                    // Day 119 (Sasha 2026-07-09): fade with the
                                    // rail width transition instead of popping.
                                    className={cn(
                                        "hidden md:block truncate transition-opacity duration-150",
                                        labelsVisible ? "opacity-100" : "opacity-0"
                                    )}
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: active ? 700 : 600,
                                        fontSize: "0.78rem",
                                        letterSpacing: "0.14em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {t(space.labelKey)}
                                </span>
                            )}

                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/30 animate-ping" />
                            )}
                            {hasNudge && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black/30" />
                            )}

                            {/* Day 119 (Sasha 2026-07-09): active-state gold pip
                                hidden in compact — its left-edge positioning
                                overflowed the slim 72px column (previously
                                hidden via a CSS override). The chip's own gold
                                ring on active state is enough indicator. */}
                            {active && !compact && (
                                <div className="absolute left-0 top-1/2 w-1 h-8 rounded-r-full translate-x-0 md:-translate-x-1/2 -translate-y-1/2 bg-[#d4af37] shadow-[0_0_8px_rgba(244,212,114,0.7)]" />
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
                        const hint = unlockHints[space.id] || t('spacesRail.lockedLabel', { space: t(space.labelKey) });
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
                                            {t('spacesRail.lockedHeader', { space: t(space.labelKey) })}
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

                    // Day 119 (Sasha 2026-07-09): compact-mode label tooltip
                    // for UNLOCKED chips. In compact the visible label is
                    // gone, so hovering a chip shows its name in the same
                    // premium register as the locked-chip tooltip above
                    // (dark glass pill + gold hairline + Cormorant), just
                    // without the unlock-hint line. Non-compact keeps the
                    // visible label + native title, no Radix tooltip.
                    if (compact) {
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
                                        className="liquid-glass-dark rounded-xl px-4 py-2.5"
                                        style={{
                                            backgroundImage:
                                                "linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.88) 50%, rgba(10,22,40,0.92) 100%)",
                                            border: "1px solid rgba(212, 175, 55, 0.35)",
                                            boxShadow:
                                                "0 0 0 1px rgba(212, 175, 55, 0.15), 0 8px 28px -8px rgba(10, 22, 40, 0.6), 0 0 24px -6px rgba(244, 212, 114, 0.25)",
                                        }}
                                    >
                                        <p
                                            className="text-[11px]"
                                            style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontWeight: 600,
                                                letterSpacing: "0.22em",
                                                textTransform: "uppercase",
                                                color: "#f4d472",
                                                textShadow: "0 0 10px rgba(244, 212, 114, 0.4)",
                                            }}
                                        >
                                            {t(space.labelKey)}
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
            <div className={compact ? "p-[8px] space-y-[8px]" : "p-2 md:p-3 space-y-1"}>
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
                <SoundCloudMinimalPlayer compact={compact} />

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
                        "spaces-rail-chat-cta transition-all duration-300",
                        compact
                            ? "grid place-items-center w-[48px] h-[48px] mx-auto rounded-full p-0"
                            : "flex items-center gap-3 px-3 py-2.5 rounded-2xl w-full justify-center md:justify-start",
                        "text-white/55 hover:bg-white/[0.04] hover:text-white/85 hover:translate-y-[-1px] active:translate-y-0"
                    )}
                    title={t('spacesRail.chatTitle')}
                >
                    <MessageCircle
                        className="flex-shrink-0"
                        style={{
                            width: compact ? 20 : 22,
                            height: compact ? 20 : 22,
                            opacity: 0.8,
                            filter: "drop-shadow(0 0 4px rgba(244, 212, 114, 0.25))",
                        }}
                        aria-hidden="true"
                    />
                    {!compact && (
                        <span
                            className={cn(
                                "hidden md:block truncate transition-opacity duration-150",
                                labelsVisible ? "opacity-100" : "opacity-0"
                            )}
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "0.82rem",
                                letterSpacing: "0.06em",
                                textTransform: "lowercase",
                            }}
                        >
                            {t('spacesRail.chatLabel')}
                        </span>
                    )}
                </a>
                {/* Day 48 iter 9 (Sasha): Settings chip upgraded to match
                    the chip register — rounded-2xl, Cormorant Garamond
                    uppercase tracked. Kept dimmer (white/45) so the
                    "utility ↓ / spaces ↑" hierarchy still reads
                    through weight, not through visual-family mismatch. */}
                <button
                    onClick={() => navigate("/game/settings")}
                    className={cn(
                        "transition-all duration-300",
                        compact
                            ? "grid place-items-center w-[48px] h-[48px] mx-auto rounded-full p-0"
                            : "flex items-center gap-3 px-3 py-2.5 rounded-2xl w-full justify-center md:justify-start",
                        "text-white/45 hover:bg-white/[0.04] hover:text-white/80 hover:translate-y-[-1px] active:translate-y-0"
                    )}
                    title={t('spacesRail.settingsTitle')}
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
                            width: compact ? 20 : 22,
                            height: compact ? 20 : 22,
                            filter: "drop-shadow(0 0 4px rgba(244, 212, 114, 0.25))",
                            opacity: 0.75,
                        }}
                    />
                    {!compact && (
                        <span
                            className={cn(
                                "hidden md:block truncate transition-opacity duration-150",
                                labelsVisible ? "opacity-100" : "opacity-0"
                            )}
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: 600,
                                fontSize: "0.82rem",
                                letterSpacing: "0.06em",
                                textTransform: "lowercase",
                            }}
                        >
                            {t('spacesRail.settingsLabel')}
                        </span>
                    )}
                </button>
                {/* Day 91 (Sasha 2026-06-09): Lapis/Aurum theme toggle.
                    Rendered ONLY on the two first-class themes — the
                    white-label demo scopes (ns/dao/planetir/techstars/
                    karime) own their look and must not expose a theme
                    switch. Visible to guests too: the theme is a device
                    preference, not an account setting. Persists via
                    setSkin (localStorage); full names + swatches live in
                    Settings → Appearance. */}
                {(skin === "lapis" || skin === "aurum") && (
                    <button
                        onClick={() => setSkin(skin === "aurum" ? "lapis" : "aurum")}
                        className={cn(
                            "transition-all duration-300",
                            compact
                                ? "grid place-items-center w-[48px] h-[48px] mx-auto rounded-full p-0"
                                : "flex items-center gap-3 px-3 py-2.5 rounded-2xl w-full justify-center md:justify-start",
                            "text-white/45 hover:bg-white/[0.04] hover:text-white/80 hover:translate-y-[-1px] active:translate-y-0"
                        )}
                        title={skin === "aurum" ? t('spacesRail.themeToggleToLapisTitle') : t('spacesRail.themeToggleToAurumTitle')}
                        aria-label={skin === "aurum" ? t('spacesRail.themeToggleToLightAria') : t('spacesRail.themeToggleToDarkAria')}
                    >
                        {skin === "aurum" ? (
                            <Sun
                                className="flex-shrink-0"
                                aria-hidden="true"
                                style={{
                                    width: compact ? 20 : 22,
                                    height: compact ? 20 : 22,
                                    filter: "drop-shadow(0 0 4px rgba(244, 212, 114, 0.25))",
                                    opacity: 0.75,
                                }}
                            />
                        ) : (
                            <Moon
                                className="flex-shrink-0"
                                aria-hidden="true"
                                style={{
                                    width: compact ? 20 : 22,
                                    height: compact ? 20 : 22,
                                    filter: "drop-shadow(0 0 4px rgba(244, 212, 114, 0.25))",
                                    opacity: 0.75,
                                }}
                            />
                        )}
                        {!compact && (
                            <span
                                className={cn(
                                    "hidden md:block truncate transition-opacity duration-150",
                                    labelsVisible ? "opacity-100" : "opacity-0"
                                )}
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    fontSize: "0.82rem",
                                    letterSpacing: "0.06em",
                                    textTransform: "lowercase",
                                }}
                            >
                                {skin === "aurum" ? t('spacesRail.lightTheme') : t('spacesRail.darkTheme')}
                            </span>
                        )}
                    </button>
                )}
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
                                        title: t('spacesRail.logoutToastTitle'),
                                        description: t('spacesRail.logoutToastDescription'),
                                    });
                                    navigate("/");
                                }}
                                className={cn(
                                    // V4 (Sasha 2026-05-19): standardize Log Out to match
                                    // the chat-with-us / settings chip shape — same padding,
                                    // radius, hover register, icon scale. Previous styling
                                    // ("py-2 rounded-xl, red hover, w-4 icon") read as a
                                    // foreign element in the utility row. Now matches the
                                    // family. Pink → uniform light-gray hover for all rail
                                    // items.
                                    "transition-all duration-300",
                                    compact
                                        ? "grid place-items-center w-[48px] h-[48px] mx-auto rounded-full p-0"
                                        : "flex items-center gap-3 px-3 py-2.5 rounded-2xl w-full justify-center md:justify-start",
                                    "text-white/45 hover:bg-white/[0.04] hover:text-white/80 hover:translate-y-[-1px] active:translate-y-0"
                                )}
                                title={t('spacesRail.logOutTitle')}
                            >
                                <LogOut
                                    className="flex-shrink-0"
                                    style={{ width: compact ? 20 : 22, height: compact ? 20 : 22, opacity: 0.8 }}
                                    aria-hidden="true"
                                />
                                {!compact && (
                                    <span
                                        className={cn(
                                            "hidden md:block truncate transition-opacity duration-150",
                                            labelsVisible ? "opacity-100" : "opacity-0"
                                        )}
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontWeight: 600,
                                            fontSize: "0.82rem",
                                            letterSpacing: "0.06em",
                                            textTransform: "lowercase",
                                        }}
                                    >
                                        {t('spacesRail.logOutLabel')}
                                    </span>
                                )}
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
                                "transition-all",
                                compact
                                    ? "grid place-items-center w-[48px] h-[48px] mx-auto rounded-full p-0"
                                    : "flex items-center gap-3 px-3 py-2 rounded-xl w-full justify-center md:justify-start",
                                "text-white/60 hover:bg-white/10 hover:text-white"
                            )}
                            title={t('spacesRail.logInTitle')}
                        >
                            <LogIn className={compact ? "w-5 h-5 flex-shrink-0" : "w-4 h-4 flex-shrink-0"} />
                            {!compact && (
                                <span className={cn("hidden md:block text-xs font-medium transition-opacity duration-150", labelsVisible ? "opacity-100" : "opacity-0")}>{t('spacesRail.logInLabel')}</span>
                            )}
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
