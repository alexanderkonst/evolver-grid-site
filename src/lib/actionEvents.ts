import { supabase } from "@/integrations/supabase/client";
import { type ActionDuration } from "@/types/actions";

export interface LogActionEventInput {
  actionId: string;
  profileId: string;
  source?: string;
  loop?: string;
  growthPath?: string;
  qolDomain?: string;
  duration?: ActionDuration;
  mode?: string;
  selectedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
}

const durationBucketToMinutes = (duration?: ActionDuration) => {
  switch (duration) {
    case "xs":
      return 3;
    case "sm":
      return 10;
    case "md":
      return 20;
    case "lg":
      return 45;
    default:
      return undefined;
  }
};

export const logActionEvent = async (
  input: LogActionEventInput
): Promise<{ success: boolean; error?: string }> => {
  const {
    actionId,
    profileId,
    source,
    loop,
    growthPath,
    qolDomain,
    duration,
    mode,
    selectedAt,
    completedAt,
    metadata,
  } = input;

  try {
    const payload = {
      action_id: actionId,
      profile_id: profileId,
      source,
      vector: growthPath,
      qol_domain: qolDomain,
      selected_at: selectedAt,
      completed_at: completedAt,
      duration: durationBucketToMinutes(duration),
      mode,
      metadata: {
        loop,
        ...(metadata || {}),
      },
    };

  const { error } = await supabase.from("action_events").insert(payload);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to log action event.",
    };
  }
};
