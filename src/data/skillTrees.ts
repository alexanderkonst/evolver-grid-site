import { Sparkles, Crown, Droplet, Sun, TreeDeciduous } from "lucide-react";

// Custom icon URLs (hosted externally)
const wakingUpIcon = "https://i.imgur.com/oUfcX6u.jpeg";
const growingUpIcon = "https://i.imgur.com/IKYoNej.jpeg";
const cleaningUpIcon = "https://i.imgur.com/opqt3kV.jpeg";
const showingUpIcon = "https://i.imgur.com/6ct5Dca.jpeg";
const groundingIcon = "https://i.imgur.com/NdNMFFa.jpeg";

// Types
export interface SkillNode {
    id: string;
    name: string;
    description: string;
    position: { x: number; y: number }; // percentage 0-100
    prerequisites: string[];
    quests: string[]; // practice IDs from Library
    xpReward: number;
}

export interface SkillTree {
    id: string;
    name: string;
    tagline: string;
    description: string;
    color: string; // primary accent color
    bgGradient: string; // gradient for tree section
    icon: typeof Sparkles; // lucide icon as fallback
    iconImage?: string; // custom image icon
    nodes: SkillNode[];
}

// The 5 Skill Trees
export const skillTrees: SkillTree[] = [
    {
        id: "waking-up",
        name: "Waking Up",
        tagline: "Spirit · Awareness · Presence",
        description: "Develop your capacity for awareness, sensitivity, presence, and love. Practices include meditation, breathwork, nondual glimpses, and heart-opening.",
        color: "#9b5de5", // violet
        bgGradient: "from-violet-950/50 via-purple-900/30 to-transparent",
        icon: Sparkles,
        iconImage: wakingUpIcon,
        nodes: [
            {
                id: "wu-awareness-101",
                name: "Awareness 101",
                description: "Notice when you're lost in thought vs. present. The foundation of all inner work.",
                position: { x: 50, y: 15 },
                prerequisites: [],
                quests: [],
                xpReward: 50,
            },
            {
                id: "wu-breath-anchor",
                name: "Breath as Anchor",
                description: "Use the breath to return to now. A simple but profound skill.",
                position: { x: 35, y: 30 },
                prerequisites: ["wu-awareness-101"],
                quests: [],
                xpReward: 75,
            },
            {
                id: "wu-body-scan",
                name: "Body Scan",
                description: "Move attention through the body. Feel what's alive in you.",
                position: { x: 65, y: 30 },
                prerequisites: ["wu-awareness-101"],
                quests: [],
                xpReward: 75,
            },
            {
                id: "wu-witness-state",
                name: "Witness State",
                description: "Rest as the one who observes. Begin to taste non-dual awareness.",
                position: { x: 50, y: 50 },
                prerequisites: ["wu-breath-anchor", "wu-body-scan"],
                quests: [],
                xpReward: 150,
            },
            {
                id: "wu-heart-opening",
                name: "Heart Opening",
                description: "Practices that soften the heart and expand your capacity for love.",
                position: { x: 30, y: 65 },
                prerequisites: ["wu-witness-state"],
                quests: [],
                xpReward: 200,
            },
            {
                id: "wu-nondual-glimpse",
                name: "Nondual Glimpse",
                description: "Taste the recognition that awareness and its contents are not two.",
                position: { x: 70, y: 65 },
                prerequisites: ["wu-witness-state"],
                quests: [],
                xpReward: 200,
            },
            {
                id: "wu-abiding-presence",
                name: "Abiding Presence",
                description: "Presence becomes your natural state, not just a practice.",
                position: { x: 50, y: 85 },
                prerequisites: ["wu-heart-opening", "wu-nondual-glimpse"],
                quests: [],
                xpReward: 500,
            },
        ],
    },
    {
        id: "growing-up",
        name: "Growing Up",
        tagline: "Meaning · Maturity · Responsibility",
        description: "Develop your worldview, emotional adulthood, and capacity to take full responsibility for your life and contribution.",
        color: "#f5a623", // gold/amber
        bgGradient: "from-amber-950/50 via-orange-900/30 to-transparent",
        icon: Crown,
        iconImage: growingUpIcon,
        nodes: [
            {
                id: "gu-self-honesty",
                name: "Self-Honesty",
                description: "See yourself clearly. Stop the subtle lies we tell ourselves.",
                position: { x: 50, y: 15 },
                prerequisites: [],
                quests: [],
                xpReward: 50,
            },
            {
                id: "gu-own-your-story",
                name: "Own Your Story",
                description: "Take authorship of your narrative. You are not a victim.",
                position: { x: 30, y: 35 },
                prerequisites: ["gu-self-honesty"],
                quests: [],
                xpReward: 100,
            },
            {
                id: "gu-complexity-tolerance",
                name: "Complexity Tolerance",
                description: "Hold paradox, nuance, and 'both/and' thinking.",
                position: { x: 70, y: 35 },
                prerequisites: ["gu-self-honesty"],
                quests: [],
                xpReward: 100,
            },
            {
                id: "gu-responsibility",
                name: "Radical Responsibility",
                description: "Everything in your life is your creation. Act accordingly.",
                position: { x: 50, y: 55 },
                prerequisites: ["gu-own-your-story"],
                quests: [],
                xpReward: 150,
            },
            {
                id: "gu-meaning-making",
                name: "Meaning Making",
                description: "Craft a worldview that serves you, others, and truth.",
                position: { x: 50, y: 80 },
                prerequisites: ["gu-complexity-tolerance", "gu-responsibility"],
                quests: [],
                xpReward: 300,
            },
        ],
    },
    {
        id: "cleaning-up",
        name: "Cleaning Up",
        tagline: "Shadow · Emotions · Healing",
        description: "Integrate your shadow, heal trauma, develop emotional literacy, and repair your nervous system.",
        color: "#4361ee", // deep indigo
        bgGradient: "from-indigo-950/50 via-blue-900/30 to-transparent",
        icon: Droplet,
        iconImage: cleaningUpIcon,
        nodes: [
            {
                id: "cu-feel-feelings",
                name: "Feel Your Feelings",
                description: "Basic emotional literacy. Name it to tame it.",
                position: { x: 50, y: 15 },
                prerequisites: [],
                quests: [],
                xpReward: 50,
            },
            {
                id: "cu-trigger-tracking",
                name: "Trigger Tracking",
                description: "Notice what activates you. Map your reactive patterns.",
                position: { x: 35, y: 35 },
                prerequisites: ["cu-feel-feelings"],
                quests: [],
                xpReward: 75,
            },
            {
                id: "cu-nervous-system",
                name: "Nervous System Basics",
                description: "Understand fight/flight/freeze/fawn. Know your window of tolerance.",
                position: { x: 65, y: 35 },
                prerequisites: ["cu-feel-feelings"],
                quests: [],
                xpReward: 75,
            },
            {
                id: "cu-shadow-spotting",
                name: "Shadow Spotting",
                description: "Recognize your projections. Meet what you've disowned.",
                position: { x: 30, y: 60 },
                prerequisites: ["cu-trigger-tracking"],
                quests: [],
                xpReward: 150,
            },
            {
                id: "cu-somatic-release",
                name: "Somatic Release",
                description: "Let the body complete what the mind can't process.",
                position: { x: 70, y: 60 },
                prerequisites: ["cu-nervous-system"],
                quests: [],
                xpReward: 150,
            },
            {
                id: "cu-integration",
                name: "Integration",
                description: "Welcome all parts. Nothing to hide, nothing to fix.",
                position: { x: 50, y: 85 },
                prerequisites: ["cu-shadow-spotting", "cu-somatic-release"],
                quests: [],
                xpReward: 400,
            },
        ],
    },
    {
        id: "showing-up",
        name: "Showing Up",
        tagline: "Mission · Contribution · Impact",
        description: "Discover and express your dharmic path. Entrepreneurship, service, leadership, and venture-building.",
        color: "#ff6b35", // orange/coral
        bgGradient: "from-orange-950/50 via-red-900/30 to-transparent",
        icon: Sun,
        iconImage: showingUpIcon,
        nodes: [
            {
                id: "su-zone-of-genius",
                name: "Zone of Genius",
                description: "Know your unique gifts. What only you can do.",
                position: { x: 50, y: 15 },
                prerequisites: [],
                quests: [],
                xpReward: 100,
            },
            {
                id: "su-values-clarity",
                name: "Values Clarity",
                description: "What matters most to you? Align action with values.",
                position: { x: 30, y: 35 },
                prerequisites: ["su-zone-of-genius"],
                quests: [],
                xpReward: 75,
            },
            {
                id: "su-offer-creation",
                name: "Offer Creation",
                description: "Turn your genius into something people can say yes to.",
                position: { x: 70, y: 35 },
                prerequisites: ["su-zone-of-genius"],
                quests: [],
                xpReward: 100,
            },
            {
                id: "su-visibility",
                name: "Visibility",
                description: "Be seen. Share your work. Let people find you.",
                position: { x: 30, y: 60 },
                prerequisites: ["su-offer-creation"],
                quests: [],
                xpReward: 150,
            },
            {
                id: "su-sustainable-rhythm",
                name: "Sustainable Rhythm",
                description: "Build systems that let you create without burning out.",
                position: { x: 70, y: 60 },
                prerequisites: ["su-offer-creation"],
                quests: [],
                xpReward: 150,
            },
            {
                id: "su-mission",
                name: "Living Your Mission",
                description: "Your work IS your practice. No separation.",
                position: { x: 50, y: 85 },
                prerequisites: ["su-visibility", "su-sustainable-rhythm", "su-values-clarity"],
                quests: [],
                xpReward: 500,
            },
        ],
    },
    {
        id: "grounding",
        name: "Grounding",
        tagline: "Body · Foundation · Environment",
        description: "HRV, movement, strength, posture, breath, sleep, home — the foundation of everything.",
        color: "#2d6a4f", // forest green
        bgGradient: "from-green-950/50 via-emerald-900/30 to-transparent",
        icon: TreeDeciduous,
        iconImage: groundingIcon,
        nodes: [
            {
                id: "gr-sleep-hygiene",
                name: "Sleep Hygiene",
                description: "The foundation of recovery. Master your sleep environment and rhythm.",
                position: { x: 50, y: 15 },
                prerequisites: [],
                quests: [],
                xpReward: 50,
            },
            {
                id: "gr-breath-basics",
                name: "Breath Basics",
                description: "Nasal breathing, diaphragmatic breath, basic coherence.",
                position: { x: 30, y: 30 },
                prerequisites: [],
                quests: [],
                xpReward: 50,
            },
            {
                id: "gr-daily-movement",
                name: "Daily Movement",
                description: "Move every day. It doesn't have to be intense.",
                position: { x: 70, y: 30 },
                prerequisites: [],
                quests: [],
                xpReward: 50,
            },
            {
                id: "gr-hrv-tracking",
                name: "HRV Tracking",
                description: "Measure your nervous system readiness. Objective feedback.",
                position: { x: 30, y: 55 },
                prerequisites: ["gr-sleep-hygiene", "gr-breath-basics"],
                quests: [],
                xpReward: 100,
            },
            {
                id: "gr-strength-base",
                name: "Strength Foundation",
                description: "Basic resistance training. Build structural integrity.",
                position: { x: 70, y: 55 },
                prerequisites: ["gr-daily-movement"],
                quests: [],
                xpReward: 100,
            },
            {
                id: "gr-environment-design",
                name: "Environment Design",
                description: "Your home and workspace shape you. Design them consciously.",
                position: { x: 50, y: 75 },
                prerequisites: ["gr-hrv-tracking"],
                quests: [],
                xpReward: 150,
            },
            {
                id: "gr-embodied-presence",
                name: "Embodied Presence",
                description: "Your body becomes your ally. Ground for everything else.",
                position: { x: 50, y: 90 },
                prerequisites: ["gr-strength-base", "gr-environment-design"],
                quests: [],
                xpReward: 300,
            },
        ],
    },
];

// Helper to get a tree by ID
export const getTreeById = (id: string): SkillTree | undefined => {
    return skillTrees.find(tree => tree.id === id);
};

// Helper to get a node by tree and node ID
export const getNodeById = (treeId: string, nodeId: string): SkillNode | undefined => {
    const tree = getTreeById(treeId);
    return tree?.nodes.find(node => node.id === nodeId);
};
