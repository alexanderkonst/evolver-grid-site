import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, ArrowRightCircle } from "lucide-react";
import { useProductBuilder } from "../ProductBuilderContext";
import { PRODUCT_BUILDER_STEPS } from "../productBuilderRoutes";
import ProductBuilderLoading, { LOADING_MESSAGES } from "../ProductBuilderLoading";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { supabase } from "@/integrations/supabase/client";

const DeepTPScreen: React.FC = () => {
    const navigate = useNavigate();
    const { state, setDeepTP, setResonanceRating, setCurrentStep } = useProductBuilder();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCurrentStep(3);

        if (state.deepTP) {
            setIsLoading(false);
            return;
        }

        generateDeepTP();
    }, []);

    const generateDeepTP = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke("deepen-tp", {
                body: {
                    icp: state.deepICP,
                    pain: state.deepPain,
                },
            });

            if (fnError) throw fnError;

            // Build a smart fallback promiseStatement if AI doesn't provide one
            const buildPromiseStatement = () => {
                if (data.promiseStatement && data.promiseStatement !== "The transformation you create") {
                    return data.promiseStatement;
                }
                // Generate from ICP and Pain data
                const who = state.deepICP?.who?.split('.')[0] || "people who feel stuck";
                const desire = state.deepICP?.desires?.split('.')[0] || "achieve their full potential";
                return `I help ${who} ${desire}.`;
            };

            setDeepTP({
                pointA: data.pointA || "Where they are now",
                pointB: data.pointB || "Where they want to be",
                promiseStatement: buildPromiseStatement(),
                rawData: data,
            });
        } catch (err: unknown) {
            console.error("Error generating TP:", err);

            // Fallback mock data - but try to use real ICP data if available
            const who = state.deepICP?.who?.split('.')[0] || "accomplished professionals who feel stuck";
            const desire = state.deepICP?.desires?.split('.')[0] || "transform their unique genius into a thriving business";

            setDeepTP({
                pointA: state.deepPain?.consequences || "Successful on paper but unfulfilled inside. Trading time for money in a role that doesn't fit.",
                pointB: state.deepICP?.desires || "Waking up excited to work. Serving clients who value their unique perspective.",
                promiseStatement: `I help ${who} ${desire}.`,
                rawData: {},
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResonanceRating = (rating: number) => {
        setResonanceRating("tp", rating);
    };

    const handleContinue = () => {
        navigate(PRODUCT_BUILDER_STEPS[4].path); // Go to Landing step
    };

    if (isLoading) {
        return <ProductBuilderLoading message={LOADING_MESSAGES.tp} />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={generateDeepTP}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-gray-200 mb-4">
                    <Sparkles className="w-8 h-8 text-primary-wabi" />
                </div>
                <h1 className="text-3xl font-bold text-primary-wabi mb-2">Your Promise</h1>
                <p className="text-primary-wabi">
                    This is the bridge you build for them.
                </p>
            </div>

            {/* Point A → Point B */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="grid md:grid-cols-2 gap-4 items-stretch relative">
                    {/* Point A */}
                    <Card className="bg-white border border-[#cea4ae]/40">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#cea4ae] flex items-center justify-center text-white font-bold text-sm">
                                    A
                                </div>
                                <h3 className="font-semibold text-primary-wabi">Where They Are Now</h3>
                            </div>
                            <p className="text-primary-wabi leading-relaxed text-sm">
                                {state.deepTP?.pointA}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Arrow - hidden on mobile, visible on desktop */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <ArrowRightCircle className="w-10 h-10 text-primary-wabi bg-white rounded-full" />
                    </div>

                    {/* Point B */}
                    <Card className="bg-white border border-[#8460ea]/40">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-[#8460ea] flex items-center justify-center text-white font-bold text-sm">
                                    B
                                </div>
                                <h3 className="font-semibold text-primary-wabi">Where They Want To Be</h3>
                            </div>
                            <p className="text-primary-wabi leading-relaxed text-sm">
                                {state.deepTP?.pointB}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile arrow */}
                <div className="flex md:hidden justify-center py-4">
                    <ArrowRight className="w-6 h-6 text-primary-wabi" />
                </div>
            </div>

            {/* Promise Statement */}
            <Card className="max-w-2xl mx-auto mb-8 bg-white border border-gray-200">
                <CardContent className="p-6 text-center">
                    <h3 className="text-sm font-semibold text-primary-wabi uppercase tracking-wide mb-3">
                        Your Transformational Promise
                    </h3>
                    <p className="text-xl font-medium text-primary-wabi leading-relaxed">
                        "{state.deepTP?.promiseStatement}"
                    </p>
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
                    disabled={!state.resonanceRatings.tp}
                    className="px-8"
                >
                    Build Landing Page
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {!state.resonanceRatings.tp && (
                    <p className="text-sm text-primary-wabi mt-2">
                        Rate the resonance to continue
                    </p>
                )}
            </div>
        </div>
    );
};

export default DeepTPScreen;
