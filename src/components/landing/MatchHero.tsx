import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
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
      {/* Day 84 v8 (Sasha 2026-05-25) emphasis-restoration pass.
          v7 fit the viewport but flattened the emotional register —
          Sasha: "elegant emphasis, not flattened typography." This
          pass copies the build-path hero's typographic family
          (Cormorant 700 + deep halo + selective gold caps via
          GOLD_TEXT_STYLE) so the two heroes feel like siblings.

          Specific moves:
            1. Imported back GOLD_TEXT_STYLE + Ornament from
               landingDesign. The gold spans are the emphasis grammar
               the brand already speaks; not gimmicks.
            2. Eyebrow "Find your people" is now an italic Cormorant
               echo (text-base/lg/xl, weight 700, 0.01em) — same
               register as build-path's italic echo. Reads as
               thesis, not label.
            3. H1 "The right people change EVERYTHING." uses the
               build-path H1 scale (text-2xl/3xl/4xl, font-bold,
               leading-1.1, tracking -0.018em). EVERYTHING in gold
               caps (0.92em, 0.04em tracking) = one dominant moment
               of emotional gravity. Container width handles wrap; no
               artificial maxWidth clamp.
            4. Sub-italic "But most networking goes nowhere." uses
               the italic-echo register again (text-base/lg/xl,
               weight 700 italic, 0.01em). No more 14ch narrow
               column — full container width, single line on
               desktop, natural wrap on mobile.
            5. Ornament restored as the structural beat between
               headline cluster and bridge.
            6. Bridge uses the build-path manifesto scale
               (text-lg/xl/2xl, font-bold, leading-1.4, tracking
               -0.005em). Reading width is the container, not a 44ch
               cinch.
            7. CTA back to PRIMARY (dark glass, gold halo, rotating
               emblem) — "important. inevitable. confident."
            8. Atmospheric cream-radial backdrop removed. The parent
               GameShellV2 already lays a cream overlay over the
               video; layering another one was washing contrast.
            9. Container width back to max-w-[720px] (sibling to
               build-path). Single-knob fit handled by min-h/max-h on
               the viewport-anchored wrapper. */}
      {/* Height math (per shell branch):
            - Desktop (lg+): parent `<main>` adds `pt-4` (16px).
              Subtract 1rem.
            - Mobile (<lg): mobile shell has a ~76px sticky topbar.
              Subtract 5rem.
          min-h + max-h lock the hero to the available area; flex
          justify-center distributes breath; type uses fixed
          responsive sizes (no clamps) for confident hierarchy. */}
      <div
        data-match-hero="true"
        className="relative w-full flex flex-col items-center justify-center px-5 py-4 max-w-[720px] mx-auto min-h-[calc(100svh-5rem)] max-h-[calc(100svh-5rem)] lg:min-h-[calc(100svh-1rem)] lg:max-h-[calc(100svh-1rem)]"
      >
        <header className="text-center w-full">
          {/* Day 84 v10 (Sasha 2026-05-25) — daouniverse font harmony.
              Editorial paragraphs (eyebrow, tension line, bridge) get
              `font-display`. Resolves to Cormorant on Aurora/Karime/NS
              (same as the inline `fontFamily` style — no-op). On
              daouniverse, the `.font-display` rule fires Playfair so
              the entire editorial voice (eyebrow + H1 + tension line
              + bridge) sits in ONE serif family. Inter stays for CTA
              + microcopy (UI chrome lane). Two clean lanes under
              daouniverse: editorial serif (voice) vs system sans
              (chrome). Brand signal preserved, visual fragmentation
              gone. */}
          {/* Eyebrow — Cormorant italic, build-hero echo register.
              The thesis of the entire experience, not a label. */}
          <p
            className="font-display text-base sm:text-lg md:text-xl leading-[1.32] italic mb-4 sm:mb-5"
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

          {/* THE dominant frame. Build-path H1 scale.
              Day 84 v9 (Sasha 2026-05-25) — emphasis migrated from
              "EVERYTHING" to "right people." Rationale:
                - "right people" is the meaning, the identity hook,
                  the product. That phrase is what the user should
                  emotionally remember leaving the page.
                - "change everything" is consequence language — a
                  beautiful close but not the anchor.
                - Previous gold caps on EVERYTHING made motivational-
                  poster energy. Wrong register.
              Treatment is intentionally subtle: GOLD_TEXT_STYLE only
              (warm gold hue + soft glow), no uppercase, no scale
              change, no extra tracking. Emotional precision, not
              loudness. "change everything." returns to plain primary
              color — calm confidence carries it. */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-[1.1] tracking-[-0.018em] mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            The{" "}
            <span
              className="bg-clip-text text-transparent"
              style={GOLD_TEXT_STYLE}
            >
              right people
            </span>{" "}
            change everything.
          </h1>

          {/* Tension line — italic echo register. Full container
              width, no narrow stack. `font-display` so daouniverse
              lifts this into Playfair alongside the H1. */}
          <p
            className="font-display text-base sm:text-lg md:text-xl leading-[1.32] italic mb-3 sm:mb-4"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              letterSpacing: "0.01em",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
          >
            But most networking goes nowhere.
          </p>

          <Ornament className="my-4 sm:my-5" />

          {/* Bridge — build-path manifesto register. Container width
              for confidence; one calm sentence. `font-display` keeps
              this in the editorial voice on daouniverse (Playfair),
              not the Inter body register. */}
          <p
            className="font-display text-lg sm:text-xl md:text-2xl font-bold leading-[1.4] tracking-[-0.005em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            A few simple prompts, and we'll introduce you to entrepreneurs, operators, and advisors who see it the way you do.
          </p>
        </header>

        {/* CTA cluster — PRIMARY dark glass with gold halo. The move
            should feel important, inevitable, confident. */}
        <div className="mt-6 sm:mt-7 md:mt-8 flex flex-col items-center gap-3 sm:gap-4 px-4 text-center">
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
    </>
  );
};

export default MatchHero;
