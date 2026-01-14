import { cn } from "@/lib/utils";

interface BokehOverlayProps {
    intensity?: "subtle" | "medium" | "strong";
    className?: string;
}

/**
 * Wabi-sabi Bokeh Overlay
 * Adds soft-focus radial gradient effects for depth and serenity
 */
const BokehOverlay = ({ intensity = "subtle", className }: BokehOverlayProps) => {
    const opacities = {
        subtle: { primary: 0.08, secondary: 0.05 },
        medium: { primary: 0.12, secondary: 0.08 },
        strong: { primary: 0.18, secondary: 0.12 },
    };

    const { primary, secondary } = opacities[intensity];

    return (
        <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}>
            {/* Top-left lavender glow */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at 20% 20%, rgba(164, 163, 208, ${primary}) 0%, transparent 50%)`
                }}
            />

            {/* Bottom-right lilac glow */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(ellipse at 80% 80%, rgba(200, 183, 216, ${secondary}) 0%, transparent 50%)`
                }}
            />

            {/* Center aqua accent */}
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(circle at 50% 50%, rgba(167, 203, 212, ${secondary * 0.5}) 0%, transparent 40%)`
                }}
            />
        </div>
    );
};

export default BokehOverlay;
