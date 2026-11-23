// Mini-training chat (issue #392, mini-training 1 «AI as a Mirror»).
// Signed-in players only. POST { messages: [{ role: "user" | "assistant", content }] } → { reply }.
// One shared thread per player; cheapest gateway model; shares the per-player daily
// pool with Your AI (your_ai_take_turn, no new migration).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const MODEL = "google/gemini-3.1-flash-lite";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const DAILY_CAP = 20;
const MAX_MESSAGES = 40;

const SYSTEM = [
  "You are the player's thinking partner inside a short mini-training called «AI as a Mirror».",
  "The player taps prepared prompt cards about their own talents, mission and life; you answer them.",
  "Rules: answer in the language the player writes in. Keep to the length or line count the prompt asks for; if it gives none, at most 5 short lines.",
  "No emojis. No headings. Plain warm words. Talk about the player's own life and work, never lecture about how AI works.",
  "When the prompt asks for options or lines, give exactly that many, one per line, nothing else.",
].join(" ");

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(MAX_MESSAGES),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "sign_in_required" }, 401);
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "sign_in_required" }, 401);

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: used, error: capErr } = await admin.rpc("your_ai_take_turn", { p_user: user.id, p_cap: DAILY_CAP });
    if (capErr) throw capErr;
    if (used === -1) return json({ error: "daily_cap_reached", cap: DAILY_CAP }, 429);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY is not configured");
    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "system", content: SYSTEM }, ...parsed.data.messages] }),
    });
    if (res.status === 429) return json({ error: "rate_limited" }, 429);
    if (res.status === 402) return json({ error: "payment_required" }, 402);
    if (!res.ok) {
      console.error("gateway", res.status, await res.text());
      return json({ error: "ai_gateway_error" }, 500);
    }
    const data = await res.json();
    const reply = String(data?.choices?.[0]?.message?.content ?? "").trim();
    if (!reply) return json({ error: "empty_reply" }, 500);
    return json({ reply, turns_used: used, cap: DAILY_CAP });
  } catch (err) {
    console.error("mini-training-chat error", err);
    return json({ error: "internal_error" }, 500);
  }
});
