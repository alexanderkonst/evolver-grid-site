import { supabase } from "@/integrations/supabase/client";

/**
 * Calculate level from total XP
 * Formula: level = floor(xp_total / 100) + 1
 */
export function calculateLevel(xpTotal: number): number {
  return Math.floor(xpTotal / 100) + 1;
}

/**
 * Calculate XP for next level
 */
export function getXpForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  return currentLevel * 100;
}

/**
 * Calculate XP progress to next level (0-100)
 */
export function getXpProgress(currentXp: number): number {
  return currentXp % 100;
}

/**
 * Determine XP award for a quest based on duration
 */
export function calculateQuestXp(durationMinutes: number): number {
  if (durationMinutes <= 10) return 10;
  if (durationMinutes <= 25) return 15;
  return 20;
}

/**
 * Award XP to a profile and recalculate level
 */
export async function awardXp(
  profileId: string,
  xpAmount: number,
  path?: string | null
): Promise<{ success: boolean; newXp: number; newLevel: number; error?: any }> {
  try {
    // Fetch current profile
    const { data: profile, error: fetchError } = await supabase
      .from('game_profiles')
      .select('xp_total, xp_body, xp_mind, xp_emotions, xp_spirit, xp_uniqueness')
      .eq('id', profileId)
      .single();

    if (fetchError) throw fetchError;

    const newXpTotal = profile.xp_total + xpAmount;
    const newLevel = calculateLevel(newXpTotal);

    // Prepare update object
    const updates: any = {
      xp_total: newXpTotal,
      level: newLevel,
      updated_at: new Date().toISOString(),
    };

    // Add path-specific XP if path is provided
    if (path) {
      const pathXpMap: Record<string, string> = {
        'body': 'xp_body',
        'mind': 'xp_mind',
        'emotions': 'xp_emotions',
        'spirit': 'xp_spirit',
        'uniqueness': 'xp_uniqueness',
      };

      const pathKey = pathXpMap[path];
      if (pathKey && pathKey in profile) {
        updates[pathKey] = profile[pathKey as keyof typeof profile] + xpAmount;
      }
    }

    const { error: updateError } = await supabase
      .from('game_profiles')
      .update(updates)
      .eq('id', profileId);

    if (updateError) throw updateError;

    return { success: true, newXp: newXpTotal, newLevel };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { success: false, newXp: 0, newLevel: 1, error };
  }
}

/**
 * Calculate and update streak based on last completion date
 */
export function calculateStreak(
  lastCompletedAt: string | null,
  currentStreak: number
): { newStreak: number; isConsecutive: boolean } {
  if (!lastCompletedAt) {
    return { newStreak: 1, isConsecutive: false };
  }

  const now = new Date();
  const last = new Date(lastCompletedAt);

  // Get dates at midnight in local timezone
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());

  const diffMs = nowDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day - keep streak
    return { newStreak: currentStreak, isConsecutive: true };
  } else if (diffDays === 1) {
    // Yesterday - increment streak
    return { newStreak: currentStreak + 1, isConsecutive: true };
  } else {
    // Broken streak - restart
    return { newStreak: 1, isConsecutive: false };
  }
}
