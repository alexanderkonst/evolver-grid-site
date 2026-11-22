/**
 * Mini-training 1 · the AI call (issue #392).
 *
 * *** STUB. *** No edge function is deployed for this yet (no Lovable credits were spent), so
 * `askMirrorAi` returns a clearly marked placeholder. The page, the one shared thread, Save plan
 * and #6 all work against it, so the owner can test everything except the real answers.
 *
 * To go live, deploy ONE edge function and flip `MIRROR_AI_IS_STUB` to false:
 *
 *   name:     mini-training-chat   (new; the existing `your-ai-turn` returns structured JSON turns,
 *                                   which does not fit a free-form prompt)
 *   request:  POST { messages: [{ role: "user" | "assistant", content: string }] }  (whole thread, oldest first)
 *   response: { reply: string }
 *   auth:     signed-in player (Bearer token), same as `your-ai-turn`
 *   model:    google/gemini-3.1-flash-lite through https://ai.gateway.lovable.dev/v1/chat/completions
 *             (the cheapest chat model the gateway lists; same gateway call as `library-advisor`)
 *   system:   a short partner prompt: answer in the player's language, never longer than the line
 *             cap the prompt gives, no emojis, never lecture about how AI works
 *   limits:   a per-player daily cap (≈ 12 calls per person per run; spec «Open for Sasha»)
 *
 * Then replace the body of `askMirrorAi` with `supabase.functions.invoke("mini-training-chat", …)`.
 */

export type ThreadMessage = {
  role: "player" | "ai";
  text: string;
  /** The button this message belongs to («1» … «8»). */
  stepId: string;
};

export const MIRROR_AI_IS_STUB = true;

export const STUB_REPLY_PREFIX = "[STUB]";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Send the whole thread, get the next AI answer. */
export async function askMirrorAi(thread: ThreadMessage[]): Promise<string> {
  if (MIRROR_AI_IS_STUB) {
    await wait(500);
    const last = thread[thread.length - 1]?.text ?? "";
    return [
      `${STUB_REPLY_PREFIX} The AI call is not connected yet, so this is a placeholder answer.`,
      "A real answer will go here once the mini-training chat function is deployed.",
      `You sent ${last.length} characters; the thread holds ${thread.length} messages.`,
    ].join("\n");
  }
  throw new Error("mini-training-chat is not wired yet");
}
