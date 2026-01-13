import { Outlet, useLocation } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import { ZoneOfGeniusProvider } from "@/modules/zone-of-genius/ZoneOfGeniusContext";
import { cn } from "@/lib/utils";
import { getZogAssessmentBasePath, getZogAssessmentSteps } from "@/modules/zone-of-genius/zogRoutes";

const TransformationGeniusAssessment = () => {
  const location = useLocation();
  const basePath = getZogAssessmentBasePath(location.pathname);
  const steps = getZogAssessmentSteps(basePath);

  const currentStepIndex = steps.findIndex((step) => location.pathname.includes(step.path));
  const activeStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  return (
    <GameShellV2>
      <ZoneOfGeniusProvider>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
                Discover Your Zone of Genius Now:
              </h1>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
                {steps.map((step, idx) => (
                  <div key={step.number} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex items-center gap-2 transition-all",
                        activeStep >= step.number ? "text-primary font-semibold" : "text-muted-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all",
                          activeStep >= step.number
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background"
                        )}
                      >
                        {step.number}
                      </div>
                      <span className="hidden sm:inline">{step.label}</span>
                      <span className="sm:hidden">Step {step.number}</span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={cn(
                          "hidden sm:block w-8 h-0.5 transition-all",
                          activeStep > step.number ? "bg-primary" : "bg-border"
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Outlet />
          </div>
        </div>
      </ZoneOfGeniusProvider>
    </GameShellV2>
  );
};

export default TransformationGeniusAssessment;
