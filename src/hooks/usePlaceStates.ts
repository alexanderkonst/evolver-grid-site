import { useEffect, useState } from "react";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { placeSaveFromSheet, placeState, type PlaceStateName } from "@/lib/placeState";

/**
 * The state of every village place, read from the player's save: the one source the map
 * (`/village`), the rail and the top bar share, so the three never disagree (WP-4).
 *
 * Until the save has loaded, a place that will turn out closed is reported open, so a
 * returning player never sees the rail fade and brighten again (same rule as Village.tsx).
 * `states` follows `VILLAGE_PLACES` order.
 */
export const usePlaceStates = (): { states: PlaceStateName[]; ready: boolean } => {
  const sheet = useCharacterSheet();
  // A live window (webinar, Mastermind) opens and closes while the page is up.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const ready = !sheet.isLoading;
  const save = placeSaveFromSheet(sheet, now);
  const states = VILLAGE_PLACES.map((p): PlaceStateName => {
    const s = placeState(p, save);
    return !ready && s === "closed" ? "open" : s;
  });
  return { states, ready };
};
