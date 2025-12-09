import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateGameProfileId } from '@/lib/gameProfile';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles, Target, Brain, Heart, User, Loader2, RefreshCw } from 'lucide-react';
import { TALENTS } from '@/modules/zone-of-genius/talents';
import { DOMAINS } from '@/modules/quality-of-life-map/qolConfig';

interface ZogSnapshot {
  archetype_title: string;
  core_pattern: string;
  top_three_talents: number[];
  top_ten_talents: number[];
}

interface QolSnapshot {
  wealth_stage: number;
  health_stage: number;
  happiness_stage: number;
  love_relationships_stage: number;
  impact_stage: number;
  growth_stage: number;
  social_ties_stage: number;
  home_stage: number;
}

interface MultipleIntelligences {
  ordered_intelligences: string[];
}

interface PersonalityTests {
  enneagram?: {
    primary_type: number;
    primary_name: string;
    scores: Record<string, number>;
  };
  '16personalities'?: {
    type_code: string;
    type_name: string;
    variant: string;
    traits: Record<string, number>;
  };
  human_design?: {
    type: string;
    strategy: string;
    authority: string;
    profile: string;
  };
}

// Map domain IDs to their stage keys
const DOMAIN_TO_STAGE_KEY: Record<string, keyof QolSnapshot> = {
  wealth: 'wealth_stage',
  health: 'health_stage',
  happiness: 'happiness_stage',
  love: 'love_relationships_stage',
  impact: 'impact_stage',
  growth: 'growth_stage',
  socialTies: 'social_ties_stage',
  home: 'home_stage',
};

const CharacterSnapshot: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [zogSnapshot, setZogSnapshot] = useState<ZogSnapshot | null>(null);
  const [qolSnapshot, setQolSnapshot] = useState<QolSnapshot | null>(null);
  const [multipleIntelligences, setMultipleIntelligences] = useState<MultipleIntelligences | null>(null);
  const [personalityTests, setPersonalityTests] = useState<PersonalityTests | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    loadCharacterData();
  }, []);

  const loadCharacterData = async () => {
    setLoading(true);
    try {
      const profileId = await getOrCreateGameProfileId();
      
      // Load game profile with snapshots
      const { data: profile } = await supabase
        .from('game_profiles')
        .select('first_name, last_zog_snapshot_id, last_qol_snapshot_id, personality_tests')
        .eq('id', profileId)
        .single();

      if (profile) {
        setFirstName(profile.first_name);
        setPersonalityTests(profile.personality_tests as PersonalityTests | null);

        // Load ZoG snapshot
        if (profile.last_zog_snapshot_id) {
          const { data: zog } = await supabase
            .from('zog_snapshots')
            .select('archetype_title, core_pattern, top_three_talents, top_ten_talents')
            .eq('id', profile.last_zog_snapshot_id)
            .single();
          if (zog) {
            setZogSnapshot({
              ...zog,
              top_three_talents: zog.top_three_talents as number[],
              top_ten_talents: zog.top_ten_talents as number[],
            });
          }
        }

        // Load QoL snapshot
        if (profile.last_qol_snapshot_id) {
          const { data: qol } = await supabase
            .from('qol_snapshots')
            .select('*')
            .eq('id', profile.last_qol_snapshot_id)
            .single();
          if (qol) {
            setQolSnapshot(qol);
          }
        }
      }

      // Load Multiple Intelligences (check if user is authenticated)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: mi } = await supabase
          .from('multiple_intelligences_results')
          .select('ordered_intelligences')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (mi) {
          setMultipleIntelligences({
            ordered_intelligences: mi.ordered_intelligences as string[],
          });
        }
      }
    } catch (error) {
      console.error('Error loading character data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTalentName = (id: number) => {
    const talent = TALENTS.find(t => t.id === id);
    return talent?.name || `Talent ${id}`;
  };

  const getDomainInfo = (domainId: string, stageValue: number) => {
    const domain = DOMAINS.find(d => d.id === domainId);
    if (!domain) return { name: domainId, currentTitle: '', nextTitle: '' };
    
    const currentStage = domain.stages.find(s => s.id === stageValue);
    const nextStage = domain.stages.find(s => s.id === stageValue + 1);
    
    return {
      name: domain.name,
      currentTitle: currentStage?.title || `Stage ${stageValue}`,
      nextTitle: nextStage?.title || 'Peak',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAnyData = zogSnapshot || qolSnapshot || multipleIntelligences || personalityTests;

  // Calculate highest and lowest domains for highlighting
  const getHighlightClass = (domainId: string): string => {
    if (!qolSnapshot) return '';
    
    const stageKey = DOMAIN_TO_STAGE_KEY[domainId];
    if (!stageKey) return '';
    
    const values = Object.values(DOMAIN_TO_STAGE_KEY).map(key => qolSnapshot[key] || 0);
    const currentValue = qolSnapshot[stageKey] || 0;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    if (currentValue === minValue && minValue !== maxValue) {
      return 'shadow-[0_0_12px_rgba(239,68,68,0.5)] ring-2 ring-red-200';
    }
    if (currentValue === maxValue && minValue !== maxValue) {
      return 'shadow-[0_0_12px_rgba(34,197,94,0.5)] ring-2 ring-emerald-200';
    }
    return '';
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container max-w-4xl mx-auto px-4 py-8 pt-24">
        <Link to="/game" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Game
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {firstName ? `${firstName}'s Character` : 'Your Character'} · Full Snapshot
          </h1>
          <p className="text-muted-foreground">
            Everything we know about you in one place
          </p>
          <Button variant="ghost" size="sm" onClick={loadCharacterData} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {!hasAnyData ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">No Character Data Yet</h2>
              <p className="text-muted-foreground mb-6">
                Complete assessments to build your character profile
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/zone-of-genius')}>
                  Discover Your Genius
                </Button>
                <Button variant="outline" onClick={() => navigate('/quality-of-life-map/assessment')}>
                  Map Your Life
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Zone of Genius Section */}
            {zogSnapshot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Zone of Genius
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Archetype</p>
                    <p className="text-xl font-semibold">{zogSnapshot.archetype_title}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Core Pattern</p>
                    <p className="text-sm leading-relaxed">{zogSnapshot.core_pattern}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Top 3 Talents</p>
                    <div className="flex flex-wrap gap-2">
                      {zogSnapshot.top_three_talents.map((id) => (
                        <span key={id} className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-full text-sm">
                          {getTalentName(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Top 10 Talents</p>
                    <div className="flex flex-wrap gap-2">
                      {zogSnapshot.top_ten_talents.map((id) => (
                        <span key={id} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                          {getTalentName(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quality of Life Section - Enhanced Format */}
            {qolSnapshot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    Quality of Life Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(DOMAIN_TO_STAGE_KEY).map(([domainId, stageKey]) => {
                      const value = qolSnapshot[stageKey] || 0;
                      const info = getDomainInfo(domainId, value);
                      const highlightClass = getHighlightClass(domainId);
                      
                      return (
                        <div 
                          key={domainId} 
                          className={`p-4 bg-muted/50 rounded-lg transition-all ${highlightClass}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-foreground">{info.name}</p>
                            <p className="text-sm text-muted-foreground">{value}/10</p>
                          </div>
                          <p className="text-xs text-foreground mb-1">
                            <span className="font-medium">{info.currentTitle}</span>
                          </p>
                          {value < 10 && (
                            <p className="text-xs text-muted-foreground">
                              → growing into <span className="italic">{info.nextTitle}</span>
                            </p>
                          )}
                          <div className="w-full h-1.5 bg-muted rounded-full mt-2">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${(value / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Multiple Intelligences Section */}
            {multipleIntelligences && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Multiple Intelligences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {multipleIntelligences.ordered_intelligences.slice(0, 5).map((intel, idx) => (
                      <div key={intel} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-amber-500 text-white' :
                          idx === 1 ? 'bg-gray-300 text-gray-700' :
                          idx === 2 ? 'bg-amber-700 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={idx < 3 ? 'font-medium' : 'text-muted-foreground'}>
                          {intel}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personality Tests Section */}
            {personalityTests && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" />
                    Personality Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {personalityTests.enneagram && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Enneagram</p>
                      <p className="font-semibold">
                        Type {personalityTests.enneagram.primary_type}: {personalityTests.enneagram.primary_name}
                      </p>
                    </div>
                  )}
                  {personalityTests['16personalities'] && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">16 Personalities (MBTI)</p>
                      <p className="font-semibold">
                        {personalityTests['16personalities'].type_code} – {personalityTests['16personalities'].type_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{personalityTests['16personalities'].variant}</p>
                    </div>
                  )}
                  {personalityTests.human_design && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Human Design</p>
                      <p className="font-semibold">{personalityTests.human_design.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {personalityTests.human_design.strategy} · {personalityTests.human_design.authority}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              {!zogSnapshot && (
                <Button onClick={() => navigate('/zone-of-genius')}>
                  Discover Your Genius
                </Button>
              )}
              {!qolSnapshot && (
                <Button variant="outline" onClick={() => navigate('/quality-of-life-map/assessment')}>
                  Map Your Life
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/game')}>
                Back to Game
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CharacterSnapshot;
