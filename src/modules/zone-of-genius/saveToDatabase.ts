import { supabase } from "@/integrations/supabase/client";
import { awardXp } from "@/lib/xpSystem";
import { awardFirstTimeBonus } from "@/lib/xpService";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { AppleseedData } from "./appleseedGenerator";
import { ExcaliburData } from "./excaliburGenerator";

// LocalStorage keys for guest data
const GUEST_APPLESEED_KEY = "guest_appleseed_data";
const GUEST_AI_RESPONSE_KEY = "guest_ai_response";
const GUEST_EXCALIBUR_KEY = "guest_excalibur_data";

/**
 * Save Appleseed data to localStorage (for guests before signup)
 */
export const saveAppleseedToLocalStorage = (appleseed: AppleseedData, aiResponse?: string): void => {
  try {
    localStorage.setItem(GUEST_APPLESEED_KEY, JSON.stringify(appleseed));
    if (aiResponse) {
      localStorage.setItem(GUEST_AI_RESPONSE_KEY, aiResponse);
    }
  } catch (e) {
    console.error("Failed to save appleseed to localStorage:", e);
  }
};

/**
 * Load Appleseed data from localStorage (for guests)
 */
export const loadAppleseedFromLocalStorage = (): { appleseed: AppleseedData | null; aiResponse: string | null } => {
  try {
    const appleseedStr = localStorage.getItem(GUEST_APPLESEED_KEY);
    const aiResponse = localStorage.getItem(GUEST_AI_RESPONSE_KEY);
    return {
      appleseed: appleseedStr ? JSON.parse(appleseedStr) : null,
      aiResponse,
    };
  } catch {
    return { appleseed: null, aiResponse: null };
  }
};

/**
 * Save Excalibur data to localStorage (for guests)
 */
export const saveExcaliburToLocalStorage = (excalibur: ExcaliburData): void => {
  try {
    localStorage.setItem(GUEST_EXCALIBUR_KEY, JSON.stringify(excalibur));
  } catch (e) {
    console.error("Failed to save excalibur to localStorage:", e);
  }
};

/**
 * Load Excalibur data from localStorage
 */
export const loadExcaliburFromLocalStorage = (): ExcaliburData | null => {
  try {
    const str = localStorage.getItem(GUEST_EXCALIBUR_KEY);
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

/**
 * Clear all guest data from localStorage (after successful migration)
 */
export const clearGuestData = (): void => {
  localStorage.removeItem(GUEST_APPLESEED_KEY);
  localStorage.removeItem(GUEST_AI_RESPONSE_KEY);
  localStorage.removeItem(GUEST_EXCALIBUR_KEY);
  localStorage.removeItem("inviter_id");
};

/**
 * Migrate guest data from localStorage to database after signup
 * Returns true if migration was successful
 */
export const migrateGuestDataToProfile = async (): Promise<{
  success: boolean;
  migratedAppleseed: boolean;
  migratedExcalibur: boolean;
  error?: string
}> => {
  try {
    const { appleseed, aiResponse } = loadAppleseedFromLocalStorage();
    const excalibur = loadExcaliburFromLocalStorage();

    let migratedAppleseed = false;
    let migratedExcalibur = false;

    if (appleseed) {
      const result = await saveAppleseed(appleseed, aiResponse || undefined);
      if (result.success) {
        migratedAppleseed = true;
      }
    }

    if (excalibur) {
      const result = await saveExcalibur(excalibur);
      if (result.success) {
        migratedExcalibur = true;
      }
    }

    // Clear guest data after successful migration
    if (migratedAppleseed || migratedExcalibur) {
      clearGuestData();
    }

    return { success: true, migratedAppleseed, migratedExcalibur };
  } catch (err) {
    return {
      success: false,
      migratedAppleseed: false,
      migratedExcalibur: false,
      error: err instanceof Error ? err.message : "Migration failed"
    };
  }
};

/**
 * Get the user's game profile ID (supports both authenticated and guest users)
 */
const getProfileId = async (): Promise<string | null> => {
  try {
    const profileId = await getOrCreateGameProfileId();
    console.log("[saveToDatabase] getProfileId result:", profileId ? "found" : "null");
    return profileId;
  } catch (err) {
    console.error("[saveToDatabase] getProfileId error:", err);
    return null;
  }
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
 * For guests: saves to localStorage only
 * For authenticated users: saves to database
 */
export const saveAppleseed = async (
  appleseed: AppleseedData,
  aiResponseRaw?: string
): Promise<{ success: boolean; snapshotId?: string; xpAwarded?: number; firstTimeBonus?: number; error?: string }> => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Guest user - save to localStorage only
      saveAppleseedToLocalStorage(appleseed, aiResponseRaw);
      console.log("[saveToDatabase] Guest save to localStorage successful");
      return { success: true };
    }

    // Authenticated user - save to database
    const profileId = await getProfileId();
    if (!profileId) {
      // Profile not found - fallback to localStorage
      console.warn("[saveToDatabase] Profile not found for authenticated user, falling back to localStorage");
      saveAppleseedToLocalStorage(appleseed, aiResponseRaw);
      return { success: true };
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
    let firstTimeBonus = 0;
    if (!snapshot.xp_awarded) {
      const xpResult = await awardXp(profileId, 100, "uniqueness");
      if (xpResult.success) {
        xpAwarded = 100;
        await supabase.from("zog_snapshots").update({ xp_awarded: true }).eq("id", snapshot.id);
        const bonusResult = await awardFirstTimeBonus(profileId, "first_zog_complete", 100, 2, "uniqueness");
        if (bonusResult.awarded) {
          firstTimeBonus = bonusResult.xp;
        }
      }
    }

    return { success: true, snapshotId: snapshot.id, xpAwarded, firstTimeBonus };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to save Appleseed",
    };
  }
};

/**
 * Save Excalibur data to the user's existing ZoG snapshot
 * Falls back to localStorage if profile not found
 */
export const saveExcalibur = async (
  excalibur: ExcaliburData
): Promise<{ success: boolean; xpAwarded?: number; firstTimeBonus?: number; error?: string }> => {
  try {
    // Check if user is authenticated first
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Guest user - save to localStorage only
      saveExcaliburToLocalStorage(excalibur);
      console.log("[saveToDatabase] Guest Excalibur save to localStorage successful");
      return { success: true };
    }

    const profileId = await getProfileId();
    if (!profileId) {
      // Profile not found - fallback to localStorage
      console.warn("[saveToDatabase] Profile not found for authenticated user, falling back to localStorage for Excalibur");
      saveExcaliburToLocalStorage(excalibur);
      return { success: true };
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
      // No snapshot yet - create one first
      console.log("[saveToDatabase] No snapshot found, creating one for Excalibur save");
      const newSnapshot = await getOrCreateSnapshot(profileId);

      // Update with Excalibur data
      const { error } = await supabase
        .from("zog_snapshots")
        .update({
          excalibur_data: JSON.parse(JSON.stringify(excalibur)),
          excalibur_generated_at: new Date().toISOString(),
        })
        .eq("id", newSnapshot.id);

      if (error) throw error;

      // Update game_profile
      await supabase
        .from("game_profiles")
        .update({
          onboarding_stage: "offer_complete",
          excalibur_data: JSON.parse(JSON.stringify(excalibur)),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      return { success: true, xpAwarded: 0, firstTimeBonus: 0 };
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

    // Update game_profile with onboarding stage
    await supabase
      .from("game_profiles")
      .update({
        onboarding_stage: "offer_complete",
        excalibur_data: JSON.parse(JSON.stringify(excalibur)),
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId);

    let xpAwarded = 0;
    let firstTimeBonus = 0;
    if (!snapshot.excalibur_generated_at) {
      const xpResult = await awardXp(profileId, 200, "uniqueness");
      if (xpResult.success) {
        xpAwarded = 200;
        const bonusResult = await awardFirstTimeBonus(profileId, "first_genius_offer", 200, 2, "uniqueness");
        if (bonusResult.awarded) {
          firstTimeBonus = bonusResult.xp;
        }
      }
    }

    return { success: true, xpAwarded, firstTimeBonus };
  } catch (err) {
    console.error("[saveToDatabase] saveExcalibur error:", err);
    // Fallback to localStorage on any error
    saveExcaliburToLocalStorage(excalibur);
    console.log("[saveToDatabase] Fallback to localStorage after error");
    return { success: true }; // Return success so user doesn't see error
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
    return { appleseed: null, excalibur: null, snapshotId: null };
  }
};
