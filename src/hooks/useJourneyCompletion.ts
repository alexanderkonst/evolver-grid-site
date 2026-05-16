import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JOURNEY_SEQUENCE, type JourneyItemId } from "@/data/journeySequence";

/**
 * useJourneyCompletion — composite completion-state hook for the JOURNEY pane.
 *
 * Day 67 (Sasha 2026-05-10): replaces the orphan `useJourneyProgression`
 * hook, which assumed a single linear `onboarding_stage` cascade. The new
 * model is per-item predicates (each item declares what "done" means in
 * `journeySequence.ts`) so non-linear items (Map your assets, Assess your
 * quality of life) get honest completion signals instead of stage-cascade
 * approximations.
 *
 * What it does:
 *   1. Reads the current auth user once on mount.
 *   2. Reads the current `game_profiles.id` once on mount (read-only lookup —
 *      does NOT create a profile if missing; we want completion checks to be
 *      side-effect-free).
 *   3. Runs each item's `completionPredicate` (if defined) in PARALLEL with
 *      `Promise.allSettled`. One slow query doesn't block the others.
 *   4. Returns a `{[id]: boolean}` map.
 *
 * Design notes:
 *   - No real-time subscriptions. Wave 1 fires once on mount + on explicit
 *     `recheck()`. If a user completes an item in the same session (e.g.
 *     takes the QoL assessment) and the pane re-mounts on navigation, the
 *     fresh fetch picks it up. If we ever need true real-time (the pane is
 *     persistent and the user completes elsewhere in the same tab), we
 *     swap to a `postgres_changes` subscription — the public API doesn't
 *     change.
 *   - `recheck()` exposed so the pane can force a re-evaluation after a
 *     known event (e.g. navigation back from `/asset-mapping` with a fresh
 *     write). Optional — components can call it or ignore it.
 *   - When the user is anonymous, every completion is `false` and we skip
 *     the Supabase round-trip entirely.
 *
 * Returned shape:
 *   - `completion`: Record<JourneyItemId, boolean>
 *   - `isLoading`: true until the first batch resolves
 *   - `recheck`: () => void — force a fresh fetch
 */

export type CompletionMap = Record<JourneyItemId, boolean>;

const EMPTY_COMPLETION: CompletionMap = JOURNEY_SEQUENCE.reduce(
    (acc, item) => {
        acc[item.id] = false;
        return acc;
    },
    {} as CompletionMap,
);

export function useJourneyCompletion() {
    const [completion, setCompletion] = useState<CompletionMap>(EMPTY_COMPLETION);
    const [isLoading, setIsLoading] = useState(true);
    const [nonce, setNonce] = useState(0);

    const recheck = useCallback(() => {
        setNonce((n) => n + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                // Step 1: get current auth user. Anonymous → bail with all-false.
                const { data: { user } } = await supabase.auth.getUser();
                if (cancelled) return;

                if (!user) {
                    setCompletion(EMPTY_COMPLETION);
                    setIsLoading(false);
                    return;
                }

                // Step 2: lookup the game_profiles row. Read-only — do NOT
                // create one if missing. Some predicates only need user.id
                // (e.g. user_assets), so a missing profile doesn't disqualify
                // every item from completing.
                const { data: profile } = await supabase
                    .from("game_profiles")
                    .select("id")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (cancelled) return;

                const ctx = {
                    supabase,
                    userId: user.id,
                    profileId: profile?.id ?? null,
                };

                // Step 3: run all predicates in parallel.
                const results = await Promise.allSettled(
                    JOURNEY_SEQUENCE.map(async (item) => {
                        if (!item.completionPredicate) return { id: item.id, done: false };
                        try {
                            const done = await item.completionPredicate(ctx);
                            return { id: item.id, done };
                        } catch {
                            // A single bad predicate must not break the panel.
                            return { id: item.id, done: false };
                        }
                    }),
                );

                if (cancelled) return;

                const next: CompletionMap = { ...EMPTY_COMPLETION };
                for (const r of results) {
                    if (r.status === "fulfilled") {
                        next[r.value.id] = r.value.done;
                    }
                }
                setCompletion(next);
                setIsLoading(false);
            } catch {
                if (!cancelled) {
                    setCompletion(EMPTY_COMPLETION);
                    setIsLoading(false);
                }
            }
        };

        setIsLoading(true);
        run();

        return () => {
            cancelled = true;
        };
    }, [nonce]);

    return { completion, isLoading, recheck };
}
