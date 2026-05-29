import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * OnePager — public 1-pager for Planetary OS. Route: /1-pager.
 *
 * Standalone (NOT inside GameShellV2): a clean, full-bleed, shareable
 * surface with no rail or nav, the page Victoria forwards and a partner
 * opens cold. Liquid Glass editorial register (navy + gold, Cormorant
 * headlines, DM Sans body) per docs/03-playbooks/glassmorphism_blueprint.md.
 * Copy is locked from docs/02-strategy/planetary_os_1pager.md — Sasha owns
 * copy edits. MDLS-grade (3D / mesh) is a possible v2 elevation on the
 * same content and route.
 */

const NAVY = "#0a1628";

const GAMEPLAY: Array<{ n: string; title: string; desc: string }> = [
  { n: "1", title: "Top Talent", desc: "name what you are uniquely great at." },
  { n: "2", title: "Mission", desc: "name where you are going." },
  { n: "3", title: "Assets", desc: "map what you already have to work with." },
  { n: "4", title: "Matching", desc: "meet the people you actually compound with." },
  { n: "5", title: "Quality of Life", desc: "surface who you will truly resonate with, so matches go deep, not wide." },
  { n: "6", title: "Venture", desc: "turn aligned people into something built." },
];

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="text-[11px] uppercase tracking-[0.28em] mb-3" style={{ color: "rgba(26,30,58,0.5)" }}>
    {children}
  </p>
);

const GradientInk = ({ children }: { children: ReactNode }) => (
  <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage:
        "linear-gradient(135deg, hsl(265, 90%, 30%) 0%, hsl(245, 95%, 26%) 55%, hsl(28, 90%, 32%) 100%)",
      filter:
        "drop-shadow(0 0 12px hsl(260 100% 55% / 0.35)) drop-shadow(0 0 3px hsl(255 95% 50% / 0.4))",
      textShadow: "none",
    }}
  >
    {children}
  </span>
);

const Panel = ({ eyebrow, children }: { eyebrow: string; children: ReactNode }) => (
  <section className="liquid-glass rounded-3xl p-7 sm:p-9">
    <Eyebrow>{eyebrow}</Eyebrow>
    {children}
  </section>
);

const bodyStyle = { color: "rgba(26,30,58,0.8)" } as const;

const OnePager = () => {
  const headlineHalo = "0 0 26px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.85)";
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: NAVY,
        background: "linear-gradient(160deg, #f6f5f1 0%, #eef0f6 55%, #f1ecf6 100%)",
      }}
    >
      {/* Ambient glows — give the glass something to frost over. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-[680px] h-[680px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(265 80% 60% / 0.10) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[620px] h-[620px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(212 85% 55% / 0.10) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(35 90% 55% / 0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-[820px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* HERO */}
        <header className="text-center mb-14 sm:mb-20">
          <p className="text-[11px] uppercase tracking-[0.30em] mb-5" style={{ color: "rgba(26,30,58,0.5)" }}>
            Coordination infrastructure
          </p>
          <h1
            className="font-bold leading-[1.04] tracking-[-0.01em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 9vw, 5.5rem)",
              color: NAVY,
              textShadow: headlineHalo,
            }}
          >
            Planetary OS
          </h1>
          <p
            className="mt-5 italic mx-auto max-w-[42ch]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
              color: "rgba(26,30,58,0.72)",
              lineHeight: 1.35,
            }}
          >
            An operating system for a civilization that coordinates around{" "}
            <GradientInk>who people actually are</GradientInk>.
          </p>
          <p className="mt-8 mx-auto max-w-[58ch] text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
            Planetary OS helps people find their unique contribution, find the right people to build
            with, and turn that into real ventures. It does the same thing at every scale: a person, a
            team, a community, and ecosystems, evolution-oriented communities, network states, and land-based projects. The entire system runs on one core move: making a
            person's differentiated value legible enough that the right collaborations, ventures, and
            opportunities can form around it.
          </p>
        </header>

        {/* BODY */}
        <div className="space-y-5">
          <Panel eyebrow="The shift">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              Industrial civilization coordinated people by standardizing them: roles, credentials,
              replaceability. The world increasingly rewards the opposite, the differentiated way each
              person thinks, creates, and contributes. But that value stays trapped, often illegible even
              to the person who holds it, so it never gets coordinated. Planetary OS is the infrastructure
              that makes it legible.
            </p>
          </Panel>

          <Panel eyebrow="The kernel">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              At the center is one atomic operation: turn a person's differentiated nature into a clear,
              usable profile of what they uniquely think, create, and contribute, in about fifteen minutes.
              Just as a computer's kernel manages memory and processes so applications can run, this kernel
              manages legible human difference so coordination can run. Everything else is built on top of it.
            </p>
          </Panel>

          <Panel eyebrow="The gameplay">
            <p className="text-[15px] sm:text-base leading-relaxed mb-5" style={bodyStyle}>
              You move through it like a game. Each step stands on its own, and each unlocks the next.
            </p>
            <ol className="space-y-3">
              {GAMEPLAY.map((g) => (
                <li key={g.n} className="flex gap-4 items-baseline">
                  <span
                    className="font-semibold tabular-nums shrink-0"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", color: "rgba(26,30,58,0.45)" }}
                  >
                    {g.n}
                  </span>
                  <p className="text-[15px] sm:text-base leading-snug" style={{ color: "rgba(26,30,58,0.82)" }}>
                    <span className="font-semibold" style={{ color: NAVY }}>{g.title}:</span> {g.desc}
                  </p>
                </li>
              ))}
            </ol>
            <p className="text-[13px] mt-5 italic" style={{ color: "rgba(26,30,58,0.6)" }}>
              Each module is whole on its own and fits a coherent larger whole. That is what holonic means:
              standalone and part of the pattern at once.
            </p>
          </Panel>

          <Panel eyebrow="The metric">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              The whole system exists to move one number: <GradientInk>collaboration rate</GradientInk>, the
              share of members who actually start building together. The hidden engine beneath every
              community's growth and output, and almost nobody measures it.
            </p>
          </Panel>

          <Panel eyebrow="How it grows">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              The same pattern runs at every scale, and it was proven on its own founder first, then a small
              founder cohort, before any network. The first holon tests every piece before the network
              inherits it. From one person, to a community, to an ecosystem, a network state, a land-based project.
            </p>
          </Panel>

          <Panel eyebrow="How to touch it">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              A person enters free, in about fifteen minutes. A community, ecosystem, or network runs it as the coordination layer
              beneath its membership, skinned to its own brand. It is open-source and forkable, owned by the
              people who use it.
            </p>
            <div className="mt-6 flex flex-col items-start gap-4">
              <Link
                to="/"
                className="liquid-glass-strong inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ color: NAVY, textShadow: "0 1px 2px rgba(255,255,255,0.7)" }}
              >
                Find your top talent
                <ArrowRight className="w-4 h-4 opacity-70" />
              </Link>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
                <Link
                  to="/?path=match"
                  className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
                  style={{ color: "rgba(26,30,58,0.7)" }}
                >
                  See a live demo of the platform
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
                <a
                  href="https://t.me/integralevolution"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium transition-opacity hover:opacity-70"
                  style={{ color: "rgba(26,30,58,0.7)" }}
                >
                  Book a chat with Aleksandr
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </div>
            </div>
          </Panel>
        </div>

        {/* STAKE */}
        <section className="text-center mt-16 sm:mt-20 max-w-[54ch] mx-auto">
          <Eyebrow>The stake</Eyebrow>
          <p
            className="italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.7rem)",
              color: "rgba(26,30,58,0.8)",
              lineHeight: 1.4,
            }}
          >
            A civilization that organizes around who people actually are, instead of flattening them into
            standardized roles. Make differentiated human value legible, and everything else, the matching,
            the ventures, the ecosystems and network states, follows.
          </p>
        </section>

        <footer className="text-center mt-20">
          <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "rgba(26,30,58,0.4)" }}>
            Planetary OS · findyourtoptalent.com
          </p>
        </footer>
      </div>
    </main>
  );
};

export default OnePager;
