/**
 * scoring.ts — Matching algorithm v3 deterministic core (Day 80,
 * Sasha 2026-05-22).
 *
 * MIRROR of `supabase/functions/_shared/matchScoring.ts` deterministic
 * functions. Kept in sync manually because Supabase Edge Functions
 * bundle only files under `supabase/functions/`, so the algorithm core
 * cannot be a single source of truth across both runtimes.
 *
 * If you change scoreAssetFit / scoreQolSimilarity / composeResonance
 * here, update the matching twin file in the same commit. The LLM-
 * prompt strings + rationale-writer helpers live in the edge-function
 * twin only (they only run in Deno).
 *
 * Canonical algorithm spec: docs/02-strategy/matchmaking_strategy.md §5.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface QolVector {
    health_stage: number;
    wealth_stage: number;
    love_relationships_stage: number;
    social_ties_stage: number;
    growth_stage: number;
    impact_stage: number;
    happiness_stage: number;
    home_stage: number;
}

export interface AssetRow {
    type_id: string;
    sub_type_id?: string | null;
    category_id?: string | null;
    title?: string | null;
    description?: string | null;
}

export interface SubScores {
    topTalent: number;
    mission: number;
    assets: number;
    qol: number;
}

// ─── Asset Lego-block fit (§5.4) ─────────────────────────────────────

export const CANONICAL_ASSET_TYPES = [
    "Expertise",
    "Life Experiences",
    "Networks",
    "Material Resources",
    "Intellectual Property",
    "Influence",
] as const;

export function scoreAssetFit(a: AssetRow[], b: AssetRow[]): number {
    if (!a.length || !b.length) return 0.5;

    const countByType = (rows: AssetRow[]): Map<string, number> => {
        const m = new Map<string, number>();
        for (const row of rows) {
            const type = row.type_id;
            if (!type) continue;
            m.set(type, (m.get(type) || 0) + 1);
        }
        return m;
    };
    const ca = countByType(a);
    const cb = countByType(b);

    const union = new Set<string>([...ca.keys(), ...cb.keys()]);
    const coverage = union.size / CANONICAL_ASSET_TYPES.length;

    let depthBonus = 0;
    for (const type of CANONICAL_ASSET_TYPES) {
        const aCount = ca.get(type) || 0;
        const bCount = cb.get(type) || 0;
        if ((aCount >= 2 && bCount === 0) || (bCount >= 2 && aCount === 0)) {
            depthBonus += 0.10;
        }
    }
    depthBonus = Math.min(depthBonus, 0.40);

    return Math.min(1.0, coverage + depthBonus);
}

// ─── QoL similarity (§5.5) ───────────────────────────────────────────

export function scoreQolSimilarity(
    a: QolVector | null,
    b: QolVector | null,
): number {
    if (!a || !b) return 0.5;

    const axes: (keyof QolVector)[] = [
        "health_stage",
        "wealth_stage",
        "love_relationships_stage",
        "social_ties_stage",
        "growth_stage",
        "impact_stage",
        "happiness_stage",
        "home_stage",
    ];

    let sumSq = 0;
    for (const axis of axes) {
        const diff = (a[axis] || 0) - (b[axis] || 0);
        sumSq += diff * diff;
    }
    const distance = Math.sqrt(sumSq);
    const MAX_DISTANCE = Math.sqrt(8 * 49);
    return Math.max(0, 1 - distance / MAX_DISTANCE);
}

// ─── Composition (§5.1) ──────────────────────────────────────────────

export function composeResonance(subScores: SubScores): number {
    const product =
        subScores.topTalent *
        subScores.mission *
        subScores.assets *
        subScores.qol;
    const geomMean = Math.pow(product, 1 / 4);
    return Math.round(geomMean * 100);
}

// ─── Similarity-score parser (§5.2 / §5.3 LLM output handling) ──────

export function parseSimilarityScore(raw: string): number {
    if (!raw) return 0.5;
    const match = raw.trim().match(/^([01](?:\.\d+)?|0?\.\d+)/);
    if (!match) return 0.5;
    const n = parseFloat(match[1]);
    if (Number.isNaN(n)) return 0.5;
    return Math.max(0, Math.min(1, n));
}
