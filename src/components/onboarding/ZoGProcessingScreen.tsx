import { useEffect, useState } from "react";

interface ZoGProcessingScreenProps {
    onComplete: () => void;
    /** Duration in ms before auto-advancing (default: 3000) */
    duration?: number;
}

/**
 * ZoG Processing Screen - Sacred geometry animation while generating Zone of Genius
 * Based on Product Playbook wireframe: spinning sacred geometry + progress
 */
const ZoGProcessingScreen = ({ onComplete, duration = 3000 }: ZoGProcessingScreenProps) => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("Analyzing your unique patterns...");

    const messages = [
        "Analyzing your unique patterns...",
        "Synthesizing your genius...",
        "Crystallizing your core essence...",
        "Almost there..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 2;
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                return next;
            });
        }, duration / 50);

        return () => clearInterval(interval);
    }, [duration, onComplete]);

    useEffect(() => {
        if (progress < 25) setMessage(messages[0]);
        else if (progress < 50) setMessage(messages[1]);
        else if (progress < 75) setMessage(messages[2]);
        else setMessage(messages[3]);
    }, [progress]);

    return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-br from-[var(--wabi-lavender)] via-[var(--wabi-lilac)] to-[var(--depth-violet)]/10">
            {/* Sacred Geometry Animation */}
            <div className="relative w-40 h-40 mb-8">
                {/* Outer ring */}
                <div className="absolute inset-0 border-4 border-[var(--depth-violet)]/30 rounded-full animate-[spin_8s_linear_infinite]" />

                {/* Middle ring */}
                <div className="absolute inset-4 border-4 border-[var(--depth-cornflower)]/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" />

                {/* Inner glow */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--depth-violet)] to-[var(--depth-cornflower)] opacity-60 blur-xl animate-pulse" />

                {/* Center orb */}
                <div className="absolute inset-12 rounded-full bg-gradient-to-br from-[var(--depth-violet)] to-[var(--depth-cornflower)] shadow-lg animate-pulse flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">✦</span>
                </div>

                {/* Orbiting dots */}
                <div className="absolute inset-0 animate-[spin_4s_linear_infinite]">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--wabi-blush)]" />
                </div>
                <div className="absolute inset-0 animate-[spin_5s_linear_infinite_reverse]">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--wabi-aqua)]" />
                </div>
            </div>

            {/* Message */}
            <p className="text-lg text-[var(--wabi-text-primary)] font-medium mb-6 text-center px-6">
                {message}
            </p>

            {/* Progress bar */}
            <div className="w-64 h-2 bg-white/30 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-[var(--depth-violet)] to-[var(--depth-cornflower)] transition-all duration-200 ease-out rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="mt-2 text-sm text-[var(--wabi-text-muted)]">{progress}%</p>
        </div>
    );
};

export default ZoGProcessingScreen;
