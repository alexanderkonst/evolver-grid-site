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
          Find Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(300, 100%, 78%) 0%, hsl(280, 100%, 68%) 45%, hsl(255, 100%, 62%) 100%)",
              filter:
                "drop-shadow(0 0 18px hsl(280 100% 70% / 0.65)) drop-shadow(0 0 6px hsl(260 100% 65% / 0.55))",
            }}
          >
            Top Talent
          </span>
          .{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(270, 100%, 75%) 0%, hsl(248, 100%, 65%) 50%, hsl(225, 100%, 60%) 100%)",
              filter:
                "drop-shadow(0 0 18px hsl(250 100% 65% / 0.65)) drop-shadow(0 0 6px hsl(240 100% 60% / 0.55))",
            }}
          >
            Productize
          </span>{" "}
          It.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(230, 100%, 70%) 0%, hsl(210, 100%, 60%) 50%, hsl(195, 100%, 55%) 100%)",
              filter:
                "drop-shadow(0 0 18px hsl(215 100% 60% / 0.65)) drop-shadow(0 0 6px hsl(200 100% 55% / 0.55))",
            }}
          >
            Build
          </span>{" "}
          It,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(195, 100%, 65%) 0%, hsl(180, 100%, 55%) 50%, hsl(165, 95%, 55%) 100%)",
              filter:
                "drop-shadow(0 0 18px hsl(180 100% 55% / 0.7)) drop-shadow(0 0 6px hsl(170 100% 55% / 0.6))",
            }}
          >
            Launch
          </span>{" "}
          It,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(150, 100%, 65%) 0%, hsl(130, 95%, 55%) 50%, hsl(100, 90%, 52%) 100%)",
              filter:
                "drop-shadow(0 0 18px hsl(130 100% 55% / 0.7)) drop-shadow(0 0 6px hsl(115 100% 55% / 0.55))",
            }}
          >
            Scale
          </span>{" "}
          It Alongside{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(45, 100%, 65%) 0%, hsl(20, 100%, 62%) 50%, hsl(0, 100%, 58%) 100%)",
              filter:
                "drop-shadow(0 0 18px hsl(20 100% 60% / 0.7)) drop-shadow(0 0 6px hsl(5 100% 55% / 0.55))",
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
