import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { Ornament } from "@/lib/landingDesign";
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
    trackFunnelEvent("match_landing_view", "match_hero", {
      landing_type: "match",
      skin,
      path_param_present: pathParamPresent,
    });
  }, [skin]);

  return (
    <>
      <SEO
        title="Find Your Top Talent — Precision Matchmaking"
        description="Your people are already here — we surface the high-precision matches, real introductions follow"
        path="/?path=match"
        ogTitle="You don't have to build alone"
      />
      <div className="max-w-[720px] mx-auto px-5 py-8 sm:py-9 md:py-10">
        <header className="text-center">
          {/* Eyebrow — small-caps gold accent. Day 78 (Sasha 2026-05-21):
              promoted from `--skin-accent-gold` (#b8860b) to `goldDeep`
              (#5d4307) + soft halo. The lighter gold was failing the
              cream-on-cream contrast test in the Aurora skin. NS skin
              cascade-overrides this to editorial black regardless. */}
          <p
            className="mb-4 sm:mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--skin-goldDeep, #5d4307)",
              textShadow:
                "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.75), 0 0 8px rgba(255,255,255,0.55))",
            }}
          >
            Precision matchmaking for collaboration
          </p>

          {/* Hero (h1) — Day 78 copy + treatment pass. No emphasized
              word, no terminal period. Strong-cocktail legibility
              (Cormorant 700 + deep halo) preserved for parity with the
              build-path landing. */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-[-0.018em] mb-4 sm:mb-5"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            You don't have to build alone
          </h1>

          {/* Italic echo — the whispered consequence under the headline.
              Day 78: no emphasized "your", no terminal period — reads as
              one breath. */}
          <p
            className="text-lg sm:text-xl md:text-2xl leading-[1.32] italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              letterSpacing: "0.01em",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
          >
            You've met cool people, you still haven't found your people
          </p>

          <Ornament className="my-5 sm:my-6" />

          {/* Sub paragraph — the promise. Day 78: "in this network"
              dropped (implied the visitor self-identifies with a
              network); "We surface them" rephrased; no emphasis, no
              terminal periods. Manifesto-row register held. */}
          <p
            className="text-xl sm:text-2xl md:text-[1.75rem] font-bold leading-[1.4] tracking-[-0.005em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            Your people are already here — we surface the high-precision matches, real introductions follow
          </p>
        </header>

        {/* CTA cluster — single primary CTA, no secondary playbook link.
            Visiting cold from outreach, the only next step is the assessment. */}
        <div className="mt-7 sm:mt-8">
          <div className="flex flex-col items-center gap-4 px-4 text-center">
            <EditorialCta
              label="Find your top talent"
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
