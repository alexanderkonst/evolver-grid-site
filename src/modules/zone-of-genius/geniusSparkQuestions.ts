/**
 * Genius Spark Questions
 * 5 curated questions for quick genius discovery (60-90 seconds)
 */

export interface SparkOption {
    id: string;
    label: string;
    description: string;
    talentCluster: 'creator' | 'helper' | 'thinker' | 'leader' | 'harmonizer';
}

export interface SparkQuestion {
    id: number;
    question: string;
    subtext: string;
    options: SparkOption[];
}

export const SPARK_QUESTIONS: SparkQuestion[] = [
    {
        id: 1,
        question: "What energizes you most?",
        subtext: "When you're at your best, you're usually...",
        options: [
            {
                id: '1a',
                label: 'Creating something new',
                description: 'Ideas, art, solutions',
                talentCluster: 'creator'
            },
            {
                id: '1b',
                label: 'Helping someone grow',
                description: 'Supporting, teaching, caring',
                talentCluster: 'helper'
            },
            {
                id: '1c',
                label: 'Solving a puzzle',
                description: 'Analysis, strategy, understanding',
                talentCluster: 'thinker'
            }
        ]
    },
    {
        id: 2,
        question: "How do you help others?",
        subtext: "People come to you when they need...",
        options: [
            {
                id: '2a',
                label: 'Fresh perspective',
                description: 'New ideas, vision, possibilities',
                talentCluster: 'creator'
            },
            {
                id: '2b',
                label: 'Emotional support',
                description: 'Listening, empathy, encouragement',
                talentCluster: 'helper'
            },
            {
                id: '2c',
                label: 'Clear direction',
                description: 'Decisions, action, leadership',
                talentCluster: 'leader'
            }
        ]
    },
    {
        id: 3,
        question: "What do people thank you for?",
        subtext: "The compliment you hear most often...",
        options: [
            {
                id: '3a',
                label: '"You see what others miss"',
                description: 'Insight, depth, perception',
                talentCluster: 'thinker'
            },
            {
                id: '3b',
                label: '"You make things happen"',
                description: 'Action, execution, results',
                talentCluster: 'leader'
            },
            {
                id: '3c',
                label: '"You bring people together"',
                description: 'Harmony, connection, peace',
                talentCluster: 'harmonizer'
            }
        ]
    },
    {
        id: 4,
        question: "Your natural work style?",
        subtext: "You thrive when you're...",
        options: [
            {
                id: '4a',
                label: 'Deep in thought',
                description: 'Research, reflection, understanding',
                talentCluster: 'thinker'
            },
            {
                id: '4b',
                label: 'Building relationships',
                description: 'Connecting, collaborating, supporting',
                talentCluster: 'harmonizer'
            },
            {
                id: '4c',
                label: 'Making things beautiful',
                description: 'Design, expression, creativity',
                talentCluster: 'creator'
            }
        ]
    },
    {
        id: 5,
        question: "What drives you?",
        subtext: "Your core motivation is...",
        options: [
            {
                id: '5a',
                label: 'Making a difference',
                description: 'Impact, service, contribution',
                talentCluster: 'helper'
            },
            {
                id: '5b',
                label: 'Achieving excellence',
                description: 'Mastery, growth, success',
                talentCluster: 'leader'
            },
            {
                id: '5c',
                label: 'Creating harmony',
                description: 'Balance, peace, connection',
                talentCluster: 'harmonizer'
            }
        ]
    }
];
