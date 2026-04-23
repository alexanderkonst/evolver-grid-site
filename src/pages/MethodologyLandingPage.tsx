import PlaybookHero from "@/components/playbook/PlaybookHero";

/**
 * MethodologyLandingPage — the pane-3 content of the JOURNEY space on `/`
 * (and on `/game/journey`, via `JourneyPage`).
 *
 * Per Sasha's 2026-04-16 directive the landing strips to three things only:
 *   1. The name  — canonical headline in Cormorant Garamond
 *   2. The infographic — 7-step animated circle (Mux HLS, rendered by
 *      `PlaybookHero`, which also owns the CTA)
 *   3. The CTA — "Find your top talent" → /zone-of-genius
 *
 * No testimonials, no social-proof row, no "other projects" link. Everything
 * else belongs deeper in the journey, not on the front door.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * Day 48 iter 2 (Sasha, premium pass — "make it feel more premium"):
 *
 * Tier-1 moves applied to this file:
 *   • Accent unification: the three colored accents (Top Talent / Productize /
 *     Scale) are now all rendered in the signature gold palette. Color
 *     regains meaning by coherence — "this is what we call Gold on this
 *     page, the three inflection points of the promise". The rainbow
 *     octave still lives on /playbook (where the 7 steps need distinct
 *     colors to be navigable); here it would read as decoration.
 *   • Editorial drop cap on the first letter of the hero — a large gold
 *     italic "Y" anchors the eye before the sentence completes.
 *   • Echo line ("So people don't buy it.") now italic + smaller — it
 *     reads as the whispered consequence of the headline, not a peer
 *     statement.
 *   • Ornament bookends — a mirror of the gold-star divider closes the
 *     four-line path, giving the hero editorial symmetry (open brace /
 *     close brace around the promise).
 *   • "Top Talent" carries a subtle gold underline — the one phrase that
 *     is both the product name and the promise gets its own typographic
 *     tell.
 *   • Hero frame — a hairline border + rounded-3xl chamfer wraps the
 *     whole promise block so it reads as an embossed card, not a loose
 *     run of text.
 *   • Whitespace — section gaps opened up, container padding increased.
 *
 * Tier-2 / Tier-3 moves live in index.css (paper grain, gold selection,
 * gold focus rings, cta-breath / ornament-spin keyframes) and in
 * PlaybookHero.tsx (small-caps eyebrow + CTA label, breath animation,
 * star spin on the embedded star).
 * ═══════════════════════════════════════════════════════════════════════════
 */

// Signature gold gradient used for all three accents + the underline.
// Lives inline rather than as a token because it's only used here — if
// we later need it elsewhere we'll promote it to --skin-gold-gradient.
const GOLD_GRADIENT =
  "linear-gradient(135deg, #f4d472 0%, #d4af37 50%, #b8941e 100%)";
const GOLD_GLOW =
  "drop-shadow(0 0 10px rgba(244,212,114,0.45)) drop-shadow(0 0 3px rgba(212,175,55,0.55))";

// Shared ornament (gradient rule · ✦ star · gradient rule).
// Extracted so the top + bottom bookends stay pixel-identical.
const Ornament = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-center justify-center gap-4 max-w-md mx-auto ${className}`}
    aria-hidden="true"
  >
    <span
      className="flex-1 h-px"
      style={{
        background:
          "linear-gradient(to right, transparent, var(--skin-ornament-rule, rgba(26,30,58,0.25)))",
      }}
    />
    <span
      className="text-base ornament-spin"
      style={{
        color: "var(--skin-ornament-star, rgba(184,134,11,0.85))",
        textShadow:
          "var(--skin-ornament-shadow, 0 0 12px rgba(240,194,127,0.5), 0 0 3px rgba(240,194,127,0.7))",
      }}
    >
      ✦
    </span>
    <span
      className="flex-1 h-px"
      style={{
        background:
          "linear-gradient(to left, transparent, var(--skin-ornament-rule, rgba(26,30,58,0.25)))",
      }}
    />
  </div>
);

const MethodologyLandingPage = () => {
  return (
    /* Day 48 iter 2: container widened slightly (640 → 680) AND vertical
       padding opened up (py-6/8 → py-10/14) so the hero block breathes.
       The frame (rounded-3xl + hairline border) is what holds the
       composition together visually, not a tight column. */
    <div className="max-w-[680px] mx-auto px-5 py-10 md:py-14">
      {/* ═══════ HERO FRAME — Day 48 iter 2 ═══════
          Subtle chamfered card around the full hero. A 1px hairline
          + rounded-3xl + faint gold-tinted inset highlight makes the
          whole promise read as "printed card" rather than "raw HTML
          text in a pane". The frame is deliberately low-contrast —
          it should register peripherally, never fight the text. */}
      <div
        className="relative rounded-3xl px-6 sm:px-10 py-10 sm:py-14"
        style={{
          border: "1px solid var(--skin-rule-medium, rgba(26,30,58,0.15))",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)",
          boxShadow:
            "inset 0 1px 0 0 rgba(244, 212, 114, 0.18), 0 10px 40px -20px rgba(10, 22, 40, 0.15)",
        }}
      >
        {/* ═══════ NAME ═══════ */}
        <header className="text-center">
          {/* ── LAYER 1: Recognition opener
              Day 48 iter 2 (Sasha): editorial DROP CAP on the first
              letter. Large gold italic "Y" sits flush with the rest
              of the sentence — anchors the eye before the word
              "You" even resolves. */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-[-0.01em] mb-4 sm:mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
            }}
          >
            <span
              aria-hidden="true"
              className="bg-clip-text text-transparent"
              style={{
                // Drop cap: 1.5× the body size, italic, gold gradient.
                // `vertical-align: -0.08em` keeps the baseline aligned
                // with the rest of the line despite the size bump.
                fontSize: "1.5em",
                fontStyle: "italic",
                fontWeight: 600,
                lineHeight: "0.9",
                verticalAlign: "-0.08em",
                marginRight: "0.02em",
                backgroundImage: GOLD_GRADIENT,
                filter: GOLD_GLOW,
                textShadow: "none",
              }}
            >
              Y
            </span>
            {/* Screen readers get the full sentence; visual users see
                the drop cap replacing the first Y. */}
            <span className="sr-only">You</span>
            <span aria-hidden="true">ou</span>
            {" can't clearly say what you do."}
          </h1>

          {/* ── Echo — Day 48 iter 2: italic + smaller + lighter.
              "So people don't buy it." drops in weight so it reads as
              the whispered consequence of the headline, not a peer
              statement. */}
          <p
            className="text-lg sm:text-xl md:text-2xl leading-[1.25] tracking-[-0.005em] italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
              textShadow:
                "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
            }}
          >
            So people don't buy it.
          </p>

          {/* Editorial ornament (top bookend) */}
          <Ornament className="my-7 sm:my-8" />

          {/* ── LAYER 2: Structure — Day 48 iter 2:
              Three accents unified to gold (was: violet / indigo / green).
              Scarcity preserved (only 3 of 7 words glow), but coherence
              upgraded — gold reads as the signature metal of this page,
              not a remnant of the old rainbow octave.
              "Top Talent" additionally carries a subtle gold underline
              since it is both the product name and the promise. */}
          <div
            className="space-y-2 sm:space-y-2.5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
            }}
          >
            {/* Line 1: Find Your [Top Talent]. */}
            <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
              Find Your{" "}
              <span
                className="bg-clip-text text-transparent relative"
                style={{
                  backgroundImage: GOLD_GRADIENT,
                  filter: GOLD_GLOW,
                  textShadow: "none",
                  // Gold underline on Top Talent only — the product name.
                  // Rendered via inline background-image + no-repeat so it
                  // sits under the text regardless of line wrapping, and
                  // doesn't affect the gradient text-fill above.
                  backgroundPosition: "0 0, 0 100%",
                  boxShadow: "inset 0 -2px 0 0 rgba(212, 175, 55, 0.5)",
                  paddingBottom: "0.05em",
                }}
              >
                Top Talent
              </span>
              .
            </p>

            {/* Line 2: [Productize] Yourself. */}
            <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: GOLD_GRADIENT,
                  filter: GOLD_GLOW,
                  textShadow: "none",
                }}
              >
                Productize
              </span>{" "}
              Yourself.
            </p>

            {/* Line 3: Build it. Launch it. — NEUTRAL (no gradient). */}
            <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
              Build it. Launch it.
            </p>

            {/* Line 4: [Scale] your Revenue and Impact. */}
            <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: GOLD_GRADIENT,
                  filter: GOLD_GLOW,
                  textShadow: "none",
                }}
              >
                Scale
              </span>{" "}
              your Revenue and Impact.
            </p>
          </div>

          {/* Editorial ornament (bottom bookend) — Day 48 iter 2:
              mirrors the top so the hero reads as an opened + closed
              editorial passage, not an open-ended run-on. */}
          <Ornament className="mt-8 sm:mt-10" />
        </header>

        {/* ═══════ INFOGRAPHIC + CTA ═══════
            Day 48 iter 2: opened the gap between the ornament and the
            CTA block so the CTA can breathe (the actual cta-breath
            animation also reinforces this spatially). */}
        <div className="mt-8 sm:mt-10">
          <PlaybookHero />
        </div>
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
