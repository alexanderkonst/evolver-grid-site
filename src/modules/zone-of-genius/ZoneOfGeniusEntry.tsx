import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Copy, Check, Sparkles, Bot, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GameShell from "@/components/game/GameShell";
import { ZONE_OF_GENIUS_PROMPT } from "@/prompts";

type Step = "choice" | "ai-prompt" | "paste-response";

const ZoneOfGeniusEntry = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/profile";

    const [step, setStep] = useState<Step>("choice");
    const [aiResponse, setAiResponse] = useState("");
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(ZONE_OF_GENIUS_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStartManualAssessment = () => {
        navigate(`/zone-of-genius/assessment?return=${encodeURIComponent(returnPath)}`);
    };

    const handleProcessAiResponse = async () => {
        if (!aiResponse.trim()) return;

        setIsProcessing(true);

        // TODO: Parse the AI response and create a ZoG snapshot
        // For now, we'll just save the raw response and redirect
        // This would need to be integrated with the snapshot generation

        try {
            // Store the AI response in session/local storage for the generation step
            sessionStorage.setItem('zog_ai_response', aiResponse);

            // Navigate to snapshot generation with AI flag
            navigate(`/zone-of-genius/assessment/step-4?from=ai&return=${encodeURIComponent(returnPath)}`);
        } catch (error) {
            console.error('Error processing AI response:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <GameShell>
            <div className="p-4 lg:p-8 max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-4">
                        <Sparkles className="w-7 h-7 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Zone of Genius</h1>
                    <p className="text-slate-600 mt-1">Discover who you are at your best</p>
                </div>

                {/* Step: Choice */}
                {step === "choice" && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                Do you have an AI that knows you?
                            </h2>
                            <p className="text-sm text-slate-600">
                                If you've been using ChatGPT, Claude, or another AI and it knows your background and work,
                                we can skip the assessment and generate your profile directly.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setStep("ai-prompt")}
                                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-amber-300 bg-white transition-all text-left flex items-start gap-4"
                            >
                                <div className="p-2 rounded-full bg-amber-100 shrink-0">
                                    <Bot className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Yes, my AI knows me</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        I'll give you a prompt to run. Takes ~2 minutes.
                                    </p>
                                </div>
                            </button>

                            <button
                                onClick={handleStartManualAssessment}
                                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 bg-white transition-all text-left flex items-start gap-4"
                            >
                                <div className="p-2 rounded-full bg-blue-100 shrink-0">
                                    <ClipboardList className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">No, I'll do the assessment</p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Select your talents step by step. Takes ~5 minutes.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: AI Prompt */}
                {step === "ai-prompt" && (
                    <div className="space-y-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep("choice")}
                            className="mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                Copy this prompt to your AI
                            </h2>
                            <p className="text-sm text-slate-600">
                                Paste it into ChatGPT, Claude, or your preferred AI assistant.
                            </p>
                        </div>

                        <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                                {ZONE_OF_GENIUS_PROMPT}
                            </pre>
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={handleCopyPrompt}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setStep("paste-response")}
                        >
                            I've got my AI's response
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>

                        <div className="text-center">
                            <button
                                onClick={handleStartManualAssessment}
                                className="text-sm text-slate-500 hover:text-slate-700"
                            >
                                Or do the assessment manually →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Paste Response */}
                {step === "paste-response" && (
                    <div className="space-y-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep("ai-prompt")}
                            className="mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>

                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                Paste your AI's response
                            </h2>
                            <p className="text-sm text-slate-600">
                                Copy the entire response from your AI and paste it below.
                            </p>
                        </div>

                        <Textarea
                            value={aiResponse}
                            onChange={(e) => setAiResponse(e.target.value)}
                            placeholder="Paste your AI's response here..."
                            className="min-h-[200px] font-mono text-sm"
                        />

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleProcessAiResponse}
                            disabled={!aiResponse.trim() || isProcessing}
                        >
                            {isProcessing ? "Processing..." : "Generate My Snapshot"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        </GameShell>
    );
};

export default ZoneOfGeniusEntry;
