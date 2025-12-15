/**
 * Main Quest (Storyline) System
 * 
 * Implements a linear progression through the core game experience.
 * Each stage represents a major milestone in the player's journey.
 */

export type MainQuestStage =
    | 'mq_0_gateway'
    | 'mq_1_discover_genius'
    | 'mq_2_map_life'
    | 'mq_3_daily_practice'
    | 'mq_4_first_upgrade'
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
    zoneOfGeniusCompleted: boolean;
    qualityOfLifeCompleted: boolean;
    practiceCount: number;
    upgradesCompleted: number;
    level: number;
}

/**
 * Ordered list of all Main Quest stages
 */
export const MAIN_QUEST_STAGES: MainQuestStage[] = [
    'mq_0_gateway',
    'mq_1_discover_genius',
    'mq_2_map_life',
    'mq_3_daily_practice',
    'mq_4_first_upgrade',
    'mq_5_share_or_build',
];

/**
 * Main Quest copy and metadata for each stage
 */
const MAIN_QUEST_COPY: Record<MainQuestStage, Omit<MainQuestCopy, 'stage'>> = {
    mq_0_gateway: {
        title: 'Enter the Game',
        objective: 'Create your character and begin the journey',
        ctaText: 'Start Journey',
        ctaRoute: '/zone-of-genius',
        xpReward: 0,
    },
    mq_1_discover_genius: {
        title: 'Discover Your Genius',
        objective: 'Complete the Zone of Genius assessment to unlock your unique archetype',
        ctaText: 'Discover My Genius',
        ctaRoute: '/zone-of-genius',
        xpReward: 50,
    },
    mq_2_map_life: {
        title: 'Map Your Life',
        objective: 'Complete the Quality of Life assessment to see where you stand',
        ctaText: 'Map My Life',
        ctaRoute: '/quality-of-life',
        xpReward: 50,
    },
    mq_3_daily_practice: {
        title: 'First Daily Practice',
        objective: 'Complete your first practice from the library',
        ctaText: 'Find a Practice',
        ctaRoute: '/library',
        xpReward: 25,
    },
    mq_4_first_upgrade: {
        title: 'Unlock Your First Upgrade',
        objective: 'Complete an upgrade to level up your character',
        ctaText: 'Browse Upgrades',
        ctaRoute: '/skills',
        xpReward: 50,
    },
    mq_5_share_or_build: {
        title: 'Share or Build',
        objective: 'Share your progress with a friend or start building your Genius Offer',
        ctaText: 'Explore Options',
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
 * Compute the next Main Quest stage based on player's current stats
 * Returns the stage the player should be working on
 */
export function computeNextMainQuestStage(
    currentStage: MainQuestStage,
    stats: PlayerStats
): MainQuestStage {
    const currentIndex = getStageIndex(currentStage);

    // Check if current stage is completed and should advance
    switch (currentStage) {
        case 'mq_0_gateway':
            // Gateway is always passed once they start
            return 'mq_1_discover_genius';

        case 'mq_1_discover_genius':
            if (stats.zoneOfGeniusCompleted) {
                return 'mq_2_map_life';
            }
            break;

        case 'mq_2_map_life':
            if (stats.qualityOfLifeCompleted) {
                return 'mq_3_daily_practice';
            }
            break;

        case 'mq_3_daily_practice':
            if (stats.practiceCount >= 1) {
                return 'mq_4_first_upgrade';
            }
            break;

        case 'mq_4_first_upgrade':
            if (stats.upgradesCompleted >= 1) {
                return 'mq_5_share_or_build';
            }
            break;

        case 'mq_5_share_or_build':
            // Final stage - stays here
            break;
    }

    return currentStage;
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
            return true; // Always complete once started
        case 'mq_1_discover_genius':
            return stats.zoneOfGeniusCompleted;
        case 'mq_2_map_life':
            return stats.qualityOfLifeCompleted;
        case 'mq_3_daily_practice':
            return stats.practiceCount >= 1;
        case 'mq_4_first_upgrade':
            return stats.upgradesCompleted >= 1;
        case 'mq_5_share_or_build':
            return false; // Open-ended final quest
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
    currentStage: MainQuestStage,
    stats: PlayerStats
): Array<MainQuestCopy & { status: MainQuestStatus }> {
    return MAIN_QUEST_STAGES.map(stage => {
        const copy = getMainQuestCopy(stage);
        const currentIndex = getStageIndex(currentStage);
        const stageIndex = getStageIndex(stage);

        let status: MainQuestStatus;
        if (stageIndex < currentIndex) {
            status = 'completed';
        } else if (stageIndex === currentIndex) {
            status = isStageObjectiveComplete(stage, stats) ? 'completed' : 'in_progress';
        } else {
            status = 'not_started';
        }

        return { ...copy, status };
    });
}
