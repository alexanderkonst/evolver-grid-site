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
            Highlights (Sasha, 2026-04-21):
              "top talent" → teal/cyan/blue gradient (Step 1 DISCOVER family)
              "Productize it" → plain white (no highlight)
              "Build"     → amber/orange/coral (Step 4 PRODUCT family)
              "Launch"    → emerald/teal (Step 6 LAUNCH family)
              "Scale"     → violet/magenta/pink (Step 7 SCALE family)
            Each gradient uses 3 hue-shifted stops so it reads as a true
            gradient, not a solid tint.
          */}
          Find your{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(170, 90%, 68%), hsl(190, 80%, 60%), hsl(210, 75%, 65%))",
            }}
          >
            top talent
          </span>
          . Productize it.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(50, 100%, 68%), hsl(35, 95%, 62%), hsl(15, 90%, 65%))",
            }}
          >
            Build
          </span>{" "}
          it,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(155, 75%, 62%), hsl(165, 65%, 52%), hsl(180, 60%, 58%))",
            }}
          >
            Launch
          </span>{" "}
          it,{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, hsl(275, 75%, 72%), hsl(300, 70%, 62%), hsl(330, 70%, 65%))",
            }}
          >
            Scale
          </span>{" "}
          it Alongside Impact Entrepreneurs.
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
