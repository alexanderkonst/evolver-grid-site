// match-consent
//
// Day 67 §8.6 (Sasha 2026-05-19): the magic-link landing for the
// heads-up email's two buttons (Yes, introduce us / Not now).
//
// PUBLIC endpoint — no JWT required. The HMAC-signed token IS the auth.
// We verify the signature, then act on the embedded action.
//
// Request shape:
//   GET /functions/v1/match-consent?token=<base64>.<base64>
//
// Token payload: { mi: <match_interest_id>, a: "consent"|"decline", e: <ms> }
//
// On valid 'consent' token:
//   - match_interests.consent_response = 'consented', consent_responded_at = now
//   - INSERT match_intros row (canonical pair ordering)
//   - INVOKE send-mutual-intro-email
//   - Render Aurora "Done. We're sending the intro now." page
//
// On valid 'decline' token:
//   - match_interests.consent_response = 'declined', consent_responded_at = now
//   - Render Aurora "Got it. We won't follow up." page
//
// Invalid / expired / already-responded / withdrawn states each render
// their own Aurora-styled page. All HTML pages share the same wrapper.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyConsentToken } from "../_shared/matchConsentToken.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// ───────────────────────────────────────────────────────────────────
// Aurora page wrapper
// ───────────────────────────────────────────────────────────────────

const renderPage = ({
  title,
  glyph,
  headline,
  body,
}: {
  title: string;
  glyph: string;
  headline: string;
  body: string;
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — Find Your Top Talent</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@500;600;700&family=Source+Serif+4:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: #f5f1e8;
      font-family: 'Source Serif 4', Georgia, serif;
      color: #0b2a5a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .wrap {
      max-width: 560px;
      width: 100%;
      padding: 40px 24px;
    }
    .card {
      background: rgba(255, 252, 245, 0.95);
      border: 0.5px solid rgba(212, 175, 55, 0.55);
      border-radius: 18px;
      padding: 44px 32px 36px;
      text-align: center;
      box-shadow: 0 16px 40px -20px rgba(10, 22, 40, 0.20),
                  0 0 22px -8px rgba(212, 175, 55, 0.30);
    }
    .glyph {
      font-size: 22px;
      color: #b8860b;
      letter-spacing: 0.18em;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0 0 16px 0;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 700;
      font-size: 30px;
      line-height: 1.2;
      letter-spacing: -0.005em;
      color: #0b2a5a;
    }
    p {
      margin: 0 0 14px 0;
      font-weight: 500;
      font-size: 15.5px;
      line-height: 1.65;
      color: rgba(11, 42, 90, 0.88);
    }
    p.italic {
      font-style: italic;
      color: rgba(11, 42, 90, 0.62);
      font-size: 14px;
    }
    .divider {
      width: 40px;
      height: 1px;
      background: rgba(212, 175, 55, 0.45);
      margin: 26px auto 22px;
    }
    .signoff {
      font-family: 'Source Serif 4', Georgia, serif;
      font-style: italic;
      font-weight: 500;
      font-size: 13px;
      color: rgba(11, 42, 90, 0.62);
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="glyph">${escapeHtml(glyph)}</div>
      <h1>${escapeHtml(headline)}</h1>
      ${body}
      <div class="divider"></div>
      <p class="signoff">— Find Your Top Talent</p>
    </div>
  </div>
</body>
</html>`;

const htmlResponse = (status: number, html: string) =>
  new Response(html, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

// ───────────────────────────────────────────────────────────────────
// Page templates
// ───────────────────────────────────────────────────────────────────

const pageYes = (otherFirstName: string) =>
  renderPage({
    title: "Introduction sent",
    glyph: "✦",
    headline: "Done. The intro is on its way.",
    body: `
      <p>
        You'll both receive an email in the same thread within a minute.
        Take it from there — schedule a time, exchange context, whatever
        feels right. We've made the introduction.
      </p>
      <p class="italic">
        If you don't see ${escapeHtml(otherFirstName) || "their"} name in
        your inbox within the hour, reply to this email and we'll look
        into it.
      </p>
    `,
  });

const pageYesEmailDelayed = (otherFirstName: string) =>
  renderPage({
    title: "Introduction recorded",
    glyph: "✦",
    headline: "Your yes is recorded. The intro email is delayed.",
    body: `
      <p>
        We saved your consent, but the bilateral intro email didn't
        send cleanly. We'll retry within a few minutes.
      </p>
      <p>
        If you don't see ${escapeHtml(otherFirstName) || "their"} name
        in your inbox within an hour, reply to the heads-up email and
        we'll send it manually.
      </p>
    `,
  });

const pageNo = (otherFirstName: string) =>
  renderPage({
    title: "Got it",
    glyph: "✦",
    headline: "Got it. We won't follow up on this one.",
    body: `
      <p>
        ${escapeHtml(otherFirstName) || "They"} won't be re-suggested to you
        for the next 15 days. After that, if the engine re-pairs you
        naturally, you may see them again.
      </p>
      <p class="italic">
        ${escapeHtml(otherFirstName) || "They"} doesn't see that you
        declined — from their side, it just goes quiet.
      </p>
    `,
  });

const pageExpired = () =>
  renderPage({
    title: "Invitation expired",
    glyph: "✦",
    headline: "This invitation expired.",
    body: `
      <p>
        It's been more than 30 days since this invitation was sent.
        If they're still interested in meeting you, they may reach
        out again.
      </p>
    `,
  });

const pageAlreadyResponded = () =>
  renderPage({
    title: "Already responded",
    glyph: "✦",
    headline: "You've already responded to this one.",
    body: `
      <p>
        Thanks. Whatever you decided is already in motion.
      </p>
    `,
  });

const pageWithdrawn = (aFirstName: string) =>
  renderPage({
    title: "No longer pursuing",
    glyph: "✦",
    headline: aFirstName
      ? `${aFirstName} is no longer pursuing this.`
      : "This invitation is no longer active.",
    body: `
      <p>
        The other side withdrew their interest before you responded.
        No action needed — if the engine pairs you again later, you
        may see them in your matches.
      </p>
    `,
  });

const pageInvalid = () =>
  renderPage({
    title: "Invalid link",
    glyph: "✦",
    headline: "This link isn't valid.",
    body: `
      <p>
        If you think this is a mistake, please reply to the email
        you received and we'll look into it.
      </p>
    `,
  });

// ───────────────────────────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY",
    )!;
    const MATCH_CONSENT_SECRET = Deno.env.get("MATCH_CONSENT_SECRET")!;

    if (!MATCH_CONSENT_SECRET) {
      console.error("MATCH_CONSENT_SECRET not configured");
      return htmlResponse(500, pageInvalid());
    }

    // Token from query string (GET) or body (POST)
    let token = "";
    if (req.method === "GET") {
      const url = new URL(req.url);
      token = url.searchParams.get("token") ?? "";
    } else if (req.method === "POST") {
      try {
        const body = await req.json();
        token = (body as { token?: string }).token ?? "";
      } catch {
        // ignore — token stays empty, render invalid
      }
    }

    if (!token) {
      return htmlResponse(400, pageInvalid());
    }

    // Verify HMAC + expiry
    const verify = await verifyConsentToken(token, MATCH_CONSENT_SECRET);
    if (!verify.ok) {
      if (verify.reason === "expired") {
        return htmlResponse(410, pageExpired());
      }
      return htmlResponse(400, pageInvalid());
    }
    const { mi: matchInterestId, a: action } = verify.payload!;

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Load the row
    const { data: miRow, error: miErr } = await admin
      .from("match_interests")
      .select(
        "id, from_user_id, to_user_id, ai_why_text, compound_type, match_score, consent_response",
      )
      .eq("id", matchInterestId)
      .maybeSingle();

    if (miErr || !miRow) {
      // Row was deleted (A withdrew, account deleted, etc.)
      return htmlResponse(404, pageWithdrawn(""));
    }

    // Already responded?
    if (
      miRow.consent_response === "consented" ||
      miRow.consent_response === "declined"
    ) {
      return htmlResponse(200, pageAlreadyResponded());
    }
    if (miRow.consent_response === "expired") {
      return htmlResponse(410, pageExpired());
    }

    // Look up A's first name for the page copy
    const { data: aProfile } = await admin
      .from("game_profiles")
      .select("first_name")
      .eq("user_id", miRow.from_user_id)
      .maybeSingle();
    const aFirstName =
      (aProfile as { first_name?: string | null })?.first_name?.trim() || "";

    const now = new Date().toISOString();

    if (action === "decline") {
      // Day 67 §8.6 audit fix #2: race-safe UPDATE. Without the
      // pending-clause, a Yes-then-No double-click could overwrite the
      // committed Yes state to "declined" after the intro already fired.
      const { error: declineErr, count: declineCount } = await admin
        .from("match_interests")
        .update(
          {
            consent_response: "declined",
            consent_responded_at: now,
          } as never,
          { count: "exact" },
        )
        .eq("id", miRow.id)
        .eq("consent_response", "pending");
      if (declineErr) {
        console.error("match_interests decline UPDATE failed", declineErr);
        return htmlResponse(500, pageInvalid());
      }
      if (!declineCount || declineCount === 0) {
        // Lost the race — another tab/click already set the response.
        return htmlResponse(200, pageAlreadyResponded());
      }
      return htmlResponse(200, pageNo(aFirstName));
    }

    // action === "consent"
    // Day 67 §8.6 audit fix #2: race-safe UPDATE for Yes path. The
    // `count: 'exact'` lets us detect when the row was already updated
    // by a concurrent click (consent_response is no longer 'pending').
    const { error: updateErr, count: updateCount } = await admin
      .from("match_interests")
      .update(
        {
          consent_response: "consented",
          consent_responded_at: now,
        } as never,
        { count: "exact" },
      )
      .eq("id", miRow.id)
      .eq("consent_response", "pending");
    if (updateErr) {
      console.error("match_interests update failed", updateErr);
      return htmlResponse(500, pageInvalid());
    }
    if (!updateCount || updateCount === 0) {
      // Lost the race — show already-responded rather than firing a
      // duplicate intro.
      return htmlResponse(200, pageAlreadyResponded());
    }

    // Insert match_intros row with canonical ordering
    const userA =
      miRow.from_user_id < miRow.to_user_id
        ? miRow.from_user_id
        : miRow.to_user_id;
    const userB =
      miRow.from_user_id < miRow.to_user_id
        ? miRow.to_user_id
        : miRow.from_user_id;

    const { error: introInsertErr } = await admin
      .from("match_intros")
      .insert({
        user_a_id: userA,
        user_b_id: userB,
        match_score: miRow.match_score,
        compound_type: miRow.compound_type,
        ai_why_text: miRow.ai_why_text,
      });
    if (introInsertErr && (introInsertErr as { code?: string }).code !== "23505") {
      console.warn("match_intros insert failed", introInsertErr);
      // Continue anyway — the consent_response is set; the intro row
      // existing is the eventual signal.
    }

    // Day 67 §8.6 audit fix #1: invoke send-mutual-intro-email WITH
    // retry. The threshold ritual cannot ship "best effort" silent
    // failure — if Resend hiccups on the first 10 intros, the trust
    // ritual is broken. Retry twice with backoff before falling back
    // to the "your yes is recorded, email is delayed" page.
    const invokeIntroEmail = async (): Promise<boolean> => {
      try {
        const introRes = await fetch(
          `${SUPABASE_URL}/functions/v1/send-mutual-intro-email`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              "Content-Type": "application/json",
              "x-internal-caller": "match-consent",
            },
            body: JSON.stringify({
              user_a_id: userA,
              user_b_id: userB,
              ai_why_text: miRow.ai_why_text,
            }),
          },
        );
        if (!introRes.ok) {
          const errText = await introRes.text();
          console.warn(
            "send-mutual-intro-email failed",
            introRes.status,
            errText,
          );
          return false;
        }
        return true;
      } catch (err) {
        console.warn("send-mutual-intro-email invoke threw", err);
        return false;
      }
    };

    let introEmailSent = await invokeIntroEmail();
    if (!introEmailSent) {
      // First retry — short backoff
      await new Promise((resolve) => setTimeout(resolve, 600));
      introEmailSent = await invokeIntroEmail();
    }
    if (!introEmailSent) {
      // Second retry — longer backoff
      await new Promise((resolve) => setTimeout(resolve, 1500));
      introEmailSent = await invokeIntroEmail();
    }

    // Log the outcome so admin can see at-a-glance via email_send_log
    // whether the bilateral intro ever made it out for this pair.
    if (!introEmailSent) {
      await admin.from("email_send_log").insert({
        template_name: "mutual_intro_invoke_failed",
        recipient_email: "(internal-invoke)",
        status: "failed",
        error_message:
          "match-consent could not invoke send-mutual-intro-email after 3 attempts",
        metadata: {
          match_interest_id: miRow.id,
          user_a_id: userA,
          user_b_id: userB,
        },
      });
      return htmlResponse(200, pageYesEmailDelayed(aFirstName));
    }

    // Day 67 §8.6 audit fix #3: variable naming. The "other" party
    // from B's perspective IS A (from_user_id). aFirstName is the
    // correct value to pass to pageYes.
    return htmlResponse(200, pageYes(aFirstName));
  } catch (err) {
    console.error("match-consent error", err);
    return htmlResponse(500, pageInvalid());
  }
});
