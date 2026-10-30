import { useEffect, useState } from "react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import GameShellV2 from "@/components/game/GameShellV2";
import MeSummary from "@/components/game/MeSummary";
import MyLifeSummary from "@/components/game/MyLifeSummary";
import PlayerNextMoveCard from "@/components/game/PlayerNextMoveCard";
import EmptyStateCard from "@/components/game/EmptyStateCard";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";
import { usePlayerLevel } from "@/hooks/usePlayerLevel";

/**
 * DailyLoopV2 - Simplified Game Home using new ME / MY LIFE / MY NEXT MOVE layout
 * This is a test page for the new Daily Loop design
 */
export default function DailyLoopV2() {
    const { level } = usePlayerLevel();

    const [isLoading, setIsLoading] = useState(true);
    const [zogSnapshot, setZogSnapshot] = useState<any>(null);
    const [qolScores, setQolScores] = useState<any>(null);

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
                    setQolScores({
                        wealth: qol.wealth_stage,
                        health: qol.health_stage,
                        happiness: qol.happiness_stage,
                        love: qol.love_relationships_stage,
                        impact: qol.impact_stage,
                        growth: qol.growth_stage,
                        socialTies: qol.social_ties_stage,
                        home: qol.home_stage,
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
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
                        level={level}
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

                {/* MY NEXT MOVE Section: the same move the map card shows */}
                <PlayerNextMoveCard />
            </div>
        </GameShellV2>
    );
}
