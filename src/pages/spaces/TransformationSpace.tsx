import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import AcademyModule from "@/components/game/AcademyModule";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { carryGuestProgress } from "@/lib/guestModule";
import { LearnSpaceContent } from "@/pages/Library";

/**
 * TransformationSpace — LEARN space landing (/game/learn), the Academy.
 *
 * Open to a guest (issue #186): the first thing a newcomer meets is one module to play,
 * start to finish (AcademyModule), with the account asked for only at «Save». A player who
 * has played it, or who asks for `?rooms=1`, sees the rooms.
 *
 * Day 56 (Sasha 2026-04-28): the rooms are the Library index grid (the 6 Growth
 * Sequence steps as picker cards). Each step's content lives at
 * /game/learn/library/:stepId and is selected from pane 2. A guest's rooms link to the
 * public /library/:stepId instead, so no room sends a stranger to /auth.
 */
const TransformationSpace = () => {
    const userId = useSessionUserId();
    const [params] = useSearchParams();
    const [roomsOpen, setRoomsOpen] = useState(false);
    const showRooms = roomsOpen || params.has("rooms");
    const guest = userId === null;

    // After sign-in the guest's rating and choice move into the account, before the module
    // reads the account's rating (otherwise it would offer the lesson again).
    const [carriedFor, setCarriedFor] = useState<string | null>(null);
    useEffect(() => {
        if (!userId) return;
        let live = true;
        carryGuestProgress(userId)
            .catch(() => undefined)
            .finally(() => {
                if (live) setCarriedFor(userId);
            });
        return () => {
            live = false;
        };
    }, [userId]);
    const ready = userId === null || (!!userId && carriedFor === userId);

    return (
        <GameShellV2>
            <ErrorBoundary>
                {!ready ? null : showRooms ? (
                    <LearnSpaceContent pathBase={guest ? "/library" : "/game/learn/library"} />
                ) : (
                    <AcademyModule guest={guest} onDone={() => setRoomsOpen(true)} />
                )}
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default TransformationSpace;
