import { useEffect } from "react";
import GameShellV2 from "@/components/game/GameShellV2";
import AcademyPath from "@/components/game/AcademyPath";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { carryGuestProgress } from "@/lib/guestModule";

/**
 * TransformationSpace — LEARN space landing (/game/learn), the Academy.
 *
 * Sasha, 2026-10-30: the Academy shows only the two courses we have, as one path a player may
 * start from either end (AcademyPath), and the courses that open after them. The earlier
 * landing below (the guest module, then the Library rooms) is kept in the code and its routes
 * still work; it is just no longer what /game/learn shows. `?rooms=1` now lands on the path.
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

    // After sign-in, a guest's Academy rating and choice still move into the account.
    useEffect(() => {
        if (userId) carryGuestProgress(userId).catch(() => undefined);
    }, [userId]);

    return (
        <GameShellV2>
            <ErrorBoundary>
                <AcademyPath />
            </ErrorBoundary>
        </GameShellV2>
    );
};

export default TransformationSpace;
