import { Navigate } from "react-router-dom";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { VILLAGE_PLACES } from "@/data/villagePlaces";
import { nextMove, placeSaveFromSheet } from "@/lib/placeState";

/**
 * Where a player lands after signing in (issue #250): the one next move of the village
 * (`nextMove`, the same the map and the Quest Board show), not a method page.
 * Renders nothing visible; it waits for the save, then replaces itself with the move's
 * route. With no move to offer it falls back to the village map.
 */
export const NEXT_STEP_PATH = "/game/next";

const NextStep = () => {
  const sheet = useCharacterSheet();
  if (sheet.isLoading) return <div className="min-h-dvh" aria-busy="true" />;
  const move = nextMove(VILLAGE_PLACES, placeSaveFromSheet(sheet));
  return <Navigate to={move?.to ?? "/village"} replace />;
};

export default NextStep;
