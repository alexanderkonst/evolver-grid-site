import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
  current: number;
  total: number;
  className?: string;
  labelClassName?: string;
  trackClassName?: string;
  barClassName?: string;
}

const OnboardingProgress = ({
  current,
  total,
  className,
  labelClassName,
  trackClassName,
  barClassName,
}: OnboardingProgressProps) => {
  const progress = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className={cn("w-full max-w-md mx-auto mb-6", className)}>
      <div className={cn("flex justify-between text-sm mb-2 text-slate-500", labelClassName)}>
        <span>Step {current} of {total}</span>
      </div>
      <div className={cn("h-2 bg-slate-200 rounded-full overflow-hidden", trackClassName)}>
        <div
          className={cn(
            "h-full bg-gradient-to-r from-[#8460ea] to-[#a4a3d0] transition-all duration-300",
            barClassName
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default OnboardingProgress;
