/**
 * Viability — the Vision ↔ Viability axis (Domain 93).
 *
 * Frontend mirror of `supabase/functions/_shared/viability.ts`. This is the
 * crash-test result attached, beside the fidelity roast, to strategy / offer /
 * positioning artifacts (never to the inward-essence ones).
 *
 * Refs: docs/01-vision/phase_shift_technology_library.md (Domain 93),
 *       docs/specs/vision-viability/planning_sow.md
 */

export type ViabilityFinding = {
  // One of: trust | timing | language | cost | inertia | proof | action-friction
  dimension: string;
  risk: string;
};

export type Viability = {
  applicable: boolean;
  findings: ViabilityFinding[];
  // 0-10: "small enough to try AND real enough to matter."
  kinetic_calm: number;
  // The one buyer-native action that would make it real this week.
  next_move: string;
  // The most-exposed part rewritten to what survives the crash-test (may be "").
  surviving_seed: string;
};
