import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { generateAppleseed, type AppleseedData } from "./appleseedGenerator";
import { buildZogSnapshotPrompt } from "./zogSnapshotPrompt";
import { Download, ArrowLeft, ArrowRight, Mail, Share2 } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { logActionEvent } from "@/lib/actionEvents";
import { getPostZogRedirect } from "@/lib/onboardingRouting";
import { getZogAssessmentBasePath, getZogStepPath } from "./zogRoutes";
// Day 61+ (Sasha 2026-05-04): the CTA section below mirrors the
// AppleseedDisplay reveal so both lanes (manual assessment + AI
// reveal) hand the user the same offer artifact. See AppleseedDisplay
// for the canonical version. Roadmap item: extract a shared
// `RevealCTASection` component to eliminate this drift risk.
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";
import { trackCTAClick } from "@/lib/funnelAnalytics";

// Stripe checkout link for the $37 Activation product. Mirrors
// AppleseedDisplay.STRIPE_ACTIVATE_LINK — keep in sync.
const STRIPE_ACTIVATE_LINK = "https://buy.stripe.com/00w6oH7wo21R41XaDedEs0H";

// Activation coupons — exceptional cases / testing only. Mirrors
// AppleseedDisplay.ACTIVATION_COUPON_CODES — keep in sync. Codes are
// stored lowercase; comparison is case-insensitive.
const ACTIVATION_COUPON_CODES = new Set([
    "guerishenko",
    "appleseed",
]);

const Step4GenerateSnapshot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("return");
  const {
    selectedTop10TalentIds,
    orderedTalentIds,
    snapshotMarkdown,
    setSnapshotMarkdown,
    resetAssessment,
  } = useZoneOfGenius();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  // Populated by background appleseed processing — single source of truth
  // for downstream (email funnel, profile cards, Excalibur).
  const [appleseed, setAppleseed] = useState<AppleseedData | null>(null);
  const snapshotRef = useRef<HTMLDivElement>(null);

  // Day 47 very-late pass (Sasha): save pill state — mirrors AppleseedDisplay
  // pattern. User enters email → save-zog-result edge function creates silent
  // account + saves snapshot + sends magic-link email + enqueues nurture sequence.
  const [saveExpanded, setSaveExpanded] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  // Day 61+ (Sasha 2026-05-04): activation coupon state — mirrors the
  // AppleseedDisplay reveal so both lanes (manual + AI) accept the
  // same codes for testing/exceptional access. On valid match, sets
  // the `coupon_activated` sessionStorage flag and routes to the
  // activation home (MeGate honors the flag for unauthed visitors).
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(false);

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = couponInput.trim().toLowerCase();
    if (ACTIVATION_COUPON_CODES.has(entered)) {
      trackCTAClick("activate_coupon_redeemed", "step4_option2");
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("coupon_activated", "true");
      }
      navigate("/game/me/zone-of-genius/start-here");
    } else {
      setCouponError(true);
    }
  };

  // Parse the snapshot sections
  const parsedSnapshot = snapshotMarkdown ? parseSnapshotSections(snapshotMarkdown) : null;

  // Get or create profile ID on mount
  useEffect(() => {
    setIsLoadingProfile(true);
    getOrCreateGameProfileId()
      .then(id => {
        setProfileId(id);
        setIsLoadingProfile(false);
      })
      .catch(err => {
        setIsLoadingProfile(false);
      });
  }, []);

  const basePath = getZogAssessmentBasePath(location.pathname);

  // Day 47 very-late pass: fix "You are a The Performing Sage of Justice"
  // article collision. AI sometimes returns archetypes prefixed with "The".
  // Strip "The " so "You are a" flows naturally.
  const cleanedArchetypeTitle = (parsedSnapshot?.archetypeTitle || "").replace(
    /^(the|a|an)\s+/i,
    "",
  );

  // Unified output: prefer the real AppleseedData generated in background
  // (single source of truth used downstream — email funnel, profile cards,
  // Excalibur). Falls back to a snapshot-derived minimum only if the user
  // clicks save before background appleseed completes.
  const buildSavePayload = () => {
    if (appleseed) return appleseed;

    return {
      vibrationalKey: { name: cleanedArchetypeTitle },
      bullseyeSentence:
        (parsedSnapshot?.description || "").split(/\.\s+/)[0]?.slice(0, 280) || "",
      threeLenses: {
        actions: top3Talents.map((t) => t.name),
        primeDriver: parsedSnapshot?.masteryAction || "",
        archetype: cleanedArchetypeTitle,
      },
    };
  };

  const handleSaveSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!saveEmail.trim() || !saveEmail.includes("@")) return;
      setSaveState("saving");
      try {
        await supabase.functions.invoke("save-zog-result", {
          body: {
            email: saveEmail.trim(),
            appleseedData: buildSavePayload(),
            source: "zog_guided_save",
          },
        });
      } catch {
        // Non-blocking — snapshot is already persisted to zog_snapshots.
      }
      setSaveState("saved");
      toast.success("Saved. We sent your Top Talent to your inbox.");
    },
    [saveEmail, parsedSnapshot],
  );

  useEffect(() => {
    if (orderedTalentIds.length === 0) {
      navigate(getZogStepPath(basePath, 3));
      return;
    }

    if (!snapshotMarkdown && !isLoadingProfile && profileId) {
      handleGenerate();
    }
  }, [orderedTalentIds, snapshotMarkdown, navigate, isLoadingProfile, profileId, basePath]);

  const top10Talents = TALENTS.filter(t => selectedTop10TalentIds.includes(t.id));
  const top3Talents = orderedTalentIds.map(id => TALENTS.find(t => t.id === id)!).filter(Boolean);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = buildPrompt();

      const { data, error } = await supabase.functions.invoke("generate-zog-snapshot", {
        body: { prompt },
      });

      if (error) {
        if (error.message?.includes("429") || error.message?.includes("Rate limit")) {
          toast.error("Rate limits exceeded, please try again later.");
        } else if (error.message?.includes("402") || error.message?.includes("Payment")) {
          toast.error("Payment required. Please add funds to your workspace.");
        } else {
          throw error;
        }
        return;
      }

      const generatedText = data?.generatedText || "";
      setSnapshotMarkdown(generatedText);
      toast.success("Your Top Talent Snapshot is ready!");

      await saveSnapshotToDatabase(generatedText);
    } catch (err) {
      toast.error("Failed to generate snapshot. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSnapshotToDatabase = async (snapshotText: string) => {
    if (!profileId) {
      toast.error("Failed to save your snapshot. Please reload and try again.");
      return;
    }

    try {
      const parsed = parseSnapshotSections(snapshotText);

      const top3TalentNames = top3Talents.map(t => t.name);
      const top10TalentNames = top10Talents.map(t => t.name);

      const { data: snapshotData, error: snapshotError } = await supabase
        .from('zog_snapshots')
        .insert({
          profile_id: profileId,
          archetype_title: parsed.archetypeTitle,
          core_pattern: parsed.description,
          top_three_talents: top3TalentNames,
          top_ten_talents: top10TalentNames,
          mastery_action: parsed.masteryAction || null,
          xp_awarded: false,
        })
        .select('id, xp_awarded')
        .single();

      if (snapshotError) {
        throw snapshotError;
      }

      // Wire fix (2026-04-24): pass guided-lane result through the appleseed
      // pipeline so this lane also produces full AppleseedData (12-perspective
      // JSON), not just plain-text snapshot. Runs in background, non-blocking
      // — UI flow continues unchanged. Same row is updated when appleseed
      // completes. This closes the parity gap with the AI lane.
      const guidedRawSignal = `TOP TALENT — GUIDED ASSESSMENT (talent-selection lane)

The user completed a structured assessment, selecting their Top 10 talents from a curated bank, then ordering their Top 3.

TOP 10 TALENTS SELECTED:
${JSON.stringify(top10Talents.map(t => ({ name: t.name, description: t.description })), null, 2)}

TOP 3 CORE TALENTS (in order, 1 = strongest):
${JSON.stringify(top3Talents.map(t => ({ name: t.name, description: t.description })), null, 2)}

FIRST-PASS SNAPSHOT (already synthesized from the talent selection):
${snapshotText}`;

      void generateAppleseed(guidedRawSignal)
        .then(async (appleseedData) => {
          // Make available to buildSavePayload — when user clicks "save email"
          // after this resolves, the email funnel uses the real AppleseedData.
          setAppleseed(appleseedData);
          await supabase
            .from('zog_snapshots')
            .update({
              appleseed_data: appleseedData as unknown as Json,
              appleseed_generated_at: new Date().toISOString(),
              ai_response_raw: guidedRawSignal,
            })
            .eq('id', snapshotData.id);
        })
        .catch((err) => {
          console.warn("[Step4] Guided-lane appleseed processing failed (non-fatal):", err);
        });

      if (!snapshotData.xp_awarded) {
        const { data: profileData } = await supabase
          .from('game_profiles')
          .select('xp_total')
          .eq('id', profileId)
          .single();

        if (profileData) {
          const newXpTotal = profileData.xp_total + 100;
          const newLevel = Math.floor(newXpTotal / 100) + 1;

          await supabase
            .from('game_profiles')
            .update({
              last_zog_snapshot_id: snapshotData.id,
              zone_of_genius_completed: true,
              onboarding_stage: "zog_complete",
              xp_total: newXpTotal,
              level: newLevel,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileId);

          await supabase
            .from('zog_snapshots')
            .update({ xp_awarded: true })
            .eq('id', snapshotData.id);

          toast.success("🎉 +100 XP (Genius)");
        }
      } else {
        await supabase
          .from('game_profiles')
          .update({
            last_zog_snapshot_id: snapshotData.id,
            zone_of_genius_completed: true,
            onboarding_stage: "zog_complete",
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileId);
      }

      toast.success("Your Top Talent has been saved!");
      const redirectPath = getPostZogRedirect(returnTo);
      if (redirectPath) {
        setTimeout(() => navigate(redirectPath), 800);
      }
      // Day 61+ (Sasha 2026-05-04): logActionEvent is best-effort
      // telemetry — wrap in its own try/catch so a failure here can't
      // bubble to the outer catch and trigger the error toast AFTER
      // the success toast. Karime / step-4 walkthrough hit this:
      // snapshot saved correctly, success toast fired, then
      // logActionEvent rejected (or some downstream issue) and the
      // error toast fired right on top. The user saw "Failed to save
      // your snapshot" even though the snapshot was fine.
      try {
        await logActionEvent({
          actionId: `zog-snapshot:${snapshotData.id}`,
          profileId,
          source: "src/modules/zone-of-genius/Step4GenerateSnapshot.tsx",
          loop: "profile",
          selectedAt: new Date().toISOString(),
          metadata: {
            intent: "zog_snapshot_saved",
          },
        });
      } catch (telemetryErr) {
        console.warn("[Step4] logActionEvent failed (non-fatal):", telemetryErr);
      }
    } catch (err) {
      // Only fires if the actual snapshot insert/update or profile
      // update threw — those are the load-bearing operations. Best-
      // effort cleanup (telemetry, redirect) is wrapped above and
      // can't reach here.
      console.error("[Step4] Snapshot save failed:", err);
      toast.error("Failed to save your snapshot. Your progress is still shown, but may not persist.");
    }
  };

  const buildPrompt = () => {
    const top10List = top10Talents.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description
    }));

    const top3List = top3Talents.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description
    }));

    return buildZogSnapshotPrompt({
      top10Talents: top10List,
      top3OrderedTalents: top3List
    });
  };

  function parseSnapshotSections(text: string) {
    const sections: Record<string, string> = {};

    const archetypeMatch = text.match(/Archetype Title:\s*[-–]?\s*(.+?)(?=\n\n|Your Top Talent Description:|$)/s);
    sections.archetypeTitle = archetypeMatch?.[1]?.trim() || "";

    const descriptionMatch = text.match(/Your Top Talent Description.*?:\s*[-–]?\s*(.+?)(?=\n\n|Superpowers in Action:|$)/s);
    sections.description = descriptionMatch?.[1]?.trim() || "";

    const superpowersMatch = text.match(/Superpowers in Action.*?:\s*(.+?)(?=\n\n|Your Edge:|$)/s);
    sections.superpowers = superpowersMatch?.[1]?.trim() || "";

    const edgeMatch = text.match(/Your Edge.*?:\s*(.+?)(?=\n\n|Where This Genius Thrives:|$)/s);
    sections.edge = edgeMatch?.[1]?.trim() || "";

    const thrivesMatch = text.match(/Where This Genius Thrives.*?:\s*(.+?)(?=\n\n|Mastery Action:|$)/s);
    sections.thrives = thrivesMatch?.[1]?.trim() || "";

    const masteryMatch = text.match(/Mastery Action:\s*[-–]?\s*(.+?)$/s);
    sections.masteryAction = masteryMatch?.[1]?.trim() || "";

    return sections;
  }

  const handleDownloadPDF = async () => {
    if (!snapshotRef.current) return;

    setIsDownloading(true);
    try {
      const el = snapshotRef.current;
      el.style.display = 'block';
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '0';

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        foreignObjectRendering: false,
        width: el.scrollWidth,
        height: el.scrollHeight,
        // Day 58 fix (Sasha 2026-05-02): "Failed to execute 'addColorStop'
        // on 'CanvasGradient': non-finite double" — html2canvas walks all
        // ancestor computed styles and chokes on page-level gradients
        // (BokehBackground canvas, CSS vars resolving to NaN stops, etc.).
        // Strip backgrounds on every ancestor of the cloned snapshot and
        // hide background canvases so html2canvas only paints the white
        // PDF surface.
        onclone: (clonedDoc) => {
          const clonedRoot = clonedDoc.querySelector<HTMLElement>('[data-pdf-root="true"]');
          // Walk up from clonedRoot, neutralizing backgrounds.
          let node: HTMLElement | null = clonedRoot?.parentElement ?? null;
          while (node && node !== clonedDoc.documentElement) {
            node.style.background = 'none';
            node.style.backgroundImage = 'none';
            node.style.backgroundColor = 'transparent';
            node = node.parentElement;
          }
          if (clonedDoc.documentElement) {
            clonedDoc.documentElement.style.background = '#ffffff';
            clonedDoc.documentElement.style.backgroundImage = 'none';
          }
          if (clonedDoc.body) {
            clonedDoc.body.style.background = '#ffffff';
            clonedDoc.body.style.backgroundImage = 'none';
          }
          // Hide any sibling canvases / decorative layers.
          clonedDoc.querySelectorAll('canvas, video, iframe').forEach((n) => {
            if (!clonedRoot || !clonedRoot.contains(n)) {
              (n as HTMLElement).style.display = 'none';
            }
          });
        },
      });

      el.style.display = 'none';
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }

      pdf.save('Zone-of-Genius-Snapshot.pdf');

      toast.success("PDF downloaded successfully!");
    } catch (err) {
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    navigate(getZogStepPath(basePath, 3));
  };

  const handleStartNew = () => {
    if (confirm("Are you sure you want to start a new assessment? Your current progress will be lost.")) {
      resetAssessment();
      navigate(getZogStepPath(basePath, 0));
    }
  };

  const formatBullets = (text: string) => {
    return text.split('\n').filter(line => line.trim()).map((line, idx) => {
      const cleanLine = line.replace(/^[-–•]\s*/, '').trim();
      return cleanLine ? <li key={idx}>{cleanLine}</li> : null;
    }).filter(Boolean);
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Day 47 (Sasha): Step 4 no longer brings its own full-page dark shell.
  // The parent ZoneOfGeniusAssessmentLayout now wraps in GameShellV2, so
  // we just render the content — same ambient bg as the rest of the journey.
  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", color: "var(--skin-text-primary, #0a1628)" }}>
      <main className="relative z-10 mx-auto max-w-6xl pb-20 pt-4">
        {/* Day 47: redundant "STEP 5 OF 5 · LIFELINE SNAPSHOT" eyebrow removed —
            the parent AssessmentLayout already renders the step progress pills. */}

        {/* Hero: Result reveal — Day 47 late pass: dark text + Apple Liquid Glass */}
        <section
          className="liquid-glass rounded-3xl px-6 py-12 sm:px-12 sm:py-16 text-center mb-12"
        >
          <p
            className="text-sm uppercase tracking-widest mb-4"
            style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.55))" }}
          >
            Your Top Talent
          </p>
          {parsedSnapshot ? (
            <>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "var(--skin-text-primary, #0a1628)",
                  textShadow: "0 0 22px rgba(255,255,255,0.6), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)",
                }}
              >
                You are a {cleanedArchetypeTitle}
              </h1>
              <p
                className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto font-medium"
                style={{
                  color: "var(--skin-text-muted, rgba(26,30,58,0.75))",
                  textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                }}
              >
                Now you have words for what makes you, you.
              </p>
            </>
          ) : (
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--skin-text-primary, #0a1628)",
                textShadow: "0 0 22px rgba(255,255,255,0.6), 0 1px 2px rgba(255,255,255,0.75)",
              }}
            >
              Discovering Your Top Talent...
            </h1>
          )}
          <p
            className="mt-4 text-sm max-w-2xl mx-auto"
            style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.55))" }}
          >
            This is your current character card — a starting point, not a final verdict.
          </p>
        </section>

        {/* Loading State */}
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <PremiumLoader size="lg" text="Generating your personalized snapshot..." />
          </div>
        ) : parsedSnapshot ? (
          <>
            {/* Day 47 very-late pass (Sasha): single-column flow matching the
                AI-lane AppleseedDisplay. Removed: InviteFriendPrompt (bulky,
                low-value at peak engagement), two-column aside layout, separate
                "If This Hit Home" card (consolidated into primary CTA below),
                "Save & Continue" button (was routing to auth). Added: save-pill
                email capture + a single prominent commercial CTA. Demoted:
                Download PDF → small footer link. */}
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Character Card */}
              <article className="liquid-glass-strong rounded-3xl p-8 sm:p-10">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.55))" }}>
                  Top Talent Character Card
                </p>
                <p className="text-xs mb-6" style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.55))" }}>
                  Generated on: {currentDate}
                </p>

                <h2
                  className="text-2xl sm:text-3xl font-bold text-center mb-6"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "var(--skin-text-primary, #0a1628)",
                    textShadow: "0 1px 2px rgba(255,255,255,0.7)",
                  }}
                >
                  {cleanedArchetypeTitle}
                </h2>

                <div className="mb-6">
                  <p
                    className="text-sm sm:text-base leading-relaxed"
                    style={{ color: "var(--skin-text-strong, rgba(26,30,58,0.88))" }}
                  >
                    {parsedSnapshot.description}
                  </p>
                </div>

                <div
                  className="flex flex-wrap justify-center gap-2 pt-4"
                  style={{ borderTop: "1px solid rgba(26,30,58,0.1)" }}
                >
                  {top3Talents.map(talent => (
                    <span
                      key={talent.id}
                      className="inline-flex items-center rounded-full px-4 py-2 text-xs sm:text-sm font-medium"
                      style={{
                        // Day 48 iter 7 (Sasha): migrated violet → gold for funnel coherence.
                        backgroundColor: "rgba(212,175,55,0.18)",
                        color: "#7a5108",
                      }}
                    >
                      {talent.name}
                    </span>
                  ))}
                </div>
              </article>

              {/* Panel A: Superpowers in Action */}
              <article className="liquid-glass rounded-2xl p-6">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "var(--skin-text-primary, #0a1628)",
                  }}
                >
                  Superpowers in Action
                </h3>
                <p className="text-xs mb-3" style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.65))" }}>
                  How this genius tends to show up when you are on.
                </p>
                <ul
                  className="space-y-2 text-sm list-disc list-inside"
                  style={{ color: "var(--skin-text-strong, rgba(26,30,58,0.88))" }}
                >
                  {formatBullets(parsedSnapshot.superpowers)}
                </ul>
              </article>

              {/* Day 61+ (Sasha 2026-05-04): Edge / Thrives / Mastery
                  Action panels REMOVED. Karime walkthrough showed
                  step-4 was giving away too much depth before the
                  user committed — those three sections are part of
                  the deeper profile that lives behind the activation
                  paywall. Step-4 now mirrors the AI-lane reveal: a
                  punchy archetype card + Superpowers preview, then a
                  clean two-CTA bridge to action. The deeper content
                  remains in the saved snapshot for post-purchase
                  reveal in the ME space. */}

              {/* ═══════════════════════════════════════════════════════
                  BRIDGE LINE + TWO OPTIONS — mirrors the AI-lane
                  AppleseedDisplay reveal (lines ~469-784). Both
                  funnels (manual assessment + AI reveal) hand the
                  user the same offer artifact, same visual register,
                  same coupon path. Roadmap item: extract this whole
                  block into a shared `RevealCTASection` component to
                  eliminate the duplication / drift risk.
                  ═══════════════════════════════════════════════════════ */}

              {/* Bridge — sets up the choice as a question of action */}
              <div
                className="py-10 max-w-lg mx-auto text-center space-y-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "var(--skin-text-primary, #0a1628)",
                  textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                }}
              >
                <p
                  className="text-xl md:text-2xl leading-relaxed"
                  style={{ fontWeight: 500 }}
                >
                  Now the question becomes:
                </p>
                <p
                  className="text-2xl md:text-3xl italic leading-snug"
                  style={{ fontWeight: 500 }}
                >
                  What do you want to{" "}
                  <em
                    className="not-italic"
                    style={{
                      fontWeight: 700,
                      fontStyle: "italic",
                      textDecoration: "underline",
                      textDecorationColor: "var(--skin-accent-gold, #b8860b)",
                      textDecorationThickness: "1.5px",
                      textUnderlineOffset: "5px",
                    }}
                  >
                    do
                  </em>{" "}
                  with your top talent?
                </p>
              </div>

              <div className="space-y-8 max-w-lg mx-auto">
                {/* OPTION 1 — Build a business ($555, primary, large) */}
                <div
                  className="liquid-glass-strong rounded-3xl p-6 sm:p-7 space-y-4 text-center"
                  style={{
                    boxShadow: "0 10px 32px -12px rgba(10,22,40,0.18), inset 0 1px 0 rgba(255,255,255,0.15)",
                    border: "1px solid rgba(26,30,58,0.08)",
                  }}
                >
                  <p
                    className="text-sm sm:text-base italic leading-snug"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                    }}
                  >
                    If you're ready to act:
                  </p>
                  <h3
                    className="leading-[1.15] tracking-[-0.005em]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(1.5rem, 4vw, 1.85rem)",
                      fontWeight: 600,
                      color: "var(--skin-text-primary, #0a1628)",
                    }}
                  >
                    Build a Business From It
                  </h3>
                  <p
                    className="text-base sm:text-lg leading-relaxed"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      color: "var(--skin-text-primary, #0a1628)",
                      fontWeight: 500,
                    }}
                  >
                    Turn your top talent into a clear and sellable business offer.
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                    }}
                  >
                    We do it together in 2 hours.
                  </p>
                  <blockquote
                    className="text-sm italic leading-relaxed pt-1"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      color: "var(--skin-text-primary, #0a1628)",
                    }}
                  >
                    "Everything clicks." — <strong className="not-italic">Sergey Jay Makarov</strong>
                  </blockquote>

                  <a
                    href="/ignite"
                    className="group liquid-glass-dark cta-breath relative w-full rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
                      className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100 flex-shrink-0"
                      style={{
                        filter: "drop-shadow(0 0 6px rgba(244, 212, 114, 0.45))",
                        animation: "gentle-spin 60s linear infinite",
                        willChange: "transform",
                        transformOrigin: "center",
                      }}
                      draggable={false}
                    />
                    <span className="relative inline-block">
                      <span
                        style={CTA_SMALL_CAPS_STYLE}
                        className="block transition-opacity duration-300 group-hover:opacity-0"
                      >
                        Build a business from your top talent — $555
                      </span>
                      <span
                        style={CTA_SMALL_CAPS_STYLE}
                        className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap"
                      >
                        Turn this into an offer
                      </span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                    />
                  </a>
                </div>

                {/* OPTION 2 — Activate ($37, secondary, medium) */}
                <div
                  className="liquid-glass rounded-3xl p-6 sm:p-7 space-y-4 text-center"
                  style={{
                    border: "1px solid rgba(26,30,58,0.06)",
                  }}
                >
                  <p
                    className="text-base italic leading-snug"
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontWeight: 500,
                      color: "var(--skin-text-muted, rgba(11,42,90,0.86))",
                    }}
                  >
                    If you don't want to build your business yet:
                  </p>
                  <h3
                    className="leading-[1.15] tracking-[-0.005em]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(1.5rem, 4vw, 1.85rem)",
                      fontWeight: 600,
                      color: "var(--skin-text-primary, #0a1628)",
                    }}
                  >
                    Find Out How to Use &amp; Monetize Your Top Talent
                  </h3>

                  <a
                    href={STRIPE_ACTIVATE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick("activate_click", "step4_option2")}
                    className="group liquid-glass relative w-full rounded-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "var(--skin-text-primary, #0a1628)",
                      border: "1.5px solid rgba(11,42,90,0.32)",
                      textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                    }}
                  >
                    <span style={CTA_SMALL_CAPS_STYLE}>
                      Leverage your top talent — $37
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                    />
                  </a>

                  <p
                    className="text-xs sm:text-sm font-semibold uppercase leading-relaxed pt-1"
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      letterSpacing: "0.18em",
                      color: "rgba(122, 81, 8, 0.95)",
                    }}
                  >
                    7 min of understanding the value you bring + 6 min of guided meditation to connect with your talent somatically
                  </p>

                  {/* Coupon bypass — collapsed by default */}
                  {!couponOpen ? (
                    <button
                      type="button"
                      onClick={() => setCouponOpen(true)}
                      className="text-sm underline underline-offset-4 transition-opacity duration-200 hover:opacity-100"
                      style={{
                        fontFamily: "'Source Serif 4', serif",
                        fontWeight: 500,
                        color: "var(--skin-text-muted, rgba(11,42,90,0.86))",
                        textDecorationColor: "rgba(11,42,90,0.35)",
                        opacity: 0.95,
                      }}
                    >
                      Have a code?
                    </button>
                  ) : (
                    <form onSubmit={handleCouponSubmit} className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            if (couponError) setCouponError(false);
                          }}
                          autoFocus
                          placeholder="Code"
                          aria-label="Activation code"
                          className="flex-1 min-w-0 rounded-full px-3.5 py-2 text-xs bg-white/70 border outline-none focus:ring-2 focus:ring-[hsla(40,70%,55%,0.45)]"
                          style={{
                            fontFamily: "'Source Serif 4', serif",
                            color: "var(--skin-text-primary, #0a1628)",
                            borderColor: couponError
                              ? "rgba(180, 50, 50, 0.55)"
                              : "rgba(26,30,58,0.18)",
                          }}
                        />
                        <button
                          type="submit"
                          disabled={!couponInput.trim()}
                          className="rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            background: "linear-gradient(135deg, hsla(40, 75%, 60%, 0.32) 0%, hsla(40, 65%, 50%, 0.18) 100%)",
                            border: "1px solid hsla(40, 70%, 55%, 0.50)",
                            color: "#5d4307",
                          }}
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && (
                        <p
                          className="text-[10.5px] text-left pl-1"
                          style={{
                            fontFamily: "'Source Serif 4', serif",
                            color: "rgba(180, 50, 50, 0.85)",
                          }}
                        >
                          Invalid code.
                        </p>
                      )}
                    </form>
                  )}
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════
                  SAVE PILL — matches AI-lane pattern. On submit, fires
                  save-zog-result which creates a silent account, saves
                  the snapshot, sends a magic-link email, and enqueues the
                  3-email nurture sequence.
                  ═══════════════════════════════════════════════════════ */}
              <div className="max-w-md mx-auto pt-2 space-y-2">
                {/* Day 53 (Sasha): "Activate your full Genius Profile" CTA
                    temporarily hidden — /game/me surface is being polished.
                    Users still receive the magic-link email to enter later. */}
                {saveState === "saved" ? (
                  <p className="text-center text-xs" style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}>
                    ✓ Saved. We sent your Top Talent to your inbox so you can come back to it.
                  </p>
                ) : !saveExpanded ? (
                  <button
                    type="button"
                    onClick={() => setSaveExpanded(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-full liquid-glass hover:scale-[1.015] active:scale-[0.985] transition-all duration-300 text-xs"
                    style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Or just email me my result</span>
                  </button>
                ) : (
                  <form
                    onSubmit={handleSaveSubmit}
                    className="flex items-center gap-2 p-2 rounded-full liquid-glass"
                  >
                    <Mail className="w-3.5 h-3.5 ml-2 flex-shrink-0" style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.45))" }} />
                    <input
                      type="email"
                      value={saveEmail}
                      onChange={(e) => setSaveEmail(e.target.value)}
                      placeholder="your@email.com"
                      autoFocus
                      className="flex-1 bg-transparent border-0 text-sm focus:outline-none min-w-0"
                      style={{ color: "var(--skin-text-primary, #0a1628)" }}
                      required
                    />
                    <button
                      type="submit"
                      disabled={saveState === "saving" || !saveEmail.trim()}
                      // Day 48 iter 7 (Sasha): migrated violet → gold for funnel coherence.
                      className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40 transition-colors"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, #a06d08 0%, #7a5108 45%, #6b4208 100%)",
                      }}
                    >
                      {saveState === "saving" ? "Saving…" : "Send it"}
                    </button>
                  </form>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════
                  FOOTER — quiet row of tertiary options: PDF / Share /
                  Back / Start Over. Everything de-emphasized.
                  ═══════════════════════════════════════════════════════ */}
              <div
                className="mt-10 pt-8 flex flex-col items-center gap-4 text-sm"
                style={{ borderTop: "1px solid rgba(26,30,58,0.1)" }}
              >
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 transition-colors hover:underline"
                    style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}
                  >
                    {isDownloading ? (
                      <>
                        <span className="premium-spinner w-3 h-3" />
                        <span>Generating PDF…</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                  <span style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.2))" }}>·</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.share) {
                        navigator.share({
                          title: "My Top Talent",
                          text: `I just discovered my Top Talent: ${cleanedArchetypeTitle}.`,
                          url: `${window.location.origin}/zone-of-genius`,
                        }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(`${window.location.origin}/zone-of-genius`);
                        toast.success("Link copied — share with a friend.");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 transition-colors hover:underline"
                    style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share this reveal</span>
                  </button>
                  <span style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.2))" }}>·</span>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 transition-colors hover:underline"
                    style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                  <span style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.2))" }}>·</span>
                  <button
                    type="button"
                    onClick={handleStartNew}
                    className="transition-colors hover:underline"
                    style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden PDF content — uses inline styles for reliable html2canvas rendering */}
            <div ref={snapshotRef} data-pdf-root="true" style={{ display: 'none' }}>
              <div style={{
                width: '794px',
                backgroundColor: '#ffffff',
                padding: '48px 56px',
                fontFamily: '"DM Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                color: '#2c3150',
                lineHeight: 1.6,
              }}>
                {/* PDF Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #a4a3d020' }}>
                  <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(44,49,80,0.5)', marginBottom: '4px' }}>
                    Top Talent Character Card
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(44,49,80,0.5)', marginBottom: '24px' }}>
                    Generated on: {currentDate}
                  </p>

                  {/* Top 3 talent pills */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
                    {top3Talents.map(talent => (
                      <span
                        key={talent.id}
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#2c3150',
                          color: '#ffffff',
                          padding: '8px 20px',
                          borderRadius: '999px',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        {talent.name}
                      </span>
                    ))}
                  </div>

                  <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#2c3150', marginBottom: '16px', fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                    {parsedSnapshot.archetypeTitle}
                  </h1>

                  <p style={{ fontSize: '15px', color: '#2c3150', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
                    {parsedSnapshot.description}
                  </p>
                </div>

                {/* Superpowers */}
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#2c3150', marginBottom: '8px', fontFamily: '"DM Sans", sans-serif' }}>
                    Superpowers in Action
                  </h2>
                  <ul style={{ fontSize: '14px', color: '#2c3150', paddingLeft: '20px', listStyleType: 'disc', lineHeight: 1.8 }}>
                    {formatBullets(parsedSnapshot.superpowers)}
                  </ul>
                </div>

                {/* Edge */}
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#2c3150', marginBottom: '8px', fontFamily: '"DM Sans", sans-serif' }}>
                    Your Edge (Where You Trip Yourself Up)
                  </h2>
                  <ul style={{ fontSize: '14px', color: '#2c3150', paddingLeft: '20px', listStyleType: 'disc', lineHeight: 1.8 }}>
                    {formatBullets(parsedSnapshot.edge)}
                  </ul>
                </div>

                {/* Thrives */}
                <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#2c3150', marginBottom: '8px', fontFamily: '"DM Sans", sans-serif' }}>
                    Where This Genius Thrives
                  </h2>
                  <ul style={{ fontSize: '14px', color: '#2c3150', paddingLeft: '20px', listStyleType: 'disc', lineHeight: 1.8 }}>
                    {formatBullets(parsedSnapshot.thrives)}
                  </ul>
                </div>

                {/* Mastery Action */}
                {parsedSnapshot.masteryAction && (
                  <div style={{ marginBottom: '24px', padding: '16px 20px', backgroundColor: '#f0f4ff', borderRadius: '12px', border: '1px solid rgba(132,96,234,0.15)' }}>
                    <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#2c3150', marginBottom: '8px', fontFamily: '"DM Sans", sans-serif' }}>
                      🔁 Your Mastery Action
                    </h2>
                    <p style={{ fontSize: '15px', color: '#2c3150', fontWeight: 500, lineHeight: 1.7 }}>
                      {parsedSnapshot.masteryAction}
                    </p>
                  </div>
                )}

                {/* PDF Footer CTA — Day 47 late pass: aligned with /ignite canonical */}
                <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(164,163,208,0.2)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#2c3150', marginBottom: '8px' }}>
                    Ready to turn this into a business?
                  </h3>
                  <p style={{ fontSize: '13px', color: '#2c3150', marginBottom: '8px', lineHeight: 1.7 }}>
                    You've named your Top Talent. The next step is structuring it into something people
                    can buy. Aleksandr runs a focused Productize Yourself Session to compile your entire
                    unique business on one page.
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#2c3150' }}>
                    $555 · 2 hours · Book at findyourtoptalent.com/ignite
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default Step4GenerateSnapshot;
