import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ArrowRight, Eye, Check } from "lucide-react";
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
                painSection: data.painSection || "",
                promiseSection: data.promiseSection || "",
                ctaText: data.ctaText || data.ctaButtonText || "Get Started",
                rawData: data,
            });
        } catch (err: unknown) {
            console.error("Error generating landing:", err);

            // Enhanced fallback mock data using new framework
            setLandingContent({
                headline: "Become the purpose coach clients remember",
                subheadline: "Define and monetize your Zone of Genius so your offers stop blending in—and start attracting premium-fit clients without relying on fame or constant posting.",
                painSection: "Your offers read like 'purpose + mindset' even if your results are deeper. Discovery calls end with 'I'm also talking to a more well-known coach.' Content takes more effort for less engagement. Referrals slow down as your work gets reduced to generic frameworks.",
                promiseSection: "Identify your true Zone of Genius. Articulate a crisp POV clients can repeat in one sentence. Turn your genius into signature assets: method, messaging, and premium offer. Apply it so your content becomes specific and high-converting. Monetize with a minimally viable genius business.",
                ctaText: "Get the Genius Business Blueprint",
                rawData: {
                    forAudience: "Purpose Coaches",
                    painSectionHeader: "When your work sounds like everyone else's",
                    painBullets: [
                        "Your offers read like 'purpose + mindset' (even if your results are deeper), so prospects compare you on price and popularity.",
                        "Discovery calls end with 'I'm also talking to a more well-known coach' and you feel quietly interchangeable.",
                        "Content takes more effort for less engagement because your POV isn't sharp enough to be memorable.",
                        "Referrals slow down as your work gets reduced to generic frameworks clients could find anywhere."
                    ],
                    solutionSectionHeader: "A clear system to name, package, and sell your secret sauce",
                    solutionSteps: [
                        "Identify your true Zone of Genius: the specific transformation you create that others can't replicate.",
                        "Articulate a crisp Point of View (POV) clients can repeat in one sentence—and instantly 'get.'",
                        "Turn your genius into signature assets: a method, messaging pillars, and a premium offer clients want.",
                        "Apply it across your marketing so your content becomes specific, polarizing (in a good way), and high-converting.",
                        "Monetize with a minimally viable genius business: simple packaging, pricing, and next-step client acquisition."
                    ],
                    finalCtaHeadline: "Stop blending in. Build your genius business.",
                    finalCtaSubheadline: "Get the blueprint to define your secret sauce, package it into a signature offer, and start attracting premium-fit clients."
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResonanceRating = (rating: number) => {
        setResonanceRating("landing", rating);
    };

    const handleContinue = () => {
        navigate(PRODUCT_BUILDER_STEPS[5].path);
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

    const rawData = (state.landingContent?.rawData || {}) as {
        forAudience?: string;
        painSectionHeader?: string;
        painBullets?: string[];
        solutionSectionHeader?: string;
        solutionSteps?: string[];
        finalCtaHeadline?: string;
        finalCtaSubheadline?: string;
    };
    const painBullets = rawData.painBullets || [];
    const solutionSteps = rawData.solutionSteps || [];

    return (
        <div className="py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-gray-200 mb-4">
                    <FileText className="w-8 h-8 text-primary-wabi" />
                </div>
                <h1 className="text-3xl font-bold text-[#2c3150] mb-2 uppercase tracking-wide">Your Landing Page</h1>
                <p className="text-primary-wabi">
                    Look what you've created.
                </p>
            </div>

            {/* Landing Page Preview */}
            <Card className="max-w-3xl mx-auto mb-8 overflow-hidden bg-white border border-[#a4a3d0]/20">
                <div className="bg-[#8460ea]/5 px-4 py-2 border-b border-[#a4a3d0]/20 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#8460ea]" />
                    <span className="text-sm text-[#2c3150]">Preview</span>
                </div>
                <CardContent className="p-0">
                    {/* Landing Page */}
                    <div className="bg-gradient-to-b from-slate-900 to-slate-800 text-white">
                        {/* For Audience Badge */}
                        {rawData.forAudience && (
                            <div className="text-center pt-6">
                                <span className="text-xs uppercase tracking-wider text-slate-300">
                                    For {rawData.forAudience}
                                </span>
                            </div>
                        )}

                        {/* Hero */}
                        <div className="text-center px-6 py-8">
                            <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                                {state.landingContent?.headline}
                            </h1>
                            <p className="text-base text-slate-200 max-w-xl mx-auto mb-6">
                                {state.landingContent?.subheadline}
                            </p>
                            <Button size="lg" className="bg-[#8460ea] hover:bg-[#7350d0] text-white font-semibold">
                                {state.landingContent?.ctaText}
                            </Button>
                        </div>

                        {/* Pain Section with Bullets */}
                        <div className="bg-slate-800/50 px-6 py-6">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase mb-4">
                                {rawData.painSectionHeader || "Sound Familiar?"}
                            </h3>
                            {painBullets.length > 0 ? (
                                <ul className="space-y-3">
                                    {painBullets.map((bullet: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-slate-200 text-sm">
                                            <span className="text-slate-400 mt-0.5">•</span>
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-200 text-sm leading-relaxed">
                                    {state.landingContent?.painSection}
                                </p>
                            )}
                        </div>

                        {/* Solution Section with Steps */}
                        <div className="bg-emerald-900/20 px-6 py-6">
                            <h3 className="text-sm font-semibold text-emerald-400 uppercase mb-4">
                                {rawData.solutionSectionHeader || "The Solution"}
                            </h3>
                            {solutionSteps.length > 0 ? (
                                <ul className="space-y-3">
                                    {solutionSteps.map((step: string, i: number) => (
                                        <li key={i} className="flex gap-2 text-slate-200 text-sm">
                                            <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-200 text-sm leading-relaxed">
                                    {state.landingContent?.promiseSection}
                                </p>
                            )}
                        </div>

                        {/* Final CTA */}
                        <div className="text-center px-6 py-8 bg-white border border-gray-200/50">
                            <h3 className="text-xl font-bold mb-2">
                                {rawData.finalCtaHeadline || "Ready to transform?"}
                            </h3>
                            <p className="text-secondary-wabi text-sm mb-4 max-w-md mx-auto">
                                {rawData.finalCtaSubheadline || "Get started today."}
                            </p>
                            <Button size="lg" className="bg-[#8460ea] hover:bg-[#7350d0] text-white font-semibold">
                                {state.landingContent?.ctaText}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Resonance Rating */}
            <div className="max-w-2xl mx-auto mb-8">
                <ResonanceRating
                    question="How excited are you about this landing page?"
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
                    <p className="text-sm text-primary-wabi mt-2">
                        Rate the resonance to continue
                    </p>
                )}
            </div>
        </div>
    );
};

export default LandingPageScreen;
