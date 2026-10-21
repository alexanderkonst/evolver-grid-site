import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { WRITE_IDEMPOTENT, ToolError, normalizeText, runForUser, unwrap, type Db } from "./_shared";

/** Mirrors MAX_TASKS in useEquilibriumV2 / equilibrium-agent-write (active tasks per workstream). */
export const MAX_TASKS = 3;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const setTasksInput = {
  workstream: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .describe("The workstream to fill: its id (from get_equilibrium_state) or its exact title. Create it first with set_workstreams if it does not exist."),
  tasks: z
    .array(z.string().trim().min(1).max(4000))
    .max(MAX_TASKS)
    .describe("Intuitive tasks for that workstream in order (at most 3 active). Existing active tasks with the same text are kept; missing ones are added."),
};

type WorkstreamRow = { id: string; title: string };
type TaskRow = { id: string; text: string; position: number };

async function resolveWorkstream(db: Db, userId: string, ref: string): Promise<WorkstreamRow> {
  const rows = (unwrap(
    await db
      .from("equilibrium_workstreams")
      .select("id, title")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("position", { ascending: true }),
    "read the workstreams",
  ) ?? []) as WorkstreamRow[];

  const found = UUID.test(ref)
    ? rows.find((w) => w.id.toLowerCase() === ref.toLowerCase())
    : rows.find((w) => normalizeText(w.title) === normalizeText(ref));
  if (!found) {
    const available = rows.map((w) => `"${w.title}"`).join(", ") || "none yet";
    throw new ToolError(`No active workstream matches "${ref}". Active workstreams: ${available}. Create it with set_workstreams first.`);
  }
  return found;
}

/**
 * Converge the workstream's active tasks on `tasks` without deleting:
 * matching is by normalized text, new ones are inserted, order follows the list.
 */
export async function setTasks(db: Db, userId: string, input: { workstream: string; tasks: string[] }) {
  const workstream = await resolveWorkstream(db, userId, input.workstream);

  const wanted: string[] = [];
  for (const text of input.tasks.map((t) => t.trim()).filter(Boolean)) {
    if (!wanted.some((w) => normalizeText(w) === normalizeText(text))) wanted.push(text);
  }

  const active = (unwrap(
    await db
      .from("equilibrium_tasks")
      .select("id, text, position")
      .eq("workstream_id", workstream.id)
      .eq("status", "active")
      .order("position", { ascending: true }),
    "read the current tasks",
  ) ?? []) as TaskRow[];

  const matchFor = (text: string) => active.find((t) => normalizeText(t.text) === normalizeText(text));
  const listedExisting = wanted.map(matchFor).filter((t): t is TaskRow => Boolean(t));
  const unlisted = active.filter((t) => !listedExisting.includes(t));
  const toCreate = wanted.filter((t) => !matchFor(t));

  if (active.length + toCreate.length > MAX_TASKS) {
    const names = unlisted.map((t) => `"${t.text.slice(0, 60)}"`).join(", ");
    throw new ToolError(
      `"${workstream.title}" holds at most ${MAX_TASKS} active tasks, and this would make ${active.length + toCreate.length}. ` +
        `Active tasks not in your list: ${names || "none"}. Complete or remove some in the app, or group your tasks.`,
    );
  }

  const created: string[] = [];
  let position = 0;
  for (const text of wanted) {
    const existing = matchFor(text);
    if (existing) {
      if (existing.position !== position) {
        unwrap(
          await db.from("equilibrium_tasks").update({ position }).eq("id", existing.id),
          "reorder the tasks",
        );
      }
    } else {
      unwrap(
        await db
          .from("equilibrium_tasks")
          .insert({ workstream_id: workstream.id, position, text, status: "active" })
          .select("id")
          .single(),
        "add a task",
      );
      created.push(text);
    }
    position++;
  }
  for (const task of unlisted) {
    if (task.position !== position) {
      unwrap(await db.from("equilibrium_tasks").update({ position }).eq("id", task.id), "reorder the tasks");
    }
    position++;
  }

  return {
    workstream: { id: workstream.id, title: workstream.title },
    tasks: wanted,
    created,
    left_unlisted: unlisted.map((t) => t.text),
    unchanged: created.length === 0,
  };
}

export default defineTool({
  name: "set_tasks",
  title: "Set tasks",
  description:
    "Set the Intuitive Tasks (max 3 active) of one of the signed-in user's Equilibrium workstreams. Existing active tasks are matched by text and kept; missing ones are added; order follows the list. Never deletes or completes tasks. Repeating the same call changes nothing.",
  inputSchema: setTasksInput,
  annotations: WRITE_IDEMPOTENT,
  handler: (input, ctx) => runForUser(ctx, "save the tasks", (db, userId) => setTasks(db, userId, input)),
});
