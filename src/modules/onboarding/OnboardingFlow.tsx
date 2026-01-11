import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Compass, ClipboardList, Map, CheckCircle2 } from "lucide-react";
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

const MAX_STEP = 4;

const OnboardingFlow = ({ profileId, initialStep, hasZog, hasQol, onComplete }: OnboardingFlowProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(Math.min(initialStep ?? 0, MAX_STEP));
  const [saving, setSaving] = useState(false);

  const steps = useMemo(
    () => [
      {
        title: "Welcome to Game of Life",
        description: "We will guide you through a short setup so you can start with clarity.",
        icon: Sparkles,
      },
      {
        title: "Choose your path",
        description: "Use AI to generate your Zone of Genius or take the manual assessment.",
        icon: Compass,
      },
      {
        title: "Complete your Zone of Genius",
        description: "Generate your Appleseed or finish the assessment to unlock your profile.",
        icon: ClipboardList,
      },
      {
        title: "Rate your Quality of Life",
        description: "Capture a baseline across 8 life domains in a few minutes.",
        icon: Map,
      },
      {
        title: "Explore your world",
        description: "Tour your profile, quests, and missions to see what is available.",
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
              <p className="text-sm text-slate-600">
                In five short steps you will unlock your Zone of Genius, baseline your Quality of Life, and see your
                next quests.
              </p>
              <Button className="w-full" size="lg" onClick={() => goToStep(1)} disabled={saving}>
                Start onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 space-y-4">
              <Button
                className="w-full"
                size="lg"
                onClick={async () => {
                  await goToStep(2);
                  navigate("/zone-of-genius/entry?return=/game");
                }}
                disabled={saving}
              >
                AI already knows me
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="lg"
                onClick={async () => {
                  await goToStep(2);
                  navigate("/zone-of-genius/assessment?return=/game");
                }}
                disabled={saving}
              >
                I will do the manual assessment
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => goToStep(2)} disabled={saving}>
                Decide later
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {hasZog
                  ? "Great job, your Zone of Genius is already saved."
                  : "Complete your Zone of Genius to unlock your profile insights."}
              </div>
              {!hasZog && (
                <Button className="w-full" size="lg" onClick={() => navigate("/zone-of-genius/entry?return=/game")}>
                  Go to Zone of Genius
                </Button>
              )}
              <Button variant="outline" className="w-full" size="lg" onClick={() => goToStep(3)} disabled={saving}>
                Continue
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {hasQol
                  ? "Your Quality of Life snapshot is already saved."
                  : "Capture your baseline across eight domains so we can track your growth."}
              </div>
              {!hasQol && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => navigate("/quality-of-life-map/assessment?return=/game")}
                >
                  Start QoL snapshot
                </Button>
              )}
              <Button variant="outline" className="w-full" size="lg" onClick={() => goToStep(4)} disabled={saving}>
                Continue
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="mt-8 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" onClick={() => navigate("/game/profile")}>
                  Visit Profile
                </Button>
                <Button variant="outline" onClick={() => navigate("/game/next-move")}>
                  See next moves
                </Button>
                <Button variant="outline" onClick={() => navigate("/mission-discovery")}>
                  Explore missions
                </Button>
                <Button variant="outline" onClick={() => navigate("/map")}>
                  Open game map
                </Button>
              </div>
              <Button className="w-full" size="lg" onClick={handleFinish} disabled={saving}>
                Finish onboarding
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
