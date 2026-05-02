import { useState } from "react";
import { Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
    SPECIFICITY_PROMPT,
    useResonanceMessage,
    type ResonanceStep,
} from "@/lib/resonanceMatrix";

interface ResonanceRatingProps {
    /**
     * The funnel step this rating belongs to. When provided, the
     * post-rating message comes from the Specificity Loop matrix
     * (matrix v2 — see lib/resonanceMatrix.ts and the playbook).
     * Without it, the component falls back to the legacy thank-you
     * (so any caller that hasn't been migrated still works).
     */
    step?: ResonanceStep;
    question?: string;
    onRate: (rating: number) => void;
    disabled?: boolean;
}

/**
 * ResonanceRating — 1-10 specificity-to-self capture.
 *
 * The question we are really asking, beneath the surface wording, is
 * SPECIFICITY_PROMPT ("how specific to what you know about you is
 * this articulation?"). On rating, we do NOT thank the user — we
 * mirror back an identity-revelation question matched to their tier
 * (resonant / partial / off). See the playbook for the protocol.
 */
const ResonanceRating = ({
    step,
    question = "How well does this match your brightest self?",
    onRate,
    disabled = false,
}: ResonanceRatingProps) => {
    const [selectedRating, setSelectedRating] = useState<number | null>(null);
    const [hasRated, setHasRated] = useState(false);

    const handleRate = (rating: number) => {
        if (disabled || hasRated) return;
        setSelectedRating(rating);
        setHasRated(true);
        onRate(rating);
    };

    // Resolve the reveal message via the hook so a per-founder matrix
    // (when wrapped in <ResonanceMatrixProvider>) wins over the master.
    // Hook is called unconditionally per Rules of Hooks; result is only
    // used when both step and rating are present.
    const { message: revealFromMatrix } = useResonanceMessage(
        step ?? "appleseed",
        selectedRating ?? 5,
    );

    if (hasRated && selectedRating !== null) {
        const reveal = step ? revealFromMatrix : null;

        if (reveal) {
            // Day 58 (Sasha 2026-05-02): the resonance-aftermath copy is
            // now markdown — short for the resonant tier, longer for
            // partial/off (with inline links to coach booking and
            // personality tests). React-markdown renders the links;
            // the styled `<a>` carries the editorial gold-link register.
            return (
                <div className="text-center py-6 animate-in fade-in duration-700 max-w-xl mx-auto px-4">
                    <div
                        className="leading-relaxed"
                        style={{
                            fontFamily: "'Source Serif 4', serif",
                            fontSize: "clamp(1.05rem, 2.3vw, 1.3rem)",
                            fontWeight: 500,
                            color: "var(--skin-text-primary, #2c3150)",
                            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                        }}
                    >
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => (
                                    <p className="my-2">{children}</p>
                                ),
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium underline underline-offset-2 transition-colors hover:opacity-80"
                                        style={{
                                            color: "var(--skin-accent-gold, #b8860b)",
                                            textDecorationColor:
                                                "rgba(184, 134, 11, 0.5)",
                                        }}
                                    >
                                        {children}
                                    </a>
                                ),
                            }}
                        >
                            {reveal}
                        </ReactMarkdown>
                    </div>
                </div>
            );
        }

        // Legacy fallback for any caller without a step.
        return (
            <div className="text-center py-3 animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#8460ea]/10 to-[#a78bfa]/10 rounded-full">
                    <Sparkles
                        className="w-4 h-4"
                        style={{ color: "var(--skin-selected-text, #8460ea)" }}
                    />
                    <span
                        className="text-sm"
                        style={{ color: "var(--skin-text-primary, #2c3150)" }}
                    >
                        {selectedRating === 10
                            ? "🎯 Perfect resonance!"
                            : `Rated ${selectedRating}/10`}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="py-4 space-y-3">
            <p
                className="text-center text-sm leading-relaxed px-2"
                style={{ color: "var(--skin-text-muted, #6b7280)" }}
            >
                {step ? SPECIFICITY_PROMPT : question}
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
                        `}
                        style={
                            selectedRating === num
                                ? {
                                      backgroundColor:
                                          "var(--skin-selected-text, #8460ea)",
                                      color: "#ffffff",
                                      boxShadow:
                                          "0 10px 15px -3px rgba(132, 96, 234, 0.3)",
                                      borderColor: "transparent",
                                      borderWidth: "1px",
                                      borderStyle: "solid",
                                  }
                                : {
                                      backgroundColor:
                                          "var(--skin-input-bg, #ffffff)",
                                      borderColor:
                                          "var(--skin-rule-medium, #e5e7eb)",
                                      borderWidth: "1px",
                                      borderStyle: "solid",
                                      color: "var(--skin-text-primary, #374151)",
                                  }
                        }
                    >
                        {num}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ResonanceRating;
