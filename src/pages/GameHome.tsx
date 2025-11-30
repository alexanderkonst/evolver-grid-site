import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";

interface GameProfile {
  id: string;
  last_zog_snapshot_id: string | null;
  last_qol_snapshot_id: string | null;
  total_quests_completed: number;
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

const GameHome = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<GameProfile | null>(null);
  const [zogSnapshot, setZogSnapshot] = useState<ZogSnapshot | null>(null);
  const [currentQolSnapshot, setCurrentQolSnapshot] = useState<QolSnapshot | null>(null);
  const [previousQolSnapshot, setPreviousQolSnapshot] = useState<QolSnapshot | null>(null);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      setIsLoading(true);
      
      // Get or create profile ID
      const profileId = await getOrCreateGameProfileId();
      
      // Fetch game profile
      const { data: profileData, error: profileError } = await supabase
        .from('game_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch ZoG snapshot if exists
      if (profileData.last_zog_snapshot_id) {
        const { data: zogData, error: zogError } = await supabase
          .from('zog_snapshots')
          .select('*')
          .eq('id', profileData.last_zog_snapshot_id)
          .single();

        if (!zogError && zogData) {
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

      // Fetch current QoL snapshot if exists
      if (profileData.last_qol_snapshot_id) {
        const { data: currentQolData, error: currentQolError } = await supabase
          .from('qol_snapshots')
          .select('*')
          .eq('id', profileData.last_qol_snapshot_id)
          .single();

        if (!currentQolError && currentQolData) {
          setCurrentQolSnapshot(currentQolData);
        }

        // Fetch previous QoL snapshot for comparison
        const { data: allSnapshots, error: allSnapshotsError } = await supabase
          .from('qol_snapshots')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false })
          .limit(2);

        if (!allSnapshotsError && allSnapshots && allSnapshots.length > 1) {
          setPreviousQolSnapshot(allSnapshots[1]);
        }
      }
    } catch (err) {
      console.error("Failed to load game data:", err);
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

    // Check if all domains are equal
    const allEqual = domainStages.every(d => d.value === minValue);
    
    if (allEqual) {
      return "Your life is fairly balanced. You can choose any domain that feels most alive for you right now.";
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
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK TO HOME</BoldText>
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
              Game of You · Character Home
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              {hasAnyData ? "Welcome back" : "Welcome, Player One"}
            </h1>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              {hasAnyData 
                ? "You've already started playing. Let's see where you are now."
                : "This game turns your life into a character, a world, and a quest."}
            </p>
          </div>

          {/* Onboarding State */}
          {!hasAnyData && (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-12 text-center shadow-lg">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Create Your Character
                </h2>
                <p className="text-base text-slate-600 mb-8">
                  In two short steps, you'll see your unique genius and a clear snapshot of your life.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/zone-of-genius?fromGame=1")}
                  className="w-full sm:w-auto"
                >
                  <BoldText className="uppercase">Start: Discover My Zone of Genius</BoldText>
                </Button>
              </div>
            </div>
          )}

          {/* Character Section */}
          {hasAnyData && (
            <div className="space-y-8">
              {/* Your Character */}
              {zogSnapshot ? (
                <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                    Your Character
                  </h2>
                  
                  <div className="mb-4">
                    <p className="text-sm uppercase tracking-wider text-slate-500 mb-1">Archetype</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {zogSnapshot.archetype_title}
                    </p>
                  </div>

                  <p className="text-base text-slate-700 leading-relaxed mb-6">
                    {zogSnapshot.core_pattern}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {zogSnapshot.top_three_talents.map((talent, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                      >
                        {talent}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500 italic border-t border-slate-200 pt-4">
                    This is the flavor of genius you radiate when you stop pretending to be someone else.
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

                  {/* 8 Domain Cards */}
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
                                ▲ Level up
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

                  {/* Summary */}
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
            </div>
          )}

          {/* Footer: Other Moves */}
          {hasAnyData && (
            <div className="mt-16 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 text-center">
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
