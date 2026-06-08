/**
 * Equilibrium v2 — shared types for the Biologic Watch page.
 *
 * Server-truth types here track the Supabase schema (provisioned via the
 * Lovable prompt; SQL reference in docs/specs/equilibrium/equilibrium_v2_tracker.md).
 * Once Sasha regenerates src/integrations/supabase/types.ts after the migration,
 * these may be replaced by Database['public']['Tables'] aliases.
 */

// ─── Equilibrium state (user overrides + last synthesis cache) ─────────

export interface EquilibriumState {
  user_id: string;
  mission_override_text: string | null;
  role_override_text: string | null;
  moon_focus_text: string | null;
  last_synthesis_text: string | null;
  last_synthesis_at: string | null;
  updated_at: string;
}

// ─── Strategies (up to 3 per user) ─────────────────────────────────────

export interface EquilibriumStrategy {
  user_id: string;
  position: 1 | 2 | 3;
  text: string;
  set_at: string;
  /**
   * Alignment score (0-100) with the user's Lifelong Dedication + Role.
   * Cached from the `score-equilibrium-strategies` edge function. User
   * triggers re-scoring explicitly via a button. Null = not yet scored.
   * Sasha 2026-05-17. Migration:
   *   supabase/migrations/20260517000000_add_alignment_score_to_equilibrium_strategies.sql
   */
  alignment_score?: number | null;
  /** One-sentence plain-language reasoning for the score. */
  alignment_reasoning?: string | null;
  /** When this strategy was last scored. Stale after text/dedication/role edit. */
  alignment_scored_at?: string | null;
}

export interface EquilibriumStrategyIteration {
  strategyTagline: string;
  bottomLine: string;
  proposedStrategy: string;
}

/**
 * Completed/archived strategy — the row in
 * `equilibrium_strategy_completions` (Sasha 2026-05-29). When a strategy
 * is marked done, its live row in `equilibrium_strategies` is copied
 * here and deleted from the live table, freeing the position slot.
 * Harvest unions these with completed tasks for the celebration feed.
 */
export interface EquilibriumStrategyCompletion {
  id: string;
  user_id: string;
  text: string;
  /** The 1/2/3 slot the strategy occupied at the moment of completion. */
  original_position: number | null;
  /** When it was first created — used to compute "in play" duration. */
  set_at: string;
  /** When it was marked complete. */
  done_at: string;
  alignment_score: number | null;
  alignment_reasoning: string | null;
}

// ─── Workstreams (up to 7 active per user) ─────────────────────────────

export interface EquilibriumWorkstream {
  id: string;
  user_id: string;
  position: number;
  title: string;
  created_at: string;
  archived_at: string | null;
}

// ─── Tasks (per workstream, up to 7 active + done overflow) ────────────

export type TaskStatus = "active" | "done";

export interface EquilibriumTask {
  id: string;
  workstream_id: string;
  position: number;
  text: string;
  status: TaskStatus;
  created_at: string;
  done_at: string | null;
  do_now_at: string | null;
  /**
   * Immutable copy of the parent workstream.title at the moment this
   * task was completed (Sasha 2026-05-24). Lets Harvest preserve
   * celebration history even when the parent workstream is later
   * hard-deleted. Null for tasks completed before this snapshot
   * feature shipped, AND for active (not-yet-done) tasks. Migration:
   * 20260524000000_add_workstream_title_snapshot.sql.
   */
  workstream_title_snapshot: string | null;
}

// ─── DO NOW focus slot (up to 3 promoted task IDs per user) ────────────

export interface EquilibriumFocus {
  user_id: string;
  position: 1 | 2 | 3;
  task_id: string;
  promoted_at: string;
}

// ─── Synthesis edge-function I/O ───────────────────────────────────────

export interface SynthesisInputPayload {
  cycles: {
    solar: { phase: string; personalYearProgress: number; energy: string };
    zodiac: { sign: string; progress: number; energy: string };
    lunar: { phase: string; day: number; holonic: string; energy: string };
    dayOfWeek: { name: string; planet: string; energy: string; holonic: string };
  };
  context: {
    mission: string | null;
    role: string | null;
    moonFocus: string | null;
  };
}

export interface SynthesisOutputPayload {
  reading: string;
}

// ─── Section identifiers — anchors for in-page navigation ──────────────

export const SECTION_IDS = {
  synthesis: "synthesis",
  mission: "mission",
  role: "role",
  // Sasha 2026-06-08: Focus mirrors `moon_focus_text` into ACT mode
  // between Role and Strategy — same underlying value as the ATTUNE
  // Moon Focus pill, surfaced as a North Star row in the ACT stack.
  focus: "focus",
  solar: "solar",
  zodiac: "zodiac",
  lunar: "lunar",
  dayOfWeek: "day-of-week",
  strategies: "strategies",
  workstreams: "workstreams",
  goals: "goals",
  doNow: "do-now",
  // Sasha 2026-05-20: "Harvest" — a running celebration feed of
  // completed tasks across all workstreams. Ties to the lunar
  // Harvesting phase (Full Moon) in the spine — "reap what's ripe ·
  // receive the fruits of labor." Replaces the per-workstream
  // siloed done-piles for the cross-stream celebration view.
  harvest: "harvest",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];
