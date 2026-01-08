import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import GameShell from "@/components/game/GameShell";
import MeSection from "@/components/game/MeSection";
import MyLifeSection, { DOMAIN_LABELS } from "@/components/game/MyLifeSection";
import MyNextMoveSection from "@/components/game/MyNextMoveSection";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { getRecommendedAction, type Action } from "@/data/actions";
import { useToast } from "@/hooks/use-toast";

interface QolDomain {
    key: string;
    label: string;
    score: number;
}

const CoreLoopHome = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    const [archetypeTitle, setArchetypeTitle] = useState<string | null>(null);
    const [level, setLevel] = useState(1);
    const [xpTotal, setXpTotal] = useState(0);
    const [qolScores, setQolScores] = useState<QolDomain[]>([]);
    const [recommendedAction, setRecommendedAction] = useState<Action | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationXp, setCelebrationXp] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            const profileId = await getOrCreateGameProfileId(user.id);

            // Load game profile
            const { data: profile } = await supabase
                .from('game_profiles')
                .select('level, xp_total, last_zog_snapshot_id, last_qol_snapshot_id')
                .eq('id', profileId)
                .single();

            if (profile) {
                setLevel(profile.level || 1);
                setXpTotal(profile.xp_total || 0);

                // Load ZoG archetype
                if (profile.last_zog_snapshot_id) {
                    const { data: zog } = await supabase
                        .from('zone_of_genius_snapshots')
                        .select('archetype_title')
                        .eq('id', profile.last_zog_snapshot_id)
                        .single();
                    if (zog?.archetype_title) {
                        setArchetypeTitle(zog.archetype_title);
                    }
                }

                // Load QoL scores
                if (profile.last_qol_snapshot_id) {
                    const { data: qol } = await supabase
                        .from('quality_of_life_snapshots')
                        .select('wealth_stage, health_stage, happiness_stage, love_relationships_stage, impact_stage, growth_stage, social_ties_stage, home_stage')
                        .eq('id', profile.last_qol_snapshot_id)
                        .single();

                    if (qol) {
                        const domains: QolDomain[] = [
                            { key: 'health_stage', label: 'Health', score: qol.health_stage || 5 },
                            { key: 'wealth_stage', label: 'Wealth', score: qol.wealth_stage || 5 },
                            { key: 'happiness_stage', label: 'Happiness', score: qol.happiness_stage || 5 },
                            { key: 'love_relationships_stage', label: 'Love', score: qol.love_relationships_stage || 5 },
                            { key: 'impact_stage', label: 'Impact', score: qol.impact_stage || 5 },
                            { key: 'growth_stage', label: 'Growth', score: qol.growth_stage || 5 },
                            { key: 'social_ties_stage', label: 'Social', score: qol.social_ties_stage || 5 },
                            { key: 'home_stage', label: 'Home', score: qol.home_stage || 5 },
                        ];
                        setQolScores(domains);

                        // Get recommended action based on lowest domain
                        const sorted = [...domains].sort((a, b) => a.score - b.score);
                        const lowestDomain = sorted[0]?.key;
                        if (lowestDomain) {
                            const action = getRecommendedAction(lowestDomain);
                            setRecommendedAction(action);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionComplete = async (action: Action) => {
        setIsCompleting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const profileId = await getOrCreateGameProfileId(user.id);

            // Award XP
            const vectorColumn = `xp_${action.vector}`;
            const { data: currentProfile } = await supabase
                .from('game_profiles')
                .select('xp_total, level, xp_body, xp_mind, xp_emotions, xp_spirit, xp_uniqueness')
                .eq('id', profileId)
                .single();

            if (currentProfile) {
                const newXpTotal = (currentProfile.xp_total || 0) + action.xp;
                const newVectorXp = ((currentProfile as any)[vectorColumn] || 0) + action.xp;

                // Simple level calculation
                const newLevel = Math.floor(newXpTotal / 500) + 1;

                await supabase
                    .from('game_profiles')
                    .update({
                        xp_total: newXpTotal,
                        [vectorColumn]: newVectorXp,
                        level: newLevel,
                        practice_count: (currentProfile as any).practice_count + 1 || 1
                    })
                    .eq('id', profileId);

                // Show celebration
                setCelebrationXp(action.xp);
                setShowCelebration(true);

                // Update local state
                setXpTotal(newXpTotal);
                setLevel(newLevel);

                // Get next action
                const sorted = [...qolScores].sort((a, b) => a.score - b.score);
                const lowestDomain = sorted[0]?.key;
                if (lowestDomain) {
                    const nextAction = getRecommendedAction(lowestDomain, [action.id]);
                    setRecommendedAction(nextAction);
                }

                // Hide celebration after delay
                setTimeout(() => setShowCelebration(false), 3000);
            }
        } catch (error) {
            console.error('Error completing action:', error);
            toast({
                title: "Error",
                description: "Could not complete action. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsCompleting(false);
        }
    };

    if (isLoading) {
        return (
            <GameShell>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            </GameShell>
        );
    }

    return (
        <GameShell>
            <div className="p-4 lg:p-6 max-w-2xl mx-auto">
                {/* Celebration Toast */}
                {showCelebration && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                        <div className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-semibold">+{celebrationXp} XP!</span>
                        </div>
                    </div>
                )}

                {/* ME Section */}
                <MeSection
                    archetypeTitle={archetypeTitle || undefined}
                    level={level}
                    xpTotal={xpTotal}
                />

                {/* MY LIFE Section */}
                {qolScores.length > 0 && (
                    <MyLifeSection qolScores={qolScores} />
                )}

                {/* MY NEXT MOVE Section */}
                <MyNextMoveSection
                    action={recommendedAction}
                    onComplete={handleActionComplete}
                    isCompleting={isCompleting}
                />
            </div>
        </GameShell>
    );
};

export default CoreLoopHome;
