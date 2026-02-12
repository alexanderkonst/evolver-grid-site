import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
    onStart: () => void;
    saving?: boolean;
}

const WelcomeScreen = ({ onStart, saving = false }: WelcomeScreenProps) => {
    return (
        <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--wabi-lavender)] via-[var(--wabi-lilac)] to-[var(--wabi-orchid)] opacity-20" />

            {/* Animated bokeh circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[var(--depth-violet)] opacity-10 blur-3xl float-animation" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--wabi-aqua)] opacity-15 blur-3xl float-animation" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-[var(--wabi-blush)] opacity-10 blur-2xl float-animation" style={{ animationDelay: '2s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-lg mx-auto text-center space-y-8">
                {/* Logo/Icon */}
                <div className="flex items-center justify-center">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--depth-violet)] to-[var(--depth-cornflower)] flex items-center justify-center shadow-xl orb-pulse">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--wabi-text-primary)] leading-tight">
                        Discover your genius. Grow yourself. Transform your life.
                    </h1>
                </div>

                {/* CTA */}
                <Button
                    size="lg"
                    className="w-full max-w-sm h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    onClick={onStart}
                    disabled={saving}
                >
                    Begin My Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default WelcomeScreen;
