/**
 * Deeper-view state resolver (Issue #53, Sasha 2026-10-14).
 *
 * The ME · Top Talent deeper tabs (How It Shows Up, Three Talents in Depth,
 * Top Shadow, One Action, …) render ONLY from `zog_snapshots.appleseed_data`
 * (its `topTalentProfile` sub-object). The main reveal card
 * (ZoneOfGeniusOverview) renders from the SAME column but falls back to the
 * basic snapshot columns (`archetype_title` / `core_pattern` /
 * `top_three_talents`) when `appleseed_data` is null.
 *
 * In the Guided lane (Step4GenerateSnapshot) the row is inserted with only
 * the basic columns; `appleseed_data` is produced asynchronously in a
 * fire-and-forget background task that runs AFTER the "✓ Result saved"
 * toast. So immediately after a guided run — or permanently, if that
 * background job fails — `appleseed_data` is null. The main card survives on
 * its fallback; the deeper tabs hit a dead-end "complete the assessment
 * first" empty state even though the user clearly HAS a saved result.
 *
 * This helper centralizes the three-way decision so ZoGPerspectiveView and
 * its test cannot drift:
 *
 *   - "ready"       → appleseed_data is present; render the perspective.
 *   - "regenerable" → a real saved snapshot exists (non-sentinel archetype)
 *                     and we hold the raw signal to re-run generation, but
 *                     `appleseed_data` is missing. Offer a visible
 *                     "Generate deeper view" button (wires the existing
 *                     generateAppleseed + saveAppleseed path — no new
 *                     generation logic).
 *   - "empty"       → genuinely nothing saved yet (or no way to regenerate);
 *                     show the "complete the assessment first" empty state.
 */

import { hasRealArchetype } from "./snapshotSentinel";
import type { AppleseedData } from "./appleseedGenerator";

export type DeeperViewState = "ready" | "regenerable" | "empty";

export interface DeeperViewInputs {
  /** The saved appleseed_data for the latest snapshot, or null when absent. */
  appleseedData: AppleseedData | null;
  /** The snapshot's archetype_title column (may be the "Pending" sentinel). */
  archetypeTitle: string | null;
  /** The stored raw signal we can re-run generation from, or null. */
  aiResponseRaw: string | null;
}

export const resolveDeeperViewState = ({
  appleseedData,
  archetypeTitle,
  aiResponseRaw,
}: DeeperViewInputs): DeeperViewState => {
  // The saved result is already here — render it.
  if (appleseedData) return "ready";

  // A real snapshot exists and we can re-run generation from its stored raw
  // signal → offer recovery instead of a dead-end empty state.
  if (hasRealArchetype(archetypeTitle) && !!aiResponseRaw && aiResponseRaw.trim() !== "") {
    return "regenerable";
  }

  // Nothing to render and nothing to regenerate from.
  return "empty";
};
