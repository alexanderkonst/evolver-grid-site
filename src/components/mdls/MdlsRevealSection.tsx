import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * MDLS · Reveal Section
 *
 * Wraps a section in a Framer Motion fade-up reveal that triggers as it
 * enters the viewport. Uses spring physics for the rise — feels like the
 * surface is settling into place, not "flying in."
 *
 * Respects `prefers-reduced-motion` — when the user has opted out, the
 * section appears instantly with no transform animation.
 *
 * Why this is the motion vocabulary we needed: previously the entire
 * /mdls-preview page was a static scroll. Now each section breathes into
 * view on entry, giving the read a cinematic, deliberate cadence.
 *
 * v1.0 — 2026-05-19 — Wave 3 of the MDLS octave shift.
 */
interface MdlsRevealSectionProps {
  children: ReactNode;
  /** Optional delay before reveal triggers (seconds). Default 0. */
  delay?: number;
  /** Stagger children one-by-one. Default false (whole-block reveal). */
  staggerChildren?: boolean;
  className?: string;
}

export const MdlsRevealSection = ({
  children,
  delay = 0,
  staggerChildren = false,
  className,
}: MdlsRevealSectionProps) => {
  const prefersReduced = useReducedMotion();

  const variants = staggerChildren
    ? {
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.12, delayChildren: delay },
        },
      }
    : {
        hidden: { opacity: 0, y: prefersReduced ? 0 : 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring" as const,
            damping: 24,
            stiffness: 110,
            delay,
          },
        },
      };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

/**
 * Sibling: MdlsRevealChild — for use inside a staggerChildren parent.
 * Each child reveals one after another.
 */
export const MdlsRevealChild = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: prefersReduced ? 0 : 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", damping: 22, stiffness: 130 },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export default MdlsRevealSection;
