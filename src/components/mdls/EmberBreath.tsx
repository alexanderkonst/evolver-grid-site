import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Ember Breath
 *
 * §7 Motion sub-primitive: backlit warm-amber pulse from BELOW the surface.
 * Crosses Motion × Light — the active-state signature for MDLS surfaces.
 *
 * Wraps a child element (typically a <MattePolymerCard>) and adds a slow
 * 6-second breathing under-glow when `active`. Disabled / reduced via
 * `prefers-reduced-motion`.
 *
 * In Equilibrium: applied to the foregrounded card per mode:
 *   ATTUNE → Synthesis Reading
 *   ACT    → DO NOW
 */
interface EmberBreathProps {
  active?: boolean;
  intensity?: "subtle" | "standard";
  className?: string;
  children: ReactNode;
}

export const EmberBreath = ({
  active = true,
  intensity = "standard",
  className,
  children,
}: EmberBreathProps) => (
  <div
    className={cn(
      "mdls-ember-breath",
      !active && "mdls-ember-breath--off",
      intensity === "subtle" && "opacity-90",
      className,
    )}
  >
    {children}
  </div>
);

export default EmberBreath;
