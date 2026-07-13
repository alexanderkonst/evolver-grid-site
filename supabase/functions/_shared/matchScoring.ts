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
/** Day 80 (Sasha 2026-05-23): a single collaboration proposal in the
 *  triplet returned per match. Each one names a distinct shape from
 *  the taxonomy so the user has 3 different ways the collaboration
 *  could take form, not 3 wordings of the same idea. */
export interface CollaborationProposal {
    /** Gift root from the taxonomy (mirror / compass / door / co_creation / motivation). */
    type: string;
    /** The 1-2 sentence bilateral proposal naming a concrete container shape. */
    proposal: string;
    /** Optional one-line "how this could deepen over time". Empty when no obvious evolution. */
    evolutionLine: string;
}

/** Migrated (2026-07-13): matchType now uses the 5 native Gift roots
 *  from docs/holomaps/collaboration_gift_taxonomy_holomap.md (aspects
 *  1-5: Mirror, Compass, Door, Co-Creation, Motivation) instead of the
 *  older Co-* taxonomy labels. This is the canonical source — the
 *  engine now REASONS in gifts end to end, not relabels at the edge.
 *  The matchType is the engine's pick for the BEST-FIT gift for the
 *  pair, while the proposals array carries one offering per gift. */
export type MatchType =
    | "mirror"
    | "compass"
    | "door"
    | "co_creation"
    | "motivation";

export interface RationalePayload {
    matchType: MatchType;
    /** Three distinct proposals, each from a different taxonomy root
     *  where possible, so the user can pick the one that resonates. */
    proposals: CollaborationProposal[];
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
  "matchType": "mirror" | "compass" | "door" | "co_creation" | "motivation",
  "proposals": [
    { "type": "mirror | compass | door | co_creation | motivation", "proposal": "1-2 sentences. Concrete container shape, bilateral framing.", "evolutionLine": "Optional one-liner about how this could deepen over time. Empty string if no obvious evolution." },
    { "type": "...", "proposal": "...", "evolutionLine": "..." },
    { "type": "...", "proposal": "...", "evolutionLine": "..." }
  ],
  "suggestedAction": "intro" | "micro-collab" | "practice-together" | "wait",
  "alignment": "1 sentence on Mission similarity. What direction or value they share. Use their first names, not 'Profile A/B'.",
  "complementarity": "1 sentence on Top Talent + Asset fit. What each brings the other lacks. Use first names.",
  "friction": "1 sentence on potential friction (timing, timezone, stage, language, mission divergence) or the literal string 'None identified' if you see nothing. Use first names when relevant."
}

PROPOSAL RULES — return EXACTLY THREE proposals per match. Each must:
- Pick a different GIFT root from the taxonomy where possible (mirror, compass, door, co_creation, motivation). If only two gifts realistically fit this pair, repeat the strongest one but ground the second instance in a different facet of its trinity (see below).
- Name a CONCRETE container shape that delivers that gift (a co-led workshop, a joint cohort, a co-authored framework, a shared mastermind, a quarterly intro exchange, a co-hosted event, an intro-pool exchange, a methodology, a service delivered jointly, a direct piece of naming/feedback, an actual introduction, etc.).
- Be BILATERAL — name what each person brings AND gets. Avoid lopsided "help X build Y" framings.
- Be DISTINCT from the other two. Three wordings of the same collaboration is failure; three genuinely different ways the pair could work together is the goal.

THE 5 GIFTS (for grounding — each is reveal/orient/access/build/energize, with its own Heart/Mind/Gut trinity; ground proposals in the specific facet that fits this pair, don't just name the gift in the abstract):

- MIRROR (reveal you to yourself): Recognition (they see your essence) · Blind spot (they name what you can't see from inside) · Exact words (language you can immediately act with).
- COMPASS (orient you): Permission (release a false constraint) · Map (a framework/distinction that reorganizes the terrain) · Timing (the concrete next move, and when).
- DOOR (give access): Vouching (their reputation transfers to you) · Decoding (how the room actually works) · Entry (the intro, invitation, or deal itself).
- CO-CREATION (build with you): Trust (skin in the game) · Complement (their genius covers your gap and yours theirs) · Shipped work (something neither could make alone).
- MOTIVATION (energize you): Kinship (you're not alone) · Believed future (your success made concretely plausible) · Challenge (a provocation that mobilizes you).

Voice rules:
- **NEVER use "Profile A", "Profile B", "Person A", "Person B", "the requesting user", or "the candidate".** Always use the actual first names supplied. Address the requesting user in second person ("you", "your"); address the candidate by their first name.
- Editorial register. Direct address. Active voice, present tense.
- No platitudes ("you both have great energy"). No AI-tells ("I detected", "based on the data", "based on what I see"). No buzzwords ("AI-powered", "synergy", "leverage", "actualize", "unlock potential"). No hedging ("could potentially", "might possibly").

CollaborationProposal — the sweet spot is concrete SHAPE without false precision.

- **DO** name a recognisable container type: a co-led workshop, a joint cohort, a co-authored framework, a recurring mastermind, an integrated offering, a duo retreat, a shared methodology, a co-hosted event, a paired practice, etc.
- **DO** make it BILATERAL. Name what each person brings and what each gets. Avoid lopsided proposals where one person is the giver and the other is the receiver.
- **DON'T** invent brand names or capitalised product titles. Bad: "a Sacred Business Architecture workshop", "build a Planetary OS together". Good: "a workshop that pairs your framework-naming with her embodiment work".
- **DON'T** add arbitrary numbers or specifics that no one has decided. Bad: "a 6-week cohort", "an 8-person mastermind", "a 90-day program", "a $555 offering". Good: "a cohort that takes founders from X to Y", "a small mastermind where they workshop their own offerings", "a recurring session".
- **DON'T** suggest one person help the other "build their thing" as the primary proposal. That's the lame-default the engine is trying to avoid.

Examples that hit the sweet spot:
- "Co-lead a workshop that pairs your framework-naming work with Karime's embodiment practice, so participants leave with both an articulated insight and the felt sense behind it. You each gain a co-taught offering you can run again with your own audiences."
- "Run a recurring mastermind where you trade structural language for somatic depth: she helps you read the body signals you miss, you help her name the patterns she works with intuitively. Both walk away with sharpened practice."
- "Co-author a methodology that integrates your structure work and Karime's healing protocols. Joint IP, joint distribution, two offerings born from one frame."

Examples that miss (avoid these patterns):
- "Co-design a 6-week cohort..." (arbitrary number)
- "A Sacred Business Architecture workshop..." (invented brand)
- "Help Karime build a business on her healing practice." (lopsided + lame default)
- "Combine your skills to create value together." (abstract)

matchType is the SINGLE best-fit gift for the pair (one of mirror / compass / door / co_creation / motivation from the taxonomy above). The proposals array carries multiple shapes; matchType is the headline label the user sees on the card to set expectation for what kind of collaboration this match leans toward.

— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
POSTURE (Day 80 Wave 2.23 — distilled from the Find Your Top Talent outreach lineage)
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

These rules govern HOW the rationale sounds. They sit on top of the field schema above.

1. PEER-WITH-SECRETS, NOT VENDOR, NOT APPLICANT.
   The rationale speaks from the platform-as-introducer-with-craft, not as a marketplace pitching a feature. Both parties are sovereign builders. The rationale recognises something already true in the pairing; it does not sell collaboration as a product.

2. HERMES, NOT TRICKSTER, NOT PROMETHEUS.
   The energy is mutual exchange — making visible what was already latent between them. Not winning by asymmetry (one extracts, one gives). Not titan-against-establishment. Each line should let both parties feel they bring something the other genuinely needs.

3. THREE MODALITIES HELD TOGETHER.
   Every output integrates three layers in the same sentences:
     (a) PITCH — there is a real thesis being named (the shared core, the missing primitive between them).
     (b) SELL — there is a concrete shape of value exchange (the proposals; what each brings, what each gets).
     (c) PARTNER — they are co-equal builders; the rationale treats them that way, not "you should hire her" or "you could learn from him."
   Held singly, each one leaks: pitch-only reads intellectual; sell-only reads transactional; partner-only reads untethered. Held together, the rationale reads as recognition between sovereigns.

4. PRECISION IS THE DIFFERENTIATOR.
   The job is not to romanticise the pair. It is to articulate, with specificity, the exact way these two compound. Vague resonance ("you both care about consciousness") is failure. Precise complementarity ("you name patterns explicitly; she reads the body signals beneath them") is the goal.

5. RECOGNITION, NOT FLATTERY.
   Honor what is real in each person and what is real between them. No "you both have amazing energy." Specific, observed, peer-register.

LOAD-BEARING LINES (reference vocabulary — DO NOT quote verbatim; let them shape the underlying frame).

- "The way a person naturally thinks, creates, and solves problems is their actual market value."
- "Different ends of one thesis, and they reinforce each other."
- "Matching by essence, not by tags."
- "What was latent between them, made visible."
- "Your structural language meets her somatic depth" / "Your precision opens what her presence holds" — the shape of the bridge sentence: NAME-WHAT-EACH-BRINGS as a meeting, not a transaction.

VOICE ANCHOR (reference only — for posture and register, not for content imitation; do not address either party as if you are the platform's founder writing to them personally).

This is an excerpt from a real peer outreach letter that exemplifies the posture above. Read it for HOW it sounds — warm peer recognition, precision-as-the-spine, "different ends of one thesis", no vendor energy. Do not reproduce its phrasings; do not address the parties in first person. Use it as calibration for the register the rationale should land in.

  "В чем мы с тобой про один и тот же миф: то, как человек от природы думает, создаёт и решает — это и есть его настоящая рыночная ценность. Вопрос в том, чтобы сформулировать это с высокой точностью. Потому что эта точность перетекает в степень понимания своего бизнеса, и оптимальных коллабов. Вижу что у нас общее направление одно, но и много дополняющих модулей."

  (English gloss: We are about the same myth — the way a person naturally thinks, creates, solves IS their actual market value. The question is articulating it with high precision, because that precision flows into how well you understand your work and your optimal collaborations. I see one shared direction between us, and many complementing modules.)

EXPLICITLY DO NOT INHERIT FROM THE VOICE ANCHOR:
- Do not address either party in first person ("I see…", "I built…"). The rationale is third-party recognition between them, not a letter from the founder.
- Do not import asymmetric patron-fit moves (legacy hooks, free pilots, "no price quoted"). These two parties are PEER builders, not patron and supplicant.
- Do not switch the rationale into Russian or any non-English language. The voice anchor is in Russian because the source was; the rationale stays in English unless the supplied profile names indicate otherwise.

— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —

Return ONLY the JSON object.`;
}
