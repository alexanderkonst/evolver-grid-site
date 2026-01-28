import { cn } from "@/lib/utils";

interface PremiumLoaderProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
}

/**
 * Premium loading indicator with brand colors and subtle animation
 */
export const PremiumLoader = ({
    size = "md",
    text,
    className,
}: PremiumLoaderProps) => {
    const sizeClasses = {
        sm: "w-5 h-5 border",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-2",
    };

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <div
                className={cn(
                    "rounded-full border-[var(--wabi-lavender)] border-t-[#8460ea] animate-spin",
                    sizeClasses[size]
                )}
                style={{
                    animationDuration: "0.8s",
                    animationTimingFunction: "linear",
                }}
            />
            {text && (
                <p className="text-sm text-[var(--wabi-text-secondary)]">{text}</p>
            )}
        </div>
    );
};

/**
 * Loading dots indicator for inline use
 */
export const LoadingDots = () => (
    <span className="inline-flex gap-1">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
    </span>
);

/**
 * Skeleton placeholder for content loading
 */
export const Skeleton = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("skeleton", className)} {...props} />
);

/**
 * Full-page loading screen with premium branding
 */
export const FullPageLoader = ({ text = "Loading..." }: { text?: string }) => (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-[var(--wabi-lavender)] via-[var(--wabi-pearl)] to-[var(--wabi-lilac)]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[var(--wabi-lavender)] border-t-[#8460ea] animate-spin" />
            <p className="text-[var(--wabi-text-secondary)] text-sm">{text}</p>
        </div>
    </div>
);

export default PremiumLoader;
