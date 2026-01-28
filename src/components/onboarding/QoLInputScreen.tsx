import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface QoLInputScreenProps {
    onSubmit: (scores: { spirit: number; mind: number; emotions: number; genius: number; body: number }) => void;
    onBack: () => void;
    onSkip?: () => void;
    saving?: boolean;
}

interface Vector {
    id: keyof QoLInputScreenProps["onSubmit"] extends (scores: infer S) => void ? keyof S : never;
    label: string;
    emoji: string;
    description: string;
}

const vectors: Vector[] = [
    { id: "spirit" as const, label: "Spirit", emoji: "✨", description: "Connection to meaning, purpose, transcendence" },
    { id: "mind" as const, label: "Mind", emoji: "🧠", description: "Mental clarity, learning, focus" },
    { id: "emotions" as const, label: "Emotions", emoji: "💜", description: "Emotional wellbeing, relationships" },
    { id: "genius" as const, label: "Genius", emoji: "⚡", description: "Creative expression, unique contribution" },
    { id: "body" as const, label: "Body", emoji: "💪", description: "Physical health, energy, vitality" },
];

/**
 * QoL Input Screen - 5-vector assessment
 * Based on Product Playbook wireframe: sliders for each life area
 */
const QoLInputScreen = ({ onSubmit, onBack, onSkip, saving = false }: QoLInputScreenProps) => {
    const [scores, setScores] = useState<Record<string, number>>({
        spirit: 5,
        mind: 5,
        emotions: 5,
        genius: 5,
        body: 5,
    });

    const handleSubmit = () => {
        onSubmit({
            spirit: scores.spirit,
            mind: scores.mind,
            emotions: scores.emotions,
            genius: scores.genius,
            body: scores.body,
        });
    };

    const average = Object.values(scores).reduce((a, b) => a + b, 0) / 5;

    return (
        <div className="min-h-dvh flex flex-col bg-gradient-to-br from-[var(--wabi-lavender)] via-[var(--wabi-background)] to-[var(--wabi-lilac)]">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[var(--wabi-text-secondary)] hover:text-[var(--wabi-text-primary)] transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-2 text-sm text-[var(--wabi-text-muted)]">
                    <span className="w-2 h-2 rounded-full bg-[var(--depth-violet)]" />
                    <span>Step 2 of 4</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col px-6 py-8">
                <div className="w-full max-w-lg mx-auto space-y-8">
                    {/* Title */}
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--wabi-text-primary)]">
                            Rate each area (1-10)
                        </h1>
                        <p className="text-[var(--wabi-text-secondary)]">
                            Be honest — this helps us personalize your path.
                        </p>
                    </div>

                    {/* Vectors */}
                    <div className="space-y-6">
                        {vectors.map((vector) => (
                            <div key={vector.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{vector.emoji}</span>
                                        <span className="font-medium text-[var(--wabi-text-primary)]">{vector.label}</span>
                                    </div>
                                    <span className="text-lg font-bold text-[var(--depth-violet)]">{scores[vector.id]}</span>
                                </div>
                                <Slider
                                    value={[scores[vector.id]]}
                                    onValueChange={(value) => setScores({ ...scores, [vector.id]: value[0] })}
                                    min={1}
                                    max={10}
                                    step={1}
                                    className="w-full"
                                />
                                <p className="text-xs text-[var(--wabi-text-muted)]">{vector.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Average */}
                    <div className="text-center py-4 border-t border-white/30">
                        <p className="text-sm text-[var(--wabi-text-muted)]">Overall Average</p>
                        <p className="text-2xl font-bold text-[var(--depth-violet)]">{average.toFixed(1)} / 10</p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        See My Results
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    {/* Skip option */}
                    {onSkip && (
                        <button
                            onClick={onSkip}
                            className="w-full text-center text-sm text-[var(--wabi-text-muted)] hover:text-[var(--wabi-text-secondary)] transition-colors"
                        >
                            Skip for now →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QoLInputScreen;
