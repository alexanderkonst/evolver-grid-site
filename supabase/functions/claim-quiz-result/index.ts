// claim-quiz-result — 2026-07-30 (JOURNEY Step 0 batch).
//
// Lets a logged-in viewer of a quiz permalink (/quiz/r/:id) attach that
// saved read to their own account, so it shows up under JOURNEY Step 0.
// Unlike save-quiz-result, this endpoint IS auth-gated (verify_jwt = true
// in config.toml) — the caller's own JWT is the identity source, never a
// client-supplied id. Only claims a row that is currently unowned
// (user_id is null); never overwrites an existing link.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      console.error("claim-quiz-result: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    // Identify the caller from their own JWT (verify_jwt = true means Kong
    // already validated it before this code ran — this just reads the uid).
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json(401, { error: "unauthorized" });

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser();
    if (userError || !user) return json(401, { error: "unauthorized" });

    const body = (await req.json().catch(() => ({}))) as { id?: string };
    if (!body.id || !UUID_RE.test(body.id)) {
      return json(400, { error: "invalid_id" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Only claim if currently unowned — never steals a row already linked
    // to a different account.
    const { data, error } = await admin
      .from("transition_quiz_results")
      .update({ user_id: user.id, claimed_at: new Date().toISOString() })
      .eq("id", body.id)
      .is("user_id", null)
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("claim-quiz-result: update failed", error);
      return json(500, { error: "update_failed", detail: error.message });
    }

    if (!data) {
      // Idempotency matters across double-clicks, auth-return retries, and
      // two open tabs. A repeat by the same owner is success; another
      // account can never take it.
      const { data: existing, error: readError } = await admin
        .from("transition_quiz_results")
        .select("user_id")
        .eq("id", body.id)
        .maybeSingle();

      if (readError) {
        console.error("claim-quiz-result: ownership read failed", readError);
        return json(500, { error: "ownership_read_failed" });
      }
      if (!existing) return json(404, { error: "not_found" });
      if (existing.user_id === user.id) {
        return json(200, { ok: true, already_claimed: true });
      }
      return json(409, { error: "claimed_by_another_account" });
    }

    return json(200, { ok: true, already_claimed: false });
  } catch (err) {
    console.error("claim-quiz-result: unexpected error", err);
    return json(500, { error: "unexpected_error" });
  }
});
