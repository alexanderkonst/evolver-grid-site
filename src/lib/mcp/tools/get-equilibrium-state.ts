import { defineTool } from "@lovable.dev/mcp-js";
import { READ_ONLY, runForUser, unwrap, type Db } from "./_shared";

type Row = Record<string, any>;

export async function getEquilibriumState(db: Db, userId: string) {
  const [state, strategies, workstreams, focus, synthesisLog] = await Promise.all([
    db.from("equilibrium_state").select("*").eq("user_id", userId).maybeSingle(),
    db.from("equilibrium_strategies").select("*").eq("user_id", userId).order("position", { ascending: true }),
    db.from("equilibrium_workstreams").select("*").eq("user_id", userId).order("position", { ascending: true }),
    db.from("equilibrium_focus").select("*").eq("user_id", userId).order("position", { ascending: true }),
    db
      .from("equilibrium_synthesis_log")
      .select("*")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(5),
  ]);

  const stateRow = unwrap(state, "read the Equilibrium state") as Row | null;
  const strategyRows = (unwrap(strategies, "read the strategies") ?? []) as Row[];
  const workstreamRows = (unwrap(workstreams, "read the workstreams") ?? []) as Row[];
  const focusRows = (unwrap(focus, "read the focus tasks") ?? []) as Row[];
  const synthesisRows = (unwrap(synthesisLog, "read the synthesis log") ?? []) as Row[];

  const workstreamIds = workstreamRows.map((row) => row.id).filter(Boolean);
  const taskRows = workstreamIds.length
    ? ((unwrap(
        await db
          .from("equilibrium_tasks")
          .select("*")
          .in("workstream_id", workstreamIds)
          .order("position", { ascending: true }),
        "read the tasks",
      ) ?? []) as Row[])
    : [];

  const focusIds = new Set(focusRows.map((row) => row.task_id));
  const activeTasks = taskRows.filter((t) => t.status !== "done");

  return {
    user_id: userId,
    state: stateRow ?? null,
    strategies: strategyRows,
    workstreams: workstreamRows.map((ws) => ({
      ...ws,
      active_tasks: activeTasks.filter((t) => t.workstream_id === ws.id),
    })),
    focus: focusRows,
    focus_tasks: activeTasks.filter((t) => focusIds.has(t.id)),
    synthesis_log: synthesisRows,
  };
}

export default defineTool({
  name: "get_equilibrium_state",
  title: "Get Equilibrium state",
  description:
    "Return the signed-in user's Equilibrium snapshot: state row, strategies, workstreams with active tasks, focus tasks, and recent synthesis log.",
  inputSchema: {},
  annotations: READ_ONLY,
  handler: (_input, ctx) =>
    runForUser(ctx, "read the Equilibrium state", (db, userId) => getEquilibriumState(db, userId)),
});
