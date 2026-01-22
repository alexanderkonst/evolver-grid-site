import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
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
        // Don't block the UI, just log the error
      });
  }, []);

  const basePath = getZogAssessmentBasePath(location.pathname);

  useEffect(() => {
    if (orderedTalentIds.length === 0) {
      navigate(getZogStepPath(basePath, 3));
      return;
    }

    // Only auto-generate once profileId is loaded
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

      // Save snapshot to database
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

      // Prepare talent arrays
      const top3TalentNames = top3Talents.map(t => t.name);
      const top10TalentNames = top10Talents.map(t => t.name);

      // Insert snapshot
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


      // Award XP for completing ZoG (only if not already awarded)
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

          // Mark snapshot as XP awarded
          await supabase
            .from('zog_snapshots')
            .update({ xp_awarded: true })
            .eq('id', snapshotData.id);

          toast.success("🎉 +100 XP (Genius)");
        }
      } else {
        // Just update the reference without awarding XP again
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

    // Extract sections by looking for labels
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
      // Temporarily show the hidden PDF content
      snapshotRef.current.classList.remove('hidden');

      const canvas = await html2canvas(snapshotRef.current, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        foreignObjectRendering: false,
      });

      // Hide it again
      snapshotRef.current.classList.add('hidden');

      // Use JPEG for smaller file size
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Add additional pages if needed
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

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-6">
        <p className="text-xs font-medium uppercase  text-slate-500">
          STEP 5 OF 5 · LIFELINE SNAPSHOT
        </p>
      </div>

      {/* Hero: Result Screen per UX Playbook */}
      <section className="rounded-3xl bg-slate-50 px-6 py-12 sm:px-12 sm:py-16 text-center border border-slate-200 shadow-sm mb-12">
        <p className="text-sm uppercase tracking-wide text-slate-500 mb-4">
          Your Zone of Genius
        </p>
        {parsedSnapshot ? (
          <>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
              You are a {parsedSnapshot.archetypeTitle}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto font-medium">
              Now you have words for what makes you, you.
            </p>
          </>
        ) : (
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            Discovering Your Zone of Genius...
          </h1>
        )}
        <p className="mt-4 text-sm text-slate-500 max-w-2xl mx-auto">
          This is your current character card — a starting point, not a final verdict.
        </p>
      </section>

      {/* Loading State */}
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-slate-600" />
          <p className="text-lg text-slate-600">Generating your personalized snapshot...</p>
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
              <article className="rounded-3xl border-2 border-slate-900/10 bg-white p-8 sm:p-10 shadow-lg">
                <p className="text-xs uppercase  text-slate-500 mb-1">
                  Zone of Genius Character Card
                </p>
                <p className="text-xs text-slate-500 mb-6">
                  Generated on: {currentDate}
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6">
                  {parsedSnapshot.archetypeTitle}
                </h2>

                <div className="prose prose-sm sm:prose-base max-w-none mb-6">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {parsedSnapshot.description}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-slate-200">
                  {top3Talents.map(talent => (
                    <span
                      key={talent.id}
                      className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs sm:text-sm font-medium text-white"
                    >
                      {talent.name}
                    </span>
                  ))}
                </div>
              </article>

              {/* Panel A: Superpowers in Action */}
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Superpowers in Action
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  How this genius tends to show up when you are on.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                  {formatBullets(parsedSnapshot.superpowers)}
                </ul>
              </article>

              {/* Panel B: Your Edge */}
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Your Edge (Where You Trip Yourself Up)
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Your supershadow — the flip side of your gift. Growth happens here.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                  {formatBullets(parsedSnapshot.edge)}
                </ul>
              </article>

              {/* Panel C: Where This Genius Thrives */}
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Where This Genius Thrives
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Environments and roles where this pattern tends to shine.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                  {formatBullets(parsedSnapshot.thrives)}
                </ul>
              </article>

              {/* Panel D: Mastery Action */}
              {parsedSnapshot.masteryAction && (
                <article className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    🔁 Your Mastery Action
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    One repeatable action that builds mastery over time.
                  </p>
                  <p className="text-base text-slate-800 font-medium leading-relaxed">
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download My Zone of Genius Snapshot (PDF)</span>
                  </>
                )}
              </button>

              {/* Session card: If This Hit Home */}
              <article className="rounded-2xl border border-slate-300 bg-slate-50 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  If This Hit Home
                </h3>
                <p className="text-xs text-slate-700 mb-3">
                  If this description feels uncannily accurate and you want help turning it into concrete career moves,
                  Aleksandr offers a focused Career Re-Ignition Session to design a 3-step plan around your Zone of Genius.
                </p>
                <p className="text-xs font-semibold text-slate-900 mb-3">
                  $297 · 90 minutes
                </p>
                <a
                  href="https://www.calendly.com/konstantinov"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Book a Deep-Dive Session
                  <ExternalLink className="w-3 h-3" />
                </a>
              </article>
            </aside>
          </div>

          {/* Footer: Magic button per UX Playbook */}
          <div className="mt-16 pt-8 border-t border-slate-200 text-center space-y-6">
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Ready to put your genius to work? Start growing with daily practices tailored to your unique pattern.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {returnTo === "genius-offer" ? (
                <button
                  onClick={() => navigate("/genius-offer-intake?from=zog")}
                  className="px-8 py-3 text-base font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-lg"
                >
                  Continue to Genius Offer Creation
                </button>
              ) : (
                <button
                  onClick={() => navigate(getPostZogRedirect(returnTo) || "/quality-of-life-map/assessment?return=onboarding")}
                  className="px-8 py-3 text-base font-semibold rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-lg"
                >
                  Save & Continue
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-sm">
              <button
                onClick={handleBack}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Back
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleStartNew}
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>

          {/* Hidden PDF content */}
          <div ref={snapshotRef} className="hidden">
            <div className="bg-white p-12" style={{ width: '800px' }}>
              {/* PDF Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-slate-200">
                <p className="text-xs uppercase  text-slate-500 mb-2">
                  Zone of Genius Character Card
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Generated on: {currentDate}
                </p>

                {/* Top 3 talents prominently at top */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  {top3Talents.map(talent => (
                    <span
                      key={talent.id}
                      className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white"
                    >
                      {talent.name}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  {parsedSnapshot.archetypeTitle}
                </h1>

                <div className="max-w-2xl mx-auto">
                  <p className="text-base text-slate-700 leading-relaxed">
                    {parsedSnapshot.description}
                  </p>
                </div>
              </div>

              {/* PDF Body: Panels */}
              <div className="space-y-6">
                {/* Superpowers */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    Superpowers in Action
                  </h2>
                  <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                    {formatBullets(parsedSnapshot.superpowers)}
                  </ul>
                </div>

                {/* Edge */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    Your Edge (Where You Trip Yourself Up)
                  </h2>
                  <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                    {formatBullets(parsedSnapshot.edge)}
                  </ul>
                </div>

                {/* Thrives */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">
                    Where This Genius Thrives
                  </h2>
                  <ul className="space-y-1.5 text-sm text-slate-700 list-disc list-inside">
                    {formatBullets(parsedSnapshot.thrives)}
                  </ul>
                </div>

                {/* PDF Footer CTA */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    Ready to Turn Insight into Action?
                  </h3>
                  <p className="text-sm text-slate-700 mb-2">
                    This is just the beginning. If you'd like support translating your Zone of Genius into a clear,
                    confident career move, Aleksandr offers a focused 90-minute Career Re-Ignition Session to
                    transform your ZoG insights into a 3-step strategic action plan to land your next fulfilling role.
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    Book My Career Re-Ignition Session at calendly.com/konstantinov
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
};

export default Step4GenerateSnapshot;
