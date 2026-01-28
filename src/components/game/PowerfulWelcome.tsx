import { useMemo } from "react";
import { Sparkles, TrendingUp, Flame, Star } from "lucide-react";

interface PowerfulWelcomeProps {
    firstName?: string | null;
    archetypeTitle?: string | null;
    corePattern?: string | null;
    level?: number;
    xpTotal?: number;
    streakDays?: number;
    totalActions?: number;
    onContinue?: () => void;
}

/**
 * Epic first-screen welcome with:
 * - Gradient background matching landing aesthetic
 * - Personalized archetype display
 * - Progress stats ring
 * - One powerful CTA
 */
const PowerfulWelcome = ({
    firstName,
    archetypeTitle,
    corePattern,
    level = 1,
    xpTotal = 0,
    streakDays = 0,
    totalActions = 0,
    onContinue,
}: PowerfulWelcomeProps) => {
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    }, []);

    const progressPercent = Math.min((xpTotal / (level * 100)) * 100, 100);

    return (
        <div className="relative overflow-hidden rounded-3xl mb-8">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8460ea] via-[#a4a3d0] to-[#a7cbd4]" />

            {/* Bokeh overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.3)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15)_0%,transparent_50%)]" />

            {/* Content */}
            <div className="relative px-6 py-10 sm:px-10 sm:py-14 text-center">
                {/* Greeting */}
                <p className="text-white/70 text-sm uppercase tracking-widest mb-2 font-medium">
                    {greeting}{firstName ? `, ${firstName}` : ""}
                </p>

                {/* Archetype Title - The Star */}
                {archetypeTitle ? (
                    <h1
                        className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-white mb-3 leading-tight"
                        style={{ textShadow: "0 0 60px rgba(255,255,255,0.4)" }}
                    >
                        {archetypeTitle}
                    </h1>
                ) : (
                    <h1
                        className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-white mb-3"
                        style={{ textShadow: "0 0 60px rgba(255,255,255,0.4)" }}
                    >
                        Your Journey Awaits
                    </h1>
                )}

                {/* Core Pattern - subtitle */}
                {corePattern && (
                    <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto mb-6 italic">
                        "{corePattern}"
                    </p>
                )}

                {/* Stats Row */}
                <div className="flex justify-center gap-6 sm:gap-10 mb-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-white/80 mb-1">
                            <Star className="w-4 h-4" />
                            <span className="text-lg sm:text-xl font-bold">{level}</span>
                        </div>
                        <p className="text-white/50 text-xs uppercase tracking-wide">Level</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-white/80 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-lg sm:text-xl font-bold">{xpTotal}</span>
                        </div>
                        <p className="text-white/50 text-xs uppercase tracking-wide">XP</p>
                    </div>

                    {streakDays > 0 && (
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-amber-300 mb-1">
                                <Flame className="w-4 h-4" />
                                <span className="text-lg sm:text-xl font-bold">{streakDays}</span>
                            </div>
                            <p className="text-white/50 text-xs uppercase tracking-wide">Streak</p>
                        </div>
                    )}
                </div>

                {/* Progress Ring */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="42"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="50" cy="50" r="42"
                            stroke="white"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
                            className="transition-all duration-700"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* CTA */}
                {onContinue && (
                    <button
                        onClick={onContinue}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold text-sm uppercase tracking-wide border border-white/30 hover:bg-white/30 transition-all hover:scale-105 active:scale-95"
                    >
                        Continue Your Journey
                        <span className="text-lg">→</span>
                    </button>
                )}
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        style={{
                            width: `${6 + (i % 3) * 3}px`,
                            height: `${6 + (i % 3) * 3}px`,
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animation: `float-particle ${12 + i * 3}s ease-in-out infinite`,
                        }}
                    />
                ))}
            </div>

            <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          50% { transform: translate(10px, -15px); opacity: 0.3; }
        }
      `}</style>
        </div>
    );
};

export default PowerfulWelcome;
