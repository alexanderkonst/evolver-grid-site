import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ZoGRevealScreenProps {
    archetypeTitle: string;
    corePattern: string;
    topTalents?: string[];
    onContinue: () => void;
    onViewDetails?: () => void;
    saving?: boolean;
}

/**
 * ZoG Reveal Screen - Celebration moment showing user their Zone of Genius
 * Based on Product Playbook wireframe: "THIS IS YOU" + 12-perspective statement
 */
const ZoGRevealScreen = ({
    archetypeTitle,
    corePattern,
    topTalents = [],
    onContinue,
    onViewDetails,
    saving = false
}: ZoGRevealScreenProps) => {
    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-[var(--wabi-lavender)] via-[var(--wabi-background)] to-[var(--wabi-lilac)] relative overflow-hidden">
            {/* Celebration background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--depth-violet)] opacity-10 blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[var(--wabi-aqua)] opacity-15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-[var(--wabi-blush)] opacity-10 blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-end relative z-10">
                <div className="flex items-center gap-2 text-sm text-[var(--wabi-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--depth-violet)]" />
                    <span>Step 1 of 4</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
                <div className="w-full max-w-lg text-center space-y-8">

                    {/* Celebration header */}
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--depth-violet)]/10 text-[var(--depth-violet)]">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">Your Genius Revealed</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--wabi-text-primary)]">
                            ✨ This is YOU ✨
                        </h1>
                    </div>

                    {/* Genius Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl space-y-6">
                        {/* Archetype Title */}
                        <div className="space-y-2">
                            <p className="text-sm text-[var(--wabi-text-muted)] uppercase tracking-wider">Your Archetype</p>
                            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] bg-clip-text text-transparent">
                                {archetypeTitle}
                            </h2>
                        </div>

                        {/* Core Pattern */}
                        <div className="space-y-2">
                            <p className="text-sm text-[var(--wabi-text-muted)] uppercase tracking-wider">Core Pattern</p>
                            <p className="text-lg text-[var(--wabi-text-primary)] leading-relaxed italic">
                                "{corePattern}"
                            </p>
                        </div>

                        {/* Top Talents */}
                        {topTalents.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm text-[var(--wabi-text-muted)] uppercase tracking-wider">Top Talents</p>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {topTalents.slice(0, 3).map((talent, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 rounded-full bg-[var(--depth-violet)]/10 text-[var(--depth-violet)] text-sm font-medium"
                                        >
                                            {talent}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* View Details Link */}
                        {onViewDetails && (
                            <button
                                onClick={onViewDetails}
                                className="text-[var(--depth-violet)] text-sm font-medium hover:underline"
                            >
                                View all 12 perspectives →
                            </button>
                        )}
                    </div>

                    {/* Significance */}
                    <p className="text-[var(--wabi-text-secondary)] max-w-md mx-auto">
                        This clarity will guide every decision you make on your transformation journey.
                    </p>

                    {/* Continue Button */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        onClick={onContinue}
                        disabled={saving}
                    >
                        Continue to Life Assessment
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ZoGRevealScreen;
