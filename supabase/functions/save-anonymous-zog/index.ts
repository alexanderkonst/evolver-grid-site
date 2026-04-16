// save-anonymous-zog
// Stub — full behaviour arrives in Task 3b.
// Accepts { email, result_payload, assessment_version? } from an anonymous
// client, persists it to anonymous_genius_results, and fires a magic link.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SaveAnonymousZogPayload {
  email?: string;
  result_payload?: Record<string, unknown>;
  assessment_version?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "method_not_allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = (await req.json()) as SaveAnonymousZogPayload;
    const email = (body.email ?? "").trim().toLowerCase();
    const payload = body.result_payload;

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "invalid_email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return new Response(
        JSON.stringify({ error: "invalid_result_payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "server_misconfigured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // STUB — Task 3b will flesh out rate limiting, upsert, magic-link issuance.
    return new Response(
      JSON.stringify({
        ok: true,
        stub: true,
        result_id: null,
        message:
          "save-anonymous-zog stub — full implementation lands in Task 3b.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("save-anonymous-zog stub error:", message);
    return new Response(
      JSON.stringify({ error: "internal_error", detail: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
