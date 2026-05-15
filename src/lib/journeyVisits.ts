/**
 * Mark a JOURNEY pane item as visited.
 *
 * Day 65 wave 4 (Sasha 2026-05-15): cross-device strikethrough
 * for content-page items #2/#3/#4 (Playbook, Path, Dashboard).
 * Each page calls this on mount; useJourneyProgress reads both
 * the localStorage flag AND the matching game_profiles column,
 * OR'd together. Either source marks the row complete.
 *
 * Behavior:
 *   - Always writes localStorage (fast, works pre-auth, browser-local).
 *   - If authed, also writes the matching column on game_profiles
 *     ONLY IF currently NULL (first-write wins; subsequent
 *     visits are DB no-ops because the WHERE clause matches
 *     zero rows). Preserves earliest-visit semantics without
 *     needing UPSERT logic.
 *
 * Failure modes (all silent — visit-tracking is nice-to-have,
 * never load-blocking):
 *   - localStorage unavailable (SSR / privacy mode) → no-op.
 *   - User not authed → DB write skipped, localStorage still set.
 *   - DB column doesn't exist yet (migration unapplied) →
 *     supabase.update().eq().is() returns an error; we swallow it.
 *
 * Migration: see supabase/migrations/20260515215900_journey_visit_columns.sql.
 */

import { supabase } from "@/integrations/supabase/client";

type MarkArgs = {
  /** Section id used inside `buildJourneySections` (matches the localStorage key suffix). */
  itemId: string;
  /** Column name on `game_profiles` that stores the first-visit timestamp. */
  dbColumn: "playbook_visited_at" | "path_visited_at" | "dashboard_visited_at";
};

export async function markJourneyVisited({ itemId, dbColumn }: MarkArgs): Promise<void> {
  const nowIso = new Date().toISOString();

  // localStorage — always, idempotent.
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`journey:visited:${itemId}`, nowIso);
    }
  } catch {
    // localStorage unavailable — silent no-op.
  }

  // DB — authed users only, first-write wins via .is(col, null).
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) return;
    await (supabase as any)
      .from("game_profiles")
      .update({ [dbColumn]: nowIso })
      .eq("user_id", uid)
      .is(dbColumn, null);
  } catch {
    // Silent — DB write is the cross-device bonus, not the gate.
  }
}
