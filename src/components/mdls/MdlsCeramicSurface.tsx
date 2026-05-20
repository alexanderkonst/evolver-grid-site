import { useId, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Ceramic Surface
 *
 * The matte-ceramic register Sasha called out as "we haven't touched yet."
 * Replaces the flat `mdls-tactile-ceramic` CSS class with a multi-layer
 * SVG-turbulence-grained substrate that reads as fired clay, not painted
 * cardboard.
 *
 * What makes it "ceramic" and not "paint":
 *   1. SVG turbulence noise layer — adds the micro-grain that real glazed
 *      ceramic has. Without this, any cream surface reads as paper/paint.
 *   2. Inset AO ring around the edges — simulates ambient occlusion where
 *      the ceramic body's lip meets the world. Gives it volumetric weight.
 *   3. Subtle warm-cool gradient bleed (not the usual cool→warm fade,
 *      but warm→cool→warm to suggest a curved surface catching ambient
 *      light from three directions).
 *   4. Optional ember under-glow — same coral register as Matte-Polymer's
 *     EmberBreath but slower, deeper. For "sacred-object containers".
 *
 * v1.0 — 2026-05-19 evening — Wave 6 fidelity pass.
 */
interface MdlsCeramicSurfaceProps {
  /** Tonality of the clay. */
  tone?: "warm-cream" | "stone-cool" | "sand-warm" | "ash-grey";
  /** Add a subtle ember under-glow (sacred-object register). Default false. */
  ember?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const TONES: Record<NonNullable<MdlsCeramicSurfaceProps["tone"]>, {
  base: string;
  warm: string;
  cool: string;
  edge: string;
}> = {
  "warm-cream": {
    base: "hsl(36 32% 90%)",
    warm: "hsl(28 36% 88%)",
    cool: "hsl(34 24% 86%)",
    edge: "hsl(28 25% 70%)",
  },
  "stone-cool": {
    base: "hsl(210 12% 86%)",
    warm: "hsl(34 16% 86%)",
    cool: "hsl(216 18% 84%)",
    edge: "hsl(214 14% 64%)",
  },
  "sand-warm": {
    base: "hsl(32 38% 84%)",
    warm: "hsl(28 44% 82%)",
    cool: "hsl(40 30% 86%)",
    edge: "hsl(28 30% 62%)",
  },
  "ash-grey": {
    base: "hsl(34 8% 82%)",
    warm: "hsl(28 12% 80%)",
    cool: "hsl(220 8% 80%)",
    edge: "hsl(28 6% 58%)",
  },
};

export const MdlsCeramicSurface = ({
  tone = "warm-cream",
  ember = false,
  className,
  style,
  children,
}: MdlsCeramicSurfaceProps) => {
  const rawId = useId();
  const uid = `mdls-ceramic-${rawId.replace(/:/g, "")}`;
  const palette = TONES[tone];

  return (
    <div
      className={cn("relative", className)}
      style={{
        position: "relative",
        borderRadius: 28,
        overflow: "hidden",
        // Base substrate — warm→cool→warm tri-gradient suggests volume.
        background: `
          radial-gradient(ellipse at 28% 22%, ${palette.warm} 0%, transparent 55%),
          radial-gradient(ellipse at 72% 78%, ${palette.cool} 0%, transparent 60%),
          linear-gradient(145deg, ${palette.base} 0%, ${palette.cool} 100%)
        `,
        // Single light-source discipline: upper-left highlight + lower-right
        // shadow. Multi-stop shadow tree for ceramic weight (NOT plastic).
        boxShadow: [
          "inset 0 1px 0 rgba(255, 255, 255, 0.55)",       // top inner highlight
          `inset 0 -1px 0 ${palette.edge}40`,                // bottom inner edge (AO sim)
          `inset 1px 0 0 ${palette.edge}25`,                 // left inner edge
          `inset -1px 0 0 ${palette.edge}25`,                // right inner edge
          "0 1px 2px rgba(166, 142, 110, 0.08)",             // contact shadow tight
          "0 8px 24px rgba(166, 142, 110, 0.12)",            // ambient drop shadow
        ].join(", "),
        ...style,
      }}
    >
      {/* SVG turbulence grain — this is the "ceramic, not paint" layer.
          Renders as a static noise pattern at low opacity over the substrate.
          The micro-grain catches light differently across the surface so
          it stops reading as a flat-color div. */}
      <svg
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "overlay",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      >
        <defs>
          <filter id={`${uid}-grain`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.92"
              numOctaves="2"
              seed="7"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.55
                      0 0 0 0 0.42
                      0 0 0 0 0.28
                      0 0 0 0.6 0"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${uid}-grain)`} />
      </svg>

      {ember && (
        // Optional ember — sacred-object register. Slower, deeper coral
        // glow than EmberBreath. For containers holding mantra or seal.
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 30% 78%, hsl(15 88% 60% / 0.16) 0%, transparent 65%)",
            pointerEvents: "none",
            mixBlendMode: "soft-light",
          }}
        />
      )}

      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default MdlsCeramicSurface;
