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
            Neon gradients v6 (Day 47 iter 3): gradient lightness dropped
            from the 40-48% range down to 20-32% — letters now read as
            saturated INK with a neon aura, rather than rainbow pastel.
            Previous issue was "too rainbowy"; fix is darker centers so the
            drop-shadow glow does the neon work, not the letter fill.
            v5 note kept for reference: textShadow:'none' on each span
            prevents parent h1's white halo from bleeding into gradient
            glyphs (the "white core" bug).
          */}
          Find Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(285, 90%, 30%) 0%, hsl(265, 95%, 24%) 50%, hsl(245, 90%, 28%) 100%)",
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
                "linear-gradient(135deg, hsl(255, 90%, 30%) 0%, hsl(240, 95%, 24%) 50%, hsl(225, 90%, 28%) 100%)",
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
                "linear-gradient(135deg, hsl(225, 90%, 28%) 0%, hsl(210, 95%, 24%) 50%, hsl(200, 95%, 22%) 100%)",
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
                "linear-gradient(135deg, hsl(188, 95%, 24%) 0%, hsl(178, 95%, 20%) 50%, hsl(168, 90%, 22%) 100%)",
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
                "linear-gradient(135deg, hsl(138, 85%, 22%) 0%, hsl(128, 90%, 18%) 50%, hsl(115, 85%, 20%) 100%)",
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
                "linear-gradient(135deg, hsl(28, 95%, 32%) 0%, hsl(15, 95%, 28%) 50%, hsl(2, 90%, 30%) 100%)",
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
