/**
 * Quest Runs API
 * 
 * Functions for logging Side Quest completions and retrieving logbook entries.
 * Uses the existing 'quests' table.
 */

import { supabase } from '@/integrations/supabase/client';
import { advanceMainQuestIfEligible } from './mainQuestApi';
import { buildPlayerStats } from './mainQuest';
import type { CanonicalDomain, MainQuestProgress } from './mainQuest';

export interface QuestRun {
    id: string;
    profile_id: string;
    title: string;
    practice_type: string | null;
    path: string | null;
    duration_minutes: number | null;
    xp_awarded: number;
    completed_at: string;
    intention: string | null;
}

export interface CompleteQuestParams {
    profileId: string;
    practiceId: string;
    practiceTitle: string;
    practiceType?: string;
    domain?: CanonicalDomain;
    durationMin?: number;
    notes?: string;
}

/**
 * Complete a Side Quest: log to quests, award XP, update streak, advance Main Quest
 */
export async function completeSideQuest(params: CompleteQuestParams): Promise<{
    success: boolean;
    xpAwarded: number;
    newStreak: number;
    questRun?: QuestRun;
    error?: string;
}> {
    const { profileId, practiceTitle, practiceType, domain, durationMin, notes } = params;

    try {
        // Calculate XP based on duration
        const baseXp = 10;
        const durationBonus = Math.floor((durationMin || 10) / 10) * 5;
        const xpAwarded = baseXp + durationBonus;

        // 1. Insert quest run using existing 'quests' table
        const { data: questRun, error: insertError } = await supabase
            .from('quests')
            .insert({
                profile_id: profileId,
                title: practiceTitle,
                practice_type: practiceType || null,
                path: domain || null,
                duration_minutes: durationMin || null,
                xp_awarded: xpAwarded,
                intention: notes || null,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting quest run:', insertError);
            return { success: false, xpAwarded: 0, newStreak: 0, error: insertError.message };
        }

        // 2. Get current profile
        const { data: profile, error: profileError } = await supabase
            .from('game_profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (profileError || !profile) {
            console.error('Error fetching profile:', profileError);
            return { success: false, xpAwarded: 0, newStreak: 0, error: 'Profile not found' };
        }

        // 3. Calculate new streak
        const lastPractice = profile.last_practice_at ? new Date(profile.last_practice_at) : null;
        const now = new Date();
        const oneDayMs = 24 * 60 * 60 * 1000;

        let newStreak = profile.current_streak_days || 0;
        if (lastPractice) {
            // Compare calendar dates, not timestamps
            const lastDate = new Date(lastPractice.toDateString());
            const todayDate = new Date(now.toDateString());
            const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / oneDayMs);

            if (daysDiff === 0) {
                // Same day - maintain streak (already counted)
                // Keep newStreak as is
            } else if (daysDiff === 1) {
                // Next day - increment streak
                newStreak += 1;
            } else {
                // More than 1 day gap - reset streak
                newStreak = 1;
            }
        } else {
            // First practice ever
            newStreak = 1;
        }

        // 4. Update profile: XP, streak, practice count
        const xpField = `xp_${domain || 'spirit'}` as keyof typeof profile;
        const { error: updateError } = await supabase
            .from('game_profiles')
            .update({
                xp_total: (profile.xp_total || 0) + xpAwarded,
                [xpField]: ((profile[xpField] as number) || 0) + xpAwarded,
                practice_count: (profile.practice_count || 0) + 1,
                current_streak_days: newStreak,
                longest_streak_days: Math.max(profile.longest_streak_days || 0, newStreak),
                last_practice_at: now.toISOString(),
                level: Math.floor(((profile.xp_total || 0) + xpAwarded) / 100) + 1,
            })
            .eq('id', profileId);

        if (updateError) {
            console.error('Error updating profile:', updateError);
        }

        // 5. Get completed upgrades count for Main Quest advancement
        const { count: upgradesCount } = await supabase
            .from('player_upgrades')
            .select('*', { count: 'exact', head: true })
            .eq('profile_id', profileId);

        // 6. Advance Main Quest if eligible
        const updatedProfile = {
            ...profile,
            practice_count: (profile.practice_count || 0) + 1,
            current_streak_days: newStreak,
            main_quest_progress: profile.main_quest_progress as MainQuestProgress | undefined,
        };

        const playerStats = buildPlayerStats(
            updatedProfile,
            upgradesCount || 0,
            !!profile.last_zog_snapshot_id
        );

        await advanceMainQuestIfEligible(profileId, updatedProfile, playerStats);

        return {
            success: true,
            xpAwarded,
            newStreak,
            questRun: questRun as QuestRun,
        };
    } catch (error: any) {
        console.error('Error completing side quest:', error);
        return { success: false, xpAwarded: 0, newStreak: 0, error: error.message };
    }
}

/**
 * Get recent quest runs for logbook (last N entries)
 */
export async function getRecentQuestRuns(
    profileId: string,
    limit: number = 7
): Promise<QuestRun[]> {
    const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('profile_id', profileId)
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching quest runs:', error);
        return [];
    }

    return (data || []) as QuestRun[];
}

/**
 * Get quest run count for a profile
 */
export async function getQuestRunCount(profileId: string): Promise<number> {
    const { count, error } = await supabase
        .from('quests')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);

    if (error) {
        console.error('Error counting quest runs:', error);
        return 0;
    }

    return count || 0;
}
