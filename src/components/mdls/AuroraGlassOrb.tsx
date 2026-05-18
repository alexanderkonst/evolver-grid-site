import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Aurora Glass Orb
 *
 * §4.1 Materials Library. Luminous-Cosmic register centerpiece.
 * The form is round; color enters from within (Principle 1).
 *
 * Use sparingly — reserved for hero / ritual / revelation moments.
 * In Equilibrium: Synthesis Reading centerpiece (ATTUNE mode hero).
 */
interface AuroraGlassOrbProps {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
  children?: ReactNode;
}

export const AuroraGlassOrb = ({
  size = 240,
  variant = "light",
  className,
  children,
}: AuroraGlassOrbProps) => (
  <div
    className={cn(
      "mdls-aurora-glass-orb",
      variant === "dark" && "mdls-aurora-glass-orb--dark",
      "flex items-center justify-center mx-auto",
      className,
    )}
    style={{ width: size, height: size }}
    aria-hidden={children ? undefined : true}
  >
    {children && (
      <div className="text-center px-4 relative z-10">{children}</div>
    )}
  </div>
);

export default AuroraGlassOrb;
