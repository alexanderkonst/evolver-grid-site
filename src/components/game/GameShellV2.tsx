import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, PanelLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { cn } from "@/lib/utils";
// Day 48 (Sasha): swapped the legacy dodecahedron icon for the new
// brand orb (cropped from the FIND YOUR TOP TALENT logo). Same image
// as the SpacesRail wordmark — consistent visual identity across the
// two corners of the shell.
import brandLogo from "@/assets/find-your-top-talent-logo.png";
import SpacesRail, { SPACES } from "./SpacesRail";
import SectionsPanel from "./SectionsPanel";
import PlayerStatsBadge from "./PlayerStatsBadge";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import SiteLogo from "@/components/SiteLogo";
// hls.js is dynamically imported inside MuxVideoBackground to avoid module-level crashes
// import { loadNudgeState } from "@/lib/myNextMoveLogic";

/** Animated video background — Mux HLS stream behind all panels */
const MUX_BG_URL = "https://stream.mux.com/8DFxbzBL8jIJYpaZv3s6kDx4AfPkVI1gH4bBh38GNw8.m3u8";

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
        <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            aria-hidden="true"
            onError={() => setVideoFailed(true)}
        />
    );
};

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
    const [mobileView, setMobileView] = useState<"navigation" | "content">("navigation");
    const [shortcutsOpen, setShortcutsOpen] = useState(false);

    const getSpaceFromPath = (pathname: string): string | undefined => {
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
        const journeyPaths = ["/", "/playbook", "/path", "/my-artifacts", "/zone-of-genius", "/game/settings"];
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
    const hideNavigation = !forceShowNavigation && (forceHideNavigation || (profile?.onboarding_stage && earlyOnboardingStages.includes(profile.onboarding_stage)));

    if (hideNavigation) {
        return (
            <div className="min-h-dvh bg-gradient-to-br from-white via-[#f0f8ff] to-[#f5f5ff]">
                {/* Wabi-sabi Bokeh Overlay */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(132,96,234,0.06)_0%,transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(164,163,208,0.08)_0%,transparent_50%)]" />
                </div>
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

    // Unlock hint tooltips — shown on hover over locked spaces
    const unlockHints: Record<string, string> = {
        "next-move": "Unlocks after Step 1",
        "grow": "Unlocks after Step 1",
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

    return (
        <div className="min-h-dvh bg-[#0a0a1a]">
            {/* Full-screen animated video background — behind all three panels */}
            <div className="fixed inset-0 z-0">
                <MuxVideoBackground />
                {/*
                  Base wash — skin-aware. Aurora: white wash /0.21 (daylight
                  frost). Navy+Gold: deep navy wash /0.82 (evening, video
                  barely flickers through). Var lives in index.css per skin.
                */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor:
                      "var(--skin-panel-wash, rgba(255, 255, 255, 0.21))",
                  }}
                />
            </div>
            {/* === DESKTOP LAYOUT === */}
            <div className="hidden lg:flex min-h-dvh">
                {/* Panel 1: Spaces Rail */}
                <SpacesRail
                    activeSpaceId={activeSpaceId}
                    onSpaceSelect={handleSpaceSelect}
                    unlockStatus={unlockStatus}
                    unlockHints={unlockHints}
                    nudgeBadges={nudgeBadges}
                    hiddenSpaces={hiddenSpaces}
                    className="h-dvh sticky top-0"
                    userName={profile?.first_name || undefined}
                    userAvatarUrl={profile?.avatar_url || undefined}
                    userLevel={profile?.level || undefined}
                    userXp={profile?.xp_total || undefined}
                />

                {/* Panel 2: Sections with transition */}
                <div
                    className={cn(
                        "transition-all duration-200 ease-out h-dvh sticky top-0 overflow-hidden",
                        sectionsPanelOpen ? "w-[260px]" : "w-0"
                    )}
                >
                    <SectionsPanel
                        activeSpaceId={activeSpaceId}
                        onSectionSelect={handleSectionSelect}
                        onClose={toggleSectionsPanel}
                        className="h-full w-[260px]"
                    />
                </div>

                {/* Expand button when Panel 2 is collapsed — Day 48 (Sasha):
                    narrower (w-8 → w-5) and dressed with a subtle gold edge
                    glow to match the mockup's warm-metal seam between rail
                    and content. */}
                {!sectionsPanelOpen && (
                    <button
                        onClick={toggleSectionsPanel}
                        className="h-dvh sticky top-0 w-5 flex items-center justify-center transition-colors hover:bg-white/5 relative group"
                        title="Expand sidebar (⌘B)"
                        style={{
                            backgroundColor: "var(--skin-panel-2-bg, rgba(14, 32, 68, 0.42))",
                            boxShadow:
                                "inset -1px 0 0 rgba(212, 175, 55, 0.35), 2px 0 18px -6px rgba(244, 212, 114, 0.3)",
                        }}
                    >
                        <PanelLeft className="w-3 h-3 text-[#d4af37]/70 group-hover:text-[#d4af37] transition-colors" />
                    </button>
                )}

                {/* Panel 3: Content — lightened another 40% per Sasha (2026-04-21).
                    Progression (bg-black opacity): Rail 70 → Sections 40 → Content 6.
                    Content now barely tints the video. */}
                <main
                    className="flex-1 min-h-dvh overflow-auto relative z-10 pt-4 bg-transparent"
                >
                    {/* Logo — fixed upper right. Hidden when hideLogo prop is set.
                        Day 48 (Sasha): renders the brand orb (cropped from the
                        top-left of the logo PNG via background-position). Keeps
                        the wordmark for the rail, uses just the orb as the
                        corner icon so the two brand hits feel connected but
                        not repeated. */}
                    {!hideLogo && (
                        <Link
                            to="/"
                            className="absolute top-4 right-4 z-50 block w-10 h-10 group"
                            aria-label="Home — Find Your Top Talent"
                        >
                            <div
                                className="w-full h-full rounded-full transition-transform duration-300 group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${brandLogo})`,
                                    backgroundSize: "auto 100%",
                                    backgroundPosition: "left center",
                                    backgroundRepeat: "no-repeat",
                                    filter: "drop-shadow(0 0 10px rgba(244, 212, 114, 0.35))",
                                }}
                                aria-hidden="true"
                            />
                        </Link>
                    )}
                    <div className="page-transition-enter">
                        {children}
                    </div>
                </main>
            </div>

            {/* === MOBILE LAYOUT === */}
            <div className="lg:hidden relative w-full min-h-dvh overflow-hidden">
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
                    <header
                        className="bg-black/30 backdrop-blur-xl flex items-center px-4 gap-3 sticky top-0 z-modal border-b border-white/10"
                        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)', paddingBottom: '0.5rem', minHeight: '3.5rem' }}
                    >
                        <button
                            onClick={handleBackToNavigation}
                            className="min-h-[44px] min-w-[44px] p-2 text-white/70 hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Back to navigation"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="text-white/90 font-medium flex-1 truncate">
                            {SPACES.find(s => s.id === activeSpaceId)?.label || "Genius Business"}
                        </span>
                    </header>

                    {/* Content with safe area bottom */}
                    <main
                        className="flex-1 overflow-auto relative"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                        <div className="page-transition-enter">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <KeyboardShortcuts open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        </div>
    );
};

export default GameShellV2;
