// process-nurture-emails — Day 47 late pass (Sasha)
//
// Runs every 10 min via pg_cron. Pulls pending rows from
// `nurture_email_queue` whose scheduled_for has passed, renders the
// appropriate template per email_type (day1, day2, day8), sends via
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

// Day 58+ (Sasha 2026-05-03): swapped from personal name + domain to
// brand identity. All transactional / nurture mail now reads as
// "Find Your Top Talent" — never the founder's personal name.
const FROM_ADDRESS =
  "Find Your Top Talent <hello@notify.findyourtoptalent.com>";

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
// All three emails share a base: dark navy card, light halo, Cormorant
// archetype, Source Serif body. Signed "— Aleksandr / FindYourTopTalent.Com".

type Payload = {
  archetype?: string;
  bullseye?: string;
  top_talents?: string[];
  prime_driver?: string;
  archetype_lens?: string;
};

const baseShell = (inner: string, siteUrl: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a1a; color: #e2e8f0; padding: 40px 32px; border-radius: 16px;">
    ${inner}
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08);">
      <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">— Aleksandr</p>
      <p style="color: rgba(255,255,255,0.25); font-size: 11px; margin: 2px 0 0 0;">
        <a href="${siteUrl}" style="color: rgba(255,255,255,0.35); text-decoration: none;">FindYourTopTalent.Com</a>
      </p>
    </div>
  </div>
`;

// Email 2 — Day 1 · log-in nudge + booking angle + "last reminder in a week" note
const renderDay1 = (payload: Payload, magicLink: string, siteUrl: string) => {
  const archetype = escapeHtml(payload.archetype || "Your Top Talent");
  return baseShell(`
    <div style="margin-bottom: 24px;">
      <p style="font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.6; margin: 0 0 14px 0;">
        Yesterday you met your Top Talent: <strong style="color: #e2e8f0;">${archetype}</strong>.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
        That was the surface.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
        Inside your account there's a deeper layer — where this pattern shines brightest, where it trips you up, the roles it's built for, the repeatable action that sharpens it over time. 30 seconds to open.
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">Open my full Top Talent profile →</a>
    </div>

    <div style="background: rgba(240,194,127,0.06); border: 1px solid rgba(240,194,127,0.15); border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;">
      <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Already thinking about turning this into a business?</p>
      <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0 0 14px 0; line-height: 1.6;">
        That's the next thing I help with. A 2-hour Productize Yourself Session. $555. Money-back guarantee: if you don't leave with a one-sentence business you recognize as yours, you don't pay.
      </p>
      <a href="${siteUrl}/ignite#pricing-section" style="display: inline-block; color: rgba(240,194,127,0.9); text-decoration: none; font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(240,194,127,0.3);">Book your Productize Yourself Session →</a>
    </div>

    <p style="color: rgba(255,255,255,0.4); font-size: 12px; font-style: italic; line-height: 1.6; margin: 0;">
      I will send one last reminder in exactly one week from now — no more pings after that.
    </p>
  `, siteUrl);
};

// Email 3 — Day 2 (T+48h) · minimalist check-in
const renderDay2 = (_payload: Payload, _magicLink: string, siteUrl: string) =>
  baseShell(`
    <div style="padding: 20px 0;">
      <p style="font-size: 18px; color: #e2e8f0; line-height: 1.6; margin: 0 0 24px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic;">
        What's shifted since you read it?
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
        You now know better what you're good at.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0;">
        It stays an abstract insight until you turn it into something people can buy.
      </p>
    </div>
  `, siteUrl);

// Email 4 — Day 8 · last reminder + Productize Yourself CTA
const renderDay8 = (_payload: Payload, _magicLink: string, siteUrl: string) =>
  baseShell(`
    <div style="margin-bottom: 24px;">
      <h2 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 24px; font-weight: 600; color: #e2e8f0; margin: 0 0 20px 0; line-height: 1.3;">
        Your Top Talent is the unhinged raw YOU
      </h2>
      <p style="font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0 0 14px 0;">
        It's been a week. Your Top Talent hasn't changed. You still know what you're good at.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0 0 14px 0;">
        But nothing shifts until you turn it into something people can buy.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0 0 14px 0;">
        If you're ready to package it — I run a 2-hour Productize Yourself Session that compiles your entire unique business onto one page.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0 0 20px 0;">
        $555. Money-back guarantee: if you don't leave with a one-sentence business you recognize as yours, you don't pay.
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${siteUrl}/ignite#pricing-section" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">Book your Productize Yourself Session — $555 →</a>
    </div>

    <p style="color: rgba(255,255,255,0.45); font-size: 13px; font-style: italic; line-height: 1.6; margin: 0;">
      Last reminder. No more emails from me unless you take the next step.
    </p>
  `, siteUrl);

const renderersByType: Record<string, (p: Payload, link: string, siteUrl: string) => string> = {
  day1: renderDay1,
  day2: renderDay2,
  day8: renderDay8,
};

const subjectsByType: Record<string, (p: Payload) => string> = {
  day1: () => `Your Top Talent has a deeper layer`,
  day2: () => `Has anything shifted?`,
  day8: () => `Your Top Talent is still you`,
};

// ── Handler ────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    .select("id, email, profile_id, email_type, payload, attempts")
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
    let magicLink = `${siteUrl}/auth?next=%2Fgame%2Fme`;
    try {
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: row.email,
        options: { redirectTo: `${siteUrl}/auth/callback?next=/game/me` },
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
