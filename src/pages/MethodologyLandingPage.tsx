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
    /* Day 51 (Sasha 2026-04-25): negative-space pass — desktop py
       bumped 8 → 10 so the hero breathes against the lit pane.
       Mobile fold preserved at py-6 (CTA above the fold rule). */
    <div className="max-w-[720px] mx-auto px-5 py-6 md:py-10">
      {/* ═══════ NAME ═══════ */}
      <header className="text-center">
        {/* Recognition opener — plain "You", no drop cap (Sasha).
            Day 51 (Sasha): tracking tightened -0.01em → -0.018em
            for the large-serif chiseled feel. mb after headline
            bumped 5 → 6 at sm+ for breath before the italic echo. */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-[1.1] tracking-[-0.018em] mb-4 sm:mb-6"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
          }}
        >
          You can't clearly say what you do.
        </h1>

        {/* Italic echo — whispered consequence of the headline.
            Day 51 (Sasha): leading 1.25 → 1.32 so the line breathes
            instead of stacking flat under the headline. */}
        <p
          className="text-lg sm:text-xl md:text-2xl leading-[1.32] tracking-[-0.005em] italic"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 400,
            color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
            textShadow:
              "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
          }}
        >
          So people don't buy.
        </p>

        {/* Top ornament bookend (bottom bookend retired — CTA emblem
            carries the gold signature below without competition). */}
        <Ornament className="my-5 sm:my-6" />

        {/* Structure — four accents unified to deep antique-gold.
            Day 51 (Sasha): vertical rhythm between bullets opened
            up (space-y-2/2.5 → 2.5/3.5) so each bullet reads as
            its own beat in the manifesto, not a stacked list. */}
        <div
          className="space-y-2.5 sm:space-y-3.5"
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
      {/* Day 51 (Sasha): mt 5/6 → 6/8 — slightly more space between
          the manifesto bullets and the infographic + CTA below. */}
      <div className="mt-6 sm:mt-8">
        <PlaybookHero />
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
