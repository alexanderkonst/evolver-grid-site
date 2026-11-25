import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import {
  GLINT_EVENT,
  glintsFromChanges,
  mergeGlints,
  readGlints,
  readHouseSeenOpen,
  sinceYouWereHere,
  writeGlints,
  writeHouseSeenOpen,
  type HouseChange,
} from "@/lib/instrument/glint";
import { openPlaceKeys, type PlaceSave } from "@/lib/placeState";

/**
 * useSinceYouWereHere — Your House as the bench where changes are written in (architecture §7 phase 6,
 * #451, WP6). Compares the places open now with the ones this House last showed as open, lists the
 * new ones (at most three lines) and writes a glint on each body whose face changed; the instrument
 * shows only that glint and clears it when the face is opened.
 *
 * Same rules as `useVillageChanges`: the memory only grows (a save that fails to load can never
 * write it backwards), nothing is announced on the first visit with no memory or for a guest, and
 * the list stays for the whole visit. Storage is localStorage per player; cosmetic, never an error.
 *
 * @param ownerId the signed-in player, or null (nothing is tracked)
 * @param save    the player's loaded save (the House renders only after it has loaded)
 */
export function useSinceYouWereHere(ownerId: string | null, save: PlaceSave): HouseChange[] {
  const { t } = useTranslation();
  const [freshKeys, setFreshKeys] = useState<string[]>([]);
  const openNow = openPlaceKeys(VILLAGE_PLACES, save).join("|");

  useEffect(() => {
    if (!ownerId) return;
    const seen = readHouseSeenOpen(ownerId);
    const open = openNow ? openNow.split("|") : [];
    if (seen) {
      const changes = sinceYouWereHere(VILLAGE_PLACES, new Set(seen), save, undefined, Infinity);
      if (changes.length > 0) {
        setFreshKeys((prev) => [...new Set([...prev, ...changes.map((c) => c.key)])]);
        const glints = glintsFromChanges(changes);
        if (Object.keys(glints).length > 0) {
          writeGlints(ownerId, mergeGlints(readGlints(ownerId), glints));
          window.dispatchEvent(new Event(GLINT_EVENT));
        }
      }
    }
    writeHouseSeenOpen(ownerId, [...(seen ?? []), ...open]);
    // `save` is read only through `openNow`, which is what changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, openNow]);

  const seenThisVisit = new Set(VILLAGE_PLACES.map((p) => p.key).filter((k) => !freshKeys.includes(k)));
  return sinceYouWereHere(VILLAGE_PLACES, seenThisVisit, save, t);
}
