import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_equilibrium_state",
  title: "Get Equilibrium state",
  description:
    "Return the signed-in user's Equilibrium snapshot: state row, strategies, workstreams with active tasks, focus tasks, and recent synthesis log.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const [state, strategies, workstreams, focus, synthesisLog] = await Promise.all([
      supabase.from("equilibrium_state").select("*").eq("user_id", userId).maybeSingle(),
      supabase
        .from("equilibrium_strategies")
        .select("*")
        .eq("user_id", userId)
        .order("position", { ascending: true }),
      supabase
        .from("equilibrium_workstreams")
        .select("*")
        .eq("user_id", userId)
        .order("position", { ascending: true }),
      supabase
        .from("equilibrium_focus")
        .select("*")
        .eq("user_id", userId)
        .order("position", { ascending: true }),
      supabase
        .from("equilibrium_synthesis_log")
        .select("*")
        .eq("user_id", userId)
        .order("generated_at", { ascending: false })
        .limit(5),
    ]);

    const workstreamRows = workstreams.data ?? [];
    const workstreamIds = workstreamRows.map((row: any) => row.id).filter(Boolean);

    const tasksResult = workstreamIds.length
      ? await supabase
          .from("equilibrium_tasks")
          .select("*")
          .in("workstream_id", workstreamIds)
          .order("position", { ascending: true })
      : { data: [] as any[], error: null };

    const taskRows = tasksResult.data ?? [];
    const focusRows = focus.data ?? [];
    const focusIds = new Set(focusRows.map((row: any) => row.task_id));
    const activeTasks = taskRows.filter((t: any) => t.status !== "done");

    const payload = {
      user_id: userId,
      state: state.data ?? null,
      strategies: strategies.data ?? [],
      workstreams: workstreamRows.map((ws: any) => ({
        ...ws,
        active_tasks: activeTasks.filter((t: any) => t.workstream_id === ws.id),
      })),
      focus: focusRows,
      focus_tasks: activeTasks.filter((t: any) => focusIds.has(t.id)),
      synthesis_log: synthesisLog.data ?? [],
    };

    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
