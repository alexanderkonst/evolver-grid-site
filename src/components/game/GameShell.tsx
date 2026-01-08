import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Compass,
    User,
    Sparkles,
    Store,
    Users,
    Building2,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface NavItem {
    id: string;
    label: string;
    icon: ReactNode;
    path: string;
    description: string;
}

const SPACES: NavItem[] = [
    {
        id: "next-move",
        label: "My Next Move",
        icon: <Compass className="w-5 h-5" />,
        path: "/game",
        description: "Your daily focus"
    },
    {
        id: "profile",
        label: "Profile",
        icon: <User className="w-5 h-5" />,
        path: "/game/profile",
        description: "Know yourself"
    },
    {
        id: "transformation",
        label: "Transformation",
        icon: <Sparkles className="w-5 h-5" />,
        path: "/game/transformation",
        description: "Master yourself"
    },
    {
        id: "marketplace",
        label: "Marketplace",
        icon: <Store className="w-5 h-5" />,
        path: "/game/marketplace",
        description: "Monetize your genius"
    },
    {
        id: "matchmaking",
        label: "Matchmaking",
        icon: <Users className="w-5 h-5" />,
        path: "/game/matchmaking",
        description: "Find your people"
    },
    {
        id: "coop",
        label: "Venture Co-op",
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
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const isActive = (path: string) => {
        if (path === "/game") {
            return location.pathname === "/game";
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <span className="font-bold text-slate-900">Game of Life</span>
                <div className="w-9" /> {/* Spacer */}
            </div>

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-slate-900 border-r border-slate-800
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          lg:transform-none
          flex flex-col
        `}
            >
                {/* Logo */}
                <div className="h-14 lg:h-16 flex items-center px-4 border-b border-slate-800">
                    <Link to="/" className="font-bold text-lg text-white">
                        Game of Life
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <div className="space-y-1">
                        {SPACES.map((item) => (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-colors duration-150
                  ${isActive(item.path)
                                        ? "bg-slate-700 text-white"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                    }
                `}
                            >
                                {item.icon}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.label}</p>
                                    <p className={`text-xs truncate ${isActive(item.path) ? "text-slate-300" : "text-slate-500"}`}>
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* User Section */}
                <div className="border-t border-slate-800 p-4">
                    {user ? (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
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

            {/* Main Content */}
            <main className="flex-1 lg:pl-0 pt-14 lg:pt-0">
                <div className="min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default GameShell;
