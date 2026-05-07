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
// Day 63 (Sasha 2026-05-06): GameShellV2 import removed — shell now
// owned by QolLayout, not per-page.
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

    let savedSnapshotId: string | null = null;
    let xpAlreadyAwardedOnRow = false;

    // ─── Critical save path ─────────────────────────────────────────
    // Day 63 evening (Sasha 2026-05-06): SEPARATED from post-save
    // side effects. Same lesson as Day 61-62's `successFired` flag
    // pattern (D-2026-05-05-08): when post-success operations (XP
    // award, profile pointer update, telemetry) throw into the same
    // try/catch as the actual INSERT, the user sees a misleading
    // "Could not save your results" toast even when the data IS saved.
    // Now: only failures in the critical save below surface to the
    // user; side-effect failures log silently and the user keeps the
    // success state. Reproduced bug from the screenshot Sasha
    // shipped at 12:14 PM.
    try {
      // Idempotency guard. Read the most recent saved snapshot first.
      // If its 8 stage values match the current answers exactly, no-op
      // and mark saved. Makes results-page revisits idempotent
      // (refresh, navigate-back, etc.) while still producing a fresh
      // row when the user actually retakes with new answers.
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

      // Day 64 (Sasha 2026-05-07): SMOKING GUN. The table schema (per
      // migration 20251130150920) has only 8 stage columns + xp_awarded
      // + standard id/profile_id/created_at. There is NO `overall_score`
      // column. Sending it caused Postgres error 42703 (undefined
      // column), throwing into the critical-save catch and surfacing as
      // the "Could not save your results" toast Sasha was seeing
      // repeatedly. The overall score is a derived value computed
      // client-side from the 8 stages — no need to persist it.
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

      const { data: newSnapshot, error: snapshotError } = await supabase
        .from('qol_snapshots')
        .insert(snapshotInsert)
        .select('id, xp_awarded')
        .single();

      if (snapshotError) throw snapshotError;
      if (!newSnapshot) throw new Error('qol_snapshots insert returned no data');

      savedSnapshotId = newSnapshot.id;
      xpAlreadyAwardedOnRow = !!newSnapshot.xp_awarded;
      setIsSaved(true);
    } catch (err) {
      // Critical save failed — the data is NOT in the DB. Show the
      // destructive toast so the user knows to retry. Log structured
      // error details (Supabase error code + message + hint) so the
      // next failure is debuggable.
      const e = err as { code?: string; message?: string; details?: string; hint?: string };
      console.error('[QoL] Failed to save snapshot:', {
        code: e?.code,
        message: e?.message,
        details: e?.details,
        hint: e?.hint,
        raw: err,
      });
      toast({
        title: 'Could not save your results',
        description: 'Your answers are still on this page. Try again or refresh.',
        variant: 'destructive',
      });
      return;
    }

    // ─── Post-save side effects ─────────────────────────────────────
    // XP award, profile pointer update, telemetry. ANY failure here
    // logs only — the user's data is already saved (the row is in
    // qol_snapshots; the only thing that could fail now is the XP
    // bookkeeping or the profile-pointer denormalization). Pattern
    // mirrors `successFired` from Day 61-62 (D-2026-05-05-08).
    try {
      if (!xpAlreadyAwardedOnRow && savedSnapshotId) {
        const shouldUnlock = shouldUnlockAfterQol(returnTo);
        const xpResult = await awardXp(profileId, 100, "mind");
        if (xpResult.success) {
          await supabase
            .from('game_profiles')
            .update({
              last_qol_snapshot_id: savedSnapshotId,
              onboarding_stage: shouldUnlock ? "unlocked" : "qol_complete",
              onboarding_completed: shouldUnlock,
              updated_at: new Date().toISOString(),
            })
            .eq('id', profileId);

          await supabase
            .from('qol_snapshots')
            .update({ xp_awarded: true })
            .eq('id', savedSnapshotId);

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

      if (savedSnapshotId) {
        await logActionEvent({
          actionId: `qol-snapshot:${savedSnapshotId}`,
          profileId,
          source: "src/pages/QualityOfLifeMapResults.tsx",
          loop: "profile",
          selectedAt: new Date().toISOString(),
          metadata: { intent: "qol_snapshot_saved" },
        });
      }
    } catch (err) {
      // Side-effect failure — the data IS saved; only XP/telemetry
      // bookkeeping failed. Log a warning (not error) so this surfaces
      // in console but doesn't trigger user-facing alerts. The next
      // visit's idempotency check will skip the INSERT (matching
      // answers), so XP retry is a TODO if a user is observed to have
      // saved snapshots with `xp_awarded: false` long-term.
      const e = err as { code?: string; message?: string };
      console.warn('[QoL] Post-save side effect failed (data IS saved):', {
        code: e?.code,
        message: e?.message,
        raw: err,
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

  // Day 63 (Sasha 2026-05-06): shell removed — QolLayout now wraps in
  // GameShellV2 once for all four QoL pages.
  // Day 64 (Sasha 2026-05-07): loading + empty state colors switched
  // from white-on-cream-illegible to skin-text-primary navy.
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--wabi-text-muted)] animate-pulse">Loading your results...</div>
      </div>
    );
  }

  // Not complete
  if (!isComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Map className="w-16 h-16 mx-auto text-[var(--wabi-text-muted)] mb-4" />
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: "clamp(24px, 3vw, 30px)",
            letterSpacing: "-0.005em",
            lineHeight: 1.1,
            color: "var(--skin-text-primary, var(--wabi-text-primary, #0b2a5a))",
            textShadow: "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
          }}
          className="mb-4"
        >
          Complete Your Assessment
        </h1>
        <p className="text-[var(--wabi-text-secondary)] mb-6">Answer all 8 domains to see your results.</p>
        <Button variant="wabi-primary" onClick={() => navigate("/quality-of-life-map/assessment")}>
          Start Assessment
        </Button>
      </div>
    );
  }

  const content = (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Hero Section */}
      {/* Hero Section
          Day 64 (Sasha 2026-05-07): converted from dark `liquid-glass`
          surface to landing-register cream-wash card. Sasha's screenshot
          showed gold-on-cream eyebrow + white-on-cream "2.0" — both
          illegible because `liquid-glass` wasn't darkening the cinematic
          bg enough to read white/light gold against. Switching to a
          true cream-surface treatment (white/72 bg + navy text + halo-
          deep cocktail) matches landing's cornerstone register and is
          legible regardless of what shows through. Radar palette also
          migrated from violet to gold. */}
      <div
        ref={snapshotRef}
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: "var(--skin-card-bg, rgba(255, 255, 255, 0.72))",
          border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.10))",
          boxShadow: "var(--skin-card-shadow, 0 4px 16px -8px rgba(10, 22, 40, 0.12), 0 16px 40px -20px rgba(10, 22, 40, 0.18))",
          backdropFilter: "blur(8px) saturate(140%)",
          WebkitBackdropFilter: "blur(8px) saturate(140%)",
        }}
      >
        <div className="text-center space-y-3">
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#7a5708",
              textShadow: "0 1px 2px rgba(255,255,255,0.6)",
            }}
          >
            Your Quality of Life
          </p>
          <div className="inline-flex items-baseline gap-2">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "clamp(56px, 8vw, 80px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--skin-text-primary, var(--wabi-text-primary, #0b2a5a))",
                textShadow: "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
              }}
            >
              {overallStageRounded}
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                fontSize: "20px",
                color: "var(--wabi-text-muted)",
              }}
            >
              / 10
            </span>
          </div>
          <p
            style={{
              fontFamily: "'Source Serif 4', 'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "15px",
              lineHeight: 1.55,
              color: "var(--wabi-text-secondary)",
            }}
          >
            Now you know where to focus your growth.
          </p>
        </div>

        {/* Radar Chart — Day 64 (Sasha 2026-05-07): violet (#8460ea) →
            gold (#b8860b) for landing-register coherence. Tick labels
            switched from white (illegible on cream) to navy. */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(184, 134, 11, 0.22)" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: 'rgba(11,42,90,0.7)', fontSize: 14 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: 'rgba(11,42,90,0.4)', fontSize: 10 }} tickCount={6} />
              <Radar dataKey="value" stroke="#b8860b" fill="#b8860b" fillOpacity={0.32} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Growth & Strengths
            Day 64 (Sasha 2026-05-07): converted from dark liquid-glass
            cards to nested cream-surface (slightly darker than parent
            hero card for hierarchy). Eyebrows in deep gold (#7a5708),
            domain names in navy via skin-text-primary, numeric values
            in deep gold accent. Matches landing card register. */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(255, 255, 255, 0.5)",
              border: "0.5px solid rgba(184, 134, 11, 0.18)",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "11px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#7a5708",
              }}
              className="mb-3"
            >
              🌱 Growth Areas
            </p>
            <div className="space-y-2">
              {growthDomains.map(({ domain, stageValue }) => (
                <div key={domain.id} className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontSize: "14px",
                      color: "var(--skin-text-primary, var(--wabi-text-primary, #0b2a5a))",
                    }}
                  >
                    {domain.name}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ fontVariantNumeric: "tabular-nums", color: "#b8860b" }}
                  >
                    {stageValue}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(255, 255, 255, 0.5)",
              border: "0.5px solid rgba(184, 134, 11, 0.18)",
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 600,
                fontSize: "11px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#7a5708",
              }}
              className="mb-3"
            >
              💪 Strengths
            </p>
            <div className="space-y-2">
              {strengthDomains.map(({ domain, stageValue }) => (
                <div key={domain.id} className="flex items-center justify-between">
                  <span
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontSize: "14px",
                      color: "var(--skin-text-primary, var(--wabi-text-primary, #0b2a5a))",
                    }}
                  >
                    {domain.name}
                  </span>
                  <span
                    className="text-sm font-semibold"
                    style={{ fontVariantNumeric: "tabular-nums", color: "#b8860b" }}
                  >
                    {stageValue}
                  </span>
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

  // Day 63 (Sasha 2026-05-06): shell removed — QolLayout wraps in
  // GameShellV2 once for the standalone /quality-of-life-map/* routes.
  return content;
};

export default QualityOfLifeMapResults;
