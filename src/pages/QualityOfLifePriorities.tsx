// =============================================================================
// DEAD CODE — Day 64 (Sasha 2026-05-07)
// =============================================================================
// This component is no longer routed. The /quality-of-life-map/priorities
// route was retired in the Day 64 Results revamp (see
// docs/specs/quality-of-life-map/results_revamp_spec.md). The file is
// preserved in place — quick to revive if the call is reversed. Nothing
// in the running app imports this component.
// =============================================================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, GripVertical, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { buildQolGrowthRecipePath } from "@/lib/onboardingRouting";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS, TOP_PRIORITIES_COUNT, type DomainId } from "@/modules/quality-of-life-map/qolConfig";
// Day 63 (Sasha 2026-05-06): GameShellV2 import removed — shell now
// owned by QolLayout, not per-page.

const QOL_LABELS: Record<DomainId, string> = {
  wealth: "💰 Wealth", health: "💪 Health", happiness: "😊 Happiness", love: "❤️ Love",
  impact: "🌍 Impact", growth: "🌱 Growth", socialTies: "🤝 Social", home: "🏠 Home",
};

const reorder = (list: DomainId[], startIndex: number, endIndex: number) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const QualityOfLifePriorities = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("return");
  const { answers, isComplete, isLoading } = useQolAssessment();
  const { toast } = useToast();

  // Sort domains by score ascending (lowest first)
  const domainScores = useMemo(() => {
    return DOMAINS.map((domain) => ({
      domain,
      stageValue: answers[domain.id] ?? 1,
    })).sort((a, b) => a.stageValue - b.stageValue);
  }, [answers]);

  const [domainOrder, setDomainOrder] = useState<DomainId[]>(() =>
    domainScores.map(({ domain }) => domain.id)
  );
  const [draggedId, setDraggedId] = useState<DomainId | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Day 63 (Sasha 2026-05-06): was useMemo with setState side-effect — a
  // React anti-pattern that risks infinite re-render loops in Strict
  // Mode. useEffect is the correct hook for "run on dep change" side
  // effects.
  useEffect(() => {
    setDomainOrder(domainScores.map(({ domain }) => domain.id));
  }, [domainScores]);

  const handleDragStart = (id: DomainId) => setDraggedId(id);

  const handleDrop = (targetId: DomainId) => {
    if (!draggedId || draggedId === targetId) return;
    const startIndex = domainOrder.indexOf(draggedId);
    const endIndex = domainOrder.indexOf(targetId);
    if (startIndex === -1 || endIndex === -1) return;
    setDomainOrder(reorder(domainOrder, startIndex, endIndex));
    setDraggedId(null);
  };

  // Day 63 (Sasha 2026-05-06): keyboard alternative to drag-and-drop.
  // Tab to a row, then ArrowUp / ArrowDown moves it. Drag-and-drop is
  // unchanged — this adds a parallel input modality so keyboard users
  // (and mobile users with inconsistent HTML5-DnD support) can reorder.
  // WCAG 2.1.1 (keyboard) compliance.
  const handleKeyReorder = (id: DomainId, e: React.KeyboardEvent) => {
    const idx = domainOrder.indexOf(id);
    if (idx === -1) return;
    if (e.key === "ArrowUp" && idx > 0) {
      e.preventDefault();
      setDomainOrder(reorder(domainOrder, idx, idx - 1));
    } else if (e.key === "ArrowDown" && idx < domainOrder.length - 1) {
      e.preventDefault();
      setDomainOrder(reorder(domainOrder, idx, idx + 1));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileId = await getOrCreateGameProfileId();
      const topThree = domainOrder.slice(0, TOP_PRIORITIES_COUNT);
      const { error } = await supabase
        .from("game_profiles")
        .update({ qol_priorities: topThree })
        .eq("id", profileId);
      if (error) throw error;

      toast({
        title: "✨ Priorities Saved!",
        description: `Focus: ${topThree.map((id) => DOMAINS.find(d => d.id === id)?.name).join(", ")}.`,
      });

      navigate(buildQolGrowthRecipePath(returnTo, topThree[0]));
    } catch (err: any) {
      toast({ title: "Unable to save", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Day 63 (Sasha 2026-05-06): isLoading branch. Without this, a fresh
  // mount that hits this page directly (e.g., bookmark, deep-link)
  // briefly showed "Complete your assessment" before the DB load
  // completed and answers populated — confusing for users who DO have
  // a saved assessment.
  //
  // Shell removed at the same time — QolLayout now wraps in GameShellV2
  // once for all four QoL pages.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--wabi-text-muted)] animate-pulse">Loading your priorities...</div>
      </div>
    );
  }

  // Not complete state
  if (!isComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Target className="w-16 h-16 mx-auto text-[var(--wabi-text-muted)] mb-4" />
        <h1
          // Day 63 (Sasha 2026-05-06): Cormorant editorial register on H1
          // to match landing. Halo-deep textShadow + skin-text-primary
          // fallback chain (skin → wabi → hex) for legibility on either
          // surface theme.
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
        <p className="text-[var(--wabi-text-muted)] mb-6">Finish the QoL assessment to set priorities.</p>
        <Button variant="wabi-primary" onClick={() => navigate("/quality-of-life-map/assessment")}>
          Start Assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header
            Day 63 (Sasha 2026-05-06): Cormorant editorial H1 + Source
            Serif 4 italic body subhead — matches landing's typographic
            register. Halo-deep textShadow keeps the headline legible on
            cream-wash surfaces. */}
        <div className="text-center">
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.2vw, 32px)",
              letterSpacing: "-0.005em",
              lineHeight: 1.1,
              color: "var(--skin-text-primary, var(--wabi-text-primary, #0b2a5a))",
              textShadow: "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
            className="mb-2"
          >
            Your Focus Areas
          </h1>
          <p
            style={{
              fontFamily: "'Source Serif 4', 'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "14px",
              lineHeight: 1.55,
            }}
            className="text-[var(--wabi-text-muted)]"
          >
            💡 Lowest areas often hold your biggest breakthroughs
          </p>
          <p className="text-xs text-[var(--wabi-text-muted)] mt-1">
            Drag to reorder if you'd like. Top 3 become your focus areas.
          </p>
        </div>

        {/* Draggable List */}
        <div className="space-y-2">
          {domainOrder.map((domainId, index) => {
            const domain = DOMAINS.find((item) => item.id === domainId);
            const scoreEntry = domainScores.find(s => s.domain.id === domainId);
            const score = scoreEntry?.stageValue ?? 0;
            const isTop = index < TOP_PRIORITIES_COUNT;

            return (
              <div
                key={domainId}
                draggable
                tabIndex={0}
                role="button"
                aria-label={`${QOL_LABELS[domainId]}, position ${index + 1} of ${domainOrder.length}. Use Arrow Up or Arrow Down to reorder.`}
                onKeyDown={(e) => handleKeyReorder(domainId, e)}
                onDragStart={() => handleDragStart(domainId)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(domainId)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--depth-violet)]/50 ${isTop
                  ? "border-[var(--depth-violet)]/50 bg-gradient-to-r from-[var(--depth-violet)]/10 to-[var(--wabi-text-muted)]/10"
                  : "border-[var(--wabi-text-muted)]/20 bg-white/50"
                  }`}
              >
                <GripVertical className="h-5 w-5 text-[var(--wabi-text-muted)]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {/* Day 63 (Sasha 2026-05-06): domain label in Source
                        Serif 4 to match editorial register; score badge
                        stays sans for data-feel; "Priority #N" subtext in
                        Cormorant tracked-uppercase as a gold-accent
                        eyebrow. */}
                    <p
                      style={{
                        fontFamily: "'Source Serif 4', serif",
                        fontWeight: 500,
                        fontSize: "15px",
                      }}
                      className={isTop ? "text-[var(--depth-violet)]" : "text-[var(--wabi-text-primary)]"}
                    >
                      {QOL_LABELS[domainId]}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${isTop ? "bg-[var(--depth-violet)] text-white" : "bg-[var(--wabi-text-muted)]/20 text-[var(--wabi-text-muted)]"}`}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {score}/10
                    </span>
                  </div>
                  {isTop && (
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 600,
                        fontSize: "10.5px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "var(--depth-violet)",
                      }}
                    >
                      Priority {index + 1}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="wabi-primary" className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Priorities"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="wabi-ghost"
            className="w-full"
            // Day 63 (Sasha 2026-05-06): /game retired (App.tsx:431
            // redirects to /game/journey). Skip should land the founder
            // back inside the platform on their journey, not on the
            // public marketing landing.
            onClick={() => navigate(returnTo === "/start" ? "/game/journey" : returnTo || "/game/journey")}
          >
            Skip for now
          </Button>
        </div>
      </div>
  );
};

export default QualityOfLifePriorities;
