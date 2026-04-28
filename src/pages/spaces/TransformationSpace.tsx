import GameShellV2 from "@/components/game/GameShellV2";
import ErrorBoundary from "@/components/ErrorBoundary";
import { LearnSpaceContent } from "@/pages/Library";

/**
 * TransformationSpace — LEARN space landing (/game/learn).
 *
 * Day 56 (Sasha 2026-04-28): renders the Library index grid (the 6 Growth
 * Sequence steps as picker cards). Each step's content lives at
 * /game/learn/library/:stepId and is selected from pane 2.
 */
const TransformationSpace = () => (
    <GameShellV2>
        <ErrorBoundary>
            <LearnSpaceContent pathBase="/game/learn/library" />
        </ErrorBoundary>
    </GameShellV2>
);

export default TransformationSpace;
