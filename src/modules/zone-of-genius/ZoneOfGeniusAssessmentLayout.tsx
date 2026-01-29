import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ZoneOfGeniusProvider } from "./ZoneOfGeniusContext";
import { cn } from "@/lib/utils";
import BoldText from "@/components/BoldText";
import { getZogAssessmentBasePath, getZogAssessmentSteps } from "./zogRoutes";
import ProgressIndicator from "@/components/ProgressIndicator";
import OnboardingProgress from "@/components/OnboardingProgress";
import BackButton from "@/components/BackButton";

interface ZoneOfGeniusAssessmentLayoutProps {
  renderMode?: "standalone" | "embedded";
}

const ZoneOfGeniusAssessmentLayout = ({
  renderMode = "standalone",
}: ZoneOfGeniusAssessmentLayoutProps) => {
  const location = useLocation();
  const basePath = getZogAssessmentBasePath(location.pathname);
  const steps = getZogAssessmentSteps(basePath);

  const currentStepIndex = steps.findIndex(step => location.pathname.includes(step.path));
  const activeStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  const stepIndicator = (
    <div className="text-center mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
        Discover Your Zone of Genius Now:
      </h1>
      <ProgressIndicator current={activeStep} total={steps.length} className="text-[#2c3150]/60" />
      <OnboardingProgress
        current={activeStep}
        total={steps.length}
        className="mt-4 mb-0 max-w-lg"
      />

      {/* Step Indicator */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            <div className={cn(
              "flex items-center gap-2 transition-all",
              activeStep >= step.number ? "text-primary font-semibold" : "text-muted-foreground"
            )}>
              <div className={cn(
                "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-all",
                activeStep >= step.number
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background"
              )}>
                {step.number}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">Step {step.number}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "hidden sm:block w-8 h-0.5 transition-all",
                activeStep > step.number ? "bg-primary" : "bg-border"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  if (renderMode === "embedded") {
    return (
      <ZoneOfGeniusProvider>
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            {stepIndicator}
            <Outlet />
          </div>
        </div>
      </ZoneOfGeniusProvider>
    );
  }

  return (
    <ZoneOfGeniusProvider>
      <div className="min-h-dvh flex flex-col">
        <Navigation />

        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            {/* Back/Exit Link */}
            <div className="mb-6">
              <BackButton
                to="/zone-of-genius"
                label={<BoldText>EXIT TO OVERVIEW</BoldText>}
                className="text-muted-foreground hover:text-foreground transition-colors font-semibold"
              />
            </div>

            {stepIndicator}

            {/* Step Content */}
            <Outlet />
          </div>
        </main>

        <Footer />
      </div>
    </ZoneOfGeniusProvider>
  );
};

export default ZoneOfGeniusAssessmentLayout;
