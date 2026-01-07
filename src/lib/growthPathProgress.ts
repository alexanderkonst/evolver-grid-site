import { supabase } from "@/integrations/supabase/client";

interface UpdateGrowthPathProgressInput {
  profileId: string;
  growthPath: string;
  stepIndex: number;
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
