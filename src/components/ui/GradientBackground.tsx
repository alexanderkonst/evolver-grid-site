import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientBackgroundProps {
    children: ReactNode;
    variant?: "light" | "cosmic" | "transformation" | "subtle";
    className?: string;
}

/**
 * GradientBackground — Premium background wrapper
 * Use as outer container for hero screens
 */
export const GradientBackground = ({
    children,
    variant = "subtle",
    className,
}: GradientBackgroundProps) => {
    const variantClasses = {
        light: "bg-gradient-to-b from-[#f0f4ff] via-[#e8f0fe] to-[#f5f7fa]",
        cosmic: "bg-gradient-to-br from-[#2B2342] via-[#1e293b] to-[#0f172a]",
        transformation: "bg-gradient-to-br from-[#f0f4ff] via-[#e8f0fe] to-[#faf5f8]",
        subtle: "bg-gradient-to-b from-[#fafbff] to-[#f5f7fa]",
    };

    return (
        <div className={cn("min-h-screen w-full", variantClasses[variant], className)}>
            {/* Subtle animated gradient orb for depth */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full opacity-30"
                    style={{
                        background: "radial-gradient(circle, rgba(132,96,234,0.15) 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{
                        background: "radial-gradient(circle, rgba(167,203,212,0.2) 0%, transparent 70%)",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
};

export default GradientBackground;
