/**
 * SpaceGlyphs — custom geometric line-glyph family for the rail, replacing
 * the Lucide/typographic glyphs on BUILT BY YOU and COLLABORATE.
 *
 * Day 130 (Sasha 2026-07-20): "ugly and cliparty" icons swapped for a
 * single construction language shared with the brand's canonical geometry
 * (octahedron inscribed in a sphere — see src/pages/AlexanderProfile.tsx).
 * All three glyphs share: 24x24 viewBox, stroke="currentColor",
 * strokeWidth 1.5, fill none, round linecaps — same stroke weight and
 * optical size so they read as siblings, not one-offs.
 */

export type SpaceGlyphProps = {
  className?: string;
  size?: number;
  color?: string;
};

const commonSvgProps = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** BUILD (BUILT BY YOU) — the octahedron itself: a 45°-rotated square
 * (diamond) with vertical + horizontal lines through center connecting
 * its vertices. This is the brand solid, load-bearing. */
export const BuildGlyph = ({ className, size = 24, color }: SpaceGlyphProps) => (
  <svg
    {...commonSvgProps}
    width={size}
    height={size}
    className={className}
    style={color ? { color } : undefined}
    aria-hidden="true"
  >
    {/* bounding sphere, faint — ties back to the canonical construction */}
    <circle cx="12" cy="12" r="10.5" opacity={0.3} />
    {/* diamond (45°-rotated square) — top/right/bottom/left vertices */}
    <path d="M12 3 L21 12 L12 21 L3 12 Z" />
    {/* vertical + horizontal diagonals through center — the octahedron's
        hidden edges, suggesting the 3D solid inscribed in the sphere */}
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

/** COLLABORATE — vesica piscis: two overlapping circles with a small
 * diamond at the intersection center. Two spheres meeting, the shared
 * lens between them. */
export const CollaborateGlyph = ({ className, size = 24, color }: SpaceGlyphProps) => (
  <svg
    {...commonSvgProps}
    width={size}
    height={size}
    className={className}
    style={color ? { color } : undefined}
    aria-hidden="true"
  >
    <circle cx="8.5" cy="12" r="7" />
    <circle cx="15.5" cy="12" r="7" />
    {/* small diamond marking the shared lens center */}
    <path d="M12 9.5 L14.5 12 L12 14.5 L9.5 12 Z" />
  </svg>
);
