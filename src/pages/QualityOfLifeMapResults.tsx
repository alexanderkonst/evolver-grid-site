import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import ShareQol from "@/components/sharing/ShareQol";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
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
import GameShellV2 from "@/components/game/GameShellV2";
import { Map, ArrowRight, Download, RefreshCw } from "lucide-react";

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
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    getOrCreateGameProfileId()
      .then(id => setProfileId(id))
      .catch(() => { });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isComplete && profileId && !isSaved) {
      saveSnapshotToDatabase();
    }
  }, [isComplete, profileId]);

  const saveSnapshotToDatabase = async () => {
    if (!profileId) return;

    try {
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
        overall_score: overallAverage,
        xp_awarded: false,
      };

      const { data: newSnapshot, error: snapshotError } = await supabase
        .from('qol_snapshots')
        .insert(snapshotInsert)
        .select('id, xp_awarded')
        .single();

      if (snapshotError) throw snapshotError;

      setIsSaved(true);

      const shouldUnlock = shouldUnlockAfterQol(returnTo);

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
        }
      }

      await logActionEvent({
        actionId: `qol-snapshot:${newSnapshot.id}`,
        profileId,
        source: "src/pages/QualityOfLifeMapResults.tsx",
        loop: "profile",
        selectedAt: new Date().toISOString(),
        metadata: { intent: "qol_snapshot_saved" },
      });
    } catch (err) {
      // Silent fail
    }
  };

  // Build domain results
  const domainResults = DOMAINS.map(domain => {
    const stageValue = answers[domain.id] ?? 0;
    const stage = domain.stages.find(s => s.id === stageValue);
    return { domain, stageValue, stage };
  });

  const overallAverage = domainResults.reduce((sum, r) => sum + r.stageValue, 0) / domainResults.length;
  const overallStageRounded = overallAverage.toFixed(1);

  const sorted = [...domainResults].sort((a, b) => a.stageValue - b.stageValue);
  const growthDomains = sorted.slice(0, 3);
  const strengthDomains = sorted.slice(-3).reverse();

  const domainAbbreviations: Record<string, string> = {
    "Wealth": "💰", "Health": "💪", "Happiness": "😊", "Love & Relationships": "❤️",
    "Impact": "🌍", "Growth": "🌱", "Social Ties": "🤝", "Home": "🏠",
  };

  const radarData = domainResults.map(({ domain, stageValue }) => ({
    domain: domainAbbreviations[domain.name] || domain.name.slice(0, 4),
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
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2, backgroundColor: '#f5f4f1', logging: false, useCORS: true,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, pdfWidth, imgHeight);
      pdf.save(`quality-of-life-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "PDF Downloaded", description: "Your snapshot has been saved." });
    } catch {
      toast({ title: "Download Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <GameShellV2>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[#a4a3d0]">Loading your results...</div>
        </div>
      </GameShellV2>
    );
  }

  // Not complete
  if (!isComplete) {
    return (
      <GameShellV2>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <Map className="w-16 h-16 mx-auto text-[#a4a3d0] mb-4" />
          <h1 className="text-2xl font-bold text-[#2c3150] mb-4">Complete Your Assessment</h1>
          <p className="text-[#a4a3d0] mb-6">Answer all 8 domains to see your results.</p>
          <Button variant="wabi-primary" onClick={() => navigate("/quality-of-life-map/assessment")}>
            Start Assessment
          </Button>
        </div>
      </GameShellV2>
    );
  }

  const content = (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Hero Section */}
      <div ref={snapshotRef} className="rounded-2xl border border-[#a4a3d0]/30 bg-gradient-to-br from-[#e7e9e5] to-[#dcdde2] p-6 space-y-5">
        {/* Title */}
        <div className="text-center">
          <p className="text-sm text-[#a4a3d0] mb-1">Your Quality of Life</p>
          <div className="inline-flex items-center gap-3">
            <span className="text-5xl font-bold text-[#2c3150]">{overallStageRounded}</span>
            <span className="text-[#a4a3d0] text-lg">/10</span>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(132, 96, 234, 0.2)" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: '#2c3150', fontSize: 14 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: '#a4a3d0', fontSize: 10 }} tickCount={6} />
              <Radar dataKey="value" stroke="#8460ea" fill="#8460ea" fillOpacity={0.4} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth & Strengths */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/50 p-4">
            <p className="text-xs uppercase tracking-wide text-[#a4a3d0] mb-3">🌱 Growth Areas</p>
            <div className="space-y-2">
              {growthDomains.map(({ domain, stageValue }) => (
                <div key={domain.id} className="flex items-center justify-between">
                  <span className="text-sm text-[#2c3150]">{domain.name}</span>
                  <span className="text-sm font-semibold text-[#8460ea]">{stageValue}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/50 p-4">
            <p className="text-xs uppercase tracking-wide text-[#a4a3d0] mb-3">💪 Strengths</p>
            <div className="space-y-2">
              {strengthDomains.map(({ domain, stageValue }) => (
                <div key={domain.id} className="flex items-center justify-between">
                  <span className="text-sm text-[#2c3150]">{domain.name}</span>
                  <span className="text-sm font-semibold text-[#8460ea]">{stageValue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share */}
      <ShareQol
        overallStage={overallStageRounded}
        growthDomains={growthDomains}
        strengthDomains={strengthDomains}
        profileId={profileId ?? undefined}
      />

      {/* Actions */}
      <div className="space-y-3">
        <Button variant="wabi-primary" className="w-full" onClick={handlePriorities}>
          Set Growth Priorities <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="wabi-secondary" onClick={handleDownloadPdf}>
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button variant="wabi-ghost" onClick={handleRetake}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retake
          </Button>
        </div>
      </div>
    </div>
  );

  if (renderMode === "embedded") {
    return <div className="py-4">{content}</div>;
  }

  return (
    <GameShellV2>
      {content}
    </GameShellV2>
  );
};

export default QualityOfLifeMapResults;
