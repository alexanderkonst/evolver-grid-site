import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Sparkles,
    ExternalLink,
    Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { usePublishedGeniusBusiness } from "@/modules/product-builder/ProductBuilderContext";
import { useToast } from "@/hooks/use-toast";
import { FoundersHero, FoundersCTA } from "@/components/founders/FoundersShared";
import { FOUNDERS, FounderCard } from "@/pages/FoundersShowcase";


const MarketplaceSpace = () => {
    const navigate = useNavigate();
    const business = usePublishedGeniusBusiness();
    const { toast } = useToast();
    const [expandedFounder, setExpandedFounder] = useState<string | null>(null);

    const toggle = useCallback(
        (name: string) =>
            setExpandedFounder((prev) => (prev === name ? null : name)),
        []
    );

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

                    {/* ─── Hero ──────────────────────────────────── */}
                    <FoundersHero lightMode />

                    {/* ─── Founder Cards ─────────────────────────── */}
                    <div className="space-y-6" id="founders-grid">
                        {FOUNDERS.map((f, i) => (
                            <FounderCard
                                key={f.name}
                                founder={f}
                                index={i}
                                isExpanded={expandedFounder === f.name}
                                onToggle={() => toggle(f.name)}
                                lightMode
                            />
                        ))}
                    </div>

                    {/* ─── CTA ──────────────────────────────────── */}
                    <FoundersCTA lightMode />
                </div>
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default MarketplaceSpace;
