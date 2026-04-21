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
            color: "rgba(231,233,229,0.98)",
          }}
        >
          {/*
            Color per action verb — each uses the neon of its playbook step so
            the title ↔ ring infographic link is felt, not explained.
              "Find"      → Step 1 teal   (DISCOVER)
              "Productize"→ Step 2 violet (PACKAGE)
              "Build"     → Step 4 gold   (PRODUCT — the actual building)
              "Launch"    → Step 6 green  (LAUNCH)
              "Scale"     → Step 7 violet (SCALE)
          */}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(175, 80%, 60%), hsl(175, 80%, 50%))",
            }}
          >
            Find
          </span>{" "}
          your top talent.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #8460ea, #29549f)",
            }}
          >
            Productize it.
          </span>{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(45, 95%, 60%), hsl(38, 85%, 52%))",
            }}
          >
            Build
          </span>{" "}
          it,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(145, 65%, 55%), hsl(150, 60%, 45%))",
            }}
          >
            Launch
          </span>{" "}
          it,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, hsl(290, 65%, 65%), hsl(285, 60%, 55%))",
            }}
          >
            Scale
          </span>{" "}
          it Alongside Other Impact Entrepreneurs.
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
