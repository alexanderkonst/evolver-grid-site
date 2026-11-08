import { supabase } from "@/integrations/supabase/client";

/**
 * One read path for «the player's current Top Talent» (issue #207).
 *
 * The current snapshot is the one `game_profiles.last_zog_snapshot_id` points at
 * (a version can be restored by repointing it, so «newest row» is not always
 * current). Fall back to the newest snapshot only when the pointer is NULL or
 * points at a row that is not this profile's.
 *
 * Used by Reception (`loadSavedData`) and Home (`useCharacterSheet`) so
 * the two screens cannot show two different top talents.
 */

/** Pointer wins; the newest snapshot is only the fallback. */
export const pickTopTalentSnapshot = <T>(pointed: T | null, newest: T | null): T | null =>
  pointed ?? newest;

/**
 * @param columns PostgREST column list for `zog_snapshots`; must include `id`.
 */
export async function fetchTopTalentSnapshot<T extends { id: string }>(
  profileId: string,
  columns: string,
  /**
   * The caller's already-read `game_profiles.last_zog_snapshot_id` (`null` = no pointer).
   * Skips the pointer round trip. `undefined` = read it here.
   */
  knownPointerId?: string | null,
): Promise<T | null> {
  let pointerId: string | null;
  if (knownPointerId !== undefined) {
    pointerId = knownPointerId;
  } else {
    const { data: pointerRow } = await supabase
      .from("game_profiles")
      .select("last_zog_snapshot_id")
      .eq("id", profileId)
      .maybeSingle();
    pointerId = pointerRow?.last_zog_snapshot_id ?? null;
  }

  const readPointed = async (): Promise<T | null> => {
    if (!pointerId) return null;
    const { data } = await supabase
      .from("zog_snapshots")
      .select(columns)
      .eq("id", pointerId)
      .eq("profile_id", profileId)
      .maybeSingle();
    return (data as unknown as T | null) ?? null;
  };

  const readNewest = async (): Promise<T | null> => {
    const { data } = await supabase
      .from("zog_snapshots")
      .select(columns)
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data as unknown as T | null) ?? null;
  };

  // Both reads at once: the newest row is only used when the pointer is empty or stale,
  // but waiting for the pointer first made Home pay for two round trips in series (#263).
  const [pointed, newest] = await Promise.all([readPointed(), readNewest()]);
  return pickTopTalentSnapshot(pointed, newest);
}
