import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreateGameProfileId } from '@/lib/gameProfile';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Target, Brain, Heart, User, RefreshCw } from 'lucide-react';
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useLocalizedTalents } from '@/modules/zone-of-genius/talents';
import { useLocalizedDomains } from '@/modules/quality-of-life-map/qolConfig';
import BackButton from '@/components/BackButton';

interface ZogSnapshot {
  archetype_title: string;
  core_pattern: string;
  top_three_talents: number[];
  top_ten_talents: number[];
  mastery_action: string | null;
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
    definition?: string;
    incarnation_cross?: string;
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
  const { t } = useTranslation();
  const localizedDomains = useLocalizedDomains();
  const localizedTalents = useLocalizedTalents();
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
            .select('archetype_title, core_pattern, top_three_talents, top_ten_talents, mastery_action')
            .eq('id', profile.last_zog_snapshot_id)
            .single();
          if (zog) {
            setZogSnapshot({
              ...zog,
              top_three_talents: zog.top_three_talents as number[],
              top_ten_talents: zog.top_ten_talents as number[],
              mastery_action: zog.mastery_action,
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
    } finally {
      setLoading(false);
    }
  };

  const getTalentName = (id: number) => {
    const talent = localizedTalents.find(t => t.id === id);
    return talent?.name || t('characterSnapshot.talentFallback', { id });
  };

  const getDomainInfo = (domainId: string, stageValue: number) => {
    const domain = localizedDomains.find(d => d.id === domainId);
    if (!domain) return { name: domainId, currentTitle: '', nextTitle: '' };

    const currentStage = domain.stages.find(s => s.id === stageValue);
    const nextStage = domain.stages.find(s => s.id === stageValue + 1);

    return {
      name: domain.name,
      currentTitle: currentStage?.title || t('characterSnapshot.stageFallback', { stage: stageValue }),
      nextTitle: nextStage?.title || t('characterSnapshot.peakFallback'),
    };
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <PremiumLoader size="lg" />
      </div>
    );
  }

  const hasAnyData = zogSnapshot || qolSnapshot || multipleIntelligences || personalityTests;

  // Calculate highest and lowest domains for highlighting
  const getDomainStyles = (domainId: string): { className: string; label: string | null; tone: 'low' | 'high' | null } => {
    if (!qolSnapshot) return { className: '', label: null, tone: null };

    const stageKey = DOMAIN_TO_STAGE_KEY[domainId];
    if (!stageKey) return { className: '', label: null, tone: null };

    const values = Object.values(DOMAIN_TO_STAGE_KEY).map(key => qolSnapshot[key] || 0);
    const currentValue = qolSnapshot[stageKey] || 0;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    if (currentValue === minValue && minValue !== maxValue) {
      return {
        className: 'bg-red-50 border-red-200',
        label: t('characterSnapshot.domainNeedsAttention'),
        tone: 'low'
      };
    }
    if (currentValue === maxValue && minValue !== maxValue) {
      return {
        className: 'bg-emerald-50 border-emerald-200',
        label: t('characterSnapshot.domainStrength'),
        tone: 'high'
      };
    }
    return { className: 'bg-muted/50 border-transparent', label: null, tone: null };
  };

  return (
    <div className="min-h-dvh">
      <Navigation />

      <main className="container max-w-4xl mx-auto px-4 py-8 pt-24">
        <BackButton
          to="/game"
          label={t('characterSnapshot.backToGame')}
          className="text-muted-foreground hover:text-foreground mb-6"
        />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {firstName
              ? t('characterSnapshot.titleNamed', { name: firstName })
              : t('characterSnapshot.titleGeneric')}
          </h1>
          <p className="text-muted-foreground">
            {t('characterSnapshot.subtitle')}
          </p>
          <Button variant="ghost" size="sm" onClick={loadCharacterData} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('characterSnapshot.refresh')}
          </Button>
        </div>

        {!hasAnyData ? (
          <Card className="text-center py-12">
            <CardContent>
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">{t('characterSnapshot.emptyTitle')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('characterSnapshot.emptyBody')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/zone-of-genius')}>
                  {t('characterSnapshot.discoverGenius')}
                </Button>
                <Button variant="outline" onClick={() => navigate('/quality-of-life-map/assessment')}>
                  {t('characterSnapshot.mapYourLife')}
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
                    {t('characterSnapshot.zoneOfGenius')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs uppercase  text-muted-foreground mb-1">{t('characterSnapshot.archetype')}</p>
                    <p className="text-xl font-semibold">{zogSnapshot.archetype_title}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase  text-muted-foreground mb-1">{t('characterSnapshot.corePattern')}</p>
                    <p className="text-sm leading-relaxed">{zogSnapshot.core_pattern}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase  text-muted-foreground mb-2">{t('characterSnapshot.topThreeTalents')}</p>
                    <div className="flex flex-wrap gap-2">
                      {zogSnapshot.top_three_talents.map((id) => (
                        <span key={id} className="px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-full text-sm">
                          {getTalentName(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase  text-muted-foreground mb-2">{t('characterSnapshot.topTenTalents')}</p>
                    <div className="flex flex-wrap gap-2">
                      {zogSnapshot.top_ten_talents.map((id) => (
                        <span key={id} className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                          {getTalentName(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                  {zogSnapshot.mastery_action && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-xs uppercase  text-amber-700 mb-1">{t('characterSnapshot.masteryAction')}</p>
                      <p className="text-sm font-medium text-amber-900">{zogSnapshot.mastery_action}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quality of Life Section - Enhanced Format */}
            {qolSnapshot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-500" />
                    {t('characterSnapshot.qualityOfLifeMap')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(DOMAIN_TO_STAGE_KEY).map(([domainId, stageKey]) => {
                      const value = qolSnapshot[stageKey] || 0;
                      const info = getDomainInfo(domainId, value);
                      const { className, label, tone } = getDomainStyles(domainId);

                      return (
                        <div
                          key={domainId}
                          className={`p-4 rounded-lg border transition-all ${className}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-foreground">{info.name}</p>
                            <p className="text-sm text-muted-foreground">{value}/10</p>
                          </div>
                          <p className="text-sm text-foreground font-medium mb-1">
                            {info.currentTitle}
                          </p>
                          {value < 10 && (
                            <p className="text-xs text-muted-foreground">
                              {t('characterSnapshot.growingIntoBefore')}<span className="italic">{info.nextTitle}</span>
                            </p>
                          )}
                          {label && (
                            <p className={`text-xs mt-2 font-medium ${tone === 'low' ? 'text-red-600' : 'text-emerald-600'}`}>
                              {label}
                            </p>
                          )}
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
                    {t('characterSnapshot.multipleIntelligences')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {multipleIntelligences.ordered_intelligences.slice(0, 5).map((intel, idx) => (
                      <div key={intel} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-amber-500 text-white' :
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
                    {t('characterSnapshot.personalityTests')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {personalityTests.enneagram && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs uppercase  text-muted-foreground mb-1">{t('characterSnapshot.enneagram')}</p>
                      <p className="font-semibold mb-3">
                        {t('characterSnapshot.enneagramType', {
                          type: personalityTests.enneagram.primary_type,
                          name: personalityTests.enneagram.primary_name,
                        })}
                      </p>
                      {personalityTests.enneagram.scores && (
                        <div className="space-y-1.5">
                          {Object.entries(personalityTests.enneagram.scores)
                            .map(([key, value]) => ({
                              type: parseInt(key.replace('type_', '')),
                              score: value as number
                            }))
                            .sort((a, b) => b.score - a.score)
                            .map(({ type, score }) => (
                              <div key={type} className="flex items-center gap-2 text-xs">
                                <span className="w-14 text-muted-foreground">{t('characterSnapshot.typeShort', { type })}</span>
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${(score / 30) * 100}%` }} />
                                </div>
                                <span className="w-6 text-right text-foreground">{score}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                  {personalityTests['16personalities'] && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs uppercase  text-muted-foreground mb-1">{t('characterSnapshot.sixteenPersonalities')}</p>
                      <p className="font-semibold">
                        {personalityTests['16personalities'].type_code} – {personalityTests['16personalities'].type_name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">{personalityTests['16personalities'].variant}</p>
                      {personalityTests['16personalities'].traits && (
                        <div className="space-y-1.5">
                          {Object.entries(personalityTests['16personalities'].traits).map(([trait, value]) => (
                            <div key={trait} className="flex items-center gap-2 text-xs">
                              <span className="w-20 text-muted-foreground capitalize">{trait}</span>
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${value as number}%` }} />
                              </div>
                              <span className="w-10 text-right text-foreground">{value as number}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {personalityTests.human_design && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs uppercase  text-muted-foreground mb-2">{t('characterSnapshot.humanDesign')}</p>
                      <p className="font-semibold text-lg mb-3">{personalityTests.human_design.type}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded bg-background border">
                          <p className="text-[10px] uppercase  text-muted-foreground">{t('characterSnapshot.hdStrategy')}</p>
                          <p className="text-sm font-medium">{personalityTests.human_design.strategy}</p>
                        </div>
                        <div className="p-2 rounded bg-background border">
                          <p className="text-[10px] uppercase  text-muted-foreground">{t('characterSnapshot.hdAuthority')}</p>
                          <p className="text-sm font-medium">{personalityTests.human_design.authority}</p>
                        </div>
                        <div className="p-2 rounded bg-background border">
                          <p className="text-[10px] uppercase  text-muted-foreground">{t('characterSnapshot.hdProfile')}</p>
                          <p className="text-sm font-medium">{personalityTests.human_design.profile}</p>
                        </div>
                        {personalityTests.human_design.definition && (
                          <div className="p-2 rounded bg-background border">
                            <p className="text-[10px] uppercase  text-muted-foreground">{t('characterSnapshot.hdDefinition')}</p>
                            <p className="text-sm font-medium">{personalityTests.human_design.definition}</p>
                          </div>
                        )}
                        {personalityTests.human_design.incarnation_cross && (
                          <div className="p-2 rounded bg-background border col-span-2">
                            <p className="text-[10px] uppercase  text-muted-foreground">{t('characterSnapshot.hdIncarnationCross')}</p>
                            <p className="text-sm font-medium">{personalityTests.human_design.incarnation_cross}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              {!zogSnapshot && (
                <Button onClick={() => navigate('/zone-of-genius')}>
                  {t('characterSnapshot.discoverGenius')}
                </Button>
              )}
              {!qolSnapshot && (
                <Button variant="outline" onClick={() => navigate('/quality-of-life-map/assessment')}>
                  {t('characterSnapshot.mapYourLife')}
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/game')}>
                {t('characterSnapshot.backToGameButton')}
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
