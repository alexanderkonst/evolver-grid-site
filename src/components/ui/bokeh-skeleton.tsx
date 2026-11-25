import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Loading slab in the village register (issue #443): a faint tint of the page's own
 * foreground on whatever surface it sits on, so it reads dark on dark and never a light
 * grey slab. No gradient, no violet bokeh; the pulse is the only motion.
 */
const BokehSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-xl bg-foreground/10 animate-pulse motion-reduce:animate-none",
      className,
    )}
    {...props}
  />
);

export default BokehSkeleton;
