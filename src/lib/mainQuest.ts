/**
 * Main Quest (Storyline) System v0
 * 
 * Implements a linear progression through the core game experience.
 * Each stage represents a major milestone in the player's journey.
 * 
 * Stages:
 * - mq_0_gateway — Finish setup / get into the game
 * - mq_1_profile_clarity — Generate/confirm Genius Profile snapshot
 * - mq_2_first_side_quest — Complete 1 Side Quest (practice)
 * - mq_3_first_upgrade — Complete 1 Upgrade (skill tree node)
 * - mq_4_three_day_rhythm — Reach streak >= 3
 * - mq_5_real_world_output — Produce 1 real-world artifact (post/pitch/demo)
 */

// Canonical domain types
export type CanonicalDomain = 'spirit' | 'mind' | 'uniqueness' | 'emotions' | 'body';

export type MainQuestStage =
    | 'mq_0_gateway'
    | 'mq_1_profile_clarity'
    | 'mq_2_first_side_quest'
    | 'mq_3_first_upgrade'
    | 'mq_4_three_day_rhythm'
    | 'mq_5_real_world_output';

export type MainQuestStatus = 'active' | 'completed' | 'skipped';

export interface MainQuestCopy {
    stage: MainQuestStage;
    title: string;
    objective: string;
    ctaLabel: string;
    completionHint: string;
    domain: CanonicalDomain;
    ctaRoute?: string;
}

export interface PlayerStats {
    hasProfile: boolean;
    hasGeniusProfileSnapshot: boolean;
    sideQuestCompletionsCount: number;
    upgradeCompletionsCount: number;
    streakDays: number;
    realWorldOutputDone: boolean;
}

export interface MainQuestProgress {
    real_world_output_done?: boolean;
    [key: string]: any;
}

/**
 * Ordered list of all Main Quest stages
 */
export const MAIN_QUEST_STAGES: MainQuestStage[] = [
    'mq_0_gateway',
    'mq_1_profile_clarity',
    'mq_2_first_side_quest',
    'mq_3_first_upgrade',
    'mq_4_three_day_rhythm',
    'mq_5_real_world_output',
];

/**
 * Main Quest copy and metadata for each stage
 */
const MAIN_QUEST_COPY: Record<MainQuestStage, Omit<MainQuestCopy, 'stage'>> = {
    mq_0_gateway: {
        title: 'Enter the Game',
        objective: 'Complete setup and enter the Game of You.',
        ctaLabel: 'Start Journey',
        completionHint: 'Create your player profile',
        domain: 'spirit',
        ctaRoute: '/zone-of-genius',
    },
    mq_1_profile_clarity: {
        title: 'Clarify Your Genius',
        objective: 'Generate your Zone of Genius profile snapshot.',
        ctaLabel: 'Discover Genius',
        completionHint: 'Complete Zone of Genius assessment',
        domain: 'uniqueness',
        ctaRoute: '/zone-of-genius',
    },
    mq_2_first_side_quest: {
        title: 'First Side Quest',
        objective: 'Complete your first practice from the library.',
        ctaLabel: 'Find Practice',
        completionHint: 'Complete any practice',
        domain: 'body',
        ctaRoute: '/library',
    },
    mq_3_first_upgrade: {
        title: 'First Upgrade',
        objective: 'Unlock your first skill tree upgrade.',
        ctaLabel: 'View Upgrades',
        completionHint: 'Complete one upgrade',
        domain: 'mind',
        ctaRoute: '/skills',
    },
    mq_4_three_day_rhythm: {
        title: 'Build the Rhythm',
        objective: 'Maintain a 3-day streak of activity.',
        ctaLabel: 'Continue Streak',
        completionHint: 'Reach 3+ day streak',
        domain: 'emotions',
        ctaRoute: '/library',
    },
    mq_5_real_world_output: {
        title: 'Create Real Output',
        objective: 'Create a real-world artifact: post, pitch, or demo.',
        ctaLabel: 'Mark Done',
        completionHint: 'Share or build something real',
        domain: 'uniqueness',
        ctaRoute: '/genius-offer',
    },
};

/**
 * Get the copy/content for a specific Main Quest stage
 */
export function getMainQuestCopy(stage: MainQuestStage): MainQuestCopy {
    const copy = MAIN_QUEST_COPY[stage];
    return {
        stage,
        ...copy,
    };
}

/**
 * Get the index of a stage in the progression (1-indexed for display)
 */
export function getStageIndex(stage: MainQuestStage): number {
    return MAIN_QUEST_STAGES.indexOf(stage);
}

/**
 * Get stage number for display (1-indexed)
 */
export function getStageNumber(stage: MainQuestStage): number {
    return getStageIndex(stage) + 1;
}

/**
 * Get total number of stages
 */
export function getTotalStages(): number {
    return MAIN_QUEST_STAGES.length;
}

/**
 * Compute the next Main Quest stage based on player's current stats.
 * This is the core state machine logic.
 * 
 * Auto-advance rules:
 * - mq_0 → mq_1: when hasProfile
 * - mq_1 → mq_2: when hasGeniusProfileSnapshot
 * - mq_2 → mq_3: when sideQuestCompletionsCount >= 1
 * - mq_3 → mq_4: when upgradeCompletionsCount >= 1
 * - mq_4 → mq_5: when streakDays >= 3
 * - mq_5: complete when realWorldOutputDone
 */
export function computeNextMainQuestStage(
    profile: { main_quest_progress?: MainQuestProgress } | null,
    stats: PlayerStats
): MainQuestStage {
    // Gate 0: No profile at all
    if (!stats.hasProfile) {
        return 'mq_0_gateway';
    }

    // Gate 1: Need Genius Profile snapshot
    if (!stats.hasGeniusProfileSnapshot) {
        return 'mq_1_profile_clarity';
    }

    // Gate 2: Need first side quest (practice)
    if (stats.sideQuestCompletionsCount < 1) {
        return 'mq_2_first_side_quest';
    }

    // Gate 3: Need first upgrade
    if (stats.upgradeCompletionsCount < 1) {
        return 'mq_3_first_upgrade';
    }

    // Gate 4: Need 3-day streak
    if (stats.streakDays < 3) {
        return 'mq_4_three_day_rhythm';
    }

    // Gate 5: Final stage - real world output
    return 'mq_5_real_world_output';
}

/**
 * Check if a stage's objective has been completed
 */
export function isStageComplete(
    stage: MainQuestStage,
    profile: { main_quest_progress?: MainQuestProgress } | null,
    stats: PlayerStats
): boolean {
    switch (stage) {
        case 'mq_0_gateway':
            return stats.hasProfile;
        case 'mq_1_profile_clarity':
            return stats.hasGeniusProfileSnapshot;
        case 'mq_2_first_side_quest':
            return stats.sideQuestCompletionsCount >= 1;
        case 'mq_3_first_upgrade':
            return stats.upgradeCompletionsCount >= 1;
        case 'mq_4_three_day_rhythm':
            return stats.streakDays >= 3;
        case 'mq_5_real_world_output':
            return profile?.main_quest_progress?.real_world_output_done === true;
        default:
            return false;
    }
}

/**
 * Calculate overall Main Quest progress percentage (0-100)
 */
export function calculateMainQuestProgress(currentStage: MainQuestStage): number {
    const index = getStageIndex(currentStage);
    const total = MAIN_QUEST_STAGES.length;
    return Math.round((index / (total - 1)) * 100);
}

/**
 * Build PlayerStats from profile data
 */
export function buildPlayerStats(
    profile: {
        zone_of_genius_completed?: boolean | null;
        practice_count?: number;
        current_streak_days?: number;
        last_zog_snapshot_id?: string | null;
        main_quest_progress?: MainQuestProgress;
    } | null,
    completedUpgradesCount: number,
    hasZogSnapshot: boolean
): PlayerStats {
    return {
        hasProfile: !!profile,
        hasGeniusProfileSnapshot: !!profile?.zone_of_genius_completed || hasZogSnapshot || !!profile?.last_zog_snapshot_id,
        sideQuestCompletionsCount: profile?.practice_count || 0,
        upgradeCompletionsCount: completedUpgradesCount,
        streakDays: profile?.current_streak_days || 0,
        realWorldOutputDone: profile?.main_quest_progress?.real_world_output_done === true,
    };
}
