import { cn } from "@/lib/utils";

/**
 * MDLS · Hero Headline
 *
 * Page-title pattern — Cormorant Garamond serif by default for sacred prose,
 * with optional DM Sans editorial-sans variant for refined-editorial register.
 *
 * §6 of Style Guide: Cormorant for sacred prose · DM Sans heavy for editorial.
 * §11 application: Equilibrium uses variant="serif" for the "Equilibrium" title.
 */
interface HeroHeadlineProps {
  title: string;
  subtitle?: string;
  variant?: "serif" | "editorial-sans";
  className?: string;
}

export const HeroHeadline = ({
  title,
  subtitle,
  variant = "serif",
  className,
}: HeroHeadlineProps) => {
  const titleClass =
    variant === "serif"
      ? "mdls-hero-headline"
      : "font-sans font-bold text-4xl sm:text-5xl tracking-tight text-[#0a1628] eq-text-halo";

  return (
    <div className={cn("text-center", className)}>
      <h1 className={titleClass}>{title}</h1>
      {subtitle && (
        <p
          className={
            variant === "serif"
              ? "mdls-hero-headline__subtitle"
              : "mt-2 font-sans text-base sm:text-lg text-[#0a1628]/85"
          }
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default HeroHeadline;
