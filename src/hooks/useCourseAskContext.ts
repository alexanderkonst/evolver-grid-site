import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import type { CourseAskContext } from "@/lib/courseAskAi";

/**
 * What the platform knows about the signed-in person, for a course's Ask AI cards.
 * READ-ONLY, never creates a row, and a guest gets `{}` (every token falls back to «ask me»).
 *  - birthday: equilibrium_state.birthday, else the same local copy Equilibrium keeps
 *  - location, mission: game_profiles.location, game_profiles.mission_statement
 * Any read that fails is simply left out: the card still works with the fallbacks.
 */
export function useCourseAskContext(): CourseAskContext {
    const userId = useSessionUserId();
    const [ctx, setCtx] = useState<CourseAskContext>({});

    useEffect(() => {
        if (!userId) {
            setCtx({});
            return;
        }
        let live = true;
        (async () => {
            const [game, eq] = await Promise.all([
                supabase
                    .from("game_profiles")
                    .select("location, mission_statement")
                    .eq("user_id", userId)
                    .maybeSingle()
                    .then((r) => r.data, () => null),
                supabase
                    .from("equilibrium_state")
                    .select("birthday")
                    .eq("user_id", userId)
                    .maybeSingle()
                    .then((r) => r.data, () => null),
            ]);
            let birthday = eq?.birthday ?? null;
            if (!birthday) {
                try {
                    birthday = window.localStorage.getItem(`equilibrium_v2_birthday:${userId}`);
                } catch {
                    birthday = null;
                }
            }
            if (live) setCtx({ birthday, location: game?.location ?? null, mission: game?.mission_statement ?? null });
        })();
        return () => {
            live = false;
        };
    }, [userId]);

    return ctx;
}
