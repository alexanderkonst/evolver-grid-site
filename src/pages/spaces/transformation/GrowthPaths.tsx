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
                        <TrendingUp className="w-6 h-6 text-[#2c3150]" />
                        <h1 className="text-2xl font-bold text-[#2c3150]">5 Growth Paths</h1>
                    </div>
                    <p className="text-[rgba(44,49,80,0.7)]">Body, Emotions, Mind, Genius, Spirit</p>
                </div>

                {/* Paths Grid */}
                <div className="space-y-3">
                    {PATHS.map((path) => (
                        <Link
                            key={path.id}
                            to={path.path}
                            className="block rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-4 hover:border-[#a4a3d0]/40 hover:shadow-sm transition-all shadow-[0_4px_16px_rgba(44,49,80,0.06)]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-lg bg-[#a4a3d0]/20">
                                    <path.icon className="w-5 h-5 text-[#2c3150]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#2c3150]">{path.label}</h3>
                                    <p className="text-sm text-[#2c3150]/60">{path.description}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-[#2c3150]/50" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </GameShellV2>
    );
};

export default GrowthPaths;
