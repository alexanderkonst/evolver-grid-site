import { cn } from "@/lib/utils";
import BokehSkeleton from "@/components/ui/bokeh-skeleton";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <BokehSkeleton className={cn("rounded-md", className)} {...props} />;
}

export { Skeleton };
