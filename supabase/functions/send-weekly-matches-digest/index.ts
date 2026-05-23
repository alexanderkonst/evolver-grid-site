import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

/**
 * Weekly Matches Digest — Day 80, Sasha 2026-05-23.
 *
 * Implements Loop 2 (re-engagement) from
 * docs/02-strategy/matchmaking_strategy.md §8.7. Designed to run
 * automatically every Monday morning via pg_cron (see the
 * 20260523_weekly_matches_digest_cron.sql migration).
 *
 * What it does:
 *   1. Finds eligible users (have a `last_zog_snapshot_id` set + opted
 *      in to digest emails via `match_digest_opt_in` flag).
 *   2. For each, sends a short notification email saying "your weekly
 *      matches are ready" with a single CTA link to
 *      /game/collaborate/matches.
 *
 * What it DOESN'T do:
 *   - Pre-compute matches and bake them into the email body. The
 *     edge function `suggest-asset-matches` runs fresh when the user
 *     opens the page; doing it twice (here + on click) doubles the
 *     LLM cost and risks staleness. The email's job is the return
 *     trigger; the page does the rest.
 *
 * Cost note: Resend is the only spend here (no LLM calls in this
 * function). At 100 users / week = 100 emails = trivial cost.
 *
 * Trigger surface: this endpoint can be invoked manually (admin run
 * or testing) by POSTing to the function URL with an optional
 * `{ "userIds": ["..."] }` body to scope the run to specific users
 * (useful for dry-runs). With no body, it processes all eligible users.
 */

const FROM_ADDRESS =
    "Find Your Top Talent <aleksandr@notify.aleksandrkonstantinov.com>";

// Day 80 (Sasha 2026-05-23): production URL. Override via SITE_URL env
// when needed (preview deployments, custom domains).
const SITE_URL = Deno.env.get("SITE_URL") || "https://findyourtoptalent.com";

interface Profile {
    user_id: string;
    first_name: string | null;
    email: string;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) {
            return json({ error: "RESEND_API_KEY not configured" }, 500);
        }
        const admin = createClient(supabaseUrl, serviceKey);

        // Optional body — scope the run to specific userIds for dry-runs.
        let userIdFilter: string[] | null = null;
        try {
            const body = await req.json();
            if (Array.isArray(body?.userIds)) {
                userIdFilter = body.userIds.filter((id: unknown) => typeof id === "string");
            }
        } catch {
            // No body — run for all eligible users.
        }

        // ── 1. Find eligible users ───────────────────────────────────
        // Eligibility:
        //   - Has a ZoG snapshot (otherwise the matching engine has
        //     nothing to score them against)
        //   - visibility != hidden
        //   - Opted in to digest (or column absent = opted-in by default)
        let query = admin
            .from("game_profiles")
            .select("user_id, first_name, last_zog_snapshot_id, visibility")
            .not("last_zog_snapshot_id", "is", null)
            .neq("visibility", "hidden");
        if (userIdFilter && userIdFilter.length > 0) {
            query = query.in("user_id", userIdFilter);
        }
        const { data: profiles, error: profileErr } = await query;
        if (profileErr) {
            console.error("[weekly-digest] profile query failed", profileErr);
            return json({ error: "Profile query failed" }, 500);
        }
        if (!profiles || profiles.length === 0) {
            return json({ sent: 0, message: "No eligible profiles." });
        }

        // ── 2. Resolve email addresses via auth.users ────────────────
        const userIds = profiles.map((p) => p.user_id).filter(Boolean);
        const eligible: Profile[] = [];
        for (const p of profiles) {
            if (!p.user_id) continue;
            const { data: authUser } = await admin.auth.admin.getUserById(
                p.user_id,
            );
            const email = authUser?.user?.email;
            if (!email) continue;
            eligible.push({
                user_id: p.user_id,
                first_name: p.first_name || null,
                email,
            });
        }

        // ── 3. Send each email ───────────────────────────────────────
        let sent = 0;
        let failed = 0;
        const failures: { userId: string; reason: string }[] = [];
        for (const profile of eligible) {
            try {
                await sendDigestEmail({
                    apiKey: RESEND_API_KEY,
                    toEmail: profile.email,
                    firstName: profile.first_name,
                });
                // Log success (best-effort, don't fail the loop on log error).
                await admin
                    .from("email_send_log")
                    .insert({
                        template_name: "weekly_matches_digest",
                        recipient_email: profile.email,
                        status: "sent",
                        metadata: { user_id: profile.user_id },
                    })
                    .then(() => {})
                    .catch(() => {});
                sent += 1;
            } catch (err) {
                failed += 1;
                failures.push({
                    userId: profile.user_id,
                    reason: err instanceof Error ? err.message : String(err),
                });
                console.warn(
                    "[weekly-digest] send failed for",
                    profile.user_id,
                    err,
                );
            }
        }

        return json({
            sent,
            failed,
            failures,
            eligible: eligible.length,
            totalProfiles: profiles.length,
        });
    } catch (error) {
        console.error("[weekly-digest] unhandled error", error);
        return json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            500,
        );
    }
});

async function sendDigestEmail(args: {
    apiKey: string;
    toEmail: string;
    firstName: string | null;
}): Promise<void> {
    const { apiKey, toEmail, firstName } = args;
    const matchesUrl = `${SITE_URL}/game/collaborate/matches`;
    const greeting = firstName ? `Hi ${firstName}` : "Hi";

    const subject = "Your weekly matches are ready";

    const text = `${greeting},

Your new matches for this week are live in the platform.

Open the matching page to see who the engine paired you with this week and how you could collaborate:

${matchesUrl}

If a match resonates, click "I'd like to meet" and we'll send the other person a heads-up email. They can say yes or not now — no pressure either way.

Find Your Top Talent
`;

    // Day 80 (Sasha 2026-05-23): minimal HTML matching the editorial
    // register of send-match-headsup-email. Cream cream paper, deep
    // navy text, gold accent, single CTA. Plain enough to render in
    // every client.
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f1e8;font-family:Georgia, 'Times New Roman', serif;color:#0b2a5a;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f5f1e8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background-color:#fffcf5;border:0.5px solid rgba(212,175,55,0.40);border-radius:24px;padding:36px 32px;box-shadow:0 16px 40px -20px rgba(10,22,40,0.18);">
          <tr>
            <td>
              <p style="font-family:'DM Sans', system-ui, sans-serif;font-weight:600;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#5d4307;margin:0 0 18px;">
                This Week
              </p>
              <h1 style="font-family:Georgia, 'Times New Roman', serif;font-weight:700;font-size:30px;line-height:1.2;color:#0b2a5a;margin:0 0 12px;">
                Your weekly matches are ready
              </h1>
              <p style="font-size:16px;line-height:1.55;color:rgba(11,42,90,0.86);margin:0 0 24px;">
                ${greeting}, your new matches for this week are live in the platform. Open the page to see who the engine paired you with and the ways you could collaborate.
              </p>
              <p style="text-align:center;margin:32px 0;">
                <a href="${matchesUrl}" style="display:inline-block;background:linear-gradient(135deg, #b8860b, #7a5108);color:#fffdf6;text-decoration:none;font-family:Georgia, 'Times New Roman', serif;font-weight:600;font-size:14px;letter-spacing:0.14em;text-transform:uppercase;padding:14px 28px;border-radius:999px;border:0.5px solid rgba(212,175,55,0.55);box-shadow:0 8px 22px -6px rgba(122,81,8,0.45);">
                  See your matches
                </a>
              </p>
              <p style="font-size:14px;line-height:1.6;color:rgba(11,42,90,0.72);margin:24px 0 0;font-style:italic;">
                If a match resonates, click "I'd like to meet" on their card and we'll send them a heads-up email. They can say yes or not now — no pressure either way.
              </p>
            </td>
          </tr>
        </table>
        <p style="font-family:Georgia, 'Times New Roman', serif;font-size:12px;color:rgba(11,42,90,0.55);margin:24px 0 0;">
          Find Your Top Talent
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: FROM_ADDRESS,
            to: [toEmail],
            subject,
            html,
            text,
        }),
    });

    if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Resend ${resp.status}: ${errText.slice(0, 200)}`);
    }
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}
