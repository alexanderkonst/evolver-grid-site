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
    /* Day 54 (Sasha 2026-04-28): mobile breath pass. The above-the-fold
       was reading as too packed — eight visual blocks stacked into one
       phone viewport with sub-24px gaps between them. The CTA-above-the-
       fold rule was driving an over-tight `py-6`; trading 8-12px below
       the fold for a much calmer reading rhythm. Container vertical
       padding, headline → italic gap, ornament margin, manifesto bullet
       gaps, and the CTA-cluster offset all bumped one notch on mobile. */
    <div className="max-w-[720px] mx-auto px-5 py-8 sm:py-9 md:py-10">
      {/* ═══════ NAME ═══════ */}
      <header className="text-center">
        {/* Recognition opener — plain "You", no drop cap (Sasha).
            Day 54 (Sasha): mb under headline bumped 4 → 6 on mobile so
            the italic echo doesn't crash into the headline's descender. */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-[-0.018em] mb-4 sm:mb-5"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
          }}
        >
          Can you say what you do so{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              ...GOLD_TEXT_STYLE,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontSize: "0.92em",
            }}
          >
            clearly
          </span>
        </h1>

        {/* Italic echo — whispered consequence of the headline.
            Day 51 (Sasha): leading 1.25 → 1.32 so the line breathes
            instead of stacking flat under the headline. */}
        <p
          className="text-lg sm:text-xl md:text-2xl leading-[1.32] tracking-[-0.005em] italic"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
            textShadow:
              "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
          }}
        >
          right people{" "}
          <span
            className="not-italic font-semibold bg-clip-text text-transparent"
            style={{
              ...GOLD_TEXT_STYLE,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontSize: "0.92em",
            }}
          >
            always
          </span>{" "}
          buy?
        </p>

        {/* Top ornament bookend (bottom bookend retired — CTA emblem
            carries the gold signature below without competition).
            Day 54 (Sasha): margin opened up so the ornament reads as a
            real beat of breath, not a tight visual divider. */}
        <Ornament className="my-5 sm:my-6" />

        {/* Structure — four accents unified to deep antique-gold.
            Day 54 (Sasha): vertical rhythm between bullets bumped
            again (space-y-2.5/3.5 → 4/5) so each bullet sits as its
            own beat in the manifesto rather than collapsing into a
            stacked list on mobile. Line-height also opened slightly
            for in-bullet breathability. */}
        <div
          className="space-y-2.5 sm:space-y-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
          }}
        >
          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.4] tracking-[-0.005em]">
            Find Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              Top Talent
            </span>
            .
          </p>

          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.4] tracking-[-0.005em]">
            <span
              className="bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              Productize
            </span>{" "}
            Yourself.
          </p>

          {/* Day 58+ (Sasha 2026-05-03): "Build it. Launch it." line
              retired from the hero stack — the three-line cadence
              (Find Your Top Talent / Productize Yourself / Scale your
              Revenue and Impact) reads cleaner without the
              imperative-pair interruption between the gerund-form
              promise lines. */}
          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.4] tracking-[-0.005em]">
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
      {/* Day 54 (Sasha): mt 6/8 → 10/12 — the manifesto bullets need
          a real chapter-break before the CTA cluster, not a polite
          gap. On mobile especially, this is the moment of breath
          between "what we promise" and "do this." */}
      <div className="mt-6 sm:mt-7">
        <PlaybookHero />
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
