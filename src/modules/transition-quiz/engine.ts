// Transition Quiz — diagnostic engine, vNext (lean 4-question edition).
//
// Pure functions only: no i18n, no React, no Supabase here — the page
// component wires this to copy and persistence.
//
// Source of truth: the GFOA design conversation's final locked SOW
// ("WHERE ARE YOU? Lean Quiz Specification, Use Instructions & Build SOW —
// vNext · Four-Question Edition", sections 1-18). That SOW explicitly
// supersedes the earlier 17-question / discriminator design that appears
// earlier in the same conversation — Sasha rejected it as overkill and the
// four-question design is the one carrying a Definition of Done (§18).
//
// Governing sentence (§18): "Four questions are enough to locate the
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

export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** §7 — Q2, "What is actually unclear?" (Uniqueness classifier). */
export type UniquenessCategory =
  | "discovery"
  | "recognition"
  | "integration"
  | "vehicle"
  | "transmission"
  | "scaling";

/** §8 — Q3, developmental position of the emerging work.
 *  absent -> fragmented -> felt -> named -> built -> working */
export type EmergingWorkStage =
  | "not_visible"
  | "fragments"
  | "felt"
  | "named"
  | "built"
  | "working";

/** §9 — Q4, live real-world consequence ("clarity unlock"). */
export type ClarityUnlock =
  | "personal"
  | "direction"
  | "current_work"
  | "emerging_business"
  | "near_term_exchange";

/** §10 — optional post-result commercial qualifier. */
export type BuyingFrame = "open" | "mixed" | "open_no_history" | "closed";

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
  clarityUnlock: ClarityUnlock;
}

/**
 * §13 Direction Call Bridge — the pre-qualifier gate. Only when this is
 * true does the optional Buying Frame question (§10) get shown at all.
 * All four conditions must hold:
 *  - Transition is Rupture, Liminality, or Reorientation (stages 4-6);
 *  - Uniqueness problem is Recognition or Integration;
 *  - the emerging work is fragmented, felt-but-unnamed, or named-but-unbuilt;
 *  - the live vehicle is open (an emerging business or near-term exchange).
 */
export function meetsDirectionCallGate(answers: CoreAnswers): boolean {
  const stageInRange = answers.stage >= 4 && answers.stage <= 6;
  const uniquenessFits = answers.uniqueness === "recognition" || answers.uniqueness === "integration";
  const workStageFits =
    answers.emergingWorkStage === "fragments" ||
    answers.emergingWorkStage === "felt" ||
    answers.emergingWorkStage === "named";
  const vehicleOpen =
    answers.clarityUnlock === "emerging_business" || answers.clarityUnlock === "near_term_exchange";
  return stageInRange && uniquenessFits && workStageFits && vehicleOpen;
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
export function isCrossedPeer(answers: CoreAnswers): boolean {
  if (answers.uniqueness === "scaling") return true;
  return (
    answers.stage === 7 &&
    (answers.emergingWorkStage === "working" || answers.uniqueness === "transmission")
  );
}

/**
 * §10 decision rules, once the gate above already holds (i.e. the person
 * is only ever asked the Buying Frame question after the other four
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
// short supporting clause each from emergingWorkStage and clarityUnlock.
// All actual copy lives in locales; this just picks the keys.

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

export function clarityClauseKey(clarity: ClarityUnlock): string {
  return `quiz.result.clarityClause.${clarity}`;
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
  clarityUnlock?: ClarityUnlock;
  buyingFrame?: BuyingFrame;
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
