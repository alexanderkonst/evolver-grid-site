import { memo } from "react";
import { cn } from "@/lib/utils";
import {
  SOLAR_HOLONIC_ORDER,
  getSolarHolonic,
  type HolonicPhase,
} from "@/lib/equilibrium-cycles";

/**
 * The 4 holonic cycles of the Sun (Sasha 2026-06-22).
 *
 * Birthday-anchored: the personal solar year divides into four quarters
 * from the birthday forward — Seeding → Sprouting → Fruiting → Harvest.
 * Shows all four as a wheel-row with the current one lit, then the
 * essence of the current phase below.
 *
 * `currentPhaseId` comes from `cycles.solar.personalHolonicPhase.id`,
 * which is already computed from the birthday-anchored progress.
 */
export interface SolarHolonicEssenceProps {
  currentPhaseId: HolonicPhase;
  className?: string;
}

const SolarHolonicEssenceBase = ({
  currentPhaseId,
  className,
}: SolarHolonicEssenceProps) => {
  const current = getSolarHolonic(currentPhaseId);

  return (
    <div className={cn("flex w-full flex-col items-center", className)}>
      {/* The four solar cycles — current one lit */}
      <div className="flex w-full max-w-md items-stretch justify-center gap-2">
        {SOLAR_HOLONIC_ORDER.map((id) => {
          const info = getSolarHolonic(id);
          const isCurrent = id === currentPhaseId;
          return (
            <div
              key={id}
              className={cn(
                // Village register (issue #443): thin ring, no gradient, no glow.
                "flex flex-1 flex-col items-center gap-1 rounded-md border px-1.5 py-2.5 text-center transition-colors",
                isCurrent ? "border-foreground/50 bg-foreground/10" : "border-foreground/15 opacity-55",
              )}
              aria-current={isCurrent ? "true" : undefined}
            >
              <span className="text-lg leading-none grayscale" aria-hidden="true">
                {info.emoji}
              </span>
              <span
                className={cn(
                  "text-[13px] leading-tight text-foreground",
                  isCurrent ? "font-medium" : "font-normal",
                )}
              >
                {info.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Essence of the current phase */}
      <div className="mt-4 flex w-full max-w-sm flex-col items-center gap-1.5 text-center">
        <span
          className="eq-text-halo text-[11px] font-medium uppercase tracking-[0.14em] text-[#0a1628]/65"
          style={{ fontFamily: "ui-serif, Georgia, serif" }}
        >
          {current.cardinal} turn
        </span>
        <p className="eq-text-halo text-[15px] leading-relaxed text-[#0a1628]/95">
          {current.essence}
        </p>
      </div>
    </div>
  );
};

export const SolarHolonicEssence = memo(SolarHolonicEssenceBase);

export default SolarHolonicEssence;
