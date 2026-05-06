import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import ShareQol from "@/components/sharing/ShareQol";
import { useQolAssessment, type Answers } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";

/**
 * Day 63 (Sasha 2026-05-06): cell-by-cell match between current answers
 * and the most recent saved snapshot. Used as the idempotency guard
 * before inserting a new qol_snapshots row. Without this, every visit
 * to the Results page (refresh, navigate-back, anything that remounts
 * the component) inserted another duplicate snapshot — the local
 * `isSaved` flag resets per mount, so the previous guard couldn't see
 * across mounts.
 */
function answersMatchSnapshot(
  answers: Answers,
  snapshot: {
    wealth_stage: number;
    health_stage: number;
    happiness_stage: number;
    love_relationships_stage: number;
    impact_stage: number;
    growth_stage: number;
    social_ties_stage: number;
    home_stage: number;
  }
): boolean {
  return (
    answers.wealth === snapshot.wealth_stage &&
    answers.health === snapshot.health_stage &&
    answers.happiness === snapshot.happiness_stage &&
    answers.love === snapshot.love_relationships_stage &&
    answers.impact === snapshot.impact_stage &&
    answers.growth === snapshot.growth_stage &&
    answers.socialTies === snapshot.social_ties_stage &&
    answers.home === snapshot.home_stage
  );
}
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
      // Day 63 (Sasha 2026-05-06): idempotency guard. Read the most
      // recent saved snapshot first; if its 8 stage values match the
      // current answers exactly, no-op and mark saved. This makes
      // results-page revisits idempotent (refresh, navigate-back, etc.)
      // while still producing a fresh row when the user actually
      // retakes with new answers.
      const { data: lastProfile } = await supabase
        .from('game_profiles')
        .select('last_qol_snapshot_id')
        .eq('id', profileId)
        .maybeSingle();

      if (lastProfile?.last_qol_snapshot_id) {
        const { data: prior } = await supabase
          .from('qol_snapshots')
          .select('wealth_stage, health_stage, happiness_stage, love_relationships_stage, impact_stage, growth_stage, social_ties_stage, home_stage')
          .eq('id', lastProfile.last_qol_snapshot_id)
          .maybeSingle();

        if (prior && answersMatchSnapshot(answers, prior)) {
          // Same answers as last save — no-op
          setIsSaved(true);
          return;
        }
      }

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
      // Day 63 (Sasha 2026-05-06): was a silent catch. Without logging
      // and a user-visible signal, save failures left the user looking
      // at "results saved" UI while no row hit the DB — they'd come
      // back next week, find nothing in their history, and have no
      // idea why. Now we surface both a console error (for diagnostics)
      // and a destructive toast (so the user knows to retry).
      console.error('[QoL] Failed to save snapshot:', err);
      toast({
        title: 'Could not save your results',
        description: 'Your answers are still on this page. Try again or refresh.',
        variant: 'destructive',
      });
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
    // Day 63 (Sasha 2026-05-06): `?fresh=true` tells QolAssessmentProvider
    // to skip the DB-load on (re)mount. Without this, any provider
    // remount during the retake (refresh, navigate-away-and-back) re-
    // populated `answers` from the saved snapshot, silently reverting
    // the retake to "review previous answers".
    navigate("/quality-of-life-map/assessment?fresh=true");
  };

  const handlePriorities = () => {
    navigate(buildQolPrioritiesPath(returnTo));
  };

  const handleDownloadPdf = async () => {
    if (!snapshotRef.current) return;
    try {
      // Day 63 (Sasha 2026-05-06): same html2canvas scrubber pattern as
      // the Top Talent reveal PNG capture (Day 61-62 lesson). The
      // snapshotRef container uses `liquid-glass` which applies
      // backdrop-filter heavily — html2canvas's gradient rasterizer
      // chokes on backdrop-filter and throws NaN inside its addColorStop
      // call, surfacing as "Download Failed: Could not generate PDF".
      // Scrubbing backdrop-filter / filter / animations / transitions on
      // the cloned tree (NOT the live page) makes rasterization stable.
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2,
        backgroundColor: '#f5f4f1',
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
          allElements.forEach((el) => {
            el.style.backdropFilter = 'none';
            (el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = 'none';
            el.style.filter = 'none';
            (el.style as CSSStyleDeclaration & { webkitFilter?: string }).webkitFilter = 'none';
            el.style.animation = 'none';
            el.style.transition = 'none';
          });
        },
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, pdfWidth, imgHeight);
      pdf.save(`quality-of-life-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "PDF Downloaded", description: "Your snapshot has been saved." });
    } catch (err) {
      // Day 63 (Sasha 2026-05-06): replace silent catch with logging.
      // Without this, when html2canvas/jsPDF errors surfaced as the
      // generic "Download Failed" toast, there was no diagnostic in
      // the console to debug the cause.
      console.error('[QoL] PDF generation failed:', err);
      toast({
        title: "Download Failed",
        description: "Could not generate PDF. Try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <GameShellV2>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white/30 animate-pulse">Loading your results...</div>
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
          <h1 className="text-2xl font-bold text-white mb-4">Complete Your Assessment</h1>
          <p className="text-white/50 mb-6">Answer all 8 domains to see your results.</p>
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
      <div ref={snapshotRef} className="rounded-2xl liquid-glass ring-1 ring-white/10 p-6 space-y-5">
        {/* Title with Value Statement */}
        <div className="text-center">
          <p className="text-sm text-[#8460ea] mb-1">Your Quality of Life</p>
          <div className="inline-flex items-center gap-3">
            <span className="text-5xl font-bold text-white">{overallStageRounded}</span>
            <span className="text-white/30 text-lg">/10</span>
          </div>
          <p className="mt-3 text-sm text-white/50 font-medium">
            Now you know where to focus your growth.
          </p>
        </div>

        {/* Radar Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(132, 96, 234, 0.2)" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 14 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} tickCount={6} />
              <Radar dataKey="value" stroke="#8460ea" fill="#8460ea" fillOpacity={0.4} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth & Strengths */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl liquid-glass ring-1 ring-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-[#8460ea] mb-3">🌱 Growth Areas</p>
            <div className="space-y-2">
              {growthDomains.map(({ domain, stageValue }) => (
                <div key={domain.id} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">{domain.name}</span>
                  <span className="text-sm font-semibold text-[#8460ea]">{stageValue}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl liquid-glass ring-1 ring-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-[#8460ea] mb-3">💪 Strengths</p>
            <div className="space-y-2">
              {strengthDomains.map(({ domain, stageValue }) => (
                <div key={domain.id} className="flex items-center justify-between">
                  <span className="text-sm text-white/70">{domain.name}</span>
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

      {/* Actions - UX Playbook aligned */}
      <div className="space-y-3">
        <Button variant="wabi-primary" className="w-full" onClick={handlePriorities}>
          See My Profile <ArrowRight className="w-4 h-4 ml-2" />
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
