import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  cleanParkedKind,
  parkItem,
  parkStrategy,
  readParked,
  unparkStrategy,
} from "./parked.ts";
import {
  addSubtask,
  cleanItemRef,
  cleanOwner,
  complete,
  convertTaskToSubtask,
  deleteSubtask,
  demote,
  moveTask,
  parseAddSubtask,
  parseSubtaskPatch,
  promoteDoNow,
  readSubtasks,
  shapeTaskFlowState,
  updateSubtask,
} from "./taskflow.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_BODY_BYTES = 25_000;
const MAX_WORKSTREAMS = 3;
const MAX_TASKS = 3;

type Operation =
  | "read_state"
  | "set_lifelong_dedication"
  | "set_role"
  | "set_moon_focus"
  | "upsert_strategy"
  | "create_workstream"
  | "rename_workstream"
  | "delete_workstream"
  | "create_task"
  | "rename_task"
  | "complete_task"
  | "delete_task"
  | "promote_task_to_focus"
  | "append_synthesis_log"
  | "park_strategy"
  | "park_item"
  | "unpark_strategy"
  | "add_subtask"
  | "update_subtask"
  | "promote_do_now"
  | "demote"
  | "complete"
  | "move_task"
  | "convert_task_to_subtask"
  | "delete_subtask";

interface AgentWriteRequest {
  operation?: Operation;
  agent_name?: string;
  idempotency_key?: string;
  dry_run?: boolean;
  payload?: Record<string, unknown>;
}

type SupabaseAdmin = any;

const allowedOperations = new Set<Operation>([
  "read_state",
  "set_lifelong_dedication",
  "set_role",
  "set_moon_focus",
  "upsert_strategy",
  "create_workstream",
  "rename_workstream",
  "delete_workstream",
  "create_task",
  "rename_task",
  "complete_task",
  "delete_task",
  "promote_task_to_focus",
  "append_synthesis_log",
  "park_strategy",
  "park_item",
  "unpark_strategy",
  "add_subtask",
  "update_subtask",
  "promote_do_now",
  "demote",
  "complete",
  "move_task",
  "convert_task_to_subtask",
  "delete_subtask",
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
  if (rows.length >= MAX_WORKSTREAMS) throw new Error(`Cannot create workstream: active workstream cap is ${MAX_WORKSTREAMS}. Make room by moving its tasks with move_task or convert_task_to_subtask, then delete the emptied workstream.`);

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

// ─── LUNAR PHASE (server-side) ─────────────────────────────────────
//
// Faithful inline port of `getLunarState` from
// src/lib/equilibrium-cycles/index.ts. The frontend module is pure math
// but lives outside this Deno function's bundle, so the needed pieces are
// reproduced here (Meeus AA ch. 47 main terms → true lunar elongation).
// Phase = 45° of elongation; the 8 activity names + jobs mirror the app's
// locked lunar wisdom map. Keep in sync with the frontend if that changes.

const DAY_MS = 86_400_000;
const RAD = Math.PI / 180;
const J2000_JD = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;
const SYNODIC_MONTH_DAYS = 29.530588853;
const PHASE_DEG = 45;

// Index = floor(elongation / 45°). name/job mirror MOON_PHASES[].energy
// lead word + guidance in the frontend module.
const LUNAR_PHASES: { name: string; job: string }[] = [
  { name: "Clearing", job: "Release fear. Cry, don't complain. The how is not yours yet." },
  { name: "Gathering", job: "Say yes. Take meetings. Receive resources." },
  { name: "Seeing", job: "The how reveals. Write it down. Capture before it drifts." },
  { name: "Leading", job: "Prep for harvest. Set up infrastructure. Get the help." },
  { name: "Harvesting", job: "Reap what's ripe. Cut. Receive the fruits of labor." },
  { name: "Celebrating", job: "Announce the harvest. Thank. Feel the gratitude." },
  { name: "Planning", job: "The next intention surfaces. Receive it. Name it." },
  { name: "Planting", job: "The 1–3 strategies reveal. Write them down." },
];

function deg360(x: number) {
  return ((x % 360) + 360) % 360;
}

function deltaTSeconds(yearApprox: number) {
  const y = yearApprox - 2005;
  return 62.92 + 0.32217 * y + 0.005589 * y * y;
}

function julianCenturiesTT(nowMs: number) {
  const jdUTC = nowMs / DAY_MS + UNIX_EPOCH_JD;
  const yearApprox = (jdUTC - J2000_JD) / 365.25 + 2000;
  const ttJd = jdUTC + deltaTSeconds(yearApprox) / 86400;
  return (ttJd - J2000_JD) / 36525;
}

function lunarElongationDeg(nowMs: number) {
  const T = julianCenturiesTT(nowMs);
  const D = deg360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + (T * T * T) / 545868 - (T * T * T * T) / 113065000);
  const M = deg360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + (T * T * T) / 24490000);
  const Mp = deg360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + (T * T * T) / 69699 - (T * T * T * T) / 14712000);
  const F = deg360(93.272095 + 483202.0175233 * T - 0.0036539 * T * T - (T * T * T) / 3526000 + (T * T * T * T) / 863310000);
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const D_ = D * RAD, M_ = M * RAD, Mp_ = Mp * RAD, F_ = F * RAD;

  let dL = 0;
  dL += 6.288774 * Math.sin(Mp_);
  dL += 1.274027 * Math.sin(2 * D_ - Mp_);
  dL += 0.658314 * Math.sin(2 * D_);
  dL += 0.213618 * Math.sin(2 * Mp_);
  dL -= 0.185116 * Math.sin(M_) * E;
  dL -= 0.114332 * Math.sin(2 * F_);
  dL += 0.058793 * Math.sin(2 * D_ - 2 * Mp_);
  dL += 0.057066 * Math.sin(2 * D_ - M_ - Mp_) * E;
  dL += 0.053322 * Math.sin(2 * D_ + Mp_);
  dL += 0.045758 * Math.sin(2 * D_ - M_) * E;
  dL -= 0.040923 * Math.sin(M_ - Mp_) * E;
  dL -= 0.034720 * Math.sin(D_);
  dL -= 0.030383 * Math.sin(M_ + Mp_) * E;
  dL += 0.015327 * Math.sin(2 * D_ - 2 * F_);
  dL -= 0.012528 * Math.sin(Mp_ + 2 * F_);

  const sunEoC =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M_) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M_) +
    0.000289 * Math.sin(3 * M_);

  return deg360(D + dL - sunEoC);
}

function daysUntilElongationReaches(nowMs: number, currentDeg: number, targetDeg: number) {
  const later = lunarElongationDeg(nowMs + DAY_MS);
  let ratePerDay = later - currentDeg;
  if (ratePerDay < -180) ratePerDay += 360;
  if (ratePerDay <= 0) ratePerDay = 360 / SYNODIC_MONTH_DAYS;
  let deltaDeg = targetDeg - currentDeg;
  while (deltaDeg <= 0) deltaDeg += 360;
  return deltaDeg / ratePerDay;
}

function computeLunar(nowMs: number) {
  const elongationDeg = lunarElongationDeg(nowMs);
  const segmentIndex = Math.min(7, Math.floor(elongationDeg / PHASE_DEG));
  const phase = LUNAR_PHASES[segmentIndex];
  const nextBoundaryWrapped = ((segmentIndex + 1) * PHASE_DEG) % 360;
  const daysLeft = daysUntilElongationReaches(nowMs, elongationDeg, nextBoundaryWrapped);
  const phaseEndMs = nowMs + daysLeft * DAY_MS;
  return {
    phase: phase.name,
    job: phase.job,
    segment_index: segmentIndex,
    phase_end: new Date(phaseEndMs).toISOString(),
    days_left: Math.round(daysLeft * 10) / 10,
  };
}

// ─── PHASE-AWARE READINESS (server mirror of src/modules/equilibrium/
// phasePlan.ts — issue #63). Keep in sync with that file: the semantic
// 1-8 position mapping and the per-layer due-positions must match.
//
//   layer        due at phase (position)
//   focus        Planning    (1)
//   strategies   Planting    (2)
//   workstreams  Seeing      (5)
//   tasks        Seeing      (5)
//   doNow        Harvesting  (7)
//
// A layer is due from its position onward (the cycle only restarts at
// Planning), so a filled layer always reads "filled" even if filled early.
type EqLayerKey = "focus" | "strategies" | "workstreams" | "tasks" | "doNow";
type LayerReadiness = "filled" | "due_empty" | "not_due";
const EQ_LAYER_KEYS: EqLayerKey[] = ["focus", "strategies", "workstreams", "tasks", "doNow"];
const LAYER_DUE_AT: Record<EqLayerKey, number> = {
  focus: 1,
  strategies: 2,
  workstreams: 5,
  tasks: 5,
  doNow: 7,
};

// Semantic cycle position (1-8) from the astronomical segment index
// (0-7). LUNAR_PHASES above is astronomically ordered (index 0 = Clearing
// = New Moon), so this is the same closed form as phasePlan.ts.
function semanticPositionFromLunarIndex(segmentIndex: number): number {
  const idx = ((segmentIndex % 8) + 8) % 8;
  return ((idx + 2) % 8) + 1;
}

function computePhaseReadiness(segmentIndex: number, filled: Record<EqLayerKey, boolean>) {
  const position = semanticPositionFromLunarIndex(segmentIndex);
  const layers = {} as Record<EqLayerKey, LayerReadiness>;
  for (const key of EQ_LAYER_KEYS) {
    layers[key] = filled[key]
      ? "filled"
      : position >= LAYER_DUE_AT[key]
        ? "due_empty"
        : "not_due";
  }
  return { phase: LUNAR_PHASES[segmentIndex].name, position, layers };
}

async function buildReadState(admin: SupabaseAdmin, userId: string) {
  const nowMs = Date.now();
  const [stateRes, strategiesRes, workstreamsRes, doNowRes, subtaskRows, parked] = await Promise.all([
    admin.from("equilibrium_state").select("*").eq("user_id", userId).maybeSingle(),
    admin.from("equilibrium_strategies").select("position, text, alignment_score").eq("user_id", userId).order("position", { ascending: true }),
    admin.from("equilibrium_workstreams").select("id, title, position").eq("user_id", userId).is("archived_at", null).order("position", { ascending: true }),
    admin.from("equilibrium_do_now").select("*").eq("user_id", userId).order("position", { ascending: true }),
    readSubtasks(admin, userId, nowMs),
    readParked(admin, userId),
  ]);

  if (stateRes.error) throw new Error(`Could not read state: ${stateRes.error.message}`);
  if (strategiesRes.error) throw new Error(`Could not read strategies: ${strategiesRes.error.message}`);
  if (workstreamsRes.error) throw new Error(`Could not read workstreams: ${workstreamsRes.error.message}`);
  if (doNowRes.error) throw new Error(`Could not read Do Now: ${doNowRes.error.message}`);

  const state = (stateRes.data ?? {}) as any;
  const workstreamRows = Array.isArray(workstreamsRes.data) ? workstreamsRes.data as any[] : [];

  const workstreamIds = workstreamRows.map((row) => row.id).filter(Boolean);
  let taskRows: any[] = [];
  if (workstreamIds.length) {
    const { data, error } = await admin
      .from("equilibrium_tasks")
      .select("id, workstream_id, position, text, status, owner, do_now_at, created_at")
      .in("workstream_id", workstreamIds)
      .eq("status", "active")
      .order("position", { ascending: true });
    if (error) throw new Error(`Could not read tasks: ${error.message}`);
    taskRows = Array.isArray(data) ? data as any[] : [];
  }

  // Subtasks of tasks that are no longer active (D4) still need their parent
  // so `path` resolves.
  const activeTaskIds = new Set(taskRows.map((t) => t.id));
  const missingParentIds = [...new Set(subtaskRows.map((s) => s.task_id))].filter((id) => !activeTaskIds.has(id));
  let parentTasks: any[] = [];
  if (missingParentIds.length) {
    const { data, error } = await admin
      .from("equilibrium_tasks")
      .select("id, workstream_id, text")
      .in("id", missingParentIds);
    if (error) throw new Error(`Could not read parent tasks: ${error.message}`);
    parentTasks = Array.isArray(data) ? data as any[] : [];
  }

  const taskFlow = shapeTaskFlowState({
    workstreams: workstreamRows,
    tasks: taskRows,
    parentTasks,
    subtasks: subtaskRows,
    doNow: Array.isArray(doNowRes.data) ? doNowRes.data as any[] : [],
    caps: { workstreams: MAX_WORKSTREAMS, tasksPerWorkstream: MAX_TASKS },
    nowMs,
  });
  const { workstreams, doNow } = taskFlow;

  const strategies = (Array.isArray(strategiesRes.data) ? strategiesRes.data as any[] : []).map((s) => ({
    position: s.position,
    text: s.text,
    alignment_score: s.alignment_score ?? null,
  }));

  const lunar = computeLunar(Date.now());
  const phaseReadiness = computePhaseReadiness(lunar.segment_index, {
    focus: Boolean(String(state.moon_focus_text ?? "").trim()),
    strategies: strategies.length > 0,
    workstreams: workstreams.length > 0,
    tasks: workstreams.some((w) => w.tasks.length > 0),
    doNow: taskFlow.humanDoNowFilled,
  });

  return {
    source: "equilibrium-agent-write",
    operation: "read_state",
    moon_focus: state.moon_focus_text ?? null,
    lifelong_dedication: state.mission_override_text ?? null,
    role: state.role_override_text ?? null,
    strategies,
    workstreams,
    do_now: doNow,
    caps: taskFlow.caps,
    do_now_v2: taskFlow.do_now_v2,
    waiting_on_human: taskFlow.waiting_on_human,
    subtask_counts: taskFlow.subtask_counts,
    parked,
    lunar,
    phase_readiness: phaseReadiness,
    generated_at: new Date().toISOString(),
  };
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

    // read_state is read-only: no idempotency, no audit log, ignores dry_run.
    if (operation === "read_state") {
      return jsonResponse(await buildReadState(admin, userId));
    }

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
        if (activeTasks.length >= MAX_TASKS) throw new Error(`Cannot create task: active task cap is ${MAX_TASKS} for this workstream. Make room with move_task or convert_task_to_subtask.`);
        const planned = {
          workstream_id: workstream.id,
          position: activeTasks.length,
          text: taskText,
          status: "active",
          // Only sent when given, so create_task keeps working before the
          // Task Flow migration is applied.
          ...(payload.owner === undefined ? {} : { owner: cleanOwner(payload.owner) }),
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
    } else if (operation === "complete" || operation === "complete_task") {
      // complete_task is the alias of complete with item.type = "task".
      const ref = operation === "complete_task"
        ? { type: "task" as const, id: cleanUuid(payload.task_id, "payload.task_id") }
        : cleanItemRef(payload.item);
      ({ result, summary } = await complete(admin, userId, { ref, dryRun }));
    } else if (operation === "delete_task") {
      // Hard delete — equilibrium_tasks has no archived_at column. Any
      // equilibrium_focus rows referencing this task are removed by the
      // ON DELETE CASCADE foreign key.
      const taskId = cleanUuid(payload.task_id, "payload.task_id");
      await getOwnedTask(admin, userId, taskId);
      if (!dryRun) {
        const { error } = await admin
          .from("equilibrium_tasks")
          .delete()
          .eq("id", taskId);
        if (error) throw new Error(`Could not delete task: ${error.message}`);
      }
      result = { target: "equilibrium_tasks", task_id: taskId, deleted: !dryRun };
      summary = `deleted task ${taskId}`;
    } else if (operation === "delete_workstream") {
      // Hard delete — equilibrium_workstreams has no archived_at that we
      // honor for removal here. A workstream that still has tasks is refused
      // with 409 unless payload.force === true, in which case its tasks are
      // cascaded first (deleting each task cascades its focus rows via FK).
      const workstreamId = cleanUuid(payload.workstream_id, "payload.workstream_id");
      const force = payload.force === true;
      await getOwnedWorkstream(admin, userId, workstreamId);

      const { data: taskRows, error: taskError } = await admin
        .from("equilibrium_tasks")
        .select("id")
        .eq("workstream_id", workstreamId);
      if (taskError) throw new Error(`Could not read workstream tasks: ${taskError.message}`);
      const tasks = Array.isArray(taskRows) ? taskRows as any[] : [];
      const taskCount = tasks.length;

      if (taskCount > 0 && !force) {
        return jsonResponse({
          error: `Workstream still has ${taskCount} task(s). Delete them first or pass payload.force = true to cascade.`,
          source: "equilibrium-agent-write",
          workstream_id: workstreamId,
          task_count: taskCount,
        }, 409);
      }

      if (!dryRun) {
        if (taskCount > 0) {
          const { error: tasksDeleteError } = await admin
            .from("equilibrium_tasks")
            .delete()
            .eq("workstream_id", workstreamId);
          if (tasksDeleteError) throw new Error(`Could not cascade workstream tasks: ${tasksDeleteError.message}`);
        }
        const { error: deleteError } = await admin
          .from("equilibrium_workstreams")
          .delete()
          .eq("id", workstreamId);
        if (deleteError) throw new Error(`Could not delete workstream: ${deleteError.message}`);
      }
      result = {
        target: "equilibrium_workstreams",
        workstream_id: workstreamId,
        deleted: !dryRun,
        cascaded_tasks: taskCount,
        forced: force,
      };
      summary = `deleted workstream ${workstreamId}${taskCount > 0 ? ` (cascaded ${taskCount} task(s))` : ""}`;
    } else if (operation === "promote_do_now" || operation === "promote_task_to_focus") {
      // promote_task_to_focus is the alias of promote_do_now with owner human;
      // its `position` is ignored and it writes equilibrium_do_now.
      if (operation === "promote_task_to_focus") {
        const ref = { type: "task" as const, id: cleanUuid(payload.task_id, "payload.task_id") };
        ({ result, summary } = await promoteDoNow(admin, userId, { ref, owner: "human", agentName, dryRun }));
        result = { ...result, task_id: ref.id };
      } else {
        const ref = cleanItemRef(payload.item);
        const owner = payload.owner === undefined ? undefined : cleanOwner(payload.owner);
        ({ result, summary } = await promoteDoNow(admin, userId, { ref, owner, agentName, dryRun }));
      }
    } else if (operation === "demote") {
      ({ result, summary } = await demote(admin, userId, { ref: cleanItemRef(payload.item), dryRun }));
    } else if (operation === "add_subtask") {
      ({ result, summary } = await addSubtask(admin, userId, { ...parseAddSubtask(payload), agentName, dryRun }));
    } else if (operation === "update_subtask") {
      const subtaskId = cleanUuid(payload.subtask_id, "payload.subtask_id");
      ({ result, summary } = await updateSubtask(admin, userId, { subtaskId, patch: parseSubtaskPatch(payload), dryRun }));
    } else if (operation === "delete_subtask") {
      const subtaskId = cleanUuid(payload.subtask_id, "payload.subtask_id");
      ({ result, summary } = await deleteSubtask(admin, userId, { subtaskId, dryRun }));
    } else if (operation === "move_task") {
      const taskId = cleanUuid(payload.task_id, "payload.task_id");
      const workstreamId = cleanUuid(payload.workstream_id, "payload.workstream_id");
      ({ result, summary } = await moveTask(admin, userId, { taskId, workstreamId, maxTasks: MAX_TASKS, dryRun }));
    } else if (operation === "convert_task_to_subtask") {
      const taskId = cleanUuid(payload.task_id, "payload.task_id");
      const parentTaskId = cleanUuid(payload.parent_task_id, "payload.parent_task_id");
      const owner = payload.owner === undefined ? undefined : cleanOwner(payload.owner);
      ({ result, summary } = await convertTaskToSubtask(admin, userId, { taskId, parentTaskId, owner, agentName, dryRun }));
    } else if (operation === "park_strategy") {
      const position = cleanPosition(payload.position, "payload.position", 3);
      ({ result, summary } = await parkStrategy(admin, userId, { position, agentName, dryRun }));
    } else if (operation === "park_item") {
      const kind = cleanParkedKind(payload.kind);
      const title = cleanString(payload.title, "payload.title", 180);
      const body = optionalString(payload.body, 4000);
      ({ result, summary } = await parkItem(admin, userId, { kind, title, body, agentName, dryRun }));
    } else if (operation === "unpark_strategy") {
      const parkedId = cleanUuid(payload.parked_id, "payload.parked_id");
      const position = payload.position === undefined || payload.position === null
        ? undefined
        : cleanPosition(payload.position, "payload.position", 3);
      ({ result, summary } = await unparkStrategy(admin, userId, { parkedId, position, dryRun }));
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
