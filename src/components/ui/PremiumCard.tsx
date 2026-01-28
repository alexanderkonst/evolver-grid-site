import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PremiumCardProps {
    children: ReactNode;
    className?: string;
    variant?: "glass" | "glass-strong" | "gradient-border";
    size?: "sm" | "md" | "lg";
}

/**
 * PremiumCard — Glassmorphic card component for hero moments
 * Use for Welcome, Results, Celebrations, and key actions
 */
export const PremiumCard = ({
    children,
    className,
    variant = "glass",
    size = "md",
}: PremiumCardProps) => {
    const sizeClasses = {
        sm: "p-4 rounded-xl",
        md: "p-6 sm:p-8 rounded-2xl",
        lg: "p-8 sm:p-12 rounded-3xl",
    };

    const variantClasses = {
        glass: `
      bg-white/85 backdrop-blur-xl
      border border-white/30
      shadow-[0_8px_32px_rgba(0,0,0,0.08)]
    `,
        "glass-strong": `
      bg-white/95 backdrop-blur-xl
      border border-white/40
      shadow-[0_16px_48px_rgba(0,0,0,0.12)]
    `,
        "gradient-border": `
      bg-white/90 backdrop-blur-xl
      border-2 border-transparent
      shadow-[0_8px_32px_rgba(0,0,0,0.08)]
      [background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,#8460ea,#a7cbd4,#cea4ae)_border-box]
    `,
    };

    return (
        <div
            className={cn(
                "transition-all duration-300",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
        >
            {children}
        </div>
    );
};

export default PremiumCard;
