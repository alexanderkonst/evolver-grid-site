// admin-send-magic-link
//
// Admin-gated endpoint. Issues a fresh Supabase magic link for a target user
// and sends it via the configured auth-email-hook (Resend → magic-link.tsx
// template). Used by /founders (FoundersIndex) so Sasha — and, in the white-
// label future, any founder running their own client cohort — can hand a
// founder their platform-entry link at the end of a paid Top Talent Business
// Session.
//
// Decision recorded in: docs/02-strategy/roadmap.md (Parked / Future →
// Decision (parked) — Platform Onboarding Pathway, 2026-04-28).
//
// Auth model:
//   - Caller MUST be authenticated as an admin (email in ADMIN_EMAILS).
//   - The Supabase JWT is verified server-side by re-calling getUser with the
//     bearer token — no trusting client-side claims.
//
// What it does:
//   1. Verifies caller is an admin.
//   2. Looks up the target user by user_id (preferred) or email.
//   3. Generates a fresh magic link via the admin API.
//      Supabase auto-fires the auth email hook, which renders the
//      magic-link.tsx template via Resend. No manual email send needed.
//   4. Returns success + the resolved target email so the UI can show
//      "Magic link sent to <email>".
//
// TTL: Supabase magic links default to ~1 hour. The end-of-session use case
// almost always sees them clicked within 10 minutes, so this is fine. A
// long-TTL invite-token backup is Phase 2 — see roadmap entry.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mirrors src/lib/isAdmin.ts. Kept inline here because edge functions can't
// import from /src; if the project later moves to a `profiles.role = 'admin'`
// column, this list and src/lib/isAdmin.ts both update.
const ADMIN_EMAILS = new Set<string>([
  "alexanderkonst@gmail.com",
  "alex@evolvergrid.com",
]);

interface SendMagicLinkPayload {
  user_id?: string;
  email?: string;
  /** Where the user lands after clicking. Defaults to /game/me. */
  redirect_path?: string;
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ?? Deno.env.get("PUBLIC_SITE_URL") ?? "";
    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error("admin-send-magic-link: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    // ── Verify caller is admin ──────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    if (!callerToken) return json(401, { error: "missing_bearer_token" });

    const callerClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${callerToken}` } },
    });
    const { data: callerUserData, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerUserData?.user) {
      return json(401, { error: "invalid_session" });
    }
    const callerEmail = (callerUserData.user.email ?? "").toLowerCase();
    if (!ADMIN_EMAILS.has(callerEmail)) {
      return json(403, { error: "not_admin" });
    }

    // ── Parse + resolve target ──────────────────────────────────────
    const body = (await req.json().catch(() => ({}))) as SendMagicLinkPayload;
    const targetUserId = body.user_id?.trim() || "";
    const targetEmailInput = body.email?.trim().toLowerCase() || "";
    const redirectPath = body.redirect_path?.trim() || "/game/me";

    if (!targetUserId && !targetEmailInput) {
      return json(400, { error: "missing_target", detail: "user_id or email required" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let resolvedEmail = targetEmailInput;
    if (targetUserId) {
      const { data: userData, error: userError } = await admin.auth.admin.getUserById(
        targetUserId,
      );
      if (userError || !userData?.user?.email) {
        console.warn("admin-send-magic-link: user lookup failed", userError);
        return json(404, { error: "user_not_found" });
      }
      resolvedEmail = userData.user.email.toLowerCase();
    }

    if (!resolvedEmail || !resolvedEmail.includes("@")) {
      return json(400, { error: "invalid_email" });
    }

    // ── Issue magic link (Supabase auto-sends via auth-email-hook) ──
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`;
    const { error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: resolvedEmail,
      options: { redirectTo },
    });
    if (linkError) {
      console.error("admin-send-magic-link: generateLink failed", linkError);
      return json(502, { error: "link_generation_failed", detail: linkError.message });
    }

    console.info(
      `admin-send-magic-link: ${callerEmail} → ${resolvedEmail} (redirect=${redirectPath})`,
    );

    return json(200, {
      ok: true,
      sent_to: resolvedEmail,
      redirect_path: redirectPath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("admin-send-magic-link: unexpected error", message);
    return json(500, { error: "internal_error", detail: message });
  }
});
