import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Sculpted Silk Section
 *
 * §4.3 Materials Library. Soft-Sculptural register — organic curving form.
 * Used for workstream territories, section dividers, brand-backdrop atmospheres.
 *
 * v1.7 (2026-05-18) — REWRITTEN to render the blob shape as an actual
 * SVG <path> element instead of clipping a div. Prior approaches:
 *   - v1.1: border-radius percentages (flattened at wide aspect ratios)
 *   - v1.3: -webkit-mask-image data URI (silently failed cross-browser)
 *   - v1.5: clip-path url() referencing inline <clipPath> defs (failed
 *           in Lovable preview environment — blobs still rendered as
 *           rectangles in screenshots)
 *
 * The new approach: the visible silk IS the SVG path. Gradients
 * (linearGradient for drape + radialGradient for upper-left specular)
 * are defined inside the same SVG via <defs>, so the fill works without
 * any cross-element references. Drop-shadow via SVG `filter` attribute
 * on the outer svg element keeps shadow direction consistent.
 *
 * Three blob variants (a/b/c) — hand-crafted asymmetric organic paths
 * in a 200x200 viewBox with preserveAspectRatio="none" so the shape
 * stretches to fill any container aspect ratio.
 */
interface SculptedSilkSectionProps {
  hue?: number;            // HSL hue 0–360
  saturation?: number;     // HSL saturation % (default 42 — pastel mid-range)
  blobVariant?: "a" | "b" | "c";
  className?: string;
  /** Additional inline styles. Layout container; SVG fills it. */
  style?: CSSProperties;
  children?: ReactNode;
}

const BLOB_PATHS: Record<"a" | "b" | "c", string> = {
  // Asymmetric organic forms in 200x200 viewBox. Tested visually so each
  // path produces a clearly-blob shape (not a rounded rectangle).
  a: "M 100,8 C 156,4 192,40 194,92 C 196,148 164,188 110,194 C 52,200 10,172 6,108 C 2,52 44,12 100,8 Z",
  b: "M 96,6 C 156,10 192,56 192,110 C 192,166 152,194 92,192 C 32,190 6,148 8,92 C 10,42 36,2 96,6 Z",
  c: "M 104,10 C 164,6 198,46 194,104 C 190,164 148,196 92,194 C 34,192 4,152 8,90 C 12,38 48,14 104,10 Z",
};

export const SculptedSilkSection = ({
  hue = 15,
  saturation = 42,
  blobVariant = "a",
  className,
  style,
  children,
}: SculptedSilkSectionProps) => {
  // useId gives a unique-per-instance string. Strip colons (which appear
  // in React's id format) so the URL reference in fill="url(#...)" works.
  const rawId = useId();
  const uid = `mdls-silk-${rawId.replace(/:/g, "")}`;
  const path = BLOB_PATHS[blobVariant];

  // Saturation tier — keep within pastel range (38-48%) per v1.5 mockup match
  const satMid = saturation;
  const satLight = Math.max(20, saturation - 8);
  const satDeep = Math.min(60, saturation + 8);

  return (
    <div
      className={cn("relative", className)}
      style={style}
    >
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          // Wave 6 (Day 74 evening): was overflow:visible — the drop-shadow
          // filter was bleeding past the SVG bounds and rendering ghost
          // blobs below adjacent material entries. Tight overflow keeps
          // the shadow inside the SVG box, even at the cost of slightly
          // less feathered edges.
          overflow: "hidden",
          filter:
            `drop-shadow(2px 4px 8px hsl(${hue} ${satMid}% 50% / 0.15)) ` +
            `drop-shadow(1px 2px 3px hsl(${hue} ${satLight}% 55% / 0.08))`,
          pointerEvents: "none",
        }}
      >
        <defs>
          {/* Wave 7 (Day 74 evening): silk-shimmer multi-stop gradients.
              v1.7 used 1 linearGradient + 1 radialGradient = 2 light
              sources, reads as "matte fabric blob." v2.0 (this) uses 1
              linear + 3 radials at calibrated positions = 4 light sources,
              reads as "silk catching light from multiple directions" —
              the same texture quality as a WebGL mesh shader, achieved
              in pure SVG. Same drop-shadow contained per Wave 6 fix. */}

          {/* (1) Main drape — light upper-left → deeper lower-right.
              6-stop instead of 4 for smoother volume falloff. */}
          <linearGradient
            id={`${uid}-drape`}
            x1="14%"
            y1="11%"
            x2="86%"
            y2="89%"
          >
            <stop offset="0%"   stopColor={`hsl(${hue}, ${satLight}%, 88%)`} />
            <stop offset="22%"  stopColor={`hsl(${hue}, ${satMid}%,   82%)`} />
            <stop offset="48%"  stopColor={`hsl(${hue}, ${satMid}%,   75%)`} />
            <stop offset="70%"  stopColor={`hsl(${hue}, ${satDeep}%,  68%)`} />
            <stop offset="88%"  stopColor={`hsl(${hue}, ${satDeep}%,  62%)`} />
            <stop offset="100%" stopColor={`hsl(${hue}, ${satDeep}%,  58%)`} />
          </linearGradient>

          {/* (2) Upper-left specular — the primary light source highlight. */}
          <radialGradient id={`${uid}-highlight1`} cx="28%" cy="22%" r="42%">
            <stop offset="0%"  stopColor={`hsl(${hue}, ${satLight + 14}%, 96%)`} stopOpacity="0.9" />
            <stop offset="35%" stopColor={`hsl(${hue}, ${satLight + 6}%,  90%)`} stopOpacity="0.4" />
            <stop offset="70%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* (3) Right-mid sub-highlight — secondary catch, simulates how
              silk's fibers reflect light at oblique angles. Different hue
              shift (+12°) for the "silk iridescence" effect. */}
          <radialGradient id={`${uid}-highlight2`} cx="72%" cy="45%" r="28%">
            <stop offset="0%"  stopColor={`hsl(${(hue + 12) % 360}, ${satLight + 8}%, 88%)`} stopOpacity="0.4" />
            <stop offset="50%" stopColor={`hsl(${hue}, ${satMid}%,  80%)`} stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* (4) Lower-left ambient bounce — soft fill from the surface
              the silk sits on. Cooler tone (hue -8°) for atmospheric
              perspective. */}
          <radialGradient id={`${uid}-bounce`} cx="22%" cy="78%" r="38%">
            <stop offset="0%"  stopColor={`hsl(${(hue + 348) % 360}, ${satMid}%, 78%)`} stopOpacity="0.35" />
            <stop offset="60%" stopColor={`hsl(${hue}, ${satMid}%, 72%)`} stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          {/* (5) Deep crease shadow — lower-right, the silk's deepest fold.
              Pure darken layer, multiplies the drape darks for depth. */}
          <radialGradient id={`${uid}-crease`} cx="82%" cy="82%" r="32%">
            <stop offset="0%"  stopColor={`hsl(${hue}, ${satDeep}%, 42%)`} stopOpacity="0.35" />
            <stop offset="60%" stopColor={`hsl(${hue}, ${satDeep}%, 50%)`} stopOpacity="0.10" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Stack 5 fills on the same path — order matters: drape base
            first (opaque), then crease/shadow (darkens), then the two
            highlights, then the bounce. Result is a silk that reads as
            having THICKNESS and FOLD STRUCTURE, not just a colored shape. */}
        <path d={path} fill={`url(#${uid}-drape)`} />
        <path d={path} fill={`url(#${uid}-crease)`} />
        <path d={path} fill={`url(#${uid}-highlight2)`} />
        <path d={path} fill={`url(#${uid}-highlight1)`} />
        <path d={path} fill={`url(#${uid}-bounce)`} />
      </svg>
      {/* Children render above the SVG (children layout uses normal flow
          on the wrapping div; the SVG is absolutely positioned underneath). */}
      <div className="relative h-full flex items-center w-full" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default SculptedSilkSection;
