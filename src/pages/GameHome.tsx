import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, ExternalLink, Trophy, Flame, AlertCircle, Lock, Download, FileText } from "lucide-react";
import gameOfYouLogo from "@/assets/game-of-you-logo.png";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
import { LIBRARY_ITEMS, LIBRARY_CATEGORIES, type LibraryItem, type DevelopmentPath } from "@/modules/library/libraryContent";
import { useToast } from "@/hooks/use-toast";
import { calculateQuestXp, calculateStreak } from "@/lib/xpSystem";
import { type Upgrade, getUpgradesByBranch, getPlayerUpgrades, completeUpgrade } from "@/lib/upgradeSystem";
import { getSuggestedPractices, markPracticeDone } from "@/lib/practiceSystem";

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
  xp_body: number;
  xp_mind: number;
  xp_heart: number;
  xp_spirit: number;
  xp_uniqueness_work: number;
}

const PATH_LABELS: Record<DevelopmentPath, string> = {
  body: "Body",
  mind: "Mind",
  heart: "Heart",
  spirit: "Spirit",
  uniqueness_work: "Uniqueness & Work"
};

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

interface GeniusOffer {
  id: string;
  status: string;
  pdf_url: string | null;
  summary_title: string | null;
  summary_promise: string | null;
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
  const [user, setUser] = useState<any>(null);
  
  // Path of Genius state
  const [masteryUpgrades, setMasteryUpgrades] = useState<Upgrade[]>([]);
  const [entrepreneurialUpgrades, setEntrepreneurialUpgrades] = useState<Upgrade[]>([]);
  const [completedUpgradeCodes, setCompletedUpgradeCodes] = useState<Set<string>>(new Set());
  
  // Next Quest state
  const [selectedPath, setSelectedPath] = useState<DevelopmentPath>("body");
  const [selectedIntention, setSelectedIntention] = useState<string | null>(null);
  const [isLoadingQuest, setIsLoadingQuest] = useState(false);
  const [questSuggestion, setQuestSuggestion] = useState<{
    main: QuestSuggestion;
    alternatives: QuestSuggestion[];
  } | null>(null);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [recentQuests, setRecentQuests] = useState<Quest[]>([]);
  
  // Suggested practices state
  const [suggestedPractices, setSuggestedPractices] = useState<LibraryItem[]>([]);
  const [markingPracticeDone, setMarkingPracticeDone] = useState<string | null>(null);
  
  // Genius Offer state
  const [geniusOffer, setGeniusOffer] = useState<GeniusOffer | null>(null);

  useEffect(() => {
    loadGameData();
    
    // Check auth status
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
          
          // Generate suggested practices
          const suggestions = getSuggestedPractices(LIBRARY_ITEMS, currentQolData);
          setSuggestedPractices(suggestions);
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

      // Load Path of Genius upgrades
      const masteryData = await getUpgradesByBranch('uniqueness_work', 'mastery_of_genius');
      const entrepreneurialData = await getUpgradesByBranch('uniqueness_work', 'entrepreneurial_path');
      setMasteryUpgrades(masteryData);
      setEntrepreneurialUpgrades(entrepreneurialData);

      // Load player's completed upgrades
      const playerUpgradesData = await getPlayerUpgrades(id);
      const completedCodes = new Set(playerUpgradesData.map(pu => pu.code));
      setCompletedUpgradeCodes(completedCodes);

      // Auto-complete ZoG assessment if snapshot exists but upgrade not completed
      if (profileData.last_zog_snapshot_id && !completedCodes.has('zog_assessment_completed')) {
        await completeUpgrade(id, 'zog_assessment_completed');
        completedCodes.add('zog_assessment_completed');
        setCompletedUpgradeCodes(new Set(completedCodes));
        // Reload profile to get updated XP
        const { data: updatedProfile } = await supabase
          .from('game_profiles')
          .select('*')
          .eq('id', id)
          .single();
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      }
      
      // Load Genius Offer for logged-in user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: geniusOfferData } = await supabase
          .from('genius_offer_requests')
          .select('id, status, pdf_url, summary_title, summary_promise')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (geniusOfferData) {
          setGeniusOffer(geniusOfferData);
        }
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
      // Filter practices by selected path
      let filteredPractices = LIBRARY_ITEMS;
      if (selectedPath) {
        filteredPractices = LIBRARY_ITEMS.filter(item => 
          item.primaryPath === selectedPath || item.secondaryPath === selectedPath
        );
        // If no practices match, fall back to all practices
        if (filteredPractices.length === 0) {
          filteredPractices = LIBRARY_ITEMS;
        }
      }

      const practices = filteredPractices.map(item => ({
        title: item.title,
        type: item.categoryId,
        duration_minutes: item.durationMinutes || 10,
        description: item.teacher ? `by ${item.teacher}` : undefined,
        primary_path: item.primaryPath,
        secondary_path: item.secondaryPath
      }));

      const context = {
        pathSlug: selectedPath,
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
          path: selectedPath,
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

      // Add path-specific XP
      const pathXpMap: Record<DevelopmentPath, keyof GameProfile> = {
        body: 'xp_body',
        mind: 'xp_mind',
        heart: 'xp_heart',
        spirit: 'xp_spirit',
        uniqueness_work: 'xp_uniqueness_work'
      };
      const pathXpField = pathXpMap[selectedPath];
      const newPathXp = (currentProfile[pathXpField] as number) + xpAwarded;

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
          [pathXpField]: newPathXp,
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

  const handleUpgradeComplete = async (upgradeCode: string) => {
    if (!profileId) return;
    
    try {
      const result = await completeUpgrade(profileId, upgradeCode);
      
      if (result.success) {
        toast({
          title: "Upgrade completed!",
          description: "Your XP and level have been updated.",
        });
        
        // Reload data to reflect new XP/level
        await loadGameData();
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Error completing upgrade:', error);
      toast({
        title: "Error",
        description: "Failed to mark upgrade as complete. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkPracticeDone = async (practice: LibraryItem) => {
    setMarkingPracticeDone(practice.id);

    const result = await markPracticeDone(practice.id, practice.primaryPath);

    if (result.success) {
      toast({
        title: result.message || "Practice logged!",
        description: "Your XP has been updated.",
      });
      
      // Reload game data to reflect new XP/level
      await loadGameData();
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to log practice",
        variant: "destructive",
      });
    }

    setMarkingPracticeDone(null);
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
      
      {/* Guest Banner */}
      {!user && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    You're playing as a guest
                  </p>
                  <p className="text-xs text-amber-700">
                    Log in to keep your character and progress across devices.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="default"
                asChild
                className="flex-shrink-0"
              >
                <Link to="/auth">Log in / Sign up</Link>
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
          <div className="text-center mb-12">
            <img 
              src={gameOfYouLogo} 
              alt="Game of You" 
              className="w-32 sm:w-40 mx-auto mb-6"
            />
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

              {/* Your Genius Offer */}
              {user && (
                <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="w-6 h-6 text-slate-700" />
                    <h2 className="text-xl font-bold text-slate-900">
                      Your Genius Offer
                    </h2>
                  </div>
                  
                  {geniusOffer && geniusOffer.status === 'completed' && geniusOffer.pdf_url ? (
                    <div className="space-y-4">
                      {geniusOffer.summary_title && (
                        <p className="text-2xl font-bold text-slate-900">
                          {geniusOffer.summary_title}
                        </p>
                      )}
                      {geniusOffer.summary_promise && (
                        <p className="text-base text-slate-700 leading-relaxed">
                          {geniusOffer.summary_promise}
                        </p>
                      )}
                      <Button
                        onClick={() => window.open(geniusOffer.pdf_url!, '_blank')}
                        className="w-full sm:w-auto"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <BoldText className="uppercase">Download PDF</BoldText>
                      </Button>
                    </div>
                  ) : geniusOffer ? (
                    <div className="text-center py-6">
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-4" />
                      <p className="text-base text-slate-600">
                        Your Genius Offer is being crafted.<br />
                        You'll see it here once it's ready.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-base text-slate-600 mb-6">
                        Transform your genius into a clear, sellable offer.
                      </p>
                      <Button
                        onClick={() => navigate("/genius-offer")}
                      >
                        <BoldText className="uppercase">Create Your Genius Offer</BoldText>
                      </Button>
                    </div>
                  )}
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

              {/* Path Progress */}
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Path Progress
                </h2>
                <div className="space-y-3">
                  {(Object.entries(PATH_LABELS) as [DevelopmentPath, string][]).map(([pathSlug, pathName]) => {
                    const pathXpMap: Record<DevelopmentPath, keyof GameProfile> = {
                      body: 'xp_body',
                      mind: 'xp_mind',
                      heart: 'xp_heart',
                      spirit: 'xp_spirit',
                      uniqueness_work: 'xp_uniqueness_work'
                    };
                    const xpField = pathXpMap[pathSlug];
                    const xpValue = profile?.[xpField] as number || 0;
                    return (
                      <div key={pathSlug} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                        <span className="font-medium text-slate-700">{pathName}</span>
                        <span className="font-bold text-slate-900">{xpValue} XP</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Path of Genius (Showing Up) */}
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-3">
                  Path of Genius (Showing Up)
                </h2>
                <p className="text-sm text-slate-600 mb-6">
                  Track concrete upgrades in how you understand, express, and offer your Genius to the world. 
                  First you deepen Mastery of Genius, then you branch into the Entrepreneurial Path.
                </p>

                {/* Mastery of Genius Branch */}
                <div className="mb-8">
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-900"></span>
                    Mastery of Genius
                  </h3>
                  <div className="space-y-4">
                    {masteryUpgrades.map(upgrade => {
                      const isCompleted = completedUpgradeCodes.has(upgrade.code);
                      
                      return (
                        <div key={upgrade.code} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className="text-base font-semibold text-slate-900 mb-1">
                                {upgrade.title}
                              </h4>
                              <p className="text-sm text-slate-600 leading-relaxed">
                                {upgrade.description}
                              </p>
                            </div>
                            {isCompleted && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>

                          {isCompleted ? (
                            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                              ✓ Completed
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                              {upgrade.code === 'zog_intro_video_watched' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate('/resources/zog-intro-video')}
                                    className="flex-1"
                                  >
                                    Watch Intro Video
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpgradeComplete(upgrade.code)}
                                  >
                                    Mark as done
                                  </Button>
                                </>
                              )}
                              {upgrade.code === 'personality_tests_completed' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate('/resources/personality-tests')}
                                    className="flex-1"
                                  >
                                    Explore Personality Tests
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpgradeComplete(upgrade.code)}
                                  >
                                    Mark as done
                                  </Button>
                                </>
                              )}
                              {upgrade.code === 'zog_assessment_completed' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate('/zone-of-genius/assessment')}
                                    className="flex-1"
                                  >
                                    Retake ZoG Assessment
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpgradeComplete(upgrade.code)}
                                  >
                                    Mark as done
                                  </Button>
                                </>
                              )}
                              {upgrade.code === 'appleseed_received' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
                                    className="flex-1"
                                  >
                                    Book AppleSeed Session
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpgradeComplete(upgrade.code)}
                                  >
                                    Mark as done
                                  </Button>
                                </>
                              )}
                              {upgrade.code === 'excalibur_received' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
                                    className="flex-1"
                                  >
                                    Book Excalibur Session ($297)
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpgradeComplete(upgrade.code)}
                                  >
                                    Mark as done
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Entrepreneurial Path Branch */}
                <div>
                  <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-900"></span>
                    Entrepreneurial Path
                  </h3>
                  <div className="space-y-4">
                    {entrepreneurialUpgrades.map(upgrade => {
                      const isCompleted = completedUpgradeCodes.has(upgrade.code);
                      const excaliburCompleted = completedUpgradeCodes.has('excalibur_received');
                      const isLocked = !excaliburCompleted;
                      
                      return (
                        <div 
                          key={upgrade.code} 
                          className={`rounded-xl border p-4 ${
                            isLocked 
                              ? 'border-slate-300 bg-slate-100' 
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h4 className={`text-base font-semibold mb-1 flex items-center gap-2 ${
                                isLocked ? 'text-slate-500' : 'text-slate-900'
                              }`}>
                                {isLocked && <Lock className="w-4 h-4" />}
                                {upgrade.title}
                              </h4>
                              <p className={`text-sm leading-relaxed ${
                                isLocked ? 'text-slate-500' : 'text-slate-600'
                              }`}>
                                {upgrade.description}
                              </p>
                            </div>
                            {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                          </div>

                          {isLocked ? (
                            <div className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                              <Lock className="w-3 h-3" />
                              Locked – unlocks after Excalibur
                            </div>
                          ) : isCompleted ? (
                            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                              ✓ Completed
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2 mt-4">
                              {upgrade.code === 'destiny_business_defined' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
                                    className="flex-1"
                                  >
                                    Design Destiny Business
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpgradeComplete(upgrade.code)}
                                  >
                                    Mark as done
                                  </Button>
                                </>
                              )}
                              {upgrade.code === 'first_transformational_product_listed' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => navigate('/library')}
                                    className="flex-1"
                                  >
                                    Showcase First Product
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpgradeComplete(upgrade.code)}
                                  >
                                    Mark as done
                                  </Button>
                                </>
                              )}
                              {upgrade.code === 'venture_cooperative_joined' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => toast({
                                      title: "Coming Soon",
                                      description: "Venture Cooperative details will be available soon.",
                                    })}
                                    className="flex-1"
                                  >
                                    Enter Venture Cooperative
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpgradeComplete(upgrade.code)}
                                  >
                                    Mark as done
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

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

                {!selectedIntention && (
                  <>
                    <div className="mb-6">
                      <p className="text-base font-medium text-slate-900 mb-3">
                        Choose a path to work with now
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.entries(PATH_LABELS) as [DevelopmentPath, string][]).map(([pathSlug, pathName]) => (
                          <button
                            key={pathSlug}
                            onClick={() => setSelectedPath(pathSlug)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                              selectedPath === pathSlug
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {pathName}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-base font-medium text-slate-900 mb-4">
                      Within this path, what do you want to lean into next?
                    </p>
                  </>
                )}

                {!selectedIntention && (
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
                )}

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
                            {questSuggestion.main.practice_type} · ~{questSuggestion.main.approx_duration_minutes} min · Path: {PATH_LABELS[selectedPath]}
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

              {/* Suggested Practices for Today */}
              {suggestedPractices.length > 0 && (
                <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Suggested Practices for Today
                  </h2>
                  <p className="text-sm text-slate-600 mb-6">
                    Based on your current Quality of Life, these practices are especially supportive right now.
                  </p>

                  <div className="grid grid-cols-1 gap-4">
                    {suggestedPractices.map(practice => {
                      const durationText = practice.durationLabel ?? 
                        (practice.durationMinutes ? `${practice.durationMinutes} min` : undefined);
                      const categoryName = LIBRARY_CATEGORIES.find(c => c.id === practice.categoryId)?.name;
                      
                      return (
                        <div
                          key={practice.id}
                          className="flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition-all"
                        >
                          <div className="flex-shrink-0 sm:w-48">
                            <img
                              src={`https://img.youtube.com/vi/${practice.youtubeId}/hqdefault.jpg`}
                              alt={practice.title}
                              className="w-full rounded-lg aspect-video object-cover"
                            />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <h3 className="text-base font-semibold text-slate-900 mb-1">
                              {practice.title}
                            </h3>
                            {practice.teacher && (
                              <p className="text-xs text-slate-600 mb-2">
                                by {practice.teacher}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {categoryName && (
                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-700">
                                  {categoryName}
                                </span>
                              )}
                              {durationText && (
                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-700">
                                  {durationText}
                                </span>
                              )}
                              {practice.primaryDomain && (
                                <span className="inline-block px-2 py-1 text-xs rounded-full bg-slate-200 text-slate-700">
                                  {practice.primaryDomain.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/library")}
                                className="flex-1"
                              >
                                Open in Library
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleMarkPracticeDone(practice)}
                                disabled={markingPracticeDone === practice.id}
                                className="flex-1 min-h-[44px]"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {markingPracticeDone === practice.id ? "Logging..." : "Mark as done"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
