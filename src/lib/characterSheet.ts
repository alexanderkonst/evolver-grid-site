/**
 * characterSheet.ts — pure helpers for the Character Sheet (`/game/me/overview`).
 *
 * Design source: docs/02-strategy/game_of_being_you.md §13.2.
 * Level = the player's real QoL: the WEAKEST of the 8 domains in the latest
 * qol_snapshot (core loop v0.1). Same rule as `getLowestQolDomain`
 * (practiceSystem.ts) and `findLowestDomain` (domainMapping.ts); this is the
 * score-returning form of it, not a new formula.
 *
 * PRIVATE: the level is shown to the signed-in player on their own sheet only.
 * Do not import this into matchmaking, marketplace or public-profile code.
 */

import { DOMAINS, type DomainId } from "@/modules/quality-of-life-map/qolConfig";

/** qol_snapshots column per domain (love is stored as `love_relationships_stage`). */
export const QOL_STAGE_COLUMN: Record<DomainId, string> = {
    wealth: "wealth_stage",
    health: "health_stage",
    happiness: "happiness_stage",
    love: "love_relationships_stage",
    impact: "impact_stage",
    growth: "growth_stage",
    socialTies: "social_ties_stage",
    home: "home_stage",
};

export const QOL_MAX_STAGE = 10;

export type QolDomainScore = { id: DomainId; score: number };

export type QolLevel = {
    /** The weakest domain's score, 1–10. */
    level: number;
    weakest: DomainId;
    domains: QolDomainScore[];
};

/** Read the 8 domain scores from a qol_snapshots row. Missing/invalid values are skipped. */
export const getQolDomainScores = (snapshot: Record<string, unknown> | null | undefined): QolDomainScore[] => {
    if (!snapshot) return [];
    const out: QolDomainScore[] = [];
    for (const domain of DOMAINS) {
        const raw = snapshot[QOL_STAGE_COLUMN[domain.id]];
        if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
            out.push({ id: domain.id, score: Math.min(raw, QOL_MAX_STAGE) });
        }
    }
    return out;
};

/** Level = weakest domain. Ties resolve to the first domain in canonical order. Null when nothing is scored. */
export const getQolLevel = (snapshot: Record<string, unknown> | null | undefined): QolLevel | null => {
    const domains = getQolDomainScores(snapshot);
    if (domains.length === 0) return null;
    let weakest = domains[0];
    for (const d of domains) {
        if (d.score < weakest.score) weakest = d;
    }
    return { level: weakest.score, weakest: weakest.id, domains };
};
