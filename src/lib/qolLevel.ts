import type { DomainId } from "@/modules/quality-of-life-map/qolConfig";

/**
 * Player level = the average of the 8 QoL domains (Sasha, 2026-10-30, issue #241). The one
 * level the game shows, on every screen. The weakest domain stays as `weakest`: it picks the
 * growth edge (getLowestQolDomain in practiceSystem), it no longer sets the level.
 *
 * PRIVATE by design (§13.2): the number is for the player's own screens only. Never feed it to
 * matchmaking, marketplace, ranking or any public profile surface;
 * other players see nothing about it (no number, no lock). No XP is shown beside it.
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
  /** Mean of the 8 domain stages to one decimal, 1–10. */
  level: number;
  /** Lowest domain (first in QoL order on ties): the growth edge, not the level. */
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
  const mean = domains.reduce((sum, d) => sum + d.score, 0) / domains.length;
  return { level: Math.round(mean * 10) / 10, weakest: weakest.id, domains };
}

/** The one player level: mean of the 8 QoL domains (6.9, or 7 when whole). Null when any stage is missing. */
export function qolAverageLevel(snapshot: Partial<QolStageColumns> | null | undefined): number | null {
  return computeQolLevel(snapshot)?.level ?? null;
}
