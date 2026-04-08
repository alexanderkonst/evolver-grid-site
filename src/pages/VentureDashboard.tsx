import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_METRICS = [
  { label: "Revenue from Alexander's Genius Business", value: "$6.9K", sub: "Cash: $677 · Agreed rev share: $6.2K", icon: "💰" },
  { label: "Revenue from All Genius Businesses Created", value: "$6.9K", sub: "Alexander's business is the first to generate revenue", icon: "📊" },
  { label: "Activated Genius Founders", value: "6", sub: "Alexander · Oyi · Sergey · Alexa · Sandra · Karime", icon: "🔥" },
];

const TIMELINE = [
  { day: 1, date: "Mar 4", name: "Alexander", type: "Client Zero", desc: "Mask-on-first. Ran the full process on himself.", color: "#8460ea" },
  { day: 2, date: "Mar 5", name: "Oyi", type: "Gratitude ($566)", desc: "Full canvas. Myth discovery. $50 initial + $516 gift (Apr 8). Flying to Mexico for intensive.", color: "#6894d0" },
  { day: 4, date: "Mar 7", name: "Sergey", type: "Rev Share ($277)", desc: "Product Kernel v1.0. 3 gift sessions delivered.", color: "#a7cbd4" },
  { day: 9, date: "Mar 12", name: "Alexa", type: "Value Exchange", desc: "Full canvas in 2.5hrs. Fastest yet. Invited to Build.", color: "#b1c9b6" },
  { day: 12, date: "Mar 15", name: "Sandra", type: "Rev Share (TBD)", desc: "6 sessions. Uniqueness + myth + tribe landed.", color: "#cec9b0" },
  { day: 34, date: "Apr 6", name: "Karime", type: "Gratitude ($111)", desc: "Bridge + client. Referring Chris + Patricia. Session 2 tomorrow.", color: "#cea4ae" },
];

const RADAR_DATA = [
  { perspective: "UL-Ess", fullLabel: "Founder Consciousness", value: 10, fullMark: 10 },
  { perspective: "UR-Ess", fullLabel: "Observable System", value: 9.5, fullMark: 10 },
  { perspective: "LL-Ess", fullLabel: "Shared Field", value: 7.5, fullMark: 10 },
  { perspective: "LR-Ess", fullLabel: "System Architecture", value: 7, fullMark: 10 },
  { perspective: "UL-Sig", fullLabel: "Ontological Liberation", value: 9.5, fullMark: 10 },
  { perspective: "UR-Sig", fullLabel: "Data Signal Strength", value: 8.5, fullMark: 10 },
  { perspective: "LL-Sig", fullLabel: "Movement Formation", value: 8, fullMark: 10 },
  { perspective: "LR-Sig", fullLabel: "Platform as Nervous System", value: 5, fullMark: 10 },
  { perspective: "UL-Imp", fullLabel: "Founder Inner Move", value: 9.5, fullMark: 10 },
  { perspective: "UR-Imp", fullLabel: "What Must Be Built", value: 8.5, fullMark: 10 },
  { perspective: "LL-Imp", fullLabel: "Tribe Must Act", value: 4, fullMark: 10 },
  { perspective: "LR-Imp", fullLabel: "System at Scale", value: 4.5, fullMark: 10 },
];

const CHANNELS = [
  { name: "Epicenter Broadcasts (DMs)", status: "active", emoji: "🟢", detail: "5 sent, 3 responded. Intuitive batches. Domain 65" },
  { name: "Referral Bridges", status: "active", emoji: "🟢", detail: "Karime → Patricia + Chris. Organic frequency translation" },
  { name: "Collaborator Network", status: "active", emoji: "🟢", detail: "Kirill (licensee), Anton (ZoG taker), Roso/Cori (demo)" },
  { name: "7-Surface Activation", status: "ready", emoji: "🟡", detail: "WhatsApp · Telegram · IG · LinkedIn · FB · X · YouTube — copy locked" },
  { name: "Content Cadence", status: "planned", emoji: "🔜", detail: "10 viral posts + 3-slide carousel — stamped, ready to deploy" },
  { name: "Partnership (Upstream)", status: "seed", emoji: "🌱", detail: "Self-knowledge practitioners → 'Now what?' → us. Architecture mapped" },
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
            Last updated: April 8, 2026 · Day 36
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
              { label: "CRM Contacts", value: "24" },
              { label: "Client Retention", value: "100%" },
              { label: "Certified Facilitators", value: "1", note: "upon certification completion" },
            ].map((s) => (
              <div key={s.label} className="space-y-1">
              <div className="text-2xl md:text-3xl font-display font-bold text-[#a7cbd4]">{s.value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{s.label}</div>
                {(s as any).note && <div className="text-[10px] text-white/25 mt-0.5">({(s as any).note})</div>}
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-white/30 italic">
            "The myth IS the marketing. Operational fact, not theory."
          </p>
        </section>

        {/* ─── Next Milestone ──────────────────────────────────────────────── */}
        <section className="rounded-2xl border border-[#8460ea]/30 bg-[#8460ea]/5 backdrop-blur-xl p-8 text-center alive-card" id="next-milestone">
          <p className="text-xs uppercase tracking-[0.3em] text-[#a4a3d0] mb-3">Next Milestone</p>
          <h3 className="text-3xl md:text-4xl font-display font-medium bg-gradient-to-r from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent mb-4">
            First $555 Ignition Session
          </h3>
          <p className="text-white/40 max-w-lg mx-auto">
            6 Genius Business offers created. The methodology is proven. The pipeline is alive.
            Next: first full-price paid session from a new client.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-white/30">
            <span>$677 cash received</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>$6.2K agreed rev share</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>24 contacts in CRM</span>
          </div>
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
          <p className="text-sm text-white/30 text-center mb-4">Trinity (Essence · Significance · Implications) × 4 Quadrants (UL · UR · LL · LR)</p>
          <div className="text-center mb-8">
            <a href="/holomap" className="text-xs text-[#6894d0] hover:text-[#8460ea] transition-colors inline-flex items-center gap-1.5 border border-[#6894d0]/30 px-3 py-1.5 rounded-full hover:border-[#8460ea]/40">
              Open Full Navigation Instrument →
            </a>
          </div>

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



        {/* ─── Footer ──────────────────────────────────────────────────────── */}
        <footer className="text-center space-y-4 pt-8 pb-12" id="dashboard-footer">
          <p className="text-xs text-white/20 italic max-w-md mx-auto">
            "The invisible is the real. Everything else is its footprint.
            This dashboard reads the invisible and lets the footprints reveal themselves."
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-white/15">
            <span>Genius Business · Morphogenetic Navigation</span>
            <span>·</span>
            <span>© 2026 Alexander Konstantinov</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default VentureDashboard;
