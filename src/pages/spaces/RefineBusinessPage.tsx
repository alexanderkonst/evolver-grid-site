import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    RefreshCw,
    Users,
    Target,
    Flame,
    BookOpen,
    Sparkles,
    ArrowRight,
    Lock,
} from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";

const REFINEMENT_OPTIONS = [
    {
        id: "icp",
        icon: Users,
        title: "Sharpen Your ICP",
        description: "Go deeper on who exactly your ideal client is. The more precise, the more magnetic your message.",
        available: true,
    },
    {
        id: "pain",
        icon: Flame,
        title: "Deepen Pain Understanding",
        description: "Uncover the hidden layers of pain your client experiences. Better pain = better positioning.",
        available: true,
    },
    {
        id: "promise",
        icon: Target,
        title: "Refine Your Promise",
        description: "Make your transformational promise razor-sharp. This is the core of your entire business.",
        available: true,
    },
    {
        id: "blueprint",
        icon: BookOpen,
        title: "Upgrade Blueprint",
        description: "Improve your lead magnet with better steps, tighter copy, and stronger CTA.",
        available: false,
    },
    {
        id: "landing",
        icon: Sparkles,
        title: "Polish Landing Page",
        description: "Optimize your landing page copy, headlines, and conversion elements.",
        available: false,
    },
];

const RefineBusinessPage: React.FC = () => {
    const navigate = useNavigate();
    const business = usePublishedGeniusBusiness();

    if (!business) {
        return (
            <GameShellV2>
                <ErrorBoundary>
                    <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                            <RefreshCw className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-3">
                            Nothing to Refine Yet
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            First, build your Genius Business using the Product Builder. Then come back here to refine and iterate.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => navigate("/game/build/product-builder")}
                            className="bg-primary hover:bg-[#7350d0] text-white px-8"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Build First
                        </Button>
                    </div>
                </ErrorBoundary>
            </GameShellV2>
        );
    }

    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-6 lg:p-8 max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <RefreshCw className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl font-bold text-foreground">Refine My Genius Business</h1>
                        </div>
                        <p className="text-muted-foreground">
                            Each refinement cycle sharpens your business. Choose what to improve.
                        </p>
                    </div>

                    {/* Current Product Summary */}
                    <div className="bg-white rounded-xl border border-border shadow-sm p-4 mb-8 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">
                                {business.landingContent?.headline || "My Genius Product"}
                            </p>
                            <p className="text-xs text-muted-foreground">Current version · Published</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex-shrink-0">
                            Live
                        </span>
                    </div>

                    {/* Refinement Options */}
                    <div className="space-y-3">
                        {REFINEMENT_OPTIONS.map((option) => (
                            <button
                                key={option.id}
                                disabled={!option.available}
                                onClick={() => {
                                    if (option.available) {
                                        // For now, redirect to product builder — future: targeted refinement flows
                                        navigate("/game/build/product-builder");
                                    }
                                }}
                                className={`w-full text-left rounded-xl border p-5 transition-all ${option.available
                                        ? "bg-white border-border hover:border-primary/40 hover:shadow-sm cursor-pointer"
                                        : "bg-[#f5f5f7] border-border/10 opacity-60 cursor-not-allowed"
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${option.available ? "bg-primary/10" : "bg-muted/30"
                                        }`}>
                                        <option.icon className={`w-5 h-5 ${option.available ? "text-primary" : "text-muted-foreground"
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-foreground">{option.title}</h3>
                                            {!option.available && (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Lock className="w-3 h-3" /> Coming soon
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{option.description}</p>
                                    </div>
                                    {option.available && (
                                        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Info */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            Refinement iterations will improve your existing product without losing your current work.
                        </p>
                    </div>
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default RefineBusinessPage;
