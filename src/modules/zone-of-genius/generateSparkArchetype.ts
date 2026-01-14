/**
 * Genius Spark Archetype Generator
 * Generates instant archetype from 5-tap selections
 */

import { SparkOption } from './geniusSparkQuestions';

type TalentCluster = 'creator' | 'helper' | 'thinker' | 'leader' | 'harmonizer';

interface SparkArchetype {
    name: string;
    headline: string;
    description: string;
    emoji: string;
    gradient: string;
}

const ARCHETYPES: Record<TalentCluster, SparkArchetype> = {
    creator: {
        name: 'THE CREATIVE CATALYST',
        headline: 'You bring ideas to life',
        description: 'Your genius lies in seeing possibilities where others see problems. You naturally generate fresh perspectives, innovative solutions, and original work that inspires others.',
        emoji: '✨',
        gradient: 'from-amber-400 via-orange-400 to-rose-400'
    },
    helper: {
        name: 'THE GROWTH ARCHITECT',
        headline: 'You help others become their best',
        description: 'Your genius lies in nurturing potential. You naturally sense what people need to grow, and your presence creates safety for transformation.',
        emoji: '🌱',
        gradient: 'from-emerald-400 via-teal-400 to-cyan-400'
    },
    thinker: {
        name: 'THE INSIGHT WEAVER',
        headline: 'You see patterns others miss',
        description: 'Your genius lies in understanding the deep structure of things. You naturally synthesize complex information into clear insights that illuminate the path forward.',
        emoji: '🔮',
        gradient: 'from-violet-400 via-purple-400 to-indigo-400'
    },
    leader: {
        name: 'THE ACTION IGNITER',
        headline: 'You make things happen',
        description: 'Your genius lies in turning vision into reality. You naturally mobilize energy, make decisive moves, and create momentum that others follow.',
        emoji: '🔥',
        gradient: 'from-red-400 via-rose-400 to-pink-400'
    },
    harmonizer: {
        name: 'THE BRIDGE BUILDER',
        headline: 'You bring people together',
        description: 'Your genius lies in creating connection and coherence. You naturally sense the whole, hold space for differences, and weave people into collaborative flow.',
        emoji: '🌊',
        gradient: 'from-sky-400 via-blue-400 to-indigo-400'
    }
};

/**
 * Calculate the dominant talent cluster from selections
 */
export function calculateDominantCluster(selections: SparkOption[]): TalentCluster {
    const counts: Record<TalentCluster, number> = {
        creator: 0,
        helper: 0,
        thinker: 0,
        leader: 0,
        harmonizer: 0
    };

    selections.forEach(selection => {
        counts[selection.talentCluster]++;
    });

    // Find the cluster with the highest count
    let dominant: TalentCluster = 'creator';
    let maxCount = 0;

    (Object.keys(counts) as TalentCluster[]).forEach(cluster => {
        if (counts[cluster] > maxCount) {
            maxCount = counts[cluster];
            dominant = cluster;
        }
    });

    return dominant;
}

/**
 * Generate archetype from selections
 */
export function generateSparkArchetype(selections: SparkOption[]): SparkArchetype {
    const dominantCluster = calculateDominantCluster(selections);
    return ARCHETYPES[dominantCluster];
}

/**
 * Get all possible archetypes (for display/testing)
 */
export function getAllArchetypes(): Record<TalentCluster, SparkArchetype> {
    return ARCHETYPES;
}
