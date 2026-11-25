import { useEffect, useState } from "react";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { placeSaveFromSheet, placeState, type PlaceStateName } from "@/lib/placeState";

/**
 * The state of every village place, read from the player's save: the one source the map
 * (`/village`), the rail and the top bar share, so the three never disagree (WP-4).
 *
 * Until the save has loaded, `ready` is false and `states` reads every closed place as open
 * (so a consumer that ignores `ready` never shows a lock that then lifts). The rail and the top
 * bar go further (issue #443 A1): while `!ready` they draw a neutral loading state, not «open»,
 * then settle once to open or locked, so no place flips from lit to grey after the page paints.
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
