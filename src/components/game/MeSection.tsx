import { Sparkles } from "lucide-react";

interface MeSectionProps {
    archetypeTitle?: string;
    level: number;
    xpTotal: number;
    xpToNextLevel?: number;
}

// XP needed per level (simple curve)
const XP_PER_LEVEL = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 20000];

const getXpForLevel = (level: number) => {
    if (level < XP_PER_LEVEL.length) return XP_PER_LEVEL[level];
    return XP_PER_LEVEL[XP_PER_LEVEL.length - 1] + (level - XP_PER_LEVEL.length + 1) * 5000;
};

const MeSection = ({ archetypeTitle, level, xpTotal }: MeSectionProps) => {
    const xpForCurrentLevel = getXpForLevel(level - 1);
    const xpForNextLevel = getXpForLevel(level);
    const xpInCurrentLevel = xpTotal - xpForCurrentLevel;
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-amber-100">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h2 className="font-semibold text-slate-900">
                        {archetypeTitle || "Discover Your Archetype"}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Level {level} · {xpTotal.toLocaleString()} XP
                    </p>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{xpInCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP</span>
                    <span>Level {level + 1}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MeSection;
