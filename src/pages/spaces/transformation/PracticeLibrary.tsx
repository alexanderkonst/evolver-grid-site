import GameShellV2 from "@/components/game/GameShellV2";
import { GrowSpaceContent } from "@/pages/Library";

/**
 * PracticeLibrary — Grow Space inside the GameShell (/game/learn/library).
 * Uses the same GrowSpaceContent as /library but wrapped in GameShellV2.
 */
const PracticeLibrary = () => (
    <GameShellV2>
        <GrowSpaceContent />
    </GameShellV2>
);

export default PracticeLibrary;
