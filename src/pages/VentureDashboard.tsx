import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

// ─── Revenue Timeline Data ──────────────────────────────────────────────────

const REVENUE_TIMELINE = [
  { day: 0, date: "Mar 4", total: 0, label: "Day 0" },
  { day: 2, date: "Mar 5", total: 277, label: "Oyi (rev share)" },
  { day: 4, date: "Mar 7", total: 554, label: "Sergey ($277 rev share)" },
  { day: 30, date: "Apr 2", total: 604, label: "Oyi $50 gift" },
  { day: 34, date: "Apr 6", total: 715, label: "Karime $111 gratitude" },
  { day: 36, date: "Apr 8", total: 1231, label: "Oyi $516 gift" },
  { day: 40, date: "Apr 12", total: 1431, label: "Karime $200 in-kind" },
  { day: 41, date: "Apr 13", total: 1931, label: "Oyi $500 in-kind" },
  { day: 44, date: "Apr 18", total: 1931, label: "Kirill joins — 7th founder" },
  { day: 46, date: "Apr 20", total: 2250, label: "Oyi $319 in-kind (5 gifts)" },
];

// ─── KPI Data ───────────────────────────────────────────────────────────────

const KPIS = [
  {
    label: "Total Revenue",
    value: "$1,973",
    trend: "+$319",
    trendLabel: "Apr 20",
    trendUp: true,
    detail: "Cash: $677 · In-kind: $1,019 · Rev share: $277",
    color: "#8460ea",
  },
  {
    label: "Genius Founders",
    value: "7",
    trend: "+1",
    trendLabel: "Apr 18",
    trendUp: true,
    detail: "Alexander · Oyi · Sergey · Alexa · Sandra · Karime · Kirill",
    color: "#6894d0",
  },
  {
    label: "Continuation Rate",
    value: "100%",
    trend: "",
    trendLabel: "",
    trendUp: false,
    detail: "",
    color: "#a7cbd4",
  },
];

const SECONDARY_STATS = [
  { label: "Marketing Spend", value: "$0", accent: false },
  { label: "CRM Contacts", value: "31", accent: false },
  { label: "Days Active", value: "46", accent: false },
];

// ─── Revenue Breakdown ──────────────────────────────────────────────────────

const REVENUE_BREAKDOWN = [
  { name: "Oyi", cash: 566, inKind: 819, revShare: 0, type: "Cash + in-kind", status: "received", color: "#8460ea" },
  { name: "Karime", cash: 111, inKind: 200, revShare: 0, type: "Cash + in-kind", status: "received", color: "#6894d0" },
  { name: "Sergey", cash: 0, inKind: 0, revShare: 277, type: "Rev share", status: "pending", color: "#a7cbd4" },
];

// ─── Timeline ───────────────────────────────────────────────────────────────

const TIMELINE = [
  { day: 1, date: "Mar 4", name: "Alexander", type: "Client Zero", desc: "Built the methodology by applying it to himself first.", color: "#8460ea" },
  { day: 2, date: "Mar 5", name: "Oyi", type: "Gratitude ($566)", desc: "Complete business blueprint. Later sent $566 in gratitude gifts — without being asked.", color: "#6894d0" },
  { day: 4, date: "Mar 7", name: "Sergey", type: "Rev Share ($277)", desc: "Business blueprint created. Revenue share agreement. 3 follow-up sessions delivered.", color: "#a7cbd4" },
  { day: 9, date: "Mar 12", name: "Alexa", type: "Value Exchange", desc: "Complete blueprint in 2.5 hours — fastest session yet.", color: "#b1c9b6" },
  { day: 12, date: "Mar 15", name: "Sandra", type: "Rev Share (TBD)", desc: "6 sessions. Core identity, story, and audience crystallized.", color: "#cec9b0" },
  { day: 34, date: "Apr 6", name: "Karime", type: "Gratitude ($111)", desc: "Client + referral partner. Introduced 2 new contacts organically.", color: "#cea4ae" },
  { day: 40, date: "Apr 12", name: "Karime", type: "In-kind ($200)", desc: "Claude Pro subscription payment. Deepening operational partnership.", color: "#cea4ae" },
  { day: 41, date: "Apr 13", name: "Oyi", type: "In-kind ($500)", desc: "Comprehensive support: food, flights, transport. Sustained gratitude.", color: "#6894d0" },
  { day: 43, date: "Apr 17", name: "Oyi", type: "Mexico Intensive Wrap", desc: "4-day Mexico hacker-house / collective venture building concludes. First in-person intensive at length. Oyi: \"This may be the best view in town. I am thankful.\"", color: "#6894d0" },
  { day: 44, date: "Apr 18", name: "Kirill", type: "7th Founder Joins", desc: "Serial entrepreneur (17 businesses), integral practitioner, neuro-coaching trainer. Building QWATRA (AI-powered business interface) + GrowFox (health ecosystem). \"The 7th note in the octave — the tension that longs to resolve into something new.\"", color: "#b8a3d4" },
  { day: 46, date: "Apr 20", name: "Oyi", type: "In-kind ($319)", desc: "Five gifts totaling $319. Sustained gratitude continues — cumulative in-kind from Oyi now $819.", color: "#6894d0" },
];

// ─── Radar ──────────────────────────────────────────────────────────────────

const RADAR_DATA = [
  { perspective: "UL-Ess", fullLabel: "Founder Consciousness", value: 10, fullMark: 10 },
  { perspective: "UR-Ess", fullLabel: "Observable System", value: 9.5, fullMark: 10 },
  { perspective: "LL-Ess", fullLabel: "Shared Field", value: 8, fullMark: 10 },
  { perspective: "LR-Ess", fullLabel: "System Architecture", value: 7, fullMark: 10 },
  { perspective: "UL-Sig", fullLabel: "Ontological Liberation", value: 9.7, fullMark: 10 },
  { perspective: "UR-Sig", fullLabel: "Data Signal Strength", value: 9, fullMark: 10 },
  { perspective: "LL-Sig", fullLabel: "Movement Formation", value: 8.5, fullMark: 10 },
  { perspective: "LR-Sig", fullLabel: "Platform as Nervous System", value: 5, fullMark: 10 },
  { perspective: "UL-Imp", fullLabel: "Founder Inner Move", value: 9.5, fullMark: 10 },
  { perspective: "UR-Imp", fullLabel: "What Must Be Built", value: 8.5, fullMark: 10 },
  { perspective: "LL-Imp", fullLabel: "Tribe Must Act", value: 4, fullMark: 10 },
  { perspective: "LR-Imp", fullLabel: "System at Scale", value: 5, fullMark: 10 },
];

const CHANNELS = [
  { name: "Epicenter Broadcasts (DMs)", status: "active", emoji: "🟢", detail: "5 sent, 3 responded. Intuitive batches. Domain 65" },
  { name: "Referral Bridges", status: "active", emoji: "🟢", detail: "Karime → Patricia + Chris. Organic frequency translation" },
  { name: "Collaborator Network", status: "active", emoji: "🟢", detail: "Kirill (licensee), Anton (ZoG taker), Roso/Cori (demo)" },
  { name: "Social (TG · IG · FB)", status: "active", emoji: "🟢", detail: "3 surfaces activated Apr 8. Grind addiction post live" },
  { name: "Content Cadence", status: "ready", emoji: "🟡", detail: "Infographic Episodes ~60% complete. 10 viral posts queued" },
  { name: "Partnership (Upstream)", status: "seed", emoji: "🌱", detail: "Self-knowledge practitioners → 'Now what?' → us" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`;

// ─── Component ──────────────────────────────────────────────────────────────

const VentureDashboard = () => {
  const totalCash = REVENUE_BREAKDOWN.reduce((s, r) => s + r.cash, 0);
  const totalInKind = REVENUE_BREAKDOWN.reduce((s, r) => s + r.inKind, 0);
  const totalRevShare = REVENUE_BREAKDOWN.reduce((s, r) => s + r.revShare, 0);
  const totalAll = totalCash + totalInKind + totalRevShare;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }} id="venture-dashboard">

      {/* ─── Ambient background ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #8460ea 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #6894d0 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.02]"
          style={{ background: "radial-gradient(circle, #a7cbd4 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-5 pt-32 pb-16">

        {/* ─── Header ──────────────────────────────────────────────── */}
        <header className="mb-16 fade-in-section" id="dashboard-header">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#8460ea] animate-pulse" />
            <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-white">Live · Day 46</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium tracking-[-0.03em] text-white leading-tight mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Venture Dashboard
          </h1>
          <p className="text-[15px] text-white max-w-lg leading-relaxed">
            Aleksandr Konstantinov's Unique Business Methodology — tracking the emergence from first session to movement.
          </p>
        </header>

        {/* ─── KPI Grid ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3" id="kpi-grid">
          {KPIS.map((kpi, i) => (
            <div
              key={kpi.label}
              className="group relative rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                animationDelay: `${i * 100}ms`,
              }}
              id={`kpi-${i}`}
            >
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${kpi.color}08, transparent)` }} />
              <div className="relative">
                <div className="text-[11px] font-medium tracking-[0.15em] uppercase text-white mb-3">
                  {kpi.label}
                </div>
                <div className="text-3xl md:text-4xl font-medium tracking-[-0.02em] text-white mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {kpi.value}
                </div>
                <div className="flex items-center gap-2">
                  {kpi.trend && (
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
                      {kpi.trend}
                    </span>
                  )}
                  {kpi.trendLabel && <span className="text-[10px] text-white">{kpi.trendLabel}</span>}
                </div>
                {kpi.detail && <div className="text-[10px] text-white mt-2 leading-relaxed">{kpi.detail}</div>}
              </div>
            </div>
          ))}
        </section>

        {/* ─── Secondary Stats Bar ─────────────────────────────────── */}
        <section className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl px-5 py-3.5 mb-16"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
          id="secondary-stats"
        >
          {SECONDARY_STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">
                {s.value}
              </span>
              <span className="text-[10px] text-white uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </section>

        {/* ─── Revenue Chart + Breakdown ───────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-16" id="revenue-section">

          {/* Revenue Chart */}
          <div className="lg:col-span-3 rounded-xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-medium text-white mb-0.5">Revenue Timeline</h2>
                <p className="text-[10px] text-white">Cumulative revenue since Day 1</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-white">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-0.5 rounded-full bg-[#6894d0]" /> Total Revenue
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={REVENUE_TIMELINE} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8460ea" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#8460ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} width={45} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(10, 14, 26, 0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                    fontFamily: "DM Sans",
                    padding: "8px 12px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Total Revenue"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Area type="monotone" dataKey="total" stroke="#8460ea" strokeWidth={2} fill="url(#gradTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown */}
          <div className="lg:col-span-2 rounded-xl p-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-sm font-medium text-white mb-1">Revenue Breakdown</h2>
            <p className="text-[10px] text-white mb-5">By founder · cash · in-kind · rev share</p>

            <div className="space-y-3">
              {REVENUE_BREAKDOWN.map((r) => {
                const rTotal = r.cash + r.inKind + r.revShare;
                const pct = totalAll > 0 ? (rTotal / totalAll) * 100 : 0;
                return (
                  <div key={r.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-xs text-white font-medium">{r.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${r.status === "received" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                          {r.status === "received" ? "received" : "pending"}
                        </span>
                      </div>
                      <span className="text-xs text-white font-mono">{formatCurrency(rTotal)}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${r.color}80, ${r.color}40)` }} />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {r.cash > 0 && <span className="text-[9px] text-white">${r.cash} cash</span>}
                      {r.inKind > 0 && <span className="text-[9px] text-white">${r.inKind} in-kind</span>}
                      {r.revShare > 0 && <span className="text-[9px] text-white">${r.revShare.toLocaleString()} rev share</span>}
                      <span className="text-[9px] text-white/60 ml-auto">{r.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-white uppercase tracking-wider">Total</span>
                <span className="text-lg font-medium text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {formatCurrency(totalAll)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[9px] text-white">
                <span>${totalCash} cash</span>
                <span>${totalInKind} in-kind</span>
                <span>${totalRevShare} rev share</span>
              </div>
            </div>
          </div>
        </section>



        {/* ─── Next Milestone ──────────────────────────────────────── */}
        <section className="rounded-xl p-8 text-center alive-card mb-16"
          style={{ background: "rgba(132,96,234,0.04)", border: "1px solid rgba(132,96,234,0.12)" }}
          id="next-milestone"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#a4a3d0] mb-3">Next Milestone</p>
          <h3 className="text-2xl md:text-3xl font-medium mb-4 bg-gradient-to-r from-[#8460ea] via-[#6894d0] to-[#a7cbd4] bg-clip-text text-transparent"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            First $555 Ignition Session from Funnel
          </h3>
          <div className="flex items-center justify-center gap-6 text-[11px] text-white">
            <span>$1,696 received (cash + in-kind)</span>
            <span className="w-0.5 h-0.5 rounded-full bg-white/50" />
            <span>3 canvases to N=10</span>
            <span className="w-0.5 h-0.5 rounded-full bg-white/50" />
            <span>3/9 surfaces live</span>
          </div>
        </section>

        {/* ─── The Journey ─────────────────────────────────────────── */}
        <section id="timeline-section" className="mb-16">
          <h2 className="text-lg font-medium text-white mb-8" style={{ fontFamily: "'Cormorant Garamond', serif" }}>The Journey</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#8460ea]/30 via-[#6894d0]/20 to-transparent" />

            <div className="space-y-6">
              {TIMELINE.map((t, i) => (
                <div
                  key={t.name}
                  className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  id={`timeline-${t.name.toLowerCase()}`}
                >
                  {/* Node */}
                  <div className="absolute left-[7px] md:left-1/2 w-[15px] h-[15px] rounded-full -translate-x-1/2 mt-1.5 z-10 border border-white/10"
                    style={{ backgroundColor: `${t.color}30`, boxShadow: `0 0 12px ${t.color}20` }}
                  >
                    <div className="absolute inset-[3px] rounded-full" style={{ backgroundColor: t.color }} />
                  </div>

                  {/* Content */}
                  <div className={`ml-8 md:ml-0 md:w-[45%] ${i % 2 === 0 ? "md:pr-10 md:text-right" : "md:pl-10"}`}>
                    <div className="rounded-lg p-4 transition-all duration-300 hover:bg-white/[0.02]"
                      style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center gap-2 mb-1" style={{ justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
                        <span className="text-[10px] font-mono text-white">Day {t.day}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md text-white"
                          style={{ background: `${t.color}15`, border: `1px solid ${t.color}20` }}>
                          {t.type}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium mb-0.5" style={{ color: `${t.color}` }}>{t.name}</h3>
                      <p className="text-[11px] text-white leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 27-Perspective Radar ────────────────────────────────── */}
        <section id="radar-section" className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Systemic View</h2>
              <p className="text-[10px] text-white mt-0.5">27 perspectives · 4 quadrants × 3 dantians · 7 stages</p>
            </div>
            <a href="/holomap" className="text-[10px] text-[#6894d0] hover:text-[#8460ea] transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#8460ea]/30">
              Open Holomap →
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {/* Radar Chart */}
            <div className="lg:col-span-3 rounded-xl p-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis
                    dataKey="perspective"
                    tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "'DM Sans'" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 9 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Current"
                    dataKey="value"
                    stroke="#8460ea"
                    fill="#8460ea"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 14, 26, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                      fontFamily: "DM Sans",
                      padding: "8px 12px",
                    }}
                    formatter={(value: number, _name: string, entry: any) => [
                      `${value}/10`,
                      entry.payload.fullLabel,
                    ]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Grid */}
            <div className="lg:col-span-2 rounded-xl p-5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="space-y-2">
                {RADAR_DATA.map((d) => {
                  const intensity = d.value / 10;
                  const barColor = d.value >= 8 ? "#8460ea" : d.value >= 6 ? "#6894d0" : "#a4a3d0";
                  return (
                    <div key={d.perspective} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-white w-[42px]">{d.perspective}</span>
                          <span className="text-[11px] text-white">{d.fullLabel}</span>
                        </div>
                        <span className="text-[11px] font-mono text-white">{d.value}</span>
                      </div>
                      <div className="h-[3px] rounded-full bg-white/[0.03] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${intensity * 100}%`, backgroundColor: barColor, opacity: 0.6 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white">Average</span>
                <span className="text-sm font-medium text-white">{(RADAR_DATA.reduce((s, d) => s + d.value, 0) / RADAR_DATA.length).toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Distribution Channels ───────────────────────────────── */}
        <section id="channels-section" className="mb-16">
          <h2 className="text-lg font-medium text-white mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Distribution Channels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: ch.status === "active" ? "rgba(132,96,234,0.04)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${ch.status === "active" ? "rgba(132,96,234,0.1)" : "rgba(255,255,255,0.04)"}`,
                }}
                id={`channel-${ch.name.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs">{ch.emoji}</span>
                  <span className="text-xs font-medium text-white">{ch.name}</span>
                </div>
                <p className="text-[11px] text-white leading-relaxed">{ch.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Footer ──────────────────────────────────────────────── */}
        <footer className="pt-8 pb-12 border-t border-white/[0.03]" id="dashboard-footer">
          <div className="flex items-center justify-between text-[10px] text-white">
            <span>Built in public · Updated in near-real time</span>
            <span>© 2026 Aleksandr Konstantinov</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default VentureDashboard;
