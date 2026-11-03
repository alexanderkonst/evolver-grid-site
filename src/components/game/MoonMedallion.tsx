import { forwardRef, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VILLAGE_MAP_PATH, isVillageMap } from "@/lib/returnToVillage";
import { tr } from "@/lib/villageCopy";
// The emblem of the «YOU be original» lockup, cut from the same artwork (no redraw).
import emblem from "@/assets/you-be-original-emblem.webp";
import "./MoonMedallion.css";

/**
 * MoonMedallion — the logo's emblem as the way back to the village (Sasha 2026-11-03,
 * village-as-dashboard step 1).
 *
 * No separate button: the dodecahedron emblem of the «YOU be original» logo sits in a round
 * moonstone medallion (moon accent #D9D1B4, ochre hairline #96703A). Hover glows, the tooltip
 * says «Back to village», a click opens the village map. M and Esc do the same from the
 * keyboard (useReturnToVillageKeys). On the map itself it is the logo and stays put.
 *
 * `size` is the medallion's outer diameter in px. `bare` drops the ring (for overlays that sit
 * exactly over the emblem printed in a lockup image, where only the glow and hit area are added).
 */
type MoonMedallionProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Tooltip side. */
  side?: "top" | "right" | "bottom" | "left";
  /** Only the hit area, glow and ring; no emblem image (the lockup underneath shows it). */
  overlay?: boolean;
};

export const MoonMedallion = forwardRef<HTMLAnchorElement, MoonMedallionProps>(
  ({ size = 44, className, style, side = "bottom", overlay = false }, ref) => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const label = tr(t, "village.medallionBack", "Back to village");
    const here = isVillageMap(pathname);
    return (
      <Tooltip delayDuration={250}>
        <TooltipTrigger asChild>
          <Link
            ref={ref}
            to={VILLAGE_MAP_PATH}
            aria-label={label}
            aria-current={here ? "page" : undefined}
            data-medallion=""
            className={cn("moon-medallion", overlay && "moon-medallion--overlay", className)}
            style={{ ...style, "--mm-size": `${size}px` } as CSSProperties}
          >
            {overlay ? null : (
              <img src={emblem} alt="" aria-hidden="true" className="moon-medallion__emblem" draggable={false} />
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side={side} className="moon-medallion__tip">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  },
);
MoonMedallion.displayName = "MoonMedallion";

export default MoonMedallion;
