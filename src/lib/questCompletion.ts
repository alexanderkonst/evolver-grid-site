import { supabase } from "@/integrations/supabase/client";
import { calculateQuestXp, calculateStreak } from "@/lib/xpSystem";

export interface QuestCompletionInput {
  profileId: string;
  title: string;
  practiceType?: string;
  durationMinutes?: number;
}

export interface QuestCompletionResult {
  success: boolean;
  xpAwarded?: number;
  error?: string;
}

export const completeLegacyQuest = async (
  input: QuestCompletionInput
): Promise<QuestCompletionResult> => {
  const { profileId, title, practiceType, durationMinutes } = input;

  try {
    const minutes = durationMinutes ?? 10;
    const xpAwarded = calculateQuestXp(minutes);

    await supabase.from("quests").insert({
      profile_id: profileId,
      title,
      practice_type: practiceType,
      duration_minutes: minutes,
      xp_awarded: xpAwarded,
    });

    const { data: currentProfile } = await supabase
      .from("game_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (currentProfile) {
      const newXpTotal = currentProfile.xp_total + xpAwarded;
      const newLevel = Math.floor(newXpTotal / 100) + 1;
      const streakCalc = calculateStreak(
        currentProfile.last_quest_completed_at,
        currentProfile.current_streak_days
      );

      await supabase
        .from("game_profiles")
        .update({
          total_quests_completed: currentProfile.total_quests_completed + 1,
          last_quest_title: title,
          last_quest_completed_at: new Date().toISOString(),
          xp_total: newXpTotal,
          level: newLevel,
          current_streak_days: streakCalc.newStreak,
          longest_streak_days: Math.max(currentProfile.longest_streak_days, streakCalc.newStreak),
        })
        .eq("id", profileId);
    }

    return { success: true, xpAwarded };
  } catch (error) {
    console.error("Error completing quest:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete quest.",
    };
  }
};
