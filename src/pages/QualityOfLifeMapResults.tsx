import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
// Day 67 (Sasha 2026-05-10): empty-state CTA migrated to shared
// editorial pattern — same dark glass pill with breathing gold halo
// + rotating ignite-logo emblem as the landing's primary CTA.
// One source of truth: src/components/ui/editorial-cta.tsx.
import { EditorialCta } from "@/components/ui/editorial-cta";
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
import { withRetry } from "@/lib/withRetry";
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

      // Day 66 wave C2 (Sasha 2026-05-16): withRetry wrap on both
      // critical writes — transient network blips no longer surface
      // as "Could not save your results" toasts on what would have
      // succeeded with one retry.
      const { data: newSnapshot, error: snapshotError } = await withRetry(() =>
        supabase
          .from('qol_snapshots')
          .insert(snapshotInsert)
          .select('id, xp_awarded')
          .single(),
      );

      if (snapshotError) throw snapshotError;
      if (!newSnapshot) throw new Error('qol_snapshots insert returned no data');

      savedSnapshotId = newSnapshot.id;
      xpAlreadyAwardedOnRow = !!newSnapshot.xp_awarded;

      // Day 65 wave 8 (Sasha 2026-05-15): pointer update moved INTO
      // the critical-save try/catch. Before today, the pointer
      // (`last_qol_snapshot_id`) was written in a separate side-effects
      // block — if that block threw, the qol_snapshots row existed
      // but `game_profiles.last_qol_snapshot_id` stayed null. Three
      // profiles leaked under that pattern (backfilled separately).
      // Now the pointer write is part of the critical save: if it
      // fails, the user sees the destructive toast and can retry,
      // matching the contract that "save success ↔ data is queryable
      // by next visit."
      const shouldUnlock = shouldUnlockAfterQol(returnTo);
      const { error: pointerError } = await withRetry(() =>
        supabase
          .from('game_profiles')
          .update({
            last_qol_snapshot_id: savedSnapshotId,
            onboarding_stage: shouldUnlock ? "unlocked" : "qol_complete",
            onboarding_completed: shouldUnlock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileId),
      );
      if (pointerError) throw pointerError;

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
    // Day 65 wave 8 (Sasha 2026-05-15): pointer update moved up into
    // the critical-save try/catch. Block below is now XP + telemetry
    // only — pure best-effort gamification bookkeeping. Failure here
    // doesn't orphan user data.
    try {
      if (savedSnapshotId) {
        // XP / gamification — best-effort.
        if (!xpAlreadyAwardedOnRow) {
          const xpResult = await awardXp(profileId, 100, "mind");
          if (xpResult.success) {
            await supabase
              .from('qol_snapshots')
              .update({ xp_awarded: true })
              .eq('id', savedSnapshotId);

            // Day 64 (Sasha 2026-05-07): toasts disabled per Sasha's
            // feedback. Underlying awards still fire; only user-facing
            // toast notifications suppressed.
            // toast({ title: "🎉 +100 XP (Mind)", ... });

            const bonusResult = await awardFirstTimeBonus(profileId, "first_qol_complete", 100, 2, "mind");
            if (bonusResult.awarded) {
              // toast({ title: "🎉 FIRST TIME BONUS!", ... });
            }
          }
        }

        // Telemetry — separate, best-effort.
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

  // Day 64 (Sasha 2026-05-07, FOURTH pass): comprehensive PDF fix.
  // Prior attempts kept failing because I was patching ONE surface
  // at a time:
  //   - Day 63: strip backdrop-filter (necessary, insufficient)
  //   - Day 64 first pass: resolve CSS vars (also insufficient)
  //   - Day 64 second pass: override .liquid-glass classes via style
  //     injection (still insufficient if html2canvas doesn't apply
  //     dynamically-injected styles to the offscreen render)
  // This pass: REMOVE the .liquid-glass classes entirely from the
  // cloned tree (no class = no ::before pseudo-element, period) AND
  // wrap each step in its own try/catch so the actual failure point
  // is surfaced AND fall back to a plain-jsPDF text PDF if rasterization
  // genuinely can't work in this environment.
  //
  // The fallback PDF won't have the radar chart visual — just titled
  // text content (overall score + 8 domain rows + date). Functional
  // for "I want a record of my snapshot at this time" use case, even
  // if it's less fancy than the rasterized version.
  const generateFallbackPdf = (): jsPDF => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 25;

    // Day 64 (Sasha 2026-05-07): aesthetic pass on the fallback PDF.
    // Sasha liked the simplicity of the previous text-only version —
    // we keep its restraint and add UI-aligned typographic polish:
    //   • Times (serif) for the editorial title + score, mirroring
    //     Cormorant Garamond's role in the live UI.
    //   • Helvetica for body text, matching the live skin's secondary
    //     register.
    //   • Gold hairline rules (#b8860b) replacing visual hierarchy
    //     that would otherwise need heavier type or color.
    //   • Tracked small-caps section header for editorial rhythm.
    //   • Brand line at footer to close the page.
    // Title renamed: "Your Quality of Life" → "Quality of Life"
    // (matches the ME pane row "Quality of Life" — same noun across
    // surfaces).

    // Color tokens — hardcoded RGB equivalents of the skin variables.
    const NAVY: [number, number, number] = [10, 22, 40];
    const GOLD: [number, number, number] = [184, 134, 11];
    const MUTED: [number, number, number] = [120, 120, 130];

    let y = 32;

    // ─── Title (Times serif, navy) ─────────────────────────────────
    pdf.setFont("times", "normal");
    pdf.setFontSize(26);
    pdf.setTextColor(...NAVY);
    pdf.text("Quality of Life", pageWidth / 2, y, { align: "center" });
    y += 5;

    // Hairline gold rule, centered, short — masthead accent
    pdf.setDrawColor(...GOLD);
    pdf.setLineWidth(0.3);
    pdf.line(pageWidth / 2 - 18, y, pageWidth / 2 + 18, y);
    y += 8;

    // ─── Date (helvetica, italic, muted) ───────────────────────────
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(10);
    pdf.setTextColor(...MUTED);
    pdf.text(
      new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 22;

    // ─── Overall score (Times serif, navy, large) ──────────────────
    pdf.setFont("times", "normal");
    pdf.setFontSize(56);
    pdf.setTextColor(...NAVY);
    pdf.text(`${overallStageRounded} / 10`, pageWidth / 2, y, { align: "center" });
    y += 16;

    // ─── Subtitle (italic muted, editorial) ────────────────────────
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(11);
    pdf.setTextColor(...MUTED);
    pdf.text("Now you know where to focus your growth.", pageWidth / 2, y, { align: "center" });
    y += 22;

    // ─── Section divider — full-width hairline ─────────────────────
    pdf.setDrawColor(...GOLD);
    pdf.setLineWidth(0.2);
    pdf.line(margin, y, pageWidth - margin, y);
    y += 7;

    // ─── Section header — tracked small caps in gold ───────────────
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...GOLD);
    // jsPDF CharSpace adds tracking — gives the eyebrow that "tracked
    // uppercase" feel used throughout the live UI's section headers.
    pdf.setCharSpace(0.6);
    pdf.text("EIGHT LIFE AREAS", margin, y);
    pdf.setCharSpace(0);
    y += 9;

    // ─── Domain rows (sorted weakest-first) ────────────────────────
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    [...domainResults]
      .sort((a, b) => a.stageValue - b.stageValue)
      .forEach(({ domain, stageValue }) => {
        pdf.setTextColor(...NAVY);
        pdf.text(domain.name, margin, y);
        pdf.setTextColor(...GOLD);
        pdf.text(String(stageValue), pageWidth - margin, y, { align: "right" });
        y += 8;
      });

    // ─── Footer — bottom hairline + brand attribution ──────────────
    const footerY = pageHeight - 18;
    pdf.setDrawColor(...GOLD);
    pdf.setLineWidth(0.2);
    pdf.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(...MUTED);
    pdf.text("findyourtoptalent.com", pageWidth / 2, footerY, { align: "center" });

    return pdf;
  };

  const handleDownloadPdf = async () => {
    if (!snapshotRef.current) return;
    let pdf: jsPDF | null = null;

    // ─── Attempt 1: rasterize via html2canvas ───────────────────────
    try {
      const liveRef = snapshotRef.current;
      const canvas = await html2canvas(snapshotRef.current, {
        scale: 2,
        backgroundColor: '#f5f4f1',
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Step 1: strip the .liquid-glass / .liquid-glass-strong
          // classes ENTIRELY from the cloned tree. No class → no
          // ::before pseudo-element with mask-composite, period.
          // More reliable than overriding via injected stylesheet.
          const glassEls = clonedDoc.querySelectorAll<HTMLElement>('.liquid-glass, .liquid-glass-strong');
          glassEls.forEach((el) => {
            el.classList.remove('liquid-glass', 'liquid-glass-strong');
            el.style.background = 'rgba(255, 255, 255, 0.94)';
            el.style.backdropFilter = 'none';
            (el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = 'none';
            el.style.border = '0.5px solid rgba(26, 30, 58, 0.12)';
            el.style.boxShadow = '0 4px 16px -4px rgba(10, 22, 40, 0.08), 0 16px 40px -20px rgba(10, 22, 40, 0.16)';
          });

          // Step 2: belt-and-suspenders — strip all backdrop-filter /
          // filter / animation / transition across the entire cloned
          // tree.
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

      // Try to convert the canvas to an image data URL. This is where
      // CORS-tainted canvases throw a SecurityError ("Tainted canvases
      // may not be exported"). If the cinematic background image
      // bleeds into the snapshot via backdrop-filter and the image
      // lacks proper CORS headers, this step fails.
      const imgData = canvas.toDataURL("image/png");
      pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, imgHeight);
    } catch (err) {
      // Rasterization failed — fall through to the text-PDF fallback
      // below. Log the actual error message so future debugging has
      // a real signal (not the generic "Download Failed" toast we
      // used to ship).
      const e = err as { message?: string; name?: string };
      console.warn('[QoL] html2canvas rasterization failed; falling back to text PDF:', {
        name: e?.name,
        message: e?.message,
        raw: err,
      });
      pdf = null;
    }

    // ─── Attempt 2: text-only fallback PDF ──────────────────────────
    // If the rasterization path didn't produce a PDF, generate a clean
    // text-only PDF directly via jsPDF. Less fancy but reliable —
    // user gets their snapshot data as a saveable artifact.
    if (!pdf) {
      try {
        pdf = generateFallbackPdf();
      } catch (err) {
        const e = err as { message?: string };
        console.error('[QoL] Fallback text-PDF generation also failed:', err);
        toast({
          title: "Download Failed",
          description: `Couldn't generate PDF: ${e?.message?.slice(0, 60) ?? 'unknown error'}. Open browser DevTools → Console for details.`,
          variant: "destructive",
        });
        return;
      }
    }

    // pdf is non-null at this point — either rasterized or fallback.
    try {
      pdf.save(`quality-of-life-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast({ title: "PDF Downloaded", description: "Your snapshot has been saved." });
    } catch (err) {
      const e = err as { message?: string };
      console.error('[QoL] PDF save (browser download) failed:', err);
      toast({
        title: "Download Failed",
        description: `Save error: ${e?.message?.slice(0, 60) ?? 'unknown'}.`,
        variant: "destructive",
      });
    }
  };

  // Day 63 (Sasha 2026-05-06): shell removed — QolLayout now wraps in
  // GameShellV2 once for all four QoL pages.
  // Day 64 (Sasha 2026-05-07): loading + empty state colors switched
  // from white-on-cream-illegible to skin-text-primary navy.
  // Loading state — Day 64 (third pass): halo + Source Serif 4 italic
  // for legibility on the cinematic bg.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
            fontSize: "15px",
            color: "rgba(11, 42, 90, 0.78)",
            textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          }}
          className="animate-pulse"
        >
          Loading your results...
        </div>
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
            // Day 64 (third pass): muted-alpha lift 0.78 → 0.88 + halo-soft.
            color: "rgba(11, 42, 90, 0.88)",
            textShadow: "0 1px 2px rgba(255,255,255,0.7)",
          }}
          className="mb-7"
        >
          Answer all 8 domains to see your results.
        </p>
        {/* Day 67 (Sasha 2026-05-10): the old liquid-glass-strong
            rectangle with the lone ✦ glyph was a different CTA dialect
            from the landing — dialect drift Sasha flagged in the
            screenshot review. Now using the canonical `<EditorialCta>`
            so this surface inherits the landing's exact pixels: dark
            glass pill, rotating ignite-logo emblem, small-caps tracked
            label, → arrow, gold-halo breath animation. */}
        <EditorialCta
          label="Start Assessment"
          onClick={() => navigate("/quality-of-life-map/assessment")}
        />
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
  // Day 64 (third pass): full halo-deep cocktail per docs/03-playbooks/
  // ui_playbook.md Part VIII Master Legibility Strong (1.5×). 4-layer:
  // 28px white halo (lift on cream) + 1-2px white near-stroke (max
  // contrast on light bg) + 1px navy under-stroke × 2 (sharp navy
  // backing for variable-luminance backdrops — the cinematic image's
  // bright/dark variations). Same exact cocktail as
  // MethodologyLandingPage.tsx line 79. Replaces the weaker single-
  // white-stroke cocktail that left text looking faint on the cream
  // sections of the cinematic bg.
  const haloDeep =
    "0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45)";
  const heroEyebrowStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "11px",
    fontWeight: 700, // Cormorant max — heaviest stroke for small uppercase tracking
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "#0a1628",
    textShadow: haloDeep,
  };
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
          <p style={heroEyebrowStyle}>Quality of Life</p>
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
              // Day 64 (third pass): muted-alpha lifted 0.78 → 0.88 + halo-soft
              // per ui_playbook.md Part VIII Strong cocktail lever 2.
              color: "rgba(11, 42, 90, 0.88)",
              textShadow: "0 1px 2px rgba(255,255,255,0.7)",
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
                      // Day 64 (third pass): weight 500→600 + alpha 0.88→0.94
                      // + halo-soft strengthened per Strong cocktail. Domain
                      // names now read cleanly against the cinematic bg's
                      // bright sections.
                      fontWeight: 600,
                      color: "rgba(11, 42, 90, 0.94)",
                      textShadow: "0 1px 2px rgba(255,255,255,0.85), 0 0 1px rgba(11,42,90,0.4)",
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
      {/* Action row — Day 64 (third pass): fontWeight 600→700 + halo
          cocktail strengthened to landing-register Strong on button
          labels for legibility against liquid-glass-strong surface. */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleRetake}
          className="liquid-glass-strong rounded-2xl px-5 py-4 inline-flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-300"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "13px",
            color: "#0a1628",
            textShadow: "0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.5)",
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
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "13px",
            color: "#0a1628",
            textShadow: "0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.5)",
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
