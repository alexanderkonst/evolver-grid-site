import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
// Day 63 (Sasha 2026-05-06): Navigation import removed — shell now
// owned by QolLayout (provides GameShellV2 chrome). The standalone
// wrap-in-Navigation pattern from earlier brand era is retired.
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { useQolAssessment } from "@/modules/quality-of-life-map/QolAssessmentContext";
import { DOMAINS } from "@/modules/quality-of-life-map/qolConfig";
import { cn } from "@/lib/utils";
import { buildQolResultsPath } from "@/lib/onboardingRouting";
import ProgressIndicator from "@/components/ProgressIndicator";

interface QualityOfLifeMapAssessmentProps {
  renderMode?: "standalone" | "embedded";
}

const QualityOfLifeMapAssessment = ({
  renderMode = "standalone",
}: QualityOfLifeMapAssessmentProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("return");
  const { answers, setAnswer } = useQolAssessment();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Day 63 (Sasha 2026-05-06): scroll-to-top on every domain step,
  // not just on initial mount. Without this, clicking Previous keeps
  // the page scrolled to wherever the user landed last (the auto-
  // advance handler already does its own smooth-scroll on forward
  // motion, but Previous didn't). Skip during the intro screen.
  useEffect(() => {
    if (showIntro) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex, showIntro]);

  const domain = DOMAINS[currentIndex];
  const isLastDomain = currentIndex === DOMAINS.length - 1;
  const hasAnswer = answers[domain.id] !== null;
  const selectedStageId = answers[domain.id];

  const handleStageSelect = (stageId: number) => {
    setAnswer(domain.id, stageId);
    // Auto-advance after brief visual feedback (unless it's the last domain)
    if (!isLastDomain) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 400);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setShowIntro(true);
    }
  };

  const handleNext = () => {
    if (isLastDomain) {
      if (renderMode === "embedded") {
        // Day 63 (Sasha 2026-05-06): /game/transformation/* was retired
        // in favor of /game/learn/* (App.tsx:489-490 redirects). The
        // old path bounced embedded-mode users to the Library instead
        // of the Results page when they finished the assessment.
        navigate("/game/learn/qol-results");
      } else {
        navigate(buildQolResultsPath(returnTo));
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // UX Playbook: Start Screen
  const introScreen = (
    <section
      className="py-24 px-6 min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-white to-[var(--wabi-pearl)]"
    >
      <div className="text-center max-w-2xl mx-auto space-y-8">
        {/* Dodecahedron Icon */}
        <div className="flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--wabi-aqua)] to-[var(--depth-violet)] flex items-center justify-center shadow-lg">
            <img
              src="/dodecahedron.png"
              alt="Quality of Life"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>
        <p className="text-sm uppercase tracking-wide text-[var(--depth-violet)]">
          Quality of Life Map
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--wabi-text-primary)]">
          Rate 8 life areas
        </h1>
        <p className="text-lg text-[var(--wabi-text-secondary)]">
          See where you're thriving and where to grow.
        </p>
        <Button
          size="lg"
          onClick={() => setShowIntro(false)}
          className="w-full max-w-sm h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Map My Life
        </Button>
      </div>
    </section>
  );

  const content = (
    <section
      className="py-24 px-6 min-h-dvh bg-gradient-to-b from-white to-[var(--wabi-pearl)]"
    >
      <div className="container mx-auto max-w-4xl">
        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <ProgressIndicator
            current={currentIndex + 1}
            total={DOMAINS.length}
            className="text-[var(--wabi-text-muted)]"
          />
          <div className="flex gap-2 justify-center">
            {DOMAINS.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === currentIndex ? "w-8" : "w-2",
                  idx < currentIndex
                    ? "bg-[var(--depth-violet)]"
                    : idx === currentIndex
                      ? "bg-[var(--depth-violet)]/60"
                      : "bg-[var(--wabi-text-muted)]/20"
                )}
              />
            ))}
          </div>
        </div>

        {/* Domain Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-[var(--wabi-text-primary)]">
            <BoldText>{domain.name.toUpperCase()}</BoldText>
          </h1>
          <p className="text-lg text-[var(--wabi-text-secondary)]">
            Select the stage that best represents your current state in this domain.
          </p>
        </div>

        {/* Stages Grid */}
        {/*
          Day 63 (Sasha 2026-05-06): aria-pressed added to each stage
          button. Stages are mutually exclusive (one selected per
          domain), but we use aria-pressed (toggle button) rather than
          role="radio" because the latter requires full WAI-ARIA
          radiogroup keyboard semantics (arrow-key navigation, single
          tab stop) that this list doesn't yet implement. aria-pressed
          gives screen readers a clear "selected"/"not selected" hint
          without the obligation to deliver radio-group keyboard
          contract — lower risk than partial radio implementation.
        */}
        <div className="grid gap-4 mb-12" aria-label={`${domain.name} stages`}>
          {domain.stages.map((stage) => {
            const isSelected = selectedStageId === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStageSelect(stage.id)}
                aria-pressed={isSelected}
                className={cn(
                  "relative p-6 rounded-2xl text-left transition-all duration-200",
                  "border-2 hover:scale-[1.02]",
                  isSelected
                    ? "border-[var(--depth-violet)] bg-[var(--depth-violet)]/10"
                    : "border-[var(--wabi-text-muted)]/20 bg-white/60 hover:border-[var(--depth-violet)]/40"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Stage Number */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                      isSelected
                        ? "bg-[var(--depth-violet)] text-white"
                        : "bg-[var(--wabi-text-muted)]/10 text-[var(--wabi-text-muted)]"
                    )}
                  >
                    {isSelected ? <Check className="w-6 h-6" /> : stage.id}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--wabi-text-primary)] mb-2">
                      <BoldText>{stage.title}</BoldText>
                    </h3>
                    <p className="text-[var(--wabi-text-secondary)] leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons - Desktop */}
        <div className="hidden sm:flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={cn(
              "text-[var(--wabi-text-secondary)] border-[var(--wabi-text-muted)]/20",
              currentIndex === 0 && "opacity-0 pointer-events-none"
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {/* Only show explicit button on last domain */}
          {isLastDomain && (
            <Button
              onClick={handleNext}
              disabled={!hasAnswer}
              size="lg"
              className={cn(
                "text-lg px-8 bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] text-white",
                !hasAnswer && "opacity-50"
              )}
            >
              See Results
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Mobile Bottom Bar */}
        {/*
          Day 63 (Sasha 2026-05-06): paddingBottom uses safe-area-inset
          so the bar doesn't sit under the iPhone home indicator /
          notch. max(16px, env(...)) ensures non-iOS browsers still get
          the original 16px padding when env() resolves to 0.
        */}
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[var(--wabi-text-muted)]/10 px-4 pt-4 shadow-lg z-above"
          style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
        >
          <div className="flex items-center justify-between gap-3">
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="text-xs px-4 py-2 rounded-full border border-[var(--wabi-text-muted)]/20 text-[var(--wabi-text-secondary)] hover:bg-[var(--depth-violet)]/5 transition-colors"
              >
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Back
              </button>
            )}
            <div className="text-xs text-[var(--wabi-text-muted)] flex-1 text-center">
              {currentIndex + 1} of {DOMAINS.length}
            </div>
            {/* Only show explicit button on last domain */}
            {isLastDomain && (
              <button
                onClick={handleNext}
                disabled={!hasAnswer}
                className={cn(
                  "px-6 py-2 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] transition-all",
                  !hasAnswer && "opacity-50"
                )}
              >
                See Results
              </button>
            )}
          </div>
        </div>

        {/* Spacer for mobile bottom bar */}
        <div className="sm:hidden h-32" />
      </div>
    </section>
  );

  if (renderMode === "embedded") {
    return <div className="py-8">{showIntro ? introScreen : content}</div>;
  }

  // Day 63 (Sasha 2026-05-06): standalone wrappers removed. Previously
  // this page wrapped itself in `<div className="min-h-dvh"><Navigation
  // />...</div>` — its own top-bar shell that conflicted with the rest
  // of the QoL flow (Results/Priorities/GrowthRecipe used GameShellV2).
  // Now QolLayout owns GameShellV2 for all four pages; Assessment just
  // returns its content (intro or domain steps) directly. The pt-24
  // padding (which compensated for the now-retired fixed Navigation
  // height) was removed; the back button sits inside the new shell's
  // own top spacing.
  if (showIntro) {
    return introScreen;
  }

  return (
    <>
      {/* Back Button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-2">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => currentIndex === 0 ? setShowIntro(true) : handlePrevious()}
            className="inline-flex items-center text-[var(--wabi-text-muted)] hover:text-[var(--wabi-text-secondary)] transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </button>
        </div>
      </div>

      {/* Assessment Content */}
      {content}
    </>
  );
};

export default QualityOfLifeMapAssessment;
