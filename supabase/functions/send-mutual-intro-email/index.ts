// send-mutual-intro-email
//
// Day 66 (Sasha 2026-05-16): the bilateral intro email that fires when
// both sides of a match have independently expressed interest. Both
// users appear in the `to:` field — no requester / receiver
// distinction; both are recipients of equal standing. The platform
// is the introducer.
//
// Triggered by the client immediately after a `match_intros` row is
// inserted (the client-side mutual-detection step in Matchmaking.tsx).
// In a v1 the client fires the email; if the client fails to fire it
// for any reason, the row in match_intros records the success of the
// match-event itself — the email is the user-facing artifact, the row
// is the engine-facing artifact.
//
// AUTH: caller MUST be one of the two parties (their JWT identifies
// them; we check user.id is user_a_id OR user_b_id).
//
// What it does:
//   1. Validates caller's session + that caller is one of the parties.
//   2. Loads both auth.users emails (service role).
//   3. Loads both first_name + archetype from game_profiles + latest
//      zog_snapshot.
//   4. Renders one HTML email (Aurora register, parchment + Cormorant
//      + Source Serif) — greets both names, includes the AI-generated
//      why-text + the connection-hook, no magic link to platform
//      since the action is now external (their inboxes + scheduling).
//   5. Sends a SINGLE Resend email with both addresses in `to:`.
//   6. Logs to email_send_log with template_name='mutual_intro'.
//
// Different from send-connection-intro-email (legacy):
//   - That one was asymmetric (one requester → one receiver).
//   - This one is symmetric (both as equal recipients).
//   - No magic link CTA — the meeting happens outside the platform.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FROM_ADDRESS =
  "Find Your Top Talent <aleksandr@notify.aleksandrkonstantinov.com>";

interface MutualIntroPayload {
  user_a_id: string;
  user_b_id: string;
  /** The AI-generated why-text describing the match shape. */
  ai_why_text: string;
  /** Optional one-line "hook" for the subject line. */
  connection_hook?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const stripGlyphs = (s: string) => s.replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();

const renderEmail = ({
  firstNameA,
  firstNameB,
  archetypeA,
  archetypeB,
  whyText,
  siteUrl,
}: {
  firstNameA: string;
  firstNameB: string;
  archetypeA: string;
  archetypeB: string;
  whyText: string;
  siteUrl: string;
}) => {
  const aName = escapeHtml(firstNameA || "");
  const bName = escapeHtml(firstNameB || "");
  const aArch = escapeHtml(stripGlyphs(archetypeA || ""));
  const bArch = escapeHtml(stripGlyphs(archetypeB || ""));

  // Build the greeting from whichever names exist. If we have both,
  // join with "and"; if one is missing, use the available name.
  let greeting = "Hi,";
  if (aName && bName) {
    greeting = `${aName} and ${bName},`;
  } else if (aName || bName) {
    greeting = `Hi ${aName || bName},`;
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've both said yes — meet each other</title>
</head>
<body style="margin:0; padding:0; background:#f5f1e8; font-family: 'Source Serif 4', Georgia, serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 24px;">
    <div style="background:rgba(255, 252, 245, 0.95); border:0.5px solid rgba(212, 175, 55, 0.55); border-radius:16px; padding:36px 28px; box-shadow: 0 12px 32px -16px rgba(10, 22, 40, 0.18), 0 0 22px -8px rgba(212, 175, 55, 0.30);">

      <!-- Eyebrow -->
      <p style="margin:0 0 14px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #5d4307;">
        ✦ Mutual interest — introduction
      </p>

      <!-- Headline -->
      <h1 style="margin:0 0 18px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 28px; line-height: 1.2; color: #0b2a5a; letter-spacing: -0.005em;">
        ${aName && bName
          ? `${aName} and ${bName}, you've both said yes.`
          : `You've both said yes.`}
      </h1>

      <!-- Greeting -->
      <p style="margin:0 0 16px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; font-size: 15.5px; line-height: 1.6; color: #0b2a5a;">
        ${greeting}
      </p>

      <!-- Intro -->
      <p style="margin:0 0 22px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-size: 15px; line-height: 1.65; color: rgba(11, 42, 90, 0.92);">
        You both saw each other on Find Your Top Talent and independently said "I'd like to meet." The platform is introducing you because the engine found a connection-shape worth your time.
      </p>

      <!-- Two-up identity cards -->
      ${(aName || aArch || bName || bArch) ? `
      <div style="background:rgba(212, 175, 55, 0.06); border:0.5px solid rgba(212, 175, 55, 0.30); border-radius:12px; padding:16px 18px; margin: 0 0 22px 0;">
        ${aName || aArch ? `
        <p style="margin:0 0 ${aArch ? "4px" : "0"} 0; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 17px; color: #0b2a5a;">
          ${aName || "User A"}
        </p>
        ${aArch ? `
        <p style="margin:0 0 ${(bName || bArch) ? "12px" : "0"} 0; font-family: 'Source Serif 4', Georgia, serif; font-style: italic; font-weight: 600; font-size: 13.5px; color: #5d4307;">
          ${aArch}
        </p>` : ""}
        ` : ""}
        ${bName || bArch ? `
        <p style="margin:0 0 ${bArch ? "4px" : "0"} 0; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 17px; color: #0b2a5a;">
          ${bName || "User B"}
        </p>
        ${bArch ? `
        <p style="margin:0; font-family: 'Source Serif 4', Georgia, serif; font-style: italic; font-weight: 600; font-size: 13.5px; color: #5d4307;">
          ${bArch}
        </p>` : ""}
        ` : ""}
      </div>` : ""}

      <!-- AI-generated why-text -->
      <p style="margin:0 0 8px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #5d4307;">
        Why the engine paired you
      </p>
      <p style="margin:0 0 26px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; font-size: 15px; line-height: 1.65; color: #0b2a5a;">
        ${escapeHtml(whyText)}
      </p>

      <!-- Closing -->
      <p style="margin:0 0 8px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #5d4307;">
        Take it from here
      </p>
      <p style="margin:0 0 24px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-style: italic; font-size: 14.5px; line-height: 1.65; color: rgba(11, 42, 90, 0.92);">
        Reply to this email to find a time. You're both already in this thread.
      </p>

      <!-- Signoff -->
      <p style="margin:0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-style: italic; font-size: 13.5px; line-height: 1.55; color: rgba(11, 42, 90, 0.78);">
        — Find Your Top Talent
      </p>

    </div>

    <!-- Footer -->
    <p style="text-align:center; margin: 24px 0 0 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; color: rgba(11, 42, 90, 0.50);">
      <a href="${escapeHtml(siteUrl)}" style="color: rgba(184, 134, 11, 0.85); text-decoration: none;">FindYourTopTalent.Com</a>
    </p>

  </div>
</body>
</html>`;
};

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
    const SITE_URL = Deno.env.get("SITE_URL") ?? "https://findyourtoptalent.com";

    if (!RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY not configured" }, 500);
    }

    // ── Caller auth ─────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing Authorization bearer token" }, 401);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user: caller },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !caller) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    // ── Parse + validate ───────────────────────────────────────
    let body: MutualIntroPayload;
    try {
      body = (await req.json()) as MutualIntroPayload;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
    if (!body.user_a_id || !body.user_b_id) {
      return json({ error: "'user_a_id' and 'user_b_id' are required" }, 400);
    }
    if (body.user_a_id === body.user_b_id) {
      return json({ error: "user_a_id and user_b_id must differ" }, 400);
    }
    if (!body.ai_why_text?.trim()) {
      return json({ error: "'ai_why_text' is required" }, 400);
    }

    // Caller must be one of the two parties.
    if (caller.id !== body.user_a_id && caller.id !== body.user_b_id) {
      return json(
        { error: "Caller is not one of the parties in this intro" },
        403,
      );
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Look up both auth emails ───────────────────────────────
    const { data: authA, error: authErrA } =
      await admin.auth.admin.getUserById(body.user_a_id);
    if (authErrA || !authA?.user?.email) {
      return json({ error: "User A has no email on record" }, 404);
    }
    const emailA = authA.user.email;

    const { data: authB, error: authErrB } =
      await admin.auth.admin.getUserById(body.user_b_id);
    if (authErrB || !authB?.user?.email) {
      return json({ error: "User B has no email on record" }, 404);
    }
    const emailB = authB.user.email;

    // ── Look up both profiles + archetypes ─────────────────────
    const loadProfileAndArchetype = async (userId: string) => {
      const { data: profile } = await admin
        .from("game_profiles")
        .select("first_name, last_zog_snapshot_id")
        .eq("user_id", userId)
        .maybeSingle();
      let archetype = "";
      if (profile?.last_zog_snapshot_id) {
        const { data: snap } = await admin
          .from("zog_snapshots")
          .select("archetype_title, appleseed_data")
          .eq("id", profile.last_zog_snapshot_id)
          .maybeSingle();
        const appleseed = (snap?.appleseed_data ?? null) as null | {
          vibrationalKey?: { name?: string | null };
        };
        archetype =
          snap?.archetype_title?.trim() ||
          appleseed?.vibrationalKey?.name?.trim() ||
          "";
      }
      return {
        firstName: profile?.first_name?.trim() || "",
        archetype,
      };
    };

    const [profileA, profileB] = await Promise.all([
      loadProfileAndArchetype(body.user_a_id),
      loadProfileAndArchetype(body.user_b_id),
    ]);

    // ── Subject line ───────────────────────────────────────────
    const hook = body.connection_hook?.trim();
    let subject: string;
    if (profileA.firstName && profileB.firstName) {
      subject = hook
        ? `${profileA.firstName} ↔ ${profileB.firstName}: ${hook}`
        : `${profileA.firstName} and ${profileB.firstName} — meet each other`;
    } else {
      subject = hook
        ? `Mutual interest: ${hook}`
        : "Mutual interest — introduction from Find Your Top Talent";
    }

    // ── Render + send ──────────────────────────────────────────
    const html = renderEmail({
      firstNameA: profileA.firstName,
      firstNameB: profileB.firstName,
      archetypeA: profileA.archetype,
      archetypeB: profileB.archetype,
      whyText: body.ai_why_text.trim(),
      siteUrl: SITE_URL,
    });

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [emailA, emailB],
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error", resendRes.status, errText);
      await admin.from("email_send_log").insert({
        template_name: "mutual_intro",
        recipient_email: `${emailA}, ${emailB}`,
        status: "failed",
        error_message: `Resend ${resendRes.status}: ${errText.slice(0, 200)}`,
        metadata: {
          user_a_id: body.user_a_id,
          user_b_id: body.user_b_id,
        },
      });
      return json({ error: "Email send failed" }, 502);
    }

    await admin.from("email_send_log").insert({
      template_name: "mutual_intro",
      recipient_email: `${emailA}, ${emailB}`,
      status: "sent",
      metadata: {
        user_a_id: body.user_a_id,
        user_b_id: body.user_b_id,
      },
    });

    return json({ ok: true });
  } catch (err) {
    console.error("send-mutual-intro-email error", err);
    return json(
      {
        error:
          err instanceof Error ? err.message : "Internal server error",
      },
      500,
    );
  }
});
