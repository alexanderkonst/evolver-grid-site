import type { DomainId } from "@/modules/quality-of-life-map/qolConfig";

/**
 * Player level = the weakest of the 8 QoL domains (core loop v0.1,
 * docs/02-strategy/game_of_being_you.md §10). The same rule getLowestQolDomain
 * (practiceSystem) uses to pick the growth edge, here with the score kept.
 *
 * PRIVATE by design (§13.2): this is for the player's own Character Sheet.
 * Never feed it to matchmaking, marketplace or any public profile surface.
 */

/** qol_snapshots column for each QoL domain. */
export const QOL_DOMAIN_COLUMNS: Record<DomainId, keyof QolStageColumns> = {
  wealth: "wealth_stage",
  health: "health_stage",
  happiness: "happiness_stage",
  love: "love_relationships_stage",
  impact: "impact_stage",
  growth: "growth_stage",
  socialTies: "social_ties_stage",
  home: "home_stage",
};

export type QolStageColumns = {
  wealth_stage: number | null;
  health_stage: number | null;
  happiness_stage: number | null;
  love_relationships_stage: number | null;
  impact_stage: number | null;
  growth_stage: number | null;
  social_ties_stage: number | null;
  home_stage: number | null;
};

export type QolDomainScore = { id: DomainId; score: number };

export type QolLevel = {
  /** Weakest domain's stage, 1–10. */
  level: number;
  /** Domain that sets the level (first in QoL order on ties). */
  weakest: DomainId;
  /** All 8 domains in QoL order. */
  domains: QolDomainScore[];
};

/** Returns null when there is no snapshot or any stage is missing: no invented defaults. */
export function computeQolLevel(snapshot: Partial<QolStageColumns> | null | undefined): QolLevel | null {
  if (!snapshot) return null;

  const domains: QolDomainScore[] = [];
  for (const [id, column] of Object.entries(QOL_DOMAIN_COLUMNS) as [DomainId, keyof QolStageColumns][]) {
    const score = snapshot[column];
    if (typeof score !== "number" || !Number.isFinite(score)) return null;
    domains.push({ id, score });
  }

  const weakest = domains.reduce((low, d) => (d.score < low.score ? d : low));
  return { level: weakest.score, weakest: weakest.id, domains };
}
