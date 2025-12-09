import { useMemo } from "react";
import dodecahedronImage from "@/assets/dodecahedron.jpg";

interface SoulDodecahedronProps {
    soulColors?: string[];
    size?: "sm" | "md" | "lg";
    className?: string;
    onClick?: () => void;
}

const SIZE_MAP = {
    sm: { container: 120, glow: 15 },
    md: { container: 180, glow: 20 },
    lg: { container: 240, glow: 30 },
};

const SoulDodecahedron = ({
    soulColors,
    size = "md",
    className = "",
    onClick,
}: SoulDodecahedronProps) => {
    const { container, glow } = SIZE_MAP[size];

    // Generate gradient from soul colors
    const glowGradient = useMemo(() => {
        if (!soulColors || soulColors.length === 0) {
            // Default ethereal glow when no colors
            return "radial-gradient(circle, rgba(155, 93, 229, 0.4) 0%, rgba(155, 93, 229, 0.1) 50%, transparent 70%)";
        }

        // Create a multi-color radial gradient
        const colorStops = soulColors.map((color, index) => {
            const opacity = 0.5 - (index * 0.1);
            const position = (index / soulColors.length) * 100;
            return `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} ${position}%`;
        }).join(", ");

        return `radial-gradient(circle, ${colorStops}, transparent 100%)`;
    }, [soulColors]);

    // Create animated ring colors
    const ringColors = soulColors && soulColors.length >= 2
        ? `linear-gradient(45deg, ${soulColors[0]}, ${soulColors[1] || soulColors[0]}, ${soulColors[2] || soulColors[0]})`
        : "linear-gradient(45deg, #9b5de5, #f5a623, #4361ee)";

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: container, height: container }}
        >
            {/* Outer glow ring */}
            <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                    background: glowGradient,
                    filter: `blur(${glow}px)`,
                    animationDuration: "3s",
                }}
            />

            {/* Animated color ring */}
            <div
                className="absolute rounded-full animate-spin"
                style={{
                    width: container - 10,
                    height: container - 10,
                    background: ringColors,
                    padding: "3px",
                    animationDuration: "15s",
                }}
            >
                <div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: "hsl(220, 40%, 8%)" }}
                />
            </div>

            {/* The dodecahedron image */}
            <button
                onClick={onClick}
                className="relative z-10 rounded-full overflow-hidden transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/30"
                style={{
                    width: container - 30,
                    height: container - 30,
                }}
            >
                <img
                    src={dodecahedronImage}
                    alt="Your Soul Essence"
                    className="w-full h-full object-cover"
                />

                {/* Inner glow overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: soulColors && soulColors.length > 0
                            ? `radial-gradient(circle, ${soulColors[0]}20 0%, transparent 70%)`
                            : "radial-gradient(circle, rgba(255, 213, 79, 0.1) 0%, transparent 70%)",
                    }}
                />
            </button>

            {/* Sparkle particles */}
            {soulColors && soulColors.length > 0 && (
                <>
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="absolute rounded-full animate-ping"
                            style={{
                                width: 4,
                                height: 4,
                                backgroundColor: soulColors[i % soulColors.length],
                                top: `${20 + i * 25}%`,
                                left: `${10 + i * 30}%`,
                                animationDuration: `${2 + i * 0.5}s`,
                                animationDelay: `${i * 0.3}s`,
                            }}
                        />
                    ))}
                </>
            )}
        </div>
    );
};

export default SoulDodecahedron;
