import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, Loader2, CheckCircle2, ExternalLink, Trophy, Flame, 
  AlertCircle, Lock, Download, FileText, Target, Zap, Compass, Heart
} from "lucide-react";
import gameOfYouLogo from "@/assets/game-of-you-logo.png";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
import { LIBRARY_ITEMS, type LibraryItem, type DevelopmentPath } from "@/modules/library/libraryContent";
import { useToast } from "@/hooks/use-toast";
import { calculateQuestXp, calculateStreak } from "@/lib/xpSystem";
import { type Upgrade, getUpgradesByBranch, getPlayerUpgrades, completeUpgrade } from "@/lib/upgradeSystem";
import { getSuggestedPractices, markPracticeDone } from "@/lib/practiceSystem";

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
  xp_heart: number;
  xp_spirit: number;
  xp_uniqueness_work: number;
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
  heart: "Heart",
  spirit: "Spirit",
  uniqueness_work: "Uniqueness & Work"
};

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

  // Upgrades state
  const [masteryUpgrades, setMasteryUpgrades] = useState<Upgrade[]>([]);
  const [completedUpgradeCodes, setCompletedUpgradeCodes] = useState<Set<string>>(new Set());
  const [nextRecommendedUpgrade, setNextRecommendedUpgrade] = useState<Upgrade | null>(null);

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
      const id = await getOrCreateGameProfileId();
      setProfileId(id);

      const { data: profileData, error: profileError } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) return;

      setProfile(profileData);

      // Load ZoG snapshot
      if (profileData.last_zog_snapshot_id) {
        const { data: zogData } = await supabase
          .from('zog_snapshots')
          .select('*')
          .eq('id', profileData.last_zog_snapshot_id)
          .maybeSingle();

        if (zogData) {
          setZogSnapshot({
            id: zogData.id,
            archetype_title: zogData.archetype_title,
            core_pattern: zogData.core_pattern,
            top_three_talents: Array.isArray(zogData.top_three_talents)
              ? zogData.top_three_talents as string[]
              : [],
          });
        }
      }

      // Load QoL snapshot
      if (profileData.last_qol_snapshot_id) {
        const { data: qolData } = await supabase
          .from('qol_snapshots')
          .select('*')
          .eq('id', profileData.last_qol_snapshot_id)
          .maybeSingle();

        if (qolData) {
          setCurrentQolSnapshot(qolData);
          const suggestions = getSuggestedPractices(LIBRARY_ITEMS, qolData);
          setSuggestedPractices(suggestions);
        }
      }

      // Load upgrades and find next recommended
      const masteryData = await getUpgradesByBranch('uniqueness_work', 'mastery_of_genius');
      setMasteryUpgrades(masteryData);

      const playerUpgradesData = await getPlayerUpgrades(id);
      const completedCodes = new Set(playerUpgradesData.map(pu => pu.code));
      setCompletedUpgradeCodes(completedCodes);

      // Find next uncompleted upgrade
      const nextUpgrade = masteryData.find(u => !completedCodes.has(u.code));
      setNextRecommendedUpgrade(nextUpgrade || null);

      // Auto-complete ZoG assessment if snapshot exists
      if (profileData.last_zog_snapshot_id && !completedCodes.has('zog_assessment_completed')) {
        await completeUpgrade(id, 'zog_assessment_completed');
        completedCodes.add('zog_assessment_completed');
        setCompletedUpgradeCodes(new Set(completedCodes));
      }

    } catch (err) {
      console.error("Failed to load game data:", err);
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
      setQuestSuggestion(data);
    } catch (error) {
      console.error('Error fetching quest:', error);
      toast({
        title: "Couldn't find a quest",
        description: "Please try again or visit the Library.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingQuest(false);
    }
  };

  const handleQuestComplete = async () => {
    if (!profileId || !questSuggestion) return;

    try {
      const durationMinutes = questSuggestion.main.approx_duration_minutes || 10;
      const xpAwarded = calculateQuestXp(durationMinutes);

      await supabase.from('quests').insert({
        profile_id: profileId,
        title: questSuggestion.main.quest_title,
        practice_type: questSuggestion.main.practice_type,
        duration_minutes: durationMinutes,
        xp_awarded: xpAwarded,
      });

      const { data: currentProfile } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (currentProfile) {
        const newXpTotal = currentProfile.xp_total + xpAwarded;
        const newLevel = Math.floor(newXpTotal / 100) + 1;
        const streakCalc = calculateStreak(
          currentProfile.last_quest_completed_at,
          currentProfile.current_streak_days
        );

        await supabase
          .from('game_profiles')
          .update({
            total_quests_completed: currentProfile.total_quests_completed + 1,
            last_quest_title: questSuggestion.main.quest_title,
            last_quest_completed_at: new Date().toISOString(),
            xp_total: newXpTotal,
            level: newLevel,
            current_streak_days: streakCalc.newStreak,
            longest_streak_days: Math.max(currentProfile.longest_streak_days, streakCalc.newStreak),
          })
          .eq('id', profileId);
      }

      setQuestCompleted(true);
      toast({ title: `+${xpAwarded} XP earned!`, description: "Quest completed." });
      await loadGameData();
    } catch (error) {
      console.error('Error completing quest:', error);
      toast({ title: "Error", description: "Failed to save quest.", variant: "destructive" });
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
    // Different actions based on upgrade code
    switch (upgrade.code) {
      case 'zog_intro_video_watched':
        navigate('/resources/zog-intro-video');
        break;
      case 'personality_tests_completed':
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
            <img src={gameOfYouLogo} alt="Game of You" className="w-32 mx-auto mb-4" />
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
            <div className="space-y-6">
              
              {/* ===== SECTION 1: YOUR NEXT MOVE ===== */}
              <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/50 p-6 sm:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  YOUR NEXT MOVE
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Suggested Quest Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Suggested Quest</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Take a practice from the Library to earn XP and level up.
                    </p>
                    <Button 
                      onClick={() => setShowQuestPicker(true)} 
                      className="w-full"
                      size="sm"
                    >
                      Start a Quest →
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
                      <span className="text-sm">See all practices in the Library</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/library?from=game')}>
                      Browse Library →
                    </Button>
                  </div>
                </div>
              </div>

              {/* ===== SECTION 2: CHARACTER SNAPSHOT ===== */}
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-slate-600" />
                  WHERE I AM
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
                              {talent}
                            </span>
                          ))}
                        </div>
                        <Button variant="link" size="sm" className="mt-2 p-0 h-auto" onClick={() => navigate('/game/snapshot')}>
                          View full snapshot →
                        </Button>
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
                            <div className="grid grid-cols-4 gap-2 mb-3">
                              {domainEntries.map(({ key, id }) => {
                                const stageValue = currentQolSnapshot[key as keyof QolSnapshot] as number;
                                const info = getDomainStageInfo(id, stageValue);
                                const isLowest = stageValue === minValue;
                                const isHighest = stageValue === maxValue && stageValue !== minValue;
                                
                                return (
                                  <div 
                                    key={id} 
                                    className={`rounded-lg p-2 text-center bg-slate-100 transition-all ${
                                      isLowest ? 'shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 
                                      isHighest ? 'shadow-[0_0_12px_rgba(34,197,94,0.4)]' : ''
                                    }`}
                                  >
                                    <p className="text-[10px] text-slate-500 truncate">{info.name}</p>
                                    <p className="text-lg font-bold text-slate-900">{stageValue}</p>
                                  </div>
                                );
                              })}
                            </div>
                            <Button variant="link" size="sm" className="mt-1 p-0 h-auto" onClick={() => navigate('/game/snapshot')}>
                              View full map →
                            </Button>
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
              </div>

              {/* ===== SECTION 3: EXPLORE PATHS ===== */}
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-slate-600" />
                  EXPLORE THE GAME
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {/* Path Progress */}
                  {(Object.entries(PATH_LABELS) as [DevelopmentPath, string][]).map(([pathSlug, pathName]) => {
                    const pathXpMap: Record<DevelopmentPath, keyof GameProfile> = {
                      body: 'xp_body',
                      mind: 'xp_mind',
                      heart: 'xp_heart',
                      spirit: 'xp_spirit',
                      uniqueness_work: 'xp_uniqueness_work'
                    };
                    const xpValue = profile?.[pathXpMap[pathSlug]] as number || 0;
                    return (
                      <div 
                        key={pathSlug} 
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition-colors cursor-pointer"
                        onClick={() => navigate(`/game/path/${pathSlug}`)}
                      >
                        <p className="text-sm font-semibold text-slate-900">{pathName}</p>
                        <p className="text-xs text-slate-500">{xpValue} XP</p>
                        <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-slate-700 rounded-full transition-all"
                            style={{ width: `${Math.min((xpValue / 200) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Upgrades Card */}
                  <div 
                    className="rounded-xl border border-purple-200 bg-purple-50 p-4 hover:border-purple-300 transition-colors cursor-pointer"
                    onClick={() => {
                      const el = document.getElementById('upgrades-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <p className="text-sm font-semibold text-purple-900">All Upgrades</p>
                    <p className="text-xs text-purple-600">
                      {completedUpgradeCodes.size}/{masteryUpgrades.length} completed
                    </p>
                  </div>
                </div>
              </div>

              {/* ===== UPGRADES LIST ===== */}
              <div id="upgrades-section" className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Path of Genius Upgrades</h2>
                <div className="space-y-3">
                  {masteryUpgrades.map(upgrade => {
                    const isCompleted = completedUpgradeCodes.has(upgrade.code);
                    return (
                      <div 
                        key={upgrade.code}
                        className={`rounded-xl border p-4 ${isCompleted ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className={`font-semibold ${isCompleted ? 'text-emerald-800' : 'text-slate-900'}`}>
                              {upgrade.title}
                            </p>
                            <p className="text-xs text-slate-500">+{upgrade.xp_reward} XP</p>
                          </div>
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleUpgradeAction(upgrade)}>
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* QUEST PICKER MODAL */}
          {showQuestPicker && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Choose Your Quest</h2>
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
                            onClick={() => setSelectedDuration(dur)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                              selectedDuration === dur
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
                            onClick={() => setSelectedMode(mode.id)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                              selectedMode === mode.id
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
                        'Find My Quest'
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
                        <Button onClick={handleQuestComplete} className="w-full">
                          I completed this quest
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-700 justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Quest completed!</span>
                        </div>
                      )}
                    </div>

                    <Button 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => {
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
