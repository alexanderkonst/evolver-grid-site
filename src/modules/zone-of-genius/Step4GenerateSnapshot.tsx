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
    const top10List = top10Talents
      .map(t => `- ${t.name}: ${t.description}`)
      .join("\n");
    
    const top3List = top3Talents
      .map((t, idx) => `${idx + 1}. ${t.name} – ${t.description}`)
      .join("\n");

    return `You are Aleksandr's AI assistant helping professionals in career transition clarify their Zone of Genius. Use an encouraging, grounded tone and speak to one person directly ("you"). Keep language concise but deep.

The user has just completed a Zone of Genius assessment.

Their top 10 selected talents (with descriptions) are:
${top10List}

Their top 3 core talents (with descriptions), in order of how naturally and frequently they are used, are:
${top3List}

Based on this, generate a concise "ZoG Lifeline Snapshot" in Markdown with the following structure:

1. A title line in bold that names their Zone of Genius in 6–10 words.
2. A short paragraph (2–3 sentences) summarizing their unique genius and how it naturally wants to express itself in the world.
3. A section titled "How Your Genius Wants to Express Itself" with 3–5 bullet points describing how these talents typically show up in behavior and contribution.
4. A section titled "Career Directions to Explore Next" with 4–6 bullet points suggesting types of roles, environments, or paths where this combination of talents is especially valuable.
5. A gentle closing line inviting them to honor their gifts and consider working with Aleksandr for deeper support, mentioning his "Career Re-Ignition Session" (no hard sell, just a mention).

Write clearly and practically, with warmth and depth. Avoid generic filler. Make it feel tailored to this specific combination of talents.`;
  };

  const handleDownloadPDF = async () => {
    if (!snapshotRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
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

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Step 4: Generate Your Zone of Genius Snapshot PDF
        </h2>
        <p className="text-lg text-primary font-semibold">
          Your ZoG Lifeline Snapshot is Ready!
        </p>
      </div>

      {/* Top 3 Talents Summary */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Your top 3 core talents:</p>
        <p className="text-lg font-semibold text-foreground">
          {top3Talents.map(t => t.name).join(", ")}
        </p>
      </div>

      {/* Snapshot Content */}
      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Generating your personalized snapshot...</p>
        </div>
      ) : snapshotMarkdown ? (
        <div ref={snapshotRef} className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6">
          <div className="prose prose-sm sm:prose max-w-none">
            <ReactMarkdown>{snapshotMarkdown}</ReactMarkdown>
          </div>

          {/* Next Steps Section for PDF */}
          <div className="mt-8 pt-8 border-t border-border space-y-4">
            <h3 className="text-xl font-bold text-foreground">
              Your Next Step: The 'Career Re-Ignition Session' with Aleksandr
            </h3>
            <p className="text-base text-foreground/90">
              In one focused 90 minute live session, Aleksandr will personally guide you to transform your ZoG insights into a concrete strategic action plan to grow into your next level with confidence and speed.
            </p>
            <ul className="space-y-2 text-sm text-foreground/80">
              <li>• Understand your current situation through the lens of your ZoG</li>
              <li>• Activate your ZoG</li>
              <li>• Co-create a potent action plan tailored to your unique strengths</li>
            </ul>
            <p className="text-lg font-bold text-primary">$297</p>
            <p className="text-sm text-muted-foreground">
              Book your session here: https://www.calendly.com/konstantinov
            </p>
          </div>
        </div>
      ) : null}

      {/* Download Button */}
      {snapshotMarkdown && !isGenerating && (
        <div className="flex justify-center">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
            style={{ 
              backgroundColor: 'hsl(210, 70%, 15%)',
              color: 'white'
            }}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download My Zone of Genius Snapshot (PDF)
              </>
            )}
          </button>
        </div>
      )}

      {/* CTA Card */}
      {snapshotMarkdown && !isGenerating && (
        <div className="bg-card/60 border-2 border-border rounded-2xl p-6 sm:p-8 space-y-6">
          <h3 className="text-2xl font-bold text-center text-primary">
            Ready to Turn Insight into Action?
          </h3>
          <p className="text-base text-foreground/90 text-center max-w-2xl mx-auto">
            This is just the beginning. If you'd like support translating your Zone of Genius into a clear, confident career move, Aleksandr offers a focused 60–90 minute Career Re-Ignition Session to transform your ZoG insights into a 3-step strategic action plan to land your next fulfilling role.
          </p>
          <div className="flex justify-center">
            <a
              href="https://www.calendly.com/konstantinov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-full transition-all shadow-[0_0_20px_rgba(26,54,93,0.5)] hover:shadow-[0_0_30px_rgba(26,54,93,0.8)]"
              style={{ 
                backgroundColor: 'hsl(210, 70%, 15%)',
                color: 'white'
              }}
            >
              Book My Career Re-Ignition Session
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-full border border-border bg-background hover:bg-muted transition-colors"
        >
          Back to Step 3
        </button>
        <button
          onClick={handleStartNew}
          className="text-sm text-primary hover:underline"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );
};

export default Step4GenerateSnapshot;
