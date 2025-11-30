import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ZoneOfGeniusProvider } from "./ZoneOfGeniusContext";
import { cn } from "@/lib/utils";

const ZoneOfGeniusAssessmentLayout = () => {
  const location = useLocation();
  
  const steps = [
    { number: 1, label: "Quick Scan – Swipe Talents", path: "/zone-of-genius/assessment/step-0" },
    { number: 2, label: "Choose Your Top 10 Talents", path: "/zone-of-genius/assessment/step-1" },
    { number: 3, label: "Choose Your Top 3 Core Talents", path: "/zone-of-genius/assessment/step-2" },
    { number: 4, label: "Order Your Top 3", path: "/zone-of-genius/assessment/step-3" },
    { number: 5, label: "Your Zone of Genius Snapshot", path: "/zone-of-genius/assessment/step-4" },
  ];

  const currentStepIndex = steps.findIndex(step => location.pathname.includes(step.path));
  const activeStep = currentStepIndex >= 0 ? currentStepIndex + 1 : 1;

  return (
    <ZoneOfGeniusProvider>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            
            {/* Title Banner */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
                Discover Your Zone of Genius Now:
              </h1>
              
              {/* Step Indicator */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
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
