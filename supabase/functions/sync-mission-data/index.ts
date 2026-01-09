import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Pillar {
  id: string;
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

interface FocusArea {
  id: string;
  pillarId: string;
  title: string;
  description: string;
}

interface Challenge {
  id: string;
  focusAreaId: string;
  title: string;
  description: string;
}

interface Outcome {
  id: string;
  challengeId: string;
  title: string;
  description: string;
}

interface Mission {
  id: string;
  outcomeId: string;
  title: string;
  statement: string;
  existingProjects?: string[];
}

interface SyncPayload {
  pillars: Pillar[];
  focusAreas: FocusArea[];
  challenges: Challenge[];
  outcomes: Outcome[];
  missions: Mission[];
}

interface ValidationErrors {
  focusAreas: string[];
  challenges: string[];
  outcomes: string[];
  missions: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as SyncPayload;

    if (!payload.pillars || !payload.focusAreas || !payload.challenges || !payload.outcomes || !payload.missions) {
      return new Response(
        JSON.stringify({ error: "All entity arrays required: pillars, focusAreas, challenges, outcomes, missions" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build lookup sets for validation
    const pillarIds = new Set(payload.pillars.map(p => p.id));
    const focusAreaIds = new Set(payload.focusAreas.map(f => f.id));
    const challengeIds = new Set(payload.challenges.map(c => c.id));
    const outcomeIds = new Set(payload.outcomes.map(o => o.id));
    const missionIds = new Set(payload.missions.map(m => m.id));

    // Validate referential integrity
    const errors: ValidationErrors = {
      focusAreas: [],
      challenges: [],
      outcomes: [],
      missions: [],
    };

    for (const fa of payload.focusAreas) {
      if (!pillarIds.has(fa.pillarId)) {
        errors.focusAreas.push(`FocusArea ${fa.id}: pillarId "${fa.pillarId}" not found`);
      }
    }

    for (const c of payload.challenges) {
      if (!focusAreaIds.has(c.focusAreaId)) {
        errors.challenges.push(`Challenge ${c.id}: focusAreaId "${c.focusAreaId}" not found`);
      }
    }

    for (const o of payload.outcomes) {
      if (!challengeIds.has(o.challengeId)) {
        errors.outcomes.push(`Outcome ${o.id}: challengeId "${o.challengeId}" not found`);
      }
    }

    for (const m of payload.missions) {
      if (!outcomeIds.has(m.outcomeId)) {
        errors.missions.push(`Mission ${m.id}: outcomeId "${m.outcomeId}" not found`);
      }
    }

    const totalErrors = errors.focusAreas.length + errors.challenges.length + errors.outcomes.length + errors.missions.length;
    if (totalErrors > 0) {
      console.error("Validation errors:", errors);
      return new Response(
        JSON.stringify({ error: "Referential integrity validation failed", errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Validation passed. Starting sync...");

    // Helper to derive parent IDs from mission outcomeId
    const deriveParentIds = (outcomeId: string) => {
      // outcomeId format: <pillar>-focus-area-XX-challenge-XX-outcome-XX
      const parts = outcomeId.split("-outcome-")[0]; // Get everything before -outcome-
      const challengeId = parts; // <pillar>-focus-area-XX-challenge-XX
      const focusAreaParts = challengeId.split("-challenge-")[0]; // <pillar>-focus-area-XX
      const focusAreaId = focusAreaParts;
      // Extract pillar from the beginning
      const pillarMatch = focusAreaId.match(/^([a-z]+)-focus-area-/);
      const pillarId = pillarMatch ? pillarMatch[1] : null;
      
      return {
        pillarId,
        focusAreaId,
        challengeId: parts,
      };
    };

    // Step 1: Delete all existing data in reverse order (missions first, pillars last)
    console.log("Deleting existing mission_search...");
    const { error: deleteMissionsError } = await supabase.from("mission_search").delete().neq("mission_id", "");
    if (deleteMissionsError) {
      console.error("Delete missions error:", deleteMissionsError);
      throw new Error(`Failed to delete missions: ${deleteMissionsError.message}`);
    }

    console.log("Deleting existing mission_outcomes...");
    const { error: deleteOutcomesError } = await supabase.from("mission_outcomes").delete().neq("id", "");
    if (deleteOutcomesError) {
      console.error("Delete outcomes error:", deleteOutcomesError);
      throw new Error(`Failed to delete outcomes: ${deleteOutcomesError.message}`);
    }

    console.log("Deleting existing mission_challenges...");
    const { error: deleteChallengesError } = await supabase.from("mission_challenges").delete().neq("id", "");
    if (deleteChallengesError) {
      console.error("Delete challenges error:", deleteChallengesError);
      throw new Error(`Failed to delete challenges: ${deleteChallengesError.message}`);
    }

    console.log("Deleting existing mission_focus_areas...");
    const { error: deleteFocusAreasError } = await supabase.from("mission_focus_areas").delete().neq("id", "");
    if (deleteFocusAreasError) {
      console.error("Delete focus areas error:", deleteFocusAreasError);
      throw new Error(`Failed to delete focus areas: ${deleteFocusAreasError.message}`);
    }

    console.log("Deleting existing mission_pillars...");
    const { error: deletePillarsError } = await supabase.from("mission_pillars").delete().neq("id", "");
    if (deletePillarsError) {
      console.error("Delete pillars error:", deletePillarsError);
      throw new Error(`Failed to delete pillars: ${deletePillarsError.message}`);
    }

    // Step 2: Insert pillars
    console.log(`Inserting ${payload.pillars.length} pillars...`);
    const { error: pillarsError } = await supabase.from("mission_pillars").insert(
      payload.pillars.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        icon: p.icon || null,
        color: p.color || null,
        updated_at: new Date().toISOString(),
      }))
    );
    if (pillarsError) {
      console.error("Insert pillars error:", pillarsError);
      throw new Error(`Failed to insert pillars: ${pillarsError.message}`);
    }

    // Step 3: Insert focus areas
    console.log(`Inserting ${payload.focusAreas.length} focus areas...`);
    const { error: focusAreasError } = await supabase.from("mission_focus_areas").insert(
      payload.focusAreas.map(f => ({
        id: f.id,
        pillar_id: f.pillarId,
        title: f.title,
        description: f.description,
        updated_at: new Date().toISOString(),
      }))
    );
    if (focusAreasError) {
      console.error("Insert focus areas error:", focusAreasError);
      throw new Error(`Failed to insert focus areas: ${focusAreasError.message}`);
    }

    // Step 4: Insert challenges in batches
    console.log(`Inserting ${payload.challenges.length} challenges...`);
    const challengeBatchSize = 500;
    for (let i = 0; i < payload.challenges.length; i += challengeBatchSize) {
      const batch = payload.challenges.slice(i, i + challengeBatchSize);
      const { error: challengesError } = await supabase.from("mission_challenges").insert(
        batch.map(c => ({
          id: c.id,
          focus_area_id: c.focusAreaId,
          title: c.title,
          description: c.description,
          updated_at: new Date().toISOString(),
        }))
      );
      if (challengesError) {
        console.error(`Insert challenges batch ${i} error:`, challengesError);
        throw new Error(`Failed to insert challenges batch: ${challengesError.message}`);
      }
    }

    // Step 5: Insert outcomes in batches
    console.log(`Inserting ${payload.outcomes.length} outcomes...`);
    const outcomeBatchSize = 500;
    for (let i = 0; i < payload.outcomes.length; i += outcomeBatchSize) {
      const batch = payload.outcomes.slice(i, i + outcomeBatchSize);
      const { error: outcomesError } = await supabase.from("mission_outcomes").insert(
        batch.map(o => ({
          id: o.id,
          challenge_id: o.challengeId,
          title: o.title,
          description: o.description,
          updated_at: new Date().toISOString(),
        }))
      );
      if (outcomesError) {
        console.error(`Insert outcomes batch ${i} error:`, outcomesError);
        throw new Error(`Failed to insert outcomes batch: ${outcomesError.message}`);
      }
    }

    // Step 6: Insert missions in batches
    console.log(`Inserting ${payload.missions.length} missions...`);
    const missionBatchSize = 500;
    for (let i = 0; i < payload.missions.length; i += missionBatchSize) {
      const batch = payload.missions.slice(i, i + missionBatchSize);
      const { error: missionsError } = await supabase.from("mission_search").insert(
        batch.map(m => {
          const parents = deriveParentIds(m.outcomeId);
          return {
            mission_id: m.id,
            mission_title: m.title,
            mission_statement: m.statement,
            outcome_id: m.outcomeId,
            challenge_id: parents.challengeId,
            focus_area_id: parents.focusAreaId,
            pillar_id: parents.pillarId,
            existing_projects: m.existingProjects || [],
            updated_at: new Date().toISOString(),
          };
        })
      );
      if (missionsError) {
        console.error(`Insert missions batch ${i} error:`, missionsError);
        throw new Error(`Failed to insert missions batch: ${missionsError.message}`);
      }
    }

    // Count by pillar
    const countsByPillar: Record<string, number> = {};
    for (const m of payload.missions) {
      const parents = deriveParentIds(m.outcomeId);
      const pillar = parents.pillarId || "unknown";
      countsByPillar[pillar] = (countsByPillar[pillar] || 0) + 1;
    }

    const result = {
      success: true,
      counts: {
        pillars: payload.pillars.length,
        focusAreas: payload.focusAreas.length,
        challenges: payload.challenges.length,
        outcomes: payload.outcomes.length,
        missions: payload.missions.length,
      },
      missionsByPillar: countsByPillar,
    };

    console.log("Sync completed successfully:", result);

    return new Response(
      JSON.stringify(result),
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
