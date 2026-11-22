/**
 * Mini-training 1 · AI as a Mirror: the one chat thread, the saved plan, and the AI call.
 *
 * ONE thread per player across all buttons: every button appends to it and every Send carries the
 * whole thread, so #6 can refer to the answer of #1 and #8 to the plan of #5.
 *
 * STUB, marked on purpose (issue #392, «no Lovable credits»):
 *  - The AI call needs a NEW edge function (`mini-training-chat`) that is not deployed. Until it
 *    is, `sendToMirrorAI` returns a clearly labelled placeholder answer. Set
 *    `VITE_MINI_TRAINING_CHAT_LIVE=true` once the function is deployed; no code change needed.
 *    Draft source: docs/02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror-build-notes.md.
 *  - Thread and saved plan live in this browser (localStorage) because no existing table fits
 *    (see the build notes). They are keyed by the player, never sent anywhere.
 */
import { supabase } from "@/integrations/supabase/client";

export type ChatMessage = {
  id: string;
  /** The step (button) that produced it: "1" … "8". */
  stepKey: string;
  role: "player" | "ai";
  text: string;
};

export type SavedPlan = { text: string; fromStep: string; savedAt: string };

export const MIRROR_CHAT_LIVE = import.meta.env.VITE_MINI_TRAINING_CHAT_LIVE === "true";
export const STUB_MARK = "[STUB: AI is not connected yet]";

/** The most the edge function accepts (mirrors your-ai-turn: 40 messages, 4000 characters each). */
export const MAX_MESSAGES = 40;
export const MAX_MESSAGE_CHARS = 4000;

const threadKey = (owner: string) => `mini-training-1:thread:${owner}`;
const planKey = (owner: string) => `mini-training-1:plan:${owner}`;

const read = <T>(key: string): T | null => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const write = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full storage: the page still works for this visit */
  }
};

export function loadThread(owner: string): ChatMessage[] {
  const raw = read<unknown>(threadKey(owner));
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (m): m is ChatMessage =>
      !!m && typeof m.id === "string" && typeof m.stepKey === "string" && typeof m.text === "string" && (m.role === "player" || m.role === "ai"),
  );
}

export const saveThread = (owner: string, thread: ChatMessage[]): void => write(threadKey(owner), thread);

export function loadPlan(owner: string): SavedPlan | null {
  const raw = read<SavedPlan>(planKey(owner));
  return raw && typeof raw.text === "string" && typeof raw.fromStep === "string" ? raw : null;
}

/** `owner` null (the demo page) keeps the plan in memory only. */
export function savePlan(owner: string | null, text: string, fromStep: string): SavedPlan {
  const plan: SavedPlan = { text, fromStep, savedAt: new Date().toISOString() };
  if (owner) write(planKey(owner), plan);
  return plan;
}

/** What the gateway sees: the whole thread, newest last, trimmed to the function's limits. */
export function toGatewayMessages(thread: ChatMessage[]): { role: "user" | "assistant"; content: string }[] {
  return thread.slice(-MAX_MESSAGES).map((m) => ({
    role: m.role === "player" ? "user" : "assistant",
    content: m.text.slice(0, MAX_MESSAGE_CHARS),
  }));
}

export class MirrorChatError extends Error {
  constructor(
    public kind: "sign_in" | "cap" | "failed",
    message: string,
  ) {
    super(message);
  }
}

const STUB_ANSWER = [1, 2, 3, 4, 5].map((n) => `${STUB_MARK} Placeholder line ${n} of 5.`).join("\n");

/**
 * Send the thread (the last message is the player's new prompt) and get the AI's answer.
 * `thread` already includes the new prompt.
 */
export async function sendToMirrorAI(thread: ChatMessage[]): Promise<string> {
  if (!MIRROR_CHAT_LIVE) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return STUB_ANSWER;
  }
  const { data, error } = await supabase.functions.invoke("mini-training-chat", {
    body: { messages: toGatewayMessages(thread) },
  });
  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    if (status === 401) throw new MirrorChatError("sign_in", "Sign in to send this to your AI.");
    if (status === 429) throw new MirrorChatError("cap", "That is enough for today. Your AI is available again tomorrow.");
    throw new MirrorChatError("failed", "Your AI could not answer. Try again in a moment.");
  }
  const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
  if (!reply) throw new MirrorChatError("failed", "Your AI could not answer. Try again in a moment.");
  return reply;
}
