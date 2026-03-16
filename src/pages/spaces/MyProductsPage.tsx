import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    ExternalLink,
    Copy,
    Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";
import { useToast } from "@/hooks/use-toast";

const MyProductsPage = () => {
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

    return (
        <GameShellV2>
            <ErrorBoundary>
                <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="w-6 h-6 text-[#2c3150]" />
                            <h1 className="text-2xl font-bold text-[#2c3150]">My Products</h1>
                        </div>
                        <p className="text-[rgba(44,49,80,0.7)]">Your published offers and products.</p>
                    </div>

                    {business ? (
                        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-[#8460ea]/20">
                                        <Sparkles className="w-5 h-5 text-[#8460ea]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[#2c3150]">
                                            {business.landingContent?.headline || "My Genius Product"}
                                        </h3>
                                        <p className="text-xs text-[#2c3150]/50 mt-0.5">
                                            {business.productUrl}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                    Live
                                </span>
                            </div>
                            <p className="text-sm text-[#2c3150]/60 mb-4">
                                {business.deepTP?.promiseStatement || business.landingContent?.subheadline || "Your transformational offer"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => business.productUrl && navigate(business.productUrl)}
                                    className="bg-[#8460ea] hover:bg-[#7350d0] text-white text-xs"
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                    View Page
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyLink}
                                    className="text-xs border-[#a4a3d0]/30"
                                >
                                    <Copy className="w-3.5 h-3.5 mr-1" />
                                    Copy Link
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-[#a4a3d0]/30 bg-[#f0f4ff]/50 p-10 text-center">
                            <Package className="w-10 h-10 text-[#2c3150]/20 mx-auto mb-3" />
                            <p className="text-[#2c3150]/50 text-sm">No products published yet.</p>
                            <p className="text-[#2c3150]/30 text-xs mt-1">Complete your Unique Business Canvas to get started.</p>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MyProductsPage;
