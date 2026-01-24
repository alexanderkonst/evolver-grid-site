import { useState } from "react";
import { Sparkles } from "lucide-react";

interface ResonanceRatingProps {
    question?: string;
    onRate: (rating: number) => void;
    disabled?: boolean;
}

/**
 * ResonanceRating - 1-10 rating component for validation metrics
 * Used after Appleseed and Excalibur generation to capture resonance
 */
const ResonanceRating = ({
    question = "How well does this match your brightest self?",
    onRate,
    disabled = false
}: ResonanceRatingProps) => {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [hasRated, setHasRated] = useState(false);

    const handleRate = (rating: number) => {
        if (disabled || hasRated) return;
        setSelectedRating(rating);
        setHasRated(true);
        onRate(rating);
    };

    if (hasRated) {
        return (
            <div className="text-center py-3 animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8460ea]/10 to-[#a78bfa]/10 rounded-full">
                    <Sparkles className="w-4 h-4 text-[#8460ea]" />
                    <span className="text-sm text-[#2c3150]">
                        Thank you! {selectedRating === 10 ? "🎯 Perfect resonance!" : `Rated ${selectedRating}/10`}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4 space-y-3">
            <p className="text-center text-sm text-[#6b7280] leading-relaxed px-2">
                {question}
            </p>
            <div className="flex justify-center gap-1.5 flex-wrap px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleRate(num)}
                        disabled={disabled}
                        className={`
                            w-9 h-9 rounded-lg text-sm font-medium
                            transition-all duration-200
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                            ${selectedRating === num
                                ? 'bg-[#8460ea] text-white shadow-lg shadow-[#8460ea]/30'
                                : 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#8460ea] hover:text-[#8460ea]'
                            }
                        `}
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ResonanceRating;
