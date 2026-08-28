// agent-db — scoped, token-gated data read/write channel (2026-08-28, Sasha).
//
// WHY THIS EXISTS
// The Supabase project is Lovable-Cloud-managed: it lives in Lovable's org, so
// Sasha has no dashboard, no PAT, and no direct service_role access. Routine
// data operations therefore used to cost a Lovable prompt each. This function
// is the permanent write/read gate instead — same pattern as
// `sync-founder-corpus`, generalized. Deploy it ONCE through Lovable; after
// that, every routine read/write runs straight from the terminal
// (scripts/agent-db.mjs), zero Lovable prompts, forever.
//
// SECURITY MODEL — read before widening
// The service_role key bypasses RLS, so the ONLY guardrail is the ALLOWLIST
// below. A leaked token + a permissive allowlist = full DB compromise. Rules:
//   • Only tables in ALLOWED can be touched, and only with their listed ops.
//   • `update` and `delete` REQUIRE a non-empty `match` (no table-wide wipes).
//   • This endpoint runs NO arbitrary SQL and exposes NO rpc — CRUD only.
//   • Keep AGENT_DB_TOKEN long + secret; rotate by changing the Lovable secret
//     and your local .env.local together.
//   • Never add auth.* or role/entitlement-bearing tables as writable.
//
// Request:  POST /functions/v1/agent-db   header: x-agent-token: <AGENT_DB_TOKEN>
// Body:     { op, table, values?, match?, select?, limit?, onConflict? }
//   op:      "select" | "insert" | "update" | "upsert" | "delete"
//   values:  object | object[]   (insert/update/upsert)
//   match:   { col: value, ... } (required for update/delete; optional filter for select)
//   select:  columns string      (default "*")
//   limit:   number              (select only; default 100, max 1000)
//   onConflict: string           (upsert only; conflict target column(s))
// Response: { ok, op, table, count, data } | { ok:false, error }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type Operation = "select" | "insert" | "update" | "upsert" | "delete";

// ── ALLOWLIST ──────────────────────────────────────────────────────────────
// The whole security boundary. Add a table + the ops you actually need, no more.
// Seeded conservatively: game_profiles is read-only (it carries roles/tiers).
const ALLOWED: Record<string, Operation[]> = {
  game_profiles:       ["select"],
  zog_snapshots:       ["select", "insert", "update", "upsert"],
  qol_snapshots:       ["select", "insert", "update", "upsert"],
  quiz_results:        ["select", "insert", "update", "upsert"],
  founder_corpus_docs: ["select", "insert", "update", "upsert"],
  resonance_events:    ["select", "insert"],
};
// ─────────────────────────────────────────────────────────────────────────────

const SELECT_LIMIT_DEFAULT = 100;
const SELECT_LIMIT_MAX = 1000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Length-constant token compare (avoids trivial timing leaks).
function tokenOk(provided: string | null, expected: string | undefined): boolean {
  if (!expected || !provided) return false;
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function isPlainMatch(m: unknown): m is Record<string, unknown> {
  return !!m && typeof m === "object" && !Array.isArray(m) && Object.keys(m as object).length > 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

  if (!tokenOk(req.headers.get("x-agent-token"), Deno.env.get("AGENT_DB_TOKEN"))) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Body must be JSON" }, 400);
  }

  const op = String(body.op ?? "") as Operation;
  const table = String(body.table ?? "");
  const values = body.values;
  const match = body.match;
  const select = typeof body.select === "string" && body.select.trim() ? body.select : "*";

  // Allowlist gate — table AND op.
  const allowedOps = ALLOWED[table];
  if (!allowedOps) return json({ ok: false, error: `Table not allowed: ${table}` }, 403);
  if (!allowedOps.includes(op)) {
    return json({ ok: false, error: `Op '${op}' not allowed on '${table}'` }, 403);
  }

  try {
    // ── SELECT ──
    if (op === "select") {
      const rawLimit = Number(body.limit ?? SELECT_LIMIT_DEFAULT);
      const limit = Math.min(Math.max(1, isFinite(rawLimit) ? rawLimit : SELECT_LIMIT_DEFAULT), SELECT_LIMIT_MAX);
      let q = admin.from(table).select(select, { count: "exact" });
      if (isPlainMatch(match)) q = q.match(match);
      const { data, error, count } = await q.limit(limit);
      if (error) return json({ ok: false, error: error.message }, 400);
      return json({ ok: true, op, table, count: count ?? data?.length ?? 0, data });
    }

    // ── INSERT ──
    if (op === "insert") {
      if (values == null) return json({ ok: false, error: "values required for insert" }, 400);
      const { data, error } = await admin.from(table).insert(values as never).select();
      if (error) return json({ ok: false, error: error.message }, 400);
      return json({ ok: true, op, table, count: data?.length ?? 0, data });
    }

    // ── UPSERT ──
    if (op === "upsert") {
      if (values == null) return json({ ok: false, error: "values required for upsert" }, 400);
      const onConflict = typeof body.onConflict === "string" ? body.onConflict : undefined;
      const { data, error } = await admin
        .from(table)
        .upsert(values as never, onConflict ? { onConflict } : undefined)
        .select();
      if (error) return json({ ok: false, error: error.message }, 400);
      return json({ ok: true, op, table, count: data?.length ?? 0, data });
    }

    // ── UPDATE (match required) ──
    if (op === "update") {
      if (values == null) return json({ ok: false, error: "values required for update" }, 400);
      if (!isPlainMatch(match)) {
        return json({ ok: false, error: "update requires a non-empty match (refusing table-wide update)" }, 400);
      }
      const { data, error } = await admin.from(table).update(values as never).match(match).select();
      if (error) return json({ ok: false, error: error.message }, 400);
      return json({ ok: true, op, table, count: data?.length ?? 0, data });
    }

    // ── DELETE (match required) ──
    if (op === "delete") {
      if (!isPlainMatch(match)) {
        return json({ ok: false, error: "delete requires a non-empty match (refusing table-wide delete)" }, 400);
      }
      const { data, error } = await admin.from(table).delete().match(match).select();
      if (error) return json({ ok: false, error: error.message }, 400);
      return json({ ok: true, op, table, count: data?.length ?? 0, data });
    }

    return json({ ok: false, error: `Unknown op: ${op}` }, 400);
  } catch (e) {
    return json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
});
