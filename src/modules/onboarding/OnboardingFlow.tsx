import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Compass, CheckCircle2, Map, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ProgressIndicator from "@/components/ProgressIndicator";
import OnboardingProgress from "@/components/OnboardingProgress";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import ZoGIntroScreen from "@/components/onboarding/ZoGIntroScreen";
import TourOverviewScreen from "@/components/onboarding/TourOverviewScreen";
import TourStepsScreen from "@/components/onboarding/TourStepsScreen";
import TourCompleteScreen from "@/components/onboarding/TourCompleteScreen";

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
    // After ZoG complete, go directly to Tour
    if (hasZog) return 3; // Tour Overview
    return Math.min(initialStep ?? 0, MAX_STEP);
  }, [hasZog, initialStep]);

  const [step, setStep] = useState(startingStep);
  const [saving, setSaving] = useState(false);

  // Simplified flow (no QoL in onboarding):
  // 0: Welcome
  // 1: ZoG Intro
  // 2: AI Choice (navigates to ZoG Entry/Assessment)
  // 3: Tour Overview (returns here after ZoG)
  // 4: Tour Steps
  // 5: Tour Complete
  const steps = useMemo(
    () => [
      {
        title: "Discover who you really are.",
        description: "5 minutes to transform your life.",
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
        title: "Your 5 spaces",
        description: "Quick tour of the platform.",
        icon: Map,
      },
      {
        title: "Explore your spaces",
        description: "Each space has a purpose.",
        icon: Compass,
      },
      {
        title: "Welcome home.",
        description: "Your journey begins now.",
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
    // After ZoG, user returns to step 3 (Tour Overview)
    const success = await persistStep(3);
    if (!success) return;
    setStep(3);
    if (path === "ai") {
      navigate("/zone-of-genius/entry?return=/start");
    } else {
      navigate("/zone-of-genius/assessment?return=/start");
    }
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
        onBack={() => goToStep(0)}
        onSkip={handleSkip}
        saving={saving}
      />
    );
  }

  // Step 3: Tour Overview (after returning from ZoG)
  if (step === 3) {
    return (
      <TourOverviewScreen
        onStartTour={() => goToStep(4)}
        onSkipTour={handleFinish}
        saving={saving}
      />
    );
  }

  // Step 4: Tour Steps (5-space walkthrough)
  if (step === 4) {
    return (
      <TourStepsScreen
        onComplete={() => goToStep(5)}
        onBack={() => goToStep(3)}
        onSkip={handleFinish}
      />
    );
  }

  // Step 5: Tour Complete (final celebration)
  if (step === 5) {
    return (
      <TourCompleteScreen
        hasZog={hasZog}
        hasQol={hasQol}
        onFinish={handleFinish}
        saving={saving}
      />
    );
  }

  // Step 2: AI choice (card layout)
  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-[var(--wabi-pearl)] flex items-center justify-center">
      <div className="min-h-[70vh] px-4 py-16 w-full">
        <div className="mx-auto max-w-2xl rounded-3xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-8 shadow-[0_4px_16px_rgba(44,49,80,0.06)] sm:p-10">
          {/* Header with back and skip buttons */}
          <div className="flex justify-between items-center mb-4">
            <button
              className="flex items-center gap-1 text-sm text-[var(--wabi-text-muted)] hover:text-[var(--wabi-text-secondary)] transition-colors"
              onClick={() => goToStep(1)}
              disabled={saving}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
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

          {/* AI Choice buttons */}
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
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;

