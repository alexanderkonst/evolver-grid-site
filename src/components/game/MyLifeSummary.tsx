import { Link } from "react-router-dom";
import { type DomainId } from "@/modules/quality-of-life-map/qolConfig";

// Domain configuration with colors from brandbook
const DOMAIN_CONFIG: Record<DomainId, { icon: string; color: string; label: string }> = {
    wealth: { icon: "💰", color: "#cec9b0", label: "Wealth" },
    health: { icon: "❤️", color: "#b1c9b6", label: "Health" },
    happiness: { icon: "😊", color: "#a4a3d0", label: "Happiness" },
    love: { icon: "💕", color: "#cea4ae", label: "Love" },
    impact: { icon: "🌍", color: "#29549f", label: "Impact" },
    growth: { icon: "📈", color: "#c8b7d8", label: "Growth" },
    socialTies: { icon: "👥", color: "#cdaed2", label: "Social" },
    home: { icon: "🏠", color: "#a7cbd4", label: "Home" },
};

interface QolScores {
    wealth: number;
    health: number;
    happiness: number;
    love: number;
    impact: number;
    growth: number;
    social: number;
    home: number;
}

interface MyLifeSummaryProps {
    scores?: Partial<QolScores> | null;
}

/**
 * MyLifeSummary - Shows where I am across 8 life domains
 * Simplified view: shows focus area (lowest) and overall sentiment
 */
export default function MyLifeSummary({ scores }: MyLifeSummaryProps) {
    // Find lowest domain (focus area)
    const findFocusDomain = (): { domain: DomainId; score: number } | null => {
        if (!scores) return null;

        let lowest: { domain: DomainId; score: number } | null = null;

        for (const [domain, score] of Object.entries(scores)) {
            if (typeof score === "number" && score > 0) {
                if (!lowest || score < lowest.score) {
                    lowest = { domain: domain as DomainId, score };
                }
            }
        }

        return lowest;
    };

    // Calculate average score for sentiment
    const getAverageScore = (): number | null => {
        if (!scores) return null;

        const validScores = Object.values(scores).filter(
            (s): s is number => typeof s === "number" && s > 0
        );

        if (validScores.length === 0) return null;
        return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
    };

    const focusDomain = findFocusDomain();
    const avgScore = getAverageScore();

    // Sentiment based on average
    const getSentiment = (avg: number): string => {
        if (avg >= 8) return "Thriving";
        if (avg >= 6) return "Balanced";
        if (avg >= 4) return "Growing";
        return "Building foundations";
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--wabi-lavender)]/20 p-6">
            <h3 className="text-lg font-semibold text-[#2c3150] font-display mb-4">My Life</h3>

            {scores ? (
                <>
                    {/* Domain dots visualization */}
                    <div className="flex justify-center gap-2 mb-4">
                        {(Object.entries(DOMAIN_CONFIG) as [DomainId, typeof DOMAIN_CONFIG[DomainId]][]).map(
                            ([domain, config]) => {
                                const score = scores[domain] ?? 0;
                                const opacity = score > 0 ? 0.3 + (score / 10) * 0.7 : 0.1;

                                return (
                                    <div
                                        key={domain}
                                        className="flex flex-col items-center"
                                        title={`${config.label}: ${score}/10`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                            style={{
                                                backgroundColor: config.color,
                                                opacity,
                                            }}
                                        >
                                            {config.icon}
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>

                    {/* Focus area + sentiment */}
                    <div className="text-center text-sm text-[rgba(44,49,80,0.7)]">
                        {focusDomain && (
                            <p>
                                <span className="font-medium">Focus:</span>{" "}
                                {DOMAIN_CONFIG[focusDomain.domain].label} ({focusDomain.score}/10)
                            </p>
                        )}
                        {avgScore && (
                            <p className="text-[var(--wabi-text-muted)] mt-1">{getSentiment(avgScore)}</p>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-sm text-[var(--wabi-text-muted)] text-center italic">
                    No life map yet
                </p>
            )}

            {/* View Details Link */}
            <Link
                to="/game/transformation/qol-results"
                className="mt-4 text-sm text-[#b1c9b6] hover:underline flex items-center justify-center gap-1"
            >
                See Details →
            </Link>
        </div>
    );
}
