import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * notify-founders-crossread
 * 
 * Sends a personalized email to each founder inviting them to read
 * the other founders' canvases at /founders.
 * 
 * This is the P3 (Shared Field) trigger — dormant since Day 11.
 * When founders read each other's canvases, the tribe recognizes itself.
 * 
 * Called manually by admin (Alexander) when ready to trigger cross-read.
 * 
 * Request body:
 * {
 *   founders: [
 *     { name: "Oyi", email: "oyi@example.com" },
 *     { name: "Sergey", email: "sergey@example.com" },
 *     ...
 *   ]
 * }
 */

interface Founder {
  name: string;
  email: string;
}

interface CrossReadRequest {
  founders: Founder[];
}

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const buildEmail = (founder: Founder, allFounders: Founder[]): string => {
  const otherNames = allFounders
    .filter((f) => f.name !== founder.name)
    .map((f) => escapeHtml(f.name));

  const otherList = otherNames.length > 1
    ? `${otherNames.slice(0, -1).join(", ")} and ${otherNames[otherNames.length - 1]}`
    : otherNames[0] || "the other founders";

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; color: #2c3150; background: #f8f7f4; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; padding: 32px; }
    .header { text-align: center; margin-bottom: 32px; }
    .sigil { font-size: 32px; margin-bottom: 12px; }
    h1 { font-size: 22px; font-weight: 400; margin: 0 0 8px; color: #2c3150; }
    .subtitle { font-size: 13px; color: #2c3150; opacity: 0.4; letter-spacing: 0.15em; text-transform: uppercase; }
    .body-text { font-size: 15px; line-height: 1.7; color: #2c3150; opacity: 0.7; margin-bottom: 20px; }
    .body-text strong { opacity: 1; }
    .cta { display: inline-block; background: #2c3150; color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; font-weight: 600; letter-spacing: 0.05em; margin: 24px 0; }
    .cta:hover { opacity: 0.9; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(44,49,80,0.08); font-size: 12px; color: #2c3150; opacity: 0.3; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="sigil">◉</div>
      <h1>${escapeHtml(founder.name)}, something interesting happened.</h1>
      <p class="subtitle">The Originals</p>
    </div>

    <p class="body-text">
      Since your Ignition Session, ${otherList} also went through the process.
    </p>

    <p class="body-text">
      Each person's canvas — their myth, their uniqueness, their tribe, their promise — is now visible.
      <strong>And each one is completely different from yours.</strong>
    </p>

    <p class="body-text">
      I thought you might want to see them. Not to compare — but because
      something happens when you see how another person's genius was named.
      It makes your own clearer.
    </p>

    <div style="text-align: center;">
      <a href="https://aleksandrkonstantinov.com/founders" class="cta">
        Read the other canvases →
      </a>
    </div>

    <p class="body-text" style="font-style: italic; opacity: 0.5; font-size: 13px;">
      "The myth IS the marketing. The uniqueness IS the business.
      Seeing someone else's proves it."
    </p>

    <div class="footer">
      You're receiving this because you completed an Ignition Session.<br/>
      This is a one-time message. No subscription needed.
    </div>
  </div>
</body>
</html>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { founders }: CrossReadRequest = await req.json();

    if (!founders || !Array.isArray(founders) || founders.length === 0) {
      return new Response(
        JSON.stringify({ error: "No founders provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const results: { name: string; success: boolean; error?: string }[] = [];

    for (const founder of founders) {
      if (!founder.email || !founder.name) {
        results.push({ name: founder.name || "unknown", success: false, error: "Missing email or name" });
        continue;
      }

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Alexander Konstantinov <onboarding@resend.dev>",
            to: [founder.email],
            subject: `${founder.name}, the other canvases are ready`,
            html: buildEmail(founder, founders),
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          results.push({
            name: founder.name,
            success: false,
            error: JSON.stringify(errorData),
          });
        } else {
          results.push({ name: founder.name, success: true });
          console.log(`[CrossRead] Email sent to ${founder.name}`);
        }
      } catch (err: any) {
        results.push({ name: founder.name, success: false, error: err.message });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`[CrossRead] ${successCount}/${founders.length} emails sent`);

    return new Response(
      JSON.stringify({ success: true, results, sent: successCount, total: founders.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("[CrossRead] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
