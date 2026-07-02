// Equilibrium AI Context Export
// Two access modes:
//   1) Logged-in user (Supabase JWT in Authorization header)
//   2) Agent (x-agent-token matching EQUILIBRIUM_AI_CONTEXT_TOKEN,
//      scoped to EQUILIBRIUM_AI_CONTEXT_USER_ID)
//
// Returns a JSON snapshot of the caller's Equilibrium state for consumption
// by the Founder Cockpit and read-only AI agents.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const AGENT_TOKEN = Deno.env.get("EQUILIBRIUM_AI_CONTEXT_TOKEN") ?? "";
const AGENT_USER_ID = Deno.env.get("EQUILIBRIUM_AI_CONTEXT_USER_ID") ?? "";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function resolveUserId(req: Request): Promise<
  { userId: string; mode: "user" | "agent" } | { error: string; status: number }
> {
  const agentToken = req.headers.get("x-agent-token");
  if (agentToken) {
    if (!AGENT_TOKEN || !AGENT_USER_ID) {
      return { error: "Agent access not configured", status: 401 };
    }
    if (agentToken !== AGENT_TOKEN) {
      return { error: "Invalid agent token", status: 401 };
    }
    return { userId: AGENT_USER_ID, mode: "agent" };
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: "Unauthorized", status: 401 };
  }
  const token = authHeader.slice("Bearer ".length);
  const authed = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await authed.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return { error: "Unauthorized", status: 401 };
  }
  return { userId: data.claims.sub as string, mode: "user" };
}

async function safeSelect(
  admin: ReturnType<typeof createClient>,
  table: string,
  build: (q: any) => any,
  warnings: string[],
) {
  try {
    const { data, error } = await build(admin.from(table).select("*"));
    if (error) {
      warnings.push(`${table}: ${error.message}`);
      return [];
    }
    return data ?? [];
  } catch (e) {
    warnings.push(`${table}: ${(e as Error).message}`);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const resolved = await resolveUserId(req);
  if ("error" in resolved) {
    return json({ error: resolved.error }, resolved.status);
  }
  const { userId, mode } = resolved;

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const warnings: string[] = [];

  const [
    stateRows,
    strategies,
    strategyCompletions,
    workstreams,
    tasks,
    focus,
    synthesisLog,
    profileRows,
  ] = await Promise.all([
    safeSelect(admin, "equilibrium_state", (q) => q.eq("user_id", userId).limit(1), warnings),
    safeSelect(admin, "equilibrium_strategies", (q) => q.eq("user_id", userId).order("position"), warnings),
    safeSelect(admin, "equilibrium_strategy_completions", (q) => q.eq("user_id", userId).order("done_at", { ascending: false }), warnings),
    safeSelect(admin, "equilibrium_workstreams", (q) => q.eq("user_id", userId).order("position"), warnings),
    safeSelect(admin, "equilibrium_tasks", (q) => q.order("position"), warnings),
    safeSelect(admin, "equilibrium_focus", (q) => q.eq("user_id", userId).order("position"), warnings),
    safeSelect(admin, "equilibrium_synthesis_log", (q) => q.eq("user_id", userId).order("created_at", { ascending: false }).limit(10), warnings),
    safeSelect(admin, "game_profiles", (q) => q.eq("user_id", userId).limit(1), warnings),
  ]);

  // Filter tasks to those in the user's workstreams
  const wsIds = new Set((workstreams as any[]).map((w) => w.id));
  const scopedTasks = (tasks as any[]).filter((t) => wsIds.has(t.workstream_id));

  const focusIds = new Set((focus as any[]).map((f) => f.task_id));
  const focusTasks = scopedTasks.filter((t) => focusIds.has(t.id));

  const state = (stateRows as any[])[0] ?? null;
  const profile = (profileRows as any[])[0] ?? null;

  const summary = {
    user_id: userId,
    mode,
    mission: state?.mission_override_text ?? profile?.mission_statement ?? null,
    role: state?.role_override_text ?? null,
    moon_focus: state?.moon_focus_text ?? null,
    last_synthesis_text: state?.last_synthesis_text ?? null,
    last_synthesis_at: state?.last_synthesis_at ?? null,
    active_strategy_count: (strategies as any[]).length,
    active_workstream_count: (workstreams as any[]).length,
    active_task_count: scopedTasks.filter((t) => t.status === "active").length,
    focus_task_count: focusTasks.length,
    generated_at: new Date().toISOString(),
  };

  return json({
    source: "equilibrium-ai-context",
    summary,
    strategies,
    strategy_completions: strategyCompletions,
    workstreams,
    tasks: scopedTasks,
    focus,
    focus_tasks: focusTasks,
    synthesis_log: synthesisLog,
    state,
    warnings,
  });
});
