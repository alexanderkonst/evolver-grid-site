import { useNavigate } from "react-router-dom";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

interface ProfileCompleteProps {
    archetypeName?: string | null;
    qolScore?: number | null;
    onContinue?: () => void;
}

/**
 * Profile Complete Screen (Playbook 1.3.1)
 * Shown after QoL assessment completion
 * 
 * Result: "You know who you are. Now let's grow."
 * CTA: [Start Growing] → TransformationSpace
 */
const ProfileComplete = ({
    archetypeName,
    qolScore,
    onContinue,
}: ProfileCompleteProps) => {
    const navigate = useNavigate();

    const handleContinue = () => {
        if (onContinue) {
            onContinue();
        } else {
            navigate("/game/transformation");
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl">
            {/* Gradient Background - Celebratory */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e] via-[#4ade80] to-[#86efac]" />

            {/* Bokeh overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.2)_0%,transparent_50%)]" />

            {/* Confetti particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: `${4 + (i % 4) * 2}px`,
                            height: `${4 + (i % 4) * 2}px`,
                            backgroundColor: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f472b6' : '#60a5fa',
                            left: `${8 + i * 8}%`,
                            top: `${10 + (i % 5) * 18}%`,
                            animation: `confetti-fall ${3 + i * 0.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.2}s`,
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
                        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-300 animate-pulse" />
                    </div>
                </div>

                {/* Headline */}
                <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white mb-4"
                    style={{ textShadow: "0 0 60px rgba(255,255,255,0.4)" }}
                >
                    Profile Complete!
                </h1>

                {/* Value Statement */}
                <p className="text-white/80 text-lg sm:text-xl mb-8 max-w-md mx-auto">
                    You know who you are. Now let's grow.
                </p>

                {/* Stats Display */}
                <div className="flex justify-center gap-8 mb-10">
                    {archetypeName && (
                        <div className="text-center">
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Your Archetype</p>
                            <p className="text-white font-semibold text-lg">{archetypeName}</p>
                        </div>
                    )}
                    {qolScore !== null && qolScore !== undefined && (
                        <div className="text-center">
                            <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Life Score</p>
                            <p className="text-white font-semibold text-lg">{qolScore.toFixed(1)}/10</p>
                        </div>
                    )}
                </div>

                {/* CTA Button */}
                <button
                    onClick={handleContinue}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-white text-green-600 font-semibold rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                    Start Growing
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <style>{`
                @keyframes confetti-fall {
                    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
                    50% { transform: translateY(20px) rotate(180deg); opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};

export default ProfileComplete;
