import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

/**
 * MDLS · Hover Tilt
 *
 * Aceternity-style 3D card hover effect, MDLS-tuned. On cursor proximity,
 * the wrapped element tilts toward the cursor (max 4° rotateX/Y). Springs
 * back to flat when the cursor leaves.
 *
 * Pairs with MdlsScrollTilt (scroll-coupled tilt). The two compose: scroll
 * drives the baseline lean, hover adds the cursor-tracking layer on top.
 *
 * Why this is the polish that matters: a "static screenshot of a UI" reads
 * as a marketing mock; a "card that responds to your cursor in 3D space"
 * reads as a real surface in a real room. The shift is subtle but it's
 * what separates Stripe.dev / Linear.app / Apple from generic landing
 * pages.
 *
 * Respects prefers-reduced-motion — passes children through unmodified.
 *
 * v1.0 — 2026-05-19 — Wave 5 photo-real manifestation pass.
 */
interface MdlsHoverTiltProps {
  children: ReactNode;
  /** Maximum tilt angle in degrees. Default 4. */
  maxTilt?: number;
  /** Z perspective in pixels. Default 1400 — gentle 3D depth. */
  perspective?: number;
  className?: string;
}

export const MdlsHoverTilt = ({
  children,
  maxTilt = 4,
  perspective = 1400,
  className,
}: MdlsHoverTiltProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Mouse position relative to the center of the element, normalized -1..1.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-smoothed versions so the tilt doesn't snap; it flows.
  const springX = useSpring(mouseX, { stiffness: 150, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 18 });

  // Map -1..1 cursor position to -maxTilt..maxTilt rotation.
  // Y-cursor controls rotateX (inverted — cursor up tilts top of card
  // toward viewer). X-cursor controls rotateY.
  const rotateX = useTransform(springY, [-1, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [-1, 1], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    // Spring back to flat. Spring physics handle the easing.
    mouseX.set(0);
    mouseY.set(0);
  };

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: perspective,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
};

export default MdlsHoverTilt;
