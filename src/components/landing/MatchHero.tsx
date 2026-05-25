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
      {/* Day 80 (Sasha 2026-05-25) hero-optimization pass.
          The previous tier-shifted version put all five lines in roughly
          the same visual weight class. Sasha's brief: the copy has an
          emotional arc (recognition / promise / pain / mechanism / move)
          and the typography needs to embody that arc, not flatten it.

          Structural moves:
            1. Italic setup ("Find your people") is now a quiet entry,
               not a header. Weight 500, smaller, muted, generous space
               below — it sets the room, then steps aside.
            2. H1 split into TWO elements with different weights:
                 - Line 1 ("The right people change everything") is the
                   expansive beat. Largest type, full primary color,
                   weight 700, max-width clamp so it never sprawls.
                 - Line 2 ("But most networking goes nowhere") is the
                   quieter recognition beat. Smaller, lighter weight,
                   muted color, broken asymmetrically per Sasha's
                   preferred rhythm ("But most networking" / "goes
                   nowhere"). The pain admission shouldn't shout.
            3. Sub paragraph narrowed (~36ch max), regular weight,
               smaller. It's a bridge, not a manifesto.
            4. CTA gets real breathing room above (mt-12 sm:mt-16) so
               the move lands as choice, not pressure.
            5. Soft radial backdrop behind the hero stack so the text
               feels like it emerges from stillness rather than sits
               on a flat field. Pointer-events-none, low opacity, no
               brand color — just atmospheric lift.

          Locked copy unchanged. No terminal periods. No gold spans. */}
      <div className="relative max-w-[720px] mx-auto px-5 py-8 sm:py-10 md:py-12">
        {/* Atmospheric backdrop. Sits behind the hero text only, not
            the CTA. Soft radial so the headline feels lifted from the
            video field without a hard card edge. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[70%] -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(245,241,232,0.55) 0%, rgba(245,241,232,0.32) 45%, rgba(245,241,232,0) 80%)",
            filter: "blur(8px)",
          }}
        />

        <header className="text-center">
          {/* Quiet entry. Steps in, sets the register, steps back. */}
          <p
            className="text-sm sm:text-base md:text-lg leading-[1.4] italic mb-6 sm:mb-8 md:mb-10"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              letterSpacing: "0.02em",
              color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
              textShadow:
                "var(--skin-text-halo-soft, 0 0 16px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.85))",
            }}
          >
            Find your people
          </p>

          {/* H1 line 1 — the expansive beat. Largest, fullest weight. */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.08] tracking-[-0.022em] mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              color: "var(--skin-text-primary, #0a1628)",
              maxWidth: "18ch",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 24px rgba(255,255,255,0.78), 0 1px 2px rgba(255,255,255,0.92), 0 0 1px rgba(11,42,90,0.5), 0 1px 0 rgba(11,42,90,0.3))",
            }}
          >
            The right people change everything
          </h1>

          {/* H1 line 2 — the quieter recognition beat. Smaller, lighter,
              muted. Asymmetric break per Sasha's option 2 rhythm: the
              break before "goes nowhere" lets the admission land. */}
          <p
            className="mt-5 sm:mt-6 md:mt-7 text-xl sm:text-2xl md:text-3xl leading-[1.22] tracking-[-0.01em] mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              color: "var(--skin-text-muted, rgba(26,30,58,0.78))",
              maxWidth: "22ch",
              textShadow:
                "var(--skin-text-halo-soft, 0 0 18px rgba(255,255,255,0.72), 0 1px 2px rgba(255,255,255,0.88))",
            }}
          >
            But most networking
            <br />
            goes nowhere
          </p>

          <Ornament className="my-8 sm:my-10 md:my-12" />

          {/* Bridge paragraph — the mechanism + the outcome. Narrower,
              regular weight, smaller. A bridge, not a second headline. */}
          <p
            className="text-base sm:text-lg md:text-xl leading-[1.5] tracking-[-0.003em] mx-auto"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 500,
              color: "var(--skin-text-primary, #0a1628)",
              maxWidth: "36ch",
              textShadow:
                "var(--skin-text-halo-soft, 0 0 18px rgba(255,255,255,0.68), 0 1px 2px rgba(255,255,255,0.85))",
            }}
          >
            Tell us how you think, build, and see the world
            <br />
            We'll introduce you to entrepreneurs, operators, and advisors who see it the way you do
          </p>
        </header>

        {/* CTA cluster — single primary CTA. Generous space above so the
            move lands as choice, not pressure. */}
        <div className="mt-12 sm:mt-14 md:mt-16">
          <div className="flex flex-col items-center gap-5 px-4 text-center">
            <EditorialCta
              label="Match me"
              onClick={() => navigate("/zone-of-genius?path=match")}
            />

            <div
              className="inline-flex items-center justify-center gap-2 max-w-[460px] mt-2"
              style={{
                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                fontSize: "0.66rem",
                letterSpacing: "0.24em",
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
