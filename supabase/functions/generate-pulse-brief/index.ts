// generate-pulse-brief — Day 119 (Sasha 2026-07-09).
//
// The Founder Pulse: an autonomous brief that reads the founder's live
// context and writes what a sharp chief-of-staff would say, before being
// asked. Invoked by pg_cron (see migration 20260709120000) twice daily
// (kind: "daily") and Monday mornings (kind: "weekly"), or manually from
// the Founder Cockpit ("Pulse now").
//
// Context sources:
//   1. Equilibrium DB packet (same tables equilibrium-ai-context reads)
//   2. CRM + project-pulse snapshots published at /generated/*.json
//      (emitted at build time by scripts/emit-*-snapshot.mjs)
//
// Weekly briefs are additionally emailed via Resend, unless
// game_profiles.pulse_email_opt_out is set (Settings → Notifications).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Keep in sync with src/lib/isAdmin.ts and cockpit-ai-lens.
const ADMIN_EMAILS = new Set([
  "alexanderkonst@gmail.com",
  "konst@alum.mit.edu",
  "me@sloan.mit.edu",
]);

const FOUNDER_USER_ID =
  Deno.env.get("EQUILIBRIUM_AI_CONTEXT_USER_ID") ??
  "39e554f8-90ef-48f5-ae0a-9e20d375d57f";
const FOUNDER_EMAIL = "alexanderkonst@gmail.com";
const SITE_ORIGIN =
  Deno.env.get("PULSE_SNAPSHOT_ORIGIN") ?? "https://findyourtoptalent.com";
const FROM_ADDRESS =
  "Find Your Top Talent <notifications@notify.findyourtoptalent.com>";
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

type BriefKind = "daily" | "weekly";

interface BriefContent {
  title: string;
  bottomLine: string;
  signals: string[];
  move: string;
  markdown: string;
}

const SYSTEM_PROMPT = `You are the Founder Pulse for Alexander (Sasha) Konstantinov's Planetary OS venture — the autonomous read his Founder Cockpit runs before he asks.

Register: editorial, precise, human. Short sentences. Concrete words over abstract ones. No em-dashes. No hype, no filler, no coaching language. You are a sharp chief-of-staff naming what is actually happening.

Respond with STRICT JSON only (no markdown fences, no commentary):
{
  "title": "string — 4-8 words naming the state of the field",
  "bottomLine": "string — ONE sentence, the single thing Sasha should know right now",
  "signals": ["2-5 strings — concrete observations from the data: what moved, what is aging, what is silent. Name people, counts, and days where the data allows."],
  "move": "string — ONE specific, executable next move for today (daily) or this week (weekly)",
  "markdown": "string — the full brief as markdown, 120-180 words, structured: bottom line first, then signals, then the move"
}

Rules:
- Only claim what the context data supports. If a source failed to load, do not invent its contents.
- Follow-ups and open items that are aging matter more than what is going well.
- One move, not a list of options.`;

function kindInstruction(kind: BriefKind): string {
  if (kind === "weekly") {
    return `KIND: WEEKLY (Monday morning founder brief). Cover: what moved last week, what is slipping (aging follow-ups, silent threads, stalled workstreams), and this week's single highest-leverage move.`;
  }
  return `KIND: DAILY pulse. A tight read of today: current focus, anything newly aging or newly moved, one move for today.`;
}

const compact = (value: unknown, cap = 16000): string => {
  const text = JSON.stringify(value);
  return text.length > cap ? text.slice(0, cap) : text;
};

function parseJsonObject(text: string): BriefContent {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  return JSON.parse(cleaned) as BriefContent;
}

async function safe<T>(
  label: string,
  warnings: string[],
  fn: () => Promise<T>,
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    warnings.push(`${label}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function assembleContext() {
  const warnings: string[] = [];
  const userId = FOUNDER_USER_ID;

  const [state, workstreams, focus, synthesis, strategies, crm, pulse] =
    await Promise.all([
      safe("equilibrium_state", warnings, async () => {
        const { data, error } = await admin
          .from("equilibrium_state")
          .select("mission_override_text, role_override_text, moon_focus_text, last_synthesis_text, last_synthesis_at")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) throw error;
        return data;
      }),
      safe("equilibrium_workstreams", warnings, async () => {
        const { data, error } = await admin
          .from("equilibrium_workstreams")
          .select("id, title, archived_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(12);
        if (error) throw error;
        if (!data?.length) return [];
        const ids = data.map((w) => w.id);
        const { data: tasks, error: tasksError } = await admin
          .from("equilibrium_tasks")
          .select("workstream_id, text, status, done_at")
          .in("workstream_id", ids)
          .order("done_at", { ascending: false, nullsFirst: true })
          .limit(60);
        if (tasksError) throw tasksError;
        return data.map((w) => ({
          title: w.title,
          status: w.archived_at ? "archived" : "active",
          tasks: (tasks ?? [])
            .filter((t) => t.workstream_id === w.id)
            .slice(0, 8)
            .map((t) => ({ text: t.text, status: t.status, done_at: t.done_at })),
        }));
      }),
      safe("equilibrium_focus", warnings, async () => {
        const { data, error } = await admin
          .from("equilibrium_focus")
          .select("*")
          .eq("user_id", userId);
        if (error) throw error;
        return data;
      }),
      safe("equilibrium_synthesis_log", warnings, async () => {
        const { data, error } = await admin
          .from("equilibrium_synthesis_log")
          .select("reading_text, generated_at")
          .eq("user_id", userId)
          .order("generated_at", { ascending: false })
          .limit(5);
        if (error) throw error;
        return data;
      }),
      safe("equilibrium_strategies", warnings, async () => {
        const { data, error } = await admin
          .from("equilibrium_strategies")
          .select("position, text, set_at")
          .eq("user_id", userId)
          .order("position", { ascending: true })
          .limit(10);
        if (error) throw error;
        return data;
      }),
      safe("crm-snapshot", warnings, async () => {
        const res = await fetch(`${SITE_ORIGIN}/generated/crm-snapshot.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      }),
      safe("project-pulse-snapshot", warnings, async () => {
        const res = await fetch(`${SITE_ORIGIN}/generated/project-pulse-snapshot.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      }),
    ]);

  return {
    generated_at: new Date().toISOString(),
    equilibrium: { state, workstreams, focus, synthesis_log: synthesis, strategies },
    crm_snapshot: crm,
    project_pulse_snapshot: pulse,
    warnings,
  };
}

async function generateBrief(kind: BriefKind, context: unknown): Promise<BriefContent> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const res = await fetch(AI_GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      temperature: 0.4,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `${kindInstruction(kind)}\n\nCONTEXT:\n${compact(context)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI gateway ${res.status}: ${body.slice(0, 300)}`);
  }

  const payload = await res.json();
  const text = payload?.choices?.[0]?.message?.content;
  if (!text) throw new Error("AI gateway returned no content");
  const parsed = parseJsonObject(text);
  return {
    title: String(parsed.title ?? "Founder Pulse"),
    bottomLine: String(parsed.bottomLine ?? ""),
    signals: Array.isArray(parsed.signals) ? parsed.signals.slice(0, 5).map(String) : [],
    move: String(parsed.move ?? ""),
    markdown: String(parsed.markdown ?? ""),
  };
}

function renderWeeklyEmailHtml(brief: BriefContent, dateLabel: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const signals = brief.signals
    .map(
      (s) =>
        `<tr><td style="padding:6px 0 6px 18px;position:relative;font-size:15px;line-height:1.6;color:#3a3428;">— ${esc(s)}</td></tr>`,
    )
    .join("");
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f7f3ea;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ea;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fffdf8;border:1px solid rgba(160,130,60,0.25);border-radius:16px;padding:36px 32px;font-family:Georgia,'Times New Roman',serif;">
  <tr><td style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#a8802d;padding-bottom:6px;">Founder Pulse · Weekly Brief</td></tr>
  <tr><td style="font-size:13px;color:#8a8272;padding-bottom:20px;">${esc(dateLabel)}</td></tr>
  <tr><td style="font-size:26px;line-height:1.25;color:#191712;padding-bottom:16px;">${esc(brief.title)}</td></tr>
  <tr><td style="font-size:16px;line-height:1.6;color:#191712;padding-bottom:20px;border-left:3px solid #d6a84d;padding-left:14px;"><strong>${esc(brief.bottomLine)}</strong></td></tr>
  <tr><td><table role="presentation" cellpadding="0" cellspacing="0" width="100%">${signals}</table></td></tr>
  <tr><td style="padding-top:22px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#a8802d;">This week's move</td></tr>
  <tr><td style="padding-top:6px;font-size:16px;line-height:1.6;color:#191712;">${esc(brief.move)}</td></tr>
  <tr><td style="padding-top:30px;border-top:1px solid rgba(160,130,60,0.18);margin-top:24px;font-size:12px;line-height:1.6;color:#8a8272;">
    Generated by the Founder Cockpit. Full brief lives at findyourtoptalent.com/build/cockpit/dashboard.<br/>
    To pause these emails: Settings → Notifications → Founder pulse emails.
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

async function sendWeeklyEmail(brief: BriefContent) {
  // Respect the Settings → Notifications toggle.
  const { data: profile } = await admin
    .from("game_profiles")
    .select("pulse_email_opt_out")
    .eq("user_id", FOUNDER_USER_ID)
    .maybeSingle();
  if (profile?.pulse_email_opt_out) {
    await admin.from("email_send_log").insert({
      template_name: "founder_pulse_weekly",
      recipient_email: FOUNDER_EMAIL,
      status: "suppressed",
      error_message: "pulse_email_opt_out is set",
      metadata: { kind: "weekly" },
    });
    return { sent: false, reason: "opted_out" };
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Mexico_City",
  }).format(new Date());

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: FOUNDER_EMAIL,
      subject: `Founder Pulse · ${brief.title}`,
      html: renderWeeklyEmailHtml(brief, dateLabel),
    }),
  });

  const ok = res.ok;
  const body = ok ? await res.json() : await res.text();
  await admin.from("email_send_log").insert({
    template_name: "founder_pulse_weekly",
    recipient_email: FOUNDER_EMAIL,
    status: ok ? "sent" : "failed",
    error_message: ok ? null : String(body).slice(0, 500),
    message_id: ok ? (body as { id?: string }).id ?? null : null,
    metadata: { kind: "weekly" },
  });
  if (!ok) throw new Error(`Resend ${res.status}: ${String(body).slice(0, 300)}`);
  return { sent: true };
}

// Authorized callers: pg_cron (service-role bearer) or a signed-in admin
// (the cockpit's "Pulse now" button).
async function isAuthorized(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  if (token === SERVICE_ROLE_KEY) return true;
  const authClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data } = await authClient.auth.getUser();
  const email = data?.user?.email?.toLowerCase();
  return !!email && ADMIN_EMAILS.has(email);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!(await isAuthorized(req))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const kind: BriefKind = body?.kind === "weekly" ? "weekly" : "daily";

    const context = await assembleContext();
    const brief = await generateBrief(kind, context);

    const { data: inserted, error: insertError } = await admin
      .from("pulse_briefs")
      .insert({
        kind,
        title: brief.title,
        bottom_line: brief.bottomLine,
        content: brief as unknown as Record<string, unknown>,
        markdown: brief.markdown,
      })
      .select("id, created_at")
      .single();
    if (insertError) throw insertError;

    let email: { sent: boolean; reason?: string } | null = null;
    if (kind === "weekly") {
      email = await sendWeeklyEmail(brief);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        kind,
        brief_id: inserted?.id,
        email,
        warnings: context.warnings,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-pulse-brief error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
