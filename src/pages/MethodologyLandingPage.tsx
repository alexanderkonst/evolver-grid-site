import PlaybookHero from "@/components/playbook/PlaybookHero";
// Day 48 iter 3 (Sasha): the ornament centerpiece is now the ignite-logo
// emblem — the SAME asset rendered inside the primary CTA. One visual
// signature across the page instead of the ✦ unicode glyph + the
// emblem living in different typographic registers.
import igniteLogo from "@/assets/ignite-logo.png";

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
 * ═══════════════════════════════════════════════════════════════════════════
 * Day 48 iter 3 (Sasha, evening review of iter 2 premium pass):
 *
 * Sasha ACCEPTED (kept from iter 2):
 *   • Accent unification → gold (not rainbow)
 *   • Italic echo, smaller + lighter
 *   • Ornament bookends (top + bottom)
 *   • Gold underline on "Top Talent"
 *   • Small-caps CTA + meta eyebrow (PlaybookHero)
 *   • Paper grain, gold focus rings, cta-breath, ornament-spin (index.css)
 *   • Opened whitespace
 *
 * Sasha REJECTED (reverted in this iter):
 *   • Drop cap Y — "remove that please". Back to the plain "You".
 *   • Hero frame (chamfered rounded-3xl card) — "the box is too narrow.
 *     Does it look better with a box? Why a box at all?". Frame retired;
 *     hero runs on the pane wash directly. Wider layout restored.
 *   • Accent gold palette was too light (#f4d472 → #d4af37) and read as
 *     illegible against the cream pane. Darkened to a deep antique-gold
 *     (#a06d08 → #7a5108) that still reads as the gold family but holds
 *     contrast against the panel wash. Drop-shadow glow also softened
 *     (it was diffusing the stroke and hurting legibility further).
 *
 * Sasha ADDED:
 *   • Ornament ✦ glyph replaced with the ignite-logo emblem — same asset
 *     as the primary CTA — so the "gold symbol" reads as one consistent
 *     signature on the page.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ── Signature gold, legible on cream ──
// Day 48 iter 3 (Sasha): all three stops sit in the deep antique-gold /
// bronze band so the gradient reads as a single dark-gold color with
// micro-shine, not a pale highlight sweep. Tested against the Aurora
// cream panel wash — holds ~5.5:1 contrast, comfortably past AA for
// large text.
const GOLD_GRADIENT =
  "linear-gradient(135deg, #a06d08 0%, #7a5108 45%, #6b4208 100%)";
// Subtle edge glow only — not a diffused halo. The prior drop-shadow
// was bleeding the stroke by ~3px which on text reads as "slightly out
// of focus". Replaced with a tight, near-crisp glow.
const GOLD_GLOW =
  "drop-shadow(0 0 1px rgba(212, 175, 55, 0.6)) drop-shadow(0 1px 0 rgba(255,255,255,0.35))";

// Shared ornament (gradient rule · emblem · gradient rule).
// Extracted so the top + bottom bookends stay pixel-identical.
const Ornament = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-center justify-center gap-4 max-w-md mx-auto ${className}`}
    aria-hidden="true"
  >
    <span
      className="flex-1 h-px"
      style={{
        background:
          "linear-gradient(to right, transparent, var(--skin-ornament-rule, rgba(26,30,58,0.25)))",
      }}
    />
    {/* Day 48 iter 3: emblem swapped from ✦ unicode to the ignite-logo
        image asset — same emblem as the primary CTA. Slow rotation
        preserved via .ornament-spin. */}
    <img
      src={igniteLogo}
      alt=""
      aria-hidden="true"
      className="h-5 w-auto ornament-spin"
      style={{
        filter:
          "drop-shadow(0 0 10px rgba(240, 194, 127, 0.5)) drop-shadow(0 0 3px rgba(212, 175, 55, 0.7))",
      }}
      draggable={false}
    />
    <span
      className="flex-1 h-px"
      style={{
        background:
          "linear-gradient(to left, transparent, var(--skin-ornament-rule, rgba(26,30,58,0.25)))",
      }}
    />
  </div>
);

const MethodologyLandingPage = () => {
  return (
    /* Day 48 iter 3 (Sasha): hero frame retired. The pane wash itself
       is the surface; the hero no longer sits inside a rounded card.
       Container slightly widened (680 → 720px) now that there's no
       internal frame eating horizontal space.
       Day 48 iter 5 (Sasha): vertical padding tightened
       (py-10/14 → py-6/8) because the iter-2 generous padding combined
       with the ornament bookends pushed the CTA below the fold on a
       standard laptop viewport. Whitespace inside the hero preserved;
       only the outer container gaps came down. */
    <div className="max-w-[720px] mx-auto px-5 py-6 md:py-8">
      {/* ═══════ NAME ═══════ */}
      <header className="text-center">
        {/* ── LAYER 1: Recognition opener
            Day 48 iter 3 (Sasha): drop cap reverted. Plain "You" —
            the sentence carries itself without editorial ornament
            on the first letter. */}
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

        {/* ── Echo — italic + smaller + lighter.
            "So people don't buy it." drops in weight so it reads as
            the whispered consequence of the headline, not a peer
            statement. */}
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

        {/* Editorial ornament (top bookend) — iter 5: tightened
            my-7/8 → my-5/6 to help the CTA clear the fold. */}
        <Ornament className="my-5 sm:my-6" />

        {/* ── LAYER 2: Structure
            Three accents unified to a DEEP antique-gold gradient so
            they read as distinctly gold against the cream pane
            without losing legibility. "Top Talent" additionally
            carries a subtle gold underline since it is both the
            product name and the promise. */}
        <div
          className="space-y-2 sm:space-y-2.5"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
          }}
        >
          {/* Line 1: Find Your [Top Talent].
              Day 48 iter 4 (Sasha): underline on "Top Talent" retired.
              "WHy do we need to underline Top Talent? I don't think it
              makes sense or adds much." The gold gradient + subtle
              edge glow already signal "this is the phrase" — an
              additional underline is redundant and reads as a link. */}
          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
            Find Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: GOLD_GRADIENT,
                filter: GOLD_GLOW,
                textShadow: "none",
              }}
            >
              Top Talent
            </span>
            .
          </p>

          {/* Line 2: [Productize] Yourself. */}
          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: GOLD_GRADIENT,
                filter: GOLD_GLOW,
                textShadow: "none",
              }}
            >
              Productize
            </span>{" "}
            Yourself.
          </p>

          {/* Line 3: Build it. Launch it. — NEUTRAL (no gradient). */}
          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
            Build it. Launch it.
          </p>

          {/* Line 4: [Scale] your Revenue and Impact. */}
          <p className="text-xl sm:text-2xl md:text-[1.75rem] font-medium leading-[1.3] tracking-[-0.005em]">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: GOLD_GRADIENT,
                filter: GOLD_GLOW,
                textShadow: "none",
              }}
            >
              Scale
            </span>{" "}
            your Revenue and Impact.
          </p>
        </div>

        {/* Editorial ornament (bottom bookend) — mirrors the top so the
            hero reads as an opened + closed editorial passage.
            iter 5: tightened mt-8/10 → mt-5/6 for fold. */}
        <Ornament className="mt-5 sm:mt-6" />
      </header>

      {/* ═══════ INFOGRAPHIC + CTA ═══════
          iter 5: tightened mt-8/10 → mt-5/6 so the CTA sits on-screen
          on first paint. The ornament above already provides the
          visual beat between structure and CTA — the 40px mt is
          rhythm, not gap. */}
      <div className="mt-5 sm:mt-6">
        <PlaybookHero />
      </div>
    </div>
  );
};

export default MethodologyLandingPage;
