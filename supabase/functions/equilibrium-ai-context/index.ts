import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const bearerToken = (req: Request) => {
  const auth = req.headers.get("Authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : null;
};

const compactText = (value: unknown, max = 1800) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}...` : trimmed;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceKey || !anonKey) {
      return json({ error: "Supabase environment is not configured" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const token = bearerToken(req);
    const agentToken = req.headers.get("x-agent-token") ?? token;
    const expectedAgentToken = Deno.env.get("EQUILIBRIUM_AI_CONTEXT_TOKEN");
    const configuredUserId = Deno.env.get("EQUILIBRIUM_AI_CONTEXT_USER_ID");

    let userId: string | null = null;
    let accessMode: "agent_token" | "user_session" | null = null;

    if (expectedAgentToken && agentToken === expectedAgentToken) {
      userId = configuredUserId ?? null;
      accessMode = "agent_token";
    } else if (token) {
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data, error } = await authClient.auth.getUser();
      if (!error && data.user?.id) {
        userId = data.user.id;
        accessMode = "user_session";
      }
    }

    if (!userId) {
      return json(
        {
          error:
            "Unauthorized. Use a logged-in Supabase session or configure EQUILIBRIUM_AI_CONTEXT_TOKEN + EQUILIBRIUM_AI_CONTEXT_USER_ID.",
        },
        401,
      );
    }

    const warnings: string[] = [];
    const safe = async <T>(
      label: string,
      query: PromiseLike<{ data: T | null; error: unknown }>,
      fallback: T,
    ) => {
      const { data, error } = await query;
      if (error) {
        warnings.push(`${label}: ${JSON.stringify(error)}`);
        return fallback;
      }
      return data ?? fallback;
    };

    const [state, profile, strategies, completedStrategies, workstreams, focus, synthesisLog] =
      await Promise.all([
        safe("equilibrium_state", admin.from("equilibrium_state").select("*").eq("user_id", userId).maybeSingle(), null),
        safe(
          "game_profiles",
          admin
            .from("game_profiles")
            .select("mission_statement, last_zog_snapshot_id, updated_at")
            .eq("user_id", userId)
            .maybeSingle(),
          null,
        ),
        safe(
          "equilibrium_strategies",
          admin
            .from("equilibrium_strategies")
            .select("*")
            .eq("user_id", userId)
            .order("position", { ascending: true }),
          [],
        ),
        safe(
          "equilibrium_strategy_completions",
          admin
            .from("equilibrium_strategy_completions")
            .select("*")
            .eq("user_id", userId)
            .order("done_at", { ascending: false })
            .limit(10),
          [],
        ),
        safe(
          "equilibrium_workstreams",
          admin
            .from("equilibrium_workstreams")
            .select("*")
            .eq("user_id", userId)
            .order("position", { ascending: true }),
          [],
        ),
        safe(
          "equilibrium_focus",
          admin
            .from("equilibrium_focus")
            .select("*")
            .eq("user_id", userId)
            .order("position", { ascending: true }),
          [],
        ),
        safe(
          "equilibrium_synthesis_log",
          admin
            .from("equilibrium_synthesis_log")
            .select("*")
            .eq("user_id", userId)
            .order("generated_at", { ascending: false })
            .limit(10),
          [],
        ),
      ]);

    const workstreamRows = Array.isArray(workstreams) ? workstreams : [];
    const workstreamIds = workstreamRows.map((row: any) => row.id).filter(Boolean);
    const tasks = workstreamIds.length
      ? await safe(
          "equilibrium_tasks",
          admin
            .from("equilibrium_tasks")
            .select("*")
            .in("workstream_id", workstreamIds)
            .order("position", { ascending: true }),
          [],
        )
      : [];

    const taskRows = Array.isArray(tasks) ? tasks : [];
    const focusRows = Array.isArray(focus) ? focus : [];
    const activeTasks = taskRows.filter((task: any) => task.status !== "done");
    const doneRecent = taskRows
      .filter((task: any) => task.status === "done")
      .sort((a: any, b: any) => new Date(b.done_at ?? 0).getTime() - new Date(a.done_at ?? 0).getTime())
      .slice(0, 12);
    const focusTaskIds = new Set(focusRows.map((row: any) => row.task_id));
    const focusTasks = activeTasks.filter((task: any) => focusTaskIds.has(task.id));

    return json({
      generated_at: new Date().toISOString(),
      source: "equilibrium-ai-context",
      access_mode: accessMode,
      user_id: userId,
      state,
      profile,
      strategies: Array.isArray(strategies) ? strategies : [],
      completed_strategies: completedStrategies,
      workstreams: workstreamRows.map((workstream: any) => ({
        ...workstream,
        active_tasks: activeTasks.filter((task: any) => task.workstream_id === workstream.id),
        done_recent: doneRecent.filter((task: any) => task.workstream_id === workstream.id),
      })),
      focus: focusRows,
      focus_tasks: focusTasks,
      completed_tasks_recent: doneRecent,
      synthesis_log: Array.isArray(synthesisLog)
        ? synthesisLog.map((row: any) => ({
            ...row,
            synthesis_text: compactText(row.synthesis_text ?? row.reading ?? row.text ?? null),
          }))
        : [],
      summary: {
        active_workstreams_count: workstreamRows.filter((row: any) => !row.archived_at).length,
        archived_workstreams_count: workstreamRows.filter((row: any) => row.archived_at).length,
        active_tasks_count: activeTasks.length,
        focus_count: focusRows.length,
        completed_tasks_recent_count: doneRecent.length,
        top_next_actions: focusTasks.map((task: any) => task.text).slice(0, 5),
        last_synthesis_at: (state as any)?.last_synthesis_at ?? null,
      },
      warnings,
    });
  } catch (error) {
    console.error("[equilibrium-ai-context] fatal", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
