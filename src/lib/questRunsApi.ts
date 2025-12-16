/**
 * Quest Runs API
 * 
 * Functions for logging Side Quest completions and retrieving logbook entries.
 */

import { supabase } from '@/integrations/supabase/client';
import { advanceMainQuestIfEligible } from './mainQuestApi';
import { buildPlayerStats, type PlayerStats } from './mainQuest';
import type { CanonicalDomain } from './mainQuest';

export interface QuestRun {
    id: string;
    profile_id: string;
    practice_id: string;
    practice_title: string;
    practice_type: string | null;
    domain: CanonicalDomain | null;
    duration_min: number | null;
    xp_awarded: number;
    completed_at: string;
    notes: string | null;
    created_at: string;
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
 * Complete a Side Quest: log to quest_runs, award XP, update streak, advance Main Quest
 */
export async function completeSideQuest(params: CompleteQuestParams): Promise<{
    success: boolean;
    xpAwarded: number;
    newStreak: number;
    questRun?: QuestRun;
    error?: string;
}> {
    const { profileId, practiceId, practiceTitle, practiceType, domain, durationMin, notes } = params;

    try {
        // Calculate XP based on duration
        const baseXp = 10;
        const durationBonus = Math.floor((durationMin || 10) / 10) * 5;
        const xpAwarded = baseXp + durationBonus;

        // 1. Insert quest run
        const { data: questRun, error: insertError } = await supabase
            .from('quest_runs')
            .insert({
                profile_id: profileId,
                practice_id: practiceId,
                practice_title: practiceTitle,
                practice_type: practiceType,
                domain: domain,
                duration_min: durationMin,
                xp_awarded: xpAwarded,
                notes: notes,
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
            const daysSince = Math.floor((now.getTime() - lastPractice.getTime()) / oneDayMs);
            if (daysSince <= 1) {
                // Continue or maintain streak
                if (daysSince === 1) {
                    newStreak += 1;
                }
            } else {
                // Break streak if more than 1 day
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }

        // 4. Update profile: XP, streak, practice count
        const { error: updateError } = await supabase
            .from('game_profiles')
            .update({
                xp_total: (profile.xp_total || 0) + xpAwarded,
                [`xp_${domain || 'spirit'}`]: ((profile as any)[`xp_${domain || 'spirit'}`] || 0) + xpAwarded,
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
        .from('quest_runs')
        .select('*')
        .eq('profile_id', profileId)
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching quest runs:', error);
        return [];
    }

    return data as QuestRun[];
}

/**
 * Get quest run count for a profile
 */
export async function getQuestRunCount(profileId: string): Promise<number> {
    const { count, error } = await supabase
        .from('quest_runs')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId);

    if (error) {
        console.error('Error counting quest runs:', error);
        return 0;
    }

    return count || 0;
}
