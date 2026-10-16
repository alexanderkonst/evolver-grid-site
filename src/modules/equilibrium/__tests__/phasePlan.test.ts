/**
 * Phase-aware readiness tests (issue #63).
 *
 * Covers the three guarantees of the readiness model:
 *   1. Every layer's due-position is derived from PHASE_PLAN and matches
 *      the issue's source-of-truth table.
 *   2. Readiness per phase: not-due (·) before the write phase, due-empty
 *      (!) from the write phase onward, for each of the 8 phases.
 *   3. The edge case Sasha called out: a layer filled EARLY reads ✓
 *      (filled), never due-empty — content always wins.
 */

import { describe, expect, it } from "vitest";
import { getLunarState } from "@/lib/equilibrium-cycles";
import {
  EQ_LAYER_KEYS,
  EQ_LAYERS,
  PHASE_PLAN,
  computeLayerReadiness,
  computePhaseReadiness,
  nextPhase,
  phaseByLunarIndex,
  phaseByPosition,
  semanticPositionFromLunarIndex,
  type EqLayerKey,
} from "../phasePlan";

const NONE: Record<EqLayerKey, boolean> = {
  focus: false,
  strategies: false,
  workstreams: false,
  tasks: false,
  doNow: false,
};
const ALL: Record<EqLayerKey, boolean> = {
  focus: true,
  strategies: true,
  workstreams: true,
  tasks: true,
  doNow: true,
};

describe("PHASE_PLAN config", () => {
  it("has the 8 phases in Sasha's cycle order 1-8", () => {
    expect(PHASE_PLAN.map((p) => p.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(PHASE_PLAN.map((p) => p.name)).toEqual([
      "Planning",
      "Planting",
      "Clearing",
      "Gathering",
      "Seeing",
      "Leading",
      "Harvesting",
      "Celebrating",
    ]);
  });

  it("anchors each phase to a unique astronomical index", () => {
    const indices = PHASE_PLAN.map((p) => p.astronomicalIndex).sort((a, b) => a - b);
    expect(indices).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  it("derives layer due-positions straight from the source-of-truth table", () => {
    expect(EQ_LAYERS.focus.dueAtPosition).toBe(1); // Planning
    expect(EQ_LAYERS.strategies.dueAtPosition).toBe(2); // Planting
    expect(EQ_LAYERS.workstreams.dueAtPosition).toBe(5); // Seeing
    expect(EQ_LAYERS.tasks.dueAtPosition).toBe(5); // Seeing
    expect(EQ_LAYERS.doNow.dueAtPosition).toBe(7); // Harvesting
  });

  it("names the write-phase for each layer", () => {
    expect(EQ_LAYERS.focus.dueAtPhase).toBe("Planning");
    expect(EQ_LAYERS.strategies.dueAtPhase).toBe("Planting");
    expect(EQ_LAYERS.workstreams.dueAtPhase).toBe("Seeing");
    expect(EQ_LAYERS.tasks.dueAtPhase).toBe("Seeing");
    expect(EQ_LAYERS.doNow.dueAtPhase).toBe("Harvesting");
  });
});

describe("semanticPositionFromLunarIndex", () => {
  // Astronomical index → semantic position (closed form documented in phasePlan).
  const cases: Array<[number, number, string]> = [
    [0, 3, "Clearing"], // New Moon
    [1, 4, "Gathering"], // Waxing Crescent
    [2, 5, "Seeing"], // First Quarter
    [3, 6, "Leading"], // Waxing Gibbous
    [4, 7, "Harvesting"], // Full Moon
    [5, 8, "Celebrating"], // Waning Gibbous
    [6, 1, "Planning"], // Last Quarter
    [7, 2, "Planting"], // Waning Crescent
  ];
  it.each(cases)("index %i → position %i (%s)", (idx, pos, name) => {
    expect(semanticPositionFromLunarIndex(idx)).toBe(pos);
    expect(phaseByLunarIndex(idx).name).toBe(name);
  });

  it("agrees with the live lunar math's segment index", () => {
    // Whatever phase we're in right now, mapping the segment index must
    // land on a valid 1-8 position with a matching moon name.
    const { segmentIndex } = getLunarState(Date.now());
    const phase = phaseByLunarIndex(segmentIndex);
    expect(phase.position).toBeGreaterThanOrEqual(1);
    expect(phase.position).toBeLessThanOrEqual(8);
    expect(phase.astronomicalIndex).toBe(segmentIndex);
  });
});

describe("computeLayerReadiness — due transitions per layer", () => {
  // For each layer, walk all 8 positions with nothing filled: positions
  // before the write-phase read not_due; from the write-phase onward
  // read due_empty.
  it.each([...EQ_LAYER_KEYS])("layer %s flips not_due → due_empty at its due position", (layer) => {
    const dueAt = EQ_LAYERS[layer].dueAtPosition;
    for (let pos = 1; pos <= 8; pos++) {
      const state = computeLayerReadiness(pos, layer, false);
      expect(state).toBe(pos >= dueAt ? "due_empty" : "not_due");
    }
  });

  it("keeps Moon Focus due in every phase (due at Planning, position 1)", () => {
    for (let pos = 1; pos <= 8; pos++) {
      expect(computeLayerReadiness(pos, "focus", false)).toBe("due_empty");
    }
  });
});

describe("computeLayerReadiness — filled-early edge case", () => {
  it("reads ✓ (filled) even before the layer's due phase", () => {
    // DO NOW is due at Harvesting (7). Filled during Clearing (3) → ✓.
    expect(computeLayerReadiness(3, "doNow", true)).toBe("filled");
    // Workstreams due at Seeing (5). Filled during Planting (2) → ✓.
    expect(computeLayerReadiness(2, "workstreams", true)).toBe("filled");
  });

  it("filled always wins over due_empty", () => {
    for (let pos = 1; pos <= 8; pos++) {
      for (const layer of EQ_LAYER_KEYS) {
        expect(computeLayerReadiness(pos, layer, true)).toBe("filled");
      }
    }
  });
});

describe("computePhaseReadiness — snapshot per phase, nothing filled", () => {
  it("Clearing (3): only Focus + Strategies are due; the rest wait", () => {
    const r = computePhaseReadiness(3, NONE);
    expect(r).toEqual({
      focus: "due_empty",
      strategies: "due_empty",
      workstreams: "not_due",
      tasks: "not_due",
      doNow: "not_due",
    });
  });

  it("Seeing (5): Workstreams + Tasks join the due set", () => {
    const r = computePhaseReadiness(5, NONE);
    expect(r).toEqual({
      focus: "due_empty",
      strategies: "due_empty",
      workstreams: "due_empty",
      tasks: "due_empty",
      doNow: "not_due",
    });
  });

  it("Harvesting (7): everything is due", () => {
    const r = computePhaseReadiness(7, NONE);
    for (const layer of EQ_LAYER_KEYS) expect(r[layer]).toBe("due_empty");
  });

  it("Planning (1): only Focus is due", () => {
    const r = computePhaseReadiness(1, NONE);
    expect(r.focus).toBe("due_empty");
    expect(r.strategies).toBe("not_due");
    expect(r.workstreams).toBe("not_due");
    expect(r.tasks).toBe("not_due");
    expect(r.doNow).toBe("not_due");
  });
});

describe("computePhaseReadiness — everything filled is all ✓", () => {
  it.each([1, 2, 3, 4, 5, 6, 7, 8])("position %i → all filled", (pos) => {
    const r = computePhaseReadiness(pos, ALL);
    for (const layer of EQ_LAYER_KEYS) expect(r[layer]).toBe("filled");
  });
});

describe("phaseByPosition / nextPhase", () => {
  it("resolves every position and wraps 8 → 1", () => {
    expect(phaseByPosition(5).name).toBe("Seeing");
    expect(nextPhase(5).name).toBe("Leading");
    expect(nextPhase(8).name).toBe("Planning");
    expect(nextPhase(1).name).toBe("Planting");
  });
});
