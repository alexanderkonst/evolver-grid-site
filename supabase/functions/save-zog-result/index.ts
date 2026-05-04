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

    // ── Step 5: Generate magic link + send Email 1 via Resend ─────
    // Day 47 late pass (Sasha): send a Supabase magic-link instead of a
    // token-based /my-result URL. On click the user authenticates and lands
    // in `/game/me` where their fuller Top Talent profile surfaces.
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://findyourtoptalent.com";

    // Generate the magic link (admin-issued, redirects to /game/me on success)
    let magicLink = `${SITE_URL}/auth?next=%2Fgame%2Fme`;
    try {
      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
        options: {
          redirectTo: `${SITE_URL}/auth/callback?next=/game/me`,
        },
      });
      if (linkError) {
        console.error("[save-zog-result] generateLink error:", linkError);
      } else if (linkData?.properties?.action_link) {
        magicLink = linkData.properties.action_link;
      }
    } catch (err) {
      console.error("[save-zog-result] generateLink threw:", err);
      // Fallback URL still works — user types email + gets magic link via /auth
    }

    if (RESEND_API_KEY) {
      const archetypeName = escapeHtml(
        appleseedData.vibrationalKey?.name || "Your Top Talent"
      );
      const bullseye = escapeHtml(
        appleseedData.bullseyeSentence || ""
      );
      const actions = Array.isArray(appleseedData.threeLenses?.actions)
        ? appleseedData.threeLenses.actions.slice(0, 5).map(escapeHtml).join(" · ")
        : "";
      const primeDriver = escapeHtml(appleseedData.threeLenses?.primeDriver || "");
      const archetypeLens = escapeHtml(appleseedData.threeLenses?.archetype || "");

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Day 58+ (Sasha 2026-05-03): only the DISPLAY NAME changed
            // to brand identity. Technical address stays on the
            // already-verified Resend domain to avoid DNS re-verification.
            // The "From" name "Find Your Top Talent" is what Karime
            // (and any recipient) sees in their inbox sender column.
            from: "Find Your Top Talent <aleksandr@notify.aleksandrkonstantinov.com>",
            to: [normalizedEmail],
            subject: `Your Top Talent: ${appleseedData.vibrationalKey?.name || "Saved"}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #0a0a1a; color: #e2e8f0; padding: 40px 32px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 28px;">
                  <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 3px; color: rgba(255,255,255,0.4); margin-bottom: 10px;">Your Top Talent</div>
                  <div style="font-size: 30px; font-weight: 700; background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 14px; line-height: 1.2;">${archetypeName}</div>
                  ${bullseye ? `<div style="font-size: 16px; color: rgba(255,255,255,0.75); font-style: italic; line-height: 1.5;">"I ${bullseye}"</div>` : ""}
                </div>

                ${actions || primeDriver || archetypeLens ? `
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                  ${actions ? `<div style="margin-bottom: 12px;"><div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.35); margin-bottom: 4px;">Top Talents</div><div style="font-size: 14px; color: rgba(255,255,255,0.85);">${actions}</div></div>` : ""}
                  ${primeDriver ? `<div style="margin-bottom: 12px;"><div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.35); margin-bottom: 4px;">Prime Driver</div><div style="font-size: 14px; color: rgba(255,255,255,0.85);">${primeDriver}</div></div>` : ""}
                  ${archetypeLens ? `<div><div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.35); margin-bottom: 4px;">Archetype</div><div style="font-size: 14px; color: rgba(255,255,255,0.85);">${archetypeLens}</div></div>` : ""}
                </div>
                ` : ""}

                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
                  <p style="color: rgba(255,255,255,0.75); font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">There's a fuller layer waiting inside.</p>
                  <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 0 0 18px 0;">Where this pattern shines, trips you up, and the one action that sharpens it over time.</p>
                  <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">Open my full Top Talent profile →</a>
                </div>

                <div style="background: rgba(240,194,127,0.06); border: 1px solid rgba(240,194,127,0.15); border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
                  <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Ready to turn this into a business?</p>
                  <p style="color: rgba(255,255,255,0.55); font-size: 13px; margin: 0 0 14px 0; line-height: 1.6;">Aleksandr runs a 2-hour Productize Yourself Session that compiles your entire unique business onto one page. $555. Money-back guarantee.</p>
                  <a href="${SITE_URL}/ignite#pricing-section" style="display: inline-block; color: rgba(240,194,127,0.9); text-decoration: none; font-size: 13px; font-weight: 600; border-bottom: 1px solid rgba(240,194,127,0.3);">Book your Productize Yourself Session →</a>
                </div>

                <div style="text-align: center; margin-top: 28px;">
                  <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">This is your unique genius. It doesn't expire.</p>
                  <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 6px 0 0 0;">— Aleksandr</p>
                  <p style="color: rgba(255,255,255,0.25); font-size: 11px; margin: 2px 0 0 0;"><a href="${SITE_URL}" style="color: rgba(255,255,255,0.35); text-decoration: none;">FindYourTopTalent.Com</a></p>
                </div>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          console.log("[save-zog-result] Magic-link email sent to:", normalizedEmail);
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

    // ── Step 6: Enqueue Day-1 / Day-2 / Day-8 nurture emails ───────
    // Day 47 late pass (Sasha): scheduled follow-up sequence. A pg_cron
    // job (see 20260422010000_nurture_email_queue.sql) invokes
    // process-nurture-emails every 10 min to dispatch due rows.
    //
    // UNIQUE(profile_id, email_type) index prevents double-enqueue if a
    // user saves twice, re-takes the assessment, etc.
    try {
      // Skip enqueue if the user has opted out previously.
      const { data: optOut } = await supabase
        .from("nurture_opt_outs")
        .select("email")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!optOut) {
        const now = new Date();
        const day1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const day2 = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        const day8 = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

        // Payload snapshot for template rendering at send time
        const payload = {
          archetype: appleseedData.vibrationalKey?.name || "Your Top Talent",
          bullseye: appleseedData.bullseyeSentence || "",
          top_talents: appleseedData.threeLenses?.actions?.slice(0, 5) || [],
          prime_driver: appleseedData.threeLenses?.primeDriver || "",
          archetype_lens: appleseedData.threeLenses?.archetype || "",
        };

        // Regenerate magic link per scheduled send? For now, use the same
        // link we just emailed. Supabase magic links typically expire in 1h;
        // each send regenerates at dispatch time (see process-nurture-emails).
        // Here we just enqueue — the dispatcher generates fresh links.
        await supabase
          .from("nurture_email_queue")
          .upsert(
            [
              { email: normalizedEmail, profile_id: profileId, email_type: "day1", scheduled_for: day1.toISOString(), payload },
              { email: normalizedEmail, profile_id: profileId, email_type: "day2", scheduled_for: day2.toISOString(), payload },
              { email: normalizedEmail, profile_id: profileId, email_type: "day8", scheduled_for: day8.toISOString(), payload },
            ],
            { onConflict: "profile_id,email_type", ignoreDuplicates: false }
          );

        console.log("[save-zog-result] Enqueued 3 nurture emails for:", normalizedEmail);
      } else {
        console.log("[save-zog-result] User previously opted out — skipping nurture enqueue:", normalizedEmail);
      }
    } catch (nurtureErr) {
      console.error("[save-zog-result] Nurture enqueue failed (non-fatal):", nurtureErr);
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
