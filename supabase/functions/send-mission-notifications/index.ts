import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MissionParticipant {
  id: string;
  user_id: string;
  mission_id: string;
  mission_title: string;
  email: string;
  first_name: string | null;
  intro_text: string | null;
  share_consent: boolean;
  email_frequency: string;
  notified_at: string | null;
  created_at: string;
}

interface ZogSnapshot {
  archetype_title: string | null;
  core_pattern: string | null;
  mastery_action: string | null;
}

interface GameProfile {
  first_name: string | null;
  last_zog_snapshot_id: string | null;
  zog_snapshots: ZogSnapshot | null;
}

// Calculate if participant should be notified based on frequency
function shouldNotify(participant: MissionParticipant): boolean {
  if (!participant.share_consent) return false;
  if (!participant.notified_at) return true; // Never notified

  const lastNotified = new Date(participant.notified_at);
  const now = new Date();
  const daysSinceNotified = (now.getTime() - lastNotified.getTime()) / (1000 * 60 * 60 * 24);

  switch (participant.email_frequency) {
    case "daily":
      return daysSinceNotified >= 1;
    case "weekly":
      return daysSinceNotified >= 7;
    case "monthly":
      return daysSinceNotified >= 30;
    default:
      return daysSinceNotified >= 7;
  }
}

// Generate intro text from game profile data
async function generateIntroText(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string
): Promise<string> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get game profile with ZoG snapshot
    const { data: profile } = await supabase
      .from("game_profiles")
      .select(`
        first_name,
        last_zog_snapshot_id,
        zog_snapshots!fk_last_zog_snapshot (
          archetype_title,
          core_pattern,
          mastery_action
        )
      `)
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return "New to the journey — reach out and connect!";
    }

    const typedProfile = profile as unknown as GameProfile;
    const zog = typedProfile.zog_snapshots;
    const parts: string[] = [];

    if (zog?.archetype_title) {
      parts.push(`I'm a "${zog.archetype_title}"`);
    }

    if (zog?.core_pattern) {
      parts.push(zog.core_pattern);
    }

    if (zog?.mastery_action) {
      parts.push(`My focus: ${zog.mastery_action}`);
    }

    if (parts.length > 0) {
      return parts.join(". ") + ".";
    }

    return "New to the journey — reach out and connect!";
  } catch (error) {
    console.error("Error generating intro text:", error);
    return "New to the journey — reach out and connect!";
  }
}

// Build email HTML for new participant notification
function buildEmailHtml(
  newParticipant: MissionParticipant,
  existingParticipants: MissionParticipant[]
): string {
  const participantsList = existingParticipants
    .map((p) => {
      const name = p.first_name || "Anonymous";
      const intro = p.intro_text || "No intro yet";
      return `<li><strong>${name}</strong>: ${intro}</li>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; font-size: 24px; }
        .mission-title { background: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .new-person { background: #ecfdf5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
        .participants { margin-top: 24px; }
        .participants ul { padding-left: 20px; }
        .participants li { margin-bottom: 12px; }
        .footer { margin-top: 32px; font-size: 14px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎯 New Mission Ally!</h1>
        
        <div class="mission-title">
          <strong>Mission:</strong> ${newParticipant.mission_title}
        </div>
        
        <div class="new-person">
          <h3>Meet ${newParticipant.first_name || "a new ally"}!</h3>
          <p>${newParticipant.intro_text || "New to the journey — reach out and connect!"}</p>
          <p><strong>Email:</strong> ${newParticipant.email}</p>
        </div>
        
        ${existingParticipants.length > 0 ? `
          <div class="participants">
            <h3>Your Fellow Mission Allies (${existingParticipants.length}):</h3>
            <ul>${participantsList}</ul>
          </div>
        ` : ""}
        
        <div class="footer">
          <p>You're receiving this because you opted in to mission updates.</p>
          <p>Reply to this email to connect with your allies!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting mission notification job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all participants who need notification
    const { data: allParticipants, error: fetchError } = await supabase
      .from("mission_participants")
      .select("*")
      .eq("share_consent", true)
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Error fetching participants:", fetchError);
      throw fetchError;
    }

    if (!allParticipants || allParticipants.length === 0) {
      console.log("No participants to process");
      return new Response(JSON.stringify({ message: "No participants to process" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typedParticipants = allParticipants as MissionParticipant[];

    // Filter participants who should be notified
    const toNotify = typedParticipants.filter(shouldNotify);
    console.log(`Found ${toNotify.length} participants to notify`);

    // Group by mission
    const byMission: Record<string, MissionParticipant[]> = {};
    for (const p of toNotify) {
      if (!byMission[p.mission_id]) byMission[p.mission_id] = [];
      byMission[p.mission_id].push(p);
    }

    let emailsSent = 0;
    const errors: string[] = [];

    for (const [missionId, newParticipants] of Object.entries(byMission)) {
      // Get all existing participants for this mission
      const existingParticipants = typedParticipants.filter(
        (p) => p.mission_id === missionId && !newParticipants.some((n) => n.id === p.id)
      );

      for (const newParticipant of newParticipants) {
        try {
          // Generate intro text if missing
          if (!newParticipant.intro_text) {
            newParticipant.intro_text = await generateIntroText(
              supabaseUrl, 
              supabaseServiceKey, 
              newParticipant.user_id
            );
            
            // Update the participant record with intro text
            await supabase
              .from("mission_participants")
              .update({ intro_text: newParticipant.intro_text })
              .eq("id", newParticipant.id);
          }

          // Build recipient list: new person + existing participants
          const recipients = [newParticipant.email];
          const ccList = existingParticipants
            .filter((p) => shouldNotify(p))
            .map((p) => p.email);

          const html = buildEmailHtml(newParticipant, existingParticipants);

          console.log(`Sending email to ${newParticipant.email}, CC: ${ccList.length} people`);

          const emailResult = await resend.emails.send({
            from: "Mission Control <onboarding@resend.dev>",
            to: recipients,
            cc: ccList.length > 0 ? ccList : undefined,
            subject: `🎯 New ally joined your mission: ${newParticipant.mission_title}`,
            html,
          });

          if (emailResult.error) {
            console.error("Resend error:", emailResult.error);
            errors.push(`Failed to send to ${newParticipant.email}: ${emailResult.error.message}`);
          } else {
            emailsSent++;
            
            // Mark as notified
            await supabase
              .from("mission_participants")
              .update({ notified_at: new Date().toISOString() })
              .eq("id", newParticipant.id);
          }
        } catch (err) {
          console.error(`Error processing participant ${newParticipant.id}:`, err);
          errors.push(`Error for ${newParticipant.email}: ${String(err)}`);
        }
      }
    }

    console.log(`Job complete. Emails sent: ${emailsSent}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-mission-notifications:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
