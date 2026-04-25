/**
 * Unique Business Builder v2.0 — constants.
 */

import type { ArtifactKey, CompoundScreenKey } from "./types";
import {
  PHASE_A_CANVAS,
  PHASE_B_SESSION,
  PHASE_C_MARKET,
  PHASE_D_PUBLICATION,
  COMPOUND_GROUPING,
} from "./types";

// Route paths (flat under /ubb)
export const UBB_ROOT = "/ubb";

export const ROUTES = {
  overview: UBB_ROOT,
  artifact: (key: ArtifactKey | CompoundScreenKey) => `${UBB_ROOT}/${ARTIFACT_URL_SLUGS[key as ArtifactKey] ?? key}`,
  landingPage: `${UBB_ROOT}/landing-page`,
  dossier: `${UBB_ROOT}/dossier`,
  publicDossier: (slug: string) => `/ubd/${slug}`,
  publicLandingPage: (slug: string, version: string) => `/ubl/${slug}-${version}`,
} as const;

// Artifact → URL slug (hyphenated)
export const ARTIFACT_URL_SLUGS: Record<ArtifactKey, string> = {
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

// Human-readable labels per artifact
export const ARTIFACT_LABELS: Record<ArtifactKey, string> = {
  uniqueness: "Uniqueness",
  myth: "Myth",
  tribe: "Tribe",
  pain: "Pain",
  promise: "Promise",
  lead_magnet: "Lead Magnet",
  value_ladder: "Value Ladder",
  specificity_matrix: "Specificity Matrix",
  session_bridge: "1st Session Design",
  core_belief: "Core Belief",
  packaging: "Packaging",
  frictionless_purchase: "Frictionless Purchase",
  reach: "Reach",
  delivery: "Delivery",
  spread: "Spread",
  surface_inventory: "Surface Inventory",
  tuning_fork: "Tuning Fork",
  golden_dm: "Golden DM",
  landing_page: "Landing Page",
};

// Phase labels (user-facing)
export const PHASE_LABELS = {
  canvas: "Canvas",
  session: "Session Bridge",
  marketing: "Marketing",
  distribution: "Distribution",
  communications: "Communications",
  publication: "Publication",
} as const;

// Which phase does an artifact belong to
export function phaseOf(key: ArtifactKey): keyof typeof PHASE_LABELS {
  if ((PHASE_A_CANVAS as readonly ArtifactKey[]).includes(key)) return "canvas";
  if ((PHASE_B_SESSION as readonly ArtifactKey[]).includes(key)) return "session";
  if ((PHASE_D_PUBLICATION as readonly ArtifactKey[]).includes(key)) return "publication";
  // Phase C: split into three sub-phases by compound grouping
  if (COMPOUND_GROUPING.marketing.includes(key)) return "marketing";
  if (COMPOUND_GROUPING.distribution.includes(key)) return "distribution";
  if (COMPOUND_GROUPING.communications.includes(key)) return "communications";
  return "canvas"; // fallback
}

// 402 error messages (user-facing)
export const ERROR_MESSAGES = {
  insufficient_credit:
    "AI credit limit reached. Top up in Settings → Plans & Credits, then retry.",
  model_error: "AI is briefly unavailable. Try again in a minute.",
  invalid_json: "Improvement didn't come back clean — please retry.",
  network: "Network hiccup. Check your connection and retry.",
} as const;

// Specificity UI thresholds (color gradient)
export const SPECIFICITY_BANDS = [
  { min: 0, max: 4, label: "sketch", color: "info" },
  { min: 4, max: 6.5, label: "drafted", color: "info" },
  { min: 6.5, max: 8, label: "landing", color: "warning" },
  { min: 8, max: 9.5, label: "sharp", color: "success" },
  { min: 9.5, max: 10.01, label: "photon", color: "success" },
] as const;

export function specificityBand(score: number) {
  return SPECIFICITY_BANDS.find((b) => score >= b.min && score < b.max) ?? SPECIFICITY_BANDS[0];
}

// Version string helpers
export function nextVersionString(current: string | undefined): string {
  if (!current) return "v1";
  const match = current.match(/^v(\d+)(?:\.(\d+))?$/);
  if (!match) return `${current}-next`;
  const major = parseInt(match[1], 10);
  return `v${major + 1}`;
}
