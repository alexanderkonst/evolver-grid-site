/**
 * landingDesign — shared design tokens + helpers for the premium
 * "Find Your Top Talent" visual language.
 *
 * Single source of truth for:
 *   • The signature deep-antique-gold gradient (legible on cream panels)
 *   • The soft gold edge glow
 *   • The ornament (hairline rule · ignite-logo emblem · hairline rule)
 *   • The small-caps CTA label treatment
 *
 * Used by:
 *   - /                    (MethodologyLandingPage.tsx)
 *   - /zone-of-genius/*    (ZoG entry, landing, steps, result screens)
 *   - /path                (money-back guaranteed callout — via skin tokens)
 *
 * Day 48 iter 7 (Sasha): extracted from MethodologyLandingPage.tsx
 * so the same visual signatures appear across the funnel without
 * drift. Edit here and every surface inherits.
 */

import igniteLogo from "@/assets/ignite-logo.png";

// ── Signature gold, legible on cream ──
// All three stops sit in the deep antique-gold / bronze band so the
// gradient reads as a single dark-gold color with micro-shine, not
// a pale highlight sweep. Holds ~5.5:1 contrast against cream Aurora
// panel wash — comfortably past AA for large text.
export const GOLD_GRADIENT =
  "linear-gradient(135deg, #a06d08 0%, #7a5108 45%, #6b4208 100%)";

// Subtle edge glow only — not a diffused halo. A prior experiment
// used a 10px drop-shadow which bled the stroke ~3px and read as
// "slightly out of focus" on text. This glow is tight + near-crisp.
export const GOLD_GLOW =
  "drop-shadow(0 0 1px rgba(212, 175, 55, 0.6)) drop-shadow(0 1px 0 rgba(255,255,255,0.35))";

// Inline style object for gold-gradient text spans.
// Usage:
//   <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
//     Top Talent
//   </span>
export const GOLD_TEXT_STYLE: React.CSSProperties = {
  backgroundImage: GOLD_GRADIENT,
  filter: GOLD_GLOW,
  textShadow: "none",
};

// ── Small-caps CTA label treatment ──
// Used on the primary pill CTA label so "FIND YOUR TOP TALENT" reads
// as a chiseled editorial call rather than sentence case. The 0.14em
// letter-spacing and 0.88em size relative to the button's own font
// size keep it balanced with the ignite-logo emblem + arrow.
export const CTA_SMALL_CAPS_STYLE: React.CSSProperties = {
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "0.88em",
};

// ── Small-caps meta eyebrow ──
// Used for editorial "datelines" under CTAs (e.g. "TAKES 2 MINUTES · NO
// SIGNUP"). Tighter tracking, smaller size, muted color inherited from
// the parent.
export const META_EYEBROW_STYLE: React.CSSProperties = {
  fontSize: "0.68rem",
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  fontWeight: 500,
};

/**
 * Ornament — gradient rule · ignite-logo · gradient rule.
 *
 * Editorial horizontal divider. The emblem at the center is the SAME
 * ignite-logo image that sits inside the primary CTA, so the gold
 * signature reads as one consistent mark across the page. Rotates
 * very slowly via `.ornament-spin` (48s per turn) — a "living
 * document" tell.
 */
export const Ornament = ({ className = "" }: { className?: string }) => (
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
    {/* Day 48 iter 14 (Sasha): rotation via INLINE style (not just the
        .ornament-spin class) because the class rule was getting
        cascade-overridden somewhere in Sasha's preview. Inline wins
        everything except other !important inline — bulletproof. */}
    <img
      src={igniteLogo}
      alt=""
      aria-hidden="true"
      className="h-5 w-auto ornament-spin"
      style={{
        filter:
          "drop-shadow(0 0 10px rgba(240, 194, 127, 0.5)) drop-shadow(0 0 3px rgba(212, 175, 55, 0.7))",
        animation: "ornament-spin 48s linear infinite",
        willChange: "transform",
        transformOrigin: "center",
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

// Re-export the logo asset so callers can use it for CTA emblems
// without importing from the asset path directly.
export { igniteLogo };
