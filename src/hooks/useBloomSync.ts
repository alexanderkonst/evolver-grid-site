import { useEffect } from "react";
import { earnedBloomObjects, syncBloomFromSave } from "@/lib/bloomEarned";
import type { PlaceSave } from "@/lib/placeState";

/**
 * useBloomSync — keeps the world's one bloomLevel in step with the player's save (issue #277).
 *
 * Rides on a character sheet the caller already loaded (usePlaceStates, Village), so it adds no
 * query. It waits for the sheet to finish and ignores a failed read: an unread sheet is not an
 * empty one, and a bad network must not drain the world back to silver.
 */
export const useBloomSync = (
  save: PlaceSave,
  victories: readonly string[] | undefined,
  ready: boolean,
  loadFailed: boolean,
) => {
  // The earned objects are the only input the effect reads; this key stands in for them.
  const key = earnedBloomObjects({
    ...save.met,
    ...Object.fromEntries((victories ?? []).map((id) => [id, true])),
  }).join("|");

  useEffect(() => {
    if (!ready || loadFailed) return;
    syncBloomFromSave(save.met, victories);
    // `key` carries the save's earned objects; watched course modules are re-read on each run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, loadFailed, key]);
};
