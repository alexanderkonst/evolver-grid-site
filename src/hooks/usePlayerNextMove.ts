import { useTranslation } from "react-i18next";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { nextMove, nextMoveCopy, placeSaveFromSheet, type NextMove } from "@/lib/placeState";

/**
 * The one next move of a signed-in player: the same `nextMove(VILLAGE_PLACES, save)` the map
 * card (`/village`) shows, so the map, `/next-move` and `/next-move-v2` never disagree
 * (issue #241). `move` is null until the save has loaded, or when nothing is open to offer.
 */
export function usePlayerNextMove() {
  const { t } = useTranslation();
  const sheet = useCharacterSheet();
  const ready = !sheet.isLoading;
  const move: NextMove | null = ready ? nextMove(VILLAGE_PLACES, placeSaveFromSheet(sheet, new Date())) : null;
  return { move, copy: move ? nextMoveCopy(move, t) : null, ready };
}
