/**
 * Phase-aware readiness — the single source of truth for WHICH write
 * layer is due in WHICH lunar phase, and the pure logic that turns
 * "what's filled" into a per-layer readiness state.
 *
 * Why this file exists (Sasha, issue #63): an Equilibrium layer that is
 * empty is not a failure — it's information. In the Clearing phase an
 * empty Workstreams section is exactly right. In the Seeing phase it's a
 * nudge. This module encodes that distinction so the UI can render a
 * calm, informative readiness strip instead of a guilt-list of blanks.
 *
 * The map below is config-driven: edit the PHASE_PLAN rows and both the
 * UI (PhaseReadinessPanel + the collapse gates on EquilibriumV2Page) and
 * the server mirror (equilibrium-agent-write `read_state.phase_readiness`,
 * kept in sync by hand — see the "keep in sync" note there) follow.
 *
 * ── Phase ↔ moon anchoring ────────────────────────────────────────────
 * The 8 semantic phases (Planning … Celebrating) are Sasha's cycle, in
 * his 1-8 order. They are ALREADY anchored to astronomical moon phases
 * throughout the app via MOON_PHASES[].energy (the lead word of each
 * energy string IS the semantic name). This file reuses that anchoring
 * rather than inventing a second one:
 *
 *   astronomical index → semantic phase
 *     0 New Moon        → Clearing      (position 3)
 *     1 Waxing Crescent → Gathering     (position 4)
 *     2 First Quarter   → Seeing        (position 5)
 *     3 Waxing Gibbous  → Leading       (position 6)
 *     4 Full Moon       → Harvesting    (position 7)
 *     5 Waning Gibbous  → Celebrating   (position 8)
 *     6 Last Quarter    → Planning      (position 1)
 *     7 Waning Crescent → Planting      (position 2)
 *
 * Closed form: semanticPosition = ((astronomicalIndex + 2) % 8) + 1.
 * Seeing = First Quarter and Harvesting = Full Moon match the issue's
 * parentheticals; Planning sits at Last Quarter per the locked lunar
 * wisdom map (docs/specs/equilibrium/lunar_wisdom_map.md).
 */

// ─── Layers (the 5 write surfaces, in readiness-row order) ─────────────

export const EQ_LAYER_KEYS = [
  "focus",
  "strategies",
  "workstreams",
  "tasks",
  "doNow",
] as const;

export type EqLayerKey = (typeof EQ_LAYER_KEYS)[number];

// ─── Phases (Sasha's 8, in cycle order 1-8) ────────────────────────────

export type EqPhaseName =
  | "Planning"
  | "Planting"
  | "Clearing"
  | "Gathering"
  | "Seeing"
  | "Leading"
  | "Harvesting"
  | "Celebrating";

export interface EqPhaseSpec {
  /** Sasha's 1-8 cycle order. */
  position: number;
  name: EqPhaseName;
  /** Astronomical phase name — matches MOON_PHASES[].name. */
  moonName: string;
  /** Index into MOON_PHASES (New Moon = 0). */
  astronomicalIndex: number;
  /** One line: what this phase asks. */
  asks: string;
  /** The trap — what NOT to do (named so it can be side-stepped). */
  trap: string;
  /** Layers that first come DUE in this phase. */
  writes: EqLayerKey[];
  /** Short "what you'll write" hint for the "Next:" line. */
  writeLabel: string;
}

/**
 * The map. ONE constant. Ordered by Sasha's cycle position 1-8.
 * `writes` drives the per-layer due-position derivation below, so the
 * two never drift.
 */
export const PHASE_PLAN: EqPhaseSpec[] = [
  {
    position: 1,
    name: "Planning",
    moonName: "Last Quarter",
    astronomicalIndex: 6,
    asks: "The next intention surfaces. Name your Moon Focus in 1-3 words, as soon as it's obvious.",
    trap: "Don't run a goal-setting workshop. Receive it; don't engineer it.",
    writes: ["focus"],
    writeLabel: "Moon Focus",
  },
  {
    position: 2,
    name: "Planting",
    moonName: "Waning Crescent",
    astronomicalIndex: 7,
    asks: "Capture the 1-3 strategies as they reveal themselves. Don't force them.",
    trap: "Don't skip a revelation just because the goal isn't written yet.",
    writes: ["strategies"],
    writeLabel: "Strategies",
  },
  {
    position: 3,
    name: "Clearing",
    moonName: "New Moon",
    astronomicalIndex: 0,
    asks: "Nothing to write. Release fear; the how is not yours yet.",
    trap: "Don't invent the \"how\" out of fear. No workstreams or tasks from panic.",
    writes: [],
    writeLabel: "nothing — just clear",
  },
  {
    position: 4,
    name: "Gathering",
    moonName: "Waxing Crescent",
    astronomicalIndex: 1,
    asks: "Nothing new. Say yes; collect raw material for Seeing.",
    trap: "Don't filter or refuse early. Let it all arrive.",
    writes: [],
    writeLabel: "nothing — gather input",
  },
  {
    position: 5,
    name: "Seeing",
    moonName: "First Quarter",
    astronomicalIndex: 2,
    asks: "The how reveals. Write Workstreams (≤7) and Intuitive Tasks (≤7 each), fast.",
    trap: "Don't postpone writing. Capture before the clarity drifts.",
    writes: ["workstreams", "tasks"],
    writeLabel: "Workstreams + Tasks",
  },
  {
    position: 6,
    name: "Leading",
    moonName: "Waxing Gibbous",
    astronomicalIndex: 3,
    asks: "Order tasks and workstreams, pick focus tasks, book your Harvest blocks.",
    trap: "Don't start executing yet. This is preparation.",
    writes: [],
    writeLabel: "order & schedule",
  },
  {
    position: 7,
    name: "Harvesting",
    moonName: "Full Moon",
    astronomicalIndex: 4,
    asks: "DO NOW: one task (max 3). Done → next. Reap what's ripe.",
    trap: "Don't start new things. Only finish what's chosen.",
    writes: ["doNow"],
    writeLabel: "DO NOW",
  },
  {
    position: 8,
    name: "Celebrating",
    moonName: "Waning Gibbous",
    astronomicalIndex: 5,
    asks: "Review what's done, give thanks, clear spent tasks.",
    trap: "Don't jump straight to planning. No new Moon Focus yet.",
    writes: [],
    writeLabel: "review & clear",
  },
];

// ─── Layer metadata (label + the position where each layer comes due) ──

export interface EqLayerSpec {
  key: EqLayerKey;
  /** Chip label in the readiness row. */
  label: string;
  /** Cycle position (1-8) at which this layer becomes due. */
  dueAtPosition: number;
  /** Phase name at which this layer becomes due. */
  dueAtPhase: EqPhaseName;
}

/**
 * Derived from PHASE_PLAN[].writes so the due-positions can never drift
 * from the map. A layer is "due" from its write-phase onward and stays
 * due until the cycle restarts at Planning (position 1) — see
 * {@link computeLayerReadiness}.
 */
const LAYER_LABELS: Record<EqLayerKey, string> = {
  focus: "Focus",
  strategies: "Strategies",
  workstreams: "Workstreams",
  tasks: "Tasks",
  doNow: "DO NOW",
};

export const EQ_LAYERS: Record<EqLayerKey, EqLayerSpec> = (() => {
  const out = {} as Record<EqLayerKey, EqLayerSpec>;
  for (const key of EQ_LAYER_KEYS) {
    const phase = PHASE_PLAN.find((p) => p.writes.includes(key));
    if (!phase) {
      throw new Error(`phasePlan: layer "${key}" has no write phase in PHASE_PLAN`);
    }
    out[key] = {
      key,
      label: LAYER_LABELS[key],
      dueAtPosition: phase.position,
      dueAtPhase: phase.name,
    };
  }
  return out;
})();

// ─── Readiness ─────────────────────────────────────────────────────────

/**
 *   "filled"    — the layer has content (✓). Takes precedence always,
 *                 even when the layer was filled EARLY (before its due
 *                 phase). A filled layer is never "due but empty".
 *   "due_empty" — due in the current phase (or an earlier one this cycle)
 *                 but still empty (!). A soft nudge, never red.
 *   "not_due"   — its write phase hasn't arrived yet this cycle (·).
 *                 Calm, muted — an empty section here is correct.
 */
export type LayerReadiness = "filled" | "due_empty" | "not_due";

/**
 * Readiness for one layer given the current cycle position (1-8) and
 * whether the layer is filled.
 *
 * Due model: a layer becomes due at its write-position and stays due
 * through the rest of the cycle (up to and including Celebrating),
 * because the cycle only "restarts" at the next Planning. Moon Focus,
 * due at Planning (position 1), is therefore due in every phase.
 */
export function computeLayerReadiness(
  currentPosition: number,
  layer: EqLayerKey,
  filled: boolean,
): LayerReadiness {
  if (filled) return "filled";
  return currentPosition >= EQ_LAYERS[layer].dueAtPosition ? "due_empty" : "not_due";
}

/** Readiness for all five layers at once. */
export function computePhaseReadiness(
  currentPosition: number,
  filled: Record<EqLayerKey, boolean>,
): Record<EqLayerKey, LayerReadiness> {
  const out = {} as Record<EqLayerKey, LayerReadiness>;
  for (const key of EQ_LAYER_KEYS) {
    out[key] = computeLayerReadiness(currentPosition, key, filled[key]);
  }
  return out;
}

// ─── Astronomical ↔ semantic helpers ───────────────────────────────────

/**
 * Semantic cycle position (1-8) from an astronomical lunar segment index
 * (0-7, New Moon = 0). Closed form documented at the top of this file.
 */
export function semanticPositionFromLunarIndex(astronomicalIndex: number): number {
  const idx = ((astronomicalIndex % 8) + 8) % 8;
  return ((idx + 2) % 8) + 1;
}

/** The phase spec for a cycle position (1-8). */
export function phaseByPosition(position: number): EqPhaseSpec {
  const spec = PHASE_PLAN.find((p) => p.position === position);
  if (!spec) throw new Error(`phasePlan: no phase at position ${position}`);
  return spec;
}

/** The phase spec for an astronomical lunar segment index (0-7). */
export function phaseByLunarIndex(astronomicalIndex: number): EqPhaseSpec {
  return phaseByPosition(semanticPositionFromLunarIndex(astronomicalIndex));
}

/** The phase after this one, wrapping 8 → 1. */
export function nextPhase(position: number): EqPhaseSpec {
  return phaseByPosition((position % 8) + 1);
}
