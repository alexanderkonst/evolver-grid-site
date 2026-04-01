import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ZoneOfGeniusProvider } from "./ZoneOfGeniusContext";
import { cn } from "@/lib/utils";
import { getZogAssessmentBasePath, getZogAssessmentSteps } from "./zogRoutes";
import geniusLogo from "@/assets/ignite-logo.png";

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
      {/* Logo */}
      <img
        src={geniusLogo}
        alt="Evolver"
        className="w-[48px] h-auto mx-auto opacity-70 mb-4"
      />

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-semibold text-white/90 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
        Discover Your Zone of Genius
      </h1>
      <p className="text-white/40 text-sm mb-6">
        Step {activeStep} of {steps.length}
      </p>

      {/* Progress bar — liquid glass */}
      <div className="max-w-md mx-auto mb-6">
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            }}
          />
        </div>
      </div>

      {/* Step pills — glass */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs transition-all",
                activeStep >= step.number
                  ? "bg-white/15 text-white font-medium"
                  : "bg-white/5 text-white/30"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all",
                  activeStep > step.number
                    ? "bg-white/30 text-white"
                    : activeStep === step.number
                      ? "bg-white/20 text-white ring-1 ring-white/30"
                      : "bg-white/5 text-white/30"
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
                  activeStep > step.number ? "bg-white/30" : "bg-white/10"
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
      <div className="min-h-dvh flex flex-col bg-black text-white overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* Dark gradient background */}
        <div className="fixed inset-0 z-0" style={{
          background: 'linear-gradient(180deg, #0a0a1a 0%, #0f1528 40%, #0a0a1a 100%)',
        }} />

        {/* Subtle ambient glow */}
        <div className="fixed inset-0 z-0 opacity-30" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(132,96,234,0.15) 0%, transparent 60%)',
        }} />

        <main className="relative z-10 flex-1 pt-16 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            {stepIndicator}

            {/* Step Content */}
            <Outlet />
          </div>
        </main>
      </div>
    </ZoneOfGeniusProvider>
  );
};

export default ZoneOfGeniusAssessmentLayout;
