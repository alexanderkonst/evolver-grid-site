// Your AI server harness (ai-familiar tracker step 2 + 3).
// Signed-in players only; guests keep the client library-advisor path.
// Loads the player card server-side (versioned in player_cards), adds public
// knowledge-graph context (top-k + 1-hop, fail-soft), calls Flash-Lite, validates
// JSON + buttons, enforces a per-player daily cap. Also records taps as traces.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { buildTurnPrompt, parseTurn } from "./turn.ts";
import { buildPlayerCard, type YourAiTrace } from "./card.ts";

const MODEL = "google/gemini-3.1-flash-lite";
const EMBED_MODEL = "google/gemini-embedding-2";
const DAILY_CAP = 20;
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

const TurnSchema = z.object({
  op: z.literal("turn").default("turn"),
  messages: z.array(z.object({ role: z.enum(["ai", "player"]), text: z.string().max(4000) })).max(40),
  ownAiNotes: z.string().max(6000).default(""),
  lang: z.string().max(10).optional(),
});
const TraceSchema = z.object({
  op: z.literal("trace"),
  kind: z.enum(["action", "route", "practice", "technology"]),
  payload_id: z.string().min(1).max(120),
  outcome: z.string().min(1).max(40).default("tapped"),
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
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const body = await req.json().catch(() => null);

    if (body?.op === "trace") {
      const p = TraceSchema.safeParse(body);
      if (!p.success) return json({ error: p.error.flatten().fieldErrors }, 400);
      const { error } = await admin.from("player_traces").insert({ user_id: user.id, ...p.data, surface: "your-ai" });
      if (error) throw error;
      return json({ ok: true });
    }

    const parsed = TurnSchema.safeParse(body);
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { messages, ownAiNotes, lang } = parsed.data;

    const { data: used, error: capErr } = await admin.rpc("your_ai_take_turn", { p_user: user.id, p_cap: DAILY_CAP });
    if (capErr) {
      if (String(capErr.message).includes("cap")) return json({ error: "daily_cap_reached", cap: DAILY_CAP }, 429);
      throw capErr;
    }

    const card = await loadCard(admin, user.id);
    const knowledge = await retrieveKnowledge(admin, messages.filter((m) => m.role === "player").slice(-2).map((m) => m.text).join("\n"));

    let prompt = buildTurnPrompt(messages, ownAiNotes, lang, card);
    if (knowledge) prompt += `\n\nBACKGROUND FROM SASHA'S PUBLIC NOTES (use only to ask sharper questions; never quote):\n${knowledge}`;

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY is not configured");
    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }] }),
    });
    if (res.status === 429) return json({ error: "Rate limits exceeded, please try again later." }, 429);
    if (res.status === 402) return json({ error: "Payment required, please add funds to your workspace." }, 402);
    if (!res.ok) {
      console.error("gateway", res.status, await res.text());
      return json({ error: "AI gateway error" }, 500);
    }
    const data = await res.json();
    const turn = parseTurn(data?.choices?.[0]?.message?.content ?? "");
    return json({ ...turn, turns_used: used, cap: DAILY_CAP, card_version: card.card_version });
  } catch (err) {
    console.error("your-ai-turn error", err);
    return json({ error: "internal_error" }, 500);
  }
});

// deno-lint-ignore no-explicit-any
async function loadCard(admin: any, userId: string) {
  const { data: gp } = await admin.from("game_profiles").select("id,last_zog_snapshot_id").eq("user_id", userId).order("created_at").limit(1).maybeSingle();
  let snap = null;
  if (gp) {
    const q = admin.from("zog_snapshots").select("archetype_title,core_pattern,top_three_talents");
    const { data } = gp.last_zog_snapshot_id
      ? await q.eq("id", gp.last_zog_snapshot_id).maybeSingle()
      : await q.eq("profile_id", gp.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    snap = data;
  }
  const { data: traceRows } = await admin.from("player_traces").select("at,kind,payload_id,outcome").eq("user_id", userId).order("at", { ascending: false }).limit(6);
  const traces = ((traceRows ?? []) as YourAiTrace[]).reverse();
  const talents = Array.isArray(snap?.top_three_talents) ? snap.top_three_talents.map((t: unknown) => (typeof t === "string" ? t : (t as { name?: string })?.name ?? "")) : [];
  const card = buildPlayerCard(snap ? { archetypeTitle: snap.archetype_title, corePattern: snap.core_pattern, topThreeTalentsLong: talents } : null, traces);

  // Versioned store: a new row only when the content changed.
  const { data: last } = await admin.from("player_cards").select("card_version,content_hash").eq("user_id", userId).order("card_version", { ascending: false }).limit(1).maybeSingle();
  if (!last || last.content_hash !== card.card_version) {
    await admin.from("player_cards").insert({ user_id: userId, card_version: (last?.card_version ?? 0) + 1, card, content_hash: card.card_version });
  }
  return card;
}

// deno-lint-ignore no-explicit-any
async function retrieveKnowledge(admin: any, query: string): Promise<string> {
  try {
    if (!query.trim()) return "";
    const { count } = await admin.from("knowledge_notes").select("id", { count: "exact", head: true });
    if (!count) return "";
    const vec = await embed(query);
    if (!vec) return "";
    const { data, error } = await admin.rpc("knowledge_retrieve", { p_query: JSON.stringify(vec), p_k: 4, p_neighbours: 3 });
    if (error || !data?.length) return "";
    return (data as { title: string; excerpt: string; hop: number }[])
      .map((r) => `- ${r.title}${r.hop ? " (linked)" : ""}: ${r.excerpt.replace(/\s+/g, " ").slice(0, 400)}`)
      .join("\n")
      .slice(0, 3000);
  } catch (err) {
    console.warn("knowledge retrieval skipped", err);
    return "";
  }
}

export async function embed(text: string): Promise<number[] | null> {
  const res = await fetch(`${GATEWAY}/embeddings`, {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: text.slice(0, 8000) }),
  });
  if (!res.ok) return null;
  const d = await res.json();
  return d?.data?.[0]?.embedding ?? null;
}
