import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GrowSpaceContent } from "@/pages/Library";

/**
 * TransformationSpace — LEARN space main page.
 * Shows the 6-step Growth Sequence as the "next move" view.
 */
const TransformationSpace = () => (
    <GameShellV2>
        <ErrorBoundary>
            <GrowSpaceContent />
        </ErrorBoundary>
    </GameShellV2>
);

export default TransformationSpace;
