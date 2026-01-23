import { useNavigate } from "react-router-dom";
import { CheckCircle2, Flame, Zap, Users } from "lucide-react";

interface PracticeCompleteProps {
    practiceName?: string | null;
    xpEarned?: number;
    streakDays?: number;
    onContinue?: () => void;
    onFindPeople?: () => void;
}

/**
 * Practice Complete Screen (Playbook 2.1.3)
 * Shown after completing a practice
 * 
 * Result: Victory, momentum
 * CTA: [Find My People] → Discover
 */
const PracticeComplete = ({
    practiceName,
    xpEarned = 25,
    streakDays = 1,
    onContinue,
    onFindPeople,
}: PracticeCompleteProps) => {
    const navigate = useNavigate();

    const handleFindPeople = () => {
        if (onFindPeople) {
            onFindPeople();
        } else {
            navigate("/game/teams");
        }
    };

    const handleContinue = () => {
        if (onContinue) {
            onContinue();
        } else {
            navigate("/game/transformation");
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl">
            {/* Gradient Background - Victory amber/gold */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] via-[#fbbf24] to-[#fcd34d]" />

            {/* Bokeh overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.2)_0%,transparent_50%)]" />

            {/* Sparkle particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: `${3 + (i % 3) * 2}px`,
                            height: `${3 + (i % 3) * 2}px`,
                            left: `${10 + i * 11}%`,
                            top: `${15 + (i % 4) * 20}%`,
                            animation: `sparkle ${2 + i * 0.3}s ease-in-out infinite`,
                            animationDelay: `${i * 0.15}s`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={1.5} />
                        <Zap className="absolute -top-1 -right-1 w-6 h-6 text-white animate-bounce" />
                    </div>
                </div>

                {/* Headline */}
                <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-['Fraunces',serif] font-semibold text-white mb-2"
                    style={{ textShadow: "0 0 60px rgba(255,255,255,0.4)" }}
                >
                    Practice Complete!
                </h1>

                {/* Practice name */}
                {practiceName && (
                    <p className="text-white/70 text-base mb-6">{practiceName}</p>
                )}

                {/* XP and Streak */}
                <div className="flex justify-center gap-8 mb-10">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Zap className="w-5 h-5 text-white" />
                            <span className="text-white font-bold text-2xl">+{xpEarned}</span>
                        </div>
                        <p className="text-white/60 text-xs uppercase tracking-widest">XP Earned</p>
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <Flame className="w-5 h-5 text-white" />
                            <span className="text-white font-bold text-2xl">{streakDays}</span>
                        </div>
                        <p className="text-white/60 text-xs uppercase tracking-widest">Day Streak 🔥</p>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={handleFindPeople}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-amber-600 font-semibold rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                    >
                        <Users className="w-5 h-5" />
                        Find My People
                    </button>

                    <button
                        onClick={handleContinue}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white font-medium rounded-xl text-sm border border-white/30 hover:bg-white/30 transition-all"
                    >
                        Return to Today
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes sparkle {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.5); opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default PracticeComplete;
