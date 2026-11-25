import { useTranslation } from "react-i18next";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { usePlaceSave } from "@/hooks/usePlaceStates";
import { nextMove, nextMoveCopy, type NextMove } from "@/lib/placeState";

/**
 * The one next move: the same `nextMove(VILLAGE_PLACES, save)` the map card (`/village`), the
 * rail glow (`usePlaceStates`) and the pane row show, read from the same save (a guest's finished
 * test included), so they never disagree (issue #241, #453 phase 2). `move` is null until the
 * save has loaded, or when nothing is open to offer.
 */
export function usePlayerNextMove() {
  const { t } = useTranslation();
  const { save, ready } = usePlaceSave();
  const move: NextMove | null = ready ? nextMove(VILLAGE_PLACES, save) : null;
  return { move, copy: move ? nextMoveCopy(move, t) : null, ready };
}
