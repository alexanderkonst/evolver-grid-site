/**
 * TODAY Screen — Single source of daily action
 * 
 * Shows up to 3 actions:
 * 1. Main Quest (Storyline) — current step
 * 2. Side Quest (Practice) — AI-recommended practice
 * 3. Upgrade (Growth Path) — next available node
 * 
 * If all done: Done for Today state with optional bonus practice
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Sparkles, Target, Zap, CheckCircle2, Flame, Trophy, ChevronRight, Loader2,
    BookOpen, Gift, Lock, Upload, Link as LinkIcon, X
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
import { advanceMainQuestIfEligible, markMainQuestProgress } from "@/lib/mainQuestApi";
import { completeSideQuest, getRecentQuestRuns, type QuestRun } from "@/lib/questRunsApi";
import {
    getPlayerUpgrades,
    isUpgradeUnlocked,
    getRecommendedUpgradeByDomain,
    getUpgradeTitlesByCode,
    type Upgrade,
    type ProfileXp,
    type UnlockEffects,
} from "@/lib/upgradeSystem";
import { completeAction } from "@/lib/completeAction";
import { logActionEvent } from "@/lib/actionEvents";
import { LIBRARY_ITEMS } from "@/modules/library/libraryContent";

// Types
interface TodayProfile {
    id: string;
    xp_total: number;
    xp_spirit: number;
    xp_mind: number;
    xp_uniqueness: number;
    xp_emotions: number;
    xp_body: number;
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

    const logSelection = (payload: Omit<Parameters<typeof logActionEvent>[0], "profileId">) => {
        if (!profile?.id) return;
        logActionEvent({ profileId: profile.id, ...payload });
    };

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<TodayProfile | null>(null);
    const [sideQuest, setSideQuest] = useState<SideQuestRecommendation | null>(null);
    const [nextUpgrade, setNextUpgrade] = useState<Upgrade | null>(null);
    const [upgradeUnlockStatus, setUpgradeUnlockStatus] = useState<{ unlocked: boolean; missingPrereqs: string[] }>({ unlocked: true, missingPrereqs: [] });
    const [prereqTitles, setPrereqTitles] = useState<Record<string, string>>({});
    const [unlockedPracticeTags, setUnlockedPracticeTags] = useState<string[]>([]);
    const [completedUpgradeCodes, setCompletedUpgradeCodes] = useState<Set<string>>(new Set());
    const [todayQuestRuns, setTodayQuestRuns] = useState<QuestRun[]>([]);

    // World Artifact Modal State
    const [showArtifactModal, setShowArtifactModal] = useState(false);
    const [artifactType, setArtifactType] = useState<'post' | 'pitch' | 'demo' | 'doc' | 'video' | 'other'>('post');
    const [artifactUrl, setArtifactUrl] = useState("");
    const [artifactNote, setArtifactNote] = useState("");
    const [savingArtifact, setSavingArtifact] = useState(false);

    // First visit detection for entry screen
    const [showFirstVisitIntro, setShowFirstVisitIntro] = useState(false);

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
    const allDoneForToday = mainQuestComplete && sideQuestDoneToday;

    // Check if artifact already submitted
    const artifactSubmitted = profile?.main_quest_progress?.real_world_output_done === true;

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

            // First visit detection: show intro if no practices done yet
            if ((profileData.practice_count || 0) === 0) {
                setShowFirstVisitIntro(true);
            }

            // Fetch completed upgrades
            const playerUpgrades = await getPlayerUpgrades(profileData.id);
            const codes = new Set<string>(playerUpgrades.map((pu: any) => pu.code));
            setCompletedUpgradeCodes(codes);

            // Get next recommended upgrade based on weakest domain (domain-balanced)
            const profileXp: ProfileXp = {
                xp_spirit: profileData.xp_spirit || 0,
                xp_mind: profileData.xp_mind || 0,
                xp_uniqueness: profileData.xp_uniqueness || 0,
                xp_emotions: profileData.xp_emotions || 0,
                xp_body: profileData.xp_body || 0,
            };

            const { upgrade: recommended } = await getRecommendedUpgradeByDomain(profileXp, codes);
            setNextUpgrade(recommended);

            // Check unlock status for the recommended upgrade and fetch prereq titles
            if (recommended) {
                const status = isUpgradeUnlocked(recommended, codes);
                setUpgradeUnlockStatus(status);

                // Fetch prereq titles for display
                if (status.missingPrereqs.length > 0) {
                    const titles = await getUpgradeTitlesByCode(status.missingPrereqs);
                    setPrereqTitles(titles);
                }
            }

            // Fetch today's quest runs
            const runs = await getRecentQuestRuns(profileData.id, 7);
            const today = new Date().toDateString();
            const todayRuns = runs.filter(r => new Date(r.completed_at).toDateString() === today);
            setTodayQuestRuns(todayRuns);

            // Fetch side quest recommendation
            await fetchSideQuestRecommendation();

        } catch (err) {
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [navigate, toast]);

    const fetchSideQuestRecommendation = async (practiceTags?: string[]) => {
        try {
            setLoadingSideQuest(true);

            const practices = LIBRARY_ITEMS.slice(0, 20).map(item => ({
                id: item.id,
                title: item.title,
                type: item.categoryId,
                duration_minutes: item.durationMinutes || 10,
                primary_path: item.primaryPath,
                tags: [item.categoryId],
            }));

            const { data, error } = await supabase.functions.invoke('suggest-next-quest', {
                body: {
                    intention: "personal growth and transformation",
                    practices,
                    context: {
                        // Pass unlocked practice tags to influence recommendations
                        unlocked_practice_tags: practiceTags || unlockedPracticeTags,
                    },
                },
            });

            if (error) throw error;
            setSideQuest(data);
        } catch (err) {
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
            logSelection({
                actionId: `quest:${sideQuest.practice.id}`,
                source: "src/pages/Today.tsx",
                loop: "transformation",
                growthPath: sideQuest.domain,
                selectedAt: new Date().toISOString(),
                metadata: { intent: "complete_side_quest" },
            });

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
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setCompletingSideQuest(false);
        }
    };

    const handleCompleteUpgrade = async () => {
        if (!profile || !nextUpgrade) return;

        try {
            setCompletingUpgrade(true);
            logSelection({
                actionId: `upgrade:${nextUpgrade.code}`,
                source: "src/pages/Today.tsx",
                loop: "transformation",
                growthPath: nextUpgrade.path_slug,
                selectedAt: new Date().toISOString(),
                metadata: { intent: "complete_upgrade" },
            });
            await completeAction(
                {
                    id: `upgrade:${nextUpgrade.code}`,
                    type: "upgrade",
                    loop: "transformation",
                    title: nextUpgrade.title,
                    source: "lib/upgradeSystem.ts",
                    completionPayload: { sourceId: nextUpgrade.code },
                },
                { profileId: profile.id }
            );
            toast({ title: "Upgrade Complete!", description: `+${nextUpgrade.xp_reward || 25} XP` });
            await loadTodayData();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setCompletingUpgrade(false);
        }
    };

    const handleOpenArtifactModal = () => {
        setShowArtifactModal(true);
        logSelection({
            actionId: "main-quest:artifact",
            source: "src/pages/Today.tsx",
            loop: "transformation",
            selectedAt: new Date().toISOString(),
            metadata: { intent: "open_artifact_modal" },
        });
    };

    const handleSaveArtifact = async () => {
        if (!profile) return;

        try {
            setSavingArtifact(true);
            logSelection({
                actionId: "main-quest:artifact",
                source: "src/pages/Today.tsx",
                loop: "transformation",
                selectedAt: new Date().toISOString(),
                metadata: { intent: "submit_artifact", artifactType },
            });

            // Save artifact to main_quest_progress with required structure
            await markMainQuestProgress(profile.id, {
                real_world_output_done: true,
                world_artifact: {
                    type: artifactType,
                    url: artifactUrl || null,
                    note: artifactNote || null,
                    created_at: new Date().toISOString(),
                },
            });

            // Advance main quest after capturing artifact
            if (playerStats) {
                await advanceMainQuestIfEligible(profile.id, profile, playerStats);
            }

            toast({
                title: "🎉 World Artifact Captured!",
                description: "Your real-world creation has been documented."
            });

            setShowArtifactModal(false);
            setArtifactType('post');
            setArtifactUrl('');
            setArtifactNote('');
            await loadTodayData();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setSavingArtifact(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // UX Playbook: First visit entry screen
    if (showFirstVisitIntro) {
        return (
            <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-6">
                <div className="text-center max-w-md space-y-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-sm uppercase tracking-wide text-indigo-600 mb-3">
                            Transformation Space
                        </p>
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">
                            Grow every day
                        </h1>
                        <p className="text-lg text-slate-600">
                            One practice. Five paths. Consistent progress.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFirstVisitIntro(false)}
                        className="px-8 py-4 text-lg font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        Show Me Today's Practice
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-slate-50">
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
                        <Button
                            variant="outline"
                            onClick={() => {
                                logSelection({
                                    actionId: "side-quest-bonus",
                                    source: "src/pages/Today.tsx",
                                    loop: "transformation",
                                    selectedAt: new Date().toISOString(),
                                    metadata: { intent: "bonus_side_quest" },
                                });
                                fetchSideQuestRecommendation();
                            }}
                        >
                            <Gift className="w-4 h-4 mr-2" />
                            Bonus Side Quest
                        </Button>
                    </div>
                )}

                <div className="space-y-4">

                    {/* 1. Main Quest (Storyline) */}
                    <div className={`rounded-2xl border-2 p-5 ${mainQuestComplete || artifactSubmitted
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-indigo-200 bg-indigo-50'
                        }`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mainQuestComplete || artifactSubmitted ? 'bg-emerald-500' : 'bg-indigo-600'
                                    }`}>
                                    {mainQuestComplete || artifactSubmitted
                                        ? <CheckCircle2 className="w-4 h-4 text-white" />
                                        : <Sparkles className="w-4 h-4 text-white" />
                                    }
                                </div>
                                <span className="text-xs font-semibold uppercase  text-indigo-600">
                                    Main Quest
                                </span>
                            </div>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                Stage {getStageNumber(mainQuestStage)} of {getTotalStages()}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">{mainQuestCopy.title}</h3>
                        <p className="text-sm text-slate-600 mb-4">{mainQuestCopy.objective}</p>

                        {mainQuestComplete || artifactSubmitted ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">Complete</span>
                            </div>
                        ) : mainQuestStage === 'mq_5_real_world_output' ? (
                            <Button
                                onClick={handleOpenArtifactModal}
                                disabled={completingMainQuest}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Capture Your Output
                            </Button>
                        ) : (
                            <Button
                                onClick={() => {
                                    logSelection({
                                        actionId: `main-quest:${mainQuestStage}`,
                                        source: "src/pages/Today.tsx",
                                        loop: "transformation",
                                        selectedAt: new Date().toISOString(),
                                        metadata: { intent: "main_quest_cta", route: mainQuestCopy.ctaRoute },
                                    });
                                    if (mainQuestCopy.ctaRoute) {
                                        navigate(mainQuestCopy.ctaRoute);
                                    }
                                }}
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
                            <span className="text-xs font-semibold uppercase  text-emerald-600">
                                Side Quest (Practice)
                            </span>
                        </div>

                        {sideQuestDoneToday ? (
                            <>
                                <div className="flex items-center gap-2 text-emerald-600 mb-3">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        Completed: {todayQuestRuns[0]?.title}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        logSelection({
                                            actionId: "side-quest-bonus",
                                            source: "src/pages/Today.tsx",
                                            loop: "transformation",
                                            selectedAt: new Date().toISOString(),
                                            metadata: { intent: "bonus_side_quest" },
                                        });
                                        fetchSideQuestRecommendation();
                                    }}
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
                            <Button
                                onClick={() => {
                                    logSelection({
                                        actionId: "side-quest-recommendation",
                                        source: "src/pages/Today.tsx",
                                        loop: "transformation",
                                        selectedAt: new Date().toISOString(),
                                        metadata: { intent: "request_recommendation" },
                                    });
                                    fetchSideQuestRecommendation();
                                }}
                                variant="outline"
                                className="w-full"
                            >
                                Get Practice Recommendation
                            </Button>
                        )}
                    </div>

                    {/* 3. Upgrade (Growth Path) */}
                    <div className={`rounded-2xl border-2 p-5 ${!upgradeUnlockStatus.unlocked
                        ? 'border-slate-300 bg-slate-50'
                        : 'border-slate-200 bg-white'
                        }`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!upgradeUnlockStatus.unlocked ? 'bg-slate-400' : 'bg-purple-600'
                                }`}>
                                {!upgradeUnlockStatus.unlocked
                                    ? <Lock className="w-4 h-4 text-white" />
                                    : <Zap className="w-4 h-4 text-white" />
                                }
                            </div>
                            <span className={`text-xs font-semibold uppercase  ${!upgradeUnlockStatus.unlocked ? 'text-slate-500' : 'text-purple-600'
                                }`}>
                                Upgrade (Growth Path)
                            </span>
                            {!upgradeUnlockStatus.unlocked && (
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                    Locked
                                </span>
                            )}
                        </div>

                        {nextUpgrade ? (
                            <>
                                <h3 className={`text-lg font-bold mb-1 ${!upgradeUnlockStatus.unlocked ? 'text-slate-500' : 'text-slate-900'
                                    }`}>
                                    {nextUpgrade.title}
                                </h3>
                                <p className={`text-sm mb-4 ${!upgradeUnlockStatus.unlocked ? 'text-slate-500' : 'text-slate-600'
                                    }`}>
                                    {nextUpgrade.description || 'Unlock this upgrade to level up.'}
                                </p>

                                {!upgradeUnlockStatus.unlocked ? (
                                    <div className="text-sm text-slate-500">
                                        <Lock className="w-4 h-4 inline mr-1" />
                                        Locked — requires: {upgradeUnlockStatus.missingPrereqs
                                            .map(code => prereqTitles[code] || code)
                                            .join(', ')}
                                        {nextUpgrade.unlock_hint && (
                                            <p className="mt-2 text-xs italic">{nextUpgrade.unlock_hint}</p>
                                        )}
                                    </div>
                                ) : (
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
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-slate-500 mb-3">All upgrades complete!</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        logSelection({
                                            actionId: "growth-paths:view",
                                            source: "src/pages/Today.tsx",
                                            loop: "transformation",
                                            selectedAt: new Date().toISOString(),
                                            metadata: { intent: "view_growth_paths" },
                                        });
                                        navigate('/growth-paths');
                                    }}
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    View Growth Paths
                                </Button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Logbook Preview */}
                {todayQuestRuns.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase  mb-3">
                            Today's Log
                        </h3>
                        <div className="space-y-2">
                            {todayQuestRuns.map(run => (
                                <div key={run.id} className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-3">
                                    <div>
                                        <p className="font-medium text-slate-900">{run.title}</p>
                                        <p className="text-xs text-slate-500">{run.path} • {run.duration_minutes} min</p>
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-600">+{run.xp_awarded} XP</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* World Artifact Modal */}
            {showArtifactModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Capture Your Output</h2>
                            <button onClick={() => setShowArtifactModal(false)} className="text-slate-500 hover:text-slate-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 mb-6">
                            Document your real-world creation — a post, pitch, demo, or any tangible output.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Type *
                                </label>
                                <select
                                    value={artifactType}
                                    onChange={(e) => setArtifactType(e.target.value as any)}
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="post">Post</option>
                                    <option value="pitch">Pitch</option>
                                    <option value="demo">Demo</option>
                                    <option value="doc">Doc</option>
                                    <option value="video">Video</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Link (optional)
                                </label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        className="pl-10"
                                        placeholder="https://..."
                                        value={artifactUrl}
                                        onChange={(e) => setArtifactUrl(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Notes (optional)
                                </label>
                                <Textarea
                                    placeholder="What did you create? How does it feel?"
                                    value={artifactNote}
                                    onChange={(e) => setArtifactNote(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowArtifactModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleSaveArtifact}
                                disabled={savingArtifact}
                            >
                                {savingArtifact ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Mark Artifact Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
