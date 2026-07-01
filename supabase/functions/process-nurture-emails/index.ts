// process-nurture-emails — Day 47 late pass (Sasha)
//
// Runs every 10 min via pg_cron. Pulls pending rows from
// `nurture_email_queue` whose scheduled_for has passed, renders the
// appropriate template per email_type (day1, day2), sends via
// Resend, marks sent/failed.
//
// Safe to invoke manually (POST with empty body) for debugging.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Day 58+ (Sasha 2026-05-03): only the DISPLAY NAME changed to brand
// identity. Technical address stays on the already-verified Resend
// domain to avoid DNS re-verification. The "From" name "Find Your
// Top Talent" is what recipients see in their inbox sender column.
const FROM_ADDRESS =
  "Find Your Top Talent <notifications@notify.findyourtoptalent.com>";

const BATCH_SIZE = 25;
const MAX_ATTEMPTS = 3;

const escapeHtml = (unsafe: string): string =>
  unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

// ── Email renderers ────────────────────────────────────────────────
// Clean note-style emails: white canvas, readable text, neon-yellow
// highlighter CTA only. No founder signature.

type Payload = {
  archetype?: string;
  bullseye?: string;
  top_talents?: string[];
  prime_driver?: string;
  archetype_lens?: string;
  claim_state?: "unclaimed" | "claimed";
  intent?: "business" | "journey";
};

const baseShell = (inner: string, siteUrl: string) => `
  <div style="margin: 0; padding: 0; background: #ffffff;">
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; color: #111827; padding: 34px 22px 28px 22px;">
      ${inner}
      <div style="margin-top: 34px; padding-top: 18px; border-top: 1px solid #e5e7eb;">
        <a href="${siteUrl}" style="color: #6b7280; font-size: 12px; line-height: 1.5; text-decoration: none;">Find Your Top Talent</a>
      </div>
    </div>
  </div>
`;

const p = (copy: string) => `
  <p style="font-size: 16px; line-height: 1.65; color: #111827; margin: 0 0 16px 0;">${copy}</p>
`;

const quiet = (copy: string) => `
  <p style="font-size: 13px; line-height: 1.6; color: #6b7280; margin: 20px 0 0 0;">${copy}</p>
`;

const cta = (href: string, copy: string) => `
  <p style="font-size: 16px; line-height: 1.65; margin: 22px 0 20px 0;">
    <a href="${href}" style="background: #eaff00; color: #111827; font-weight: 700; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; padding: 2px 5px; box-decoration-break: clone; -webkit-box-decoration-break: clone;">${copy}</a>
  </p>
`;

// Email 1 - Day 1 / 24h after result.
const renderDay1 = (payload: Payload, magicLink: string, siteUrl: string) => {
  if (payload.claim_state === "unclaimed") {
    return baseShell(`
      ${p("Your Top Talent result is ready.")}
      ${p("We saved it so it does not disappear.")}
      ${cta(magicLink, "Open my Top Talent result")}
      ${p("Free, no strings attached.")}
      ${quiet("We will send one more short note tomorrow if you do not open it, and then we stop.")}
    `, siteUrl);
  }

  return baseShell(`
    ${p("Your Top Talent has a deeper layer.")}
    ${p(`The first reveal names the value you carry.`)}
    ${p("The deeper layer shows where it shines, where it gets blocked, what kinds of roles it is built for, and how it can be monetized.")}
    ${p(`The free next step is to find the direction this value wants to move in.`)}
    ${cta(`${siteUrl}/mission-discovery`, "Continue to mission discovery")}
    ${quiet("We will send one more short note tomorrow with the next best step, and then we stop.")}
  `, siteUrl);
};

// Email 2 - Day 2 / 48h after result.
const renderDay2 = (payload: Payload, _magicLink: string, siteUrl: string) => {
  if (payload.claim_state === "unclaimed") {
    return baseShell(`
      ${p("Your Top Talent result is still waiting.")}
      ${p(`We saved it so it does not disappear.`)}
      ${cta(_magicLink, "Open my Top Talent result")}
      ${quiet("This is the last follow-up email unless you choose to go deeper.")}
    `, siteUrl);
  }

  if (payload.intent === "business") {
    return baseShell(`
      ${p("Your Top Talent points toward monetization, but it still needs business structure on top of it.")}
      ${p(`The question is not "what could I do with this information?"`)}
      ${p("The question is: what is the clearest business direction to build from this unique value now?")}
      ${cta(`${siteUrl}/ignite#pricing-section`, "Turn Your Uniqueness into a Business")}
      ${quiet("This is the last follow-up email unless you choose to go deeper.")}
    `, siteUrl);
  }

  return baseShell(`
    ${p(`You named the unique value you bring to any professional space.`)}
    ${p("But what is your career direction? What do you bring to the table?")}
    ${cta(`${siteUrl}/mission-discovery`, "Continue to mission discovery and resource mapping")}
    ${p("That makes your profile robust enough to send a signal to collaborators and projects that are a precise fit for you.")}
    ${quiet("This is the last follow-up email unless you choose to go deeper.")}
  `, siteUrl);
};

const renderersByType: Record<string, (p: Payload, link: string, siteUrl: string) => string> = {
  day1: renderDay1,
  day2: renderDay2,
};

const subjectsByType: Record<string, (p: Payload) => string> = {
  day1: (payload) =>
    payload.claim_state === "unclaimed"
      ? `Your Top Talent result is waiting`
      : `Your Top Talent has a deeper layer`,
  day2: (payload) =>
    payload.claim_state === "unclaimed"
      ? `Your Top Talent result is still waiting`
      : payload.intent === "business"
        ? `Turn your Top Talent into a business`
        : `You named the value you carry. But in which direction?`,
};

// ── Handler ────────────────────────────────────────────────────────
const NURTURE_DISPATCH_KILLED = false;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (NURTURE_DISPATCH_KILLED) {
    return new Response(
      JSON.stringify({
        skipped: true,
        reason: "NURTURE_DISPATCH_KILLED",
        note: "Nurture-email dispatch is disabled by code constant. Flip in process-nurture-emails to revive.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const siteUrl = Deno.env.get("SITE_URL") || "https://findyourtoptalent.com";

  if (!resendKey) {
    return new Response(
      JSON.stringify({ error: "RESEND_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Pull due + pending rows, oldest first.
  const { data: dueRows, error: queueErr } = await supabase
    .from("nurture_email_queue")
    .select("id, email, profile_id, email_type, payload, attempts, created_at")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .lt("attempts", MAX_ATTEMPTS)
    .order("scheduled_for", { ascending: true })
    .limit(BATCH_SIZE);

  if (queueErr) {
    console.error("[process-nurture-emails] Queue read failed:", queueErr);
    return new Response(
      JSON.stringify({ error: queueErr.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!dueRows || dueRows.length === 0) {
    return new Response(
      JSON.stringify({ processed: 0, message: "nothing due" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let sentCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const row of dueRows) {
    // Opt-out check (second line of defense — save-zog-result also checks)
    const { data: optOut } = await supabase
      .from("nurture_opt_outs")
      .select("email")
      .eq("email", row.email)
      .maybeSingle();

    if (optOut) {
      await supabase
        .from("nurture_email_queue")
        .update({ status: "cancelled", last_error: "user_opted_out" })
        .eq("id", row.id);
      skippedCount++;
      continue;
    }

    // Generate a fresh magic link for day1 (users click it to authenticate).
    // Day 2 and Day 8 emails don't need magic links — they're content-only —
    // but we generate one anyway so "Open my result" links still work in the
    // footer if we add them later.
    let magicLink = `${siteUrl}/auth?next=%2Fzone-of-genius`;
    try {
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: row.email,
        options: { redirectTo: `${siteUrl}/auth/callback?next=/zone-of-genius` },
      });
      if (linkData?.properties?.action_link) {
        magicLink = linkData.properties.action_link;
      }
    } catch (err) {
      console.warn("[process-nurture-emails] generateLink failed, using fallback:", err);
    }

    const renderer = renderersByType[row.email_type];
    const subjectFn = subjectsByType[row.email_type];
    if (!renderer || !subjectFn) {
      await supabase
        .from("nurture_email_queue")
        .update({
          status: "failed",
          attempts: (row.attempts ?? 0) + 1,
          last_error: `unknown email_type: ${row.email_type}`,
        })
        .eq("id", row.id);
      failedCount++;
      continue;
    }

    const payload = (row.payload ?? {}) as Payload;
    if (row.email_type === "day1") {
      payload.claim_state = row.profile_id ? "claimed" : "unclaimed";
    }
    const html = renderer(payload, magicLink, siteUrl);
    const subject = subjectFn(payload);

    try {
      const emailResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [row.email],
          subject,
          html,
        }),
      });

      if (emailResp.ok) {
        await supabase
          .from("nurture_email_queue")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            attempts: (row.attempts ?? 0) + 1,
          })
          .eq("id", row.id);
        sentCount++;
      } else {
        const errText = await emailResp.text();
        console.error("[process-nurture-emails] Resend error:", errText);
        const nextAttempts = (row.attempts ?? 0) + 1;
        await supabase
          .from("nurture_email_queue")
          .update({
            status: nextAttempts >= MAX_ATTEMPTS ? "failed" : "pending",
            attempts: nextAttempts,
            last_error: errText.slice(0, 500),
          })
          .eq("id", row.id);
        failedCount++;
      }
    } catch (err) {
      console.error("[process-nurture-emails] Send threw:", err);
      const nextAttempts = (row.attempts ?? 0) + 1;
      await supabase
        .from("nurture_email_queue")
        .update({
          status: nextAttempts >= MAX_ATTEMPTS ? "failed" : "pending",
          attempts: nextAttempts,
          last_error: err instanceof Error ? err.message.slice(0, 500) : "unknown",
        })
        .eq("id", row.id);
      failedCount++;
    }
  }

  return new Response(
    JSON.stringify({
      processed: dueRows.length,
      sent: sentCount,
      failed: failedCount,
      skipped: skippedCount,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
