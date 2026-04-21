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

const GlyphIcon = ({ glyph, color, size = 20 }: GlyphIconProps) => (
  <span
    aria-hidden="true"
    className="inline-flex items-center justify-center flex-shrink-0 select-none"
    style={{
      width: size,
      height: size,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: Math.round(size * 1.05),
      fontWeight: 600,
      lineHeight: 1,
      color,
      textShadow: `0 0 10px ${color}66, 0 0 2px ${color}55`,
    }}
  >
    {glyph}
  </span>
);

export default GlyphIcon;
