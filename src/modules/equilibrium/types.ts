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
  solar: "solar",
  zodiac: "zodiac",
  lunar: "lunar",
  dayOfWeek: "day-of-week",
  strategies: "strategies",
  workstreams: "workstreams",
  goals: "goals",
  doNow: "do-now",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];
