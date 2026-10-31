import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { trackPageView, trackFunnelEvent } from "@/lib/funnelAnalytics";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowRight, Copy, Check, Sword } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { PasteTextarea, type PasteTextareaHandle } from "@/components/ui/paste-textarea";
import GameShellV2 from "@/components/game/GameShellV2";
import SEO from "@/components/SEO";
import { ZONE_OF_GENIUS_PROMPT } from "@/prompts";
// Day 48 (Sasha): primary CTA icon across the ZoG flow uses the
// ignite logo asset — rendered small + light so it reads as a
// subtle emblem consistent with the landing CTA.
// Day 48 iter 7 (Sasha): shared design language imported from the
// landing — gold gradient style, small-caps CTA treatment, and the
// ornament helper live in @/lib/landingDesign. Editing that module
// updates every funnel surface at once.
import {
    // Day 78: GOLD_TEXT_STYLE removed — was only used by the deleted
    // "Why is it still so hard…" hero block.
    CTA_SMALL_CAPS_STYLE,
    igniteLogo,
} from "@/lib/landingDesign";
// Day 79 (Sasha 2026-05-22): EntryPath read here so the "choice-route"
// step can show match-path users a "Step 1 of 2" orientation above the
// Faster/Guided options. Build-path users see the screen unchanged.
import { useEntryPath } from "@/contexts/EntryPathContext";
// Funnel v2 (Day 77, Sasha 2026-05-20): match-path conditional CTAs
// below the Top Talent reveal. Renders null for build-path users so
// AppleseedDisplay's existing CTAs are untouched.
import MatchFlowCta from "@/components/landing/MatchFlowCta";
import {
    generateAppleseed,
    AppleseedData,
    RevealTimeoutError,
    UnreadableResponseError,
    isAppleseedReadable,
} from "./appleseedGenerator";
import { generateExcalibur, ExcaliburData } from "./excaliburGenerator";
import { saveAppleseed, saveExcalibur, loadSavedData, saveAppleseedToLocalStorage } from "./saveToDatabase";
import AppleseedDisplay from "./AppleseedDisplay";
import AppleseedRitualLoading from "./AppleseedRitualLoading";
import ExcaliburDisplay from "./ExcaliburDisplay";
import TopTalentAuthGate from "./TopTalentAuthGate";
import YourAiDialogue from "./YourAiDialogue";
import { buildRevealSignal, type DialogueMessage } from "./yourAiDialogue";
import EnterVillageButton from "./EnterVillageButton";
import { clearGuestBuffers, freshRetakeState } from "./retake";
import { formatSupabaseError, isSchemaDriftError } from "./formatSupabaseError";
import { SaveErrorToastBody } from "@/components/ui/save-error-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SignupModal from "@/components/auth/SignupModal";
import { useToast } from "@/hooks/use-toast";
import { toast as systemToast } from "sonner";
import { getFirstTimeActionLabel } from "@/lib/xpService";
import { getPostZogRedirect } from "@/lib/onboardingRouting";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { saveResonanceRating } from "@/lib/saveResonanceRating";
import { supabase } from "@/integrations/supabase/client";
import { markAnonymousZogSaved } from "@/lib/anonClaimGuard";
import Hls from "hls.js";
import ModuleIntro from "@/components/game/ModuleIntro";
import ModuleOutro from "@/components/game/ModuleOutro";
import { getJourneyModule } from "@/data/journeyModules";

// WP-5: this module in the module form (Intro → one button → the flow → Outro).
const ZOG_MODULE = getJourneyModule("find-top-talent")!;

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
    | "your-ai"
    | "ai-prompt"
    | "paste-response"
    | "generating-appleseed"
    | "appleseed-result"
    | "generating-excalibur"
    | "excalibur-result";

// A real answer to the prompt is far longer; below this we nudge, never block.
const SHORT_PASTE_CHARS = 200;

const ZoneOfGeniusEntry = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [searchParams] = useSearchParams();
    // Day 79 (Sasha 2026-05-22): match-path orientation gate. When the
    // user arrived via `?path=match` (Balaji/ecosystem outreach), the
    // choice-route screen shows a "Step 1 of 2" preamble above the
    // Faster/Guided options so the user understands the Top Talent
    // reveal is step 1 and the actual intros come after. Build-path
    // users see the screen unchanged.
    // 2026-06-10 default flip: match funnel is the default — only an
    // explicit `?path=build` entry hides the orientation preamble.
    const { path: entryPath } = useEntryPath();
    const isMatchPath = entryPath !== "build";

    // Show the full platform shell everywhere (Sasha, 2026-04-21): the ZoG
    // reveal module now lives inside the JOURNEY shell regardless of route.
    // `isInPlatform` is kept as a read-only flag in case other branches need it.
    const isInPlatform = location.pathname.startsWith("/game/journey");
    const hideNav = false;
    const returnPath = searchParams.get("return") || "/";

    // Day 78 (Sasha 2026-05-21): initial state moved from "choice" to
    // "choice-route". The old "choice" step was a single-CTA intermediate
    // screen (a redundant pitch above a "Find my top talent" button that
    // just advanced to "choice-route"). The landing CTAs (both build-
    // path and match-path) now drop users straight onto the AI-vs-Manual
    // route selector — one screen saved, one click saved. See the deletion
    // of the shared hero block + the `step === "choice"` render block
    // below. Mode A (?result=token) and Mode B (authed with saved
    // snapshot) overrides in the loadExisting effect still jump straight
    // to the appleseed-result step — unaffected.
    const [step, setStep] = useState<Step>("choice-route");
    // `aiResponse` is the last SUBMITTED paste (used by the save paths). The
    // paste box itself is uncontrolled and read on submit, so typing or
    // pasting a long response never round-trips through React state.
    const [aiResponse, setAiResponse] = useState("");
    const pasteRef = useRef<PasteTextareaHandle>(null);
    const [hasPasteText, setHasPasteText] = useState(false);
    const [isShortPaste, setIsShortPaste] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // Your AI dialogue (Sasha 2026-10-30): the default door. Kept here so a failed
    // reveal returns to the conversation intact.
    const [dialogue, setDialogue] = useState<DialogueMessage[]>([]);
    const [ownAiNotes, setOwnAiNotes] = useState("");
    const [dialogueReady, setDialogueReady] = useState(false);
    const [dialogueRevealError, setDialogueRevealError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // Own-AI reveal failure (timeout / AI error): shown on the paste step with Retry.
    const [revealError, setRevealError] = useState<string | null>(null);
    const [revealUnreadable, setRevealUnreadable] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileId, setProfileId] = useState<string | null>(null);

    const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
    const [excalibur, setExcalibur] = useState<ExcaliburData | null>(null);
    const hasSavedAppleseed = useRef(false);
    const stepContentRef = useRef<HTMLDivElement>(null);
    // Issue #48 P0 #1: overwrite-confirm for an explicit ZoG retake.
    const [retakeDialogOpen, setRetakeDialogOpen] = useState(false);
    // Issue #52 item 8: entering the Guided assessment with an existing saved
    // result used to overwrite it silently (Step 4 inserts a new snapshot and
    // repoints last_zog_snapshot_id). Gate the Guided card behind an
    // overwrite-confirm when a saved result exists and the user hasn't already
    // chosen to redo (`?redo=true`, or the in-page retake confirm).
    const [hasExistingResult, setHasExistingResult] = useState(false);
    const [guidedConfirmOpen, setGuidedConfirmOpen] = useState(false);
    const isRedoing = searchParams.get("redo") === "true";

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
    // WP-7b: «full reading unlocked» (after the guest saves), not «result visible».
    const [guestRevealUnlocked, setGuestRevealUnlocked] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    // True right after a save in this visit: the Outro (a stable screen) follows the reveal.
    // A reveal loaded from the saved result (a returning visit) has none.
    const [justSaved, setJustSaved] = useState(false);
    // WP-5: the Intro is the door of the test. It waits for the saved-result check below
    // (`loaded`) so a returning player never sees it flash, and is skipped for onboarding
    // (/start) and a redo, which start straight at the route choice.
    const [loaded, setLoaded] = useState(false);
    const [introPending, setIntroPending] = useState(
        !returnPath.includes("/start") && searchParams.get("redo") !== "true",
    );
    useEffect(() => {
        // Once the player is anywhere past the route choice, the Intro is behind them
        // (a retake goes back to the route choice, not to the Intro).
        if (step !== "choice-route") setIntroPending(false);
    }, [step]);

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
            const urlParams = new URLSearchParams(window.location.search);

            // ─────────────────────────────────────────────────────────
            // Day 61 (Sasha 2026-05-04 15:30) — Reveal-Anchored Funnel
            // ─────────────────────────────────────────────────────────
            //
            // TWO new entry modes added at the top of this effect, both
            // bypass the choice/quiz flow and jump straight to the
            // appleseed-result step. Both render the SAME component as
            // the live funnel — no replica page, no drift.
            //
            // Reference: docs/02-strategy/unique-businesses/alexanders_unique_business.md
            // → "Lived User Journey — Reveal-Anchored Funnel"
            //
            // ENTRY MODE A — Token URL (?result=<access_token>)
            //   The deposit-slip email from save-zog-result contains a
            //   token URL pointing here. We look up game_profiles by
            //   access_token, fetch the linked zog_snapshot, render the
            //   reveal. No auth required — the token IS the access.
            //   Replaces the legacy /my-result page (now deleted).
            //
            // ENTRY MODE B — Authed user landing here with no token
            //   The save-anonymous-zog magic-link flow (and AuthCallback
            //   default) lands authed users on /zone-of-genius after
            //   claim-anonymous-zog has promoted their snapshot. We
            //   detect them, fetch their game_profile snapshot, render
            //   the same reveal. Skips the existing hasReturnParam gate
            //   that previously kept them on the choice screen.
            //
            // ENTRY MODE C — Existing live-funnel logic, preserved below
            //   Quiz-takers, redo flows, onboarding paths — untouched.
            //   Bug-blast radius for the new modes is bounded to
            //   modes A + B; mode C is the same code that's been live.

            // ─── Mode A: token URL ───────────────────────────────────
            const resultToken = urlParams.get("result");
            if (resultToken) {
                try {
                    // game_profiles.access_token query — same pattern
                    // the legacy MyResult.tsx page used. Cast to `any`
                    // because access_token isn't in generated types yet.
                    const { data: profile } = await (supabase as any)
                        .from("game_profiles")
                        .select("id, last_zog_snapshot_id")
                        .eq("access_token", resultToken)
                        .maybeSingle();

                    if (profile?.last_zog_snapshot_id) {
                        const { data: snapshot } = await supabase
                            .from("zog_snapshots")
                            .select("appleseed_data")
                            .eq("id", profile.last_zog_snapshot_id)
                            .maybeSingle();

                        if (snapshot?.appleseed_data) {
                            setAppleseed(snapshot.appleseed_data as unknown as AppleseedData);
                            // Issue #48 P0 #3: this appleseed was LOADED from the
                            // DB, not freshly generated — mark it already-saved so
                            // the auto-save effect doesn't re-write it on mount and
                            // raise a spurious "Failed to save Appleseed" toast.
                            hasSavedAppleseed.current = true;
                            setStep("appleseed-result");
                            return; // entry mode handled, skip the rest
                        }
                    }
                    // If lookup fails (bad token, missing snapshot),
                    // fall through to live-funnel behavior — user sees
                    // the choice screen and can retake. Better than
                    // a hard error.
                } catch (err) {
                    console.error("[ZoneOfGeniusEntry] token lookup failed", err);
                    // Fall through to live-funnel behavior
                }
            }

            // ─── Mode B: authed user, no token, has saved snapshot ──
            // Don't run if onboarding/redo (those override below). We
            // peek at user auth + DB-saved snapshot. If both present,
            // render the reveal directly — the user came back via
            // magic-link or post-auth navigation expecting to see
            // their result, not the choice screen.
            const isInOnboarding = returnPath === "/start" || returnPath.includes("/start");
            const isRedoing = urlParams.get("redo") === "true";
            if (!isInOnboarding && !isRedoing) {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { appleseed: dbAppleseed, excalibur: dbExcalibur } = await loadSavedData();
                    if (dbAppleseed) {
                        setAppleseed(dbAppleseed);
                        // Issue #48 P0 #3: loaded from DB → already saved.
                        hasSavedAppleseed.current = true;
                        if (dbExcalibur) {
                            setExcalibur(dbExcalibur);
                            setStep("excalibur-result");
                        } else {
                            setStep("appleseed-result");
                        }
                        return; // entry mode handled, skip the rest
                    }
                }
            }

            // ─── Mode C: existing live-funnel behavior, preserved ───
            // When in onboarding flow (/start), always start fresh from
            // the route-selector ("choice-route"). Don't auto-restore
            // saved data or redirect. Day 78: was "choice" before the
            // intermediate pitch screen got deleted.
            if (isInOnboarding) {
                // User is doing fresh onboarding, start from route-selector.
                return;
            }

            // Check if user is intentionally visiting to redo
            const hasReturnParam = urlParams.has("return");

            // If doing a redo, clear localStorage to start fresh
            if (isRedoing) {
                localStorage.removeItem("guest_excalibur_data");
                localStorage.removeItem("guest_appleseed_data");
                localStorage.removeItem("guest_ai_response");
                return; // Start fresh from route-selector
            }

            const { appleseed: savedAppleseed, excalibur: savedExcalibur } = await loadSavedData();

            // If user has complete Excalibur data AND came from another page, redirect to profile
            if (savedExcalibur && hasValidExcaliburData(savedExcalibur) && hasReturnParam) {
                navigate("/");
                return;
            }

            const { data: { user } } = await supabase.auth.getUser();

            // Only auto-restore saved data for authenticated users who came from another page.
            // Guest localStorage is now only a recovery buffer; it must not reveal the result
            // before identity capture.
            if (user && savedAppleseed && hasReturnParam) {
                setAppleseed(savedAppleseed);
                // Issue #48 P0 #3: restored from storage/DB → already saved.
                hasSavedAppleseed.current = true;
                if (savedExcalibur) {
                    setExcalibur(savedExcalibur);
                    setStep("excalibur-result");
                } else {
                    setStep("appleseed-result");
                }
            }
        };
        loadExisting()
            .catch(() => undefined)
            .finally(() => setLoaded(true));
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

    // Issue #52 item 8: detect whether an authed user already has a saved ZoG
    // result, so the Guided card can confirm before overwriting it. Skipped in
    // redo mode — the user already chose to start fresh.
    useEffect(() => {
        if (isRedoing) return;
        let active = true;
        (async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { appleseed: dbAppleseed } = await loadSavedData();
                if (active && dbAppleseed) setHasExistingResult(true);
            } catch {
                // Non-fatal — if we can't tell, fall back to no confirm
                // (preserves the pre-existing behavior).
            }
        })();
        return () => {
            active = false;
        };
    }, [isRedoing]);

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

    // Auto-save appleseed for auth users (silent on success, loud on failure)
    // Day 66 (Sasha 2026-05-16) — Wave A3 fix. Previously this ignored the
    // result entirely and called setIsSaved(true) unconditionally — even
    // when saveAppleseed returned success=false (e.g., RLS denial, pointer
    // write failure, missing profile). Combined with the silent localStorage
    // fallback in saveToDatabase.ts, that meant the user saw "saved" and
    // navigated away while the DB was actually empty. Now: check
    // result.success; on failure, raise the destructive toast so the user
    // knows to retry. The await also catches thrown errors as before.
    useEffect(() => {
        if (step === "appleseed-result" && appleseed && !isGuest && !hasSavedAppleseed.current) {
            hasSavedAppleseed.current = true;
            (async () => {
                try {
                    const result = await saveAppleseed(appleseed, aiResponse);
                    if (result.success) {
                        setIsSaved(true);
                        setJustSaved(true);
                        console.log("[ZoneOfGeniusEntry] Auto-saved appleseed for auth user");
                        // Issue #93: same confirmation the Guided path shows.
                        systemToast.success(t("zogEntry.bannerResultSaved"), {
                            duration: 5000,
                        });
                    } else {
                        // Issue #50: friendly line in the toast, raw diagnostic
                        // behind a <details> disclosure; the raw string stays in
                        // console above.
                        console.error("[ZoneOfGeniusEntry] Auto-save returned failure:", result.error);
                        toast({
                            title: t('zogEntry.toastSaveFailedTitle'),
                            description: (
                                <SaveErrorToastBody
                                    detail={formatSupabaseError(result.error, t('zogEntry.toastAutoSaveFailedDesc'))}
                                    isSchemaDrift={isSchemaDriftError(result.error)}
                                />
                            ),
                            variant: "destructive",
                        });
                    }
                } catch (err) {
                    console.error("[ZoneOfGeniusEntry] Auto-save threw:", err);
                    toast({
                        title: t('zogEntry.toastSaveFailedTitle'),
                        description: (
                            <SaveErrorToastBody
                                detail={formatSupabaseError(err, t('zogEntry.toastTapSaveToRetry'))}
                                isSchemaDrift={isSchemaDriftError(err)}
                            />
                        ),
                        variant: "destructive",
                    });
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
                markAnonymousZogSaved(pendingEmail);
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
        navigate("/auth?claim=true&next=/zone-of-genius/entry");
    };

    // Issue #48 P0 #1: explicit "Retake Zone of Genius". Mirrors Mission
    // Discovery's overwrite-confirm ("Keep my current / Yes, start fresh").
    // On confirm we clear the guest recovery buffers and reset to the
    // Faster/Guided choice fresh. The saved snapshot in the DB is left
    // intact until the user finishes and saves the new reveal (the
    // auto-save effect overwrites it only once a fresh appleseed exists).
    const handleRetakeConfirm = () => {
        setRetakeDialogOpen(false);
        // Issue #52 item 8: the user has explicitly chosen to start fresh, so
        // the subsequent Guided/Faster pick must not ask to confirm the
        // overwrite again.
        setHasExistingResult(false);
        if (typeof window !== "undefined") {
            clearGuestBuffers(window.localStorage);
        }
        const fresh = freshRetakeState();
        hasSavedAppleseed.current = fresh.hasSavedAppleseed;
        setAppleseed(fresh.appleseed);
        setExcalibur(fresh.excalibur);
        setAiResponse(fresh.aiResponse);
        setError(fresh.error);
        setIsSaved(fresh.isSaved);
        setGuestRevealUnlocked(fresh.guestRevealUnlocked);
        setStep(fresh.step);
        setDialogue([]);
        setOwnAiNotes("");
        setDialogueReady(false);
        setDialogueRevealError(null);
    };

    const handleCopyPrompt = async () => {
        await navigator.clipboard.writeText(ZONE_OF_GENIUS_PROMPT);
        setCopied(true);
        trackFunnelEvent({ step: 'zog_copy_prompt' });
        setTimeout(() => setCopied(false), 2000);
    };

    const proceedToManualAssessment = () => {
        navigate(`/zone-of-genius/assessment?return=${encodeURIComponent(returnPath)}`);
    };

    const handleStartManualAssessment = () => {
        // Issue #52 item 8: confirm before a Guided run silently overwrites an
        // existing saved result. In redo mode (or after the retake confirm) the
        // user has already opted in, so go straight through.
        if (hasExistingResult && !isRedoing) {
            setGuidedConfirmOpen(true);
            return;
        }
        proceedToManualAssessment();
    };

    const handleGuidedConfirm = () => {
        setGuidedConfirmOpen(false);
        setHasExistingResult(false);
        proceedToManualAssessment();
    };

    const startYourAi = () => {
        if (dialogue.length === 0) {
            setDialogue([{ role: "ai", text: t('zogEntry.yourAiOpening') }]);
        }
        setDialogueRevealError(null);
        setStep("your-ai");
    };

    // Your AI door: our AI answers the unchanged reveal prompt from the conversation,
    // then the existing reveal runs on it (same path as a pasted own-AI answer).
    const handleRevealFromDialogue = async () => {
        setIsProcessing(true);
        setError(null);
        setDialogueRevealError(null);
        setStep("generating-appleseed");
        try {
            const signal = await buildRevealSignal(dialogue, ownAiNotes);
            setAiResponse(signal);
            const result = await generateAppleseed(signal);
            if (!isAppleseedReadable(result)) throw new UnreadableResponseError();
            setAppleseed(result);
            saveAppleseedToLocalStorage(result, signal);
            const { data: { session } } = await supabase.auth.getSession();
            setIsGuest(!session?.user);
            setStep("appleseed-result");
        } catch (err) {
            console.error("[ZoneOfGeniusEntry] Your AI reveal failed:", err);
            setDialogueRevealError(err instanceof RevealTimeoutError
              ? t('zogEntry.errorRevealTimeout')
              : err instanceof UnreadableResponseError
                ? t('zogEntry.yourAiNeedMore')
                : t('zogEntry.errorGenerateProfile'));
            setStep("your-ai");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGenerateAppleseed = async () => {
        // Read the textarea's real value at submit time.
        const pastedResponse = pasteRef.current?.getValue() ?? "";
        if (!pastedResponse.trim()) return;
        setAiResponse(pastedResponse);
        setIsShortPaste(pastedResponse.trim().length < SHORT_PASTE_CHARS);

        setIsProcessing(true);
        setError(null);
        setRevealError(null);
        setRevealUnreadable(false);
        setStep("generating-appleseed");

        try {
            // Generate Appleseed from raw AI response
            const result = await generateAppleseed(pastedResponse);
            // Never show the empty reveal card: no title and no talents is an error.
            if (!isAppleseedReadable(result)) throw new UnreadableResponseError();
            setAppleseed(result);

            // Recovery buffer only. Guests now authenticate before seeing the reveal.
            saveAppleseedToLocalStorage(result, pastedResponse);

            // Auto-save for AUTHED users is handled by the existing
            // useEffect at line ~322 (fires on step → "appleseed-result").
            // Tried adding a redundant in-handler call here; reverted —
            // it would have caused a double-write to the same row.
            // The actual divergence-bug Sasha's friend hit is fixed at
            // the saveToDatabase.ts layer: saveAppleseed now invalidates
            // the zogSnapshotCache after a successful write, so the
            // /game/me/zone-of-genius "deeper view" can't keep
            // returning the pre-save snapshot from sessionStorage.
            // Day 62 (Sasha 2026-05-05).
            const { data: { session } } = await supabase.auth.getSession();
            // Issue #93: set both ways. isGuest defaults to true and is only
            // refreshed by the mount-time session check / auth listener; if
            // that hasn't landed, a signed-in user stayed "guest" here and the
            // auto-save effect (which requires !isGuest) never persisted the
            // Faster-path result.
            setIsGuest(!session?.user);
            setStep("appleseed-result");
        } catch (err) {
            // Always a kind, localized message (never raw gateway/billing text),
            // shown on the paste step with Retry + the guided test as fallback.
            console.error("[ZoneOfGeniusEntry] Reveal failed:", err);
            setRevealUnreadable(err instanceof UnreadableResponseError);
            setRevealError(err instanceof RevealTimeoutError
              ? t('zogEntry.errorRevealTimeout')
              : err instanceof UnreadableResponseError
                ? t('zogEntry.errorUnreadableResponse')
                : t('zogEntry.errorGenerateProfile'));
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
                setJustSaved(true);
                // No toast - user proceeds to signup silently
                const redirectPath = getPostZogRedirect(returnPath);
                if (redirectPath && returnPath !== "/game/me") {
                    setTimeout(() => navigate(redirectPath), 600);
                }
            } else {
                console.error("[ZoneOfGeniusEntry] Save failed:", result.error);
                toast({
                    title: t('zogEntry.toastSaveFailedTitle'),
                    description: (
                        <SaveErrorToastBody
                            detail={formatSupabaseError(result.error, t('zogEntry.toastCouldNotSaveProfile'))}
                            isSchemaDrift={isSchemaDriftError(result.error)}
                        />
                    ),
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: t('zogEntry.toastErrorTitle'),
                description: t('zogEntry.toastSomethingWentWrongSaving'),
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
            setError(t('zogEntry.errorGenerateExcalibur'));
            toast({
                title: t('zogEntry.toastGenerationFailedTitle'),
                description: err instanceof Error ? err.message : t('zogEntry.toastPleaseTryAgain'),
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
                    title: t('zogEntry.toastOfferSavedTitle'),
                    description: t('zogEntry.toastOfferSavedDesc'),
                });
                if (result.xpAwarded) {
                    toast({
                        title: t('zogEntry.toastXpAwardedTitle', { xp: result.xpAwarded }),
                        description: t('zogEntry.toastProfileLeveledUp'),
                    });
                }
                if (result.firstTimeBonus) {
                    toast({
                        title: t('zogEntry.toastFirstTimeBonusTitle'),
                        description: t('zogEntry.toastFirstTimeBonusDesc', { xp: result.firstTimeBonus, action: getFirstTimeActionLabel("first_genius_offer") }),
                    });
                }
                // Navigate back to profile after short delay
                setTimeout(() => navigate(returnPath), 1000);
            } else {
                console.error("[ZoneOfGeniusEntry] Excalibur save failed:", result.error);
                toast({
                    title: t('zogEntry.toastSaveFailedTitle'),
                    description: (
                        <SaveErrorToastBody
                            detail={formatSupabaseError(result.error, t('zogEntry.toastCouldNotSaveOffer'))}
                            isSchemaDrift={isSchemaDriftError(result.error)}
                        />
                    ),
                    variant: "destructive",
                });
            }
        } catch (err) {
            toast({
                title: t('zogEntry.toastErrorTitle'),
                description: t('zogEntry.toastSomethingWentWrongSaving'),
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Issue #48 P0 #1: shared "Retake Zone of Genius" affordance + its
    // overwrite-confirm dialog, rendered on the result screens. Kept as a
    // quiet tertiary link so the result card stays the single primary
    // focus of the screen.
    const retakeControl = (
        <>
            <div className="w-full flex justify-center pt-2 pb-6">
                <button
                    type="button"
                    onClick={() => setRetakeDialogOpen(true)}
                    className="text-[13px] italic underline underline-offset-4 transition-opacity duration-200 hover:opacity-80"
                    style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        color: "var(--skin-text-muted, rgba(26,30,58,0.6))",
                    }}
                >
                    {t("zogEntry.retakeLink")}
                </button>
            </div>
            <AlertDialog open={retakeDialogOpen} onOpenChange={setRetakeDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("zogEntry.retakeDialogTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("zogEntry.retakeDialogDesc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("zogEntry.retakeDialogKeep")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRetakeConfirm}>
                            {t("zogEntry.retakeDialogConfirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );

    // Step: Generating Appleseed (Ritual Loading)
    if (step === "generating-appleseed") {
        return (
            <GameShellV2 hideNavigation={hideNav} hideLogo>
                <AppleseedRitualLoading
                    minDuration={4000}
                    waitHint={t('zogEntry.revealWaitHint')}
                    stageLines={[
                        t('zogEntry.revealStageReading'),
                        t('zogEntry.revealStagePattern'),
                        t('zogEntry.revealStageWriting'),
                    ]}
                />
            </GameShellV2>
        );
    }

    // Step: Appleseed Result
    if (step === "appleseed-result" && appleseed) {
        return (
            <GameShellV2 hideNavigation={hideNav} hideLogo>
                {isGuest && !guestRevealUnlocked ? (
                    // WP-7b: result first. A guest sees the head of the reading
                    // (title + hero card) at once; «Save your character» sits
                    // inline right under it. The rest unlocks after the save.
                    <>
                        <AppleseedDisplay appleseed={appleseed} preview />
                        <div className="w-full max-w-3xl mx-auto px-5 pb-6">
                            <TopTalentAuthGate
                                inline
                                saved={isSaved}
                                resultPayload={appleseed as unknown as Record<string, unknown>}
                                assessmentVersion="ai-v1"
                                title={t("zogEntry.saveCharacterModalTitle")}
                                onSaved={(email) => {
                                    setAnonymousSave({ status: "sent", email });
                                    setGuestRevealUnlocked(true);
                                    systemToast.success(t("zogEntry.bannerResultSaved"), {
                                        duration: 5000,
                                    });
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <>
                {(anonymousSave.status === "sending" || anonymousSave.status === "error") && (
                    <div className="w-full max-w-3xl mx-auto px-5 pt-4">
                        {anonymousSave.status === "sending" && (
                            <div
                                className="rounded-xl px-5 py-4 text-sm"
                                style={{
                                    color: "var(--text-ink)",
                                    backgroundColor: "rgba(var(--accent-rgb), 0.10)",
                                    border: "1px solid rgba(var(--accent-rgb), 0.22)",
                                }}
                            >
                                {t('zogEntry.bannerSavingTo')} <strong>{anonymousSave.email}</strong>…
                            </div>
                        )}
                        {anonymousSave.status === "error" && (
                            <div
                                className="rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-sm"
                                style={{ color: "var(--text-ink)" }}
                            >
                                <p>
                                    {t('zogEntry.bannerCouldNotSaveTo')} <strong>{anonymousSave.email}</strong>.{" "}
                                    <button
                                        type="button"
                                        onClick={handleRedoClaimEmail}
                                        className="underline text-[color:var(--accent-text)] hover:text-[color:var(--accent-text-hover)]"
                                    >
                                        {t('zogEntry.bannerTryDifferentEmail')}
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
                {/* Funnel v2 (§4.4.1): match-path "Discover your mission in
                    1 minute →" CTA below the reveal. Renders nothing for
                    build-path users — AppleseedDisplay's existing CTAs are
                    the only thing they see. */}
                {/* WP-7a: the one primary way on from the reveal, into the village. */}
                <div className="w-full max-w-3xl mx-auto px-5 pb-6">
                    <EnterVillageButton />
                </div>
                {/* WP-5 module form, After: a fresh save ends in the Outro (one button back
                    to the village) in place of the Funnel v2 CTA. A reveal loaded from the
                    saved result keeps the CTA. */}
                {justSaved ? (
                    <div className="px-4 pb-8">
                        <ModuleOutro module={ZOG_MODULE} result={appleseed.vibrationalKey?.name?.replace(/[✦✧]/g, "").trim() || null} />
                    </div>
                ) : (
                    <MatchFlowCta step="top-talent" />
                )}
                {retakeControl}
                    </>
                )}
            </GameShellV2>
        );
    }

    // Step: Generating Excalibur
    if (step === "generating-excalibur") {
        return (
            <GameShellV2 hideNavigation={hideNav} hideLogo>
                {/* Day 48 iter 7 (Sasha): spinner + progress bar migrated
                    from the violet/periwinkle family (#8460ea / #a4a3d0 /
                    #6894d0) to the signature antique gold. Reads as the
                    same visual language as the landing and CTA. */}
                <div className="min-h-dvh flex flex-col items-center justify-center p-8">
                    <div className="relative w-32 h-32 mb-8">
                        <div className="absolute inset-0 border-2 border-[color:rgba(var(--accent-rgb),0.25)] rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                        <div className="absolute inset-4 border-2 border-[color:rgba(var(--accent-deep-rgb),0.35)] rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                        <div className="absolute inset-8 border-2 border-[color:rgba(var(--accent-text-rgb),0.55)] rounded-full animate-spin" style={{ animationDuration: '4s' }} />
                        <div className="absolute inset-12 bg-gradient-to-br from-[rgba(var(--accent-bright-rgb),0.25)] to-[rgba(var(--accent-deep-rgb),0.20)] rounded-full animate-pulse flex items-center justify-center backdrop-blur-sm">
                            <Sword className="w-6 h-6" style={{ color: "var(--accent-text)" }} />
                        </div>
                    </div>
                    <p className="text-lg text-[color:rgba(var(--text-ink-rgb),0.6)] animate-pulse">
                        {t('zogEntry.excaliburLoadingTitle')}
                    </p>
                    <p className="mt-4 text-sm text-[color:rgba(var(--text-ink-rgb),0.4)]">
                        {t('zogEntry.excaliburLoadingSubtitle')}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs mt-6">
                        <div className="h-1.5 bg-[color:rgba(var(--accent-rgb),0.15)] rounded-full overflow-hidden backdrop-blur-sm">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    backgroundImage: "linear-gradient(90deg, rgba(var(--accent-deep-rgb),0.65) 0%, rgba(var(--accent-rgb),0.50) 100%)",
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
                {retakeControl}
            </GameShellV2>
        );
    }

    // WP-5 module form, Before: the Intro (result + one button) leads into the route choice.
    if (step === "choice-route" && introPending) {
        return (
            <GameShellV2 hideNavigation={hideNav} hideLogo>
                {loaded ? (
                    <div className="px-4 py-8 sm:py-10">
                        <ModuleIntro module={ZOG_MODULE} onStart={() => setIntroPending(false)} />
                    </div>
                ) : null}
            </GameShellV2>
        );
    }

    return (
        <>
        <SEO
            title={t('zogEntry.seoTitle')}
            description={t('zogEntry.seoDescription')}
            path="/zone-of-genius/entry"
        />
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
                {/* Day 53 second pass (Sasha 2026-04-27): the page-level
                    cream wash that lived here was retired. It was bounded
                    to max-w-2xl so it created a visible cream column with
                    cuts at top + bottom (where the inner wrapper didn't
                    fill the viewport) and at the right edge (where the
                    column ended). The fix moved up one layer: --skin-panel-wash
                    (in src/index.css) is now a radial gradient that gives
                    proper text legibility across the full Pane 3 area on
                    every route. No page-level wash needed here anymore. */}

                {/* Day 78 (Sasha 2026-05-21): redundant pitch hero
                    removed. Was the dodecahedron + "Why is it still so
                    hard to explain what you do? / And turn it into
                    something people actually pay for?" + recognition
                    bullets — pure pitch repetition above the route
                    selector. The user already opted in by clicking
                    "Find your top talent" on the landing; the next
                    surface should ask one question, not pitch again.
                    Each downstream step (choice-route / ai-prompt /
                    paste-response) carries its own h2, so removing
                    the shared hero leaves the layout self-contained. */}

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

                {/* Day 78 (Sasha 2026-05-21): "choice" render block
                    removed — was a single-CTA intermediate that just
                    advanced to "choice-route". Initial useState now
                    starts at "choice-route" directly. No callers
                    `setStep("choice")` anywhere in the codebase, so
                    this is safe to drop. */}

                {/* Step: Route Selection */}
                {step === "choice-route" && (
                    /* Day 80 Wave 2.14 (Sasha 2026-05-22): vertical spacing
                       tightened (space-y-8 → space-y-5) so the CTAs sit on
                       the first viewport without scrolling. */
                    <div ref={stepContentRef} className="space-y-5 animate-in fade-in duration-500">
                        <div className="text-center">
                            {/* Day 80 Wave 2.9 (Sasha 2026-05-22): copy + layout
                                revision. The "Step 1 of 2" framing was confusing
                                because the JOURNEY pane already numbers 5 steps —
                                a parallel 2-step counter on this page jarred.
                                Rewrite: drop the artificial step counter, name
                                WHY the top talent comes first (it's the signal)
                                + what happens next (intros to people whose work
                                meets yours). The "Which way?"
                                question now sits directly above the CTAs as the
                                interaction prompt, not as a page headline. */}
                            {/* Day 80 Wave 2.12 (Sasha 2026-05-22): copy revision.
                                Replaced single "signal" paragraph with a
                                three-stanza preamble that frames the act as
                                profile-building (not assessment), names the
                                accelerator (AI), and orients to the first
                                primitive. Middle line italic + slightly
                                muted to differentiate the supporting beat. */}
                            {/* Day 80 Wave 2.14 (Sasha 2026-05-22): vertical
                                spacing + legibility pass.
                                  - mb-6 → mb-3 so preamble + h2 + CTAs fit
                                    the first viewport without scrolling.
                                  - textShadow upgraded from `--skin-text-halo-soft`
                                    to `--skin-text-halo-deep` (the strong
                                    legibility cocktail from ui_playbook
                                    Part VIII) — match-path video is busier
                                    than build-path, soft halos weren't
                                    enough. */}
                            {isMatchPath && (
                                <div
                                    className="max-w-[560px] mx-auto space-y-1.5 mb-3"
                                    style={{
                                        fontFamily: "'Source Serif 4', serif",
                                    }}
                                >
                                    <p
                                        className="text-sm sm:text-base leading-relaxed"
                                        style={{
                                            color: "var(--skin-text-primary, #0a1628)",
                                            textShadow:
                                                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
                                        }}
                                    >
                                        {t('zogEntry.matchPreambleLine1')}
                                    </p>
                                    <p
                                        className="text-sm sm:text-base italic leading-relaxed"
                                        style={{
                                            color: "var(--skin-text-muted, rgba(26,30,58,0.78))",
                                            textShadow:
                                                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.78), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.6))",
                                        }}
                                    >
                                        {t('zogEntry.matchPreambleLine2')}
                                    </p>
                                    <p
                                        className="text-sm sm:text-base leading-relaxed"
                                        style={{
                                            color: "var(--skin-text-primary, #0a1628)",
                                            textShadow:
                                                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
                                        }}
                                    >
                                        {t('zogEntry.matchPreambleLine3')}
                                    </p>
                                </div>
                            )}

                            {/* "Which way?" — moved DOWN to sit
                                directly above the two CTAs as the interaction
                                prompt (not the page headline). Build-path users
                                see only this question, no orientation paragraph.
                                Day 80 Wave 2.10 (Sasha 2026-05-22): unified to
                                Cormorant per ui_playbook.md — this is a heading
                                question, not body copy. Was Source Serif 4. */}
                            {/* Day 80 Wave 2.14: deep halo cocktail for match-path
                                legibility (ui_playbook Part VIII). */}
                            <h2
                                className="text-2xl tracking-[-0.005em]"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    color: "var(--skin-text-primary, #0a1628)",
                                    textShadow:
                                        "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
                                }}
                            >
                                {t('zogEntry.revealQuestion')}
                            </h2>
                        </div>

                        {/* Day 48 (Sasha): selector cards re-skinned to the
                            dark-navy glass register so the ZoG flow feels
                            like one design family with the landing CTA.
                            Kept card shape (icon + title + description) for
                            scannability; swapped the white wash for
                            liquid-glass-dark + skin-cta-bg, bumped the
                            headings to Cormorant Garamond, kept the violet /
                            blue accent circles as subtle colored anchors. */}
                        {/* WP-7a (game_of_being_you.md §14.5 row J1): ONE primary button,
                            the result as a verb. The second path is a quiet text link. */}
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={startYourAi}
                                className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-8 py-3.5 max-w-full text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/40 outline-none animate-in fade-in slide-in-from-bottom-2 duration-400"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                                    backgroundImage:
                                        "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                                    boxShadow:
                                        "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                                    textShadow:
                                        "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
                                }}
                            >
                                <img
                                    src={igniteLogo}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100"
                                    style={{
                                        filter: "drop-shadow(0 0 6px rgba(var(--accent-bright-rgb), 0.45))",
                                    }}
                                    draggable={false}
                                />
                                <span style={CTA_SMALL_CAPS_STYLE}>{t('zogEntry.ctaFindTopTalent')}</span>
                                <ArrowRight
                                    aria-hidden="true"
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                />
                            </button>
                            {/* Day 80 Wave 2.10: subtitle pinned to Source Serif 4. */}
                            <p
                                className="text-xs leading-relaxed text-center max-w-xs"
                                style={{
                                    fontFamily: "'Source Serif 4', Georgia, serif",
                                    color: "var(--skin-text-muted, rgba(26,30,58,0.78))",
                                    textShadow: "var(--skin-text-halo-deep)",
                                }}
                            >
                                {t('zogEntry.cardFasterSubtitle')}
                            </p>
                            <button
                                type="button"
                                onClick={handleStartManualAssessment}
                                className="text-[12px] transition-colors duration-300 tracking-wide hover:underline"
                                style={{
                                    color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                                    textShadow: "var(--skin-text-halo-deep)",
                                }}
                            >
                                {t('zogEntry.guidedAssessmentLink')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Your AI dialogue — the default door (Sasha 2026-10-30). */}
                {step === "your-ai" && (
                    <div ref={stepContentRef}>
                        <YourAiDialogue
                            messages={dialogue}
                            setMessages={setDialogue}
                            ownAiNotes={ownAiNotes}
                            setOwnAiNotes={setOwnAiNotes}
                            ready={dialogueReady}
                            setReady={setDialogueReady}
                            onReveal={handleRevealFromDialogue}
                            revealError={dialogueRevealError}
                            onGuided={handleStartManualAssessment}
                            onOwnAiPrompt={() => setStep("ai-prompt")}
                        />
                    </div>
                )}

                {/* Step: AI Prompt (secondary: copy the prompt into an outside AI) */}
                {step === "ai-prompt" && (
                    <div ref={stepContentRef} className="space-y-6 animate-in fade-in duration-500">
                        <div className="text-center space-y-2">
                            {/* Day 80 Wave 2.15 (Sasha 2026-05-22): unified h2 to
                                Cormorant Garamond canon + bumped to text-2xl,
                                matching the choice-route question. Subtitle
                                gets the deep halo too so the muted faint text
                                actually reads over the busy video. */}
                            <h2
                                className="text-2xl tracking-[-0.005em]"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    color: "var(--skin-text-primary, #0a1628)",
                                    textShadow: "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
                                }}
                            >
                                {t('zogEntry.aiPromptHeading')}
                            </h2>
                            <p
                                className="text-xs"
                                style={{
                                    color: "var(--skin-text-muted, rgba(26,30,58,0.75))",
                                    fontFamily: "'Source Serif 4', serif",
                                    textShadow: "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.55))",
                                }}
                            >
                                {t('zogEntry.aiPromptSubtitle')}
                            </p>
                        </div>

                        {/* Darkroom prompt preview. Use darkroom tokens instead
                            of card-fill tokens so dark skins never produce
                            gold-on-gold prompt text. */}
                        <div
                            className="relative rounded-2xl"
                            style={{
                                background:
                                    "var(--skin-darkroom-bg, rgba(10,10,26,0.76))",
                                border: "1px solid var(--skin-darkroom-border, rgba(255,255,255,0.12))",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                            }}
                        >
                            <pre
                                className="text-[11px] whitespace-pre-wrap font-mono leading-snug max-h-36 overflow-y-auto p-4 pr-16 selection:bg-[color:rgba(var(--accent-rgb),0.25)]"
                                style={{ color: "var(--skin-darkroom-muted, rgba(245,245,250,0.7))" }}
                            >
                                {ZONE_OF_GENIUS_PROMPT}
                            </pre>
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-3 right-3 shadow-sm text-xs rounded-lg"
                                style={{
                                    backgroundColor: "var(--skin-input-fill, rgba(255,255,255,0.35))",
                                    borderColor: "var(--skin-hairline, rgba(26,30,58,0.2))",
                                    color: "var(--skin-text-primary, #0a1628)",
                                    backdropFilter: "blur(8px)",
                                }}
                                onClick={handleCopyPrompt}
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-3 h-3 mr-1" />
                                        {t('zogEntry.copyButtonCopied')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-3 h-3 mr-1" />
                                        {t('zogEntry.copyButton')}
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex justify-center">
                            <button
                                className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 max-w-full text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                                    backgroundImage:
                                        "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                                    boxShadow:
                                        "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                                    textShadow:
                                        "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
                                }}
                                onClick={() => setStep("paste-response")}
                            >
                                <img
                                    src={igniteLogo}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100"
                                    style={{
                                        filter: "drop-shadow(0 0 6px rgba(var(--accent-bright-rgb), 0.45))",
                                    }}
                                    draggable={false}
                                />
                                <span style={CTA_SMALL_CAPS_STYLE}>{t('zogEntry.ctaGotResponse')}</span>
                                <ArrowRight
                                    aria-hidden="true"
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                />
                            </button>
                        </div>

                        <div className="text-center pt-2">
                            <button
                                onClick={handleStartManualAssessment}
                                className="text-[11px] transition-colors duration-300 tracking-wide hover:underline"
                                style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}
                            >
                                {t('zogEntry.guidedAssessmentLink')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Paste Response */}
                {step === "paste-response" && (
                    <div ref={stepContentRef} className="space-y-6 animate-in fade-in duration-500">
                        <div className="text-center space-y-2">
                            {/* Day 80 Wave 2.15: unified h2 to Cormorant canon
                                + deep halo on subtitle so the muted text
                                reads cleanly over the video. */}
                            <h2
                                className="text-2xl tracking-[-0.005em]"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontWeight: 600,
                                    color: "var(--skin-text-primary, #0a1628)",
                                    textShadow: "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
                                }}
                            >
                                {t('zogEntry.pasteHeading')}
                            </h2>
                            <p
                                className="text-xs"
                                style={{
                                    color: "var(--skin-text-muted, rgba(26,30,58,0.75))",
                                    fontFamily: "'Source Serif 4', serif",
                                    textShadow: "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.55))",
                                }}
                            >
                                {t('zogEntry.pasteSubtitle')}
                            </p>
                        </div>

                        <PasteTextarea
                            ref={pasteRef}
                            initialValue={aiResponse}
                            onHasTextChange={setHasPasteText}
                            onInput={(event) =>
                                setIsShortPaste(event.currentTarget.value.trim().length < SHORT_PASTE_CHARS)
                            }
                            placeholder={t('zogEntry.pastePlaceholder')}
                            className="min-h-[200px] font-mono text-sm rounded-2xl focus:ring-1 transition-all duration-300"
                            style={{
                                backgroundColor: "var(--skin-input-fill, rgba(255,255,255,0.30))",
                                borderColor: "var(--skin-hairline, rgba(26,30,58,0.14))",
                                color: "var(--skin-text-primary, #0a1628)",
                                backdropFilter: "blur(12px)",
                                WebkitBackdropFilter: "blur(12px)",
                            }}
                        />

                        {hasPasteText && isShortPaste && !revealError && (
                            <p
                                className="text-xs text-center"
                                style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.75))" }}
                            >
                                {t('zogEntry.pasteShortHint')}
                            </p>
                        )}

                        {revealError && (
                            <div
                                role="alert"
                                className="rounded-2xl px-5 py-4 text-sm space-y-3 text-center"
                                style={{
                                    color: "var(--skin-text-primary, #0a1628)",
                                    backgroundColor: "rgba(255,255,255,0.55)",
                                    border: "1px solid rgba(160,109,8,0.30)",
                                    backdropFilter: "blur(12px)",
                                    WebkitBackdropFilter: "blur(12px)",
                                }}
                            >
                                <p>{revealError}</p>
                                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                                    <button
                                        type="button"
                                        // Unreadable paste: resubmitting the same text can't help,
                                        // so "Try again" returns to the paste box with the text kept.
                                        onClick={revealUnreadable ? () => setRevealError(null) : handleGenerateAppleseed}
                                        disabled={isProcessing || !hasPasteText}
                                        className="font-semibold underline underline-offset-4 disabled:opacity-50"
                                        style={{ color: "var(--accent-text, #7a5108)" }}
                                    >
                                        {revealUnreadable ? t('zogEntry.revealTryAgain') : t('zogEntry.revealRetry')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleStartManualAssessment}
                                        className="underline underline-offset-4"
                                        style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.75))" }}
                                    >
                                        {t('zogEntry.revealGuidedFallback')}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-center">
                            <button
                                className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 max-w-full text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:hover:scale-100 focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                                    backgroundImage:
                                        "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                                    boxShadow:
                                        "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                                    textShadow:
                                        "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
                                }}
                                onClick={handleGenerateAppleseed}
                                disabled={isProcessing || !hasPasteText}
                            >
                                <img
                                    src={igniteLogo}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100"
                                    style={{
                                        filter: "drop-shadow(0 0 6px rgba(var(--accent-bright-rgb), 0.45))",
                                    }}
                                    draggable={false}
                                />
                                <span style={CTA_SMALL_CAPS_STYLE}>{isProcessing ? t('zogEntry.ctaRevealing') : t('zogEntry.ctaRevealTopTalent')}</span>
                                <ArrowRight
                                    aria-hidden="true"
                                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                />
                            </button>
                        </div>
                        {/* Issue #270: a disabled primary says what it waits for. */}
                        {!hasPasteText && !isProcessing && (
                            <p className="text-xs text-center" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.75))" }}>
                                {t('zogEntry.revealPasteHint', { defaultValue: 'Paste your AI’s answer above first.' })}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Signup Modal */}
            <SignupModal
                open={showSignupModal}
                onOpenChange={setShowSignupModal}
                onSuccess={handleSignupSuccess}
            />

            {/* Issue #52 item 8: Guided overwrite-confirm. Reuses the retake
                dialog copy — "This replaces your current Top Talent with a new
                reveal. Your saved result stays until you finish and save the new
                one." */}
            <AlertDialog open={guidedConfirmOpen} onOpenChange={setGuidedConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("zogEntry.retakeDialogTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("zogEntry.retakeDialogDesc")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("zogEntry.retakeDialogKeep")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleGuidedConfirm}>
                            {t("zogEntry.retakeDialogConfirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </GameShellV2>
        </>
    );

};

export default ZoneOfGeniusEntry;
