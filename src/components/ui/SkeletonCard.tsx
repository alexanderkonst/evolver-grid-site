import { cn } from "@/lib/utils";

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-slate-700/50 rounded-xl", className)} />
);

export default SkeletonCard;
