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

    const glowColor = useMemo(() => {
        if (!soulColors || soulColors.length === 0) {
            return "rgba(245, 158, 11, 0.35)";
        }
        return soulColors[0];
    }, [soulColors]);

    const ringColor = soulColors?.[0] ?? "#f59e0b";

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: container, height: container }}
        >
            {/* Outer glow ring */}
            <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                    backgroundColor: glowColor,
                    opacity: 0.25,
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
                    backgroundColor: ringColor,
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
                        backgroundColor: soulColors?.[0] ?? "rgba(245, 158, 11, 0.2)",
                        opacity: 0.12,
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
