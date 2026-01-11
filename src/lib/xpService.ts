import { supabase } from "@/integrations/supabase/client";
import { awardXp } from "@/lib/xpSystem";

export type FirstTimeActionKey =
  | "first_zog_complete"
  | "first_qol_complete"
  | "first_event_rsvp"
  | "first_connection"
  | "first_library_view"
  | "first_profile_edit"
  | "first_genius_offer";

const ACTION_LABELS: Record<FirstTimeActionKey, string> = {
  first_zog_complete: "Zone of Genius",
  first_qol_complete: "Quality of Life",
  first_event_rsvp: "Event RSVP",
  first_connection: "Connection",
  first_library_view: "Library visit",
  first_profile_edit: "Profile update",
  first_genius_offer: "Genius Offer",
};

export const getFirstTimeActionLabel = (actionKey: FirstTimeActionKey): string => {
  return ACTION_LABELS[actionKey] ?? actionKey;
};

export const awardFirstTimeBonus = async (
  profileId: string,
  actionKey: FirstTimeActionKey,
  baseXp: number,
  bonusMultiplier = 2,
  path?: string | null
): Promise<{ awarded: boolean; xp: number }> => {
  const { data: profile, error } = await supabase
    .from("game_profiles")
    .select("first_time_actions")
    .eq("id", profileId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load first-time actions:", error);
    return { awarded: false, xp: 0 };
  }

  const firstTimeActions = (profile?.first_time_actions as Record<string, boolean> | null) ?? {};
  if (firstTimeActions[actionKey]) {
    return { awarded: false, xp: 0 };
  }

  const bonusXp = baseXp * bonusMultiplier;
  const xpResult = await awardXp(profileId, bonusXp, path);
  if (!xpResult.success) {
    return { awarded: false, xp: 0 };
  }

  const { error: updateError } = await supabase
    .from("game_profiles")
    .update({
      first_time_actions: { ...firstTimeActions, [actionKey]: true },
      updated_at: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (updateError) {
    console.error("Failed to update first-time actions:", updateError);
  }

  return { awarded: true, xp: bonusXp };
};
