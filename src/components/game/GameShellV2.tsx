import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
    const [sectionsPanelOpen, setSectionsPanelOpen] = useState(true);
    const [mobileView, setMobileView] = useState<"spaces" | "sections" | "content">("spaces");

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

    // Show minimal shell during onboarding
    const showSidebar = !profile?.onboarding_stage || ["qol_complete", "unlocked"].includes(profile.onboarding_stage);
    if (!showSidebar) {
        return (
            <div className="min-h-screen bg-white">
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
        setMobileView("sections");
    };

    const handleSectionSelect = (path: string) => {
        navigate(path);
        setMobileView("content");
    };

    const handleBackToSections = () => {
        setMobileView("sections");
    };

    const handleBackToSpaces = () => {
        setMobileView("spaces");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* === DESKTOP LAYOUT === */}
            <div className="hidden lg:flex h-screen">
                {/* Panel 1: Spaces Rail */}
                <SpacesRail
                    activeSpaceId={activeSpaceId}
                    onSpaceSelect={handleSpaceSelect}
                    unlockStatus={unlockStatus}
                    className="h-screen sticky top-0"
                />

                {/* Panel 2: Sections */}
                {sectionsPanelOpen && (
                    <SectionsPanel
                        activeSpaceId={activeSpaceId}
                        onSectionSelect={handleSectionSelect}
                        className="h-screen sticky top-0"
                    />
                )}
            </div>

            {/* === MOBILE LAYOUT === */}
            <div className="lg:hidden flex flex-col w-full min-h-screen">
                {/* Mobile: Spaces + Sections View */}
                {mobileView !== "content" && (
                    <div className="flex h-screen">
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
                )}

                {/* Mobile: Content View with Back Button */}
                {mobileView === "content" && (
                    <div className="flex flex-col min-h-screen">
                        {/* Mobile Header */}
                        <header className="h-14 bg-slate-900 flex items-center px-4 gap-3 sticky top-0 z-50">
                            <button
                                onClick={handleBackToSections}
                                className="p-2 text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <span className="text-white font-medium flex-1 truncate">
                                {SPACES.find(s => s.id === activeSpaceId)?.label || "Evolver"}
                            </span>
                        </header>

                        {/* Content */}
                        <main className="flex-1 bg-slate-50">
                            {children}
                        </main>
                    </div>
                )}
            </div>

            {/* === DESKTOP CONTENT === */}
            <main className="hidden lg:block flex-1 bg-slate-50 min-h-screen">
                {children}
            </main>
        </div>
    );
};

export default GameShellV2;
