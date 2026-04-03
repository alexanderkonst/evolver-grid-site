import { ArrowRight } from "lucide-react";
import { type UnifiedAction } from "@/types/actions";

// Vector icons by growth path
const VECTOR_ICONS: Record<string, string> = {
    genius: "🎯",
    body: "💪",
    mind: "🧠",
    emotions: "💖",
    spirit: "✨",
    default: "⭐",
};

interface NextMoveCardProps {
    action?: UnifiedAction | null;
    onStart: () => void;
    onExplore: () => void;
    isLoading?: boolean;
}

/**
 * NextMoveCard - Shows ONE recommended action
 * The hero component of Daily Loop
 */
export default function NextMoveCard({
    action,
    onStart,
    onExplore,
    isLoading = false,
}: NextMoveCardProps) {
    const icon = action?.growthPath
        ? VECTOR_ICONS[action.growthPath.toLowerCase()] || VECTOR_ICONS.default
        : VECTOR_ICONS.default;

    if (isLoading) {
        return (
            <div className="rounded-2xl liquid-glass ring-1 ring-white/10 p-6">
                <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-white/10 rounded w-1/3 mb-4" />
                    <div className="rounded-xl liquid-glass-strong ring-1 ring-white/10 p-6 space-y-3">
                        <div className="h-6 bg-white/10 rounded w-3/4" />
                        <div className="h-4 bg-white/5 rounded w-1/2" />
                        <div className="h-14 bg-white/10 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!action) {
        return (
            <div className="rounded-2xl liquid-glass ring-1 ring-white/10 p-6">
                <h3 className="text-lg font-semibold text-white font-display mb-4">My Next Move</h3>
                <div className="rounded-xl liquid-glass-strong ring-1 ring-white/15 p-6 text-center">
                    <div className="text-3xl mb-3">✨</div>
                    <p className="text-white/50 mb-4">
                        You've completed all recommended actions!
                    </p>
                    <button
                        onClick={onExplore}
                        className="px-6 py-2.5 rounded-xl liquid-glass ring-1 ring-[#8460ea]/30 text-[#a4a3d0] hover:bg-white/5 transition-all text-sm font-medium"
                    >
                        Explore More →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl liquid-glass ring-1 ring-white/10 p-6 breathing-card">
            <h3 className="text-lg font-semibold text-white font-display mb-4">My Next Move</h3>

            <div className="rounded-xl liquid-glass-strong ring-1 ring-white/15 p-6">
                {/* Action Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[#8460ea]/15 flex items-center justify-center text-xl flex-shrink-0 ring-1 ring-white/10">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-bold text-white leading-tight">
                            {action.title}
                        </h4>
                        <p className="text-sm text-white/40 mt-1">
                            {action.growthPath} Path · {action.duration || "sm"}
                        </p>
                    </div>
                </div>

                {/* Why this action */}
                {action.whyRecommended && (
                    <p className="text-sm text-white/40 italic mb-4 pl-14">
                        "{action.whyRecommended}"
                    </p>
                )}

                {/* START Button */}
                <button
                    onClick={onStart}
                    className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-[#8460ea] to-[#6894d0] text-white
                               shadow-[0_0_30px_rgba(132,96,234,0.2)] hover:shadow-[0_0_40px_rgba(132,96,234,0.35)]
                               hover:scale-[1.02] active:scale-[0.98] transition-all duration-200
                               flex items-center justify-center gap-2"
                >
                    START
                    <span className="text-sm opacity-80">+{action.completionPayload?.xp || 15} XP</span>
                </button>
            </div>

            {/* Explore link */}
            <button
                onClick={onExplore}
                className="mt-4 text-sm text-white/30 hover:text-white/60 w-full text-center transition-colors"
            >
                Not this? Explore more →
            </button>
        </div>
    );
}
