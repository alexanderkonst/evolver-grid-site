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
            Neon gradients v5 (Day 47 later-same-day): the "white core" was NOT
            a gradient-lightness bug — it was the parent h1's white text-shadow
            (`0 1px 2px rgba(255,255,255,0.8)`) INHERITING into each gradient
            span. Because the span has `color: transparent`, that white shadow
            renders behind the gradient-clipped glyphs and bleeds through the
            letter interiors — reading as a white core. Fix: explicitly set
            `textShadow: 'none'` on every gradient span so only the neon
            gradient + its own colored drop-shadow glow show. Non-highlighted
            words keep the parent's white halo for legibility on the video bg.
          */}
          Find Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(285, 95%, 42%) 0%, hsl(265, 100%, 38%) 50%, hsl(245, 95%, 40%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(275 100% 55% / 0.55)) drop-shadow(0 0 3px hsl(260 100% 50% / 0.6))",
              textShadow: "none",
            }}
          >
            Top Talent
          </span>
          .{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(255, 95%, 42%) 0%, hsl(240, 100%, 38%) 50%, hsl(225, 95%, 40%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(245 100% 55% / 0.55)) drop-shadow(0 0 3px hsl(235 100% 50% / 0.6))",
              textShadow: "none",
            }}
          >
            Productize
          </span>{" "}
          It.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(225, 95%, 40%) 0%, hsl(210, 100%, 36%) 50%, hsl(200, 100%, 34%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(212 100% 52% / 0.55)) drop-shadow(0 0 3px hsl(205 100% 48% / 0.6))",
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
                "linear-gradient(135deg, hsl(188, 100%, 34%) 0%, hsl(178, 100%, 30%) 50%, hsl(168, 95%, 32%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(180 100% 45% / 0.6)) drop-shadow(0 0 3px hsl(175 100% 42% / 0.65))",
              textShadow: "none",
            }}
          >
            Launch
          </span>{" "}
          It,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(138, 85%, 32%) 0%, hsl(128, 95%, 28%) 50%, hsl(115, 90%, 30%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(130 100% 42% / 0.6)) drop-shadow(0 0 3px hsl(122 100% 38% / 0.65))",
              textShadow: "none",
            }}
          >
            Scale
          </span>{" "}
          It Alongside{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(28, 100%, 42%) 0%, hsl(15, 100%, 40%) 50%, hsl(2, 95%, 40%) 100%)",
              filter:
                "drop-shadow(0 0 14px hsl(15 100% 50% / 0.6)) drop-shadow(0 0 3px hsl(8 100% 48% / 0.65))",
              textShadow: "none",
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
