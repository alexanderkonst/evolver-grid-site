// send-match-headsup-email
//
// Day 67 §8.6 (Sasha 2026-05-19): the heads-up email that fires the
// moment user A clicks "I'd like to meet" on user B's card. B receives
// a warm, concrete heads-up explaining who A is, why the engine paired
// them, and what collaboration could look like — plus two magic-link
// buttons (Yes, introduce us / Not now).
//
// Invoked from: src/pages/Matchmaking.tsx → handleExpressInterest.
// Caller passes the match_interests.id; we look up the row and load
// the AI-why content. No client-side reverse-check anymore — the
// match-consent edge function handles mutual detection server-side.
//
// AUTH: caller MUST be one of the two parties (their JWT identifies
// them; we check user.id is from_user_id OR to_user_id of the row).
// In practice it's always A (from_user_id).
//
// Short-circuits (no email sent, status logged in match_interests):
//   - to_user has match_headsup_opt_out = true        → 'opted_out'
//   - to_user's email is in suppressed_emails         → 'globally_suppressed'
//   - to_user has no email on auth.users               → 'no_email'
//   - A and B already in match_intros                  → 'already_connected'
//   - headsup_sent_count > 3 for this (A, B) pair      → 'rate_limited' (logged
//                                                          as 'failed' for v1
//                                                          + diagnostic in
//                                                          email_send_log)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { signConsentToken } from "../_shared/matchConsentToken.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const FROM_ADDRESS =
  "Find Your Top Talent <aleksandr@notify.aleksandrkonstantinov.com>";

interface HeadsupPayload {
  /** match_interests.id — the row we're sending heads-up for. */
  match_interest_id: string;
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

// ───────────────────────────────────────────────────────────────────
// HTML email template — Aurora register
// ───────────────────────────────────────────────────────────────────

const renderHeadsupHtml = ({
  aFirstName,
  aArchetype,
  bFirstName,
  whyText,
  collaborationProposal,
  consentUrl,
  declineUrl,
  settingsUrl,
}: {
  aFirstName: string;
  aArchetype: string;
  bFirstName: string;
  whyText: string;
  collaborationProposal: string;
  consentUrl: string;
  declineUrl: string;
  settingsUrl: string;
}) => {
  const aName = escapeHtml(aFirstName || "Someone");
  const aArch = escapeHtml(stripGlyphs(aArchetype || ""));
  const bName = escapeHtml(bFirstName || "");
  const greeting = bName ? `Hi ${bName},` : "Hi,";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${aName} wants to meet you</title>
</head>
<body style="margin:0; padding:0; background:#f5f1e8; font-family: 'Source Serif 4', Georgia, serif;">
  <div style="max-width:600px; margin:0 auto; padding:40px 24px;">
    <div style="background:rgba(255, 252, 245, 0.95); border:0.5px solid rgba(212, 175, 55, 0.55); border-radius:16px; padding:36px 28px; box-shadow: 0 12px 32px -16px rgba(10, 22, 40, 0.18), 0 0 22px -8px rgba(212, 175, 55, 0.30);">

      <!-- Eyebrow -->
      <p style="margin:0 0 14px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #5d4307;">
        ✦ A moment of mutual interest
      </p>

      <!-- Headline -->
      <h1 style="margin:0 0 18px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 28px; line-height: 1.2; color: #0b2a5a; letter-spacing: -0.005em;">
        ${aName} wants to meet you.
      </h1>

      <!-- Greeting -->
      <p style="margin:0 0 16px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 600; font-size: 15.5px; line-height: 1.6; color: #0b2a5a;">
        ${greeting}
      </p>

      <!-- Intro -->
      <p style="margin:0 0 22px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-size: 15px; line-height: 1.65; color: rgba(11, 42, 90, 0.92);">
        ${aName} just saw your profile on Find Your Top Talent and expressed interest in connecting with you. Here's what we saw between you both:
      </p>

      <!-- Identity card -->
      ${aArch ? `
      <div style="background:rgba(212, 175, 55, 0.06); border:0.5px solid rgba(212, 175, 55, 0.30); border-radius:12px; padding:16px 18px; margin: 0 0 22px 0;">
        <p style="margin:0 0 4px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 700; font-size: 17px; color: #0b2a5a;">
          ${aName}
        </p>
        <p style="margin:0; font-family: 'Source Serif 4', Georgia, serif; font-style: italic; font-weight: 600; font-size: 13.5px; color: #5d4307;">
          ${aArch}
        </p>
      </div>` : ""}

      <!-- AI-generated why-text -->
      <p style="margin:0 0 8px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #5d4307;">
        Why the engine paired you
      </p>
      <p style="margin:0 0 22px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-size: 15px; line-height: 1.65; color: #0b2a5a;">
        ${escapeHtml(whyText)}
      </p>

      ${collaborationProposal ? `
      <!-- Collaboration shape -->
      <p style="margin:0 0 8px 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #5d4307;">
        What collaboration could look like
      </p>
      <p style="margin:0 0 28px 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-size: 15px; line-height: 1.65; color: #0b2a5a;">
        ${escapeHtml(collaborationProposal)}
      </p>` : ""}

      <!-- CTAs -->
      <table role="presentation" style="margin: 0 auto; border-collapse: separate; border-spacing: 12px 0;">
        <tr>
          <td>
            <a href="${escapeHtml(consentUrl)}"
               style="display:inline-block; background: linear-gradient(135deg, #b8860b, #7a5108); color:#fffdf6; padding:14px 22px; border-radius:999px; font-family:'DM Sans', system-ui, sans-serif; font-size:13px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; text-decoration:none; box-shadow: 0 6px 18px -6px rgba(122, 81, 8, 0.5);">
              Yes, introduce us
            </a>
          </td>
          <td>
            <a href="${escapeHtml(declineUrl)}"
               style="display:inline-block; background: transparent; color:#0b2a5a; padding:14px 22px; border-radius:999px; border:1px solid rgba(11, 42, 90, 0.30); font-family:'DM Sans', system-ui, sans-serif; font-size:13px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; text-decoration:none;">
              Not now
            </a>
          </td>
        </tr>
      </table>

      <!-- Soft promise -->
      <p style="margin:32px 0 0 0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-style: italic; font-size: 13.5px; line-height: 1.55; color: rgba(11, 42, 90, 0.62); text-align:center;">
        We won't pester you. If you don't respond, nothing happens.
      </p>

      <hr style="margin: 28px 0; border:0; border-top:0.5px solid rgba(212, 175, 55, 0.30);" />

      <!-- Signoff -->
      <p style="margin:0; font-family: 'Source Serif 4', Georgia, serif; font-weight: 500; font-style: italic; font-size: 13px; line-height: 1.55; color: rgba(11, 42, 90, 0.70);">
        — Find Your Top Talent
      </p>

    </div>

    <!-- Footer -->
    <p style="text-align:center; margin: 24px 0 0 0; font-family: 'DM Sans', system-ui, sans-serif; font-size: 11px; color: rgba(11, 42, 90, 0.50); line-height: 1.6;">
      Don't want these heads-ups? <a href="${escapeHtml(settingsUrl)}" style="color: rgba(184, 134, 11, 0.85); text-decoration: none;">Manage notifications</a>
    </p>

  </div>
</body>
</html>`;
};

const renderHeadsupPlainText = ({
  aFirstName,
  aArchetype,
  bFirstName,
  whyText,
  collaborationProposal,
  consentUrl,
  declineUrl,
  settingsUrl,
}: {
  aFirstName: string;
  aArchetype: string;
  bFirstName: string;
  whyText: string;
  collaborationProposal: string;
  consentUrl: string;
  declineUrl: string;
  settingsUrl: string;
}) => {
  const aName = aFirstName || "Someone";
  const aArch = stripGlyphs(aArchetype || "");
  const greeting = bFirstName ? `Hi ${bFirstName},` : "Hi,";

  return `${aName} wants to meet you.

${greeting}

${aName} just saw your profile on Find Your Top Talent and expressed interest in connecting with you. Here's what we saw between you both:

${aName}${aArch ? ` — ${aArch}` : ""}

WHY THE ENGINE PAIRED YOU
${whyText}

${collaborationProposal ? `WHAT COLLABORATION COULD LOOK LIKE\n${collaborationProposal}\n\n` : ""}─────────────────────────

YES, INTRODUCE US:
${consentUrl}

NOT NOW:
${declineUrl}

─────────────────────────

We won't pester you. If you don't respond, nothing happens.

— Find Your Top Talent

Don't want these heads-ups? ${settingsUrl}
`;
};

// ───────────────────────────────────────────────────────────────────
// Edge function entry
// ───────────────────────────────────────────────────────────────────

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
    const MATCH_CONSENT_SECRET = Deno.env.get("MATCH_CONSENT_SECRET")!;
    const SITE_URL =
      Deno.env.get("SITE_URL") ?? "https://findyourtoptalent.com";

    if (!RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY not configured" }, 500);
    }
    if (!MATCH_CONSENT_SECRET) {
      return json({ error: "MATCH_CONSENT_SECRET not configured" }, 500);
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
    let body: HeadsupPayload;
    try {
      body = (await req.json()) as HeadsupPayload;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }
    if (!body.match_interest_id) {
      return json({ error: "'match_interest_id' is required" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Load match_interests row ───────────────────────────────
    const { data: miRow, error: miErr } = await admin
      .from("match_interests")
      .select(
        "id, from_user_id, to_user_id, ai_why_text, compound_type, headsup_sent_count",
      )
      .eq("id", body.match_interest_id)
      .maybeSingle();

    if (miErr || !miRow) {
      return json({ error: "match_interests row not found" }, 404);
    }

    // Caller must be the from_user (or admin via service role, but
    // service role bypasses auth header check above)
    if (caller.id !== miRow.from_user_id) {
      return json({ error: "Caller is not the from_user" }, 403);
    }

    const fromUserId = miRow.from_user_id;
    const toUserId = miRow.to_user_id;
    const aiWhyText = miRow.ai_why_text || "The engine paired you based on a high resonance match.";

    // Rate limit: max 3 lifetime heads-ups per (A, B) pair
    if ((miRow.headsup_sent_count ?? 0) >= 3) {
      await admin
        .from("match_interests")
        .update({ headsup_email_status: "failed" } as never)
        .eq("id", miRow.id);
      await admin.from("email_send_log").insert({
        template_name: "match_headsup",
        recipient_email: "(rate-limited)",
        status: "suppressed",
        error_message: "headsup_sent_count >= 3 for this pair",
        metadata: { match_interest_id: miRow.id, from_user_id: fromUserId, to_user_id: toUserId },
      });
      return json({ ok: false, status: "rate_limited" });
    }

    // ── Already-connected short-circuit ────────────────────────
    const userA = fromUserId < toUserId ? fromUserId : toUserId;
    const userB = fromUserId < toUserId ? toUserId : fromUserId;
    const { data: existingIntro } = await admin
      .from("match_intros")
      .select("id")
      .eq("user_a_id", userA)
      .eq("user_b_id", userB)
      .maybeSingle();
    if (existingIntro) {
      await admin
        .from("match_interests")
        .update({ headsup_email_status: "already_connected" } as never)
        .eq("id", miRow.id);
      return json({ ok: true, status: "already_connected", skipped: true });
    }

    // ── Load to_user email + opt-out preference ────────────────
    const { data: toAuth, error: toAuthErr } =
      await admin.auth.admin.getUserById(toUserId);
    if (toAuthErr || !toAuth?.user?.email) {
      await admin
        .from("match_interests")
        .update({ headsup_email_status: "no_email" } as never)
        .eq("id", miRow.id);
      return json({ ok: true, status: "no_email", skipped: true });
    }
    const toEmail = toAuth.user.email;

    // Opt-out check
    const { data: toProfile } = await admin
      .from("game_profiles")
      .select("first_name, match_headsup_opt_out")
      .eq("user_id", toUserId)
      .maybeSingle();
    if (
      toProfile &&
      (toProfile as { match_headsup_opt_out?: boolean }).match_headsup_opt_out
    ) {
      await admin
        .from("match_interests")
        .update({ headsup_email_status: "opted_out" } as never)
        .eq("id", miRow.id);
      return json({ ok: true, status: "opted_out", skipped: true });
    }

    // Globally suppressed?
    const { data: suppressed } = await admin
      .from("suppressed_emails")
      .select("email")
      .eq("email", toEmail)
      .maybeSingle();
    if (suppressed) {
      await admin
        .from("match_interests")
        .update({ headsup_email_status: "globally_suppressed" } as never)
        .eq("id", miRow.id);
      return json({
        ok: true,
        status: "globally_suppressed",
        skipped: true,
      });
    }

    // ── Load from_user identity + archetype for the email body ──
    const { data: fromProfile } = await admin
      .from("game_profiles")
      .select("first_name, last_zog_snapshot_id")
      .eq("user_id", fromUserId)
      .maybeSingle();
    const fromFirstName =
      (fromProfile as { first_name?: string | null })?.first_name?.trim() ||
      "Someone";

    let fromArchetype = "";
    const fromSnapshotId =
      (fromProfile as { last_zog_snapshot_id?: string | null })
        ?.last_zog_snapshot_id;
    if (fromSnapshotId) {
      const { data: fromSnap } = await admin
        .from("zog_snapshots")
        .select("archetype_title, appleseed_data")
        .eq("id", fromSnapshotId)
        .maybeSingle();
      const appleseed = (fromSnap?.appleseed_data ?? null) as null | {
        vibrationalKey?: { name?: string | null };
      };
      fromArchetype =
        fromSnap?.archetype_title?.trim() ||
        appleseed?.vibrationalKey?.name?.trim() ||
        "";
    }

    const toFirstName =
      (toProfile as { first_name?: string | null })?.first_name?.trim() || "";

    // ── Split AI-why text into "why" + "what collaboration looks like" ──
    // The match_interests.ai_why_text was built in handleExpressInterest
    // as concat(collaborationProposal + " " + alignment + " " + complementarity).
    // For the email we surface it as ONE block under "why we paired you,"
    // since splitting it cleanly without source-of-truth fields is fragile.
    // collaborationProposal stays empty for v1 (folded into whyText).
    const whyTextForEmail = aiWhyText;
    const collaborationProposal = "";

    // ── Sign the two consent tokens ────────────────────────────
    const consentToken = await signConsentToken(
      miRow.id,
      "consent",
      MATCH_CONSENT_SECRET,
    );
    const declineToken = await signConsentToken(
      miRow.id,
      "decline",
      MATCH_CONSENT_SECRET,
    );

    // ── Build URLs ─────────────────────────────────────────────
    // Edge function URL: ${SUPABASE_URL}/functions/v1/match-consent?token=...
    const consentUrl = `${SUPABASE_URL}/functions/v1/match-consent?token=${encodeURIComponent(consentToken)}`;
    const declineUrl = `${SUPABASE_URL}/functions/v1/match-consent?token=${encodeURIComponent(declineToken)}`;
    const settingsUrl = `${SITE_URL}/game/settings`;

    // ── Render + send ──────────────────────────────────────────
    const html = renderHeadsupHtml({
      aFirstName: fromFirstName,
      aArchetype: fromArchetype,
      bFirstName: toFirstName,
      whyText: whyTextForEmail,
      collaborationProposal,
      consentUrl,
      declineUrl,
      settingsUrl,
    });
    const text = renderHeadsupPlainText({
      aFirstName: fromFirstName,
      aArchetype: fromArchetype,
      bFirstName: toFirstName,
      whyText: whyTextForEmail,
      collaborationProposal,
      consentUrl,
      declineUrl,
      settingsUrl,
    });

    const subject = `${fromFirstName} wants to meet you — here's what we saw`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [toEmail],
        subject,
        html,
        text,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error", resendRes.status, errText);
      await admin
        .from("match_interests")
        .update({ headsup_email_status: "failed" } as never)
        .eq("id", miRow.id);
      await admin.from("email_send_log").insert({
        template_name: "match_headsup",
        recipient_email: toEmail,
        status: "failed",
        error_message: `Resend ${resendRes.status}: ${errText.slice(0, 200)}`,
        metadata: {
          match_interest_id: miRow.id,
          from_user_id: fromUserId,
          to_user_id: toUserId,
        },
      });
      return json({ error: "Email send failed" }, 502);
    }

    // ── On success: update row + log ───────────────────────────
    const now = new Date().toISOString();
    await admin
      .from("match_interests")
      .update({
        headsup_email_sent_at: now,
        headsup_email_status: "sent",
        headsup_sent_count: (miRow.headsup_sent_count ?? 0) + 1,
        consent_response: "pending",
      } as never)
      .eq("id", miRow.id);

    await admin.from("email_send_log").insert({
      template_name: "match_headsup",
      recipient_email: toEmail,
      status: "sent",
      metadata: {
        match_interest_id: miRow.id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
      },
    });

    return json({ ok: true, status: "sent" });
  } catch (err) {
    console.error("send-match-headsup-email error", err);
    return json(
      {
        error: err instanceof Error ? err.message : "Internal server error",
      },
      500,
    );
  }
});
