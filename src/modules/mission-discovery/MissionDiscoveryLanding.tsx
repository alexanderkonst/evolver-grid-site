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
    return colors[pillarId || ''] || 'bg-slate-100 text-[#2c3150]';
};

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
    const returnPath = searchParams.get("return") || "/game/profile";

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
        <div className="min-h-dvh bg-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                        <Sparkles className="w-8 h-8 text-[#2c3150]" />
                    </div>
                    <h1 className="text-4xl font-bold text-[#2c3150] mb-3">Mission Discovery</h1>
                    <p className="text-lg text-[rgba(44,49,80,0.7)]">Find your contribution to the planet</p>
                </div>

                {/* Step: Matches */}
                {matches && matches.length > 0 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-semibold text-[#2c3150]">Top mission matches</h2>
                            <p className="text-base text-[rgba(44,49,80,0.7)]">Choose a mission that resonates with you.</p>
                        </div>
                        <div className="space-y-4">
                            {matches.map(match => (
                                <div key={match.mission.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors">
                                    <div className="mb-4">
                                        {/* Pillar + Focus Area pills */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {match.context.pillar && (
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPillarColor(match.context.pillarId)}`}>
                                                    {match.context.pillar}
                                                </span>
                                            )}
                                            {match.context.focusArea && (
                                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-[rgba(44,49,80,0.7)]">
                                                    {match.context.focusArea}
                                                </span>
                                            )}
                                        </div>
                                        {/* Title */}
                                        <h3 className="text-lg font-semibold text-[#2c3150] mb-1">{match.mission.title}</h3>
                                        {/* Statement (only if different from title) */}
                                        {match.mission.statement !== match.mission.title && (
                                            <p className="text-sm text-[rgba(44,49,80,0.7)]">{match.mission.statement}</p>
                                        )}
                                        {/* Challenge + Outcome context */}
                                        {(match.context.challenge || match.context.outcome) && (
                                            <p className="text-xs text-slate-500 mt-2">
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
                            <h2 className="text-xl font-semibold text-[#2c3150]">No strong matches yet</h2>
                            <p className="text-sm text-[rgba(44,49,80,0.7)]">Try adding more detail or use the full wizard.</p>
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
                        <p className="text-center text-lg text-[#2c3150] mb-6">
                            Do you already have clarity on your mission or purpose?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Option: Suggest from Excalibur */}
                            {excaliburData && (
                                <button
                                    onClick={handleMatchFromExcalibur}
                                    disabled={isMatchingFromExcalibur}
                                    className="p-6 rounded-xl border-2 border-amber-300 bg-amber-50 hover:border-amber-500 transition-colors text-left group sm:col-span-2"
                                >
                                    <div className="flex items-center gap-3">
                                        {isMatchingFromExcalibur ? (
                                            <span className="premium-spinner w-6 h-6" />
                                        ) : (
                                            <Sword className="w-6 h-6 text-amber-600" />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-[#2c3150] mb-1">
                                                {isMatchingFromExcalibur ? 'Finding your missions...' : 'Suggest from my Excalibur'}
                                            </h3>
                                            <p className="text-sm text-[rgba(44,49,80,0.7)]">
                                                AI will match your Unique Offer to the most aligned missions
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={() => setStep("has-ai")}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                            >
                                <Check className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-[#2c3150] mb-1">Yes, I have clarity</h3>
                                <p className="text-sm text-slate-500">I know what I'm here to do</p>
                            </button>

                            <button
                                onClick={handleGoToWizard}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                            >
                                <HelpCircle className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-[#2c3150] mb-1">I need to discover it</h3>
                                <p className="text-sm text-slate-500">Take me through the wizard</p>
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-500 mt-6">
                            You can add more missions later — start with the one you're most excited about!
                        </p>
                    </div>
                )}

                {/* Step: Has AI */}
                {step === "has-ai" && !matches && (
                    <div className="space-y-4">
                        <p className="text-center text-[#2c3150] mb-6">
                            Do you have an AI model (ChatGPT, Claude, etc.) that you've discussed your mission with?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => setStep("paste-response")}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                            >
                                <Brain className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-[#2c3150] mb-1">Yes, I have an AI</h3>
                                <p className="text-sm text-slate-500">I'll paste its response</p>
                            </button>

                            <button
                                onClick={() => setStep("type-manually")}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                            >
                                <ListChecks className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-[#2c3150] mb-1">No, I'll type it</h3>
                                <p className="text-sm text-slate-500">Write my mission manually</p>
                            </button>
                        </div>

                        <button
                            onClick={() => setStep("clarity-check")}
                            className="w-full text-sm text-slate-500 hover:text-[#2c3150] mt-4"
                        >
                            ← Go back
                        </button>
                    </div>
                )}

                {/* Step: Paste AI Response */}
                {step === "paste-response" && !matches && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-[#2c3150] text-sm">Prompt for your AI</h3>
                                    <p className="text-xs text-slate-500">Copy this and ask your AI model</p>
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
                            <pre className="text-xs whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100 max-h-32 overflow-y-auto prompt-barely-visible">
                                {MISSION_DISCOVERY_PROMPT}
                            </pre>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#2c3150] mb-2">
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
                            <label className="block text-sm font-medium text-[#2c3150] mb-2">
                                Describe your mission
                            </label>
                            <Textarea
                                value={manualMission}
                                onChange={(e) => setManualMission(e.target.value)}
                                placeholder="What is your contribution to the planet? What change do you want to create?"
                                className="min-h-[200px]"
                            />
                            <p className="text-xs text-slate-500 mt-2">
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
                                className="text-sm text-slate-500 hover:text-[#2c3150]"
                            >
                                Or take the guided wizard instead →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MissionDiscoveryLanding;
