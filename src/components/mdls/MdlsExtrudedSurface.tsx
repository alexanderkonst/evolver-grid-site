import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Extruded Surface (Neumorphism, MDLS-tuned)
 *
 * Soft-extruded plastic surface — the "new morphism" Sasha called out as
 * missing from the matte-only library. Classic neumorphism uses dual-shadow
 * (light upper-left + dark lower-right) to make the surface read as either
 * RAISED from the page or PRESSED into it.
 *
 * MDLS departures from default neumorphism:
 *   - Warm cream substrate (not the cold neutral-100 default)
 *   - Single light source (upper-left) maintained — consistent with our
 *     light-source discipline
 *   - Lower coral accent option for active state (instead of generic blue)
 *   - Multi-layer shadow for premium depth (3 stops instead of standard 2)
 *
 * Variants:
 *   raised   — extrudes upward from the page (resting state)
 *   pressed  — sunken inward (active / selected / "pressed" UI control)
 *   floating — extruded more aggressively, for hero artifacts
 *
 * v1.0 — 2026-05-19 — Wave 2 of the MDLS octave shift.
 */
interface MdlsExtrudedSurfaceProps {
  variant?: "raised" | "pressed" | "floating";
  /** Apply coral active-state under-glow. Default false. */
  active?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const SHADOWS: Record<NonNullable<MdlsExtrudedSurfaceProps["variant"]>, string> = {
  // Raised: light from upper-left, shadow below-right. Soft, daily-UI feel.
  raised: [
    "-6px -6px 14px rgba(255, 250, 238, 0.95)",   // UL specular
    "6px 6px 18px rgba(166, 142, 110, 0.18)",      // LR shadow
    "inset 0 1px 0 rgba(255, 255, 255, 0.5)",      // top inner highlight
  ].join(", "),
  // Pressed: shadows INSIDE, light source still UL. Reads as "pushed in".
  pressed: [
    "inset 4px 4px 10px rgba(166, 142, 110, 0.22)",  // UL inset shadow
    "inset -4px -4px 10px rgba(255, 250, 238, 0.8)", // LR inset highlight
  ].join(", "),
  // Floating: more aggressive raise, used sparingly for hero pieces.
  floating: [
    "-10px -10px 24px rgba(255, 250, 238, 1)",     // UL specular
    "12px 14px 32px rgba(166, 142, 110, 0.22)",    // LR shadow (deeper)
    "4px 6px 14px rgba(166, 142, 110, 0.12)",      // mid shadow
    "inset 0 1px 0 rgba(255, 255, 255, 0.6)",      // top inner highlight
  ].join(", "),
};

export const MdlsExtrudedSurface = ({
  variant = "raised",
  active = false,
  className,
  style,
  children,
}: MdlsExtrudedSurfaceProps) => {
  return (
    <div
      className={cn("relative", className)}
      style={{
        background:
          "linear-gradient(145deg, hsl(38 42% 95%) 0%, hsl(34 36% 91%) 100%)",
        borderRadius: 24,
        padding: 24,
        boxShadow: SHADOWS[variant],
        transition: "box-shadow 320ms cubic-bezier(0.4, 0, 0.2, 1)",
        ...style,
      }}
    >
      {active && (
        // Coral ember under-glow for active state. Sits ABOVE the shadow
        // but BELOW the content. Subtle warm halo, not a fill.
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: 28,
            background:
              "radial-gradient(ellipse at 30% 80%, hsl(15 88% 60% / 0.18) 0%, transparent 60%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      )}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

export default MdlsExtrudedSurface;
