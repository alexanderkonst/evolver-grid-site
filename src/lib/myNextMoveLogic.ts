/**
 * My Next Move Recommendation Logic
 * 
 * Implements the GROW → LEARN → Nudges sequence from module_taxonomy.md
 * 
 * Sequence:
 * 1. GROW → Profile completion first (ZoG → QoL → Resources → Mission)
 * 2. LEARN → Ongoing forever (Library → Growth Paths → Skill Trees)
 * 3. One-time nudges: Resources done → nudge COLLABORATE, ZoG done → nudge BUILD
 */

export interface Recommendation {
    id: string;
    type: 'grow' | 'learn' | 'nudge';
    space: 'grow' | 'learn' | 'collaborate' | 'build';
    title: string;
    description: string;
    path: string;
    ctaLabel: string;
    icon: 'sparkles' | 'book' | 'users' | 'rocket';
    estimatedTime?: string;
    priority: 'primary' | 'secondary';
}

export interface ProfileCompletionState {
    hasZoG: boolean;
    hasQoL: boolean;
    hasResources: boolean;
    hasMission: boolean;
    activeGrowthPath?: string;
}

export interface NudgeState {
    // Track if user has seen each nudge (persisted in localStorage)
    collaborateNudgeSeen: boolean;
    buildNudgeSeen: boolean;
}

/**
 * Get the next recommended action for the user
 * 
 * Logic (from module_taxonomy.md):
 * 1. GROW first: ZoG → QoL → Resources → Mission
 * 2. LEARN forever: Library → Growth Paths → Skill Trees
 * 3. One-time nudges when milestones hit
 */
export function getNextRecommendation(
    completion: ProfileCompletionState,
    nudges: NudgeState
): { primary: Recommendation; nudge?: Recommendation } {
    // Phase 1: GROW (Profile Completion)
    if (!completion.hasZoG) {
        return {
            primary: {
                id: 'zog',
                type: 'grow',
                space: 'grow',
                title: 'Discover Your Zone of Genius',
                description: 'Uncover your unique archetype and core talents in just 5 minutes',
                path: '/zone-of-genius/entry',
                ctaLabel: 'Start Discovery',
                icon: 'sparkles',
                estimatedTime: '5 min',
                priority: 'primary',
            },
        };
    }

    if (!completion.hasQoL) {
        return {
            primary: {
                id: 'qol',
                type: 'grow',
                space: 'grow',
                title: 'Map Your Quality of Life',
                description: 'See where you stand across 8 life domains to reveal your growth priorities',
                path: '/quality-of-life-map/assessment',
                ctaLabel: 'Start Assessment',
                icon: 'sparkles',
                estimatedTime: '5 min',
                priority: 'primary',
            },
        };
    }

    if (!completion.hasResources) {
        return {
            primary: {
                id: 'resources',
                type: 'grow',
                space: 'grow',
                title: 'Map Your Resources',
                description: 'Catalog your hidden assets — skills, connections, tools — ready to share',
                path: '/asset-mapping',
                ctaLabel: 'Map Resources',
                icon: 'sparkles',
                estimatedTime: '10 min',
                priority: 'primary',
            },
            // Check for BUILD nudge (ZoG done = can start building)
            nudge: !nudges.buildNudgeSeen ? {
                id: 'nudge-build',
                type: 'nudge',
                space: 'build',
                title: 'BUILD is now available!',
                description: 'Your genius is discovered. You can now start building your offering.',
                path: '/game/build',
                ctaLabel: 'Explore BUILD',
                icon: 'rocket',
                priority: 'secondary',
            } : undefined,
        };
    }

    if (!completion.hasMission) {
        return {
            primary: {
                id: 'mission',
                type: 'grow',
                space: 'grow',
                title: 'Discover Your Mission',
                description: 'Clarify the "why" that drives everything else you do',
                path: '/mission-discovery',
                ctaLabel: 'Discover Mission',
                icon: 'sparkles',
                estimatedTime: '15 min',
                priority: 'primary',
            },
            // Check for COLLABORATE nudge (Resources done = can match with others)
            nudge: !nudges.collaborateNudgeSeen ? {
                id: 'nudge-collaborate',
                type: 'nudge',
                space: 'collaborate',
                title: 'COLLABORATE is now available!',
                description: 'Your resources are mapped. Find people with complementary talents.',
                path: '/game/collaborate',
                ctaLabel: 'Explore COLLABORATE',
                icon: 'users',
                priority: 'secondary',
            } : undefined,
        };
    }

    // Phase 2: LEARN (Ongoing Forever)
    // If user has an active growth path, continue it
    if (completion.activeGrowthPath) {
        return {
            primary: {
                id: 'continue-path',
                type: 'learn',
                space: 'learn',
                title: 'Continue Your Growth Path',
                description: 'Pick up where you left off in your personal development journey',
                path: `/game/learn/path/${completion.activeGrowthPath}`,
                ctaLabel: 'Continue Path',
                icon: 'book',
                priority: 'primary',
            },
        };
    }

    // Default: Explore Practice Library (infinite rabbit hole)
    return {
        primary: {
            id: 'library',
            type: 'learn',
            space: 'learn',
            title: 'Explore Practice Library',
            description: 'Discover practices, frameworks, and growth paths tailored to your genius',
            path: '/game/learn/library',
            ctaLabel: 'Explore Library',
            icon: 'book',
            priority: 'primary',
        },
    };
}

/**
 * Get the completion percentage for GROW space
 */
export function getGrowCompletion(completion: ProfileCompletionState): number {
    const steps = [
        completion.hasZoG,
        completion.hasQoL,
        completion.hasResources,
        completion.hasMission,
    ];
    const completed = steps.filter(Boolean).length;
    return Math.round((completed / steps.length) * 100);
}

/**
 * Check if GROW is complete (all 4 steps done)
 */
export function isGrowComplete(completion: ProfileCompletionState): boolean {
    return completion.hasZoG &&
        completion.hasQoL &&
        completion.hasResources &&
        completion.hasMission;
}

// LocalStorage keys for nudge state
const NUDGE_STORAGE_KEY = 'my_next_move_nudges';

/**
 * Load nudge state from localStorage
 */
export function loadNudgeState(): NudgeState {
    try {
        const stored = localStorage.getItem(NUDGE_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.warn('Failed to load nudge state', e);
    }
    return {
        collaborateNudgeSeen: false,
        buildNudgeSeen: false,
    };
}

/**
 * Mark a nudge as seen
 */
export function markNudgeSeen(nudgeType: 'collaborate' | 'build'): void {
    try {
        const current = loadNudgeState();
        const updated = {
            ...current,
            [`${nudgeType}NudgeSeen`]: true,
        };
        localStorage.setItem(NUDGE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
        console.warn('Failed to save nudge state', e);
    }
}
