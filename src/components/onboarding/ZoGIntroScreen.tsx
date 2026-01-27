import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoGIntroScreenProps {
    onStart: () => void;
    onSkip: () => void;
    onBack?: () => void;
    saving?: boolean;
}

const ZoGIntroScreen = ({ onStart, onSkip, onBack, saving = false }: ZoGIntroScreenProps) => {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-white to-[var(--wabi-pearl)] relative">
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--wabi-lavender)] to-[var(--depth-violet)] flex items-center justify-center shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <p className="text-sm uppercase tracking-wide text-[var(--depth-violet)]">
                        Zone of Genius
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--wabi-text-primary)]">
                        Let's discover who you really are
                    </h1>
                    <p className="text-lg text-[var(--wabi-text-secondary)] max-w-md mx-auto">
                        Your Zone of Genius is where your natural talents meet your deepest passions —
                        what you do best without even trying.
                    </p>
                </div>

                {/* Time estimate */}
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--wabi-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--depth-violet)]" />
                    5-7 minutes
                </div>

                {/* CTA */}
                <div className="space-y-3 pt-4">
                    <Button
                        size="lg"
                        className="w-full max-w-sm h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
                        onClick={onStart}
                        disabled={saving}
                    >
                        Discover My Genius
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

export default ZoGIntroScreen;
