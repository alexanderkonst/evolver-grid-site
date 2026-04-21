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
            // Panel 3 is now nearly transparent (bg-black/[0.06]) so dark
            // text reads better than white on the light video areas.
            color: "#1a1e3a",
          }}
        >
          {/*
            Highlights (Sasha, 2026-04-21 v2): every action word maps to the
            spectrum of playbook step colors (UV → IR). Each gradient uses 3
            hue stops around the step's base neon for depth.
              "Top Talent" → Step 1 violet
              "Productize" → Step 2 indigo
              "Build"      → Step 3 blue
              "Launch"     → Step 4 cyan
              "Scale"      → Step 5 green
              "Impact"     → Step 7 red-orange (the destination)
          */}
          Find Your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(290, 90%, 72%), hsl(280, 85%, 68%), hsl(270, 85%, 65%))",
            }}
          >
            Top Talent
          </span>
          .{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(258, 90%, 72%), hsl(248, 85%, 68%), hsl(238, 85%, 65%))",
            }}
          >
            Productize
          </span>{" "}
          It.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(220, 90%, 68%), hsl(210, 90%, 62%), hsl(200, 85%, 60%))",
            }}
          >
            Build
          </span>{" "}
          It,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(190, 85%, 60%), hsl(180, 85%, 55%), hsl(170, 80%, 55%))",
            }}
          >
            Launch
          </span>{" "}
          It,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(140, 80%, 60%), hsl(130, 75%, 55%), hsl(120, 70%, 52%))",
            }}
          >
            Scale
          </span>{" "}
          It Alongside{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(25, 100%, 65%), hsl(15, 100%, 62%), hsl(5, 95%, 60%))",
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
