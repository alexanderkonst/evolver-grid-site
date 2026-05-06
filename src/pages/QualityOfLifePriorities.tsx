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
import GameShellV2 from "@/components/game/GameShellV2";

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
  if (isLoading) {
    return (
      <GameShellV2>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-[#a4a3d0] animate-pulse">Loading your priorities...</div>
        </div>
      </GameShellV2>
    );
  }

  // Not complete state
  if (!isComplete) {
    return (
      <GameShellV2>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <Target className="w-16 h-16 mx-auto text-[#a4a3d0] mb-4" />
          <h1 className="text-2xl font-bold text-[#2c3150] mb-4">Complete Your Assessment</h1>
          <p className="text-[#a4a3d0] mb-6">Finish the QoL assessment to set priorities.</p>
          <Button variant="wabi-primary" onClick={() => navigate("/quality-of-life-map/assessment")}>
            Start Assessment
          </Button>
        </div>
      </GameShellV2>
    );
  }

  return (
    <GameShellV2>
      <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Your Focus Areas</h1>
          <p className="text-sm text-[#a4a3d0]">
            💡 Lowest areas often hold your biggest breakthroughs
          </p>
          <p className="text-xs text-[#a4a3d0] mt-1">
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
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition cursor-grab active:cursor-grabbing focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8460ea]/50 ${isTop
                  ? "border-[#8460ea]/50 bg-gradient-to-r from-[#8460ea]/10 to-[#a4a3d0]/10"
                  : "border-[#a4a3d0]/20 bg-white/50"
                  }`}
              >
                <GripVertical className="h-5 w-5 text-[#a4a3d0]" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${isTop ? "text-[#8460ea]" : "text-[#2c3150]"}`}>
                      {QOL_LABELS[domainId]}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isTop ? "bg-[#8460ea] text-white" : "bg-[#a4a3d0]/20 text-[#a4a3d0]"
                      }`}>
                      {score}/10
                    </span>
                  </div>
                  {isTop && (
                    <p className="text-xs text-[#8460ea]">Priority #{index + 1}</p>
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
    </GameShellV2>
  );
};

export default QualityOfLifePriorities;
