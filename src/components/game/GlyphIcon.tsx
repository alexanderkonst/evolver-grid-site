/**
 * GlyphIcon — a single typographic glyph rendered in Cormorant Garamond
 * with a subtle neon glow, used in place of lucide icons in the spaces rail.
 *
 * Matches the brand aesthetic of the 7-step playbook ring — each space
 * gets its own glyph + color instead of a generic clipart icon.
 *
 * Drop-in replacement for `ReactNode` icon props. Sizes tuned to match
 * lucide's w-5 h-5 footprint.
 */

export type GlyphIconProps = {
  glyph: string;
  color: string; // hsl / hex / css color — drives text + glow
  size?: number;
};

// Default size bumped 2026-04-21 (Sasha): the space-rail icons felt too
// small at 20px. 28px reads as a real presence without overpowering the
// label next to it.
//
// Day 47 late pass (Sasha): glyphs were rendering slightly off-center. The
// previous `fontSize: size * 1.1` overflowed the size × size container and
// pushed some glyphs up/left depending on their intrinsic metrics. Now:
//   • fontSize tracks size exactly — no overflow
//   • lineHeight = size (explicit px instead of unitless 1) — avoids any
//     leading mismatch when Cormorant's line-height is > 1
//   • grid + place-items:center — strictly tighter than flex centering
//   • text-align center + letter-spacing 0 — removes any trailing space
//     that some glyphs pick up from the font's default tracking
const GlyphIcon = ({ glyph, color, size = 28 }: GlyphIconProps) => (
  <span
    aria-hidden="true"
    className="flex-shrink-0 select-none"
    style={{
      display: "grid",
      placeItems: "center",
      width: size,
      height: size,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: size,
      lineHeight: `${size}px`,
      fontWeight: 600,
      letterSpacing: 0,
      textAlign: "center",
      color,
      textShadow: `0 0 12px ${color}80, 0 0 3px ${color}66`,
    }}
  >
    {glyph}
  </span>
);

export default GlyphIcon;
