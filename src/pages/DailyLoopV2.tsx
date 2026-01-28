import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import GameShellV2 from "@/components/game/GameShellV2";
import MeSummary from "@/components/game/MeSummary";
import MyLifeSummary from "@/components/game/MyLifeSummary";
import NextMoveCard from "@/components/game/NextMoveCard";
import EmptyStateCard from "@/components/game/EmptyStateCard";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";
import { getRecommendedVector, STARTER_ACTIONS, type VectorId } from "@/lib/domainMapping";
import { type UnifiedAction } from "@/types/actions";
import { durationToBucket } from "@/lib/actionEngine";

/**
 * DailyLoopV2 - Simplified Game Home using new ME / MY LIFE / MY NEXT MOVE layout
 * This is a test page for the new Daily Loop design
 */
export default function DailyLoopV2() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [zogSnapshot, setZogSnapshot] = useState<any>(null);
    const [qolScores, setQolScores] = useState<any>(null);
    const [nextAction, setNextAction] = useState<UnifiedAction | null>(null);
    const [recommendedVector, setRecommendedVector] = useState<VectorId | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const profileId = await getOrCreateGameProfileId();

            // Fetch profile
            const { data: profileData } = await supabase
                .from("game_profiles")
                .select("*")
                .eq("id", profileId)
                .maybeSingle();

            if (!profileData) return;
            setProfile(profileData);

            // Fetch ZoG snapshot if exists (using zog_snapshots table)
            if (profileData.last_zog_snapshot_id) {
                const { data: zog } = await supabase
                    .from("zog_snapshots")
                    .select("id, archetype_title, core_pattern")
                    .eq("id", profileData.last_zog_snapshot_id)
                    .maybeSingle();
                setZogSnapshot(zog);
            }

            // Fetch QoL snapshot if exists
            if (profileData.last_qol_snapshot_id) {
                const { data: qol } = await supabase
                    .from("qol_snapshots")
                    .select("*")
                    .eq("id", profileData.last_qol_snapshot_id)
                    .maybeSingle();

                if (qol) {
                    const scores = {
                        wealth: qol.wealth_stage,
                        health: qol.health_stage,
                        happiness: qol.happiness_stage,
                        love: qol.love_relationships_stage,
                        impact: qol.impact_stage,
                        growth: qol.growth_stage,
                        socialTies: qol.social_ties_stage,
                        home: qol.home_stage,
                    };
                    setQolScores(scores);

                    // Get recommended action based on lowest domain
                    const vector = getRecommendedVector(scores);
                    setRecommendedVector(vector);

                    if (vector) {
                        const starter = STARTER_ACTIONS[vector];
                        setNextAction({
                            id: `starter:${vector}`,
                            type: "practice",
                            loop: "transformation",
                            title: starter.title,
                            duration: durationToBucket(starter.duration),
                            whyRecommended: `Your ${vector} development supports your growth.`,
                            source: "lib/domainMapping.ts",
                            growthPath: vector,
                        });
                    }
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStart = () => {
        // Navigate to library with recommended vector filter
        if (recommendedVector) {
            navigate(`/game/transformation/library?vector=${recommendedVector}`);
        } else {
            navigate("/game/transformation/library");
        }
    };

    const handleExplore = () => {
        navigate("/game/transformation/library");
    };

    if (isLoading) {
        return (
            <GameShellV2>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <PremiumLoader size="lg" />
                </div>
            </GameShellV2>
        );
    }

    const hasZog = !!zogSnapshot;
    const hasQol = !!qolScores;

    return (
        <GameShellV2>
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* ME Section */}
                {hasZog ? (
                    <MeSummary
                        archetypeTitle={zogSnapshot?.archetype_title}
                        level={profile?.level || 1}
                        xpTotal={profile?.xp_total || 0}
                        xpToNextLevel={100}
                    />
                ) : (
                    <EmptyStateCard type="zog" />
                )}

                {/* MY LIFE Section */}
                {hasQol ? (
                    <MyLifeSummary scores={qolScores} />
                ) : hasZog ? (
                    <EmptyStateCard type="qol" />
                ) : null}

                {/* MY NEXT MOVE Section */}
                {hasZog && hasQol && (
                    <NextMoveCard
                        action={nextAction}
                        onStart={handleStart}
                        onExplore={handleExplore}
                        isLoading={false}
                    />
                )}
            </div>
        </GameShellV2>
    );
}
