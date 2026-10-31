import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JOURNEY_SEQUENCE, type JourneyItemId } from "@/data/journeySequence";
import { LOAD_TIMEOUT_MS, TimeoutError, withTimeout } from "@/lib/withTimeout";

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
 *   1. Reads the current auth user once on mount, from the stored session
 *      (`getSession`, local). `auth.getUser()` is a network call that can stall
 *      and keep the whole page loading (GameShellV2 documents the same).
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
 *   - `isLoading`: true until the first batch resolves or LOAD_TIMEOUT_MS passes
 *   - `loadFailed`: the read failed or timed out («unread», not «nothing done»).
 *     Never an endless `isLoading` (issue #263).
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
    const [loadFailed, setLoadFailed] = useState(false);
    const [nonce, setNonce] = useState(0);

    const recheck = useCallback(() => {
        setNonce((n) => n + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                // The whole read is bounded: one request that never settles must end in
                // «failed», never in a loading line that lasts for good (issue #263).
                const result = await withTimeout(loadCompletion(), LOAD_TIMEOUT_MS, "journey completion");
                if (cancelled) return;
                setCompletion(result.completion);
                setLoadFailed(result.failed);
            } catch {
                if (cancelled) return;
                setCompletion(EMPTY_COMPLETION);
                setLoadFailed(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        setIsLoading(true);
        run();

        return () => {
            cancelled = true;
        };
    }, [nonce]);

    return { completion, isLoading, loadFailed, recheck };
}

/**
 * One read of the whole chain. Exported for tests.
 * `failed` = a request timed out, so a `false` may mean «unread», not «not done».
 */
export async function loadCompletion(): Promise<{ completion: CompletionMap; failed: boolean }> {
    // Step 1: current auth user, from the stored session. Anonymous → all-false.
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!user) return { completion: EMPTY_COMPLETION, failed: false };

    // Step 2: lookup the game_profiles row. Read-only — do NOT create one if missing.
    // Some predicates only need user.id (e.g. user_assets), so a missing profile
    // doesn't disqualify every item from completing.
    const { data: profile } = await supabase
        .from("game_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    const ctx = {
        supabase,
        userId: user.id,
        profileId: profile?.id ?? null,
    };

    // Step 3: run all predicates in parallel; each is bounded on its own.
    let failed = false;
    const results = await Promise.allSettled(
        JOURNEY_SEQUENCE.map(async (item) => {
            if (!item.completionPredicate) return { id: item.id, done: false };
            try {
                const done = await withTimeout(item.completionPredicate(ctx), LOAD_TIMEOUT_MS, item.id);
                return { id: item.id, done };
            } catch (e) {
                // A single bad predicate must not break the panel; a hung one is a failed read.
                if (e instanceof TimeoutError) failed = true;
                return { id: item.id, done: false };
            }
        }),
    );

    const next: CompletionMap = { ...EMPTY_COMPLETION };
    for (const r of results) {
        if (r.status === "fulfilled") {
            next[r.value.id] = r.value.done;
        }
    }
    return { completion: next, failed };
}
