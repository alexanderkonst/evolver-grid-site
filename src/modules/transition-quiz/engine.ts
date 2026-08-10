// Transition Quiz — diagnostic engine, vNext (lean 3-question edition).
//
// Pure functions only: no i18n, no React, no Supabase here — the page
// component wires this to copy and persistence.
//
// Source of truth: the GFOA design conversation's final locked SOW,
// subsequently reduced to the three-question edition described below.
// The original SOW explicitly
// supersedes the earlier 17-question / discriminator design that appears
// earlier in the same conversation — Sasha rejected it as overkill and the
// lean design is the one carrying a Definition of Done (§18).
//
// Governing sentence (§18): "A few questions are enough to locate the
// crossing. The conversation exists to see what is actually crossing."
//
// Standing laws carried forward from the earlier (superseded) design,
// per explicit instruction — never revoked by the roast that cut 17
// questions to 4:
//  - stages 1-3 get a no-ask ending with a per-stage gift (settled / itch /
//    tremors), same content as before;
//  - "Money" not "Economy" in all user-facing copy;
//  - no internal jargon on screen.
// The Recognition Delta question from the earlier design was NOT carried
// into the final SOW (§16, §18) — it is not implemented here.
//
// 2026-07-29 follow-up: Q4 ("clarity unlock" / "if that sentence appeared
// today...") was cut entirely, making this a three-question quiz. The
// clarity_unlock DB column and historical rows are untouched; the client
// simply stops sending it. See TransitionQuizPage.tsx for the flow change.

export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** §7 — Q2, "What is actually unclear?" (Uniqueness classifier). */
export type UniquenessCategory =
  | "discovery"
  | "recognition"
  | "integration"
  | "vehicle"
  | "transmission"
  | "scaling";

/** §8 — Q3, developmental position of the emerging work, low to high
 *  formedness of the next chapter (Day 148 reorder — "felt" before
 *  "suspected": a formless pull precedes a content-bearing hypothesis):
 *  not_visible -> felt -> suspected -> named -> built -> working -> delivering.
 *  Union order is documentation only; routing and copy key off the value. */
export type EmergingWorkStage =
  | "current_chapter"
  | "not_visible"
  | "felt"
  | "suspected"
  | "named"
  | "built"
  | "working"
  | "delivering";

/** §10 — optional post-result commercial qualifier. */
export type BuyingFrame = "open" | "mixed" | "open_no_history" | "closed";

/**
 * Means question (2026-07-29, Quiz v2.1 follow-up) — companion to the
 * Buying Frame qualifier. Shown only on ripe routes, only after a
 * non-"closed" Buying Frame answer, right before the Direction Call
 * block reveals. Doesn't change routing — it's logged alongside the
 * completion, not gated on.
 */
export type Means = "yes_comfortably" | "yes_if_fit" | "maybe_depending" | "not_now";

export type Route = "directionCall" | "crossedPeer" | "none";

export function isNotYetStage(stage: Stage): boolean {
  return stage <= 3;
}

export function notYetVariant(stage: Stage): "settled" | "itch" | "tremors" | null {
  if (stage === 1) return "settled";
  if (stage === 2) return "itch";
  if (stage === 3) return "tremors";
  return null;
}

export interface CoreAnswers {
  stage: Stage;
  uniqueness: UniquenessCategory;
  emergingWorkStage: EmergingWorkStage;
}

/**
 * §13 Direction Call Bridge — the pre-qualifier gate. Only when this is
 * true does the optional Buying Frame question (§10) get shown at all.
 *
 * Widened (2026-07-29, Quiz v2.1): the CTA now shows for any of stages
 * 4, 5, 6, or 7 — regardless of uniqueness class. That answer is still
 * computed and logged for the dataset; it just no longer gates whether
 * the Direction Call appears. Q4 (clarity unlock) itself was cut from
 * the quiz entirely later the same day (three-question edition) — see
 * the header comment above. The only remaining exclusions are handled
 * elsewhere in computeRouting:
 * a crossed-peer route (isCrossedPeer) replaces this with the peer door,
 * and a "closed" Buying Frame answer (routeAfterBuyingFrame) still ends
 * in the honest ending instead of the Direction Call.
 */
export function meetsDirectionCallGate(answers: CoreAnswers): boolean {
  return answers.stage >= 4 && answers.stage <= 7;
}

/**
 * New route (crossed/peer ending): when someone has already crossed into
 * the new chapter (Q1 = stage 7) AND the work is either already working
 * (Q3 = "working") or the remaining friction is transmission-shaped
 * (Q2 = "transmission"), the standard result body, Direction Call bridge,
 * and Buying Frame qualifier are all replaced by the peer ending — a
 * different conversation than a Direction Call, offered as such.
 *
 * "scaling" (Q2) is an additional, independent trigger for the same peer
 * ending: someone whose uniqueness already monetizes, whose positioning is
 * focused, and whose funnel already works is a peer regardless of what
 * stage (Q1) they picked.
 */
/**
 * New Q3 option (current_chapter), mirroring the stage-1 no-ask branch
 * ("What I do works for me. I'm not looking for a new chapter."): the
 * person is explicitly not oriented toward a next chapter, so they must
 * not get a next-chapter read, and must not be offered the Direction
 * Call. This check is orthogonal to stage/uniqueness — it always wins.
 */
export function isNotSeeking(answers: CoreAnswers): boolean {
  return answers.emergingWorkStage === "current_chapter";
}

export function isCrossedPeer(answers: CoreAnswers): boolean {
  if (answers.uniqueness === "scaling") return true;
  return (
    answers.stage === 7 &&
    (answers.emergingWorkStage === "working" ||
      answers.emergingWorkStage === "delivering" ||
      answers.uniqueness === "transmission")
  );
}

/**
 * §10 decision rules, once the gate above already holds (i.e. the person
 * is only ever asked the Buying Frame question after the core
 * conditions are already strong — see §10 "Important decision rule"):
 * every answer except "closed" leads to the Direction Call.
 */
export function routeAfterBuyingFrame(buyingFrame: BuyingFrame): Route {
  return buyingFrame === "closed" ? "none" : "directionCall";
}

export interface RouteResult {
  /** Whether the optional Buying Frame qualifier should even be shown. */
  showBuyingFrame: boolean;
  /** Route to use before the qualifier is answered (or when there is none
   *  to ask at all) — "directionCall" once the qualifier resolves it,
   *  "none" if the gate itself already failed. */
  route: Route;
}

/** Full routing decision for a completed core-answer set, before the
 *  optional qualifier has been answered (or when there is none to ask). */
export function computeRouting(answers: CoreAnswers): RouteResult {
  if (isNotSeeking(answers)) {
    return { showBuyingFrame: false, route: "none" };
  }
  if (isCrossedPeer(answers)) {
    return { showBuyingFrame: false, route: "crossedPeer" };
  }
  const eligible = meetsDirectionCallGate(answers);
  return { showBuyingFrame: eligible, route: eligible ? "directionCall" : "none" };
}

// ── Result copy keys ────────────────────────────────────────────────────
// The 3-beat lean result architecture (§12): Chapter / Real Problem / What
// Comes Next. Beat 1 is keyed by stage, Beat 2+3 are keyed by uniqueness
// category (the strongest signal from §14's authored examples), with a
// short supporting clause from emergingWorkStage. All actual copy lives
// in locales; this just picks the keys.

export function chapterKeyForStage(stage: Stage): string {
  // Stages 1-3 never reach this — they stop at the not-yet branch.
  return `quiz.result.chapter.${Math.max(4, Math.min(7, stage))}`;
}

export function resultTemplateKey(uniqueness: UniquenessCategory): string {
  return `quiz.result.beats.${uniqueness}`;
}

export function workStageClauseKey(stage: EmergingWorkStage): string {
  return `quiz.result.workStageClause.${stage}`;
}

// ── Result Experience EXT (Day 142+) ────────────────────────────────────
// Additive only — v1's routing, chapter/beat keying, and ResultScreen stay
// untouched. See docs/specs/quiz/ext_implementation_brief.md and
// docs/specs/quiz/ext_change_map.md §5 for the source spec.

/** brief §25 — "v1" is the existing 3-beat architecture (implicit/legacy,
 *  never written explicitly by new code but kept in the domain for the
 *  saved-result / analytics "absence means v1" convention, change-map §3). */
export type ResultVersion = "v1" | "ext-a" | "ext-b";

/** brief §4/§16 item 6 — synthesis family. Phase 6 widens this to the full
 *  four-family set named in the brief: coherence, form, release, contact. */
export type SynthesisFamily = "coherence" | "form" | "release" | "contact";

/**
 * Phase 6 (brief §4/§20/§27 Phase 6) widens the EXT gate from the single
 * representative pattern to the full stage 4-7 range, for any uniqueness /
 * emergingWorkStage combination, still excluding crossed peers.
 * Crossed-peer already absorbs "scaling" and the mature stage-7 combos
 * (working/delivering emerging work, or transmission uniqueness at stage 7),
 * so EXT never sees them — see isCrossedPeer above. Callers should still
 * gate on `computeRouting(answers).route !== "crossedPeer"` themselves
 * since isCrossedPeer alone doesn't cover every crossed-peer trigger
 * combination as cleanly as the routing result does; this function
 * re-checks it directly too so it's safe to call standalone.
 */
export function isExtEligible(answers: CoreAnswers): boolean {
  if (isNotSeeking(answers)) return false;
  return !isCrossedPeer(answers) && answers.stage >= 4 && answers.stage <= 7;
}

/**
 * brief §4 — Sasha's product decision (do not improvise). Stage-4 release
 * rule is checked first, since at stage 4 (The Ending) the old identity is
 * still what's organizing the field regardless of uniqueness, as long as
 * the person hasn't already named a vehicle or transmission problem.
 */
export function synthesisFamilyFor(answers: CoreAnswers): SynthesisFamily {
  // Stage 4 (The Ending): for the three "still forming" uniqueness answers,
  // the live issue is that the old role/identity is still organizing the
  // decisions — release, not coherence or form, is the correct read this
  // early. Checked first per brief §4.
  if (
    answers.stage === 4 &&
    (answers.uniqueness === "discovery" ||
      answers.uniqueness === "recognition" ||
      answers.uniqueness === "integration")
  ) {
    return "release";
  }
  // A named vehicle problem (an offer/market expression that doesn't exist
  // yet) is always a form problem, at any eligible stage.
  if (answers.uniqueness === "vehicle") return "form";
  // A named transmission problem (working business, message not landing) is
  // always a contact problem: reality hasn't received the direction yet.
  if (answers.uniqueness === "transmission") return "contact";
  // Past stage 4, "discovery" (still doesn't know what's unique) is read as
  // a contact problem too: the direction hasn't met enough reality to
  // become legible, even to the person themselves.
  if (answers.uniqueness === "discovery") return "contact";
  // Past stage 4, "recognition" and "integration" are coherence problems:
  // the parts are sensed/present but not yet organized into one relationship.
  if (answers.uniqueness === "recognition" || answers.uniqueness === "integration") return "coherence";
  // Fallback (should not be reached given the uniqueness union above, but
  // keeps this total rather than partial).
  return "coherence";
}

/**
 * brief §25 — deterministic hash-based EXT-A/EXT-B assignment, keyed off
 * the share-encoded answers string so the same result always lands on the
 * same variant (stable across reloads/shares). The hash logic is real and
 * stays wired so this function is switchable later without a rewrite — but
 * per Phase 3 scope (brief §24, "one complete EXT prototype... before
 * multiplying the copy system"), only EXT-A copy exists today (EXT-B has
 * no authored copy module yet), so this short-circuits to "ext-a" until
 * EXT-B's copy is written.
 */
export function extVariantFor(seed: string): "ext-a" | "ext-b" {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hashedVariant: "ext-a" | "ext-b" = hash % 2 === 0 ? "ext-a" : "ext-b";
  void hashedVariant; // computed for future use — see comment above.
  return "ext-a";
}

// ── Shareable/resumable encoding ──────────────────────────────────────────
// Small enough to round-trip through a URL query param — a result can be
// shared or resumed with no server round-trip. Supabase persistence (via
// the page component) is for the dataset only, never required to render
// the free result.

export interface QuizShareState {
  stage: Stage;
  uniqueness?: UniquenessCategory;
  emergingWorkStage?: EmergingWorkStage;
  buyingFrame?: BuyingFrame;
  means?: Means;
  email?: string;
  /** Result Experience EXT (Day 142) — optional, additive. Absent on every
   *  token encoded before this field existed; decodeShareState above never
   *  throws on its absence, and callers treat "undefined" as "v1". */
  resultVersion?: "v1" | "ext-a" | "ext-b";
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
    // resultVersion is optional (added for Result Experience EXT, Day 142) —
    // old tokens simply lack the field, decoded here as `undefined`, and
    // absence is treated as "v1" by convention at the call site. No throw.
    return parsed as QuizShareState;
  } catch {
    return null;
  }
}
