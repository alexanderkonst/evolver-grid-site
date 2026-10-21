import { defineTool } from "@lovable.dev/mcp-js";
import { getLunarState } from "../../equilibrium-cycles";
import {
  EQ_LAYERS,
  EQ_LAYER_KEYS,
  computePhaseReadiness,
  nextPhase,
  phaseByLunarIndex,
  type EqLayerKey,
} from "../../../modules/equilibrium/phasePlan";
import { READ_ONLY, runForUser, unwrap, type Db } from "./_shared";

const HOUR_MS = 3_600_000;

/**
 * Where the user is in the lunar Equilibrium cycle and which layers are due.
 * Same inputs as the page's readiness strip: the lunar phase (getLunarState),
 * the phase plan (phasePlan.ts) and what is already filled in the user's data.
 */
export async function getCycle(db: Db, userId: string, now: number = Date.now()) {
  const [state, strategies, workstreams, focus] = await Promise.all([
    db.from("equilibrium_state").select("moon_focus_text").eq("user_id", userId).maybeSingle(),
    db.from("equilibrium_strategies").select("position").eq("user_id", userId),
    db.from("equilibrium_workstreams").select("id").eq("user_id", userId).is("archived_at", null),
    db.from("equilibrium_focus").select("task_id").eq("user_id", userId),
  ]);

  const stateRow = unwrap(state, "read the Equilibrium state") as { moon_focus_text?: string | null } | null;
  const strategyRows = (unwrap(strategies, "read the strategies") ?? []) as unknown[];
  const workstreamRows = (unwrap(workstreams, "read the workstreams") ?? []) as { id: string }[];
  const focusRows = (unwrap(focus, "read the DO NOW list") ?? []) as unknown[];

  let activeTaskCount = 0;
  if (workstreamRows.length > 0) {
    const tasks = (unwrap(
      await db
        .from("equilibrium_tasks")
        .select("id")
        .in("workstream_id", workstreamRows.map((w) => w.id))
        .eq("status", "active"),
      "read the tasks",
    ) ?? []) as unknown[];
    activeTaskCount = tasks.length;
  }

  const lunar = getLunarState(now);
  const phase = phaseByLunarIndex(lunar.segmentIndex);
  const filled: Record<EqLayerKey, boolean> = {
    focus: Boolean(String(stateRow?.moon_focus_text ?? "").trim()),
    strategies: strategyRows.length > 0,
    workstreams: workstreamRows.length > 0,
    tasks: activeTaskCount > 0,
    doNow: focusRows.length > 0,
  };
  const readiness = computePhaseReadiness(phase.position, filled);
  const upcoming = nextPhase(phase.position);

  return {
    now: new Date(now).toISOString(),
    phase: {
      name: phase.name,
      position: phase.position,
      moon_phase: lunar.phase.name,
      asks: phase.asks,
      trap: phase.trap,
      writes_in_this_phase: phase.writes,
      ends_at: new Date(lunar.phaseEndMs).toISOString(),
      hours_remaining: Math.round((lunar.phaseEndMs - now) / HOUR_MS),
      next: { name: upcoming.name, asks: upcoming.asks },
    },
    readiness,
    // Layers that are due now and still empty, with the tool that fills each.
    due: EQ_LAYER_KEYS.filter((key) => readiness[key] === "due_empty").map((key) => ({
      layer: key,
      label: EQ_LAYERS[key].label,
      due_since_phase: EQ_LAYERS[key].dueAtPhase,
      fill_with: FILL_TOOL[key],
    })),
    filled,
  };
}

const FILL_TOOL: Record<EqLayerKey, string> = {
  focus: "set_focus",
  strategies: "set_strategies",
  workstreams: "set_workstreams",
  tasks: "set_tasks",
  // DO NOW is picked in the app; there is no MCP write for it yet.
  doNow: "(in the app: promote a task to DO NOW)",
};

export default defineTool({
  name: "get_cycle",
  title: "Get Equilibrium cycle",
  description:
    "Where the signed-in user is in the 8-phase lunar Equilibrium cycle (Planning, Planting, Clearing, Gathering, Seeing, Leading, Harvesting, Celebrating): current phase, what it asks, when it ends, and which layers (focus, strategies, workstreams, tasks, DO NOW) are due and still empty.",
  inputSchema: {},
  annotations: READ_ONLY,
  handler: (_input, ctx) => runForUser(ctx, "read the Equilibrium cycle", (db, userId) => getCycle(db, userId)),
});
