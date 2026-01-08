import { supabase } from "@/integrations/supabase/client";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";

export async function syncMissionData() {
  const missionsData = MISSIONS.map((m) => ({
    mission_id: m.id,
    mission_title: m.title,
    mission_statement: m.statement,
    outcome_id: m.outcomeId || null,
    challenge_id: m.challengeId || null,
    focus_area_id: m.focusAreaId || null,
    pillar_id: m.pillarId || null,
  }));

  const { data, error } = await supabase.functions.invoke("sync-mission-data", {
    body: { missions: missionsData },
  });

  if (error) {
    console.error("Failed to sync missions:", error);
    throw error;
  }

  return data;
}

export async function matchMissions(text: string, limit = 5) {
  const { data, error } = await supabase.functions.invoke("match-missions", {
    body: { text, limit },
  });

  if (error) {
    console.error("Failed to match missions:", error);
    throw error;
  }

  return data as { matches: Array<{ mission_id: string; score: number }> };
}
