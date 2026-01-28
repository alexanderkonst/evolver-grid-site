import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface HeroIconProps {
    icon: LucideIcon;
    size?: "sm" | "md" | "lg";
    variant?: "gradient" | "glow" | "pulse";
    className?: string;
}

/**
 * HeroIcon — Animated icon container for hero moments
 * Replaces plain gray icon circles with premium animated versions
 */
export const HeroIcon = ({
    icon: Icon,
    size = "md",
    variant = "gradient",
    className,
}: HeroIconProps) => {
    const sizeClasses = {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-24 h-24",
    };

    const iconSizes = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    const variantClasses = {
        gradient: `
      bg-gradient-to-br from-[#8460ea] via-[#a7cbd4] to-[#cea4ae]
      shadow-[0_4px_20px_rgba(132,96,234,0.3)]
    `,
        glow: `
      bg-gradient-to-br from-[#8460ea] to-[#6894d0]
      shadow-[0_0_30px_rgba(132,96,234,0.5)]
      animate-pulse
    `,
        pulse: `
      bg-gradient-to-br from-[#a4a3d0] to-[#c8b7d8]
      shadow-[0_4px_20px_rgba(164,163,208,0.4)]
    `,
    };

    return (
        <div
            className={cn(
                "rounded-full flex items-center justify-center",
                "transition-all duration-300",
                "hover:scale-105",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
        >
            <Icon className={cn(iconSizes[size], "text-white")} strokeWidth={1.5} />
        </div>
    );
};

export default HeroIcon;
