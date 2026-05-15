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

// Admin-only endpoint that sends a magic link to a target email using the service role.
// Only callers with the 'admin' role (per public.has_role) may invoke.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
]);

interface SendMagicLinkPayload {
  /**
   * Preferred identifier — the admin lists in /admin already carry
   * `user_id` for each founder row, so the UI passes that without
   * needing the email separately. Resolved to an email server-side
   * via `auth.admin.getUserById`.
   */
  user_id?: string;
  /** Fallback identifier when the caller only knows the email. */
  email?: string;
  /**
   * Path the user lands on after clicking the magic link.
   * Defaults to /game/me. Combined with SITE_URL to form the
   * full redirect URL passed to Supabase's generateLink.
   */
  redirect_path?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    )!;
    const SITE_URL =
      Deno.env.get("SITE_URL") ?? "https://findyourtoptalent.com";

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing Authorization bearer token" }, 401);
    }

    // Validate caller via anon client + their JWT
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    // Service-role client for admin checks + magic link generation
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleErr) {
      console.error("has_role error", roleErr);
      return json({ error: "Role check failed" }, 500);
    }
    if (!isAdmin) {
      return json({ error: "Forbidden: admin role required" }, 403);
    }

    let body: SendMagicLinkPayload;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    // ─── Resolve target email ──────────────────────────────────────
    // Day 67 (Sasha 2026-05-09): function was half-refactored — header
    // doc says "Looks up the target user by user_id (preferred) or
    // email" but the implementation only honored `body.email`. The
    // admin UI (Admin.tsx SendLinkButton + FounderDetailDrawer's
    // onSendMagicLink) sends `{ user_id, redirect_path }`, so every
    // click returned 400 "Valid 'email' is required" — which the
    // Supabase JS client surfaces as "Edge Function returned a
    // non-2xx status code." Restored full contract here.
    let email = (body.email ?? "").trim().toLowerCase();
    const userId = (body.user_id ?? "").trim();

    if (!email && userId) {
      const { data: userData, error: lookupErr } =
        await admin.auth.admin.getUserById(userId);
      if (lookupErr || !userData?.user?.email) {
        console.error("getUserById error", lookupErr, {
          user_id_hint: userId.slice(0, 8),
        });
        return json(
          { error: "Could not resolve user_id to an email" },
          404,
        );
      }
      email = userData.user.email.trim().toLowerCase();
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Valid 'email' or 'user_id' is required" }, 400);
    }

    // ─── Build redirect URL ────────────────────────────────────────
    // Client sends `redirect_path` (a path like "/game/me"). Combine
    // with SITE_URL to form the absolute redirect target Supabase
    // expects.
    const path = (body.redirect_path ?? "/game/me").trim();
    const redirectTo = path.startsWith("http")
      ? path
      : `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (error) {
      console.error("generateLink error", error);
      return json({ error: error.message }, 500);
    }

    // ─── Response shape ────────────────────────────────────────────
    // UI reads `data.sent_to` to display "Magic link sent to <email>".
    // `email` and `action_link` retained for backward compatibility /
    // debugging. Don't break either field name — both call sites
    // (SendLinkButton + FounderDetailDrawer) read `sent_to`.
    return json({
      ok: true,
      sent_to: email,
      email,
      action_link: data.properties?.action_link ?? null,
    });
  } catch (e) {
    console.error("admin-send-magic-link unexpected error", e);
    return json({ error: (e as Error).message ?? "Unknown error" }, 500);
  }
});
