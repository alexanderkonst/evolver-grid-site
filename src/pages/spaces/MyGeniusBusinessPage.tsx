import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    ExternalLink,
    Copy,
    Edit,
    Sparkles,
    ArrowRight,
    BookOpen,
    Target,
    Users,
    Zap,
    RefreshCw,
} from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";
import { useToast } from "@/hooks/use-toast";

const MyGeniusBusinessPage: React.FC = () => {
    const navigate = useNavigate();
    const business = usePublishedGeniusBusiness();
    const { toast } = useToast();

    const handleCopyLink = async () => {
        if (business?.productUrl) {
            const fullUrl = `${window.location.origin}${business.productUrl}`;
            await navigator.clipboard.writeText(fullUrl);
            toast({ title: "Link copied!", description: "Share it with the world." });
        }
    };

    // No published business yet
    if (!business) {
        return (
            <GameShellV2>
                <ErrorBoundary>
                    <div className="p-6 lg:p-8 max-w-2xl mx-auto text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8460ea]/10 mb-6">
                            <Sparkles className="w-8 h-8 text-[#8460ea]" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#2c3150] mb-3">
                            No Genius Business Yet
                        </h1>
                        <p className="text-[#2c3150]/60 mb-8 max-w-md mx-auto">
                            Build your first genius business using the Product Builder.
                            It takes about 5 minutes to create your landing page.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => navigate("/game/build/product-builder")}
                            className="bg-[#8460ea] hover:bg-[#7350d0] text-white px-8"
                        >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Start Building
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
                            <Sparkles className="w-6 h-6 text-[#8460ea]" />
                            <h1 className="text-2xl font-bold text-[#2c3150]">My Genius Business</h1>
                        </div>
                        <p className="text-[#2c3150]/60">Your published genius business at a glance.</p>
                    </div>

                    {/* Product Card */}
                    <div className="bg-white rounded-xl border border-[#a4a3d0]/20 shadow-sm p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-[#2c3150] mb-1">
                                    {business.landingContent?.headline || "My Genius Product"}
                                </h2>
                                <p className="text-[#2c3150]/60 text-sm">
                                    {business.landingContent?.subheadline || ""}
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                Live
                            </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-3 rounded-lg bg-[#8460ea]/5">
                                <Users className="w-5 h-5 text-[#8460ea] mx-auto mb-1" />
                                <p className="text-xs text-[#2c3150]/50">ICP</p>
                                <p className="text-sm font-medium text-[#2c3150] truncate">
                                    {business.deepICP?.who?.split('.')[0]?.slice(0, 30) || "Defined"}
                                </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[#8460ea]/5">
                                <Target className="w-5 h-5 text-[#8460ea] mx-auto mb-1" />
                                <p className="text-xs text-[#2c3150]/50">Promise</p>
                                <p className="text-sm font-medium text-[#2c3150] truncate">
                                    {business.deepTP?.promiseStatement?.slice(0, 30) || "Defined"}
                                </p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-[#8460ea]/5">
                                <BookOpen className="w-5 h-5 text-[#8460ea] mx-auto mb-1" />
                                <p className="text-xs text-[#2c3150]/50">Blueprint</p>
                                <p className="text-sm font-medium text-[#2c3150] truncate">
                                    {business.blueprintContent?.steps?.length || 0} steps
                                </p>
                            </div>
                        </div>

                        {/* URL */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex-1 bg-[#8460ea]/5 rounded-lg px-4 py-2.5 text-sm font-mono text-[#2c3150] truncate">
                                {business.productUrl}
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="flex-shrink-0 w-9 h-9 rounded-lg border border-[#a4a3d0]/30 flex items-center justify-center hover:bg-[#8460ea]/5 transition-colors"
                            >
                                <Copy className="w-4 h-4 text-[#2c3150]/60" />
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                            <Button
                                size="sm"
                                onClick={() => business.productUrl && navigate(business.productUrl)}
                                className="bg-[#8460ea] hover:bg-[#7350d0] text-white"
                            >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Page
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/game/build/product-builder")}
                                className="border-[#a4a3d0]/30 text-[#2c3150]"
                            >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                            </Button>
                        </div>
                    </div>

                    {/* Refine Section */}
                    <div className="bg-gradient-to-r from-[#8460ea]/5 to-[#c8b7d8]/10 rounded-xl border border-[#8460ea]/15 p-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 rounded-xl bg-[#8460ea]/10 flex-shrink-0">
                                <RefreshCw className="w-6 h-6 text-[#8460ea]" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-[#2c3150] mb-1">Refine Your Genius Business</h3>
                                <p className="text-sm text-[#2c3150]/60 mb-4">
                                    Sharpen your ICP, deepen your pain understanding,
                                    and iterate on your transformational promise. Each refinement makes your business more precise.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/game/build/refine")}
                                    className="border-[#8460ea]/30 text-[#8460ea] hover:bg-[#8460ea]/5"
                                >
                                    <Zap className="w-4 h-4 mr-1" />
                                    Start Refinement
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MyGeniusBusinessPage;
