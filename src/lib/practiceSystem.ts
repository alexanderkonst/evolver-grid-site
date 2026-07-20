import { supabase } from "@/integrations/supabase/client";
import { type LibraryItem, type QolDomain } from "@/modules/library/libraryContent";

export type QolSnapshotStages = {
  wealth_stage: number;
  health_stage: number;
  happiness_stage: number;
  love_relationships_stage: number;
  impact_stage: number;
  growth_stage: number;
  social_ties_stage: number;
  home_stage: number;
};

/**
 * Find the lowest-scoring QoL domain from a snapshot — the person's
 * current "growth edge". Shared by getSuggestedPractices and any UI
 * that needs to label why a practice was recommended.
 */
export function getLowestQolDomain(qolSnapshot: QolSnapshotStages): QolDomain {
  const domainScores: Record<QolDomain, number> = {
    wealth: qolSnapshot.wealth_stage,
    health: qolSnapshot.health_stage,
    happiness: qolSnapshot.happiness_stage,
    love_relationships: qolSnapshot.love_relationships_stage,
    impact: qolSnapshot.impact_stage,
    growth: qolSnapshot.growth_stage,
    social_ties: qolSnapshot.social_ties_stage,
    home: qolSnapshot.home_stage,
  };

  return Object.entries(domainScores).reduce((lowest, [domain, score]) => {
    return score < domainScores[lowest as QolDomain] ? (domain as QolDomain) : lowest;
  }, 'health' as QolDomain);
}

/**
 * Mark a practice as done and award XP
 */
export async function markPracticeDone(
  practiceId: string,
  primaryPath?: string
): Promise<{ success: boolean; newXpTotal?: number; newLevel?: number; message?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("mark-practice-done", {
      body: { practiceId, primaryPath },
    });

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to log practice',
      };
    }

    return {
      success: true,
      newXpTotal: data.newXpTotal,
      newLevel: data.newLevel,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to log practice',
    };
  }
}

/**
 * Get suggested practices based on QoL snapshot
 */
export function getSuggestedPractices(
  practices: LibraryItem[],
  qolSnapshot: QolSnapshotStages
): LibraryItem[] {
  const lowestDomain = getLowestQolDomain(qolSnapshot);

  // Filter practices matching lowest domain
  const matchingPractices = practices.filter(
    p => p.primaryDomain === lowestDomain
  );

  // Sort by duration (shortest first) and take up to 3
  const sorted = matchingPractices.sort((a, b) => {
    const durationA = a.durationMinutes ?? 999;
    const durationB = b.durationMinutes ?? 999;
    return durationA - durationB;
  });

  return sorted.slice(0, 3);
}