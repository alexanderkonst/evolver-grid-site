/**
 * TODAY Screen — Single source of daily action
 * 
 * Shows up to 3 actions:
 * 1. Main Quest (Storyline) — current step
 * 2. Side Quest (Practice) — AI-recommended practice
 * 3. Upgrade (Skill Tree) — next available node
 * 
 * If all done: Done for Today state with optional bonus practice
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Sparkles, Target, Zap, CheckCircle2, Flame, Trophy, ChevronRight, Loader2, BookOpen, Gift
} from "lucide-react";
import {
    getMainQuestCopy,
    computeNextMainQuestStage,
    isStageComplete,
    buildPlayerStats,
    getStageNumber,
    getTotalStages,
    type MainQuestStage,
} from "@/lib/mainQuest";
import { advanceMainQuestIfEligible, markRealWorldOutputDone } from "@/lib/mainQuestApi";
import { completeSideQuest, getRecentQuestRuns, type QuestRun } from "@/lib/questRunsApi";
import { getUpgradesByBranch, getPlayerUpgrades, completeUpgrade, type Upgrade } from "@/lib/upgradeSystem";
import { LIBRARY_ITEMS } from "@/modules/library/libraryContent";

// Types
interface TodayProfile {
    id: string;
    xp_total: number;
    level: number;
    current_streak_days: number;
    longest_streak_days: number;
    practice_count: number;
    main_quest_stage: string | null;
    main_quest_progress: any;
    last_zog_snapshot_id: string | null;
    zone_of_genius_completed: boolean | null;
}

interface SideQuestRecommendation {
    domain: string;
    practice: {
        id: string;
        title: string;
        duration_min: number;
        tags: string[];
        source: string;
    };
    why: string[];
}

export default function TodayPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<TodayProfile | null>(null);
    const [sideQuest, setSideQuest] = useState<SideQuestRecommendation | null>(null);
    const [nextUpgrade, setNextUpgrade] = useState<Upgrade | null>(null);
    const [completedUpgradeCodes, setCompletedUpgradeCodes] = useState<Set<string>>(new Set());
    const [todayQuestRuns, setTodayQuestRuns] = useState<QuestRun[]>([]);

    // Loading states
    const [loadingSideQuest, setLoadingSideQuest] = useState(false);
    const [completingSideQuest, setCompletingSideQuest] = useState(false);
    const [completingUpgrade, setCompletingUpgrade] = useState(false);
    const [completingMainQuest, setCompletingMainQuest] = useState(false);

    // Computed states
    const mainQuestStage = (profile?.main_quest_stage || 'mq_0_gateway') as MainQuestStage;
    const mainQuestCopy = getMainQuestCopy(mainQuestStage);

    const playerStats = profile ? buildPlayerStats(
        profile,
        completedUpgradeCodes.size,
        !!profile.last_zog_snapshot_id
    ) : null;

    const mainQuestComplete = playerStats ? isStageComplete(mainQuestStage, profile, playerStats) : false;
    const sideQuestDoneToday = todayQuestRuns.length > 0;
    const upgradeDoneToday = false; // TODO: track in session

    const allDoneForToday = mainQuestComplete && sideQuestDoneToday;

    // Load data
    const loadTodayData = useCallback(async () => {
        try {
            setIsLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/auth");
                return;
            }

            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from("game_profiles")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle();

            if (profileError) throw profileError;
            if (!profileData) {
                navigate("/zone-of-genius");
                return;
            }

            setProfile(profileData as TodayProfile);

            // Fetch completed upgrades
            const playerUpgrades = await getPlayerUpgrades(profileData.id);
            const codes = new Set<string>(playerUpgrades.map((pu: any) => pu.code));
            setCompletedUpgradeCodes(codes);

            // Fetch next available upgrade
            const allUpgrades = await getUpgradesByBranch('uniqueness', 'mastery_of_genius');
            const available = allUpgrades.find(u => !codes.has(u.code));
            setNextUpgrade(available || null);

            // Fetch today's quest runs
            const runs = await getRecentQuestRuns(profileData.id, 7);
            const today = new Date().toDateString();
            const todayRuns = runs.filter(r => new Date(r.completed_at).toDateString() === today);
            setTodayQuestRuns(todayRuns);

            // Fetch side quest recommendation
            await fetchSideQuestRecommendation();

        } catch (err) {
            console.error("Error loading today data:", err);
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [navigate, toast]);

    const fetchSideQuestRecommendation = async () => {
        try {
            setLoadingSideQuest(true);

            const practices = LIBRARY_ITEMS.slice(0, 20).map(item => ({
                id: item.id,
                title: item.title,
                type: item.type,
                duration_minutes: item.duration,
                primary_path: item.primaryPath,
                tags: [item.type],
            }));

            const { data, error } = await supabase.functions.invoke('suggest-next-quest', {
                body: {
                    intention: "personal growth and transformation",
                    practices,
                    context: {},
                },
            });

            if (error) throw error;
            setSideQuest(data);
        } catch (err) {
            console.error("Error fetching side quest:", err);
        } finally {
            setLoadingSideQuest(false);
        }
    };

    useEffect(() => {
        loadTodayData();
    }, [loadTodayData]);

    // Handlers
    const handleCompleteSideQuest = async () => {
        if (!profile || !sideQuest) return;

        try {
            setCompletingSideQuest(true);

            const result = await completeSideQuest({
                profileId: profile.id,
                practiceId: sideQuest.practice.id,
                practiceTitle: sideQuest.practice.title,
                domain: sideQuest.domain as any,
                durationMin: sideQuest.practice.duration_min,
            });

            if (result.success) {
                toast({
                    title: `+${result.xpAwarded} XP earned!`,
                    description: `Streak: ${result.newStreak} days 🔥`,
                });
                await loadTodayData();
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            console.error("Error completing side quest:", err);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setCompletingSideQuest(false);
        }
    };

    const handleCompleteUpgrade = async () => {
        if (!profile || !nextUpgrade) return;

        try {
            setCompletingUpgrade(true);
            await completeUpgrade(profile.id, nextUpgrade.code);
            toast({ title: "Upgrade Complete!", description: `+${nextUpgrade.xp_reward || 25} XP` });
            await loadTodayData();
        } catch (err: any) {
            console.error("Error completing upgrade:", err);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setCompletingUpgrade(false);
        }
    };

    const handleCompleteMainQuest = async () => {
        if (!profile) return;

        try {
            setCompletingMainQuest(true);

            if (mainQuestStage === 'mq_5_real_world_output') {
                await markRealWorldOutputDone(profile.id);
                toast({ title: "🎉 Main Quest Complete!", description: "You've created a real-world output!" });
            }

            await loadTodayData();
        } catch (err: any) {
            console.error("Error completing main quest:", err);
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setCompletingMainQuest(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Today</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {profile?.current_streak_days || 0} day streak
                        </span>
                        <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            Level {profile?.level || 1}
                        </span>
                        <span>{profile?.xp_total || 0} XP</span>
                    </div>
                </header>

                {/* Done for Today State */}
                {allDoneForToday && (
                    <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center mb-6">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Done for Today! 🎉</h2>
                        <p className="text-slate-600 mb-6">You've completed your daily actions. Great work!</p>
                        <Button variant="outline" onClick={fetchSideQuestRecommendation}>
                            <Gift className="w-4 h-4 mr-2" />
                            Bonus Side Quest
                        </Button>
                    </div>
                )}

                <div className="space-y-4">

                    {/* 1. Main Quest (Storyline) */}
                    <div className={`rounded-2xl border-2 p-5 ${mainQuestComplete
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50'
                        }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mainQuestComplete ? 'bg-emerald-500' : 'bg-indigo-600'
                                    }`}>
                                    {mainQuestComplete
                                        ? <CheckCircle2 className="w-4 h-4 text-white" />
                                        : <Sparkles className="w-4 h-4 text-white" />
                                    }
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                    Main Quest
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                Stage {getStageNumber(mainQuestStage)} of {getTotalStages()}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">{mainQuestCopy.title}</h3>
                        <p className="text-sm text-slate-600 mb-4">{mainQuestCopy.objective}</p>

                        {mainQuestComplete ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Complete</span>
                            </div>
                        ) : mainQuestStage === 'mq_5_real_world_output' ? (
                            <Button
                                onClick={handleCompleteMainQuest}
                                disabled={completingMainQuest}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                {completingMainQuest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Mark as Done ✓
                            </Button>
                        ) : (
                            <Button
                                onClick={() => mainQuestCopy.ctaRoute && navigate(mainQuestCopy.ctaRoute)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                {mainQuestCopy.ctaLabel}
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        )}
                    </div>

                    {/* 2. Side Quest (Practice) */}
                    <div className={`rounded-2xl border-2 p-5 ${sideQuestDoneToday
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-slate-200 bg-white'
                        }`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sideQuestDoneToday ? 'bg-emerald-500' : 'bg-emerald-600'
                                }`}>
                                {sideQuestDoneToday
                                    ? <CheckCircle2 className="w-4 h-4 text-white" />
                                    : <Target className="w-4 h-4 text-white" />
                                }
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                Side Quest (Practice)
                            </span>
                        </div>

                        {sideQuestDoneToday ? (
                            <>
                                <div className="flex items-center gap-2 text-emerald-600 mb-3">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        Completed: {todayQuestRuns[0]?.practice_title}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchSideQuestRecommendation}
                                    disabled={loadingSideQuest}
                                >
                                    {loadingSideQuest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Bonus Practice
                                </Button>
                            </>
                        ) : loadingSideQuest ? (
                            <div className="flex items-center gap-2 text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Finding your practice...</span>
                            </div>
                        ) : sideQuest ? (
                            <>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {sideQuest.practice.title}
                                </h3>
                                <p className="text-sm text-slate-500 mb-1">
                                    {sideQuest.practice.duration_min} min • {sideQuest.domain}
                                </p>
                                <p className="text-sm text-slate-600 mb-4">
                                    {sideQuest.why?.[0] || 'Recommended for your growth.'}
                                </p>
                                <Button
                                    onClick={handleCompleteSideQuest}
                                    disabled={completingSideQuest}
                                    className="w-full"
                                >
                                    {completingSideQuest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Mark as Done
                                </Button>
                            </>
                        ) : (
                            <Button onClick={fetchSideQuestRecommendation} variant="outline" className="w-full">
                                Get Practice Recommendation
                            </Button>
                        )}
                    </div>

                    {/* 3. Upgrade (Skill Tree) */}
                    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                                Upgrade (Skill Tree)
                            </span>
                        </div>

                        {nextUpgrade ? (
                            <>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {nextUpgrade.title}
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    {nextUpgrade.description || 'Unlock this upgrade to level up.'}
                                </p>
                                <Button
                                    onClick={handleCompleteUpgrade}
                                    disabled={completingUpgrade}
                                    variant="outline"
                                    className="w-full"
                                >
                                    {completingUpgrade ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Complete Upgrade
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-slate-500 mb-3">All upgrades complete!</p>
                                <Button variant="outline" size="sm" onClick={() => navigate('/skills')}>
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    View Skill Trees
                                </Button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Logbook Preview */}
                {todayQuestRuns.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Today's Log
                        </h3>
                        <div className="space-y-2">
                            {todayQuestRuns.map(run => (
                                <div key={run.id} className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-3">
                                    <div>
                                        <p className="font-medium text-slate-900">{run.practice_title}</p>
                                        <p className="text-xs text-slate-500">{run.domain} • {run.duration_min} min</p>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-600">+{run.xp_awarded} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
