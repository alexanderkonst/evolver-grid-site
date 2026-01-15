import { cn } from "@/lib/utils";
import BokehSkeleton from "@/components/ui/bokeh-skeleton";

const SkeletonCard = ({ className }: { className?: string }) => (
  <BokehSkeleton className={cn("rounded-xl", className)} />
);

export default SkeletonCard;
