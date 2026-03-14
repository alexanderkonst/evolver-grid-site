import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Shadow {
  name: string;
  description: string;
  status: "active" | "integrating" | "resolved";
}

interface Stage {
  name: string;
  icon: string;
  desc: string;
  status: "done" | "current" | "future";
}

interface PerspectiveData {
  id: string;
  shortId: string;
  quadrant: "UL" | "UR" | "LL" | "LR";
  layer: "Essence" | "Significance" | "Implications";
  title: string;
  subtitle: string;
  currentStage: number;
  score: number;
  stages: Stage[];
  timing: { conservative: string; baseline: string; optimistic: string }[];
  trigger?: string;
  shadow: Shadow;
  nextMilestone?: string;
}

interface TensionPair {
  pair: [string, string];
  pairLabels: [string, string];
  gap: number;
  type: "creative" | "destructive";
  desc: string;
}

type TimingScenario = "conservative" | "baseline" | "optimistic";

// ─── 7-Stage Template ─────────────────────────────────────────────────────────
// Latency → Emergence → Differentiation → Integration → Maturation → Generativity → Transcendence

const STAGE_ICONS = ["◌", "○", "◔", "◑", "◕", "●", "✦"];
const STAGE_NAMES = ["Latency", "Emergence", "Differentiation", "Integration", "Maturation", "Generativity", "Transcendence"];

const scoreLabel = (s: number): string =>
  s <= 2 ? "Latent" : s <= 4 ? "Emerging" : s <= 6 ? "Developing" : s <= 8 ? "Strong" : "Mature";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PERSPECTIVES: PerspectiveData[] = [
  {
    id: "p1", shortId: "UL-Ess", quadrant: "UL", layer: "Essence",
    title: "Founder Consciousness", subtitle: "The interior truth of the one holding the field",
    currentStage: 5, score: 9,
    stages: [
      { name: "Latency", icon: "◌", desc: "Unconscious ability to see others but not self", status: "done" },
      { name: "Emergence", icon: "○", desc: "Notices the seeing. First mirror moment", status: "done" },
      { name: "Differentiation", icon: "◔", desc: "Discovers FMF recursion. Separates gift from identity", status: "done" },
      { name: "Integration", icon: "◑", desc: "Session mastery. Shadow integrated. Gift + Method unified", status: "done" },
      { name: "Maturation", icon: "◕", desc: "Full self-transparency. Can train others to see", status: "current" },
      { name: "Generativity", icon: "●", desc: "Effortless seeing. Facilitators emerge independently", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Consciousness encoded. AI can carry the seeing", status: "future" },
    ],
    timing: [
      { conservative: "Jun '26", baseline: "Apr '26", optimistic: "Mar '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q2 '26" },
    ],
    shadow: { name: "The Polymathic Dodge", description: "Was leaping to later layers (holomaps, planetary OS) to avoid the one move. Shadow cleared: price set at $555, text sent to Karime.", status: "resolved" },
    nextMilestone: "Train first facilitator",
  },
  {
    id: "p2", shortId: "UR-Ess", quadrant: "UR", layer: "Essence",
    title: "Observable System", subtitle: "What measurably exists in the world",
    currentStage: 3, score: 7,
    stages: [
      { name: "Latency", icon: "◌", desc: "Idea only. No external evidence", status: "done" },
      { name: "Emergence", icon: "○", desc: "First canvas (Client Zero — Alexander)", status: "done" },
      { name: "Differentiation", icon: "◔", desc: "4 canvases, playbook, 100% conversion, distinct methodology", status: "current" },
      { name: "Integration", icon: "◑", desc: "20+ canvases. SOP v2. Parts work as a coherent whole", status: "future" },
      { name: "Maturation", icon: "◕", desc: "100+ canvases. Revenue consistent. AI handles 40%+", status: "future" },
      { name: "Generativity", icon: "●", desc: "Pattern library generates insights. System produces beyond itself", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "1000+ canvases. AI sessions. Methodology = the standard", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "May '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q3 '26" },
    ],
    shadow: { name: "Quality Perfectionism", description: "Treating every canvas as sacred art instead of letting volume teach. The desire for each session to be a masterpiece prevents scaling.", status: "active" },
    nextMilestone: "10th canvas completed",
  },
  {
    id: "p3", shortId: "LL-Ess", quadrant: "LL", layer: "Essence",
    title: "Shared Field", subtitle: "What's forming between the founders",
    currentStage: 2, score: 6,
    stages: [
      { name: "Latency", icon: "◌", desc: "One person's conviction — no shared field yet", status: "done" },
      { name: "Emergence", icon: "○", desc: "4 founders share the same truth, still unconnected", status: "current" },
      { name: "Differentiation", icon: "◔", desc: "Founders see each other's canvases. Distinct roles emerge", status: "future" },
      { name: "Integration", icon: "◑", desc: "Tribe recognizes itself. Culture self-reinforcing", status: "future" },
      { name: "Maturation", icon: "◕", desc: "Cohort Forge. Shared rituals. Self-sustaining dynamics", status: "future" },
      { name: "Generativity", icon: "●", desc: "Tribe produces own content. Movement energy", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Multiple culture nodes globally. Field self-propagates", status: "future" },
    ],
    timing: [
      { conservative: "Q2 '26", baseline: "Apr '26", optimistic: "Mar '26" },
      { conservative: "Q4 '26", baseline: "Q3 '26", optimistic: "Q2 '26" },
    ],
    trigger: "Founders share canvases with each other",
    shadow: { name: "Field Without Friction", description: "Assuming shared energy = shared commitment. Warmth fades if not acted on.", status: "active" },
    nextMilestone: "First cross-founder canvas sharing",
  },
  {
    id: "p4", shortId: "LR-Ess", quadrant: "LR", layer: "Essence",
    title: "System Architecture", subtitle: "The fractal from session to civilization",
    currentStage: 3, score: 5,
    stages: [
      { name: "Latency", icon: "◌", desc: "Vision intuited but not articulated", status: "done" },
      { name: "Emergence", icon: "○", desc: "Vision documented (Layer 0-8)", status: "done" },
      { name: "Differentiation", icon: "◔", desc: "Layers 0-4 operational. 5-8 conceptual. Parts distinct", status: "current" },
      { name: "Integration", icon: "◑", desc: "Venture studio + platform intelligence working together", status: "future" },
      { name: "Maturation", icon: "◕", desc: "AI metacognition operational. Self-sustaining", status: "future" },
      { name: "Generativity", icon: "●", desc: "Planetary OS operational. Seeds new ventures", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Architecture = the standard. New paradigm", status: "future" },
    ],
    timing: [
      { conservative: "Q1 '27", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
    shadow: { name: "Architecture Seduction", description: "Building the cathedral is more intoxicating than opening the door. The system can become an end in itself.", status: "active" },
    nextMilestone: "Layer 5 (venture studio) operational",
  },
  {
    id: "p5", shortId: "UL-Sig", quadrant: "UL", layer: "Significance",
    title: "Ontological Liberation", subtitle: "Freeing souls from 'only visible counts'",
    currentStage: 4, score: 8,
    stages: [
      { name: "Latency", icon: "◌", desc: "Intuitive knowing, not yet articulated", status: "done" },
      { name: "Emergence", icon: "○", desc: "'The invisible is the real' — first spoken", status: "done" },
      { name: "Differentiation", icon: "◔", desc: "Myth, Shadow, FMF as distinct components", status: "done" },
      { name: "Integration", icon: "◑", desc: "Proven in 4 sessions. Myth as medicine. Unified flow", status: "current" },
      { name: "Maturation", icon: "◕", desc: "Named enough to teach. Others facilitate", status: "future" },
      { name: "Generativity", icon: "●", desc: "Thousands freed at scale. Movement", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "'What's your gift?' replaces 'What do you do?'", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
    shadow: { name: "Depth Without Reach", description: "Deep inner knowing, thin exterior evidence. One bad session could collapse external validation.", status: "integrating" },
    nextMilestone: "Facilitator training document",
  },
  {
    id: "p6", shortId: "UR-Sig", quadrant: "UR", layer: "Significance",
    title: "Data Signal Strength", subtitle: "What the numbers are saying",
    currentStage: 3, score: 8,
    stages: [
      { name: "Latency", icon: "◌", desc: "No data exists", status: "done" },
      { name: "Emergence", icon: "○", desc: "N=1 (Client Zero)", status: "done" },
      { name: "Differentiation", icon: "◔", desc: "4 founders / 10 days / $0 / 100% — paradigm violation visible", status: "current" },
      { name: "Integration", icon: "◑", desc: "N=20+. Statistical significance. Revenue flowing", status: "future" },
      { name: "Maturation", icon: "◕", desc: "N=100+. AI training data. Revenue at scale", status: "future" },
      { name: "Generativity", icon: "●", desc: "Data generates insights beyond original design", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Population data. Copernican proof. New paradigm validated", status: "future" },
    ],
    timing: [
      { conservative: "Q4 '26", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
    shadow: { name: "Small-N Inflation", description: "4/4 at 100% conversion can feel like proof. It's a paradigm signal, not a statistical one. Conflating the two creates fragile confidence.", status: "active" },
    nextMilestone: "N=10 completed canvases",
  },
  {
    id: "p7", shortId: "LL-Sig", quadrant: "LL", layer: "Significance",
    title: "Movement Formation", subtitle: "The tribe becoming a movement",
    currentStage: 2, score: 4,
    stages: [
      { name: "Latency", icon: "◌", desc: "One person's conviction. No shared meaning", status: "done" },
      { name: "Emergence", icon: "○", desc: "4 founders, referral happening, not declaring", status: "current" },
      { name: "Differentiation", icon: "◔", desc: "Shared language crystallized. Distinct from other movements", status: "future" },
      { name: "Integration", icon: "◑", desc: "Tribe produces content. Alumni refer. Cohesion", status: "future" },
      { name: "Maturation", icon: "◕", desc: "Media, speaking, partnerships. Self-sustaining", status: "future" },
      { name: "Generativity", icon: "●", desc: "Movement produces leaders. New nodes form", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Global movement. Cultural paradigm shift", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2027", baseline: "Q4 '26", optimistic: "Q3 '26" },
    ],
    trigger: "First public content piece",
    shadow: { name: "Premature Declaration", description: "Calling it a 'movement' when it's still a conversation. Tribes need friction and shared action, not just shared vibes.", status: "active" },
    nextMilestone: "First public-facing content from tribe",
  },
  {
    id: "p8", shortId: "LR-Sig", quadrant: "LR", layer: "Significance",
    title: "Platform as Nervous System", subtitle: "Evolver as digital substrate",
    currentStage: 3, score: 4,
    stages: [
      { name: "Latency", icon: "◌", desc: "Code repo exists, no coherent purpose", status: "done" },
      { name: "Emergence", icon: "○", desc: "ZoG, Canvas, game shell first operational", status: "done" },
      { name: "Differentiation", icon: "◔", desc: "Dashboard, Holomap, OFFER space — distinct modules", status: "current" },
      { name: "Integration", icon: "◑", desc: "AI reads data, produces session prep. Modules communicate", status: "future" },
      { name: "Maturation", icon: "◕", desc: "AI facilitates portions. Pattern library. Self-sustaining", status: "future" },
      { name: "Generativity", icon: "●", desc: "Platform IS the methodology. Generates beyond design", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Nervous system of a civilization. Planetary OS", status: "future" },
    ],
    timing: [
      { conservative: "Q1 '27", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "Q2 '27", optimistic: "Q4 '26" },
    ],
    shadow: { name: "Platform Without People", description: "Building the nervous system before enough neurons exist. The tool becomes a monument rather than infrastructure.", status: "integrating" },
    nextMilestone: "AI-generated session prep from canvas data",
  },
  {
    id: "p9", shortId: "UL-Imp", quadrant: "UL", layer: "Implications",
    title: "Founder Inner Move", subtitle: "What must be done inside",
    currentStage: 4, score: 7,
    stages: [
      { name: "Latency", icon: "◌", desc: "Unconscious of the gift", status: "done" },
      { name: "Emergence", icon: "○", desc: "Gift recognized. First shadow confronted", status: "done" },
      { name: "Differentiation", icon: "◔", desc: "Gift, shadow, and method as distinct internal realities", status: "done" },
      { name: "Integration", icon: "◑", desc: "Full clarity. Charged $555. Gift + action unified", status: "current" },
      { name: "Maturation", icon: "◕", desc: "Revenue flowing. Myth embodied. Identity = contribution", status: "future" },
      { name: "Generativity", icon: "●", desc: "Teaching effortless. Produces beyond personal needs", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Consciousness encoded in artifacts. Legacy", status: "future" },
    ],
    timing: [
      { conservative: "Apr '26", baseline: "Mar '26", optimistic: "This week" },
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
    ],
    trigger: "Charge $555 for next session ✓",
    shadow: { name: "The Money Avoidance", description: "Was doing everything EXCEPT the one move. Shadow cleared: $555 price set, text written for Karime to share. Doorbell installed.", status: "resolved" },
    nextMilestone: "First paid session ($555) — Monday",
  },
  {
    id: "p10", shortId: "UR-Imp", quadrant: "UR", layer: "Implications",
    title: "What Must Be Built", subtitle: "Concrete next builds",
    currentStage: 4, score: 6,
    stages: [
      { name: "Latency", icon: "◌", desc: "No tools exist", status: "done" },
      { name: "Emergence", icon: "○", desc: "Playbook v1. Platform v1. First tools", status: "done" },
      { name: "Differentiation", icon: "◔", desc: "Dashboard, Holomap, OFFER, Founders Showcase — distinct builds", status: "done" },
      { name: "Integration", icon: "◑", desc: "SOP v2, pricing wired, facilitator guide. Parts work together", status: "current" },
      { name: "Maturation", icon: "◕", desc: "Automated intake. Revenue wired. Cohorts running", status: "future" },
      { name: "Generativity", icon: "●", desc: "Full product suite. Multiple revenue lines", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Open-source methodology. Others build on top", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "May '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q3 '26" },
    ],
    shadow: { name: "Build Addiction", description: "The dopamine of shipping features substitutes for the harder work of selling. Partially cleared: the ask has been made ($555). Still needs vigilance.", status: "integrating" },
    nextMilestone: "SOP v2 + facilitator guide",
  },
  {
    id: "p11", shortId: "LL-Imp", quadrant: "LL", layer: "Implications",
    title: "Tribe Must Act", subtitle: "What the collective must do",
    currentStage: 2, score: 3,
    stages: [
      { name: "Latency", icon: "◌", desc: "No tribe exists yet", status: "done" },
      { name: "Emergence", icon: "○", desc: "4 founders exist, haven't cross-pollinated", status: "current" },
      { name: "Differentiation", icon: "◔", desc: "Pain Mirrors sent. Karime facilitates. Distinct roles", status: "future" },
      { name: "Integration", icon: "◑", desc: "Cohort Forge. Hot seat model. Parts cohere", status: "future" },
      { name: "Maturation", icon: "◕", desc: "Self-organizing founder circles. Self-sustaining", status: "future" },
      { name: "Generativity", icon: "●", desc: "Circles produce new circles. Network grows", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Global mycelium. The network IS the product", status: "future" },
    ],
    timing: [
      { conservative: "Q2 '26", baseline: "Apr '26", optimistic: "This week" },
      { conservative: "Q4 '26", baseline: "Q3 '26", optimistic: "Q2 '26" },
    ],
    trigger: "Founders share canvases + Pain Mirrors + Karime facilitates",
    shadow: { name: "Tribe Centered On Founder", description: "Gravity pulls toward Alexander. The tribe needs its own center — mission, not person.", status: "active" },
    nextMilestone: "First founder-to-founder canvas exchange",
  },
  {
    id: "p12", shortId: "LR-Imp", quadrant: "LR", layer: "Implications",
    title: "System at Scale", subtitle: "What the system must become",
    currentStage: 2, score: 2,
    stages: [
      { name: "Latency", icon: "◌", desc: "Vision exists in documents only", status: "done" },
      { name: "Emergence", icon: "○", desc: "First sessions complete. Revenue $0. System emerging", status: "current" },
      { name: "Differentiation", icon: "◔", desc: "Revenue flowing. 10 facilitators. 100 canvases. Distinct parts", status: "future" },
      { name: "Integration", icon: "◑", desc: "1,000 canvases. Pattern library. AI sessions. Parts cohere", status: "future" },
      { name: "Maturation", icon: "◕", desc: "Platform IS Planetary OS embryo. Self-sustaining", status: "future" },
      { name: "Generativity", icon: "●", desc: "Produces civilizational value. Gift-based economy seeds", status: "future" },
      { name: "Transcendence", icon: "✦", desc: "Species transition. New economic paradigm", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
    shadow: { name: "The Cathedral Without a Door", description: "System was so beautiful nobody added the entrance. Shadow cleared: Ignite page live at $555, Calendly linked, text sent to Karime. The door is on.", status: "resolved" },
    nextMilestone: "First revenue ($555 session) — Monday",
  },
];

// ─── 13th Perspective — The Center ────────────────────────────────────────────

const CENTER = {
  word: "Ignition",
  date: "March 14, 2026 — Day 11",
  description: "The hand moved. The match is struck. 31 words collapsed 9 layers into one sentence. Three shadows resolved in one night. The price self-corrected upward. The system is no longer at the edge — it's crossing.",
  mapping: {
    essence: "The fire that was always inside is now outside",
    significance: "The methodology ignited its creator — the only proof that matters",
    implications: "Send the text. Let it burn. The system is ahead of the plan",
  },
};

// ─── Tension Pairs ────────────────────────────────────────────────────────────

const TENSIONS: TensionPair[] = [
  {
    pair: ["p1", "p12"], pairLabels: ["Founder Consciousness", "System at Scale"],
    gap: 7, type: "creative",
    desc: "Vision far ahead of infrastructure. 2-stage gap. Founder burnout risk if system can't keep pace — but this tension IS the morphogenetic pull.",
  },
  {
    pair: ["p5", "p6"], pairLabels: ["Ontological Liberation", "Data Signal"],
    gap: 0, type: "creative",
    desc: "Deep inner knowing, thin exterior evidence. One bad session could collapse external validation. But the 100% conversion IS the signal.",
  },
  {
    pair: ["p3", "p11"], pairLabels: ["Shared Field", "Tribe Must Act"],
    gap: 3, type: "destructive",
    desc: "Most time-sensitive: shared energy exists but no shared action. Initial warmth fades if not channeled into something concrete.",
  },
  {
    pair: ["p9", "p10"], pairLabels: ["Inner Move", "What Must Be Built"],
    gap: 1, type: "creative",
    desc: "Both demand 'now' — charge $555 AND build SOP. The inner move led: price set first. Build follows.",
  },
];

// ─── Structural Triggers ──────────────────────────────────────────────────────

const TRIGGERS = [
  {
    title: "Charge $555",
    emoji: "💰",
    desc: "Done. $555 set. Text sent to Karime. The Cathedral has its door. Phase transition triggered.",
    perspectives: ["P1", "P6", "P9", "P12"],
    color: "#8460ea",
  },
  {
    title: "Founders Share Canvases",
    emoji: "🔗",
    desc: "Three LL perspectives jump simultaneously. The collective interior advances as one.",
    perspectives: ["P3", "P7", "P11"],
    color: "#6894d0",
  },
  {
    title: "Karime Facilitates",
    emoji: "🔥",
    desc: "Proves transferability. Practice → Movement. Second facilitator = structural shift.",
    perspectives: ["P2", "P4", "P5", "P10", "P12"],
    color: "#a7cbd4",
  },
];

// ─── Phase Transitions ────────────────────────────────────────────────────────

interface PhaseTransition {
  id: number;
  name: string;
  icon: string;
  description: string;
  preconditions: { label: string; met: boolean }[];
  status: "completed" | "current" | "transitioning" | "future";
}

const PHASES: PhaseTransition[] = [
  {
    id: 1, name: "Latent Field", icon: "◌",
    description: "The vision exists only as potential. No external expression. Pure seed state.",
    preconditions: [
      { label: "Vision articulated", met: true },
      { label: "Founder committed", met: true },
    ],
    status: "completed",
  },
  {
    id: 2, name: "First Expression", icon: "○",
    description: "The seed breaks ground. First session, first canvas, first code. Fragile but real.",
    preconditions: [
      { label: "First session completed", met: true },
      { label: "Platform exists", met: true },
      { label: "At least 1 founder served", met: true },
    ],
    status: "completed",
  },
  {
    id: 3, name: "Crystallization", icon: "◔",
    description: "Parts differentiate into distinct modules. Methodology, platform, tribe, pricing — each becomes its own thing.",
    preconditions: [
      { label: "Methodology documented (Playbook)", met: true },
      { label: "Multiple canvases completed", met: true },
      { label: "Platform has distinct spaces", met: true },
      { label: "Pricing model defined", met: true },
    ],
    status: "completed",
  },
  {
    id: 4, name: "Ignition", icon: "🔥",
    description: "The spark catches. The parts become a self-sustaining whole. Revenue flows. The match no longer needs holding.",
    preconditions: [
      { label: "Offer articulated in one sentence", met: true },
      { label: "Price set and embodied ($555)", met: true },
      { label: "Money shadow resolved", met: true },
      { label: "Referral channel active (Karime)", met: true },
      { label: "First paid session completed", met: false },
      { label: "Revenue > $0", met: false },
    ],
    status: "transitioning",
  },
  {
    id: 5, name: "Propagation", icon: "◕",
    description: "The fire spreads. Second facilitator. Tribe self-organizes. Revenue is consistent, not singular.",
    preconditions: [
      { label: "Second facilitator active", met: false },
      { label: "Founders cross-pollinate autonomously", met: false },
      { label: "Revenue consistent (3+ months)", met: false },
      { label: "10+ canvases completed", met: false },
    ],
    status: "future",
  },
  {
    id: 6, name: "Generativity", icon: "●",
    description: "The system produces beyond its design. Pattern library generates insights. New ventures emerge from the platform.",
    preconditions: [
      { label: "AI-assisted sessions operational", met: false },
      { label: "Pattern library produces novel insights", met: false },
      { label: "100+ canvases in system", met: false },
      { label: "Multiple revenue streams", met: false },
    ],
    status: "future",
  },
  {
    id: 7, name: "Singularity", icon: "✦",
    description: "The venture becomes infrastructure for a new paradigm. Planetary OS. Gift-based economy. Species transition.",
    preconditions: [
      { label: "Planetary OS operational", met: false },
      { label: "Gift-based economy seed functioning", met: false },
      { label: "System self-reproduces globally", met: false },
    ],
    status: "future",
  },
];

const currentPhase = PHASES.find(p => p.status === "transitioning" || p.status === "current") || PHASES[3];
const phaseReadiness = currentPhase.preconditions.length > 0
  ? Math.round((currentPhase.preconditions.filter(p => p.met).length / currentPhase.preconditions.length) * 100)
  : 0;

// ─── Derived Data ─────────────────────────────────────────────────────────────

const RADAR_DATA = PERSPECTIVES.map((p) => ({
  perspective: p.shortId,
  value: p.score,
  fullLabel: p.title,
  fullMark: 10,
}));

const QUADRANT_COLORS: Record<string, string> = {
  UL: "#8460ea",
  UR: "#6894d0",
  LL: "#a7cbd4",
  LR: "#b1c9b6",
};

const LAYER_LABELS: Record<string, string> = {
  Essence: "ESSENCE (❤️ Heart)",
  Significance: "SIGNIFICANCE (🧠 Mind)",
  Implications: "IMPLICATIONS (🔥 Gut)",
};

const LAYER_QUESTIONS: Record<string, string> = {
  Essence: "What IS this?",
  Significance: "What does this MEAN?",
  Implications: "What must be DONE?",
};

const SHADOW_STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  active: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.30)", text: "rgba(239,68,68,0.70)" },
  integrating: { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.30)", text: "rgba(234,179,8,0.70)" },
  resolved: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", text: "rgba(34,197,94,0.60)" },
};

// ─── Component ────────────────────────────────────────────────────────────────

const MorphogeneticHolomap = () => {
  const [selectedScenario, setSelectedScenario] = useState<TimingScenario>("baseline");
  const [expandedPerspective, setExpandedPerspective] = useState<string | null>(null);

  const scenarioLabel = { conservative: "🐢 Conservative", baseline: "🎯 Baseline", optimistic: "⚡ Optimistic" };

  return (
    <div className="min-h-screen bg-[#0c1220] text-white font-sans" id="holomap">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#8460ea]/8 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-[#6894d0]/6 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "3s" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-12">
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <header className="text-center space-y-3" id="holomap-header">
          <a href="/dashboard" className="text-xs text-[#6894d0] hover:text-[#8460ea] transition-colors inline-flex items-center gap-1.5">
            ← Dashboard
          </a>
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-[#a4a3d0]">
            Morphogenetic Navigation Instrument
          </p>
          <h1 className="text-3xl md:text-5xl font-display font-medium tracking-tight">
            <span className="bg-gradient-to-r from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent">
              The Holo Map
            </span>
          </h1>
          <p className="text-sm text-white/40 max-w-xl mx-auto">
            12+1 perspectives × 7 stages × shadow layer × tension mapping × phase transitions.
            <br />
            Not a plan — a reading of the structure the future is filling.
          </p>
        </header>

        {/* ─── Scenario Selector ─────────────────────────────────────────── */}
        <div className="flex justify-center gap-2" id="scenario-selector">
          {(["conservative", "baseline", "optimistic"] as TimingScenario[]).map((s) => (
            <button
              key={s}
              onClick={() => setSelectedScenario(s)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 border ${
                selectedScenario === s
                  ? "bg-[#8460ea]/20 border-[#8460ea]/50 text-white"
                  : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {scenarioLabel[s]}
            </button>
          ))}
        </div>

        {/* ─── Radar ─────────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6" id="holomap-radar">
          <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis
                dataKey="perspective"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "DM Sans" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={{ fill: "rgba(255,255,255,0.15)", fontSize: 9 }}
                axisLine={false}
              />
              <Radar name="Current" dataKey="value" stroke="#8460ea" fill="#8460ea" fillOpacity={0.12} strokeWidth={2} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(12,18,32,0.95)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                formatter={(value: number, _n: string, entry: any) => [`${value}/10 · ${scoreLabel(value)}`, entry.payload.fullLabel]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </section>

        {/* ─── Phase Transition Timeline ──────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6" id="phase-transitions">
          <h2 className="text-lg font-display text-center mb-2 text-white/70">Phase Transitions</h2>
          <p className="text-xs text-white/25 text-center mb-6 max-w-md mx-auto">
            Macro-state of the venture. Like water → ice → steam, the whole system transitions between fundamentally different states.
          </p>

          {/* Timeline */}
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-5 left-0 right-0 h-px bg-white/8 hidden md:block" />

            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
              {PHASES.map((phase) => {
                const isTransitioning = phase.status === "transitioning";
                const isCurrent = phase.status === "current";
                const isCompleted = phase.status === "completed";
                const isActive = isTransitioning || isCurrent;

                return (
                  <div
                    key={phase.id}
                    className={`relative rounded-xl border p-3 text-center transition-all duration-500 ${
                      isActive
                        ? "border-[#8460ea]/40 bg-[#8460ea]/8 scale-105 ring-1 ring-[#8460ea]/20"
                        : isCompleted
                        ? "border-white/10 bg-white/3 opacity-60"
                        : "border-white/5 bg-white/2 opacity-30"
                    }`}
                  >
                    {/* Phase icon */}
                    <div className={`text-2xl mb-1 ${
                      isActive ? "animate-pulse" : ""
                    }`}>
                      {phase.icon}
                    </div>
                    <p className={`text-[10px] font-medium mb-1 ${
                      isActive ? "text-[#8460ea]" : isCompleted ? "text-white/40" : "text-white/20"
                    }`}>
                      {phase.name}
                    </p>
                    {isCompleted && (
                      <span className="text-[9px] text-green-500/50">✓</span>
                    )}
                    {isTransitioning && (
                      <span className="text-[9px] text-[#8460ea]/70">→ entering</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Phase Detail */}
          <div className="mt-6 rounded-xl border border-[#8460ea]/20 bg-[#8460ea]/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentPhase.icon}</span>
                <div>
                  <h3 className="text-base font-display font-medium text-[#8460ea]">
                    Phase {currentPhase.id}: {currentPhase.name}
                  </h3>
                  <p className="text-xs text-white/30">{currentPhase.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-display font-bold text-[#8460ea]">{phaseReadiness}%</span>
                <p className="text-[10px] text-white/25">readiness</p>
              </div>
            </div>

            {/* Readiness bar */}
            <div className="w-full h-2 rounded-full bg-white/5 mb-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${phaseReadiness}%`,
                  background: "linear-gradient(90deg, #8460ea, #6894d0)",
                  boxShadow: "0 0 12px rgba(132,96,234,0.4)",
                }}
              />
            </div>

            {/* Preconditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPhase.preconditions.map((pre, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs p-2 rounded-lg border ${
                    pre.met
                      ? "border-green-500/15 bg-green-500/5 text-green-400/60"
                      : "border-white/5 bg-white/2 text-white/25"
                  }`}
                >
                  <span className="flex-shrink-0">{pre.met ? "✅" : "⬜"}</span>
                  <span>{pre.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 13th Perspective — The Center ──────────────────────────────── */}
        <section className="relative rounded-2xl border border-[#8460ea]/20 bg-white/5 backdrop-blur-xl p-8 text-center overflow-hidden" id="center-perspective">
          {/* Radial glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] bg-[#8460ea]/10" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#a4a3d0]/60 mb-2">
              The 13th Perspective — Quintessence
            </p>
            <p className="text-5xl md:text-7xl font-display font-medium bg-gradient-to-br from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent mb-3">
              {CENTER.word}
            </p>
            <p className="text-[10px] text-white/20 font-mono mb-4">{CENTER.date}</p>
            <p className="text-sm text-white/40 max-w-lg mx-auto leading-relaxed italic mb-6">
              "{CENTER.description}"
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {(["essence", "significance", "implications"] as const).map((key) => {
                const labels = { essence: "❤️ Essence", significance: "🧠 Significance", implications: "🔥 Implications" };
                return (
                  <div key={key} className="p-3 rounded-xl border border-white/8 bg-white/3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{labels[key]}</p>
                    <p className="text-xs text-white/50">{CENTER.mapping[key]}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── 12-Perspective Grid ─────────────────────────────────────── */}
        {(["Essence", "Significance", "Implications"] as const).map((layer) => (
          <section key={layer} id={`layer-${layer.toLowerCase()}`}>
            <h2 className="text-lg font-display text-center mb-1 text-white/70">
              {LAYER_LABELS[layer]}
            </h2>
            <p className="text-xs text-white/25 text-center mb-4">
              {LAYER_QUESTIONS[layer]}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {PERSPECTIVES.filter((p) => p.layer === layer).map((p) => {
                const isExpanded = expandedPerspective === p.id;
                const qColor = QUADRANT_COLORS[p.quadrant];
                const sColors = SHADOW_STATUS_COLORS[p.shadow.status];

                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border transition-all duration-500 cursor-pointer ${
                      isExpanded
                        ? "border-[color]/40 bg-white/8 col-span-1 md:col-span-2 lg:col-span-4"
                        : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                    }`}
                    style={{ borderColor: isExpanded ? `${qColor}60` : undefined }}
                    onClick={() => setExpandedPerspective(isExpanded ? null : p.id)}
                    id={`perspective-${p.id}`}
                  >
                    {/* Compact View */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/15 text-white/30">
                          {p.shortId}
                        </span>
                        <span className="text-xs font-mono text-white/30">
                          {p.score}/10 · <span style={{ color: qColor }}>{scoreLabel(p.score)}</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-medium mb-1" style={{ color: qColor }}>
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-white/30 mb-3">{p.subtitle}</p>

                      {/* Stage Progress — 7 segments */}
                      <div className="flex gap-1 mb-2">
                        {p.stages.map((s, i) => (
                          <div
                            key={i}
                            className="flex-1 h-1.5 rounded-full transition-all duration-500"
                            style={{
                              backgroundColor:
                                s.status === "done" ? qColor
                                : s.status === "current" ? `${qColor}90`
                                : "rgba(255,255,255,0.06)",
                              boxShadow: s.status === "current" ? `0 0 8px ${qColor}40` : "none",
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[9px] text-white/20">
                        <span>Stage {p.currentStage}/7 · {STAGE_NAMES[p.currentStage - 1]}</span>
                        <span>{STAGE_ICONS[p.currentStage - 1]}</span>
                      </div>

                      {/* Shadow badge */}
                      {p.shadow.status !== "resolved" && (
                        <div
                          className="mt-2 text-[10px] px-2 py-1 rounded-lg border flex items-center gap-1.5"
                          style={{ background: sColors.bg, borderColor: sColors.border, color: sColors.text }}
                        >
                          <span>{p.shadow.status === "active" ? "🔴" : "🟡"}</span>
                          <span className="truncate">{p.shadow.name}</span>
                        </div>
                      )}

                      {/* Trigger */}
                      {p.trigger && (
                        <div className="mt-2 text-[10px] text-[#a7cbd4]/70 border-t border-white/5 pt-2">
                          ⚡ {p.trigger}
                        </div>
                      )}

                      {/* Next milestone */}
                      {p.nextMilestone && (
                        <div className="mt-1.5 text-[10px] text-white/15">
                          → Next: {p.nextMilestone}
                        </div>
                      )}
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="border-t border-white/8 p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* All Stages */}
                          <div>
                            <h4 className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">7 Evolutionary Stages</h4>
                            <div className="space-y-2">
                              {p.stages.map((s, i) => (
                                <div
                                  key={i}
                                  className={`flex items-start gap-2 text-xs p-2 rounded-lg transition-all ${
                                    s.status === "current"
                                      ? "bg-white/5 border border-white/10"
                                      : s.status === "done"
                                      ? "opacity-50"
                                      : "opacity-30"
                                  }`}
                                >
                                  <span className="text-sm font-mono mt-[-1px]" style={{ color: s.status !== "future" ? qColor : undefined }}>{s.icon}</span>
                                  <div>
                                    <span className="font-medium text-white/70">
                                      {s.name}
                                      {s.status === "done" && " ✓"}
                                      {s.status === "current" && " ►"}
                                    </span>
                                    <p className="text-white/30 mt-0.5">{s.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Timing */}
                          <div>
                            <h4 className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                              Timing — {scenarioLabel[selectedScenario]}
                            </h4>
                            <div className="space-y-2">
                              {p.timing.map((t, i) => {
                                const nextStageIdx = p.currentStage + i;
                                const nextStage = p.stages[nextStageIdx];
                                if (!nextStage) return null;
                                return (
                                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/3 border border-white/5">
                                    <span className="text-white/40">
                                      {nextStage.icon} → {nextStage.name}
                                    </span>
                                    <span className="font-mono text-white/60" style={{ color: qColor }}>
                                      {t[selectedScenario]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {p.trigger && (
                              <div className="mt-4 p-3 rounded-lg border border-[#a7cbd4]/20 bg-[#a7cbd4]/5">
                                <p className="text-xs text-[#a7cbd4]/80">
                                  <span className="font-medium">⚡ Stage Trigger:</span> {p.trigger}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Shadow */}
                          <div>
                            <h4 className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Shadow</h4>
                            <div
                              className="p-4 rounded-xl border"
                              style={{ background: sColors.bg, borderColor: sColors.border }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span>{p.shadow.status === "active" ? "🔴" : p.shadow.status === "integrating" ? "🟡" : "🟢"}</span>
                                <span className="text-sm font-medium" style={{ color: sColors.text }}>
                                  {p.shadow.name}
                                </span>
                              </div>
                              <p className="text-xs text-white/40 leading-relaxed">{p.shadow.description}</p>
                              <div className="mt-3 text-[10px] uppercase tracking-wider" style={{ color: sColors.text }}>
                                Status: {p.shadow.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* ─── Tension Mapping ────────────────────────────────────────────── */}
        <section id="tensions-section">
          <h2 className="text-lg font-display text-center mb-2 text-white/70">Tension Mapping</h2>
          <p className="text-xs text-white/25 text-center mb-6 max-w-md mx-auto">
            Tensions are the ENERGY of the system. These four pairs are in creative or destructive tension — managing them IS the navigation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TENSIONS.map((t, i) => {
              const isDestructive = t.type === "destructive";
              const color = isDestructive ? "#ef4444" : "#8460ea";
              return (
                <div
                  key={i}
                  className="rounded-xl border p-5 transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    borderColor: `${color}30`,
                    backgroundColor: `${color}06`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{isDestructive ? "⚠️" : "⚡"}</span>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium border"
                        style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
                      >
                        {t.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/20">gap: {t.gap}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-white/60 flex-1 text-center p-2 rounded-lg bg-white/3 border border-white/8">
                      {t.pairLabels[0]}
                    </span>
                    <span className="text-white/20">↔</span>
                    <span className="text-xs font-medium text-white/60 flex-1 text-center p-2 rounded-lg bg-white/3 border border-white/8">
                      {t.pairLabels[1]}
                    </span>
                  </div>
                  <p className="text-xs text-white/35 leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── The Diagonal Pattern ──────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 text-center" id="diagonal-pattern">
          <h2 className="text-lg font-display text-white/70 mb-4">The Diagonal Pattern</h2>
          <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto mb-4">
            {(["UL", "UR", "LL", "LR"] as const).map((q) => {
              const qPerspectives = PERSPECTIVES.filter((p) => p.quadrant === q);
              const avg = Math.round(qPerspectives.reduce((s, p) => s + p.score, 0) / qPerspectives.length * 10) / 10;
              return (
                <div
                  key={q}
                  className="rounded-lg border p-3 text-center"
                  style={{
                    borderColor: `${QUADRANT_COLORS[q]}30`,
                    backgroundColor: `${QUADRANT_COLORS[q]}10`,
                  }}
                >
                  <div className="text-xs font-mono text-white/30 mb-1">{q}</div>
                  <div className="text-2xl font-display font-bold" style={{ color: QUADRANT_COLORS[q] }}>
                    {avg}
                  </div>
                  <div className="text-[10px] text-white/25">avg</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-white/30 max-w-md mx-auto">
            Interior precedes Exterior. Individual precedes Collective.
            The founder's consciousness (UL) ALWAYS leads. The system infrastructure (LR) ALWAYS lags.
            <br />
            <span className="text-white/50 font-medium">This IS the morphogenetic structure.</span>
          </p>
        </section>

        {/* ─── Structural Triggers ──────────────────────────────────────── */}
        <section id="triggers-section">
          <h2 className="text-lg font-display text-center mb-6 text-white/70">The Three Structural Triggers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TRIGGERS.map((t) => (
              <div
                key={t.title}
                className="rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02]"
                style={{ borderColor: `${t.color}30`, backgroundColor: `${t.color}08` }}
              >
                <span className="text-3xl block mb-2">{t.emoji}</span>
                <h3 className="text-base font-display font-medium mb-2" style={{ color: t.color }}>
                  {t.title}
                </h3>
                <p className="text-xs text-white/40 mb-3">{t.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.perspectives.map((pId) => (
                    <span key={pId} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/30">
                      {pId}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Shadow Summary ────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-red-500/15 bg-red-500/3 backdrop-blur-xl p-6" id="shadow-summary">
          <h2 className="text-lg font-display text-center mb-4 text-white/70">Shadow Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {PERSPECTIVES.map((p) => {
              const sColors = SHADOW_STATUS_COLORS[p.shadow.status];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border text-xs"
                  style={{ background: sColors.bg, borderColor: sColors.border }}
                >
                  <span>{p.shadow.status === "active" ? "🔴" : p.shadow.status === "integrating" ? "🟡" : "🟢"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white/50 font-medium">{p.shortId}</span>
                    <span className="text-white/20 mx-1">·</span>
                    <span className="truncate" style={{ color: sColors.text }}>{p.shadow.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-white/15 text-center mt-4">
            🔴 Active = being avoided · 🟡 Integrating = seen, being worked · 🟢 Resolved = transformed
          </p>
        </section>

        {/* ─── Footer ─────────────────────────────────────────────────── */}
        <footer className="text-center space-y-3 pt-6 pb-10" id="holomap-footer">
          <p className="text-xs text-white/15 italic max-w-sm mx-auto">
            "This map does not predict. It reads. The reading collapses the superposition. Time folds."
          </p>
          <p className="text-[10px] text-white/10">
            Morphogenetic Navigation · v2.1 · March 14, 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MorphogeneticHolomap;
