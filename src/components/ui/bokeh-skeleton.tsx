import * as React from "react";
import { cn } from "@/lib/utils";
import "@/components/game/ModulePage.css";

/**
 * The one loading skeleton (Seam 2/4, S-04). A low-contrast slab of the village's night
 * (`--scene-ink-rgb` at 5% over the page), never a light grey. Every module page loads
 * through this component; see `.mp-skeleton` in components/game/ModulePage.css.
 */
const BokehSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mp-skeleton rounded-xl", className)} aria-hidden="true" {...props} />
);

export default BokehSkeleton;
