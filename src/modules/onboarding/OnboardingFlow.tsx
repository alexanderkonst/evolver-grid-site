import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Compass, CheckCircle2, Map, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProgressIndicator from "@/components/ProgressIndicator";
import OnboardingProgress from "@/components/OnboardingProgress";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import ZoGIntroScreen from "@/components/onboarding/ZoGIntroScreen";
import QoLIntroScreen from "@/components/onboarding/QoLIntroScreen";
import TourOverviewScreen from "@/components/onboarding/TourOverviewScreen";

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
    const stageUpdated = await updateStage("unlocked");
    if (!stageUpdated) return;
    const success = await persistStep(MAX_STEP, true);
    if (success) {
      onComplete();
    }
  };

  const handleFinish = async () => {
    const stageUpdated = await updateStage("unlocked");
    if (!stageUpdated) return;
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

  // Step 0: Welcome screen
  if (step === 0) {
    return (
      <WelcomeScreen
        onStart={() => goToStep(1)}
        saving={saving}
      />
    );
  }

  // Step 1: ZoG Intro (new immersive screen)
  if (step === 1) {
    return (
      <ZoGIntroScreen
        onStart={() => goToStep(2)}
        onSkip={handleSkip}
        saving={saving}
      />
    );
  }

  // Step 4: QoL Intro (new immersive screen)
  if (step === 4) {
    return (
      <QoLIntroScreen
        onStart={handleStartQol}
        onSkip={handleSkip}
        saving={saving}
      />
    );
  }

  // Step 5: Tour Overview (after QoL returns)
  if (step === 5) {
    return (
      <TourOverviewScreen
        onStartTour={handleFinish}
        onSkipTour={handleFinish}
        saving={saving}
      />
    );
  }

  // Steps 2 and 3: AI choice and ZoG completion (keep card layout for now)
  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-[var(--wabi-pearl)] flex items-center justify-center">
      <div className="min-h-[70vh] px-4 py-16 w-full">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
          {/* Header with skip button */}
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={handleSkip} disabled={saving} className="text-[var(--wabi-text-muted)] hover:text-[var(--wabi-text-secondary)]">
              Skip
            </Button>
          </div>

          {/* Centered content */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--wabi-lavender)] to-[var(--depth-violet)]">
                <CurrentIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-[var(--wabi-text-primary)]">{current.title}</h1>
            <p className="text-[var(--wabi-text-secondary)]">{current.description}</p>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs text-[var(--wabi-text-muted)] mb-2">
              <ProgressIndicator current={step + 1} total={steps.length} className="text-[var(--wabi-text-muted)]" />
              <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
            </div>
            <OnboardingProgress
              current={step + 1}
              total={steps.length}
              className="mb-0 max-w-full"
              labelClassName="sr-only"
              trackClassName="bg-[var(--wabi-pearl)]"
              barClassName="from-[var(--depth-violet)] to-[var(--depth-cornflower)]"
            />
          </div>

          {step === 1 && (
            <div className="mt-8 space-y-4">
              <Button className="w-full" size="lg" onClick={() => goToStep(2)} disabled={saving}>
                Find mine
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="mt-8 space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                size="lg"
                onClick={() => handleStartZog("ai")}
                disabled={saving}
              >
                Yes, my AI knows me
              </Button>
              <Button
                className="w-full border-2 border-[var(--depth-violet)] text-[var(--depth-violet)] hover:bg-[var(--wabi-lavender)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                variant="outline"
                size="lg"
                onClick={() => handleStartZog("manual")}
                disabled={saving}
              >
                No, I'll do the assessment
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
    </div>
  );
};

export default OnboardingFlow;

