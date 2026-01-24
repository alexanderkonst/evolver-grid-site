import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, ArrowRight } from "lucide-react";
import { useProductBuilder } from "../ProductBuilderContext";
import { PRODUCT_BUILDER_STEPS } from "../productBuilderRoutes";
import ProductBuilderLoading, { LOADING_MESSAGES } from "../ProductBuilderLoading";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { supabase } from "@/integrations/supabase/client";

const DeepICPScreen: React.FC = () => {
    const navigate = useNavigate();
    const { state, setDeepICP, setResonanceRating, setCurrentStep } = useProductBuilder();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCurrentStep(1);

        // If we already have ICP data, don't regenerate
        if (state.deepICP) {
            setIsLoading(false);
            return;
        }

        generateDeepICP();
    }, []);

    const generateDeepICP = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get user's Excalibur data via game_profiles
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // First get the profile_id
            const { data: profile } = await supabase
                .from("game_profiles")
                .select("id, last_zog_snapshot_id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (!profile?.last_zog_snapshot_id) {
                throw new Error("No Genius Business data found. Please complete Excalibur first.");
            }

            // Get the snapshot using the profile's reference
            const { data: snapshot } = await supabase
                .from("zog_snapshots")
                .select("excalibur_data")
                .eq("id", profile.last_zog_snapshot_id)
                .maybeSingle();

            if (!snapshot?.excalibur_data) {
                throw new Error("No Genius Business data found. Please complete Excalibur first.");
            }

            const excalibur = snapshot.excalibur_data as Record<string, unknown>;

            // Try to call AI to deepen ICP
            try {
                const { data, error: fnError } = await supabase.functions.invoke("deepen-icp", {
                    body: { excalibur: snapshot.excalibur_data },
                });

                if (!fnError && data) {
                    setDeepICP({
                        who: data.who || "Your ideal client",
                        struggles: data.struggles || "Their key struggles",
                        desires: data.desires || "What they truly want",
                        rawData: data,
                    });
                    return;
                }
            } catch (aiErr) {
                console.log("AI function not available, using Excalibur data directly");
            }

            // Fallback: Use Excalibur data directly
            const idealClient = (excalibur.idealClient as Record<string, string>) || {};
            const offer = (excalibur.offer as Record<string, string>) || {};

            setDeepICP({
                who: idealClient.profile || offer.whoFor || "Professionals seeking transformation",
                struggles: idealClient.struggles || "Feeling stuck despite external success",
                desires: idealClient.desires || "To do meaningful work that feels authentic",
                rawData: excalibur,
            });
        } catch (err: unknown) {
            console.error("Error generating deep ICP:", err);

            // Final fallback to mock data for demo
            setDeepICP({
                who: "Ambitious professionals in their 30s-40s who feel stuck despite external success. They've achieved what society told them to achieve, but something feels missing.",
                struggles: "They're exhausted from performing a role that doesn't fit. Every day feels like wearing a mask. They have skills but aren't sure how to package their unique gifts.",
                desires: "They want to wake up excited. To do work that feels like play. To be paid well for being authentically themselves. To make an impact that matters.",
                rawData: {},
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResonanceRating = (rating: number) => {
        setResonanceRating("icp", rating);
    };

    const handleContinue = () => {
        navigate(PRODUCT_BUILDER_STEPS[2].path); // Go to Pain step
    };

    if (isLoading) {
        return <ProductBuilderLoading message={LOADING_MESSAGES.icp} />;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={generateDeepICP}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white border border-gray-200 mb-4">
                    <User className="w-8 h-8 text-slate-800" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Your Ideal Client</h1>
                <p className="text-slate-800">
                    Meet the person waiting for your gift.
                </p>
            </div>

            {/* ICP Card */}
            <Card className="mb-8 max-w-2xl mx-auto bg-white border border-gray-200 border-slate-700">
                <CardContent className="p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-2">
                            Who They Are
                        </h3>
                        <p className="text-slate-800 leading-relaxed">{state.deepICP?.who}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-2">
                            What They're Struggling With
                        </h3>
                        <p className="text-slate-800 leading-relaxed">{state.deepICP?.struggles}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-2">
                            What They Truly Want
                        </h3>
                        <p className="text-slate-800 leading-relaxed">{state.deepICP?.desires}</p>
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
                    disabled={!state.resonanceRatings.icp}
                    className="px-8"
                >
                    Deepen Their Pain
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {!state.resonanceRatings.icp && (
                    <p className="text-sm text-slate-800 mt-2">
                        Rate the resonance to continue
                    </p>
                )}
            </div>
        </div>
    );
};

export default DeepICPScreen;
