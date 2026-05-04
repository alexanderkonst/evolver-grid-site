// save-anonymous-zog
//
// Public (no-auth) endpoint. Stashes an anonymous Zone-of-Genius result under
// an email address, rate-limits the caller, and fires a magic link so the
// user can sign in and claim the result. Row lives in
// public.anonymous_genius_results until claim-anonymous-zog attaches it to a
// real user on first sign-in.

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

// 3 saves per lowercased email per 10-minute window.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

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
    const body = (await req.json()) as SaveAnonymousZogPayload;
    const email = (body.email ?? "").trim().toLowerCase();
    const payload = body.result_payload;
    const assessmentVersion = body.assessment_version ?? "v1";

    if (!email || !email.includes("@")) {
      return json(400, { error: "invalid_email" });
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return json(400, { error: "invalid_result_payload" });
    }
    if (Object.keys(payload).length === 0) {
      return json(400, { error: "empty_result_payload" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("save-anonymous-zog: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── Rate limit ──────────────────────────────────────────────────
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count: recentHits, error: rateReadError } = await admin
      .from("anonymous_genius_rate_limits")
      .select("email_lower", { count: "exact", head: true })
      .eq("email_lower", email)
      .gte("window_start", windowStart);

    if (rateReadError) {
      console.error("save-anonymous-zog: rate-limit read failed", rateReadError);
      // Fail-open on rate limiter errors — better to accept a real save than
      // lock out a legitimate user because the counter table is down.
    } else if ((recentHits ?? 0) >= RATE_LIMIT_MAX) {
      return json(429, { error: "rate_limited", retry_after_seconds: 600 });
    }

    // Register this hit (best-effort; ignore insert errors).
    await admin.from("anonymous_genius_rate_limits").insert({
      email_lower: email,
      window_start: new Date().toISOString(),
    });

    // ── Upsert the anonymous result ─────────────────────────────────
    const { data: existing, error: lookupError } = await admin
      .from("anonymous_genius_results")
      .select("id")
      .ilike("email", email)
      .is("claimed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      console.error("save-anonymous-zog: lookup failed", lookupError);
      return json(500, { error: "lookup_failed", detail: lookupError.message });
    }

    let resultId: string;
    if (existing) {
      const { error: updateError } = await admin
        .from("anonymous_genius_results")
        .update({
          result_payload: payload,
          assessment_version: assessmentVersion,
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("save-anonymous-zog: update failed", updateError);
        return json(500, { error: "update_failed", detail: updateError.message });
      }
      resultId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await admin
        .from("anonymous_genius_results")
        .insert({
          email,
          result_payload: payload,
          assessment_version: assessmentVersion,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("save-anonymous-zog: insert failed", insertError);
        return json(500, {
          error: "insert_failed",
          detail: insertError?.message ?? "no row returned",
        });
      }
      resultId = inserted.id;
    }

    // ── Fire a magic link so the user can come back and claim ───────
    // Belt-and-braces: Auth.tsx already calls signInWithOtp on the client
    // when the user entered their email on /auth?claim=true, but that
    // happens BEFORE the result exists. This second link fires AFTER the
    // payload is safely in the DB — whichever link they click first works.
    //
    // Day 61 (Sasha 2026-05-04 15:15): redirect target shifted from
    // `/playbook/discover` (a platform page that leaked free users
    // into `/game/me/*` territory) to `/zone-of-genius` — the canonical
    // reveal page. After auth + `claim-anonymous-zog` runs, the user
    // lands here. `ZoneOfGeniusEntry`'s authed-user mode (Wave 2)
    // detects them, fetches their just-promoted `zog_snapshots` row
    // via `game_profile`, and renders the SAME reveal artifact they
    // would have seen had they stayed in the original tab.
    // Funnel monogamy intact — every entry point lands on the reveal.
    const siteUrl = Deno.env.get("SITE_URL") ??
      Deno.env.get("PUBLIC_SITE_URL") ?? "";
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent("/zone-of-genius")}`;

    try {
      const { error: linkError } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });
      if (linkError) {
        // Don't fail the save if the mailer hiccups. Client-side
        // signInWithOtp already issued a link; the user has options.
        console.warn("save-anonymous-zog: generateLink failed", linkError);
      }
    } catch (linkThrown) {
      console.warn("save-anonymous-zog: generateLink threw", linkThrown);
    }

    return json(200, { ok: true, result_id: resultId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("save-anonymous-zog: unexpected error", message);
    return json(500, { error: "internal_error", detail: message });
  }
});
