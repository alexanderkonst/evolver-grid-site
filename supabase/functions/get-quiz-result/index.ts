// get-quiz-result
//
// Public (no-auth) GET endpoint backing the Transition Quiz's ownable
// permalink (/quiz/r/:id — Quiz v2.1). Given ?id=<uuid>, returns just the
// result-relevant columns of one transition_quiz_results row: enough for
// the client to recompute and render the identical result screen via the
// engine's pure functions, given the same stage/uniqueness/emergingWorkStage
// /clarityUnlock the live quiz used.
//
// uuid unguessability is the access control here, same posture as
// save-quiz-result — no auth required, nothing sensitive is stored on
// this row beyond an optional email address, which this endpoint never
// returns.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "GET") return json(405, { error: "method_not_allowed" });

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || !UUID_RE.test(id)) {
      return json(400, { error: "invalid_id" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("get-quiz-result: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await admin
      .from("transition_quiz_results")
      .select(
        "id, stage, not_yet, uniqueness_category, emerging_work_stage, clarity_unlock, result_template, route_shown, direction_call_shown, user_id",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("get-quiz-result: query failed", error);
      return json(500, { error: "query_failed" });
    }
    if (!data) {
      return json(404, { error: "not_found" });
    }

    // 2026-07-30 (JOURNEY Step 0 batch): the permalink page needs to know
    // whether this row is already linked to an account, to decide whether
    // to show the "keep this in my profile" claim line. Return that as a
    // boolean, not the raw user_id — this endpoint is public/no-auth and
    // an auth uid shouldn't leak to anonymous viewers.
    const { user_id, ...rest } = data as typeof data & { user_id: string | null };
    return json(200, { ok: true, result: { ...rest, owned: !!user_id } });
  } catch (err) {
    console.error("get-quiz-result: unexpected error", err);
    return json(500, { error: "unexpected_error" });
  }
});
