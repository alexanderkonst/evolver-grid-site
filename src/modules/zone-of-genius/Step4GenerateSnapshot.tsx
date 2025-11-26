import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useZoneOfGenius } from "./ZoneOfGeniusContext";
import { TALENTS } from "./talents";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReactMarkdown from "react-markdown";

const Step4GenerateSnapshot = () => {
  const navigate = useNavigate();
  const {
    selectedTop10TalentIds,
    orderedTalentIds,
    snapshotMarkdown,
    setSnapshotMarkdown,
  } = useZoneOfGenius();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [archetypeTitle, setArchetypeTitle] = useState<string>("");
  const snapshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderedTalentIds.length === 0) {
      navigate("/zone-of-genius/assessment/step-3");
      return;
    }
    
    // Auto-generate if not already generated
    if (!snapshotMarkdown) {
      handleGenerate();
    }
  }, [orderedTalentIds, snapshotMarkdown, navigate]);

  // Extract archetype title from markdown
  useEffect(() => {
    if (snapshotMarkdown) {
      const lines = snapshotMarkdown.split('\n');
      const firstBoldLine = lines.find(line => line.startsWith('**Your Zone of Genius:'));
      if (firstBoldLine) {
        const match = firstBoldLine.match(/\*\*Your Zone of Genius: (.+?)\*\*/);
        if (match) {
          setArchetypeTitle(match[1]);
        }
      }
    }
  }, [snapshotMarkdown]);

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
    } catch (err) {
      console.error("Snapshot generation error:", err);
      toast.error("Failed to generate snapshot. Please try again.");
    } finally {
      setIsGenerating(false);
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
    top10Talents: {
      id: number;
      name: string;
      description: string;
    }[];
    top3OrderedTalents: {
      id: number;
      name: string;
      description: string;
    }[];
  }): string {
    return `
You are Aleksandr's AI assistant helping professionals in career transition clarify their Zone of Genius.

User context:
- They just completed a Zone of Genius assessment.
- You are given:
  - Their top 10 selected talents (names + descriptions).
  - Their top 3 core talents, in order of how naturally and frequently they are used.

Use an encouraging, grounded tone. Speak directly to one person as "you".  
Avoid fluff. Every sentence should feel specific and useful.

----------------
DATA
----------------

Top 10 talents:
${JSON.stringify(payload.top10Talents, null, 2)}

Top 3 core talents in order (1 = strongest / most used):
${JSON.stringify(payload.top3OrderedTalents, null, 2)}

----------------
TASK
----------------

Based on this, generate a **short Markdown report** called a "ZoG Lifeline Snapshot".

The entire output must be:
- Highly specific and surprising (it should feel like "wow, this is really me"),
- Extremely concise (no long essays),
- Immediately useful for real life and career decisions.

STRUCTURE (in Markdown):

1. **Title line (with archetype)**  
   - One line in bold.  
   - Format: **"Your Zone of Genius: [short archetype phrase]"**  
   - The archetype phrase should be 3–7 words that capture their style, e.g. "Systemic Visionary Connector", "Empathic Strategy Alchemist", "Precision Builder of Fair Systems".
   - Do not reuse generic archetype labels like "Leader", "Helper", "Thinker" without adding a unique twist.

2. **Core Snapshot (2–3 sentences)**  
   - A short paragraph summarizing:
     - How their genius naturally wants to move in the world,
     - What they are like when they are at their best,
     - The kind of value they instinctively bring to people and systems.
   - Keep this tight but deep. No more than 80–100 words.

3. **How Your Genius Shows Up (Core Expression Patterns)**  
   - Heading: \`### How Your Genius Shows Up\`
   - 3–5 bullet points.
   - Describe how their talents typically express themselves in behavior, energy, and contribution.
   - Each bullet:
     - Max ~20 words.
     - Should feel concrete and observable (e.g., "You naturally turn messy ideas into clear structures that others can act on.").

4. **Career & Contribution Sweet Spots**  
   - Heading: \`### Career & Contribution Sweet Spots\`
   - 4–6 bullet points mixing the following ideas (do NOT make separate sections; keep them in one bullet list):
     - 2–3 **highly-specific job role patterns** or "kind of roles" where this combo of talents is especially valuable.
       - Example style: "Service design lead in mission-driven health tech", "Systems-oriented program manager in social impact organizations".
     - 1–2 bullets about **ideal workplace culture fit** (e.g., fast-paced vs. reflective, structured vs. fluid, big-picture vs. detail-focused).
     - 1 bullet about **ideal collaborators** (the kinds of people they do their best work with).
     - 1 bullet pointing to a natural direction for **impact / movements / advocacy causes** where their talents could contribute meaningfully.
   - Make these bullets feel like "oh, that IS me" – concrete, not vague.

5. **Everyday Life Alignment (This Week)**  
   - Heading: \`### Everyday Life Alignment (This Week)\`
   - 4–6 short bullets with practical suggestions that project their genius into daily life.
   - Draw from these dimensions, but keep it short and integrated (one list, not many sections):
     - **Daily routine tweaks** that support their genius (e.g., type of morning focus block, energy rhythm).
     - **Workspace design** ideas (e.g., visual aesthetic, noise level, structure vs. creative chaos) that match their talents.
     - 1–2 **artistic hobbies or creative outlets** that would feel especially nourishing for their pattern (e.g., improvisational dance vs. detailed design vs. strategy games).
     - 1 suggestion for a **meditation / inner practice** or reflective ritual best suited to their style (e.g., analytical journaling, somatic breath, devotional practice, visualization).
     - 1 suggestion for **nature / unconventional adventure** that would refresh and expand their genius (e.g., solo forest walks, group hikes, ocean time, improv workshop).
   - Each bullet:
     - Max ~20 words,
     - Framed as an invitation ("Try...", "Experiment with...", "Give yourself...").

6. **Gentle Closing Line**  
   - One short closing sentence that invites them to honor and trust their gifts.
   - Keep it soft and encouraging. Do NOT mention the Career Re-Ignition Session here.

STYLE GUIDELINES:

- Do NOT write more sections than requested.
- Keep the whole output on the shorter side: no walls of text.
- Make it feel eerily specific to THIS combination of talents.
- Avoid cliches like "you are a natural born leader" unless followed by something very concrete and unique.
- Use plain, human language. No jargon.

Output ONLY the Markdown content described above. Do not include explanations of what you are doing.
    `.trim();
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

      // Use JPEG for much smaller file size
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
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    navigate("/zone-of-genius/assessment/step-3");
  };

  const handleStartNew = () => {
    if (confirm("Are you sure you want to start a new assessment? Your current progress will be lost.")) {
      setSnapshotMarkdown(null);
      navigate("/zone-of-genius/assessment/step-1");
    }
  };

  // Custom Markdown components for styling
  const markdownComponents = {
    h3: (props: any) => (
      <h3
        className="mt-6 text-sm sm:text-base font-semibold text-slate-900 first:mt-0"
        {...props}
      />
    ),
    p: (props: any) => (
      <p className="mt-3 text-sm leading-relaxed text-slate-700" {...props} />
    ),
    ul: (props: any) => (
      <ul className="mt-3 space-y-2" {...props} />
    ),
    li: (props: any) => (
      <li className="ml-4 list-disc text-sm leading-relaxed text-slate-700" {...props} />
    ),
    strong: (props: any) => (
      <strong className="font-semibold text-slate-900" {...props} />
    ),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      {/* De-emphasized Step Indicator */}
      <div className="mb-8 text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Step 4 of 4</p>
      </div>

      {/* Main Heading */}
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          Your Zone of Genius Snapshot
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          This is your personalized ZoG Lifeline Snapshot, based on your top talents.
        </p>
      </div>

      {/* Reassurance Line */}
      <p className="mt-4 text-xs sm:text-sm text-slate-500 text-center mb-8">
        This isn't a generic template. It's generated from your specific talent
        pattern and refreshed every time you redo the assessment.
      </p>

      {/* Top 3 Talents as Pills */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center mb-8">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Your top 3 core talents
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {top3Talents.map(talent => (
            <span
              key={talent.id}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs sm:text-sm text-slate-700 shadow-sm"
            >
              {talent.name}
            </span>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-slate-600" />
          <p className="text-lg text-slate-600">Generating your personalized snapshot...</p>
        </div>
      ) : snapshotMarkdown ? (
        <>
          {/* Two-Column Layout */}
          <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.1fr)]">
            {/* Left Column: Snapshot */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 sm:p-8 shadow-sm animate-fade-in">
              {/* Archetype Badge */}
              {archetypeTitle && (
                <div className="mb-4 inline-flex items-center rounded-full bg-slate-900 text-slate-50 px-4 py-1 text-xs sm:text-sm">
                  {archetypeTitle}
                </div>
              )}

              {/* Snapshot Content */}
              <div>
                <ReactMarkdown components={markdownComponents}>
                  {snapshotMarkdown}
                </ReactMarkdown>
              </div>
            </div>

            {/* Right Column: Summary & Actions */}
            <div className="space-y-4">
              {/* Quick Summary */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Snapshot in One Glance
                </h2>
                <ul className="mt-3 space-y-1.5 text-xs sm:text-sm text-slate-700">
                  <li>• 3 core talents in action</li>
                  <li>• Career & contribution sweet spots</li>
                  <li>• Everyday life alignment ideas for this week</li>
                </ul>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-50 shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
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

              {/* CTA Card */}
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 sm:p-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Ready to Turn Insight into Action?
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-700">
                  If you'd like support turning this snapshot into a clear, confident move,
                  book a focused Career Re-Ignition Session with Aleksandr.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-900">$297 · 60–90 minutes</p>
                <a
                  href="https://www.calendly.com/konstantinov"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs sm:text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Book My Session
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </section>

          {/* PDF Version (Hidden) */}
          <div ref={snapshotRef} className="hidden">
            <div className="bg-white p-12 space-y-8" style={{ width: '210mm', minHeight: '297mm' }}>
              {/* Sacred Talents Header */}
              <div className="text-center space-y-6 pb-8 border-b-2 border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
                  Your Core Talents
                </h2>
                <div className="space-y-4">
                  {top3Talents.map((talent, index) => (
                    <div key={talent.id} className="space-y-1">
                      <div className="text-xl font-bold text-blue-900">
                        {index + 1}. {talent.name}
                      </div>
                      <div className="text-sm text-gray-600 italic max-w-2xl mx-auto">
                        {talent.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Snapshot Content */}
              <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                <ReactMarkdown>{snapshotMarkdown}</ReactMarkdown>
              </div>

              {/* Simplified Next Step for PDF */}
              <div className="mt-12 pt-8 border-t-2 border-gray-200 space-y-4 text-center">
                <h3 className="text-xl font-bold text-gray-800">
                  Ready to Turn Insight into Action?
                </h3>
                <p className="text-base text-gray-700 max-w-2xl mx-auto">
                  This is just the beginning. If you'd like support translating your Zone of Genius into a clear, confident career move, Aleksandr offers a focused 60–90 minute Career Re-Ignition Session to transform your ZoG insights into a 3-step strategic action plan to land your next fulfilling role.
                </p>
                <div className="inline-block px-8 py-4 mt-4 text-lg font-bold text-white rounded-full" style={{ backgroundColor: '#1a365d' }}>
                  Book My Career Re-Ignition Session
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  https://www.calendly.com/konstantinov
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 mt-12 border-t border-slate-200">
        <button
          onClick={handleBack}
          className="px-6 py-2 text-sm rounded-full border border-slate-300 bg-white hover:bg-slate-50 transition-colors text-slate-700"
        >
          Back to Step 3
        </button>
        <button
          onClick={handleStartNew}
          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
        >
          Start New Assessment
        </button>
      </div>
    </main>
  );
};

export default Step4GenerateSnapshot;
