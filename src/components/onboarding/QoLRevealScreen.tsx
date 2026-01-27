import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QoLRevealScreenProps {
    scores: { spirit: number; mind: number; emotions: number; genius: number; body: number };
    focusArea?: string;
    onContinue: () => void;
    saving?: boolean;
}

/**
 * QoL Reveal Screen - Shows radar chart and focus area
 * Based on Product Playbook wireframe: visual representation of life balance
 */
const QoLRevealScreen = ({ scores, focusArea, onContinue, saving = false }: QoLRevealScreenProps) => {
    const average = Object.values(scores).reduce((a, b) => a + b, 0) / 5;
    const lowestEntry = Object.entries(scores).reduce((a, b) => a[1] < b[1] ? a : b);
    const lowest = { id: lowestEntry[0], score: lowestEntry[1] };

    const labelMap: Record<string, { emoji: string; label: string }> = {
        spirit: { emoji: "✨", label: "Spirit" },
        mind: { emoji: "🧠", label: "Mind" },
        emotions: { emoji: "💜", label: "Emotions" },
        genius: { emoji: "⚡", label: "Genius" },
        body: { emoji: "💪", label: "Body" },
    };

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-[var(--wabi-lavender)] via-[var(--wabi-background)] to-[var(--wabi-lilac)] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[var(--wabi-sage)] opacity-15 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-[var(--wabi-aqua)] opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-end relative z-10">
                <div className="flex items-center gap-2 text-sm text-[var(--wabi-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--depth-violet)]" />
                    <span>Step 2 of 4</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-lg text-center space-y-8">
                    {/* Title */}
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--wabi-text-primary)]">
                            ✨ Your Life Balance ✨
                        </h1>
                        <p className="text-[var(--wabi-text-secondary)]">
                            Here's where you are right now.
                        </p>
                    </div>

                    {/* Score Display */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl">
                        {/* Pentagon visualization simplified to list */}
                        <div className="space-y-4 mb-6">
                            {Object.entries(scores).map(([key, value]) => {
                                const { emoji, label } = labelMap[key] || { emoji: "•", label: key };
                                const isLowest = key === lowest.id;
                                return (
                                    <div
                                        key={key}
                                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${isLowest
                                                ? 'bg-[var(--wabi-blush)]/20 border border-[var(--wabi-blush)]/30'
                                                : 'bg-white/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{emoji}</span>
                                            <span className="font-medium text-[var(--wabi-text-primary)]">{label}</span>
                                            {isLowest && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--wabi-blush)] text-white">
                                                    Focus area
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] transition-all"
                                                    style={{ width: `${value * 10}%` }}
                                                />
                                            </div>
                                            <span className="text-lg font-bold text-[var(--depth-violet)] w-8 text-right">{value}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Overall */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-[var(--wabi-text-muted)]">Overall Balance</p>
                            <p className="text-3xl font-bold text-[var(--depth-violet)]">{average.toFixed(1)} / 10</p>
                        </div>
                    </div>

                    {/* Insight */}
                    <div className="bg-[var(--depth-violet)]/10 rounded-2xl p-4 text-left">
                        <p className="text-sm text-[var(--depth-violet)]">
                            <span className="font-bold">💡 Insight:</span> Your {labelMap[lowest.id]?.label} ({lowest.score}/10) is your current focus area.
                            We'll help you grow here first.
                        </p>
                    </div>

                    {/* Continue Button */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        onClick={onContinue}
                        disabled={saving}
                    >
                        Show Me Around
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QoLRevealScreen;
