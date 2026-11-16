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
  EQ_JOURNAL_LAYER_KEYS,
  EQ_LAYER_KEYS,
  EQ_LAYERS,
  PHASE_PLAN,
  computeLayerReadiness,
  computePhaseReadiness,
  cycleStartMs,
  isJournalLayer,
  nextPhase,
  phaseByLunarIndex,
  phaseByPosition,
  phasePromptForPosition,
  semanticPositionFromLunarIndex,
  type EqLayerKey,
} from "../phasePlan";

const NONE: Record<EqLayerKey, boolean> = {
  focus: false,
  strategies: false,
  clearing: false,
  resources: false,
  workstreams: false,
  tasks: false,
  doNow: false,
  celebration: false,
};
const ALL: Record<EqLayerKey, boolean> = {
  focus: true,
  strategies: true,
  clearing: true,
  resources: true,
  workstreams: true,
  tasks: true,
  doNow: true,
  celebration: true,
};

/** The five layers that can read "due but empty" (everything but the journal). */
const CORE_LAYER_KEYS = EQ_LAYER_KEYS.filter((k) => !isJournalLayer(k));

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
    expect(EQ_LAYERS.clearing.dueAtPosition).toBe(3); // Clearing
    expect(EQ_LAYERS.resources.dueAtPosition).toBe(4); // Gathering
    expect(EQ_LAYERS.celebration.dueAtPosition).toBe(8); // Celebrating
  });

  it("gives Clearing, Gathering and Celebrating a journal write surface", () => {
    expect(phaseByPosition(3).writes).toEqual(["clearing"]);
    expect(phaseByPosition(4).writes).toEqual(["resources"]);
    expect(phaseByPosition(8).writes).toEqual(["celebration"]);
    expect([...EQ_JOURNAL_LAYER_KEYS]).toEqual(["clearing", "resources", "celebration"]);
  });

  it("uses the agreed copy for the three journal phases", () => {
    expect(phaseByPosition(3).asks).toBe("Name what's clearing. One line each; no need to fix it.");
    expect(phaseByPosition(4).asks).toBe(
      "Say yes. Note every resource that arrives: money, people, calls, offers, information.",
    );
    expect(phaseByPosition(8).asks).toBe(
      "Name what ripened and what you celebrate, then clear spent tasks.",
    );
    // The trap stays.
    expect(phaseByPosition(3).trap).toContain("Don't invent");
  });

  it("names the write-phase for each layer", () => {
    expect(EQ_LAYERS.focus.dueAtPhase).toBe("Planning");
    expect(EQ_LAYERS.strategies.dueAtPhase).toBe("Planting");
    expect(EQ_LAYERS.workstreams.dueAtPhase).toBe("Seeing");
    expect(EQ_LAYERS.tasks.dueAtPhase).toBe("Seeing");
    expect(EQ_LAYERS.doNow.dueAtPhase).toBe("Harvesting");
    expect(EQ_LAYERS.clearing.dueAtPhase).toBe("Clearing");
    expect(EQ_LAYERS.resources.dueAtPhase).toBe("Gathering");
    expect(EQ_LAYERS.celebration.dueAtPhase).toBe("Celebrating");
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
  it.each([...CORE_LAYER_KEYS])("layer %s flips not_due → due_empty at its due position", (layer) => {
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

describe("computeLayerReadiness — journal layers are never amber", () => {
  it.each([...EQ_JOURNAL_LAYER_KEYS])("%s is never due_empty in any phase", (layer) => {
    for (let pos = 1; pos <= 8; pos++) {
      expect(computeLayerReadiness(pos, layer, false)).toBe("not_due");
    }
  });

  it.each([...EQ_JOURNAL_LAYER_KEYS])("%s reads filled once something is written, in any phase", (layer) => {
    for (let pos = 1; pos <= 8; pos++) {
      expect(computeLayerReadiness(pos, layer, true)).toBe("filled");
    }
  });

  it("no phase marks any journal layer due_empty, nothing filled", () => {
    for (let pos = 1; pos <= 8; pos++) {
      const r = computePhaseReadiness(pos, NONE);
      for (const layer of EQ_JOURNAL_LAYER_KEYS) expect(r[layer]).not.toBe("due_empty");
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
      clearing: "not_due",
      resources: "not_due",
      workstreams: "not_due",
      tasks: "not_due",
      doNow: "not_due",
      celebration: "not_due",
    });
  });

  it("Seeing (5): Workstreams + Tasks join the due set", () => {
    const r = computePhaseReadiness(5, NONE);
    expect(r).toEqual({
      focus: "due_empty",
      strategies: "due_empty",
      clearing: "not_due",
      resources: "not_due",
      workstreams: "due_empty",
      tasks: "due_empty",
      doNow: "not_due",
      celebration: "not_due",
    });
  });

  it("Harvesting (7): every core layer is due; the journal stays calm", () => {
    const r = computePhaseReadiness(7, NONE);
    for (const layer of CORE_LAYER_KEYS) expect(r[layer]).toBe("due_empty");
    for (const layer of EQ_JOURNAL_LAYER_KEYS) expect(r[layer]).toBe("not_due");
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

describe("phasePromptForPosition — exactly one prompt per phase", () => {
  it("offers a quick journal input in Clearing, Gathering and Celebrating", () => {
    expect(phasePromptForPosition(3)).toMatchObject({ type: "entry", kind: "clearing" });
    expect(phasePromptForPosition(4)).toMatchObject({ type: "entry", kind: "resource" });
    expect(phasePromptForPosition(8)).toMatchObject({ type: "entry", kind: "celebration" });
  });

  it("speaks in the phase's voice", () => {
    const gathering = phasePromptForPosition(4);
    expect(gathering.type === "entry" && gathering.placeholder).toBe("A resource that arrived…");
  });

  it("links to the existing editor in Planning, Planting and Seeing (no duplicate editors)", () => {
    expect(phasePromptForPosition(1)).toMatchObject({ type: "jump", target: "focus" });
    expect(phasePromptForPosition(2)).toMatchObject({ type: "jump", target: "strategies" });
    expect(phasePromptForPosition(5)).toMatchObject({ type: "jump", target: "workstreams" });
  });

  it("points Prep for Harvest at tasks and Harvesting at DO NOW", () => {
    expect(phasePromptForPosition(6)).toMatchObject({ type: "jump", target: "tasks" });
    expect(phasePromptForPosition(7)).toMatchObject({ type: "jump", target: "doNow" });
  });

  it("covers all 8 positions, and only the three journal phases are entries", () => {
    const types = [1, 2, 3, 4, 5, 6, 7, 8].map((p) => phasePromptForPosition(p).type);
    expect(types).toEqual(["jump", "jump", "entry", "entry", "jump", "jump", "jump", "entry"]);
  });

  it("rejects a position outside 1-8", () => {
    expect(() => phasePromptForPosition(0)).toThrow();
    expect(() => phasePromptForPosition(9)).toThrow();
  });
});

describe("cycleStartMs — start of the current cycle's Planning phase", () => {
  const DAY = 86_400_000;
  const PLANNING = 6; // astronomical index of Last Quarter
  const segmentAt = (ms: number) => getLunarState(ms).segmentIndex;
  // A fixed instant well inside the app's lifetime; deterministic across runs.
  const T0 = Date.UTC(2026, 10, 16, 12, 0, 0); // 2026-11-16 12:00 UTC

  it("lands on the first whole minute inside Planning", () => {
    const start = cycleStartMs(T0);
    expect(start % 60_000).toBe(0);
    expect(segmentAt(start)).toBe(PLANNING);
    expect(segmentAt(start - 60_000)).not.toBe(PLANNING);
    expect(semanticPositionFromLunarIndex(segmentAt(start))).toBe(1);
  });

  it("is at or before now (and at most one cycle behind)", () => {
    for (let i = 0; i < 40; i++) {
      const now = T0 + i * 0.75 * DAY;
      const start = cycleStartMs(now);
      expect(start).toBeLessThanOrEqual(now + 60_000);
      expect(now - start).toBeLessThan(30 * DAY);
    }
  });

  it("is identical from every moment of one cycle, so entries group together", () => {
    const start = cycleStartMs(T0);
    // Walk from the start until the next Planning begins: always the same answer.
    const nextStart = cycleStartMs(start + 31 * DAY);
    expect(nextStart).toBeGreaterThan(start + 28 * DAY);
    expect(nextStart).toBeLessThan(start + 31 * DAY);
    for (let t = start + 60_000; t < nextStart - 60_000; t += 5 * 60 * 60 * 1000) {
      expect(cycleStartMs(t)).toBe(start);
    }
  });

  it("flips exactly at the cycle boundary (Celebrating → Planning)", () => {
    const start = cycleStartMs(T0);
    const nextStart = cycleStartMs(start + 31 * DAY);
    // Just before the next Planning begins: still the old cycle (Celebrating).
    const before = nextStart - 2 * 60_000;
    expect(semanticPositionFromLunarIndex(segmentAt(before))).toBe(8);
    expect(cycleStartMs(before)).toBe(start);
    // Two minutes into Planning: the new cycle.
    const after = nextStart + 60_000;
    expect(semanticPositionFromLunarIndex(segmentAt(after))).toBe(1);
    expect(cycleStartMs(after)).toBe(nextStart);
  });

  it("is a full lunar cycle apart from the previous one (about 29.5 days)", () => {
    const a = cycleStartMs(T0);
    const b = cycleStartMs(a - 5 * DAY); // inside the previous cycle
    expect(a - b).toBeGreaterThan(28.5 * DAY);
    expect(a - b).toBeLessThan(30.5 * DAY);
  });

  it("answers from inside Planning itself", () => {
    const start = cycleStartMs(T0);
    expect(cycleStartMs(start + 2 * DAY)).toBe(start);
    expect(semanticPositionFromLunarIndex(segmentAt(start + 2 * DAY))).toBe(1);
  });
});
