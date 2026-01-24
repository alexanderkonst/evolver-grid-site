import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowRight, Eye } from "lucide-react";
import { useProductBuilder } from "../ProductBuilderContext";
import { PRODUCT_BUILDER_STEPS } from "../productBuilderRoutes";
import ProductBuilderLoading, { LOADING_MESSAGES } from "../ProductBuilderLoading";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { supabase } from "@/integrations/supabase/client";

const LandingPageScreen: React.FC = () => {
    const navigate = useNavigate();
    const { state, setLandingContent, setResonanceRating, setCurrentStep } = useProductBuilder();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCurrentStep(4);

        if (state.landingContent) {
            setIsLoading(false);
            return;
        }

        generateLanding();
    }, []);

    const generateLanding = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke("generate-landing", {
                body: {
                    icp: state.deepICP,
                    pain: state.deepPain,
                    tp: state.deepTP,
                },
            });

            if (fnError) throw fnError;

            setLandingContent({
                headline: data.headline || "Your headline",
                subheadline: data.subheadline || "Your subheadline",
                painSection: data.painSection || "Pain section",
                promiseSection: data.promiseSection || "Promise section",
                ctaText: data.ctaText || "Get Started",
                rawData: data,
            });
        } catch (err: unknown) {
            console.error("Error generating landing:", err);

            // Fallback mock data
            setLandingContent({
                headline: "Transform Your Genius Into a Thriving Business",
                subheadline: "Stop trading time for money. Start getting paid to be authentically you.",
                painSection: "You've achieved what society told you to achieve. The title, the salary, the stability. But something's missing. Sunday anxiety. Monday dread. The nagging feeling that you have more to give — but no idea how to package it.",
                promiseSection: "Imagine waking up excited to work. Serving clients who value your unique perspective. Earning well while being authentically yourself. That's not a fantasy — it's a system. And I can show you how.",
                ctaText: "Download Your Blueprint",
                rawData: {},
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResonanceRating = (rating: number) => {
        setResonanceRating("landing", rating);
    };

    const handleContinue = () => {
        navigate(PRODUCT_BUILDER_STEPS[5].path); // Go to Blueprint step
    };

    if (isLoading) {
        return <ProductBuilderLoading message={LOADING_MESSAGES.landing} />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={generateLanding}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                    <FileText className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Your Landing Page</h1>
                <p className="text-muted-foreground">
                    Look what you've created.
                </p>
            </div>

            {/* Landing Page Preview */}
            <Card className="max-w-3xl mx-auto mb-8 overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Preview</span>
                </div>
                <CardContent className="p-0">
                    {/* Mock Landing Page */}
                    <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
                        {/* Hero */}
                        <div className="text-center mb-8 py-8">
                            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                                {state.landingContent?.headline}
                            </h1>
                            <p className="text-lg text-slate-300 max-w-xl mx-auto">
                                {state.landingContent?.subheadline}
                            </p>
                        </div>

                        {/* Pain Section */}
                        <div className="bg-slate-800/50 rounded-lg p-6 mb-6">
                            <h3 className="text-sm font-semibold text-amber-400 uppercase mb-3">
                                Sound Familiar?
                            </h3>
                            <p className="text-slate-300 leading-relaxed">
                                {state.landingContent?.painSection}
                            </p>
                        </div>

                        {/* Promise Section */}
                        <div className="bg-emerald-900/30 rounded-lg p-6 mb-8">
                            <h3 className="text-sm font-semibold text-emerald-400 uppercase mb-3">
                                There's Another Way
                            </h3>
                            <p className="text-slate-300 leading-relaxed">
                                {state.landingContent?.promiseSection}
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="text-center">
                            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8">
                                {state.landingContent?.ctaText}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resonance Rating */}
            <div className="max-w-2xl mx-auto mb-8">
                <ResonanceRating
                    question="How well does this describe your ideal client?"
                    onRate={handleResonanceRating}
                />
            </div>

            {/* Continue Button */}
            <div className="text-center">
                <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={!state.resonanceRatings.landing}
                    className="px-8"
                >
                    Add Blueprint
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {!state.resonanceRatings.landing && (
                    <p className="text-sm text-muted-foreground mt-2">
                        Rate the resonance to continue
                    </p>
                )}
            </div>
        </div>
    );
};

export default LandingPageScreen;
