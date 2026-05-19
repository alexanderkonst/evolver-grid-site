/**
 * MDLS · Clip-Path Definitions
 *
 * Inline SVG with three <clipPath> definitions for the sculpted-silk
 * blob variants (a / b / c). Uses `clipPathUnits="objectBoundingBox"`
 * so the path coordinates are 0-1 fractional values that scale to
 * whatever element references them via `clip-path: url(#mdls-silk-blob-X)`.
 *
 * Render this component ONCE per page that uses sculpted-silk blobs.
 * The wrapping <svg> is hidden via width=0 height=0 + absolute positioning;
 * it exists only to host the clip-path defs in the document tree.
 *
 * Why this over mask-image data URIs:
 *   - data: URI mask-images failed silently in real browser screenshots
 *     (Safari + Chrome both showed rectangular elements despite the CSS)
 *   - clip-path + inline-SVG <clipPath> is broadly supported (Caniuse:
 *     all modern browsers ≥ 2019) and works reliably at any aspect ratio
 *   - The paths can be edited as readable SVG instead of URL-encoded gunk
 */
export const MdlsClipPathDefs = () => (
  <svg
    width="0"
    height="0"
    aria-hidden="true"
    style={{
      position: "absolute",
      width: 0,
      height: 0,
      overflow: "hidden",
      pointerEvents: "none",
    }}
  >
    <defs>
      {/* Blob A — asymmetric, slight tilt toward upper-left mass */}
      <clipPath id="mdls-silk-blob-a" clipPathUnits="objectBoundingBox">
        <path d="M 0.50,0.04 C 0.78,0.02 0.96,0.20 0.97,0.46 C 0.98,0.74 0.82,0.94 0.55,0.97 C 0.26,1.00 0.04,0.86 0.03,0.56 C 0.02,0.26 0.22,0.06 0.50,0.04 Z" />
      </clipPath>

      {/* Blob B — slightly taller, mass shifted lower-left */}
      <clipPath id="mdls-silk-blob-b" clipPathUnits="objectBoundingBox">
        <path d="M 0.48,0.03 C 0.78,0.05 0.96,0.28 0.96,0.55 C 0.96,0.83 0.76,0.98 0.46,0.97 C 0.16,0.96 0.04,0.74 0.04,0.46 C 0.04,0.22 0.20,0.02 0.48,0.03 Z" />
      </clipPath>

      {/* Blob C — wider at bottom, mass shifted upper-right */}
      <clipPath id="mdls-silk-blob-c" clipPathUnits="objectBoundingBox">
        <path d="M 0.52,0.05 C 0.82,0.03 0.98,0.24 0.97,0.52 C 0.96,0.82 0.74,0.97 0.46,0.97 C 0.18,0.97 0.03,0.76 0.04,0.46 C 0.05,0.20 0.24,0.07 0.52,0.05 Z" />
      </clipPath>
    </defs>
  </svg>
);

export default MdlsClipPathDefs;
