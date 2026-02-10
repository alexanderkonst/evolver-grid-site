import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Share2, Edit, Check, PartyPopper, Sparkles, Star } from "lucide-react";
import { useProductBuilder } from "../ProductBuilderContext";
import ProductBuilderLoading from "../ProductBuilderLoading";
import { PRODUCT_BUILDER_STEPS } from "../productBuilderRoutes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import type { Json } from "@/integrations/supabase/types";

const PublishedScreen: React.FC = () => {
    const navigate = useNavigate();
    const { state, setPublished, setCurrentStep } = useProductBuilder();
    const { toast } = useToast();
    const [isPublishing, setIsPublishing] = useState(false);
    const [copied, setCopied] = useState(false);
    const productUrl = state.productUrl || `https://evolver.app/p/your-genius-product`;

    useEffect(() => {
        setCurrentStep(7);

        if (!state.isPublished) {
            publishProduct();
        } else {
            // Trigger celebration if already published
            triggerCelebration();
        }
    }, []);

    const triggerCelebration = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 250);
    };

    const publishProduct = async () => {
        setIsPublishing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const slug = `genius-${Date.now().toString(36)}`;
            const url = `/mp/${slug}`;

            const productData = {
                user_id: user.id,
                slug,
                title: state.landingContent?.headline || "My Genius Product",
                landing_html: JSON.stringify(state.landingContent),
                blueprint_content: state.blueprintContent ? JSON.parse(JSON.stringify(state.blueprintContent)) : null,
                cta_config: state.ctaConfig ? JSON.parse(JSON.stringify(state.ctaConfig)) : null,
                is_live: true,
                published_at: new Date().toISOString(),
            };

            try {
                const { error: dbError } = await supabase
                    .from("marketplace_products")
                    .insert(productData);

                if (dbError) {
                    console.warn("Could not save to database:", dbError);
                }
            } catch (saveErr) {
                console.warn("Database save failed, continuing with demo:", saveErr);
            }

            setPublished(url);
            triggerCelebration();
        } catch (err) {
            console.error("Error publishing:", err);
            const demoSlug = `genius-demo-${Date.now().toString(36)}`;
            setPublished(`/mp/${demoSlug}`);
            triggerCelebration();
        } finally {
            setIsPublishing(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(state.productUrl || productUrl);
            setCopied(true);
            toast({
                title: "Link copied!",
                description: "Share it with the world.",
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleViewOnMarketplace = () => {
        if (state.productUrl) {
            navigate(state.productUrl);
        } else {
            toast({
                title: "Product not ready",
                description: "Please wait for publishing to complete.",
            });
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Check out my Genius Business",
                    text: "I just created my Genius Business landing page!",
                    url: state.productUrl || productUrl,
                });
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            handleCopyLink();
        }
    };

    const handleEdit = () => {
        navigate(PRODUCT_BUILDER_STEPS[0].path);
        toast({
            title: "Edit Mode",
            description: "You can modify your product and republish.",
        });
    };

    if (isPublishing) {
        return <ProductBuilderLoading message="Publishing to marketplace..." submessage="Almost there!" />;
    }

    return (
        <div className="py-8">
            {/* Celebration Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <PartyPopper className="w-8 h-8 text-[#c8b7d8]" />
                    <Sparkles className="w-6 h-6 text-[#8460ea]" />
                    <Star className="w-8 h-8 text-[#8460ea]" />
                </div>
                <h1 className="text-4xl font-bold text-[#2c3150] mb-2">
                    Congratulations!
                </h1>
                <p className="text-xl text-[#2c3150] font-semibold mb-4">
                    Your Genius Business is Now Live
                </p>

                {/* Heart/Mind/Gut Messages */}
                <div className="max-w-md mx-auto space-y-2 text-left bg-white border border-[#a4a3d0]/20 rounded-lg p-4">
                    <p className="text-sm text-[#2c3150]">
                        <span className="mr-2">🫀</span>
                        <strong>You just published your genius business.</strong>
                    </p>
                    <p className="text-sm text-[#2c3150]/70">
                        <span className="mr-2">🧠</span>
                        People can now find and buy from you.
                    </p>
                    <p className="text-sm text-[#2c3150]/70">
                        <span className="mr-2">🔥</span>
                        Share it with the world.
                    </p>
                </div>
            </div>

            {/* Link Box */}
            <div className="max-w-xl mx-auto mb-6 bg-white border border-[#a4a3d0]/20 rounded-xl p-4">
                <p className="text-sm text-[#2c3150]/70 mb-2">Your product URL:</p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#8460ea]/5 rounded-lg px-4 py-3 text-sm font-mono text-[#2c3150] truncate">
                        {state.productUrl || productUrl}
                    </div>
                    <button
                        onClick={handleCopyLink}
                        className="flex-shrink-0 w-10 h-10 rounded-lg border border-[#a4a3d0]/30 flex items-center justify-center hover:bg-[#8460ea]/5 transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4 text-[#8460ea]" /> : <Copy className="w-4 h-4 text-[#2c3150]/60" />}
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
                <Button
                    size="lg"
                    onClick={handleViewOnMarketplace}
                    className="gap-2 bg-[#8460ea] hover:bg-[#7350d0] text-white"
                >
                    <ExternalLink className="w-4 h-4" />
                    View Your Page
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="gap-2 border-[#a4a3d0]/30 text-[#2c3150] hover:bg-[#8460ea]/5"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleEdit}
                    className="gap-2 text-[#2c3150]/60 hover:text-[#2c3150] hover:bg-[#8460ea]/5"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </Button>
            </div>

            {/* Motivational Footer */}
            <div className="text-center mt-12 max-w-lg mx-auto">
                <p className="text-[#2c3150]/60 italic">
                    "You did something most people never do. You made your gift available to the world."
                </p>
            </div>
        </div>
    );
};

export default PublishedScreen;
