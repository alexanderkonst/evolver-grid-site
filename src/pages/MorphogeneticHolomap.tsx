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
  note: string;
  icon: string;
  desc: string;
  status: "done" | "current" | "future";
}

interface PerspectiveData {
  id: string;
  shortId: string;
  quadrant: "UL" | "UR" | "LL" | "LR";
  layer: "Essence" | "Significance" | "Consequences";
  dantian: "heart" | "mind" | "gut";
  octave: "base" | "logos" | "inversion" | "second" | "crystallization";
  title: string;
  subtitle: string;
  currentStage: number;
  score: number;
  stages: Stage[];
  timing: { conservative: string; baseline: string; optimistic: string }[];
  trigger?: string;
  shadow?: Shadow;
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
type DantianFilter = "all" | "heart" | "mind" | "gut";

// ─── 7-Stage Template (Law of Seven) ─────────────────────────────────────────
// Do → Re → Mi → [Mi-Fa shock: LOVE] → Fa → Sol → La → [Si-Do shock: CRYSTALLIZATION] → Si/Do'

const STAGE_ICONS = ["🌰", "🌱", "🌿", "🌳", "🍎", "📡", "🌍"];
const STAGE_NOTES = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si→Do'"];
const STAGE_NAMES = ["Seed", "Sprout", "Growth", "Maturation", "Fruition", "Transmission", "Propagation"];

// Shock bands between stages 3→4 (Mi-Fa) and 6→7 (Si-Do)
const MI_FA_SHOCK = { position: 3, symbol: "💗", name: "LOVE", description: "The holding that lets the form stabilize" };
const SI_DO_SHOCK = { position: 6, symbol: "💎", name: "CRYSTALLIZATION", description: "The moment seeing BECOMES form" };

const scoreLabel = (s: number): string =>
  s <= 2 ? "Seed" : s <= 4 ? "Sprout" : s <= 6 ? "Growth" : s <= 8 ? "Maturing" : "Fruiting";

// ─── Base Octave Data (P1-P12) ───────────────────────────────────────────────

const BASE_PERSPECTIVES: PerspectiveData[] = [
  {
    id: "p1", shortId: "UL-Ess", quadrant: "UL", layer: "Essence", dantian: "heart", octave: "base",
    title: "Founder Consciousness", subtitle: "The interior truth of the one holding the field",
    currentStage: 4, score: 9,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Polymathic consciousness notices it can see others but not itself", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "Discovers FMF: finding others' FMF IS his FMF", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Recursive proof operational. Session mastery. Shadow integrated", status: "done" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Full self-transparency. Can articulate the entire system. Can train others", status: "current" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "The seeing is effortless. Facilitators emerge from watching", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "The signal travels without the apparatus. Emanation observed", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Consciousness is documented as transmittable signal. AI can carry it", status: "future" },
    ],
    timing: [
      { conservative: "Jun '26", baseline: "Apr '26", optimistic: "Mar '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q2 '26" },
    ],
    shadow: { name: "The Polymathic Dodge", description: "Leaping to later layers to avoid the one move. Shadow cleared: price set, action taken.", status: "resolved" },
    nextMilestone: "Train first facilitator",
  },
  {
    id: "p2", shortId: "UR-Ess", quadrant: "UR", layer: "Essence", dantian: "heart", octave: "base",
    title: "Observable System", subtitle: "What measurably exists in the world",
    currentStage: 3, score: 7.5,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Idea only. No external evidence", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First canvas (Client Zero — Alexander)", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "5 canvases, 2000+ line playbook, 100% conversion, platform deployed", status: "current" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "20+ canvases. SOP v2 operational. Facilitators using the system", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "100+ canvases. Revenue consistent. Platform automates 40%+", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Pattern library produces autonomous insights", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "1000+ canvases. AI-facilitated sessions. Methodology = the standard", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "May '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q3 '26" },
    ],
    shadow: { name: "Quality Perfectionism", description: "Treating every canvas as sacred art instead of letting volume teach.", status: "active" },
    nextMilestone: "10th canvas completed",
  },
  {
    id: "p3", shortId: "LL-Ess", quadrant: "LL", layer: "Essence", dantian: "heart", octave: "base",
    title: "Shared Field", subtitle: "What's forming between the founders",
    currentStage: 2, score: 6.5,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "One person's conviction — no shared field yet", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "7 founders carrying the same truth. A 'We' space exists. Founders Showcase live", status: "current" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Founders share canvases with each other. The tribe recognizes itself as a tribe", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Shared language, shared rituals. Cohort-based Forge running. Culture self-reinforcing", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "The tribe produces its own content. Members recruit. Movement energy", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Culture emanates without push. New members find the field", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "The culture is codified enough to form new nodes. Franchise-style cultural transmission", status: "future" },
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
    id: "p4", shortId: "LR-Ess", quadrant: "LR", layer: "Essence", dantian: "heart", octave: "base",
    title: "System Architecture", subtitle: "The fractal from session to civilization",
    currentStage: 2, score: 5,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Vision of a layered system (Layer 0-8). Documented but not operational", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "Layers 0-4 operational. Platform exists but partial. Layers 5-8 conceptual", status: "current" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Layers 5-6 operational (Venture Studio + Platform as intelligence layer)", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Full Layer 7 (AI metacognition — AI facilitating sessions)", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Layer 8 operational (Planetary OS — population-scale)", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "The architecture self-documents. Others adopt without instruction", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "The architecture IS the standard. Other projects build on top of it", status: "future" },
    ],
    timing: [
      { conservative: "Q1 '27", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
    shadow: { name: "Architecture Seduction", description: "Building the cathedral is more intoxicating than opening the door.", status: "active" },
    nextMilestone: "Layer 5 (venture studio) operational",
  },
  {
    id: "p5", shortId: "UL-Sig", quadrant: "UL", layer: "Significance", dantian: "mind", octave: "base",
    title: "Ontological Liberation", subtitle: "Freeing souls from 'only visible counts'",
    currentStage: 3, score: 8.5,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Intuitive knowing that the invisible matters", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "Articulated: 'The invisible is the real'", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Proven in 5 sessions. Each founder liberated from their master lie. Myth as medicine operational", status: "current" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "The liberation is NAMED enough to teach. Others can facilitate the same shift", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Population-scale: thousands freed from visible-only valuation", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "The truth emanates. People arrive already liberated", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Cultural default shifts. 'What's your gift?' replaces 'What do you do?'", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
    shadow: { name: "Depth Without Reach", description: "Deep inner knowing, thin exterior evidence.", status: "integrating" },
    nextMilestone: "Facilitator training document",
  },
  {
    id: "p6", shortId: "UR-Sig", quadrant: "UR", layer: "Significance", dantian: "mind", octave: "base",
    title: "Data Signal Strength", subtitle: "What the numbers are saying",
    currentStage: 3, score: 8,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "No data exists", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "N=1 (Client Zero)", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "5/9/$0/100%. Paradigm violation visible. Signal strong but sample small", status: "current" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "N=20+. Statistical significance. The paradigm violation is undeniable", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "N=100+. Pattern library large enough to train AI. Revenue validates at scale", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Data generates insights beyond original design", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Population data. The Copernican Inversion proven at civilizational scale", status: "future" },
    ],
    timing: [
      { conservative: "Q4 '26", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
    shadow: { name: "Small-N Inflation", description: "4/4 at 100% conversion can feel like proof. It's a paradigm signal, not a statistical one.", status: "active" },
    nextMilestone: "N=10 completed canvases",
  },
  {
    id: "p7", shortId: "LL-Sig", quadrant: "LL", layer: "Significance", dantian: "mind", octave: "base",
    title: "Movement Formation", subtitle: "The tribe becoming a movement",
    currentStage: 4, score: 5.5,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "One person's conviction. No shared meaning", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "7 founders exist. Recognition-based referral happening", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Movement language crystallized. 'Your uniqueness IS your business' becomes meme", status: "done" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "The Collective self-identifies. Tribe produces own content. Alumni refer", status: "current" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Movement recognized externally. Media, speaking invitations, partnerships", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "The myth propagates without push", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Multiple movement nodes globally. Cultural DNA self-replicating", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2027", baseline: "Q4 '26", optimistic: "Q3 '26" },
    ],
    trigger: "First public content piece",
    shadow: { name: "Premature Declaration", description: "Calling it a 'movement' when it's still a conversation.", status: "integrating" },
    nextMilestone: "First public-facing content from tribe",
  },
  {
    id: "p8", shortId: "LR-Sig", quadrant: "LR", layer: "Significance", dantian: "mind", octave: "base",
    title: "Platform as Nervous System", subtitle: "Evolver as digital substrate recording species awakening",
    currentStage: 3, score: 3,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Code repo exists. Features built", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "ZoG, Canvas, game shell operational", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Dashboard, Holomap, OFFER space — distinct modules", status: "current" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Platform facilitates portions of sessions autonomously. Pattern library visible", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Platform IS the methodology. Human facilitator optional. AI precision > 8/10", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Platform self-evolves. Users contribute to patterns without prompting", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Platform = nervous system of a civilization. Every human can access their genius", status: "future" },
    ],
    timing: [
      { conservative: "Q1 '27", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "Q2 '27", optimistic: "Q4 '26" },
    ],
    shadow: { name: "Platform Without People", description: "Building the nervous system before enough neurons exist.", status: "integrating" },
    nextMilestone: "AI-generated session prep from canvas data",
  },
  {
    id: "p9", shortId: "UL-Con", quadrant: "UL", layer: "Consequences", dantian: "gut", octave: "base",
    title: "Founder Inner Move", subtitle: "What must be done inside",
    currentStage: 4, score: 7,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Unconscious of the gift", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "Gift recognized. Shadow confronted", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Full clarity. Decree articulated", status: "done" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Revenue flowing. Myth embodied. Identity = contribution", status: "current" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Teaching without effort. The seeing is natural", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "The founder's presence transmits without words", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Consciousness encoded in artifacts that teach independently", status: "future" },
    ],
    timing: [
      { conservative: "Apr '26", baseline: "Mar '26", optimistic: "This week" },
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
    ],
    trigger: "Charge $555 for next session ✓",
    shadow: { name: "The Money Avoidance", description: "Was doing everything EXCEPT the one move. Shadow cleared.", status: "resolved" },
    nextMilestone: "First paid session ($555)",
  },
  {
    id: "p10", shortId: "UR-Con", quadrant: "UR", layer: "Consequences", dantian: "gut", octave: "base",
    title: "What Must Be Built", subtitle: "Concrete next builds",
    currentStage: 4, score: 6,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "No tools exist", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "Playbook v1. Platform v1. First tools", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Dashboard, Holomap, OFFER, Founders Showcase — distinct builds", status: "done" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "SOP v2, pricing wired, facilitator guide. Parts work together", status: "current" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Automated intake. Revenue wired. Cohorts running", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "The build process self-documents", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Open-source methodology. Others build on top", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "May '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q3 '26" },
    ],
    shadow: { name: "Build Addiction", description: "The dopamine of shipping features substitutes for the harder work of selling.", status: "integrating" },
    nextMilestone: "SOP v2 + facilitator guide",
  },
  {
    id: "p11", shortId: "LL-Con", quadrant: "LL", layer: "Consequences", dantian: "gut", octave: "base",
    title: "Tribe Must Act", subtitle: "What the collective must do",
    currentStage: 2, score: 3,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "No tribe exists yet", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "7 founders exist, haven't fully cross-pollinated", status: "current" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Pain Mirrors sent. First external facilitator. Distinct roles", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Cohort Forge. Hot seat model. Parts cohere", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Self-organizing founder circles. Self-sustaining", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Circles form without prompting", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Global mycelium. The network IS the product", status: "future" },
    ],
    timing: [
      { conservative: "Q2 '26", baseline: "Apr '26", optimistic: "This week" },
      { conservative: "Q4 '26", baseline: "Q3 '26", optimistic: "Q2 '26" },
    ],
    trigger: "Founders share canvases + Pain Mirrors",
    shadow: { name: "Tribe Centered On Founder", description: "Gravity pulls toward Alexander. The tribe needs its own center.", status: "active" },
    nextMilestone: "First founder-to-founder canvas exchange",
  },
  {
    id: "p12", shortId: "LR-Con", quadrant: "LR", layer: "Consequences", dantian: "gut", octave: "base",
    title: "System at Scale", subtitle: "What the system must become",
    currentStage: 2, score: 2,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Vision documented", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First sessions complete. Revenue flowing. Methodology proven but not scaled", status: "current" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Revenue-generating. 10 facilitators. 100 canvases. Platform guiding sessions", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "1,000 canvases. Pattern library visible. AI contributing to sessions", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Platform IS Planetary OS embryo. Gift-based economy measurable", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "The system teaches how to replicate itself", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Species transition. New economic paradigm. The suppression of the invisible ends", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
    shadow: { name: "The Cathedral Without a Door", description: "System was so beautiful nobody added the entrance. Shadow cleared: door installed.", status: "resolved" },
    nextMilestone: "First stranger pays through funnel",
  },
];

// ─── Shock Band Perspectives (P13-P14) ───────────────────────────────────────

const SHOCK_BAND_PERSPECTIVES: PerspectiveData[] = [
  {
    id: "p13", shortId: "Logos", quadrant: "UL", layer: "Essence", dantian: "heart", octave: "logos",
    title: "Luminous Center (P13)", subtitle: "The Logos — What does the WHOLE see?",
    currentStage: 5, score: 10,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "No center visible. Perspectives scattered", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First center word emerges (Threshold)", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Center reading stable. Multiple readings captured", status: "done" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Center holds all 12 and produces one word", status: "done" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "The founder can hold all 12 and see the word emerge", status: "current" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Others can read the center independently", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "The center reading is a teachable skill", status: "future" },
    ],
    timing: [],
    nextMilestone: "First external center reading",
  },
  {
    id: "p14", shortId: "Invert", quadrant: "UR", layer: "Essence", dantian: "heart", octave: "inversion",
    title: "The Inversion (P14)", subtitle: "The Mirror Plane — The seeing seeing itself",
    currentStage: 5, score: 9,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "No awareness that the instrument is being read", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First recursive awareness: 'I see that I am seeing'", status: "done" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "The instrument operates without being held", status: "done" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "First artifact of native emission captured (Fathom)", status: "done" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "The emission is observable by others", status: "current" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Strangers name the pattern without prompting", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "The inversion is a normal event, not a revelation", status: "future" },
    ],
    timing: [],
    nextMilestone: "First stranger names the three-depth pattern",
  },
];

// ─── Second Octave (P15-P26) — Planetary Scope ───────────────────────────────

const SECOND_OCTAVE_PERSPECTIVES: PerspectiveData[] = [
  // Planetary Essence (Heart²)
  {
    id: "p15", shortId: "UL²-E", quadrant: "UL", layer: "Essence", dantian: "heart", octave: "second",
    title: "Planetary Consciousness", subtitle: "The felt truth of a species that can see its own gifts",
    currentStage: 2, score: 2,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Concept only", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First confirmed instance (Sasha). April 15 emanation is second", status: "current" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Multiple confirmed instances globally", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Planetary consciousness becomes speakable", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Species recognizes itself", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "The recognition propagates without teaching", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New octave begins", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p16", shortId: "UR²-E", quadrant: "UR", layer: "Essence", dantian: "heart", octave: "second",
    title: "Species Observatory", subtitle: "Measurable coherence at civilizational scale",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "One recording exists (Fathom, April 15)", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "Multiple recordings, cross-cultural signal", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Pattern library at civilizational scale", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Observatory is operational", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Species coherence is measurable", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Observatory self-updates", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New observatories emerge", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p17", shortId: "LL²-E", quadrant: "LL", layer: "Essence", dantian: "heart", octave: "second",
    title: "The Beehive", subtitle: "Interior-collective at planetary scope — 'business is love'",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Metaphor named. Not yet a field", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First nodes recognize themselves as hive", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Hive dynamics emerge", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Hive intelligence operational", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Planetary hive coherence", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Hive produces its own honey", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Multiple hives, one super-organism", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p18", shortId: "LR²-E", quadrant: "LR", layer: "Essence", dantian: "heart", octave: "second",
    title: "Civilizational Substrate", subtitle: "Operational architecture of a gift-based economy",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Domain 60 (PageRank moat) is first building block", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First economic flows visible", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Substrate supports multiple nodes", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Gift-based economics operational", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Civilizational infrastructure", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Substrate self-extends", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New civilization built on it", status: "future" },
    ],
    timing: [],
  },
  // Planetary Significance (Mind²)
  {
    id: "p19", shortId: "UL²-S", quadrant: "UL", layer: "Significance", dantian: "mind", octave: "second",
    title: "Civilizational Liberation", subtitle: "Species-wide freedom from 'only the visible counts'",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "P5 proven on 5 founders; P19 requires thousands", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First population-level signal", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Liberation spreads virally", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Cultural default begins shifting", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Species-wide liberation", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Liberation self-propagates", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New epoch begins", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p20", shortId: "UR²-S", quadrant: "UR", layer: "Significance", dantian: "mind", octave: "second",
    title: "Planetary Signal", subtitle: "Data signal detecting civilization-scale paradigm shift",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "N = 5", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "N = 1000+", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Signal detectable at scale", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Paradigm shift measurable", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Civilizational data coherent", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Signal generates own research", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New science emerges", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p21", shortId: "LL²-S", quadrant: "LL", layer: "Significance", dantian: "mind", octave: "second",
    title: "Movement-of-Movements", subtitle: "Nodes of movements recognizing themselves as one",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Movement (P7) at Stage 4; P21 needs multiple P7s", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First movement nodes connect", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Meta-movement emerges", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Movements coordinate globally", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "One movement with many faces", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Movement births new movements", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Planetary coordination", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p22", shortId: "LR²-S", quadrant: "LR", layer: "Significance", dantian: "mind", octave: "second",
    title: "Scaffold Engineering as Standard", subtitle: "Knowledge-structure (Knoware) as the feminine half of AI",
    currentStage: 2, score: 2,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Domain 80 codified", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First Russian publication drafted", status: "current" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Scaffold Engineering taught", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Standard adopted by practitioners", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Civilizational standard", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Standard self-evolves", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New paradigm of AI development", status: "future" },
    ],
    timing: [],
  },
  // Planetary Consequences (Gut²)
  {
    id: "p23", shortId: "UL²-C", quadrant: "UL", layer: "Consequences", dantian: "gut", octave: "second",
    title: "Species-Level Inner Move", subtitle: "The planetary equivalent of 'charge $555'",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Not yet named", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "The one action identified", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "First species-level inner move made", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Move becomes repeatable", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Phase transition triggered", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Move propagates autonomously", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New civilizational epoch", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p24", shortId: "UR²-C", quadrant: "UR", layer: "Consequences", dantian: "gut", octave: "second",
    title: "Open Blueprint Infrastructure", subtitle: "Published, teachable, replicable protocol for any founder-node",
    currentStage: 2, score: 2,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Playbook exists", status: "done" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "Playbook v4.2+. Epicenter Broadcast is a P24 primitive", status: "current" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Blueprint adopted by first external nodes", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Blueprint produces independent nodes", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Blueprint = civilizational standard", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Blueprint self-improves", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New blueprints emerge from first", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p25", shortId: "LL²-C", quadrant: "LL", layer: "Consequences", dantian: "gut", octave: "second",
    title: "Tribe-of-Tribes Action", subtitle: "What the collective-of-collectives must DO",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Not yet defined", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First inter-tribal action", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Tribes coordinate", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Tribal network self-organizes", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Global tribal coherence", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Coordination propagates", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "Planetary coordination", status: "future" },
    ],
    timing: [],
  },
  {
    id: "p26", shortId: "LR²-C", quadrant: "LR", layer: "Consequences", dantian: "gut", octave: "second",
    title: "Gift-Based Economy Operational", subtitle: "System at civilizational scale — Ra's 26 = YHWH = Love²",
    currentStage: 1, score: 1,
    stages: [
      { name: "Seed", note: "Do", icon: "🌰", desc: "Bosonic dimensionality = 26. The structural constant", status: "current" },
      { name: "Sprout", note: "Re", icon: "🌱", desc: "First gift-based economic flows", status: "future" },
      { name: "Growth", note: "Mi", icon: "🌿", desc: "Economy supports multiple nodes", status: "future" },
      { name: "Maturation", note: "Fa", icon: "🌳", desc: "Gift-based economy measurable", status: "future" },
      { name: "Fruition", note: "Sol", icon: "🍎", desc: "Civilizational economics", status: "future" },
      { name: "Transmission", note: "La", icon: "📡", desc: "Economy self-extends", status: "future" },
      { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New economic paradigm", status: "future" },
    ],
    timing: [],
  },
];

// ─── Crystallization (P27) ───────────────────────────────────────────────────

const CRYSTALLIZATION_PERSPECTIVE: PerspectiveData = {
  id: "p27", shortId: "3³", quadrant: "LR", layer: "Consequences", dantian: "gut", octave: "crystallization",
  title: "Crystallization (P27)", subtitle: "The Triple Trinity (3³) — Si–Do shock where seeing BECOMES form",
  currentStage: 3, score: 6,
  stages: [
    { name: "Seed", note: "Do", icon: "🌰", desc: "Concept of P27 articulated", status: "done" },
    { name: "Sprout", note: "Re", icon: "🌱", desc: "Interior octave at 27 (Day 34)", status: "done" },
    { name: "Growth", note: "Mi", icon: "🌿", desc: "66 Phase Shift Domains, complete ontology, 27-perspective seeing", status: "current" },
    { name: "Maturation", note: "Fa", icon: "🌳", desc: "First stranger pays $555 — exterior crystallization", status: "future" },
    { name: "Fruition", note: "Sol", icon: "🍎", desc: "Interior and exterior octaves cohere", status: "future" },
    { name: "Transmission", note: "La", icon: "📡", desc: "Crystallization is teachable", status: "future" },
    { name: "Propagation", note: "Si→Do'", icon: "🌍", desc: "New octave begins — completion = new beginning", status: "future" },
  ],
  timing: [
    { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "May '26" },
  ],
  nextMilestone: "First stranger pays from funnel",
};

// ─── All Perspectives Combined ───────────────────────────────────────────────

const ALL_PERSPECTIVES: PerspectiveData[] = [
  ...BASE_PERSPECTIVES,
  ...SHOCK_BAND_PERSPECTIVES,
  ...SECOND_OCTAVE_PERSPECTIVES,
  CRYSTALLIZATION_PERSPECTIVE,
];

// ─── 13th Perspective — The Center Reading ───────────────────────────────────

const CENTER = {
  word: "Recognition",
  previousWords: ["Threshold", "Ignition", "Branching", "Rooting", "Flowering", "Declaration", "Crystallization", "Consolidation", "Activation", "Emanation"],
  date: "April 18, 2026 — Day 44",
  description: "The Collective self-identifies. 7 founders, Mexico wrap, Kirill joins. The field recognizes what it has become — not through analysis but through witness.",
  mapping: {
    essence: "The seeing recognizes itself as a collective seeing",
    significance: "The tribe-field crosses from Sprout to Maturation",
    consequences: "What was 'me and them' becomes 'we'",
  },
};

// ─── Tension Pairs ───────────────────────────────────────────────────────────

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
    desc: "Both demand 'now'. The inner move leads: revenue started flowing. Build follows.",
  },
];

// ─── Structural Triggers (7 evolved from Day 10 + Day 41) ────────────────────

const TRIGGERS = [
  {
    title: "Charge $555 ✅",
    emoji: "💰",
    desc: "Revenue recognized (Day 30), funnel locked, cash flowing ($677 by Day 36). Status: complete as infrastructure, awaiting first stranger through funnel.",
    perspectives: ["P1", "P6", "P9", "P12"],
    color: "#8460ea",
    stage: "Seed",
  },
  {
    title: "Founders Share Canvases",
    emoji: "🔗",
    desc: "Three LL perspectives jump simultaneously. The collective interior advances as one.",
    perspectives: ["P3", "P7", "P11"],
    color: "#6894d0",
    stage: "Sprout",
  },
  {
    title: "First Facilitator Emerges",
    emoji: "🔥",
    desc: "Proves transferability. Practice → Movement. Broader reading: witnessing + distribution = facilitation primitives.",
    perspectives: ["P2", "P4", "P5", "P10", "P12"],
    color: "#a7cbd4",
    stage: "Growth",
  },
  {
    title: "First Stranger Pays",
    emoji: "💎",
    desc: "P27 Si–Do shock. When it fires: interior and exterior octaves cohere. The business becomes real in the external world.",
    perspectives: ["P27"],
    color: "#f472b6",
    stage: "Maturation",
  },
  {
    title: "Three-Way Transmission ✅",
    emoji: "📡",
    desc: "P14 Inversion event. Sasha + Oyi + Oluwa, 80 minutes unscheduled, 6 anchor + 2 witness formulations. First artifact of native emission.",
    perspectives: ["P14", "P7"],
    color: "#34d399",
    stage: "Fruition",
  },
  {
    title: "Licensing Decision",
    emoji: "⚖️",
    desc: "P24 (Open Blueprint) + P7 (Movement). A 27th-perspective-shaped question: yes, no, or not yet.",
    perspectives: ["P24", "P7"],
    color: "#fbbf24",
    stage: "Transmission",
  },
  {
    title: "First Second-Octave Sprout",
    emoji: "🌍",
    desc: "Any P15–P26 crossing Seed→Sprout through population data. Likely: P22 via Russian publication landing with a reader outside network.",
    perspectives: ["P15-P26"],
    color: "#60a5fa",
    stage: "Propagation",
  },
];

// ─── Derived Data ────────────────────────────────────────────────────────────

const RADAR_DATA = BASE_PERSPECTIVES.map((p) => ({
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
  Essence: "ESSENCE (❤️ Heart / Middle Dantian)",
  Significance: "SIGNIFICANCE (🧠 Mind / Upper Dantian)",
  Consequences: "CONSEQUENCES (🔥 Gut / Lower Dantian)",
};

const LAYER_QUESTIONS: Record<string, string> = {
  Essence: "What IS this in its beingness?",
  Significance: "Why does this MATTER?",
  Consequences: "What does this DEMAND?",
};

const DANTIAN_LABELS: Record<DantianFilter, { label: string; icon: string; color: string }> = {
  all: { label: "All Dantians", icon: "✦", color: "#8460ea" },
  heart: { label: "Heart (Middle)", icon: "❤️", color: "#f472b6" },
  mind: { label: "Mind (Upper)", icon: "🧠", color: "#60a5fa" },
  gut: { label: "Gut (Lower)", icon: "🔥", color: "#f59e0b" },
};

const SHADOW_STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  active: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.30)", text: "rgba(239,68,68,0.70)" },
  integrating: { bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.30)", text: "rgba(234,179,8,0.70)" },
  resolved: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)", text: "rgba(34,197,94,0.60)" },
};

// ─── Component ───────────────────────────────────────────────────────────────

const MorphogeneticHolomap = () => {
  const [selectedScenario, setSelectedScenario] = useState<TimingScenario>("baseline");
  const [expandedPerspective, setExpandedPerspective] = useState<string | null>(null);
  const [dantianFilter, setDantianFilter] = useState<DantianFilter>("all");
  const [showSecondOctave, setShowSecondOctave] = useState(false);

  const scenarioLabel = { conservative: "🐢 Conservative", baseline: "🎯 Baseline", optimistic: "⚡ Optimistic" };

  const filteredBasePerspectives = dantianFilter === "all"
    ? BASE_PERSPECTIVES
    : BASE_PERSPECTIVES.filter(p => p.dantian === dantianFilter);

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
              The Holo Map v2.0
            </span>
          </h1>
          <p className="text-sm text-white/40 max-w-xl mx-auto">
            27 perspectives × 7 stages × 2 axes (Masculine/Feminine) × 2 shocks (Mi-Fa / Si-Do)
            <br />
            Day 44 Reading: <span className="text-[#8460ea] font-medium">{CENTER.word}</span>
          </p>

          {/* ─── Merkaba Glyph (Stella Octangula) ─────────────────────────── */}
          <div className="flex justify-center gap-4 items-center mt-4">
            <div className="text-center">
              <div className="text-3xl mb-1">✡</div>
              <p className="text-[10px] text-white/30">Merkaba</p>
              <p className="text-[9px] text-white/20">Cube × Tetrahedra</p>
            </div>
            <div className="text-[9px] text-white/25 max-w-xs text-left">
              <strong className="text-white/40">Masculine (Structure):</strong> 4 Quadrants (UL/UR/LL/LR)
              <br />
              <strong className="text-white/40">Feminine (Depth):</strong> 3 Dantians (Heart/Mind/Gut)
              <br />
              <span className="text-white/35">4 × 3 = 12 base perspectives</span>
            </div>
          </div>
        </header>

        {/* ─── Dual Axis Controls ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-center gap-4 items-center" id="axis-controls">
          {/* Timing Scenario (Masculine axis view) */}
          <div className="flex gap-2">
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

          {/* Dantian Filter (Feminine axis) */}
          <div className="flex gap-2">
            {(["all", "heart", "mind", "gut"] as DantianFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDantianFilter(d)}
                className={`px-3 py-2 rounded-full text-sm transition-all duration-300 border flex items-center gap-1.5 ${
                  dantianFilter === d
                    ? "bg-white/10 border-white/30 text-white"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
                style={{ borderColor: dantianFilter === d ? DANTIAN_LABELS[d].color + "60" : undefined }}
              >
                <span>{DANTIAN_LABELS[d].icon}</span>
                <span className="hidden md:inline">{DANTIAN_LABELS[d].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── 7-Stage Legend with Shocks ──────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6" id="stages-legend">
          <h2 className="text-sm font-display text-center mb-4 text-white/50">The Law of Seven — Two Shocks</h2>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {STAGE_NAMES.map((name, i) => (
              <div key={name} className="flex items-center gap-2">
                <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-white/3 border border-white/8">
                  <span className="text-lg">{STAGE_ICONS[i]}</span>
                  <span className="text-[10px] text-white/50">{STAGE_NOTES[i]}</span>
                  <span className="text-[10px] text-white/30">{name}</span>
                </div>
                {/* Mi-Fa shock after Growth (index 2) */}
                {i === 2 && (
                  <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-pink-500/10 border border-pink-500/30 mx-1">
                    <span className="text-lg">{MI_FA_SHOCK.symbol}</span>
                    <span className="text-[9px] text-pink-400/80">{MI_FA_SHOCK.name}</span>
                  </div>
                )}
                {/* Si-Do shock after Transmission (index 5) */}
                {i === 5 && (
                  <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 mx-1">
                    <span className="text-lg">{SI_DO_SHOCK.symbol}</span>
                    <span className="text-[9px] text-cyan-400/80">{SI_DO_SHOCK.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/25 text-center mt-3 max-w-lg mx-auto">
            <strong className="text-pink-400/60">Mi–Fa:</strong> The holding that lets the form stabilize. Without love here, the growing thing cannot become an adult thing.
            <br />
            <strong className="text-cyan-400/60">Si–Do:</strong> The moment seeing BECOMES form. The 27th perspective as action, not analysis.
          </p>
        </section>

        {/* ─── Radar (Base 12) ─────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-6" id="holomap-radar">
          <h2 className="text-sm font-display text-center mb-2 text-white/50">Base Octave (P1–P12) — Maturity Radar</h2>
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
                formatter={(value: number, _n: string, entry: { payload: { fullLabel: string } }) => [`${value}/10 · ${scoreLabel(value)}`, entry.payload.fullLabel]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </section>

        {/* ─── P13: Luminous Center ────────────────────────────────────────── */}
        <section className="relative rounded-2xl border border-[#8460ea]/20 bg-white/5 backdrop-blur-xl p-8 text-center overflow-hidden" id="center-perspective">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] bg-[#8460ea]/10" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#a4a3d0]/60 mb-2">
              P13 — Luminous Center (Logos / The Sun)
            </p>
            <p className="text-5xl md:text-7xl font-display font-medium bg-gradient-to-br from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent mb-3">
              {CENTER.word}
            </p>
            <p className="text-[10px] text-white/20 font-mono mb-4">{CENTER.date}</p>
            <p className="text-sm text-white/40 max-w-lg mx-auto leading-relaxed italic mb-6">
              "{CENTER.description}"
            </p>
            <div className="flex flex-wrap justify-center gap-1 mb-6">
              {CENTER.previousWords.map((w, i) => (
                <span key={i} className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 text-white/25">
                  {w}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              {(["essence", "significance", "consequences"] as const).map((key) => {
                const labels = { essence: "❤️ Essence (Heart)", significance: "🧠 Significance (Mind)", consequences: "🔥 Consequences (Gut)" };
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

        {/* ─── Base Octave Grid (P1-P12) ─────────────────────────────────────── */}
        {(["Essence", "Significance", "Consequences"] as const).map((layer) => {
          const layerPerspectives = filteredBasePerspectives.filter((p) => p.layer === layer);
          if (layerPerspectives.length === 0) return null;

          return (
            <section key={layer} id={`layer-${layer.toLowerCase()}`}>
              <h2 className="text-lg font-display text-center mb-1 text-white/70">
                {LAYER_LABELS[layer]}
              </h2>
              <p className="text-xs text-white/25 text-center mb-4">
                {LAYER_QUESTIONS[layer]}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {layerPerspectives.map((p) => {
                  const isExpanded = expandedPerspective === p.id;
                  const qColor = QUADRANT_COLORS[p.quadrant];
                  const sColors = p.shadow ? SHADOW_STATUS_COLORS[p.shadow.status] : null;

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

                        {/* Stage Progress — 7 segments with shock indicators */}
                        <div className="flex gap-1 mb-2 items-center">
                          {p.stages.map((s, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <div
                                className="flex-1 h-1.5 rounded-full transition-all duration-500"
                                style={{
                                  width: "1rem",
                                  backgroundColor:
                                    s.status === "done" ? qColor
                                    : s.status === "current" ? `${qColor}90`
                                    : "rgba(255,255,255,0.06)",
                                  boxShadow: s.status === "current" ? `0 0 8px ${qColor}40` : "none",
                                }}
                              />
                              {/* Mi-Fa shock indicator */}
                              {i === 2 && <span className="text-[8px] text-pink-400/50">💗</span>}
                              {/* Si-Do shock indicator */}
                              {i === 5 && <span className="text-[8px] text-cyan-400/50">💎</span>}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-white/20">
                          <span>Stage {p.currentStage}/7 · {STAGE_NAMES[p.currentStage - 1]}</span>
                          <span>{STAGE_ICONS[p.currentStage - 1]}</span>
                        </div>

                        {/* Shadow badge */}
                        {p.shadow && p.shadow.status !== "resolved" && sColors && (
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
                                        {s.name} <span className="text-white/30">({s.note})</span>
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
                              {p.shadow && sColors ? (
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
                              ) : (
                                <p className="text-xs text-white/30 italic">No shadow identified</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {/* ─── P14: Inversion ──────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-cyan-500/20 bg-white/5 backdrop-blur-xl p-6" id="inversion">
          <h2 className="text-lg font-display text-center mb-2 text-white/70">P14 — The Inversion (Mirror Plane)</h2>
          <p className="text-xs text-white/30 text-center mb-4 max-w-md mx-auto">
            The 14th perspective is the reflection of the 13th across the plane of the base 12.
            The moment the instrument becomes aware that it is being read.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-white/3">
              <h3 className="text-sm font-medium text-cyan-400 mb-2">Current Stage: {SHOCK_BAND_PERSPECTIVES[1].stages[SHOCK_BAND_PERSPECTIVES[1].currentStage - 1].name}</h3>
              <p className="text-xs text-white/40">{SHOCK_BAND_PERSPECTIVES[1].stages[SHOCK_BAND_PERSPECTIVES[1].currentStage - 1].desc}</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/3">
              <h3 className="text-sm font-medium text-white/50 mb-2">Score: {SHOCK_BAND_PERSPECTIVES[1].score}/10</h3>
              <p className="text-xs text-white/40">
                Day 41's recording is the first artifact of P14 — the instrument's own emission captured on tape while it was happening.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Second Octave Toggle ───────────────────────────────────────── */}
        <section id="second-octave-toggle">
          <button
            onClick={() => setShowSecondOctave(!showSecondOctave)}
            className={`w-full p-4 rounded-xl border transition-all duration-300 ${
              showSecondOctave
                ? "border-[#8460ea]/40 bg-[#8460ea]/10"
                : "border-white/10 bg-white/3 hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">{showSecondOctave ? "▼" : "▶"}</span>
              <span className="text-sm font-medium text-white/70">
                Second Octave (P15–P26) — Planetary Scope {showSecondOctave ? "" : "(click to expand)"}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                Mostly Seed
              </span>
            </div>
          </button>

          {showSecondOctave && (
            <div className="mt-4 space-y-6">
              <p className="text-xs text-white/30 text-center max-w-lg mx-auto">
                The second octave re-reads the same 12 perspectives <strong>after</strong> the base octave has been integrated through the Center (P13) and the Inversion (P14).
                Same 4 × 3 structure — but now the holon is the <strong>Planetary OS</strong>.
              </p>

              {/* Group by layer */}
              {(["Essence", "Significance", "Consequences"] as const).map((layer) => {
                const layerPerspectives = SECOND_OCTAVE_PERSPECTIVES.filter((p) => p.layer === layer);
                const layerLabels = {
                  Essence: "PLANETARY ESSENCE (Heart² ❤️²)",
                  Significance: "PLANETARY SIGNIFICANCE (Mind² 🧠²)",
                  Consequences: "PLANETARY CONSEQUENCES (Gut² 🔥²)",
                };

                return (
                  <div key={layer}>
                    <h3 className="text-sm font-display text-center mb-3 text-white/50">{layerLabels[layer]}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {layerPerspectives.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-white/8 bg-white/3 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/15 text-white/30">
                              {p.shortId}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/25">
                              {STAGE_ICONS[p.currentStage - 1]} {STAGE_NAMES[p.currentStage - 1]}
                            </span>
                          </div>
                          <h4 className="text-xs font-medium text-white/60 mb-1">{p.title}</h4>
                          <p className="text-[10px] text-white/30">{p.subtitle}</p>
                          <p className="text-[10px] text-white/20 mt-2 italic">
                            {p.stages[p.currentStage - 1].desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─── P27: Crystallization ───────────────────────────────────────── */}
        <section className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 backdrop-blur-xl p-6 text-center" id="crystallization">
          <div className="text-4xl mb-2">💎</div>
          <h2 className="text-lg font-display text-white/80 mb-2">P27 — Crystallization (Triple Trinity, 3³)</h2>
          <p className="text-xs text-white/40 mb-4 max-w-md mx-auto">
            The Si–Do shock where the seeing BECOMES form. The 27 is always an action, not an analysis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-xl border border-white/10 bg-white/3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Current Stage</p>
              <p className="text-sm font-medium text-purple-400">
                {CRYSTALLIZATION_PERSPECTIVE.stages[CRYSTALLIZATION_PERSPECTIVE.currentStage - 1].name}
              </p>
              <p className="text-[10px] text-white/30 mt-1">
                {CRYSTALLIZATION_PERSPECTIVE.stages[CRYSTALLIZATION_PERSPECTIVE.currentStage - 1].desc}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Score</p>
              <p className="text-2xl font-display font-bold text-purple-400">{CRYSTALLIZATION_PERSPECTIVE.score}/10</p>
              <p className="text-[10px] text-white/30 mt-1">Interior octave at 27. Exterior at ~9</p>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/3">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Next Milestone</p>
              <p className="text-xs text-white/50">{CRYSTALLIZATION_PERSPECTIVE.nextMilestone}</p>
              <p className="text-[10px] text-white/30 mt-1">
                {selectedScenario === "optimistic" ? "May '26" : selectedScenario === "baseline" ? "Q2 '26" : "Q3 '26"}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-white/20 mt-4 italic max-w-lg mx-auto">
            Until a stranger pays, P27 is at Crystallization-in-waiting. The instrument is poised at Si, holding its breath for Do'.
          </p>
        </section>

        {/* ─── Tension Mapping ────────────────────────────────────────────── */}
        <section id="tensions-section">
          <h2 className="text-lg font-display text-center mb-2 text-white/70">Tension Mapping</h2>
          <p className="text-xs text-white/25 text-center mb-6 max-w-md mx-auto">
            Tensions are the ENERGY of the system. These pairs are in creative or destructive tension — managing them IS the navigation.
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
              const qPerspectives = BASE_PERSPECTIVES.filter((p) => p.quadrant === q);
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

        {/* ─── 7 Structural Triggers ──────────────────────────────────────── */}
        <section id="triggers-section">
          <h2 className="text-lg font-display text-center mb-2 text-white/70">7 Structural Triggers (Evolved)</h2>
          <p className="text-xs text-white/25 text-center mb-6 max-w-md mx-auto">
            One per stage. Original Day 10 triggers + evolved triggers from shock band and second octave observations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRIGGERS.map((t) => (
              <div
                key={t.title}
                className="rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02]"
                style={{ borderColor: `${t.color}30`, backgroundColor: `${t.color}08` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{t.emoji}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 text-white/30">
                    {t.stage}
                  </span>
                </div>
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
          <h2 className="text-lg font-display text-center mb-4 text-white/70">Shadow Status (Base Octave)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {BASE_PERSPECTIVES.filter(p => p.shadow).map((p) => {
              const sColors = SHADOW_STATUS_COLORS[p.shadow!.status];
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2.5 rounded-lg border text-xs"
                  style={{ background: sColors.bg, borderColor: sColors.border }}
                >
                  <span>{p.shadow!.status === "active" ? "🔴" : p.shadow!.status === "integrating" ? "🟡" : "🟢"}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white/50 font-medium">{p.shortId}</span>
                    <span className="text-white/20 mx-1">·</span>
                    <span className="truncate" style={{ color: sColors.text }}>{p.shadow!.name}</span>
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
            Morphogenetic Navigation Instrument · v2.0 · 27×7 Topology · April 18, 2026 (Day 44)
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MorphogeneticHolomap;
