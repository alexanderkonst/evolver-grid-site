import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    const icon = action?.vector
        ? VECTOR_ICONS[action.vector.toLowerCase()] || VECTOR_ICONS.default
        : VECTOR_ICONS.default;

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-[#a4a3d0]/10 to-white rounded-2xl p-6">
                <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                    <div className="h-6 bg-slate-100 rounded w-3/4 mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
                    <div className="h-14 bg-slate-200 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!action) {
        return (
            <div className="bg-gradient-to-br from-[#a4a3d0]/10 to-white rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">My Next Move</h3>
                <div className="bg-white rounded-xl shadow-md p-6 text-center">
                    <div className="text-3xl mb-3">✨</div>
                    <p className="text-slate-600 mb-4">
                        You've completed all recommended actions!
                    </p>
                    <Button
                        onClick={onExplore}
                        variant="outline"
                        className="border-2 border-[#8460ea] text-[#8460ea] hover:bg-[#8460ea]/10"
                    >
                        Explore More →
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#a4a3d0]/10 to-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">My Next Move</h3>

            <div className="bg-white rounded-xl shadow-md p-6">
                {/* Action Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8460ea]/20 to-[#6894d0]/20 flex items-center justify-center text-xl flex-shrink-0">
                        {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-bold text-slate-800 leading-tight">
                            {action.title}
                        </h4>
                        <p className="text-sm text-slate-500 mt-1">
                            {action.vector} Path · {action.duration || 10} min
                        </p>
                    </div>
                </div>

                {/* Why this action */}
                {action.whyRecommended && (
                    <p className="text-sm text-slate-600 italic mb-4 pl-14">
                        "{action.whyRecommended}"
                    </p>
                )}

                {/* START Button */}
                <Button
                    onClick={onStart}
                    className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-[#8460ea] to-[#6894d0] text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                    START
                    <span className="ml-2 text-sm opacity-80">+{action.xp || 15} XP</span>
                </Button>
            </div>

            {/* Explore link */}
            <button
                onClick={onExplore}
                className="mt-4 text-sm text-slate-500 hover:text-[#8460ea] w-full text-center transition-colors"
            >
                Not this? Explore more →
            </button>
        </div>
    );
}
