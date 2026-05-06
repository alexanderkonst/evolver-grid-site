// admin-send-bulk-email — Day 62 (Sasha 2026-05-05) Wave 2.
//
// Admin-gated bulk email sender. Powers the segment-based outreach on
// /admin: pick a segment chip ("TT high resonance", "Stale 14d+", etc.),
// open the composer, write a subject + body, send to the resolved
// recipient list. Logs every attempt to email_send_log so the admin
// "Sent campaigns" tracker can replay history.
//
// AUTH: mirrors admin-send-magic-link. Caller must:
//   1. Send a Bearer JWT.
//   2. Resolve to a user with `has_role(user_id, 'admin')` = true.
//
// SAFETY:
//   • Hard-skips any recipient present in `nurture_opt_outs` → logs row
//     with status='suppressed', does NOT send. Critical for CAN-SPAM
//     compliance — opted-out users must never receive bulk mail again.
//   • 200ms inter-message delay so Resend doesn't throttle on big sends.
//   • Cap of 200 recipients per call. Above that, operator must split
//     into multiple calls (the composer enforces this client-side too).
//   • dry_run mode: substitutes variables and returns the rendered
//     output WITHOUT sending. Lets the operator preview before firing.
//
// VARIABLE SUBSTITUTION (in subject and body_markdown):
//   {{first_name}}  → recipient.first_name (falls back to "")
//   {{archetype}}   → recipient.archetype (falls back to "your Top Talent")
//   {{magic_link}}  → freshly-generated magic link, when include_magic_link
//
// MARKDOWN RENDERING (v1 — minimal): paragraphs, **bold**, [text](url).
// Anything more sophisticated (lists, headers, images) ships with Wave
// 2.1 if needed. Most lifecycle emails don't need more than this.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mirror process-nurture-emails / save-zog-result FROM_ADDRESS. Display
// name is brand-identity ("Find Your Top Talent"); technical address
// stays on the verified Resend domain.
const FROM_ADDRESS =
  "Find Your Top Talent <aleksandr@notify.aleksandrkonstantinov.com>";

const MAX_RECIPIENTS_PER_CALL = 200;
const SEND_DELAY_MS = 200;

// ─── Types ─────────────────────────────────────────────────────────

interface Recipient {
  user_id: string;
  email: string;
  first_name?: string | null;
  archetype?: string | null;
}

interface BulkPayload {
  recipients: Recipient[];
  subject: string;
  body_markdown: string;
  include_magic_link?: boolean;
  campaign_id?: string;
  dry_run?: boolean;
}

interface SendResult {
  email: string;
  status: "sent" | "suppressed" | "failed" | "preview";
  message_id?: string;
  error?: string;
  rendered_subject?: string;
  rendered_html?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────

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

// Minimal markdown → HTML. Paragraphs (blank-line separated), **bold**,
// and [text](url) only. Anything else passes through as escaped text.
function renderMarkdown(md: string): string {
  // Split into paragraphs on blank lines (preserves intentional breaks).
  const blocks = md
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      // Inline transforms — apply on the unescaped block, then escape
      // the rest. Order matters: link first (since it contains [/](
      // which would otherwise be escaped), then bold.
      let html = "";
      let i = 0;
      while (i < block.length) {
        // Link [text](url)
        const linkMatch = block.slice(i).match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          const text = escapeHtml(linkMatch[1]);
          const url = escapeHtml(linkMatch[2]);
          html += `<a href="${url}" style="color: #b8860b; text-decoration: underline;">${text}</a>`;
          i += linkMatch[0].length;
          continue;
        }
        // Bold **text**
        const boldMatch = block.slice(i).match(/^\*\*([^*]+)\*\*/);
        if (boldMatch) {
          html += `<strong>${escapeHtml(boldMatch[1])}</strong>`;
          i += boldMatch[0].length;
          continue;
        }
        // Plain char — escape and advance
        html += escapeHtml(block[i]);
        i += 1;
      }
      // Convert remaining single-newlines (within a paragraph) to <br/>
      html = html.replace(/\n/g, "<br/>");
      return `<p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">${html}</p>`;
    })
    .join("\n");
}

function substituteVariables(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) => vars[name] ?? "");
}

const baseShell = (inner: string, siteUrl: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #fbf7ee; color: #0a1628; padding: 40px 32px; border-radius: 16px;">
    ${inner}
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(11,42,90,0.10);">
      <p style="color: rgba(11,42,90,0.55); font-size: 12px; margin: 0;">— Aleksandr</p>
      <p style="color: rgba(11,42,90,0.45); font-size: 11px; margin: 2px 0 0 0;">
        <a href="${siteUrl}" style="color: rgba(184,134,11,0.85); text-decoration: none;">FindYourTopTalent.Com</a>
      </p>
    </div>
  </div>
`;

// ─── Main handler ──────────────────────────────────────────────────

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
    const SITE_URL =
      Deno.env.get("SITE_URL") ?? "https://findyourtoptalent.com";

    if (!RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY not configured" }, 500);
    }

    // ── Auth gate ────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Missing Authorization bearer token" }, 401);
    }

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

    // ── Parse + validate ─────────────────────────────────────────
    let body: BulkPayload;
    try {
      body = (await req.json()) as BulkPayload;
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
      return json({ error: "'recipients' must be a non-empty array" }, 400);
    }
    if (body.recipients.length > MAX_RECIPIENTS_PER_CALL) {
      return json(
        {
          error: `Too many recipients (${body.recipients.length}). Cap is ${MAX_RECIPIENTS_PER_CALL}; split into multiple calls.`,
        },
        400,
      );
    }
    if (!body.subject?.trim() || !body.body_markdown?.trim()) {
      return json({ error: "Subject and body are both required" }, 400);
    }

    const campaignId =
      body.campaign_id?.trim() ||
      `bulk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // ── Fetch opt-out list once for the whole batch ──────────────
    const { data: optOuts } = await admin
      .from("nurture_opt_outs")
      .select("email");
    const optOutSet = new Set(
      ((optOuts ?? []) as Array<{ email: string }>).map((r) =>
        r.email.toLowerCase(),
      ),
    );

    // ── Loop: substitute, send (or dry-run), log ─────────────────
    const results: SendResult[] = [];
    let sentCount = 0;
    let suppressedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < body.recipients.length; i++) {
      const r = body.recipients[i];
      const emailLower = r.email.trim().toLowerCase();

      // Suppression check (CAN-SPAM)
      if (optOutSet.has(emailLower)) {
        results.push({ email: r.email, status: "suppressed" });
        suppressedCount += 1;
        if (!body.dry_run) {
          await admin.from("email_send_log").insert({
            template_name: "admin_bulk",
            recipient_email: r.email,
            status: "suppressed",
            metadata: {
              campaign_id: campaignId,
              subject: body.subject,
              reason: "in nurture_opt_outs",
            },
          });
        }
        continue;
      }

      // Magic link (one fresh per recipient)
      let magicLink = "";
      if (body.include_magic_link) {
        try {
          const { data: linkData, error: linkErr } =
            await admin.auth.admin.generateLink({
              type: "magiclink",
              email: r.email,
              options: { redirectTo: `${SITE_URL}/game/me` },
            });
          if (linkErr) throw linkErr;
          magicLink = linkData.properties?.action_link ?? "";
        } catch (e: any) {
          console.warn(`magic-link gen failed for ${r.email}`, e);
          // Don't abort the send — leave magicLink empty so the
          // {{magic_link}} variable substitutes to "" rather than
          // rendering as a broken token.
        }
      }

      // Variable substitution
      const vars: Record<string, string> = {
        first_name: r.first_name ?? "",
        archetype: r.archetype ?? "your Top Talent",
        magic_link: magicLink,
      };
      const renderedSubject = substituteVariables(body.subject, vars);
      const renderedBodyMd = substituteVariables(body.body_markdown, vars);
      const renderedHtml = baseShell(renderMarkdown(renderedBodyMd), SITE_URL);

      // Dry run: collect rendered output, do not send
      if (body.dry_run) {
        results.push({
          email: r.email,
          status: "preview",
          rendered_subject: renderedSubject,
          rendered_html: renderedHtml,
        });
        continue;
      }

      // Send via Resend
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: [r.email],
            subject: renderedSubject,
            html: renderedHtml,
          }),
        });

        if (!resendRes.ok) {
          const errText = await resendRes.text();
          throw new Error(`Resend ${resendRes.status}: ${errText}`);
        }

        const resendData = await resendRes.json();
        const messageId = resendData?.id ?? null;
        results.push({ email: r.email, status: "sent", message_id: messageId });
        sentCount += 1;

        await admin.from("email_send_log").insert({
          template_name: "admin_bulk",
          recipient_email: r.email,
          status: "sent",
          message_id: messageId,
          metadata: {
            campaign_id: campaignId,
            subject: renderedSubject,
            user_id: r.user_id,
          },
        });
      } catch (e: any) {
        const errMsg = e?.message || String(e);
        console.error(`bulk send failed for ${r.email}`, errMsg);
        results.push({ email: r.email, status: "failed", error: errMsg });
        failedCount += 1;

        await admin.from("email_send_log").insert({
          template_name: "admin_bulk",
          recipient_email: r.email,
          status: "failed",
          error_message: errMsg,
          metadata: {
            campaign_id: campaignId,
            subject: renderedSubject,
            user_id: r.user_id,
          },
        });
      }

      // Throttle so Resend doesn't 429 on bigger lists.
      if (i < body.recipients.length - 1) {
        await new Promise((res) => setTimeout(res, SEND_DELAY_MS));
      }
    }

    return json({
      ok: true,
      campaign_id: campaignId,
      total: body.recipients.length,
      sent: sentCount,
      suppressed: suppressedCount,
      failed: failedCount,
      dry_run: !!body.dry_run,
      results,
    });
  } catch (e) {
    console.error("admin-send-bulk-email unexpected error", e);
    return json({ error: (e as Error).message ?? "Unknown error" }, 500);
  }
});
