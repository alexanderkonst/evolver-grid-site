import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface CharacterTileProps {
    id: string;
    title: string;
    subtitle?: string;
    icon: ReactNode;
    color: string;
    progress?: number; // 0-100
    isLocked?: boolean;
    unlockHint?: string;
    onClick?: () => void;
    size?: "sm" | "md" | "lg";
    children?: ReactNode;
}

const SIZE_MAP = {
    sm: { tile: "w-24 h-24", icon: "w-8 h-8", text: "text-xs" },
    md: { tile: "w-28 h-28 sm:w-32 sm:h-32", icon: "w-10 h-10", text: "text-xs sm:text-sm" },
    lg: { tile: "w-32 h-32 sm:w-40 sm:h-40", icon: "w-12 h-12", text: "text-sm" },
};

const CharacterTile = ({
    id,
    title,
    subtitle,
    icon,
    color,
    progress = 0,
    isLocked = false,
    unlockHint,
    onClick,
    size = "md",
    children,
}: CharacterTileProps) => {
    const sizeClasses = SIZE_MAP[size];

    return (
        <button
            onClick={onClick}
            disabled={isLocked}
            className={cn(
                "relative rounded-2xl p-3 flex flex-col items-center justify-center gap-1",
                "transition-all duration-300 ease-out",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900",
                sizeClasses.tile,
                isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : "shadow-[0_6px_18px_rgba(164,163,208,0.16)] hover:scale-105 hover:shadow-[0_10px_28px_rgba(132,96,234,0.24)] active:scale-95"
            )}
            style={{
                backgroundColor: isLocked ? "rgba(255,255,255,0.05)" : `${color}15`,
                borderColor: isLocked ? "rgba(255,255,255,0.1)" : `${color}40`,
                borderWidth: 2,
            }}
        >
            {/* Progress ring */}
            {!isLocked && progress > 0 && (
                <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="47"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeOpacity="0.2"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="47"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray={`${progress * 2.95} 295`}
                        strokeLinecap="round"
                    />
                </svg>
            )}

            {/* Lock overlay */}
            {isLocked && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-above">
                    <div className="flex flex-col items-center gap-1">
                        <Lock className="w-5 h-5 text-slate-400" />
                        {unlockHint && (
                            <span className="text-[10px] text-slate-400 text-center px-2">
                                {unlockHint}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Icon */}
            <div
                className={cn("flex items-center justify-center", sizeClasses.icon)}
                style={{ color: isLocked ? "#666" : color }}
            >
                {icon}
            </div>

            {/* Title */}
            <div className={cn("font-semibold text-center leading-tight", sizeClasses.text)}
                style={{ color: isLocked ? "#888" : color }}
            >
                {title}
            </div>

            {/* Subtitle or custom children */}
            {subtitle && !children && (
                <div className="text-[10px] text-slate-500 text-center leading-tight">
                    {subtitle}
                </div>
            )}
            {children}
        </button>
    );
};

export default CharacterTile;
