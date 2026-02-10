import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, ArrowRight, AlertTriangle, Clock, DollarSign, Target } from "lucide-react";
import { useProductBuilder } from "../ProductBuilderContext";
import { PRODUCT_BUILDER_STEPS } from "../productBuilderRoutes";
import ProductBuilderLoading, { LOADING_MESSAGES } from "../ProductBuilderLoading";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { supabase } from "@/integrations/supabase/client";

const DeepPainScreen: React.FC = () => {
    const navigate = useNavigate();
    const { state, setDeepPain, setResonanceRating, setCurrentStep } = useProductBuilder();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCurrentStep(2);

        if (state.deepPain) {
            setIsLoading(false);
            return;
        }

        generateDeepPain();
    }, []);

    const generateDeepPain = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Call AI to deepen Pain using Pain Theory
            const { data, error: fnError } = await supabase.functions.invoke("deepen-pain", {
                body: {
                    icp: state.deepICP,
                },
            });

            if (fnError) throw fnError;

            setDeepPain({
                pressure: data.pressure || "What's pushing them",
                consequences: data.consequences || "What they experience daily",
                costOfInaction: data.costOfInaction || "Price of doing nothing",
                stakes: data.stakes || "What's really at risk",
                rawData: data,
            });
        } catch (err: unknown) {
            console.error("Error generating deep pain:", err);

            // Fallback to mock data based on Pain Theory Playbook
            setDeepPain({
                pressure: "Their 40th birthday is approaching. They see peers thriving in unconventional paths. The golden handcuffs feel tighter each day. Family is asking hard questions.",
                consequences: "Sunday anxiety. Monday dread. Counting hours until Friday. Energy depleted by 3pm. Creative ideas dying on the vine. Relationships suffering from their stress.",
                costOfInaction: "Another year passes. The gap between who they are and who they could be widens. Health deteriorates from chronic stress. The dream gets smaller to fit their shrinking courage.",
                stakes: "Not just their career — their identity. Their children watching them model settling. Their legacy. The world missing what only they can offer.",
                rawData: {},
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResonanceRating = (rating: number) => {
        setResonanceRating("pain", rating);
    };

    const handleContinue = () => {
        navigate(PRODUCT_BUILDER_STEPS[3].path); // Go to Promise step
    };

    if (isLoading) {
        return <ProductBuilderLoading message={LOADING_MESSAGES.pain} />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={generateDeepPain}>Try Again</Button>
            </div>
        );
    }

    const painSections = [
        {
            icon: AlertTriangle,
            title: "Pressure",
            subtitle: "What's pushing them toward a decision",
            content: state.deepPain?.pressure,
            color: "text-[#cea4ae]",
        },
        {
            icon: Flame,
            title: "Consequences",
            subtitle: "What they experience daily because of this",
            content: state.deepPain?.consequences,
            color: "text-[#cdaed2]",
        },
        {
            icon: DollarSign,
            title: "Cost of Inaction",
            subtitle: "The price of doing nothing",
            content: state.deepPain?.costOfInaction,
            color: "text-[#c8b7d8]",
        },
        {
            icon: Target,
            title: "Stakes",
            subtitle: "What's really at risk beyond the surface",
            content: state.deepPain?.stakes,
            color: "text-[#8460ea]",
        },
    ];

    return (
        <div className="py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#cea4ae]/10 mb-4">
                    <Flame className="w-8 h-8 text-[#cea4ae]" />
                </div>
                <h1 className="text-3xl font-bold text-[#2c3150] mb-2 uppercase tracking-wide">Their Pain</h1>
                <p className="text-primary-wabi">
                    This is what they're feeling right now.
                </p>
            </div>

            {/* Pain Cards */}
            <div className="grid gap-4 max-w-2xl mx-auto mb-8">
                {painSections.map((section) => (
                    <Card key={section.title} className="overflow-hidden bg-white border border-gray-200">
                        <CardContent className="p-0">
                            <div className="flex items-start gap-4 p-4">
                                <div className={`mt-1 ${section.color}`}>
                                    <section.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-primary-wabi">{section.title}</h3>
                                    <p className="text-xs text-primary-wabi mb-2">{section.subtitle}</p>
                                    <p className="text-sm text-primary-wabi leading-relaxed">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

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
                    disabled={!state.resonanceRatings.pain}
                    className="px-8 bg-[#8460ea] hover:bg-[#7350d0] text-white disabled:opacity-40"
                >
                    Crystallize Your Promise
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {!state.resonanceRatings.pain && (
                    <p className="text-sm text-primary-wabi mt-2">
                        Rate the resonance to continue
                    </p>
                )}
            </div>
        </div>
    );
};

export default DeepPainScreen;
