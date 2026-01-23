import { useNavigate } from "react-router-dom";
import { Send, Heart, Users, ArrowRight } from "lucide-react";

interface ConnectionSentProps {
    recipientName?: string | null;
    onKeepDiscovering?: () => void;
}

/**
 * Connection Sent Screen (Playbook 3.3)
 * Shown after sending a connection request
 * 
 * Emotional State: Hope, belonging
 * CTA: [Keep Discovering] → Discover feed
 */
const ConnectionSent = ({
    recipientName,
    onKeepDiscovering,
}: ConnectionSentProps) => {
    const navigate = useNavigate();

    const handleKeepDiscovering = () => {
        if (onKeepDiscovering) {
            onKeepDiscovering();
        } else {
            navigate("/game/teams");
        }
    };

    return (
        <div className="relative overflow-hidden rounded-3xl">
            {/* Gradient Background - Connection violet/pink */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] via-[#a78bfa] to-[#c4b5fd]" />

            {/* Bokeh overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.3)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15)_0%,transparent_50%)]" />

            {/* Heart particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-pink-300"
                        style={{
                            left: `${15 + i * 14}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animation: `float-heart ${4 + i * 0.5}s ease-in-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                            opacity: 0.4,
                        }}
                    >
                        <Heart className="w-4 h-4" fill="currentColor" />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <Send className="w-8 h-8 text-white" />
                        </div>
                        <Heart className="absolute -bottom-1 -right-1 w-6 h-6 text-pink-300 animate-pulse" fill="currentColor" />
                    </div>
                </div>

                {/* Headline */}
                <h1
                    className="text-3xl sm:text-4xl md:text-5xl font-['Fraunces',serif] font-semibold text-white mb-4"
                    style={{ textShadow: "0 0 60px rgba(255,255,255,0.4)" }}
                >
                    Connection Sent!
                </h1>

                {/* Message */}
                <p className="text-white/80 text-lg sm:text-xl mb-4 max-w-md mx-auto">
                    {recipientName
                        ? `Your message is on its way to ${recipientName}.`
                        : "Your message is on its way."
                    }
                </p>

                <p className="text-white/60 text-sm mb-10 max-w-sm mx-auto">
                    Great connections take time. Keep exploring — your people are out there.
                </p>

                {/* CTA Button */}
                <button
                    onClick={handleKeepDiscovering}
                    className="inline-flex items-center gap-3 px-10 py-4 bg-white text-violet-600 font-semibold rounded-2xl text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                >
                    <Users className="w-5 h-5" />
                    Keep Discovering
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            <style>{`
                @keyframes float-heart {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
                    50% { transform: translateY(-10px) scale(1.1); opacity: 0.2; }
                }
            `}</style>
        </div>
    );
};

export default ConnectionSent;
