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
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    Sparkles, Target, Zap, CheckCircle2, Flame, Trophy, ChevronRight,
    BookOpen, Gift, Lock, Upload, Link as LinkIcon, X
} from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
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
    const { t, i18n } = useTranslation();

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
            toast({ title: t('today.toastErrorTitle'), description: t('today.toastLoadFailed'), variant: "destructive" });
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
                    target_language: i18n.resolvedLanguage,
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
                    title: t('today.toastXpEarned', { xp: result.xpAwarded }),
                    description: t('today.toastStreak', { days: result.newStreak }),
                });
                await loadTodayData();
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            toast({ title: t('today.toastErrorTitle'), description: err.message, variant: "destructive" });
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
            toast({ title: t('today.toastUpgradeCompleteTitle'), description: t('today.toastUpgradeXp', { xp: nextUpgrade.xp_reward || 25 }) });
            await loadTodayData();
        } catch (err: any) {
            toast({ title: t('today.toastErrorTitle'), description: err.message, variant: "destructive" });
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
                title: t('today.toastArtifactCapturedTitle'),
                description: t('today.toastArtifactCapturedDesc')
            });

            setShowArtifactModal(false);
            setArtifactType('post');
            setArtifactUrl('');
            setArtifactNote('');
            await loadTodayData();
        } catch (err: any) {
            toast({ title: t('today.toastErrorTitle'), description: err.message, variant: "destructive" });
        } finally {
            setSavingArtifact(false);
        }
    };

    // Loading state
    // Day 91 (Sasha 2026-06-09): tokenized for Aurum — page washes read
    // --skin-page-bg / --skin-page-wash (dark-skin-only tokens; lapis
    // falls through to the exact original literals).
    if (isLoading) {
        return (
            <div className="min-h-dvh flex items-center justify-center bg-[var(--skin-page-bg,#f8f9fc)]">
                <PremiumLoader size="lg" />
            </div>
        );
    }

    // UX Playbook: First visit entry screen
    if (showFirstVisitIntro) {
        return (
            <div
                className="min-h-dvh flex flex-col items-center justify-center px-6"
                style={{
                    background:
                        "var(--skin-page-wash, linear-gradient(to bottom right, #eef2ff 0%, #ffffff 50%, #faf5ff 100%))",
                }}
            >
                <div className="text-center max-w-md space-y-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-sm uppercase tracking-wide text-indigo-600 mb-3">
                            {t('today.introEyebrow')}
                        </p>
                        <h1 className="text-4xl font-bold text-[#2c3150] mb-4">
                            {t('today.introTitle')}
                        </h1>
                        <p className="text-lg text-[rgba(44,49,80,0.7)]">
                            {t('today.introSubtitle')}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFirstVisitIntro(false)}
                        className="px-8 py-4 text-base font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        {t('today.introCta')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="today-page min-h-dvh bg-[var(--skin-page-bg,#f8f9fc)]">
            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[#2c3150] mb-2">{t('today.pageTitle')}</h1>
                    <div className="flex items-center gap-4 text-sm text-[rgba(44,49,80,0.7)]">
                        <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {t('today.dayStreak', { count: profile?.current_streak_days || 0 })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-amber-500" />
                            {t('today.level', { level: profile?.level || 1 })}
                        </span>
                        <span>{t('today.xp', { xp: profile?.xp_total || 0 })}</span>
                    </div>
                </header>

                {/* Done for Today State */}
                {allDoneForToday && (
                    <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center mb-6">
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-[#2c3150] mb-2">{t('today.doneTitle')}</h2>
                        <p className="text-[rgba(44,49,80,0.7)] mb-6">{t('today.doneSubtitle')}</p>
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
                            {t('today.bonusSideQuest')}
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
                                    {t('today.mainQuestLabel')}
                                </span>
                            </div>
                            <span className="text-xs text-[#2c3150]/60 bg-[var(--skin-input-fill,#f0f4ff)] px-2 py-1 rounded-full">
                                {t('today.stageOf', { current: getStageNumber(mainQuestStage), total: getTotalStages() })}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#2c3150] mb-1">{mainQuestCopy.title}</h3>
                        <p className="text-sm text-[rgba(44,49,80,0.7)] mb-4">{mainQuestCopy.objective}</p>

                        {mainQuestComplete || artifactSubmitted ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('today.complete')}</span>
                            </div>
                        ) : mainQuestStage === 'mq_5_real_world_output' ? (
                            <Button
                                onClick={handleOpenArtifactModal}
                                disabled={completingMainQuest}
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {t('today.captureOutput')}
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
                        : 'border-[#a4a3d0]/20 bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm'
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
                                {t('today.sideQuestLabel')}
                            </span>
                        </div>

                        {sideQuestDoneToday ? (
                            <>
                                <div className="flex items-center gap-2 text-emerald-600 mb-3">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {t('today.completedLabel', { title: todayQuestRuns[0]?.title })}
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
                                    {loadingSideQuest ? <span className="premium-spinner w-4 h-4 mr-2" /> : null}
                                    {t('today.bonusPractice')}
                                </Button>
                            </>
                        ) : loadingSideQuest ? (
                            <div className="flex items-center gap-2 text-[#2c3150]/60">
                                <span className="premium-spinner w-4 h-4" />
                                <span className="text-sm">{t('today.findingPractice')}</span>
                            </div>
                        ) : sideQuest ? (
                            <>
                                <h3 className="text-lg font-bold text-[#2c3150] mb-1">
                                    {sideQuest.practice.title}
                                </h3>
                                <p className="text-sm text-[#2c3150]/60 mb-1">
                                    {t('today.practiceMeta', { minutes: sideQuest.practice.duration_min, domain: sideQuest.domain })}
                                </p>
                                <p className="text-sm text-[rgba(44,49,80,0.7)] mb-4">
                                    {sideQuest.why?.[0] || t('today.recommendedFallback')}
                                </p>
                                <Button
                                    onClick={handleCompleteSideQuest}
                                    disabled={completingSideQuest}
                                    className="w-full"
                                >
                                    {completingSideQuest ? <span className="premium-spinner w-4 h-4 mr-2" /> : null}
                                    {t('today.markAsDone')}
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
                                {t('today.getRecommendation')}
                            </Button>
                        )}
                    </div>

                    {/* 3. Upgrade (Growth Path) */}
                    <div className={`rounded-2xl border-2 p-5 ${!upgradeUnlockStatus.unlocked
                        ? 'border-[#a4a3d0]/30 bg-[var(--skin-card-fill,rgba(240,244,255,0.5))]'
                        : 'border-[#a4a3d0]/20 bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm'
                        }`}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!upgradeUnlockStatus.unlocked ? 'bg-[#a4a3d0]' : 'bg-purple-600'
                                }`}>
                                {!upgradeUnlockStatus.unlocked
                                    ? <Lock className="w-4 h-4 text-white" />
                                    : <Zap className="w-4 h-4 text-white" />
                                }
                            </div>
                            <span className={`text-xs font-semibold uppercase  ${!upgradeUnlockStatus.unlocked ? 'text-[#2c3150]/60' : 'text-purple-600'
                                }`}>
                                {t('today.upgradeLabel')}
                            </span>
                            {!upgradeUnlockStatus.unlocked && (
                                <span className="text-xs bg-[#a4a3d0]/20 text-[rgba(44,49,80,0.7)] px-2 py-0.5 rounded-full">
                                    {t('today.lockedBadge')}
                                </span>
                            )}
                        </div>

                        {nextUpgrade ? (
                            <>
                                <h3 className={`text-lg font-bold mb-1 ${!upgradeUnlockStatus.unlocked ? 'text-[#2c3150]/60' : 'text-[#2c3150]'
                                    }`}>
                                    {nextUpgrade.title}
                                </h3>
                                <p className={`text-sm mb-4 ${!upgradeUnlockStatus.unlocked ? 'text-[#2c3150]/60' : 'text-[rgba(44,49,80,0.7)]'
                                    }`}>
                                    {nextUpgrade.description || t('today.upgradeDescFallback')}
                                </p>

                                {!upgradeUnlockStatus.unlocked ? (
                                    <div className="text-sm text-[#2c3150]/60">
                                        <Lock className="w-4 h-4 inline mr-1" />
                                        {t('today.lockedRequires', { prereqs: upgradeUnlockStatus.missingPrereqs
                                            .map(code => prereqTitles[code] || code)
                                            .join(', ') })}
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
                                        {completingUpgrade ? <span className="premium-spinner w-4 h-4 mr-2" /> : null}
                                        {t('today.completeUpgrade')}
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-[#2c3150]/60 mb-3">{t('today.allUpgradesComplete')}</p>
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
                                    {t('today.viewGrowthPaths')}
                                </Button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Logbook Preview */}
                {todayQuestRuns.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-[#2c3150]/60 uppercase  mb-3">
                            {t('today.todaysLog')}
                        </h3>
                        <div className="space-y-2">
                            {todayQuestRuns.map(run => (
                                <div key={run.id} className="flex items-center justify-between bg-[var(--skin-card-fill,rgba(255,255,255,0.85))] backdrop-blur-sm rounded-lg border border-[#a4a3d0]/20 px-4 py-3 shadow-[0_4px_16px_rgba(44,49,80,0.06)]">
                                    <div>
                                        <p className="font-medium text-[#2c3150]">{run.title}</p>
                                        <p className="text-xs text-[#2c3150]/60">{t('today.runMeta', { path: run.path, minutes: run.duration_minutes })}</p>
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
                    {/* Day 91 (Sasha 2026-06-09): tokenized for Aurum. Panel reads
                        --skin-page-wash (dark-skin-only, opaque dark surface) instead
                        of --skin-card-bg because the lapis fallback must stay solid
                        #fff over the black/50 backdrop — card-bg's lapis value is
                        translucent and would gray the modal. */}
                    <div
                        className="rounded-2xl shadow-xl max-w-md w-full p-6"
                        style={{ background: "var(--skin-page-wash, #ffffff)" }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#2c3150]">{t('today.captureOutput')}</h2>
                            <button onClick={() => setShowArtifactModal(false)} className="text-[#2c3150]/60 hover:text-[#2c3150]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-[rgba(44,49,80,0.7)] mb-6">
                            {t('today.artifactModalDesc')}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2c3150] mb-1">
                                    {t('today.typeLabel')}
                                </label>
                                <select
                                    value={artifactType}
                                    onChange={(e) => setArtifactType(e.target.value as any)}
                                    className="w-full rounded-md border border-[#a4a3d0]/30 bg-[var(--skin-input-fill,#fff)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="post">{t('today.typePost')}</option>
                                    <option value="pitch">{t('today.typePitch')}</option>
                                    <option value="demo">{t('today.typeDemo')}</option>
                                    <option value="doc">{t('today.typeDoc')}</option>
                                    <option value="video">{t('today.typeVideo')}</option>
                                    <option value="other">{t('today.typeOther')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#2c3150] mb-1">
                                    {t('today.linkLabel')}
                                </label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2c3150]/60" />
                                    <Input
                                        className="pl-10"
                                        placeholder="https://..."
                                        value={artifactUrl}
                                        onChange={(e) => setArtifactUrl(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#2c3150] mb-1">
                                    {t('today.notesLabel')}
                                </label>
                                <Textarea
                                    placeholder={t('today.notesPlaceholder')}
                                    value={artifactNote}
                                    onChange={(e) => setArtifactNote(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setShowArtifactModal(false)}>
                                {t('today.cancel')}
                            </Button>
                            <Button
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleSaveArtifact}
                                disabled={savingArtifact}
                            >
                                {savingArtifact ? <span className="premium-spinner w-4 h-4 mr-2" /> : null}
                                {t('today.markArtifactDone')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
