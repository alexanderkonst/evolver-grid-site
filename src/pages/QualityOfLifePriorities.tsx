import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, GripVertical, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { buildQolGrowthRecipePath } from "@/lib/onboardingRouting";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS, type DomainId } from "@/modules/quality-of-life-map/qolConfig";
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
  const { answers, isComplete } = useQolAssessment();
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

  useMemo(() => {
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileId = await getOrCreateGameProfileId();
      const topThree = domainOrder.slice(0, 3);
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
          <h1 className="text-2xl font-bold text-[#2c3150] mb-2">Set Your Priorities</h1>
          <p className="text-sm text-[#a4a3d0]">
            Drag to reorder. Top 3 become your focus areas.
          </p>
          <p className="text-xs text-[#a4a3d0] mt-1">
            💡 Lowest areas often hold the biggest breakthroughs
          </p>
        </div>

        {/* Draggable List */}
        <div className="space-y-2">
          {domainOrder.map((domainId, index) => {
            const domain = DOMAINS.find((item) => item.id === domainId);
            const scoreEntry = domainScores.find(s => s.domain.id === domainId);
            const score = scoreEntry?.stageValue ?? 0;
            const isTop = index < 3;

            return (
              <div
                key={domainId}
                draggable
                onDragStart={() => handleDragStart(domainId)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(domainId)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition cursor-grab active:cursor-grabbing ${isTop
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
            onClick={() => navigate(returnTo === "/start" ? "/game" : returnTo || "/game")}
          >
            Skip for now
          </Button>
        </div>
      </div>
    </GameShellV2>
  );
};

export default QualityOfLifePriorities;
