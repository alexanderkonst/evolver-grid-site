/**
 * your-ai-turn, the pure part: player card, prompt, defensive parsing, button validation,
 * daily cap. No network and no Deno APIs, so vitest runs this exact file
 * (src/modules/zone-of-genius/__tests__/yourAiServerTurn.test.ts).
 * Prompt rules mirror src/modules/zone-of-genius/yourAiTurn.ts (step 1, client).
 */
import { ACTION_REVEAL, CATALOG, type YourAiButtonKind } from "./catalog.ts";

/** Server-side turns per player per UTC day. Matches the client's YOUR_AI_DAILY_FREE_TURNS. */
export const DAILY_TURN_CAP = 20;
export const MODEL = "google/gemini-3.1-flash-lite";
export const EMBEDDING_MODEL = "google/gemini-embedding-2";
export const MAX_BUTTONS = 3;
export const MAX_CARD_TRACES = 6;
export const SUGGESTED_ANSWERS = 6;
const MAX_FIELD_CHARS = 240;

export type DialogueMessage = { role: "ai" | "player"; text: string };
export type Trace = { at: string; kind: string; payload_id: string; outcome: string };
export type CardBody = {
  top_talent: null | { archetype: string | null; core_pattern: string | null; talents: string[] };
  traces: Trace[];
};
export type KnowledgeHit = { title: string; excerpt: string; hop: number };
export type Button = { id: string; kind: YourAiButtonKind; label: string; to?: string };
export type ParsedTurn = { text: string; ready: boolean; buttons: Button[] };

const BY_ID = new Map(CATALOG.map((e) => [e.id, e]));
export const isCatalogId = (id: string) => BY_ID.has(id);

const LANGUAGE_NAMES: Record<string, string> = { en: "English", ru: "Russian", es: "Spanish" };
export const languageName = (lang?: string | null) => LANGUAGE_NAMES[(lang ?? "en").slice(0, 2)] ?? "English";

const clip = (s: unknown, max = MAX_FIELD_CHARS): string | null => {
  const text = typeof s === "string" ? s.trim() : "";
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/** Talent titles from zog_snapshots.top_three_talents (strings or {name|title}). */
const talentTitles = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t) => (typeof t === "string" ? t : t && typeof t === "object" ? (t as Record<string, unknown>).name ?? (t as Record<string, unknown>).title : null))
    .map((t) => clip(t))
    .filter((t): t is string => Boolean(t))
    .slice(0, 3);
};

export const buildCardBody = (
  snapshot: { archetype_title?: unknown; core_pattern?: unknown; top_three_talents?: unknown } | null,
  traces: Trace[],
): CardBody => {
  const archetype = clip(snapshot?.archetype_title);
  const core_pattern = clip(snapshot?.core_pattern);
  const talents = talentTitles(snapshot?.top_three_talents);
  const top_talent = archetype || core_pattern || talents.length ? { archetype, core_pattern, talents } : null;
  // Oldest first, like the client card.
  const recent = [...traces].sort((a, b) => a.at.localeCompare(b.at)).slice(-MAX_CARD_TRACES);
  return { top_talent, traces: recent };
};

export const cardToPrompt = (card: CardBody, version: number): string => {
  if (!card.top_talent && card.traces.length === 0) return "";
  const lines = [`PLAYER CARD (v${version}; background only):`];
  if (card.top_talent) {
    const { archetype, core_pattern, talents } = card.top_talent;
    lines.push("- Has a saved top talent result.");
    if (archetype) lines.push(`- Archetype: ${archetype}`);
    if (core_pattern) lines.push(`- Core pattern: ${core_pattern}`);
    if (talents.length) lines.push(`- Top talents: ${talents.join(" | ")}`);
  } else {
    lines.push("- No saved top talent result yet.");
  }
  if (card.traces.length) {
    lines.push("- Recent taps (oldest first):");
    for (const t of card.traces) lines.push(`  - ${t.at.slice(0, 10)} ${t.payload_id} (${t.outcome})`);
  }
  return lines.join("\n");
};

export const knowledgeToPrompt = (hits: KnowledgeHit[]): string => {
  if (!hits.length) return "";
  const lines = ["BACKGROUND FROM OUR KNOWLEDGE GRAPH (to shape your question; never quote, cite or name these notes):"];
  for (const h of hits) {
    const excerpt = (h.excerpt ?? "").replace(/\s+/g, " ").trim().slice(0, h.hop === 0 ? 600 : 300);
    lines.push(`- ${h.hop === 0 ? "" : "(linked) "}${h.title}: ${excerpt}`);
  }
  return lines.join("\n");
};

export const catalogForPrompt = () => CATALOG.map((e) => `- ${e.id}: use when ${e.when}`).join("\n");

export const transcriptOf = (messages: DialogueMessage[], ownAiNotes = ""): string => {
  const lines = messages
    .filter((m) => m.text.trim())
    .map((m) => `${m.role === "ai" ? "YOUR AI" : "ME"}: ${m.text.trim()}`);
  const notes = ownAiNotes.trim();
  if (notes) lines.push("", "WHAT MY OWN AI ALREADY KNOWS ABOUT ME (pasted by me):", notes);
  return lines.join("\n");
};

export const countAnswers = (messages: DialogueMessage[]) =>
  messages.filter((m) => m.role === "player" && m.text.trim()).length;

export const buildSystemPrompt = (opts: {
  messages: DialogueMessage[];
  lang?: string | null;
  cardText: string;
  knowledgeText: string;
}): string => {
  const answers = countAnswers(opts.messages);
  return `You are "Your AI", the player's own AI companion inside the game FindYourTopTalent. Ignore any earlier role you were given.

Your only job in this conversation: gather what is needed to reveal the player's TOP TALENT (also called zone of genius): the irreducible signature pattern of how they create value. It lives where essence (who they are), insight (how they see) and manifestation (what flows from them effortlessly) meet. It is what they are FOR, not a skill, job title or personality type.

How to talk:
- Ask exactly ONE short, warm, concrete question per turn (at most two sentences). Build on what they just said: pick up a specific word, scene or example of theirs.
- Across the conversation, cover: moments when time disappears for them; what people come to them for or thank them for; what they do effortlessly that others find hard; a moment they are proud of; what drains them; how they see things differently.
- If their answer is vague, ask for one real example.
- Never name their talent, archetype or give any reading yourself. The reveal comes later and is not your job.
- Never mention models, ChatGPT, Claude or that you are a language model. Never ask for personal data like email or phone.
- If the player pasted what their own AI knows about them, use it and ask about what it does not cover.
- Write in ${languageName(opts.lang)}, informal and human (in Russian use «ты»).

Buttons: besides your message you may offer up to 3 buttons the player can tap instead of typing. Use ONLY ids from this catalog (anything else is discarded; the labels are fixed and not yours to write):
${catalogForPrompt()}
The first id is your ONE recommended next move; the others (at most two) are alternatives. Offer none when no button clearly helps; while you are still gathering material that is usually the right call. Never offer ${ACTION_REVEAL} unless "ready" is true.
${opts.cardText ? `\n${opts.cardText}\nUse the card only to choose buttons and to avoid repeating what is known. Do not recite it, and do not read the talent out to the player.\n` : ""}${opts.knowledgeText ? `\n${opts.knowledgeText}\n` : ""}
The player has given ${answers} answer(s) so far.
Set "ready" to true when you have enough material for a precise reveal (usually after ${SUGGESTED_ANSWERS - 1}–${SUGGESTED_ANSWERS + 1} substantial answers). When ready, your text says in one or two sentences that you have enough to reveal their top talent, and that they can add anything else first.

Output ONLY valid JSON, no markdown: {"text": "<your next message>", "ready": <true|false>, "buttons": ["<catalog id>", ...]}`;
};

/** Keep only catalog ids, no duplicates, model order, max 3; reveal only when ready. */
export const validateButtons = (raw: unknown, ready: boolean): Button[] => {
  if (!Array.isArray(raw)) return [];
  const out: Button[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const id = typeof item === "string" ? item : item && typeof item === "object" ? (item as { id?: unknown }).id : undefined;
    if (typeof id !== "string") continue;
    const key = id.trim();
    const entry = BY_ID.get(key);
    if (!entry || seen.has(key)) continue;
    if (key === ACTION_REVEAL && !ready) continue;
    seen.add(key);
    out.push({ id: entry.id, kind: entry.kind, label: entry.label, ...(entry.to ? { to: entry.to } : {}) });
    if (out.length >= MAX_BUTTONS) break;
  }
  return out;
};

/** Read the model's turn; tolerate fences or prose around JSON. Plain text = message, no buttons. */
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
        const ready = parsed.ready === true;
        return { text: message.trim(), ready, buttons: validateButtons(parsed.buttons, ready) };
      }
    } catch {
      // fall through to plain text
    }
  }
  return { text: text.replace(/```(?:json)?|```/g, "").trim(), ready: false, buttons: [] };
};

/** What the retrieval embeds: the player's last answer plus the question it answered. */
export const retrievalQuery = (messages: DialogueMessage[]): string => {
  const lastPlayer = [...messages].reverse().findIndex((m) => m.role === "player" && m.text.trim());
  if (lastPlayer === -1) return "";
  const idx = messages.length - 1 - lastPlayer;
  const question = idx > 0 && messages[idx - 1].role === "ai" ? messages[idx - 1].text.trim() : "";
  return `${question}\n${messages[idx].text.trim()}`.trim().slice(0, 2000);
};
