import { useEffect, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";

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
  { day: 51, date: "Apr 25", total: 2250, label: "Codification — commercial-decentralization model + Specificity Loop shipped, repo publicly fork-ready" },
  { day: 53, date: "Apr 27", total: 2250, label: "AI OS empirical-rating telemetry + UBB founder-doc bulk seed (16/18) + .env hygiene closure" },
];

// ─── KPI Data ───────────────────────────────────────────────────────────────

const KPIS = [
  {
    label: "Total Revenue",
    value: "$1,973",
    trend: "+$319",
    trendLabel: "Apr 20",
    detail: "Cash: $677 · In-kind: $1,019 · Rev share: $277",
    gold: true,
  },
  {
    label: "Genius Founders",
    value: "7",
    trend: "+1",
    trendLabel: "Apr 18",
    detail: "Alexander · Oyi · Sergey · Alexa · Sandra · Karime · Kirill",
    gold: false,
  },
  {
    label: "Continuation Rate",
    value: "100%",
    trend: "",
    trendLabel: "",
    detail: "",
    gold: false,
  },
];

const SECONDARY_STATS = [
  { label: "Marketing Spend", value: "$0" },
  { label: "CRM Contacts", value: "31" },
  { label: "Days Active", value: "53" },
];

// ─── Revenue Breakdown ──────────────────────────────────────────────────────

const REVENUE_BREAKDOWN = [
  { name: "Oyi", cash: 566, inKind: 819, revShare: 0, type: "Cash + in-kind", status: "received", color: "#a06d08" },
  { name: "Karime", cash: 111, inKind: 200, revShare: 0, type: "Cash + in-kind", status: "received", color: "#7a5108" },
  { name: "Sergey", cash: 0, inKind: 0, revShare: 277, type: "Rev share", status: "pending", color: "#b8860b" },
];

// ─── Timeline ───────────────────────────────────────────────────────────────

const TIMELINE = [
  { day: 1, date: "Mar 4", name: "Alexander", type: "Client Zero", desc: "Built the methodology by applying it to himself first." },
  { day: 2, date: "Mar 5", name: "Oyi", type: "Gratitude ($566)", desc: "Complete business blueprint. Later sent $566 in gratitude gifts — without being asked." },
  { day: 4, date: "Mar 7", name: "Sergey", type: "Rev Share ($277)", desc: "Business blueprint created. Revenue share agreement. 3 follow-up sessions delivered." },
  { day: 9, date: "Mar 12", name: "Alexa", type: "Value Exchange", desc: "Complete blueprint in 2.5 hours — fastest session yet." },
  { day: 12, date: "Mar 15", name: "Sandra", type: "Rev Share (TBD)", desc: "6 sessions. Core identity, story, and audience crystallized." },
  { day: 34, date: "Apr 6", name: "Karime", type: "Gratitude ($111)", desc: "Client + referral partner. Introduced 2 new contacts organically." },
  { day: 40, date: "Apr 12", name: "Karime", type: "In-kind ($200)", desc: "Claude Pro subscription payment. Deepening operational partnership." },
  { day: 41, date: "Apr 13", name: "Oyi", type: "In-kind ($500)", desc: "Comprehensive support: food, flights, transport. Sustained gratitude." },
  { day: 43, date: "Apr 17", name: "Oyi", type: "Mexico Intensive Wrap", desc: "4-day Mexico hacker-house / collective venture building concludes. First in-person intensive at length. Oyi: \"This may be the best view in town. I am thankful.\"" },
  { day: 44, date: "Apr 18", name: "Kirill", type: "7th Founder Joins", desc: "Serial entrepreneur (17 businesses), integral practitioner, neuro-coaching trainer. Building QWATRA + GrowFox. \"The 7th note in the octave — the tension that longs to resolve into something new.\"" },
  { day: 46, date: "Apr 20", name: "Oyi", type: "In-kind ($319)", desc: "Five gifts totaling $319. Sustained gratitude continues — cumulative in-kind from Oyi now $819." },
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`);

/** Resolve skin-aware chart palette by reading the active <html data-skin>. */
const useSkinChartPalette = () => {
  const [skin, setSkin] = useState<"aurora" | "navy-gold">(() => {
    if (typeof document === "undefined") return "aurora";
    return (document.documentElement.dataset.skin as any) || "aurora";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => {
      setSkin((document.documentElement.dataset.skin as any) || "aurora");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-skin"] });
    return () => obs.disconnect();
  }, []);

  const isDark = skin === "navy-gold";
  return {
    tick: isDark ? "rgba(245,241,232,0.78)" : "rgba(11,42,90,0.72)",
    grid: isDark ? "rgba(212,175,55,0.10)" : "rgba(26,30,58,0.10)",
    accent: isDark ? "#d4af37" : "#a06d08",
    accentSoft: isDark ? "#f4d472" : "#b8860b",
    tooltipBg: isDark ? "rgba(10, 22, 40, 0.95)" : "rgba(255, 255, 255, 0.96)",
    tooltipBorder: isDark ? "rgba(212,175,55,0.3)" : "rgba(26,30,58,0.12)",
    tooltipText: isDark ? "#f5f1e8" : "#0b2a5a",
  };
};

// ─── Shared style fragments (skin-aware) ────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: "var(--skin-card-bg, rgba(255,255,255,0.45))",
  border: "1px solid var(--skin-card-border, rgba(26,30,58,0.08))",
  boxShadow: "var(--skin-card-shadow, 0 4px 16px -8px rgba(10,22,40,0.12), 0 16px 40px -20px rgba(10,22,40,0.18))",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "0.66rem",
  letterSpacing: "0.28em",
  textTransform: "uppercase",
  fontWeight: 500,
  color: "var(--skin-text-muted, rgba(11,42,90,0.72))",
};

const haloStrong: React.CSSProperties = {
  textShadow: "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
};

const haloSubtle: React.CSSProperties = {
  textShadow: "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
};

const serif = { fontFamily: "'Cormorant Garamond', serif" } as React.CSSProperties;

// Day 51 (Sasha 2026-04-25): Cormorant Garamond's "1" reads as "I" even
// with `lnum` forced — its lining figures still keep the serif-1 ambiguity.
// Numerals swapped to DM Sans (already loaded for body) with tabular-nums.
// Editorial-dashboard convention: serif titles + clean sans-serif data.
// "1" is unambiguously "1", digits sit at uniform width for column scan.
const numerals: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontVariantNumeric: "tabular-nums lining-nums",
  fontFeatureSettings: '"tnum" 1, "lnum" 1',
};

// ─── Component ──────────────────────────────────────────────────────────────

const VentureDashboard = () => {
  const palette = useSkinChartPalette();
  const totalCash = REVENUE_BREAKDOWN.reduce((s, r) => s + r.cash, 0);
  const totalInKind = REVENUE_BREAKDOWN.reduce((s, r) => s + r.inKind, 0);
  const totalRevShare = REVENUE_BREAKDOWN.reduce((s, r) => s + r.revShare, 0);
  const totalAll = totalCash + totalInKind + totalRevShare;

  const textPrimary = { color: "var(--skin-text-primary, #0b2a5a)" };
  const textMuted = { color: "var(--skin-text-muted, rgba(11,42,90,0.72))" };
  const textMutedSoft = { color: "var(--skin-text-muted-soft, rgba(11,42,90,0.6))" };

  return (
    <div className="relative" style={{ fontFamily: "'DM Sans', sans-serif" }} id="venture-dashboard">
      <div className="max-w-[1100px] mx-auto px-5 pt-6 pb-16 md:pt-10 md:pb-20">

        {/* ═══════ HEADER ═══════ */}
        <header className="text-center mb-6 fade-in-section" id="dashboard-header">
          <div className="flex items-center justify-center gap-2 mb-4" style={eyebrowStyle}>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--skin-accent-gold, #b8860b)" }}
            />
            <span>Live · Day 46</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-[-0.01em] mb-3"
            style={{ ...serif, ...textPrimary, ...haloStrong }}
          >
            Venture <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>Growth Dashboard</span>
          </h1>

          <p
            className="text-lg sm:text-xl md:text-2xl leading-[1.25] tracking-[-0.005em] italic max-w-xl mx-auto"
            style={{ ...serif, fontWeight: 400, ...textMuted, ...haloSubtle }}
          >
            Built in the open. Paid in the open. Open-source methodology.
          </p>

          <Ornament className="my-6 sm:my-8" />
        </header>

        {/* ═══════ WHAT THIS IS · WHAT'S COMING ═══════ */}
        {/* Day 54 (Sasha 2026-04-28): editorial context block — sets the
            frame before the numbers land. Two beats:
              1. WHAT THIS IS — the dashboard reflects the state of the
                 venture AND the state of the founders building their
                 unique businesses inside it. Both, live.
              2. WHAT'S COMING — founders who advance through the journey
                 will be able to fork this entire platform and run it for
                 their own community — same engine, same methodology,
                 their own tribe and brand. The signal travels by
                 replication. Released in the next version. */}
        <section
          className="rounded-xl px-6 py-8 sm:px-8 sm:py-10 mb-12 fade-in-section"
          style={cardStyle}
          id="dashboard-context"
          aria-label="What this dashboard is and what's coming next"
        >
          <div className="grid gap-8 sm:gap-10 sm:grid-cols-2 sm:divide-x sm:divide-[rgba(212,175,55,0.18)]">
            {/* — What this is — */}
            <div className="sm:pr-8">
              <div className="mb-3" style={eyebrowStyle}>
                What this is
              </div>
              <p
                className="text-base sm:text-lg leading-[1.55] tracking-[-0.005em] italic"
                style={{ ...serif, fontWeight: 400, ...textPrimary, ...haloSubtle }}
              >
                The state of the venture, and the state of the founders building their{" "}
                <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                  unique businesses
                </span>{" "}
                inside it. The dashboard updates as both evolve.
              </p>
            </div>

            {/* — What's coming — */}
            <div className="sm:pl-8">
              <div className="mb-3" style={eyebrowStyle}>
                What's coming
              </div>
              <p
                className="text-base sm:text-lg leading-[1.55] tracking-[-0.005em] italic"
                style={{ ...serif, fontWeight: 400, ...textPrimary, ...haloSubtle }}
              >
                Founders who advance through the journey will be able to{" "}
                <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                  fork this entire platform
                </span>{" "}
                and offer it to their community — same engine, same methodology, their own tribe and brand. Every active founder becomes a node.
              </p>
              <p
                className="mt-3 text-[12px] uppercase tracking-[0.18em]"
                style={{ ...textMutedSoft, fontWeight: 500 }}
              >
                Released in the next version.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════ KPI GRID ═══════ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3" id="kpi-grid">
          {KPIS.map((kpi, i) => (
            // Day 51 evening (Sasha 2026-04-25): all KPI cards now
            // center their content uniformly. Earlier branch (only
            // centering when no trend/detail) made cards visually
            // inconsistent — single-digit values like "7" looked
            // marooned in the top-left while siblings filled their
            // cards. Consistent centering reads more balanced and
            // matches the editorial register of the dashboard.
            // Day 51 night (Sasha 2026-04-25): switched justify-center →
            // justify-start so the BIG NUMBERS sit at the same Y across
            // all three cards. Previously "100%" floated to the geometric
            // center of its (taller-than-content) card while $1,973 and
            // "7" were lifted by their trend + detail rows below. Now the
            // label/number stack is top-anchored uniformly and the empty
            // space sits at the bottom of the no-trend card.
            <div
              key={kpi.label}
              className="rounded-xl p-5 transition-all duration-300 hover:translate-y-[-1px] flex flex-col items-center justify-start text-center"
              style={{ ...cardStyle, animationDelay: `${i * 100}ms` }}
              id={`kpi-${i}`}
            >
              <div className="text-[11px] font-medium tracking-[0.18em] uppercase mb-3 text-center" style={textMuted}>
                {kpi.label}
              </div>
              <div
                className="text-4xl md:text-5xl font-medium tracking-[-0.02em] mb-2 leading-none text-center"
                style={{
                  ...numerals,
                  ...(kpi.gold ? {} : textPrimary),
                  ...(kpi.gold ? {} : haloSubtle),
                }}
              >
                {kpi.gold ? (
                  <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                    {kpi.value}
                  </span>
                ) : (
                  kpi.value
                )}
              </div>
              <div className="flex items-center justify-center gap-2">
                {kpi.trend && (
                  <span
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{
                      background: "var(--skin-accent-gold-glow-bg, rgba(184,134,11,0.10))",
                      color: "var(--skin-accent-gold, #b8860b)",
                    }}
                  >
                    {kpi.trend}
                  </span>
                )}
                {kpi.trendLabel && <span className="text-[10px]" style={textMutedSoft}>{kpi.trendLabel}</span>}
              </div>
              {kpi.detail && (
                <div className="text-[10px] mt-2 leading-relaxed text-center" style={textMutedSoft}>
                  {kpi.detail}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ═══════ SECONDARY STATS ═══════ */}
        <section
          className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 rounded-xl px-5 py-3.5 mb-12"
          style={cardStyle}
          id="secondary-stats"
        >
          {SECONDARY_STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-base font-medium" style={{ ...numerals, ...textPrimary }}>{s.value}</span>
              <span className="text-[10px] uppercase tracking-[0.18em]" style={textMuted}>{s.label}</span>
            </div>
          ))}
        </section>

        <Ornament className="my-10" />

        {/* ═══════ REVENUE ═══════ */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-12" id="revenue-section">

          {/* Revenue Chart */}
          <div className="lg:col-span-3 rounded-xl p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-medium mb-0.5" style={{ ...serif, ...textPrimary }}>
                  Revenue Timeline
                </h2>
                <p className="text-[11px]" style={textMuted}>Cumulative revenue since Day 1</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]" style={textMuted}>
                <span className="w-2 h-0.5 rounded-full" style={{ background: palette.accent }} />
                Total Revenue
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={REVENUE_TIMELINE} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                <XAxis dataKey="date" tick={{ fill: palette.tick, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: palette.tick, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v)}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: palette.tooltipBg,
                    border: `1px solid ${palette.tooltipBorder}`,
                    borderRadius: "8px",
                    color: palette.tooltipText,
                    fontSize: "12px",
                    fontFamily: "DM Sans",
                    padding: "8px 12px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Total Revenue"]}
                />
                <Area type="monotone" dataKey="total" stroke={palette.accent} strokeWidth={2} fill="url(#gradTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown */}
          <div className="lg:col-span-2 rounded-xl p-6" style={cardStyle}>
            <h2 className="text-xl font-medium mb-1" style={{ ...serif, ...textPrimary }}>Revenue Breakdown</h2>
            <p className="text-[11px] mb-5" style={textMuted}>By founder · cash · in-kind · rev share</p>

            <div className="space-y-3">
              {REVENUE_BREAKDOWN.map((r) => {
                const rTotal = r.cash + r.inKind + r.revShare;
                const pct = totalAll > 0 ? (rTotal / totalAll) * 100 : 0;
                return (
                  <div key={r.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.color }} />
                        <span className="text-xs font-medium" style={textPrimary}>{r.name}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-md"
                          style={{
                            background: r.status === "received" ? "rgba(184,134,11,0.10)" : "rgba(120,90,30,0.08)",
                            color: r.status === "received" ? "var(--skin-accent-gold, #b8860b)" : "var(--skin-text-muted, rgba(11,42,90,0.72))",
                          }}
                        >
                          {r.status === "received" ? "received" : "pending"}
                        </span>
                      </div>
                      <span className="text-xs font-mono" style={textPrimary}>{formatCurrency(rTotal)}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--skin-card-border, rgba(26,30,58,0.08))" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${r.color}, ${r.color}66)` }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {r.cash > 0 && <span className="text-[9px]" style={textMutedSoft}>${r.cash} cash</span>}
                      {r.inKind > 0 && <span className="text-[9px]" style={textMutedSoft}>${r.inKind} in-kind</span>}
                      {r.revShare > 0 && <span className="text-[9px]" style={textMutedSoft}>${r.revShare.toLocaleString()} rev share</span>}
                      <span className="text-[9px] ml-auto" style={textMutedSoft}>{r.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--skin-card-border, rgba(26,30,58,0.08))" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-[0.18em]" style={textMuted}>Total</span>
                <span className="text-2xl font-medium" style={numerals}>
                  <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
                    {formatCurrency(totalAll)}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-4 text-[9px]" style={textMutedSoft}>
                <span>${totalCash} cash</span>
                <span>${totalInKind} in-kind</span>
                <span>${totalRevShare} rev share</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ NEXT MILESTONE ═══════ */}
        <section
          className="rounded-xl p-8 text-center mb-12 alive-card"
          style={cardStyle}
          id="next-milestone"
        >
          <p className="mb-3" style={eyebrowStyle}>Next Milestone</p>
          <h3
            className="text-2xl md:text-3xl font-medium mb-4"
            style={serif}
          >
            <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
              First $555 Productize Yourself Session from Funnel
            </span>
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px]" style={textMuted}>
            <span>$1,696 received (cash + in-kind)</span>
            <span className="w-1 h-1 rounded-full" style={{ background: "var(--skin-text-muted, rgba(11,42,90,0.4))" }} />
            <span>3 canvases to N=10</span>
            <span className="w-1 h-1 rounded-full" style={{ background: "var(--skin-text-muted, rgba(11,42,90,0.4))" }} />
            <span>3/9 surfaces live</span>
          </div>
        </section>

        <Ornament className="my-10" />

        {/* ═══════ THE JOURNEY ═══════ */}
        <section id="timeline-section" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-medium mb-2 text-center" style={{ ...serif, ...textPrimary, ...haloStrong }}>
            The Journey
          </h2>
          <p className="text-center italic mb-8 text-base md:text-lg" style={{ ...serif, ...textMuted, ...haloSubtle }}>
            Forty-six days. Seven founders. One emerging field.
          </p>

          <div className="relative">
            {/* Day 53 (Sasha 2026-04-27): timeline line + nodes hidden on
                mobile. The amber circles + vertical line on the left of
                each card weren't aesthetically pleasing and didn't carry
                meaningful function on a stacked single-column layout.
                Desktop keeps the timeline visualization where it earns
                its place via the alternating left/right card layout. */}
            <div
              className="hidden md:block absolute left-[7px] md:left-1/2 top-0 bottom-0 w-px"
              style={{
                background:
                  "linear-gradient(to bottom, var(--skin-accent-gold, #b8860b)40, var(--skin-accent-gold, #b8860b)20, transparent)",
              }}
            />

            <div className="space-y-6">
              {TIMELINE.map((t, i) => (
                <div
                  key={`${t.name}-${t.day}`}
                  className={`relative flex items-start gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                  id={`timeline-${t.name.toLowerCase()}-${t.day}`}
                >
                  {/* Node — desktop only (see comment above) */}
                  <div
                    className="hidden md:block absolute left-[7px] md:left-1/2 w-[15px] h-[15px] rounded-full -translate-x-1/2 mt-1.5 z-10"
                    style={{
                      background: "var(--skin-accent-gold, #b8860b)",
                      boxShadow:
                        "0 0 0 3px var(--skin-card-bg, rgba(255,255,255,0.45)), 0 0 12px rgba(184,134,11,0.4)",
                    }}
                  />

                  {/* Content */}
                  <div className={`md:w-[45%] ${i % 2 === 0 ? "md:pr-10 md:text-right" : "md:pl-10"}`}>
                    <div className="rounded-lg p-4" style={cardStyle}>
                      <div
                        className="flex items-center gap-2 mb-1"
                        style={{ justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}
                      >
                        <span className="text-[10px] font-mono" style={textMuted}>Day {t.day}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-md"
                          style={{
                            background: "rgba(184,134,11,0.10)",
                            color: "var(--skin-accent-gold, #b8860b)",
                            border: "1px solid rgba(184,134,11,0.20)",
                          }}
                        >
                          {t.type}
                        </span>
                      </div>
                      <h3 className="text-base font-medium mb-1" style={{ ...serif, ...textPrimary }}>{t.name}</h3>
                      <p className="text-[12px] leading-relaxed" style={textMuted}>{t.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Ornament className="my-10" />

        {/* ═══════ 27-PERSPECTIVE RADAR ═══════ */}
        <section id="radar-section" className="mb-12">
          <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl md:text-3xl font-medium mb-1" style={{ ...serif, ...textPrimary, ...haloStrong }}>
                Systemic View
              </h2>
              <p className="text-[11px]" style={textMuted}>27 perspectives · 4 quadrants × 3 dantians · 7 stages</p>
            </div>
            <a
              href="/holomap"
              className="text-[11px] px-3 py-1.5 rounded-lg transition-colors"
              style={{
                color: "var(--skin-accent-gold, #b8860b)",
                border: "1px solid var(--skin-card-border, rgba(184,134,11,0.25))",
                background: "var(--skin-card-bg, rgba(255,255,255,0.45))",
              }}
            >
              Open Holomap →
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {/* Radar Chart */}
            <div className="lg:col-span-3 rounded-xl p-5" style={cardStyle}>
              <ResponsiveContainer width="100%" height={380}>
                <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="72%">
                  <PolarGrid stroke={palette.grid} />
                  <PolarAngleAxis
                    dataKey="perspective"
                    tick={{ fill: palette.tick, fontSize: 10, fontFamily: "'DM Sans'" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: palette.tick, fontSize: 9 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Current"
                    dataKey="value"
                    stroke={palette.accent}
                    fill={palette.accent}
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: palette.tooltipBg,
                      border: `1px solid ${palette.tooltipBorder}`,
                      borderRadius: "8px",
                      color: palette.tooltipText,
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

            {/* Legend */}
            <div className="lg:col-span-2 rounded-xl p-5" style={cardStyle}>
              <div className="space-y-2">
                {RADAR_DATA.map((d) => {
                  const intensity = d.value / 10;
                  return (
                    <div key={d.perspective}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono w-[42px]" style={textMuted}>{d.perspective}</span>
                          <span className="text-[11px]" style={textPrimary}>{d.fullLabel}</span>
                        </div>
                        <span className="text-[11px] font-mono" style={textPrimary}>{d.value}</span>
                      </div>
                      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "var(--skin-card-border, rgba(26,30,58,0.08))" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${intensity * 100}%`,
                            background: palette.accent,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="mt-4 pt-3 flex items-center justify-between"
                style={{ borderTop: "1px solid var(--skin-card-border, rgba(26,30,58,0.08))" }}
              >
                <span className="text-[10px] uppercase tracking-[0.18em]" style={textMuted}>Average</span>
                <span className="text-base font-medium" style={{ ...serif, ...textPrimary }}>
                  {(RADAR_DATA.reduce((s, d) => s + d.value, 0) / RADAR_DATA.length).toFixed(1)}/10
                </span>
              </div>
            </div>
          </div>
        </section>

        <Ornament className="my-10" />

        {/* ═══════ FOOTER ═══════ */}
        <footer
          className="pt-8 pb-4 mt-4"
          style={{ borderTop: "1px solid var(--skin-card-border, rgba(26,30,58,0.08))" }}
          id="dashboard-footer"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]" style={textMutedSoft}>
            <span>Built in public · Updated in near-real time</span>
            <span>© 2026 Aleksandr Konstantinov</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default VentureDashboard;
