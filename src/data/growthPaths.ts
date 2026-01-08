import { Sparkles, Crown, Droplet, Sun, Dumbbell } from "lucide-react";

/**
 * Growth Paths - Sequences of transformational upgrades
 * Based on docs/growth_paths.md v7.0 (Updated: 2025-01-07)
 * 
 * Legend:
 * 🔥 = Immersive Experience / Activation
 * 📚 = Micro-learning (90s video infographic)
 * 📝 = Profile step / Self-assessment
 * 💰 = Paid module
 */

export type UpgradeType = 'assessment' | 'micro' | 'activation' | 'paid';

export interface Upgrade {
    id: string;
    order: number;
    name: string;
    type: UpgradeType;
    description: string;
    duration?: string;
    unlocksAfter?: string[];
    xpReward: number;
    link?: string;
}

export interface GrowthPath {
    id: string;
    name: string;
    subtitle: string;
    tagline: string;
    description: string;
    color: string;
    iconType: 'sparkles' | 'crown' | 'droplet' | 'sun' | 'dumbbell';
    upgrades: Upgrade[];
}

// Type icons for display
export const TYPE_ICONS: Record<UpgradeType, string> = {
    assessment: '📝',
    micro: '📚',
    activation: '🔥',
    paid: '💰',
};

export const TYPE_LABELS: Record<UpgradeType, string> = {
    assessment: 'Self-Assessment',
    micro: 'Micro-Learning',
    activation: 'Activation',
    paid: 'Premium',
};

export const growthPaths: GrowthPath[] = [
    // ==================== GENIUS (SHOWING UP) ====================
    {
        id: "genius",
        name: "Genius",
        subtitle: "Showing Up",
        tagline: "Know Your Gifts · Express Your Genius",
        description: "Discover and express your unique genius. From knowing your talents to building a genius-based business.",
        color: "#ff6b35",
        iconType: "sun",
        upgrades: [
            {
                id: "g-1-zog-test",
                order: 1,
                name: "Zone of Genius Test",
                type: "assessment",
                description: "Know your unique genius (~1 min)",
                duration: "1 min",
                xpReward: 50,
                link: "/zone-of-genius/entry",
            },
            {
                id: "g-2-apply-genius",
                order: 2,
                name: "Apply Your Genius",
                type: "assessment",
                description: "See how your genius shows up in life",
                unlocksAfter: ["g-1-zog-test"],
                xpReward: 75,
            },
            {
                id: "g-3-personality-tests",
                order: 3,
                name: "Upload Personality Tests",
                type: "assessment",
                description: "Enrich profile with MBTI, Enneagram, etc.",
                unlocksAfter: ["g-1-zog-test"],
                xpReward: 50,
                link: "/resources/personality-tests",
            },
            {
                id: "g-4-micro-distinctions",
                order: 4,
                name: "Micro: Genius, Purpose, Mission, Traits, Talents",
                type: "micro",
                description: "Clarity on all the distinctions",
                duration: "90s",
                unlocksAfter: ["g-1-zog-test"],
                xpReward: 30,
            },
            {
                id: "g-5-genius-activation",
                order: 5,
                name: "Zone of Genius Activation",
                type: "activation",
                description: "Immersive experience of your genius",
                unlocksAfter: ["g-4-micro-distinctions"],
                xpReward: 150,
            },
            {
                id: "g-6-mi-assessment",
                order: 6,
                name: "Multiple Intelligences Assessment",
                type: "assessment",
                description: "3-min MI self-assessment",
                duration: "3 min",
                xpReward: 75,
                link: "/intelligences",
            },
            {
                id: "g-7-unique-offering",
                order: 7,
                name: "Unique Offering",
                type: "paid",
                description: "Articulate your genius offer",
                unlocksAfter: ["g-1-zog-test", "g-4-micro-distinctions", "g-5-genius-activation"],
                xpReward: 300,
                link: "/genius-offer",
            },
            {
                id: "g-8-genius-business",
                order: 8,
                name: "Genius Business",
                type: "paid",
                description: "Build your genius-based business",
                unlocksAfter: ["g-7-unique-offering"],
                xpReward: 500,
            },
        ],
    },

    // ==================== SPIRIT (WAKING UP) ====================
    {
        id: "spirit",
        name: "Spirit",
        subtitle: "Waking Up",
        tagline: "Awareness · Sensitivity · Presence",
        description: "Awareness + Sensitivity as meta-skills. Develop your capacity for presence, love, and expanded states.",
        color: "#9b5de5",
        iconType: "sparkles",
        upgrades: [
            {
                id: "s-1-what-is-spirit",
                order: 1,
                name: "Micro: What is Spirit?",
                type: "micro",
                description: "Awareness + Sensitivity as the two graspable aspects of spirit; seeing them as meta-skills through everyday experience",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "s-2-baseline",
                order: 2,
                name: "Spirit Baseline Assessment",
                type: "assessment",
                description: "Where am I on the holonic map of awareness? Sensitivity? What's next?",
                duration: "3 min",
                xpReward: 50,
            },
            {
                id: "s-3-shifting-consciousness",
                order: 3,
                name: "Micro: Shifting Consciousness",
                type: "micro",
                description: "Speed of shifting, degree of peak, sustainable development considerations",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "s-4-conscious-breath",
                order: 4,
                name: "Conscious Breath",
                type: "activation",
                description: "Learn to take a conscious breath — the foundational skill",
                duration: "2 min",
                xpReward: 50,
            },
            {
                id: "s-5-heart-centering",
                order: 5,
                name: "Heart Centering",
                type: "activation",
                description: "Breath into the center of the heart — a technique to increase sensitivity (secular Vipassana/Sufi/Rosicrucian)",
                duration: "5 min",
                xpReward: 100,
            },
            {
                id: "s-6-state-shifting",
                order: 6,
                name: "State Shifting Experience",
                type: "activation",
                description: "Experience shifting awareness and sensitivity; develop sensitivity to the shifting itself (meta-skill on meta-skill)",
                duration: "10 min",
                xpReward: 150,
            },
            {
                id: "s-7-micro-states",
                order: 7,
                name: "Micro: States of Consciousness",
                type: "micro",
                description: "Altered/expanded states, peak experiences, nervous system connection, brain wave activity",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "s-8-depth-perception",
                order: 8,
                name: "Micro: Depth Perception",
                type: "micro",
                description: "Perception of time and space → better decisions; this as a meta-skill",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "s-9-breathwork-meditation",
                order: 9,
                name: "Breathwork + Meditation",
                type: "activation",
                description: "Full experience: breathwork followed by meditation",
                duration: "20+ min",
                xpReward: 200,
            },
            {
                id: "s-10-five-states",
                order: 10,
                name: "Micro: Five Major States",
                type: "micro",
                description: "Physical, Subtle, Causal, Non-dual, Isness/Suchness, Ground of Being, Non-dual + Void",
                duration: "90s",
                xpReward: 30,
            },
        ],
    },

    // ==================== MIND (GROWING UP) ====================
    {
        id: "mind",
        name: "Mind",
        subtitle: "Growing Up",
        tagline: "Development · Perspective · Meaning",
        description: "Development as lens polishing — seeing the lens you see through. Expand your capacity for complexity and meaning-making.",
        color: "#f5a623",
        iconType: "crown",
        upgrades: [
            {
                id: "m-1-why-matters",
                order: 1,
                name: "Micro: Why This Matters",
                type: "micro",
                description: "How developmental stages reflect in products, businesses, societies, politics, thoughts",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-2-mind-development",
                order: 2,
                name: "Micro: Mind Development",
                type: "micro",
                description: "Understanding growth as mind development",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-3-thinking-about-thinking",
                order: 3,
                name: "Micro: Thinking About Thinking",
                type: "micro",
                description: "One of the best ways to learn about mind is to learn about thinking",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-4-essence-of-mind",
                order: 4,
                name: "Micro: Essence of Mind",
                type: "micro",
                description: "Mind as a filtering lens of perception → worldview; development = polishing/studying the lens",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-5-cognitive-distortions",
                order: 5,
                name: "Micro: Cognitive Distortions",
                type: "micro",
                description: "Key distortions per Spiral Dynamics stage; extreme manifestations in human mind",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-6-distortion-discovery",
                order: 6,
                name: "Distortion Discovery",
                type: "activation",
                description: "Immersive experience connecting you to YOUR key distortions",
                duration: "10 min",
                xpReward: 150,
            },
            {
                id: "m-7-thinking-patterns",
                order: 7,
                name: "Micro: Thinking Patterns",
                type: "micro",
                description: "Different thinking patterns per developmental stage; clear examples; developmental sequence as mind matures",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-8-blind-spots",
                order: 8,
                name: "Micro: Blind Spots by Stage",
                type: "micro",
                description: "How each stage gets stuck; the conundrum it tries to resolve; how it finally resolves",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-9-perspectives",
                order: 9,
                name: "Micro: Perspectives",
                type: "micro",
                description: "Ego-centric → Ethnocentric → World-centric → Cosmo-centric; 1st/2nd/3rd/4th/5th person",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-10-quadrants",
                order: 10,
                name: "Micro: Quadrants",
                type: "micro",
                description: "I/We/It/Its — the four fundamental perspectives",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-11-lines",
                order: 11,
                name: "Micro: Lines (Multiple Intelligences)",
                type: "micro",
                description: "Cognitive, emotional, moral, interpersonal, etc.",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-12-types",
                order: 12,
                name: "Micro: Types",
                type: "micro",
                description: "Horizontal variety at each level (masculine/feminine, Enneagram, etc.)",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-13-holistic",
                order: 13,
                name: "Micro: Holistic Thinking",
                type: "micro",
                description: "Thinking in interconnected wholes",
                duration: "90s",
                xpReward: 30,
            },
            {
                id: "m-14-holonic",
                order: 14,
                name: "Micro: Holonic Thinking",
                type: "micro",
                description: "Thinking in holons — the structure that repeats at every level",
                duration: "90s",
                xpReward: 30,
            },
        ],
    },

    // ==================== EMOTIONS (CLEANING UP) ====================
    {
        id: "emotions",
        name: "Emotions",
        subtitle: "Cleaning Up",
        tagline: "Shadow · Emotions · Healing",
        description: "Integrate your shadow, heal trauma, develop emotional literacy, and repair your nervous system.",
        color: "#4361ee",
        iconType: "droplet",
        upgrades: [
            {
                id: "e-1-baseline",
                order: 1,
                name: "Emotional Baseline",
                type: "assessment",
                description: "What's my current emotional range?",
                xpReward: 50,
            },
            {
                id: "e-2-vocabulary",
                order: 2,
                name: "Emotion Vocabulary",
                type: "micro",
                description: "Expand what I can name and feel",
                unlocksAfter: ["e-1-baseline"],
                xpReward: 30,
            },
            {
                id: "e-3-trigger-map",
                order: 3,
                name: "Trigger Map",
                type: "assessment",
                description: "Identify my top triggers",
                unlocksAfter: ["e-2-vocabulary"],
                xpReward: 75,
            },
            {
                id: "e-4-release",
                order: 4,
                name: "Release Activation",
                type: "activation",
                description: "Somatic/breathwork release",
                unlocksAfter: ["e-3-trigger-map"],
                xpReward: 150,
            },
            {
                id: "e-5-shadow-basics",
                order: 5,
                name: "Micro: Shadow Basics",
                type: "micro",
                description: "Projection, repression, integration",
                unlocksAfter: ["e-3-trigger-map"],
                xpReward: 30,
            },
            {
                id: "e-6-shadow-encounter",
                order: 6,
                name: "Shadow Encounter",
                type: "activation",
                description: "Meet a shadow aspect (guided)",
                unlocksAfter: ["e-5-shadow-basics"],
                xpReward: 200,
            },
            {
                id: "e-7-integration",
                order: 7,
                name: "Integration Activation",
                type: "activation",
                description: "Bring shadow into wholeness",
                unlocksAfter: ["e-6-shadow-encounter"],
                xpReward: 300,
            },
            {
                id: "e-8-sovereignty",
                order: 8,
                name: "Emotional Sovereignty",
                type: "micro",
                description: "Feel without being consumed",
                unlocksAfter: ["e-7-integration"],
                xpReward: 50,
            },
        ],
    },

    // ==================== BODY ====================
    {
        id: "body",
        name: "Body",
        subtitle: "Foundation",
        tagline: "Body · Energy · Environment",
        description: "The foundation of everything. Energy, mobility, capacity, nervous system, and environment design.",
        color: "#2d6a4f",
        iconType: "dumbbell",
        upgrades: [
            {
                id: "b-1-baseline",
                order: 1,
                name: "Body Baseline",
                type: "assessment",
                description: "Current energy, mobility, capacity",
                xpReward: 50,
            },
            {
                id: "b-2-somatic-awareness",
                order: 2,
                name: "Somatic Awareness Activation",
                type: "activation",
                description: "Attune to body signals",
                unlocksAfter: ["b-1-baseline"],
                xpReward: 100,
            },
            {
                id: "b-3-energy-audit",
                order: 3,
                name: "Energy Audit",
                type: "assessment",
                description: "Where do I leak/gain energy?",
                unlocksAfter: ["b-2-somatic-awareness"],
                xpReward: 75,
            },
            {
                id: "b-4-stress-response",
                order: 4,
                name: "Stress Response Map",
                type: "assessment",
                description: "Fight/flight/freeze patterns",
                unlocksAfter: ["b-2-somatic-awareness"],
                xpReward: 75,
            },
            {
                id: "b-5-nervous-system",
                order: 5,
                name: "Nervous System Activation",
                type: "activation",
                description: "Shift nervous system state",
                unlocksAfter: ["b-4-stress-response"],
                xpReward: 150,
            },
            {
                id: "b-6-recovery",
                order: 6,
                name: "Micro: Recovery Science",
                type: "micro",
                description: "Sleep, restoration, recovery",
                unlocksAfter: ["b-3-energy-audit"],
                xpReward: 30,
            },
            {
                id: "b-7-reset",
                order: 7,
                name: "Full Body Reset",
                type: "activation",
                description: "Complete activation/reset",
                unlocksAfter: ["b-5-nervous-system"],
                xpReward: 200,
            },
            {
                id: "b-8-integration",
                order: 8,
                name: "Body-Mind Integration",
                type: "activation",
                description: "Embody mental/emotional shifts",
                unlocksAfter: ["b-7-reset"],
                xpReward: 300,
            },
        ],
    },
];

// Helper functions
export const getPathById = (id: string): GrowthPath | undefined => {
    return growthPaths.find(path => path.id === id);
};

export const getUpgradeById = (pathId: string, upgradeId: string): Upgrade | undefined => {
    const path = getPathById(pathId);
    return path?.upgrades.find(u => u.id === upgradeId);
};

export const getPathIcon = (iconType: GrowthPath['iconType']) => {
    switch (iconType) {
        case 'sparkles': return Sparkles;
        case 'crown': return Crown;
        case 'droplet': return Droplet;
        case 'sun': return Sun;
        case 'dumbbell': return Dumbbell;
        default: return Sparkles;
    }
};
