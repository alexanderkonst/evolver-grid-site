// sync-founder-corpus — Day 119 (Sasha 2026-07-09).
//
// Sasha has no Supabase dashboard access (Lovable-managed project), so the
// corpus mirror can't be written with the service_role key from his machine.
// This function is the write gate instead: scripts/sync-founder-corpus.mjs
// POSTs docs here with x-sync-token, which must match the CORPUS_SYNC_TOKEN
// edge-function secret. Zero Lovable prompts per sync after initial deploy.
//
// Request body: { docs: Array<{ path, title, content }> }
// Response:     { synced: string[], errors: string[] }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-sync-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_DOCS = 20;
const MAX_CHARS = 200_000;

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const expected = Deno.env.get("CORPUS_SYNC_TOKEN");
  const provided = req.headers.get("x-sync-token");
  if (!expected || !provided || provided !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const docs = Array.isArray(body?.docs) ? body.docs.slice(0, MAX_DOCS) : [];
    if (!docs.length) {
      return new Response(JSON.stringify({ error: "docs[] required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const synced: string[] = [];
    const errors: string[] = [];
    for (const doc of docs) {
      const path = String(doc?.path ?? "").trim();
      const content = String(doc?.content ?? "");
      if (!path || !content) {
        errors.push(`invalid doc: ${path || "(no path)"}`);
        continue;
      }
      const { error } = await admin.from("founder_corpus_docs").upsert({
        path,
        title: doc?.title ? String(doc.title) : null,
        content: content.slice(0, MAX_CHARS),
        updated_at: new Date().toISOString(),
      });
      if (error) errors.push(`${path}: ${error.message}`);
      else synced.push(path);
    }

    return new Response(JSON.stringify({ synced, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
