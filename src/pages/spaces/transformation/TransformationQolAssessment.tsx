import GameShellV2 from "@/components/game/GameShellV2";
import QualityOfLifeMapAssessment from "@/pages/QualityOfLifeMapAssessment";
import { QolAssessmentProvider } from "@/modules/quality-of-life-map/QolAssessmentContext";

/**
 * Day 64 (Sasha 2026-05-07): added missing QolAssessmentProvider wrapper.
 * Same fix as TransformationQolResults.tsx — the embedded route
 * (/game/learn/qol-assessment) was bypassing QolLayout and therefore
 * the provider, causing runtime crashes when the page tried to call
 * useQolAssessment().
 */
const TransformationQolAssessment = () => {
  return (
    <GameShellV2>
      <QolAssessmentProvider>
        <QualityOfLifeMapAssessment renderMode="embedded" />
      </QolAssessmentProvider>
    </GameShellV2>
  );
};

export default TransformationQolAssessment;
