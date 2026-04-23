import PlaybookHero from "@/components/playbook/PlaybookHero";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";

/**
 * MethodologyLandingPage — the pane-3 content of the JOURNEY space on `/`
 * (and on `/game/journey`, via `JourneyPage`).
 *
 * Per Sasha's 2026-04-16 directive the landing strips to three things only:
 *   1. The name  — canonical headline in Cormorant Garamond
 *   2. The infographic — 7-step animated circle (Mux HLS, rendered by
 *      `PlaybookHero`, which also owns the CTA)
 *   3. The CTA — "Find your top talent" → /zone-of-genius
 *
 * Shared design tokens (gold gradient, ornament, CTA small-caps) live
 * in `@/lib/landingDesign` and are reused across the /zone-of-genius
 * funnel so the visual signature is consistent end-to-end.
 */
const MethodologyLandingPage = () => {
  return (
    <div className="max-w-[720px] mx-auto px-5 py-6 md:py-8">
      {/* ═══════ NAME ═══════ */}
      <header className="text-center">
        {/* Recognition opener — plain "You", no drop cap (Sasha). */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-[-0.01em] mb-4 sm:mb-5"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
          }}
        >
          You can't clearly say what you do.
        </h1>

        {/* Italic echo — whispered consequence of the headline. */}
        <p
          className="text-lg sm:text-xl md:text-2xl leading-[1.25] tracking-[-0.005em] italic"
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

        {/* Top ornament bookend (bottom bookend retired — CTA emblem
            carries the gold signature below without competition). */}
        <Ornament className="my-5 sm:my-6" />

        {/* Structure — three accents unified to deep antique-gold. */}
        <div
          className="space-y-2 sm:space-y-2.5"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
          }}
        >
          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
            Find Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              Top Talent
            </span>
            .
          </p>

          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
            <span
              className="bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              Productize
            </span>{" "}
            Yourself.
          </p>

          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
            Build it. Launch it.
          </p>

          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
            <span
              className="bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              Scale
            </span>{" "}
            your Revenue and Impact.
          </p>
        </div>
      </header>

      {/* ═══════ INFOGRAPHIC + CTA ═══════ */}
      <div className="mt-5 sm:mt-6">
        <PlaybookHero />
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
