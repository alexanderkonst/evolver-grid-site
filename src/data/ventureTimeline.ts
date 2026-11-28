/**
 * Venture timeline: the single source for the public business data.
 * Read by /dashboard (src/pages/VentureDashboard.tsx) and by the
 * "Our business, in public" section of /collective (src/pages/CollectiveLanding.tsx).
 *
 * Add a milestone here and it shows up on both pages. `key: true` marks a turning
 * point for the "Key milestones" view on /collective (keep it to 5-7). The flag
 * is ignored by /dashboard.
 */


// ─── Revenue Timeline Data ──────────────────────────────────────────────────

export interface RevenueTimelineEntry {
  day: number;
  date: string;
  total: number;
  label: string;
  /** Turning point: shown in the "Key milestones" view on /collective. */
  key?: boolean;
}

export const REVENUE_TIMELINE: RevenueTimelineEntry[] = [
  { day: 0, date: "Mar 4", total: 0, label: "Day 0" },
  { day: 30, date: "Apr 2", total: 50, label: "O. $50 gift", key: true },
  { day: 34, date: "Apr 6", total: 161, label: "K. $111 gratitude" },
  { day: 36, date: "Apr 8", total: 677, label: "O. $516 gift" },
  { day: 40, date: "Apr 12", total: 877, label: "K. $200 in-kind" },
  { day: 41, date: "Apr 13", total: 1377, label: "O. $500 in-kind" },
  { day: 44, date: "Apr 18", total: 1377, label: "Ki. joins — 7th founder", key: true },
  { day: 46, date: "Apr 20", total: 1696, label: "O. $319 in-kind (5 gifts)" },
  { day: 51, date: "Apr 25", total: 1696, label: "Codification — commercial-decentralization model + Specificity Loop shipped, repo publicly fork-ready", key: true },
  { day: 53, date: "Apr 27", total: 1696, label: "Your AI empirical-rating telemetry + UBB founder-doc bulk seed (16/18) + .env hygiene closure" },
  { day: 54, date: "Apr 28", total: 1696, label: "Your AI elevated to its own Space (process / substrate / being); MIT scoped to Your AI scaffold; admin operator-console + magic-link delivery" },
  { day: 58, date: "May 2", total: 1696, label: "Top Talent surface deep restructure: free reveal rebuilt with Top Shadow promoted, ME space restructured to 10 canonical subpages, /activate retired in favor of in-shell Start Here, deep profile schema merged into single Lovable call, second-person voice + no-jargon rule baked into prompts, full editorial PDF rewrite, AAC audio shipped, Aleksandr calibration baked with Sasha's actual data — apparatus now coheres as a transmission" },
  { day: 85, date: "May 27", total: 1696, label: "Collaboration rate named as the North Star metric; the triad and two-tribe strategy locked" },
  { day: 87, date: "May 29", total: 1696, label: "Planetary OS one-pager shipped at /1-pager: the whole project on one shareable page", key: true },
  { day: 106, date: "Jun 18", total: 2251, label: "N. $555 cash session", key: true },
  { day: 114, date: "Jun 26", total: 2271, label: "Ro. $20 gratitude" },
  { day: 125, date: "Jul 7", total: 2371, label: "O. $100 in-kind (Claude Max subscription)" },
  { day: 142, date: "Jul 24", total: 2428, label: "$57 cash contribution" },
  { day: 146, date: "Aug 5", total: 3428, label: "G. $1,000 — first program container (The Crossing), half paid before session 1", key: true },
  { day: 176, date: "Sep 6", total: 4428, label: "G. final $1,000 — The Crossing fully paid at $2,000" },
  { day: 180, date: "Sep 10", total: 4444, label: "K. 300 MXN donation (≈$16)" },
  { day: 202, date: "Oct 2", total: 4498, label: "K. 1,000 MXN donation (≈$54)" },
  { day: 216, date: "Oct 16", total: 4507, label: "B. ≈$9 in-kind (barter)" },
  { day: 223, date: "Oct 23", total: 4509, label: "B. ≈$2 in-kind (barter)" },
  { day: 233, date: "Nov 2", total: 4759, label: "G. $250 extra session (held Oct 28, received Nov 2)" },
  { day: 241, date: "Nov 10", total: 5159, label: "G. $400 pitch session" },
  { day: 255, date: "Nov 24", total: 6814, label: "First success-based mentorship payment ($1,100) and a new Unique Business container — current as of Nov 24, 2026", key: true },
];

// ─── KPI Data ───────────────────────────────────────────────────────────────

export const KPIS = [
  {
    labelKey: "ventureDashboard.kpi.totalRevenue",
    value: "$6,814",
    subline: "$5,684 cash · $1,130 in-kind",
    trend: "+$1,655",
    trendLabel: "Nov 24",
    detail: "",
    stamp: "as of 2026-11-24 · source: CRM",
    gold: true,
  },
  {
    labelKey: "ventureDashboard.kpi.geniusFounders",
    value: "7",
    trend: "+1",
    trendLabel: "Apr 18",
    detail: "Aleksandr · O. · S. · Al. · Sa. · K. · Ki.",
    gold: false,
  },
  {
    labelKey: "ventureDashboard.kpi.continuationRate",
    value: "100%",
    trend: "",
    trendLabel: "",
    detail: "",
    gold: false,
  },
];

// ─── Timeline ───────────────────────────────────────────────────────────────

export const TIMELINE = [
  { day: 1, date: "Mar 4", name: "Aleksandr", type: "Client Zero", desc: "Built the methodology by applying it to himself first." },
  { day: 2, date: "Mar 5", name: "O.", type: "Gratitude ($566)", desc: "Complete business blueprint. Later sent $566 in gratitude gifts — without being asked." },
  { day: 4, date: "Mar 7", name: "S.", type: "Blueprint", desc: "Business blueprint created. 3 follow-up sessions delivered." },
  { day: 9, date: "Mar 12", name: "Al.", type: "Value Exchange", desc: "Complete blueprint in 2.5 hours — fastest session yet." },
  { day: 12, date: "Mar 15", name: "Sa.", type: "Rev Share (TBD)", desc: "6 sessions. Core identity, story, and audience crystallized." },
  { day: 34, date: "Apr 6", name: "K.", type: "Gratitude ($111)", desc: "Client + referral partner. Introduced 2 new contacts organically." },
  { day: 40, date: "Apr 12", name: "K.", type: "In-kind ($200)", desc: "Claude Pro subscription payment. Deepening operational partnership." },
  { day: 41, date: "Apr 13", name: "O.", type: "In-kind ($500)", desc: "Comprehensive support: food, flights, transport. Sustained gratitude." },
  { day: 43, date: "Apr 17", name: "O.", type: "Intensive Wrap", desc: "4-day hacker-house / collective venture-building intensive concludes. First in-person intensive at length. O.: \"This may be the best view in town. I am thankful.\"" },
  { day: 44, date: "Apr 18", name: "Ki.", type: "7th Founder Joins", desc: "Serial entrepreneur, integral practitioner. \"The 7th note in the octave — the tension that longs to resolve into something new.\"" },
  { day: 46, date: "Apr 20", name: "O.", type: "In-kind ($319)", desc: "Five gifts totaling $319. Sustained gratitude continues — cumulative in-kind from O. now $819." },
  { day: 106, date: "Jun 18", name: "N.", type: "Cash ($555)", desc: "The funnel's first paying client: an O. referral who booked the 20-min exploratory call, then the session. Walked out with the not-ready loop named, purpose and mission defined, her lifelong pattern in one sentence, a polarizing myth and bio. Productize Yourself Session, $555." },
  { day: 125, date: "Jul 7", name: "O.", type: "In-kind ($100)", desc: "Claude Max subscription. Sustained support continues." },
  { day: 142, date: "Jul 24", name: "R.", type: "Cash ($57)", desc: "New paying contribution." },
  { day: 146, date: "Aug 5", name: "G.", type: "Program container ($2,000)", desc: "The first full program container sold: two months, eight weekly sessions, the productization session included. Half paid before the first session." },
  { day: 176, date: "Sep 6", name: "G.", type: "Container complete ($1,000 final)", desc: "The Crossing fully paid at $2,000 and delivered. First program container to run end to end." },
  { day: 177, date: "Sep 7", name: "D.", type: "First cold reply", desc: "The first cold conversation opened by a mirror message: the profile was surfaced by a high-precision query, the stuck point named without a pitch, and the reply came the same day." },
  { day: 255, date: "Nov 24", name: "Mentorship", type: "Success-based ($1,100)", desc: "First success-based mentorship payment: a mentee's first sale paid the fee." },
  { day: 255, date: "Nov 24", name: "Unique Business", type: "Program container ($555)", desc: "A new Unique Business container sold." },
];
