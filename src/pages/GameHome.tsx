import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, ExternalLink, Trophy, Flame } from "lucide-react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
import { LIBRARY_ITEMS, type LibraryItem } from "@/modules/library/libraryContent";
import { useToast } from "@/hooks/use-toast";
import { calculateQuestXp, calculateStreak } from "@/lib/xpSystem";

interface GameProfile {
  id: string;
  last_zog_snapshot_id: string | null;
  last_qol_snapshot_id: string | null;
  total_quests_completed: number;
  last_quest_title: string | null;
  xp_total: number;
  level: number;
  current_streak_days: number;
  longest_streak_days: number;
  last_quest_completed_at: string | null;
}

interface Quest {
  id: string;
  title: string;
  practice_type: string | null;
  duration_minutes: number | null;
  completed_at: string;
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

const INTENTIONS = [
  { id: "calm", label: "Calm my nervous system" },
  { id: "money", label: "Feel clearer about money" },
  { id: "purpose", label: "Clarify my direction / purpose" },
  { id: "relationships", label: "Deepen my relationships" },
  { id: "creativity", label: "Ignite my creativity" },
  { id: "growth", label: "Grow as a human (general)" },
];

const GameHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [zogSnapshot, setZogSnapshot] = useState<ZogSnapshot | null>(null);
  const [currentQolSnapshot, setCurrentQolSnapshot] = useState<QolSnapshot | null>(null);
  const [previousQolSnapshot, setPreviousQolSnapshot] = useState<QolSnapshot | null>(null);
  
  // Next Quest state
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [isLoadingQuest, setIsLoadingQuest] = useState(false);
  const [questSuggestion, setQuestSuggestion] = useState<{
    main: QuestSuggestion;
    alternatives: QuestSuggestion[];
  } | null>(null);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [recentQuests, setRecentQuests] = useState<Quest[]>([]);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      setIsLoading(true);
      
      const id = await getOrCreateGameProfileId();
      setProfileId(id);
      
      console.log("Loading game data for profile:", id);
      
      const { data: profileData, error: profileError } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching game profile:", profileError);
        throw profileError;
      }

      if (!profileData) {
        console.warn("No game profile found, creating one...");
        // Profile should have been created by getOrCreateGameProfileId, but handle edge case
        return;
      }

      console.log("Game profile loaded:", {
        id: profileData.id,
        last_zog_snapshot_id: profileData.last_zog_snapshot_id,
        last_qol_snapshot_id: profileData.last_qol_snapshot_id,
        total_quests_completed: profileData.total_quests_completed,
      });

      setProfile(profileData);

      // Load ZoG snapshot if it exists
      if (profileData.last_zog_snapshot_id) {
        console.log("Loading ZoG snapshot:", profileData.last_zog_snapshot_id);
        
        const { data: zogData, error: zogError } = await supabase
          .from('zog_snapshots')
          .select('*')
          .eq('id', profileData.last_zog_snapshot_id)
          .maybeSingle();

        if (zogError) {
          console.error("❌ Error fetching ZoG snapshot:", zogError);
        } else if (zogData) {
          console.log("✅ ZoG snapshot loaded:", {
            id: zogData.id,
            archetype_title: zogData.archetype_title,
            has_core_pattern: !!zogData.core_pattern,
            top_three_count: Array.isArray(zogData.top_three_talents) ? zogData.top_three_talents.length : 0,
          });

          setZogSnapshot({
            id: zogData.id,
            archetype_title: zogData.archetype_title,
            core_pattern: zogData.core_pattern,
            top_three_talents: Array.isArray(zogData.top_three_talents) 
              ? zogData.top_three_talents as string[]
              : [],
          });
        } else {
          console.warn("⚠️ ZoG snapshot ID exists but snapshot not found");
        }
      } else {
        console.log("No ZoG snapshot linked to profile yet");
      }

      // Load current QoL snapshot if it exists
      if (profileData.last_qol_snapshot_id) {
        const { data: currentQolData, error: currentQolError } = await supabase
          .from('qol_snapshots')
          .select('*')
          .eq('id', profileData.last_qol_snapshot_id)
          .maybeSingle();

        if (currentQolError) {
          console.error("Error fetching current QoL snapshot:", currentQolError);
        } else if (currentQolData) {
          setCurrentQolSnapshot(currentQolData);
        }

        // Fetch previous QoL snapshot for comparison
        const { data: allSnapshots, error: allSnapshotsError } = await supabase
          .from('qol_snapshots')
          .select('*')
          .eq('profile_id', id)
          .order('created_at', { ascending: false })
          .limit(2);

        if (!allSnapshotsError && allSnapshots && allSnapshots.length > 1) {
          setPreviousQolSnapshot(allSnapshots[1]);
        }
      }

      // Load recent quests
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('id, title, practice_type, duration_minutes, completed_at')
        .eq('profile_id', id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (!questsError && questsData) {
        setRecentQuests(questsData);
      }
    } catch (err) {
      console.error("❌ Failed to load game data:", err);
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

  const getDomainStageInfo = (domainId: string, stageValue: number) => {
    const domain = DOMAINS.find(d => d.id === domainId);
    if (!domain) return { name: domainId, title: `Stage ${stageValue}`, description: "" };
    
    const stage = domain.stages.find(s => s.id === stageValue);
    return {
      name: domain.name,
      color: domain.color,
      title: stage?.title || `Stage ${stageValue}`,
      description: stage?.description || "",
    };
  };

  const getLowestDomains = (): string[] => {
    if (!currentQolSnapshot) return [];

    const domainStages = [
      { name: "Wealth", value: currentQolSnapshot.wealth_stage },
      { name: "Health", value: currentQolSnapshot.health_stage },
      { name: "Happiness", value: currentQolSnapshot.happiness_stage },
      { name: "Love & Relationships", value: currentQolSnapshot.love_relationships_stage },
      { name: "Impact", value: currentQolSnapshot.impact_stage },
      { name: "Growth", value: currentQolSnapshot.growth_stage },
      { name: "Social Ties", value: currentQolSnapshot.social_ties_stage },
      { name: "Home", value: currentQolSnapshot.home_stage },
    ];

    const minValue = Math.min(...domainStages.map(d => d.value));
    return domainStages
      .filter(d => d.value === minValue)
      .slice(0, 2)
      .map(d => d.name);
  };

  const getLifeSummary = () => {
    if (!currentQolSnapshot) return "";

    const domainStages = [
      { name: "Wealth", value: currentQolSnapshot.wealth_stage },
      { name: "Health", value: currentQolSnapshot.health_stage },
      { name: "Happiness", value: currentQolSnapshot.happiness_stage },
      { name: "Love & Relationships", value: currentQolSnapshot.love_relationships_stage },
      { name: "Impact", value: currentQolSnapshot.impact_stage },
      { name: "Growth", value: currentQolSnapshot.growth_stage },
      { name: "Social Ties", value: currentQolSnapshot.social_ties_stage },
      { name: "Home", value: currentQolSnapshot.home_stage },
    ];

    const minValue = Math.min(...domainStages.map(d => d.value));
    const lowestDomains = domainStages.filter(d => d.value === minValue).slice(0, 2);

    const allEqual = domainStages.every(d => d.value === minValue);
    
    if (allEqual) {
      return "Your world is fairly even right now. You can choose any area that feels most alive for you.";
    }

    if (lowestDomains.length === 1) {
      return `Right now, your life is gently asking for more attention in ${lowestDomains[0].name}.`;
    }

    return `Right now, your life is gently asking for more attention in ${lowestDomains[0].name} and ${lowestDomains[1].name}.`;
  };

  const hasLeveledUp = (domainStage: number, domainKey: keyof QolSnapshot) => {
    if (!previousQolSnapshot || typeof previousQolSnapshot[domainKey] !== 'number') return false;
    return domainStage > (previousQolSnapshot[domainKey] as number);
  };

  const findPracticeByTitle = (title: string): LibraryItem | undefined => {
    return LIBRARY_ITEMS.find(item => 
      item.title.toLowerCase() === title.toLowerCase()
    );
  };

  const handleIntentionSelect = async (intention: string) => {
    setSelectedIntention(intention);
    setQuestSuggestion(null);
    setQuestCompleted(false);
    setIsLoadingQuest(true);

    try {
      const practices = LIBRARY_ITEMS.map(item => ({
        title: item.title,
        type: item.categoryId,
        duration_minutes: item.durationMinutes || 10,
        description: item.teacher ? `by ${item.teacher}` : undefined,
      }));

      const context = {
        lowestDomains: getLowestDomains(),
        archetypeTitle: zogSnapshot?.archetype_title,
        corePattern: zogSnapshot?.core_pattern,
      };

      const { data, error } = await supabase.functions.invoke('suggest-next-quest', {
        body: { intention, practices, context }
      });

      if (error) throw error;
      
      setQuestSuggestion(data);
    } catch (error) {
      console.error('Error fetching quest suggestion:', error);
      toast({
        title: "Couldn't find a quest",
        description: "Please try again or visit the Library directly.",
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
      const intention = selectedIntention 
        ? INTENTIONS.find(i => i.id === selectedIntention)?.label || null
        : null;

      // Insert quest record
      const { error: questError } = await supabase
        .from('quests')
        .insert({
          profile_id: profileId,
          title: questSuggestion.main.quest_title,
          practice_type: questSuggestion.main.practice_type,
          path: null, // Will be set in Part 2
          intention: intention,
          duration_minutes: durationMinutes,
          xp_awarded: xpAwarded,
        });

      if (questError) throw questError;

      // Update game profile with XP, level, and streak
      const { data: currentProfile, error: fetchError } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (fetchError) throw fetchError;

      const newXpTotal = currentProfile.xp_total + xpAwarded;
      const newLevel = Math.floor(newXpTotal / 100) + 1;
      
      const streakCalc = calculateStreak(
        currentProfile.last_quest_completed_at,
        currentProfile.current_streak_days
      );

      const { error: updateError } = await supabase
        .from('game_profiles')
        .update({
          total_quests_completed: currentProfile.total_quests_completed + 1,
          last_quest_title: questSuggestion.main.quest_title,
          last_quest_completed_at: new Date().toISOString(),
          xp_total: newXpTotal,
          level: newLevel,
          current_streak_days: streakCalc.newStreak,
          longest_streak_days: Math.max(
            currentProfile.longest_streak_days,
            streakCalc.newStreak
          ),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

      if (updateError) throw updateError;

      setQuestCompleted(true);
      
      // Reload all data
      await loadGameData();
    } catch (error) {
      console.error('Error completing quest:', error);
      toast({
        title: "Error",
        description: "Failed to save quest completion. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <p className="text-lg text-slate-600">Loading your character...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="container mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK TO HOME</BoldText>
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">
              Game of You · Character Home
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {hasAnyData ? "Welcome back" : "Welcome, Player One"}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              {hasAnyData 
                ? "You're already playing. Let's see who you are and where you are now."
                : "This game turns your life into a character, a world, and one next move."}
            </p>

            {/* XP and Level Display */}
            {profile && hasAnyData && (
              <div className="mt-6 inline-block">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-slate-900" />
                    <span className="font-semibold">
                      Level {profile.level} · {profile.xp_total} XP
                    </span>
                  </div>
                  {profile.current_streak_days > 0 && (
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>
                        Streak: {profile.current_streak_days} day{profile.current_streak_days !== 1 ? 's' : ''} · 
                        Longest: {profile.longest_streak_days}
                      </span>
                    </div>
                  )}
                </div>
                {/* Progress bar to next level */}
                <div className="mt-3 w-64 mx-auto">
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 transition-all duration-500"
                      style={{ width: `${(profile.xp_total % 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Next level at {Math.ceil(profile.xp_total / 100) * 100} XP
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Onboarding State */}
          {!hasAnyData && (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-12 text-center shadow-lg">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Start Your Character
                </h2>
                <p className="text-base text-slate-600 mb-8 leading-relaxed">
                  First, we'll discover your unique Zone of Genius. Then we'll map your life across eight domains. From there, the game begins.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/zone-of-genius?fromGame=1")}
                  className="w-full sm:w-auto"
                >
                  <BoldText className="uppercase">Begin: Discover My Zone of Genius</BoldText>
                </Button>
              </div>
            </div>
          )}

          {/* Character & World Sections */}
          {hasAnyData && (
            <div className="space-y-8">
              {/* Your Character */}
              {zogSnapshot ? (
                <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                    Your Character
                  </h2>
                  
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Archetype</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {zogSnapshot.archetype_title}
                    </p>
                  </div>

                  <p className="text-base text-slate-700 leading-relaxed mb-6">
                    {zogSnapshot.core_pattern}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                      Top talents in your Zone of Genius
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {zogSnapshot.top_three_talents.map((talent, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                        >
                          {talent}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-4 mt-6">
                    This is the pattern of genius you radiate when you stop performing and start being yourself.
                  </p>
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6 sm:p-8 text-center">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Your Character
                  </h2>
                  <p className="text-base text-slate-600 mb-6">
                    You haven't discovered your archetype yet.
                  </p>
                  <Button
                    onClick={() => navigate("/zone-of-genius?fromGame=1")}
                  >
                    <BoldText className="uppercase">Discover My Zone of Genius</BoldText>
                  </Button>
                </div>
              )}

              {/* Your World */}
              {currentQolSnapshot ? (
                <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                    Your World Right Now
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {[
                      { key: 'wealth_stage', id: 'wealth' },
                      { key: 'health_stage', id: 'health' },
                      { key: 'happiness_stage', id: 'happiness' },
                      { key: 'love_relationships_stage', id: 'love' },
                      { key: 'impact_stage', id: 'impact' },
                      { key: 'growth_stage', id: 'growth' },
                      { key: 'social_ties_stage', id: 'socialTies' },
                      { key: 'home_stage', id: 'home' },
                    ].map(({ key, id }) => {
                      const stageValue = currentQolSnapshot[key as keyof QolSnapshot] as number;
                      const info = getDomainStageInfo(id, stageValue);
                      const leveledUp = hasLeveledUp(stageValue, key as keyof QolSnapshot);

                      return (
                        <div
                          key={id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 relative"
                        >
                          {leveledUp && (
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                                ▲ Level up since last time
                              </span>
                            </div>
                          )}
                          <p className="text-sm font-semibold text-slate-900 mb-1">
                            {info.name}
                          </p>
                          <p className="text-base font-bold text-slate-700">
                            {info.title}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl border border-slate-300 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700 italic">
                      {getLifeSummary()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6 sm:p-8 text-center">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Your World Right Now
                  </h2>
                  <p className="text-base text-slate-600 mb-6">
                    You haven't mapped your eight life domains yet.
                  </p>
                  <Button
                    onClick={() => navigate("/quality-of-life-map/assessment?fromGame=1")}
                  >
                    <BoldText className="uppercase">Map My Life Snapshot</BoldText>
                  </Button>
                </div>
              )}

              {/* Your Next Quest */}
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Your Next Quest
                </h2>

                {profile && profile.total_quests_completed > 0 && (
                  <p className="text-sm text-slate-600 mb-4">
                    You've completed {profile.total_quests_completed === 1 ? '1 quest' : `${profile.total_quests_completed} quests`} so far.
                    {profile.last_quest_title && (
                      <span className="block mt-1">
                        Last one: "{profile.last_quest_title}".
                      </span>
                    )}
                  </p>
                )}

                {!currentQolSnapshot && (
                  <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg">
                    For more tailored quests,{' '}
                    <button
                      onClick={() => navigate("/quality-of-life-map/assessment?fromGame=1")}
                      className="underline hover:no-underline"
                    >
                      map your life snapshot
                    </button>
                    .
                  </p>
                )}

                <p className="text-base font-medium text-slate-900 mb-4">
                  What do you want to lean into next?
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {INTENTIONS.map(intent => (
                    <button
                      key={intent.id}
                      onClick={() => handleIntentionSelect(intent.label)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                        selectedIntention === intent.label
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {intent.label}
                    </button>
                  ))}
                </div>

                {isLoadingQuest && (
                  <div className="flex items-center justify-center py-8 text-slate-600">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span>Finding a quest for you…</span>
                  </div>
                )}

                {questSuggestion && !isLoadingQuest && (
                  <div className="space-y-6">
                    {/* Main Quest */}
                    {(() => {
                      const practice = findPracticeByTitle(questSuggestion.main.quest_title);
                      return (
                        <div className="rounded-2xl border-2 border-slate-300 bg-slate-50 p-6">
                          <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                            Main Quest
                          </p>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {questSuggestion.main.quest_title}
                          </h3>
                          <p className="text-sm text-slate-600 mb-3">
                            {questSuggestion.main.practice_type} · ~{questSuggestion.main.approx_duration_minutes} min
                          </p>
                          <p className="text-base text-slate-700 leading-relaxed mb-4">
                            {questSuggestion.main.why_it_is_a_good_next_move}
                          </p>

                          {/* Embedded YouTube Video */}
                          {practice && (
                            <div className="mb-4 rounded-lg overflow-hidden">
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
                          )}
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            {!questCompleted ? (
                              <Button
                                onClick={handleQuestComplete}
                                size="sm"
                                className="flex-1"
                              >
                                I completed this quest today
                              </Button>
                            ) : (
                              <div className="flex items-center gap-2 text-emerald-700">
                                <CheckCircle2 className="w-5 h-5" />
                                <p className="text-sm italic">
                                  Beautiful. That's one more conscious move in the direction of the life you're building.
                                </p>
                              </div>
                            )}
                            
                            {practice && !questCompleted && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(practice.url, '_blank')}
                                className="flex-shrink-0"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Watch on YouTube
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Alternatives */}
                    {questSuggestion.alternatives && questSuggestion.alternatives.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                          Other options that would also work
                        </p>
                        <div className="space-y-3">
                          {questSuggestion.alternatives.map((alt, idx) => {
                            const altPractice = findPracticeByTitle(alt.quest_title);
                            return (
                              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4">
                                <h4 className="text-base font-semibold text-slate-900 mb-1">
                                  {alt.quest_title}
                                </h4>
                                <p className="text-xs text-slate-600 mb-2">
                                  {alt.practice_type} · ~{alt.approx_duration_minutes} min
                                </p>
                                <p className="text-sm text-slate-700 mb-3">
                                  {alt.why_it_is_a_good_next_move}
                                </p>
                                
                                {altPractice && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(altPractice.url, '_blank')}
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Watch Practice
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!questSuggestion && !isLoadingQuest && selectedIntention && (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">
                      I couldn't find a quest right now. Please try again or visit the Library directly.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/library")}
                    >
                      Open Library
                    </Button>
                  </div>
                )}
              </div>

              {/* Recent Quests */}
              {recentQuests.length > 0 && (
                <div className="mt-8 rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Recent quests
                  </h3>
                  <div className="space-y-3">
                    {recentQuests.map(quest => (
                      <div
                        key={quest.id}
                        className="flex flex-wrap items-center gap-2 text-sm text-slate-700 py-2 border-b border-slate-100 last:border-0"
                      >
                        <span className="font-medium text-slate-900">{quest.title}</span>
                        <span className="text-slate-400">·</span>
                        {quest.practice_type && (
                          <>
                            <span className="text-slate-600">{quest.practice_type}</span>
                            <span className="text-slate-400">·</span>
                          </>
                        )}
                        {quest.duration_minutes && (
                          <>
                            <span className="text-slate-600">{quest.duration_minutes} min</span>
                            <span className="text-slate-400">·</span>
                          </>
                        )}
                        <span className="text-slate-500 text-xs">
                          {new Date(quest.completed_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentQuests.length === 0 && profile && profile.total_quests_completed === 0 && (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm text-slate-600">
                    You haven't completed any quests yet. Your first one is the most important.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer: Other Moves */}
          {hasAnyData && (
            <div className="mt-16 pt-8 border-t border-slate-200">
              <h3 className="text-base font-semibold text-slate-900 mb-4 text-center">
                Other moves
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate("/quality-of-life-map/assessment?fromGame=1")}
                >
                  Reassess My Life
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/zone-of-genius?fromGame=1")}
                >
                  Rediscover My Genius
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHome;
