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

            setDeepTP({
                pointA: data.pointA || "Where they are now",
                pointB: data.pointB || "Where they want to be",
                promiseStatement: data.promiseStatement || "The transformation you create",
                rawData: data,
            });
        } catch (err: unknown) {
            console.error("Error generating TP:", err);

            // Fallback mock data
            setDeepTP({
                pointA: "Successful on paper but unfulfilled inside. Trading time for money in a role that doesn't fit. Knowing they have more to give but not knowing how to package it.",
                pointB: "Waking up excited to work. Serving clients who value their unique perspective. Earning well while being authentically themselves. Making an impact that matters.",
                promiseStatement: "I help accomplished professionals who feel stuck transform their unique genius into a thriving business that feels like play.",
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                    <Sparkles className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Promise</h1>
                <p className="text-slate-600">
                    This is the bridge you build for them.
                </p>
            </div>

            {/* Point A → Point B */}
            <div className="max-w-3xl mx-auto mb-8">
                <div className="grid md:grid-cols-2 gap-4 items-stretch relative">
                    {/* Point A */}
                    <Card className="bg-red-900 border-red-700">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                                    A
                                </div>
                                <h3 className="font-semibold text-white">Where They Are Now</h3>
                            </div>
                            <p className="text-red-100 leading-relaxed text-sm">
                                {state.deepTP?.pointA}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Arrow - hidden on mobile, visible on desktop */}
                    <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <ArrowRightCircle className="w-10 h-10 text-amber-400 bg-white rounded-full" />
                    </div>

                    {/* Point B */}
                    <Card className="bg-green-900 border-green-700">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                                    B
                                </div>
                                <h3 className="font-semibold text-white">Where They Want To Be</h3>
                            </div>
                            <p className="text-green-100 leading-relaxed text-sm">
                                {state.deepTP?.pointB}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile arrow */}
                <div className="flex md:hidden justify-center py-4">
                    <ArrowRight className="w-6 h-6 text-amber-600" />
                </div>
            </div>

            {/* Promise Statement */}
            <Card className="max-w-2xl mx-auto mb-8 bg-slate-900 border-slate-700">
                <CardContent className="p-6 text-center">
                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wide mb-3">
                        Your Transformational Promise
                    </h3>
                    <p className="text-xl font-medium text-white leading-relaxed">
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
                    <p className="text-sm text-slate-600 mt-2">
                        Rate the resonance to continue
                    </p>
                )}
            </div>
        </div>
    );
};

export default DeepTPScreen;
