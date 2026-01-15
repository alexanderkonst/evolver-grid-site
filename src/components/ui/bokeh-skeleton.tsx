import * as React from "react";
import { cn } from "@/lib/utils";

const BokehSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-xl bg-gradient-to-r from-[#e7e9e5] via-[#dcdde2] to-[#e7e9e5] animate-pulse",
      className,
    )}
    {...props}
  >
    <div className="pointer-events-none absolute inset-0 bokeh-shimmer" />
  </div>
);

export default BokehSkeleton;
