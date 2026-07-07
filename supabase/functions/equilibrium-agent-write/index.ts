import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BODY_BYTES = 25_000;
const MAX_WORKSTREAMS = 7;
const MAX_TASKS = 7;
const MAX_FOCUS = 3;

type Operation =
  | "set_lifelong_dedication"
  | "set_role"
  | "set_moon_focus"
  | "upsert_strategy"
  | "create_workstream"
  | "rename_workstream"
  | "create_task"
  | "rename_task"
  | "complete_task"
  | "promote_task_to_focus"
  | "append_synthesis_log";

interface AgentWriteRequest {
  operation?: Operation;
  agent_name?: string;
  idempotency_key?: string;
  dry_run?: boolean;
  payload?: Record<string, unknown>;
}

type SupabaseAdmin = any;

const allowedOperations = new Set<Operation>([
  "set_lifelong_dedication",
  "set_role",
  "set_moon_focus",
  "upsert_strategy",
  "create_workstream",
  "rename_workstream",
  "create_task",
  "rename_task",
  "complete_task",
  "promote_task_to_focus",
  "append_synthesis_log",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function cleanString(value: unknown, field: string, maxLength: number) {
  if (typeof value !== "string") throw new Error(`${field} must be a string.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} cannot be empty.`);
  if (trimmed.length > maxLength) throw new Error(`${field} is too long.`);
  return trimmed;
}

function optionalString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function cleanUuid(value: unknown, field: string) {
  const text = cleanString(value, field, 80);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)) {
    throw new Error(`${field} must be a UUID.`);
  }
  return text;
}

function cleanPosition(value: unknown, field: string, max: number) {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(num) || num < 1 || num > max) {
    throw new Error(`${field} must be an integer from 1 to ${max}.`);
  }
  return num;
}

function tokenFrom(req: Request) {
  const headerToken = req.headers.get("x-agent-token")?.trim();
  if (headerToken) return headerToken;
  const auth = req.headers.get("authorization") ?? "";
  return auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? null;
}

async function findIdempotentResult(
  admin: SupabaseAdmin,
  userId: string,
  idempotencyKey?: string,
) {
  if (!idempotencyKey) return null;
  const { data, error } = await admin
    .from("equilibrium_synthesis_log")
    .select("id, generated_at, cycle_snapshot_json")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false })
    .limit(75);

  if (error) throw new Error(`Could not check idempotency: ${error.message}`);
  const existing = Array.isArray(data)
    ? data.find((row: any) => row?.cycle_snapshot_json?.idempotency_key === idempotencyKey)
    : null;
  return existing ?? null;
}

async function appendAuditLog(
  admin: SupabaseAdmin,
  userId: string,
  params: {
    agentName: string;
    operation: Operation;
    idempotencyKey?: string;
    dryRun: boolean;
    summary: string;
    result: Record<string, unknown>;
    payload?: Record<string, unknown>;
  },
) {
  if (params.dryRun) return null;
  const { data, error } = await admin
    .from("equilibrium_synthesis_log")
    .insert({
      user_id: userId,
      reading_text: `Agent mutation: ${params.summary}`,
      cycle_snapshot_json: {
        source: "equilibrium-agent-write",
        agent_name: params.agentName,
        operation: params.operation,
        idempotency_key: params.idempotencyKey ?? null,
        result: params.result,
        payload: params.payload ?? {},
        written_at: new Date().toISOString(),
      },
    })
    .select("id")
    .single();

  if (error) throw new Error(`Could not append audit log: ${error.message}`);
  return data?.id ?? null;
}

async function getOwnedWorkstream(admin: SupabaseAdmin, userId: string, workstreamId: string) {
  const { data, error } = await admin
    .from("equilibrium_workstreams")
    .select("*")
    .eq("id", workstreamId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not read workstream: ${error.message}`);
  if (!data) throw new Error("Workstream not found for this user.");
  return data as any;
}

async function ensureWorkstream(
  admin: SupabaseAdmin,
  userId: string,
  title: string,
  dryRun: boolean,
) {
  const { data, error } = await admin
    .from("equilibrium_workstreams")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("position", { ascending: true });
  if (error) throw new Error(`Could not read workstreams: ${error.message}`);

  const rows = Array.isArray(data) ? data as any[] : [];
  const existing = rows.find((row) => normalizeText(String(row.title ?? "")) === normalizeText(title));
  if (existing) return { workstream: existing, created: false };
  if (rows.length >= MAX_WORKSTREAMS) throw new Error(`Cannot create workstream: active workstream cap is ${MAX_WORKSTREAMS}.`);

  const planned = {
    user_id: userId,
    position: rows.length,
    title,
  };
  if (dryRun) return { workstream: { ...planned, id: "dry-run-workstream-id" }, created: true };

  const { data: created, error: insertError } = await admin
    .from("equilibrium_workstreams")
    .insert(planned)
    .select("*")
    .single();
  if (insertError) throw new Error(`Could not create workstream: ${insertError.message}`);
  return { workstream: created as any, created: true };
}

async function getOwnedTask(admin: SupabaseAdmin, userId: string, taskId: string) {
  const { data: task, error: taskError } = await admin
    .from("equilibrium_tasks")
    .select("*")
    .eq("id", taskId)
    .maybeSingle();
  if (taskError) throw new Error(`Could not read task: ${taskError.message}`);
  if (!task) throw new Error("Task not found.");

  await getOwnedWorkstream(admin, userId, (task as any).workstream_id);
  return task as any;
}

async function appendSynthesisState(
  admin: SupabaseAdmin,
  userId: string,
  text: string,
  dryRun: boolean,
) {
  const now = new Date().toISOString();
  if (dryRun) {
    return { last_synthesis_at: now, log_id: "dry-run-log-id" };
  }

  const { data, error } = await admin
    .from("equilibrium_synthesis_log")
    .insert({
      user_id: userId,
      reading_text: text,
      cycle_snapshot_json: {
        source: "equilibrium-agent-write",
        operation: "append_synthesis_log",
        written_at: now,
      },
    })
    .select("id")
    .single();
  if (error) throw new Error(`Could not append synthesis log: ${error.message}`);

  const { error: stateError } = await admin
    .from("equilibrium_state")
    .upsert({
      user_id: userId,
      last_synthesis_text: text,
      last_synthesis_at: now,
      updated_at: now,
    }, { onConflict: "user_id" });
  if (stateError) throw new Error(`Could not update synthesis cache: ${stateError.message}`);
  return { last_synthesis_at: now, log_id: data?.id ?? null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: `Request body too large. Limit is ${MAX_BODY_BYTES} bytes.` }, 413);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const expectedToken = Deno.env.get("EQUILIBRIUM_AGENT_WRITE_TOKEN");
    const userId = Deno.env.get("EQUILIBRIUM_AGENT_WRITE_USER_ID");

    if (!supabaseUrl || !serviceKey || !expectedToken || !userId) {
      return jsonResponse({ error: "Agent write environment is not configured." }, 500);
    }

    const providedToken = tokenFrom(req);
    if (!providedToken || providedToken !== expectedToken) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const rawBody = await req.json() as AgentWriteRequest;
    const operation = rawBody.operation;
    if (!operation || !allowedOperations.has(operation)) {
      return jsonResponse({ error: "Unsupported operation." }, 400);
    }

    const payload = rawBody.payload && typeof rawBody.payload === "object" ? rawBody.payload : {};
    const agentName = optionalString(rawBody.agent_name, 80) ?? "external-agent";
    const idempotencyKey = optionalString(rawBody.idempotency_key, 180);
    const dryRun = rawBody.dry_run === true;
    const admin = createClient(supabaseUrl, serviceKey);

    const existing = await findIdempotentResult(admin, userId, idempotencyKey);
    if (existing && !dryRun) {
      return jsonResponse({
        source: "equilibrium-agent-write",
        idempotent: true,
        audit_log_id: (existing as any).id,
        generated_at: (existing as any).generated_at,
      });
    }

    let result: Record<string, unknown>;
    let summary: string;

    if (operation === "set_lifelong_dedication" || operation === "set_role" || operation === "set_moon_focus") {
      const text = cleanString(payload.text, "payload.text", 4000);
      const fieldByOperation = {
        set_lifelong_dedication: "mission_override_text",
        set_role: "role_override_text",
        set_moon_focus: "moon_focus_text",
      } as const;
      const field = fieldByOperation[operation];
      const now = new Date().toISOString();
      if (!dryRun) {
        const { error } = await admin
          .from("equilibrium_state")
          .upsert({
            user_id: userId,
            [field]: text,
            updated_at: now,
          }, { onConflict: "user_id" });
        if (error) throw new Error(`Could not update ${field}: ${error.message}`);
      }
      result = { target: "equilibrium_state", field, text };
      summary = `${field} updated`;
    } else if (operation === "upsert_strategy") {
      const position = cleanPosition(payload.position, "payload.position", 3);
      const text = cleanString(payload.text, "payload.text", 4000);
      const now = new Date().toISOString();
      if (!dryRun) {
        const { error } = await admin
          .from("equilibrium_strategies")
          .upsert({
            user_id: userId,
            position,
            text,
            set_at: now,
          }, { onConflict: "user_id,position" });
        if (error) throw new Error(`Could not upsert strategy: ${error.message}`);
      }
      result = { target: "equilibrium_strategies", position, text };
      summary = `strategy ${position} upserted`;
    } else if (operation === "create_workstream") {
      const title = cleanString(payload.title, "payload.title", 180);
      const ensured = await ensureWorkstream(admin, userId, title, dryRun);
      result = {
        target: "equilibrium_workstreams",
        workstream_id: ensured.workstream.id,
        created: ensured.created,
        title: ensured.workstream.title,
      };
      summary = `${ensured.created ? "created" : "reused"} workstream "${ensured.workstream.title}"`;
    } else if (operation === "rename_workstream") {
      const workstreamId = cleanUuid(payload.workstream_id, "payload.workstream_id");
      const title = cleanString(payload.title, "payload.title", 180);
      await getOwnedWorkstream(admin, userId, workstreamId);
      if (!dryRun) {
        const { error } = await admin
          .from("equilibrium_workstreams")
          .update({ title })
          .eq("id", workstreamId);
        if (error) throw new Error(`Could not rename workstream: ${error.message}`);
      }
      result = { target: "equilibrium_workstreams", workstream_id: workstreamId, title };
      summary = `renamed workstream ${workstreamId}`;
    } else if (operation === "create_task") {
      const workstreamIdFromPayload = optionalString(payload.workstream_id, 80);
      const workstreamTitle = optionalString(payload.workstream_title, 180);
      if (!workstreamIdFromPayload && !workstreamTitle) {
        throw new Error("payload.workstream_id or payload.workstream_title is required.");
      }

      const workstream = workstreamIdFromPayload
        ? await getOwnedWorkstream(admin, userId, cleanUuid(workstreamIdFromPayload, "payload.workstream_id"))
        : (await ensureWorkstream(admin, userId, workstreamTitle!, dryRun)).workstream;

      const taskName = optionalString(payload.task_name, 160);
      const textBody = cleanString(payload.text, "payload.text", 4000);
      const taskText = taskName ? `${taskName} — ${textBody}` : textBody;

      const shouldQueryTasks = !(dryRun && workstream.id === "dry-run-workstream-id");
      const { data: taskRows, error: taskError } = shouldQueryTasks
        ? await admin
          .from("equilibrium_tasks")
          .select("*")
          .eq("workstream_id", workstream.id)
          .eq("status", "active")
          .order("position", { ascending: true })
        : { data: [], error: null };
      if (taskError) throw new Error(`Could not read tasks: ${taskError.message}`);

      const activeTasks = Array.isArray(taskRows) ? taskRows as any[] : [];
      const existingTask = activeTasks.find((task) => normalizeText(String(task.text ?? "")) === normalizeText(taskText));
      if (existingTask) {
        result = {
          target: "equilibrium_tasks",
          task_id: existingTask.id,
          created: false,
          workstream_id: workstream.id,
          text: existingTask.text,
        };
        summary = `reused existing task "${existingTask.text}"`;
      } else {
        if (activeTasks.length >= MAX_TASKS) throw new Error(`Cannot create task: active task cap is ${MAX_TASKS} for this workstream.`);
        const planned = {
          workstream_id: workstream.id,
          position: activeTasks.length,
          text: taskText,
          status: "active",
        };
        if (dryRun) {
          result = {
            target: "equilibrium_tasks",
            task_id: "dry-run-task-id",
            created: true,
            workstream_id: workstream.id,
            text: taskText,
            metadata: {
              strategy_position: payload.strategy_position ?? null,
              output_feeds: payload.output_feeds ?? null,
            },
          };
        } else {
          const { data: created, error: insertError } = await admin
            .from("equilibrium_tasks")
            .insert(planned)
            .select("*")
            .single();
          if (insertError) throw new Error(`Could not create task: ${insertError.message}`);
          result = {
            target: "equilibrium_tasks",
            task_id: (created as any).id,
            created: true,
            workstream_id: workstream.id,
            text: (created as any).text,
            metadata: {
              strategy_position: payload.strategy_position ?? null,
              output_feeds: payload.output_feeds ?? null,
            },
          };
        }
        summary = `created task "${taskText}"`;
      }
    } else if (operation === "rename_task") {
      const taskId = cleanUuid(payload.task_id, "payload.task_id");
      const text = cleanString(payload.text, "payload.text", 4000);
      await getOwnedTask(admin, userId, taskId);
      if (!dryRun) {
        const { error } = await admin
          .from("equilibrium_tasks")
          .update({ text })
          .eq("id", taskId);
        if (error) throw new Error(`Could not rename task: ${error.message}`);
      }
      result = { target: "equilibrium_tasks", task_id: taskId, text };
      summary = `renamed task ${taskId}`;
    } else if (operation === "complete_task") {
      const taskId = cleanUuid(payload.task_id, "payload.task_id");
      await getOwnedTask(admin, userId, taskId);
      const now = new Date().toISOString();
      if (!dryRun) {
        const { error: updateError } = await admin
          .from("equilibrium_tasks")
          .update({ status: "done", done_at: now, do_now_at: null })
          .eq("id", taskId);
        if (updateError) throw new Error(`Could not complete task: ${updateError.message}`);
        const { error: focusError } = await admin
          .from("equilibrium_focus")
          .delete()
          .eq("user_id", userId)
          .eq("task_id", taskId);
        if (focusError) throw new Error(`Could not remove completed task from focus: ${focusError.message}`);
      }
      result = { target: "equilibrium_tasks", task_id: taskId, status: "done", done_at: now };
      summary = `completed task ${taskId}`;
    } else if (operation === "promote_task_to_focus") {
      const taskId = cleanUuid(payload.task_id, "payload.task_id");
      const position = cleanPosition(payload.position ?? 1, "payload.position", MAX_FOCUS);
      await getOwnedTask(admin, userId, taskId);
      const now = new Date().toISOString();
      if (!dryRun) {
        const { error: focusError } = await admin
          .from("equilibrium_focus")
          .upsert({
            user_id: userId,
            position,
            task_id: taskId,
            promoted_at: now,
          }, { onConflict: "user_id,position" });
        if (focusError) throw new Error(`Could not promote task to focus: ${focusError.message}`);
        const { error: taskError } = await admin
          .from("equilibrium_tasks")
          .update({ do_now_at: now })
          .eq("id", taskId);
        if (taskError) throw new Error(`Could not stamp focus time on task: ${taskError.message}`);
      }
      result = { target: "equilibrium_focus", task_id: taskId, position, promoted_at: now };
      summary = `promoted task ${taskId} to focus slot ${position}`;
    } else {
      const text = cleanString(payload.text, "payload.text", 6000);
      result = await appendSynthesisState(admin, userId, text, dryRun);
      summary = "appended synthesis log";
    }

    const auditLogId = await appendAuditLog(admin, userId, {
      agentName,
      operation,
      idempotencyKey,
      dryRun,
      summary,
      result,
      payload,
    });

    return jsonResponse({
      source: "equilibrium-agent-write",
      dry_run: dryRun,
      operation,
      applied: !dryRun,
      summary,
      result,
      audit_log_id: auditLogId,
    });
  } catch (error) {
    console.error("[equilibrium-agent-write] fatal", error);
    const message = error instanceof Error ? error.message : "Unknown error.";
    const status = /not found|cap|required|must|empty|too long|Unsupported|Cannot/i.test(message) ? 400 : 500;
    return jsonResponse({ error: message }, status);
  }
});
