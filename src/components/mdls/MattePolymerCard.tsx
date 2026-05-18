import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Matte Polymer Card
 *
 * §4.2 Materials Library. Soft matte daily-UI card. Replaces .liquid-glass
 * for MDLS-enabled surfaces. Composes with <EmberBreath> for active-state
 * under-glow.
 *
 * Substrate-consistent: card surface stays cream-soft; coral never fills.
 * Active markers are halo glows or surrounding ember-breath.
 */
interface MattePolymerCardProps {
  id?: string;
  active?: boolean;
  emphasized?: boolean;
  variant?: "light" | "dark";
  className?: string;
  children: ReactNode;
}

export const MattePolymerCard = ({
  id,
  active = false,
  emphasized = false,
  variant = "light",
  className,
  children,
}: MattePolymerCardProps) => (
  <section
    id={id}
    data-active={active ? "true" : undefined}
    className={cn(
      "mdls-matte-polymer",
      variant === "dark" && "mdls-matte-polymer--dark",
      emphasized && "mdls-matte-polymer--emphasized",
      "p-6 sm:p-8 scroll-mt-24 transition-shadow duration-300",
      className,
    )}
  >
    {children}
  </section>
);

export default MattePolymerCard;
