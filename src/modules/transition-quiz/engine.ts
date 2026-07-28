// Transition Quiz — diagnostic engine.
//
// Pure functions only: placement, aspect scoring, pattern/bottleneck/driver
// derivation, and route selection. No i18n, no React, no Supabase here — the
// page component wires this to copy and persistence.
//
// Source of truth: docs/specs/quiz/quiz_product_spec.md ("The diagnostic
// engine" table) + docs/holomaps/transition_holomap.md (63-cell grid, used
// verbatim as the seven answer options for each aspect question).

export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Aspect = "identity" | "economy" | "fit";

export const ASPECTS: Aspect[] = ["identity", "economy", "fit"];

export interface AspectAnswers {
  identity: [number, number, number];
  economy: [number, number, number];
  fit: [number, number, number];
}

export type Pattern =
  | "identity_bottleneck"
  | "economy_bottleneck"
  | "fit_bottleneck"
  | "full_liminality"
  | "settled_pattern"
  | "mixed";

export type Route = "directionCall" | "session" | "built" | "node" | "none";

export interface AspectScores {
  identity: number;
  economy: number;
  fit: number;
}

/** Round the average of three 1-7 answers to a clamped 1-7 integer. */
export function scoreAspect(answers: [number, number, number]): number {
  const avg = (answers[0] + answers[1] + answers[2]) / 3;
  return Math.min(7, Math.max(1, Math.round(avg)));
}

export function scoreAllAspects(answers: AspectAnswers): AspectScores {
  return {
    identity: scoreAspect(answers.identity),
    economy: scoreAspect(answers.economy),
    fit: scoreAspect(answers.fit),
  };
}

/** The lagging aspect (lowest score). Ties break identity > economy > fit. */
export function bottleneckOf(scores: AspectScores): Aspect {
  const order: Aspect[] = ["identity", "economy", "fit"];
  return order.reduce((min, a) => (scores[a] < scores[min] ? a : min), order[0]);
}

/** The leading aspect (highest score) — the growth driver. */
export function driverOf(scores: AspectScores): Aspect {
  const order: Aspect[] = ["identity", "economy", "fit"];
  return order.reduce((max, a) => (scores[a] > scores[max] ? a : max), order[0]);
}

export interface DiagnosticResult {
  scores: AspectScores;
  bottleneck: Aspect;
  driver: Aspect;
  pattern: Pattern;
  route: Route;
  /** Self-reported stage from S2/S3 — always the displayed stage name. */
  selfReportStage: Stage;
  /** Stage implied by the mean of the three aspect scores, independent of
   *  self-report. Used only to check the self-report against the aspect
   *  read, never to silently override it (see GAP_THRESHOLD below). */
  aspectStage: Stage;
  /** True when the two reads disagree by more than GAP_THRESHOLD stages —
   *  the sign of a contradictory answer set that a naive placement-only
   *  read would confidently paper over. */
  hasGap: boolean;
}

/** A self-report vs. aspect-score disagreement this large is worth naming
 *  to the user rather than silently resolving one way or the other — the
 *  fix for "confidently wrong read on contradictory answers." */
export const GAP_THRESHOLD = 2;

/** Stage implied by the three aspect scores alone, independent of what the
 *  person picked at S2. The nine aspect-question answer options are worded
 *  from the same 63-cell grid as the seven placement statements, so their
 *  average is a second, independent estimate of the same position. */
export function deriveStageFromAspects(scores: AspectScores): Stage {
  const avg = (scores.identity + scores.economy + scores.fit) / 3;
  return Math.min(7, Math.max(1, Math.round(avg))) as Stage;
}

/**
 * Pattern + route selection. Per the spec's Bridges section:
 *  - Identity-bottleneck (whichever aspect leads) -> node/community: the
 *    person needs field exposure before 1:1 work has traction.
 *  - Fit-bottleneck, and clearly behind both others -> the direct paid
 *    session: "the purest session case."
 *  - Economy-bottleneck -> Direction Call, the free front door into the
 *    session/BUILT ladder.
 *  - All three clustered high (full liminality) -> Direction Call, the
 *    ripest pattern on the map, given the most direct read.
 *  - All three low, or no clear single bottleneck -> Direction Call as the
 *    universal safe default (stages 4-7 always get the full ladder; see
 *    resolved decision F).
 *
 * `selfReportStage` is carried through only to compute the corroboration
 * check (`hasGap`) — it never changes which pattern/route gets picked. The
 * displayed stage name always stays the person's own words (S2's seven
 * first-person statements are, per the holomap, the actual diagnostic —
 * overriding them would replace their felt read with a number they didn't
 * say). What the aspect scores get to do is name it out loud when the two
 * disagree, instead of quietly picking a side.
 */
export function diagnose(scores: AspectScores, selfReportStage: Stage): DiagnosticResult {
  const { identity, economy, fit } = scores;
  const values = [identity, economy, fit];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;

  const bottleneck = bottleneckOf(scores);
  const driver = driverOf(scores);
  const aspectStage = deriveStageFromAspects(scores);
  const hasGap = Math.abs(aspectStage - selfReportStage) > GAP_THRESHOLD;

  const base = { scores, selfReportStage, aspectStage, hasGap };

  // Full liminality: all three clustered near the top (Liminality, stage 5+),
  // no clean single bottleneck to point at.
  if (spread <= 1 && (identity + economy + fit) / 3 >= 4.5) {
    return { ...base, bottleneck, driver, pattern: "full_liminality", route: "directionCall" };
  }

  // Settled-like pattern (defensive fallback — shouldn't normally be reached
  // since stages 1-3 branch away before the aspect questions, but a stage
  // 4-7 self-report with a uniformly low aspect read should still get the
  // full ladder per decision F, not be treated as a dead end).
  if (spread <= 1 && (identity + economy + fit) / 3 <= 2) {
    return { ...base, bottleneck, driver, pattern: "settled_pattern", route: "directionCall" };
  }

  if (bottleneck === "fit" && fit <= identity - 1 && fit <= economy - 1) {
    return { ...base, bottleneck, driver, pattern: "fit_bottleneck", route: "session" };
  }

  if (bottleneck === "identity") {
    return { ...base, bottleneck, driver, pattern: "identity_bottleneck", route: "node" };
  }

  if (bottleneck === "economy") {
    return { ...base, bottleneck, driver, pattern: "economy_bottleneck", route: "directionCall" };
  }

  return { ...base, bottleneck, driver, pattern: "mixed", route: "directionCall" };
}

/** Stages 1-3 stop at the not-yet branch (S3a); 4-7 go on to the aspect read. */
export function isNotYetStage(stage: Stage): boolean {
  return stage <= 3;
}

export function notYetVariant(stage: Stage): "settled" | "itch" | "tremors" | null {
  if (stage === 1) return "settled";
  if (stage === 2) return "itch";
  if (stage === 3) return "tremors";
  return null;
}

// ── Shareable/resumable encoding ──────────────────────────────────────────
// The whole quiz state is small enough to round-trip through a URL query
// param, so a result (or an in-progress answer set) can be shared or
// resumed with no server round-trip. Persistence to Supabase (below, via
// the page component) is for the dataset only — never required to render
// the free result.

export interface QuizShareState {
  stage: Stage;
  identity?: [number, number, number];
  economy?: [number, number, number];
  fit?: [number, number, number];
  email?: string;
}

export function encodeShareState(state: QuizShareState): string {
  const json = JSON.stringify(state);
  if (typeof window === "undefined") return btoa(json);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeShareState(token: string): QuizShareState | null {
  try {
    const json = typeof window === "undefined" ? atob(token) : decodeURIComponent(escape(atob(token)));
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return null;
    if (typeof parsed.stage !== "number" || parsed.stage < 1 || parsed.stage > 7) return null;
    return parsed as QuizShareState;
  } catch {
    return null;
  }
}
