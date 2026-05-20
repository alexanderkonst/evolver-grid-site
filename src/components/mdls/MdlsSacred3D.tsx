import { lazy, Suspense } from "react";
import { type MotionValue } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * MDLS · Sacred 3D — Lightweight wrapper (Wave 10)
 *
 * Original heavy R3F implementation lives in MdlsSacred3DImpl.tsx.
 * That impl pulls in three.js / @react-three/fiber / drei /
 * postprocessing — ~500KB before gzip. We code-split it via React.lazy
 * so it loads AFTER first paint instead of blocking it.
 *
 * Mobile (<768px) gets a static SVG dodecahedron fallback — no R3F
 * runtime, no Canvas, no GPU shader work. Saves ~500KB on mobile load
 * and preserves the form's visual register without the perf cost.
 *
 * Existing consumers import this file by name; the wrapper preserves
 * the original API so no caller changes needed.
 *
 * v3.0 — 2026-05-19 — Wave 10 bundle + mobile pass.
 */

const MdlsSacred3DImpl = lazy(() => import("./MdlsSacred3DImpl"));

interface MdlsSacred3DProps {
  size?: number;
  hue?: "warm" | "cool" | "neutral";
  static?: boolean;
  cameraOffsetY?: MotionValue<number>;
}

const HUE_COLORS: Record<NonNullable<MdlsSacred3DProps["hue"]>, {
  light: string;
  mid: string;
  dark: string;
  highlight: string;
}> = {
  warm: {
    light: "#f4d493",
    mid: "#dca660",
    dark: "#a66832",
    highlight: "#fff0d0",
  },
  cool: {
    light: "#c2d4e8",
    mid: "#8ca8c8",
    dark: "#5878a0",
    highlight: "#e8f0fa",
  },
  neutral: {
    light: "#e8e0d2",
    mid: "#c4b9a4",
    dark: "#8a7c66",
    highlight: "#faf4e8",
  },
};

/**
 * Static SVG dodecahedron — mobile fallback. Hand-drawn pentagonal-face
 * projection with 3-tone shading suggesting the warm-clay material
 * register. Cheap to render (pure SVG paths, no JS, no shader).
 */
const StaticDodecahedron = ({ size, hue }: { size: number; hue: NonNullable<MdlsSacred3DProps["hue"]> }) => {
  const c = HUE_COLORS[hue];
  return (
    <div style={{ width: size, height: size, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        aria-hidden="true"
        style={{ filter: `drop-shadow(2px 6px 12px ${c.dark}40)` }}
      >
        <defs>
          <linearGradient id="sd-face-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.highlight} />
            <stop offset="100%" stopColor={c.light} />
          </linearGradient>
          <linearGradient id="sd-face-mid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.light} />
            <stop offset="100%" stopColor={c.mid} />
          </linearGradient>
          <linearGradient id="sd-face-side" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.mid} />
            <stop offset="100%" stopColor={c.dark} />
          </linearGradient>
        </defs>
        {/* Top pentagon — brightest face catches UL light */}
        <polygon
          points="100,30 138,52 124,98 76,98 62,52"
          fill="url(#sd-face-top)"
          stroke={c.dark}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        {/* Right face */}
        <polygon
          points="138,52 168,94 150,148 124,98"
          fill="url(#sd-face-mid)"
          stroke={c.dark}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        {/* Left face — in shadow */}
        <polygon
          points="62,52 32,94 50,148 76,98"
          fill="url(#sd-face-side)"
          stroke={c.dark}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        {/* Bottom-right face */}
        <polygon
          points="124,98 150,148 100,170 75,148 76,98"
          fill="url(#sd-face-mid)"
          stroke={c.dark}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
        {/* Bottom-left face — deeper shadow */}
        <polygon
          points="76,98 75,148 100,170 50,148"
          fill="url(#sd-face-side)"
          stroke={c.dark}
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
      </svg>
    </div>
  );
};

export const MdlsSacred3D = (props: MdlsSacred3DProps) => {
  const isMobile = useIsMobile();
  const { size = 240, hue = "warm" } = props;

  if (isMobile) {
    return <StaticDodecahedron size={size} hue={hue} />;
  }

  return (
    <Suspense
      fallback={
        // Reserve space while the chunk loads — same size, transparent.
        // Avoids layout shift; user sees nothing then the canvas appears.
        <div style={{ width: size, height: size }} />
      }
    >
      <MdlsSacred3DImpl {...props} />
    </Suspense>
  );
};

export default MdlsSacred3D;
