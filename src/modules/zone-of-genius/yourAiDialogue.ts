/**
 * Your AI dialogue — the default door of the top talent reveal (Sasha, 2026-10-30).
 *
 * The player talks with OUR in-game AI ("Your AI / Твой ИИ") instead of copying a prompt
 * into their own ChatGPT. The dialogue only gathers material. The reveal itself runs on the
 * existing, unchanged frameworks: our AI answers ZONE_OF_GENIUS_PROMPT from the conversation,
 * and that answer plus the conversation goes to generateAppleseed() as the raw signal,
 * exactly the shape a pasted own-AI answer has.
 *
 * Buttons first, chat if you want (ai-familiar_tracker.md §20.3–20.4 step 1): each turn
 * returns `{text, ready, buttons[]}`; buttons are validated against the static catalog in
 * `src/data/yourAiCatalog.ts`. Prompt building and parsing are pure and live in `yourAiTurn.ts`.
 *
 * Turns go through an already deployed, cheap, guest-open edge function (a flash-lite class
 * model on the project's AI gateway), so this needs no new deploy. No model is named in UI.
 *
 * The AI OS (issue #275): the function takes one `prompt` string, so every turn carries the
 * personal prompt (`buildFamiliarPrompt`: about me + AI OS, or AI OS alone for a guest) first,
 * with the ZoG gathering job on top of it. The OS version comes from `AI_OS_VERSION` in
 * `familiar/aiOsSource.ts`, the single source `useFamiliar` reads.
 */
import { supabase } from "@/integrations/supabase/client";
import { ZONE_OF_GENIUS_PROMPT } from "@/prompts";
import type { PlayerCard } from "./yourAiCard";
import { buildTurnPrompt, parseTurn, transcriptOf, type DialogueMessage, type OsContext, type ParsedTurn } from "./yourAiTurn";

export * from "./yourAiTurn";

/** Deployed function used as the turn engine (guest-open, flash-lite class). */
export const YOUR_AI_FUNCTION = "library-advisor";

/** Our AI answers the unchanged ZONE_OF_GENIUS_PROMPT from the conversation. */
export const buildProfilePrompt = (messages: DialogueMessage[], ownAiNotes: string): string =>
  `${ZONE_OF_GENIUS_PROMPT}

=== EVERYTHING YOU KNOW ABOUT ME ===
You have no other memory of me. Use ONLY the conversation below (and the notes from my own AI, if present) as what you know about me. Ground every field in what I actually said; do not invent facts.

${transcriptOf(messages, ownAiNotes)}`;

/** Raw signal for generateAppleseed(): the profile JSON (fenced, so the deep profile can be
 *  extracted) followed by the conversation itself. Without a profile, the conversation alone. */
export const buildRawSignal = (profileText: string, messages: DialogueMessage[], ownAiNotes: string): string => {
  const transcript = transcriptOf(messages, ownAiNotes);
  const text = (profileText ?? "").trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  let json = "";
  if (first !== -1 && last > first) {
    try {
      json = JSON.stringify(JSON.parse(candidate.slice(first, last + 1)), null, 2);
    } catch {
      json = "";
    }
  }
  const head = json ? "```json\n" + json + "\n```" : text;
  return head
    ? `${head}\n\n--- My conversation with my AI ---\n${transcript}`
    : `--- My conversation with my AI ---\n${transcript}`;
};

const callYourAi = async (prompt: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke(YOUR_AI_FUNCTION, { body: { prompt } });
  if (error) throw new Error(error.message || "Your AI did not answer");
  if (data?.error) throw new Error(String(data.error));
  const text = typeof data?.generatedText === "string" ? data.generatedText : "";
  if (!text.trim()) throw new Error("Your AI returned nothing");
  return text;
};

export const askYourAi = async (
  messages: DialogueMessage[],
  ownAiNotes: string,
  lang: string | undefined,
  card?: PlayerCard | null,
  /** AI OS context for this session (`buildFamiliarPrompt` output); sent on every turn. */
  os?: OsContext | null,
): Promise<ParsedTurn> => {
  const turn = parseTurn(await callYourAi(buildTurnPrompt(messages, ownAiNotes, lang, card, os)));
  if (!turn.reply) throw new Error("Your AI returned nothing");
  return turn;
};

/** Material for the reveal. A failed profile step still reveals from the conversation. */
export const buildRevealSignal = async (messages: DialogueMessage[], ownAiNotes: string): Promise<string> => {
  let profile = "";
  try {
    profile = await callYourAi(buildProfilePrompt(messages, ownAiNotes));
  } catch (err) {
    console.warn("[YourAiDialogue] profile step failed, revealing from the conversation", err);
  }
  return buildRawSignal(profile, messages, ownAiNotes);
};
