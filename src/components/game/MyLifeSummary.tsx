import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLocalizedDomains, type DomainId } from "@/modules/quality-of-life-map/qolConfig";

// Domain icon + color from brandbook (labels come from useLocalizedDomains)
const DOMAIN_CONFIG: Record<DomainId, { icon: string; color: string }> = {
    wealth: { icon: "💰", color: "#cec9b0" },
    health: { icon: "❤️", color: "#b1c9b6" },
    happiness: { icon: "😊", color: "#a4a3d0" },
    love: { icon: "💕", color: "#cea4ae" },
    impact: { icon: "🌍", color: "#29549f" },
    growth: { icon: "📈", color: "#c8b7d8" },
    socialTies: { icon: "👥", color: "#cdaed2" },
    home: { icon: "🏠", color: "#a7cbd4" },
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
    const { t } = useTranslation();
    const localizedDomains = useLocalizedDomains();
    // Localized domain label lookup keyed by DomainId
    const domainLabel = (id: DomainId): string =>
        localizedDomains.find((d) => d.id === id)?.name ?? id;

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
        if (avg >= 8) return t("myLifeSummary.sentimentThriving");
        if (avg >= 6) return t("myLifeSummary.sentimentBalanced");
        if (avg >= 4) return t("myLifeSummary.sentimentGrowing");
        return t("myLifeSummary.sentimentBuilding");
    };

    // Day 91 (Sasha 2026-06-09): tokenized for Aurum - lapis falls back to the original bg-white/80
    return (
        <div className="bg-[var(--skin-card-fill,rgba(255,255,255,0.8))] backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--wabi-lavender)]/20 p-6 breathing-card">
            <h3 className="text-lg font-semibold text-[#2c3150] font-display mb-4">{t("myLifeSummary.title")}</h3>

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
                                        title={`${domainLabel(domain)}: ${score}/10`}
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
                                <span className="font-medium">{t("myLifeSummary.focusLabel")}</span>{" "}
                                {domainLabel(focusDomain.domain)} ({focusDomain.score}/10)
                            </p>
                        )}
                        {avgScore && (
                            <p className="text-[var(--wabi-text-muted)] mt-1">{getSentiment(avgScore)}</p>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-sm text-[var(--wabi-text-muted)] text-center italic">
                    {t("myLifeSummary.emptyState")}
                </p>
            )}

            {/* View Details Link */}
            <Link
                to="/game/transformation/qol-results"
                className="mt-4 text-sm text-[#b1c9b6] hover:underline flex items-center justify-center gap-1"
            >
                {t("myLifeSummary.seeDetails")} →
            </Link>
        </div>
    );
}
