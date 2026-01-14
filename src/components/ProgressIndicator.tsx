import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressIndicator = ({ current, total, className }: ProgressIndicatorProps) => {
  return (
    <span className={cn("text-xs font-semibold uppercase tracking-wide text-slate-500", className)}>
      Step {current} of {total}
    </span>
  );
};

export default ProgressIndicator;
