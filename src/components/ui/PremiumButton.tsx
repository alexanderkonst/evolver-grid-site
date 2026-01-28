import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

/**
 * PremiumButton — Gradient button with glow and micro-animations
 * Use for primary CTAs in hero moments
 */
export const PremiumButton = ({
    children,
    className,
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    ...props
}: PremiumButtonProps) => {
    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs rounded-lg",
        md: "px-5 py-2.5 text-sm rounded-xl",
        lg: "px-6 py-3 text-base rounded-xl",
    };

    const variantClasses = {
        primary: `
      bg-gradient-to-r from-[#8460ea] to-[#6894d0]
      text-white font-semibold
      shadow-[0_4px_20px_rgba(132,96,234,0.4)]
      hover:shadow-[0_6px_28px_rgba(132,96,234,0.5)]
      hover:scale-[1.02]
      active:scale-[0.98]
    `,
        secondary: `
      bg-white/90 backdrop-blur-sm
      text-[#2c3150] font-medium
      border border-[#8460ea]/20
      hover:border-[#8460ea]/40
      hover:bg-white
      hover:scale-[1.02]
      active:scale-[0.98]
    `,
        ghost: `
      bg-transparent
      text-[#8460ea] font-medium
      hover:bg-[#8460ea]/10
      hover:scale-[1.02]
      active:scale-[0.98]
    `,
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2",
                "transition-all duration-200 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-[#8460ea] focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export default PremiumButton;
