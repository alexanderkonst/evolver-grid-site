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
  "Find Your Top Talent <notifications@notify.findtoptalent.com>";

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
  claim_state?: "unclaimed" | "claimed";
  intent?: "business" | "journey";
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

// Email 1 - Day 1 / 24h after result.
const renderDay1 = (payload: Payload, magicLink: string, siteUrl: string) => {
  if (payload.claim_state === "unclaimed") {
    return baseShell(`
      <div style="margin-bottom: 24px;">
        <p style="font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.6; margin: 0 0 14px 0;">
          Your Top Talent result is ready.
        </p>
        <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
          We saved it so it does not disappear.
        </p>
        <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0;">
          Open it here:
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #7a5108, #a06d08); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">Open my Top Talent result</a>
      </div>

      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
        Just your result, free, no strings attached.
      </p>

      <p style="color: rgba(255,255,255,0.4); font-size: 12px; font-style: italic; line-height: 1.6; margin: 0;">
        We will send one more short note tomorrow if you do not open it, and then we stop.
      </p>
    `, siteUrl);
  }

  return baseShell(`
    <div style="margin-bottom: 24px;">
      <p style="font-size: 15px; color: rgba(255,255,255,0.85); line-height: 1.6; margin: 0 0 14px 0;">
        Your Top Talent has a deeper layer.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
        The first reveal names the value you carry.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
        The deeper layer shows where it shines, where it gets blocked, what kinds of roles it is built for, and how it can be monetized.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0;">
        The free next step is to find the direction this value wants to move in.
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${siteUrl}/mission-discovery" style="display: inline-block; background: linear-gradient(135deg, #7a5108, #a06d08); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">Continue to mission discovery</a>
    </div>

    <p style="color: rgba(255,255,255,0.4); font-size: 12px; font-style: italic; line-height: 1.6; margin: 0;">
      We will send one more short note tomorrow with the next best step, and then we stop.
    </p>
  `, siteUrl);
};

// Email 2 - Day 2 / 48h after result.
const renderDay2 = (payload: Payload, _magicLink: string, siteUrl: string) => {
  if (payload.claim_state === "unclaimed") {
    return baseShell(`
      <div style="padding: 20px 0;">
        <p style="font-size: 18px; color: #e2e8f0; line-height: 1.6; margin: 0 0 24px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic;">
          Your Top Talent result is still waiting.
        </p>
        <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 20px 0;">
          We saved it so it does not disappear.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${_magicLink}" style="display: inline-block; background: linear-gradient(135deg, #7a5108, #a06d08); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">Open my Top Talent result</a>
        </div>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; font-style: italic; line-height: 1.6; margin: 0;">
          This is the last follow-up email unless you choose to go deeper.
        </p>
      </div>
    `, siteUrl);
  }

  if (payload.intent === "business") {
    return baseShell(`
      <div style="padding: 20px 0;">
        <p style="font-size: 18px; color: #e2e8f0; line-height: 1.6; margin: 0 0 24px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic;">
          Your Top Talent points toward monetization, but it still needs business structure on top of it.
        </p>
        <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
          The question is not "what could I do with this information?"
        </p>
        <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 20px 0;">
          The question is: what is the clearest business direction to build from this unique value now?
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${siteUrl}/ignite#pricing-section" style="display: inline-block; background: linear-gradient(135deg, #7a5108, #a06d08); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">Turn Your Uniqueness into a Business</a>
        </div>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; font-style: italic; line-height: 1.6; margin: 0;">
          This is the last follow-up email unless you choose to go deeper.
        </p>
      </div>
    `, siteUrl);
  }

  return baseShell(`
    <div style="padding: 20px 0;">
      <p style="font-size: 18px; color: #e2e8f0; line-height: 1.6; margin: 0 0 24px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic;">
        You named the unique value you bring to any professional space.
      </p>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
        But what is your career direction? What do you bring to the table?
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${siteUrl}/mission-discovery" style="display: inline-block; background: linear-gradient(135deg, #7a5108, #a06d08); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">Continue to mission discovery and resource mapping</a>
      </div>
      <p style="font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 14px 0;">
        That makes your profile robust enough to send a signal to collaborators and projects that are a precise fit for you.
      </p>
      <p style="color: rgba(255,255,255,0.4); font-size: 12px; font-style: italic; line-height: 1.6; margin: 0;">
        This is the last follow-up email unless you choose to go deeper.
      </p>
    </div>
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
