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

  const content = (
    <section
      className="py-24 px-6 min-h-dvh"
      style={{ backgroundColor: "hsl(220, 30%, 12%)" }}
    >
      <div className="container mx-auto max-w-4xl">
        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <p className="text-sm text-white/60 mb-2">
            Domain {currentIndex + 1} of {DOMAINS.length}
          </p>
          <div className="flex gap-2 justify-center">
            {DOMAINS.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === currentIndex ? "w-8" : "w-2",
                  idx < currentIndex
                    ? "bg-[hsl(var(--destiny-gold))]"
                    : idx === currentIndex
                    ? "bg-[hsl(var(--destiny-gold))]/60"
                    : "bg-white/20"
                )}
              />
            ))}
          </div>
        </div>

        {/* Domain Heading */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-white">
            <BoldText>{domain.name.toUpperCase()}</BoldText>
          </h1>
          <p className="text-lg text-white/70">
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
                  "relative p-6 rounded-lg text-left transition-all duration-200",
                  "border-2 hover:scale-[1.02]",
                  isSelected
                    ? "border-[hsl(var(--destiny-gold))] bg-[hsl(var(--destiny-gold))]/10"
                    : "border-white/20 bg-white/5 hover:border-white/40"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Stage Number */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                      isSelected
                        ? "bg-[hsl(var(--destiny-gold))] text-[hsl(var(--destiny-dark))]"
                        : "bg-white/10 text-white/60"
                    )}
                  >
                    {isSelected ? <Check className="w-6 h-6" /> : stage.id}
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      <BoldText>{stage.title}</BoldText>
                    </h3>
                    <p className="text-white/70 leading-relaxed">
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
              "text-white border-white/20",
              currentIndex === 0 && "opacity-0 pointer-events-none"
            )}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="text-lg px-8"
            style={{
              backgroundColor: hasAnswer ? "hsl(var(--destiny-gold))" : "hsl(var(--destiny-gold))/40",
              color: "hsl(var(--destiny-dark))",
            }}
          >
            {isLastDomain ? "See Results" : "Next"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[hsl(220,30%,12%)] border-t border-white/20 p-4 shadow-lg z-above">
          <div className="flex items-center justify-between gap-3 mb-3">
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="text-xs px-4 py-2 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="inline mr-1 h-3 w-3" />
                Previous
              </button>
            )}
            <div className="text-xs text-white/60 flex-1 text-center">
              Domain {currentIndex + 1}/{DOMAINS.length}
            </div>
          </div>
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className="w-full py-3 rounded-full font-bold transition-all text-sm"
            style={{
              backgroundColor: hasAnswer ? "hsl(var(--destiny-gold))" : "hsl(var(--destiny-gold), 0.4)",
              color: "hsl(var(--destiny-dark))",
              opacity: hasAnswer ? 1 : 0.5,
            }}
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
    return <div className="py-8">{content}</div>;
  }

  return (
    <div className="min-h-dvh">
      <Navigation />
      
      {/* Back Button */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </Link>
        </div>
      </div>

      {/* Assessment Content */}
      {content}
    </div>
  );
};

export default QualityOfLifeMapAssessment;
