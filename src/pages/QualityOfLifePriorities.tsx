import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, GripVertical, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { buildQolGrowthRecipePath } from "@/lib/onboardingRouting";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS, type Domain, type DomainId } from "@/modules/quality-of-life-map/qolConfig";

const QOL_LABELS: Record<DomainId, string> = {
  wealth: "Wealth",
  health: "Health",
  happiness: "Happiness",
  love: "Love",
  impact: "Impact",
  growth: "Growth",
  socialTies: "Social",
  home: "Home",
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

  const [step, setStep] = useState<"next" | "priorities">("next");

  // Sort domains by score ascending (lowest first - biggest growth potential)
  const domainScores = useMemo(() => {
    return DOMAINS.map((domain) => {
      const stageValue = answers[domain.id] ?? 1;
      return { domain, stageValue };
    }).sort((a, b) => a.stageValue - b.stageValue);
  }, [answers]);

  // Initialize domain order sorted by score (lowest first)
  const [domainOrder, setDomainOrder] = useState<DomainId[]>(() =>
    domainScores.map(({ domain }) => domain.id)
  );

  const [draggedId, setDraggedId] = useState<DomainId | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update order when scores change
  useMemo(() => {
    setDomainOrder(domainScores.map(({ domain }) => domain.id));
  }, [domainScores]);

  const highlightIds = useMemo(() => {
    return new Set(domainScores.slice(0, 3).map((entry) => entry.domain.id));
  }, [domainScores]);

  const handleDragStart = (id: DomainId) => {
    setDraggedId(id);
  };

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
        title: "Priorities saved",
        description: `Focused on ${topThree.map((id) => QOL_LABELS[id]).join(", ")}.`,
      });

      navigate(buildQolGrowthRecipePath(returnTo, topThree[0]));
    } catch (err: any) {
      toast({
        title: "Unable to save",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderDomainCard = (domain: Domain, stageValue: number) => {
    const stage = domain.stages.find((entry) => entry.id === stageValue);
    const nextStage = domain.stages.find((entry) => entry.id === stageValue + 1);
    const highlight = highlightIds.has(domain.id);
    const maxStage = Math.max(...domain.stages.map(s => s.id));

    return (
      <div
        key={domain.id}
        className={`rounded-xl border p-5 transition-colors ${highlight ? "border-amber-300 bg-amber-50/90" : "border-white/10 bg-white/5"
          }`}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">{domain.name}</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${highlight ? "bg-amber-500 text-slate-900" : "bg-white/10 text-white/70"}`}>
            {stageValue}/{maxStage}
          </div>
        </div>
        <div className="space-y-2 text-sm text-white/70">
          <p>
            <span className="text-white/90 font-semibold">Current:</span>{" "}
            {stage ? `${stage.title} — ${stage.description}` : "Stage not set"}
          </p>
          <p>
            <span className="text-white/90 font-semibold">Next:</span>{" "}
            {nextStage ? `${nextStage.title} — ${nextStage.description}` : "You are at the highest stage."}
          </p>
        </div>
        {highlight && (
          <p className="mt-3 text-xs font-semibold uppercase text-amber-700">
            🎯 High growth potential — lowest areas often hold the biggest breakthroughs
          </p>
        )}
      </div>
    );
  };

  if (!isComplete) {
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
        <section
          className="py-24 px-6 min-h-dvh flex items-center justify-center"
          style={{ backgroundColor: "hsl(220, 30%, 12%)" }}
        >
          <div className="container mx-auto max-w-2xl text-center">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-white">
              <BoldText>COMPLETE YOUR ASSESSMENT FIRST</BoldText>
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Finish the Quality of Life assessment to set your growth priorities.
            </p>
            <Button
              onClick={() => navigate("/quality-of-life-map/assessment")}
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
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Navigation />

      <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "hsl(220, 30%, 12%)" }}>
        <div className="container mx-auto max-w-4xl">
          <BackButton
            label={<BoldText>BACK</BoldText>}
            className="text-white/60 hover:text-white transition-colors font-semibold"
          />
        </div>
      </div>

      <section className="py-20 px-6 min-h-dvh" style={{ backgroundColor: "hsl(220, 30%, 12%)" }}>
        <div className="container mx-auto max-w-4xl">
          {step === "next" && (
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3 text-white">
                  <BoldText>YOUR NEXT LEVEL</BoldText>
                </h1>
                <p className="text-white/70">
                  Here is what growth looks like across all 8 domains. The highlighted ones offer the biggest leap.
                </p>
              </div>

              <div className="grid gap-4">
                {domainScores.map(({ domain, stageValue }) => renderDomainCard(domain, stageValue))}
              </div>

              <div className="flex justify-center mt-10">
                <Button
                  onClick={() => setStep("priorities")}
                  className="text-lg px-8"
                  style={{
                    backgroundColor: "hsl(var(--destiny-gold))",
                    color: "hsl(var(--destiny-dark))",
                  }}
                >
                  Prioritize My Focus
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === "priorities" && (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-serif font-bold mb-3 text-white">
                  <BoldText>RANK YOUR PRIORITIES</BoldText>
                </h1>
                <p className="text-white/70 mb-2">
                  Sorted by current score — lowest first. Drag to reorder if you prefer a different focus.
                </p>
                <p className="text-white/50 text-sm">
                  💡 In systems thinking, the lowest area is often the bottleneck — fix it and everything rises.
                </p>
              </div>

              <div className="space-y-3">
                {domainOrder.map((domainId, index) => {
                  const domain = DOMAINS.find((item) => item.id === domainId);
                  const scoreEntry = domainScores.find(s => s.domain.id === domainId);
                  const score = scoreEntry?.stageValue ?? 0;
                  const maxStage = domain ? Math.max(...domain.stages.map(s => s.id)) : 10;
                  const isTop = index < 3;
                  return (
                    <div
                      key={domainId}
                      draggable
                      onDragStart={() => handleDragStart(domainId)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(domainId)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-white transition cursor-grab active:cursor-grabbing ${isTop ? "border-amber-300 bg-amber-500/10" : "border-white/10 bg-white/5"
                        }`}
                    >
                      <GripVertical className="h-5 w-5 text-white/50" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{domain?.name || domainId}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isTop ? "bg-amber-500 text-slate-900" : "bg-white/10 text-white/60"}`}>
                            {score}/{maxStage}
                          </span>
                        </div>
                        {isTop && (
                          <p className="text-xs text-amber-200">Focus priority #{index + 1}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button
                  variant="outline"
                  onClick={() => navigate(returnTo === "/start" ? "/game" : returnTo || "/game")}
                  className="text-lg px-8"
                  style={{ borderColor: "#FFD54F", color: "#FFD54F" }}
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-lg px-8"
                  style={{
                    backgroundColor: "hsl(var(--destiny-gold))",
                    color: "hsl(var(--destiny-dark))",
                  }}
                >
                  {isSaving ? "Saving..." : "Save Priorities"}
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default QualityOfLifePriorities;
