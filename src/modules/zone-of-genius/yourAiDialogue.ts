/**
 * Your AI dialogue — the default door of the top talent reveal (Sasha, 2026-10-30).
 *
 * The player talks with OUR in-game AI ("Your AI / Твой ИИ") instead of copying a prompt
 * into their own ChatGPT. The dialogue only gathers material. The reveal itself runs on the
 * existing, unchanged frameworks: our AI answers ZONE_OF_GENIUS_PROMPT from the conversation,
 * and that answer plus the conversation goes to generateAppleseed() as the raw signal,
 * exactly the shape a pasted own-AI answer has.
 *
 * Turns go through an already deployed, cheap, guest-open edge function (a flash-lite class
 * model on the project's AI gateway), so this needs no new deploy. No model is named in UI.
 */
import { supabase } from "@/integrations/supabase/client";
import { ZONE_OF_GENIUS_PROMPT } from "@/prompts";

export type DialogueRole = "ai" | "player";
export type DialogueMessage = { role: DialogueRole; text: string };

/** Player answers before the reveal button unlocks, and the count where it is recommended. */
export const MIN_ANSWERS_TO_REVEAL = 3;
export const SUGGESTED_ANSWERS = 6;

/** Deployed function used as the turn engine (guest-open, flash-lite class). */
export const YOUR_AI_FUNCTION = "library-advisor";

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

export const buildTurnPrompt = (messages: DialogueMessage[], ownAiNotes: string, lang: string | undefined): string => {
  const answers = countAnswers(messages);
  return `You are "Your AI", the player's own AI companion inside the game FindYourTopTalent. Ignore any earlier role you were given.

Your only job in this conversation: gather what is needed to reveal the player's TOP TALENT (also called zone of genius): the irreducible signature pattern of how they create value. It lives where essence (who they are), insight (how they see) and manifestation (what flows from them effortlessly) meet. It is what they are FOR, not a skill, job title or personality type.

How to talk:
- Ask exactly ONE short, warm, concrete question per turn (at most two sentences). Build on what they just said: pick up a specific word, scene or example of theirs.
- Across the conversation, cover: moments when time disappears for them; what people come to them for or thank them for; what they do effortlessly that others find hard; a moment they are proud of; what drains them; how they see things differently.
- If their answer is vague, ask for one real example.
- Never name their talent, archetype or give any reading yourself. The reveal comes later and is not your job.
- Never mention models, ChatGPT, Claude or that you are a language model. Never ask for personal data like email or phone.
- If the player pasted what their own AI knows about them, use it and ask about what it does not cover.
- Write in ${languageName(lang)}, informal and human (in Russian use «ты»).

The player has given ${answers} answer(s) so far.
Set "ready" to true when you have enough material for a precise reveal (usually after ${SUGGESTED_ANSWERS - 1}–${SUGGESTED_ANSWERS + 1} substantial answers). When ready, your reply says in one or two sentences that you have enough to reveal their top talent, and that they can add anything else first.

Output ONLY valid JSON, no markdown: {"reply": "<your next message>", "ready": <true|false>}

CONVERSATION SO FAR:
${transcriptOf(messages, ownAiNotes)}`;
};

/** Read the model's turn; tolerate fences, prose around JSON, or plain text. */
export const parseTurn = (raw: string): { reply: string; ready: boolean } => {
  const text = (raw ?? "").trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try {
      const parsed = JSON.parse(candidate.slice(first, last + 1));
      if (parsed && typeof parsed.reply === "string" && parsed.reply.trim()) {
        return { reply: parsed.reply.trim(), ready: parsed.ready === true };
      }
    } catch {
      // fall through to plain text
    }
  }
  return { reply: text.replace(/```(?:json)?|```/g, "").trim(), ready: false };
};

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
): Promise<{ reply: string; ready: boolean }> => {
  const turn = parseTurn(await callYourAi(buildTurnPrompt(messages, ownAiNotes, lang)));
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
