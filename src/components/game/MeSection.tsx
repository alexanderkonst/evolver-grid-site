import { Sparkles } from "lucide-react";

interface MeSectionProps {
    archetypeTitle?: string;
    level: number;
    xpTotal: number;
    xpToNextLevel?: number;
    displayName?: string;
    avatarUrl?: string | null;
}

// XP needed per level (simple curve)
const XP_PER_LEVEL = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 20000];

const getXpForLevel = (level: number) => {
    if (level < XP_PER_LEVEL.length) return XP_PER_LEVEL[level];
    return XP_PER_LEVEL[XP_PER_LEVEL.length - 1] + (level - XP_PER_LEVEL.length + 1) * 5000;
};

// Calculate actual level from XP total (fixes mismatch between DB level and xpTotal)
const getLevelFromXp = (xpTotal: number): number => {
    let level = 1;
    while (getXpForLevel(level) <= xpTotal && level < 100) {
        level++;
    }
    return level;
};

const MeSection = ({ archetypeTitle, level: dbLevel, xpTotal, displayName, avatarUrl }: MeSectionProps) => {
    // Use XP-derived level to avoid mismatch bugs
    const level = getLevelFromXp(xpTotal);
    const xpForCurrentLevel = getXpForLevel(level - 1);
    const xpForNextLevel = getXpForLevel(level);
    const xpInCurrentLevel = Math.max(0, xpTotal - xpForCurrentLevel);
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100));

    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Profile avatar"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                            }}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Sparkles className="w-5 h-5 text-amber-600" />
                    )}
                </div>
                <div>
                    {displayName && (
                        <p className="text-sm text-slate-500">{displayName}</p>
                    )}
                    <h2 className="font-semibold text-[#2c3150]">
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
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MeSection;
