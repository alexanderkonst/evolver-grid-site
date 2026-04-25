/**
 * Unique Business Builder v2.0 — TypeScript types
 *
 * Derives from: docs/specs/unique-business-builder/unique-business-builder_product_spec.md
 *              + unique-business-builder_architecture_spec.md
 *              + artifact_prompts_spec.md
 *
 * Paramount invariant: specificity is monotonic, versions are append-only.
 * An accepted Improve creates a new VersionRow; previous rows are never overwritten.
 */

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
};

// ============================================================================
// State shapes — what the Context holds per artifact
// ============================================================================

export type ArtifactState = {
  key: ArtifactKey;
  latest: VersionRow | null; // latest row (may be unlocked)
  latestLocked: VersionRow | null; // latest locked row
  versionCount: number;
  isStale: boolean; // a sibling was locked after this artifact's latestLocked
  staleReason?: string; // e.g., "Tribe was re-locked on 2026-04-24"
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
};

export type GenerateResult = {
  content: unknown;
  initial_specificity: number;
  crystallized_action: string;
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
// Context shape
// ============================================================================

export type UniqueBusinessState = {
  artifacts: Partial<Record<ArtifactKey, ArtifactState>>;
  versionHistory: Partial<Record<ArtifactKey, VersionRow[]>>; // lazy-loaded

  // Transient UI
  pendingImprovement: { artifact_key: ArtifactKey; result: ImproveResult } | null;
  isImproving: ArtifactKey | null;
  isGenerating: ArtifactKey | null;

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
};
