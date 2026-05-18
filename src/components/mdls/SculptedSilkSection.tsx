import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Sculpted Silk Section
 *
 * §4.3 Materials Library. Soft-Sculptural register — organic curving form.
 * Used for workstream territories, section dividers, brand-backdrop atmospheres.
 *
 * Three blob variants (a/b/c) via border-radius asymmetry; pick to vary.
 */
interface SculptedSilkSectionProps {
  hue?: number;            // HSL hue 0–360 (e.g., 15 = rose, 195 = aqua)
  saturation?: number;     // HSL saturation %
  blobVariant?: "a" | "b" | "c";
  className?: string;
  children?: ReactNode;
}

export const SculptedSilkSection = ({
  hue = 15,
  saturation = 50,
  blobVariant = "a",
  className,
  children,
}: SculptedSilkSectionProps) => (
  <div
    className={cn(
      "mdls-sculpted-silk",
      `mdls-sculpted-silk--${blobVariant}`,
      "px-8 py-10",
      className,
    )}
    style={
      {
        "--mdls-silk-hue": hue,
        "--mdls-silk-sat": `${saturation}%`,
      } as CSSProperties
    }
  >
    {children}
  </div>
);

export default SculptedSilkSection;
