import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, PanelLeftClose, PanelLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { cn } from "@/lib/utils";
import SpacesRail, { SPACES } from "./SpacesRail";
import SectionsPanel from "./SectionsPanel";

interface GameShellV2Props {
    children: ReactNode;
}

/**
 * GameShellV2 - Three-panel Discord-style navigation
 * Panel 1: SpacesRail (icons)
 * Panel 2: SectionsPanel (sections list)  
 * Panel 3: Content area
 */
export const GameShellV2 = ({ children }: GameShellV2Props) => {
    const location = useLocation();
    const navigate = useNavigate();

    // User & profile state
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<{
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        onboarding_stage?: string | null;
    } | null>(null);
    const [hasGeniusOffer, setHasGeniusOffer] = useState(false);

    // Navigation state
    const [activeSpaceId, setActiveSpaceId] = useState<string>("next-move");
    const [sectionsPanelOpen, setSectionsPanelOpen] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sectionsPanelOpen');
            return saved !== null ? JSON.parse(saved) : true;
        }
        return true;
    });
    const [mobileView, setMobileView] = useState<"navigation" | "content">("navigation");

    // Determine active space from URL
    useEffect(() => {
        const path = location.pathname;
        const space = SPACES.find(s => path.startsWith(s.path) || path === s.path);
        if (space) {
            setActiveSpaceId(space.id);
        }
    }, [location.pathname]);

    // Load profile
    const loadProfile = async (userId: string) => {
        const { data } = await supabase
            .from("game_profiles")
            .select("first_name, last_name, avatar_url, onboarding_stage")
            .eq("user_id", userId)
            .maybeSingle();
        setProfile(data || null);

        const { data: offerData } = await supabase
            .from("genius_offer_requests")
            .select("status")
            .eq("user_id", userId)
            .maybeSingle();
        setHasGeniusOffer(offerData?.status === "completed");
    };

    const loadProfileById = async (profileId: string) => {
        const { data } = await supabase
            .from("game_profiles")
            .select("first_name, last_name, avatar_url, onboarding_stage")
            .eq("id", profileId)
            .maybeSingle();
        setProfile(data || null);
        setHasGeniusOffer(false);
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

    // Onboarding redirect
    useEffect(() => {
        if (!profile?.onboarding_stage) return;
        const needsOnboarding = ["new", "zog_started"].includes(profile.onboarding_stage);
        if (needsOnboarding && location.pathname.startsWith("/game")) {
            navigate("/start");
        }
    }, [profile?.onboarding_stage, location.pathname, navigate]);

    // Persist sections panel state to localStorage
    useEffect(() => {
        localStorage.setItem('sectionsPanelOpen', JSON.stringify(sectionsPanelOpen));
    }, [sectionsPanelOpen]);

    // Keyboard shortcut: Cmd/Ctrl + B to toggle sections panel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
                e.preventDefault();
                setSectionsPanelOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Show sidebar by default, hide only during early onboarding
    // Early onboarding stages: "new", "zog_started" - user hasn't completed basic setup
    const earlyOnboardingStages = ["new", "zog_started"];
    const hideNavigation = profile?.onboarding_stage && earlyOnboardingStages.includes(profile.onboarding_stage);

    if (hideNavigation) {
        return (
            <div className="min-h-dvh bg-white">
                {children}
            </div>
        );
    }

    // Unlock status
    const unlockStatus: Record<string, boolean> = {
        teams: profile?.onboarding_stage === "unlocked",
        marketplace: hasGeniusOffer,
        coop: hasGeniusOffer,
    };

    // Navigation handlers
    const handleSpaceSelect = (spaceId: string) => {
        setActiveSpaceId(spaceId);
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
        <div className="min-h-dvh bg-[#f0f8ff]">
            {/* === DESKTOP LAYOUT === */}
            <div className="hidden lg:flex min-h-dvh">
                {/* Panel 1: Spaces Rail */}
                <SpacesRail
                    activeSpaceId={activeSpaceId}
                    onSpaceSelect={handleSpaceSelect}
                    unlockStatus={unlockStatus}
                    className="h-dvh sticky top-0"
                />

                {/* Panel 2: Sections with transition */}
                <div
                    className={cn(
                        "transition-all duration-200 ease-out h-dvh sticky top-0 overflow-hidden",
                        sectionsPanelOpen ? "w-[240px]" : "w-0"
                    )}
                >
                    <SectionsPanel
                        activeSpaceId={activeSpaceId}
                        onSectionSelect={handleSectionSelect}
                        onClose={toggleSectionsPanel}
                        className="h-full w-[240px]"
                    />
                </div>

                {/* Expand button when Panel 2 is collapsed */}
                {!sectionsPanelOpen && (
                    <button
                        onClick={toggleSectionsPanel}
                        className="h-dvh sticky top-0 w-8 bg-slate-800 hover:bg-slate-700 flex items-center justify-center border-r border-slate-700 transition-colors"
                        title="Expand sidebar (⌘B)"
                    >
                        <PanelLeft className="w-4 h-4 text-slate-400" />
                    </button>
                )}

                {/* Panel 3: Content */}
                <main className="flex-1 bg-[#f0f8ff] min-h-dvh overflow-auto">
                    {children}
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
                    />

                    {/* Panel 2: Sections */}
                    <div className="flex-1 bg-slate-800">
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
                    {/* Mobile Header with safe area */}
                    <header
                        className="bg-slate-900 flex items-center px-4 gap-3 sticky top-0 z-modal"
                        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)', paddingBottom: '0.5rem', minHeight: '3.5rem' }}
                    >
                        <button
                            onClick={handleBackToNavigation}
                            className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                            aria-label="Back to navigation"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="text-white font-medium flex-1 truncate">
                            {SPACES.find(s => s.id === activeSpaceId)?.label || "Evolver"}
                        </span>
                    </header>

                    {/* Content with safe area bottom */}
                    <main
                        className="flex-1 bg-[#f0f8ff] overflow-auto"
                        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                    >
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default GameShellV2;
