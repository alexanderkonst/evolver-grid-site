import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowRight,
    Sparkles,
    Brain,
    ListChecks,
    Clipboard,
    Check,
    HelpCircle
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

/**
 * Mission Discovery Landing Page
 * 
 * Flow options:
 * 1. "I have clarity" → AI paste OR type manually → Match to missions
 * 2. "I need to discover" → Go to wizard
 * 
 * Also handles: "Do you have an AI that knows your mission?"
 */

const AI_PROMPT = `Based on everything you know about me from our conversations, please summarize my life mission or contribution to the world.

Please organize my mission(s) in a HOLONIC structure:

1. **Higher-Level Organizing Mission** (1 paragraph)
   What is my overarching mission or purpose? This is the "meta-mission" that encompasses everything I care about.

2. **Key Nested Missions** (2-4 bullets)
   What are the distinct key missions that nest within this higher-level mission? Each should be specific enough to stand on its own, yet clearly part of the larger whole.

For each mission, be specific about:
- The domain (environment, governance, education, health, technology, consciousness, etc.)
- The change I want to create
- The unique perspective or skills I bring

Note: I'm using your response to match myself to a mission taxonomy in a personal development tool. Missions can always be refined — this is a starting point, not a final commitment.`;


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
    return colors[pillarId || ''] || 'bg-slate-100 text-slate-700';
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
        console.error("Mission match error:", err);
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

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(AI_PROMPT);
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

    const handleOpenWizardForMission = (mission: Mission) => {
        navigate(`/mission-discovery/wizard?from=game&return=${encodeURIComponent(returnPath)}&missionId=${mission.id}`);
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                        <Sparkles className="w-8 h-8 text-slate-700" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Mission Discovery</h1>
                    <p className="text-slate-600">Find your contribution to the planet</p>
                </div>

                {/* Step: Matches */}
                {matches && matches.length > 0 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-slate-900">Top mission matches</h2>
                            <p className="text-sm text-slate-600">Pick one to jump into the wizard with it pre-selected.</p>
                        </div>
                        <div className="space-y-3">
                            {matches.map(match => (
                                <div key={match.mission.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            {/* Pillar + Focus Area pills */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {match.context.pillar && (
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPillarColor(match.context.pillarId)}`}>
                                                        {match.context.pillar}
                                                    </span>
                                                )}
                                                {match.context.focusArea && (
                                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                                        {match.context.focusArea}
                                                    </span>
                                                )}
                                            </div>
                                            {/* Title */}
                                            <h3 className="text-base font-semibold text-slate-900">{match.mission.title}</h3>
                                            {/* Statement (only if different from title) */}
                                            {match.mission.statement !== match.mission.title && (
                                                <p className="text-sm text-slate-600 mt-1">{match.mission.statement}</p>
                                            )}
                                            {/* Challenge + Outcome context */}
                                            {(match.context.challenge || match.context.outcome) && (
                                                <p className="text-xs text-slate-500 mt-2">
                                                    {[match.context.challenge, match.context.outcome].filter(Boolean).join(' → ')}
                                                </p>
                                            )}
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleOpenWizardForMission(match.mission)}>
                                            Choose
                                            <ArrowRight className="w-4 h-4 ml-2" />
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
                            <h2 className="text-xl font-semibold text-slate-900">No strong matches yet</h2>
                            <p className="text-sm text-slate-600">Try adding more detail or use the full wizard.</p>
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
                        <p className="text-center text-slate-700 mb-6">
                            Do you already have clarity on your mission or purpose?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => setStep("has-ai")}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                            >
                                <Check className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-slate-900 mb-1">Yes, I have clarity</h3>
                                <p className="text-sm text-slate-500">I know what I'm here to do</p>
                            </button>

                            <button
                                onClick={handleGoToWizard}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                            >
                                <HelpCircle className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-slate-900 mb-1">I need to discover it</h3>
                                <p className="text-sm text-slate-500">Take me through the wizard</p>
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-400 mt-6">
                            You can add more missions later — start with the one you're most excited about!
                        </p>
                    </div>
                )}

                {/* Step: Has AI */}
                {step === "has-ai" && !matches && (
                    <div className="space-y-4">
                        <p className="text-center text-slate-700 mb-6">
                            Do you have an AI model (ChatGPT, Claude, etc.) that you've discussed your mission with?
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <button
                                onClick={() => setStep("paste-response")}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                            >
                                <Brain className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-slate-900 mb-1">Yes, I have an AI</h3>
                                <p className="text-sm text-slate-500">I'll paste its response</p>
                            </button>

                            <button
                                onClick={() => setStep("type-manually")}
                                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                            >
                                <ListChecks className="w-6 h-6 text-blue-500 mb-3" />
                                <h3 className="font-semibold text-slate-900 mb-1">No, I'll type it</h3>
                                <p className="text-sm text-slate-500">Write my mission manually</p>
                            </button>
                        </div>

                        <button
                            onClick={() => setStep("clarity-check")}
                            className="w-full text-sm text-slate-500 hover:text-slate-700 mt-4"
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
                                    <h3 className="font-semibold text-slate-900 text-sm">Prompt for your AI</h3>
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
                            <pre className="text-xs text-slate-600 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100 max-h-32 overflow-y-auto">
                                {AI_PROMPT}
                            </pre>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">
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
                                className="text-sm text-slate-500 hover:text-slate-700"
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
