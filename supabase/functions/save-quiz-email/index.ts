// save-quiz-email
//
// Public (no-auth) endpoint. Logs one "send me the map" email capture from
// the Transition Quiz (settled + itch/tremors not-yet screens) into its own
// dedicated table (quiz_email_signups), separate from transition_quiz_results.
// Fire-and-forget from the client: the quiz UI already shows success
// optimistically, this call never gates or delays what the user sees.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FROM_NOTIFICATIONS } from "../_shared/senders.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SaveQuizEmailPayload {
  email?: string | null;
  stage?: number | null;
  locale?: string | null;
  source?: string | null;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  try {
    const body = (await req.json()) as SaveQuizEmailPayload;

    const email = body.email ? String(body.email).trim().toLowerCase() : "";
    if (!email || !email.includes("@")) {
      return json(400, { error: "invalid_email" });
    }

    if (
      body.stage !== undefined &&
      body.stage !== null &&
      (!Number.isInteger(body.stage) || body.stage < 1 || body.stage > 7)
    ) {
      return json(400, { error: "invalid_stage" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error("save-quiz-email: missing env vars");
      return json(500, { error: "server_misconfigured" });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await admin
      .from("quiz_email_signups")
      .insert({
        email,
        stage: body.stage ?? null,
        locale: body.locale ?? null,
        source: body.source ?? "transition_quiz",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("save-quiz-email: insert failed", error);
      return json(500, { error: "insert_failed", detail: error?.message ?? "no row returned" });
    }

    // Additive: when the capture came from a saved read, email the permalink.
    const source = body.source ?? "transition_quiz";
    if (typeof source === "string" && source.startsWith("save_read:")) {
      const readId = source.slice("save_read:".length).trim();
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const apiKey = Deno.env.get("RESEND_API_KEY");

      // Abuse guard (public no-auth endpoint): the legit "email me my read"
      // flow sends one link to the address the user just typed. Cap outbound
      // sends to the same address to a few per short window so this can't be
      // used to spam an arbitrary recipient. The signup row is still recorded;
      // only the outbound email is throttled. (Fuller fix = double opt-in.)
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { count: recentSends } = await admin
        .from("quiz_email_signups")
        .select("id", { count: "exact", head: true })
        .eq("email", email)
        .like("source", "save_read:%")
        .gte("created_at", tenMinAgo);
      const overLimit = (recentSends ?? 0) > 3;

      if (readId && uuidRe.test(readId) && apiKey && !overLimit) {
        const link = `https://findyourtoptalent.com/quiz/r/${readId}`;
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: FROM_NOTIFICATIONS,
              to: [email],
              subject: "Your read — Where Are You",
              text: `Here is your saved read, yours to keep:\n\n${link}`,
              html: `<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:15px;color:#3a4a5c;line-height:1.6;padding:24px;max-width:520px">
  <p style="margin:0 0 16px">Here is your saved read, yours to keep:</p>
  <p style="margin:0"><a href="${link}" style="color:#041a2f">${link}</a></p>
</div>`,
            }),
          });
          if (!res.ok) {
            console.error(
              "save-quiz-email: resend failed",
              res.status,
              await res.text(),
            );
          }
        } catch (mailErr) {
          console.error("save-quiz-email: resend threw", mailErr);
        }
      } else {
        console.warn("save-quiz-email: skipping send, bad read id or no key");
      }
    }

    return json(200, { ok: true, id: data.id });
  } catch (err) {
    console.error("save-quiz-email: unexpected error", err);
    return json(500, { error: "unexpected_error" });
  }
});
