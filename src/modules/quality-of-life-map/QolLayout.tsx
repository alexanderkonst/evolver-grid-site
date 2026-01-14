import { Outlet, useLocation } from "react-router-dom";
import { QolAssessmentProvider } from "./QolAssessmentContext";
import OnboardingProgress from "@/components/OnboardingProgress";

const QolLayout = () => {
  const location = useLocation();
  const steps = ["assessment", "results", "priorities", "growth-recipe"];
  const activeIndex = steps.findIndex((step) => location.pathname.includes(step));
  const currentStep = activeIndex >= 0 ? activeIndex + 1 : 1;

  return (
    <QolAssessmentProvider>
      <div className="px-4 pt-6">
        <OnboardingProgress current={currentStep} total={steps.length} />
      </div>
      <Outlet />
    </QolAssessmentProvider>
  );
};

export default QolLayout;
