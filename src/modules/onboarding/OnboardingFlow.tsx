import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Compass, CheckCircle2, Map, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import GameShell from "@/components/game/GameShell";
import { supabase } from "@/integrations/supabase/client";

interface OnboardingFlowProps {
  profileId: string;
  initialStep?: number | null;
  hasZog: boolean;
  hasQol: boolean;
  onComplete: () => void;
}

const MAX_STEP = 5;

const OnboardingFlow = ({ profileId, initialStep, hasZog, hasQol, onComplete }: OnboardingFlowProps) => {
  const navigate = useNavigate();
  const startingStep = useMemo(() => {
    if (hasQol) return MAX_STEP;
    if (hasZog) return 3;
    return Math.min(initialStep ?? 0, MAX_STEP);
  }, [hasQol, hasZog, initialStep]);

  const [step, setStep] = useState(startingStep);
  const [saving, setSaving] = useState(false);

  const steps = useMemo(
    () => [
      {
        title: "Discover who you really are.",
        description: "3 minutes. Free.",
        icon: Sparkles,
      },
      {
        title: "Your Zone of Genius",
        description: "Where you're naturally valuable.",
        icon: Compass,
      },
      {
        title: "Do you have an AI that knows you well?",
        description: "Choose the path that fits you best.",
        icon: Bot,
      },
      {
        title: "You've met yourself.",
        description: "Now you can grow.",
        icon: CheckCircle2,
      },
      {
        title: "Map your life.",
        description: "8 areas. 2 minutes.",
        icon: Map,
      },
      {
        title: "This is your game.",
        description: "This is your story.",
        icon: CheckCircle2,
      },
    ],
    []
  );

  const persistStep = async (nextStep: number, completed = false) => {
    setSaving(true);
    const { error } = await supabase
      .from("game_profiles")
      .update({
        onboarding_step: nextStep,
        onboarding_completed: completed,
      })
      .eq("id", profileId);
    setSaving(false);
    if (error) {
      console.error("Failed to update onboarding state:", error);
      return false;
    }
    return true;
  };

  const updateStage = async (nextStage: string) => {
    const { error } = await supabase
      .from("game_profiles")
      .update({ onboarding_stage: nextStage })
      .eq("id", profileId);
    if (error) {
      console.error("Failed to update onboarding stage:", error);
      return false;
    }
    return true;
  };

  const goToStep = async (nextStep: number) => {
    const success = await persistStep(nextStep);
    if (success) {
      setStep(nextStep);
    }
  };

  const handleSkip = async () => {
    const success = await persistStep(MAX_STEP, true);
    if (success) {
      onComplete();
    }
  };

  const handleFinish = async () => {
    const success = await persistStep(MAX_STEP, true);
    if (success) {
      onComplete();
    }
  };

  const handleStartZog = async (path: "ai" | "manual") => {
    const stageUpdated = await updateStage("zog_started");
    if (!stageUpdated) return;
    const success = await persistStep(3);
    if (!success) return;
    setStep(3);
    if (path === "ai") {
      navigate("/zone-of-genius/entry?return=/start");
    } else {
      navigate("/zone-of-genius/assessment?return=/start");
    }
  };

  const handleStartQol = async () => {
    const success = await persistStep(5);
    if (!success) return;
    setStep(5);
    navigate("/quality-of-life-map/assessment?return=/start");
  };

  const current = steps[step];
  const CurrentIcon = current.icon;

  return (
    <GameShell>
      <div className="min-h-[70vh] px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Onboarding</p>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{current.title}</h1>
              <p className="text-slate-600 mt-3">{current.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip} disabled={saving}>
              Skip
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
              <CurrentIcon className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Step {step + 1} of {steps.length}</span>
                <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-amber-500 transition-all"
                  style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {step === 0 && (
            <div className="mt-8 space-y-4">
              <Button className="w-full" size="lg" onClick={() => goToStep(1)} disabled={saving}>
                Start
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 space-y-4">
              <Button className="w-full" size="lg" onClick={() => goToStep(2)} disabled={saving}>
                Find mine
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleStartZog("ai")}
                disabled={saving}
              >
                Yes
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={() => handleStartZog("manual")}
                disabled={saving}
              >
                No
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="mt-8 space-y-4">
              <Button className="w-full" size="lg" onClick={() => goToStep(4)} disabled={saving}>
                Start growing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="mt-8 space-y-4">
              <Button className="w-full" size="lg" onClick={handleStartQol} disabled={saving}>
                Begin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 5 && (
            <div className="mt-8 space-y-4">
              <Button className="w-full" size="lg" onClick={handleFinish} disabled={saving}>
                Begin
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
};

export default OnboardingFlow;
