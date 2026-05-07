import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import ShareQol from "@/components/sharing/ShareQol";
import { useQolAssessment, type Answers } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
// Day 64 (Sasha 2026-05-07): Results page revamp — see
// docs/specs/quality-of-life-map/results_revamp_spec.md for the full
// design rationale. Summary of this round:
//   - Cards use `.liquid-glass` per docs/03-playbooks/glassmorphism_blueprint.md
//   - Single 8-domain list (sorted ascending) replaces Growth/Strengths split
//   - "See My Profile" button removed (priorities page deleted)
//   - Action row simplified to Retake / Download PDF (two equal buttons)
//   - PDF onclone resolves CSS vars to computed values (the html2canvas
//     can't-resolve-var fix)
//   - Page accessible from BOTH /quality-of-life-map/results AND
//     /game/me/quality-of-life (ME-space subpage for return visits)

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
import { shouldUnlockAfterQol } from "@/lib/onboardingRouting";
// Day 64 (Sasha 2026-05-07): buildQolPrioritiesPath import removed —
// the priorities page itself has been retired in this revamp.
// Day 63 (Sasha 2026-05-06): GameShellV2 import removed — shell now
// owned by QolLayout, not per-page.
import { Map, Download, RefreshCw } from "lucide-react";

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

          // Day 64 (Sasha 2026-05-07): toasts disabled per Sasha's
          // feedback ("disable the XP thing… another popup"). The
          // underlying XP award + DB writes still fire so game state
          // stays consistent; only the user-facing toast notifications
          // are suppressed. This also silences the "Quality of Life
          // snapshot saved" confirmation that was bundled with the XP
          // message. Re-enable by uncommenting if/when XP gamification
          // is added back to the QoL flow.
          // toast({
          //   title: "🎉 +100 XP (Mind)",
          //   description: "Quality of Life snapshot saved.",
          // });

          const bonusResult = await awardFirstTimeBonus(profileId, "first_qol_complete", 100, 2, "mind");
          if (bonusResult.awarded) {
            // Day 64 (Sasha 2026-05-07): First Time Bonus toast also
            // disabled. Award still fires in DB.
            // toast({
            //   title: "🎉 FIRST TIME BONUS!",
            //   description: `+${bonusResult.xp} XP for your first ${getFirstTimeActionLabel("first_qol_complete")}!`,
            // });
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

  // Day 64 (Sasha 2026-05-07): handlePriorities removed. The priorities
  // page itself was retired in this revamp; "See My Profile" CTA gone
  // from the action row.

  const handleDownloadPdf = async () => {
    if (!snapshotRef.current) return;
    try {
      // Day 64 (Sasha 2026-05-07): expanded onclone scrubber.
      // Day 63 base: strip backdrop-filter/filter/animation/transition on
      // cloned tree (the html2canvas-backdrop-filter rasterization bug).
      // Day 64 addition: ALSO resolve CSS variables (var(--skin-*),
      // var(--wabi-*), var(--depth-*)) on the snapshot subtree by reading
      // computed styles from the LIVE element and writing them as inline
      // styles on the CLONE. Without this, html2canvas's offscreen render
      // can't resolve the var() chains and the resulting canvas is
      // empty/black/glitched — surfacing as "Download Failed" toast.
      // Walk live + clone trees in parallel; for each pair, copy
      // resolved values for properties known to use var() in the QoL UI.
      const liveRef = snapshotRef.current;
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2,
        backgroundColor: '#f5f4f1',
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Day 64 (Sasha 2026-05-07, second pass): override the
          // .liquid-glass / .liquid-glass-strong classes with explicit
          // solid styling for PDF rasterization. The original classes
          // use a ::before pseudo-element with `mask-composite: exclude`
          // for the asymmetric edge-light effect — html2canvas can't
          // rasterize mask-composite, which is why the previous CSS-var
          // resolution fix wasn't enough. Injecting a <style> override
          // into the cloned doc head replaces the glass treatment with
          // a solid card style for the snapshot only; the live UI is
          // untouched. The PDF reads as a clean printable card.
          const styleOverride = clonedDoc.createElement('style');
          styleOverride.textContent = `
            .liquid-glass, .liquid-glass-strong {
              background: rgba(255, 255, 255, 0.94) !important;
              backdrop-filter: none !important;
              -webkit-backdrop-filter: none !important;
              border: 0.5px solid rgba(26, 30, 58, 0.12) !important;
              box-shadow: 0 4px 16px -4px rgba(10, 22, 40, 0.08), 0 16px 40px -20px rgba(10, 22, 40, 0.16) !important;
            }
            .liquid-glass::before, .liquid-glass-strong::before {
              display: none !important;
            }
          `;
          clonedDoc.head.appendChild(styleOverride);

          const allElements = clonedDoc.querySelectorAll<HTMLElement>('*');
          allElements.forEach((el) => {
            el.style.backdropFilter = 'none';
            (el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = 'none';
            el.style.filter = 'none';
            (el.style as CSSStyleDeclaration & { webkitFilter?: string }).webkitFilter = 'none';
            el.style.animation = 'none';
            el.style.transition = 'none';
          });

          // Resolve CSS vars by walking live + clone subtrees in lockstep.
          // We mirror only the snapshot subtree (not the whole document)
          // to keep the cost bounded.
          const RESOLVE_PROPS = [
            'background', 'backgroundColor', 'backgroundImage',
            'color', 'borderColor', 'borderTopColor', 'borderRightColor',
            'borderBottomColor', 'borderLeftColor',
            'boxShadow', 'textShadow', 'fill', 'stroke',
          ] as const;
          const resolveTree = (live: Element, clone: Element) => {
            if (!(live instanceof HTMLElement) || !(clone instanceof HTMLElement)) return;
            const computed = window.getComputedStyle(live);
            RESOLVE_PROPS.forEach((prop) => {
              const value = computed.getPropertyValue(prop);
              if (value && value !== '' && value !== 'none' && value !== 'rgba(0, 0, 0, 0)') {
                (clone.style as unknown as Record<string, string>)[prop] = value;
              }
            });
            for (let i = 0; i < live.children.length; i++) {
              const liveChild = live.children[i];
              const cloneChild = clone.children[i];
              if (liveChild && cloneChild) resolveTree(liveChild, cloneChild);
            }
          };
          // The cloned snapshot ref is the FIRST element with the same
          // structure. We find it by tag + class match isn't reliable;
          // simpler: walk from clonedDoc root and find the matching
          // bounding-box-ish anchor via data-qol-snapshot attribute we
          // set on the live ref div (see hero card JSX below).
          const cloneRoot = clonedDoc.querySelector<HTMLElement>('[data-qol-snapshot]');
          if (cloneRoot) resolveTree(liveRef, cloneRoot);
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

  // Not complete state — Day 64 (Sasha 2026-05-07): empty-state CTA
  // migrated from wabi-primary violet to liquid-glass-strong editorial
  // pattern matching the assessment intro's "Map My Life" treatment.
  // Per Sasha's screenshot feedback: the violet button was inconsistent
  // with the rest of the QoL UI's gold-on-cream register.
  if (!isComplete) {
    return (
      <div className="liquid-glass rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto text-center my-8">
        <Map className="w-16 h-16 mx-auto text-[var(--wabi-text-muted)] mb-5" />
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#0a1628",
            textShadow: "0 1px 2px rgba(255,255,255,0.85)",
          }}
          className="mb-3"
        >
          Quality of Life Map
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 3.5vw, 36px)",
            letterSpacing: "-0.005em",
            lineHeight: 1.1,
            color: "#0a1628",
            textShadow: "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.85), 0 2px 12px rgba(26,30,58,0.18)",
          }}
          className="mb-3"
        >
          Complete Your Assessment
        </h1>
        <p
          style={{
            fontFamily: "'Source Serif 4', 'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "15px",
            lineHeight: 1.55,
            color: "rgba(26,30,58,0.78)",
          }}
          className="mb-7"
        >
          Answer all 8 domains to see your results.
        </p>
        <button
          onClick={() => navigate("/quality-of-life-map/assessment")}
          className="liquid-glass-strong rounded-2xl px-8 py-4 inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-300"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontSize: "13px",
            color: "#0a1628",
            textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          }}
        >
          <span aria-hidden="true" style={{ color: "#b8860b", fontSize: "16px", textShadow: "0 0 12px rgba(244,212,114,0.6)" }}>✦</span>
          Start Assessment
        </button>
      </div>
    );
  }

  // Day 64 (Sasha 2026-05-07): full revamp per
  // docs/specs/quality-of-life-map/results_revamp_spec.md. Cards use
  // .liquid-glass (Apple iOS 26 register from glassmorphism_blueprint.md)
  // — light glass + dark navy text + halo cocktail. Single 8-domain
  // list replaces Growth/Strengths split. "See My Profile" gone (no
  // priorities page). Action row simplified to Retake / Download PDF.
  const sortedAscending = [...domainResults].sort((a, b) => a.stageValue - b.stageValue);
  const heroEyebrowStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "#0a1628",
    textShadow: "0 1px 2px rgba(255,255,255,0.85)",
  };
  const haloDeep =
    "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)";
  const content = (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Hero — liquid-glass per glassmorphism_blueprint.md.
          `data-qol-snapshot` attribute is the anchor html2canvas onclone
          uses to find the cloned hero subtree for CSS-var resolution. */}
      <div
        ref={snapshotRef}
        data-qol-snapshot
        className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-6"
      >
        <div className="text-center space-y-3">
          <p style={heroEyebrowStyle}>Your Quality of Life</p>
          <div className="inline-flex items-baseline gap-2">
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "clamp(56px, 8vw, 80px)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "#0a1628",
                textShadow: haloDeep,
              }}
            >
              {overallStageRounded}
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                fontSize: "20px",
                color: "rgba(26,30,58,0.5)",
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
              color: "rgba(26,30,58,0.78)",
            }}
          >
            Now you know where to focus your growth.
          </p>
        </div>

        {/* Radar Chart — gold palette */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(184, 134, 11, 0.28)" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: 'rgba(10,22,40,0.78)', fontSize: 14 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: 'rgba(10,22,40,0.45)', fontSize: 10 }} tickCount={6} />
              <Radar dataKey="value" stroke="#b8860b" fill="#b8860b" fillOpacity={0.32} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All 8 Life Areas — single list, sorted ascending (lowest first
          = where to grow). No tagging / highlighting per row — let the
          numbers speak. */}
      <div className="liquid-glass rounded-3xl p-6 sm:p-8">
        <p style={heroEyebrowStyle} className="mb-5">
          8 Life Areas
        </p>
        <div className="space-y-3">
          {sortedAscending.map(({ domain, stageValue }) => {
            const emoji = domainAbbreviations[domain.name] || "·";
            return (
              <div
                key={domain.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
                style={{ borderColor: "rgba(26,30,58,0.08)" }}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" style={{ fontSize: "18px" }}>{emoji}</span>
                  <span
                    style={{
                      fontFamily: "'Source Serif 4', serif",
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "rgba(26,30,58,0.88)",
                      textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                    }}
                  >
                    {domain.name}
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontWeight: 600,
                    fontSize: "17px",
                    color: "#b8860b",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stageValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share — kept (existing collapsible component) */}
      <ShareQol
        overallStage={overallStageRounded}
        growthDomains={growthDomains}
        strengthDomains={strengthDomains}
        profileId={profileId ?? undefined}
      />

      {/* Action row — Retake / Download PDF (two equal buttons). Each
          uses liquid-glass-strong from the playbook for prominence. */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleRetake}
          className="liquid-glass-strong rounded-2xl px-5 py-4 inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-300"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontSize: "13px",
            color: "#0a1628",
            textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Retake
        </button>
        <button
          onClick={handleDownloadPdf}
          className="liquid-glass-strong rounded-2xl px-5 py-4 inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-300"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontSize: "13px",
            color: "#0a1628",
            textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          }}
        >
          <Download className="w-4 h-4" style={{ color: "#b8860b" }} />
          Download PDF
        </button>
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
