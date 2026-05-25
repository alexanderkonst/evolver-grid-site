import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditorialCta } from "@/components/ui/editorial-cta";
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
        description="A few simple prompts, and we'll introduce you to entrepreneurs, operators, and advisors who see it the way you do."
        path="/?path=match"
        ogTitle="Find your people"
      />
      {/* Day 84 v6 (Sasha 2026-05-25) attention-choreography pass.
          The v5 no-scroll compression flattened the emotional arc to
          fit above the fold. Sasha's new brief reverses that priority:
          breath, silence, and hierarchy come FIRST. Scroll is fine.
          The hero must direct the eye through the emotional sequence
          and land on ONE dominant frame: "The right people change
          everything."

          Composition (this pass):
            1. "Find your people." demoted to a refined eyebrow:
               small-caps tracking, light weight, muted opacity,
               generous breath beneath. Quiet invitation.
            2. ONE dominant moment: "The right people change
               everything." Single expansive line (option 2 from
               brief), largest type, full primary color, weight 700,
               held to ~20ch. THE frame.
            3. "But most networking / goes nowhere." rendered as
               quieter italic reflection. Smaller, lower opacity,
               narrower (~14ch). Break before "goes nowhere" so the
               admission settles softly.
            4. Ornament removed entirely. Sasha: "the design needs
               SILENCE." A horizontal rule was fragmenting flow.
            5. Bridge is now ONE sentence (copy update): "A few simple
               prompts, and we'll introduce you to entrepreneurs,
               operators, and advisors who see it the way you do."
               Regular weight, calm reading width (~44ch), big pause
               above so it lands as a distinct beat.
            6. CTA switched to SECONDARY variant: light glass pill,
               navy text, no halo. Less visually heavy, more
               integrated. "Inevitable" not "click here."
            7. Composition biased UPWARD inside the pane via heavier
               top padding vs. bottom — hero sits above visual center,
               eye lands on dominant frame, descends through arc into
               negative space.
            8. Hourglass widths (eyebrow wide → headline ~20ch →
               reflection ~14ch → bridge ~44ch) create compositional
               rhythm without breaking centered alignment.

          Terminal periods restored: Day 78 stripped them for momentum;
          this pass restores them because the design intent is now
          stillness. Periods serve as the pause "quiet realization"
          requires. Matches Sasha's brief copy verbatim. */}
      <div data-match-hero="true" className="relative max-w-[860px] mx-auto px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 md:pt-20 md:pb-28">
        {/* Atmospheric backdrop. Sits behind the headline cluster only.
            Soft cream radial so the dominant frame lifts off the video
            without a hard card edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[6%] h-[58%] -z-10"
          style={{
            background:
              "radial-gradient(ellipse 65% 58% at 50% 45%, rgba(245,241,232,0.62) 0%, rgba(245,241,232,0.36) 42%, rgba(245,241,232,0) 78%)",
            filter: "blur(10px)",
          }}
        />

        <header>
          {/* Eyebrow — refined, quiet invitation. Small-caps tracking,
              light italic, muted. Sets the room, steps back. */}
          <p
            className="text-center text-[0.7rem] sm:text-xs md:text-[0.78rem] mb-10 sm:mb-12 md:mb-14"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              fontStyle: "italic",
              letterSpacing: "0.36em",
              textTransform: "uppercase",
              color: "var(--skin-text-muted, rgba(26,30,58,0.55))",
              textShadow:
                "var(--skin-text-halo-soft, 0 0 14px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.85))",
            }}
          >
            Find your people
          </p>

          {/* THE dominant frame. Largest type, fullest weight,
              expansive single line on desktop, controlled wrap on
              mobile via the 20ch clamp. */}
          <h1
            className="text-center text-[2rem] sm:text-5xl md:text-6xl font-bold leading-[1.04] tracking-[-0.024em] mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              color: "var(--skin-text-primary, #0a1628)",
              maxWidth: "20ch",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 26px rgba(255,255,255,0.78), 0 1px 2px rgba(255,255,255,0.92), 0 0 1px rgba(11,42,90,0.5), 0 1px 0 rgba(11,42,90,0.3))",
            }}
          >
            The right people change everything.
          </h1>

          {/* Quieter reflection beat. Smaller, italic, lighter weight,
              muted, narrower. Break before "goes nowhere" so the
              admission settles. */}
          <p
            className="text-center mt-7 sm:mt-9 md:mt-11 text-lg sm:text-xl md:text-2xl leading-[1.28] tracking-[-0.005em] italic mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              color: "var(--skin-text-muted, rgba(26,30,58,0.62))",
              maxWidth: "14ch",
              textShadow:
                "var(--skin-text-halo-soft, 0 0 16px rgba(255,255,255,0.65), 0 1px 2px rgba(255,255,255,0.82))",
            }}
          >
            But most networking
            <br />
            goes nowhere.
          </p>

          {/* Bridge — single sentence. Calm reading width, regular
              weight, generous pause above. */}
          <p
            className="text-center mt-16 sm:mt-20 md:mt-24 text-base sm:text-lg md:text-[1.2rem] leading-[1.55] tracking-[-0.002em] mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              color: "var(--skin-text-primary, rgba(10,22,40,0.88))",
              maxWidth: "44ch",
              textShadow:
                "var(--skin-text-halo-soft, 0 0 16px rgba(255,255,255,0.62), 0 1px 2px rgba(255,255,255,0.82))",
            }}
          >
            A few simple prompts, and we'll introduce you to entrepreneurs, operators, and advisors who see it the way you do.
          </p>
        </header>

        {/* CTA cluster — secondary variant (light glass, navy text, no
            halo). More refined, more integrated. Real breathing room
            above so the move lands as choice, not pressure. */}
        <div className="mt-14 sm:mt-16 md:mt-20">
          <div className="flex flex-col items-center gap-5 px-4 text-center">
            <EditorialCta
              label="Match me"
              variant="secondary"
              onClick={() => navigate("/zone-of-genius?path=match")}
            />

            <div
              className="inline-flex items-center justify-center gap-2 max-w-[460px] mt-3"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.48))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.55))",
                fontSize: "0.62rem",
                letterSpacing: "0.28em",
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
