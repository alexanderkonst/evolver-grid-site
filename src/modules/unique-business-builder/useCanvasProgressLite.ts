/**
 * useCanvasProgressLite — minimal canvas-progress hook for pane 2.
 *
 * Day 53 night iter 3 (Sasha 2026-04-27): pane 2 (`SectionsPanel`) sits
 * ABOVE `UniqueBusinessLayout` in the React tree, so it can't consume
 * `UniqueBusinessContext`. Lifting the provider above `GameShellV2`
 * would force a Supabase query on every route, wasting bandwidth on
 * non-UBB pages. This hook is the targeted alternative: it only runs
 * when the user is on `/ubb*`, fetches per-phase locked counts in a
 * single query, and re-runs on path changes within UBB so pane 2 stays
 * roughly current as the user locks artifacts.
 *
 * What it does NOT do (and why):
 *   - No realtime subscription. Locking an artifact typically navigates
 *     the founder to the next artifact, which triggers a pathname change
 *     → re-fetch. Stale-by-one-action is acceptable for a navigation pane.
 *     Realtime can be added later if the lock-and-stay edge case matters.
 *   - No version-history awareness. We count "phase progress" by whether
 *     ANY locked row exists for a given artifact_key — matching the
 *     in-app context's `latestLocked` semantics closely enough.
 *   - No client-side cache across navigations OUT of /ubb. When the user
 *     leaves /ubb and comes back, we re-fetch. Negligible cost.
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ALL_ARTIFACT_KEYS } from "./types";
import { phaseOf, PHASE_LABELS } from "./constants";

export type PhaseKey = keyof typeof PHASE_LABELS;

export type PhaseProgress = {
  /** Per-phase locked / total counts. Phase keys match `phaseOf()` output. */
  perPhase: Record<string, { total: number; locked: number }>;
  /** Across all phases — locked artifact count. */
  totalLocked: number;
  /** Across all phases — total artifact count (constant: ALL_ARTIFACT_KEYS.length). */
  total: number;
  /** True until the first fetch resolves. */
  isLoading: boolean;
};

const ALL_PHASES: PhaseKey[] = [
  "canvas",
  "session",
  "marketing",
  "distribution",
  "communications",
  "publication",
];

/**
 * Returns canvas progress when the user is at `/ubb*`, otherwise null.
 * Refetches on path changes within `/ubb` so the pane stays current as
 * the founder navigates between artifacts and locks them.
 */
export function useCanvasProgressLite(): PhaseProgress | null {
  const location = useLocation();
  const onUbb = location.pathname === "/ubb" || location.pathname.startsWith("/ubb/");

  const [progress, setProgress] = useState<PhaseProgress | null>(null);

  useEffect(() => {
    if (!onUbb) {
      setProgress(null);
      return;
    }

    let cancelled = false;
    setProgress((prev) =>
      prev ? { ...prev, isLoading: true } : { perPhase: {}, totalLocked: 0, total: ALL_ARTIFACT_KEYS.length, isLoading: true },
    );

    (async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const uid = userRes.user?.id;
        if (!uid || cancelled) return;

        const { data: rows, error } = await (supabase as any)
          .from("user_business_artifacts")
          .select("artifact_key, is_locked")
          .eq("user_id", uid)
          .eq("is_locked", true);

        if (cancelled) return;
        if (error) {
          console.warn("[useCanvasProgressLite] fetch error:", error);
          setProgress({
            perPhase: emptyPerPhase(),
            totalLocked: 0,
            total: ALL_ARTIFACT_KEYS.length,
            isLoading: false,
          });
          return;
        }

        // Distinct locked artifact_keys (a key may have multiple locked
        // versions across the version chain; we count it once).
        const lockedKeys = new Set<string>();
        for (const row of (rows as Array<{ artifact_key: string }>) || []) {
          lockedKeys.add(row.artifact_key);
        }

        const perPhase: Record<string, { total: number; locked: number }> = emptyPerPhase();
        for (const key of ALL_ARTIFACT_KEYS) {
          const phase = phaseOf(key) as PhaseKey;
          perPhase[phase].total += 1;
          if (lockedKeys.has(key)) {
            perPhase[phase].locked += 1;
          }
        }

        setProgress({
          perPhase,
          totalLocked: lockedKeys.size,
          total: ALL_ARTIFACT_KEYS.length,
          isLoading: false,
        });
      } catch (e) {
        console.warn("[useCanvasProgressLite] unexpected:", e);
        if (!cancelled) {
          setProgress({
            perPhase: emptyPerPhase(),
            totalLocked: 0,
            total: ALL_ARTIFACT_KEYS.length,
            isLoading: false,
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // pathname is the trigger — refetch on every UBB path change so
    // pane 2 reflects locks made via Lock & Continue (which navigate).
  }, [onUbb, location.pathname]);

  return onUbb ? progress : null;
}

function emptyPerPhase(): Record<string, { total: number; locked: number }> {
  const out: Record<string, { total: number; locked: number }> = {};
  for (const phase of ALL_PHASES) {
    out[phase] = { total: 0, locked: 0 };
  }
  return out;
}
