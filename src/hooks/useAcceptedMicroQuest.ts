import { useEffect, useState } from "react";
import { loadSavedData } from "@/modules/zone-of-genius/saveToDatabase";

/** A4: the micro-quest the player accepted after their reveal (stored in the saved reveal JSON). */
export type AcceptedMicroQuest = { quest: string; potential: string | null };

/** Pure: pick the accepted micro-quest out of a saved reveal, or null (old reveal, not accepted). */
export const acceptedMicroQuestOf = (
  appleseed: { topTalentProfile?: { micro_quest?: string; micro_quest_accepted_at?: string; next_potential?: { title?: string } } } | null | undefined,
): AcceptedMicroQuest | null => {
  const profile = appleseed?.topTalentProfile;
  const quest = typeof profile?.micro_quest === "string" ? profile.micro_quest.trim() : "";
  if (!quest || !profile?.micro_quest_accepted_at) return null;
  const potential = typeof profile.next_potential?.title === "string" ? profile.next_potential.title.trim() : "";
  return { quest, potential: potential || null };
};

/** Reads the saved reveal (database for a signed-in player, this device for a guest). */
export function useAcceptedMicroQuest(): AcceptedMicroQuest | null {
  const [found, setFound] = useState<AcceptedMicroQuest | null>(null);
  useEffect(() => {
    let alive = true;
    void loadSavedData().then(({ appleseed }) => {
      if (alive) setFound(acceptedMicroQuestOf(appleseed));
    });
    return () => {
      alive = false;
    };
  }, []);
  return found;
}
