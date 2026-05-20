import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * MDLS · Scroll Tilt
 *
 * Wraps a hero artifact (typically the Composed Surface Demo) so that as
 * the user scrolls past, the artifact subtly tilts — first leaning toward
 * the reader, then settling, then leaning away. Maximum 3° in any axis.
 *
 * This is the motion piece that makes the device feel like a held object
 * rather than a flat screenshot. It's NOT noise (subtle, scroll-coupled),
 * and it's NOT ornament (it conveys the artifact's "weight" in 3D space).
 *
 * Respects `prefers-reduced-motion` — passes children through unmodified.
 *
 * v1.0 — 2026-05-19 — Wave 3 of the MDLS octave shift.
 */
interface MdlsScrollTiltProps {
  children: ReactNode;
  /** Maximum tilt angle in degrees. Default 4. */
  maxTilt?: number;
  className?: string;
}

export const MdlsScrollTilt = ({
  children,
  maxTilt = 4,
  className,
}: MdlsScrollTiltProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Track scroll progress relative to THIS element. 0 = element just
  // entered the viewport bottom; 1 = element just left the viewport top.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Map scroll progress to rotation. As the user scrolls down:
  //   - 0.0–0.5: rotateX goes from +maxTilt (leaning toward) to 0
  //   - 0.5–1.0: rotateX goes from 0 to -maxTilt (leaning away)
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [maxTilt, 0, -maxTilt]
  );
  // Slight rotateY drift for asymmetry — gives the artifact a "held in hand"
  // quality rather than mechanical pivot.
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [-maxTilt * 0.4, 0, maxTilt * 0.4]
  );

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1400,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
};

export default MdlsScrollTilt;
