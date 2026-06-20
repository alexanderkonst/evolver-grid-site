import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GOLD_GRADIENT, GOLD_GLOW, Ornament, igniteLogo } from "@/lib/landingDesign";
import SEO from "@/components/SEO";

/**
 * LandingThesis — public thesis flag for the Uniqueness Economy. Route: /landing.
 *
 * Standalone (NOT inside GameShellV2): a clean, full-bleed, shareable surface,
 * the upgrade of /1-pager into the thesis landing. Liquid Glass editorial
 * register (navy + gold, Cormorant headlines, DM Sans body) inherited from
 * landingDesign so it reads as one family with the funnel and the one-pager.
 *
 * Copy is the source-of-truth thesis: docs/02-strategy/uniqueness_economy_thesis.md.
 * Audience: sovereign builders (peers), NOT cold funnel traffic.
 *
 * Day 107 (Sasha 2026-06-19): built from the strategy session that named the
 * publishing move. Arc = descent through the three depths:
 *   Hero (Heart, the peer invitation)
 *     → the pivot (difference is the infrastructure, the turn)
 *       → the economics + why-now + lineage (Mind, the proof)
 *         → Planetary OS (Gut, the embodiment)
 *           → the stake + the resonant invite.
 * Signature: the living lattice (distinct nodes joined by light) renders the
 * thesis literally — differences unite us, the visual opposite of slices.
 *
 * English-first v1. i18n (landing.* namespace, ru/es parity) is a follow-up;
 * the thesis is English-first and this surface targets English-speaking peers.
 */

const NAVY = "var(--skin-text-primary, #0a1628)";
const bodyStyle = { color: "var(--skin-text-muted, rgba(26,30,58,0.8))" } as const;
const headlineHalo = "0 0 26px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.85)";

const GradientInk = ({ children }: { children: ReactNode }) => (
  <span
    className="bg-clip-text text-transparent"
    style={{ backgroundImage: GOLD_GRADIENT, filter: GOLD_GLOW, textShadow: "none" }}
  >
    {children}
  </span>
);

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p
    className="uppercase mb-3 text-[11px] tracking-[0.28em]"
    style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.5))" }}
  >
    {children}
  </p>
);

const Panel = ({
  eyebrow,
  weight = "standard",
  children,
}: {
  eyebrow: string;
  weight?: "heavy" | "standard" | "light";
  children: ReactNode;
}) => {
  if (weight === "heavy") {
    return (
      <section className="liquid-glass-strong rounded-3xl p-8 sm:p-10">
        <Eyebrow>{eyebrow}</Eyebrow>
        {children}
      </section>
    );
  }
  if (weight === "light") {
    return (
      <section
        className="rounded-3xl px-7 py-6 sm:px-9 sm:py-7"
        style={{
          background: "var(--skin-card-fill, rgba(255,255,255,0.35))",
          border: "1px solid var(--skin-hairline, rgba(26,30,58,0.10))",
          boxShadow: "0 1px 2px rgba(26,30,58,0.04)",
        }}
      >
        <Eyebrow>{eyebrow}</Eyebrow>
        {children}
      </section>
    );
  }
  return (
    <section className="liquid-glass rounded-3xl p-7 sm:p-9">
      <Eyebrow>{eyebrow}</Eyebrow>
      {children}
    </section>
  );
};

/**
 * LivingLattice — the signature motif. Distinct nodes (no two the same size)
 * joined by hairlines of light. The form IS the thesis: difference is what
 * connects. Pure SVG + CSS keyframes, pointer-events none, sits behind the
 * hero and the pivot. Nodes pulse on staggered delays so the field feels
 * alive without ever pulling focus.
 */
const NODES: Array<[number, number, number]> = [
  [120, 90, 3], [250, 180, 5.5], [420, 70, 2.5], [560, 150, 4], [700, 90, 3.2],
  [850, 175, 5], [950, 290, 2.5], [180, 320, 4], [350, 300, 2.5], [520, 360, 5.5],
  [680, 300, 3], [820, 360, 4], [120, 520, 3], [300, 560, 4], [480, 540, 2.5],
  [660, 560, 5], [840, 520, 3.2],
];
const EDGES: Array<[number, number]> = [
  [0, 1], [1, 3], [2, 3], [3, 4], [4, 5], [5, 6], [1, 7], [7, 8], [8, 9], [3, 9],
  [9, 10], [10, 11], [5, 11], [4, 10], [7, 12], [8, 13], [12, 13], [13, 14],
  [9, 14], [14, 15], [11, 15], [15, 16], [6, 11],
];

const LivingLattice = () => (
  <div
    className="pointer-events-none absolute inset-x-0 top-0 z-0"
    aria-hidden="true"
    style={{ height: "920px", maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)" }}
  >
    <style>{`@keyframes latticePulse{0%,100%{opacity:.28}50%{opacity:.9}}`}</style>
    <svg
      viewBox="0 0 1000 760"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <g stroke="rgba(196,154,59,0.18)" strokeWidth="0.8">
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      {NODES.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="rgba(212,175,55,0.85)"
          style={{ animation: `latticePulse ${5 + (i % 4)}s ease-in-out ${(i % 5) * 0.7}s infinite` }}
        />
      ))}
    </svg>
  </div>
);

const LADDER = [
  "Know what you are irreplaceable for",
  "Monetize it",
  "Naturally plug into projects",
  "Do what you love while having fun",
  "Join other sovereign humans building a decentralized civilization",
];

const LandingThesis = () => {
  return (
    <>
      <SEO
        title="The Uniqueness Economy"
        description="Human difference, made legible, is the infrastructure a civilization runs on. The new economics where competition is a category error and the market is a lattice — and why AI makes it possible now."
        path="/landing"
        ogTitle="The Uniqueness Economy"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: "The Uniqueness Economy",
          author: { "@type": "Person", name: "Alexander Konstantinov" },
          datePublished: "2026-06-19",
          about: "An economics in which the irreducible unit is the non-substitutable person, competition is a category error, and human difference is the coordination infrastructure.",
        }}
      />
      <main
        className="relative overflow-hidden"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: NAVY,
          background: "var(--skin-page-wash, linear-gradient(160deg, #f6f5f1 0%, #eef0f6 55%, #f1ecf6 100%))",
          minHeight: "100vh",
        }}
      >
        {/* Home wordmark */}
        <Link
          to="/"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
          aria-label="Find Your Top Talent — home"
        >
          <img
            src={igniteLogo}
            alt=""
            aria-hidden="true"
            className="h-5 w-auto"
            style={{
              filter: "drop-shadow(0 0 10px rgba(240, 194, 127, 0.45)) drop-shadow(0 0 3px rgba(212, 175, 55, 0.65))",
              animation: "ornament-spin 48s linear infinite",
            }}
            draggable={false}
          />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
            }}
          >
            The Uniqueness Economy
          </span>
        </Link>

        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-24 w-[680px] h-[680px] rounded-full" style={{ background: "radial-gradient(circle, hsl(35 85% 60% / 0.16) 0%, transparent 70%)" }} />
          <div className="absolute top-1/3 -right-32 w-[620px] h-[620px] rounded-full" style={{ background: "radial-gradient(circle, hsl(212 85% 55% / 0.12) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, hsl(40 90% 55% / 0.14) 0%, transparent 70%)" }} />
        </div>

        <LivingLattice />

        <div className="relative z-10 max-w-[820px] mx-auto px-5 sm:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20">
          {/* ── HERO (Heart) — the peer invitation ── */}
          <header className="text-center mb-10 sm:mb-14">
            <Eyebrow>For sovereign builders</Eyebrow>
            <p
              className="mb-4 text-[15px] sm:text-base"
              style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.62))" }}
            >
              Each human is different. No two the same, right?
            </p>
            <h1
              className="font-bold leading-[1.05] tracking-[-0.01em]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(2.6rem, 7.5vw, 5rem)",
                color: NAVY,
                textShadow: headlineHalo,
              }}
            >
              What if our <GradientInk>difference</GradientInk> is what unites us?
            </h1>

            {/* Benefit ladder — an ascent from self to civilization */}
            <ol className="mt-10 sm:mt-12 max-w-[34rem] mx-auto space-y-3 text-left">
              {LADDER.map((rung, i) => (
                <li key={i} className="flex items-baseline gap-3.5">
                  <span
                    className="font-semibold tabular-nums shrink-0 bg-clip-text text-transparent"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "1.4rem",
                      backgroundImage: GOLD_GRADIENT,
                      filter: GOLD_GLOW,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-[15px] sm:text-base leading-snug"
                    style={{ color: i === LADDER.length - 1 ? NAVY : "var(--skin-text-muted, rgba(26,30,58,0.82))", fontWeight: i === LADDER.length - 1 ? 600 : 400 }}
                  >
                    {rung}
                  </span>
                </li>
              ))}
            </ol>

            {/* Single primary CTA */}
            <div className="mt-11 flex flex-col items-center gap-3">
              <Link
                to="/"
                className="liquid-glass-strong inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ color: NAVY, textShadow: "0 1px 2px rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}
              >
                <img
                  src={igniteLogo}
                  alt=""
                  aria-hidden="true"
                  className="h-4 w-auto"
                  style={{ filter: "drop-shadow(0 0 8px rgba(240, 194, 127, 0.5)) drop-shadow(0 0 2px rgba(212, 175, 55, 0.7))" }}
                />
                Find what you're irreplaceable for
                <ArrowRight className="w-4 h-4 opacity-70" />
              </Link>
              <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.5))" }}>
                Free · 2 minutes · No signup
              </p>
            </div>
          </header>

          {/* ── THE PIVOT — difference is the infrastructure (the turn) ── */}
          <section className="text-center my-20 sm:my-28 max-w-[46rem] mx-auto">
            <Ornament className="mb-12" />
            <p
              className="italic"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.5rem, 3.6vw, 2.4rem)",
                color: "var(--skin-text-muted, rgba(26,30,58,0.86))",
                lineHeight: 1.32,
              }}
            >
              We keep trying to solve collaboration, coordination, thriving, infrastructure, even culture, as if each were a separate problem with its own system. They have one answer. Human difference, made legible, is the <GradientInk>infrastructure</GradientInk> they all run on. As simple, and as cosmic, as that.
            </p>
            <Ornament className="mt-12" />
          </section>

          {/* ── THE ECONOMICS (Mind) — the proof ── */}
          <div className="space-y-5">
            <Panel eyebrow="The new economics" weight="heavy">
              <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
                For two centuries the economy ran on one hidden assumption: that people are substitutable. Standardize into a role, a box, a slot on a line, and the best fit wins. In that world value is a slice, and to get more you compete, because the person beside you can do your job.
              </p>
              <p className="text-[15px] sm:text-base leading-relaxed mt-4" style={bodyStyle}>
                <GradientInk>Competition was never a law of economics. It was an artifact of standardization.</GradientInk> The irreducible unit of the emerging economy is not the role but the person, and a person, fully articulated, is non-substitutable. Two genuinely differentiated offers cannot compete in the deepest sense; they can only complement each other or pass each other by. Remove substitutability, and the slice dissolves. What replaces it is a lattice: distinct nodes whose wealth comes from their difference, not their rivalry.
              </p>
            </Panel>

            <Panel eyebrow="Why now" weight="standard">
              <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
                This stayed a beautiful idea for centuries because two bottlenecks kept the uniqueness-economy impossible: you could not articulate a person's uniqueness with precision at scale, and you could not match people by the complementarity of their differences at scale. Both were too slow, too subjective. Artificial intelligence just dissolved both. For the first time, uniqueness can be named, and matched, at the scale of a civilization. The thesis is not "uniqueness is good." It is that the uniqueness-economy is now <GradientInk>mechanically possible</GradientInk>.
              </p>
            </Panel>

            <Panel eyebrow="The lineage" weight="light">
              <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
                Others gestured at the edge of this. Ricardo's comparative advantage, category-of-one positioning, blue ocean, the creator economy. But each treats uniqueness as a tactic for winning a bigger slice. None made the full move: uniqueness as the economic ground that dissolves the slice entirely, plus the reason it becomes possible only now.
              </p>
            </Panel>

            <Panel eyebrow="The inner turn" weight="light">
              <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
                To enter this economy a person must first know themselves. Self-knowledge and the business it produces turn out to be one motion with two faces, hinged on a single un-automatable point: your own recognition of yourself. The move from a standardized world to a differentiated one is therefore also a move in consciousness, from fitting the box to becoming the node.
              </p>
            </Panel>
          </div>

          {/* ── PLANETARY OS (Gut) — the embodiment ── */}
          <section className="liquid-glass-strong rounded-3xl p-8 sm:p-10 mt-5">
            <Eyebrow>The system that runs on it</Eyebrow>
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              <span className="font-semibold" style={{ color: NAVY }}>Planetary OS</span> is the coordination layer that makes this real. One atomic move at its center: turn a person's differentiated nature into a clear, usable profile of what they uniquely think, create, and contribute, in about fifteen minutes. Everything builds on that kernel: name your top talent, your mission, your assets, then meet the people you actually compound with, and turn aligned people into ventures.
            </p>
            <p className="text-[15px] sm:text-base leading-relaxed mt-4" style={bodyStyle}>
              The whole system exists to move one number: <GradientInk>collaboration rate</GradientInk>, the share of people who actually start building together. It runs at every scale, proven on the first holon before any network inherits it. Open-source and forkable, owned by the people who use it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
              <Link to="/1-pager" className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.72))" }}>
                See the full system
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/?path=match" className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.72))" }}>
                See a live demo
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </section>

          {/* ── THE STAKE — closing pull-quote ── */}
          <section className="text-center mt-20 sm:mt-24 max-w-[50ch] mx-auto">
            <Eyebrow>The end state</Eyebrow>
            <p
              className="italic"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.3rem, 3vw, 1.85rem)",
                color: "var(--skin-text-muted, rgba(26,30,58,0.84))",
                lineHeight: 1.4,
              }}
            >
              A planetary lattice of self-known people coordinating their genius instead of standardizing it away. In this economy abundance is not extracted. It is the natural yield of difference allowed to complement itself.
            </p>
          </section>

          {/* ── THE RESONANT INVITE — single CTA for this stage ── */}
          <section className="mt-16 sm:mt-20 text-center">
            <Ornament className="mb-10" />
            <h2
              className="font-bold leading-[1.1] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: NAVY, textShadow: headlineHalo }}
            >
              Build with other sovereign humans
            </h2>
            <a
              href="https://t.me/integralevolution"
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass-strong inline-flex items-center gap-3 rounded-full px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: NAVY, textShadow: "0 1px 2px rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}
            >
              Join the builders
              <ArrowRight className="w-4 h-4 opacity-70" />
            </a>
            <p className="mt-5 text-[13px]">
              <Link to="/" className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}>
                Or find what you're irreplaceable for, first
                <ArrowRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </p>
          </section>

          {/* ── FOOTER ── */}
          <footer className="text-center mt-20">
            <p className="italic mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem", color: "var(--skin-text-muted, rgba(26,30,58,0.55))" }}>
              Built in the open. Owned by the people who use it.
            </p>
            <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.4))" }}>
              The Uniqueness Economy · findyourtoptalent.com · 2026
            </p>
          </footer>
        </div>
      </main>
    </>
  );
};

export default LandingThesis;
