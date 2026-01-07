import { supabase } from "@/integrations/supabase/client";

interface UpdateGrowthPathProgressInput {
  profileId: string;
  growthPath: string;
  stepIndex: number;
  version: string;
}

interface EnsureGrowthPathProgressInput {
  profileId: string;
  growthPaths: string[];
  version: string;
}

export const updateGrowthPathProgress = async (
  input: UpdateGrowthPathProgressInput
): Promise<{ success: boolean; error?: string }> => {
  const { profileId, growthPath, stepIndex, version } = input;

  try {
    const { error } = await supabase
      .from("vector_progress")
      .upsert(
        {
          profile_id: profileId,
          vector: growthPath,
          step_index: stepIndex,
          version,
        },
        { onConflict: "profile_id,vector,version" }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update growth path progress.",
    };
  }
};

export const ensureGrowthPathProgress = async (
  input: EnsureGrowthPathProgressInput
): Promise<{ success: boolean; error?: string }> => {
  const { profileId, growthPaths, version } = input;

  try {
    const { data, error } = await supabase
      .from("vector_progress")
      .select("vector")
      .eq("profile_id", profileId)
      .eq("version", version);

    if (error) {
      return { success: false, error: error.message };
    }

    const existing = new Set((data || []).map(row => row.vector));
    const missing = growthPaths.filter(path => !existing.has(path));

    if (missing.length === 0) {
      return { success: true };
    }

    const payload = missing.map(path => ({
      profile_id: profileId,
      vector: path,
      step_index: 0,
      version,
    }));

    const { error: insertError } = await supabase.from("vector_progress").insert(payload);
    if (insertError) {
      return { success: false, error: insertError.message };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to ensure growth path progress.",
    };
  }
};
