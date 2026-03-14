import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PerspectiveData {
  id: string;
  shortId: string;
  quadrant: "UL" | "UR" | "LL" | "LR";
  layer: "Essence" | "Significance" | "Implications";
  title: string;
  subtitle: string;
  currentStage: number;
  score: number;
  stages: { name: string; icon: string; desc: string; status: "done" | "current" | "future" }[];
  timing: { conservative: string; baseline: string; optimistic: string }[];
  trigger?: string;
}

type TimingScenario = "conservative" | "baseline" | "optimistic";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PERSPECTIVES: PerspectiveData[] = [
  {
    id: "p1", shortId: "UL-Ess", quadrant: "UL", layer: "Essence",
    title: "Founder Consciousness", subtitle: "The interior truth of the one holding the field",
    currentStage: 4, score: 9,
    stages: [
      { name: "Seed", icon: "🌰", desc: "Notices ability to see others but not self", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "Discovers FMF recursion", status: "done" },
      { name: "Growth", icon: "🌿", desc: "Session mastery. Shadow integrated", status: "done" },
      { name: "Maturation", icon: "🌳", desc: "Full self-transparency. Can train others", status: "current" },
      { name: "Fruition", icon: "🍎", desc: "Effortless seeing. Facilitators emerge", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Consciousness encoded. AI can carry it", status: "future" },
    ],
    timing: [
      { conservative: "Now", baseline: "Now", optimistic: "Now" },
      { conservative: "Jun '26", baseline: "Apr '26", optimistic: "Mar '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q2 '26" },
    ],
  },
  {
    id: "p2", shortId: "UR-Ess", quadrant: "UR", layer: "Essence",
    title: "Observable System", subtitle: "What measurably exists",
    currentStage: 3, score: 7,
    stages: [
      { name: "Seed", icon: "🌰", desc: "Idea only", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "First canvas (Client Zero)", status: "done" },
      { name: "Growth", icon: "🌿", desc: "4 canvases, playbook, 100% conversion", status: "current" },
      { name: "Maturation", icon: "🌳", desc: "20+ canvases. SOP v2. Facilitators active", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "100+ canvases. Revenue consistent. AI 40%+", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "1000+ canvases. Pattern library. AI sessions", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "May '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q3 '26" },
      { conservative: "2029", baseline: "2028", optimistic: "2027" },
    ],
  },
  {
    id: "p3", shortId: "LL-Ess", quadrant: "LL", layer: "Essence",
    title: "Shared Field", subtitle: "What's forming between the founders",
    currentStage: 2, score: 6,
    stages: [
      { name: "Seed", icon: "🌰", desc: "One person's idea", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "4 founders, same truth, unconnected", status: "current" },
      { name: "Growth", icon: "🌿", desc: "Founders share canvases. Tribe recognizes itself", status: "future" },
      { name: "Maturation", icon: "🌳", desc: "Cohort Forge. Culture self-reinforcing", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Tribe produces own content. Movement energy", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Multiple culture nodes globally", status: "future" },
    ],
    timing: [
      { conservative: "Q2 '26", baseline: "Apr '26", optimistic: "Mar '26" },
      { conservative: "Q4 '26", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "Q3 '27", baseline: "Q1 '27", optimistic: "Q4 '26" },
    ],
    trigger: "Founders share canvases with each other",
  },
  {
    id: "p4", shortId: "LR-Ess", quadrant: "LR", layer: "Essence",
    title: "System Architecture", subtitle: "The fractal from session to civilization",
    currentStage: 2, score: 5,
    stages: [
      { name: "Seed", icon: "🌰", desc: "Vision documented (Layer 0-8)", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "Layers 0-4 operational. 5-8 conceptual", status: "current" },
      { name: "Growth", icon: "🌿", desc: "Venture studio + platform intelligence", status: "future" },
      { name: "Maturation", icon: "🌳", desc: "AI metacognition operational", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Planetary OS operational", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Architecture = the standard", status: "future" },
    ],
    timing: [
      { conservative: "Q1 '27", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
      { conservative: "2030+", baseline: "2029", optimistic: "2028" },
    ],
  },
  {
    id: "p5", shortId: "UL-Sig", quadrant: "UL", layer: "Significance",
    title: "Ontological Liberation", subtitle: "Freeing souls from 'only visible counts'",
    currentStage: 3, score: 8,
    stages: [
      { name: "Seed", icon: "🌰", desc: "Intuitive knowing", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "'The invisible is the real' articulated", status: "done" },
      { name: "Growth", icon: "🌿", desc: "Proven in 4 sessions. Myth as medicine", status: "current" },
      { name: "Maturation", icon: "🌳", desc: "Named enough to teach. Others facilitate", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Thousands freed at scale", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "'What's your gift?' replaces 'What do you do?'", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
      { conservative: "2030+", baseline: "2029", optimistic: "2028" },
    ],
  },
  {
    id: "p6", shortId: "UR-Sig", quadrant: "UR", layer: "Significance",
    title: "Data Signal Strength", subtitle: "What the numbers are saying",
    currentStage: 3, score: 8,
    stages: [
      { name: "Seed", icon: "🌰", desc: "No data", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "N=1", status: "done" },
      { name: "Growth", icon: "🌿", desc: "5/9/$0/100% — paradigm violation visible", status: "current" },
      { name: "Maturation", icon: "🌳", desc: "N=20+. Statistical significance", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "N=100+. AI training data. Revenue at scale", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Population data. Copernican proof", status: "future" },
    ],
    timing: [
      { conservative: "Q4 '26", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
      { conservative: "2030+", baseline: "2029", optimistic: "2028" },
    ],
  },
  {
    id: "p7", shortId: "LL-Sig", quadrant: "LL", layer: "Significance",
    title: "Movement Formation", subtitle: "The tribe becoming a movement",
    currentStage: 2, score: 4,
    stages: [
      { name: "Seed", icon: "🌰", desc: "One person's conviction", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "4 founders, referral happening, not declared", status: "current" },
      { name: "Growth", icon: "🌿", desc: "Shared language crystallized. First viral content", status: "future" },
      { name: "Maturation", icon: "🌳", desc: "Tribe produces content. Alumni refer", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Media, speaking, partnerships", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Global movement nodes", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2027", baseline: "Q4 '26", optimistic: "Q3 '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q1 '27" },
    ],
    trigger: "First public content piece",
  },
  {
    id: "p8", shortId: "LR-Sig", quadrant: "LR", layer: "Significance",
    title: "Platform as Nervous System", subtitle: "Evolver as digital substrate",
    currentStage: 2, score: 3,
    stages: [
      { name: "Seed", icon: "🌰", desc: "Code repo exists", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "ZoG, Canvas, game shell operational", status: "current" },
      { name: "Growth", icon: "🌿", desc: "AI reads data, produces session prep", status: "future" },
      { name: "Maturation", icon: "🌳", desc: "AI facilitates portions. Pattern library", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Platform IS the methodology", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Nervous system of a civilization", status: "future" },
    ],
    timing: [
      { conservative: "Q1 '27", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2028", baseline: "Q2 '27", optimistic: "Q4 '26" },
      { conservative: "2030+", baseline: "2029", optimistic: "2028" },
    ],
  },
  {
    id: "p9", shortId: "UL-Imp", quadrant: "UL", layer: "Implications",
    title: "Founder Inner Move", subtitle: "What must be done inside",
    currentStage: 3, score: 7,
    stages: [
      { name: "Seed", icon: "🌰", desc: "Unconscious of the gift", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "Gift recognized. Shadow confronted", status: "done" },
      { name: "Growth", icon: "🌿", desc: "Full clarity. The only move: charge $277", status: "current" },
      { name: "Maturation", icon: "🌳", desc: "Revenue flowing. Myth embodied", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Teaching effortless. Identity = contribution", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Consciousness encoded in artifacts", status: "future" },
    ],
    timing: [
      { conservative: "Apr '26", baseline: "Mar '26", optimistic: "This week" },
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2027", baseline: "Q4 '26", optimistic: "Q3 '26" },
    ],
    trigger: "Charge $277 for next session",
  },
  {
    id: "p10", shortId: "UR-Imp", quadrant: "UR", layer: "Implications",
    title: "What Must Be Built", subtitle: "Concrete next builds",
    currentStage: 3, score: 5,
    stages: [
      { name: "Seed", icon: "🌰", desc: "No tools", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "Playbook v1. Platform v1", status: "done" },
      { name: "Growth", icon: "🌿", desc: "SOP v2, pricing, facilitator guide needed", status: "current" },
      { name: "Maturation", icon: "🌳", desc: "Automated intake. Revenue wired. Cohorts", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Full product suite. Multiple revenue lines", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Open-source methodology", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "May '26" },
      { conservative: "Q2 '27", baseline: "Q4 '26", optimistic: "Q3 '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
    ],
  },
  {
    id: "p11", shortId: "LL-Imp", quadrant: "LL", layer: "Implications",
    title: "Tribe Must Act", subtitle: "What the collective must do",
    currentStage: 2, score: 3,
    stages: [
      { name: "Seed", icon: "🌰", desc: "No tribe", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "4 founders exist, haven't cross-pollinated", status: "current" },
      { name: "Growth", icon: "🌿", desc: "Pain Mirrors sent. Karime facilitates first", status: "future" },
      { name: "Maturation", icon: "🌳", desc: "Cohort Forge. Hot seat model. Alumni sharing", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Self-organizing founder circles", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Global network. The mycelium", status: "future" },
    ],
    timing: [
      { conservative: "Q2 '26", baseline: "Apr '26", optimistic: "This week" },
      { conservative: "Q4 '26", baseline: "Q3 '26", optimistic: "Q2 '26" },
      { conservative: "2027", baseline: "Q4 '26", optimistic: "Q3 '26" },
    ],
    trigger: "Founders share canvases + Pain Mirrors + Karime facilitates",
  },
  {
    id: "p12", shortId: "LR-Imp", quadrant: "LR", layer: "Implications",
    title: "System at Scale", subtitle: "What the system must become",
    currentStage: 2, score: 2,
    stages: [
      { name: "Seed", icon: "🌰", desc: "Vision documented", status: "done" },
      { name: "Sprout", icon: "🌱", desc: "First sessions complete. Revenue $0", status: "current" },
      { name: "Growth", icon: "🌿", desc: "Revenue. 10 facilitators. 100 canvases", status: "future" },
      { name: "Maturation", icon: "🌳", desc: "1,000 canvases. Pattern library. AI sessions", status: "future" },
      { name: "Fruition", icon: "🍎", desc: "Platform IS Planetary OS embryo", status: "future" },
      { name: "Propagation", icon: "🌍", desc: "Species transition. Gift-based economy", status: "future" },
    ],
    timing: [
      { conservative: "Q3 '26", baseline: "Q2 '26", optimistic: "Apr '26" },
      { conservative: "2028", baseline: "2027", optimistic: "Q4 '26" },
      { conservative: "2030+", baseline: "2029", optimistic: "2028" },
    ],
  },
];

const RADAR_DATA = PERSPECTIVES.map((p) => ({
  perspective: p.shortId,
  value: p.score,
  fullLabel: p.title,
  fullMark: 10,
}));

const TRIGGERS = [
  {
    title: "Charge $277",
    emoji: "💰",
    desc: "Not a business decision — a phase transition. P1 Stage 4→5, P9 Stage 3→4. Unblocks revenue line.",
    perspectives: ["P1", "P6", "P9", "P10"],
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

const QUADRANT_COLORS = {
  UL: "#8460ea",
  UR: "#6894d0",
  LL: "#a7cbd4",
  LR: "#b1c9b6",
};

const LAYER_LABELS = {
  Essence: "ESSENCE (Mind)",
  Significance: "SIGNIFICANCE (Heart)",
  Implications: "IMPLICATIONS (Gut)",
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
            12 perspectives × 6 evolutionary stages × timing scenarios.
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
                formatter={(value: number, _n: string, entry: any) => [`${value}/10`, entry.payload.fullLabel]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </section>

        {/* ─── 12-Perspective Grid ─────────────────────────────────────── */}
        {(["Essence", "Significance", "Implications"] as const).map((layer) => (
          <section key={layer} id={`layer-${layer.toLowerCase()}`}>
            <h2 className="text-lg font-display text-center mb-1 text-white/70">
              {LAYER_LABELS[layer]}
            </h2>
            <p className="text-xs text-white/25 text-center mb-4">
              {layer === "Essence" ? "What IS this?" : layer === "Significance" ? "Why does this matter?" : "What does this demand?"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {PERSPECTIVES.filter((p) => p.layer === layer).map((p) => {
                const isExpanded = expandedPerspective === p.id;
                const qColor = QUADRANT_COLORS[p.quadrant];

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
                        <span className="text-xs font-mono text-white/20">{p.score}/10</span>
                      </div>
                      <h3 className="text-sm font-medium mb-1" style={{ color: qColor }}>
                        {p.title}
                      </h3>
                      <p className="text-[11px] text-white/30 mb-3">{p.subtitle}</p>

                      {/* Stage Progress */}
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
                        <span>Stage {p.currentStage}/6</span>
                        <span>{p.stages[p.currentStage - 1]?.icon} {p.stages[p.currentStage - 1]?.name}</span>
                      </div>

                      {p.trigger && (
                        <div className="mt-2 text-[10px] text-[#a7cbd4]/70 border-t border-white/5 pt-2">
                          ⚡ {p.trigger}
                        </div>
                      )}
                    </div>

                    {/* Expanded View */}
                    {isExpanded && (
                      <div className="border-t border-white/8 p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* All Stages */}
                          <div>
                            <h4 className="text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Evolutionary Stages</h4>
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
                                  <span className="text-base mt-[-2px]">{s.icon}</span>
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
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

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
                className="rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02] alive-card"
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

        {/* ─── Footer ─────────────────────────────────────────────────── */}
        <footer className="text-center space-y-3 pt-6 pb-10" id="holomap-footer">
          <p className="text-xs text-white/15 italic max-w-sm mx-auto">
            "This map does not predict. It reads. The reading collapses the superposition. Time folds."
          </p>
          <p className="text-[10px] text-white/10">
            Morphogenetic Navigation · v1.0 · March 13, 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default MorphogeneticHolomap;
