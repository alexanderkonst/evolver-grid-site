/**
 * Mini-training 1 · the AI call (issue #392).
 * Live: edge function `mini-training-chat` (google/gemini-3.1-flash-lite via the Lovable gateway,
 * signed-in players, shared daily pool with Your AI). Sasha's yes to the credits: 2026-11-22.
 * Request: { messages: [{ role: "user" | "assistant", content }] } (whole thread, oldest first) → { reply }.
 */
import { supabase } from "@/integrations/supabase/client";

export type ThreadMessage = {
  role: "player" | "ai";
  text: string;
  /** The button this message belongs to («1» … «8»). */
  stepId: string;
};

export const MIRROR_AI_IS_STUB = false;

export const STUB_REPLY_PREFIX = "[STUB]";

/** Send the whole thread, get the next AI answer. */
export async function askMirrorAi(thread: ThreadMessage[]): Promise<string> {
  const messages = thread.slice(-40).map((m) => ({
    role: m.role === "player" ? ("user" as const) : ("assistant" as const),
    content: m.text,
  }));
  const { data, error } = await supabase.functions.invoke("mini-training-chat", { body: { messages } });
  if (error) throw error;
  const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
  if (!reply) throw new Error(data?.error ?? "empty_reply");
  return reply;
}
