// claim-anonymous-zog
// Stub — full behaviour arrives in Task 3c.
// Authenticated endpoint: takes the caller's session (magic-link just verified),
// finds the anonymous_genius_results row matching the user's email, promotes
// it into a zog_snapshot tied to the user's game_profile, and marks the
// anonymous row as claimed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    const authHeader = req.headers.get("authorization") ?? "";
    const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "unauthenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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

    // Verify the caller via their access token before doing anything else.
    const userClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    const { data: userResult, error: userError } = await userClient.auth.getUser(
      accessToken,
    );

    if (userError || !userResult?.user) {
      return new Response(
        JSON.stringify({ error: "unauthenticated", detail: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // STUB — Task 3c will do the actual lookup, insert, and mark-claimed.
    return new Response(
      JSON.stringify({
        claimed: false,
        stub: true,
        user_id: userResult.user.id,
        email: userResult.user.email,
        message:
          "claim-anonymous-zog stub — full implementation lands in Task 3c.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("claim-anonymous-zog stub error:", message);
    return new Response(
      JSON.stringify({ error: "internal_error", detail: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
