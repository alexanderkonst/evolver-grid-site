import { ArrowRight, Map, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourOverviewScreenProps {
    onStartTour: () => void;
    onSkipTour: () => void;
    saving?: boolean;
}

const TourOverviewScreen = ({ onStartTour, onSkipTour, saving = false }: TourOverviewScreenProps) => {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-white to-[var(--wabi-pearl)]">
            <div className="max-w-lg mx-auto text-center space-y-8">
                {/* Icon */}
                <div className="flex items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--wabi-lilac)] to-[var(--wabi-orchid)] flex items-center justify-center shadow-lg">
                        <Map className="w-8 h-8 text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm uppercase tracking-wide text-[var(--wabi-lilac)]">
                        Welcome
                    </p>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--wabi-text-primary)]">
                        Here's your new home
                    </h1>
                    <p className="text-lg text-[var(--wabi-text-secondary)] max-w-md mx-auto">
                        Let me show you around — it'll only take a minute.
                    </p>
                </div>

                {/* Time estimate */}
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--wabi-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--wabi-lilac)]" />
                    1 minute
                </div>

                {/* CTAs */}
                <div className="space-y-3 pt-4">
                    <Button
                        size="lg"
                        className="w-full max-w-sm h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-[var(--wabi-lilac)] to-[var(--wabi-orchid)] text-[var(--wabi-text-primary)] hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl"
                        onClick={onStartTour}
                        disabled={saving}
                    >
                        Show Me Around
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="lg"
                        className="w-full max-w-sm h-12 text-[var(--wabi-text-secondary)] hover:text-[var(--wabi-text-primary)]"
                        onClick={onSkipTour}
                        disabled={saving}
                    >
                        <SkipForward className="mr-2 h-4 w-4" />
                        Skip Tour
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TourOverviewScreen;
