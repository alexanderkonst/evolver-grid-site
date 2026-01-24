import React from "react";
import { cn } from "@/lib/utils";

interface ProductBuilderLoadingProps {
    message?: string;
    submessage?: string;
    progress?: number;
    className?: string;
}

const LOADING_MESSAGES = {
    icp: "Understanding who needs your gift...",
    pain: "Mapping their struggles...",
    tp: "Crystallizing your promise...",
    landing: "Building your page...",
    blueprint: "Creating your methodology gift...",
    publishing: "Publishing to marketplace...",
};

const ProductBuilderLoading: React.FC<ProductBuilderLoadingProps> = ({
    message = "Generating...",
    submessage = "This usually takes 10-15 seconds",
    progress,
    className,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center min-h-[400px] text-center",
                className
            )}
        >
            {/* Animated spinner */}
            <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>

            {/* Message */}
            <h2 className="text-xl font-semibold text-foreground mb-2">{message}</h2>
            <p className="text-muted-foreground text-sm mb-6">{submessage}</p>

            {/* Progress bar (optional) */}
            {progress !== undefined && (
                <div className="w-64 h-2 bg-border rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    />
                </div>
            )}

            {/* Pulsing dots */}
            <div className="flex gap-1 mt-6">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
        </div>
    );
};

export { LOADING_MESSAGES };
export default ProductBuilderLoading;
