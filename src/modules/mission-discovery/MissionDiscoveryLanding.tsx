import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowRight,
    Sparkles,
    Brain,
    ListChecks,
    Clipboard,
    Check,
    HelpCircle,
    BookOpen,
    Sword
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";
import type { Mission } from "@/modules/mission-discovery/types";
import { MISSION_DISCOVERY_PROMPT } from "@/prompts";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";

/**
 * Mission Discovery Landing Page
 *
 * Flow options:
 * 1. "I have clarity" → AI paste OR type manually → Match to missions
 * 2. "I need to discover" → Go to wizard
 *
 * Also handles: "Do you have an AI that knows your mission?"
 */

type Step = "clarity-check" | "has-ai" | "paste-response" | "type-manually";
type MatchContext = {
    pillar?: string;
    focusArea?: string;
    challenge?: string;
    outcome?: string;
    pillarId?: string;
};
type MatchResult = {
    mission: Mission;
    score: number;
    context: MatchContext;
    matchedKeywords?: string[];
};

const STOP_WORDS = new Set([
    "the", "and", "for", "with", "that", "this", "from", "into", "your", "you",
    "are", "was", "were", "our", "their", "them", "they", "his", "her", "she",
    "him", "its", "about", "over", "under", "here", "there", "then", "than",
    "what", "when", "where", "which", "who", "whom", "why", "how", "a", "an",
    "to", "of", "in", "on", "at", "by", "as", "or", "be", "is"
]);

const tokenize = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(token => token.length > 2 && !STOP_WORDS.has(token));

const buildMissionContext = (mission: Mission) => {
    const outcome = DESIRED_OUTCOMES.find(o => o.id === mission.outcomeId);
    const challenge = outcome ? KEY_CHALLENGES.find(c => c.id === outcome.challengeId) : undefined;
    const focusArea = challenge ? FOCUS_AREAS.find(f => f.id === challenge.focusAreaId) : undefined;
    const pillar = focusArea ? PILLARS.find(p => p.id === focusArea.pillarId) : undefined;

    return {
        pillar: pillar?.title,
        focusArea: focusArea?.title,
        challenge: challenge?.title,
        outcome: outcome?.title,
        pillarId: pillar?.id,
    };
};

// Get pillar color for UI
const getPillarColor = (pillarId?: string) => {
    const colors: Record<string, string> = {
        'meta': 'bg-purple-100 text-purple-700',
        'infra': 'bg-blue-100 text-blue-700',
        'gov': 'bg-amber-100 text-amber-700',
        'env': 'bg-emerald-100 text-emerald-700',
        'culture': 'bg-pink-100 text-pink-700',
    };
    return colors[pillarId || ''] || 'bg-muted text-foreground';
};

// Day 65 wave 9 (Sasha 2026-05-15): editorial-register tokens
// mirroring ZoneOfGeniusOverview / QoL Results (per ui_playbook.md).
// Dark ink on light glass, Cormorant for hero, Source Serif for body.
const INK = "#0a1628";
const INK_BODY = "rgba(26,30,58,0.78)";
const INK_MUTED = "rgba(26,30,58,0.55)";
const HALO_SOFT =
    "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)";

const fetchEmbeddingMatches = async (text: string): Promise<MatchResult[] | null> => {
    try {
        const { data, error } = await supabase.functions.invoke("match-missions", {
            body: { text, limit: 6 },
        });
        if (error || !data?.matches) return null;
        const matches = (data.matches as Array<{ mission_id: string; score: number }>).map((match) => {
            const mission = MISSIONS.find(m => m.id === match.mission_id);
            if (!mission) return null;
            return {
                mission,
                score: match.score,
                context: buildMissionContext(mission),
            } as MatchResult;
        }).filter(Boolean) as MatchResult[];
        return matches.length > 0 ? matches : null;
    } catch (err) {
        return null;
    }
};

const MissionDiscoveryLanding = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/me";

    const [step, setStep] = useState<Step>("clarity-check");
    const [aiResponse, setAiResponse] = useState("");
    const [manualMission, setManualMission] = useState("");
    const [isMatching, setIsMatching] = useState(false);
    const [copied, setCopied] = useState(false);
    const [matches, setMatches] = useState<MatchResult[] | null>(null);

    // Excalibur state
    const [excaliburData, setExcaliburData] = useState<any>(null);
    const [isLoadingExcalibur, setIsLoadingExcalibur] = useState(true);
    const [isMatchingFromExcalibur, setIsMatchingFromExcalibur] = useState(false);

    // Load Excalibur on mount
    useEffect(() => {
        const loadExcalibur = async () => {
            try {
                const profileId = await getOrCreateGameProfileId();
                const { data: profile } = await supabase
                    .from('game_profiles')
                    .select('last_zog_snapshot_id')
                    .eq('id', profileId)
                    .single();

                if (profile?.last_zog_snapshot_id) {
                    const { data: zog } = await supabase
                        .from('zog_snapshots')
                        .select('excalibur_data')
                        .eq('id', profile.last_zog_snapshot_id)
                        .single();

                    if (zog?.excalibur_data) {
                        setExcaliburData(zog.excalibur_data);
                    }
                }
            } catch (err) {
                console.error('Failed to load excalibur:', err);
            } finally {
                setIsLoadingExcalibur(false);
            }
        };
        loadExcalibur();
    }, []);

    // Match missions from Excalibur
    const handleMatchFromExcalibur = async () => {
        if (!excaliburData) return;
        setIsMatchingFromExcalibur(true);
        setMatches(null);

        try {
            // Send Excalibur + first 200 missions to AI
            const missionsForMatching = MISSIONS.slice(0, 200).map(m => ({
                id: m.id,
                title: m.title,
                statement: m.statement
            }));

            const { data, error } = await supabase.functions.invoke('match-mission-to-excalibur', {
                body: { excalibur: excaliburData, missions: missionsForMatching }
            });

            if (error) throw error;

            if (data?.matches && Array.isArray(data.matches)) {
                const results: MatchResult[] = data.matches.map((match: any) => {
                    const mission = MISSIONS.find(m => m.id === match.missionId);
                    if (!mission) return null;
                    return {
                        mission,
                        score: match.resonanceScore || 5,
                        context: buildMissionContext(mission),
                        matchedKeywords: [match.reason]
                    };
                }).filter(Boolean) as MatchResult[];

                setMatches(results.length > 0 ? results : []);
            }
        } catch (err) {
            console.error('Excalibur matching failed:', err);
            setMatches([]);
        } finally {
            setIsMatchingFromExcalibur(false);
        }
    };

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(MISSION_DISCOVERY_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMatchMission = async () => {
        setIsMatching(true);
        const textToMatch = step === "paste-response" ? aiResponse : manualMission;
        setMatches(null);

        const embeddingMatches = await fetchEmbeddingMatches(textToMatch);
        if (embeddingMatches) {
            setIsMatching(false);
            setMatches(embeddingMatches);
            return;
        }

        const tokens = tokenize(textToMatch);
        const tokenSet = new Set(tokens);
        const scored = MISSIONS.map((mission) => {
            const corpus = `${mission.title} ${mission.statement}`;
            const missionTokens = tokenize(corpus);
            const overlap = missionTokens.reduce((count, token) => count + (tokenSet.has(token) ? 1 : 0), 0);
            return {
                mission,
                score: overlap,
                context: buildMissionContext(mission),
            };
        })
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 6);

        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsMatching(false);

        setMatches(scored.length > 0 ? scored : []);
    };

    const handleGoToWizard = () => {
        navigate(`/mission-discovery/wizard?from=game&return=${encodeURIComponent(returnPath)}`);
    };

    // Direct commit - goes to wizard with directCommit flag
    const handleCommitMission = (mission: Mission) => {
        navigate(`/mission-discovery/wizard?from=game&return=${encodeURIComponent(returnPath)}&missionId=${mission.id}&directCommit=true`);
    };

    // Learn more - opens wizard in read-only mode
    const handleLearnMore = (mission: Mission) => {
        navigate(`/mission-discovery/wizard?from=game&return=${encodeURIComponent(returnPath)}&missionId=${mission.id}&readOnly=true`);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 sm:py-12">
            {/* Hero — Day 65 wave 9: editorial register mirroring
                ZoneOfGeniusOverview. Cormorant headline + Source Serif
                subtitle on dark-ink/halo treatment for legibility over
                the shell's video backdrop. Glass-strong card on hero
                only; secondary content uses liquid-glass. */}
            <section className="text-center mb-10 sm:mb-12">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full liquid-glass mb-5">
                    <Sparkles className="w-7 h-7" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                </div>
                <h1
                    className="leading-[1.1] tracking-[-0.01em] mb-3"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 700,
                        fontSize: "clamp(2rem, 5vw, 2.75rem)",
                        color: INK,
                        textShadow: HALO_SOFT,
                    }}
                >
                    Mission Discovery
                </h1>
                <p
                    className="italic leading-relaxed mx-auto max-w-[40ch]"
                    style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontWeight: 300,
                        fontSize: "clamp(1rem, 2vw, 1.18rem)",
                        color: INK_BODY,
                    }}
                >
                    Find your contribution to the planet.
                </p>
            </section>

                {/* Step: Matches */}
                {matches && matches.length > 0 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-foreground">Top mission matches</h2>
                            <p className="text-base text-muted-foreground">Choose a mission that resonates with you.</p>
                        </div>
                        <div className="space-y-4">
                            {matches.map(match => (
                                <div key={match.mission.id} className="liquid-glass rounded-2xl p-5 sm:p-6 hover:translate-y-[-1px] transition-all duration-300">
                                    <div className="mb-4">
                                        {/* Pillar + Focus Area pills */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {match.context.pillar && (
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPillarColor(match.context.pillarId)}`}>
                                                    {match.context.pillar}
                                                </span>
                                            )}
                                            {match.context.focusArea && (
                                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                                    {match.context.focusArea}
                                                </span>
                                            )}
                                        </div>
                                        {/* Title */}
                                        <h3 className="text-lg font-semibold text-foreground mb-1">{match.mission.title}</h3>
                                        {/* Statement (only if different from title) */}
                                        {match.mission.statement !== match.mission.title && (
                                            <p className="text-sm text-muted-foreground">{match.mission.statement}</p>
                                        )}
                                        {/* Challenge + Outcome context */}
                                        {(match.context.challenge || match.context.outcome) && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {[match.context.challenge, match.context.outcome].filter(Boolean).join(' → ')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Two buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            onClick={() => handleCommitMission(match.mission)}
                                            className="flex-1 ring-2 ring-emerald-400/50 ring-offset-2 bg-emerald-600 hover:bg-emerald-700"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            Commit and Add to my profile
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleLearnMore(match.mission)}
                                            className="flex-1"
                                        >
                                            <BookOpen className="w-4 h-4 mr-2" />
                                            Learn more about this mission
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" onClick={() => setMatches(null)}>Back</Button>
                            <Button onClick={handleGoToWizard}>Open full wizard</Button>
                        </div>
                    </div>
                )}

                {matches && matches.length === 0 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-foreground">No strong matches yet</h2>
                            <p className="text-sm text-muted-foreground">Try adding more detail or use the full wizard.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <Button variant="outline" onClick={() => setMatches(null)}>Back</Button>
                            <Button onClick={handleGoToWizard}>Open full wizard</Button>
                        </div>
                    </div>
                )}

                {/* Step: Clarity Check */}
                {step === "clarity-check" && !matches && (
                    <div className="space-y-4">
                        <p
                            className="text-center mb-6 italic leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 300,
                                fontSize: "clamp(1rem, 2vw, 1.18rem)",
                                color: INK_BODY,
                            }}
                        >
                            Do you already have clarity on your mission or purpose?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Option: Suggest from Excalibur */}
                            {excaliburData && (
                                <button
                                    onClick={handleMatchFromExcalibur}
                                    disabled={isMatchingFromExcalibur}
                                    className="liquid-glass-strong p-6 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-1px] hover:scale-[1.005] active:scale-[0.99] disabled:opacity-60 disabled:cursor-wait sm:col-span-2"
                                    style={{ border: "1px solid rgba(212, 175, 55, 0.32)" }}
                                >
                                    <div className="flex items-center gap-3">
                                        {isMatchingFromExcalibur ? (
                                            <span className="premium-spinner w-6 h-6" />
                                        ) : (
                                            <Sword className="w-6 h-6" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                                        )}
                                        <div>
                                            <h3
                                                className="mb-1"
                                                style={{
                                                    fontFamily: "'Cormorant Garamond', serif",
                                                    fontWeight: 600,
                                                    fontSize: "1.25rem",
                                                    color: INK,
                                                }}
                                            >
                                                {isMatchingFromExcalibur ? 'Finding your missions…' : 'Suggest from my Excalibur'}
                                            </h3>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    fontFamily: "'Source Serif 4', Georgia, serif",
                                                    fontWeight: 300,
                                                    color: INK_BODY,
                                                }}
                                            >
                                                AI will match your Unique Offer to the most aligned missions.
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={() => setStep("has-ai")}
                                className="liquid-glass p-6 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-1px] hover:scale-[1.005] active:scale-[0.99]"
                            >
                                <Check className="w-6 h-6 mb-3" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                                <h3
                                    className="mb-1"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 600,
                                        fontSize: "1.18rem",
                                        color: INK,
                                    }}
                                >
                                    Yes, I have clarity
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        fontFamily: "'Source Serif 4', Georgia, serif",
                                        fontWeight: 300,
                                        color: INK_BODY,
                                    }}
                                >
                                    I know what I'm here to do.
                                </p>
                            </button>

                            <button
                                onClick={handleGoToWizard}
                                className="liquid-glass p-6 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-1px] hover:scale-[1.005] active:scale-[0.99]"
                            >
                                <HelpCircle className="w-6 h-6 mb-3" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                                <h3
                                    className="mb-1"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 600,
                                        fontSize: "1.18rem",
                                        color: INK,
                                    }}
                                >
                                    I need to discover it
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        fontFamily: "'Source Serif 4', Georgia, serif",
                                        fontWeight: 300,
                                        color: INK_BODY,
                                    }}
                                >
                                    Take me through the wizard.
                                </p>
                            </button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground mt-6">
                            You can add more missions later — start with the one you're most excited about!
                        </p>
                    </div>
                )}

                {/* Step: Has AI */}
                {step === "has-ai" && !matches && (
                    <div className="space-y-4">
                        <p
                            className="text-center mb-6 italic leading-relaxed mx-auto max-w-[40ch]"
                            style={{
                                fontFamily: "'Source Serif 4', Georgia, serif",
                                fontWeight: 300,
                                fontSize: "clamp(1rem, 1.6vw, 1.1rem)",
                                color: INK_BODY,
                            }}
                        >
                            Do you have an AI model (ChatGPT, Claude, etc.) that you've discussed your mission with?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => setStep("paste-response")}
                                className="liquid-glass p-6 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-1px] hover:scale-[1.005] active:scale-[0.99]"
                            >
                                <Brain className="w-6 h-6 mb-3" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                                <h3
                                    className="mb-1"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 600,
                                        fontSize: "1.18rem",
                                        color: INK,
                                    }}
                                >
                                    Yes, I have an AI
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        fontFamily: "'Source Serif 4', Georgia, serif",
                                        fontWeight: 300,
                                        color: INK_BODY,
                                    }}
                                >
                                    I'll paste its response.
                                </p>
                            </button>

                            <button
                                onClick={() => setStep("type-manually")}
                                className="liquid-glass p-6 rounded-2xl text-left transition-all duration-300 hover:translate-y-[-1px] hover:scale-[1.005] active:scale-[0.99]"
                            >
                                <ListChecks className="w-6 h-6 mb-3" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
                                <h3
                                    className="mb-1"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontWeight: 600,
                                        fontSize: "1.18rem",
                                        color: INK,
                                    }}
                                >
                                    No, I'll type it
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        fontFamily: "'Source Serif 4', Georgia, serif",
                                        fontWeight: 300,
                                        color: INK_BODY,
                                    }}
                                >
                                    Write my mission manually.
                                </p>
                            </button>
                        </div>

                        <button
                            onClick={() => setStep("clarity-check")}
                            className="w-full text-sm mt-4 transition-colors"
                            style={{ color: INK_MUTED }}
                        >
                            ← Go back
                        </button>
                    </div>
                )}

                {/* Step: Paste AI Response */}
                {step === "paste-response" && !matches && (
                    <div className="space-y-6">
                        <div className="bg-muted/40 rounded-xl p-4 border border-border">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-foreground text-sm">Prompt for your AI</h3>
                                    <p className="text-xs text-muted-foreground">Copy this and ask your AI model</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopyPrompt}
                                    className="shrink-0"
                                >
                                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Clipboard className="w-4 h-4 mr-1" />}
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                            </div>
                            <pre className="text-xs whitespace-pre-wrap bg-white p-3 rounded-lg border border-border/10 max-h-32 overflow-y-auto prompt-barely-visible">
                                {MISSION_DISCOVERY_PROMPT}
                            </pre>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Paste AI's response here
                            </label>
                            <Textarea
                                value={aiResponse}
                                onChange={(e) => setAiResponse(e.target.value)}
                                placeholder="Paste the AI's response about your mission..."
                                className="min-h-[200px]"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep("has-ai")}
                            >
                                ← Back
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleMatchMission}
                                disabled={!aiResponse.trim() || isMatching}
                            >
                                {isMatching ? "Matching..." : "Find Matching Missions"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step: Type Manually */}
                {step === "type-manually" && !matches && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Describe your mission
                            </label>
                            <Textarea
                                value={manualMission}
                                onChange={(e) => setManualMission(e.target.value)}
                                placeholder="What is your contribution to the planet? What change do you want to create?"
                                className="min-h-[200px]"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                                Be specific about the problems you want to solve and the impact you want to have.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep("has-ai")}
                            >
                                ← Back
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleMatchMission}
                                disabled={!manualMission.trim() || isMatching}
                            >
                                {isMatching ? "Matching..." : "Find Matching Missions"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleGoToWizard}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Or take the guided wizard instead →
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default MissionDiscoveryLanding;
