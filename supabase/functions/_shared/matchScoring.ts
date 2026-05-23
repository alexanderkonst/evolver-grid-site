/**
 * matchScoring.ts — Matching algorithm v3 (Day 80, Sasha 2026-05-22).
 *
 * Canonical 4-input scoring per docs/02-strategy/matchmaking_strategy.md §5.
 *
 *   resonance(A, B) = 100 × ⁴√( top_talent × mission × assets × qol )
 *
 * Each sub-score in [0, 1]; missing data defaults to 0.5 (neutral).
 *
 * The sub-scores are computed deterministically here. The Top Talent
 * complementarity score is an exception: it requires LLM judgment on a
 * semantic rubric (see scoreTopTalentComplementarity). Mission similarity
 * is also LLM-judged in v3 — both will migrate to embedding-cosine when
 * the embedding endpoint is wired (see roadmap).
 *
 * Edge functions (Deno runtime): import from this file relative path —
 * `import { ... } from "../_shared/matchScoring.ts"`.
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
    type_id: string;          // canonical type (Expertise, Networks, etc.)
    sub_type_id?: string | null;
    category_id?: string | null;
    title?: string | null;
    description?: string | null;
}

export interface ProfileForMatching {
    userId: string;
    // Top Talent
    archetype: string | null;
    primeDriver: string | null;
    topThreeTalents: string[];     // compact gerund form
    // Mission
    missionStatement: string | null;
    missionTitle: string | null;
    // Assets
    assets: AssetRow[];
    // QoL
    qol: QolVector | null;
}

export interface SubScores {
    topTalent: number;
    mission: number;
    assets: number;
    qol: number;
}

export interface ResonanceResult {
    resonanceScore: number;        // 0-100
    subScores: SubScores;
}

// ─── 5.4 Asset Lego-block fit (deterministic) ────────────────────────

/**
 * The 6 canonical asset types from src/modules/asset-mapping/data/assetTypes.ts.
 * Synced manually — if that taxonomy changes, update here too.
 */
export const CANONICAL_ASSET_TYPES = [
    "Expertise",
    "Life Experiences",
    "Networks",
    "Material Resources",
    "Intellectual Property",
    "Influence",
] as const;

/**
 * Lego-block fit per §5.4.
 * - Coverage complementarity = (size of union of types) / 6.
 * - Depth complementarity bonus = +0.10 per type where one has 2+ and the other has 0.
 * - Final = min(1.0, coverage + depth_bonus).
 *
 * Returns 0.5 if either side has zero assets (neutral, missing data).
 */
export function scoreAssetFit(a: AssetRow[], b: AssetRow[]): number {
    if (!a.length || !b.length) return 0.5;

    // Count assets per canonical type for each side.
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

    // Coverage: union of types either side has, divided by 6.
    const union = new Set<string>([...ca.keys(), ...cb.keys()]);
    const coverage = union.size / CANONICAL_ASSET_TYPES.length;

    // Depth bonus: type where one has 2+ and other has 0.
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

// ─── 5.5 QoL similarity (deterministic) ──────────────────────────────

/**
 * QoL similarity per §5.5.
 * 8-axis euclidean distance, normalized to [0,1] inverse.
 * Two identical vectors score 1.0; maximally divergent score 0.0.
 *
 * Returns 0.5 if either side lacks a QoL snapshot.
 */
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
    // Max possible distance: 8 axes × 7² each = 392 → √392 ≈ 19.8.
    const MAX_DISTANCE = Math.sqrt(8 * 49);
    return Math.max(0, 1 - distance / MAX_DISTANCE);
}

// ─── 5.6 Composition: geometric mean ─────────────────────────────────

/**
 * Geometric mean of four sub-scores × 100.
 * All inputs must be in [0, 1]. Output in [0, 100].
 *
 * If any input is exactly 0, the geometric mean is 0 (mathematically
 * correct — one input at zero means the match has no signal in that
 * dimension). The 0.5 missing-data default in the sub-scorers prevents
 * this from happening accidentally.
 */
export function composeResonance(subScores: SubScores): number {
    const product =
        subScores.topTalent *
        subScores.mission *
        subScores.assets *
        subScores.qol;
    const geomMean = Math.pow(product, 1 / 4);
    return Math.round(geomMean * 100);
}

// ─── 5.2 + 5.3: LLM-judged similarity helpers ────────────────────────

/**
 * Build the deterministic gift-signature string used to feed the
 * Top Talent complementarity LLM judge. Stable shape so the same two
 * profiles always produce the same prompt input.
 */
export function buildGiftSignature(profile: ProfileForMatching): string {
    const parts: string[] = [];
    if (profile.archetype) parts.push(`Archetype: ${profile.archetype}`);
    if (profile.primeDriver) parts.push(`Prime driver: ${profile.primeDriver}`);
    if (profile.topThreeTalents.length) {
        parts.push(`Top three talents: ${profile.topThreeTalents.join(", ")}`);
    }
    return parts.join(" | ") || "(no top-talent data)";
}

/**
 * Top Talent complementarity rubric prompt. Used by the edge function's
 * LLM call. Kept here so the prompt is part of the spec'd algorithm,
 * not buried in the edge function body.
 */
export const TOP_TALENT_RUBRIC_PROMPT = `Rate how complementary these two talent profiles are.

Scale:
0.0 = redundant. They have the same gifts and the same shadows. Pairing them adds no new capability; they would compete or overlap rather than compose.
0.5 = neutral. Their gifts are unrelated. Neither fills the other's gap, but neither competes either.
1.0 = fully complementary. Their gifts compose into a larger whole. One's strength is the other's growth edge; one's shadow is the other's natural domain.

Reply with a single decimal number between 0.0 and 1.0. No explanation, no other text.`;

/**
 * Mission similarity rubric prompt — direction-of-movement check.
 * Cosine on text embedding would be cleaner but requires an embedding
 * endpoint; this LLM-judged path ships now and gets swapped later.
 */
export const MISSION_SIMILARITY_RUBRIC_PROMPT = `Rate how similar the directions these two missions point in.

Scale:
0.0 = opposite directions. One person is moving toward X; the other is moving away from X (or toward something incompatible).
0.5 = orthogonal. Different domains, neither aligned nor opposed.
1.0 = same direction. Both are moving toward the same change in the world, even if framed in different language.

Reply with a single decimal number between 0.0 and 1.0. No explanation, no other text.`;

/**
 * Parse a model response that should be a single decimal number.
 * Defensive against minor formatting noise (whitespace, trailing text).
 * Returns 0.5 (neutral) on parse failure rather than throwing — keeps
 * the matching pipeline resilient to model misbehavior.
 */
export function parseSimilarityScore(raw: string): number {
    if (!raw) return 0.5;
    const match = raw.trim().match(/^([01](?:\.\d+)?|0?\.\d+)/);
    if (!match) return 0.5;
    const n = parseFloat(match[1]);
    if (Number.isNaN(n)) return 0.5;
    return Math.max(0, Math.min(1, n));
}

// ─── Composer for the rationale-writer LLM call ──────────────────────

/**
 * Output JSON shape expected from the rationale-writer model per §5.7.
 * The matching edge function asks the model to return this shape after
 * deterministic scoring is already complete.
 */
export interface RationalePayload {
    matchType: "co-founder" | "collaborator" | "peer" | "mentor" | "client-fit";
    collaborationProposal: string;
    suggestedAction: "intro" | "micro-collab" | "practice-together" | "wait";
    alignment: string;
    complementarity: string;
    friction: string;
}

/**
 * Build the rationale-writer system prompt. Voice contract from §5.7.
 * Sub-scores + actual first names are passed in so the model writes
 * potent, person-specific prose (not "Profile A / Profile B" abstractions).
 */
export function buildRationalePrompt(): string {
    return `You write the human-readable rationale for a pre-scored match between two specific people on a platform that pairs entrepreneurs, advisors, and operators for high-precision collaboration.

You will receive:
- Two named profiles: YOU (the requesting user, addressed in second person) and THEM (the candidate, addressed by their first name)
- Four sub-scores (each 0-1): top_talent_complementarity, mission_similarity, asset_lego_fit, qol_similarity
- The composite resonance score (0-100)

Your job: produce a JSON object with these fields, and ONLY these fields. No prose outside the JSON. No markdown fence.

{
  "matchType": "co-founder" | "collaborator" | "peer" | "mentor" | "client-fit",
  "collaborationProposal": "1-2 sentences. Name a CONCRETE thing they could build or do together — a specific offering, workshop, product, community, or practice. Not abstract ('combine your capacities to create alignment'). Concrete ('co-design a 6-week cohort that takes founders from raw insight to a sellable framework'). Lead with the active verb.",
  "suggestedAction": "intro" | "micro-collab" | "practice-together" | "wait",
  "alignment": "1 sentence on Mission similarity — what direction or value they share. Use their first names, not 'Profile A/B'.",
  "complementarity": "1 sentence on Top Talent + Asset fit — what each brings the other lacks. Use first names.",
  "friction": "1 sentence on potential friction (timing, timezone, stage, language, mission divergence) or the literal string 'None identified' if you see nothing. Use first names when relevant."
}

Voice rules:
- **NEVER use "Profile A", "Profile B", "Person A", "Person B", "the requesting user", or "the candidate".** Always use the actual first names supplied. Address the requesting user in second person ("you", "your"); address the candidate by their first name.
- Editorial register. Direct address.
- No platitudes ("you both have great energy"). No AI-tells ("I detected", "based on the data", "based on what I see"). No buzzwords ("AI-powered", "synergy", "leverage", "actualize", "unlock potential").
- Active voice, present tense. No hedging ("could potentially", "might possibly").
- The collaborationProposal must name a SPECIFIC artifact or activity. Examples that work: "Run a quarterly mastermind for X." "Co-write the playbook on Y." "Launch a free workshop teaching Z together." Examples that don't work: "Combine your skills to create value." "Partner on a project." "Explore a collaboration."
- matchType is a description, not a generator. Pick whichever label best fits the pattern given the sub-scores.

Return ONLY the JSON object.`;
}
