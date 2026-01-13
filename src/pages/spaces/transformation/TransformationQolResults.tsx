import GameShellV2 from "@/components/game/GameShellV2";
import QualityOfLifeMapResults from "@/pages/QualityOfLifeMapResults";

const TransformationQolResults = () => {
  return (
    <GameShellV2>
      <QualityOfLifeMapResults renderMode="embedded" />
    </GameShellV2>
  );
};

export default TransformationQolResults;
