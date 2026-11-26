// Your AI Console v1: prompt assembly, on the server (docs/specs/your-ai-console/console-v1.md).
// Pure: no Deno APIs, so vitest runs the very same code. The prompt text is in ./prompts.ts
// (generated, see scripts/sync-console-prompts.mjs).
import { AI_OS_PROMPT, CONSOLE_PROMPTS } from "./prompts.ts";

export type Locale = "en" | "es" | "ru";

export const BUTTON_PROMPT_KEYS: Record<number, string> = {
  1: "GOAL_SYNTHESIS",
  2: "CASE_AND_RISKS",
  3: "NEXT_VERSION",
  4: "ROAST_AND_ANOTHER_ROUND",
  5: "CRUCIBLE_POST_MORTEM",
};

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", es: "Spanish", ru: "Russian" };

/** Every prompt ends with «Answer in <player locale>». */
export const localeLine = (locale: Locale): string => `Answer in ${LANGUAGE_NAMES[locale]}.`;

export type AssembleInput = { button: number; context: string; previousCards: unknown[]; locale: Locale };

/**
 * AI OS v6.0 is the system message. The user message is the button prompt, the player context,
 * the previous cards as JSON, and the locale line last.
 */
export const assemble = ({ button, context, previousCards, locale }: AssembleInput): { system: string; user: string } => {
  const key = BUTTON_PROMPT_KEYS[button];
  const prompt = key ? CONSOLE_PROMPTS[key] : undefined;
  if (!prompt) throw new Error(`unknown button ${button}`);
  const contextLabel = button === 1 ? "STATED GOAL" : "PLAYER CONTEXT";
  const user = [
    prompt,
    `=== ${contextLabel} ===\n${context.trim() || "(nothing yet)"}`,
    `=== PREVIOUS CARDS (JSON) ===\n${JSON.stringify(previousCards, null, 2)}`,
    localeLine(locale),
  ].join("\n\n");
  const system = button === 1
    ? `${AI_OS_PROMPT}\n\nFor this Console turn, use the supplied goal and return the requested goal card. A readable goal needs no follow-up. When there is no readable goal, return the needs-goal card without a question.`
    : AI_OS_PROMPT;
  return { system, user };
};
