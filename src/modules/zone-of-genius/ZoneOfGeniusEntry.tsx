import { useState, useEffect, useRef } from "react";
import { trackPageView, trackFunnelEvent } from "@/lib/funnelAnalytics";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
import { saveResonanceRating } from "@/lib/saveResonanceRating";
import { supabase } from "@/integrations/supabase/client";
import Hls from "hls.js";

const HLS_VIDEO_URL = "https://stream.mux.com/8DFxbzBL8jIJYpaZv3s6kDx4AfPkVI1gH4bBh38GNw8.m3u8";

const HlsBackground = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls({ autoStartLoad: true });
            hls.loadSource(HLS_VIDEO_URL);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => { video.play().catch(() => {}); });
            return () => hls.destroy();
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = HLS_VIDEO_URL;
            video.addEventListener("loadedmetadata", () => { video.play().catch(() => {}); });
        }
    }, []);

    return (
        <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            aria-hidden="true"
        />
    );
};
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
    const location = useLocation();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();

    // Show the full platform shell everywhere (Sasha, 2026-04-21): the ZoG
    // reveal module now lives inside the JOURNEY shell regardless of route.
    // `isInPlatform` is kept as a read-only flag in case other branches need it.
    const isInPlatform = location.pathname.startsWith("/game/journey");
    const hideNav = false;
    const returnPath = searchParams.get("return") || "/";

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

    // Anonymous-claim banner state: when a guest comes from the landing-page
    // "Claim your gift" CTA, Auth.tsx stashes their email in sessionStorage
    // under this key. As soon as the Appleseed result is ready, we POST it to
    // the save-anonymous-zog edge function so the magic-link claim on
    // /auth/callback can pick it up. Status drives the in-page banner.
    const PENDING_CLAIM_EMAIL_KEY = "pending_claim_email";
    const [anonymousSave, setAnonymousSave] = useState<{
        status: "idle" | "sending" | "sent" | "error";
        email?: string;
    }>({ status: "idle" });
    const hasPostedAnonymous = useRef(false);

    // Track page view on mount
    useEffect(() => {
        trackPageView('zog_entry');
    }, []);

    // Auto-scroll to step content when step changes + track funnel transitions
    useEffect(() => {
        if (step !== 'choice') {
            const timer = setTimeout(() => {
                stepContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 150);
            // Track step transitions
            const stepMap: Record<string, any> = {
                'choice-route': 'zog_choice_route',
                'ai-prompt': 'zog_ai_prompt',
                'paste-response': 'zog_paste',
                'appleseed-result': 'zog_result',
            };
            if (stepMap[step]) trackFunnelEvent({ step: stepMap[step] });
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
                navigate("/");
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

    // Anonymous claim: if a guest arrived from /auth?claim=true (pending email
    // in sessionStorage), POST the result to save-anonymous-zog so the magic-
    // link sign-in on /auth/callback can attach it to the new user. Guests
    // without a pending email keep the existing localStorage-only path.
    useEffect(() => {
        if (step !== "appleseed-result" || !appleseed) return;
        if (!isGuest) return;
        if (hasPostedAnonymous.current) return;
        if (typeof window === "undefined") return;

        const pendingEmail = window.sessionStorage.getItem(PENDING_CLAIM_EMAIL_KEY);
        if (!pendingEmail) return;

        hasPostedAnonymous.current = true;
        setAnonymousSave({ status: "sending", email: pendingEmail });

        (async () => {
            try {
                const { data, error } = await supabase.functions.invoke("save-anonymous-zog", {
                    body: {
                        email: pendingEmail,
                        result_payload: appleseed,
                        assessment_version: "v1",
                    },
                });
                if (error || !(data as { ok?: boolean } | null)?.ok) {
                    console.error("[ZoneOfGeniusEntry] save-anonymous-zog failed", error, data);
                    setAnonymousSave({ status: "error", email: pendingEmail });
                    hasPostedAnonymous.current = false; // allow retry on next render
                    return;
                }
                setAnonymousSave({ status: "sent", email: pendingEmail });
            } catch (err) {
                console.error("[ZoneOfGeniusEntry] save-anonymous-zog threw", err);
                setAnonymousSave({ status: "error", email: pendingEmail });
                hasPostedAnonymous.current = false;
            }
        })();
    }, [step, appleseed, isGuest]);

    const handleRedoClaimEmail = () => {
        if (typeof window !== "undefined") {
            window.sessionStorage.removeItem(PENDING_CLAIM_EMAIL_KEY);
        }
        hasPostedAnonymous.current = false;
        setAnonymousSave({ status: "idle" });
        navigate("/auth?claim=true&next=/zone-of-genius");
    };

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(ZONE_OF_GENIUS_PROMPT);
        setCopied(true);
        trackFunnelEvent({ step: 'zog_copy_prompt' });
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
            const errorMsg = err instanceof Error ? err.message : 'Something went wrong';
            setError(errorMsg.includes('try again') 
              ? errorMsg 
              : 'Something went wrong generating your profile. Please try again — it usually works on retry.');
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
            <GameShellV2 hideNavigation={hideNav} hideLogo>
                <AppleseedRitualLoading minDuration={4000} />
            </GameShellV2>
        );
    }

    // Step: Appleseed Result
    if (step === "appleseed-result" && appleseed) {
        return (
            <GameShellV2 hideNavigation={hideNav} hideLogo>
                {anonymousSave.status !== "idle" && (
                    <div className="w-full max-w-3xl mx-auto px-5 pt-4">
                        {anonymousSave.status === "sending" && (
                            <div
                                className="rounded-xl bg-[#8460ea]/10 border border-[#8460ea]/20 px-5 py-4 text-sm"
                                style={{ color: "var(--skin-text-primary, #2c3150)" }}
                            >
                                Saving your result to <strong>{anonymousSave.email}</strong>…
                            </div>
                        )}
                        {anonymousSave.status === "sent" && (
                            <div
                                className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4 text-sm"
                                style={{ color: "var(--skin-text-primary, #2c3150)" }}
                            >
                                <p className="font-medium">
                                    Result saved. Check your email — the magic link unlocks your full playbook.
                                </p>
                                <p
                                    className="mt-1"
                                    style={{ color: "var(--skin-text-muted, #4a4a6d)" }}
                                >
                                    Sent to <strong>{anonymousSave.email}</strong>.{" "}
                                    <button
                                        type="button"
                                        onClick={handleRedoClaimEmail}
                                        className="underline text-[#8460ea] hover:text-[#6894d0]"
                                    >
                                        Wrong email? Redo
                                    </button>
                                </p>
                            </div>
                        )}
                        {anonymousSave.status === "error" && (
                            <div
                                className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-sm"
                                style={{ color: "var(--skin-text-primary, #2c3150)" }}
                            >
                                <p>
                                    We couldn't save your result to <strong>{anonymousSave.email}</strong>.{" "}
                                    <button
                                        type="button"
                                        onClick={handleRedoClaimEmail}
                                        className="underline text-[#8460ea] hover:text-[#6894d0]"
                                    >
                                        Try a different email
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                )}
                <AppleseedDisplay
                    appleseed={appleseed}
                    profileId={profileId ?? undefined}
                    isSaved={isSaved}
                    onSave={handleSaveClick}
                    isSaving={isSaving}
                    onResonanceRating={(rating) =>
                        saveResonanceRating(profileId, "appleseed", rating)
                    }
                />
            </GameShellV2>
        );
    }

    // Step: Generating Excalibur
    if (step === "generating-excalibur") {
        return (
            <GameShellV2 hideNavigation={hideNav} hideLogo>
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
            <GameShellV2 hideNavigation={hideNav} hideLogo>
                <ExcaliburDisplay
                    excalibur={excalibur}
                    profileId={profileId ?? undefined}
                    onSaveToProfile={handleSaveExcalibur}
                    isSaving={isSaving}
                    onResonanceRating={(rating) =>
                        saveResonanceRating(profileId, "excalibur", rating)
                    }
                    onLaunchProductBuilder={() => navigate("/product-builder")}
                    showProductBuilderButton={true}
                />
            </GameShellV2>
        );
    }

    return (
        <GameShellV2 hideNavigation={hideNav} hideLogo>
            {/*
              HLS video background only renders when we're NOT inside the
              platform shell (Sasha, Day 47). The GameShellV2 already owns a
              video background; stacking a second one creates a visible
              horizontal edge at the top of Panel 3.
            */}
            {hideNav && (
                <div className="fixed inset-0 z-0 bg-[#0a0a1a]">
                    <HlsBackground />
                    {/* Dark overlay to ensure white text remains legible */}
                    <div className="absolute inset-0 bg-[#0a0a1a]/65 backdrop-blur-[2px]" />
                </div>
            )}

            <div className="relative z-10 px-5 lg:px-10 py-4 sm:py-6 max-w-2xl mx-auto min-h-dvh flex flex-col justify-center">

                {/* Header — Day 48 (Sasha): vertical rhythm compressed so hero +
                    CTA fit on one viewport. Logo shrunk ~50% (20 → 10).
                    Hero questions rewritten so the `?` stays attached to the
                    last gradient word (no more orphaned "?" on its own line)
                    and each question sits inside a text-balance block so the
                    browser picks more even line lengths. */}
                <div className="text-center mb-6">
                    {/* Dodecahedron — 50% smaller per Sasha */}
                    <div className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden mb-3 ring-1 ring-[#0a1628]/10 breathing-card">
                        <img src="/dodecahedron.png" alt="" className="w-full h-full object-cover" aria-hidden="true" />
                    </div>

                    <h1
                        className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-[1.2] max-w-2xl mx-auto mb-5 space-y-3"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-text-primary, #0a1628)",
                            textShadow:
                                "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
                        }}
                    >
                        <span className="block text-balance">
                            Why is it still so hard to{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        "var(--skin-accent-1-bg, linear-gradient(135deg, hsl(285, 85%, 28%) 0%, hsl(272, 85%, 24%) 50%, hsl(258, 85%, 26%) 100%))",
                                    filter:
                                        "var(--skin-accent-1-glow, drop-shadow(0 0 10px hsl(278 95% 55% / 0.38)) drop-shadow(0 0 3px hsl(268 95% 48% / 0.45)))",
                                    textShadow: "none",
                                }}
                            >
                                explain what you do?
                            </span>
                        </span>
                        <span className="block text-balance">
                            And turn it into something people{" "}
                            <span
                                className="bg-clip-text text-transparent"
                                style={{
                                    backgroundImage:
                                        "var(--skin-accent-3-bg, linear-gradient(135deg, hsl(28, 85%, 28%) 0%, hsl(15, 85%, 24%) 50%, hsl(2, 85%, 26%) 100%))",
                                    filter:
                                        "var(--skin-accent-3-glow, drop-shadow(0 0 10px hsl(15 95% 50% / 0.4)) drop-shadow(0 0 3px hsl(8 95% 48% / 0.48)))",
                                    textShadow: "none",
                                }}
                            >
                                actually pay for?
                            </span>
                        </span>
                    </h1>

                    {/* Recognition block — Day 48 tighten: spacing reduced so
                        the full hero + CTA fit a single viewport without scroll. */}
                    <div className="space-y-2 max-w-lg mx-auto">
                        <p
                            className="text-base sm:text-lg leading-snug"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                textShadow: "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
                            }}
                        >
                            You already help people.
                        </p>
                        <p
                            className="text-base sm:text-lg leading-snug"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                                textShadow: "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.7))",
                            }}
                        >
                            You just don't have a clear way to say what you do.
                        </p>
                    </div>

                    {/* Recognition bullets — If this sounds familiar */}
                    <div className="mt-5 max-w-lg mx-auto text-left">
                        <p
                            className="text-sm mb-3 text-center"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.75))",
                                textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                            }}
                        >
                            If this sounds familiar:
                        </p>
                        <ul
                            className="space-y-1.5 text-sm sm:text-[15px] leading-snug"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                                textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                            }}
                        >
                            <li className="flex gap-3">
                                <span aria-hidden="true" style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.5))" }}>–</span>
                                <span>You've helped people — but don't have a clear offer.</span>
                            </li>
                            <li className="flex gap-3">
                                <span aria-hidden="true" style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.5))" }}>–</span>
                                <span>You over-explain what you do — and people get confused.</span>
                            </li>
                            <li className="flex gap-3">
                                <span aria-hidden="true" style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.5))" }}>–</span>
                                <span>You feel like something is there — but can't pin it down.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 liquid-glass rounded-xl text-red-300 text-sm border border-red-500/20">
                        {error}
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════
                    Step subsections — Day 47 late pass (Sasha):
                    All dark-navy text + soft white halo + normal case.
                    Matches /path and /playbook hero aesthetic.
                    ═══════════════════════════════════════════════════════ */}

                {/* Step: Choice */}
                {step === "choice" && (
                    <div ref={stepContentRef} className="space-y-6 animate-in fade-in duration-500">
                        <div className="text-center">
                            <button
                                className="w-full max-w-md mx-auto rounded-2xl px-10 py-6
                                           font-semibold text-lg sm:text-xl
                                           transition-all duration-300 ease-out
                                           hover:scale-[1.02] active:scale-95
                                           flex items-center justify-center gap-4
                                           alive-card"
                                style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    color: "var(--skin-text-primary, #0a1628)",
                                    backgroundImage:
                                        "linear-gradient(135deg, rgba(255,255,255,0.38), rgba(255,255,255,0.18))",
                                    border: "1px solid var(--skin-rule-strong, rgba(26,30,58,0.18))",
                                    backdropFilter: "blur(14px)",
                                    WebkitBackdropFilter: "blur(14px)",
                                    boxShadow:
                                        "0 20px 60px -24px rgba(26,30,58,0.25), inset 0 1px 1px rgba(255,255,255,0.8)",
                                    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                                }}
                                onClick={() => setStep("choice-route")}
                            >
                                Find my top talent
                                <ArrowRight className="w-5 h-5 opacity-70" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Route Selection */}
                {step === "choice-route" && (
                    <div ref={stepContentRef} className="space-y-8 animate-in fade-in duration-500">
                        <div className="text-center">
                            <h2
                                className="text-xl font-light tracking-wide"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    color: "var(--skin-text-body, rgba(26,30,58,0.82))",
                                    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                                }}
                            >
                                How do you want to reveal it?
                            </h2>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => setStep("ai-prompt")}
                                className="w-full p-6 rounded-2xl
                                           transition-all duration-300
                                           text-left flex items-start gap-4 group
                                           hover:scale-[1.015] active:scale-[0.985]
                                           animate-in fade-in slide-in-from-bottom-2 duration-400"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(135deg, rgba(255,255,255,0.32), rgba(255,255,255,0.14))",
                                    border: "1px solid var(--skin-rule-medium, rgba(26,30,58,0.14))",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                    color: "var(--skin-text-primary, #0a1628)",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full shrink-0 transition-colors duration-300"
                                        style={{ backgroundColor: "rgba(132,96,234,0.15)" }}>
                                        <Bot className="w-5 h-5" style={{ color: "#5b21b6" }} />
                                    </div>
                                    <div>
                                        <p
                                            className="text-base font-semibold tracking-wide"
                                            style={{ color: "var(--skin-text-primary, #0a1628)" }}
                                        >
                                            🤖 Faster (1 min)
                                        </p>
                                        <p
                                            className="text-xs mt-1 leading-relaxed"
                                            style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.65))" }}
                                        >
                                            Ask your AI & paste its response → get your pattern instantly
                                        </p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={handleStartManualAssessment}
                                className="w-full p-6 rounded-2xl
                                           transition-all duration-300
                                           text-left flex items-start gap-4 group
                                           hover:scale-[1.015] active:scale-[0.985]
                                           animate-in fade-in slide-in-from-bottom-2 duration-400"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(135deg, rgba(255,255,255,0.32), rgba(255,255,255,0.14))",
                                    border: "1px solid var(--skin-rule-medium, rgba(26,30,58,0.14))",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                    color: "var(--skin-text-primary, #0a1628)",
                                    animationDelay: "100ms",
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full shrink-0 transition-colors duration-300"
                                        style={{ backgroundColor: "rgba(104,148,208,0.18)" }}>
                                        <ClipboardList className="w-5 h-5" style={{ color: "#1e40af" }} />
                                    </div>
                                    <div>
                                        <p
                                            className="text-base font-semibold tracking-wide"
                                            style={{ color: "var(--skin-text-primary, #0a1628)" }}
                                        >
                                            📋 Guided (10–15 min)
                                        </p>
                                        <p
                                            className="text-xs mt-1 leading-relaxed"
                                            style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.65))" }}
                                        >
                                            Assessment of your top talents
                                        </p>
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
                            <h2
                                className="text-lg font-light tracking-wide"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    color: "var(--skin-text-body, rgba(26,30,58,0.82))",
                                    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                                }}
                            >
                                Copy this prompt into your AI
                            </h2>
                            <p
                                className="text-xs"
                                style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.55))" }}
                            >
                                ChatGPT, Claude, Gemini — any will work
                            </p>
                        </div>

                        <div
                            className="relative rounded-2xl"
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,255,255,0.12))",
                                border: "1px solid var(--skin-rule-medium, rgba(26,30,58,0.12))",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                            }}
                        >
                            <pre
                                className="text-[11px] whitespace-pre-wrap font-mono leading-snug max-h-36 overflow-y-auto p-4 pr-16 selection:bg-[#8460ea]/20"
                                style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.45))" }}
                            >
                                {ZONE_OF_GENIUS_PROMPT}
                            </pre>
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-3 right-3 shadow-sm text-xs rounded-lg"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.35)",
                                    borderColor: "rgba(26,30,58,0.2)",
                                    color: "var(--skin-text-primary, #0a1628)",
                                    backdropFilter: "blur(8px)",
                                }}
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
                            className="w-full max-w-md mx-auto rounded-2xl px-10 py-6
                                       font-semibold text-lg
                                       transition-all duration-300 ease-out
                                       hover:scale-[1.02] active:scale-95
                                       flex items-center justify-center gap-4
                                       alive-card"
                            style={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                backgroundImage:
                                    "linear-gradient(135deg, rgba(255,255,255,0.38), rgba(255,255,255,0.18))",
                                border: "1px solid var(--skin-rule-strong, rgba(26,30,58,0.18))",
                                backdropFilter: "blur(14px)",
                                WebkitBackdropFilter: "blur(14px)",
                                boxShadow:
                                    "0 20px 60px -24px rgba(26,30,58,0.25), inset 0 1px 1px rgba(255,255,255,0.8)",
                                textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                            }}
                            onClick={() => setStep("paste-response")}
                        >
                            I've got my AI's response
                            <ArrowRight className="w-5 h-5 opacity-70" />
                        </button>

                        <div className="text-center pt-2">
                            <button
                                onClick={handleStartManualAssessment}
                                className="text-[11px] transition-colors duration-300 tracking-wide hover:underline"
                                style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}
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
                            <h2
                                className="text-lg font-light tracking-wide"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    color: "var(--skin-text-body, rgba(26,30,58,0.82))",
                                    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                                }}
                            >
                                Paste your AI's response
                            </h2>
                            <p
                                className="text-xs"
                                style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.55))" }}
                            >
                                The full response — we'll extract your pattern from it
                            </p>
                        </div>

                        <Textarea
                            value={aiResponse}
                            onChange={(e) => setAiResponse(e.target.value)}
                            placeholder="Paste your AI's response here..."
                            className="min-h-[200px] font-mono text-sm rounded-2xl focus:ring-1 transition-all duration-300"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.30)",
                                borderColor: "rgba(26,30,58,0.14)",
                                color: "var(--skin-text-primary, #0a1628)",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                            }}
                        />

                        <button
                            className={`w-full max-w-md mx-auto rounded-2xl px-10 py-6
                                       font-semibold text-lg
                                       transition-all duration-300 ease-out
                                       hover:scale-[1.02] active:scale-95
                                       disabled:opacity-60 disabled:hover:scale-100 disabled:shadow-none
                                       flex items-center justify-center gap-4
                                       ${aiResponse.trim() ? "alive-card" : ""}`}
                            style={{
                                fontFamily: "'DM Sans', sans-serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                backgroundImage:
                                    "linear-gradient(135deg, rgba(255,255,255,0.38), rgba(255,255,255,0.18))",
                                border: "1px solid var(--skin-rule-strong, rgba(26,30,58,0.18))",
                                backdropFilter: "blur(14px)",
                                WebkitBackdropFilter: "blur(14px)",
                                boxShadow:
                                    "0 20px 60px -24px rgba(26,30,58,0.25), inset 0 1px 1px rgba(255,255,255,0.8)",
                                textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                            }}
                            onClick={handleGenerateAppleseed}
                            disabled={isProcessing || !aiResponse.trim()}
                        >
                            {isProcessing ? "Revealing..." : "Reveal my top talent"}
                            <Sparkles className="w-5 h-5 opacity-70" />
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
