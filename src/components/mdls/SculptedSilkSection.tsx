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
          overflow: "visible",
          filter:
            `drop-shadow(3px 6px 14px hsl(${hue} ${satMid}% 50% / 0.20)) ` +
            `drop-shadow(1px 3px 5px hsl(${hue} ${satLight}% 55% / 0.10))`,
          pointerEvents: "none",
        }}
      >
        <defs>
          {/* Main drape gradient — light upper-left → deeper lower-right */}
          <linearGradient
            id={`${uid}-drape`}
            x1="14%"
            y1="11%"
            x2="86%"
            y2="89%"
          >
            <stop offset="0%"   stopColor={`hsl(${hue}, ${satLight}%, 86%)`} />
            <stop offset="38%"  stopColor={`hsl(${hue}, ${satMid}%,   78%)`} />
            <stop offset="70%"  stopColor={`hsl(${hue}, ${satDeep}%,  68%)`} />
            <stop offset="100%" stopColor={`hsl(${hue}, ${satDeep}%,  60%)`} />
          </linearGradient>
          {/* Upper-left specular — light catching the silk surface */}
          <radialGradient
            id={`${uid}-highlight`}
            cx="28%"
            cy="22%"
            r="55%"
          >
            <stop offset="0%"  stopColor={`hsl(${hue}, ${satLight + 12}%, 94%)`} stopOpacity="0.85" />
            <stop offset="22%" stopColor={`hsl(${hue}, ${satLight + 4}%,  88%)`} stopOpacity="0.45" />
            <stop offset="55%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* The silk shape — visible only inside the path. Two layers:
            (1) main drape gradient, (2) specular highlight on top. */}
        <path d={path} fill={`url(#${uid}-drape)`} />
        <path d={path} fill={`url(#${uid}-highlight)`} />
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
