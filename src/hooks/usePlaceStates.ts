import { useEffect, useState } from "react";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { hasGuestTopTalentResult } from "@/lib/firstVisit";
import {
  nextMove,
  oneNextStates,
  placeSaveFromSheet,
  placeState,
  type NextMove,
  type PlaceSave,
  type PlaceStateName,
} from "@/lib/placeState";

/**
 * The player's save as the village reads it, with the finished test a guest holds on this device
 * (WP-7b), so the rail, the top bar and `/village` see one and the same save. `ready` is false
 * until the sheet has loaded.
 */
export const usePlaceSave = (): { save: PlaceSave; ready: boolean } => {
  const sheet = useCharacterSheet();
  // A live window (webinar, Mastermind) opens and closes while the page is up.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const ready = !sheet.isLoading;
  const guestResult = ready && !sheet.userId && hasGuestTopTalentResult();
  return { save: placeSaveFromSheet(sheet, now, { "guest-result": guestResult }), ready };
};

/**
 * The state of every village place, read from the player's save: the one source the map
 * (`/village`), the rail and the top bar share, so the three never disagree (WP-4).
 *
 * Until the save has loaded, `ready` is false and `states` reads every closed place as open
 * (so a consumer that ignores `ready` never shows a lock that then lifts). The rail and the top
 * bar go further (issue #443 A1): while `!ready` they draw a neutral loading state, not «open»,
 * then settle once to open or locked, so no place flips from lit to grey after the page paints.
 * `states` follows `VILLAGE_PLACES` order.
 *
 * `move` is the one next move (`nextMove`, the same selector as the map's card), and `states`
 * carries `next` only on its place (`oneNextStates`, §25.4 step 1): one glow, the same everywhere.
 */
export const usePlaceStates = (): { states: PlaceStateName[]; ready: boolean; move: NextMove | null } => {
  const { save, ready } = usePlaceSave();
  const raw = VILLAGE_PLACES.map((p): PlaceStateName => {
    const s = placeState(p, save);
    return !ready && s === "closed" ? "open" : s;
  });
  const move = ready ? nextMove(VILLAGE_PLACES, save) : null;
  return { states: oneNextStates(VILLAGE_PLACES, raw, move), ready, move };
};
