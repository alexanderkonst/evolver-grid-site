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

    // ── Step 5: Send access email via Resend ───────────────────────
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://aleksandrkonstantinov.com";

    if (RESEND_API_KEY) {
      const accessLink = `${SITE_URL}/my-result?token=${accessToken}`;
      const archetypeName = escapeHtml(
        appleseedData.vibrationalKey?.name || "Your Genius"
      );
      const bullseye = escapeHtml(
        appleseedData.bullseyeSentence || ""
      );

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Aleksandr <onboarding@resend.dev>",
            to: [normalizedEmail],
            subject: `Your Zone of Genius: ${appleseedData.vibrationalKey?.name || "Saved"}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; background: #0a0a1a; color: #e2e8f0; padding: 40px 32px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 3px; color: rgba(255,255,255,0.4); margin-bottom: 8px;">Your Zone of Genius</div>
                  <div style="font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #a78bfa, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px;">${archetypeName}</div>
                  ${bullseye ? `<div style="font-size: 15px; color: rgba(255,255,255,0.6); font-style: italic;">"I ${bullseye}"</div>` : ""}
                </div>

                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 16px 0;">Your result is saved. Come back to it anytime.</p>
                  <a href="${accessLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; font-size: 15px;">View my result</a>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                  <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">This is your unique genius. It doesn't expire.</p>
                </div>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          console.log("[save-zog-result] Access email sent to:", normalizedEmail);
        } else {
          const errData = await emailResponse.text();
          console.error("[save-zog-result] Resend error:", errData);
          // Don't throw — email failure shouldn't block the save
        }
      } catch (emailErr) {
        console.error("[save-zog-result] Email send failed:", emailErr);
        // Non-blocking — the result is still saved
      }
    } else {
      console.warn("[save-zog-result] RESEND_API_KEY not set, skipping email");
    }

    // ── Step 6: Also save to divine_timing_leads for backwards compat ──
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
