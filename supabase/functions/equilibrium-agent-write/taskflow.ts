// Task Flow operations for equilibrium-agent-write (issue #71).
// Spec: docs/04-products/equilibrium_task_flow_spec.md §4–§5.
//
// Sibling module with no remote imports, same shape as parked.ts, so vitest can
// exercise it against an in-memory client
// (src/modules/equilibrium/__tests__/agentTaskFlow.test.ts). index.ts handles
// the token gate, idempotency and audit log; it calls these with the raw
// payload. Each mutator returns `{ result, summary }`, honors `dryRun` (reads
// and validation happen, writes do not), and throws messages that match the
// 400 regex in index.ts.

// deno-lint-ignore no-explicit-any
type SupabaseAdmin = any;
// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;

export const OWNERS = ["human", "ai"] as const;
export type Owner = (typeof OWNERS)[number];
export const SUBTASK_STATUSES = ["todo", "in_progress", "waiting", "done", "dropped"] as const;
export type SubtaskStatus = (typeof SUBTASK_STATUSES)[number];
const ACTIVE_SUBTASK_STATUSES = ["todo", "in_progress", "waiting"];
const TERMINAL_SUBTASK_STATUSES = ["done", "dropped"];

export type ItemType = "task" | "subtask";
export interface ItemRef {
  type: ItemType;
  id: string;
}

const DAY_MS = 86_400_000;
const RECENT_DONE_MS = 48 * 3_600_000;
// America/Mexico_City day boundary (UTC-06:00), same as the AI WORK IN PROGRESS panel.
const PANEL_TZ_OFFSET_MS = 6 * 3_600_000;

// ─── Validators (same rules as the helpers in index.ts) ─────────────

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function cleanUuid(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a string.`);
  const text = value.trim();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    throw new Error(`${field} must be a UUID.`);
  }
  return text;
}

function cleanText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} cannot be empty.`);
  if (trimmed.length > maxLength) throw new Error(`${field} is too long.`);
  return trimmed;
}

export function cleanOwner(value: unknown, field = "payload.owner"): Owner {
  if (typeof value !== "string" || !(OWNERS as readonly string[]).includes(value)) {
    throw new Error(`${field} must be one of: ${OWNERS.join(", ")}.`);
  }
  return value as Owner;
}

export function cleanSubtaskStatus(value: unknown, field = "payload.status"): SubtaskStatus {
  if (typeof value !== "string" || !(SUBTASK_STATUSES as readonly string[]).includes(value)) {
    throw new Error(`${field} must be one of: ${SUBTASK_STATUSES.join(", ")}.`);
  }
  return value as SubtaskStatus;
}

export function cleanPriority(value: unknown, field = "payload.priority") {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 3) {
    throw new Error(`${field} must be an integer from 1 to 3.`);
  }
  return num;
}

export function cleanItemRef(value: unknown, field = "payload.item"): ItemRef {
  if (!value || typeof value !== "object") {
    throw new Error(`${field} is required: { "type": "task" | "subtask", "id": "<uuid>" }.`);
  }
  const { type, id } = value as Row;
  if (type !== "task" && type !== "subtask") {
    throw new Error(`${field}.type must be "task" or "subtask".`);
  }
  return { type, id: cleanUuid(id, `${field}.id`) };
}

// Optional string fields: absent -> undefined (leave alone), null/"" -> null (clear).
function optionalClearable(payload: Row, key: string, maxLength: number) {
  if (!(key in payload) || payload[key] === undefined) return undefined;
  if (payload[key] === null || (typeof payload[key] === "string" && !payload[key].trim())) return null;
  return cleanText(payload[key], `payload.${key}`, maxLength);
}

function optionalPriority(payload: Row) {
  if (!("priority" in payload) || payload.priority === undefined) return undefined;
  return payload.priority === null ? null : cleanPriority(payload.priority);
}

export function parseAddSubtask(payload: Row) {
  const status = payload.status === undefined ? "todo" : cleanSubtaskStatus(payload.status);
  const waitingOn = optionalClearable(payload, "waiting_on", 120);
  return {
    taskId: cleanUuid(payload.task_id, "payload.task_id"),
    text: cleanText(payload.text, "payload.text", 4000),
    owner: payload.owner === undefined ? "ai" as Owner : cleanOwner(payload.owner),
    status,
    waitingOn: status === "waiting" ? (waitingOn ?? null) : null,
    priority: optionalPriority(payload) ?? null,
    externalRef: optionalClearable(payload, "external_ref", 2000) ?? null,
    note: optionalClearable(payload, "note", 1000) ?? null,
  };
}

export type SubtaskPatch = {
  text?: string;
  owner?: Owner;
  status?: SubtaskStatus;
  waiting_on?: string | null;
  priority?: number | null;
  external_ref?: string | null;
  note?: string | null;
  position?: number;
};

export function parseSubtaskPatch(payload: Row): SubtaskPatch {
  const patch: SubtaskPatch = {};
  if (payload.text !== undefined) patch.text = cleanText(payload.text, "payload.text", 4000);
  if (payload.owner !== undefined) patch.owner = cleanOwner(payload.owner);
  if (payload.status !== undefined) patch.status = cleanSubtaskStatus(payload.status);
  const waitingOn = optionalClearable(payload, "waiting_on", 120);
  if (waitingOn !== undefined) patch.waiting_on = waitingOn;
  const priority = optionalPriority(payload);
  if (priority !== undefined) patch.priority = priority;
  const externalRef = optionalClearable(payload, "external_ref", 2000);
  if (externalRef !== undefined) patch.external_ref = externalRef;
  const note = optionalClearable(payload, "note", 1000);
  if (note !== undefined) patch.note = note;
  if (payload.position !== undefined) {
    const pos = Number(payload.position);
    if (!Number.isInteger(pos) || pos < 0) throw new Error("payload.position must be an integer >= 0.");
    patch.position = pos;
  }
  if (!Object.keys(patch).length) {
    throw new Error("payload must include at least one field to update.");
  }
  return patch;
}

// Split an agent-authored task string ("Name — body") back into a short
// name + full text. create_task stores `${taskName} — ${textBody}`.
export function taskNameFromText(text: string) {
  const idx = text.indexOf(" — ");
  return idx > 0 ? text.slice(0, idx).trim() : text.trim();
}

// ─── Ownership chain: (subtask ->) task -> workstream -> user ───────

async function ownedWorkstream(admin: SupabaseAdmin, userId: string, workstreamId: string) {
  const { data, error } = await admin
    .from("equilibrium_workstreams")
    .select("*")
    .eq("id", workstreamId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not read workstream: ${error.message}`);
  if (!data) throw new Error("Workstream not found for this user.");
  return data as Row;
}

async function ownedTask(admin: SupabaseAdmin, userId: string, taskId: string) {
  const { data: task, error } = await admin
    .from("equilibrium_tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();
  if (error) throw new Error(`Could not read task: ${error.message}`);
  if (!task) throw new Error("Task not found.");
  const workstream = await ownedWorkstream(admin, userId, (task as Row).workstream_id);
  return { task: task as Row, workstream };
}

async function ownedSubtask(admin: SupabaseAdmin, userId: string, subtaskId: string) {
  const { data: subtask, error } = await admin
    .from("equilibrium_subtasks")
    .select("*")
    .eq("id", subtaskId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not read subtask: ${error.message}`);
  if (!subtask) throw new Error("Subtask not found.");
  const { task, workstream } = await ownedTask(admin, userId, (subtask as Row).task_id);
  return { subtask: subtask as Row, task, workstream };
}

async function loadItem(admin: SupabaseAdmin, userId: string, ref: ItemRef) {
  if (ref.type === "task") {
    const { task, workstream } = await ownedTask(admin, userId, ref.id);
    return { ref, row: task, task, workstream, text: String(task.text ?? ""), status: String(task.status), owner: (task.owner ?? "human") as Owner };
  }
  const { subtask, task, workstream } = await ownedSubtask(admin, userId, ref.id);
  return { ref, row: subtask, task, workstream, text: String(subtask.text ?? ""), status: String(subtask.status), owner: (subtask.owner ?? "ai") as Owner };
}

async function doNowRowFor(admin: SupabaseAdmin, userId: string, ref: ItemRef) {
  const { data, error } = await admin
    .from("equilibrium_do_now")
    .select("*")
    .eq("user_id", userId)
    .eq(ref.type === "task" ? "task_id" : "subtask_id", ref.id)
    .maybeSingle();
  if (error) throw new Error(`Could not read Do Now: ${error.message}`);
  return (data ?? null) as Row | null;
}

async function deleteDoNowRow(admin: SupabaseAdmin, userId: string, rowId: string) {
  const { error } = await admin
    .from("equilibrium_do_now")
    .delete()
    .eq("id", rowId)
    .eq("user_id", userId);
  if (error) throw new Error(`Could not remove Do Now row: ${error.message}`);
}

async function describeDoNowTarget(admin: SupabaseAdmin, row: Row) {
  const isTask = Boolean(row.task_id);
  const { data } = await admin
    .from(isTask ? "equilibrium_tasks" : "equilibrium_subtasks")
    .select("id, text")
    .eq("id", isTask ? row.task_id : row.subtask_id)
    .maybeSingle();
  return {
    type: isTask ? "task" : "subtask",
    id: isTask ? row.task_id : row.subtask_id,
    text: String(data?.text ?? ""),
  };
}

// ─── Subtask CRUD ───────────────────────────────────────────────────

export async function addSubtask(
  admin: SupabaseAdmin,
  userId: string,
  params: ReturnType<typeof parseAddSubtask> & { agentName: string; dryRun: boolean },
) {
  const { taskId, text, owner, status, agentName, dryRun } = params;
  await ownedTask(admin, userId, taskId);

  const { data: siblings, error: readError } = await admin
    .from("equilibrium_subtasks")
    .select("*")
    .eq("task_id", taskId)
    .eq("user_id", userId)
    .in("status", ACTIVE_SUBTASK_STATUSES)
    .order("position", { ascending: true });
  if (readError) throw new Error(`Could not read subtasks: ${readError.message}`);
  const active = Array.isArray(siblings) ? siblings as Row[] : [];

  const existing = active.find((s) => normalizeText(String(s.text ?? "")) === normalizeText(text));
  if (existing) {
    return {
      result: {
        target: "equilibrium_subtasks",
        subtask_id: existing.id,
        created: false,
        task_id: taskId,
        owner: existing.owner,
        status: existing.status,
      },
      summary: `reused existing subtask "${existing.text}"`,
    };
  }

  const terminal = TERMINAL_SUBTASK_STATUSES.includes(status);
  const planned = {
    user_id: userId,
    task_id: taskId,
    position: active.reduce((max, s) => Math.max(max, Number(s.position ?? 0) + 1), 0),
    text,
    owner,
    status,
    waiting_on: params.waitingOn,
    priority: params.priority,
    external_ref: params.externalRef,
    note: params.note,
    created_by: agentName,
    ...(terminal ? { done_at: new Date().toISOString() } : {}),
  };

  let subtaskId = "dry-run-subtask-id";
  if (!dryRun) {
    const { data: created, error } = await admin
      .from("equilibrium_subtasks")
      .insert(planned)
      .select("*")
      .single();
    if (error) throw new Error(`Could not create subtask: ${error.message}`);
    subtaskId = (created as Row).id;
  }
  return {
    result: { target: "equilibrium_subtasks", subtask_id: subtaskId, created: true, task_id: taskId, owner, status },
    summary: `created subtask "${text}"`,
  };
}

export async function updateSubtask(
  admin: SupabaseAdmin,
  userId: string,
  params: { subtaskId: string; patch: SubtaskPatch; dryRun: boolean },
) {
  const { subtaskId, patch, dryRun } = params;
  const { subtask } = await ownedSubtask(admin, userId, subtaskId);

  const now = new Date().toISOString();
  const update: Row = { ...patch, updated_at: now };
  const nextStatus = (patch.status ?? subtask.status) as SubtaskStatus;
  // waiting_on only means something while waiting.
  if (nextStatus !== "waiting") update.waiting_on = null;
  const nextTerminal = TERMINAL_SUBTASK_STATUSES.includes(nextStatus);
  if (nextTerminal) update.done_at = subtask.done_at ?? now;
  else if (patch.status !== undefined) update.done_at = null;

  let doNowRemoved = false;
  if (!dryRun) {
    const { error } = await admin
      .from("equilibrium_subtasks")
      .update(update)
      .eq("id", subtaskId)
      .eq("user_id", userId);
    if (error) throw new Error(`Could not update subtask: ${error.message}`);
    if (nextTerminal) {
      const row = await doNowRowFor(admin, userId, { type: "subtask", id: subtaskId });
      if (row) {
        await deleteDoNowRow(admin, userId, row.id);
        doNowRemoved = true;
      }
    }
  }
  return {
    result: {
      target: "equilibrium_subtasks",
      subtask_id: subtaskId,
      updated: Object.keys(patch),
      status: nextStatus,
      do_now_removed: doNowRemoved,
    },
    summary: `updated subtask ${subtaskId}`,
  };
}

export async function deleteSubtask(
  admin: SupabaseAdmin,
  userId: string,
  params: { subtaskId: string; dryRun: boolean },
) {
  const { subtaskId, dryRun } = params;
  await ownedSubtask(admin, userId, subtaskId);
  if (!dryRun) {
    // The Do Now row, if any, goes with it (ON DELETE CASCADE).
    const { error } = await admin
      .from("equilibrium_subtasks")
      .delete()
      .eq("id", subtaskId)
      .eq("user_id", userId);
    if (error) throw new Error(`Could not delete subtask: ${error.message}`);
  }
  return {
    result: { target: "equilibrium_subtasks", subtask_id: subtaskId, deleted: !dryRun },
    summary: `deleted subtask ${subtaskId}`,
  };
}

// ─── DO NOW ─────────────────────────────────────────────────────────

export async function promoteDoNow(
  admin: SupabaseAdmin,
  userId: string,
  params: { ref: ItemRef; owner?: Owner; agentName: string; dryRun: boolean },
) {
  const { ref, agentName, dryRun } = params;
  const item = await loadItem(admin, userId, ref);
  if (item.status === "done" || item.status === "dropped") {
    throw new Error(`Cannot promote a ${item.status} ${ref.type} to Do Now.`);
  }
  const owner = params.owner ?? item.owner;
  const existing = await doNowRowFor(admin, userId, ref);

  if (existing && existing.owner === owner) {
    return {
      result: {
        target: "equilibrium_do_now",
        item: ref,
        owner,
        position: existing.position,
        promoted: false,
        unchanged: true,
        replaced: null,
      },
      summary: `${ref.type} ${ref.id} already in ${owner} Do Now`,
    };
  }

  // HUMAN Do Now is exactly one: a different human item is replaced.
  let humanRow: Row | null = null;
  let replaced: { type: string; id: string; text: string } | null = null;
  if (owner === "human") {
    const { data, error } = await admin
      .from("equilibrium_do_now")
      .select("*")
      .eq("user_id", userId)
      .eq("owner", "human")
      .maybeSingle();
    if (error) throw new Error(`Could not read human Do Now: ${error.message}`);
    humanRow = (data ?? null) as Row | null;
    if (humanRow) replaced = await describeDoNowTarget(admin, humanRow);
  }

  let position = 0;
  if (owner === "ai") {
    const { data, error } = await admin
      .from("equilibrium_do_now")
      .select("position")
      .eq("user_id", userId)
      .eq("owner", "ai")
      .order("position", { ascending: false })
      .limit(1);
    if (error) throw new Error(`Could not read AI Do Now: ${error.message}`);
    const top = Array.isArray(data) ? data[0] : null;
    position = top ? Number(top.position ?? 0) + 1 : 0;
  }

  const now = new Date().toISOString();
  if (!dryRun) {
    // No multi-statement transaction through supabase-js: delete-then-insert,
    // restoring what was deleted if the insert fails (spec §7.5).
    const deleted: Row[] = [];
    for (const row of [existing, humanRow]) {
      if (!row) continue;
      await deleteDoNowRow(admin, userId, row.id);
      deleted.push(row);
    }
    const { error: insertError } = await admin
      .from("equilibrium_do_now")
      .insert({
        user_id: userId,
        owner,
        task_id: ref.type === "task" ? ref.id : null,
        subtask_id: ref.type === "subtask" ? ref.id : null,
        position,
        promoted_at: now,
        promoted_by: agentName,
      });
    if (insertError) {
      for (const row of deleted) await admin.from("equilibrium_do_now").insert(row);
      throw new Error(`Could not promote to Do Now: ${insertError.message}`);
    }
    if (ref.type === "task") {
      const { error } = await admin
        .from("equilibrium_tasks")
        .update({ do_now_at: now })
        .eq("id", ref.id);
      if (error) throw new Error(`Could not stamp Do Now time on task: ${error.message}`);
    }
  }

  return {
    result: {
      target: "equilibrium_do_now",
      item: ref,
      owner,
      position,
      promoted: !dryRun,
      replaced,
      promoted_at: now,
    },
    summary: `promoted ${ref.type} ${ref.id} to ${owner} Do Now${replaced ? `, replacing ${replaced.type} ${replaced.id}` : ""}`,
  };
}

export async function demote(
  admin: SupabaseAdmin,
  userId: string,
  params: { ref: ItemRef; dryRun: boolean },
) {
  const { ref, dryRun } = params;
  await loadItem(admin, userId, ref);
  const row = await doNowRowFor(admin, userId, ref);
  if (!row) {
    return {
      result: { target: "equilibrium_do_now", item: ref, demoted: false },
      summary: `${ref.type} ${ref.id} was not in Do Now`,
    };
  }
  if (!dryRun) await deleteDoNowRow(admin, userId, row.id);
  return {
    result: { target: "equilibrium_do_now", item: ref, owner: row.owner, demoted: !dryRun },
    summary: `demoted ${ref.type} ${ref.id} from ${row.owner} Do Now`,
  };
}

export async function complete(
  admin: SupabaseAdmin,
  userId: string,
  params: { ref: ItemRef; dryRun: boolean },
) {
  const { ref, dryRun } = params;
  const item = await loadItem(admin, userId, ref);
  const now = new Date().toISOString();

  if (ref.type === "subtask") {
    if (item.status === "dropped") throw new Error("Cannot complete a dropped subtask.");
    const doneAt = item.status === "done" ? (item.row.done_at ?? now) : now;
    if (!dryRun) {
      if (item.status !== "done") {
        const { error } = await admin
          .from("equilibrium_subtasks")
          .update({ status: "done", done_at: now, waiting_on: null, updated_at: now })
          .eq("id", ref.id)
          .eq("user_id", userId);
        if (error) throw new Error(`Could not complete subtask: ${error.message}`);
      }
      const row = await doNowRowFor(admin, userId, ref);
      if (row) await deleteDoNowRow(admin, userId, row.id);
    }
    return {
      result: { target: "equilibrium_subtasks", subtask_id: ref.id, status: "done", done_at: doneAt },
      summary: `completed subtask ${ref.id}`,
    };
  }

  // Task. Its open subtasks stay open (D4).
  const doneAt = item.status === "done" ? (item.row.done_at ?? now) : now;
  if (!dryRun) {
    if (item.status !== "done") {
      const { error } = await admin
        .from("equilibrium_tasks")
        .update({
          status: "done",
          done_at: now,
          do_now_at: null,
          workstream_title_snapshot: item.workstream.title,
        })
        .eq("id", ref.id);
      if (error) throw new Error(`Could not complete task: ${error.message}`);
    }
    const row = await doNowRowFor(admin, userId, ref);
    if (row) await deleteDoNowRow(admin, userId, row.id);
    // Legacy 3-slot focus row, until the app stops reading it (Phase 2).
    const { error: focusError } = await admin
      .from("equilibrium_focus")
      .delete()
      .eq("user_id", userId)
      .eq("task_id", ref.id);
    if (focusError) throw new Error(`Could not remove completed task from focus: ${focusError.message}`);
  }
  return {
    result: { target: "equilibrium_tasks", task_id: ref.id, status: "done", done_at: doneAt },
    summary: `completed task ${ref.id}`,
  };
}

// ─── Synthesis ops: move / convert ──────────────────────────────────

export async function moveTask(
  admin: SupabaseAdmin,
  userId: string,
  params: { taskId: string; workstreamId: string; maxTasks: number; dryRun: boolean },
) {
  const { taskId, workstreamId, maxTasks, dryRun } = params;
  const { task } = await ownedTask(admin, userId, taskId);
  const target = await ownedWorkstream(admin, userId, workstreamId);

  if (task.workstream_id === workstreamId) {
    return {
      result: { target: "equilibrium_tasks", task_id: taskId, workstream_id: workstreamId, moved: false },
      summary: `task ${taskId} is already in workstream "${target.title}"`,
    };
  }

  const { data, error } = await admin
    .from("equilibrium_tasks")
    .select("id")
    .eq("workstream_id", workstreamId)
    .eq("status", "active");
  if (error) throw new Error(`Could not read tasks: ${error.message}`);
  const activeCount = Array.isArray(data) ? data.length : 0;
  if (task.status === "active" && activeCount >= maxTasks) {
    throw new Error(
      `Cannot move task: active task cap is ${maxTasks} for the target workstream. ` +
      "Make room with move_task or convert_task_to_subtask.",
    );
  }

  // Its subtasks follow through task_id; nothing to rewrite.
  if (!dryRun) {
    const { error: updateError } = await admin
      .from("equilibrium_tasks")
      .update({ workstream_id: workstreamId, position: activeCount })
      .eq("id", taskId);
    if (updateError) throw new Error(`Could not move task: ${updateError.message}`);
  }
  return {
    result: {
      target: "equilibrium_tasks",
      task_id: taskId,
      from_workstream_id: task.workstream_id,
      workstream_id: workstreamId,
      position: activeCount,
      moved: !dryRun,
    },
    summary: `moved task ${taskId} to workstream "${target.title}"`,
  };
}

export async function convertTaskToSubtask(
  admin: SupabaseAdmin,
  userId: string,
  params: { taskId: string; parentTaskId: string; owner?: Owner; agentName: string; dryRun: boolean },
) {
  const { taskId, parentTaskId, agentName, dryRun } = params;
  if (taskId === parentTaskId) throw new Error("Cannot convert a task into a subtask of itself.");
  const { task } = await ownedTask(admin, userId, taskId);
  await ownedTask(admin, userId, parentTaskId);

  const { data: ownSubtasks, error: ownError } = await admin
    .from("equilibrium_subtasks")
    .select("id")
    .eq("task_id", taskId)
    .eq("user_id", userId);
  if (ownError) throw new Error(`Could not read subtasks: ${ownError.message}`);
  const reparentIds = (Array.isArray(ownSubtasks) ? ownSubtasks as Row[] : []).map((s) => s.id);

  const { data: parentSubtasks, error: parentError } = await admin
    .from("equilibrium_subtasks")
    .select("position")
    .eq("task_id", parentTaskId)
    .eq("user_id", userId);
  if (parentError) throw new Error(`Could not read subtasks: ${parentError.message}`);

  const doNowRow = await doNowRowFor(admin, userId, { type: "task", id: taskId });
  const owner = params.owner ?? (task.owner ?? "human") as Owner;
  const done = task.status === "done";
  const newSubtask = {
    user_id: userId,
    task_id: parentTaskId,
    position: (Array.isArray(parentSubtasks) ? parentSubtasks as Row[] : [])
      .reduce((max, s) => Math.max(max, Number(s.position ?? 0) + 1), 0),
    text: String(task.text ?? ""),
    owner,
    status: done ? "done" : "todo",
    created_by: agentName,
    created_at: task.created_at,
    done_at: done ? (task.done_at ?? null) : null,
  };

  const plan = {
    new_subtask: {
      task_id: parentTaskId,
      text: newSubtask.text,
      owner,
      status: newSubtask.status,
      created_at: newSubtask.created_at,
    },
    reparent_subtask_ids: reparentIds,
    move_do_now: doNowRow ? { owner: doNowRow.owner, from: { type: "task", id: taskId }, to: "new subtask" } : null,
    delete_task_id: taskId,
  };
  const summary = `converted task ${taskId} to a subtask of ${parentTaskId}`;

  if (dryRun) {
    return {
      result: {
        target: "equilibrium_subtasks",
        subtask_id: "dry-run-subtask-id",
        converted: false,
        task_id: taskId,
        parent_task_id: parentTaskId,
        plan,
      },
      summary,
    };
  }

  // Order matters: the task is deleted last, so a failure midway leaves a
  // duplicate to clean up, never a loss.
  const { data: created, error: insertError } = await admin
    .from("equilibrium_subtasks")
    .insert(newSubtask)
    .select("*")
    .single();
  if (insertError) throw new Error(`Could not create subtask: ${insertError.message}`);
  const subtaskId = (created as Row).id;

  const rollbackNewSubtask = async () => {
    await admin.from("equilibrium_subtasks").delete().eq("id", subtaskId).eq("user_id", userId);
  };

  if (reparentIds.length) {
    const { error } = await admin
      .from("equilibrium_subtasks")
      .update({ task_id: parentTaskId, updated_at: new Date().toISOString() })
      .eq("task_id", taskId)
      .eq("user_id", userId);
    if (error) {
      await rollbackNewSubtask();
      throw new Error(`Could not re-parent subtasks (task not deleted): ${error.message}`);
    }
  }
  if (doNowRow) {
    const { error } = await admin
      .from("equilibrium_do_now")
      .update({ task_id: null, subtask_id: subtaskId })
      .eq("id", doNowRow.id)
      .eq("user_id", userId);
    if (error) throw new Error(`Could not move Do Now row (task not deleted): ${error.message}`);
  }
  const { error: deleteError } = await admin
    .from("equilibrium_tasks")
    .delete()
    .eq("id", taskId);
  if (deleteError) throw new Error(`Could not delete converted task (subtask created): ${deleteError.message}`);

  return {
    result: {
      target: "equilibrium_subtasks",
      subtask_id: subtaskId,
      converted: true,
      task_id: taskId,
      parent_task_id: parentTaskId,
      owner,
      status: newSubtask.status,
      reparented_subtasks: reparentIds.length,
      do_now_moved: Boolean(doNowRow),
    },
    summary,
  };
}

// ─── read_state v2 ──────────────────────────────────────────────────

export const SUBTASK_COLUMNS =
  "id, task_id, position, text, owner, status, waiting_on, priority, external_ref, note, created_by, created_at, updated_at, done_at";

// Subtasks the read needs: every non-terminal one plus terminal ones closed in
// the last 48 h (the panel's done list).
export async function readSubtasks(admin: SupabaseAdmin, userId: string, nowMs: number) {
  const since = new Date(nowMs - RECENT_DONE_MS).toISOString();
  const [open, closed] = await Promise.all([
    admin.from("equilibrium_subtasks").select(SUBTASK_COLUMNS)
      .eq("user_id", userId).in("status", ACTIVE_SUBTASK_STATUSES).order("position", { ascending: true }),
    admin.from("equilibrium_subtasks").select(SUBTASK_COLUMNS)
      .eq("user_id", userId).in("status", TERMINAL_SUBTASK_STATUSES).gte("done_at", since),
  ]);
  if (open.error) throw new Error(`Could not read subtasks: ${open.error.message}`);
  if (closed.error) throw new Error(`Could not read subtasks: ${closed.error.message}`);
  return [
    ...(Array.isArray(open.data) ? open.data : []),
    ...(Array.isArray(closed.data) ? closed.data : []),
  ] as Row[];
}

export function startOfPanelDayMs(nowMs: number) {
  return Math.floor((nowMs - PANEL_TZ_OFFSET_MS) / DAY_MS) * DAY_MS + PANEL_TZ_OFFSET_MS;
}

export function shapeTaskFlowState(input: {
  workstreams: Row[];
  tasks: Row[]; // active tasks
  parentTasks: Row[]; // extra tasks (e.g. done) only needed to resolve subtask paths
  subtasks: Row[];
  doNow: Row[];
  caps: { workstreams: number; tasksPerWorkstream: number };
  nowMs: number;
}) {
  const { caps, nowMs } = input;
  const recentCutoff = nowMs - RECENT_DONE_MS;
  const dayStart = startOfPanelDayMs(nowMs);

  const wsById = new Map(input.workstreams.map((w) => [w.id, w] as const));
  const taskById = new Map([...input.parentTasks, ...input.tasks].map((t) => [t.id, t] as const));
  const subtasks = input.subtasks.filter((s) =>
    !TERMINAL_SUBTASK_STATUSES.includes(s.status) ||
    (s.done_at && new Date(s.done_at).getTime() >= recentCutoff));
  const subtaskById = new Map(subtasks.map((s) => [s.id, s] as const));

  const doNowByTask = new Map<string, Row>();
  const doNowBySubtask = new Map<string, Row>();
  for (const row of input.doNow) {
    if (row.task_id) doNowByTask.set(row.task_id, row);
    if (row.subtask_id) doNowBySubtask.set(row.subtask_id, row);
  }

  const taskPath = (task: Row) => {
    const ws = wsById.get(task.workstream_id);
    return ws ? [String(ws.title)] : [];
  };
  const subtaskPath = (subtask: Row) => {
    const task = taskById.get(subtask.task_id);
    return task ? [...taskPath(task), taskNameFromText(String(task.text ?? ""))] : [];
  };

  const subtaskOut = (s: Row) => ({
    id: s.id,
    text: s.text,
    owner: s.owner,
    status: s.status,
    waiting_on: s.waiting_on ?? null,
    priority: s.priority ?? null,
    external_ref: s.external_ref ?? null,
    note: s.note ?? null,
    do_now: doNowBySubtask.get(s.id)?.owner ?? null,
    created_by: s.created_by,
    created_at: s.created_at,
    updated_at: s.updated_at,
    done_at: s.done_at ?? null,
  });
  const subtasksOfTask = (taskId: string) => {
    const mine = subtasks.filter((s) => s.task_id === taskId);
    const open = mine.filter((s) => !TERMINAL_SUBTASK_STATUSES.includes(s.status))
      .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0));
    const closed = mine.filter((s) => TERMINAL_SUBTASK_STATUSES.includes(s.status))
      .sort((a, b) => new Date(b.done_at).getTime() - new Date(a.done_at).getTime());
    return [...open, ...closed].map(subtaskOut);
  };

  const workstreams = input.workstreams.map((workstream) => {
    const tasks = input.tasks.filter((t) => t.workstream_id === workstream.id);
    return {
      id: workstream.id,
      title: workstream.title,
      position: workstream.position,
      over_cap: Number(workstream.position ?? 0) >= caps.workstreams || tasks.length > caps.tasksPerWorkstream,
      tasks: tasks.map((task) => ({
        id: task.id,
        name: taskNameFromText(String(task.text ?? "")),
        text: task.text,
        status: task.status,
        owner: task.owner ?? "human",
        is_focus: doNowByTask.has(task.id),
        do_now: doNowByTask.get(task.id)?.owner ?? null,
        created_at: task.created_at,
        subtasks: subtasksOfTask(task.id),
      })),
    };
  });

  const entryFor = (row: Row) => {
    if (row.task_id) {
      const task = taskById.get(row.task_id);
      if (!task) return null;
      return { type: "task", id: task.id, text: String(task.text ?? ""), path: taskPath(task), status: String(task.status ?? "active"), waiting_on: null };
    }
    const subtask = subtaskById.get(row.subtask_id);
    if (!subtask) return null;
    return { type: "subtask", id: subtask.id, text: String(subtask.text ?? ""), path: subtaskPath(subtask), status: String(subtask.status), waiting_on: subtask.waiting_on ?? null };
  };

  const humanRow = input.doNow.find((r) => r.owner === "human") ?? null;
  const humanEntry = humanRow ? entryFor(humanRow) : null;
  const aiEntries = input.doNow
    .filter((r) => r.owner === "ai")
    .sort((a, b) => Number(a.position ?? 0) - Number(b.position ?? 0))
    .map(entryFor)
    .filter((e): e is NonNullable<typeof e> => e !== null);

  // Legacy `do_now`: the HUMAN Do Now as {id, name, workstream_title}. For a
  // subtask, id = parent task id and name = the subtask text.
  let legacyDoNow: { id: string; name: string; workstream_title: string | null } | null = null;
  if (humanRow && humanEntry) {
    if (humanRow.task_id) {
      const task = taskById.get(humanRow.task_id)!;
      legacyDoNow = { id: task.id, name: taskNameFromText(String(task.text ?? "")), workstream_title: wsById.get(task.workstream_id)?.title ?? null };
    } else {
      const subtask = subtaskById.get(humanRow.subtask_id)!;
      const parent = taskById.get(subtask.task_id);
      legacyDoNow = {
        id: subtask.task_id,
        name: String(subtask.text ?? ""),
        workstream_title: parent ? (wsById.get(parent.workstream_id)?.title ?? null) : null,
      };
    }
  }

  const waitingOnHuman = subtasks
    .filter((s) => s.status === "waiting" && normalizeText(String(s.waiting_on ?? "")) === "sasha")
    .sort((a, b) =>
      (a.priority ?? 99) - (b.priority ?? 99) ||
      String(a.created_at).localeCompare(String(b.created_at)))
    .map((s) => ({ type: "subtask", id: s.id, text: s.text, path: subtaskPath(s) }));

  const countStatus = (status: string) => subtasks.filter((s) => s.status === status).length;
  const closedToday = (status: string) =>
    subtasks.filter((s) => s.status === status && s.done_at && new Date(s.done_at).getTime() >= dayStart).length;

  return {
    caps: { workstreams: caps.workstreams, tasks_per_workstream: caps.tasksPerWorkstream, human_do_now: 1 },
    workstreams,
    doNow: legacyDoNow,
    do_now_v2: {
      human: humanEntry
        ? { type: humanEntry.type, id: humanEntry.id, text: humanEntry.text, path: humanEntry.path, promoted_at: humanRow!.promoted_at }
        : null,
      ai: aiEntries.map((e) => ({ type: e.type, id: e.id, text: e.text, path: e.path, status: e.status, waiting_on: e.waiting_on })),
    },
    waiting_on_human: waitingOnHuman,
    subtask_counts: {
      todo: countStatus("todo"),
      in_progress: countStatus("in_progress"),
      waiting: countStatus("waiting"),
      waiting_on_human: waitingOnHuman.length,
      done_today: closedToday("done"),
      dropped_today: closedToday("dropped"),
    },
    humanDoNowFilled: humanEntry !== null,
  };
}
