import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, ExternalLink, ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { logActionEvent } from "@/lib/actionEvents";
import { getPostZogRedirect } from "@/lib/onboardingRouting";
import { getZogAssessmentBasePath, getZogStepPath } from "./zogRoutes";
import InviteFriendPrompt from "@/components/sharing/InviteFriendPrompt";

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
  const snapshotRef = useRef<HTMLDivElement>(null);

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
      toast.success("Your Zone of Genius Snapshot is ready!");

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

      toast.success("Your Zone of Genius has been saved!");
      const redirectPath = getPostZogRedirect(returnTo);
      if (redirectPath) {
        setTimeout(() => navigate(redirectPath), 800);
      }
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
    } catch (err) {
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

  function buildZogSnapshotPrompt(payload: {
    top10Talents: { id: number; name: string; description: string; }[];
    top3OrderedTalents: { id: number; name: string; description: string; }[];
  }): string {
    return `You are helping a person integrate their Zone of Genius.
They have just completed an assessment where they selected their Top 10 talents and Top 3 core talents.
Use the information below to generate a short, premium, highly practical snapshot of their pattern.

INPUT:
Top 10 talents:
${JSON.stringify(payload.top10Talents, null, 2)}

Top 3 core talents in order (1 = strongest / most used):
${JSON.stringify(payload.top3OrderedTalents, null, 2)}

OUTPUT:
Write plain text (no markdown headings) with the following clearly labeled sections, in this exact order:

Archetype Title:
– 1 short phrase that names their Zone of Genius archetype. It should be 6 words or fewer, easy to say out loud, and feel like a character name (e.g., 'Ethical Architect of Systems').

Your Zone of Genius Description (3–4 rich sentences):
– What this genius naturally seeks or does when active.
– How it shows up when they are at their best.
– The unique value they bring to environments.
– Make this feel like a fuller character description, not just a summary.

Superpowers in Action (3 bullets max):
– Each bullet 1 sentence.
– Describe concrete ways this pattern shows up in daily life and work when they are at their best.

Your Edge (3 bullets max):
– This is their supershadow — the flip side of their gift where growth happens.
– Each bullet 1 sentence.
– Be direct, piercing, uncomfortable but true. Name the most common ways they overuse, distort, or sabotage this pattern.
– Make it cut deeper than generic warnings. This should feel like an honest mirror.

Where This Genius Thrives (exactly 6 bullets):
– Each bullet 1 sentence.
– Describe roles, environments, types of work, collaboration styles, and impact areas where this pattern tends to shine.
– Mix specificity: include role types, cultural fit, ideal collaborators, and contribution directions.

Mastery Action:
– Answer this question: "Knowing my Zone of Genius and all you know about me, what's one action that if repeated again and again, successfully leads me to being more masterful each time this action is performed?"
– Write exactly 1 sentence, max 25 words.
– Be specific, concrete, and actionable. This should be a repeatable practice, not a vague aspiration.
– Example: "Spend 15 minutes daily sketching system diagrams that connect disparate ideas into unified frameworks."

GENERAL STYLE RULES:
– Use clear, simple language a smart 15-year-old could understand.
– No paragraphs longer than 2 sentences in the description section.
– No more than 20 words per sentence.
– Speak directly to 'you'.
– Avoid generic self-help clichés. Make it feel tailored, precise, and surprising.
– For Your Edge: be honest and sharp, but not cruel. Frame as "working skillfully with your own pattern."`.trim();
  }

  function parseSnapshotSections(text: string) {
    const sections: Record<string, string> = {};

    const archetypeMatch = text.match(/Archetype Title:\s*[-–]?\s*(.+?)(?=\n\n|Your Zone of Genius Description:|$)/s);
    sections.archetypeTitle = archetypeMatch?.[1]?.trim() || "";

    const descriptionMatch = text.match(/Your Zone of Genius Description.*?:\s*[-–]?\s*(.+?)(?=\n\n|Superpowers in Action:|$)/s);
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
    <div style={{ fontFamily: "'Poppins', sans-serif", color: "#0a1628" }}>
      <main className="relative z-10 mx-auto max-w-6xl pb-20 pt-4">
        {/* Day 47: redundant "STEP 5 OF 5 · LIFELINE SNAPSHOT" eyebrow removed —
            the parent AssessmentLayout already renders the step progress pills. */}

        {/* Hero: Result reveal — Day 47 late pass: dark text + Apple Liquid Glass */}
        <section
          className="liquid-glass rounded-3xl px-6 py-12 sm:px-12 sm:py-16 text-center mb-12"
        >
          <p
            className="text-sm uppercase tracking-widest mb-4"
            style={{ color: "rgba(26,30,58,0.55)" }}
          >
            Your Zone of Genius
          </p>
          {parsedSnapshot ? (
            <>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "#0a1628",
                  textShadow: "0 0 22px rgba(255,255,255,0.6), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)",
                }}
              >
                You are a {parsedSnapshot.archetypeTitle}
              </h1>
              <p
                className="mt-4 text-lg sm:text-xl max-w-2xl mx-auto font-medium"
                style={{
                  color: "rgba(26,30,58,0.75)",
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
                color: "#0a1628",
                textShadow: "0 0 22px rgba(255,255,255,0.6), 0 1px 2px rgba(255,255,255,0.75)",
              }}
            >
              Discovering Your Zone of Genius...
            </h1>
          )}
          <p
            className="mt-4 text-sm max-w-2xl mx-auto"
            style={{ color: "rgba(26,30,58,0.55)" }}
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
            <InviteFriendPrompt
              profileId={profileId}
              source="src/modules/zone-of-genius/Step4GenerateSnapshot.tsx"
              className="mb-8"
            />
            {/* Main Layout: Two columns */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)]">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                {/* Character Card */}
                <article className="liquid-glass-strong rounded-3xl p-8 sm:p-10">
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(26,30,58,0.5)" }}>
                    Zone of Genius Character Card
                  </p>
                  <p className="text-xs mb-6" style={{ color: "rgba(26,30,58,0.5)" }}>
                    Generated on: {currentDate}
                  </p>

                  <h2
                    className="text-2xl sm:text-3xl font-bold text-center mb-6"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "#0a1628",
                      textShadow: "0 1px 2px rgba(255,255,255,0.7)",
                    }}
                  >
                    {parsedSnapshot.archetypeTitle}
                  </h2>

                  <div className="mb-6">
                    <p
                      className="text-sm sm:text-base leading-relaxed"
                      style={{ color: "rgba(26,30,58,0.82)" }}
                    >
                      {parsedSnapshot.description}
                    </p>
                  </div>

                  <div
                    className="flex flex-wrap justify-center gap-2 pt-4"
                    style={{ borderTop: "1px solid rgba(26,30,58,0.08)" }}
                  >
                    {top3Talents.map(talent => (
                      <span
                        key={talent.id}
                        className="inline-flex items-center rounded-full px-4 py-2 text-xs sm:text-sm font-medium"
                        style={{
                          backgroundColor: "rgba(91,33,182,0.12)",
                          color: "#5b21b6",
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
                      color: "#0a1628",
                    }}
                  >
                    Superpowers in Action
                  </h3>
                  <p className="text-xs mb-3" style={{ color: "rgba(26,30,58,0.55)" }}>
                    How this genius tends to show up when you are on.
                  </p>
                  <ul
                    className="space-y-2 text-sm list-disc list-inside"
                    style={{ color: "rgba(26,30,58,0.82)" }}
                  >
                    {formatBullets(parsedSnapshot.superpowers)}
                  </ul>
                </article>

                {/* Panel B: Your Edge */}
                <article className="liquid-glass rounded-2xl p-6">
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "#0a1628",
                    }}
                  >
                    Your Edge (Where You Trip Yourself Up)
                  </h3>
                  <p className="text-xs mb-3" style={{ color: "rgba(26,30,58,0.55)" }}>
                    Your supershadow — the flip side of your gift. Growth happens here.
                  </p>
                  <ul
                    className="space-y-2 text-sm list-disc list-inside"
                    style={{ color: "rgba(26,30,58,0.82)" }}
                  >
                    {formatBullets(parsedSnapshot.edge)}
                  </ul>
                </article>

                {/* Panel C: Where This Genius Thrives */}
                <article className="liquid-glass rounded-2xl p-6">
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "#0a1628",
                    }}
                  >
                    Where This Genius Thrives
                  </h3>
                  <p className="text-xs mb-3" style={{ color: "rgba(26,30,58,0.55)" }}>
                    Environments and roles where this pattern tends to shine.
                  </p>
                  <ul
                    className="space-y-2 text-sm list-disc list-inside"
                    style={{ color: "rgba(26,30,58,0.82)" }}
                  >
                    {formatBullets(parsedSnapshot.thrives)}
                  </ul>
                </article>

                {/* Panel D: Mastery Action */}
                {parsedSnapshot.masteryAction && (
                  <article className="liquid-glass-strong rounded-2xl p-6">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "#0a1628",
                      }}
                    >
                      🔁 Your Mastery Action
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "rgba(26,30,58,0.55)" }}>
                      One repeatable action that builds mastery over time.
                    </p>
                    <p
                      className="text-base font-medium leading-relaxed"
                      style={{ color: "#0a1628" }}
                    >
                      {parsedSnapshot.masteryAction}
                    </p>
                  </article>
                )}

              </div>

              {/* RIGHT COLUMN */}
              <aside className="space-y-6">
                {/* Download PDF button */}
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="w-full liquid-glass-strong inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  style={{
                    color: "#0a1628",
                    textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                  }}
                >
                  {isDownloading ? (
                    <>
                      <span className="premium-spinner w-4 h-4" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download My Snapshot (PDF)</span>
                    </>
                  )}
                </button>

                {/* Session card: If This Hit Home */}
                <article className="liquid-glass rounded-2xl p-5">
                  <h3
                    className="text-sm font-semibold mb-2"
                    style={{ color: "#0a1628" }}
                  >
                    If This Hit Home
                  </h3>
                  <p
                    className="text-xs mb-3"
                    style={{ color: "rgba(26,30,58,0.7)" }}
                  >
                    If this description feels uncannily accurate and you want help turning it into concrete career moves,
                    Aleksandr offers a focused Career Re-Ignition Session to design a 3-step plan around your Zone of Genius.
                  </p>
                  <p
                    className="text-xs font-semibold mb-3"
                    style={{ color: "#0a1628" }}
                  >
                    $297 · 90 minutes
                  </p>
                  <a
                    href="https://www.calendly.com/konstantinov"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium liquid-glass-strong transition-all hover:scale-[1.02]"
                    style={{
                      color: "#0a1628",
                      textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                    }}
                  >
                    Book a Deep-Dive Session
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </article>
              </aside>
            </div>

            {/* Footer: Magic button */}
            <div
              className="mt-16 pt-8 text-center space-y-6"
              style={{ borderTop: "1px solid rgba(26,30,58,0.1)" }}
            >
              <p
                className="text-sm max-w-2xl mx-auto"
                style={{ color: "rgba(26,30,58,0.65)" }}
              >
                Ready to put your genius to work? Start growing with daily practices tailored to your unique pattern.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {returnTo === "genius-offer" ? (
                  <button
                    onClick={() => navigate("/genius-offer-intake?from=zog")}
                    className="liquid-glass-strong px-8 py-3 text-base font-semibold rounded-full transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                    style={{
                      color: "#0a1628",
                      textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                    }}
                  >
                    <Sparkles size={16} style={{ color: "#5b21b6" }} />
                    Continue to Genius Offer Creation
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(getPostZogRedirect(returnTo) || "/quality-of-life-map/assessment?return=onboarding")}
                    className="liquid-glass-strong px-8 py-3 text-base font-semibold rounded-full transition-all hover:scale-[1.02] active:scale-95"
                    style={{
                      color: "#0a1628",
                      textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                    }}
                  >
                    Save & Continue
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 text-sm">
                <button
                  onClick={handleBack}
                  className="transition-colors"
                  style={{ color: "rgba(26,30,58,0.5)" }}
                >
                  ← Back
                </button>
                <span style={{ color: "rgba(26,30,58,0.2)" }}>|</span>
                <button
                  onClick={handleStartNew}
                  className="transition-colors"
                  style={{ color: "rgba(26,30,58,0.5)" }}
                >
                  Start Over
                </button>
              </div>
            </div>

            {/* Hidden PDF content — uses inline styles for reliable html2canvas rendering */}
            <div ref={snapshotRef} style={{ display: 'none' }}>
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
                    Zone of Genius Character Card
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

                {/* PDF Footer CTA */}
                <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(164,163,208,0.2)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#2c3150', marginBottom: '8px' }}>
                    Ready to Turn Insight into Action?
                  </h3>
                  <p style={{ fontSize: '13px', color: '#2c3150', marginBottom: '8px', lineHeight: 1.7 }}>
                    This is just the beginning. If you'd like support translating your Zone of Genius into a clear,
                    confident career move, Aleksandr offers a focused 90-minute Career Re-Ignition Session to
                    transform your ZoG insights into a 3-step strategic action plan to land your next fulfilling role.
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#2c3150' }}>
                    Book My Career Re-Ignition Session at calendly.com/konstantinov
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
