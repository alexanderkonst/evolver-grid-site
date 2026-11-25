// Your AI Console v1: the request handler, with its dependencies passed in so it can be tested
// without Deno, a network or a model (docs/specs/your-ai-console/console-v1.md).
//
// Signed-in only. AI OS v6.0 rides as the system message. The per-player daily cap is the same
// pattern as mini-training-chat (the `your_ai_take_turn` RPC, no new migration). Body is
// { button: 1..5, context, previousCards, locale }; prompt assembly happens here, not on the client.
import { assemble, type Locale } from "./assemble.ts";

export const MODEL = "google/gemini-3.1-flash-lite";
export const DAILY_CAP = 20;
export const MAX_CONTEXT_CHARS = 12000;
export const MAX_PREVIOUS_CARDS = 6;
export const MAX_PREVIOUS_JSON_CHARS = 24000;
export const MAX_OUTPUT_TOKENS = 4096;

export type Deps = {
  corsHeaders: Record<string, string>;
  /** The signed-in user id for this Authorization header, or null. */
  getUserId: (authHeader: string) => Promise<string | null>;
  /** Takes one turn from the player's daily pool: the count used, or -1 when the cap is reached. */
  takeTurn: (userId: string, cap: number) => Promise<number>;
  /** One model call. */
  complete: (system: string, user: string) => Promise<{ status: number; text: string }>;
};

export type ParsedBody = { button: number; context: string; previousCards: unknown[]; locale: Locale };

export const parseBody = (raw: unknown): { body: ParsedBody } | { error: string } => {
  if (!raw || typeof raw !== "object") return { error: "bad_body" };
  const o = raw as Record<string, unknown>;
  if (!Number.isInteger(o.button) || (o.button as number) < 1 || (o.button as number) > 5) return { error: "bad_button" };
  if (typeof o.context !== "string" || o.context.length > MAX_CONTEXT_CHARS) return { error: "bad_context" };
  if (!Array.isArray(o.previousCards) || o.previousCards.length > MAX_PREVIOUS_CARDS) return { error: "bad_previous_cards" };
  if (JSON.stringify(o.previousCards).length > MAX_PREVIOUS_JSON_CHARS) return { error: "previous_cards_too_large" };
  const locale: Locale = o.locale === "es" || o.locale === "ru" ? o.locale : "en";
  return { body: { button: o.button as number, context: o.context, previousCards: o.previousCards, locale } };
};

export const handle = async (req: Request, deps: Deps): Promise<Response> => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...deps.corsHeaders, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: deps.corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "sign_in_required" }, 401);
    const userId = await deps.getUserId(authHeader);
    if (!userId) return json({ error: "sign_in_required" }, 401);

    const parsed = parseBody(await req.json().catch(() => null));
    if ("error" in parsed) return json({ error: parsed.error }, 400);

    const used = await deps.takeTurn(userId, DAILY_CAP);
    if (used === -1) return json({ error: "daily_cap_reached", cap: DAILY_CAP }, 429);

    const { system, user } = assemble(parsed.body);
    const res = await deps.complete(system, user);
    if (res.status === 429) return json({ error: "rate_limited" }, 429);
    if (res.status === 402) return json({ error: "payment_required" }, 402);
    if (res.status < 200 || res.status >= 300) return json({ error: "ai_gateway_error" }, 500);
    const text = res.text.trim();
    if (!text) return json({ error: "empty_reply" }, 500);
    return json({ text, turns_used: used, cap: DAILY_CAP });
  } catch (err) {
    console.error("your-ai-console error", err);
    return json({ error: "internal_error" }, 500);
  }
};
