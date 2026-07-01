import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (unsafe: string): string =>
  unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, appleseedData, source } = await req.json();

    // ── Validate ────────────────────────────────────────────────────
    if (!email || !EMAIL_REGEX.test(email) || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!appleseedData) {
      return new Response(
        JSON.stringify({ error: "Missing appleseed data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── Init Supabase Admin ────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedEmail = email.trim().toLowerCase();

    // ── Step 1: Create or find auth user ───────────────────────────
    let userId: string;

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      userId = existingUser.id;
      console.log("[save-zog-result] Existing user found:", userId);
    } else {
      // Create new user silently — random password, no confirmation email
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: normalizedEmail,
          password: randomPassword,
          email_confirm: true, // Skip email confirmation
          user_metadata: { source: source || "zog_save" },
        });

      if (createError) {
        console.error("[save-zog-result] Create user error:", createError);
        throw new Error(`Failed to create user: ${createError.message}`);
      }

      userId = newUser.user.id;
      console.log("[save-zog-result] New user created:", userId);
    }

    // ── Step 2: Create or find game profile ────────────────────────
    let profileId: string;
    let accessToken: string;

    const { data: existingProfile } = await supabase
      .from("game_profiles")
      .select("id, access_token")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProfile) {
      profileId = existingProfile.id;
      accessToken = existingProfile.access_token;
      console.log("[save-zog-result] Existing profile found:", profileId);

      // Update email if not set
      await supabase
        .from("game_profiles")
        .update({ email: normalizedEmail, updated_at: new Date().toISOString() })
        .eq("id", profileId);
    } else {
      // Create new profile
      const { data: newProfile, error: profileError } = await supabase
        .from("game_profiles")
        .insert({
          user_id: userId,
          email: normalizedEmail,
          onboarding_stage: "zog_complete",
          zone_of_genius_completed: true,
        })
        .select("id, access_token")
        .single();

      if (profileError) {
        console.error("[save-zog-result] Profile error:", profileError);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }

      profileId = newProfile.id;
      accessToken = newProfile.access_token;
      console.log("[save-zog-result] New profile created:", profileId);
    }

    // ── Step 3: Save ZoG snapshot ──────────────────────────────────
    const { data: existingSnapshot } = await supabase
      .from("zog_snapshots")
      .select("id")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let snapshotId: string;

    if (existingSnapshot) {
      // Update existing snapshot
      const { error: updateError } = await supabase
        .from("zog_snapshots")
        .update({
          appleseed_data: appleseedData,
          appleseed_generated_at: new Date().toISOString(),
          archetype_title: appleseedData.vibrationalKey?.name || "Unknown",
          core_pattern: appleseedData.bullseyeSentence || "Unknown",
          top_three_talents: appleseedData.threeLenses?.actions?.slice(0, 3) || [],
        })
        .eq("id", existingSnapshot.id);

      if (updateError) throw updateError;
      snapshotId = existingSnapshot.id;
      console.log("[save-zog-result] Updated existing snapshot:", snapshotId);
    } else {
      // Create new snapshot
      const { data: newSnapshot, error: snapshotError } = await supabase
        .from("zog_snapshots")
        .insert({
          profile_id: profileId,
          appleseed_data: appleseedData,
          appleseed_generated_at: new Date().toISOString(),
          archetype_title: appleseedData.vibrationalKey?.name || "Unknown",
          core_pattern: appleseedData.bullseyeSentence || "Unknown",
          top_three_talents: appleseedData.threeLenses?.actions?.slice(0, 3) || [],
          top_ten_talents: appleseedData.threeLenses?.actions || [],
          xp_awarded: false,
        })
        .select("id")
        .single();

      if (snapshotError) {
        console.error("[save-zog-result] Snapshot error:", snapshotError);
        throw new Error(`Failed to save snapshot: ${snapshotError.message}`);
      }

      snapshotId = newSnapshot.id;
      console.log("[save-zog-result] New snapshot created:", snapshotId);
    }

    // ── Step 4: Link profile to snapshot ───────────────────────────
    await supabase
      .from("game_profiles")
      .update({
        last_zog_snapshot_id: snapshotId,
        zone_of_genius_completed: true,
        onboarding_stage: "zog_complete",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    // ── Step 5: Send the deposit-slip email via Resend ─────────────
    //
    // Day 61 (Sasha 2026-05-04 15:00): two architectural changes from
    // the Day 47 pattern.
    //
    // (1) URL is now a token URL pointing back at the LIVE reveal page,
    //     NOT a Supabase magic link. The reveal page (`ZoneOfGeniusEntry`)
    //     accepts `?result=<access_token>` and renders the same component
    //     as the live funnel — no auth, no session, no platform door, no
    //     duplicated render path. The token IS the access. Funnel
    //     monogamy: every entry point lands on the SAME reveal artifact.
    //     `auth.admin.generateLink` removed entirely — this email is a
    //     deposit slip back to the website, not a sign-in flow.
    //
    // (2) Email body STRIPPED of result content (no archetype, no
    //     bullseye, no top-talents, no prime-driver, no archetype-lens).
    //     If we put the result IN the email, we hand the user an
    //     off-platform alternative that competes with the website
    //     visit. Email is now a deposit slip: "your result is saved,
    //     open it on the website." The persuasive surface (offer cards,
    //     resonance check, top shadow, dodecahedron) lives ONLY at the
    //     reveal — that's where the booking decision happens.
    //
    // Reference: `docs/02-strategy/unique-businesses/alexanders_unique_business.md`
    // → "Lived User Journey — Reveal-Anchored Funnel" (Day 1 step 10–13).
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://findyourtoptalent.com";

    // Token URL — the access_token is already on the user's game_profile
    // (set by the trigger that creates the row). One link, no expiry, no
    // session creation. UTM tags so we can attribute returning traffic.
    const resultUrl = `${SITE_URL}/zone-of-genius?result=${encodeURIComponent(accessToken)}&utm_source=email&utm_medium=deposit_slip&utm_campaign=top_talent_save`;
    const savedResultEmailHtml = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <style>
      :root { color-scheme: light only; supported-color-schemes: light only; }
      body, table, td, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table { border-collapse: collapse; }
      @media screen and (max-width: 600px) {
        .container { width: 100% !important; }
        .content { padding: 28px 22px !important; }
        .headline { font-size: 26px !important; line-height: 1.18 !important; }
        .body-copy { font-size: 16px !important; line-height: 1.6 !important; }
        .button-link { display: block !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#f7f1e6;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f7f1e6" style="width:100%; background-color:#f7f1e6; margin:0; padding:0;">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" bgcolor="#fffaf0" style="width:560px; max-width:560px; background-color:#fffaf0; border:1px solid #eadfca; border-radius:12px;">
            <tr>
              <td class="content" style="padding:38px 34px; font-family:Arial, Helvetica, sans-serif; color:#111827;">
                <p class="headline" style="font-family:Arial, Helvetica, sans-serif; font-size:30px; line-height:1.18; color:#111827; font-weight:700; margin:0 0 24px 0;">Your Top Talent is saved</p>
                <p class="body-copy" style="font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.65; color:#111827; margin:0 0 16px 0;">Your Top Talent profile is ready.</p>
                <p class="body-copy" style="font-family:Arial, Helvetica, sans-serif; font-size:16px; line-height:1.65; color:#111827; margin:0 0 16px 0;">We saved it so it does not disappear.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 22px 0;">
                  <tr>
                    <td bgcolor="#111827" style="border-radius:999px; background-color:#111827;">
                      <a class="button-link" href="${resultUrl}" style="display:inline-block; padding:14px 22px; border-radius:999px; border:1px solid #111827; background-color:#111827; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.2; font-weight:700; text-decoration:none;">Open my saved result</a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:34px; border-top:1px solid #e4d7bd;">
                  <tr>
                    <td style="padding-top:18px; font-family:Arial, Helvetica, sans-serif;">
                      <a href="${SITE_URL}" style="color:#6b7280; font-size:13px; line-height:1.5; text-decoration:none;">Find Your Top Talent</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    `;

    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Find Your Top Talent <notifications@notify.findyourtoptalent.com>",
            to: [normalizedEmail],
            // Subject is intentionally generic — no archetype name, no
            // teaser. Preserves the curiosity hook so the return click
            // is the moment of recognition, not the inbox preview.
            subject: "Your Top Talent — saved",
            html: savedResultEmailHtml,
          }),
        });

        if (emailResponse.ok) {
          console.log("[save-zog-result] Deposit-slip email sent to:", normalizedEmail);
        } else {
          const errData = await emailResponse.text();
          console.error("[save-zog-result] Resend error:", errData);
        }
      } catch (emailErr) {
        console.error("[save-zog-result] Email send failed:", emailErr);
      }
    } else {
      console.warn("[save-zog-result] RESEND_API_KEY not set, skipping email");
    }

    // ── Step 6: Enqueue Day-1 / Day-2 nurture emails ───────────────
    // Day 47 late pass (Sasha): scheduled follow-up sequence. A pg_cron
    // job (see 20260422010000_nurture_email_queue.sql) invokes
    // process-nurture-emails every 10 min to dispatch due rows.
    //
    // UNIQUE(profile_id, email_type) index prevents double-enqueue if a
    // user saves twice, re-takes the assessment, etc.
    //
    // Day 61 (Sasha 2026-05-04 14:30): KILLED. Sasha is reconsidering
    // the consent / GDPR / spam-risk tradeoffs of the unsolicited
    // Day-1/2 sequence. Until he's settled on the right policy
    // ("don't want to spam anybody"), no new rows get enqueued from
    // this signup path. The block below stays in code (preserves
    // template + payload shape for future revival) but is gated by
    // this single constant. Flip to `false` to revive.
    // PAIRED with a matching kill in process-nurture-emails so any
    // already-queued rows from prior signups also stop dispatching.
    const NURTURE_EMAILS_KILLED = false;
    if (NURTURE_EMAILS_KILLED) {
      console.log(
        "[save-zog-result] Nurture-email enqueue is DISABLED (NURTURE_EMAILS_KILLED=true). Skipping Day-1/2 schedule for:",
        normalizedEmail,
      );
    } else {
     try {
      // Skip enqueue if the user has opted out previously.
      const { data: optOut } = await supabase
        .from("nurture_opt_outs")
        .select("email")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!optOut) {
        const { data: existingNurtureRows } = await supabase
          .from("nurture_email_queue")
          .select("email_type, status")
          .eq("email", normalizedEmail)
          .in("email_type", ["day1", "day2"]);
        const sentTypes = new Set(
          (existingNurtureRows ?? [])
            .filter((row) => row.status === "sent")
            .map((row) => row.email_type as string),
        );

        const now = new Date();
        const day1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const day2 = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // Payload snapshot for template rendering at send time
        const payload = {
          archetype: appleseedData.vibrationalKey?.name || "Your Top Talent",
          bullseye: appleseedData.bullseyeSentence || "",
          top_talents: appleseedData.threeLenses?.actions?.slice(0, 5) || [],
          prime_driver: appleseedData.threeLenses?.primeDriver || "",
          archetype_lens: appleseedData.threeLenses?.archetype || "",
          claim_state: "claimed",
          intent: "journey",
        };
        const rowsToUpsert: Record<string, unknown>[] = [];
        if (!sentTypes.has("day1")) {
          rowsToUpsert.push({ email: normalizedEmail, profile_id: profileId, email_type: "day1", scheduled_for: day1.toISOString(), payload });
        }
        if (!sentTypes.has("day2")) {
          rowsToUpsert.push({ email: normalizedEmail, profile_id: profileId, email_type: "day2", scheduled_for: day2.toISOString(), payload });
        }

        // Regenerate magic link per scheduled send? For now, use the same
        // link we just emailed. Supabase magic links typically expire in 1h;
        // each send regenerates at dispatch time (see process-nurture-emails).
        // Here we just enqueue — the dispatcher generates fresh links.
        if (rowsToUpsert.length > 0) {
          await supabase
            .from("nurture_email_queue")
            .upsert(rowsToUpsert, { onConflict: "profile_id,email_type", ignoreDuplicates: false });
        }

        console.log("[save-zog-result] Enqueued nurture emails for:", normalizedEmail);
      } else {
        console.log("[save-zog-result] User previously opted out — skipping nurture enqueue:", normalizedEmail);
      }
     } catch (nurtureErr) {
      console.error("[save-zog-result] Nurture enqueue failed (non-fatal):", nurtureErr);
     }
    }

    // ── Step 7: Also save to divine_timing_leads for backwards compat ──
    try {
      await supabase.from("divine_timing_leads").insert({
        email: normalizedEmail,
        source: source || "zog_save",
        created_at: new Date().toISOString(),
      });
    } catch {
      // Silently continue — this is just for backwards compatibility
    }

    // ── Done ────────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        profileId,
        accessToken,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[save-zog-result] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
