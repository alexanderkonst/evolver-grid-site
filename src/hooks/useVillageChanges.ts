import { useEffect, useState } from "react";
import { openPlaceKeys, whatChanged, type MovePlace, type PlaceSave } from "@/lib/placeState";

/**
 * useVillageChanges — «what changed» since this player last stood in the village
 * (docs/02-strategy/game_of_being_you.md §14.6).
 *
 * The village remembers which places it has seen open, per player, in this browser. A place
 * that is open now and was not in that set is new: it gets the one-time reveal and its line.
 * The set only grows, so a save that fails to load (everything closed) can never write the
 * village backwards, and a place that opened once is never announced twice.
 *
 * Nothing is announced on the first visit with no memory (the village has no «before» to
 * compare to) or for a guest, whose open places never change. Cosmetic: storage that is
 * unavailable means no reveal, never an error.
 */

const KEY = (userId: string) => `village:seen-open-v1:${userId}`;

const readSeen = (userId: string): string[] | null => {
  try {
    const raw = window.localStorage.getItem(KEY(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : null;
  } catch {
    return null;
  }
};

const writeSeen = (userId: string, keys: string[]) => {
  try {
    window.localStorage.setItem(KEY(userId), JSON.stringify(keys));
  } catch {
    // Private mode / quota: the reveal is cosmetic, ignore.
  }
};

export type VillageChanges<P extends MovePlace> = {
  /** Places that opened since the last visit, in map order. Stays for the whole visit. */
  fresh: P[];
  /** The one line that names the change, or null. */
  line: string | null;
};

/**
 * @param userId the signed-in player, or null (guest / save not loaded: nothing is tracked)
 * @param ready  the save has loaded; before that every place reads closed
 */
export function useVillageChanges<P extends MovePlace>(
  userId: string | null,
  places: readonly P[],
  save: PlaceSave,
  ready: boolean,
): VillageChanges<P> {
  const [freshKeys, setFreshKeys] = useState<string[]>([]);
  const openNow = openPlaceKeys(places, save).join("|");

  useEffect(() => {
    if (!ready || !userId) return;
    const seen = readSeen(userId);
    const open = openNow ? openNow.split("|") : [];
    if (seen) {
      const added = open.filter((k) => !seen.includes(k));
      // Keep what was already announced this visit (a re-run must not clear it).
      if (added.length > 0) setFreshKeys((prev) => [...new Set([...prev, ...added])]);
    }
    writeSeen(userId, [...new Set([...(seen ?? []), ...open])]);
  }, [userId, ready, openNow]);

  // `whatChanged` takes the set already seen: every place except the ones new this visit.
  const seen = new Set(places.map((p) => p.key).filter((k) => !freshKeys.includes(k)));
  return whatChanged(places, seen, save);
}
