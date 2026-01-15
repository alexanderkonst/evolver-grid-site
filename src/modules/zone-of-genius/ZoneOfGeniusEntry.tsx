import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Copy, Check, Sparkles, Bot, ClipboardList, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GameShellV2 from "@/components/game/GameShellV2";
import { ZONE_OF_GENIUS_PROMPT } from "@/prompts";
import { generateAppleseed, AppleseedData } from "./appleseedGenerator";
import { generateExcalibur, ExcaliburData } from "./excaliburGenerator";
import { saveAppleseed, saveExcalibur, loadSavedData, saveAppleseedToLocalStorage } from "./saveToDatabase";
import AppleseedDisplay from "./AppleseedDisplay";
import AppleseedRitualLoading from "./AppleseedRitualLoading";
import ExcaliburDisplay from "./ExcaliburDisplay";
import SignupModal from "@/components/auth/SignupModal";
import { useToast } from "@/hooks/use-toast";
import { getFirstTimeActionLabel } from "@/lib/xpService";
import { getPostZogRedirect } from "@/lib/onboardingRouting";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { supabase } from "@/integrations/supabase/client";

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
    const [profileId, setProfileId] = useState<string | null>(null);

    // Generated data
    const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
    const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);
    const hasSavedAppleseed = useRef(false);

    // Guest/Auth state
    const [isGuest, setIsGuest] = useState(true);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Removed navBar for cleaner onboarding flow

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

    useEffect(() => {
        let isMounted = true;
        getOrCreateGameProfileId()
            .then((id) => {
                if (isMounted) setProfileId(id);
            })
            .catch(() => undefined);
        return () => {
            isMounted = false;
        };
    }, []);

    // Check if user is guest (no session)
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsGuest(!session?.user);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setIsGuest(!session?.user);
        });
        return () => subscription.unsubscribe();
    }, []);

    // No auto-save - user must click "Save My Genius" button

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

            // Auto-save to localStorage for guests (will be migrated after signup)
            saveAppleseedToLocalStorage(result, aiResponse);

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
                setIsSaved(true);
                // No toast - user proceeds to signup silently
                const redirectPath = getPostZogRedirect(returnPath);
                if (redirectPath && returnPath !== "/game/profile") {
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

    // Handle Save click - show modal for guests, save directly for authenticated
    const handleSaveClick = () => {
        if (isGuest) {
            setShowSignupModal(true);
        } else {
            handleSaveAppleseed();
        }
    };

    // After successful signup, save the appleseed
    const handleSignupSuccess = async () => {
        setIsGuest(false);
        await handleSaveAppleseed();
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
            <GameShellV2 hideNavigation>
                <AppleseedRitualLoading minDuration={4000} />
            </GameShellV2>
        );
    }

    // Step: Appleseed Result
    if (step === "appleseed-result" && appleseed) {
        return (
            <GameShellV2 hideNavigation>
                <AppleseedDisplay
                    appleseed={appleseed}
                    profileId={profileId ?? undefined}
                    onSaveGenius={handleSaveAppleseed}
                    onCreateBusiness={() => setStep("generating-excalibur")}
                    isSaving={isSaving}
                    isSaved={isSaved}
                    isGuest={isGuest}
                />
            </GameShellV2>
        );
    }

    // Step: Generating Excalibur
    if (step === "generating-excalibur") {
        return (
            <GameShellV2 hideNavigation>

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
                    <p className="mt-4 text-sm text-slate-500">
                        One clear offer, one path forward...
                    </p>
                </div>
            </GameShellV2>
        );
    }

    // Step: Excalibur Result
    if (step === "excalibur-result" && excalibur) {
        return (
            <GameShellV2 hideNavigation>
                <ExcaliburDisplay
                    excalibur={excalibur}
                    profileId={profileId ?? undefined}
                    onSaveToProfile={handleSaveExcalibur}
                    isSaving={isSaving}
                />
            </GameShellV2>
        );
    }

    return (
        <GameShellV2 hideNavigation>
            <div className="p-4 lg:p-8 max-w-xl mx-auto">

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
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setStep("ai-prompt")}
                                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-amber-300 bg-white transition-all text-left flex items-start gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-amber-100 shrink-0">
                                        <Bot className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="font-semibold text-slate-900">Yes, my AI knows me</p>
                                </div>
                            </button>

                            <button
                                onClick={handleStartManualAssessment}
                                className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 bg-white transition-all text-left flex items-start gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-blue-100 shrink-0">
                                        <ClipboardList className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <p className="font-semibold text-slate-900">No, I'll do the assessment</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: AI Prompt */}
                {step === "ai-prompt" && (
                    <div className="space-y-4">
                        <div className="text-center">
                            <h2 className="text-base font-semibold text-slate-900">
                                Copy this prompt into your AI
                            </h2>
                        </div>

                        <div className="relative rounded-xl border border-slate-200 bg-slate-50">
                            <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-snug max-h-40 overflow-y-auto p-3 pr-16">
                                {ZONE_OF_GENIUS_PROMPT}
                            </pre>
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2 bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 shadow-sm text-xs"
                                onClick={handleCopyPrompt}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3 mr-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3 mr-1" />
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
                                className="text-xs text-slate-500 hover:text-slate-700"
                            >
                                Nevermind, I'll do the assessment →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Paste Response */}
                {step === "paste-response" && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold text-slate-900">
                                Paste your AI's response
                            </h2>
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
        </GameShellV2>
    );
};

export default ZoneOfGeniusEntry;
