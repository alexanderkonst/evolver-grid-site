import PlaybookHero from "@/components/playbook/PlaybookHero";

/**
 * MethodologyLandingPage — the pane-3 content of the JOURNEY space on `/`
 * (and on `/game/journey`, via `JourneyPage`).
 *
 * Per Sasha's 2026-04-16 directive the landing strips to three things only:
 *   1. The name  — canonical headline in Cormorant Garamond
 *   2. The infographic — 7-step animated circle (Mux HLS, rendered by
 *      `PlaybookHero`, which also owns the CTA)
 *   3. The CTA — "Claim your gift" → /auth?claim=true&next=/zone-of-genius
 *
 * No testimonials, no social-proof row, no "other projects" link. Everything
 * else belongs deeper in the journey, not on the front door.
 *
 * Pane 2 (SectionsPanel) auto-collapses on the JOURNEY route — see
 * `GameShellV2.tsx` where `isJourneyPage` gates the default state.
 */
const MethodologyLandingPage = () => {
  return (
    /* Day 47 iter 13 (Sasha + mockup proportions):
       Container compressed (max-w 740 → 640, py-10/16 → py-6/8) so the
       whole hero (title + echo + ornament + structure + CTA + meta + text
       link) fits on one viewport without scroll at common desktop heights. */
    <div className="max-w-[640px] mx-auto px-5 py-6 md:py-8">
      {/* ═══════ NAME ═══════ */}
      <header className="text-center mb-6 px-4">
        {/*
          Hero v10 (Day 47 iter 10 — Sasha + GFOA synthesis):
          Two-layer hero. Recognition FIRST, structure SECOND.

          LAYER 1 — Recognition opener (dark navy, no gradients):
            "You can't clearly explain what you do.
             So it's not turning into something people pay for."

          LAYER 2 — Compressed structure (UV→IR rainbow preserved,
          7 steps mapped across the promise):
            "Find Your [Top Talent]₁.
             [Productize]₂ Yourself.
             [Build]₃ it. [Launch]₄ it.
             [Scale]₅ your [Revenue]₆ and [Impact]₇."

          GFOA framing: "recognition first, compressed structure second —
          layered, not chosen." Emotional lock happens in 5-10s; the
          rainbow octave is preserved one beat later.
        */}
        {/* ── LAYER 1: Recognition opener — Day 47 iter 12 (GFOA v1.1):
            Hierarchy restored. First line bold + large (impact beat).
            Second line smaller + lighter (echo beat). Clear spacing between. */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-[-0.01em] mb-5 sm:mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
          }}
        >
          You can't clearly say what you do.
        </h1>
        <p
          className="text-xl sm:text-2xl md:text-3xl leading-[1.2] tracking-[-0.005em]"
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

        {/* Editorial ornament between the two layers — Day 47 iter 11
            (Sasha, from ChatGPT mockup): thin gradient rule + gold star
            centerpiece. Zero functional, whole-page lift. */}
        <div
          className="flex items-center justify-center gap-4 my-5 sm:my-6 max-w-md mx-auto"
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
            className="text-base"
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

        {/* ── LAYER 2: Structure — Day 47 iter 12 (GFOA v1.1):
            Three moves:
              (a) 7 colored words → 3 colored words. Only TOP TALENT, PRODUCTIZE,
                  SCALE carry neon gradient. Build / Launch / Revenue / Impact
                  render in neutral dark navy. Color regains meaning by scarcity.
                  NOTE: this retires the UV→IR octave rainbow from the hero.
                  The 7-step methodology still lives on /playbook in full color;
                  the landing now reads as "3 beats with 3 accents" not "rainbow".
              (b) 4 lines become 4 separate block elements with proper vertical
                  spacing (space-y-4 sm:space-y-5) — path rhythm, not paragraph.
              (c) Font weight + tracking unchanged from prior iteration.
          */}
        <div
          className="space-y-1.5 sm:space-y-2"
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
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "var(--skin-accent-1-bg, linear-gradient(135deg, hsl(285, 85%, 28%) 0%, hsl(272, 85%, 24%) 50%, hsl(258, 85%, 26%) 100%))",
                filter:
                  "var(--skin-accent-1-glow, drop-shadow(0 0 10px hsl(278 95% 55% / 0.38)) drop-shadow(0 0 3px hsl(268 95% 48% / 0.45)))",
                textShadow: "none",
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
                backgroundImage:
                  "var(--skin-accent-2-bg, linear-gradient(135deg, hsl(255, 85%, 28%) 0%, hsl(245, 85%, 24%) 50%, hsl(235, 85%, 26%) 100%))",
                filter:
                  "var(--skin-accent-2-glow, drop-shadow(0 0 10px hsl(248 95% 55% / 0.38)) drop-shadow(0 0 3px hsl(240 95% 48% / 0.45)))",
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
                backgroundImage:
                  "var(--skin-accent-3-bg, linear-gradient(135deg, hsl(138, 85%, 28%) 0%, hsl(128, 85%, 24%) 50%, hsl(115, 85%, 26%) 100%))",
                filter:
                  "var(--skin-accent-3-glow, drop-shadow(0 0 10px hsl(130 95% 42% / 0.38)) drop-shadow(0 0 3px hsl(122 95% 38% / 0.45)))",
                textShadow: "none",
              }}
            >
              Scale
            </span>{" "}
            your Revenue and Impact.
          </p>
        </div>
      </header>

      {/* ═══════ INFOGRAPHIC + CTA ═══════ */}
      {/* PlaybookHero owns: the 7-step animated circle (Mux HLS) AND the
          "Claim your gift" CTA. Keep the landing frame minimal around it. */}
      <PlaybookHero />
    </div>
  );
};

export default MethodologyLandingPage;
