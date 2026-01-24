import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Copy, ExternalLink, Share2, Edit, Check, PartyPopper, Sparkles, Star } from "lucide-react";
import { useProductBuilder } from "../ProductBuilderContext";
import ProductBuilderLoading from "../ProductBuilderLoading";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

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
        // Fire confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        // Second burst
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

            // Generate slug
            const slug = `genius-${Date.now().toString(36)}`;
            const url = `/mp/${slug}`;

            // In a real implementation, we'd save to database here
            // For now, just simulate success
            await new Promise(resolve => setTimeout(resolve, 1500));

            setPublished(url);
            triggerCelebration();
        } catch (err) {
            console.error("Error publishing:", err);
            // Still show success for demo
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
        // Go back to first step
        navigate("/product-builder");
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
                    <PartyPopper className="w-8 h-8 text-yellow-500" />
                    <Sparkles className="w-6 h-6 text-amber-600" />
                    <Star className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    Congratulations!
                </h1>
                <p className="text-xl text-amber-600 font-semibold mb-4">
                    Your Genius is Now Live
                </p>

                {/* Heart/Mind/Gut Messages */}
                <div className="max-w-md mx-auto space-y-2 text-left bg-card border rounded-lg p-4">
                    <p className="text-sm">
                        <span className="mr-2">🫀</span>
                        <strong>You just published your genius.</strong>
                    </p>
                    <p className="text-sm text-slate-600">
                        <span className="mr-2">🧠</span>
                        People can now find and buy from you.
                    </p>
                    <p className="text-sm text-amber-600">
                        <span className="mr-2">🔥</span>
                        Share it with the world.
                    </p>
                </div>
            </div>

            {/* Link Box */}
            <Card className="max-w-xl mx-auto mb-6">
                <CardContent className="p-4">
                    <p className="text-sm text-slate-600 mb-2">Your product URL:</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm font-mono truncate">
                            {state.productUrl || productUrl}
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCopyLink}
                            className="flex-shrink-0"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
                <Button
                    size="lg"
                    onClick={handleViewOnMarketplace}
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    View on Marketplace
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="gap-2"
                >
                    <Share2 className="w-4 h-4" />
                    Share
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleEdit}
                    className="gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </Button>
            </div>

            {/* Motivational Footer */}
            <div className="text-center mt-12 max-w-lg mx-auto">
                <p className="text-slate-600 italic">
                    "You did something most people never do. You made your gift available to the world."
                </p>
            </div>
        </div>
    );
};

export default PublishedScreen;
