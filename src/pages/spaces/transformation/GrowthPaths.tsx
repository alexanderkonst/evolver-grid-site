import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Heart, Brain, Sparkles, Zap, Activity } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";

const PATHS = [
    { id: "body", label: "Body", icon: Activity, description: "Physical vitality and health", path: "/game/path/body" },
    { id: "emotions", label: "Emotions", icon: Heart, description: "Emotional regulation and shadow work", path: "/game/path/emotions" },
    { id: "mind", label: "Mind", icon: Brain, description: "Worldview and mental clarity", path: "/game/path/mind" },
    { id: "genius", label: "Genius", icon: Zap, description: "Authenticity and self-expression", path: "/game/path/genius" },
    { id: "spirit", label: "Spirit", icon: Sparkles, description: "Awareness and sensitivity", path: "/game/path/spirit" },
];

/**
 * Growth Paths section - the 5 paths of transformation
 */
const GrowthPaths = () => {
    return (
        <GameShellV2>
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-6 h-6 text-slate-700" />
                        <h1 className="text-2xl font-bold text-slate-900">5 Growth Paths</h1>
                    </div>
                    <p className="text-slate-600">Body, Emotions, Mind, Genius, Spirit</p>
                </div>

                {/* Paths Grid */}
                <div className="space-y-3">
                    {PATHS.map((path) => (
                        <Link
                            key={path.id}
                            to={path.path}
                            className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-slate-100">
                                    <path.icon className="w-5 h-5 text-slate-700" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">{path.label}</h3>
                                    <p className="text-sm text-slate-500">{path.description}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </GameShellV2>
    );
};

export default GrowthPaths;
