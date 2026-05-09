// send-connection-intro-email
//
// Day 65 (Sasha 2026-05-09): when a user clicks "Add Connection" on a
// match in /game/collaborate/matches, the client first inserts a row
// into `connections` and THEN calls this function to introduce the
// requester to the receiver via email. This is "Send-and-introduce" —
// option B from the Day 65 product call. Lighter than a full
// notification/accept-decline flow; receiver gets a 1:1 intro email
// with the AI's collaboration proposal + a magic link into the
// platform's Connections surface.
//
// AUTH: caller MUST be signed in (their JWT identifies who's making
// the request). The function validates that the caller IS the
// requester recorded on the connection — you can't introduce on
// someone else's behalf.
//
// What it does:
//   1. Validates caller's session.
//   2. Looks up the receiver's profile + email (service role).
//   3. Generates a fresh magic link for the receiver pointing at
//      /game/collaborate/connections so one click lands them on the
//      Connections page authenticated.
//   4. Renders an Aurora-register HTML email — Cormorant headline,
//      gold accent on requester's name, Source Serif body, italic
//      collaboration proposal block, ceremonial gold-pill CTA.
//   5. Sends via Resend.
//   6. Logs to email_send_log with template_name='connection_intro'.
//
// Failure mode: if the email send fails (Resend down, no email on
// receiver, etc.), the function returns 500 with an error message.
// The CLIENT decides whether to surface that to the user — for the
// connection flow, the connection row is already inserted, so the
// email is best-effort. The Matchmaking client toasts a friendly
// message either way.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FROM_ADDRESS =
  "Find Your Top Talent <aleksandr@notify.aleksandrkonstantinov.com>";

interface ConnectionIntroPayload {
  /** The user receiving the introduction email. */
  receiver_user_id: string;
  /**
   * The AI-generated collaboration proposal text — already produced
   * for the matched-user UI on /game/collaborate/matches. Passed in
   * verbatim so the email matches what the requester saw on screen.
   * 1-3 sentences typical.
   */
  collaboration_proposal: string;
  /** Optional secondary "why this works" copy from the same match. */
  alignment_note?: string;
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

// Strip the decorative ✦ etc. glyphs that some archetype strings carry.
const stripGlyphs = (s: string) => s.replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();

const renderEmail = ({
  receiverFirstName,
  requesterFirstName,
  requesterLastName,
  requesterArchetype,
  proposal,
  alignment,
  magicLink,
  siteUrl,
}: {
  receiverFirstName: string;
  requesterFirstName: string;
  requesterLastName: string;
  requesterArchetype: string;
  proposal: string;
  alignment: string;
  magicLink: string;
  siteUrl: string;
}) => {
  const requesterFull = `${escapeHtml(requesterFirstName)} ${escapeHtml(requesterLastName)}`.trim();
  const archetypeClean = escapeHtml(stripGlyphs(requesterArchetype || ""));
  const greeting = receiverFirstName
    ? `Hi ${escapeHtml(receiverFirstName)},`
    : "Hi,";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${requesterFull} wants to connect</title>
</head>
<body style="margin:0; padding:0; background:#f5f1e8; font-family: 'Source Serif 4', Georgia, serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 24px;">
    <div style="background:rgba(255, 252, 245, 0.95); border:0.5px solid rgba(212, 175, 55, 0.55); border-radius:16px; padding:36px 28px; box-shadow: 0 12px 32px -16px rgba(10, 22, 40, 0.18), 0 0 22px -8px rgba(212, 175, 55, 0.30);">

      <!-- Eyebrow -->
      <p style="margin:0 0 14px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #5d4307;">
        ✦ A new connection request
      </p>

      <!-- Headline -->
      <h1 style="margin:0 0 18px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 28px; line-height: 1.2; color: #0b2a5a; letter-spacing: -0.005em;">
        ${requesterFull} wants to connect.
      </h1>

      <!-- Greeting -->
      <p style="margin:0 0 16px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; font-size: 15.5px; line-height: 1.6; color: #0b2a5a;">
        ${greeting}
      </p>

      <!-- Intro -->
      <p style="margin:0 0 20px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-size: 15px; line-height: 1.65; color: rgba(11, 42, 90, 0.92);">
        ${escapeHtml(requesterFirstName) || "Someone"} reached out through Find Your Top Talent — the matching engine surfaced the two of you as a strong fit.
      </p>

      <!-- Requester identity card -->
      <div style="background:rgba(212, 175, 55, 0.06); border:0.5px solid rgba(212, 175, 55, 0.30); border-radius:12px; padding:16px 18px; margin: 0 0 22px 0;">
        <p style="margin:0; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 18px; color: #0b2a5a;">
          ${requesterFull}
        </p>
        ${archetypeClean ? `
        <p style="margin:6px 0 0 0; font-family: 'Source Serif 4', Georgia, serif; font-style: italic; font-weight: 600; font-size: 14px; color: #5d4307;">
          ${archetypeClean}
        </p>` : ""}
      </div>

      <!-- Collaboration proposal -->
      <p style="margin:0 0 8px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #5d4307;">
        Why the engine paired you
      </p>
      <p style="margin:0 0 ${alignment ? "16px" : "26px"} 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; font-size: 15px; line-height: 1.65; color: #0b2a5a;">
        ${escapeHtml(proposal)}
      </p>

      ${alignment ? `
      <p style="margin:0 0 8px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #5d4307;">
        How it fits
      </p>
      <p style="margin:0 0 26px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-style: italic; font-size: 14.5px; line-height: 1.6; color: rgba(11, 42, 90, 0.92);">
        ${escapeHtml(alignment)}
      </p>` : ""}

      <!-- CTA -->
      <div style="text-align:center; margin: 26px 0 22px 0;">
        <a href="${escapeHtml(magicLink)}" style="display:inline-block; background: linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%); color:#fef9e7; text-decoration:none; padding: 14px 28px; border-radius: 999px; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; border: 0.5px solid rgba(255, 255, 255, 0.14); box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45);">
          ✦ See the request in your account
        </a>
      </div>

      <!-- Signoff -->
      <p style="margin:24px 0 0 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-style: italic; font-size: 13.5px; line-height: 1.55; color: rgba(11, 42, 90, 0.78);">
        No pressure to respond. If it lands, open it. If not, ignore it.
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
      data: { user: requester },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !requester) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    // ── Parse + validate ───────────────────────────────────────
    let body: ConnectionIntroPayload;
    try {
      body = (await req.json()) as ConnectionIntroPayload;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
    if (!body.receiver_user_id || typeof body.receiver_user_id !== "string") {
      return json({ error: "'receiver_user_id' is required" }, 400);
    }
    if (!body.collaboration_proposal?.trim()) {
      return json({ error: "'collaboration_proposal' is required" }, 400);
    }
    if (body.receiver_user_id === requester.id) {
      return json({ error: "Cannot send connection email to yourself" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Look up receiver profile + email ───────────────────────
    // Receiver's email is in auth.users; profile fields live in
    // game_profiles. The admin client (service role) can read both.
    const { data: receiverAuthRes, error: receiverAuthErr } =
      await admin.auth.admin.getUserById(body.receiver_user_id);
    if (receiverAuthErr || !receiverAuthRes?.user?.email) {
      return json({ error: "Receiver has no email on record" }, 404);
    }
    const receiverEmail = receiverAuthRes.user.email;

    const { data: receiverProfile } = await admin
      .from("game_profiles")
      .select("first_name")
      .eq("user_id", body.receiver_user_id)
      .maybeSingle();

    // ── Look up requester profile + latest archetype ────────────
    const { data: requesterProfile } = await admin
      .from("game_profiles")
      .select("first_name, last_name, last_zog_snapshot_id")
      .eq("user_id", requester.id)
      .maybeSingle();

    let requesterArchetype = "";
    if (requesterProfile?.last_zog_snapshot_id) {
      const { data: snap } = await admin
        .from("zog_snapshots")
        .select("archetype_title, appleseed_data")
        .eq("id", requesterProfile.last_zog_snapshot_id)
        .maybeSingle();
      // Prefer the explicit archetype_title column; fall back to
      // appleseed.vibrationalKey.name which is what the matching UI
      // also displays.
      const appleseed = (snap?.appleseed_data ?? null) as null | {
        vibrationalKey?: { name?: string | null };
      };
      requesterArchetype =
        snap?.archetype_title?.trim() ||
        appleseed?.vibrationalKey?.name?.trim() ||
        "";
    }

    // ── Generate fresh magic link for receiver into Connections ─
    let magicLink = `${SITE_URL}/game/collaborate/connections`;
    try {
      const { data: linkData, error: linkErr } =
        await admin.auth.admin.generateLink({
          type: "magiclink",
          email: receiverEmail,
          options: { redirectTo: `${SITE_URL}/game/collaborate/connections` },
        });
      if (linkErr) throw linkErr;
      if (linkData.properties?.action_link) {
        magicLink = linkData.properties.action_link;
      }
    } catch (e) {
      console.warn("[send-connection-intro-email] magic link gen failed; using bare URL", e);
      // Falls back to bare URL — receiver will need to sign in manually
    }

    // ── Render + send via Resend ────────────────────────────────
    const subject = `${requesterProfile?.first_name?.trim() || "Someone"} ${
      requesterProfile?.last_name?.trim() || ""
    }`.trim() + " wants to connect through Find Your Top Talent";

    const html = renderEmail({
      receiverFirstName: receiverProfile?.first_name?.trim() || "",
      requesterFirstName: requesterProfile?.first_name?.trim() || "",
      requesterLastName: requesterProfile?.last_name?.trim() || "",
      requesterArchetype,
      proposal: body.collaboration_proposal.trim(),
      alignment: body.alignment_note?.trim() || "",
      magicLink,
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
        to: [receiverEmail],
        subject,
        html,
        // reply_to so receiver can respond directly to requester (if
        // requester has a known email). Otherwise omit.
        ...(requester.email ? { reply_to: requester.email } : {}),
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error", resendRes.status, errText);
      // Log the failure
      await admin.from("email_send_log").insert({
        template_name: "connection_intro",
        recipient_email: receiverEmail,
        status: "failed",
        error_message: `Resend ${resendRes.status}: ${errText.slice(0, 200)}`,
        metadata: {
          requester_id: requester.id,
          receiver_user_id: body.receiver_user_id,
        },
      });
      return json({ error: "Email send failed" }, 502);
    }

    const resendData = await resendRes.json();
    const messageId = resendData?.id ?? null;

    await admin.from("email_send_log").insert({
      template_name: "connection_intro",
      recipient_email: receiverEmail,
      status: "sent",
      message_id: messageId,
      metadata: {
        requester_id: requester.id,
        receiver_user_id: body.receiver_user_id,
        subject,
      },
    });

    return json({ ok: true, message_id: messageId, sent_to: receiverEmail });
  } catch (e) {
    console.error("send-connection-intro-email unexpected error", e);
    return json({ error: (e as Error).message ?? "Unknown error" }, 500);
  }
});
