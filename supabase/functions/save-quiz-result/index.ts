// save-quiz-result
//
// Public (no-auth) endpoint. Logs one Transition Quiz completion row —
// including not-yet completions (stages 1-3) — for the Ripeness Vector
// dataset (Phase Shift Technology 123). Fire-and-forget from the client:
// the quiz result itself is computed and rendered entirely in the browser,
// this call never gates or delays what the user sees.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ASPECTS = ["identity", "economy", "fit"] as const;
type Aspect = (typeof ASPECTS)[number];

const UNIQUENESS_CATEGORIES = ["discovery", "recognition", "integration", "vehicle", "transmission", "scaling"] as const;
const EMERGING_WORK_STAGES = ["not_visible", "suspected", "felt", "named", "built", "working", "delivering"] as const;
const CLARITY_UNLOCKS = ["personal", "direction", "current_work", "emerging_business", "near_term_exchange"] as const;
const BUYING_FRAMES = ["open", "mixed", "open_no_history", "closed"] as const;

interface SaveQuizResultPayload {
  stage?: number;
  identity_score?: number | null;
  economy_score?: number | null;
  fit_score?: number | null;
  bottleneck_aspect?: Aspect | null;
  driver_aspect?: Aspect | null;
  pattern?: string | null;
  route_shown?: string | null;
  email?: string | null;
  not_yet?: boolean;
  locale?: string | null;
  aspect_derived_stage?: number | null;
  has_stage_gap?: boolean | null;
  // vNext (lean 4-question edition) fields — additive, all optional so the
  // client keeps working even before this batch's migration has run.
  uniqueness_category?: (typeof UNIQUENESS_CATEGORIES)[number] | null;
  emerging_work_stage?: (typeof EMERGING_WORK_STAGES)[number] | null;
  clarity_unlock?: (typeof CLARITY_UNLOCKS)[number] | null;
  buying_frame?: (typeof BUYING_FRAMES)[number] | null;
  direction_call_shown?: boolean | null;
  result_template?: string | null;
  // Quiz v2.1 Recognition Delta widget — a distinct update branch (see
  // below), not part of the original insert shape. When `id` +
  // `recognition_delta` are present, this call updates that row instead
  // of inserting a new one.
  id?: string | null;
  recognition_delta?: number | null;
  // Means companion question (Gate 2), asked post-result after a
  // non-"closed" Buying Frame answer. Logged on the means completion event.
  means?: (typeof MEANS_VALUES)[number] | null;
}

const MEANS_VALUES = ["yes_comfortably", "yes_if_fit", "maybe_depending", "not_now"] as const;

const isValidRecognitionDelta = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isValidScore = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 7;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  try {
    const body = (await req.json()) as SaveQuizResultPayload;

    // Update branch: id present, no stage — this updates an
    // already-inserted row (from the initial completion insert) rather
    // than inserting a new one. Started with recognition_delta only;
    // extended 2026-07-30 (data hygiene #22) to also cover buying_frame,
    // means, direction_call_shown and route_shown, so one person's
    // passage stays one row instead of fragmenting into additive inserts.
    // Only fields actually provided are validated and written.
    if (body.id !== undefined && body.stage === undefined) {
      if (!body.id || !UUID_RE.test(body.id)) {
        return json(400, { error: "invalid_id" });
      }

      const updateRow: Record<string, unknown> = {};

      if (body.recognition_delta !== undefined) {
        if (!isValidRecognitionDelta(body.recognition_delta)) {
          return json(400, { error: "invalid_recognition_delta" });
        }
        updateRow.recognition_delta = body.recognition_delta;
      }
      if (body.buying_frame !== undefined) {
        if (body.buying_frame !== null && !BUYING_FRAMES.includes(body.buying_frame)) {
          return json(400, { error: "invalid_buying_frame" });
        }
        updateRow.buying_frame = body.buying_frame;
      }
      if (body.means !== undefined) {
        if (body.means !== null && !MEANS_VALUES.includes(body.means)) {
          return json(400, { error: "invalid_means" });
        }
        updateRow.means = body.means;
      }
      if (body.direction_call_shown !== undefined) {
        updateRow.direction_call_shown = body.direction_call_shown;
      }
      if (body.route_shown !== undefined) {
        updateRow.route_shown = body.route_shown;
      }

      if (Object.keys(updateRow).length === 0) {
        return json(400, { error: "no_fields_to_update" });
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!supabaseUrl || !serviceRoleKey) {
        console.error("save-quiz-result: missing env vars");
        return json(500, { error: "server_misconfigured" });
      }
      const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { error } = await admin
        .from("transition_quiz_results")
        .update(updateRow)
        .eq("id", body.id);

      if (error) {
        console.error("save-quiz-result: update failed", error);
        return json(500, { error: "update_failed", detail: error.message });
      }
      return json(200, { ok: true });
    }

    if (!Number.isInteger(body.stage) || body.stage! < 1 || body.stage! > 7) {
      return json(400, { error: "invalid_stage" });
    }

    const notYet = Boolean(body.not_yet);

    for (const key of ["identity_score", "economy_score", "fit_score"] as const) {
      const val = body[key];
      if (val !== undefined && val !== null && !isValidScore(val)) {
        return json(400, { error: `invalid_${key}` });
      }
    }

    if (body.bottleneck_aspect && !ASPECTS.includes(body.bottleneck_aspect)) {
      return json(400, { error: "invalid_bottleneck_aspect" });
    }
    if (body.driver_aspect && !ASPECTS.includes(body.driver_aspect)) {
      return json(400, { error: "invalid_driver_aspect" });
    }

    if (
      body.aspect_derived_stage !== undefined &&
      body.aspect_derived_stage !== null &&
      !isValidScore(body.aspect_derived_stage)
    ) {
      return json(400, { error: "invalid_aspect_derived_stage" });
    }

    const email = body.email ? String(body.email).trim().toLowerCase() : null;
    if (email && !email.includes("@")) {
      return json(400, { error: "invalid_email" });
    }

    if (body.uniqueness_category && !UNIQUENESS_CATEGORIES.includes(body.uniqueness_category)) {
      return json(400, { error: "invalid_uniqueness_category" });
    }
    if (body.emerging_work_stage && !EMERGING_WORK_STAGES.includes(body.emerging_work_stage)) {
      return json(400, { error: "invalid_emerging_work_stage" });
    }
    if (body.clarity_unlock && !CLARITY_UNLOCKS.includes(body.clarity_unlock)) {
      return json(400, { error: "invalid_clarity_unlock" });
    }
    if (body.buying_frame && !BUYING_FRAMES.includes(body.buying_frame)) {
      return json(400, { error: "invalid_buying_frame" });
    }
    if (body.means && !MEANS_VALUES.includes(body.means)) {
      return json(400, { error: "invalid_means" });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("save-quiz-result: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const baseRow = {
      stage: body.stage,
      identity_score: body.identity_score ?? null,
      economy_score: body.economy_score ?? null,
      fit_score: body.fit_score ?? null,
      bottleneck_aspect: body.bottleneck_aspect ?? null,
      driver_aspect: body.driver_aspect ?? null,
      pattern: body.pattern ?? null,
      route_shown: body.route_shown ?? null,
      email,
      not_yet: notYet,
      locale: body.locale ?? null,
      aspect_derived_stage: body.aspect_derived_stage ?? null,
      has_stage_gap: body.has_stage_gap ?? null,
    };

    const vNextRow = {
      uniqueness_category: body.uniqueness_category ?? null,
      emerging_work_stage: body.emerging_work_stage ?? null,
      clarity_unlock: body.clarity_unlock ?? null,
      buying_frame: body.buying_frame ?? null,
      direction_call_shown: body.direction_call_shown ?? null,
      result_template: body.result_template ?? null,
      means: body.means ?? null,
    };

    let { data, error } = await admin
      .from("transition_quiz_results")
      .insert({ ...baseRow, ...vNextRow })
      .select("id")
      .single();

    // Graceful degradation: if the vNext migration hasn't run yet in this
    // environment, the vNext columns won't exist. Retry with just the base
    // row rather than losing the completion entirely.
    if (error && /column .* does not exist/i.test(error.message ?? "")) {
      console.warn("save-quiz-result: vNext columns missing, retrying without them", error.message);
      ({ data, error } = await admin
        .from("transition_quiz_results")
        .insert(baseRow)
        .select("id")
        .single());
    }

    if (error || !data) {
      console.error("save-quiz-result: insert failed", error);
      return json(500, { error: "insert_failed", detail: error?.message ?? "no row returned" });
    }

    return json(200, { ok: true, id: data.id });
  } catch (err) {
    console.error("save-quiz-result: unexpected error", err);
    return json(500, { error: "unexpected_error" });
  }
});
