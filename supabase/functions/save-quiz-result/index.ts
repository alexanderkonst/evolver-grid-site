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
}

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("save-quiz-result: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await admin
      .from("transition_quiz_results")
      .insert({
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
      })
      .select("id")
      .single();

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
