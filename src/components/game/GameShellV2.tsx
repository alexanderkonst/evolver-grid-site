import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, PanelLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { cn } from "@/lib/utils";
// Top-right corner icon — stays as the legacy dodecahedron/fractal
// image (Sasha, Day 48 later: "let's stick to what we had there").
// The rail top-left now carries the new brand wordmark; the top-right
// keeps its own visual register as a round, radially-masked icon that
// reads as a "home button," not a second brand hit.
import logoSrc from "@/assets/logo.jpg";
// Day 54+ (Sasha 2026-04-28): on AI OS routes, the top-right home icon
// uses the merkaba (matching the AI OS Space rail icon) instead of the
// default torus-dodecahedron logo.jpg. Route-detected inside the
// component so callers don't need to pass a prop.
import aiOsHomeIcon from "@/assets/mc-merkaba.png";
// Day 53 (Sasha 2026-04-27): brand torus mark used as the leading
// glyph in the mobile menu pill — pairs with the hamburger to read as
// "your home + open menu" in one affordance.
import brandMark from "@/assets/find-your-top-talent-torus.png";
import SpacesRail, { SPACES } from "./SpacesRail";
import SectionsPanel, { SPACE_SECTIONS } from "./SectionsPanel";
import PlayerStatsBadge from "./PlayerStatsBadge";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import SiteLogo from "@/components/SiteLogo";
// hls.js is dynamically imported inside MuxVideoBackground to avoid module-level crashes
// import { loadNudgeState } from "@/lib/myNextMoveLogic";

/** Animated video background — Mux HLS stream behind all panels */
// Day 51 (Sasha 2026-04-25): swapped to new animated cosmic-landscape stream
// — gold particles, mountain, sunset. Visible behind translucent Pane 2 +
// content area. Pane 1 stays solid navy so the brand isn't competing.
const MUX_BG_URL = "https://stream.mux.com/hTE02fn3vOf5czL8H1s02IcVKGmIxmr4tPacZkQ5KRZwo.m3u8";

const MuxVideoBackground = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoFailed, setVideoFailed] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hlsInstance: any = null;

        const initHls = async () => {
            try {
                const HlsModule = await import("hls.js");
                const Hls = HlsModule.default;

                if (Hls.isSupported()) {
                    hlsInstance = new Hls({ autoStartLoad: true });
                    hlsInstance.loadSource(MUX_BG_URL);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(() => {});
                        video.playbackRate = 0.5;
                    });
                    hlsInstance.on(Hls.Events.ERROR, (_event: any, data: any) => {
                        if (data.fatal) setVideoFailed(true);
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = MUX_BG_URL;
                    video.addEventListener("loadedmetadata", () => {
                        video.play().catch(() => {});
                        video.playbackRate = 0.5;
                    });
                    video.addEventListener("error", () => setVideoFailed(true));
                } else {
                    setVideoFailed(true);
                }
            } catch {
                setVideoFailed(true);
            }
        };

        initHls();
        return () => { hlsInstance?.destroy(); };
    }, []);

    if (videoFailed) {
        return <img src="/gradient.jpg" alt="" className="w-full h-full object-cover" aria-hidden="true" />;
    }

    return (
        // Day 51 (Sasha 2026-04-25): scale 1.10 from top-left to crop the
        // Veo watermark in bottom-right. Top-left anchored so visual content
        // (sky, particles, mountain) stays composed; the extra ~10% grows
        // toward bottom-right and clips against the viewport edge, taking
        // the watermark with it.
        <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{
                transform: 'scale(1.10)',
                transformOrigin: 'top left',
            }}
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
        />
    );
};

// Day 53 (Sasha 2026-04-27): mobile breadcrumb section labels for the
// JOURNEY space. The journey sections are built dynamically inside
// SectionsPanel.tsx (see buildJourneySections), so we mirror the
// label↔path map here for the mobile header breadcrumb. Keep in sync
// with buildJourneySections() if section paths change. Sorted longest
// path first so /playbook matches before /, etc.
const JOURNEY_SECTION_LABELS: Array<{ path: string; label: string }> = [
    { path: "/mission-discovery", label: "Mission Discovery" },
    { path: "/asset-mapping", label: "Asset Mapper" },
    { path: "/playbook", label: "Playbook" },
    { path: "/dashboard", label: "Dashboard" },
    // Day 54 (Sasha 2026-04-28): /ai-os removed — elevated to its own
    // Space. Mobile breadcrumb for /ai-os now resolves via the AI OS
    // space's own pane 2 sections (Install / Suites / Benchmark / Pricing).
    { path: "/path", label: "Path" },
    { path: "/ubb", label: "Build a Business" },
    { path: "/", label: "Start" },
];

interface GameShellV2Props {
    children: ReactNode;
    /** Force hide navigation panels (for onboarding flows) */
    hideNavigation?: boolean;
    /** Force show navigation even during onboarding (for tour spotlight) */
    showNavigation?: boolean;
    /** Hide the top-right home/logo tile (for full-bleed pages like /path) */
    hideLogo?: boolean;
}

/**
 * GameShellV2 - Three-panel Discord-style navigation
 * Panel 1: SpacesRail (icons)
 * Panel 2: SectionsPanel (sections list)  
 * Panel 3: Content area
 */
export const GameShellV2 = ({ children, hideNavigation: forceHideNavigation, showNavigation: forceShowNavigation, hideLogo }: GameShellV2Props) => {
    const location = useLocation();
    const navigate = useNavigate();

    // User & profile state
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<{
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        onboarding_stage?: string | null;
        level?: number | null;
        xp_total?: number | null;
        current_streak_days?: number | null;
    } | null>(null);
    const [hasGeniusOffer, setHasGeniusOffer] = useState(false);
    // Prevents the SpacesRail lock-flicker: while the profile is still being
    // fetched, `stage` would default to "new" and render ME/LEARN/MEET as
    // locked for a beat — then flip unlocked when the profile arrives. We
    // hold back the unlockStatus map until we know for sure.
    const [profileLoaded, setProfileLoaded] = useState(false);

    // Navigation state
    const [activeSpaceId, setActiveSpaceId] = useState<string>("next-move");
    const [sectionsPanelOpen, setSectionsPanelOpen] = useState(() => {
        // Day 48 (Sasha): Pane 2 is CLOSED only on the very first page
        // (landing) so the primary "Find your top talent" CTA gets full
        // attention. On every other funnel surface — /playbook, /path,
        // /zone-of-genius, /game/settings, /my-artifacts — Pane 2 is
        // OPEN by default so the user sees the onboarding step list
        // (Start Here · The Playbook · The Path) at a glance. Toggle
        // stays available inside each page; we stopped persisting the
        // toggle to localStorage so a "closed" state on landing doesn't
        // bleed into the next page.
        if (typeof window === 'undefined') return true;
        const p = window.location.pathname;
        const isLandingPage = p === '/' || p.startsWith('/game/journey');
        return !isLandingPage;
    });
    const [mobileView, setMobileView] = useState<"navigation" | "content">(() => {
        // Day 53 (Sasha 2026-04-27): mobile landing now defaults to CONTENT
        // (the hero), not navigation. Hiding the hero behind a nav list
        // on the entry page defeats the landing's job — new visitors need
        // to feel the offer first. The platform map can be discovered via
        // the menu toggle once they're hooked. All non-landing routes still
        // default to content (the page they just navigated to).
        if (typeof window === "undefined") return "content";
        return "content";
    });
    const [shortcutsOpen, setShortcutsOpen] = useState(false);

    // Day 54 r10 (Sasha 2026-04-28): JS-driven viewport switch.
    // Previously the desktop and mobile layouts both lived in the JSX,
    // gated only by `hidden lg:flex` / `lg:hidden`. CSS hides one tree;
    // React mounts BOTH — so every page (especially heavy ones like
    // /ai-os) was paying 2× the mount cost: doubled DOM, doubled hooks,
    // doubled supabase touches, doubled observers, doubled video element
    // (until that was poster-swapped). Empirical: `[data-ai-os]` count
    // was 2 in the live DOM, both with full subtree.
    //
    // Now matchMedia decides at the JS level, and only one layout
    // mounts. SSR-safe: defaults to desktop on the server. Trade-off:
    // when the user crosses the lg breakpoint at runtime (rotation on
    // a tablet, browser resize), `children` unmounts and remounts —
    // any transient page state (cursor pos, expanded prompt, etc.)
    // is lost. Acceptable for the gain.
    const [isLgViewport, setIsLgViewport] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 1024px)').matches;
    });
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const handler = (e: MediaQueryListEvent) => setIsLgViewport(e.matches);
        if (mq.addEventListener) mq.addEventListener('change', handler);
        else mq.addListener(handler); // older Safari fallback
        return () => {
            if (mq.removeEventListener) mq.removeEventListener('change', handler);
            else mq.removeListener(handler);
        };
    }, []);

    const getSpaceFromPath = (pathname: string): string | undefined => {
        // Day 52 (Sasha 2026-04-26): /ubb (Unique Business Builder)
        // belongs to the BUILD space. When the user clicks "Build a
        // business off your top talent" from JOURNEY pane 2 and lands
        // on /ubb, the BUILD chip in pane 1 lights up and pane 2
        // re-resolves to BUILD's section list. The UBB nav itself
        // becoming pane 2 (deeper integration) is a separate refactor.
        if (pathname === "/ubb" || pathname.startsWith("/ubb/")) return "build";
        // Day 56 (Sasha 2026-04-28): /library is the public face of LEARN.
        // Mapping it here lights up the LEARN chip in pane 1 and renders
        // LEARN's section list (the 6 Growth Sequence steps) in pane 2 —
        // so a public visitor sees the same pane 2 navigation as an authed
        // user inside /game/learn/library.
        if (pathname === "/library" || pathname.startsWith("/library/")) return "learn";
        const match = pathname.match(/^\/game\/([^/]+)/);
        if (!match) return undefined;
        const space = match[1];
        // Map URL path segments to space IDs
        // New naming: grow, learn, meet, collaborate, build, marketplace (offer)
        const spaceMap: Record<string, string> = {
            "next-move": "next-move",
            journey: "journey",
            // New space names
            grow: "grow",
            learn: "learn",
            meet: "meet",
            collaborate: "collaborate",
            build: "build",
            marketplace: "buysell",
            // Legacy redirects (for backwards compatibility)
            me: "grow",
            profile: "grow",
            transformation: "learn",
            teams: "collaborate",
            events: "meet",
            coop: "build",
        };
        return spaceMap[space] || space;
    };

    // Determine active space from URL
    useEffect(() => {
        // Root path `/` + the Journey-family URLs all belong to JOURNEY.
        // This ensures the sections pane renders (and is closable) on
        // /playbook, /path, /my-artifacts, /zone-of-genius — Sasha, 2026-04-21.
        // Day 48 (Sasha): /game/settings joins the family so Pane 2 stays
        // visible on Settings with the same Journey section list.
        // Day 51 night (Sasha 2026-04-25): /ignite added to the journey
        // family. /ignite is part of the funnel arc (the booking/payment
        // surface for Steps 2+3) — keeping pane 2 visible there with the
        // journey items so the user never loses spatial orientation in
        // the 7-step methodology.
        // Day 54 (Sasha 2026-04-28): "/ai-os" removed from this list —
        // AI OS is now its own Space (see SPACES array in SpacesRail.tsx
        // and SPACE_SECTIONS["ai-os"] in SectionsPanel.tsx). The fallback
        // at the bottom of this effect resolves /ai-os and all sub-routes
        // to the "ai-os" space via SPACES.find startsWith match.
        const journeyPaths = ["/", "/playbook", "/path", "/my-artifacts", "/zone-of-genius", "/game/settings", "/dashboard", "/ignite"];
        const isJourneyFamily = journeyPaths.some(
            (p) => location.pathname === p || location.pathname.startsWith(p + "/"),
        );
        if (isJourneyFamily || location.pathname.startsWith("/game/journey")) {
            setActiveSpaceId("journey");
            return;
        }

        const currentSpace = getSpaceFromPath(location.pathname);
        if (currentSpace) {
            setActiveSpaceId(currentSpace);
            return;
        }

        const fallback = SPACES.find((s) => location.pathname.startsWith(s.path) || location.pathname === s.path);
        if (fallback) {
            setActiveSpaceId(fallback.id);
        }
    }, [location.pathname]);

    // Load profile
    const loadProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from("game_profiles")
                .select("first_name, last_name, avatar_url, onboarding_stage, last_zog_snapshot_id, level, xp_total, current_streak_days")
                .eq("user_id", userId)
                .maybeSingle();
            setProfile(data || null);

            // Check if user has Excalibur (genius offer) in zog_snapshots
            if (data?.last_zog_snapshot_id) {
                const { data: snapshotData } = await supabase
                    .from("zog_snapshots")
                    .select("excalibur_data")
                    .eq("id", data.last_zog_snapshot_id)
                    .maybeSingle();
                setHasGeniusOffer(!!snapshotData?.excalibur_data);
            } else {
                setHasGeniusOffer(false);
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
            setProfile(null);
            setHasGeniusOffer(false);
        } finally {
            setProfileLoaded(true);
        }
    };

    const loadProfileById = async (profileId: string) => {
        try {
            const { data } = await supabase
                .from("game_profiles")
                .select("first_name, last_name, avatar_url, onboarding_stage, last_zog_snapshot_id, level, xp_total, current_streak_days")
                .eq("id", profileId)
                .maybeSingle();
            setProfile(data || null);

            // Check if user has Excalibur in zog_snapshots
            if (data?.last_zog_snapshot_id) {
                const { data: snapshotData } = await supabase
                    .from("zog_snapshots")
                    .select("excalibur_data")
                    .eq("id", data.last_zog_snapshot_id)
                    .maybeSingle();
                setHasGeniusOffer(!!snapshotData?.excalibur_data);
            } else {
                setHasGeniusOffer(false);
            }
        } catch (error) {
            console.error("Failed to load profile by ID:", error);
            setProfile(null);
            setHasGeniusOffer(false);
        } finally {
            setProfileLoaded(true);
        }
    };

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            setUser(user);
            if (user) {
                loadProfile(user.id);
            } else {
                try {
                    const profileId = await getOrCreateGameProfileId();
                    await loadProfileById(profileId);
                } catch {
                    setProfile(null);
                }
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                getOrCreateGameProfileId()
                    .then((profileId) => loadProfileById(profileId))
                    .catch(() => setProfile(null));
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Onboarding redirect — send incomplete users to /start
    // EXCEPT on /game/journey/* (public front door + ZoG flow) or
    // /game/settings (Day 48 Sasha: Settings is a public utility page;
    // guests should be able to toggle the skin without hitting /start
    // which is auth-gated and kicks them to /auth).
    useEffect(() => {
        if (!profile?.onboarding_stage) return;
        const needsOnboarding = ["new", "zog_started"].includes(profile.onboarding_stage);
        const publicShellPaths =
            location.pathname === "/" ||
            location.pathname.startsWith("/game/journey") ||
            location.pathname === "/game/settings";
        if (needsOnboarding && location.pathname.startsWith("/game") && !publicShellPaths) {
            navigate("/start");
        }
    }, [profile?.onboarding_stage, location.pathname, navigate]);

    // Day 48 (Sasha): localStorage persistence for sectionsPanelOpen
    // retired. Each page's default state is now computed from the
    // pathname on mount (closed on landing, open everywhere else); a
    // stale "closed" from a previous session no longer bleeds across
    // routes. User's in-page toggle still works — it just resets to
    // the per-page default on the next navigation.

    // Keyboard shortcut: Cmd/Ctrl + B to toggle sections panel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                setSectionsPanelOpen(prev => !prev);
                return;
            }
            if (e.key === "?") {
                const target = e.target as HTMLElement | null;
                const isEditable = target?.matches("input, textarea, [contenteditable='true']");
                if (isEditable) return;
                e.preventDefault();
                setShortcutsOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Show sidebar by default, hide only during early onboarding or when explicitly requested
    // Early onboarding stages: "new", "zog_started" - user hasn't completed basic setup
    const earlyOnboardingStages = ["new", "zog_started"];
    // Day 52 (Sasha 2026-04-26): public marketing surfaces (/, /ai-os,
    // /playbook, /path) must ALWAYS show the navigation panes regardless
    // of onboarding stage. The stage-gate was intended to keep half-
    // onboarded users focused on the assessment funnel — but it was
    // accidentally hiding the rail on /ai-os too, which is its own free
    // top-level destination. On mobile this produced the "AI OS rendered
    // without 1/2 panes" report from Sasha.
    // Day 54 (Sasha 2026-04-28): AI OS elevated from JOURNEY step #4 to
    // its own Space — the public-surface rule still applies to the whole
    // /ai-os tree (Install / Clarity / Iteration / Vibe Code / Design /
    // Benchmark / Pricing), all reachable via the startsWith match below.
    // forceHideNavigation (set explicitly by assessment Step1-4 pages)
    // still wins — those pages truly need full focus. forceShowNavigation
    // (the tour spotlight) keeps overriding everything.
    //
    // Day 53 evening (Sasha 2026-04-27): /dashboard added to the public
    // surface list. The Venture Growth Dashboard is itself a public
    // marketing artifact ("Built in the open. Paid in the open. Open-
    // source methodology.") — visitors landing there should see the
    // navigation rail, not a shell-less full-bleed page. Same mobile-
    // visibility bug Sasha reported for /ai-os was hitting /dashboard.
    const isPublicSurface =
        location.pathname === "/" ||
        location.pathname.startsWith("/ai-os") ||
        location.pathname === "/codex" ||
        location.pathname.startsWith("/playbook") ||
        location.pathname === "/path" ||
        location.pathname === "/dashboard";
    const earlyOnboardingHide =
        !!profile?.onboarding_stage &&
        earlyOnboardingStages.includes(profile.onboarding_stage) &&
        !isPublicSurface;
    const hideNavigation =
        !forceShowNavigation && (forceHideNavigation || earlyOnboardingHide);

    if (hideNavigation) {
        // Day 52 (Sasha): even in the no-nav path, AI OS pages own a dark
        // canvas. Swap the cream/white wrapper for the same deep navy used
        // by the main path. Without this, /ai-os/benchmark on a profile
        // still in early onboarding bleached the entire dark page design.
        const navlessPath = location.pathname;
        // Day 54 (Sasha 2026-04-28): widened to a single startsWith on
        // /ai-os so the new suite sub-routes (clarity / iteration /
        // vibe-code / design) all inherit the same dark canvas in the
        // navless early-onboarding render path.
        const navlessPageOwnsBackground =
            navlessPath === "/codex" ||
            navlessPath === "/ai-os" ||
            navlessPath.startsWith("/ai-os/");
        return (
            <div
                className={
                    navlessPageOwnsBackground
                        ? "min-h-dvh bg-[#0a0a1a]"
                        : "min-h-dvh bg-gradient-to-br from-white via-[#f0f8ff] to-[#f5f5ff]"
                }
            >
                {/* Wabi-sabi Bokeh Overlay — only on the cream variant */}
                {!navlessPageOwnsBackground && (
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(132,96,234,0.06)_0%,transparent_50%)]" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(164,163,208,0.08)_0%,transparent_50%)]" />
                    </div>
                )}
                <SiteLogo />
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        );
    }

    // Unlock status - progressive feature reveal
    // Progressive unlock based on onboarding stage
    // Progression: new → zog_started → zog_complete → qol_started → qol_complete → offer_complete → unlocked
    const stage = profile?.onboarding_stage || "new";

    // For zog_complete: only Profile unlocked (user just signed up, needs to see ZoG + Reveal Business)
    const isZogCompleteStage = stage === "zog_complete";

    // Define what unlocks at each stage
    const qolComplete = ["qol_complete", "offer_complete", "recipe_complete", "unlocked"].includes(stage);
    const offerComplete = ["offer_complete", "recipe_complete", "unlocked"].includes(stage) || hasGeniusOffer;
    const fullUnlock = ["qol_complete", "offer_complete", "recipe_complete", "unlocked"].includes(stage);

    // ═══ PROGRESSIVE UNLOCK — Fog of War ═══
    // Journey is always open. Other spaces unlock as the user advances through methodology steps.
    // Step 1 complete (ZoG done)       → ME unlocks
    // Step 2 complete (Ignition done)  → BUILD unlocks
    // Step 3+ (advancing)              → LEARN, MEET, COLLABORATE, OFFER unlock progressively
    const zogComplete = ["zog_complete", "qol_started", "qol_complete", "offer_complete", "recipe_complete", "unlocked"].includes(stage);
    const ignitionComplete = ["offer_complete", "recipe_complete", "unlocked"].includes(stage) || hasGeniusOffer;

    // NOTE: until `profileLoaded === true`, we intentionally emit an empty map.
    // `SpacesRail` only marks an item as locked when `unlockStatus[id] === false`;
    // `undefined` means "don't render a lock." So we render a neutral rail during
    // the profile fetch, then flip to the real lock state on first real value —
    // no visible lock-then-unlock flicker on ME/LEARN/MEET.
    const unlockStatus: Record<string, boolean> = profileLoaded
        ? {
            "journey": true,                                    // Always open — the front door
            "next-move": zogComplete,                           // After Step 1
            "grow": zogComplete,                                // ME — visible always, locked until ZoG done (Sasha, 2026-04-21)
            "learn": zogComplete,                               // After Step 1 — growth material
            "build": ignitionComplete,                          // After Step 2 — business canvas
            "meet": zogComplete,                                // After Step 1 — community events
            "collaborate": ignitionComplete,                    // After Step 2 — needs a business first
            "buysell": ignitionComplete,                        // After Step 2 — needs offers to sell
        }
        : {};

    // Unlock hint tooltips — shown on hover over locked spaces.
    // Day 48 iter 7 (Sasha): ME's hint sharpened from the generic
    // "Unlocks after Step 1" to the proper product language:
    // "Unlocks after your Find Your Top Talent Reveal." Hovered
    // via the native `title` attribute on the locked chip.
    const unlockHints: Record<string, string> = {
        "next-move": "Unlocks after Step 1",
        "grow": "Unlocks after your Find Your Top Talent Reveal.",
        "learn": "Unlocks after Step 1",
        "build": "Unlocks after Step 2",
        "meet": "Unlocks after Step 1",
        "collaborate": "Unlocks after Step 2",
        "buysell": "Unlocks after Step 2",
    };

    // Nudge badges - visual indicators for unlocked spaces (disabled for now)
    const nudgeBadges: string[] = [];
    // COLLABORATE nudge - will activate when hasResources is tracked
    // if (hasResources && !nudges.collaborateNudgeSeen) {
    //     nudgeBadges.push('collaborate');
    // }

    // Hide-don't-lock (Sasha, 2026-04-21): a locked space just clutters the
    // rail. Anywhere in the app, if a space isn't unlocked, hide it entirely —
    // it reveals itself when the user earns it. JOURNEY and ME are always on.
    // Day 54 r8 (Sasha 2026-04-28): briefly tried "show but ghost at 5-13%"
    // for cosmos visibility, reverted — the dim icons read as "in the making
    // but not ready," cheapening the brand's polish. Hidden is the right call.
    const GATED_SPACES = ["next-move", "learn", "meet", "collaborate", "build", "buysell"] as const;
    const hiddenSpaces: string[] = profileLoaded
        ? GATED_SPACES.filter((id) => unlockStatus[id] === false)
        : // During the profile fetch, default to hiding gated spaces so there's
          // no lock-then-hide flicker on first load.
          [...GATED_SPACES];

    // Navigation handlers
    const handleSpaceSelect = (spaceId: string) => {
        setActiveSpaceId(spaceId);
        // Mark nudge as seen if this space had one
        if (spaceId === 'build' && nudgeBadges.includes('build')) {
            import('@/lib/myNextMoveLogic').then(m => m.markNudgeSeen('build'));
        }
        if (spaceId === 'collaborate' && nudgeBadges.includes('collaborate')) {
            import('@/lib/myNextMoveLogic').then(m => m.markNudgeSeen('collaborate'));
        }
        // Mobile view stays on navigation - both panels visible
    };

    const handleSectionSelect = (path: string) => {
        navigate(path);
        setMobileView("content");
    };

    const handleBackToNavigation = () => {
        setMobileView("navigation");
    };

    const toggleSectionsPanel = () => {
        setSectionsPanelOpen(prev => !prev);
    };

    // Day 51 (Sasha 2026-04-25): route-aware background.
    //
    // The dust/sparkle video is doing two opposite jobs and losing the
    // working one — gorgeous on landing, distracting on dense reading
    // surfaces. Modern working surfaces (Linear, Notion, Apple product
    // docs) use calm canvases for content and reserve visual richness
    // for marketing moments. We do the same.
    //
    // Two reasons to suppress the shell's video:
    //   (a) WORKING route — the page is dense reading content (playbook,
    //       path, settings, UBB artifacts). Render a calm wash instead.
    //   (b) PAGE-OWNED background — the page mounts its own full-screen
    //       background already (e.g. /ai-os has an HLS editorial scene).
    //       Two stacked videos fight at z-0; only one should win, and
    //       the page's choice is more specific.
    const path = location.pathname;
    const pageOwnsBackground =
        path === "/ai-os" ||
        path === "/codex" || // /codex routes through ai-os
        path === "/ai-os/benchmark"; // Day 52: benchmark page owns its own dark canvas
    const isWorkingRoute =
        path.startsWith("/playbook") ||
        path.startsWith("/path") ||
        path.startsWith("/game/settings") ||
        path.startsWith("/ubb") ||
        path.startsWith("/ai-os/profile") ||
        path.startsWith("/ai-os/pricing") ||
        path.startsWith("/ai-os/auth");
    // Day 51 night v4 (Sasha 2026-04-25): shell video now runs on
    // working routes too. Earlier it was suppressed there, which left
    // pane 2's translucent "curtain" with nothing alive behind it on
    // /playbook and /path — the rail read as flat dark navy. Pane 3's
    // heavy cream wash (relocated inside <main>) keeps the editorial
    // feel for content; pane 2 finally has the animated dust to peek
    // through. Only page-owned-bg routes still suppress the shell
    // video (they render their own).
    const suppressShellBackground = pageOwnsBackground;

    return (
        <div className="min-h-dvh bg-[#0a0a1a]">
            {/* Full-screen background — animated video everywhere
                except page-owned-bg routes (which render their own).
                Pane 3 wash sits inside <main> and covers the video
                only in the content column on working routes. */}
            <div className="fixed inset-0 z-0">
                {!suppressShellBackground && <MuxVideoBackground />}
                {/*
                  Base wash USED to live here as `absolute inset-0` —
                  which stretched the cream gradient across the whole
                  viewport, including behind pane 2. Pane 2 is a
                  translucent "curtain" (0.18 alpha) so the cream bled
                  through and the rail read as washed beige.
                  Day 51 night v3 (Sasha 2026-04-25): wash relocated
                  INSIDE <main> (pane 3 column) so it can no longer
                  bleed behind pane 1 / pane 2. The video / shell-bg
                  remains full-viewport here so the curtain effect on
                  panes 1+2 is preserved on landing-class routes.
                */}
            </div>
            {/* === DESKTOP LAYOUT === */}
            {isLgViewport && (
            <div className="flex min-h-dvh">
                {/* Panel 1: Spaces Rail */}
                <SpacesRail
                    activeSpaceId={activeSpaceId}
                    onSpaceSelect={handleSpaceSelect}
                    unlockStatus={unlockStatus}
                    unlockHints={unlockHints}
                    nudgeBadges={nudgeBadges}
                    hiddenSpaces={hiddenSpaces}
                    className="h-dvh sticky top-0"
                    pageOwnsBackground={pageOwnsBackground}
                    userName={profile?.first_name || undefined}
                    userAvatarUrl={profile?.avatar_url || undefined}
                    userLevel={profile?.level || undefined}
                    userXp={profile?.xp_total || undefined}
                />

                {/* Panel 2: Sections with transition.
                    Day 52 (Sasha 2026-04-27): `relative` removed.
                    tailwind-merge dedupes position utilities, and with both
                    `sticky` and `relative` present, `relative` was winning
                    — Pane 2 was scrolling with the page instead of sticking
                    to the viewport top. That made the liquid-glass backdrop
                    compute against scrolled page bg, so items at the bottom
                    of the panel visually fell into a different "zone" once
                    the page scrolled. Sticky elements carry z-index
                    natively, so dropping `relative` doesn't cost the z-30. */}
                <div
                    className={cn(
                        "transition-all duration-200 ease-out h-dvh sticky top-0 overflow-hidden z-30",
                        sectionsPanelOpen ? "w-[260px]" : "w-0"
                    )}
                >
                    <SectionsPanel
                        activeSpaceId={activeSpaceId}
                        onSectionSelect={handleSectionSelect}
                        onClose={toggleSectionsPanel}
                        className="h-full w-[260px]"
                        pageOwnsBackground={pageOwnsBackground}
                    />
                </div>

                {/* Expand button when Panel 2 is collapsed — Day 48 (Sasha):
                    narrower (w-8 → w-5) and dressed with a subtle gold edge
                    glow to match the mockup's warm-metal seam between rail
                    and content.
                    Day 51 (Sasha 2026-04-25): bg dropped to transparent so
                    page-owned-bg routes (/ai-os) let the video extend
                    underneath. The gold seam alone gives the column its
                    presence — no need for an opaque navy strip. */}
                {!sectionsPanelOpen && (
                    <button
                        onClick={toggleSectionsPanel}
                        className="h-dvh sticky top-0 w-5 flex items-center justify-center transition-colors hover:bg-white/5 relative group bg-transparent"
                        title="Expand sidebar (⌘B)"
                        style={{
                            boxShadow:
                                "inset -1px 0 0 rgba(212, 175, 55, 0.35), 2px 0 18px -6px rgba(244, 212, 114, 0.3)",
                        }}
                    >
                        <PanelLeft className="w-3 h-3 text-[#d4af37]/70 group-hover:text-[#d4af37] transition-colors" />
                    </button>
                )}

                {/* Panel 3: Content — lightened another 40% per Sasha (2026-04-21).
                    Progression (bg-black opacity): Rail 70 → Sections 40 → Content 6.
                    Content now barely tints the video.
                    Day 51 (Sasha 2026-04-25): pt-4 dropped on page-owned-bg
                    routes. The .page-transition-enter wrapper carries an
                    animation-fill-forwards transform, which makes it a
                    containing block for fixed descendants. With pt-4 above
                    it, fixed videos (e.g. /ai-os HLS) end up positioned
                    16px below the true viewport top — leaving a thin dark
                    strip where the shell bg shows. Skipping pt-4 here puts
                    the wrapper at top:0 so fixed bg videos reach the top
                    edge as intended. */}
                <main
                    // Day 51 night (Sasha 2026-04-25): `overflow-auto`
                    // dropped. It was creating a non-scrolling sticky
                    // context — sticky descendants (e.g. /playbook's
                    // 7-step spine) tried to react to main's scroll, but
                    // main grows with content so html scrolls instead;
                    // sticky elements never engaged. Without overflow,
                    // sticky correctly references the document root.
                    className={cn(
                        "flex-1 min-h-dvh relative z-10 bg-transparent",
                        pageOwnsBackground ? "" : "pt-4"
                    )}
                >
                    {/* Pane-3 wash — moved here from the shell-wide
                        fixed-overlay so the cream gradient no longer
                        bleeds behind pane 1 / pane 2. Working routes
                        get the heavy calm wash; landing routes get the
                        light atmospheric wash over the shell video.
                        Page-owned-bg routes (/ai-os, /codex) skip this
                        entirely so the page's own video is unobstructed. */}
                    {!pageOwnsBackground && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none -z-10"
                        style={{
                          background: isWorkingRoute
                            ? "var(--skin-panel-wash-quiet, rgba(248, 246, 240, 0.98))"
                            : "var(--skin-panel-wash, rgba(255, 255, 255, 0.21))",
                        }}
                      />
                    )}
                    {/* Logo — fixed upper right. Hidden when hideLogo prop is set.
                        Renders the legacy dodecahedron/fractal icon with a radial
                        mask — reads as a distinct "home button" visually separate
                        from the new brand wordmark that sits in the rail. */}
                    {/* Day 48 iter 9 (Sasha): home icon now rotates slowly
                        via .gentle-spin (60s linear infinite). Matches
                        the rail icons + CTA emblems + ornament centerpiece
                        so every geometric image on the page has the same
                        "breathing object" tempo. */}
                    {/* Day 48 iter 14 (Sasha): rotation via INLINE style
                        (as well as the class) — class-only was failing
                        in preview. Also retired `group-hover:scale-110`
                        on the img because Tailwind's scale utility
                        writes an explicit `transform: ... scale(1.1)`
                        which would interrupt the rotation animation. */}
                    {!hideLogo && (
                        // Day 53 (Sasha 2026-04-27): vertical position
                        // tuned to align the home-icon torus with the
                        // orb in the left-pane logo lockup. Math: pane 1
                        // is 280px, logo renders at 89% width = 249px;
                        // logo aspect 666:375 → 140px tall; 12px top-
                        // padding + 70px to orb's vertical center =
                        // 82px from rail top. Right icon is 40px tall,
                        // so top:62 puts its center at 82 — exact match.
                        <Link to="/" className="absolute top-[62px] right-4 z-50 block w-10 h-10 group">
                            <div
                                className="w-full h-full rounded-lg overflow-hidden"
                                style={{
                                    WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
                                    maskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
                                }}
                            >
                                <img
                                    src={location.pathname.startsWith("/ai-os") ? aiOsHomeIcon : logoSrc}
                                    alt="Home"
                                    className="w-full h-full object-cover gentle-spin-always"
                                    style={{
                                        animation: "gentle-spin 60s linear infinite",
                                        willChange: "transform",
                                        transformOrigin: "center",
                                    }}
                                    draggable={false}
                                />
                            </div>
                        </Link>
                    )}
                    <div className="page-transition-enter">
                        {children}
                    </div>
                </main>
            </div>
            )}

            {/* === MOBILE LAYOUT === */}
            {!isLgViewport && (
            <div className="relative w-full min-h-dvh overflow-hidden">
                {/* Mobile: Navigation View (Panel 1 + Panel 2) */}
                <div
                    className={cn(
                        "absolute inset-0 flex transition-transform duration-300 ease-out",
                        mobileView === "navigation" ? "translate-x-0" : "-translate-x-full"
                    )}
                    style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    {/* Panel 1: Spaces Rail */}
                    <SpacesRail
                        activeSpaceId={activeSpaceId}
                        onSpaceSelect={handleSpaceSelect}
                        unlockStatus={unlockStatus}
                        unlockHints={unlockHints}
                        nudgeBadges={nudgeBadges}
                        hiddenSpaces={hiddenSpaces}
                        pageOwnsBackground={pageOwnsBackground}
                        userName={profile?.first_name || undefined}
                        userAvatarUrl={profile?.avatar_url || undefined}
                        userLevel={profile?.level || undefined}
                        userXp={profile?.xp_total || undefined}
                    />

                    {/* Panel 2: Sections */}
                    <div className="flex-1">
                        <SectionsPanel
                            activeSpaceId={activeSpaceId}
                            onSectionSelect={handleSectionSelect}
                            className="w-full h-full"
                            pageOwnsBackground={pageOwnsBackground}
                        />
                    </div>
                </div>

                {/* Mobile: Content View with Back Button */}
                <div
                    className={cn(
                        "absolute inset-0 flex flex-col transition-transform duration-300 ease-out",
                        mobileView === "content" ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    {/* Day 50 (Sasha): mobile content-view header now
                        mirrors the landing's pane 2 chrome — navy panel
                        wash + gold spine at the bottom, Cormorant title
                        in tracked gold small-caps. Same visual register
                        as the desktop pane 2 header so the brand
                        doesn't reset when crossing breakpoints. */}
                    {/* Day 51 (Sasha 2026-04-25): mobile content-view header.
                        Was using `var(--skin-panel-2-bg)` which in the Aurora
                        (light) skin resolved to a light lavender wash — gold
                        text on light bg = unreadable. Now forced to a solid
                        dark navy (skin-independent) so gold text always reads.
                        Title also gets dark text-shadow as belt-and-suspenders. */}
                    <header
                        className="flex items-center pl-2 pr-4 gap-3 sticky top-0 z-modal relative overflow-hidden"
                        style={{
                            paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)',
                            paddingBottom: '0.5rem',
                            minHeight: '3.5rem',
                            backgroundColor: 'rgba(10, 22, 50, 0.96)',
                            backdropFilter: 'blur(14px)',
                            WebkitBackdropFilter: 'blur(14px)',
                            boxShadow: 'inset 0 -1px 0 rgba(212, 175, 55, 0.32), 0 8px 22px -12px rgba(244, 212, 114, 0.25)',
                        }}
                    >
                        {/* Gold spine accent — same signature as pane 2 */}
                        <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                            style={{
                                backgroundImage:
                                    'linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(244,212,114,0.52) 50%, rgba(212,175,55,0) 100%)',
                            }}
                        />
                        {/* Day 53 (Sasha 2026-04-27): mobile menu pill —
                            brand torus mark + hamburger icon. Word "MENU"
                            retired (Sasha) — the brand glyph + ☰ together
                            read as "home + open menu" cohesively, doubles
                            as identity reinforcement, and the hamburger is
                            well-understood without a label in 2026.
                            44px min tap target preserved. */}
                        <button
                            onClick={handleBackToNavigation}
                            className="min-h-[44px] inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-all relative hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                color: '#f4d472',
                                background: 'rgba(244,212,114,0.08)',
                                border: '1px solid rgba(244,212,114,0.30)',
                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
                                boxShadow: '0 0 12px -4px rgba(244,212,114,0.25)',
                            }}
                            aria-label="Open menu"
                        >
                            <img
                                src={brandMark}
                                alt=""
                                aria-hidden="true"
                                className="w-7 h-7 object-contain flex-shrink-0"
                                draggable={false}
                            />
                            <Menu className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        </button>
                        {/* Day 53 (Sasha 2026-04-27): mobile breadcrumb.
                            Stacked iOS-native nested-nav pattern — small
                            tracked-uppercase eyebrow shows the SPACE
                            (where you are in the architecture); larger
                            Cormorant anchor below shows the active SECTION
                            within that space (where you actually are).
                            The hierarchy is visible without a separator
                            chevron, gracefully handles long section names,
                            and matches the editorial typography used
                            elsewhere in the brand. Falls back to just the
                            space name when the section can't be derived
                            (e.g., paths that aren't section-mapped). */}
                        {(() => {
                            const spaceLabel = SPACES.find(s => s.id === activeSpaceId)?.label || "Journey";
                            const pathname = location.pathname;

                            // Resolve active section label.
                            let sectionLabel: string | null = null;
                            if (activeSpaceId === "journey") {
                                const match = JOURNEY_SECTION_LABELS.find(
                                    (s) =>
                                        pathname === s.path ||
                                        (s.path !== "/" && pathname.startsWith(s.path + "/")),
                                );
                                sectionLabel = match?.label ?? null;
                            } else {
                                const space = (SPACE_SECTIONS as any)[activeSpaceId];
                                if (space?.sections?.length) {
                                    // Subsections first (more specific), then sections.
                                    for (const section of space.sections) {
                                        if (section.subSections) {
                                            for (const sub of section.subSections) {
                                                if (
                                                    pathname === sub.path ||
                                                    pathname.startsWith(sub.path + "/")
                                                ) {
                                                    sectionLabel = sub.label;
                                                    break;
                                                }
                                            }
                                        }
                                        if (sectionLabel) break;
                                    }
                                    if (!sectionLabel) {
                                        for (const section of space.sections) {
                                            if (
                                                pathname === section.path ||
                                                pathname.startsWith(section.path + "/")
                                            ) {
                                                sectionLabel = section.label;
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                            return (
                                <div className="flex-1 min-w-0 flex flex-col leading-tight relative">
                                    <span
                                        className="text-[10px] font-medium tracking-[0.28em] uppercase truncate"
                                        style={{
                                            color: 'rgba(244,212,114,0.72)',
                                            textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                                        }}
                                    >
                                        {spaceLabel}
                                    </span>
                                    {sectionLabel && (
                                        <span
                                            className="text-sm sm:text-base truncate -mt-0.5"
                                            style={{
                                                color: 'rgba(255,255,255,0.96)',
                                                textShadow: '0 1px 2px rgba(0,0,0,0.7), 0 0 14px rgba(244,212,114,0.30)',
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontWeight: 500,
                                                letterSpacing: '0.005em',
                                            }}
                                        >
                                            {sectionLabel}
                                        </span>
                                    )}
                                </div>
                            );
                        })()}
                    </header>

                    {/* Content with safe area bottom + top breathing room.
                        Day 51 night (Sasha 2026-04-25): added pt-4 so a
                        page's first line doesn't butt up against the
                        sticky JOURNEY header (was clipping the H1 on
                        /zone-of-genius gateway). Matches desktop main's
                        pt-4 convention for non-page-owned-bg routes. */}
                    <main
                        className={cn(
                            "flex-1 overflow-auto relative",
                            pageOwnsBackground ? "" : "pt-4"
                        )}
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                        {/* Pane-3 wash on mobile — Day 51 night (Sasha
                            2026-04-25): mirror of the desktop fix, with
                            one mobile-specific deviation. On the LANDING
                            route, desktop uses --skin-panel-wash (10%
                            white) so the video reads almost full-saturation
                            behind the hero — works on desktop because the
                            video has room to breathe at scale. On mobile,
                            the dust particles render at the same size as
                            the hero copy and chew up legibility. So mobile
                            landing uses a stronger flat cream wash (~55%)
                            that preserves a hint of the video as texture
                            but tames the noise enough for text to read.
                            Working routes still get the heavy cream
                            radial; page-owned-bg routes skip entirely. */}
                    {!pageOwnsBackground && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none -z-10"
                        style={{
                          background: isWorkingRoute
                            ? "var(--skin-panel-wash-quiet, rgba(248, 246, 240, 0.98))"
                            : "rgba(248, 246, 240, 0.55)",
                        }}
                      />
                    )}
                        <div className="page-transition-enter">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            )}
            <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        </div>
    );
};

export default GameShellV2;
