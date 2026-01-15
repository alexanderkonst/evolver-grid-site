import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import type { FC } from "react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import ShareQol from "@/components/sharing/ShareQol";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS, type DomainId } from "@/modules/quality-of-life-map/qolConfig";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { logActionEvent } from "@/lib/actionEvents";
import { awardXp } from "@/lib/xpSystem";
import { awardFirstTimeBonus, getFirstTimeActionLabel } from "@/lib/xpService";
import { buildQolPrioritiesPath, shouldUnlockAfterQol } from "@/lib/onboardingRouting";

interface QualityOfLifeMapResultsProps {
  renderMode?: "standalone" | "embedded";
}

const QualityOfLifeMapResults: FC<QualityOfLifeMapResultsProps> = ({
  renderMode = "standalone",
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("return");
  const { answers, reset, isComplete, isLoading } = useQolAssessment();
  const snapshotRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);

  // Get or create profile ID on mount
  useEffect(() => {
    getOrCreateGameProfileId()
      .then(id => setProfileId(id))
      .catch(err => {
        // Don't block the UI, just log the error
      });
  }, []);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => setIsGuest(!data.session))
      .catch(() => setIsGuest(true));
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Save snapshot to database when results are complete
  useEffect(() => {
    if (isComplete && profileId) {
      saveSnapshotToDatabase();
    }
  }, [isComplete, profileId]);

  const saveSnapshotToDatabase = async () => {
    if (!profileId) {
      return;
    }

    try {
      // Build the snapshot row data with explicit typing
      const snapshotInsert = {
        profile_id: profileId,
        wealth_stage: (answers.wealth ?? 1) as number,
        health_stage: (answers.health ?? 1) as number,
        happiness_stage: (answers.happiness ?? 1) as number,
        love_relationships_stage: (answers.love ?? 1) as number,
        impact_stage: (answers.impact ?? 1) as number,
        growth_stage: (answers.growth ?? 1) as number,
        social_ties_stage: (answers.socialTies ?? 1) as number,
        home_stage: (answers.home ?? 1) as number,
        xp_awarded: false,
      };

      // Insert snapshot
      const { data: newSnapshot, error: snapshotError } = await supabase
        .from('qol_snapshots')
        .insert(snapshotInsert)
        .select('id, xp_awarded')
        .single();

      if (snapshotError) throw snapshotError;

      const shouldUnlock = shouldUnlockAfterQol(returnTo);
      const nextPath = shouldUnlock ? buildQolPrioritiesPath(returnTo) : null;

      // Award XP for completing QoL (only if not already awarded)
      if (!newSnapshot.xp_awarded) {
        const xpResult = await awardXp(profileId, 100, "mind");
        if (xpResult.success) {
          await supabase
            .from('game_profiles')
            .update({
              last_qol_snapshot_id: newSnapshot.id,
              onboarding_stage: shouldUnlock ? "unlocked" : "qol_complete",
              onboarding_completed: shouldUnlock,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileId);

          await supabase
            .from('qol_snapshots')
            .update({ xp_awarded: true })
            .eq('id', newSnapshot.id);

          toast({
            title: "🎉 +100 XP (Mind)",
            description: "Quality of Life snapshot saved.",
          });

          const bonusResult = await awardFirstTimeBonus(profileId, "first_qol_complete", 100, 2, "mind");
          if (bonusResult.awarded) {
            toast({
              title: "🎉 FIRST TIME BONUS!",
              description: `+${bonusResult.xp} XP for your first ${getFirstTimeActionLabel("first_qol_complete")}!`,
            });
          }
          if (nextPath) {
            setTimeout(() => navigate(nextPath), 800);
          }
        }
      } else {
        // Just update the reference without awarding XP again
        await supabase
          .from('game_profiles')
          .update({
            last_qol_snapshot_id: newSnapshot.id,
            onboarding_stage: shouldUnlock ? "unlocked" : "qol_complete",
            onboarding_completed: shouldUnlock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileId);
        if (nextPath) {
          setTimeout(() => navigate(nextPath), 800);
        }
      }

      await logActionEvent({
        actionId: `qol-snapshot:${newSnapshot.id}`,
        profileId,
        source: "src/pages/QualityOfLifeMapResults.tsx",
        loop: "profile",
        selectedAt: new Date().toISOString(),
        metadata: {
          intent: "qol_snapshot_saved",
        },
      });
    } catch (err) {
      // Don't show error toast to user - this is a background operation
    }
  };

  const startAssessmentPath =
    renderMode === "embedded" ? "/game/transformation/qol-assessment" : "/quality-of-life-map/assessment";

  // Show loading while fetching from database
  if (isLoading) {
    const loadingContent = (
      <section
        className="py-24 px-6 min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: "hsl(220, 30%, 12%)" }}
      >
        <div className="text-center text-white/70">Loading your results...</div>
      </section>
    );

    if (renderMode === "embedded") {
      return <div className="py-8">{loadingContent}</div>;
    }
    return (
      <div className="min-h-dvh">
        <Navigation />
        {loadingContent}
      </div>
    );
  }

  // If assessment not complete, show prompt to complete it
  if (!isComplete) {
    const content = (
      <section
        className="py-24 px-6 min-h-dvh flex items-center justify-center"
        style={{ backgroundColor: "hsl(220, 30%, 12%)" }}
      >
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-white">
            <BoldText>PLEASE COMPLETE THE ASSESSMENT FIRST</BoldText>
          </h1>

          <p className="text-lg text-white/70 mb-8">
            You need to complete all 8 domains in the Quality of Life Map assessment before viewing your results.
          </p>

          <Button
            onClick={() => navigate(startAssessmentPath)}
            className="text-lg px-8"
            style={{
              backgroundColor: "hsl(var(--destiny-gold))",
              color: "hsl(var(--destiny-dark))",
            }}
          >
            Start Assessment
          </Button>
        </div>
      </section>
    );

    if (renderMode === "embedded") {
      return <div className="py-8">{content}</div>;
    }

    return (
      <div className="min-h-dvh">
        <Navigation />

        <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "hsl(220, 30%, 12%)" }}>
          <div className="container mx-auto max-w-4xl">
            <BackButton
              to="/"
              label={<BoldText>BACK</BoldText>}
              className="text-white/60 hover:text-white transition-colors font-semibold"
            />
          </div>
        </div>

        {content}
      </div>
    );
  }

  // Build domain results
  const domainResults = DOMAINS.map(domain => {
    const stageValue = answers[domain.id] ?? 0;
    const stage = domain.stages.find(s => s.id === stageValue);
    return { domain, stageValue, stage };
  });

  // Compute overall average
  const overallAverage = domainResults.reduce((sum, r) => sum + r.stageValue, 0) / domainResults.length;
  const overallStageRounded = overallAverage.toFixed(1);

  // Sort for ranking
  const sorted = [...domainResults].sort((a, b) => a.stageValue - b.stageValue);
  const growthDomains = sorted.slice(0, 3);
  const strengthDomains = sorted.slice(-3).reverse();

  // Prepare data for radar chart with abbreviated labels
  const domainAbbreviations: Record<string, string> = {
    "Wealth": "Wealth",
    "Health": "Health",
    "Happiness": "Happiness",
    "Love & Relationships": "Love",
    "Impact": "Impact",
    "Growth": "Growth",
    "Social Ties": "Social",
    "Home": "Home",
  };

  const radarData = domainResults.map(({ domain, stageValue }) => ({
    domain: domainAbbreviations[domain.name] || domain.name,
    value: stageValue,
  }));

  const handleRetake = () => {
    reset();
    navigate("/quality-of-life-map/assessment");
  };

  const handlePriorities = () => {
    navigate(buildQolPrioritiesPath(returnTo));
  };

  const handleDownloadPdf = async () => {
    if (!snapshotRef.current) return;

    try {
      const element = snapshotRef.current;

      // Show PDF-only elements and hide display-only elements
      const pdfOnlyElements = element.querySelectorAll('.pdf-only');
      const pdfExcludeElements = element.querySelectorAll('.pdf-exclude');

      pdfOnlyElements.forEach((el: any) => el.style.display = 'block');
      pdfExcludeElements.forEach((el: any) => el.style.display = 'none');

      // Improved html2canvas configuration
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#1a2332',
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        imageTimeout: 0,
        removeContainer: true,
      });

      // Restore display
      pdfOnlyElements.forEach((el: any) => el.style.display = 'none');
      pdfExcludeElements.forEach((el: any) => el.style.display = '');

      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate image dimensions to fit page width
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add pages with proper margins
      let yPosition = 0;
      let remainingHeight = imgHeight;
      let pageNumber = 0;

      while (remainingHeight > 0) {
        if (pageNumber > 0) {
          pdf.addPage();
        }

        const availableHeight = pdfHeight - 20; // 10mm margin top and bottom
        const sourceY = (pageNumber * availableHeight * canvas.width) / imgWidth;
        const sourceHeight = (availableHeight * canvas.width) / imgWidth;

        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(sourceHeight, canvas.height - sourceY);

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY, canvas.width, pageCanvas.height,
            0, 0, canvas.width, pageCanvas.height
          );

          const pageImgData = pageCanvas.toDataURL("image/png", 1.0);
          const pageImgHeight = (pageCanvas.height * imgWidth) / canvas.width;

          pdf.addImage(pageImgData, "PNG", 10, 10, imgWidth, pageImgHeight);
        }

        remainingHeight -= availableHeight;
        pageNumber++;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      pdf.save(`quality-of-life-map-snapshot-${dateStr}.pdf`);

      toast({
        title: "PDF Downloaded",
        description: "Your snapshot has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resultsContent = (
    <section
      className="py-16 px-4 sm:px-6"
      style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}
    >
      <div className="container mx-auto max-w-2xl">
        <div
          ref={snapshotRef}
          className="rounded-2xl border border-white/10 bg-[#1a2332] p-6 sm:p-8 space-y-6"
        >
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              <BoldText>YOUR QUALITY OF LIFE MAP SNAPSHOT</BoldText>
            </h1>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: 'rgba(255, 213, 79, 0.1)', border: '1px solid #FFD54F', color: '#FFD54F' }}
            >
              Overall Level: Stage {overallStageRounded}
            </div>
          </div>

          <div className="rounded-xl p-4 pdf-exclude" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: '#ffffff', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#ffffff', fontSize: 10 }} tickCount={11} />
                  <Radar
                    name="Development Level"
                    dataKey="value"
                    stroke="#FFD54F"
                    fill="#FFD54F"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-3 text-xs text-white/60">
              Scale: 0-10 (10 = highest development)
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60 mb-3">Top Growth</p>
              <div className="space-y-2">
                {growthDomains.map(({ domain, stageValue, stage }) => (
                  <div key={domain.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{domain.name}</p>
                      <p className="text-xs text-white/60">{stage?.title}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#FFD54F]">{stageValue}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60 mb-3">Strengths</p>
              <div className="space-y-2">
                {strengthDomains.map(({ domain, stageValue, stage }) => (
                  <div key={domain.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{domain.name}</p>
                      <p className="text-xs text-white/60">{stage?.title}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#FFD54F]">{stageValue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={handlePriorities}
              className="text-base"
              style={{ backgroundColor: '#FFD54F', color: '#1a2332' }}
            >
              Set Growth Priorities
            </Button>
            <Button
              onClick={handleDownloadPdf}
              className="text-base"
              style={{ backgroundColor: '#FFD54F', color: '#1a2332' }}
            >
              Download Snapshot
            </Button>
            <Button
              onClick={handleRetake}
              variant="outline"
              className="text-base"
              style={{ borderColor: '#FFD54F', color: '#FFD54F' }}
            >
              Retake Assessment
            </Button>
            {isGuest && (
              <Button
                variant="outline"
                className="text-base"
                style={{ borderColor: '#FFD54F', color: '#FFD54F' }}
                onClick={() => navigate("/auth?redirect=/quality-of-life-map/results")}
              >
                Save to My Profile
              </Button>
            )}
          </div>
          <ShareQol
            overallStage={overallStageRounded}
            growthDomains={growthDomains}
            strengthDomains={strengthDomains}
            profileId={profileId ?? undefined}
          />
        </div>
      </div>
    </section>
  );

  if (renderMode === "embedded") {
    return <div className="py-8">{resultsContent}</div>;
  }

  return (
    <div className="min-h-dvh">
      <Navigation />

      {/* Back Button */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <BackButton
            to="/"
            label={<BoldText>BACK</BoldText>}
            className="text-white/60 hover:text-white transition-colors font-semibold"
          />
        </div>
      </div>

      {/* Results Content */}
      {resultsContent}
    </div>
  );
};

export default QualityOfLifeMapResults;
