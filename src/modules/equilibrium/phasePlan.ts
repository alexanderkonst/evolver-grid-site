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
 *
 * ── Cycle Journal (issue #331) ────────────────────────────────────────
 * Three "nothing to write" phases now have a write surface of their own:
 * Clearing (what is clearing), Gathering (resources arriving) and
 * Celebrating (what ripened). They are JOURNAL layers: stored in
 * `equilibrium_cycle_entries`, never "due but empty" (no amber, no guilt),
 * and shown on the readiness strip as a count or a calm dot.
 */

import { getLunarState } from "@/lib/equilibrium-cycles";

// ─── Layers (the 8 write surfaces, in cycle order) ──────────────────────

export const EQ_LAYER_KEYS = [
  "focus",
  "strategies",
  "clearing",
  "resources",
  "workstreams",
  "tasks",
  "doNow",
  "celebration",
] as const;

export type EqLayerKey = (typeof EQ_LAYER_KEYS)[number];

/**
 * The Cycle Journal layers: free-form lists written phase by phase. They
 * never read "due but empty" — see {@link computeLayerReadiness}.
 */
export const EQ_JOURNAL_LAYER_KEYS = ["clearing", "resources", "celebration"] as const;
export type EqJournalLayerKey = (typeof EQ_JOURNAL_LAYER_KEYS)[number];

export function isJournalLayer(key: EqLayerKey): key is EqJournalLayerKey {
  return (EQ_JOURNAL_LAYER_KEYS as readonly EqLayerKey[]).includes(key);
}

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
    asks: "Name what's clearing. One line each; no need to fix it.",
    trap: "Don't invent the \"how\" out of fear. No workstreams or tasks from panic.",
    writes: ["clearing"],
    writeLabel: "what's clearing",
  },
  {
    position: 4,
    name: "Gathering",
    moonName: "Waxing Crescent",
    astronomicalIndex: 1,
    asks: "Say yes. Note every resource that arrives: money, people, calls, offers, information.",
    trap: "Don't filter or refuse early. Let it all arrive.",
    writes: ["resources"],
    writeLabel: "resources arriving",
  },
  {
    position: 5,
    name: "Seeing",
    moonName: "First Quarter",
    astronomicalIndex: 2,
    asks: "The how reveals. Write Workstreams (≤3) and Intuitive Tasks (≤3 each), fast.",
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
    asks: "Name what ripened and what you celebrate, then clear spent tasks.",
    trap: "Don't jump straight to planning. No new Moon Focus yet.",
    writes: ["celebration"],
    writeLabel: "what ripened",
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
  clearing: "Clearing",
  resources: "Resources",
  workstreams: "Workstreams",
  tasks: "Tasks",
  doNow: "DO NOW",
  celebration: "Celebration",
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
 *
 * Journal layers (clearing / resources / celebration) only ever read
 * "filled" or "not_due": an empty journal is never a nudge. The UI shows
 * "not_due" for them as a calm dot, never as amber.
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
  // Journal layers are never due-empty: no amber, no guilt.
  if (isJournalLayer(layer)) return "not_due";
  return currentPosition >= EQ_LAYERS[layer].dueAtPosition ? "due_empty" : "not_due";
}

/** Readiness for all layers at once. */
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

// ─── Phase prompt (Cycle Journal, issue #331) ──────────────────────────

/** Entry kinds the journal stores for the three journal layers. */
export type CycleJournalKind = "clearing" | "resource" | "celebration";

/** Layer key → entry kind. */
export const JOURNAL_KIND_BY_LAYER: Record<EqJournalLayerKey, CycleJournalKind> = {
  clearing: "clearing",
  resources: "resource",
  celebration: "celebration",
};

/** Entry kind → layer key. */
export const JOURNAL_LAYER_BY_KIND: Record<CycleJournalKind, EqJournalLayerKey> = {
  clearing: "clearing",
  resource: "resources",
  celebration: "celebration",
};

/** The existing write surfaces a "Write it →" link can jump to. */
export type EqJumpTarget = "focus" | "strategies" | "workstreams" | "tasks" | "doNow";

/**
 * What the Phase Prompt shows for a phase. Exactly ONE prompt per phase:
 *   - `entry` — a quick single-line input for a journal kind
 *   - `jump`  — a "Write it →" link to an existing editor (no duplicate editors)
 */
export type PhasePrompt =
  | { type: "entry"; kind: CycleJournalKind; heading: string; placeholder: string }
  | { type: "jump"; target: EqJumpTarget; label: string };

/** Quick-input copy per journal kind — in the voice of its phase. */
export const JOURNAL_KIND_COPY: Record<
  CycleJournalKind,
  { heading: string; placeholder: string; noun: string; empty: string }
> = {
  clearing: {
    heading: "What is clearing",
    placeholder: "A fear, a habit, an old commitment…",
    noun: "Clearing",
    empty: "Nothing noted yet. That's fine.",
  },
  resource: {
    heading: "Resources arriving",
    placeholder: "A resource that arrived…",
    noun: "Resources",
    empty: "Nothing noted yet. That's fine.",
  },
  celebration: {
    heading: "What ripened, what we celebrate",
    placeholder: "Something that ripened…",
    noun: "Celebration",
    empty: "Nothing noted yet. That's fine.",
  },
};

/** The prompt for a cycle position (1-8). */
export function phasePromptForPosition(position: number): PhasePrompt {
  switch (position) {
    case 1:
      return { type: "jump", target: "focus", label: "Write your Moon Focus" };
    case 2:
      return { type: "jump", target: "strategies", label: "Write your strategies" };
    case 3:
      return { type: "entry", kind: "clearing", ...pickCopy("clearing") };
    case 4:
      return { type: "entry", kind: "resource", ...pickCopy("resource") };
    case 5:
      return { type: "jump", target: "workstreams", label: "Write your workstreams" };
    case 6:
      return { type: "jump", target: "tasks", label: "Order and schedule your tasks" };
    case 7:
      return { type: "jump", target: "doNow", label: "Choose your DO NOW" };
    case 8:
      return { type: "entry", kind: "celebration", ...pickCopy("celebration") };
    default:
      throw new Error(`phasePlan: no phase at position ${position}`);
  }
}

function pickCopy(kind: CycleJournalKind) {
  const { heading, placeholder } = JOURNAL_KIND_COPY[kind];
  return { heading, placeholder };
}

// ─── Cycle start (Cycle Journal, issue #331) ───────────────────────────

const MINUTE_MS = 60_000;
const COARSE_STEP_MS = 3 * 60 * 60 * 1000; // Planning lasts ~3.3-4.1 days: 3h can't skip it
const MAX_COARSE_STEPS = 280; // > 30 days of 3h steps
/** Astronomical index of Planning (Last Quarter). */
const PLANNING_INDEX = 6;

/**
 * Start of the current cycle, in ms: the start of the most recent Planning
 * (Last Quarter, position 1) segment at or before `nowMs`.
 *
 * Resolved to a whole minute: the FIRST whole minute inside Planning.
 * Because it is snapped to the minute grid, the result is the same no
 * matter which `nowMs` it is asked from within one cycle — entries written
 * on different days of a cycle share one `cycle_start` and group together.
 * (It can exceed `nowMs` by under a minute only when `nowMs` is inside the
 * first minute of Planning.)
 *
 * Pure: reads only the lunar math. The server mirror lives in
 * supabase/functions/equilibrium-agent-write/cycleJournal.ts and must
 * return the same value.
 */
export function cycleStartMs(nowMs: number): number {
  const isPlanning = (t: number) => getLunarState(t).segmentIndex === PLANNING_INDEX;

  // 1. Walk back until we are inside a Planning segment.
  let hi = nowMs;
  let guard = 0;
  while (!isPlanning(hi) && guard++ < MAX_COARSE_STEPS) hi -= COARSE_STEP_MS;

  // 2. Walk back to the last moment outside it. (lo outside, hi inside.)
  let lo = hi - COARSE_STEP_MS;
  guard = 0;
  while (isPlanning(lo) && guard++ < MAX_COARSE_STEPS) {
    hi = lo;
    lo -= COARSE_STEP_MS;
  }

  // 3. Bisect on whole minutes for the first minute inside Planning.
  let loM = Math.floor(lo / MINUTE_MS);
  let hiM = Math.ceil(hi / MINUTE_MS);
  if (!isPlanning(hiM * MINUTE_MS)) hiM = Math.floor(hi / MINUTE_MS);
  while (hiM - loM > 1) {
    const mid = Math.floor((loM + hiM) / 2);
    if (isPlanning(mid * MINUTE_MS)) hiM = mid;
    else loM = mid;
  }
  return hiM * MINUTE_MS;
}
