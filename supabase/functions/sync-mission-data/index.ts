import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MissionData {
  mission_id: string;
  mission_title: string;
  mission_statement: string;
  outcome_id?: string;
  challenge_id?: string;
  focus_area_id?: string;
  pillar_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { missions } = await req.json() as { missions: MissionData[] };

    if (!missions || !Array.isArray(missions)) {
      return new Response(
        JSON.stringify({ error: "missions array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert all missions
    const { data, error } = await supabase
      .from("mission_search")
      .upsert(
        missions.map(m => ({
          mission_id: m.mission_id,
          mission_title: m.mission_title,
          mission_statement: m.mission_statement,
          outcome_id: m.outcome_id || null,
          challenge_id: m.challenge_id || null,
          focus_area_id: m.focus_area_id || null,
          pillar_id: m.pillar_id || null,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "mission_id" }
      );

    if (error) {
      console.error("Upsert error:", error);
      throw new Error("Failed to sync missions");
    }

    return new Response(
      JSON.stringify({ success: true, count: missions.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("sync-mission-data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
