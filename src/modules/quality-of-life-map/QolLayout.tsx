import { Outlet, useLocation } from "react-router-dom";
import { QolAssessmentProvider } from "./QolAssessmentContext";
import OnboardingProgress from "@/components/OnboardingProgress";
import GameShellV2 from "@/components/game/GameShellV2";

/**
 * Day 63 (Sasha 2026-05-06): Shell unification. Previously the QoL
 * pages each wrapped their own `<GameShellV2>` (Results, Priorities,
 * GrowthRecipe) while Assessment used a standalone `<Navigation />`
 * top-bar — three different shell treatments inside one module. The
 * `OnboardingProgress` lived OUTSIDE all of them in this layout, so
 * the progress indicator visually orphaned above the GameShell.
 *
 * Now: QolLayout owns the shell. All four QoL pages render their
 * content directly; the GameShellV2 + OnboardingProgress wrap them
 * once at the layout level. The per-page wrappers were removed in
 * this same Day 63 commit — search for "Day 63 (Sasha 2026-05-06):
 * shell removed" in Results/Priorities/GrowthRecipe/Assessment.
 *
 * Embedded mode (TransformationQolAssessment, TransformationQolResults
 * at /game/learn/qol-*) is unaffected — those routes never mount
 * QolLayout; they wrap the page in their own GameShellV2 directly.
 */
const QolLayout = () => {
  const location = useLocation();
  const steps = ["assessment", "results", "priorities", "growth-recipe"];
  const activeIndex = steps.findIndex((step) => location.pathname.includes(step));
  const currentStep = activeIndex >= 0 ? activeIndex + 1 : 1;

  return (
    <QolAssessmentProvider>
      <GameShellV2>
        <div className="px-4 pt-6">
          <OnboardingProgress current={currentStep} total={steps.length} />
        </div>
        <Outlet />
      </GameShellV2>
    </QolAssessmentProvider>
  );
};

export default QolLayout;
