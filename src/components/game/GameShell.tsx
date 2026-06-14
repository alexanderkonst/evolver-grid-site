import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Compass,
    User,
    Sparkles,
    Store,
    Users,
    CalendarDays,
    Building2,
    Lock,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    PanelLeft
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { useToast } from "@/hooks/use-toast";

interface ModuleItem {
    id: string;
    labelKey: string;
    path: string;
}

interface NavItem {
    id: string;
    labelKey: string;
    icon: ReactNode;
    path: string;
    descriptionKey: string;
    modules?: ModuleItem[];
}

const SPACES: NavItem[] = [
    // Hidden until built — uncomment to re-enable
    // {
    //     id: "next-move",
    //     label: "My Next Move",
    //     icon: <Compass className="w-5 h-5" />,
    //     path: "/game/next-move",
    //     description: "Recommended Action"
    // },
    {
        id: "profile",
        labelKey: "gameShell.nav.profile.label",
        icon: <User className="w-5 h-5" />,
        path: "/game/me",
        descriptionKey: "gameShell.nav.profile.description",
        modules: [
            { id: "zog", labelKey: "gameShell.nav.profile.modules.zog", path: "/zone-of-genius/entry" },
            { id: "qol", labelKey: "gameShell.nav.profile.modules.qol", path: "/quality-of-life-map/assessment" }
        ]
    },
    {
        id: "transformation",
        labelKey: "gameShell.nav.transformation.label",
        icon: <Sparkles className="w-5 h-5" />,
        path: "/game/transformation",
        descriptionKey: "gameShell.nav.transformation.description",
        modules: [
            { id: "library", labelKey: "gameShell.nav.transformation.modules.library", path: "/library" },
            { id: "paths", labelKey: "gameShell.nav.transformation.modules.paths", path: "/growth-paths" }
        ]
    },
    {
        id: "marketplace",
        labelKey: "gameShell.nav.marketplace.label",
        icon: <Store className="w-5 h-5" />,
        path: "/game/marketplace",
        descriptionKey: "gameShell.nav.marketplace.description"
    },
    {
        id: "teams",
        labelKey: "gameShell.nav.teams.label",
        icon: <Users className="w-5 h-5" />,
        path: "/game/teams",
        descriptionKey: "gameShell.nav.teams.description",
        modules: [
            { id: "matches", labelKey: "gameShell.nav.teams.modules.matches", path: "/game/matches" },
            { id: "people", labelKey: "gameShell.nav.teams.modules.people", path: "/community/people" }
        ]
    },
    {
        id: "events",
        labelKey: "gameShell.nav.events.label",
        icon: <CalendarDays className="w-5 h-5" />,
        path: "/game/events",
        descriptionKey: "gameShell.nav.events.description"
    },
    {
        id: "coop",
        labelKey: "gameShell.nav.coop.label",
        icon: <Building2 className="w-5 h-5" />,
        path: "/game/coop",
        descriptionKey: "gameShell.nav.coop.description"
    }
];

interface GameShellProps {
    children: ReactNode;
}

export const GameShell = ({ children }: GameShellProps) => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<{
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        onboarding_stage?: string | null;
        zone_of_genius_completed?: boolean | null;
    } | null>(null);
    const [hasGeniusOffer, setHasGeniusOffer] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());

    const loadProfile = async (userId: string) => {
        const { data } = await supabase
            .from("game_profiles")
            .select("first_name, last_name, avatar_url, onboarding_stage, zone_of_genius_completed")
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
            .select("first_name, last_name, avatar_url, onboarding_stage, zone_of_genius_completed")
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
                } catch (err) {
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

    const handleLogout = async () => {
        // Clear user-specific localStorage to prevent profile mixing on shared devices
        window.localStorage.removeItem("game_profile_id");
        window.localStorage.removeItem("guest_appleseed_data");
        window.localStorage.removeItem("guest_ai_response");
        window.localStorage.removeItem("guest_excalibur_data");
        window.localStorage.removeItem("invited_by_profile_id");
        await supabase.auth.signOut();
        navigate("/");
    };

    const showSidebar = !profile?.onboarding_stage || ["qol_complete", "unlocked"].includes(profile.onboarding_stage);

    // Spaces unlock when Zone of Genius is completed
    const zogComplete = profile?.zone_of_genius_completed === true;

    // Profile and Transformation are always unlocked
    // Teams and Events require ZoG completion
    // Marketplace and Coop require Genius Offer
    const unlockStatus = {
        teams: zogComplete,
        marketplace: hasGeniusOffer,
        coop: hasGeniusOffer,
        events: zogComplete,
    };

    const unlockHints = {
        teams: t("gameShell.unlockHints.teams"),
        marketplace: t("gameShell.unlockHints.marketplace"),
        coop: t("gameShell.unlockHints.coop"),
        events: t("gameShell.unlockHints.events"),
    };

    useEffect(() => {
        if (!profile?.onboarding_stage) return;
        const needsOnboarding = ["new", "zog_started"].includes(profile.onboarding_stage);
        if (needsOnboarding && location.pathname.startsWith("/game")) {
            navigate("/start");
        }
    }, [profile?.onboarding_stage, location.pathname, navigate]);

    if (!showSidebar) {
        return (
            <div className="min-h-dvh bg-white">
                {children}
            </div>
        );
    }

    const isActive = (path: string) => {
        if (path === "/game/next-move" || path === "/game") {
            return location.pathname === "/game" || location.pathname === "/game/next-move";
        }
        return location.pathname.startsWith(path);
    };

    const toggleExpanded = (spaceId: string) => {
        const newExpanded = new Set(expandedSpaces);
        if (newExpanded.has(spaceId)) {
            newExpanded.delete(spaceId);
        } else {
            newExpanded.add(spaceId);
        }
        setExpandedSpaces(newExpanded);
    };

    return (
        <div className="min-h-dvh bg-white flex">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-safe-14 bg-white border-b border-[#a4a3d0]/20 z-modal flex items-center justify-between px-4 pt-safe">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-[#a4a3d0]/10 rounded-lg"
                    aria-label={sidebarOpen ? t("gameShell.aria.closeSidebar") : t("gameShell.aria.openSidebar")}
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <span className="font-bold text-[#2c3150]">{t("gameShell.brand")}</span>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-overlay
          ${desktopSidebarOpen ? 'w-64' : 'lg:w-0 lg:overflow-hidden'}
          bg-[#1a1d2e] border-r border-[#2c3150]
          transform transition-all duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${desktopSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"}
          flex flex-col
        `}
            >
                {/* Logo */}
                <div className="h-safe-14 lg:h-16 flex items-center justify-between px-4 pt-safe lg:pt-0 border-b border-[#2c3150]">
                    <Link to="/" className="font-bold text-lg text-white">
                        {t("gameShell.brand")}
                    </Link>
                    {/* Desktop collapse button */}
                    <button
                        onClick={() => setDesktopSidebarOpen(false)}
                        className="hidden lg:block p-1.5 text-[#a4a3d0] hover:text-white hover:bg-[#2c3150] rounded-md transition-colors"
                        title={t("gameShell.aria.collapseSidebar")}
                        aria-label={t("gameShell.aria.collapseSidebar")}
                    >
                        <PanelLeftClose className="w-4 h-4" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <div className="space-y-1">
                        {SPACES.map((item) => (
                            <div key={item.id}>
                                {(() => {
                                    const isUnlocked = unlockStatus[item.id as keyof typeof unlockStatus] ?? true;
                                    const hint = unlockHints[item.id as keyof typeof unlockHints];
                                    const showModules = isUnlocked && item.modules && item.modules.length > 0;
                                    const linkClasses = `
                                            flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg
                                            transition-colors duration-150
                                            ${!isUnlocked
                                            ? "text-[rgba(44,49,80,0.7)] bg-[#1a1d2e]/60 cursor-not-allowed"
                                            : isActive(item.path)
                                                ? "bg-[#2c3150] text-white"
                                                : "text-[#a4a3d0] hover:bg-[#2c3150] hover:text-white"
                                        }
                                        `;

                                    const content = (
                                        <>
                                            {item.icon}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{t(item.labelKey)}</p>
                                                <p className={`text-xs truncate ${isActive(item.path) ? "text-[#a4a3d0]" : "text-[#a4a3d0]/60"}`}>
                                                    {t(item.descriptionKey)}
                                                </p>
                                            </div>
                                            {!isUnlocked && <Lock className="w-4 h-4 text-[#a4a3d0]/60" />}
                                        </>
                                    );

                                    return (
                                        <div className="flex items-center">
                                            {isUnlocked ? (
                                                <Link
                                                    to={item.path}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={linkClasses}
                                                >
                                                    {content}
                                                </Link>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        toast({
                                                            title: t("gameShell.toast.lockedTitle"),
                                                            description: hint || t("gameShell.toast.lockedFallback"),
                                                        });
                                                    }}
                                                    className={linkClasses}
                                                    title={hint}
                                                    aria-disabled="true"
                                                >
                                                    {content}
                                                </button>
                                            )}
                                            {showModules && (
                                                <button
                                                    onClick={() => toggleExpanded(item.id)}
                                                    className="p-2 text-[#a4a3d0] hover:text-white"
                                                >
                                                    {expandedSpaces.has(item.id)
                                                        ? <ChevronDown className="w-4 h-4" />
                                                        : <ChevronRight className="w-4 h-4" />
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    );
                                })()}
                                {/* Modules dropdown - smaller font, indent */}
                                {item.modules && expandedSpaces.has(item.id) && (unlockStatus[item.id as keyof typeof unlockStatus] ?? true) && (
                                    <div className="ml-10 mt-1 space-y-0.5 border-l border-[#2c3150] pl-3">
                                        {item.modules.map((module) => (
                                            <Link
                                                key={module.id}
                                                to={module.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`
                                                    block px-2 py-1 rounded-md text-xs font-normal
                                                    ${location.pathname.startsWith(module.path)
                                                        ? "text-white bg-[#2c3150]/50"
                                                        : "text-[#a4a3d0]/60 hover:text-[#a4a3d0] hover:bg-[#2c3150]/30"
                                                    }
                                                `}
                                            >
                                                {t(module.labelKey)}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* User Section */}
                <div className="border-t border-[#2c3150] p-4">
                    {user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#2c3150] text-white flex items-center justify-center overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt={t("gameShell.user.avatarAlt")}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.src = "/placeholder.svg";
                                            }}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-semibold">
                                            {(profile?.first_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-white truncate">
                                        {profile?.first_name || user.email?.split("@")[0] || t("gameShell.user.fallbackName")}
                                    </p>
                                    <p className="text-xs text-[#a4a3d0] truncate">{user.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-[#a4a3d0] hover:text-white hover:bg-[#2c3150]"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {t("gameShell.user.signOut")}
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-[#2c3150] text-[#a4a3d0] hover:bg-[#2c3150] hover:text-white"
                            onClick={() => navigate("/auth")}
                        >
                            {t("gameShell.user.signIn")}
                        </Button>
                    )}
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-fixed lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Desktop sidebar expand button (when collapsed) */}
            {!desktopSidebarOpen && (
                <button
                    onClick={() => setDesktopSidebarOpen(true)}
                    className="hidden lg:flex fixed top-4 left-4 z-modal items-center justify-center w-10 h-10 bg-[#1a1d2e] text-[#a4a3d0] hover:text-white rounded-lg shadow-lg border border-[#2c3150] transition-colors"
                    title={t("gameShell.aria.expandSidebar")}
                    aria-label={t("gameShell.aria.expandSidebar")}
                >
                    <PanelLeft className="w-5 h-5" />
                </button>
            )}

            {/* Main Content */}
            <main className={`flex-1 pt-safe-14 lg:pt-0 transition-all duration-200 ${!desktopSidebarOpen ? 'lg:pl-0' : ''}`}>
                <div className="min-h-dvh">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default GameShell;
