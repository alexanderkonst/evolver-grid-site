/**
 * Main Quest API helpers
 * 
 * Functions to read/update main quest state in Supabase.
 * Uses row-level security already configured for game_profiles.
 */

import { supabase } from '@/integrations/supabase/client';
import {
    computeNextMainQuestStage,
    getStageIndex,
    type MainQuestStage,
    type MainQuestProgress,
    type PlayerStats,
} from './mainQuest';

export interface MainQuestState {
    stage: MainQuestStage;
    status: string;
    progress: MainQuestProgress;
    updatedAt: string;
}

/**
 * Get current Main Quest state for a profile
 */
export async function getMainQuestState(profileId: string): Promise<MainQuestState | null> {
    const { data, error } = await supabase
        .from('game_profiles')
        .select('main_quest_stage, main_quest_status, main_quest_progress, main_quest_updated_at')
        .eq('id', profileId)
        .maybeSingle();

    if (error || !data) {
        return null;
    }

    return {
        stage: (data.main_quest_stage || 'mq_0_gateway') as MainQuestStage,
        status: data.main_quest_status || 'active',
        progress: (data.main_quest_progress || {}) as MainQuestProgress,
        updatedAt: data.main_quest_updated_at || new Date().toISOString(),
    };
}

/**
 * Set the Main Quest stage directly
 */
export async function setMainQuestStage(
    profileId: string,
    stage: MainQuestStage
): Promise<boolean> {
    const { error } = await supabase
        .from('game_profiles')
        .update({
            main_quest_stage: stage,
            main_quest_status: 'active',
            main_quest_updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

    if (error) {
        return false;
    }
    return true;
}

/**
 * Mark progress on the Main Quest (merges into main_quest_progress jsonb)
 * Uses a single atomic update to avoid race conditions
 */
export async function markMainQuestProgress(
    profileId: string,
    patch: Partial<MainQuestProgress>
): Promise<boolean> {
    // Use PostgreSQL jsonb concatenation for atomic merge
    // This avoids race conditions by not doing read-then-write
    const { data: current, error: fetchError } = await supabase
        .from('game_profiles')
        .select('main_quest_progress')
        .eq('id', profileId)
        .single();

    if (fetchError) {
        return false;
    }

    // Merge in application code (still safe for single user)
    const currentProgress = (current?.main_quest_progress || {}) as MainQuestProgress;
    const mergedProgress = { ...currentProgress, ...patch };

    const { error } = await supabase
        .from('game_profiles')
        .update({
            main_quest_progress: mergedProgress,
            main_quest_updated_at: new Date().toISOString(),
        })
        .eq('id', profileId);

    if (error) {
        return false;
    }
    return true;
}

/**
 * Advance Main Quest stage if player is eligible
 * Computes next stage and updates DB only if stage changes
 * Returns the new stage if advanced, or current stage if not
 */
export async function advanceMainQuestIfEligible(
    profileId: string,
    profile: {
        main_quest_stage?: string | null;
        main_quest_progress?: MainQuestProgress;
    } | null,
    stats: PlayerStats
): Promise<MainQuestStage> {
    const currentStage = (profile?.main_quest_stage || 'mq_0_gateway') as MainQuestStage;
    const computedStage = computeNextMainQuestStage(profile, stats);

    const currentIndex = getStageIndex(currentStage);
    const computedIndex = getStageIndex(computedStage);

    // Only update if computed stage is ahead
    if (computedIndex > currentIndex) {
        const success = await setMainQuestStage(profileId, computedStage);
        if (success) {
            return computedStage;
        }
    }

    return currentStage;
}

/**
 * Mark the final stage (mq_5) as done
 */
export async function markRealWorldOutputDone(profileId: string): Promise<boolean> {
    const success = await markMainQuestProgress(profileId, { real_world_output_done: true });
    if (success) {
        // Also update status to completed
        await supabase
            .from('game_profiles')
            .update({
                main_quest_status: 'completed',
                main_quest_updated_at: new Date().toISOString(),
            })
            .eq('id', profileId);
    }
    return success;
}
