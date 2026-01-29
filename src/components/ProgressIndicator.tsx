import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

const ProgressIndicator = ({ current, total, className }: ProgressIndicatorProps) => {
  return (
    <span className={cn("text-xs font-semibold uppercase tracking-wide text-[#2c3150]/60", className)}>
      Step {current} of {total}
    </span>
  );
};

export default ProgressIndicator;
