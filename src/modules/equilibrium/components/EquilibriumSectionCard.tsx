import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section card for the Biologic Watch page.
 *
 * Wraps each of the 11 sections with the canonical Apple iOS 26 "Liquid Glass"
 * treatment (per docs/03-playbooks/glassmorphism_blueprint.md) — backdrop-blur
 * + saturate boost + asymmetric edge lighting + two-layer drop shadow.
 *
 * Also fixes the anchor-link issue from Roast Gate 1: this wrapper forwards
 * the `id` prop to the DOM so `/build/equilibrium#workstreams` works.
 *
 * Replaces the earlier `<PremiumCard>` usage which was too opaque (85%
 * white tint vs. the blueprint's 10-18%) and missing the edge lighting +
 * two-layer shadow that makes the glass *float*.
 */
interface EquilibriumSectionCardProps {
  id?: string;
  emphasized?: boolean;
  children: ReactNode;
  className?: string;
}

export const EquilibriumSectionCard = ({
  id,
  emphasized,
  children,
  className,
}: EquilibriumSectionCardProps) => (
  <section
    id={id}
    className={cn(
      emphasized ? "liquid-glass-strong" : "liquid-glass",
      "rounded-3xl p-6 sm:p-8 scroll-mt-24 transition-all duration-300",
      className,
    )}
  >
    {children}
  </section>
);

export default EquilibriumSectionCard;
