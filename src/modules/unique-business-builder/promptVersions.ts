/**
 * Unique Business Builder — frontend mirror of PROMPT_VERSION.
 *
 * GENERATED. Do not hand-edit.
 *
 * Re-generate with:
 *   node scripts/compute-ubb-prompt-versions.mjs
 *
 * The backend computes the same map at module load in
 * supabase/functions/_shared/ubb-prompts.ts. This mirror exists so the
 * frontend can detect "prompt-stale" artifacts (DB column
 * `prompt_version_at_lock` ≠ current PROMPT_VERSION[key]) without
 * importing the full prompt corpus into the Vite bundle.
 *
 * Last regenerated: 2026-05-22.
 */

import type { ArtifactKey } from "./types";

export const PROMPT_VERSION: Record<ArtifactKey, string> = {
  uniqueness: "eee01747d03f",
  myth: "578fa46cffba",
  tribe: "81954bb067bb",
  pain: "ba8b98330bc0",
  promise: "cc0676af667c",
  lead_magnet: "eea674b9bc0a",
  value_ladder: "e099810e3ee3",
  specificity_matrix: "34935c967c8b",
  session_bridge: "7b2fe2c6ce11",
  core_belief: "c03f6f28411b",
  packaging: "33558cea00a9",
  frictionless_purchase: "db96ed80c93f",
  reach: "8dd7ed04070a",
  delivery: "891afec579ef",
  spread: "c9067bebea45",
  surface_inventory: "8d7e5ab84928",
  tuning_fork: "5396cf59991c",
  golden_dm: "faa5b9007ac4",
  landing_page: "beeb03afd34b",
};
