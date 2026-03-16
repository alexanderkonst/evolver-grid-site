import { Link, useNavigate } from "react-router-dom";
import {
    Sparkles,
    ExternalLink,
    Plus,
    ArrowRight,
    Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";
import { useToast } from "@/hooks/use-toast";
import { FoundersHero, FoundersCTA } from "@/components/founders/FoundersShared";


const MarketplaceSpace = () => {
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
                <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-10">
                    {/* ─── Hero ──────────────────────────────────── */}
                    <FoundersHero lightMode />

                    {/* My Published Product (if exists) */}
                    {business && (
                        <div>
                            <h2 className="text-lg font-semibold text-[#2c3150] mb-4">My Published Products</h2>
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
                        </div>
                    )}

                    {/* My Offers Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-[#2c3150] mb-4">
                            {business ? "Create More" : "My Offers"}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Create Genius Offer */}
                            <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 hover:border-[#a4a3d0]/40 transition-colors shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-[#8460ea]/20">
                                        <Sparkles className="w-6 h-6 text-[#8460ea]" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-[#2c3150] mb-1">Genius Offer</h3>
                                <p className="text-sm text-[#2c3150]/70 mb-4">Create your signature offer based on your Zone of Genius</p>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link to="/genius-offer?from=marketplace">
                                        Create Offer <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>

                            {/* Create Public Page */}
                            <div className="rounded-xl border border-dashed border-[#a4a3d0]/40 bg-[#f0f4ff]/50 p-5 hover:border-[#a4a3d0]/60 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 rounded-lg bg-[#a4a3d0]/20">
                                        <Plus className="w-6 h-6 text-[#2c3150]/70" />
                                    </div>
                                </div>
                                <h3 className="font-semibold text-[#2c3150] mb-1">Create Public Page</h3>
                                <p className="text-sm text-[#2c3150]/70 mb-4">Build your creator page with your brand and products</p>
                                <Button asChild variant="outline" size="sm" className="w-full">
                                    <Link to="/marketplace/create-page">
                                        Get Started <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* ─── CTA ──────────────────────────────────── */}
                    <FoundersCTA lightMode />
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MarketplaceSpace;
