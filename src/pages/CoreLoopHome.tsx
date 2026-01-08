import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle2, Sparkles, BarChart3, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShell from "@/components/game/GameShell";
import MeSection from "@/components/game/MeSection";
import MyLifeSection from "@/components/game/MyLifeSection";
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

// Onboarding stages
type OnboardingStage = 'zog' | 'qol' | 'profile' | 'explore' | 'complete';

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

    // Onboarding state
    const [onboardingStage, setOnboardingStage] = useState<OnboardingStage>('complete');
    const [hasZoG, setHasZoG] = useState(false);
    const [hasQoL, setHasQoL] = useState(false);

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

            const profileId = await getOrCreateGameProfileId();

            // Load game profile
            const { data: profile } = await supabase
                .from('game_profiles')
                .select('level, xp_total, last_zog_snapshot_id, last_qol_snapshot_id, practice_count')
                .eq('id', profileId)
                .single();

            if (profile) {
                setLevel(profile.level || 1);
                setXpTotal(profile.xp_total || 0);

                // Check onboarding state
                const zogComplete = !!profile.last_zog_snapshot_id;
                const qolComplete = !!profile.last_qol_snapshot_id;
                const hasFirstAction = (profile.practice_count || 0) > 0;

                setHasZoG(zogComplete);
                setHasQoL(qolComplete);

                // Determine onboarding stage
                if (!zogComplete) {
                    setOnboardingStage('zog');
                } else if (!qolComplete) {
                    setOnboardingStage('qol');
                } else if (!hasFirstAction) {
                    setOnboardingStage('explore'); // Ready for first action
                } else {
                    setOnboardingStage('complete');
                }

                // Load ZoG archetype
                if (profile.last_zog_snapshot_id) {
                    const { data: zog } = await supabase
                        .from('zog_snapshots')
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
                        .from('qol_snapshots')
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

            const profileId = await getOrCreateGameProfileId();

            // Award XP
            const vectorColumn = `xp_${action.vector}`;
            const { data: currentProfile } = await supabase
                .from('game_profiles')
                .select('xp_total, level, xp_body, xp_mind, xp_emotions, xp_spirit, xp_uniqueness, practice_count')
                .eq('id', profileId)
                .single();

            if (currentProfile) {
                const newXpTotal = (currentProfile.xp_total || 0) + action.xp;
                const newVectorXp = ((currentProfile as any)[vectorColumn] || 0) + action.xp;
                const newPracticeCount = (currentProfile.practice_count || 0) + 1;

                // Simple level calculation
                const newLevel = Math.floor(newXpTotal / 500) + 1;

                await supabase
                    .from('game_profiles')
                    .update({
                        xp_total: newXpTotal,
                        [vectorColumn]: newVectorXp,
                        level: newLevel,
                        practice_count: newPracticeCount
                    })
                    .eq('id', profileId);

                // Show celebration
                setCelebrationXp(action.xp);
                setShowCelebration(true);

                // Update local state
                setXpTotal(newXpTotal);
                setLevel(newLevel);
                setOnboardingStage('complete'); // First action done!

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

    // Onboarding: Need Zone of Genius
    if (onboardingStage === 'zog') {
        return (
            <GameShell>
                <div className="p-6 lg:p-8 max-w-xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                            <Sparkles className="w-8 h-8 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to Your Journey</h1>
                        <p className="text-slate-600">Let's start by discovering who you are at your best.</p>
                    </div>

                    <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 mb-6">
                        <h2 className="font-semibold text-slate-900 mb-2">Step 1: Discover Your Zone of Genius</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            In just 5 minutes, you'll uncover your unique archetype and core talents.
                            This becomes the foundation for everything else.
                        </p>
                        <Button asChild className="w-full" size="lg">
                            <Link to="/zone-of-genius">
                                Start Discovery
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="w-3 h-3 rounded-full bg-slate-200" />
                        <span className="w-3 h-3 rounded-full bg-slate-200" />
                        <span className="w-3 h-3 rounded-full bg-slate-200" />
                    </div>
                </div>
            </GameShell>
        );
    }

    // Onboarding: Need Quality of Life
    if (onboardingStage === 'qol') {
        return (
            <GameShell>
                <div className="p-6 lg:p-8 max-w-xl mx-auto">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Great, {archetypeTitle ? `${archetypeTitle}!` : 'Genius Discovered!'}
                        </h1>
                        <p className="text-slate-600">Now let's see where your life is asking for attention.</p>
                    </div>

                    <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6 mb-6">
                        <h2 className="font-semibold text-slate-900 mb-2">Step 2: Map Your Quality of Life</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Assess 8 life domains in 5 minutes. This reveals your growth drivers
                            and helps us recommend your next moves.
                        </p>
                        <Button asChild className="w-full" size="lg">
                            <Link to="/quality-of-life-map/assessment">
                                Start Assessment
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="w-3 h-3 rounded-full bg-slate-200" />
                        <span className="w-3 h-3 rounded-full bg-slate-200" />
                    </div>
                </div>
            </GameShell>
        );
    }

    // Onboarding: Ready for first action (explore)
    if (onboardingStage === 'explore') {
        return (
            <GameShell>
                <div className="p-4 lg:p-6 max-w-2xl mx-auto">
                    {/* Show ME section */}
                    <MeSection
                        archetypeTitle={archetypeTitle || undefined}
                        level={level}
                        xpTotal={xpTotal}
                    />

                    {/* Show MY LIFE section */}
                    {qolScores.length > 0 && (
                        <MyLifeSection qolScores={qolScores} />
                    )}

                    {/* First Action Card */}
                    <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Compass className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Your First Move</span>
                        </div>
                        <h2 className="font-semibold text-slate-900 mb-2">Ready to Begin Your Journey?</h2>
                        <p className="text-sm text-slate-600 mb-4">
                            Complete your first action to activate your daily rhythm.
                            Each action earns XP and moves you closer to your goals.
                        </p>
                    </div>

                    {/* MY NEXT MOVE Section */}
                    <MyNextMoveSection
                        action={recommendedAction}
                        onComplete={handleActionComplete}
                        isCompleting={isCompleting}
                    />

                    {/* Progress indicator */}
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-6">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                </div>
            </GameShell>
        );
    }

    // Full Core Loop (onboarding complete)
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
