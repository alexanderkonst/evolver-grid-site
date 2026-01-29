import { cn } from "@/lib/utils";

interface PlayerStatsBadgeProps {
  level?: number | null;
  xpTotal?: number | null;
  streakDays?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const STREAK_MILESTONES = new Set([7, 30, 60, 100]);

const PlayerStatsBadge = ({
  level,
  xpTotal,
  streakDays,
  className,
  size = "md",
}: PlayerStatsBadgeProps) => {
  if (typeof level !== "number" || typeof xpTotal !== "number") {
    return null;
  }

  const showStreak = typeof streakDays === "number" && streakDays > 0;
  const isMilestone = showStreak && STREAK_MILESTONES.has(streakDays);

  const sizeStyles = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  return (
    <div className={cn("flex flex-wrap items-center gap-2", sizeStyles, className)}>
      <span className="inline-flex items-center gap-2 rounded-full bg-[#a4a3d0]/20 px-3 py-1 font-semibold text-[#2c3150]">
        Level {level} • {xpTotal} XP
      </span>
      {showStreak && (
        <span className="inline-flex items-center gap-2 rounded-full bg-[#c8b7d8]/20 px-3 py-1 font-semibold text-[#8460ea]">
          Day {streakDays}
          <span className={cn(isMilestone ? "animate-bounce" : "")}>🔥</span>
        </span>
      )}
    </div>
  );
};

export default PlayerStatsBadge;
