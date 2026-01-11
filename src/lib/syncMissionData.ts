import { supabase } from "@/integrations/supabase/client";
import { PILLARS } from "@/modules/mission-discovery/data/pillars";
import { FOCUS_AREAS } from "@/modules/mission-discovery/data/focusAreas";
import { KEY_CHALLENGES } from "@/modules/mission-discovery/data/challenges";
import { DESIRED_OUTCOMES } from "@/modules/mission-discovery/data/outcomes";
import { MISSIONS } from "@/modules/mission-discovery/data/missions";

export interface SyncResult {
  success: boolean;
  counts: {
    pillars: number;
    focusAreas: number;
    challenges: number;
    outcomes: number;
    missions: number;
  };
  missionsByPillar: Record<string, number>;
  errors?: unknown;
}

export async function syncMissionData(): Promise<SyncResult> {
  const { data, error } = await supabase.functions.invoke("sync-mission-data", {
    body: {
      pillars: PILLARS.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        icon: p.icon,
        color: p.color,
      })),
      focusAreas: FOCUS_AREAS.map(fa => ({
        id: fa.id,
        pillarId: fa.pillarId,
        title: fa.title,
        description: fa.description,
      })),
      challenges: KEY_CHALLENGES.map(c => ({
        id: c.id,
        focusAreaId: c.focusAreaId,
        title: c.title,
        description: c.description,
      })),
      outcomes: DESIRED_OUTCOMES.map(o => ({
        id: o.id,
        challengeId: o.challengeId,
        title: o.title,
        description: o.description,
      })),
      missions: MISSIONS.map(m => ({
        id: m.id,
        outcomeId: m.outcomeId,
        title: m.title,
        statement: m.statement,
        existingProjects: m.existingProjects || [],
      })),
    },
  });

  if (error) {
    throw error;
  }

  return data as SyncResult;
}

export function getMissionCounts() {
  const countsByPillar: Record<string, number> = {};
  
  for (const m of MISSIONS) {
    // Extract pillar from outcomeId: <pillar>-focus-area-XX-challenge-XX-outcome-XX
    const match = m.outcomeId.match(/^([a-z]+)-focus-area-/);
    const pillar = match ? match[1] : "unknown";
    countsByPillar[pillar] = (countsByPillar[pillar] || 0) + 1;
  }

  return {
    total: MISSIONS.length,
    pillars: PILLARS.length,
    focusAreas: FOCUS_AREAS.length,
    challenges: KEY_CHALLENGES.length,
    outcomes: DESIRED_OUTCOMES.length,
    byPillar: countsByPillar,
  };
}

export async function matchMissions(text: string, limit = 5) {
  const { data, error } = await supabase.functions.invoke("match-missions", {
    body: { text, limit },
  });

  if (error) {
    throw error;
  }

  return data as { matches: Array<{ mission_id: string; score: number }> };
}
