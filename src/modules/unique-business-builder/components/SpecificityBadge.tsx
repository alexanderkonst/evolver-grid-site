/**
 * SpecificityBadge — pill showing current specificity (0–10) with optional delta.
 *
 * Color gradient by score band (see constants.SPECIFICITY_BANDS).
 * Delta pill shows ↑ or ↓ with a count-up animation on positive changes.
 */

import { cn } from "@/lib/utils";
import { specificityBand } from "../constants";

type Props = {
  score: number;
  delta?: number;
  size?: "sm" | "md";
  className?: string;
};

const bandColorClasses: Record<string, string> = {
  info: "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200",
  success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200",
};

export function SpecificityBadge({ score, delta, size = "md", className }: Props) {
  const band = specificityBand(score);
  const isUp = typeof delta === "number" && delta > 0;
  const isDown = typeof delta === "number" && delta < 0;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium tabular-nums",
          bandColorClasses[band.color] || bandColorClasses.info,
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
        )}
        aria-label={`Specificity ${score.toFixed(1)} of 10 — ${band.label}`}
      >
        {score.toFixed(1)}
        <span className="ml-1 text-[0.85em] opacity-70">/ 10</span>
      </span>
      {typeof delta === "number" && delta !== 0 && (
        <span
          className={cn(
            "text-xs tabular-nums",
            isUp && "text-emerald-600",
            isDown && "text-red-600"
          )}
          aria-live="polite"
        >
          {isUp ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}
        </span>
      )}
    </div>
  );
}
