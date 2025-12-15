/**
 * Main Quest (Storyline) System v0
 * 
 * Implements a linear progression through the core game experience.
 * Each stage represents a major milestone in the player's journey.
 */

export type MainQuestStage =
    | 'mq_0_gateway'
    | 'mq_1_profile_clarity'
    | 'mq_2_first_side_quest'
    | 'mq_3_first_upgrade'
    | 'mq_4_daily_loop'
    | 'mq_5_share_or_build';

export type MainQuestStatus = 'not_started' | 'in_progress' | 'completed';

export interface MainQuestCopy {
    stage: MainQuestStage;
    title: string;
    objective: string;
    ctaText: string;
    ctaRoute?: string;
    xpReward?: number;
}

export interface PlayerStats {
    hasProfile: boolean;
    zoneOfGeniusCompleted: boolean;
    practiceCount: number;
    upgradesCompleted: number;
    currentStreak: number;
    hasRealWorldOutput: boolean;
}

/**
 * Ordered list of all Main Quest stages
 */
export const MAIN_QUEST_STAGES: MainQuestStage[] = [
    'mq_0_gateway',
    'mq_1_profile_clarity',
    'mq_2_first_side_quest',
    'mq_3_first_upgrade',
    'mq_4_daily_loop',
    'mq_5_share_or_build',
];

/**
 * Main Quest copy and metadata for each stage
 */
const MAIN_QUEST_COPY: Record<MainQuestStage, Omit<MainQuestCopy, 'stage'>> = {
    mq_0_gateway: {
        title: 'Enter the Game',
        objective: 'Complete onboarding and create your player profile',
        ctaText: 'Start Journey',
        ctaRoute: '/zone-of-genius',
        xpReward: 0,
    },
    mq_1_profile_clarity: {
        title: 'Clarify Your Genius',
        objective: 'Complete the Zone of Genius assessment to unlock your archetype',
        ctaText: 'Discover My Genius',
        ctaRoute: '/zone-of-genius',
        xpReward: 50,
    },
    mq_2_first_side_quest: {
        title: 'First Side Quest',
        objective: 'Complete your first practice from the library',
        ctaText: 'Find a Practice',
        ctaRoute: '/library',
        xpReward: 25,
    },
    mq_3_first_upgrade: {
        title: 'Unlock Your First Upgrade',
        objective: 'Complete an upgrade to level up your character',
        ctaText: 'Browse Upgrades',
        ctaRoute: '/skills',
        xpReward: 50,
    },
    mq_4_daily_loop: {
        title: 'Build the Habit',
        objective: 'Maintain a 3-day streak with any mix of practices and upgrades',
        ctaText: 'Continue Streak',
        ctaRoute: '/library',
        xpReward: 75,
    },
    mq_5_share_or_build: {
        title: 'Share or Build',
        objective: 'Create a real-world output: a post, pitch, or demo of your genius',
        ctaText: 'Create Output',
        ctaRoute: '/genius-offer',
        xpReward: 100,
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
 * Get the index of a stage in the progression
 */
export function getStageIndex(stage: MainQuestStage): number {
    return MAIN_QUEST_STAGES.indexOf(stage);
}

/**
 * Check if a stage has been passed (completed)
 */
export function isStagePassed(currentStage: MainQuestStage, checkStage: MainQuestStage): boolean {
    return getStageIndex(currentStage) > getStageIndex(checkStage);
}

/**
 * Compute the next Main Quest stage based on player's current stats.
 * This is the core state machine logic.
 * 
 * Logic:
 * - Empty profile → mq_0
 * - No ZoG snapshot → mq_1
 * - No practice completed → mq_2
 * - No upgrade completed → mq_3
 * - Streak < 3 → mq_4
 * - Otherwise → mq_5
 */
export function computeNextMainQuestStage(stats: PlayerStats): MainQuestStage {
    // Gate 0: No profile at all
    if (!stats.hasProfile) {
        return 'mq_0_gateway';
    }

    // Gate 1: Need to clarify genius profile
    if (!stats.zoneOfGeniusCompleted) {
        return 'mq_1_profile_clarity';
    }

    // Gate 2: Need first side quest (practice)
    if (stats.practiceCount < 1) {
        return 'mq_2_first_side_quest';
    }

    // Gate 3: Need first upgrade
    if (stats.upgradesCompleted < 1) {
        return 'mq_3_first_upgrade';
    }

    // Gate 4: Need 3-day streak
    if (stats.currentStreak < 3) {
        return 'mq_4_daily_loop';
    }

    // Gate 5: Final stage - share or build
    return 'mq_5_share_or_build';
}

/**
 * Check if a stage's objective has been completed
 */
export function isStageObjectiveComplete(
    stage: MainQuestStage,
    stats: PlayerStats
): boolean {
    switch (stage) {
        case 'mq_0_gateway':
            return stats.hasProfile;
        case 'mq_1_profile_clarity':
            return stats.zoneOfGeniusCompleted;
        case 'mq_2_first_side_quest':
            return stats.practiceCount >= 1;
        case 'mq_3_first_upgrade':
            return stats.upgradesCompleted >= 1;
        case 'mq_4_daily_loop':
            return stats.currentStreak >= 3;
        case 'mq_5_share_or_build':
            return stats.hasRealWorldOutput;
        default:
            return false;
    }
}

/**
 * Calculate overall Main Quest progress (0-100)
 */
export function calculateMainQuestProgress(currentStage: MainQuestStage): number {
    const index = getStageIndex(currentStage);
    const total = MAIN_QUEST_STAGES.length - 1; // Exclude final stage from calculation
    return Math.round((index / total) * 100);
}

/**
 * Get all Main Quest stages with their completion status
 */
export function getAllStagesWithStatus(
    stats: PlayerStats
): Array<MainQuestCopy & { status: MainQuestStatus }> {
    const currentStage = computeNextMainQuestStage(stats);
    const currentIndex = getStageIndex(currentStage);

    return MAIN_QUEST_STAGES.map(stage => {
        const copy = getMainQuestCopy(stage);
        const stageIndex = getStageIndex(stage);

        let status: MainQuestStatus;
        if (stageIndex < currentIndex) {
            status = 'completed';
        } else if (stageIndex === currentIndex) {
            status = 'in_progress';
        } else {
            status = 'not_started';
        }

        return { ...copy, status };
    });
}

/**
 * Build PlayerStats from a game profile and related data
 */
export function buildPlayerStats(
    profile: {
        zone_of_genius_completed?: boolean | null;
        practice_count?: number;
        current_streak_days?: number;
    } | null,
    completedUpgradesCount: number,
    hasZogSnapshot: boolean
): PlayerStats {
    return {
        hasProfile: !!profile,
        zoneOfGeniusCompleted: !!profile?.zone_of_genius_completed || hasZogSnapshot,
        practiceCount: profile?.practice_count || 0,
        upgradesCompleted: completedUpgradesCount,
        currentStreak: profile?.current_streak_days || 0,
        hasRealWorldOutput: false, // TODO: Track this in profile
    };
}
