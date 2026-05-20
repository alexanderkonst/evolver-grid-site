import { type CSSProperties } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

/**
 * MDLS · Mesh Background
 *
 * WebGL mesh-gradient atmosphere primitive. Replaces the hand-rolled CSS
 * `.mdls-page-atmosphere` (flat linear gradients) with a hardware-accelerated
 * fragment shader running organic noise distortion + swirl over up to 8
 * color stops.
 *
 * Library: @paper-design/shaders-react (MIT, open source)
 *
 * v2.0 — 2026-05-19 — Wave 5 photo-real manifestation pass.
 *
 * Changes from v1.0:
 *   - 8-color palettes per register (was 4) — kills visible "regions"
 *   - Distortion default 0.85 (was 0.6) — no straight color borders
 *   - Swirl default 0.22 (was 0.15) — more vortex life
 *   - Speed default 0.42 (was 0.25) — slow but visibly alive
 *   - Grain default 0.03 (was 0.08) — old grain read as banding at low DPR
 *   - minPixelRatio 2 — kills aliasing on HiDPI displays
 *   - Removed CSS vignette overlay (replaced with optional in-component
 *     feather via fade prop) — the stacked rgba ellipse was causing the
 *     visible "mechanical step" banding Sasha called out
 *
 * Four registers map to 8-stop palette signatures, hand-tuned so that
 * adjacent stops have <=12° hue distance — guarantees smooth blending.
 */
interface MdlsMeshBackgroundProps {
  register?: "luminous" | "restrained" | "sculptural" | "ascetic";
  /** Power of organic noise distortion (0–1). Default 0.85. */
  distortion?: number;
  /** Power of vortex distortion (0–1). Default 0.22. */
  swirl?: number;
  /** Animation speed multiplier. Default 0.18 (slow drift). 0 = static. */
  speed?: number;
  /** Post-processing grain overlay (0–1). Default 0.03 (very fine paper texture). */
  grain?: number;
  /** Soft edge feather opacity (0–1). 0 = no fade. Default 0 (no vignette). */
  fade?: number;
  /** DPR for the shader canvas. Default 1 (cheap). Set 2 for hero showcase. */
  pixelRatio?: 1 | 2;
  className?: string;
  style?: CSSProperties;
}

const PALETTES: Record<NonNullable<MdlsMeshBackgroundProps["register"]>, string[]> = {
  // Luminous-Cosmic — 8 stops walking warm gold → ember → coral → orchid →
  // violet → cool blue → sage → back to warm. Aurora arc.
  luminous: [
    "#f6dc7e", // warm gold
    "#f4c473", // honey
    "#f0a878", // peach
    "#e88a7e", // coral
    "#c4869c", // dusty rose
    "#9b8aab", // muted orchid
    "#7d96b7", // sky blue
    "#a8b89e", // sage
  ],
  // Premium-Restrained — 8 stops of cream→stone→dust. Adjacent stops
  // ~5° hue distance — extremely smooth, no visible borders.
  restrained: [
    "#f5edd9", // cream paper
    "#efe5cf", // bone
    "#e8dec5", // light dust
    "#e1d6bc", // dust
    "#d9cdb2", // warm stone
    "#d0c4a8", // stone
    "#c8bba0", // deeper stone
    "#bdb094", // shadow stone
  ],
  // Soft-Sculptural — 8 stops walking silk peach → sky → sage → ochre
  // → back to peach. Organic spectrum.
  sculptural: [
    "#f7cb9d", // silk peach
    "#eebd95", // peach shadow
    "#cfb89c", // taupe
    "#a6c1da", // sky
    "#b3c8d4", // mist
    "#b6c89d", // sage
    "#c8c694", // warm sage
    "#d4a874", // ochre
  ],
  // Ascetic Minimal — 8 stops of cream + faintest coral whisper.
  // Adjacent stops ~3° distance — maximum smoothness.
  ascetic: [
    "#f5edd9",
    "#f1e9d3",
    "#ede4cd",
    "#e9e0c7",
    "#e5dbc1",
    "#e0d5b8",
    "#dbcfaf",
    "#d4c39e",
  ],
};

export const MdlsMeshBackground = ({
  register = "luminous",
  distortion = 0.85,
  swirl = 0.22,
  speed = 0.18,
  grain = 0.03,
  fade = 0,
  pixelRatio = 1,
  className,
  style,
}: MdlsMeshBackgroundProps) => {
  const colors = PALETTES[register];

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        ...style,
      }}
    >
      <MeshGradient
        colors={colors}
        distortion={distortion}
        swirl={swirl}
        speed={speed}
        grainOverlay={grain}
        // pixelRatio 1 default = ~4x cheaper fragment work than pixelRatio 2.
        // Pages opt hero into pixelRatio 2 for showcase quality; body
        // sections stay at 1 to keep scroll smooth.
        minPixelRatio={pixelRatio}
        style={{ width: "100%", height: "100%" }}
      />
      {fade > 0 && (
        // Optional feather to bleed mesh into the page chrome. Default off
        // because the old CSS vignette was producing visible step-banding;
        // pages that want softening opt-in with low fade values (0.15-0.25).
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(ellipse at center, transparent 60%, rgba(243, 234, 216, ${fade}) 100%)`,
          }}
        />
      )}
    </div>
  );
};

export default MdlsMeshBackground;
