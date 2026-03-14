import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_METRICS = [
  { label: "Revenue Generated", value: "$0", sub: "Pre-revenue · First paid session imminent", icon: "💰" },
  { label: "Canvases Produced", value: "4", sub: "Alexander · Oyi · Sergey · Alexa", icon: "🗺️" },
  { label: "Facilitators Trained", value: "0", sub: "Karime in queue · First facilitator track", icon: "🔥" },
];

const TIMELINE = [
  { day: 1, date: "Mar 4", name: "Alexander", type: "Client Zero", desc: "Mask-on-first. Ran the full process on himself.", color: "#8460ea" },
  { day: 2, date: "Mar 5", name: "Oyi", type: "Value Exchange", desc: "First external delivery. Full canvas. Myth discovery.", color: "#6894d0" },
  { day: 4, date: "Mar 7", name: "Sergey", type: "Value Exchange", desc: "Methodology refinement. Shadow → myth tested.", color: "#a7cbd4" },
  { day: 9, date: "Mar 12", name: "Alexa", type: "Value Exchange", desc: "Full canvas in 2.5hrs. Fastest yet. Shadow = Step 1.5.", color: "#b1c9b6" },
  { day: 10, date: "Mar 13", name: "Sandra", type: "Queue", desc: "Next in line.", color: "#cec9b0" },
  { day: 10, date: "Mar 13", name: "Karime", type: "Queue + 2 clients", desc: "First facilitator track. Bridge to paid.", color: "#cea4ae" },
];

const RADAR_DATA = [
  { perspective: "UL-Ess", fullLabel: "Founder Consciousness", value: 9, fullMark: 10 },
  { perspective: "UR-Ess", fullLabel: "Observable System", value: 7, fullMark: 10 },
  { perspective: "LL-Ess", fullLabel: "Shared Field", value: 6, fullMark: 10 },
  { perspective: "LR-Ess", fullLabel: "System Architecture", value: 5, fullMark: 10 },
  { perspective: "UL-Sig", fullLabel: "Ontological Liberation", value: 8, fullMark: 10 },
  { perspective: "UR-Sig", fullLabel: "Data Signal Strength", value: 8, fullMark: 10 },
  { perspective: "LL-Sig", fullLabel: "Movement Formation", value: 4, fullMark: 10 },
  { perspective: "LR-Sig", fullLabel: "Platform as Nervous System", value: 3, fullMark: 10 },
  { perspective: "UL-Imp", fullLabel: "Founder Inner Move", value: 7, fullMark: 10 },
  { perspective: "UR-Imp", fullLabel: "What Must Be Built", value: 5, fullMark: 10 },
  { perspective: "LL-Imp", fullLabel: "Tribe Must Act", value: 3, fullMark: 10 },
  { perspective: "LR-Imp", fullLabel: "System at Scale", value: 2, fullMark: 10 },
];

const CONCENTRIC_CIRCLES = [
  { label: "This Venture", scale: "Personal", status: "active", ring: 1 },
  { label: "Each Client", scale: "Canvas", status: "active", ring: 2 },
  { label: "The Platform", scale: "Evolver", status: "building", ring: 3 },
  { label: "Product", scale: "Standalone", status: "emerging", ring: 4 },
  { label: "Civilization", scale: "Planetary OS", status: "seed", ring: 5 },
  { label: "Universal", scale: "Species", status: "seed", ring: 6 },
];

const CHANNELS = [
  { name: "Warm Network", status: "active", emoji: "🟢", detail: "1 client / 2 days" },
  { name: "DMs to Tribe", status: "next", emoji: "🔜", detail: "20-30 people identified" },
  { name: "LinkedIn", status: "inactive", emoji: "🔴", detail: "Not activated" },
  { name: "Referral Loop", status: "active", emoji: "🟢", detail: "Happening organically" },
  { name: "Content", status: "inactive", emoji: "🔴", detail: "Zero produced yet" },
  { name: "Collaborations", status: "inactive", emoji: "🔴", detail: "Not activated" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const VentureDashboard = () => {
  return (
    <div className="min-h-screen bg-[#0c1220] text-white font-sans" id="venture-dashboard">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#8460ea]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#6894d0]/8 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-[#a7cbd4]/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <header className="text-center space-y-4 fade-in-section" id="dashboard-header">
          <p className="text-sm font-medium tracking-[0.3em] uppercase text-[#a4a3d0]">
            Morphogenetic Dashboard
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tight">
            <span className="bg-gradient-to-r from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent">
              The Emergence
            </span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto font-light">
            A live map of the Unique Business methodology unfolding.
            <br />
            Not a forecast — a reading of the structure the future is filling.
          </p>
          <p className="text-xs text-white/30 tracking-widest uppercase">
            Last updated: March 13, 2026 · Day 10
          </p>
        </header>

        {/* ─── Hero Metrics ────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6" id="hero-metrics">
          {HERO_METRICS.map((m, i) => (
            <div
              key={m.label}
              className="relative group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center transition-all duration-500 hover:border-[#8460ea]/40 hover:bg-white/8 hover:scale-[1.02]"
              style={{ animationDelay: `${i * 150}ms` }}
              id={`metric-${i}`}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8460ea]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <span className="text-3xl mb-3 block">{m.icon}</span>
                <div className="text-5xl md:text-6xl font-display font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-2">
                  {m.value}
                </div>
                <div className="text-sm font-medium text-white/70 tracking-wide uppercase mb-1">
                  {m.label}
                </div>
                <div className="text-xs text-white/40">{m.sub}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ─── The Signal ──────────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center" id="signal-section">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Marketing Spend", value: "$0" },
              { label: "Content Produced", value: "Zero" },
              { label: "Funnel", value: "None" },
              { label: "Conversion Rate", value: "100%" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="text-2xl md:text-3xl font-display font-bold text-[#a7cbd4]">{s.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-white/30 italic">
            "The myth IS the marketing. Operational fact, not theory."
          </p>
        </section>

        {/* ─── Timeline ────────────────────────────────────────────────────── */}
        <section id="timeline-section">
          <h2 className="text-2xl font-display text-center mb-8 text-white/80">The Journey</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#8460ea]/60 via-[#6894d0]/40 to-transparent" />

            <div className="space-y-8">
              {TIMELINE.map((t, i) => (
                <div
                  key={t.name}
                  className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  id={`timeline-${t.name.toLowerCase()}`}
                >
                  {/* Node */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-2 border-white/40 -translate-x-1/2 mt-2 z-10"
                    style={{ backgroundColor: t.color, boxShadow: `0 0 20px ${t.color}40` }}
                  />

                  {/* Content */}
                  <div className={`ml-16 md:ml-0 md:w-[45%] ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2" style={{ justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
                        <span className="text-xs font-mono text-white/30">Day {t.day}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-white/20 text-white/50">{t.type}</span>
                      </div>
                      <h3 className="text-lg font-display font-medium" style={{ color: t.color }}>{t.name}</h3>
                      <p className="text-sm text-white/40 mt-1">{t.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 12-Perspective Radar ─────────────────────────────────────────── */}
        <section id="radar-section">
          <h2 className="text-2xl font-display text-center mb-2 text-white/80">12-Perspective Morphogenetic Map</h2>
          <p className="text-sm text-white/30 text-center mb-8">Trinity (Essence · Significance · Implications) × 4 Quadrants (UL · UR · LL · LR)</p>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <ResponsiveContainer width="100%" height={420}>
              <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="perspective"
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "DM Sans" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Current State"
                  dataKey="value"
                  stroke="#8460ea"
                  fill="#8460ea"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(12, 18, 32, 0.95)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "13px",
                    fontFamily: "DM Sans",
                  }}
                  formatter={(value: number, _name: string, entry: any) => [
                    `${value}/10`,
                    entry.payload.fullLabel,
                  ]}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {RADAR_DATA.map((d) => (
                <div key={d.perspective} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{
                    backgroundColor: d.value >= 7 ? "#8460ea" : d.value >= 4 ? "#6894d0" : "#a4a3d0",
                    opacity: 0.8,
                  }} />
                  <span className="text-white/30 font-mono">{d.perspective}</span>
                  <span className="text-white/50">{d.fullLabel}</span>
                  <span className="text-white/20 ml-auto">{d.value}/10</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Concentric Circles of Scale ──────────────────────────────────── */}
        <section id="concentric-section">
          <h2 className="text-2xl font-display text-center mb-2 text-white/80">Concentric Circles of Scale</h2>
          <p className="text-sm text-white/30 text-center mb-8">From personal venture to universal species navigation</p>

          <div className="flex justify-center">
            <div className="relative w-[360px] h-[360px] md:w-[480px] md:h-[480px]">
              {CONCENTRIC_CIRCLES.map((c) => {
                const size = 60 + c.ring * 60;
                const mdSize = 80 + c.ring * 65;
                const opacity = c.status === "active" ? 1 : c.status === "building" ? 0.6 : c.status === "emerging" ? 0.4 : 0.2;
                const borderColor = c.status === "active" ? "#8460ea" : c.status === "building" ? "#6894d0" : "#a4a3d0";

                return (
                  <div
                    key={c.label}
                    className="absolute rounded-full border flex items-center justify-center transition-all duration-700 hover:scale-105"
                    style={{
                      width: `min(${size}px, ${(size / 360) * 100}%)`,
                      height: `min(${size}px, ${(size / 360) * 100}%)`,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      borderColor: `${borderColor}${Math.round(opacity * 80).toString(16).padStart(2, '0')}`,
                      backgroundColor: `${borderColor}${Math.round(opacity * 12).toString(16).padStart(2, '0')}`,
                      opacity,
                    }}
                    id={`circle-${c.ring}`}
                  >
                    {c.ring <= 2 && (
                      <div className="text-center">
                        <div className="text-[10px] md:text-xs font-medium text-white/70">{c.label}</div>
                        <div className="text-[8px] md:text-[10px] text-white/30">{c.scale}</div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Labels outside circles */}
              {CONCENTRIC_CIRCLES.filter((c) => c.ring > 2).map((c) => {
                const angle = -90 + (c.ring - 3) * 90;
                const radius = 45 + c.ring * 16;
                const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                const y = 50 + radius * Math.sin((angle * Math.PI) / 180);

                return (
                  <div
                    key={`label-${c.label}`}
                    className="absolute text-center pointer-events-none"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="text-[10px] md:text-xs font-medium text-white/40">{c.label}</div>
                    <div className="text-[8px] text-white/20">{c.scale}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Channel Activation ───────────────────────────────────────────── */}
        <section id="channels-section">
          <h2 className="text-2xl font-display text-center mb-8 text-white/80">Distribution Channels</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className={`rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02] ${
                  ch.status === "active"
                    ? "border-[#8460ea]/40 bg-[#8460ea]/10"
                    : ch.status === "next"
                    ? "border-[#6894d0]/30 bg-[#6894d0]/5"
                    : "border-white/8 bg-white/3"
                }`}
                id={`channel-${ch.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{ch.emoji}</span>
                  <span className="font-medium text-white/80">{ch.name}</span>
                </div>
                <p className="text-sm text-white/40">{ch.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Next Milestone ──────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#8460ea]/30 bg-[#8460ea]/5 backdrop-blur-xl p-8 text-center alive-card" id="next-milestone">
          <p className="text-xs uppercase tracking-[0.3em] text-[#a4a3d0] mb-3">Next Milestone</p>
          <h3 className="text-3xl md:text-4xl font-display font-medium bg-gradient-to-r from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent mb-4">
            First Paying Client
          </h3>
          <p className="text-white/40 max-w-lg mx-auto">
            $277 Ignition Session. The methodology is proven. The pipeline is organic.
            The only remaining step: cross the threshold.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-white/30">
            <span>4 canvases complete</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>2 more value exchanges</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Then: $277</span>
          </div>
        </section>

        {/* ─── Footer ──────────────────────────────────────────────────────── */}
        <footer className="text-center space-y-4 pt-8 pb-12" id="dashboard-footer">
          <p className="text-xs text-white/20 italic max-w-md mx-auto">
            "The invisible is the real. Everything else is its footprint.
            This dashboard reads the invisible and lets the footprints reveal themselves."
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-white/15">
            <span>Evolver · Morphogenetic Navigation</span>
            <span>·</span>
            <span>© 2026 Alexander Konstantinov</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default VentureDashboard;
