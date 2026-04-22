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
    <div className="max-w-[740px] mx-auto px-5 py-10 md:py-16">
      {/* ═══════ NAME ═══════ */}
      <header className="text-center mb-10 px-4">
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
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] tracking-[-0.01em]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "#0a1628",
            textShadow:
              "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)",
          }}
        >
          {/* ── LAYER 1: Recognition opener ── */}
          You can't clearly explain what you do.
          <br />
          So it's not turning into something people pay for.
        </h1>

        {/* Breathing room between recognition and structure */}
        <div className="h-6 sm:h-8" aria-hidden="true" />

        {/* ── LAYER 2: Compressed structure · UV→IR rainbow preserved ── */}
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] tracking-[-0.01em]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "#0a1628",
            textShadow:
              "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)",
          }}
        >
          {/*
            Neon gradients v8 (unchanged from Day 47 iter 5):
              • Lightness 28% · Saturation 85% · 135deg 3-stop gradients
              • 10px blur @ 0.38 opacity primary glow
              • 3px blur @ 0.45 opacity secondary glow
              • textShadow:'none' on every gradient span (prevents parent
                h1's white halo from bleeding into transparent glyphs)
            UV→IR mapping:
              Top Talent (1) violet · Productize (2) indigo ·
              Build (3) blue · Launch (4) cyan · Scale (5) green ·
              Revenue (6) orange-gold · Impact (7) red-orange
          */}
          {/* Line 1: Find Your [Top Talent]. */}
          Find Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(285, 85%, 28%) 0%, hsl(272, 85%, 24%) 50%, hsl(258, 85%, 26%) 100%)",
              filter:
                "drop-shadow(0 0 10px hsl(278 95% 55% / 0.38)) drop-shadow(0 0 3px hsl(268 95% 48% / 0.45))",
              textShadow: "none",
            }}
          >
            Top Talent
          </span>
          .
          <br />
          {/* Line 2: [Productize] Yourself. */}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(255, 85%, 28%) 0%, hsl(245, 85%, 24%) 50%, hsl(235, 85%, 26%) 100%)",
              filter:
                "drop-shadow(0 0 10px hsl(248 95% 55% / 0.38)) drop-shadow(0 0 3px hsl(240 95% 48% / 0.45))",
              textShadow: "none",
            }}
          >
            Productize
          </span>{" "}
          Yourself.
          <br />
          {/* Line 3: [Build] it. [Launch] it. */}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(220, 85%, 28%) 0%, hsl(210, 85%, 24%) 50%, hsl(200, 85%, 26%) 100%)",
              filter:
                "drop-shadow(0 0 10px hsl(212 95% 52% / 0.38)) drop-shadow(0 0 3px hsl(205 95% 48% / 0.45))",
              textShadow: "none",
            }}
          >
            Build
          </span>{" "}
          it.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(188, 85%, 28%) 0%, hsl(178, 85%, 24%) 50%, hsl(168, 85%, 26%) 100%)",
              filter:
                "drop-shadow(0 0 10px hsl(180 95% 45% / 0.38)) drop-shadow(0 0 3px hsl(175 95% 42% / 0.45))",
              textShadow: "none",
            }}
          >
            Launch
          </span>{" "}
          it.
          <br />
          {/* Line 4: [Scale] your [Revenue] and [Impact]. */}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(138, 85%, 28%) 0%, hsl(128, 85%, 24%) 50%, hsl(115, 85%, 26%) 100%)",
              filter:
                "drop-shadow(0 0 10px hsl(130 95% 42% / 0.38)) drop-shadow(0 0 3px hsl(122 95% 38% / 0.45))",
              textShadow: "none",
            }}
          >
            Scale
          </span>{" "}
          your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(45, 95%, 32%) 0%, hsl(38, 95%, 28%) 50%, hsl(28, 90%, 30%) 100%)",
              filter:
                "drop-shadow(0 0 10px hsl(40 100% 50% / 0.4)) drop-shadow(0 0 3px hsl(35 100% 48% / 0.48))",
              textShadow: "none",
            }}
          >
            Revenue
          </span>{" "}
          and{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(15, 85%, 28%) 0%, hsl(8, 85%, 24%) 50%, hsl(2, 85%, 26%) 100%)",
              filter:
                "drop-shadow(0 0 10px hsl(10 95% 50% / 0.4)) drop-shadow(0 0 3px hsl(5 95% 48% / 0.48))",
              textShadow: "none",
            }}
          >
            Impact
          </span>
          .
        </h2>
      </header>

      {/* ═══════ INFOGRAPHIC + CTA ═══════ */}
      {/* PlaybookHero owns: the 7-step animated circle (Mux HLS) AND the
          "Claim your gift" CTA. Keep the landing frame minimal around it. */}
      <PlaybookHero />
    </div>
  );
};

export default MethodologyLandingPage;
