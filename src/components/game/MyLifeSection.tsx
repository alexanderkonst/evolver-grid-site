import { BarChart3 } from "lucide-react";

interface QolDomain {
    key: string;
    label: string;
    score: number;
}

interface MyLifeSectionProps {
    qolScores: QolDomain[];
}

// Domain labels
const DOMAIN_LABELS: Record<string, string> = {
    wealth_stage: "Wealth",
    health_stage: "Health",
    happiness_stage: "Happiness",
    love_relationships_stage: "Love",
    impact_stage: "Impact",
    growth_stage: "Growth",
    social_ties_stage: "Social",
    home_stage: "Home"
};

// Colors for score levels
const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-emerald-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-amber-500";
    return "bg-red-500";
};

const MyLifeSection = ({ qolScores }: MyLifeSectionProps) => {
    // Sort by score to find lowest
    const sortedScores = [...qolScores].sort((a, b) => a.score - b.score);
    const lowestTwo = sortedScores.slice(0, 2);
    const lowestLabels = lowestTwo.map(d => d.label).join(" and ");

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 mb-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-100">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="font-semibold text-slate-900">My Life</h2>
            </div>

            {/* Domain bars */}
            <div className="space-y-2 mb-4">
                {qolScores.map(domain => {
                    const isLowest = lowestTwo.some(d => d.key === domain.key);
                    return (
                        <div key={domain.key} className="flex items-center gap-3">
                            <span className={`text-xs w-16 ${isLowest ? 'font-semibold text-amber-700' : 'text-slate-600'}`}>
                                {domain.label}
                            </span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${getScoreColor(domain.score)}`}
                                    style={{ width: `${domain.score * 10}%` }}
                                />
                            </div>
                            <span className={`text-xs w-4 text-right ${isLowest ? 'font-semibold text-amber-700' : 'text-slate-500'}`}>
                                {domain.score}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Insight */}
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                <span className="font-medium">Your life is asking for attention in:</span>{" "}
                <span className="text-amber-700 font-semibold">{lowestLabels}</span>
            </p>
        </div>
    );
};

export { DOMAIN_LABELS };
export default MyLifeSection;
