import { useState } from "react";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ZoGInputScreenProps {
    onSubmit: (answers: { loves: string; thankedFor: string }) => void;
    onBack: () => void;
    saving?: boolean;
}

/**
 * ZoG Input Screen - Collects user input for Zone of Genius generation
 * Based on Product Playbook wireframe: questions about what user loves and what they're thanked for
 */
const ZoGInputScreen = ({ onSubmit, onBack, saving = false }: ZoGInputScreenProps) => {
    const [loves, setLoves] = useState("");
    const [thankedFor, setThankedFor] = useState("");

    const canSubmit = loves.trim().length >= 10 && thankedFor.trim().length >= 10;

    const handleSubmit = () => {
        if (canSubmit) {
            onSubmit({ loves: loves.trim(), thankedFor: thankedFor.trim() });
        }
    };

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
                    <span>Step 1 of 4</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
                <div className="w-full max-w-lg space-y-8">
                    {/* Title */}
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[var(--depth-violet)] to-[var(--depth-cornflower)] flex items-center justify-center mb-4">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[var(--wabi-text-primary)]">
                            Tell us about yourself
                        </h1>
                        <p className="text-[var(--wabi-text-secondary)]">
                            Your answers help us discover your unique genius.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="space-y-6">
                        {/* Question 1 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--wabi-text-primary)]">
                                What do you love doing?
                                <span className="text-[var(--wabi-text-muted)]"> (What activities make you lose track of time?)</span>
                            </label>
                            <Textarea
                                value={loves}
                                onChange={(e) => setLoves(e.target.value)}
                                placeholder="I love creating systems that help people understand complex ideas..."
                                className="min-h-[120px] bg-white/80 backdrop-blur-sm border-white/50 focus:border-[var(--depth-violet)] resize-none"
                            />
                        </div>

                        {/* Question 2 */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[var(--wabi-text-primary)]">
                                What do people thank you for?
                                <span className="text-[var(--wabi-text-muted)]"> (What unique value do you bring?)</span>
                            </label>
                            <Textarea
                                value={thankedFor}
                                onChange={(e) => setThankedFor(e.target.value)}
                                placeholder="People thank me for making the complex simple, for seeing patterns others miss..."
                                className="min-h-[120px] bg-white/80 backdrop-blur-sm border-white/50 focus:border-[var(--depth-violet)] resize-none"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                        disabled={!canSubmit || saving}
                    >
                        {saving ? "Generating..." : "Generate My Genius"}
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    {/* Helper text */}
                    {!canSubmit && (
                        <p className="text-center text-sm text-[var(--wabi-text-muted)]">
                            Please write at least a few sentences for each question.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZoGInputScreen;
