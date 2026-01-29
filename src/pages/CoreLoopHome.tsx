/**
 * CoreLoopHome — My Next Move Hub
 * 
 * Implements the GROW → LEARN → Nudges sequence from module_taxonomy.md
 * 
 * Sections:
 * 1. ME — Who I am (avatar, name, level, XP)
 * 2. MY LIFE — QoL domain scores
 * 3. MY NEXT MOVE — One recommended action
 */

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, BarChart3, ArrowRight, Book, Users, Rocket } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/button";
import GameShellV2 from "@/components/game/GameShellV2";
import MeSection from "@/components/game/MeSection";
import MyLifeSection from "@/components/game/MyLifeSection";
import CelebrationModal from "@/components/game/CelebrationModal";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import {
    getNextRecommendation,
    loadNudgeState,
    markNudgeSeen,
    type ProfileCompletionState,
    type Recommendation
} from "@/lib/myNextMoveLogic";
import { useToast } from "@/hooks/use-toast";

interface QolDomain {
    key: string;
    label: string;
    score: number;
}

const CoreLoopHome = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Loading state
    const [isLoading, setIsLoading] = useState(true);
    const [isGuest, setIsGuest] = useState(false);

    // Profile data (ME section)
    const [archetypeTitle, setArchetypeTitle] = useState<string | null>(null);
    const [level, setLevel] = useState(1);
    const [xpTotal, setXpTotal] = useState(0);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    // QoL data (MY LIFE section)
    const [qolScores, setQolScores] = useState<QolDomain[]>([]);

    // Recommendation state (MY NEXT MOVE section)
    const [primaryRecommendation, setPrimaryRecommendation] = useState<Recommendation | null>(null);
    const [nudgeRecommendation, setNudgeRecommendation] = useState<Recommendation | null>(null);
    const [profileCompletion, setProfileCompletion] = useState<ProfileCompletionState>({
        hasZoG: false,
        hasReadZoGProfile: false,
        hasQoL: false,
        hasResources: false,
        hasMission: false,
    });

    // Celebration modal
    const [showCelebrationModal, setShowCelebrationModal] = useState(false);
    const [celebrationXp, setCelebrationXp] = useState(50);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Guest user — show ZoG recommendation
                setIsGuest(true);
                const { primary } = getNextRecommendation(
                    { hasZoG: false, hasReadZoGProfile: false, hasQoL: false, hasResources: false, hasMission: false },
                    loadNudgeState()
                );
                setPrimaryRecommendation(primary);
                setIsLoading(false);
                return;
            }

            const profileId = await getOrCreateGameProfileId();

            // Load game profile
            const { data: profile } = await supabase
                .from('game_profiles')
                .select('level, xp_total, last_zog_snapshot_id, last_qol_snapshot_id, first_name, avatar_url')
                .eq('id', profileId)
                .single();

            if (profile) {
                setLevel(profile.level || 1);
                setXpTotal(profile.xp_total || 0);
                setDisplayName(profile.first_name || user.email?.split("@")[0] || "Player");
                setAvatarUrl((profile as any).avatar_url || null);

                // Determine completion state
                // Note: hasReadZoGProfile will use zog_profile_read_at field once DB migration is applied
                // For now, default to false (user hasn't read their profile)
                const completion: ProfileCompletionState = {
                    hasZoG: !!profile.last_zog_snapshot_id,
                    hasReadZoGProfile: false, // TODO: check (profile as any).zog_profile_read_at once DB field exists
                    hasQoL: !!profile.last_qol_snapshot_id,
                    // For now, assume not complete (will need DB fields later)
                    hasResources: false,
                    hasMission: false,
                };
                setProfileCompletion(completion);

                // Get recommendation based on completion state
                const nudges = loadNudgeState();
                const { primary, nudge } = getNextRecommendation(completion, nudges);
                setPrimaryRecommendation(primary);
                setNudgeRecommendation(nudge || null);

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
                    }
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartAction = (recommendation: Recommendation) => {
        // If it's a nudge, mark it as seen
        if (recommendation.type === 'nudge') {
            if (recommendation.id === 'nudge-collaborate') {
                markNudgeSeen('collaborate');
            } else if (recommendation.id === 'nudge-build') {
                markNudgeSeen('build');
            }
        }
        navigate(recommendation.path);
    };

    const handleDismissNudge = () => {
        if (nudgeRecommendation) {
            if (nudgeRecommendation.id === 'nudge-collaborate') {
                markNudgeSeen('collaborate');
            } else if (nudgeRecommendation.id === 'nudge-build') {
                markNudgeSeen('build');
            }
            setNudgeRecommendation(null);
        }
    };

    // Get icon for recommendation
    const getIcon = (icon: Recommendation['icon']) => {
        switch (icon) {
            case 'sparkles': return <Sparkles className="w-6 h-6" />;
            case 'book': return <Book className="w-6 h-6" />;
            case 'users': return <Users className="w-6 h-6" />;
            case 'rocket': return <Rocket className="w-6 h-6" />;
            default: return <Sparkles className="w-6 h-6" />;
        }
    };

    // Get space color
    const getSpaceColor = (space: Recommendation['space']) => {
        switch (space) {
            case 'grow': return 'lilac';
            case 'learn': return 'blue';
            case 'collaborate': return 'purple';
            case 'build': return 'emerald';
            default: return 'indigo';
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

    return (
        <GameShellV2>
            <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">

                {/* === ME SECTION === */}
                <MeSection
                    archetypeTitle={archetypeTitle || undefined}
                    level={level}
                    xpTotal={xpTotal}
                    displayName={displayName || undefined}
                    avatarUrl={avatarUrl}
                />

                {/* === MY LIFE SECTION (QoL Scores) === */}
                {qolScores.length > 0 && (
                    <MyLifeSection qolScores={qolScores} />
                )}

                {/* === MY NEXT MOVE SECTION === */}
                {primaryRecommendation && (
                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-[#2c3150]">My Next Move</h2>

                        {/* Primary Recommendation Card */}
                        <div className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg
                            ${primaryRecommendation.space === 'grow' ? 'border-[#c8b7d8] bg-[#c8b7d8]/10' : ''}
                            ${primaryRecommendation.space === 'learn' ? 'border-blue-200 bg-blue-50' : ''}
                            ${primaryRecommendation.space === 'collaborate' ? 'border-purple-200 bg-purple-50' : ''}
                            ${primaryRecommendation.space === 'build' ? 'border-emerald-200 bg-emerald-50' : ''}
                        `}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl
                                    ${primaryRecommendation.space === 'grow' ? 'bg-[#c8b7d8]/30 text-[#8460ea]' : ''}
                                    ${primaryRecommendation.space === 'learn' ? 'bg-blue-100 text-blue-600' : ''}
                                    ${primaryRecommendation.space === 'collaborate' ? 'bg-purple-100 text-purple-600' : ''}
                                    ${primaryRecommendation.space === 'build' ? 'bg-emerald-100 text-emerald-600' : ''}
                                `}>
                                    {getIcon(primaryRecommendation.icon)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-[#2c3150] mb-1">
                                        {primaryRecommendation.title}
                                    </h3>
                                    <p className="text-sm text-[rgba(44,49,80,0.7)] mb-4">
                                        {primaryRecommendation.description}
                                    </p>
                                    {primaryRecommendation.estimatedTime && (
                                        <p className="text-xs text-[rgba(44,49,80,0.5)] mb-3">
                                            ⏱️ {primaryRecommendation.estimatedTime}
                                        </p>
                                    )}
                                    <Button
                                        onClick={() => handleStartAction(primaryRecommendation)}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {primaryRecommendation.ctaLabel}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Nudge (if any) */}
                        {nudgeRecommendation && (
                            <div className={`rounded-xl border p-4 transition-all
                                ${nudgeRecommendation.space === 'collaborate' ? 'border-purple-200 bg-purple-50/50' : ''}
                                ${nudgeRecommendation.space === 'build' ? 'border-emerald-200 bg-emerald-50/50' : ''}
                            `}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg
                                            ${nudgeRecommendation.space === 'collaborate' ? 'bg-purple-100 text-purple-600' : ''}
                                            ${nudgeRecommendation.space === 'build' ? 'bg-emerald-100 text-emerald-600' : ''}
                                        `}>
                                            {getIcon(nudgeRecommendation.icon)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#2c3150] text-sm">
                                                {nudgeRecommendation.title}
                                            </p>
                                            <p className="text-xs text-[rgba(44,49,80,0.6)]">
                                                {nudgeRecommendation.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDismissNudge}
                                        >
                                            Later
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleStartAction(nudgeRecommendation)}
                                        >
                                            Explore
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Explore All Spaces Link */}
                        <div className="text-center pt-2">
                            <Link
                                to="/game/grow"
                                className="text-sm text-[rgba(44,49,80,0.6)] hover:text-[#2c3150] transition-colors"
                            >
                                ▼ Explore All Spaces
                            </Link>
                        </div>
                    </section>
                )}

                {/* Guest Sign In Prompt */}
                {isGuest && (
                    <div className="text-center text-sm text-[#2c3150]/60 pt-4">
                        Already have an account?{" "}
                        <Link to="/auth" className="text-[#8460ea] hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                )}
            </div>

            {/* Celebration Modal */}
            <CelebrationModal
                isOpen={showCelebrationModal}
                onClose={() => setShowCelebrationModal(false)}
                xpEarned={celebrationXp}
                title="Great Progress!"
                message="You're building your transformation journey."
            />
        </GameShellV2>
    );
};

export default CoreLoopHome;
