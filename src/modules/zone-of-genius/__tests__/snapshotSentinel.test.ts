import { describe, it, expect } from "vitest";
import { SNAPSHOT_PENDING_SENTINEL, hasRealArchetype } from "../snapshotSentinel";

describe("ZoG snapshot sentinel", () => {
    it("sentinel value matches the seeded placeholder", () => {
        // If this ever changes, getOrCreateSnapshot in saveToDatabase.ts
        // and every reader must move together — that's the whole point of
        // centralizing it.
        expect(SNAPSHOT_PENDING_SENTINEL).toBe("Pending");
    });

    describe("hasRealArchetype", () => {
        // Regression: a freshly-seeded row carries archetype_title="Pending"
        // until the Appleseed generation persists. Before the fix, the
        // Overview fallback treated "Pending" as a real archetype and leaked
        // "Pending / I pending" into the hero. The guard must return false so
        // the empty-state CTA renders instead.
        it("rejects the Pending sentinel", () => {
            expect(hasRealArchetype("Pending")).toBe(false);
        });

        it("rejects the sentinel with surrounding whitespace", () => {
            expect(hasRealArchetype("  Pending  ")).toBe(false);
        });

        it("rejects null / undefined / blank", () => {
            expect(hasRealArchetype(null)).toBe(false);
            expect(hasRealArchetype(undefined)).toBe(false);
            expect(hasRealArchetype("")).toBe(false);
            expect(hasRealArchetype("   ")).toBe(false);
        });

        it("accepts a real archetype name", () => {
            expect(hasRealArchetype("Signal-to-Form Forging")).toBe(true);
            expect(hasRealArchetype("Hidden-Value Revealer")).toBe(true);
        });
    });
});
