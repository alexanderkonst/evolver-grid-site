// Action catalog for Core Loop recommendations
// Each action maps to a QoL domain and growth vector

export type ActionDuration = '5min' | '10min' | '15min' | '30min' | '60min';
export type GrowthVector = 'spirit' | 'mind' | 'emotions' | 'uniqueness' | 'body';
export type ActionType = 'practice' | 'learning' | 'life-action' | 'reflection';

export interface Action {
    id: string;
    title: string;
    description: string;
    duration: ActionDuration;
    xp: number;
    vector: GrowthVector;
    qolDomains: string[]; // Which QoL domains this improves (e.g., "health_stage", "wealth_stage")
    type: ActionType;
    link?: string; // Optional link to content
    emoji?: string;
}

// Map QoL domains to primary vectors
export const DOMAIN_TO_VECTOR: Record<string, GrowthVector> = {
    health_stage: 'body',
    wealth_stage: 'uniqueness',
    happiness_stage: 'emotions',
    love_relationships_stage: 'emotions',
    impact_stage: 'uniqueness',
    growth_stage: 'mind',
    social_ties_stage: 'emotions',
    home_stage: 'body'
};

// Action catalog
export const ACTIONS: Action[] = [
    // Body/Health actions
    {
        id: 'breathwork-5',
        title: '5-Minute Breathwork',
        description: 'Center yourself with conscious breathing',
        duration: '5min',
        xp: 25,
        vector: 'body',
        qolDomains: ['health_stage'],
        type: 'practice',
        emoji: '🧘',
        link: '/library/breathwork'
    },
    {
        id: 'morning-stretch',
        title: 'Morning Stretch',
        description: 'Wake up your body with gentle movement',
        duration: '10min',
        xp: 30,
        vector: 'body',
        qolDomains: ['health_stage'],
        type: 'practice',
        emoji: '🤸'
    },
    {
        id: 'hydration-check',
        title: 'Hydration Check',
        description: 'Drink a full glass of water right now',
        duration: '5min',
        xp: 15,
        vector: 'body',
        qolDomains: ['health_stage', 'home_stage'],
        type: 'life-action',
        emoji: '💧'
    },

    // Emotions/Happiness actions
    {
        id: 'gratitude-journal',
        title: 'Gratitude Journal',
        description: 'Write 3 things you\'re grateful for today',
        duration: '5min',
        xp: 25,
        vector: 'emotions',
        qolDomains: ['happiness_stage'],
        type: 'reflection',
        emoji: '📝'
    },
    {
        id: 'reach-out',
        title: 'Reach Out',
        description: 'Send a message to someone you care about',
        duration: '5min',
        xp: 30,
        vector: 'emotions',
        qolDomains: ['love_relationships_stage', 'social_ties_stage'],
        type: 'life-action',
        emoji: '💌'
    },
    {
        id: 'emotion-check',
        title: 'Emotion Check-In',
        description: 'Pause and name what you\'re feeling right now',
        duration: '5min',
        xp: 20,
        vector: 'emotions',
        qolDomains: ['happiness_stage'],
        type: 'reflection',
        emoji: '🎭'
    },

    // Mind/Growth actions
    {
        id: 'learn-something',
        title: 'Learn Something New',
        description: 'Read an article or watch a short video on a topic that interests you',
        duration: '15min',
        xp: 40,
        vector: 'mind',
        qolDomains: ['growth_stage'],
        type: 'learning',
        emoji: '📚'
    },
    {
        id: 'meditation-10',
        title: '10-Minute Meditation',
        description: 'Quiet your mind with focused awareness',
        duration: '10min',
        xp: 35,
        vector: 'spirit',
        qolDomains: ['happiness_stage', 'health_stage'],
        type: 'practice',
        emoji: '🧠'
    },

    // Uniqueness/Wealth/Impact actions
    {
        id: 'asset-review',
        title: 'Asset Review',
        description: 'Add one asset to your Asset Map',
        duration: '10min',
        xp: 40,
        vector: 'uniqueness',
        qolDomains: ['wealth_stage', 'impact_stage'],
        type: 'reflection',
        emoji: '💰',
        link: '/asset-mapping'
    },
    {
        id: 'genius-reflection',
        title: 'Zone of Genius Reflection',
        description: 'Review your archetype and consider how to apply it today',
        duration: '10min',
        xp: 35,
        vector: 'uniqueness',
        qolDomains: ['impact_stage', 'growth_stage'],
        type: 'reflection',
        emoji: '✨',
        link: '/zone-of-genius'
    },
    {
        id: 'mission-check',
        title: 'Mission Check-In',
        description: 'Review your mission and note one small step forward',
        duration: '10min',
        xp: 40,
        vector: 'uniqueness',
        qolDomains: ['impact_stage'],
        type: 'reflection',
        emoji: '🎯',
        link: '/mission-discovery'
    },

    // Spirit actions
    {
        id: 'intention-setting',
        title: 'Set Today\'s Intention',
        description: 'Choose one word or phrase to guide your day',
        duration: '5min',
        xp: 20,
        vector: 'spirit',
        qolDomains: ['happiness_stage', 'growth_stage'],
        type: 'reflection',
        emoji: '🌅'
    },
    {
        id: 'silent-minute',
        title: 'One Minute of Silence',
        description: 'Just be. No phone, no thoughts, just presence.',
        duration: '5min',
        xp: 15,
        vector: 'spirit',
        qolDomains: ['happiness_stage'],
        type: 'practice',
        emoji: '🔇'
    }
];

// Get recommended action based on lowest QoL domain
export function getRecommendedAction(
    lowestDomain: string,
    completedActionIds: string[] = []
): Action | null {
    const targetVector = DOMAIN_TO_VECTOR[lowestDomain] || 'mind';

    // Filter actions for the target vector that haven't been completed today
    const available = ACTIONS.filter(
        a => a.vector === targetVector && !completedActionIds.includes(a.id)
    );

    // Fallback: any action for domain
    if (available.length === 0) {
        const domainActions = ACTIONS.filter(
            a => a.qolDomains.includes(lowestDomain) && !completedActionIds.includes(a.id)
        );
        return domainActions[0] || ACTIONS[0];
    }

    // Return first available (could add randomization or smarter logic later)
    return available[0];
}
