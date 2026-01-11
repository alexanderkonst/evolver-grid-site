import { supabase } from "@/integrations/supabase/client";
import { awardXp } from "@/lib/xpSystem";
import { AppleseedData } from "./appleseedGenerator";
import { ExcaliburData } from "./excaliburGenerator";

/**
 * Get the user's game profile ID
 */
const getProfileId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("game_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  return profile?.id || null;
};

/**
 * Get or create a ZoG snapshot for the user
 * Returns the snapshot ID
 */
const getOrCreateSnapshot = async (
  profileId: string
): Promise<{ id: string; xp_awarded: boolean | null; excalibur_generated_at: string | null }> => {
  // Check if snapshot exists
  const { data: existing } = await supabase
    .from("zog_snapshots")
    .select("id, xp_awarded, excalibur_generated_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      xp_awarded: existing.xp_awarded,
      excalibur_generated_at: existing.excalibur_generated_at,
    };
  }

  // Create minimal snapshot (will be filled by Appleseed)
  const { data: newSnapshot, error } = await supabase
    .from("zog_snapshots")
    .insert({
      profile_id: profileId,
      archetype_title: "Pending",
      core_pattern: "Pending",
      top_ten_talents: [],
      top_three_talents: [],
      xp_awarded: false,
    })
    .select("id, xp_awarded, excalibur_generated_at")
    .single();

  if (error) throw error;
  return {
    id: newSnapshot.id,
    xp_awarded: newSnapshot.xp_awarded,
    excalibur_generated_at: newSnapshot.excalibur_generated_at,
  };
};

/**
 * Save Appleseed data to the user's ZoG snapshot
 */
export const saveAppleseed = async (
  appleseed: AppleseedData,
  aiResponseRaw?: string
): Promise<{ success: boolean; snapshotId?: string; xpAwarded?: number; error?: string }> => {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return { success: false, error: "User not authenticated or profile not found" };
    }

    const snapshot = await getOrCreateSnapshot(profileId);

    // Update snapshot with Appleseed data
    const { error } = await supabase
      .from("zog_snapshots")
      .update({
        appleseed_data: JSON.parse(JSON.stringify(appleseed)),
        appleseed_generated_at: new Date().toISOString(),
        ai_response_raw: aiResponseRaw || null,
        // Also update archetype from Appleseed
        archetype_title: appleseed.vibrationalKey.name,
        core_pattern: appleseed.bullseyeSentence,
        top_three_talents: appleseed.threeLenses.actions.slice(0, 3),
      })
      .eq("id", snapshot.id);

    if (error) throw error;

    // Update game_profile to point to this snapshot
    await supabase
      .from("game_profiles")
      .update({
        last_zog_snapshot_id: snapshot.id,
        zone_of_genius_completed: true,
        onboarding_stage: "zog_complete",
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    let xpAwarded = 0;
    if (!snapshot.xp_awarded) {
      const xpResult = await awardXp(profileId, 100, "uniqueness");
      if (xpResult.success) {
        xpAwarded = 100;
        await supabase.from("zog_snapshots").update({ xp_awarded: true }).eq("id", snapshot.id);
      }
    }

    return { success: true, snapshotId: snapshot.id, xpAwarded };
  } catch (err) {
    console.error("Error saving Appleseed:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save Appleseed",
    };
  }
};

/**
 * Save Excalibur data to the user's existing ZoG snapshot
 */
export const saveExcalibur = async (
  excalibur: ExcaliburData
): Promise<{ success: boolean; xpAwarded?: number; error?: string }> => {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return { success: false, error: "User not authenticated or profile not found" };
    }

    // Get latest snapshot
    const { data: snapshot } = await supabase
      .from("zog_snapshots")
      .select("id, excalibur_generated_at")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!snapshot) {
      return { success: false, error: "No ZoG snapshot found. Generate Appleseed first." };
    }

    // Update snapshot with Excalibur data
    const { error } = await supabase
      .from("zog_snapshots")
      .update({
        excalibur_data: JSON.parse(JSON.stringify(excalibur)),
        excalibur_generated_at: new Date().toISOString(),
      })
      .eq("id", snapshot.id);

    if (error) throw error;

    let xpAwarded = 0;
    if (!snapshot.excalibur_generated_at) {
      const xpResult = await awardXp(profileId, 200, "uniqueness");
      if (xpResult.success) {
        xpAwarded = 200;
      }
    }

    return { success: true, xpAwarded };
  } catch (err) {
    console.error("Error saving Excalibur:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save Excalibur",
    };
  }
};

/**
 * Load saved Appleseed and Excalibur data for the current user
 */
export const loadSavedData = async (): Promise<{
  appleseed: AppleseedData | null;
  excalibur: ExcaliburData | null;
  snapshotId: string | null;
}> => {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return { appleseed: null, excalibur: null, snapshotId: null };
    }

    const { data: snapshot } = await supabase
      .from("zog_snapshots")
      .select("id, appleseed_data, excalibur_data")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!snapshot) {
      return { appleseed: null, excalibur: null, snapshotId: null };
    }

    return {
      appleseed: snapshot.appleseed_data as unknown as AppleseedData | null,
      excalibur: snapshot.excalibur_data as unknown as ExcaliburData | null,
      snapshotId: snapshot.id,
    };
  } catch (err) {
    console.error("Error loading saved data:", err);
    return { appleseed: null, excalibur: null, snapshotId: null };
  }
};
