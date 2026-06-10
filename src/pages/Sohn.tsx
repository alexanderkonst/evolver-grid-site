import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GOLD_GRADIENT, GOLD_GLOW, Ornament } from "@/lib/landingDesign";
import fyttTorus from "@/assets/find-your-top-talent-torus.png";

/**
 * Sohn — public seminal note for the Self-Organizing Human Network (SOHN).
 * Route: /sohn.
 *
 * Standalone (NOT inside GameShellV2). Liquid Glass editorial register (navy +
 * gold, Cormorant headlines, DM Sans body), matching /1-pager and /monetization.
 * The page IS the abstract (the seed) + a link to the live platform (the proof,
 * the body). "The abstract is the article, if the running platform is its body."
 * SOHN is the human-facing name; PlanetaryOS / the Kernel is the engine under the
 * hood. Canonical detail: docs/02-strategy/monetization_strategies.md +
 * phase_shift_technology_library.md Domain 91. Copy is a v1 draft for Sasha to vet.
 */

// Day 91 (Sasha 2026-06-09): tokenized for Aurum — NAVY is only ever used
// as a text color, so it reads the skin's primary-text token with the
// original near-black navy as the lapis-side fallback.
const NAVY = "var(--skin-text-primary, #0a1628)";

const Eyebrow = ({ children, size = "default" }: { children: ReactNode; size?: "default" | "large" }) => (
  <p
    className={`uppercase mb-3 ${size === "large" ? "text-[12px] tracking-[0.30em]" : "text-[11px] tracking-[0.28em]"}`}
    style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.5))" }}
  >
    {children}
  </p>
);

const GradientInk = ({ children }: { children: ReactNode }) => (
  <span
    className="bg-clip-text text-transparent"
    style={{ backgroundImage: GOLD_GRADIENT, filter: GOLD_GLOW, textShadow: "none" }}
  >
    {children}
  </span>
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
        <Eyebrow size="large">{eyebrow}</Eyebrow>
        {children}
      </section>
    );
  }
  if (weight === "light") {
    return (
      <section
        className="rounded-3xl px-7 py-6 sm:px-9 sm:py-7"
        style={{
          // Day 91 (Sasha 2026-06-09): tokenized for Aurum.
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

const bodyStyle = { color: "var(--skin-text-muted, rgba(26,30,58,0.8))" } as const;

const SohnWordmark = () => (
  <Link
    to="/"
    className="fixed top-5 left-1/2 -translate-x-1/2 z-50 inline-flex items-center transition-opacity hover:opacity-80"
    aria-label="Find Your Top Talent home"
  >
    <img
      src={fyttTorus}
      alt=""
      aria-hidden="true"
      className="h-9 w-auto"
      style={{
        filter: "drop-shadow(0 0 16px rgba(240, 194, 127, 0.35)) drop-shadow(0 0 5px rgba(212, 175, 55, 0.45))",
      }}
      draggable={false}
    />
  </Link>
);

const Sohn = () => {
  // Day 91 (Sasha 2026-06-09): tokenized for Aurum — halo + page wash read
  // skin tokens; the exact original literals stay as light-side fallbacks.
  const headlineHalo = "var(--skin-text-halo-strong, 0 0 26px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.85))";
  return (
    <main
      className="relative overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: NAVY,
        background: "var(--skin-page-wash, linear-gradient(160deg, #f6f5f1 0%, #eef0f6 55%, #f1ecf6 100%))",
        minHeight: "100vh",
      }}
    >
      <SohnWordmark />

      {/* Ambient gold glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-[680px] h-[680px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(35 85% 60% / 0.16) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[620px] h-[620px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(212 85% 55% / 0.14) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(40 90% 55% / 0.14) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-[820px] mx-auto px-5 sm:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
        {/* HERO */}
        <header className="text-center mb-8 sm:mb-10">
          <p className="text-[11px] uppercase tracking-[0.30em] mb-5" style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.5))" }}>
            A coordination substrate · seminal note
          </p>
          <h1
            className="font-bold leading-[1.06] tracking-[-0.01em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.4rem, 7vw, 4.25rem)",
              color: NAVY,
              textShadow: headlineHalo,
            }}
          >
            The Self-Organizing
            <br />
            Human Network
          </h1>
          <p
            className="mt-5 italic mx-auto max-w-[42ch]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.7rem)",
              color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
              lineHeight: 1.35,
            }}
          >
            When differentiated value becomes legible, human networks self-organize into collaboration,{" "}
            <GradientInk>without central planning</GradientInk>.
          </p>
          <p className="mt-8 mx-auto max-w-[56ch] text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
            The whole signal in one page. The abstract below is the seed; the running, free platform it links
            to is the proof.
          </p>
        </header>

        <div className="space-y-5">
          <Panel eyebrow="The abstract" weight="heavy">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              Industrial coordination scaled by standardizing people into roles, credentials, and replaceable
              units. It could not see, and therefore could not coordinate, the differentiated way each person
              actually thinks, creates, and contributes. As that differentiated value becomes the primary
              source of economic and creative leverage, the binding constraint is no longer talent but its{" "}
              <GradientInk>legibility</GradientInk>. This note introduces the Self-Organizing Human Network
              (SOHN): a coordination substrate in which human nodes self-organize into collaboration and
              venture formation without central planning, by making each node's differentiated value precise
              and composable. The atomic operation articulates a person's irreducible signal, their top
              talent, direction, and assets, in minutes; nodes then match on the complementarity of those
              signals rather than on titles or tags. Collaboration rate, the share of members who find a
              collaborator and begin building within a bounded window, is the network's order parameter, and
              above a legibility threshold coordinated structure emerges spontaneously, the human analogue of
              self-organizing networks in telecommunications, where nodes self-configure, optimize, and heal
              through local exchange. The mechanism composes holonically across scales, from individual to
              team to community to network state, a general coordination layer for a civilization that
              organizes around who people actually are rather than the roles they were assigned.
            </p>
          </Panel>

          <Panel eyebrow="The proof is the running network">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              Bitcoin was a whitepaper plus a chain that actually ran. SOHN is this abstract plus a live, free,
              self-organizing network and the collaboration rate it moves. The seed and its proof, together,
              are the whole. So do not take the claim on faith. Feel the precision yourself in about two
              minutes.
            </p>
            <Link
              to="/"
              className="liquid-glass-strong mt-6 inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: NAVY, textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))" }}
            >
              Run it on yourself
              <ArrowRight className="w-4 h-4 opacity-70" />
            </Link>
          </Panel>
        </div>

        <Ornament className="my-10" />

        {/* CLOSE */}
        <section className="text-center max-w-[52ch] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.28em] mb-3" style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.5))" }}>
            The stake
          </p>
          <p
            className="italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.7rem)",
              color: "var(--skin-text-muted, rgba(26,30,58,0.8))",
              lineHeight: 1.4,
            }}
          >
            A coordination layer for a civilization that organizes around{" "}
            <GradientInk>who people actually are</GradientInk>, rather than the roles they were assigned.
          </p>
        </section>

        <footer className="text-center mt-16">
          <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.4))" }}>
            SOHN · Find Your Top Talent · findyourtoptalent.com
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Sohn;
