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

// Colors for score levels - brandbook aligned
const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-[#b1c9b6]";  // Sage - great
    if (score >= 6) return "bg-[#6894d0]";  // Cornflower - good
    if (score >= 4) return "bg-[#a4a3d0]";  // Lavender - needs attention
    return "bg-[#cea4ae]";                   // Blush - urgent
};

const MyLifeSection = ({ qolScores }: MyLifeSectionProps) => {
    // Sort by score to find lowest
    const sortedScores = [...qolScores].sort((a, b) => a.score - b.score);
    const lowestTwo = sortedScores.slice(0, 2);
    const lowestLabels = lowestTwo.map(d => d.label).join(" and ");

    return (
        <div className="rounded-xl border border-[#a4a3d0]/20 bg-white/85 backdrop-blur-sm p-5 mb-4 shadow-[0_4px_16px_rgba(44,49,80,0.06)] breathing-card">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-[#6894d0]/20">
                    <BarChart3 className="w-5 h-5 text-[#6894d0]" />
                </div>
                <h2 className="font-display text-lg font-semibold text-[#2c3150]">My Life</h2>
            </div>

            {/* Domain bars */}
            <div className="space-y-2 mb-4">
                {qolScores.map(domain => {
                    const isLowest = lowestTwo.some(d => d.key === domain.key);
                    return (
                        <div key={domain.key} className="flex items-center gap-3">
                            <span className={`text-xs w-16 ${isLowest ? 'font-semibold text-[#8460ea]' : 'text-[#2c3150]/70'}`}>
                                {domain.label}
                            </span>
                            <div className="flex-1 h-2 bg-[#a4a3d0]/15 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${getScoreColor(domain.score)}`}
                                    style={{ width: `${domain.score * 10}%` }}
                                />
                            </div>
                            <span className={`text-xs w-4 text-right ${isLowest ? 'font-semibold text-[#8460ea]' : 'text-[#2c3150]/50'}`}>
                                {domain.score}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Insight */}
            <p className="text-sm text-[#2c3150]/70 bg-[#f0f4ff]/60 rounded-lg p-3">
                <span className="font-medium">Your life is asking for attention in:</span>{" "}
                <span className="text-[#8460ea] font-semibold">{lowestLabels}</span>
            </p>
        </div>
    );
};

export { DOMAIN_LABELS };
export default MyLifeSection;
