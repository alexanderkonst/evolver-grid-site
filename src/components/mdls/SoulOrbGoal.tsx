import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * MDLS · Soul Orb (Goal Marker)
 *
 * §4.4 + §5.3 Soul-orb library. Small circular gradient marker.
 * Each instance carries a distinct soul-color signature (1–12).
 *
 * In Equilibrium: marker per Intuitive Task. Goal-vocabulary mapping
 * suggests which orb fits which verb (Aurora-warm → Transmit signal, etc.).
 * For v1.0 assignment is manual; no per-user derivation.
 */
interface SoulOrbGoalProps {
  orbId?: number;      // 1–12
  size?: number;       // px
  completed?: boolean;
  className?: string;
  onClick?: () => void;
  label?: string;      // ARIA label
}

// Library HSL pairs match :root vars in src/index.css.
const ORB_LIBRARY: Array<{ c: string; r: string }> = [
  { c: "28 78% 76%",  r: "18 70% 54%"  }, // 1 aurora-warm
  { c: "8 78% 74%",   r: "6 65% 56%"   }, // 2 aurora-coral
  { c: "350 70% 80%", r: "340 50% 60%" }, // 3 aurora-rose
  { c: "295 50% 76%", r: "285 40% 60%" }, // 4 aurora-orchid
  { c: "255 50% 78%", r: "250 38% 58%" }, // 5 aurora-violet
  { c: "220 50% 78%", r: "220 38% 52%" }, // 6 aurora-indigo
  { c: "195 55% 78%", r: "195 38% 50%" }, // 7 aurora-aqua
  { c: "160 38% 76%", r: "158 30% 56%" }, // 8 aurora-mint
  { c: "85 30% 76%",  r: "80 22% 56%"  }, // 9 aurora-sage
  { c: "45 50% 72%",  r: "40 50% 52%"  }, // 10 aurora-ochre
  { c: "38 70% 76%",  r: "32 60% 56%"  }, // 11 aurora-amber
  { c: "18 70% 72%",  r: "12 60% 52%"  }, // 12 aurora-ember
];

export const SoulOrbGoal = ({
  orbId = 7,
  size = 48,
  completed = false,
  className,
  onClick,
  label,
}: SoulOrbGoalProps) => {
  const idx = Math.max(0, Math.min(11, orbId - 1));
  const { c, r } = ORB_LIBRARY[idx];
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={label ?? `Soul orb ${orbId}`}
      className={cn(
        "mdls-soul-orb shrink-0",
        completed && "mdls-soul-orb--completed",
        onClick && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--mdls-coral-soft)]",
        className,
      )}
      style={
        {
          width: size,
          height: size,
          "--mdls-orb-c": c,
          "--mdls-orb-r": r,
        } as CSSProperties
      }
    />
  );
};

export default SoulOrbGoal;
