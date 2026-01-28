import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface TourCompleteScreenProps {
    hasZog: boolean;
    hasQol: boolean;
    onFinish: () => void;
    saving?: boolean;
}

/**
 * Tour Complete Screen - Final celebration before dashboard
 * Based on Product Playbook wireframe: "You're Ready!" with confetti
 */
const TourCompleteScreen = ({ hasZog, hasQol, onFinish, saving = false }: TourCompleteScreenProps) => {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Trigger confetti on mount
        const timer = setTimeout(() => {
            setShowConfetti(true);
            try {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } catch (e) {
                // Confetti not available, that's ok
            }
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const completedItems = [
        { label: "Zone of Genius articulated", done: hasZog },
        { label: "Quality of Life baseline", done: hasQol },
        { label: "Platform tour complete", done: true },
    ];

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-[var(--wabi-lavender)] via-[var(--wabi-background)] to-[var(--wabi-lilac)] relative overflow-hidden">
            {/* Celebration background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--depth-violet)] opacity-10 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--wabi-sage)] opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-[var(--wabi-aqua)] opacity-10 blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-end relative z-10">
                <div className="flex items-center gap-2 text-sm text-[var(--wabi-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--wabi-sage)]" />
                    <span>Step 4 of 4</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-lg text-center space-y-8">

                    {/* Celebration Icon */}
                    <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[var(--depth-violet)] to-[var(--depth-cornflower)] flex items-center justify-center shadow-xl transition-transform duration-500 ${showConfetti ? 'scale-100' : 'scale-0'}`}>
                        <Sparkles className="w-12 h-12 text-white" />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--wabi-text-primary)]">
                            🎉 You're Ready! 🎉
                        </h1>
                        <p className="text-lg text-[var(--wabi-text-secondary)]">
                            Your transformation journey begins now.
                        </p>
                    </div>

                    {/* Completed Items */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg space-y-4">
                        <p className="text-sm text-[var(--wabi-text-muted)] uppercase tracking-wider">You now have:</p>
                        {completedItems.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 text-left"
                            >
                                <CheckCircle2
                                    className={`w-6 h-6 flex-shrink-0 ${item.done ? 'text-[var(--wabi-sage)]' : 'text-gray-300'
                                        }`}
                                />
                                <span className={`text-lg ${item.done ? 'text-[var(--wabi-text-primary)]' : 'text-[var(--wabi-text-muted)]'
                                    }`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Next step hint */}
                    <p className="text-[var(--wabi-text-secondary)]">
                        Your first recommended action is waiting.
                    </p>

                    {/* CTA */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        onClick={onFinish}
                        disabled={saving}
                    >
                        Go to My Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TourCompleteScreen;
