import { cn } from "@/lib/utils";

/**
 * MDLS · Seal Medallion
 *
 * §9.6 Component Contracts. Small sacred-seal stamp — purely
 * decorative-semantic. No interactivity.
 *
 * In Equilibrium: appears on the Lifelong Dedication card as an
 * heirloom-emblem signature mark (per the AI-generated mockup).
 *
 * Three variants:
 *   mandala — concentric petals (default)
 *   flower  — six-petal flower-of-life
 *   spiral  — golden spiral seed
 */
interface SealMedallionProps {
  size?: number;
  variant?: "mandala" | "flower" | "spiral";
  ariaLabel?: string;
  className?: string;
}

export const SealMedallion = ({
  size = 32,
  variant = "mandala",
  ariaLabel = "Sacred seal",
  className,
}: SealMedallionProps) => (
  <span
    role="img"
    aria-label={ariaLabel}
    className={cn("mdls-seal-medallion", className)}
    style={{ width: size, height: size }}
  >
    {variant === "mandala" && <MandalaSvg />}
    {variant === "flower" && <FlowerSvg />}
    {variant === "spiral" && <SpiralSvg />}
  </span>
);

const MandalaSvg = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="0.6" />
    <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="0.5" />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i * Math.PI) / 3;
      const x1 = 16 + Math.cos(angle) * 5;
      const y1 = 16 + Math.sin(angle) * 5;
      const x2 = 16 + Math.cos(angle) * 15;
      const y2 = 16 + Math.sin(angle) * 15;
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="0.4"
        />
      );
    })}
    <circle cx="16" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
  </svg>
);

const FlowerSvg = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="0.5" />
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const angle = (i * Math.PI) / 3;
      const cx = 16 + Math.cos(angle) * 5;
      const cy = 16 + Math.sin(angle) * 5;
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="5"
          stroke="currentColor"
          strokeWidth="0.4"
          opacity="0.6"
        />
      );
    })}
  </svg>
);

const SpiralSvg = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 16 m -1.5 0 a 1.5 1.5 0 1 0 3 0 a 1.5 1.5 0 1 0 -3 0
         M 17.5 16 a 4 4 0 1 0 -8 0
         M 9.5 16 a 7 7 0 1 1 14 0
         M 23.5 16 a 11 11 0 1 0 -22 0"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export default SealMedallion;
