/**
 * scoring.test.ts — Matching algorithm v3 deterministic validation.
 *
 * Day 80 (Sasha 2026-05-22). Tests the deterministic sub-scorers (assets,
 * QoL) and the geometric-mean composition function against the fixture
 * in `../fixture.ts`. LLM-judged sub-scores (top_talent, mission) are
 * NOT covered here — those require integration tests against the live
 * edge function.
 *
 * Run: `npm run test` or `npm run test -- matchScoring`.
 */

import { describe, it, expect } from "vitest";
import {
    scoreAssetFit,
    scoreQolSimilarity,
    composeResonance,
    parseSimilarityScore,
    type SubScores,
} from "../scoring";
import { FIXTURE } from "../fixture";

describe("matching algorithm v3 — deterministic core", () => {
    describe("scoreAssetFit (§5.4)", () => {
        it("returns 0.5 (neutral) when either side has no assets", () => {
            expect(scoreAssetFit([], [{ type_id: "Expertise", title: "x" }])).toBe(0.5);
            expect(scoreAssetFit([{ type_id: "Expertise", title: "x" }], [])).toBe(0.5);
            expect(scoreAssetFit([], [])).toBe(0.5);
        });

        it("scores 0.17 when both sides have only the same single type (1/6 coverage)", () => {
            const score = scoreAssetFit(
                [{ type_id: "Expertise", title: "a" }],
                [{ type_id: "Expertise", title: "b" }],
            );
            expect(score).toBeCloseTo(1 / 6, 2);
        });

        it("scores higher when types are orthogonal (full coverage = 1.0)", () => {
            const a = [
                { type_id: "Expertise", title: "x" },
                { type_id: "Intellectual Property", title: "y" },
                { type_id: "Material Resources", title: "z" },
            ];
            const b = [
                { type_id: "Networks", title: "x" },
                { type_id: "Influence", title: "y" },
                { type_id: "Life Experiences", title: "z" },
            ];
            // Coverage: all 6 types covered → 6/6 = 1.0.
            expect(scoreAssetFit(a, b)).toBe(1.0);
        });

        it("adds depth bonus when one side has 2+ in a type the other lacks", () => {
            const a = [
                { type_id: "Expertise", title: "x" },
                { type_id: "Expertise", title: "y" },
            ];
            const b = [{ type_id: "Networks", title: "z" }];
            // Coverage: 2/6 = 0.333.
            // Depth bonus: A has 2+ in Expertise, B has 0 → +0.10.
            // Total: 0.433.
            expect(scoreAssetFit(a, b)).toBeCloseTo(0.433, 2);
        });

        it("caps depth bonus at +0.40", () => {
            const a = [
                { type_id: "Expertise", title: "1" },
                { type_id: "Expertise", title: "2" },
                { type_id: "Networks", title: "3" },
                { type_id: "Networks", title: "4" },
                { type_id: "Influence", title: "5" },
                { type_id: "Influence", title: "6" },
                { type_id: "Material Resources", title: "7" },
                { type_id: "Material Resources", title: "8" },
                { type_id: "Intellectual Property", title: "9" },
                { type_id: "Intellectual Property", title: "10" },
            ];
            // A has 2+ in five types, B has none → 5 bonuses × 0.10 = 0.50 → capped at 0.40.
            const b = [{ type_id: "Life Experiences", title: "x" }];
            // Coverage: 6/6 = 1.0.
            // Total would be 1.0 + 0.40 (capped from 0.50) = clamped to 1.0.
            expect(scoreAssetFit(a, b)).toBe(1.0);
        });
    });

    describe("scoreQolSimilarity (§5.5)", () => {
        const flat = (n: number) => ({
            health_stage: n,
            wealth_stage: n,
            love_relationships_stage: n,
            social_ties_stage: n,
            growth_stage: n,
            impact_stage: n,
            happiness_stage: n,
            home_stage: n,
        });

        it("returns 1.0 for identical vectors", () => {
            expect(scoreQolSimilarity(flat(5), flat(5))).toBeCloseTo(1.0, 3);
        });

        it("returns 0.0 for maximally divergent vectors (0 vs 7 across all axes)", () => {
            expect(scoreQolSimilarity(flat(0), flat(7))).toBeCloseTo(0.0, 3);
        });

        it("returns 0.5 when either side lacks data", () => {
            expect(scoreQolSimilarity(null, flat(5))).toBe(0.5);
            expect(scoreQolSimilarity(flat(5), null)).toBe(0.5);
            expect(scoreQolSimilarity(null, null)).toBe(0.5);
        });

        it("scores higher for nearby vectors than distant ones", () => {
            const near = scoreQolSimilarity(flat(5), flat(4));
            const far = scoreQolSimilarity(flat(5), flat(0));
            expect(near).toBeGreaterThan(far);
            expect(near).toBeGreaterThan(0.85);
        });
    });

    describe("composeResonance (§5.1)", () => {
        const ss = (tt: number, m: number, a: number, q: number): SubScores => ({
            topTalent: tt,
            mission: m,
            assets: a,
            qol: q,
        });

        it("returns 100 when all sub-scores are 1.0", () => {
            expect(composeResonance(ss(1, 1, 1, 1))).toBe(100);
        });

        it("returns 0 when any sub-score is 0 (multiplicative collapse)", () => {
            expect(composeResonance(ss(0, 1, 1, 1))).toBe(0);
            expect(composeResonance(ss(1, 0, 1, 1))).toBe(0);
        });

        it("returns 50 when all sub-scores are 0.5", () => {
            expect(composeResonance(ss(0.5, 0.5, 0.5, 0.5))).toBe(50);
        });

        it("is gentler than pure multiplicative (one weak input doesn't crater)", () => {
            // (1 × 1 × 1 × 0.5)^(1/4) ≈ 0.841 → 84
            const score = composeResonance(ss(1, 1, 1, 0.5));
            expect(score).toBeGreaterThan(75);
            expect(score).toBeLessThan(90);
        });

        it("rewards balanced over lopsided scoring", () => {
            const balanced = composeResonance(ss(0.7, 0.7, 0.7, 0.7));
            const lopsided = composeResonance(ss(1.0, 1.0, 0.4, 0.4));
            expect(balanced).toBeGreaterThan(lopsided);
        });
    });

    describe("parseSimilarityScore", () => {
        it("parses plain decimals", () => {
            expect(parseSimilarityScore("0.7")).toBe(0.7);
            expect(parseSimilarityScore("0.0")).toBe(0.0);
            expect(parseSimilarityScore("1.0")).toBe(1.0);
        });

        it("handles leading/trailing whitespace + noise", () => {
            expect(parseSimilarityScore("  0.6  ")).toBe(0.6);
            expect(parseSimilarityScore("0.55 (high complementarity)")).toBe(0.55);
        });

        it("clamps to [0,1]", () => {
            expect(parseSimilarityScore("1.5")).toBe(1.0);
            // negative values won't pattern-match → fallback to 0.5.
            expect(parseSimilarityScore("-0.2")).toBe(0.5);
        });

        it("returns 0.5 (neutral) on parse failure", () => {
            expect(parseSimilarityScore("")).toBe(0.5);
            expect(parseSimilarityScore("not a number")).toBe(0.5);
            expect(parseSimilarityScore("NaN")).toBe(0.5);
        });
    });

    describe("end-to-end fixture validation", () => {
        // Each pair's deterministic sub-scores (assets + qol) and the
        // composite resonance (assuming the LLM sub-scores land in the
        // fixture's expected band midpoint) must fall in the labeled range.
        for (const pair of FIXTURE) {
            it(`pair "${pair.name}" — assets + qol sub-scores match fixture expectations`, () => {
                const assets = scoreAssetFit(pair.a.assets, pair.b.assets);
                const qol = scoreQolSimilarity(pair.a.qol, pair.b.qol);

                if (pair.expectedSubScores?.assets) {
                    expect(assets).toBeGreaterThanOrEqual(pair.expectedSubScores.assets.min);
                    expect(assets).toBeLessThanOrEqual(pair.expectedSubScores.assets.max);
                }
                if (pair.expectedSubScores?.qol) {
                    expect(qol).toBeGreaterThanOrEqual(pair.expectedSubScores.qol.min);
                    expect(qol).toBeLessThanOrEqual(pair.expectedSubScores.qol.max);
                }
            });

            it(`pair "${pair.name}" — composite at fixture-band midpoint stays in expected range`, () => {
                // Simulate LLM sub-scores at the band midpoint (most charitable
                // hypothesis), then check that composing with deterministic
                // assets + qol lands the composite in the labeled band.
                const ttBand = pair.expectedSubScores?.topTalent;
                const mBand = pair.expectedSubScores?.mission;
                const tt = ttBand ? (ttBand.min + ttBand.max) / 2 : 0.5;
                const mission = mBand ? (mBand.min + mBand.max) / 2 : 0.5;
                const assets = scoreAssetFit(pair.a.assets, pair.b.assets);
                const qol = scoreQolSimilarity(pair.a.qol, pair.b.qol);

                const composite = composeResonance({
                    topTalent: tt,
                    mission,
                    assets,
                    qol,
                });
                expect(composite).toBeGreaterThanOrEqual(pair.expectedResonance.min);
                expect(composite).toBeLessThanOrEqual(pair.expectedResonance.max);
            });
        }
    });
});
