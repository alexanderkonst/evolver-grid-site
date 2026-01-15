import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import DailyLoopLayout from "@/components/game/DailyLoopLayout";
import PlayerStatsBadge from "@/components/game/PlayerStatsBadge";
import PowerfulWelcome from "@/components/game/PowerfulWelcome";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";
import { LIBRARY_ITEMS, type LibraryItem } from "@/modules/library/libraryContent";
import { useToast } from "@/hooks/use-toast";
import { type Upgrade, getUpgradesByBranch, getPlayerUpgrades } from "@/lib/upgradeSystem";
import { getSuggestedPractices } from "@/lib/practiceSystem";
import {
  buildGrowthPathActionsForProgress,
  buildRecommendationFromLegacy,
  durationToBucket,
  formatDurationBucket,
  normalizeGrowthPath,
} from "@/lib/actionEngine";
import { growthPathSteps, GROWTH_PATH_VERSION, type GrowthPathProgress } from "@/modules/growth-paths";
import { logActionEvent } from "@/lib/actionEvents";
import { ensureGrowthPathProgress } from "@/lib/growthPathProgress";
import { completeAction } from "@/lib/completeAction";
import { type UnifiedAction } from "@/types/actions";
import { buildPlayerStats } from "@/lib/mainQuest";
import { advanceMainQuestIfEligible } from "@/lib/mainQuestApi";
import { type DomainId } from "@/modules/quality-of-life-map/qolConfig";

// Types
interface GameProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  last_zog_snapshot_id: string | null;
  last_qol_snapshot_id: string | null;
  qol_priorities?: unknown | null;
  total_quests_completed: number;
  last_quest_title: string | null;
  xp_total: number;
  level: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_quest_completed_at: string | null;
  xp_body: number;
  xp_mind: number;
  xp_emotions: number;
  xp_spirit: number;
  xp_uniqueness: number;
  practice_count: number;
  zone_of_genius_completed: boolean | null;
  main_quest_stage: string | null;
  main_quest_status: string | null;
  main_quest_progress: any;
  main_quest_updated_at: string | null;
  onboarding_completed?: boolean | null;
  onboarding_step?: number | null;
  onboarding_stage?: string | null;
}

interface ZogSnapshot {
  id: string;
  archetype_title: string;
  core_pattern: string;
  top_three_talents: string[];
}

interface QolSnapshot {
  id: string;
  created_at: string;
  wealth_stage: number;
  health_stage: number;
  happiness_stage: number;
  love_relationships_stage: number;
  impact_stage: number;
  growth_stage: number;
  social_ties_stage: number;
  home_stage: number;
}

interface QuestSuggestion {
  quest_title: string;
  practice_type: string;
  approx_duration_minutes: number;
  why_it_is_a_good_next_move: string;
}

const QUEST_DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 150];

const QUEST_MODES = [
  { id: "activating", label: "Activating / Energizing" },
  { id: "relaxing", label: "Relaxing / Calming" },
  { id: "balanced", label: "Balanced" },
];

const GameHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Core state
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [zogSnapshot, setZogSnapshot] = useState<ZogSnapshot | null>(null);
  const [currentQolSnapshot, setCurrentQolSnapshot] = useState<QolSnapshot | null>(null);
  const [user, setUser] = useState<any>(null);
  const [celebration, setCelebration] = useState<{ title: string; detail?: string } | null>(null);
  const previousProfileRef = useRef<{ xp_total?: number; level?: number } | null>(null);
  const loadStartRef = useRef<number | null>(null);
  const lastLoadDurationRef = useRef<number | null>(null);
  const noRecommendationLoggedRef = useRef(false);
  const dailyLoopViewLoggedRef = useRef(false);

  // Upgrades state
  const [masteryUpgrades, setMasteryUpgrades] = useState<Upgrade[]>([]);
  const [completedUpgradeCodes, setCompletedUpgradeCodes] = useState<Set<string>>(new Set());
  const [nextRecommendedUpgrade, setNextRecommendedUpgrade] = useState<Upgrade | null>(null);
  const [growthPathProgress, setGrowthPathProgress] = useState<GrowthPathProgress>({});
  const [actionError, setActionError] = useState<string | null>(null);

  // Quest state
  const [showQuestPicker, setShowQuestPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isLoadingQuest, setIsLoadingQuest] = useState(false);
  const [questSuggestion, setQuestSuggestion] = useState<{
    main: QuestSuggestion;
    alternatives: QuestSuggestion[];
  } | null>(null);
  const [questCompleted, setQuestCompleted] = useState(false);

  // Suggested practices
  const [suggestedPractices, setSuggestedPractices] = useState<LibraryItem[]>([]);

  useEffect(() => {
    loadGameData();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!celebration) return;
    const timeout = setTimeout(() => setCelebration(null), 6000);
    return () => clearTimeout(timeout);
  }, [celebration]);

  const loadGameData = async () => {
    try {
      loadStartRef.current = performance.now();
      setIsLoading(true);
      setActionError(null);
      const id = await getOrCreateGameProfileId();
      setProfileId(id);

      // Parallelize the main profile fetch with upgrades fetch
      const [profileResult, masteryData] = await Promise.all([
        supabase
          .from('game_profiles')
          .select('*')
          .eq('id', id)
          .maybeSingle(),
        getUpgradesByBranch('uniqueness', 'mastery_of_genius'),
      ]);

      if (profileResult.error) throw profileResult.error;
      const profileData = profileResult.data;
      if (!profileData) return;

      setProfile(profileData);
      const previousProfile = previousProfileRef.current;
      if (previousProfile) {
        const xpDelta = profileData.xp_total - (previousProfile.xp_total ?? 0);
        const levelDelta = profileData.level - (previousProfile.level ?? 0);
        if (levelDelta > 0) {
          setCelebration({
            title: "Level up!",
            detail: `You reached level ${profileData.level}.`,
          });
        } else if (xpDelta > 0) {
          setCelebration({
            title: `+${xpDelta} XP`,
            detail: "Momentum unlocked.",
          });
        }
      }
      previousProfileRef.current = {
        xp_total: profileData.xp_total,
        level: profileData.level,
      };

      // Use database upgrades or fallback to hardcoded onboarding upgrades
      const fallbackUpgrades: Upgrade[] = [
        { id: 'fb-1', code: 'personality_tests_completed', title: 'Complete Personality Tests', short_label: 'Personality', description: 'Take MBTI, Enneagram, or similar tests', path_slug: 'uniqueness', branch: 'mastery_of_genius', is_paid: false, xp_reward: 50, sort_order: 1 },
        { id: 'fb-2', code: 'zog_assessment_completed', title: 'Zone of Genius Assessment', short_label: 'ZoG', description: 'Discover your unique genius', path_slug: 'uniqueness', branch: 'mastery_of_genius', is_paid: false, xp_reward: 100, sort_order: 2 },
        { id: 'fb-3', code: 'genius_offer_draft', title: 'Draft Your Genius Offer', short_label: 'Offer', description: 'Create your unique offer', path_slug: 'uniqueness', branch: 'mastery_of_genius', is_paid: false, xp_reward: 150, sort_order: 3 },
        { id: 'fb-4', code: 'first_practice_done', title: 'Complete First Practice', short_label: 'First Practice', description: 'Complete any practice from the library', path_slug: 'body', branch: 'mastery_of_genius', is_paid: false, xp_reward: 25, sort_order: 4 },
      ];
      setMasteryUpgrades(masteryData.length > 0 ? masteryData : fallbackUpgrades);

      // Now parallelize snapshot fetches, player upgrades, and vector progress
      const zogPromise = profileData.last_zog_snapshot_id
        ? supabase.from('zog_snapshots').select('*').eq('id', profileData.last_zog_snapshot_id).maybeSingle()
        : Promise.resolve({ data: null, error: null });

      const qolPromise = profileData.last_qol_snapshot_id
        ? supabase.from('qol_snapshots').select('*').eq('id', profileData.last_qol_snapshot_id).maybeSingle()
        : Promise.resolve({ data: null, error: null });

      const [zogResult, qolResult, playerUpgradesData, vectorProgressResult] = await Promise.all([
        zogPromise,
        qolPromise,
        getPlayerUpgrades(id),
        supabase
          .from('vector_progress')
          .select('vector, step_index')
          .eq('profile_id', id),
      ]);

      // Process ZoG snapshot
      if (zogResult?.data) {
        setZogSnapshot({
          id: zogResult.data.id,
          archetype_title: zogResult.data.archetype_title,
          core_pattern: zogResult.data.core_pattern,
          top_three_talents: Array.isArray(zogResult.data.top_three_talents)
            ? zogResult.data.top_three_talents as string[]
            : [],
        });
      }

      // Process QoL snapshot
      if (qolResult?.data) {
        setCurrentQolSnapshot(qolResult.data);
        const suggestions = getSuggestedPractices(LIBRARY_ITEMS, qolResult.data);
        setSuggestedPractices(suggestions);
      }

      // Process player upgrades
      const completedCodes = new Set<string>((playerUpgradesData || []).map((pu: any) => pu.code));
      setCompletedUpgradeCodes(completedCodes);

      // Find next uncompleted upgrade
      const nextUpgrade = masteryData.find(u => !completedCodes.has(u.code));
      setNextRecommendedUpgrade(nextUpgrade || null);

      if (!vectorProgressResult.error && vectorProgressResult.data) {
        const progressMap = vectorProgressResult.data.reduce<GrowthPathProgress>((acc, row) => {
          acc[row.vector as keyof GrowthPathProgress] = row.step_index ?? 0;
          return acc;
        }, {});
        setGrowthPathProgress(progressMap);
      } else if (profileData?.id) {
        await ensureGrowthPathProgress({
          profileId: profileData.id,
          growthPaths: Array.from(new Set(growthPathSteps.map(step => step.growthPath))),
          version: GROWTH_PATH_VERSION,
        });
      }

      // Auto-complete ZoG assessment if snapshot exists
      if (profileData.last_zog_snapshot_id && !completedCodes.has('zog_assessment_completed')) {
        const autoUpgradeAction: UnifiedAction = {
          id: "upgrade:zog_assessment_completed",
          type: "upgrade",
          loop: "transformation",
          title: "Zone of Genius Assessment",
          source: "lib/upgradeSystem.ts",
          completionPayload: { sourceId: "zog_assessment_completed" },
        };
        await completeAction(autoUpgradeAction, { profileId: id });
        completedCodes.add('zog_assessment_completed');
        setCompletedUpgradeCodes(new Set<string>(completedCodes));
      }

      // Auto-advance Main Quest stage if player has progressed
      const profileForStats = {
        ...profileData,
        main_quest_progress: profileData.main_quest_progress as import('@/lib/mainQuest').MainQuestProgress | undefined,
      };
      const playerStats = buildPlayerStats(
        profileForStats,
        completedCodes.size,
        !!zogResult?.data
      );

      // Update profile if stage has advanced
      await advanceMainQuestIfEligible(id, profileForStats, playerStats);

    } catch (err) {
      setActionError("We couldn't load your next move yet. Please retry.");
      toast({
        title: "Error loading data",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      if (loadStartRef.current !== null) {
        lastLoadDurationRef.current = Math.round(performance.now() - loadStartRef.current);
      }
    }
  };

  const hasAnyData = profile?.last_zog_snapshot_id || profile?.last_qol_snapshot_id;

  const getLowestDomains = (): string[] => {
    const priorities = Array.isArray(profile?.qol_priorities) ? profile.qol_priorities : [];
    if (priorities.length > 0) {
      const labelMap: Record<DomainId, string> = {
        wealth: "Wealth",
        health: "Health",
        happiness: "Happiness",
        love: "Love",
        impact: "Impact",
        growth: "Growth",
        socialTies: "Social",
        home: "Home",
      };
      return priorities
        .map((id: unknown) => typeof id === 'string' ? labelMap[id as DomainId] : null)
        .filter((v): v is string => !!v);
    }
    if (!currentQolSnapshot) return [];
    const domainStages = [
      { name: "Wealth", value: currentQolSnapshot.wealth_stage },
      { name: "Health", value: currentQolSnapshot.health_stage },
      { name: "Happiness", value: currentQolSnapshot.happiness_stage },
      { name: "Love", value: currentQolSnapshot.love_relationships_stage },
      { name: "Impact", value: currentQolSnapshot.impact_stage },
      { name: "Growth", value: currentQolSnapshot.growth_stage },
      { name: "Social", value: currentQolSnapshot.social_ties_stage },
      { name: "Home", value: currentQolSnapshot.home_stage },
    ];
    const minValue = Math.min(...domainStages.map(d => d.value));
    return domainStages.filter(d => d.value === minValue).slice(0, 2).map(d => d.name);
  };

  const findPracticeByTitle = (title: string): LibraryItem | undefined => {
    return LIBRARY_ITEMS.find(item => item.title.toLowerCase() === title.toLowerCase());
  };

  const handleStartQuest = async () => {
    if (!selectedDuration || !selectedMode) return;

    if (profileId) {
      logActionEvent({
        actionId: "side-quest-picker",
        profileId,
        source: "src/pages/GameHome.tsx",
        loop: "transformation",
        selectedAt: new Date().toISOString(),
        metadata: { intent: "start_side_quest", duration: selectedDuration, mode: selectedMode },
      });
    }

    setIsLoadingQuest(true);
    setQuestSuggestion(null);
    setQuestCompleted(false);

    try {
      // Filter practices by duration and mode
      const practices = LIBRARY_ITEMS
        .filter(item => {
          const dur = item.durationMinutes || 10;
          return dur <= selectedDuration + 5 && dur >= selectedDuration - 5;
        })
        .map(item => ({
          title: item.title,
          type: item.categoryId,
          duration_minutes: item.durationMinutes || 10,
          description: item.teacher ? `by ${item.teacher}` : undefined,
          primary_path: item.primaryPath,
        }));

      const context = {
        mode: selectedMode,
        duration: selectedDuration,
        lowestDomains: getLowestDomains(),
        archetypeTitle: zogSnapshot?.archetype_title,
        corePattern: zogSnapshot?.core_pattern,
      };

      const { data, error } = await supabase.functions.invoke('suggest-next-quest', {
        body: {
          intention: `${selectedMode} practice for ${selectedDuration} minutes`,
          practices,
          context
        }
      });

      if (error) throw error;

      if (data && data.practice) {
        // New format from edge function
        setQuestSuggestion({
          main: {
            quest_title: data.practice.title,
            practice_type: data.domain || 'spirit',
            approx_duration_minutes: data.practice.duration_min || selectedDuration,
            why_it_is_a_good_next_move: data.why?.[0] || 'Great for your practice today.',
          },
          alternatives: (data.alternatives || []).map((alt: any) => ({
            quest_title: alt.title,
            practice_type: alt.domain || 'spirit',
            approx_duration_minutes: alt.duration_min || 10,
            why_it_is_a_good_next_move: '',
          })),
        });
      } else if (data && data.main) {
        // Old format
        setQuestSuggestion(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {

      // Fallback: pick a random practice from the library
      const matchingPractices = LIBRARY_ITEMS.filter(item => {
        const dur = item.durationMinutes || 10;
        return dur <= selectedDuration + 10 && dur >= Math.max(5, selectedDuration - 10);
      });

      if (matchingPractices.length > 0) {
        const randomPractice = matchingPractices[Math.floor(Math.random() * matchingPractices.length)];
        setQuestSuggestion({
          main: {
            quest_title: randomPractice.title,
            practice_type: randomPractice.categoryId || 'practice',
            approx_duration_minutes: randomPractice.durationMinutes || selectedDuration,
            why_it_is_a_good_next_move: `A ${randomPractice.categoryId} practice to support your journey.`,
          },
          alternatives: [],
        });
      } else {
        toast({
          title: "Couldn't find a quest",
          description: "Please try again or visit the Library.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingQuest(false);
    }
  };

  const handleQuestComplete = async () => {
    if (!profileId || !questSuggestion) return;

    try {
      const durationMinutes = questSuggestion.main.approx_duration_minutes || 10;
      const questAction: UnifiedAction = {
        id: `quest:${questSuggestion.main.quest_title.toLowerCase().replace(/\s+/g, "-")}`,
        type: "quest",
        loop: "transformation",
        title: questSuggestion.main.quest_title,
        duration: durationToBucket(durationMinutes),
        growthPath: "genius",
        source: "lib/mainQuest.ts",
        tags: questSuggestion.main.practice_type ? [questSuggestion.main.practice_type] : undefined,
      };

      const result = await completeAction(questAction, { profileId });
      if (!result.success) {
        throw new Error(result.error || "Failed to save side quest.");
      }

      setQuestCompleted(true);
      if (result.xpAwarded) {
        toast({ title: `+${result.xpAwarded} XP earned!`, description: "Side quest completed." });
      } else {
        toast({ title: "Side quest completed.", description: "Nice work." });
      }
      await loadGameData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save side quest.", variant: "destructive" });
    }
  };

  const handleUpgradeAction = async (upgrade: Upgrade) => {
    if (profileId) {
      logActionEvent({
        actionId: `upgrade:${upgrade.code}`,
        profileId,
        source: "src/pages/GameHome.tsx",
        loop: "transformation",
        growthPath: normalizeGrowthPath(upgrade.path_slug),
        selectedAt: new Date().toISOString(),
        metadata: { intent: "start_upgrade" },
      });
    }
    // Different actions based on upgrade code
    switch (upgrade.code) {
      case 'zog_intro_video_watched':
        navigate('/resources/zog-intro-video');
        break;
      case 'personality_tests_completed':
        // Always navigate - user can add more tests even if upgrade is "completed"
        navigate('/resources/personality-tests');
        break;
      case 'zog_assessment_completed':
        navigate('/zone-of-genius/entry');
        break;
      case 'appleseed_received':
      case 'excalibur_received':
        window.open('https://www.calendly.com/konstantinov', '_blank');
        break;
      default:
        break;
    }
  };

  const lowestDomains = getLowestDomains();

  useEffect(() => {
    if (!profileId || dailyLoopViewLoggedRef.current) return;
    dailyLoopViewLoggedRef.current = true;
    logActionEvent({
      actionId: "daily-loop:view",
      profileId,
      source: "src/pages/GameHome.tsx",
      loop: "profile",
      selectedAt: new Date().toISOString(),
      metadata: { intent: "view", dailyLoopV2: true },
    });
  }, [profileId]);

  const recommendationSet = useMemo(() =>
    buildRecommendationFromLegacy({
      questSuggestion,
      upgrade: nextRecommendedUpgrade,
      practices: suggestedPractices,
      extraActions: buildGrowthPathActionsForProgress(growthPathSteps, growthPathProgress),
      lowestDomains,
      totalCompletedActions: profile?.total_quests_completed,
    }),
    [questSuggestion, nextRecommendedUpgrade, suggestedPractices, lowestDomains, profile?.total_quests_completed, growthPathProgress]);

  const recommendedAction = useMemo(() => {
    if (!recommendationSet) return null;

    return {
      id: recommendationSet.primary.id,
      title: recommendationSet.primary.title,
      description: recommendationSet.primary.description,
      tag: recommendationSet.primary.type,
      durationLabel: formatDurationBucket(recommendationSet.primary.duration),
      rationale: recommendationSet.rationale,
      loop: recommendationSet.primary.loop,
      growthPath: recommendationSet.primary.growthPath,
      alternates: recommendationSet.alternates?.map(action => action.title).filter(Boolean),
    };
  }, [recommendationSet]);

  useEffect(() => {
    if (!profileId || !recommendationSet) return;
    logActionEvent({
      actionId: recommendationSet.primary.id,
      profileId,
      source: recommendationSet.primary.source,
      loop: recommendationSet.primary.loop,
      growthPath: recommendationSet.primary.growthPath,
      qolDomain: recommendationSet.primary.qolDomain,
      duration: recommendationSet.primary.duration,
      mode: recommendationSet.primary.mode,
      selectedAt: new Date().toISOString(),
      metadata: {
        rationale: recommendationSet.rationale,
        intent: "presented",
        loadDurationMs: lastLoadDurationRef.current,
      },
    });
  }, [profileId, recommendationSet]);

  useEffect(() => {
    if (!profileId || !actionError) return;
    logActionEvent({
      actionId: "daily-loop:recommendation_error",
      profileId,
      source: "src/pages/GameHome.tsx",
      loop: "profile",
      selectedAt: new Date().toISOString(),
      metadata: {
        intent: "recommendation_error",
        message: actionError,
        loadDurationMs: lastLoadDurationRef.current,
      },
    });
  }, [actionError, profileId]);

  useEffect(() => {
    if (!profileId || actionError || isLoading) return;
    if (recommendationSet || noRecommendationLoggedRef.current) return;
    noRecommendationLoggedRef.current = true;
    logActionEvent({
      actionId: "daily-loop:no_recommendation",
      profileId,
      source: "src/pages/GameHome.tsx",
      loop: "profile",
      selectedAt: new Date().toISOString(),
      metadata: {
        intent: "no_recommendation",
        loadDurationMs: lastLoadDurationRef.current,
      },
    });
  }, [actionError, isLoading, profileId, recommendationSet]);

  const freedomModeUrl = useMemo(() => {
    const params = new URLSearchParams({ from: "daily-loop" });
    if (recommendedAction?.loop) params.set("loop", recommendedAction.loop);
    if (recommendedAction?.growthPath) params.set("growthPath", recommendedAction.growthPath);
    if (recommendedAction?.id) params.set("actionId", recommendedAction.id);
    return `/library?${params.toString()}`;
  }, [recommendedAction?.growthPath, recommendedAction?.id, recommendedAction?.loop]);

  const handlePrimaryAction = () => {
    if (!recommendationSet) return;
    const primary = recommendationSet.primary;

    if (profileId) {
      logActionEvent({
        actionId: primary.id,
        profileId,
        source: primary.source,
        loop: primary.loop,
        growthPath: primary.growthPath,
        qolDomain: primary.qolDomain,
        duration: primary.duration,
        mode: primary.mode,
        selectedAt: new Date().toISOString(),
        metadata: { intent: "accept_recommendation", origin: "primary_cta" },
      });
    }

    if (primary.type === "upgrade" && nextRecommendedUpgrade) {
      handleUpgradeAction(nextRecommendedUpgrade);
      return;
    }

    if (primary.type === "quest") {
      setShowQuestPicker(true);
      return;
    }

    if (primary.type === "practice") {
      const practice = findPracticeByTitle(primary.title);
      if (practice) {
        navigate(`/library?practice=${practice.id}&from=daily-loop&loop=${primary.loop}&growthPath=${primary.growthPath}`);
        return;
      }
    }

    navigate(freedomModeUrl);
  };

  const handleFreedomMode = () => {
    if (!recommendationSet || !profileId) return;
    const primary = recommendationSet.primary;
    logActionEvent({
      actionId: primary.id,
      profileId,
      source: primary.source,
      loop: primary.loop,
      growthPath: primary.growthPath,
      qolDomain: primary.qolDomain,
      duration: primary.duration,
      mode: primary.mode,
      selectedAt: new Date().toISOString(),
      metadata: { intent: "freedom_mode_override" },
    });
  };

  if (isLoading) {
    return (
      <GameShellV2>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      </GameShellV2>
    );
  }

  if (profile?.onboarding_stage && !["qol_complete", "unlocked"].includes(profile.onboarding_stage)) {
    return <Navigate to="/start" replace />;
  }

  return (
    <GameShellV2>

      {/* Guest Banner */}
      {!user && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Playing as guest</p>
                  <p className="text-xs text-amber-700">Log in to save progress across devices.</p>
                </div>
              </div>
              <Button size="sm" asChild className="w-full sm:w-auto">
                <Link
                  to="/auth"
                  onClick={() => {
                    if (profileId) {
                      logActionEvent({
                        actionId: "guest-login",
                        profileId,
                        source: "src/pages/GameHome.tsx",
                        loop: "profile",
                        selectedAt: new Date().toISOString(),
                        metadata: { intent: "guest_login" },
                      });
                    }
                  }}
                >
                  Log in
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 sm:pt-10 lg:pt-16 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="container mx-auto max-w-4xl">

          {/* Epic Welcome Header */}
          {hasAnyData && (
            <>
              <PowerfulWelcome
                firstName={profile?.first_name}
                archetypeTitle={zogSnapshot?.archetype_title}
                corePattern={zogSnapshot?.core_pattern}
                level={profile?.level}
                xpTotal={profile?.xp_total}
                streakDays={profile?.current_streak_days}
                totalActions={profile?.total_quests_completed}
              />
              {profile && (
                <div className="mb-10 flex justify-center">
                  <PlayerStatsBadge
                    level={profile.level}
                    xpTotal={profile.xp_total}
                    streakDays={profile.current_streak_days}
                    size="lg"
                  />
                </div>
              )}
            </>
          )}

          {/* ONBOARDING */}
          {!hasAnyData && (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-12 text-center shadow-lg">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Start Building Your Self-Understanding</h2>
                <p className="text-base text-slate-600 mb-8 leading-relaxed">
                  First, let's discover your Zone of Genius.
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    if (profileId) {
                      logActionEvent({
                        actionId: "onboarding:zog_start",
                        profileId,
                        source: "src/pages/GameHome.tsx",
                        loop: "profile",
                        selectedAt: new Date().toISOString(),
                        metadata: { intent: "start_onboarding" },
                      });
                    }
                    navigate("/zone-of-genius/entry");
                  }}
                >
                  <BoldText className="uppercase">Begin: Discover My Zone of Genius</BoldText>
                </Button>
              </div>
            </div>
          )}

          {/* MAIN GAME SECTIONS */}
          {hasAnyData && (
            <DailyLoopLayout
              profileName={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || null}
              level={profile?.level}
              xpTotal={profile?.xp_total}
              streakDays={profile?.current_streak_days}
              archetypeTitle={zogSnapshot?.archetype_title}
              lowestDomains={lowestDomains}
              celebration={celebration}
              recommendedAction={recommendedAction}
              isLoadingAction={isLoadingQuest}
              actionError={actionError}
              onPrimaryAction={handlePrimaryAction}
              onRetryAction={loadGameData}
              onFreedomMode={handleFreedomMode}
              freedomModeUrl={freedomModeUrl}
            />
          )}

          {/* QUEST PICKER MODAL */}
          {/* QUEST PICKER MODAL */}
          {showQuestPicker && (
            <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Choose Your Side Quest</h2>
                  <button
                    onClick={() => {
                      setShowQuestPicker(false);
                      setSelectedDuration(null);
                      setSelectedMode(null);
                      setQuestSuggestion(null);
                    }}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                {!questSuggestion && (
                  <>
                    {/* Duration Selection */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-900 mb-3">How long do you have?</p>
                      <div className="flex flex-wrap gap-2">
                        {QUEST_DURATIONS.map(dur => (
                          <button
                            key={dur}
                            onClick={() => {
                              setSelectedDuration(dur);
                              if (profileId) {
                                logActionEvent({
                                  actionId: "side-quest-duration",
                                  profileId,
                                  source: "src/pages/GameHome.tsx",
                                  loop: "transformation",
                                  selectedAt: new Date().toISOString(),
                                  metadata: { duration: dur },
                                });
                              }
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedDuration === dur
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                          >
                            {dur >= 60 ? `${dur / 60}h` : `${dur}m`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-slate-900 mb-3">What mode?</p>
                      <div className="flex flex-wrap gap-2">
                        {QUEST_MODES.map(mode => (
                          <button
                            key={mode.id}
                            onClick={() => {
                              setSelectedMode(mode.id);
                              if (profileId) {
                                logActionEvent({
                                  actionId: "side-quest-mode",
                                  profileId,
                                  source: "src/pages/GameHome.tsx",
                                  loop: "transformation",
                                  selectedAt: new Date().toISOString(),
                                  metadata: { mode: mode.id },
                                });
                              }
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${selectedMode === mode.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={handleStartQuest}
                      disabled={!selectedDuration || !selectedMode || isLoadingQuest}
                      className="w-full"
                    >
                      {isLoadingQuest ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Finding your quest...
                        </>
                      ) : (
                        'Find Side Quest'
                      )}
                    </Button>
                  </>
                )}

                {/* Quest Result */}
                {questSuggestion && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-5">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {questSuggestion.main.quest_title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">
                        {questSuggestion.main.practice_type} · ~{questSuggestion.main.approx_duration_minutes} min
                      </p>
                      <p className="text-sm text-slate-700 mb-4">
                        {questSuggestion.main.why_it_is_a_good_next_move}
                      </p>

                      {(() => {
                        const practice = findPracticeByTitle(questSuggestion.main.quest_title);
                        return practice && (
                          <div className="rounded-lg overflow-hidden mb-4">
                            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${practice.youtubeId}`}
                                title={practice.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        );
                      })()}

                      {!questCompleted ? (
                        <Button
                          onClick={() => {
                            if (profileId) {
                              logActionEvent({
                                actionId: `quest:${questSuggestion.main.quest_title.toLowerCase().replace(/\\s+/g, "-")}`,
                                profileId,
                                source: "src/pages/GameHome.tsx",
                                loop: "transformation",
                                growthPath: "genius",
                                duration: durationToBucket(questSuggestion.main.approx_duration_minutes),
                                selectedAt: new Date().toISOString(),
                                metadata: { intent: "complete_side_quest" },
                              });
                            }
                            handleQuestComplete();
                          }}
                          className="w-full"
                        >
                          I completed this quest
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-700 justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Side quest completed!</span>
                        </div>
                      )}
                    </div>

                    {questSuggestion.alternatives?.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase ">Alternatives</p>
                        <div className="space-y-2">
                          {questSuggestion.alternatives.map((alt, idx) => (
                            <button
                              key={`${alt.quest_title}-${idx}`}
                              onClick={() => {
                                if (profileId) {
                                  logActionEvent({
                                    actionId: `quest:${alt.quest_title.toLowerCase().replace(/\s+/g, "-")}`,
                                    profileId,
                                    source: "src/pages/GameHome.tsx",
                                    loop: "transformation",
                                    growthPath: "genius",
                                    duration: durationToBucket(alt.approx_duration_minutes),
                                    selectedAt: new Date().toISOString(),
                                    metadata: { intent: "select_alternative" },
                                  });
                                }
                                setQuestSuggestion({
                                  main: alt,
                                  alternatives: questSuggestion.alternatives.filter((_, altIndex) => altIndex !== idx),
                                });
                                setQuestCompleted(false);
                              }}
                              className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors"
                            >
                              <div className="font-semibold text-slate-900">{alt.quest_title}</div>
                              <div className="text-xs text-slate-500">
                                {alt.practice_type} · ~{alt.approx_duration_minutes || 10} min
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          if (profileId) {
                            logActionEvent({
                              actionId: "side-quest-picker",
                              profileId,
                              source: "src/pages/GameHome.tsx",
                              loop: "transformation",
                              selectedAt: new Date().toISOString(),
                              metadata: { intent: "choose_different" },
                            });
                          }
                          setQuestSuggestion(null);
                          setSelectedDuration(null);
                          setSelectedMode(null);
                        }}
                      >
                        Choose a different quest
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full text-slate-500"
                        onClick={() => {
                          if (profileId) {
                            logActionEvent({
                              actionId: "side-quest-skip",
                              profileId,
                              source: "src/pages/GameHome.tsx",
                              loop: "transformation",
                              selectedAt: new Date().toISOString(),
                              metadata: { intent: "skip_side_quest" },
                            });
                          }
                          setShowQuestPicker(false);
                          setQuestSuggestion(null);
                          setSelectedDuration(null);
                          setSelectedMode(null);
                        }}
                      >
                        Skip for now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </GameShellV2>
  );
};

export default GameHome;
