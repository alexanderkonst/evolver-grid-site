// save-quiz-email
//
// Public (no-auth) endpoint. Logs one "send me the map" email capture from
// the Transition Quiz (settled + itch/tremors not-yet screens) into its own
// dedicated table (quiz_email_signups), separate from transition_quiz_results.
// Fire-and-forget from the client: the quiz UI already shows success
// optimistically, this call never gates or delays what the user sees.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FROM_NOTIFICATIONS } from "../_shared/senders.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SaveQuizEmailPayload {
  email?: string | null;
  stage?: number | null;
  locale?: string | null;
  source?: string | null;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  try {
    const body = (await req.json()) as SaveQuizEmailPayload;

    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    if (!email || !email.includes("@")) {
      return json(400, { error: "invalid_email" });
    }

    if (
      body.stage !== undefined &&
      body.stage !== null &&
      (!Number.isInteger(body.stage) || body.stage < 1 || body.stage > 7)
    ) {
      return json(400, { error: "invalid_stage" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("save-quiz-email: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await admin
      .from("quiz_email_signups")
      .insert({
        email,
        stage: body.stage ?? null,
        locale: body.locale ?? null,
        source: body.source ?? "transition_quiz",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("save-quiz-email: insert failed", error);
      return json(500, { error: "insert_failed", detail: error?.message ?? "no row returned" });
    }

    return json(200, { ok: true, id: data.id });
  } catch (err) {
    console.error("save-quiz-email: unexpected error", err);
    return json(500, { error: "unexpected_error" });
  }
});
