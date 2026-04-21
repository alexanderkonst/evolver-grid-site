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
            Neon gradients v4 (2026-04-21): lightness dropped to 45-55% range
            so the letters read as saturated ink on light Panel 3 — no more
            washed-out "white core" effect. Glow halo in matching hue sells
            the neon feel without relying on lightness stops.
          */}
          Find Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(285, 95%, 52%) 0%, hsl(265, 100%, 48%) 50%, hsl(245, 95%, 50%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(275 100% 55% / 0.55)) drop-shadow(0 0 3px hsl(260 100% 50% / 0.6))",
            }}
          >
            Top Talent
          </span>
          .{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(255, 95%, 52%) 0%, hsl(240, 100%, 48%) 50%, hsl(225, 95%, 50%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(245 100% 55% / 0.55)) drop-shadow(0 0 3px hsl(235 100% 50% / 0.6))",
            }}
          >
            Productize
          </span>{" "}
          It.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(225, 95%, 50%) 0%, hsl(210, 100%, 46%) 50%, hsl(200, 100%, 44%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(212 100% 52% / 0.55)) drop-shadow(0 0 3px hsl(205 100% 48% / 0.6))",
            }}
          >
            Build
          </span>{" "}
          It,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(188, 100%, 42%) 0%, hsl(178, 100%, 38%) 50%, hsl(168, 95%, 40%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(180 100% 45% / 0.6)) drop-shadow(0 0 3px hsl(175 100% 42% / 0.65))",
            }}
          >
            Launch
          </span>{" "}
          It,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(138, 85%, 40%) 0%, hsl(128, 95%, 35%) 50%, hsl(115, 90%, 38%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(130 100% 42% / 0.6)) drop-shadow(0 0 3px hsl(122 100% 38% / 0.65))",
            }}
          >
            Scale
          </span>{" "}
          It Alongside{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(28, 100%, 50%) 0%, hsl(15, 100%, 48%) 50%, hsl(2, 95%, 48%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(15 100% 50% / 0.6)) drop-shadow(0 0 3px hsl(8 100% 48% / 0.65))",
            }}
          >
            Impact
          </span>{" "}
          Entrepreneurs.
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
