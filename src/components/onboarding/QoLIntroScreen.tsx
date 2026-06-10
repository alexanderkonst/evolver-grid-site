import { ArrowLeft, ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QoLIntroScreenProps {
    onStart: () => void;
    onSkip: () => void;
    onBack?: () => void;
    saving?: boolean;
}

const QoLIntroScreen = ({ onStart, onSkip, onBack, saving = false }: QoLIntroScreenProps) => {
    // Day 91 (Sasha 2026-06-09): tokenized for Aurum. Full-viewport
    // white-to-pearl wash now reads --skin-page-wash (defined by the
    // dark skins); the original gradient stays as the Lapis fallback.
    return (
        <div
            className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 relative"
            style={{ background: "var(--skin-page-wash, linear-gradient(to bottom, #fff, var(--wabi-pearl)))" }}
        >
            {/* Back button */}
            {onBack && (
                <button
                    className="absolute top-6 left-6 flex items-center gap-1 text-sm text-[var(--wabi-text-muted)] hover:text-[var(--wabi-text-secondary)] transition-colors"
                    onClick={onBack}
                    disabled={saving}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            )}

            <div className="max-w-lg mx-auto text-center space-y-8">
                {/* Icon */}
                <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--wabi-aqua)] to-[var(--wabi-sage)] flex items-center justify-center shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <p className="text-sm uppercase tracking-wide text-[var(--wabi-sage)]">
                        Quality of Life
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--wabi-text-primary)]">
                        Now let's see where you are in life
                    </h1>
                    <p className="text-lg text-[var(--wabi-text-secondary)] max-w-md mx-auto">
                        We'll assess 8 key areas of your life to find your biggest growth opportunity.
                    </p>
                </div>

                {/* 8 domains preview */}
                <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                    {['💰', '❤️', '😊', '💕', '🌍', '📈', '👥', '🏠'].map((emoji, i) => (
                        <div key={i} className="w-12 h-12 rounded-xl bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] flex items-center justify-center text-xl shadow-sm">
                            {emoji}
                        </div>
                    ))}
                </div>

                {/* Time estimate */}
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--wabi-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--wabi-sage)]" />
                    3-5 minutes
                </div>

                {/* CTA */}
                <div className="space-y-3 pt-4">
                    <Button
                        size="lg"
                        className="w-full max-w-sm h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-[var(--wabi-sage)] to-[var(--wabi-aqua)] text-[var(--wabi-text-primary)] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
                        onClick={onStart}
                        disabled={saving}
                    >
                        Map My Life
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <button
                        className="text-sm text-[var(--wabi-text-muted)] hover:text-[var(--wabi-text-secondary)] transition-colors"
                        onClick={onSkip}
                        disabled={saving}
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QoLIntroScreen;
