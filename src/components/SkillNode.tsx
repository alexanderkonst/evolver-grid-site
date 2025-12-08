import { useState } from "react";
import { cn } from "@/lib/utils";
import type { SkillNode as SkillNodeType } from "@/data/skillTrees";

interface SkillNodeProps {
    node: SkillNodeType;
    status: "locked" | "available" | "in_progress" | "completed";
    color: string;
    onClick?: () => void;
}

const SkillNode = ({ node, status, color, onClick }: SkillNodeProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const statusStyles = {
        locked: {
            bg: "bg-muted/30",
            border: "border-muted/50",
            glow: "",
            opacity: "opacity-40",
        },
        available: {
            bg: "bg-background/80",
            border: "border-current",
            glow: "shadow-lg",
            opacity: "opacity-90",
        },
        in_progress: {
            bg: "bg-background",
            border: "border-current",
            glow: "shadow-xl animate-pulse",
            opacity: "opacity-100",
        },
        completed: {
            bg: "bg-current/20",
            border: "border-current",
            glow: "shadow-lg",
            opacity: "opacity-100",
        },
    };

    const styles = statusStyles[status];

    return (
        <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
                left: `${node.position.x}%`,
                top: `${node.position.y}%`,
            }}
        >
            {/* Tooltip */}
            <div
                className={cn(
                    "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-56 p-3 rounded-lg",
                    "bg-popover border border-border shadow-xl",
                    "transition-all duration-200 z-20",
                    isHovered ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"
                )}
            >
                <h4 className="font-semibold text-sm mb-1">{node.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{node.description}</p>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">+{node.xpReward} XP</span>
                    {status === "completed" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">Completed</span>
                    )}
                    {status === "in_progress" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">In Progress</span>
                    )}
                    {status === "locked" && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Locked</span>
                    )}
                </div>
            </div>

            {/* Node Circle */}
            <button
                onClick={status !== "locked" ? onClick : undefined}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                disabled={status === "locked"}
                className={cn(
                    "relative w-14 h-14 rounded-full border-2 transition-all duration-300",
                    styles.bg,
                    styles.border,
                    styles.opacity,
                    status !== "locked" && "cursor-pointer hover:scale-110",
                    status === "locked" && "cursor-not-allowed",
                    isHovered && status !== "locked" && styles.glow
                )}
                style={{
                    color: color,
                    boxShadow: isHovered && status !== "locked" ? `0 0 30px ${color}40` : undefined
                }}
            >
                {/* Inner glow for available/in_progress */}
                {(status === "available" || status === "in_progress") && (
                    <div
                        className="absolute inset-2 rounded-full opacity-30"
                        style={{ backgroundColor: color }}
                    />
                )}

                {/* Completed checkmark */}
                {status === "completed" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg
                            className="w-6 h-6"
                            style={{ color: color }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}

                {/* Pulsing ring for in_progress */}
                {status === "in_progress" && (
                    <div
                        className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{ backgroundColor: color }}
                    />
                )}
            </button>

            {/* Node name label */}
            <div
                className={cn(
                    "absolute top-full left-1/2 transform -translate-x-1/2 mt-2",
                    "text-xs text-center font-medium max-w-20 leading-tight",
                    styles.opacity
                )}
            >
                {node.name}
            </div>
        </div>
    );
};

export default SkillNode;
