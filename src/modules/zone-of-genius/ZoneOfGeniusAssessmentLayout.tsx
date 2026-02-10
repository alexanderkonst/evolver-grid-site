import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ZoneOfGeniusProvider } from "./ZoneOfGeniusContext";
import { cn } from "@/lib/utils";
import { getZogAssessmentBasePath, getZogAssessmentSteps } from "./zogRoutes";
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
  const progress = (activeStep / steps.length) * 100;

  const stepIndicator = (
    <div className="text-center mb-8">
      {/* Aurora header */}
      <h1 className="text-2xl sm:text-3xl font-semibold font-display aurora-text mb-3">
        Discover Your Zone of Genius
      </h1>
      <p className="text-[var(--wabi-text-secondary)] text-sm mb-6">
        Step {activeStep} of {steps.length}
      </p>

      {/* Premium progress bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="h-1.5 bg-[var(--wabi-pearl)] rounded-full overflow-hidden border border-white/40">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8460ea, #29549f)',
            }}
          />
        </div>
      </div>

      {/* Step pills — minimal, wabi-sabi */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs transition-all",
                activeStep >= step.number
                  ? "bg-[#8460ea]/10 text-[#8460ea] font-medium"
                  : "bg-white/60 text-[var(--wabi-text-muted)]"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all",
                  activeStep > step.number
                    ? "bg-[#8460ea] text-white"
                    : activeStep === step.number
                      ? "bg-[#8460ea]/20 text-[#8460ea] ring-1 ring-[#8460ea]/30"
                      : "bg-white/80 text-[var(--wabi-text-muted)]"
                )}
              >
                {activeStep > step.number ? "✓" : step.number}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "w-4 sm:w-6 h-px transition-all",
                  activeStep > step.number ? "bg-[#8460ea]/40" : "bg-[var(--wabi-lavender)]/20"
                )}
              />
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
      <div className="min-h-dvh flex flex-col bg-gradient-to-b from-white via-[var(--wabi-pearl)] to-white">
        <Navigation />

        <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            {/* Back link */}
            <div className="mb-6">
              <BackButton
                to="/zone-of-genius"
                label="Back to Zone of Genius"
                className="text-[var(--wabi-text-muted)] hover:text-[#8460ea] transition-colors text-sm"
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
