import { Link } from "react-router-dom";
import {
    User,
    Sparkles,
    BrainCircuit,
    Map,
    Target,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShell from "@/components/game/GameShell";

interface ModuleCard {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    status: "available" | "completed" | "coming-soon";
}

const PROFILE_MODULES: ModuleCard[] = [
    {
        id: "zone-of-genius",
        title: "Zone of Genius",
        description: "Discover your unique genius and how you create value",
        icon: <Sparkles className="w-6 h-6" />,
        path: "/zone-of-genius?from=game&return=/game/profile",
        status: "available"
    },
    {
        id: "mission-discovery",
        title: "Mission Discovery",
        description: "Find your contribution to the planet",
        icon: <Target className="w-6 h-6" />,
        path: "/mission-discovery?from=game&return=/game/profile",
        status: "available"
    },
    {
        id: "personality-tests",
        title: "Personality Tests",
        description: "MBTI, Enneagram, and other frameworks",
        icon: <BrainCircuit className="w-6 h-6" />,
        path: "/resources/personality-tests?from=game&return=/game/profile",
        status: "available"
    },
    {
        id: "quality-of-life",
        title: "Quality of Life Map",
        description: "Assess your life across 8 domains",
        icon: <Map className="w-6 h-6" />,
        path: "/quality-of-life-map/assessment?from=game&return=/game/profile",
        status: "available"
    },
    {
        id: "asset-mapping",
        title: "Asset Mapping",
        description: "Map your skills, tools, and resources",
        icon: <User className="w-6 h-6" />,
        path: "/asset-mapping",
        status: "coming-soon"
    }
];

const ProfileSpace = () => {
    return (
        <GameShell>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <User className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">Profile Space</h1>
                    </div>
                    <p className="text-slate-600">Know yourself. Build your character.</p>
                </div>

                {/* Module Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                    {PROFILE_MODULES.map((module) => (
                        <div
                            key={module.id}
                            className={`
                rounded-xl border p-5
                ${module.status === "coming-soon"
                                    ? "border-slate-200 bg-slate-50 opacity-60"
                                    : "border-slate-200 bg-white hover:border-slate-300 transition-colors"
                                }
              `}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2 rounded-lg bg-slate-100">
                                    {module.icon}
                                </div>
                                {module.status === "coming-soon" && (
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                        Coming Soon
                                    </span>
                                )}
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">{module.title}</h3>
                            <p className="text-sm text-slate-600 mb-4">{module.description}</p>
                            {module.status !== "coming-soon" && (
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link to={module.path}>
                                        Start <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </GameShell>
    );
};

export default ProfileSpace;
