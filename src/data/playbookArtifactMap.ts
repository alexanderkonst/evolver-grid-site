/**
 * Playbook ↔ Unique Business Builder mapping.
 *
 * Day 51 (Sasha 2026-04-25): bridges the two modules so:
 *   - Playbook step pages link forward into UBB artifacts ("Build these →")
 *   - UBB Canvas shows which Playbook step each phase belongs to
 *
 * Source-of-truth rationale (matches Playbook copy at src/data/playbookSteps.ts):
 *   - Step 1 (DISCOVER)  — Top Talent reveal lives at /reveal (not /ubb)
 *   - Step 2 (PACKAGE)   — essay-only; still iterating the Top Talent itself
 *   - Step 3 (BUILD)     — Phase A foundation: uniqueness/myth/tribe/pain/promise
 *   - Step 4 (PRODUCT)   — productization: lead_magnet, value_ladder,
 *                          specificity_matrix, session_bridge (1st session)
 *   - Step 5 (TEST)      — iterative delivery; no UBB artifacts (the loop itself)
 *   - Step 6 (LAUNCH)    — go live: landing_page + Phase C (marketing,
 *                          distribution, communications)
 *   - Step 7 (SCALE)     — pending (rev share / coop scheme)
 *
 * Steps with no artifacts intentionally have an empty array — that's a feature,
 * not an omission.
 */

import type { ArtifactKey } from "@/modules/unique-business-builder/types";

/** Playbook step slug → UBB artifact keys (in the order they appear on Canvas). */
export const STEP_TO_ARTIFACTS: Record<string, ArtifactKey[]> = {
  discover: [],
  package: [],
  build: ["uniqueness", "myth", "tribe", "pain", "promise"],
  product: ["lead_magnet", "value_ladder", "specificity_matrix", "session_bridge"],
  test: [],
  launch: [
    "landing_page",
    "core_belief",
    "packaging",
    "frictionless_purchase",
    "tuning_fork",
    "golden_dm",
    "surface_inventory",
    "reach",
    "delivery",
    "spread",
  ],
  scale: [],
};

/** Reverse lookup: ArtifactKey → playbook step (slug + number). */
export const ARTIFACT_TO_STEP: Partial<Record<ArtifactKey, { slug: string; number: number; appName: string }>> = (() => {
  const stepInfo: Record<string, { number: number; appName: string }> = {
    discover: { number: 1, appName: "DISCOVER" },
    package: { number: 2, appName: "PACKAGE" },
    build: { number: 3, appName: "BUILD" },
    product: { number: 4, appName: "PRODUCT" },
    test: { number: 5, appName: "TEST" },
    launch: { number: 6, appName: "LAUNCH" },
    scale: { number: 7, appName: "SCALE" },
  };
  const out: Partial<Record<ArtifactKey, { slug: string; number: number; appName: string }>> = {};
  for (const [slug, keys] of Object.entries(STEP_TO_ARTIFACTS)) {
    const info = stepInfo[slug];
    if (!info) continue;
    for (const k of keys) {
      out[k] = { slug, number: info.number, appName: info.appName };
    }
  }
  return out;
})();

/** Whether a Playbook step has any UBB artifacts to build. */
export const stepHasArtifacts = (slug: string): boolean =>
  (STEP_TO_ARTIFACTS[slug]?.length ?? 0) > 0;

/** Get artifacts for a step (empty array if none / unknown). */
export const getArtifactsForStep = (slug: string): ArtifactKey[] =>
  STEP_TO_ARTIFACTS[slug] ?? [];

/** Get the playbook step for an artifact, if mapped. */
export const getStepForArtifact = (key: ArtifactKey) => ARTIFACT_TO_STEP[key];

/**
 * One link entry per UNIQUE destination — for the "Build these →" UI on
 * Playbook step cards. Sub-artifacts that share a compound screen get
 * collapsed into one entry with the compound label, so we don't render
 * three chips that all point to /ubb/marketing.
 */
export type StepBuildLink = {
  /** Display label (e.g., "Uniqueness", "Marketing — 3 Pillars") */
  label: string;
  /** URL slug under /ubb (e.g., "uniqueness", "marketing", "communications") */
  slug: string;
};

const COMPOUND_LABELS: Record<string, string> = {
  session: "1st Session Design",
  marketing: "Marketing — 3 Pillars",
  distribution: "Distribution — 3 Pillars",
  communications: "Communications — 3 Pieces",
};

const SINGLE_ARTIFACT_LABELS: Partial<Record<ArtifactKey, string>> = {
  uniqueness: "Uniqueness",
  myth: "Myth",
  tribe: "Tribe",
  pain: "Pain",
  promise: "Promise",
  lead_magnet: "Lead Magnet",
  value_ladder: "Value Ladder",
  specificity_matrix: "Specificity Matrix",
  landing_page: "Landing Page",
};

const ARTIFACT_TO_SLUG: Record<ArtifactKey, string> = {
  uniqueness: "uniqueness",
  myth: "myth",
  tribe: "tribe",
  pain: "pain",
  promise: "promise",
  lead_magnet: "lead-magnet",
  value_ladder: "value-ladder",
  specificity_matrix: "specificity-matrix",
  session_bridge: "session",
  core_belief: "marketing",
  packaging: "marketing",
  frictionless_purchase: "marketing",
  reach: "distribution",
  delivery: "distribution",
  spread: "distribution",
  surface_inventory: "communications",
  tuning_fork: "communications",
  golden_dm: "communications",
  landing_page: "landing-page",
};

/**
 * Build the deduped link list for a Playbook step's "Build these →" section.
 * - Single-screen artifacts get their own chip.
 * - Compound sub-artifacts collapse to one chip per compound screen.
 * - Order preserved by first appearance in the step's artifact list.
 */
export const getBuildLinksForStep = (slug: string): StepBuildLink[] => {
  const keys = getArtifactsForStep(slug);
  const seen = new Set<string>();
  const out: StepBuildLink[] = [];
  for (const key of keys) {
    const url = ARTIFACT_TO_SLUG[key];
    if (seen.has(url)) continue;
    seen.add(url);
    const label = COMPOUND_LABELS[url] ?? SINGLE_ARTIFACT_LABELS[key] ?? key;
    out.push({ label, slug: url });
  }
  return out;
};
