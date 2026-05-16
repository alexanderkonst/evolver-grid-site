import { cn } from "@/lib/utils";

/**
 * Loading skeleton for any equilibrium section while initial fetch resolves.
 *
 * Pre-load placeholder for sections wired to `useEquilibriumV2`'s state.
 * Empty card with shimmer placeholders shaped roughly like the content
 * that's about to appear. Disappears as soon as `loading` flips false.
 *
 * Reduced-motion: shimmer is gated via the `motion-safe:` Tailwind variant
 * so users with prefers-reduced-motion get a static placeholder instead.
 */

interface SectionSkeletonProps {
  /** Number of placeholder lines to render. Defaults to 1 (single short row). */
  lines?: number;
  /** Shape — body shows wide rows, pill shows a centered pill stub. */
  shape?: "body" | "pill";
  className?: string;
}

export const SectionSkeleton = ({
  lines = 1,
  shape = "body",
  className,
}: SectionSkeletonProps) => {
  if (shape === "pill") {
    return (
      <div className={cn("mt-3 flex justify-center", className)}>
        <div className="h-9 w-40 rounded-full bg-[#0a1628]/10 motion-safe:animate-pulse" />
      </div>
    );
  }

  return (
    <div className={cn("mt-3 flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-full bg-[#0a1628]/10 motion-safe:animate-pulse"
          style={{ width: `${85 - i * 10}%` }}
        />
      ))}
    </div>
  );
};

export default SectionSkeleton;
