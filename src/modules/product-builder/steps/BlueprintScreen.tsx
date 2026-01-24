import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, ArrowRight, Download, ChevronRight } from "lucide-react";
import { useProductBuilder } from "../ProductBuilderContext";
import { PRODUCT_BUILDER_STEPS } from "../productBuilderRoutes";
import ProductBuilderLoading, { LOADING_MESSAGES } from "../ProductBuilderLoading";
import { supabase } from "@/integrations/supabase/client";

const BlueprintScreen: React.FC = () => {
    const navigate = useNavigate();
    const { state, setBlueprintContent, setCurrentStep } = useProductBuilder();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCurrentStep(5);

        if (state.blueprintContent) {
            setIsLoading(false);
            return;
        }

        generateBlueprint();
    }, []);

    const generateBlueprint = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke("generate-blueprint", {
                body: {
                    icp: state.deepICP,
                    pain: state.deepPain,
                    tp: state.deepTP,
                },
            });

            if (fnError) throw fnError;

            setBlueprintContent({
                title: data.title || "Your Blueprint",
                steps: data.steps || [],
                ctaSection: data.ctaSection || "Ready to go deeper?",
                rawData: data,
            });
        } catch (err: unknown) {
            console.error("Error generating blueprint:", err);

            // Fallback mock data
            setBlueprintContent({
                title: "The Genius Business Blueprint",
                steps: [
                    "Identify your unique Zone of Genius — the intersection of what you love, what you're great at, and what feels effortless",
                    "Define your Ideal Client — the person who needs exactly what you offer and is ready to pay for it",
                    "Craft your Transformational Promise — the clear Point A → Point B journey you guide clients through",
                    "Build your minimum viable product — start with 1:1 sessions before scaling to courses or software",
                    "Launch with authenticity — your story is your marketing"
                ],
                ctaSection: "Ready to build your Genius Business with expert guidance? Book a discovery call to see how I can help you fast-track your transformation.",
                rawData: {},
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        navigate(PRODUCT_BUILDER_STEPS[6].path); // Go to CTA step
    };

    const handleSkip = () => {
        // Use default blueprint and continue
        navigate(PRODUCT_BUILDER_STEPS[6].path);
    };

    if (isLoading) {
        return <ProductBuilderLoading message={LOADING_MESSAGES.blueprint} />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={generateBlueprint}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                    <BookOpen className="w-8 h-8 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Blueprint</h1>
                <p className="text-slate-600">
                    This is your gift to them — a lead magnet they can download.
                </p>
            </div>

            {/* Blueprint Preview */}
            <Card className="max-w-2xl mx-auto mb-8">
                <CardContent className="p-6">
                    {/* Title */}
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                        <Download className="w-6 h-6 text-amber-600" />
                        <h2 className="text-xl font-bold text-slate-900">
                            {state.blueprintContent?.title}
                        </h2>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4 mb-6">
                        {state.blueprintContent?.steps.map((step, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-amber-600">{index + 1}</span>
                                </div>
                                <p className="text-slate-900/80 leading-relaxed pt-1">{step}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                        <p className="text-slate-900/80 text-sm">
                            {state.blueprintContent?.ctaSection}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="w-full sm:w-auto"
                >
                    Skip — use default
                </Button>
                <Button
                    size="lg"
                    onClick={handleContinue}
                    className="px-8 w-full sm:w-auto"
                >
                    Set Your CTA
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default BlueprintScreen;
