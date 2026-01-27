import { Link } from "react-router-dom";
import { User } from "lucide-react";

interface MeSummaryProps {
    archetypeTitle?: string | null;
    level: number;
    xpTotal: number;
    xpToNextLevel?: number;
}

/**
 * MeSummary - Shows who I am at a glance
 * Part of Daily Loop home screen
 */
export default function MeSummary({
    archetypeTitle,
    level,
    xpTotal,
    xpToNextLevel = 100,
}: MeSummaryProps) {
    // Calculate XP progress within current level
    const xpInCurrentLevel = xpTotal % xpToNextLevel;
    const progressPercent = (xpInCurrentLevel / xpToNextLevel) * 100;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-start gap-4">
                {/* Archetype Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a4a3d0] to-[#8460ea] flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-800 truncate">
                        {archetypeTitle || "Discovering..."}
                    </h2>
                    <p className="text-sm text-slate-500">
                        Level {level} · {xpTotal.toLocaleString()} XP
                    </p>

                    {/* XP Progress Bar */}
                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#8460ea] to-[#6894d0] transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {xpInCurrentLevel} / {xpToNextLevel} to level {level + 1}
                    </p>
                </div>
            </div>

            {/* View Profile Link */}
            <Link
                to="/game/profile"
                className="mt-4 text-sm text-[#8460ea] hover:underline flex items-center gap-1"
            >
                View Profile →
            </Link>
        </div>
    );
}
