import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Copy, Check, Sparkles, Bot, ClipboardList, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/ui/PremiumButton";
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
    | "choice-route"
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
    const returnPath = searchParams.get("return") || "/game/next-move";

    const [step, setStep] = useState<Step>("choice");
    const [aiResponse, setAiResponse] = useState("");
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [profileId, setProfileId] = useState<string | null>(null);

    const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
    const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);
    const hasSavedAppleseed = useRef(false);
    const stepContentRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to step content when step changes
    useEffect(() => {
        if (step !== 'choice') {
            const timer = setTimeout(() => {
                stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [step]);

    // Guest/Auth state
    const [isGuest, setIsGuest] = useState(true);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Removed navBar for cleaner onboarding flow

    // Helper to validate if Excalibur has real content (not just placeholder)
    const hasValidExcaliburData = (exc: ExcaliburData | null): boolean => {
        if (!exc) return false;
        // Check if core fields have real content
        const hasOffer = exc.offer?.statement && exc.offer.statement.length > 20;
        const hasIdentity = exc.businessIdentity?.name && exc.businessIdentity.name.length > 3;
        const hasClient = exc.idealClient?.profile && exc.idealClient.profile.length > 10;
        return !!(hasOffer && hasIdentity && hasClient);
    };

    // Load saved data on mount
    useEffect(() => {
        const loadExisting = async () => {
            // When in onboarding flow (/start), always start fresh from "choice"
            // Don't auto-restore saved data or redirect
            const isInOnboarding = returnPath === "/start" || returnPath.includes("/start");
            if (isInOnboarding) {
                // User is doing fresh onboarding, start from choice screen
                return;
            }

            // Check if user is intentionally visiting to redo
            const urlParams = new URLSearchParams(window.location.search);
            const isRedoing = urlParams.get("redo") === "true";
            const hasReturnParam = urlParams.has("return");

            // If doing a redo, clear localStorage to start fresh
            if (isRedoing) {
                localStorage.removeItem("guest_excalibur_data");
                localStorage.removeItem("guest_appleseed_data");
                localStorage.removeItem("guest_ai_response");
                return; // Start fresh from choice
            }

            const { appleseed: savedAppleseed, excalibur: savedExcalibur } = await loadSavedData();

            // If user has complete Excalibur data AND came from another page, redirect to profile
            if (savedExcalibur && hasValidExcaliburData(savedExcalibur) && hasReturnParam) {
                navigate("/game/me");
                return;
            }

            // Only auto-restore saved data if user came from another page (has return param)
            // Direct visits should stay on choice screen so user can redo if they want
            if (savedAppleseed && hasReturnParam) {
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
    }, [navigate, returnPath]);

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

    // Auto-save appleseed for auth users (silent)
    useEffect(() => {
        if (step === "appleseed-result" && appleseed && !isGuest && !hasSavedAppleseed.current) {
            hasSavedAppleseed.current = true;
            (async () => {
                try {
                    await saveAppleseed(appleseed, aiResponse);
                    setIsSaved(true);
                    console.log("[ZoneOfGeniusEntry] Auto-saved appleseed for auth user");
                } catch (err) {
                    console.error("[ZoneOfGeniusEntry] Auto-save failed:", err);
                }
            })();
        }
    }, [step, appleseed, isGuest, aiResponse]);

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
                if (redirectPath && returnPath !== "/game/me") {
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
                    isSaved={isSaved}
                    onSave={handleSaveClick}
                    isSaving={isSaving}
                />
            </GameShellV2>
        );
    }

    // Step: Generating Excalibur
    if (step === "generating-excalibur") {
        return (
            <GameShellV2 hideNavigation>
                <div className="min-h-dvh flex flex-col items-center justify-center p-8">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-2 border-[#a4a3d0]/30 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                        <div className="absolute inset-4 border-2 border-[#8460ea]/30 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                        <div className="absolute inset-8 border-2 border-[#8460ea]/50 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                        <div className="absolute inset-12 bg-gradient-to-br from-[#a4a3d0]/20 to-[#8460ea]/15 rounded-full animate-pulse flex items-center justify-center backdrop-blur-sm">
                            <Sword className="w-6 h-6 text-[#8460ea]" />
                        </div>
                    </div>
                    <p className="text-lg text-[#2c3150]/60 animate-pulse">
                        Creating your unique offer...
                    </p>
                    <p className="mt-4 text-sm text-[#2c3150]/40">
                        One clear offer, one path forward...
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs mt-6">
                        <div className="h-1.5 bg-[#a4a3d0]/15 rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-[#8460ea]/60 to-[#6894d0]/40 rounded-full"
                                style={{
                                    animation: 'progress-bar 3s ease-in-out infinite',
                                    width: '100%',
                                }}
                            />
                        </div>
                        <style>{`
                            @keyframes progress-bar {
                                0% { width: 10%; }
                                50% { width: 80%; }
                                100% { width: 10%; }
                            }
                        `}</style>
                    </div>
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
                    onLaunchProductBuilder={() => navigate("/product-builder")}
                    showProductBuilderButton={true}
                />
            </GameShellV2>
        );
    }

    return (
        <GameShellV2 hideNavigation>
            {/* Attached Gradient Background Override */}
            <div className="fixed inset-0 z-0 bg-[#0a0a1a]">
                <img 
                    src="/gradient.jpg" 
                    alt="" 
                    className="w-full h-full object-cover" 
                    aria-hidden="true"
                />
                {/* Dark overlay to ensure white text remains legible */}
                <div className="absolute inset-0 bg-[#0a0a1a]/65 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 p-5 lg:p-10 pt-16 lg:pt-20 max-w-lg mx-auto min-h-dvh flex flex-col justify-center">

                {/* Header — Godfather "front door" */}
                <div className="text-center mb-10">
                    {/* Dodecahedron — breathing icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full overflow-hidden mb-6 ring-1 ring-white/10 breathing-card">
                        <img src="/dodecahedron.png" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                    </div>

                    {/* Headline — CAPS */}
                    <h1
                        className="text-xl lg:text-2xl font-semibold font-display text-white leading-[1.35] max-w-lg mx-auto mb-8 uppercase tracking-[0.04em]"
                        style={{
                            textShadow: '0 0 30px rgba(255,255,255,0.15), 0 0 60px rgba(132,96,234,0.1)',
                        }}
                    >
                        Why is it still so hard to{' '}
                        <span style={{ textShadow: '0 0 25px rgba(240,194,127,0.5), 0 0 50px rgba(240,194,127,0.25)' }}>explain what you do</span>
                        {' '}<span className="text-white/60">—</span>{' '}
                        and turn it into something people{' '}
                        <span style={{ textShadow: '0 0 25px rgba(240,194,127,0.5), 0 0 50px rgba(240,194,127,0.25)' }}>actually pay for</span>?
                    </h1>

                    {/* Separator */}
                    <div className="w-12 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto mb-8" />

                    {/* Three short truths */}
                    <div className="space-y-3 max-w-sm mx-auto">
                        <p className="text-sm text-white leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif", textShadow: '0 0 20px rgba(240,194,127,0.2)' }}>
                            There's a <span style={{ textShadow: '0 0 18px rgba(240,194,127,0.5), 0 0 35px rgba(240,194,127,0.2)' }}>unique way</span> you think and solve problems.
                        </p>
                        <p className="text-sm text-white leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif", textShadow: '0 0 20px rgba(240,194,127,0.2)' }}>
                            People <span style={{ textShadow: '0 0 18px rgba(240,194,127,0.5), 0 0 35px rgba(240,194,127,0.2)' }}>already come to you</span> for it.
                        </p>
                        <p className="text-sm text-white/85 italic leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif", textShadow: '0 0 20px rgba(240,194,127,0.2)' }}>
                            It just hasn't been <span style={{ textShadow: '0 0 18px rgba(240,194,127,0.5), 0 0 35px rgba(240,194,127,0.2)' }}>structured</span> into something they can quickly <span style={{ textShadow: '0 0 18px rgba(240,194,127,0.5), 0 0 35px rgba(240,194,127,0.2)' }}>say yes</span> to.
                        </p>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 liquid-glass rounded-xl text-red-300 text-sm border border-red-500/20">
                        {error}
                    </div>
                )}

                {/* Step: Choice */}
                {step === "choice" && (
                    <div ref={stepContentRef} className="space-y-6 animate-in fade-in duration-500">
                        {/* Primary CTA — breathing alive feel */}
                        <div className="text-center">
                            <button
                                className="w-full max-w-md mx-auto liquid-glass-strong rounded-2xl px-10 py-6
                                           text-white font-bold text-lg tracking-wide
                                           ring-1 ring-white/25
                                           shadow-[0_0_40px_rgba(240,194,127,0.2),0_0_80px_rgba(132,96,234,0.15)]
                                           hover:shadow-[0_0_60px_rgba(240,194,127,0.35),0_0_100px_rgba(132,96,234,0.25)]
                                           hover:scale-[1.03] active:scale-95
                                           transition-all duration-300 ease-out
                                           flex items-center justify-center gap-4
                                           alive-card"
                                style={{ textShadow: '0 0 20px rgba(240,194,127,0.3)' }}
                                onClick={() => setStep("choice-route")}
                            >
                                Reveal the unique way I naturally create value
                                <ArrowRight className="w-5 h-5 opacity-80" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Route Selection */}
                {step === "choice-route" && (
                    <div ref={stepContentRef} className="space-y-8 animate-in fade-in duration-500">
                        <div className="text-center">
                            <h2 className="text-xl font-light text-white/80 tracking-wide" style={{ fontFamily: "'Source Serif 4', serif" }}>
                                How do you want to reveal it?
                            </h2>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setStep("ai-prompt")}
                                className="w-full p-6 rounded-2xl liquid-glass
                                           ring-1 ring-white/10
                                           hover:ring-[#8460ea]/40
                                           hover:shadow-[0_0_30px_rgba(132,96,234,0.15)]
                                           transition-all duration-300 
                                           text-left flex items-start gap-4 group
                                           hover:scale-[1.015] active:scale-[0.985]
                                           animate-in fade-in slide-in-from-bottom-2 duration-400"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-[#8460ea]/15 shrink-0
                                                    group-hover:bg-[#8460ea]/25 transition-colors duration-300">
                                        <Bot className="w-5 h-5 text-[#8460ea]" />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-white/90 group-hover:text-white transition-colors tracking-wide">
                                            🤖 Faster (1 min)
                                        </p>
                                        <p className="text-xs text-white/35 mt-1 leading-relaxed">Ask your AI & paste its response → get your pattern instantly</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={handleStartManualAssessment}
                                className="w-full p-6 rounded-2xl liquid-glass
                                           ring-1 ring-white/10
                                           hover:ring-[#6894d0]/40
                                           hover:shadow-[0_0_30px_rgba(104,148,208,0.15)]
                                           transition-all duration-300 
                                           text-left flex items-start gap-4 group
                                           hover:scale-[1.015] active:scale-[0.985]
                                           animate-in fade-in slide-in-from-bottom-2 duration-400"
                                style={{ animationDelay: '100ms' }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full bg-[#6894d0]/15 shrink-0
                                                    group-hover:bg-[#6894d0]/25 transition-colors duration-300">
                                        <ClipboardList className="w-5 h-5 text-[#6894d0]" />
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-white/90 group-hover:text-white transition-colors tracking-wide">
                                            📋 Guided (10–15 min)
                                        </p>
                                        <p className="text-xs text-white/35 mt-1 leading-relaxed">Assessment of your top talents</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: AI Prompt */}
                {step === "ai-prompt" && (
                    <div ref={stepContentRef} className="space-y-6 animate-in fade-in duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-light text-white/80 tracking-wide" style={{ fontFamily: "'Source Serif 4', serif" }}>
                                Copy this prompt into your AI
                            </h2>
                            <p className="text-xs text-white/30">ChatGPT, Claude, Gemini — any will work</p>
                        </div>

                        <div className="relative rounded-2xl liquid-glass ring-1 ring-white/10">
                            <pre className="text-[11px] whitespace-pre-wrap font-mono leading-snug max-h-36 overflow-y-auto p-4 pr-16 text-white/15 selection:bg-[#8460ea]/20">
                                {ZONE_OF_GENIUS_PROMPT}
                            </pre>
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-3 right-3 bg-white/5 backdrop-blur-sm border-white/15 text-white/70 hover:bg-white/10 hover:text-white shadow-sm text-xs rounded-lg"
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

                        <button
                            className="w-full max-w-md mx-auto liquid-glass-strong rounded-2xl px-10 py-6
                                       text-white font-bold text-lg tracking-wide
                                       ring-1 ring-white/25
                                       shadow-[0_0_40px_rgba(240,194,127,0.2),0_0_80px_rgba(132,96,234,0.15)]
                                       hover:shadow-[0_0_60px_rgba(240,194,127,0.35),0_0_100px_rgba(132,96,234,0.25)]
                                       hover:scale-[1.03] active:scale-95
                                       transition-all duration-300 ease-out
                                       flex items-center justify-center gap-4
                                       alive-card"
                            style={{ textShadow: '0 0 20px rgba(240,194,127,0.3)' }}
                            onClick={() => setStep("paste-response")}
                        >
                            I've got my AI's response
                            <ArrowRight className="w-5 h-5 opacity-80" />
                        </button>

                        <div className="text-center pt-2">
                            <button
                                onClick={handleStartManualAssessment}
                                className="text-[11px] text-white/60 hover:text-white/90 transition-colors duration-300 tracking-wide"
                            >
                                I'll do the guided assessment instead →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Paste Response */}
                {step === "paste-response" && (
                    <div ref={stepContentRef} className="space-y-6 animate-in fade-in duration-500">
                        <div className="text-center space-y-2">
                            <h2 className="text-lg font-light text-white/80 tracking-wide" style={{ fontFamily: "'Source Serif 4', serif" }}>
                                Paste your AI's response
                            </h2>
                            <p className="text-xs text-white/30">The full response — we'll extract your pattern from it</p>
                        </div>

                        <Textarea
                            value={aiResponse}
                            onChange={(e) => setAiResponse(e.target.value)}
                            placeholder="Paste your AI's response here..."
                            className="min-h-[200px] font-mono text-sm rounded-2xl bg-white/[0.03] backdrop-blur-sm border-white/10 focus:border-[#8460ea]/30 focus:ring-1 focus:ring-[#8460ea]/20 text-white/80 placeholder:text-white/15 transition-all duration-300"
                        />

                        <button
                            className={`w-full max-w-md mx-auto liquid-glass-strong rounded-2xl px-10 py-6
                                       text-white font-bold text-lg tracking-wide
                                       ring-1 ring-white/25
                                       shadow-[0_0_40px_rgba(240,194,127,0.2),0_0_80px_rgba(132,96,234,0.15)]
                                       hover:shadow-[0_0_60px_rgba(240,194,127,0.35),0_0_100px_rgba(132,96,234,0.25)]
                                       hover:scale-[1.03] active:scale-95
                                       transition-all duration-300 ease-out
                                       disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none
                                       flex items-center justify-center gap-4
                                       ${aiResponse.trim() ? 'alive-card' : ''}`}
                            style={{ textShadow: '0 0 20px rgba(240,194,127,0.3)' }}
                            onClick={handleGenerateAppleseed}
                            disabled={isProcessing || !aiResponse.trim()}
                        >
                            {isProcessing ? "Discovering..." : "Discover My Zone of Genius"}
                            <Sparkles className="w-5 h-5 opacity-80" />
                        </button>
                    </div>
                )}
            </div>

            {/* Signup Modal */}
            <SignupModal
                open={showSignupModal}
                onOpenChange={setShowSignupModal}
                onSuccess={handleSignupSuccess}
            />
        </GameShellV2>
    );

};

export default ZoneOfGeniusEntry;
