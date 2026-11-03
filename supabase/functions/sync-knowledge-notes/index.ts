// Admin-only: sync PUBLIC knowledge-graph notes (with [[links]]) and their embeddings.
// Body: { notes: [{ path, title, body, public: true }] }. Notes not marked public are rejected.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { requireAdmin } from "../_shared/requireAdmin.ts";

const EMBED_MODEL = "google/gemini-embedding-2";
const CHUNK = 1800;

const Body = z.object({
  notes: z.array(z.object({
    path: z.string().min(1).max(400),
    title: z.string().min(1).max(300),
    body: z.string().max(200_000),
    public: z.literal(true),
  })).min(1).max(50),
});

const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const key = (t: string) => t.trim().toLowerCase();

async function sha(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const denied = await requireAdmin(req, corsHeaders);
  if (denied) return denied;
  const p = Body.safeParse(await req.json().catch(() => null));
  if (!p.success) return json({ error: p.error.flatten().fieldErrors }, 400);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const results: { path: string; status: string }[] = [];

  for (const n of p.data.notes) {
    const hash = await sha(n.title + "\n" + n.body);
    const { data: existing } = await admin.from("knowledge_notes").select("id,content_hash").eq("path", n.path).maybeSingle();
    if (existing?.content_hash === hash) { results.push({ path: n.path, status: "unchanged" }); continue; }

    const { data: note, error } = await admin.from("knowledge_notes")
      .upsert({ path: n.path, title: n.title, title_key: key(n.title), body: n.body, content_hash: hash, is_public: true, synced_at: new Date().toISOString() }, { onConflict: "path" })
      .select("id").single();
    if (error) { results.push({ path: n.path, status: `error: ${error.message}` }); continue; }

    await admin.from("knowledge_note_chunks").delete().eq("note_id", note.id);
    await admin.from("knowledge_note_links").delete().eq("from_note_id", note.id);

    const links = [...new Set([...n.body.matchAll(/\[\[([^\]|#]+)/g)].map((m) => key(m[1])))];
    if (links.length) await admin.from("knowledge_note_links").insert(links.map((l) => ({ from_note_id: note.id, to_title_key: l })));

    const chunks: string[] = [];
    for (let i = 0; i < n.body.length; i += CHUNK) chunks.push(n.body.slice(i, i + CHUNK));
    if (!chunks.length) chunks.push(n.title);
    const res = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, input: chunks.map((c) => `${n.title}\n${c}`) }),
    });
    if (!res.ok) { results.push({ path: n.path, status: `embed_error ${res.status}` }); continue; }
    const d = await res.json();
    const rows = chunks.map((c, i) => ({ note_id: note.id, chunk_index: i, content: c, embedding: JSON.stringify(d.data[i].embedding) }));
    const { error: ce } = await admin.from("knowledge_note_chunks").insert(rows);
    results.push({ path: n.path, status: ce ? `chunk_error: ${ce.message}` : `synced ${rows.length} chunks` });
  }
  return json({ results });
});
