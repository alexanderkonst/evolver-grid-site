/**
 * Unique Business Builder v2.0 — TypeScript types
 *
 * Derives from: docs/specs/unique-business-builder/unique-business-builder_product_spec.md
 *              + unique-business-builder_architecture_spec.md
 * Artifact output shapes: see supabase/functions/_shared/ubb-prompts.ts (source of truth).
 *
 * Paramount invariant: specificity is monotonic, versions are append-only.
 * An accepted Improve creates a new VersionRow; previous rows are never overwritten.
 */

import type { Viability } from "@/types/viability";

// ============================================================================
// Artifact keys — the 18 improvable artifacts (Dossier is a composed view)
// ============================================================================

export type ArtifactKey =
  // Phase A — Canvas (8)
  | 'uniqueness'
  | 'myth'
  | 'tribe'
  | 'pain'
  | 'promise'
  | 'lead_magnet'
  | 'value_ladder'
  | 'specificity_matrix'
  // Phase B — Session bridge (1 compound)
  | 'session_bridge'
  // Phase C — Market path (9)
  | 'core_belief'
  | 'packaging'
  | 'frictionless_purchase'
  | 'reach'
  | 'delivery'
  | 'spread'
  | 'surface_inventory'
  | 'tuning_fork'
  | 'golden_dm'
  // Phase D — Publication (1)
  | 'landing_page';

export const PHASE_A_CANVAS: readonly ArtifactKey[] = [
  'uniqueness',
  'myth',
  'tribe',
  'pain',
  'promise',
  'lead_magnet',
  'value_ladder',
  // Day 51 (Sasha 2026-04-25): specificity_matrix added as 8th canvas
  // artifact. The Specificity Loop matrix (Playbook Principle 15 / Phase
  // Shift Library Domain 81) is now generated per-founder from their
  // voice + canvas content, then injected into their funnel reveals at
  // runtime. Lives at end of Phase A because it depends on the voice
  // (uniqueness, myth) and content (tribe, pain, promise) that precede it.
  'specificity_matrix',
] as const;

export const PHASE_B_SESSION: readonly ArtifactKey[] = ['session_bridge'] as const;

export const PHASE_C_MARKET: readonly ArtifactKey[] = [
  'core_belief',
  'packaging',
  'frictionless_purchase',
  'reach',
  'delivery',
  'spread',
  'surface_inventory',
  'tuning_fork',
  'golden_dm',
] as const;

export const PHASE_D_PUBLICATION: readonly ArtifactKey[] = ['landing_page'] as const;

export const ALL_ARTIFACT_KEYS: readonly ArtifactKey[] = [
  ...PHASE_A_CANVAS,
  ...PHASE_B_SESSION,
  ...PHASE_C_MARKET,
  ...PHASE_D_PUBLICATION,
];

// Hard-gate artifacts — Dossier cannot publish without these locked
export const HARD_GATE_ARTIFACTS: readonly ArtifactKey[] = [
  'uniqueness',
  'pain',
  'promise',
  'landing_page',
] as const;

// Compound screens (one screen hosts 3 sub-artifacts)
export type CompoundScreenKey = 'session' | 'marketing' | 'distribution' | 'communications';

export const COMPOUND_GROUPING: Record<CompoundScreenKey, readonly ArtifactKey[]> = {
  session: ['session_bridge'],
  marketing: ['core_belief', 'packaging', 'frictionless_purchase'],
  distribution: ['reach', 'delivery', 'spread'],
  communications: ['surface_inventory', 'tuning_fork', 'golden_dm'],
};

// ============================================================================
// Roast protocol
// ============================================================================

export type RoastQuadrant =
  | 'UL' // Upper-Left Essence (soul)
  | 'UR' // Upper-Right Essence (engineering)
  | 'LL' // Lower-Left Essence (resonance)
  | 'LR' // Lower-Right Essence (architecture)
  | '13' // Center / Logos
  | 'depth' // Depth check (Essence → Significance → Implications)
  | '27'; // Crystallization — the one irreversible action

export type RoastFinding = {
  quadrant: RoastQuadrant;
  weakness: string;
};

// ============================================================================
// Version row — the unit of persistence (append-only)
// ============================================================================

export type VersionRow<TContent = unknown> = {
  id: string;
  user_id: string;
  artifact_key: ArtifactKey;
  version: number;
  content: TContent; // shape depends on artifact_key — see artifact-schemas.ts
  specificity_score: number; // 0–10 float
  parent_version_id: string | null;
  roast_findings: RoastFinding[] | null;
  what_changed: string | null;
  is_locked: boolean;
  created_at: string; // ISO
  /**
   * Day 74 (Sasha 2026-05-22), Phase 2: 12-char content-hash of the prompt
   * that produced this row (stamped at insert time). NULL on legacy rows
   * from before the migration. Compared in the frontend against the current
   * PROMPT_VERSION[artifact_key] to flag "prompt-stale" artifacts.
   */
  prompt_version_at_lock: string | null;
  /**
   * Day 78 (Sasha 2026-05-21), Phase 4: 12-char content-hash of the founder
   * CONTEXT (per ARTIFACT_INPUTS) that produced this row. NULL on legacy rows
   * from before the migration. Compared in the frontend (Phase 4b) against
   * the current local-state input hash to flag "input-stale" artifacts
   * (mission edited, assets added, ZoG resnapshot since lock).
   */
  input_version_at_lock: string | null;
};

// ============================================================================
// State shapes — what the Context holds per artifact
// ============================================================================

export type ArtifactState = {
  key: ArtifactKey;
  latest: VersionRow | null; // latest row (may be unlocked)
  latestLocked: VersionRow | null; // latest locked row
  versionCount: number;
  isStale: boolean; // a direct parent was relocked after this artifact's latestLocked
  staleReason?: string; // user-facing copy, e.g. "Tribe was updated — re-Improve to refresh"
  /**
   * Day 74 (Sasha 2026-05-22): structured staleness pointer.
   *
   * Phase 1 axis — `parent_relocked`: one of this artifact's direct parents
   *   (per dependencyTree.ts) was re-locked after this artifact was locked.
   *   Re-derive cascades down the dependency tree.
   *
   * Phase 2 axis — `prompt_changed` (Day 74 evening): the prompt code that
   *   produced this artifact has been edited since it was locked. Surfaces
   *   when the row's `prompt_version_at_lock` ≠ current PROMPT_VERSION[key].
   *   Higher priority than `parent_relocked`: the founder's hand-tuned
   *   content is fine, but the AI's ceiling moved.
   *
   * Phase 4b axis — `input_changed` (Day 78 — Sasha 2026-05-29): the founder
   *   CONTEXT this artifact saw at lock time (mission, assets, ZoG snapshot
   *   per ARTIFACT_INPUTS[key]) has drifted from the current local state.
   *   Surfaces when row's `input_version_at_lock` ≠ inputVersionHash(current
   *   rootContext, key). Priority is between the two: prompt_changed first
   *   (the AI ceiling moved), input_changed second (founder reality drifted),
   *   parent_relocked third (internal cascade).
   *
   * Priority when multiple axes fire: prompt_changed > input_changed >
   * parent_relocked. The founder reads the copy to decide; a single
   * re-Improve resolves all three at once.
   */
  stalenessSource?:
    | {
        type: "parent_relocked";
        parent: ArtifactKey;
        parentLockedAt: string; // ISO
      }
    | {
        type: "prompt_changed";
        lockedVersion: string | null; // what was stamped at lock time (NULL = legacy)
        currentVersion: string; // current PROMPT_VERSION[key]
      }
    | {
        type: "input_changed";
        lockedVersion: string | null; // what was stamped at lock time (NULL = legacy)
        currentVersion: string; // current inputVersionHash(rootContext, key)
      };
};

// ============================================================================
// Improve flow — request / response
// ============================================================================

export type ImproveRequest = {
  artifact_key: ArtifactKey;
  current_content: unknown;
  current_specificity: number;
  sibling_artifacts: Partial<Record<ArtifactKey, { content: unknown; specificity: number }>>;
  root_context: {
    zog_snapshot: unknown;
    excalibur_data?: unknown;
  };
  previous_versions: unknown[];
};

export type ImproveResult = {
  roast_findings: RoastFinding[];
  improved_content: unknown;
  what_changed: string;
  specificity_score: number;
  specificity_delta: number;
  crystallized_action: string;
  diminishing_returns: boolean;
  /** Day 78 Phase 4: input-version hash stamped by the edge function. */
  input_version_at_lock?: string;
  /** Vision ↔ Viability (Domain 93): crash-test second pass. Absent on
   *  essence-class artifacts or when the best-effort pass returns null. */
  viability?: Viability | null;
};

export type GenerateResult = {
  content: unknown;
  initial_specificity: number;
  crystallized_action: string;
  /** Day 78 Phase 4: input-version hash stamped by the edge function. */
  input_version_at_lock?: string;
};

export type EdgeFunctionError = {
  error: 'insufficient_credit' | 'model_error' | 'invalid_json' | 'unknown';
  detail?: string;
};

// ============================================================================
// Dossier — composed view (not directly improved)
// ============================================================================

export type DossierSnapshot = {
  slug?: string;
  artifact_snapshot: Partial<Record<ArtifactKey, VersionRow>>;
  specificity_avg: number;
  locked_count: number;
  total_count: number; // always ALL_ARTIFACT_KEYS.length
  published_at?: string;
  is_live?: boolean;
};

export type LandingPagePublication = {
  slug: string;
  version: number;
  rendered_html: string;
  published_at: string;
  is_live: boolean;
};

// ============================================================================
// Bulk Improve — Day 74 (Sasha 2026-05-22)
// ============================================================================
//
// Hybrid cascade UX: user clicks "Improve all N stale" → context walks the
// dependency tree in topological order (parents first), calling Improve on
// each, surfacing the existing per-artifact review drawer for accept/reject
// at each step. Failures and skips don't abort the queue; they're tallied
// and reported at the end.
//
// `current` is set the moment we kick off the AI call and stays set through
// the review drawer's accept/reject. `remaining` is the not-yet-attempted
// queue. The four outcome arrays accumulate as we walk.

export type BulkImproveSkipReason =
  | "max_specificity" // artifact already at 10/10
  | "diminishing_returns" // model declined to propose
  | "no_latest"; // never generated a v1

export type BulkImproveProgress = {
  total: number;
  current: ArtifactKey | null;
  remaining: ArtifactKey[];
  accepted: ArtifactKey[];
  rejected: ArtifactKey[];
  skipped: Array<{ key: ArtifactKey; reason: BulkImproveSkipReason }>;
  failed: Array<{ key: ArtifactKey; message: string }>;
};

// ============================================================================
// Context shape
// ============================================================================

export type UniqueBusinessState = {
  artifacts: Partial<Record<ArtifactKey, ArtifactState>>;
  versionHistory: Partial<Record<ArtifactKey, VersionRow[]>>; // lazy-loaded

  // Transient UI
  pendingImprovement: { artifact_key: ArtifactKey; result: ImproveResult } | null;
  isImproving: ArtifactKey | null;
  isGenerating: ArtifactKey | null;
  /**
   * Day 74 (Sasha 2026-05-22): in-progress bulk cascade, null when idle.
   * The review drawer reads this to render "Step N of M · part of cascade"
   * and the canvas overview reads it to render the BulkImprovePanel.
   */
  bulkImprove: BulkImproveProgress | null;
  /**
   * Day 74 (Sasha 2026-05-22): after a user locks an upstream artifact whose
   * (transitive) descendants are also locked, this slice surfaces a one-tap
   * confirmation: "Re-derive N downstream artifacts?" The dialog reads this;
   * accepting calls startBulkImprove(candidates); dismissing clears it.
   */
  lockedCascadePrompt: {
    lockedKey: ArtifactKey;
    candidates: ArtifactKey[];
  } | null;
  /**
   * Day 53 night iter 3 (Sasha 2026-04-27): true while the initial
   * artifacts fetch is in flight. Lets surfaces (e.g. CanvasOverviewScreen)
   * distinguish "loading — don't render anything yet" from "fresh canvas
   * with zero artifacts — show empty state." Without this, the empty
   * state would flash for ~500ms on every page load before real data
   * arrives. Flips to false once the first fetch resolves (success or fail).
   */
  isInitializing: boolean;

  // Derived
  lockedCount: number;
  unlockedCount: number;
  avgSpecificity: number;
  stalenessWarnings: Array<{ artifact: ArtifactKey; reason: string }>;

  // Output
  dossier: DossierSnapshot | null;
};

export type UniqueBusinessActions = {
  generateArtifact: (key: ArtifactKey) => Promise<void>;
  improveArtifact: (key: ArtifactKey) => Promise<void>;
  acceptImprovement: () => Promise<void>;
  rejectImprovement: () => Promise<void>;
  lockArtifact: (key: ArtifactKey) => Promise<void>;
  unlockArtifact: (key: ArtifactKey) => Promise<void>;
  loadVersionHistory: (key: ArtifactKey) => Promise<void>;
  publishLandingPage: () => Promise<LandingPagePublication>;
  publishDossier: () => Promise<{ slug: string }>;
  /** Day 51 (Sasha 2026-04-25): human-override for AI-suggested score. */
  updateArtifactScore: (key: ArtifactKey, newScore: number) => Promise<void>;
  /**
   * Day 62 (Sasha 2026-05-05): restore the artifact to its v1 content.
   * Append-only — creates a new version row whose content is a copy of
   * v1's content_json + specificity_score. Preserves history (per the
   * paramount invariant). No-op if already at v1 or if v1 is missing.
   */
  restoreToV1: (key: ArtifactKey) => Promise<void>;
  /**
   * Day 74 (Sasha 2026-05-22): bulk cascade. Sorts keys topologically
   * (parents first), then walks the queue, surfacing the per-artifact
   * review drawer at each step. Idempotent: calling while already active
   * is a no-op.
   */
  startBulkImprove: (keys: ArtifactKey[]) => void;
  /**
   * Day 74 (Sasha 2026-05-22): abort the cascade. Any in-flight AI call
   * resolves naturally — only the queue advancement stops.
   */
  cancelBulkImprove: () => void;
  /**
   * Day 74 (Sasha 2026-05-22): dismiss the "Re-derive downstream?" prompt
   * that appeared after the user locked an upstream artifact. No-op if the
   * prompt is not currently open.
   */
  dismissLockedCascadePrompt: () => void;
};
