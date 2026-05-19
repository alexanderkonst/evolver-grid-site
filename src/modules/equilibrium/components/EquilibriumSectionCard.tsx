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
  /**
   * Visual weight up — used for DO NOW (heaviest, glance-anchor) and
   * Synthesis Reading (the daily reading). Uses `liquid-glass-strong`.
   */
  emphasized?: boolean;
  /**
   * Visual weight down — used for the North Star sections at the
   * BOTTOM of ACT mode (Role, Lifelong Dedication). Smaller padding +
   * lighter glass treatment so they ground without dominating.
   * Phase D (Sasha 2026-05-18).
   */
  compact?: boolean;
  children: ReactNode;
  className?: string;
}

export const EquilibriumSectionCard = ({
  id,
  emphasized,
  compact,
  children,
  className,
}: EquilibriumSectionCardProps) => (
  <section
    id={id}
    className={cn(
      emphasized ? "liquid-glass-strong" : "liquid-glass",
      compact ? "rounded-2xl p-4 sm:p-5 opacity-90" : "rounded-3xl p-6 sm:p-8",
      "scroll-mt-24 transition-all duration-300",
      className,
    )}
  >
    {children}
  </section>
);

export default EquilibriumSectionCard;
