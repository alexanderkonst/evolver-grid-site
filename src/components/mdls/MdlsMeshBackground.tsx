import { type CSSProperties } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

/**
 * MDLS · Mesh Background
 *
 * WebGL mesh-gradient atmosphere primitive. Replaces the hand-rolled CSS
 * `.mdls-page-atmosphere` (flat linear gradients) with a hardware-accelerated
 * fragment shader running organic noise distortion + swirl over up to 4
 * color stops.
 *
 * Why this is the octave shift: flat CSS gradients render as banded planes;
 * mesh gradients render as living, breathing color volumes — the difference
 * between a painted backdrop and atmospheric depth.
 *
 * Library: @paper-design/shaders-react (MIT, open source)
 *
 * Four registers map to four palette signatures:
 *   - luminous   : warm aurora — gold, ember, coral, deep-violet specular
 *   - restrained : cream-paper-cool-stone — daily-UI calm
 *   - sculptural : silk peach, sky blue, sage green, ochre — organic-soft
 *   - ascetic    : near-monochrome cream + faint coral whisper
 *
 * v1.0 — 2026-05-19 — Wave 1 of the MDLS octave shift.
 */
interface MdlsMeshBackgroundProps {
  register?: "luminous" | "restrained" | "sculptural" | "ascetic";
  /** Power of organic noise distortion (0–1). Default 0.6. */
  distortion?: number;
  /** Power of vortex distortion (0–1). Default 0.15. */
  swirl?: number;
  /** Animation speed multiplier. Default 0.25 (slow drift). 0 = static. */
  speed?: number;
  /** Post-processing grain overlay (0–1). Default 0.08 (paper texture). */
  grain?: number;
  className?: string;
  style?: CSSProperties;
}

const PALETTES: Record<NonNullable<MdlsMeshBackgroundProps["register"]>, string[]> = {
  // Warm aurora — gold catching light, coral ember, deep-violet specular, sage rest.
  // Maps to /mdls-preview hero, /build/equilibrium hero — the "felt" sacred register.
  luminous: ["#f4d472", "#f8a572", "#c47fb3", "#7a99b8"],
  // Cream paper · cool stone · warm dust — restrained daily UI.
  restrained: ["#f3ead8", "#e6dcc4", "#d4cebc", "#c4b9a4"],
  // Silk peach · sky · sage · ochre — organic territories + workstreams.
  sculptural: ["#f6c89e", "#a6c7e0", "#b8c89d", "#d4a874"],
  // Near-monochrome cream + faintest coral whisper — contemplative pause.
  ascetic: ["#f3ead8", "#ecdfc7", "#e6d4b8", "#d8b89e"],
};

export const MdlsMeshBackground = ({
  register = "luminous",
  distortion = 0.6,
  swirl = 0.15,
  speed = 0.25,
  grain = 0.08,
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
        style={{ width: "100%", height: "100%" }}
      />
      {/* Soft inner-edge vignette to tie the shader into the page chrome.
          Without this, the mesh edges read as "a video playing", with it,
          they read as "atmospheric depth bleeding off-screen". */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(243, 234, 216, 0.35) 100%)",
        }}
      />
    </div>
  );
};

export default MdlsMeshBackground;
