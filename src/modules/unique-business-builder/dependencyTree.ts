/**
 * Unique Business Builder — derivation dependency tree.
 *
 * Encodes which artifact derives from which. Source of truth for:
 *   1. Parent-aware staleness compute (an artifact is stale iff one of its
 *      direct parents was relocked after this artifact's own latestLock).
 *   2. "Re-derive downstream?" dialog when a user locks an upstream artifact.
 *   3. "derives from: X, Y" hint under each artifact card.
 *
 * Edges are grounded in the prompt configs in
 * `supabase/functions/_shared/ubb-prompts.ts` — each PARENT below is mentioned
 * explicitly in the corresponding artifact's generationGuidance as input/source.
 *
 * Two roots: `uniqueness` (sourced from external ZoG snapshot) and
 * `surface_inventory` (sourced from the founder's actual deployed surfaces).
 *
 * Day 74 (Sasha 2026-05-22): introduced as part of the hybrid staleness UX.
 */

import type { ArtifactKey } from "./types";
import { ALL_ARTIFACT_KEYS } from "./types";

/**
 * Direct parents per artifact. Empty array = root.
 *
 * When a parent is relocked AFTER this artifact's own latestLock, this artifact
 * becomes stale. The order within each array is the user-facing display order
 * (closest semantic parent first) — used for the "derives from: X, Y" hint.
 */
export const PARENTS: Record<ArtifactKey, readonly ArtifactKey[]> = {
  // Phase A — Canvas
  uniqueness: [],
  myth: ["uniqueness"],
  tribe: ["myth"],
  pain: ["tribe", "uniqueness"],
  promise: ["pain", "uniqueness"],
  lead_magnet: ["promise", "pain", "tribe", "myth", "uniqueness", "specificity_matrix"],
  value_ladder: ["promise", "tribe"],
  // specificity_matrix uses the founder's full voice + content to author reveal lines
  specificity_matrix: ["uniqueness", "myth", "tribe", "pain", "promise"],

  // Phase B — Session bridge
  // "Pain + Promise → Transformational Result" — prompts.ts L543
  session_bridge: ["pain", "promise"],

  // Phase C — Market path
  // core_belief is the surface position of the deeper myth — prompts.ts L595–L598
  core_belief: ["myth"],
  // packaging gives value SHAPE; tier ladder maps to value_ladder rungs — prompts.ts L617, L640
  packaging: ["promise", "value_ladder"],
  // frictionless_purchase anchors price (value_ladder), pre-answers objections (pain), CTAs the promise
  frictionless_purchase: ["pain", "promise", "value_ladder"],
  // reach = where the right people ARE
  reach: ["tribe"],
  // delivery = how packaging reaches the buyer
  delivery: ["packaging"],
  // spread = tribe-driven enthusiasm sharing the promise
  spread: ["tribe", "promise"],

  // Phase C — Communications
  // surface_inventory = inventory of founder's actual deployed surfaces; not derived from canvas
  surface_inventory: [],
  // tuning_fork voice = uniqueness + myth; subject = what tribe gets (promise) — prompts.ts L832
  tuning_fork: ["uniqueness", "myth", "tribe", "promise"],
  // golden_dm = response to hand-raiser who engaged with the tuning_fork — prompts.ts L905
  golden_dm: ["tuning_fork", "pain", "promise"],

  // Phase D — Publication
  // landing_page composes from: frictionless_purchase + pain + promise + value_ladder + tuning_fork
  // — prompts.ts L1000–L1001 (explicit)
  landing_page: ["frictionless_purchase", "pain", "promise", "value_ladder", "tuning_fork"],
};

/**
 * Direct children — inverted index of PARENTS. Built once at module load.
 * Used by the "re-derive downstream?" dialog when a user locks an upstream.
 */
export const CHILDREN: Record<ArtifactKey, readonly ArtifactKey[]> = (() => {
  const map = {} as Record<ArtifactKey, ArtifactKey[]>;
  for (const k of ALL_ARTIFACT_KEYS) map[k] = [];
  for (const child of ALL_ARTIFACT_KEYS) {
    for (const parent of PARENTS[child]) {
      map[parent].push(child);
    }
  }
  return map as Record<ArtifactKey, readonly ArtifactKey[]>;
})();

/**
 * Transitive downstream — every artifact that (eventually) derives from `key`.
 * BFS through CHILDREN. Excludes `key` itself. Deduped.
 *
 * Used when a user locks an upstream artifact: the dialog proposes re-deriving
 * the full descendant set, not just direct children — a change to `uniqueness`
 * legitimately invalidates 17 downstream artifacts and the user should see that.
 */
export function getDownstream(key: ArtifactKey): ArtifactKey[] {
  const seen = new Set<ArtifactKey>();
  const queue: ArtifactKey[] = [...CHILDREN[key]];
  while (queue.length) {
    const next = queue.shift()!;
    if (seen.has(next)) continue;
    seen.add(next);
    for (const grandchild of CHILDREN[next]) {
      if (!seen.has(grandchild)) queue.push(grandchild);
    }
  }
  return Array.from(seen);
}

/**
 * Transitive upstream — every artifact `key` (eventually) derives from.
 * BFS through PARENTS. Excludes `key` itself. Deduped.
 */
export function getUpstream(key: ArtifactKey): ArtifactKey[] {
  const seen = new Set<ArtifactKey>();
  const queue: ArtifactKey[] = [...PARENTS[key]];
  while (queue.length) {
    const next = queue.shift()!;
    if (seen.has(next)) continue;
    seen.add(next);
    for (const grand of PARENTS[next]) {
      if (!seen.has(grand)) queue.push(grand);
    }
  }
  return Array.from(seen);
}

/**
 * True iff `key` is a root (derives only from external context).
 */
export function isRoot(key: ArtifactKey): boolean {
  return PARENTS[key].length === 0;
}

// ============================================================================
// Validation — runs at module load in dev to catch cycles + dangling refs.
// ============================================================================

/* istanbul ignore next */
if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
  // Dangling parent refs
  for (const k of ALL_ARTIFACT_KEYS) {
    for (const p of PARENTS[k]) {
      if (!ALL_ARTIFACT_KEYS.includes(p)) {
        // eslint-disable-next-line no-console
        console.error(`[dependencyTree] ${k} lists unknown parent: ${p}`);
      }
    }
  }
  // Cycle detection via DFS
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color: Record<string, number> = {};
  for (const k of ALL_ARTIFACT_KEYS) color[k] = WHITE;
  const visit = (k: ArtifactKey, path: ArtifactKey[]): void => {
    if (color[k] === GRAY) {
      // eslint-disable-next-line no-console
      console.error(`[dependencyTree] cycle detected: ${[...path, k].join(" → ")}`);
      return;
    }
    if (color[k] === BLACK) return;
    color[k] = GRAY;
    for (const p of PARENTS[k]) visit(p, [...path, k]);
    color[k] = BLACK;
  };
  for (const k of ALL_ARTIFACT_KEYS) if (color[k] === WHITE) visit(k, []);
}
