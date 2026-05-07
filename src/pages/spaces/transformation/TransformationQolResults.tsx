import GameShellV2 from "@/components/game/GameShellV2";
import QualityOfLifeMapResults from "@/pages/QualityOfLifeMapResults";
import { QolAssessmentProvider } from "@/modules/quality-of-life-map/QolAssessmentContext";

/**
 * Day 64 (Sasha 2026-05-07): added missing QolAssessmentProvider wrapper.
 * Pre-existing bug: this component mounted QualityOfLifeMapResults
 * directly, which calls useQolAssessment() — that hook throws
 * "must be used within a QolAssessmentProvider" if the context is
 * missing. The standalone /quality-of-life-map/* path gets the
 * provider via QolLayout, but /game/learn/qol-results was missing it.
 * Anyone navigating to this route saw a runtime crash. Fixed by
 * wrapping in the provider here.
 */
const TransformationQolResults = () => {
  return (
    <GameShellV2>
      <QolAssessmentProvider>
        <QualityOfLifeMapResults renderMode="embedded" />
      </QolAssessmentProvider>
    </GameShellV2>
  );
};

export default TransformationQolResults;
