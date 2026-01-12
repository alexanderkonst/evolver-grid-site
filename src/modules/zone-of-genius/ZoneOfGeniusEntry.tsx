import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, Copy, Check, Sparkles, Bot, ClipboardList, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GameShell from "@/components/game/GameShell";
import { ZONE_OF_GENIUS_PROMPT } from "@/prompts";
import { generateAppleseed, AppleseedData } from "./appleseedGenerator";
import { generateExcalibur, ExcaliburData } from "./excaliburGenerator";
import { saveAppleseed, saveExcalibur, loadSavedData } from "./saveToDatabase";
import AppleseedDisplay from "./AppleseedDisplay";
import AppleseedRitualLoading from "./AppleseedRitualLoading";
import ExcaliburDisplay from "./ExcaliburDisplay";
import { useToast } from "@/hooks/use-toast";
import { getFirstTimeActionLabel } from "@/lib/xpService";
import { getPostZogRedirect } from "@/lib/onboardingRouting";

type Step =
    | "choice"
    | "ai-prompt"
    | "paste-response"
    | "generating-appleseed"
    | "appleseed-result"
    | "generating-excalibur"
    | "excalibur-result";

const ZoneOfGeniusEntry = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    const returnPath = searchParams.get("return") || "/game/profile";

    const [step, setStep] = useState<Step>("choice");
    const [aiResponse, setAiResponse] = useState("");
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Generated data
    const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
    const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);

    const navBar = (
        <div className="flex items-center justify-between gap-2 px-4 lg:px-8 pt-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(returnPath)}
                className="text-slate-600 hover:text-slate-900"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/game/profile")}
                className="text-slate-600 hover:text-slate-900"
            >
                Profile
            </Button>
        </div>
    );

    // Load saved data on mount
    useEffect(() => {
        const loadExisting = async () => {
            const { appleseed: savedAppleseed, excalibur: savedExcalibur } = await loadSavedData();
            if (savedAppleseed) {
                setAppleseed(savedAppleseed);
                if (savedExcalibur) {
                    setExcalibur(savedExcalibur);
                    setStep("excalibur-result");
                } else {
                    setStep("appleseed-result");
                }
            }
        };
        loadExisting();
    }, []);

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(ZONE_OF_GENIUS_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStartManualAssessment = () => {
        navigate(`/zone-of-genius/assessment?return=${encodeURIComponent(returnPath)}`);
    };

    const handleGenerateAppleseed = async () => {
        if (!aiResponse.trim()) return;

        setIsProcessing(true);
        setError(null);
        setStep("generating-appleseed");

        try {
            // Generate Appleseed from raw AI response
            const result = await generateAppleseed(aiResponse);
            setAppleseed(result);
            setStep("appleseed-result");
        } catch (err) {
            setError('Failed to generate your Appleseed. Please try again.');
            setStep("paste-response");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveAppleseed = async () => {
        if (!appleseed) return;

        setIsSaving(true);
        try {
            const result = await saveAppleseed(appleseed, aiResponse);
            if (result.success) {
                toast({
                    title: "Zone of Genius Saved!",
                    description: "Your genius profile has been saved.",
                });
                if (result.xpAwarded) {
                    toast({
                        title: `🎉 +${result.xpAwarded} XP (Genius)`,
                        description: "Your profile leveled up.",
                    });
                }
                if (result.firstTimeBonus) {
                    toast({
                        title: "🎉 FIRST TIME BONUS!",
                        description: `+${result.firstTimeBonus} XP for your first ${getFirstTimeActionLabel("first_zog_complete")}!`,
                    });
                }
                const redirectPath = getPostZogRedirect(returnPath);
                if (redirectPath) {
                    setTimeout(() => navigate(redirectPath), 600);
                }
            } else {
                toast({
                    title: "Save Failed",
                    description: result.error || "Could not save your profile.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Something went wrong while saving.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerateExcalibur = async () => {
        if (!appleseed) return;

        setIsProcessing(true);
        setError(null);
        setStep("generating-excalibur");

        try {
            const result = await generateExcalibur(appleseed);
            setExcalibur(result);
            setStep("excalibur-result");
        } catch (err) {
            setError('Failed to generate your Excalibur. Please try again.');
            toast({
                title: "Generation Failed",
                description: err instanceof Error ? err.message : "Please try again.",
                variant: "destructive",
            });
            setStep("appleseed-result");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveExcalibur = async () => {
        if (!excalibur) return;

        setIsSaving(true);
        try {
            const result = await saveExcalibur(excalibur);
            if (result.success) {
                toast({
                    title: "Unique Offer Saved!",
                    description: "Your genius offer has been saved.",
                });
                if (result.xpAwarded) {
                    toast({
                        title: `🎉 +${result.xpAwarded} XP (Genius)`,
                        description: "Your profile leveled up.",
                    });
                }
                if (result.firstTimeBonus) {
                    toast({
                        title: "🎉 FIRST TIME BONUS!",
                        description: `+${result.firstTimeBonus} XP for your first ${getFirstTimeActionLabel("first_genius_offer")}!`,
                    });
                }
                // Navigate back to profile after short delay
                setTimeout(() => navigate(returnPath), 1000);
            } else {
                toast({
                    title: "Save Failed",
                    description: result.error || "Could not save your offer.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: "Error",
                description: "Something went wrong while saving.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Step: Generating Appleseed (Ritual Loading)
    if (step === "generating-appleseed") {
        return (
            <GameShell>
                {navBar}
                <AppleseedRitualLoading minDuration={4000} />
            </GameShell>
        );
    }

    // Step: Appleseed Result
    if (step === "appleseed-result" && appleseed) {
        return (
            <GameShell>
                <div className="pb-8">
                    {navBar}
                    <AppleseedDisplay appleseed={appleseed} onSave={handleSaveAppleseed} />

                    {/* Excalibur CTA */}
                    <div className="max-w-3xl mx-auto px-4 lg:px-8 mt-8">
                        <div className="p-6 bg-violet-50 rounded-2xl border border-violet-200 text-center">
                            <Sword className="w-10 h-10 text-violet-500 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Now that you know WHO you are...
                            </h3>
                            <p className="text-slate-600 mb-4">
                                Want to discover WHAT you can offer the world?
                            </p>
                            <Button
                                onClick={handleGenerateExcalibur}
                                disabled={isProcessing}
                                className="bg-violet-500 hover:from-violet-600 hover:to-purple-600"
                                type="button"
                            >
                                <Sword className="w-4 h-4 mr-2" />
                                Create My Unique Offer
                            </Button>
                            {error && (
                                <div className="mt-4 text-sm text-red-600">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </GameShell>
        );
    }

    // Step: Generating Excalibur
    if (step === "generating-excalibur") {
        return (
            <GameShell>
                {navBar}
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-2 border-violet-200 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                        <div className="absolute inset-4 border-2 border-violet-300 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                        <div className="absolute inset-8 border-2 border-violet-400 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                        <div className="absolute inset-12 bg-violet-200 rounded-full animate-pulse flex items-center justify-center">
                            <Sword className="w-6 h-6 text-violet-600" />
                        </div>
                    </div>
                    <p className="text-lg text-slate-600 animate-pulse">
                        Creating your unique offer...
                    </p>
                    <p className="mt-4 text-sm text-slate-400">
                        One clear offer, one path forward...
                    </p>
                </div>
            </GameShell>
        );
    }

    // Step: Excalibur Result
    if (step === "excalibur-result" && excalibur) {
        return (
            <GameShell>
                <div className="pb-8">
                    {navBar}
                    <ExcaliburDisplay excalibur={excalibur} onSave={handleSaveExcalibur} />
                </div>
            </GameShell>
        );
    }

    return (
        <GameShell>
            <div className="p-4 lg:p-8 max-w-xl mx-auto">
                {navBar}
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-4">
                        <Sparkles className="w-7 h-7 text-amber-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Zone of Genius</h1>
                    <p className="text-slate-600 mt-1">Discover who you are at your best</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

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
                            className="w-full bg-amber-500 hover:from-amber-600 hover:to-orange-600"
                            size="lg"
                            onClick={handleGenerateAppleseed}
                            disabled={!aiResponse.trim() || isProcessing}
                        >
                            {isProcessing ? "Generating..." : "Discover My Zone of Genius"}
                            <Sparkles className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        </GameShell>
    );
};

export default ZoneOfGeniusEntry;
