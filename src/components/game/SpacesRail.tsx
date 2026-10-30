import { memo, useEffect, useId, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Check,
    Coffee,
    Contrast,
    DoorOpen,
    Flame,
    GraduationCap,
    Hammer,
    Home,
    Landmark,
    LogIn,
    LogOut,
    MessageCircle,
    Moon,
    ScrollText,
    Settings,
    Sparkles,
    Store,
    Sun,
    Users,
    UserRound,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { closedLine, placeLine, type PlaceStateName } from "@/lib/placeState";
import { placeName, stateWordText, tr } from "@/lib/villageCopy";
import { PANE_BY_PLACE, RAIL_PLACES, tourIdFor } from "@/lib/railPlaces";
import type { VillagePlace, VillagePlaceKey } from "@/data/villagePlaces";
import { OPEN_CHAT_EVENT } from "@/components/ChatLauncher";
import { supabase } from "@/integrations/supabase/client";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSoulColors } from "@/hooks/useSoulColors";
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
import brandLogo from "@/assets/you-be-original-main-lockup.webp"; // Day 123 (Sasha 2026-07-13): main brand -> YOU be original
// Day 119 (Sasha 2026-07-09): mark-only brand logo swapped from the
// torus to the ORIGINAL octahedron-in-sphere (the canonical Prime
// Attractor artifact — docs/assets/canonical-artifact/). The wordmark
// lockup (find-your-top-talent-logo.png) is unchanged.
import brandMark from "@/assets/original-octahedron-mark.png";
import { useSkin, type Skin } from "@/contexts/SkinContext";

/**
 * WP-1b: the rail's theme toggle. One table drives the click, the label and the
 * tooltip, so the label always names the skin the next click applies.
 * Lunar (the default) is an entry point that steps to Lapis; Lapis → Aurum →
 * The Dao → Lapis is the loop.
 */
const TOGGLE_NEXT_SKIN: Partial<Record<Skin, Skin>> = {
    lunar: "lapis",
    lapis: "aurum",
    aurum: "dao",
    dao: "lapis",
};
const TOGGLE_LABEL_KEY: Partial<Record<Skin, string>> = {
    lapis: "spacesRail.themeToggleToLapisTitle",
    aurum: "spacesRail.themeToggleToAurumTitle",
    dao: "spacesRail.themeToggleToDaoTitle",
};
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

/**
 * WP-4 (game_of_being_you.md §14.1.2, §14.6): the rail is the village map folded.
 * One chip per place of `VILLAGE_PLACES`, in map order, under the map's names, in the
 * state `placeState()` gives it (closed · open · next · done · live). The old spaces
 * (MAIN QUEST · AI OS · CHARACTER · MEET · PARTY & GUILD · TRAINING · THE FORGE ·
 * TRADING POST) are gone from the rail; pane 2 still opens the section list of the
 * module each place holds (`PANE_BY_PLACE`, src/lib/railPlaces.ts).
 *
 * Each place gets a line icon. Color is not the carrier: icons draw in the rail's ink and
 * the state reads from the shared lock / open / live tokens (src/styles/theme-tokens.css),
 * so every skin renders every state.
 */
const PLACE_ICON: Record<VillagePlaceKey, LucideIcon> = {
    reception: DoorOpen,
    house: Home,
    "quest-board": ScrollText,
    oracle: Sparkles,
    cafe: Coffee,
    coworking: Users,
    "fire-circle": Flame,
    academy: GraduationCap,
    workshop: Hammer,
    market: Store,
    "town-hall": Landmark,
};

/** Next · Done · Live as a small mark beside the name. Closed and open carry none. */
const StateMark = ({ state, compact }: { state: PlaceStateName; compact: boolean }) => {
    if (state === "next") {
        return (
            <span
                aria-hidden="true"
                className="absolute rounded-full"
                style={{
                    width: 7,
                    height: 7,
                    top: compact ? 6 : 10,
                    right: compact ? 6 : 12,
                    background: "var(--open-accent)",
                    boxShadow: "0 0 8px 1px var(--open-accent)",
                }}
            />
        );
    }
    if (state === "live") {
        return (
            <span
                aria-hidden="true"
                className="absolute rounded-full animate-pulse motion-reduce:animate-none"
                style={{
                    width: 7,
                    height: 7,
                    top: compact ? 6 : 10,
                    right: compact ? 6 : 12,
                    background: "var(--live-accent)",
                }}
            />
        );
    }
    if (state === "done") {
        return (
            <Check
                aria-hidden="true"
                className="absolute"
                style={{
                    width: 12,
                    height: 12,
                    top: compact ? 4 : 8,
                    right: compact ? 4 : 10,
                    color: "var(--open-accent)",
                }}
            />
        );
    }
    return null;
};

/** The state as a word for screen readers; closed reads its «Opens when …» line. */
const stateWord = (place: VillagePlace, state: PlaceStateName, t: TFunction): string => {
    if (state === "closed") return closedLine(place, t);
    if (state === "live") return placeLine(place, state, t, true);
    if (state === "next" || state === "done") return stateWordText(state, t) ?? "";
    return "";
};

interface SpacesRailProps {
    /** The place the player is standing in (src/lib/railPlaces.ts `activePlaceKey`). */
    activePlace?: VillagePlaceKey | null;
    /**
     * The state of each place, in `VILLAGE_PLACES` order (src/hooks/usePlaceStates.ts).
     * Absent = every place reads open, which is what a rail rendered before the save loads shows.
     */
    placeStates?: PlaceStateName[];
    /** Called with the pane-2 space id of the place just entered. */
    onSpaceSelect?: (spaceId: string) => void;
    /**
     * Day 82 v4 (Sasha 2026-05-24): when true, the rail collapses to the
     * mobile-equivalent slim icon-only width on desktop (overriding the
     * lg:w-[280px] expansion) and hides all md:block labels via a
     * data-rail-compact attribute + matching CSS rule in index.css.
     */
    compact?: boolean;
    /**
     * Phone drawer (issue #202): the rail is the left column of the overlay menu, so
     * every place shows its name next to its icon (a phone has no hover) and the rail
     * is wide enough to hold them. Desktop and the slim rail never set this.
     */
    drawer?: boolean;
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
    /** Authoritative auth result from the shell's getUser() check. */
    isAuthenticated?: boolean;
    /** Canonical root-level public profile URL for the authenticated user. */
    publicProfilePath?: string;
    /**
     * Day 130 (Sasha 2026-07-20): IDENTITY AS PRESENCE. Explicit soul
     * colors from `game_profiles.soul_colors` (already generated
     * elsewhere in the app — see CharacterHub.tsx). When present, these
     * win outright over the derived hash below.
     */
    soulColors?: string[] | null;
    /**
     * Deterministic hash seed for deriving a personal 3-hue palette when
     * `soulColors` isn't set yet — archetype title if known, else the
     * user id. Undefined/null → default gold ring (no snapshot yet).
     */
    soulColorSeed?: string | null;
}

const SpacesRail = ({
    activePlace = null,
    placeStates,
    onSpaceSelect,
    compact: compactRequested = false,
    drawer = false,
    className,
    pageOwnsBackground = false,
    userName,
    userAvatarUrl,
    isAuthenticated,
    publicProfilePath = "/game/me/profile",
    soulColors,
    soulColorSeed,
}: SpacesRailProps) => {
    const { t } = useTranslation();
    // The shell mounts this rail twice (desktop + phone), so ids need a per-instance prefix.
    const uid = useId();
    const { hasSoulColors, ringGradient, glowColor } = useSoulColors(soulColors, soulColorSeed);
    const location = useLocation();
    const navigate = useNavigate();
    const { skin, setSkin } = useSkin();
    const isNS = skin === "network-school";
    const isDao = skin === "daouniverse";
    // "The Dao" (dao) — a first-class YOU platform skin (keeps the YOU
    // logo/branding, so it stays inside isDefaultYouSkin), but styled
    // b&w editorial like network-school. It must NOT inherit the navy
    // "spaceship" visuals: the rail bg is overridden white by the
    // co-selected NS css, but the active-chip navy gradient is inline
    // (JS-gated) and can't be reached by css — so gate it out here.
    // NB: `isDao` above is the *daouniverse* white-label, a different skin.
    const isTheDao = skin === "dao";
    const isPlanetir = skin === "planetir";
    const isTechstars = skin === "techstars";
    const isDefaultYouSkin = !isNS && !isDao && !isPlanetir && !isTechstars;
    // Brand names are not translated; only the word «home» around them is.
    const homeBrand = isNS
        ? "Network School"
        : isDao
            ? "LATAM Impact"
            : isPlanetir
                ? "Planetir"
                : isTechstars
                    ? "Techstars"
                    : "Find Your Top Talent";
    const nextToggleSkin: Skin = TOGGLE_NEXT_SKIN[skin] ?? "lapis";
    const toggleLabel = t(TOGGLE_LABEL_KEY[nextToggleSkin] ?? "spacesRail.themeToggleToLapisTitle");

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
        // Day 148 v2 (Sasha 2026-08-07): re-verify before demoting to guest.
        // A bare null on an auth event is often a transient token-refresh
        // blip; trusting it flipped the rail to its logged-out state for a
        // signed-in user.
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setIsAuthed(true);
                return;
            }
            void supabase.auth.getSession().then(({ data }) => {
                if (!cancelled) setIsAuthed(!!data.session?.user);
            });
        });
        return () => {
            cancelled = true;
            listener.subscription.unsubscribe();
        };
    }, []);
    const effectiveIsAuthed = isAuthenticated ?? isAuthed;

    // Day 139 (Sasha 2026-07-29): persistent Log Out control back in the
    // rail's SETTINGS/utility group (reversing the Day 128 relocation to
    // Settings — Sasha's ask this round). Reuses the same
    // supabase.auth.signOut() + navigate("/") precedent as
    // ProfileSettingsSection.tsx's Log Out card.
    const handleLogOut = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

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

    return (
        <div
            data-rail-compact={compactRequested ? "true" : undefined}
            className={cn(
                compactRequested
                    ? "w-[72px] flex flex-col relative z-30"
                    : drawer
                        ? "w-[176px] flex-shrink-0 flex flex-col relative z-30"
                        : "w-[72px] lg:w-[280px] flex flex-col relative z-30",
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
                backgroundImage: isDefaultYouSkin
                    ? "linear-gradient(165deg, rgba(31, 55, 106, 0.16) 0%, rgba(5, 18, 49, 0.18) 58%, rgba(1, 10, 31, 0.30) 100%), url('/assets/shell/lapis-navigation-surface-v3-tall.webp')"
                    : "linear-gradient(165deg, rgba(53, 78, 132, 0.34) 0%, rgba(18, 43, 91, 0.12) 34%, rgba(5, 21, 54, 0.44) 100%)",
                backgroundSize: isDefaultYouSkin ? "cover" : undefined,
                backgroundPosition: isDefaultYouSkin ? "center top" : undefined,
                backgroundRepeat: isDefaultYouSkin ? "no-repeat" : undefined,
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
            <div className={compact ? "p-[6px]" : "px-3 pt-2 pb-0"}>
                <Link
                    to="/"
                    className={cn(
                        "block group transition-all hover:opacity-90",
                        compact && "grid place-items-center w-[48px] h-[48px] mx-auto p-0"
                    )}
                    aria-label={t("spacesRail.homeAria", { brand: homeBrand, defaultValue: "{{brand}} home" })}
                >
                    {isTechstars ? (
                        <>
                            {/* Day 91 (Sasha 2026-06-08): Techstars wordmark
                                (white wordmark + green underscore, designed for
                                dark surfaces). Mobile (72px column): crops to a
                                centered narrow band that still reads as the
                                star + first letter of the wordmark. Desktop:
                                full wordmark. */}
                            {/* Day 119 (Sasha 2026-07-09): minimize is now
                                platform-wide, so every skin branch needs a
                                compact variant — the mark-only asset rendered
                                bare inside the 48px grid cell (the padded
                                mobile/desktop wrappers below rely on md:
                                viewport variants, which compact must ignore).
                                Previously a CSS rule force-hid the desktop
                                lockups; that rule blocked the new label fade
                                and is retired. Same pattern for Planetir /
                                LATAM / NS below. */}
                            {compact ? (
                                <img
                                    src={techstarsLogo}
                                    alt="Techstars"
                                    className="h-7 w-auto object-contain object-left flex-shrink-0"
                                    style={{ maxWidth: "48px" }}
                                    draggable={false}
                                />
                            ) : (
                                <>
                                    <div className="lg:hidden flex items-center justify-center px-3 py-2.5">
                                        <img
                                            src={techstarsLogo}
                                            alt="Techstars"
                                            className="h-7 w-auto object-contain object-left flex-shrink-0"
                                            style={{ maxWidth: "48px" }}
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="hidden lg:flex items-center justify-start px-3 py-2.5">
                                        <img
                                            src={techstarsLogo}
                                            alt="Techstars"
                                            className="h-7 w-auto object-contain flex-shrink-0"
                                            draggable={false}
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    ) : isPlanetir ? (
                        <>
                            {/* Day 84 (Sasha 2026-05-25): Planetir lockup
                                (olive shield + wordmark, transparent bg).
                                Mobile (72px) crops to icon-only via object
                                positioning; desktop shows full lockup. */}
                            {compact ? (
                                <img
                                    src={planetirLogo}
                                    alt="Planetir"
                                    className="h-9 w-auto object-contain object-left flex-shrink-0"
                                    style={{ maxWidth: "40px" }}
                                    draggable={false}
                                />
                            ) : (
                                <>
                                    <div className="lg:hidden flex items-center justify-center px-3 py-2.5">
                                        <img
                                            src={planetirLogo}
                                            alt="Planetir"
                                            className="h-9 w-auto object-contain object-left flex-shrink-0"
                                            style={{ maxWidth: "40px" }}
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="hidden lg:flex items-center justify-start px-3 py-2.5">
                                        <img
                                            src={planetirLogo}
                                            alt="Planetir"
                                            className="h-10 w-auto object-contain flex-shrink-0"
                                            draggable={false}
                                        />
                                    </div>
                                </>
                            )}
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
                            {compact ? (
                                <img
                                    src={latamPyramid}
                                    alt="LATAM Impact"
                                    className="w-10 h-10 object-contain flex-shrink-0"
                                    draggable={false}
                                />
                            ) : (
                                <>
                                    <div className="lg:hidden flex items-center justify-center px-3 py-2.5">
                                        <img
                                            src={latamPyramid}
                                            alt="LATAM Impact"
                                            className="w-10 h-10 object-contain flex-shrink-0"
                                            draggable={false}
                                        />
                                    </div>
                                    <div className="hidden lg:flex items-center justify-start px-3 py-2.5">
                                        <img
                                            src={latamLockup}
                                            alt="LATAM Impact"
                                            className="h-12 w-auto object-contain flex-shrink-0"
                                            draggable={false}
                                        />
                                    </div>
                                </>
                            )}
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
                            {compact ? (
                                <img
                                    src={NS_LOGO_URL}
                                    alt="Network School"
                                    className="w-9 h-9 object-contain flex-shrink-0"
                                    draggable={false}
                                />
                            ) : (
                                <>
                            <div className="lg:hidden flex items-center justify-center px-3 py-2.5">
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
                            <div className="hidden lg:flex items-center gap-3 px-3 py-2.5">
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
                            )}
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
                            className="w-7 h-7 object-contain"
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
                                className="lg:hidden w-10 h-10 mx-auto object-contain"
                                draggable={false}
                            />
                            {/* Desktop: optically cropped lockup. The source
                                contains sparse peripheral pixels, so alpha trim
                                alone leaves a 4:3 canvas with large dead zones.
                                This viewport preserves the canonical artwork and
                                crops around the visible sphere + wordmark. */}
                            <div className="hidden lg:flex h-[104px] w-full items-center justify-center overflow-hidden">
                                {isDefaultYouSkin ? (
                                    <img
                                        src={brandLogo}
                                        alt="YOU — be original."
                                        className="w-[304px] max-w-none h-auto object-contain opacity-[0.82]"
                                        draggable={false}
                                        style={{
                                            filter:
                                                "saturate(0.72) contrast(1.08) brightness(0.92) drop-shadow(0 1px 0 rgba(255, 236, 165, 0.28)) drop-shadow(0 -1px 0 rgba(1, 8, 28, 0.82))",
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={brandLogo}
                                        alt="YOU — be original."
                                        className="w-[304px] max-w-none h-auto object-contain brand-breath"
                                        draggable={false}
                                    />
                                )}
                            </div>
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

            {/* WP-4: the 11 places of the village map, in map order, under the map's
                names, in the state placeState() gives them. A closed place stays on
                the rail faded (the lock tokens), cannot be entered, and says in one
                line what opens it and what is inside; nothing is hidden. Chip look
                (shape, rings, Cormorant caps) is the rail's existing grammar; the new
                parts (fade, state marks, hover card) read WP-1 tokens only.
                TooltipProvider: delay 150ms so hover feels crisp but not jumpy;
                skipDelayDuration 0 so moving between chips does not re-flash it. */}
            <ScrollArea className="flex-1 spaces-rail-scroll">
              <div className="relative">
              <TooltipProvider delayDuration={150} skipDelayDuration={0}>
                <nav
                    aria-label={tr(t, "village.railAria", "Village")}
                    className={compact ? "flex flex-col gap-[6px] p-[8px]" : drawer ? "flex flex-col gap-1 px-2 pt-3 pb-3" : "flex flex-col gap-1 px-3 pt-3 pb-3"}
                >
                {RAIL_PLACES.map((place, i) => {
                    const state: PlaceStateName = placeStates?.[i] ?? "open";
                    const closed = state === "closed";
                    const active = place.key === activePlace;
                    const Icon = PLACE_ICON[place.key];
                    const line = placeLine(place, state, t, true);
                    const name = placeName(place, t);
                    // The state word ("Opens when…", Next, Done, live line) is the description,
                    // not the name: the button is named by the place alone.
                    const describedBy = stateWord(place, state, t) ? `${uid}-state-${place.key}` : undefined;

                    const handleClick = () => {
                        if (closed) return;
                        onSpaceSelect?.(PANE_BY_PLACE[place.key]);
                        navigate(place.to);
                    };

                    const chipButton = (
                        <button
                            key={place.key}
                            type="button"
                            data-tour-id={tourIdFor(place.key)}
                            data-place={place.key}
                            data-place-state={state}
                            aria-current={active ? "page" : undefined}
                            aria-disabled={closed ? true : undefined}
                            onClick={handleClick}
                            className={cn(
                                "transition-all duration-300 relative group",
                                compact
                                    ? "grid place-items-center w-[48px] h-[48px] mx-auto rounded-full p-0"
                                    : drawer
                                        ? "flex items-center gap-2.5 px-2.5 py-2.5 min-h-[44px] rounded-2xl justify-start"
                                        : "flex items-center gap-3 px-3 py-2.5 rounded-2xl justify-center lg:justify-start",
                                // Clip the fading label while the rail narrows.
                                compactRequested && !compact && "overflow-hidden",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40",
                                closed
                                    ? "text-white/55 cursor-default"
                                    : active
                                        // Entered state: recessed inset shadow + slight
                                        // scale-down, a place you have stepped INTO.
                                        ? compact
                                            ? "text-white shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)] scale-[0.99]"
                                            : "text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.38),inset_0_0_0_1px_rgba(244,212,114,0.14)] scale-[0.99]"
                                        : "text-white/55 hover:bg-white/[0.04] hover:text-white/95 hover:ring-1 hover:ring-[#d4af37]/30 hover:shadow-[0_0_16px_-4px_rgba(244,212,114,0.28)] hover:translate-y-[-1px] active:translate-y-0"
                            )}
                            style={
                                active && !closed
                                    ? isDefaultYouSkin && !isTheDao
                                        // WP-1b: fill comes from the skin (theme-tokens.css);
                                        // the defaults are the navy gradient this used to hardcode.
                                        ? {
                                            backgroundColor: "var(--nav-rail-active-color)",
                                            backgroundImage: "var(--nav-rail-active-image)",
                                        }
                                        : { backgroundColor: "var(--skin-selected-bg-deep, rgba(212, 175, 55, 0.13))" }
                                    : undefined
                            }
                            // Native title is the plain fallback where the label column is
                            // hidden (mobile). In compact and closed the hover card below
                            // carries the same line.
                            title={!closed && !compact ? line : undefined}
                            aria-label={name}
                            aria-describedby={describedBy}
                        >
                            <span
                                className={cn(
                                    "relative flex flex-1 min-w-0 items-center transition-[filter,opacity] duration-500",
                                    drawer ? "gap-2.5 justify-start" : "gap-3 justify-center lg:justify-start"
                                )}
                                style={closed ? { filter: "var(--lock-filter)", opacity: "var(--lock-dim)" } : undefined}
                            >
                                <Icon
                                    aria-hidden="true"
                                    className="flex-shrink-0"
                                    style={{ width: compact ? 22 : 20, height: compact ? 22 : 20 }}
                                    strokeWidth={1.6}
                                />
                                {!compact && (
                                    <span
                                        className={cn(
                                            drawer ? "block" : "hidden lg:block",
                                            "truncate transition-opacity duration-150",
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
                                        {name}
                                    </span>
                                )}
                            </span>

                            <StateMark state={state} compact={compact} />
                            <span id={describedBy} className="sr-only">{stateWord(place, state, t)}</span>

                            {/* Active-state gold pip, hidden in compact (its left-edge
                                position overflowed the slim 72px column). */}
                            {active && !compact && (
                                <div className="absolute left-0 top-1/2 w-[3px] h-7 rounded-r-full translate-x-0 lg:-translate-x-1/2 -translate-y-1/2 bg-[rgba(226,190,82,0.86)] shadow-[0_0_6px_rgba(244,212,114,0.34)]" />
                            )}
                        </button>
                    );

                    // Hover card: closed places say what opens them; in compact every
                    // place shows its name (and its line when it has something to say).
                    if (closed || compact) {
                        return (
                            <Tooltip key={place.key}>
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
                                            backgroundColor: "rgba(var(--scene-bg-rgb), 0.92)",
                                            border: "1px solid rgba(var(--accent-rgb), 0.35)",
                                            boxShadow: "0 8px 28px -8px rgba(var(--shadow-rgb), 0.6)",
                                        }}
                                    >
                                        <p
                                            className={cn("text-[11px]", closed || state === "live" ? "mb-1" : "")}
                                            style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontWeight: 600,
                                                letterSpacing: "0.22em",
                                                textTransform: "uppercase",
                                                color: "var(--accent-bright)",
                                            }}
                                        >
                                            {name}
                                        </p>
                                        {(closed || state === "live") && (
                                            <p
                                                className="text-[13px] italic leading-snug"
                                                style={{
                                                    fontFamily: "'Cormorant Garamond', serif",
                                                    fontWeight: 500,
                                                    color: "rgba(var(--scene-ink-rgb), 0.92)",
                                                }}
                                            >
                                                {line}
                                            </p>
                                        )}
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    }

                    return chipButton;
                })}
                </nav>
              </TooltipProvider>
              </div>
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
            <div className={compact ? "p-[8px] space-y-[8px]" : "px-3 pb-4 space-y-2"}>
                <div
                    aria-hidden="true"
                    className="h-px mx-2 mb-1"
                    style={{
                        backgroundImage:
                            "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.22) 50%, transparent 100%)",
                    }}
                />
                {/* Day 131 (Sasha 2026-07-20): UTILITY ROW — reversed from
                    the Day 128 decision. Profile/settings move back to the
                    BOTTOM as a compact utility bar: [avatar/profile]
                    [settings gear] [chat] [theme toggle]. The user's NAME
                    no longer renders in the rail — it lives in Settings /
                    profile pages. Guests: the avatar slot swaps for the
                    existing Log In affordance (no avatar to show, no
                    /game/me to send them to yet).
                    Expanded (lg): a fixed four-column utility grid. Its
                    slight optical offset aligns the first visible glyph
                    edge—not the larger invisible hit target—with Space icons.
                    Compact (72px, incl. below-lg): a 2x2 grid of the same
                    4 buttons (~28-32px) sitting above the compact music
                    play button — a straight 4-across line at 72px width
                    would force sub-20px targets, so the grid is the
                    accessible equivalent of "one line of buttons" at this
                    width. */}
                <TooltipProvider delayDuration={150} skipDelayDuration={0}>
                    <div
                        className={cn(
                            compact
                                ? "grid grid-cols-2 gap-1.5 justify-items-center w-fit mx-auto"
                                // The visible profile ring is narrower than the
                                // 48px utility hit cell. Offset the whole row so
                                // its first painted pixel, not its invisible
                                // button box, lands on the same vertical axis as
                                // the painted Space glyphs above.
                                : drawer
                                    // Five 48px cells (240px) do not fit the 176px drawer rail: wrap to 3 + 2.
                                    ? "grid grid-cols-[repeat(3,48px)] items-center gap-0 w-fit mx-auto"
                                    : "grid h-12 grid-cols-[repeat(5,48px)] items-center gap-0 ml-[13px]"
                        )}
                    >
                        {/* Avatar / Profile — hidden for guests on pages that
                            are part of the unauthenticated funnel (landing +
                            ZoG reveal + playbook + path + settings), same
                            rule the old Log In row used, so visitors aren't
                            pulled out of the flow by an auth prompt. */}
                        {effectiveIsAuthed === false && (
                            location.pathname === "/" ||
                            location.pathname.startsWith("/game/journey") ||
                            location.pathname.startsWith("/zone-of-genius") ||
                            location.pathname.startsWith("/playbook") ||
                            location.pathname === "/path" ||
                            location.pathname === "/game/settings"
                        ) ? null : effectiveIsAuthed === false ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => navigate("/auth")}
                                        className={cn(
                                            "grid place-items-center rounded-full transition-all duration-300 text-white/55 hover:bg-white/[0.04] hover:text-white/95 hover:ring-1 hover:ring-[#d4af37]/30",
                                            compact ? "w-[30px] h-[30px]" : "w-[48px] h-[48px]"
                                        )}
                                        aria-label={t('spacesRail.logInTitle')}
                                    >
                                        <LogIn className={compact ? "w-4 h-4 flex-shrink-0" : "w-[18px] h-[18px] flex-shrink-0"} aria-hidden="true" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" sideOffset={10} className="rounded-lg border-none px-2.5 py-1.5 bg-black/85 text-[11px] text-white/90">
                                    {t('spacesRail.logInLabel')}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => navigate(effectiveIsAuthed === true ? publicProfilePath : "/auth")}
                                        className={cn(
                                            "grid place-items-center rounded-full transition-all duration-300 hover:ring-1 hover:ring-[#d4af37]/30",
                                            compact ? "w-[30px] h-[30px]" : "w-[48px] h-[48px]"
                                        )}
                                        aria-label={t('spacesRail.profileAria')}
                                    >
                                        {hasSoulColors ? (
                                            <span
                                                className="relative flex-shrink-0 rounded-full"
                                                style={{
                                                    padding: 2,
                                                    background: ringGradient ?? undefined,
                                                    boxShadow: glowColor ? `0 0 10px 1px ${glowColor}4d` : undefined,
                                                }}
                                            >
                                                <span className="flex items-center justify-center h-[24px] w-[24px] rounded-full overflow-hidden bg-[#0a1632]">
                                                    {userAvatarUrl ? (
                                                        <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <UserRound className="h-[16px] w-[16px]" aria-hidden="true" />
                                                    )}
                                                </span>
                                            </span>
                                        ) : userAvatarUrl ? (
                                            <img src={userAvatarUrl} alt="" className="h-[24px] w-[24px] flex-shrink-0 rounded-full object-cover ring-1 ring-[#f4d472]/30" />
                                        ) : (
                                            <UserRound className="h-[20px] w-[20px] flex-shrink-0 text-white/55" aria-hidden="true" />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" sideOffset={10} className="rounded-lg border-none px-2.5 py-1.5 bg-black/85 text-[11px] text-white/90">
                                    {t('spacesRail.profileAria')}
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {/* Settings — universal gear */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => navigate("/game/settings")}
                                    className={cn(
                                        "grid place-items-center rounded-full transition-all duration-300 text-white/55 hover:bg-white/[0.04] hover:text-white/95 hover:ring-1 hover:ring-[#d4af37]/30",
                                        compact ? "w-[30px] h-[30px]" : "w-[48px] h-[48px]"
                                    )}
                                    aria-label={t('spacesRail.settingsTitle')}
                                >
                                    <Settings
                                        aria-hidden="true"
                                        className={cn(
                                            "flex-shrink-0",
                                            compact ? "h-[17px] w-[17px]" : "h-[19px] w-[19px]"
                                        )}
                                        strokeWidth={1.8}
                                    />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" sideOffset={10} className="rounded-lg border-none px-2.5 py-1.5 bg-black/85 text-[11px] text-white/90">
                                {t('spacesRail.settingsTitle')}
                            </TooltipContent>
                        </Tooltip>

                        {/* Chat bubble */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
                                    className={cn(
                                        "grid place-items-center rounded-full transition-all duration-300 text-white/55 hover:bg-white/[0.04] hover:text-white/95 hover:ring-1 hover:ring-[#d4af37]/30",
                                        compact ? "w-[30px] h-[30px]" : "w-[48px] h-[48px]"
                                    )}
                                    aria-label={t('spacesRail.chatTitle')}
                                >
                                    <MessageCircle
                                        className="flex-shrink-0"
                                        style={{
                                            width: compact ? 16 : 18,
                                            height: compact ? 16 : 18,
                                        }}
                                        aria-hidden="true"
                                    />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="center" sideOffset={10} className="rounded-lg border-none px-2.5 py-1.5 bg-black/85 text-[11px] text-white/90">
                                {t('spacesRail.chatTitle')}
                            </TooltipContent>
                        </Tooltip>

                        {/* Theme toggle — Day 91: Lapis/Aurum only, the
                            white-label skins own their look. Restored here
                            from the Day 128 removal (git show 72afcdb1).
                            WP-2: Lunar (the default for new players) joins the
                            cycle as an entry point that steps to Lapis; Lunar
                            itself is picked in Settings. */}
                        {(skin === "lunar" || skin === "lapis" || skin === "aurum" || skin === "dao") && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setSkin(nextToggleSkin)}
                                        className={cn(
                                            "grid place-items-center rounded-full transition-all duration-300 text-white/55 hover:bg-white/[0.04] hover:text-white/95 hover:ring-1 hover:ring-[#d4af37]/30",
                                            compact ? "w-[30px] h-[30px]" : "w-[48px] h-[48px]"
                                        )}
                                        aria-label={toggleLabel}
                                    >
                                        {skin === "lapis" ? (
                                            <Moon
                                                className="flex-shrink-0"
                                                aria-hidden="true"
                                                style={{ width: compact ? 16 : 18, height: compact ? 16 : 18 }}
                                            />
                                        ) : skin === "aurum" ? (
                                            <Contrast
                                                className="flex-shrink-0"
                                                aria-hidden="true"
                                                style={{ width: compact ? 16 : 18, height: compact ? 16 : 18 }}
                                            />
                                        ) : (
                                            <Sun
                                                className="flex-shrink-0"
                                                aria-hidden="true"
                                                style={{ width: compact ? 16 : 18, height: compact ? 16 : 18 }}
                                            />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" sideOffset={10} className="rounded-lg border-none px-2.5 py-1.5 bg-black/85 text-[11px] text-white/90">
                                    {toggleLabel}
                                </TooltipContent>
                            </Tooltip>
                        )}

                        {/* Log Out — Day 139 (Sasha 2026-07-29): persistent
                            control in the settings/utility group, mirroring
                            the guest Log In button above. Same icon-button
                            grammar as Settings/Chat/Theme siblings. */}
                        {effectiveIsAuthed === true && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleLogOut}
                                        className={cn(
                                            "grid place-items-center rounded-full transition-all duration-300 text-white/55 hover:bg-white/[0.04] hover:text-white/95 hover:ring-1 hover:ring-[#d4af37]/30",
                                            compact ? "w-[30px] h-[30px]" : "w-[48px] h-[48px]"
                                        )}
                                        aria-label={t('spacesRail.logOutTitle')}
                                    >
                                        <LogOut
                                            className="flex-shrink-0"
                                            aria-hidden="true"
                                            style={{
                                                width: compact ? 16 : 18,
                                                height: compact ? 16 : 18,
                                            }}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" sideOffset={10} className="rounded-lg border-none px-2.5 py-1.5 bg-black/85 text-[11px] text-white/90">
                                    {t('spacesRail.logOutLabel')}
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                </TooltipProvider>

                {/* Day 58+ (Sasha 2026-05-03 → 2026-05-04): SoundCloud
                    playlist — `findyourtoptalent.com`. Pinned as the
                    LAST item in the rail (Sasha, Day 128: "Music should
                    be at the very bottom"). Custom in-register player:
                    gold play/pause + Cormorant title + skip + tiny SC
                    attribution mark. The audio engine lives in
                    SoundCloudPlayerProvider at App root (not in this
                    component) so playback persists across navigation;
                    this component is a thin context consumer.
                    Visibility rules (handled inside the component):
                      • Hidden entirely on non-shell routes (landing /
                        ignite / zone-of-genius funnel / auth) — no
                        stuck-loading state on sales pages, honors the
                        "no music on sales pages" rule visually.
                      • On shell mobile (<md), only the play button
                        renders centered in the 72px icon column;
                        title / skip / attribution glyph are hidden. */}
                <div
                    aria-hidden="true"
                    className="h-px mx-2 mt-2 mb-2"
                    style={{
                        backgroundImage:
                            "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.22) 50%, transparent 100%)",
                    }}
                />
                <SoundCloudMinimalPlayer compact={compact} />
            </div>
        </div>
    );
};

const areEqual = (prev: SpacesRailProps, next: SpacesRailProps) => {
    // Day 119 (Sasha 2026-07-09): compact now flips at runtime on every
    // shell route (platform-wide minimize) — must invalidate the memo.
    if (prev.compact !== next.compact) return false;
    if (prev.drawer !== next.drawer) return false;
    if (prev.activePlace !== next.activePlace) return false;
    if (prev.onSpaceSelect !== next.onSpaceSelect) return false;
    if (prev.className !== next.className) return false;
    if (prev.pageOwnsBackground !== next.pageOwnsBackground) return false;
    // The place states arrive as a new array each render; compare by content.
    const prevStates = prev.placeStates || [];
    const nextStates = next.placeStates || [];
    if (prevStates.length !== nextStates.length) return false;
    for (let i = 0; i < prevStates.length; i++) {
        if (prevStates[i] !== nextStates[i]) return false;
    }
    return true;
};

export default memo(SpacesRail, areEqual);
