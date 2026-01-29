import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
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

  const domain = DOMAINS[currentIndex];
  const isLastDomain = currentIndex === DOMAINS.length - 1;
  const hasAnswer = answers[domain.id] !== null;
  const selectedStageId = answers[domain.id];

  const handleStageSelect = (stageId: number) => {
    setAnswer(domain.id, stageId);
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
        navigate("/game/transformation/qol-results");
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
        <div className="grid gap-4 mb-12">
          {domain.stages.map((stage) => {
            const isSelected = selectedStageId === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => handleStageSelect(stage.id)}
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

          <Button
            onClick={handleNext}
            disabled={!hasAnswer}
            size="lg"
            className={cn(
              "text-lg px-8 bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] text-white",
              !hasAnswer && "opacity-50"
            )}
          >
            {isLastDomain ? "See Results" : "Next"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[var(--wabi-text-muted)]/10 p-4 shadow-lg z-above">
          <div className="flex items-center justify-between gap-3 mb-3">
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="text-xs px-4 py-2 rounded-full border border-[var(--wabi-text-muted)]/20 text-[var(--wabi-text-secondary)] hover:bg-[var(--depth-violet)]/5 transition-colors"
              >
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Previous
              </button>
            )}
            <div className="text-xs text-[var(--wabi-text-muted)] flex-1 text-center">
              Domain {currentIndex + 1}/{DOMAINS.length}
            </div>
          </div>
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className={cn(
              "w-full py-3 rounded-xl font-bold transition-all text-sm text-white bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)]",
              !hasAnswer && "opacity-50"
            )}
          >
            {isLastDomain ? "See Results" : "Next Domain"}
            <ArrowRight className="inline ml-2 h-4 w-4" />
          </button>
        </div>

        {/* Spacer for mobile bottom bar */}
        <div className="sm:hidden h-32" />
      </div>
    </section>
  );

  if (renderMode === "embedded") {
    return <div className="py-8">{showIntro ? introScreen : content}</div>;
  }

  // Show intro screen first (no nav bar for cleaner entry experience)
  if (showIntro) {
    return (
      <div className="min-h-dvh">
        <Navigation />
        {introScreen}
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <Navigation />

      {/* Back Button */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-transparent">
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
    </div>
  );
};

export default QualityOfLifeMapAssessment;
