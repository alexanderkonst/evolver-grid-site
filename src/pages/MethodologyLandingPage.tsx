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
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.15] tracking-[-0.01em]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            // Panel 3 is nearly transparent so dark text reads better than
            // white on the varied video areas. Soft white halo + subtle
            // depth shadow lift the letters on any background patch.
            color: "#0a1628",
            textShadow:
              "0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15)",
          }}
        >
          {/*
            Highlights (Sasha, 2026-04-21 v3 — NEON + glow):
              Each word maps to a playbook step color. Gradients span wider
              hue ranges for visible flow. `filter: drop-shadow` adds the
              neon glow halo around the gradient-clipped letters.
          */}
          {/*
            Neon gradients v8 (Day 47 iter 5): HARMONY THROUGH NUANCE.
            Sasha's rule: the 7-step UV→IR rainbow is an octave — it is
            LOAD-BEARING to the methodology and must stay. So we don't
            collapse hues. Instead we make the TREATMENT identical across
            every word so they read as a unified family spanning the
            spectrum, not six different intensities shouting at each other.

            Uniform dimensions (every word, no exceptions):
              • Lightness      = 28% (center stop 24%, edge 26%)
              • Saturation     = 85% (was 85-100, now clamped)
              • Gradient       = 135deg, 3 stops, tight hue range per word
              • Primary glow   = 10px blur at 0.38 opacity   (was 14px / 0.5-0.6)
              • Secondary glow = 3px  blur at 0.45 opacity   (was 0.55-0.65)

            What varies: only the HUE per word, preserving UV→IR mapping.
            What unifies: everything else. The rainbow now sings in tune.

            textShadow:'none' stays on every span — prevents the parent
            h1's white halo from bleeding through transparent gradients.
          */}
          {/*
            v9 line structure (Day 47 late-late — Sasha):
              Line 1: "Find Your [Top Talent]."
              Line 2: "[Productize] It." ← on its own line, breathing room
              Line 3: "[Build] It, [Launch] It, and [Scale] It"  ← "and" added
              Line 4: "Alongside [Impact] Entrepreneurs"  ← no period at end
                      (psychological: avoids "stop here" cue)
          */}
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
          It.
          <br />
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
          It,{" "}
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
          It, and{" "}
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
          It
          <br />
          Alongside{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(28, 85%, 28%) 0%, hsl(15, 85%, 24%) 50%, hsl(2, 85%, 26%) 100%)",
              filter:
                "drop-shadow(0 0 10px hsl(15 95% 50% / 0.4)) drop-shadow(0 0 3px hsl(8 95% 48% / 0.48))",
              textShadow: "none",
            }}
          >
            Impact
          </span>{" "}
          Entrepreneurs
        </h1>
      </header>

      {/* ═══════ INFOGRAPHIC + CTA ═══════ */}
      {/* PlaybookHero owns: the 7-step animated circle (Mux HLS) AND the
          "Claim your gift" CTA. Keep the landing frame minimal around it. */}
      <PlaybookHero />
    </div>
  );
};

export default MethodologyLandingPage;
