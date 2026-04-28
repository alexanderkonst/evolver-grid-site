import GameShellV2 from "@/components/game/GameShellV2";
import { LearnSpaceContent } from "@/pages/Library";

/**
 * PracticeLibrary — Authed Library inside the LEARN space.
 * Routes: /game/learn/library and /game/learn/library/:stepId.
 *
 * Day 56 (Sasha 2026-04-28): Library is now driven by pane 2 navigation.
 * `LearnSpaceContent` reads `:stepId` from the URL and renders only that
 * step's content in pane 3. Without a stepId, it falls back to the index
 * grid.
 */
const PracticeLibrary = () => (
    <GameShellV2>
        <LearnSpaceContent pathBase="/game/learn/library" />
    </GameShellV2>
);

export default PracticeLibrary;
