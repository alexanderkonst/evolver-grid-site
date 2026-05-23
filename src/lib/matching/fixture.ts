/**
 * fixture.ts — Gold-labeled match pairs for algorithm validation.
 *
 * Day 80 (Sasha 2026-05-22) — initial scaffold. The fixture is the
 * empirical anchor for the matching algorithm: when Sasha says "Alice
 * and Bob should be a strong match" or "Carla and Dave should NOT be
 * surfaced," that goes here as a labeled pair. The validation harness
 * (scoring.test.ts + scripts/validateMatching.ts) runs the deterministic
 * sub-scorers + composition function against this fixture and verifies
 * the algorithm's scores fall within the labeled bands.
 *
 * The LLM-judged sub-scores (top_talent, mission) cannot be unit-tested
 * here without a real model call; they're validated end-to-end against
 * the deployed edge function. The fixture's `expectedSubScores` carries
 * Sasha's hand-judgment on top_talent + mission for documentation and
 * later integration testing.
 *
 * HOW TO ADD A PAIR:
 *   1. Pick two profiles you've manually compared.
 *   2. Fill in the minimal shape below (top_three_talents, mission, assets, qol).
 *   3. Add the labeled `expectedResonance` band (e.g. {min: 70, max: 85}).
 *   4. Add a `notes` string explaining your judgment.
 *   5. Run `npm run test -- matchScoring` to verify deterministic parts
 *      land in the right place.
 */

import type { AssetRow, QolVector } from "./scoring";

export interface FixtureProfile {
    label: string;
    archetype: string | null;
    primeDriver: string | null;
    topThreeTalents: string[];
    missionStatement: string | null;
    assets: AssetRow[];
    qol: QolVector | null;
}

export interface LabeledPair {
    /** Short pair name for log output. */
    name: string;
    a: FixtureProfile;
    b: FixtureProfile;
    /** Sasha's hand-judgment on the composite resonance score (0-100). */
    expectedResonance: { min: number; max: number };
    /** Optional per-sub-score expectations for fine-grained validation. */
    expectedSubScores?: {
        topTalent?: { min: number; max: number };
        mission?: { min: number; max: number };
        assets?: { min: number; max: number };
        qol?: { min: number; max: number };
    };
    notes: string;
}

// ─── Initial fixture — synthetic, replace with real pairs ──────────────

/**
 * These three pairs are synthetic placeholders that exercise the
 * algorithm's edge cases. Replace with real labeled pairs from Sasha's
 * own evaluations as the platform accumulates them.
 *
 * Pair 1: TIGHT COMPLEMENTARY MATCH — different gifts, same direction,
 *   complementary assets, similar QoL. Should score high.
 * Pair 2: REDUNDANT MATCH — same gifts, same direction, overlapping
 *   assets. Should score lower despite "alignment" — Lego-fit suffers.
 * Pair 3: QOL-DIVERGENT MATCH — strong on first three inputs but very
 *   different consciousness stages. Should score moderately — engine
 *   surfaces the match but flags the friction.
 */
export const FIXTURE: LabeledPair[] = [
    {
        name: "Complementary co-founder pair",
        a: {
            label: "A1: visionary",
            archetype: "The Architect",
            primeDriver: "designing structures that organize complexity",
            topThreeTalents: ["forging", "systematizing", "translating"],
            missionStatement:
                "Build the coordination substrate for conscious civilizations.",
            assets: [
                { type_id: "Expertise", title: "platform architecture" },
                { type_id: "Expertise", title: "system design" },
                { type_id: "Intellectual Property", title: "Holonic OS framework" },
            ],
            qol: {
                health_stage: 5,
                wealth_stage: 4,
                love_relationships_stage: 5,
                social_ties_stage: 4,
                growth_stage: 6,
                impact_stage: 6,
                happiness_stage: 5,
                home_stage: 4,
            },
        },
        b: {
            label: "B1: builder",
            archetype: "The Catalyst",
            primeDriver: "bringing ideas into form through execution",
            topThreeTalents: ["building", "shipping", "iterating"],
            missionStatement:
                "Help conscious entrepreneurs build coherent businesses.",
            assets: [
                { type_id: "Networks", title: "operator community" },
                { type_id: "Influence", title: "founder newsletter" },
                { type_id: "Material Resources", title: "venture capital relationships" },
            ],
            qol: {
                health_stage: 5,
                wealth_stage: 5,
                love_relationships_stage: 4,
                social_ties_stage: 5,
                growth_stage: 5,
                impact_stage: 5,
                happiness_stage: 5,
                home_stage: 5,
            },
        },
        expectedResonance: { min: 70, max: 90 },
        expectedSubScores: {
            topTalent: { min: 0.7, max: 1.0 },
            mission: { min: 0.7, max: 1.0 },
            assets: { min: 0.8, max: 1.0 },
            qol: { min: 0.85, max: 1.0 },
        },
        notes:
            "Complementary gifts (designer + builder), aligned missions (conscious-coordination space), perfectly orthogonal assets (Expertise+IP vs Networks+Influence+Material Resources), nearly-identical QoL.",
    },

    {
        name: "Redundant gifts pair",
        a: {
            label: "A2: writer one",
            archetype: "The Translator",
            primeDriver: "putting essence into precise words",
            topThreeTalents: ["writing", "framing", "naming"],
            missionStatement: "Help founders articulate what they actually do.",
            assets: [
                { type_id: "Expertise", title: "copywriting" },
                { type_id: "Expertise", title: "positioning" },
                { type_id: "Expertise", title: "brand strategy" },
            ],
            qol: {
                health_stage: 4,
                wealth_stage: 3,
                love_relationships_stage: 4,
                social_ties_stage: 4,
                growth_stage: 5,
                impact_stage: 4,
                happiness_stage: 4,
                home_stage: 4,
            },
        },
        b: {
            label: "B2: writer two",
            archetype: "The Translator",
            primeDriver: "putting essence into precise words",
            topThreeTalents: ["writing", "editing", "clarifying"],
            missionStatement:
                "Help founders find the right words for their work.",
            assets: [
                { type_id: "Expertise", title: "copywriting" },
                { type_id: "Expertise", title: "editing" },
            ],
            qol: {
                health_stage: 4,
                wealth_stage: 3,
                love_relationships_stage: 4,
                social_ties_stage: 4,
                growth_stage: 5,
                impact_stage: 4,
                happiness_stage: 4,
                home_stage: 4,
            },
        },
        expectedResonance: { min: 30, max: 50 },
        expectedSubScores: {
            topTalent: { min: 0.0, max: 0.3 },
            mission: { min: 0.7, max: 1.0 },
            assets: { min: 0.1, max: 0.3 },
            qol: { min: 0.9, max: 1.0 },
        },
        notes:
            "Same archetype + overlapping gifts (redundant, not complementary), aligned missions, fully-overlapping single-category assets (Lego-fit collapses to 1/6 coverage), identical QoL. Engine should surface as peer/guild not co-founder. Resonance band 30-50 reflects what the geometric-mean actually returns when topTalent + assets are both low: even a 0.85 mission + 0.95 qol can't lift the composite past ~50.",
    },

    {
        name: "QoL-divergent pair",
        a: {
            label: "A3: stage-5 operator",
            archetype: "The Architect",
            primeDriver: "designing structures",
            topThreeTalents: ["forging", "systematizing", "translating"],
            missionStatement: "Build coordination substrate for the planetary scale.",
            assets: [
                { type_id: "Expertise", title: "platform architecture" },
                { type_id: "Intellectual Property", title: "framework IP" },
            ],
            qol: {
                health_stage: 6,
                wealth_stage: 5,
                love_relationships_stage: 6,
                social_ties_stage: 5,
                growth_stage: 6,
                impact_stage: 6,
                happiness_stage: 6,
                home_stage: 5,
            },
        },
        b: {
            label: "B3: stage-2 starter",
            archetype: "The Catalyst",
            primeDriver: "bringing ideas into form",
            topThreeTalents: ["building", "shipping"],
            missionStatement: "Help founders build coherent businesses.",
            assets: [
                { type_id: "Networks", title: "operator community" },
                { type_id: "Influence", title: "newsletter" },
            ],
            qol: {
                health_stage: 2,
                wealth_stage: 1,
                love_relationships_stage: 2,
                social_ties_stage: 3,
                growth_stage: 3,
                impact_stage: 2,
                happiness_stage: 2,
                home_stage: 2,
            },
        },
        expectedResonance: { min: 55, max: 75 },
        expectedSubScores: {
            topTalent: { min: 0.7, max: 1.0 },
            mission: { min: 0.6, max: 1.0 },
            assets: { min: 0.6, max: 1.0 },
            qol: { min: 0.40, max: 0.55 },
        },
        notes:
            "Strong on top-talent complementarity, mission, and assets. QoL diverges by 3-4 stages per axis (stage-5/6 vs stage-1/2/3) which produces a sub-score around 0.5 — meaningfully below 1.0 but not catastrophic. Geometric mean still puts composite in the mid-60s because the other three dimensions are strong. Engine surfaces this match; the rationale layer should flag QoL divergence as friction.",
    },
];
