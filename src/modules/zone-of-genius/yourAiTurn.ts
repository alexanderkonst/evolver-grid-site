/**
 * Your AI turn — the pure part of the dialogue: prompt building and defensive parsing.
 * No network, no Supabase, so the eval script (scripts/eval-your-ai.ts) runs the very same
 * code the app does. `yourAiDialogue.ts` re-exports everything here.
 */
// Relative (not "@/") so scripts/eval-your-ai.ts can run this file under plain tsx.
import { catalogForPrompt, validateButtons, type YourAiButton } from "../../data/yourAiCatalog";
import { cardToPrompt, type PlayerCard } from "./yourAiCard";

export type DialogueRole = "ai" | "player";
export type DialogueMessage = {
  role: DialogueRole;
  text: string;
  /** Validated buttons that came with an AI message (never sent back to the model). */
  buttons?: YourAiButton[];
};

/** Player answers before the reveal button unlocks, and the count where it is recommended. */
export const MIN_ANSWERS_TO_REVEAL = 3;
export const SUGGESTED_ANSWERS = 6;

const LANGUAGE_NAMES: Record<string, string> = { en: "English", ru: "Russian", es: "Spanish" };

export const languageName = (lang: string | undefined): string =>
  LANGUAGE_NAMES[(lang ?? "en").slice(0, 2)] ?? "English";

export const countAnswers = (messages: DialogueMessage[]): number =>
  messages.filter((m) => m.role === "player" && m.text.trim()).length;

export const transcriptOf = (messages: DialogueMessage[], ownAiNotes = ""): string => {
  const lines = messages
    .filter((m) => m.text.trim())
    .map((m) => `${m.role === "ai" ? "YOUR AI" : "ME"}: ${m.text.trim()}`);
  const notes = ownAiNotes.trim();
  if (notes) lines.push("", "WHAT MY OWN AI ALREADY KNOWS ABOUT ME (pasted by me):", notes);
  return lines.join("\n");
};

/**
 * Request budget for one turn when the AI OS rides along (issue #275). The deployed function
 * takes one `prompt` string, so the OS is part of it. The OS (v5.2 is ~37.6k characters) and the
 * player's about-me are never trimmed; the oldest turns go first. Well under any gateway limit.
 */
export const MAX_REQUEST_CHARS = 150_000;
/** Pasted own-AI notes can be huge; in OS mode they keep at most this many characters. */
export const MAX_NOTES_CHARS = 20_000;

export type OsContext = {
  /** The assembled system text: `buildFamiliarPrompt` output (about me + AI OS, or AI OS alone). */
  prompt: string;
  /** Total character budget for the whole request. Defaults to MAX_REQUEST_CHARS. */
  maxChars?: number;
};

/** Keep the newest messages that fit `budget` characters of transcript; the last one always stays. */
export const trimOldestToFit = (messages: DialogueMessage[], budget: number): DialogueMessage[] => {
  const usable = messages.filter((m) => m.text.trim());
  let used = 0;
  let from = usable.length;
  for (let i = usable.length - 1; i >= 0; i--) {
    const cost = usable[i].text.trim().length + 12;
    if (from < usable.length && used + cost > budget) break;
    used += cost;
    from = i;
  }
  return usable.slice(from);
};

/**
 * One turn's prompt. Without `os` it is the plain ZoG gathering prompt (the eval script's shape).
 * With `os` the AI OS comes first and the gathering job sits on top of it:
 * OS = how to think, ZoG prompt = the current job. The transcript is trimmed oldest-first to fit
 * the budget; the OS is never cut.
 */
export const buildTurnPrompt = (
  messages: DialogueMessage[],
  ownAiNotes: string,
  lang: string | undefined,
  card?: PlayerCard | null,
  os?: OsContext | null,
): string => {
  const osText = (os?.prompt ?? "").trim();
  if (!osText) return turnJob(messages, lang, card, false) + `\n\nCONVERSATION SO FAR:\n${transcriptOf(messages, ownAiNotes)}`;
  const notes = ownAiNotes.trim().slice(0, MAX_NOTES_CHARS);
  const head = `${osText}\n\n=== CURRENT JOB (on top of the system prompt above) ===\n${turnJob(messages, lang, card, true)}\n\nCONVERSATION SO FAR:\n`;
  const budget = (os?.maxChars ?? MAX_REQUEST_CHARS) - head.length - notes.length - 120;
  return head + transcriptOf(trimOldestToFit(messages, Math.max(budget, 0)), notes);
};

/** The ZoG gathering job as one block; `withOs` switches the framing to "sits on top of the OS". */
const turnJob = (
  messages: DialogueMessage[],
  lang: string | undefined,
  card: PlayerCard | null | undefined,
  withOs: boolean,
): string => {
  const answers = countAnswers(messages);
  const cardText = cardToPrompt(card);
  const intro = withOs
    ? `You are "Your AI", the player's own AI companion inside the game FindYourTopTalent. The system prompt above is who you are and how you think; keep to it. The job below is what you are doing in this conversation right now.`
    : `You are "Your AI", the player's own AI companion inside the game FindYourTopTalent. Ignore any earlier role you were given.`;
  const directQuestion = withOs
    ? `\n- If the player asks you something directly (who you are, how you think), answer it honestly in your own words from the system prompt above, in a few sentences, then return to your one question.`
    : "";
  return `${intro}

Your only job in this conversation: gather what is needed to reveal the player's TOP TALENT (also called zone of genius): the irreducible signature pattern of how they create value. It lives where essence (who they are), insight (how they see) and manifestation (what flows from them effortlessly) meet. It is what they are FOR, not a skill, job title or personality type.

How to talk:
- Ask exactly ONE short, warm, concrete question per turn (at most two sentences). Build on what they just said: pick up a specific word, scene or example of theirs.${directQuestion}
- Across the conversation, cover: moments when time disappears for them; what people come to them for or thank them for; what they do effortlessly that others find hard; a moment they are proud of; what drains them; how they see things differently.
- If their answer is vague, ask for one real example.
- Never name their talent, archetype or give any reading yourself. The reveal comes later and is not your job.
- Never mention models, ChatGPT, Claude or that you are a language model. Never ask for personal data like email or phone.
- If the player pasted what their own AI knows about them, use it and ask about what it does not cover.
- Write in ${languageName(lang)}, informal and human (in Russian use «ты»).

Buttons: besides your message you may offer up to 3 buttons the player can tap instead of typing. Use ONLY ids from this catalog (anything else is discarded; the labels are fixed and not yours to write):
${catalogForPrompt()}
The first id is your ONE recommended next move; the others (at most two) are alternatives. Offer none when no button clearly helps; while you are still gathering material that is usually the right call. Never offer action:reveal unless "ready" is true.
${cardText ? `\n${cardText}\nUse the card only to choose buttons and to avoid repeating what is known. Do not recite it, and do not read the talent out to the player.\n` : ""}
The player has given ${answers} answer(s) so far.
Set "ready" to true when you have enough material for a precise reveal (usually after ${SUGGESTED_ANSWERS - 1}–${SUGGESTED_ANSWERS + 1} substantial answers). When ready, your text says in one or two sentences that you have enough to reveal their top talent, and that they can add anything else first.

Output ONLY valid JSON, no markdown: {"text": "<your next message>", "ready": <true|false>, "buttons": ["<catalog id>", ...]}`;
};

export type ParsedTurn = { reply: string; ready: boolean; buttons: YourAiButton[] };

/**
 * Read the model's turn; tolerate fences, prose around JSON, or plain text.
 * Accepts `text` (current) or `reply` (previous shape). Buttons are validated against the
 * static catalog; anything unknown is dropped. If the JSON is unusable the whole raw text
 * becomes the message and there are no buttons.
 */
export const parseTurn = (raw: string): ParsedTurn => {
  const text = (raw ?? "").trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      const parsed = JSON.parse(candidate.slice(first, last + 1));
      const message = typeof parsed?.text === "string" ? parsed.text : typeof parsed?.reply === "string" ? parsed.reply : "";
      if (message.trim()) {
        return { reply: message.trim(), ready: parsed.ready === true, buttons: validateButtons(parsed.buttons) };
      }
    } catch {
      // fall through to plain text
    }
  }
  return { reply: text.replace(/```(?:json)?|```/g, "").trim(), ready: false, buttons: [] };
};
