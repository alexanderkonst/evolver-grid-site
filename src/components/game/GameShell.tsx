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
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { useToast } from "@/hooks/use-toast";

interface ModuleItem {
    id: string;
    label: string;
    path: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: ReactNode;
    path: string;
    description: string;
    modules?: ModuleItem[];
}

const SPACES: NavItem[] = [
    {
        id: "next-move",
        label: "My Next Move",
        icon: <Compass className="w-5 h-5" />,
        path: "/game/next-move",
        description: "Recommended Action"
    },
    {
        id: "profile",
        label: "Profile",
        icon: <User className="w-5 h-5" />,
        path: "/game/profile",
        description: "Know yourself",
        modules: [
            { id: "zog", label: "Zone of Genius", path: "/zone-of-genius/entry" },
            { id: "qol", label: "Quality of Life", path: "/quality-of-life-map/assessment" }
        ]
    },
    {
        id: "transformation",
        label: "Transformation",
        icon: <Sparkles className="w-5 h-5" />,
        path: "/game/transformation",
        description: "Master yourself",
        modules: [
            { id: "library", label: "Practice Library", path: "/library" },
            { id: "paths", label: "Growth Paths", path: "/growth-paths" }
        ]
    },
    {
        id: "marketplace",
        label: "Marketplace",
        icon: <Store className="w-5 h-5" />,
        path: "/game/marketplace",
        description: "Monetize your genius"
    },
    {
        id: "teams",
        label: "Teams",
        icon: <Users className="w-5 h-5" />,
        path: "/game/teams",
        description: "Find your people",
        modules: [
            { id: "matches", label: "Matches", path: "/game/matches" },
            { id: "people", label: "People Directory", path: "/community/people" }
        ]
    },
    {
        id: "events",
        label: "Events",
        icon: <CalendarDays className="w-5 h-5" />,
        path: "/game/events",
        description: "Gatherings and Experiences"
    },
    {
        id: "coop",
        label: "Startup Co-op",
        icon: <Building2 className="w-5 h-5" />,
        path: "/game/coop",
        description: "Build together"
    }
];

interface GameShellProps {
    children: ReactNode;
}

export const GameShell = ({ children }: GameShellProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<{
        first_name: string | null;
        last_name: string | null;
        avatar_url: string | null;
        onboarding_stage?: string | null;
    } | null>(null);
    const [hasGeniusOffer, setHasGeniusOffer] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
    const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set());

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
        await supabase.auth.signOut();
        navigate("/");
    };

    const showSidebar = !profile?.onboarding_stage || ["qol_complete", "unlocked"].includes(profile.onboarding_stage);

    const unlockStatus = {
        matchmaking: profile?.onboarding_stage === "unlocked",
        marketplace: hasGeniusOffer,
        coop: hasGeniusOffer,
    };

    const unlockHints = {
        matchmaking: "Complete onboarding to unlock Matchmaking.",
        marketplace: "Create your Genius Offer to unlock Marketplace.",
        coop: "Create your Genius Offer to unlock Startup Co-op.",
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
            <div className="min-h-screen bg-white">
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
        <div className="min-h-screen bg-white flex">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-safe-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 pt-safe">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <span className="font-bold text-slate-900">Evolver</span>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${desktopSidebarOpen ? 'w-64' : 'lg:w-0 lg:overflow-hidden'}
          bg-slate-900 border-r border-slate-800
          transform transition-all duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${desktopSidebarOpen ? "lg:translate-x-0" : "lg:-translate-x-full"}
          flex flex-col
        `}
            >
                {/* Logo */}
                <div className="h-safe-14 lg:h-16 flex items-center justify-between px-4 pt-safe lg:pt-0 border-b border-slate-800">
                    <Link to="/" className="font-bold text-lg text-white">
                        Evolver
                    </Link>
                    {/* Desktop collapse button */}
                    <button
                        onClick={() => setDesktopSidebarOpen(false)}
                        className="hidden lg:block p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                        title="Collapse sidebar"
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
                                            ? "text-slate-600 bg-slate-900/40 cursor-not-allowed"
                                            : isActive(item.path)
                                                ? "bg-slate-700 text-white"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        }
                                        `;

                                    const content = (
                                        <>
                                            {item.icon}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.label}</p>
                                                <p className={`text-xs truncate ${isActive(item.path) ? "text-slate-300" : "text-slate-500"}`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                            {!isUnlocked && <Lock className="w-4 h-4 text-slate-500" />}
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
                                                            title: "Locked",
                                                            description: hint || "Complete the required steps to unlock this space.",
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
                                                    className="p-2 text-slate-400 hover:text-white"
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
                                    <div className="ml-10 mt-1 space-y-0.5 border-l border-slate-700 pl-3">
                                        {item.modules.map((module) => (
                                            <Link
                                                key={module.id}
                                                to={module.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={`
                                                    block px-2 py-1 rounded-md text-xs font-normal
                                                    ${location.pathname.startsWith(module.path)
                                                        ? "text-white bg-slate-700/50"
                                                        : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                                                    }
                                                `}
                                            >
                                                {module.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* User Section */}
                <div className="border-t border-slate-800 p-4">
                    {user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img
                                            src={profile.avatar_url}
                                            alt="Profile avatar"
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
                                        {profile?.first_name || user.email?.split("@")[0] || "Player"}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign out
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                            onClick={() => navigate("/auth")}
                        >
                            Sign in
                        </Button>
                    )}
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Desktop sidebar expand button (when collapsed) */}
            {!desktopSidebarOpen && (
                <button
                    onClick={() => setDesktopSidebarOpen(true)}
                    className="hidden lg:flex fixed top-4 left-4 z-50 items-center justify-center w-10 h-10 bg-slate-900 text-slate-400 hover:text-white rounded-lg shadow-lg border border-slate-700 transition-colors"
                    title="Expand sidebar"
                >
                    <PanelLeft className="w-5 h-5" />
                </button>
            )}

            {/* Main Content */}
            <main className={`flex-1 pt-safe-14 lg:pt-0 transition-all duration-200 ${!desktopSidebarOpen ? 'lg:pl-0' : ''}`}>
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default GameShell;
