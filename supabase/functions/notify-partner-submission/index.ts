import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FROM_NOTIFICATIONS } from "../_shared/senders.ts";

// Instant email to Sasha for every /bring-your-module submission (issue #404).
// Same provider and pattern as send-waitlist-email: Resend, RESEND_API_KEY, FROM_NOTIFICATIONS.
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

    // Header injection guard: the subject only ever carries a validated hostname.
    const subject = `New partner: ${host}`;
    const text = [
      "New partner submission (/bring-your-module)",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Project link: ${projectUrl}`,
      `Note: ${note || "(empty)"}`,
      "",
      `Received: ${new Date().toISOString().replace("T", " ").replace(/\.\d+Z$/, "")} UTC`,
    ].join("\n");

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_NOTIFICATIONS,
        to: [NOTIFY_TO],
        reply_to: email,
        subject,
        text,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json().catch(() => ({}));
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    return json({ success: true });
  } catch (error: any) {
    console.error("Error in notify-partner-submission function:", error);
    return json({ error: error?.message ?? "Unknown error" }, 500);
  }
};

serve(handler);
