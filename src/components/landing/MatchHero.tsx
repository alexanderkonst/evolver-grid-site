import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { Ornament, GOLD_TEXT_STYLE } from "@/lib/landingDesign";
import SEO from "@/components/SEO";
import { trackFunnelEvent } from "@/lib/funnelAnalytics";
import { useSkin } from "@/contexts/SkinContext";

/**
 * MatchHero — Funnel v2 (Day 77, Sasha 2026-05-20).
 *
 * The pane-3 content when a visitor arrives via `?path=match` (Balaji /
 * ecosystem-leader outreach). Sits inside the same `GameShellV2` as
 * `MethodologyLandingPage` so the JOURNEY rail + spaces rail behave
 * identically; only the hero copy + CTA destination diverge.
 *
 * Day 78 (Sasha 2026-05-21) copy + legibility pass:
 *   - Eyebrow color: gold-on-cream was barely legible; promoted to the
 *     `goldDeep` token (#5d4307) + soft halo so the small-caps still
 *     read as gold but with real contrast against the bg.
 *   - Stripped the uppercase-gold-gradient emphasis spans on the hero,
 *     italic echo, and sub paragraph — Sasha's call: no single word
 *     should be lifted out, the lines read as one breath each.
 *   - Removed all sentence-final periods — dots act as full-stops to
 *     readers and break momentum into the next line.
 *   - Hero copy softened: "Stop building alone" felt directive /
 *     preachy. Reframed as an empathic acknowledgment of the user's
 *     state, not an order.
 *   - "in this network" removed from the sub paragraph — implies the
 *     visitor identifies with a specific network; the message should
 *     work for anyone arriving via outreach.
 *   - "We surface them" rephrased to "we surface the high-precision
 *     matches" — clearer about what the system actually does.
 *
 * No testimonials, no two-paths split, no Ignite link — single CTA only,
 * per spec §4.1(b). Build-path users never see this hero.
 *
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.1(b).
 */
const MatchHero = () => {
  const navigate = useNavigate();
  const { skin } = useSkin();

  // §4.8 entry-path attribution. Fires once on mount — the landing
  // impression. `path_param_present` reflects whether the user arrived
  // with the explicit URL param vs context restoration from a same-tab
  // refresh; MatchHero only renders when EntryPathContext.path === "match",
  // and that flag is set from `?path=match` on first hit, so the impression
  // here is always a match-path entry.
  useEffect(() => {
    const pathParamPresent =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("path") === "match";
    trackFunnelEvent({
      step: "match_landing_view",
      source: "match_hero",
      metadata: {
        landing_type: "match",
        skin,
        path_param_present: pathParamPresent,
      },
    });
  }, [skin]);

  return (
    <>
      <SEO
        title="Find Your Top Talent · Find Your People"
        description="Tell us how you think, build, and see the world. We'll introduce you to entrepreneurs, operators, and advisors who see it the way you do."
        path="/?path=match"
        ogTitle="Find your people"
      />
      {/* Day 80 (Sasha 2026-05-23): hero typography + padding tier-shifted
          down (mirror of MethodologyLandingPage same-day change) so the
          full first-viewport stack lands above the fold without zoom. */}
      <div className="max-w-[720px] mx-auto px-5 py-6 sm:py-7 md:py-8">
        <header className="text-center">
          {/* Day 80 (Sasha 2026-05-25) — new locked copy. Eyebrow
              ("Precision intros for entrepreneurs") retired on purpose;
              Sasha's call. Italic setup ("Find your people") leads
              directly into the two-line h1 promise / pain contrast.
              Sub paragraph names the mechanism (you describe how you
              think) + the outcome (intros to people who see it your
              way). Gold-emphasis spans dropped this pass — clean
              ship; if specific words want gold accent we'll add by
              Sasha's word-level call after seeing it live. Line breaks
              between H1 sentences and sub-paragraph sentences are
              explicit <br /> to preserve the deliberate cadence Sasha
              wrote (each line as a beat, no rolling paragraph). */}
          <p
            className="text-base sm:text-lg md:text-xl leading-[1.32] italic mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              letterSpacing: "0.01em",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
          >
            Find your people
          </p>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.15] tracking-[-0.018em] mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            The right people change everything
            <br />
            But most networking goes nowhere
          </h1>

          <Ornament className="my-4 sm:my-5" />

          <p
            className="text-lg sm:text-xl md:text-2xl font-bold leading-[1.4] tracking-[-0.005em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            Tell us how you think, build, and see the world
            <br />
            We'll introduce you to entrepreneurs, operators, and advisors who see it the way you do
          </p>
        </header>

        {/* CTA cluster — single primary CTA, no secondary playbook link.
            Visiting cold from outreach, the only next step is the assessment. */}
        <div className="mt-7 sm:mt-8">
          <div className="flex flex-col items-center gap-4 px-4 text-center">
            <EditorialCta
              label="Match me"
              onClick={() => navigate("/zone-of-genius?path=match")}
            />

            <div
              className="inline-flex items-center justify-center gap-2 max-w-[460px] mt-1"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              <span>Free · 2 minutes · No signup to start</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchHero;
