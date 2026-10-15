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
 *                     but `appleseed_data` is missing. Offer a visible
 *                     "Generate deeper view" button (wires the existing
 *                     generateAppleseed + saveAppleseed path — no new
 *                     generation logic).
 *   - "empty"       → genuinely nothing saved yet; show the "complete the
 *                     assessment first" empty state.
 *
 * Issue #53 follow-up (Sasha 2026-10-15): `"regenerable"` no longer requires
 * `ai_response_raw`. Sasha's pre-#54 snapshot has a real archetype (the main
 * card renders it from the basic columns) but a null `ai_response_raw`, so the
 * old helper returned `"empty"` → "Complete the assessment first", no button.
 * A real snapshot can ALWAYS be recovered: when the stored raw signal is
 * absent we synthesize one from the SAME basic columns the overview renders
 * (`archetype_title` / `core_pattern` / `top_three_talents`) — see
 * `buildRecoveryRawSignal`. So the decision now keys only on "is there a real
 * snapshot?". The raw signal, when present, is merely the richer source the
 * recovery handler prefers.
 */

import { hasRealArchetype } from "./snapshotSentinel";
import type { AppleseedData } from "./appleseedGenerator";

export type DeeperViewState = "ready" | "regenerable" | "empty";

export interface DeeperViewInputs {
  /** The saved appleseed_data for the latest snapshot, or null when absent. */
  appleseedData: AppleseedData | null;
  /** The snapshot's archetype_title column (may be the "Pending" sentinel). */
  archetypeTitle: string | null;
  /**
   * The stored raw signal we can re-run generation from, if any. No longer
   * required for `"regenerable"` — kept on the inputs so callers that DO hold
   * it can prefer it over the synthesized fallback. See module header.
   */
  aiResponseRaw?: string | null;
}

export const resolveDeeperViewState = ({
  appleseedData,
  archetypeTitle,
}: DeeperViewInputs): DeeperViewState => {
  // The saved result is already here — render it.
  if (appleseedData) return "ready";

  // A real saved snapshot exists but its deeper layer is missing. We can
  // always re-run generation (from the stored raw signal, or from a signal
  // synthesized out of the basic columns) → offer recovery, never the
  // dead-end empty state.
  if (hasRealArchetype(archetypeTitle)) return "regenerable";

  // Nothing saved at all — genuine empty state.
  return "empty";
};

/**
 * Build a recovery raw signal from the basic snapshot columns when the stored
 * `ai_response_raw` is absent (pre-#54 snapshots never persisted it). These
 * are the user's OWN saved Top Talent fields — the same ones the overview card
 * renders — reassembled into the plain-text shape `generateAppleseed` already
 * accepts. This is wiring only: no prompt or generation-logic change, just a
 * source for the existing path. Returns null when there's nothing usable.
 */
export const buildRecoveryRawSignal = (
  archetypeTitle: string | null,
  corePattern: string | null,
  topThreeTalents: string[] | null,
): string | null => {
  if (!hasRealArchetype(archetypeTitle)) return null;

  const lines: string[] = [`Top Talent: ${archetypeTitle!.trim()}`];
  if (corePattern && corePattern.trim() !== "") {
    lines.push(`Core pattern: ${corePattern.trim()}`);
  }
  const talents = (topThreeTalents ?? [])
    .map((t) => (typeof t === "string" ? t.trim() : ""))
    .filter(Boolean);
  if (talents.length > 0) {
    lines.push(
      `Three talents:\n${talents.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
    );
  }
  return lines.join("\n\n");
};
