import { supabase } from "@/integrations/supabase/client";
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
const getOrCreateSnapshot = async (profileId: string): Promise<string> => {
  // Check if snapshot exists
  const { data: existing } = await supabase
    .from("zog_snapshots")
    .select("id")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return existing.id;
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
    .select("id")
    .single();

  if (error) throw error;
  return newSnapshot.id;
};

/**
 * Save Appleseed data to the user's ZoG snapshot
 */
export const saveAppleseed = async (
  appleseed: AppleseedData,
  aiResponseRaw?: string
): Promise<{ success: boolean; snapshotId?: string; error?: string }> => {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return { success: false, error: "User not authenticated or profile not found" };
    }

    const snapshotId = await getOrCreateSnapshot(profileId);

    // Update snapshot with Appleseed data
    const { error } = await supabase
      .from("zog_snapshots")
      .update({
        appleseed_data: appleseed as unknown as Record<string, unknown>,
        appleseed_generated_at: new Date().toISOString(),
        ai_response_raw: aiResponseRaw || null,
        // Also update archetype from Appleseed
        archetype_title: appleseed.vibrationalKey.name,
        core_pattern: appleseed.bullseyeSentence,
        top_three_talents: appleseed.threeLenses.actions.slice(0, 3),
      })
      .eq("id", snapshotId);

    if (error) throw error;

    // Update game_profile to point to this snapshot
    await supabase
      .from("game_profiles")
      .update({ last_zog_snapshot_id: snapshotId })
      .eq("id", profileId);

    return { success: true, snapshotId };
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
): Promise<{ success: boolean; error?: string }> => {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return { success: false, error: "User not authenticated or profile not found" };
    }

    // Get latest snapshot
    const { data: snapshot } = await supabase
      .from("zog_snapshots")
      .select("id")
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
        excalibur_data: excalibur as unknown as Record<string, unknown>,
        excalibur_generated_at: new Date().toISOString(),
      })
      .eq("id", snapshot.id);

    if (error) throw error;

    return { success: true };
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
      appleseed: snapshot.appleseed_data as AppleseedData | null,
      excalibur: snapshot.excalibur_data as ExcaliburData | null,
      snapshotId: snapshot.id,
    };
  } catch (err) {
    console.error("Error loading saved data:", err);
    return { appleseed: null, excalibur: null, snapshotId: null };
  }
};
