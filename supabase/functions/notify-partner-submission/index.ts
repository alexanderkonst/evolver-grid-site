import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FROM_NOTIFICATIONS } from "../_shared/senders.ts";

// Instant signal to Sasha for every /bring-your-module submission (issues #404, #462).
// Primary channel: Telegram, through the bot the project already has.
//   Secrets (already set for equilibrium-telegram-bot / equilibrium-telegram, nothing new):
//   TELEGRAM_BOT_TOKEN, and chat id from TELEGRAM_FOUNDER_CHAT_ID or else TELEGRAM_CHAT_ID.
// Secondary channel: Resend email (RESEND_API_KEY, FROM_NOTIFICATIONS), best effort, runs after
//   Telegram. It currently fails while the sender domain is unverified; that is logged, not fatal.
// Response: { success: true, telegram, email }. 500 only when both channels fail.
// No DB access: the form inserts the row itself, this only notifies.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFY_TO = "alexanderkonst@gmail.com";

// Same limits as the form (src/lib/partnerIntake.ts PARTNER_LIMITS).
const LIMITS = { name: 200, email: 320, projectUrl: 2000, note: 2000 };

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/** Hostname without www; empty when the link is not a usable address. */
const hostnameOf = (projectUrl: string): string => {
  const withScheme = /^https?:\/\//i.test(projectUrl) ? projectUrl : `https://${projectUrl}`;
  try {
    const host = new URL(withScheme).hostname;
    return host.includes(".") ? host.replace(/^www\./i, "").toLowerCase() : "";
  } catch {
    return "";
  }
};

// Telegram caps a message at 4096 chars; stay under with room to spare.
const TELEGRAM_MAX_CHARS = 3900;

/** Never throws: returns false and logs on any failure. */
const sendTelegram = async (text: string): Promise<boolean> => {
  try {
    const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_FOUNDER_CHAT_ID") || Deno.env.get("TELEGRAM_CHAT_ID");
    if (!token || !chatId) throw new Error("TELEGRAM_BOT_TOKEN or chat id (TELEGRAM_FOUNDER_CHAT_ID / TELEGRAM_CHAT_ID) is not set");

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }
    return true;
  } catch (error) {
    console.error("notify-partner-submission: Telegram failed:", error);
    return false;
  }
};

/** Best effort. Never throws: returns false and logs on any failure. */
const sendEmail = async (
  { subject, text, replyTo }: { subject: string; text: string; replyTo: string },
): Promise<boolean> => {
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_NOTIFICATIONS,
        to: [NOTIFY_TO],
        reply_to: replyTo,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }
    return true;
  } catch (error) {
    console.error("notify-partner-submission: email failed:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json().catch(() => null);
    const name = str(payload?.name);
    const email = str(payload?.email);
    const projectUrl = str(payload?.project_url);
    const note = str(payload?.note);

    if (!name || name.length > LIMITS.name) return json({ error: "Invalid name" }, 400);
    if (!email || email.length > LIMITS.email || !EMAIL_REGEX.test(email)) return json({ error: "Invalid email" }, 400);
    if (!projectUrl || projectUrl.length > LIMITS.projectUrl) return json({ error: "Invalid project link" }, 400);
    if (note.length > LIMITS.note) return json({ error: "Note too long" }, 400);

    const host = hostnameOf(projectUrl);
    if (!host) return json({ error: "Invalid project link" }, 400);

    const received = `${new Date().toISOString().replace("T", " ").replace(/\.\d+Z$/, "")} UTC`;

    // Telegram: plain text, no parse_mode, so user text cannot break formatting.
    const telegramText = [
      `New partner: ${host}`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Project link: ${projectUrl}`,
      `Note: ${note || "(empty)"}`,
      `Received: ${received}`,
    ].join("\n").slice(0, TELEGRAM_MAX_CHARS);

    // Header injection guard: the subject only ever carries a validated hostname.
    const subject = `New partner: ${host}`;
    const emailText = [
      "New partner submission (/bring-your-module)",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Project link: ${projectUrl}`,
      `Note: ${note || "(empty)"}`,
      "",
      `Received: ${received}`,
    ].join("\n");

    const telegram = await sendTelegram(telegramText);
    const emailSent = await sendEmail({ subject, text: emailText, replyTo: email });

    if (!telegram && !emailSent) {
      return json({ error: "Both notification channels failed" }, 500);
    }

    return json({ success: true, telegram, email: emailSent });
  } catch (error: any) {
    console.error("Error in notify-partner-submission function:", error);
    return json({ error: error?.message ?? "Unknown error" }, 500);
  }
};

serve(handler);
