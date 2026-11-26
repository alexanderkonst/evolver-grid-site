/**
 * One Console button press, as a pure decision: what to do given the chain, the player and the model.
 * The panel calls this and renders the outcome; tests call it with a mocked `call`.
 * Spec: docs/specs/your-ai-console/console-v1.md (guards, order, laps).
 */
import type { PlayerCard } from "@/modules/zone-of-genius/yourAiCard";
import type { DialogueMessage } from "@/modules/zone-of-genius/yourAiTurn";
import { ConsoleError } from "./consoleClient";
import {
  buildConsoleContext,
  clearAfter,
  readStatedGoal,
  parseCardOutput,
  requestFor,
  setCard,
  survivorOf,
  type ButtonId,
  type ChainState,
  type ConsoleLocale,
  type ConsoleRequest,
} from "./phoenixChain";

export type Problem = "malformed" | "failed" | "cap" | "signin";

export type StepOutcome =
  /** Signed out: no model call was made. */
  | { kind: "problem"; problem: "signin"; chain: ChainState }
  /** Nothing to ground a goal in: ask the one question in the conversation, wait for the answer. */
  | { kind: "ask-goal"; chain: ChainState }
  | { kind: "card"; chain: ChainState }
  | { kind: "problem"; problem: Exclude<Problem, "signin">; chain: ChainState };

export type StepInput = {
  chain: ChainState;
  id: ButtonId;
  /** Signed-in player id; null for a guest. */
  ownerId: string | null;
  playerCard: PlayerCard | null;
  messages: DialogueMessage[];
  locale: ConsoleLocale;
  /** One model call for a request: the text it returned, or a `ConsoleError`. */
  call: (request: ConsoleRequest) => Promise<string>;
  now?: Date;
};

export const runStep = async ({ chain, id, ownerId, playerCard, messages, locale, call, now = new Date() }: StepInput): Promise<StepOutcome> => {
  if (!ownerId) return { kind: "problem", problem: "signin", chain };
  // Re-running N clears the cards after N.
  const base = clearAfter(chain, id, now);
  // No goal, no invention: with nothing to ground it in, button 1 asks one question instead of calling the model.
  const context = id === 1 ? readStatedGoal(messages) : buildConsoleContext(playerCard, messages);
  if (id === 1 && !context && !survivorOf(base)) return { kind: "ask-goal", chain: base };
  let text: string;
  try {
    text = await call(requestFor(base, id, context, locale));
  } catch (err) {
    const code = err instanceof ConsoleError ? err.code : "failed";
    const problem: Problem = code === "daily_cap_reached" ? "cap" : code === "sign_in_required" ? "signin" : "failed";
    return { kind: "problem", problem, chain: base } as StepOutcome;
  }
  const parsed = parseCardOutput(id, text);
  if (!parsed.ok) return { kind: "problem", problem: "malformed", chain: base };
  if (parsed.kind === "needsGoal") return { kind: "ask-goal", chain: base };
  return { kind: "card", chain: setCard(base, id, { data: parsed.data, full: parsed.full, at: now.toISOString() }, now) };
};
