import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Sparkles, Loader2, CheckCircle2, ExternalLink, Trophy, Flame,
  AlertCircle, Lock, Download, FileText, Target, Zap, Compass, Heart
} from "lucide-react";
import gameOfLifeLogo from "@/assets/game-of-life-logo.png";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import DailyLoopLayout from "@/components/game/DailyLoopLayout";
import { FEATURE_FLAGS } from "@/config/featureFlags";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
import { LIBRARY_ITEMS, type LibraryItem, type DevelopmentPath } from "@/modules/library/libraryContent";
import { useToast } from "@/hooks/use-toast";
import { type Upgrade, getUpgradesByBranch, getPlayerUpgrades } from "@/lib/upgradeSystem";
import { getSuggestedPractices, markPracticeDone } from "@/lib/practiceSystem";
import { buildGrowthPathActionsForProgress, buildRecommendationFromLegacy, formatDurationBucket } from "@/lib/actionEngine";
import { growthPathSteps, type GrowthPathProgress } from "@/modules/growth-paths";
import { logActionEvent } from "@/lib/actionEvents";
import {
  getMainQuestCopy,
  computeNextMainQuestStage,
  isStageComplete,
  calculateMainQuestProgress,
  buildPlayerStats,
  getStageNumber,
  getTotalStages,
  type MainQuestStage,
  type PlayerStats
} from "@/lib/mainQuest";
import { advanceMainQuestIfEligible, markRealWorldOutputDone } from "@/lib/mainQuestApi";
import SkillTree from "@/components/SkillTree";
import { skillTrees } from "@/data/skillTrees";

// Types
interface GameProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  last_zog_snapshot_id: string | null;
  last_qol_snapshot_id: string | null;
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

const PATH_LABELS: Record<DevelopmentPath, string> = {
  body: "Body",
  mind: "Mind",
  emotions: "Emotions",
  spirit: "Spirit",
  uniqueness: "Genius"
};

const QUEST_DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120, 150];

const QUEST_MODES = [
  { id: "activating", label: "Activating / Energizing" },
  { id: "relaxing", label: "Relaxing / Calming" },
  { id: "balanced", label: "Balanced" },
];

const formatDurationLabel = (minutes?: number | null) => {
  if (!minutes && minutes !== 0) return undefined;
  if (minutes <= 3) return "≈3 min";
  if (minutes <= 10) return "~10 min";
  if (minutes <= 25) return "~20–25 min";
  if (minutes <= 45) return "~45 min";
  return `${minutes} min`;
};

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
  const [markingPracticeDone, setMarkingPracticeDone] = useState<string | null>(null);

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

  const loadGameData = async () => {
    try {
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
      console.error("Failed to load game data:", err);
      setActionError("We couldn't load your next move yet. Please retry.");
      toast({
        title: "Error loading data",
        description: "Please refresh the page to try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasAnyData = profile?.last_zog_snapshot_id || profile?.last_qol_snapshot_id;

  const getLowestDomains = (): string[] => {
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

  const getDomainStageInfo = (domainId: string, stageValue: number) => {
    const domain = DOMAINS.find(d => d.id === domainId);
    if (!domain) return { name: domainId, title: `Stage ${stageValue}` };
    const stage = domain.stages.find(s => s.id === stageValue);
    return { name: domain.name, title: stage?.title || `Stage ${stageValue}` };
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
      console.error('Error fetching quest:', error);

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
        duration: formatDurationBucket(durationMinutes),
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
      console.error('Error completing quest:', error);
      toast({ title: "Error", description: "Failed to save side quest.", variant: "destructive" });
    }
  };

  const handleMarkPracticeDone = async (practice: LibraryItem) => {
    setMarkingPracticeDone(practice.id);
    const result = await markPracticeDone(practice.id, practice.primaryPath);

    if (result.success) {
      toast({ title: "+10 XP earned!", description: "Practice logged." });
      await loadGameData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setMarkingPracticeDone(null);
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
        navigate('/zone-of-genius/assessment');
        break;
      case 'appleseed_received':
      case 'excalibur_received':
        window.open('https://www.calendly.com/konstantinov', '_blank');
        break;
      default:
        break;
    }
  };

  // Get the Showing Up skill tree for visualization
  const showingUpTree = skillTrees.find(t => t.id === 'showing-up');

  // Map upgrade codes to skill tree node IDs
  const skillTreeProgress = useMemo(() => {
    const codeToNodeMap: Record<string, string> = {
      'zog_assessment_completed': 'su-zone-of-genius',
      'personality_tests_completed': 'su-values-clarity',
      'genius_offer_draft': 'su-offer-creation',
      'first_practice_done': 'su-visibility',
    };

    const progress: Record<string, "locked" | "available" | "in_progress" | "completed"> = {};

    if (!showingUpTree) return progress;

    // First pass: mark completed nodes
    showingUpTree.nodes.forEach(node => {
      const upgradeCode = Object.entries(codeToNodeMap).find(([_, nodeId]) => nodeId === node.id)?.[0];
      if (upgradeCode && completedUpgradeCodes.has(upgradeCode)) {
        progress[node.id] = 'completed';
      }
    });

    // Second pass: determine available/locked based on prerequisites
    showingUpTree.nodes.forEach(node => {
      if (progress[node.id] === 'completed') return;

      if (node.prerequisites.length === 0) {
        progress[node.id] = 'available';
      } else {
        const allPrereqsCompleted = node.prerequisites.every(p => progress[p] === 'completed');
        progress[node.id] = allPrereqsCompleted ? 'available' : 'locked';
      }
    });

    return progress;
  }, [completedUpgradeCodes, showingUpTree]);

  const lowestDomains = getLowestDomains();

  const isDailyLoopV2 = FEATURE_FLAGS.DAILY_LOOP_V2;

  const recommendationSet = useMemo(() =>
    buildRecommendationFromLegacy({
      questSuggestion,
      upgrade: nextRecommendedUpgrade,
      practices: suggestedPractices,
      extraActions: isDailyLoopV2 ? buildGrowthPathActionsForProgress(growthPathSteps, growthPathProgress) : [],
      lowestDomains,
      totalCompletedActions: profile?.total_quests_completed,
    }),
  [questSuggestion, nextRecommendedUpgrade, suggestedPractices, lowestDomains, profile?.total_quests_completed, isDailyLoopV2, growthPathProgress]);

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
      metadata: { rationale: recommendationSet.rationale, intent: "presented" },
    });
  }, [profileId, recommendationSet]);

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
      metadata: { intent: "freedom_mode" },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Guest Banner */}
      {!user && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Playing as guest</p>
                  <p className="text-xs text-amber-700">Log in to save progress across devices.</p>
                </div>
              </div>
              <Button size="sm" asChild>
                <Link to="/auth">Log in</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="container mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK TO HOME</BoldText>
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <img src={gameOfLifeLogo} alt="Game of Life" className="w-32 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              {hasAnyData ? `Welcome back${profile?.first_name ? `, ${profile.first_name}` : ''}` : "Welcome, Player One"}
            </h1>
              {profile && hasAnyData && (
                <div className="flex items-center justify-center gap-4 text-sm text-slate-600 mt-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-slate-700" />
                    <span className="font-semibold">Level {profile.level} · {profile.xp_total} XP</span>
                  </div>
                  {profile.current_streak_days > 0 && (
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{profile.current_streak_days} day streak</span>
                    </div>
                  )}
                </div>
              )}
            {zogSnapshot?.archetype_title && (
              <p className="text-slate-500 text-sm mt-2">{zogSnapshot.archetype_title}</p>
            )}
          </div>

          {/* ONBOARDING */}
          {!hasAnyData && (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-12 text-center shadow-lg">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Start Your Character</h2>
                <p className="text-base text-slate-600 mb-8 leading-relaxed">
                  First, discover your Zone of Genius. Then map your life across eight domains.
                </p>
                <Button size="lg" onClick={() => navigate("/zone-of-genius?fromGame=1")}>
                  <BoldText className="uppercase">Begin: Discover My Zone of Genius</BoldText>
                </Button>
              </div>
            </div>
          )}

          {/* MAIN GAME SECTIONS */}
          {hasAnyData && (
            isDailyLoopV2 ? (
              <DailyLoopLayout
                profileName={[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || null}
                level={profile?.level}
                xpTotal={profile?.xp_total}
                streakDays={profile?.current_streak_days}
                archetypeTitle={zogSnapshot?.archetype_title}
                lowestDomains={lowestDomains}
                recommendedAction={recommendedAction}
                isLoadingAction={isLoadingQuest}
                actionError={actionError}
                onPrimaryAction={handlePrimaryAction}
                onRetryAction={loadGameData}
                onFreedomMode={handleFreedomMode}
                freedomModeUrl={freedomModeUrl}
              />
            ) : (
              <div className="space-y-6">

                {/* ===== SECTION 1: YOUR NEXT MOVE ===== */}
                <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/50 p-6 sm:p-8 shadow-lg">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    YOUR NEXT MOVE
                  </h2>

                  {/* Main Quest (Storyline) Card - Always first */}
                  {(() => {
                  const playerStats = buildPlayerStats(
                    profile,
                    completedUpgradeCodes.size,
                    !!zogSnapshot
                  );

                  // Compute current stage based on player stats
                  const computedStage = computeNextMainQuestStage(profile, playerStats);
                  const questCopy = getMainQuestCopy(computedStage);
                  const stageComplete = isStageComplete(computedStage, profile, playerStats);
                  const progress = calculateMainQuestProgress(computedStage);
                  const stageNum = getStageNumber(computedStage);
                  const totalStages = getTotalStages();
                  const isFinalStage = computedStage === 'mq_5_real_world_output';

                  const handleMarkDone = async () => {
                    if (profileId && isFinalStage) {
                      await markRealWorldOutputDone(profileId);
                      toast({ title: "🎉 Congratulations!", description: "You've completed the Main Quest storyline!" });
                      await loadGameData();
                    }
                  };

                  return (
                    <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Main Quest (Storyline)</span>
                        </div>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          Stage {stageNum} of {totalStages}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 mb-1">{questCopy.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{questCopy.objective}</p>
                      <p className="text-xs text-slate-400 mb-4">💡 {questCopy.completionHint}</p>

                      {/* Progress strip */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: totalStages }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all ${i < stageNum ? 'bg-indigo-500' :
                              i === stageNum - 1 ? 'bg-indigo-300' :
                                'bg-slate-200'
                              }`}
                          />
                        ))}
                      </div>

                      {stageComplete ? (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Stage Complete! Advancing...</span>
                        </div>
                      ) : isFinalStage ? (
                        <Button
                          onClick={handleMarkDone}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          size="sm"
                        >
                          {questCopy.ctaLabel} ✓
                        </Button>
                      ) : (
                        <Button
                          onClick={() => questCopy.ctaRoute && navigate(questCopy.ctaRoute)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          size="sm"
                        >
                          {questCopy.ctaLabel} →
                        </Button>
                      )}
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Side Quest Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Side Quest (Practice)</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Earn XP with a quick practice from the library.
                    </p>
                    <Button
                      onClick={() => {
                        if (profileId) {
                          logActionEvent({
                            actionId: "side-quest-picker",
                            profileId,
                            source: "src/pages/GameHome.tsx",
                            loop: "transformation",
                            selectedAt: new Date().toISOString(),
                            metadata: { intent: "open_picker" },
                          });
                        }
                        setShowQuestPicker(true);
                      }}
                      className="w-full"
                      size="sm"
                    >
                      Start Side Quest →
                    </Button>
                  </div>

                  {/* Suggested Upgrade Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Suggested Upgrade</span>
                    </div>
                    {nextRecommendedUpgrade ? (
                      <>
                        <p className="text-sm font-semibold text-slate-900 mb-1">{nextRecommendedUpgrade.title}</p>
                        <p className="text-xs text-slate-500 mb-3">+{nextRecommendedUpgrade.xp_reward} XP</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleUpgradeAction(nextRecommendedUpgrade)}
                        >
                          Start Upgrade →
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">All upgrades completed!</p>
                    )}
                  </div>
                </div>

                {/* Explore Option */}
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Compass className="w-4 h-4" />
                      <span className="text-sm">See all transformational journeys in the Library</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (profileId) {
                          logActionEvent({
                            actionId: "library:browse",
                            profileId,
                            source: "src/pages/GameHome.tsx",
                            loop: "marketplace",
                            selectedAt: new Date().toISOString(),
                            metadata: { intent: "browse_library" },
                          });
                        }
                        navigate('/library?from=game');
                      }}
                    >
                      Browse Library →
                    </Button>
                  </div>
                </div>
              </div>

              {/* ===== SECTION 2: CHARACTER SNAPSHOT ===== */}
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-slate-600" />
                  WHO I AM AND WHERE I AM
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Character Identity */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">My Character</p>
                    {zogSnapshot ? (
                      <>
                        <p className="text-xl font-bold text-slate-900 mb-2">{zogSnapshot.archetype_title}</p>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-3">{zogSnapshot.core_pattern}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {zogSnapshot.top_three_talents.map((talent, idx) => (
                            <span key={idx} className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                              {talent.replace(/^Talent\s+/i, '')}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Button size="sm" onClick={() => navigate('/zone-of-genius/assessment')}>
                        Discover My Zone of Genius
                      </Button>
                    )}
                  </div>

                  {/* World State */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">My World</p>
                    {currentQolSnapshot ? (
                      (() => {
                        const domainEntries = [
                          { key: 'wealth_stage', id: 'wealth' },
                          { key: 'health_stage', id: 'health' },
                          { key: 'happiness_stage', id: 'happiness' },
                          { key: 'love_relationships_stage', id: 'love' },
                          { key: 'impact_stage', id: 'impact' },
                          { key: 'growth_stage', id: 'growth' },
                          { key: 'social_ties_stage', id: 'socialTies' },
                          { key: 'home_stage', id: 'home' },
                        ];
                        const values = domainEntries.map(({ key }) => currentQolSnapshot[key as keyof QolSnapshot] as number);
                        const minValue = Math.min(...values);
                        const maxValue = Math.max(...values);

                        return (
                          <>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {domainEntries.map(({ key, id }) => {
                                const stageValue = currentQolSnapshot[key as keyof QolSnapshot] as number;
                                const info = getDomainStageInfo(id, stageValue);
                                const isLowest = stageValue === minValue && minValue !== maxValue;
                                const isHighest = stageValue === maxValue && minValue !== maxValue;

                                return (
                                  <div
                                    key={id}
                                    className={`rounded-lg p-2.5 transition-all ${isLowest ? 'bg-red-50 border border-red-200' :
                                      isHighest ? 'bg-emerald-50 border border-emerald-200' :
                                        'bg-slate-100 border border-transparent'
                                      }`}
                                  >
                                    <div className="flex items-center justify-between mb-0.5">
                                      <p className="text-xs font-semibold text-slate-800">{info.name}</p>
                                      <p className="text-xs text-slate-500">{stageValue}/10</p>
                                    </div>
                                    <p className={`text-[10px] leading-tight ${isLowest ? 'text-red-600' : isHighest ? 'text-emerald-600' : 'text-slate-500'}`}>
                                      {info.title}
                                    </p>
                                    {isLowest && (
                                      <span className="text-[9px] text-red-500 font-medium">↓ needs attention</span>
                                    )}
                                    {isHighest && (
                                      <span className="text-[9px] text-emerald-600 font-medium">✓ strength</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <Button size="sm" onClick={() => navigate('/quality-of-life-map/assessment')}>
                        Map My Life
                      </Button>
                    )}
                  </div>
                </div>

                {/* View Full Snapshot Button - at bottom */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Button className="w-full" onClick={() => navigate('/game/snapshot')}>
                    <FileText className="w-4 h-4 mr-2" />
                    View Full Snapshot
                  </Button>
                </div>
              </div>

              {/* ===== SECTION 3: EXPLORE UPGRADES ===== */}
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-slate-600" />
                  EXPLORE THE UPGRADES
                </h2>

                {/* Infographic Image */}
                <div className="mb-6">
                  <img
                    src="https://i.imgur.com/t4mDGOf.jpeg"
                    alt="Five development paths: Waking Up, Growing Up, Cleaning Up, Showing Up, and Body"
                    className="w-full rounded-xl border border-slate-200"
                  />
                </div>

                {/* Path Progress - sorted by XP, stacked vertically */}
                <div className="space-y-3">
                  {(() => {
                    const pathXpMap: Record<DevelopmentPath, keyof GameProfile> = {
                      body: 'xp_body',
                      mind: 'xp_mind',
                      emotions: 'xp_emotions',
                      spirit: 'xp_spirit',
                      uniqueness: 'xp_uniqueness'
                    };

                    // Sort paths by XP (highest first)
                    const sortedPaths = (Object.entries(PATH_LABELS) as [DevelopmentPath, string][])
                      .map(([pathSlug, pathName]) => ({
                        pathSlug,
                        pathName,
                        xpValue: (profile?.[pathXpMap[pathSlug]] as number) || 0
                      }))
                      .sort((a, b) => b.xpValue - a.xpValue);

                    const maxXp = Math.max(...sortedPaths.map(p => p.xpValue), 100);

                    return sortedPaths.map(({ pathSlug, pathName, xpValue }) => {
                      // Count upgrades for this path (currently only uniqueness has upgrades)
                      const upgradeCount = pathSlug === 'uniqueness'
                        ? Array.from(completedUpgradeCodes).filter(code =>
                          masteryUpgrades.some(u => u.code === code)
                        ).length
                        : 0;
                      const totalUpgrades = pathSlug === 'uniqueness' ? masteryUpgrades.length : 0;

                      return (
                        <div
                          key={pathSlug}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition-colors cursor-pointer"
                          onClick={() => navigate(`/game/path/${pathSlug}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-slate-900">{pathName}</p>
                            <div className="flex items-center gap-3">
                              {totalUpgrades > 0 && (
                                <span className="text-xs text-slate-500">
                                  {upgradeCount}/{totalUpgrades} upgrades
                                </span>
                              )}
                              <span className="text-xs font-medium text-slate-700 bg-slate-200 rounded-full px-2 py-0.5">
                                {xpValue} XP
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-700 rounded-full transition-all"
                              style={{ width: `${Math.min((xpValue / maxXp) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* ===== SHOWING UP UPGRADES ===== */}
              <div id="upgrades-section" className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4">SHOWING UP SKILL TREE</h2>

                {/* Visual Skill Tree */}
                {showingUpTree && (
                  <div className="relative w-full aspect-[4/3] max-w-xl mx-auto rounded-xl border border-slate-200 overflow-hidden bg-slate-50 mb-6">
                    <SkillTree
                      tree={showingUpTree}
                      progress={skillTreeProgress}
                      onNodeClick={(node) => {
                        // Find upgrade matching this node and trigger its action
                        const nodeToCodeMap: Record<string, string> = {
                          'su-zone-of-genius': 'zog_assessment_completed',
                          'su-values-clarity': 'personality_tests_completed',
                          'su-offer-creation': 'genius_offer_draft',
                          'su-visibility': 'first_practice_done',
                        };
                        const upgradeCode = nodeToCodeMap[node.id];
                        const upgrade = masteryUpgrades.find(u => u.code === upgradeCode);
                        if (upgrade) handleUpgradeAction(upgrade);
                      }}
                    />
                  </div>
                )}

                {/* Upgrade List */}
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upgrades Progress</h3>
                <div className="space-y-3">
                  {masteryUpgrades.map((upgrade, index) => {
                    const isCompleted = completedUpgradeCodes.has(upgrade.code);
                    // Allow clicking personality tests and ZoG assessment even when completed (to update)
                    const isAlwaysClickable = upgrade.code === 'personality_tests_completed' || upgrade.code === 'zog_assessment_completed';
                    const stepNumber = index + 1;
                    return (
                      <div
                        key={upgrade.code}
                        className={`rounded-xl border p-4 ${isCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Big Step Number */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                            }`}>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : stepNumber}
                          </div>

                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <p className={`font-semibold ${isCompleted ? 'text-emerald-800' : 'text-slate-900'}`}>
                                {upgrade.title}
                              </p>
                              <p className="text-xs text-slate-500">+{upgrade.xp_reward} XP</p>
                            </div>
                            {isCompleted && isAlwaysClickable ? (
                              <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-100" onClick={() => handleUpgradeAction(upgrade)}>
                                Update
                              </Button>
                            ) : !isCompleted ? (
                              <Button size="sm" variant="outline" onClick={() => handleUpgradeAction(upgrade)}>
                                Start
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              </div>
            )
          )}

          {/* QUEST PICKER MODAL */}
          {showQuestPicker && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
                    className="text-slate-400 hover:text-slate-600"
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
                                duration: formatDurationBucket(questSuggestion.main.approx_duration_minutes),
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
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GameHome;
