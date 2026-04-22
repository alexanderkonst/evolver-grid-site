import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ZoneOfGeniusProvider } from "./ZoneOfGeniusContext";
import { cn } from "@/lib/utils";
import { getZogAssessmentBasePath, getZogAssessmentSteps } from "./zogRoutes";
import geniusLogo from "@/assets/ignite-logo.png";
import GameShellV2 from "@/components/game/GameShellV2";

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
      {/* Logo — Day 47 very-late pass (Sasha): 2.5× larger (48px → 120px).
          The star mark now reads as a real presence, not a tiny ornament. */}
      <img
        src={geniusLogo}
        alt="Genius Business"
        className="w-[120px] h-auto mx-auto opacity-85 mb-5"
      />

      {/* Title — dark navy on light Panel 3 */}
      <h1
        className="text-2xl sm:text-3xl font-semibold mb-3"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "var(--skin-text-primary, #0a1628)",
          textShadow: "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
        }}
      >
        Discover Your Top Talent
      </h1>
      {/* Day 47 very-late pass: darker body/muted text for legibility
          (was 0.55 → 0.7). */}
      <p
        className="text-sm mb-6"
        style={{
          color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
          textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
        }}
      >
        Step {activeStep} of {steps.length}
      </p>

      {/* Progress bar — dark-on-light */}
      <div className="max-w-md mx-auto mb-6">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(26,30,58,0.12)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #5b21b6, #8460ea)",
            }}
          />
        </div>
      </div>

      {/* Step pills — dark text on light Panel 3 */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs transition-all",
              )}
              style={
                activeStep >= step.number
                  ? {
                      backgroundColor: "rgba(26,30,58,0.12)",
                      color: "var(--skin-text-primary, #0a1628)",
                      fontWeight: 500,
                    }
                  : {
                      backgroundColor: "rgba(26,30,58,0.04)",
                      color: "var(--skin-text-hint, rgba(26,30,58,0.45))",
                    }
              }
            >
              <div
                className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all",
                )}
                style={
                  activeStep > step.number
                    ? { backgroundColor: "#5b21b6", color: "#ffffff" }
                    : activeStep === step.number
                      ? {
                          backgroundColor: "rgba(91,33,182,0.15)",
                          color: "#5b21b6",
                          boxShadow: "inset 0 0 0 1px rgba(91,33,182,0.4)",
                        }
                      : {
                          backgroundColor: "rgba(26,30,58,0.06)",
                          color: "var(--skin-text-hint, rgba(26,30,58,0.45))",
                        }
                }
              >
                {activeStep > step.number ? "✓" : step.number}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className="w-4 sm:w-6 h-px transition-all"
                style={{
                  backgroundColor:
                    activeStep > step.number
                      ? "rgba(91,33,182,0.4)"
                      : "rgba(26,30,58,0.15)",
                }}
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

  // Day 47 (Sasha): the guided assessment now lives inside the same
  // GameShellV2 that carries /zone-of-genius, /playbook, /path, /my-artifacts.
  // The old standalone dark shell (bg-black + gradient.jpg + /65 overlay) was
  // "the legacy shell" — a visual fork from the rest of the journey. Removed.
  return (
    <ZoneOfGeniusProvider>
      <GameShellV2 hideLogo>
        <div
          className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 pt-16 pb-16"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          <div className="container mx-auto max-w-6xl">
            {stepIndicator}

            {/* Step Content */}
            <Outlet />
          </div>
        </div>
      </GameShellV2>
    </ZoneOfGeniusProvider>
  );
};

export default ZoneOfGeniusAssessmentLayout;
