import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface AppleseedRitualLoadingProps {
    onComplete?: () => void;
    minDuration?: number; // minimum display time in ms
}

const PHASES = [
    "Tuning into your frequency...",
    "Amplifying your signal...",
    "Crystallizing your essence...",
    "Your genius is emerging..."
];

const AppleseedRitualLoading = ({
    onComplete,
    minDuration = 4000
}: AppleseedRitualLoadingProps) => {
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const phaseInterval = setInterval(() => {
            setPhaseIndex(prev => (prev + 1) % PHASES.length);
        }, minDuration / PHASES.length);

        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 2, 100));
        }, minDuration / 50);

        const completeTimeout = setTimeout(() => {
            if (onComplete) onComplete();
        }, minDuration);

        return () => {
            clearInterval(phaseInterval);
            clearInterval(progressInterval);
            clearTimeout(completeTimeout);
        };
    }, [minDuration, onComplete]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            {/* Sacred Geometry Animation */}
            <div className="relative w-32 h-32 mb-8">
                {/* Outer ring */}
                <div className="absolute inset-0 border-2 border-amber-200 rounded-full animate-spin" style={{ animationDuration: '8s' }} />

                {/* Middle ring */}
                <div className="absolute inset-4 border-2 border-amber-300 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />

                {/* Inner ring */}
                <div className="absolute inset-8 border-2 border-amber-400 rounded-full animate-spin" style={{ animationDuration: '4s' }} />

                {/* Center glow */}
                <div className="absolute inset-12 bg-amber-200 rounded-full animate-pulse flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                </div>

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-amber-400 rounded-full animate-ping"
                        style={{
                            top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
                            left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                            animationDelay: `${i * 0.3}s`,
                            animationDuration: '2s'
                        }}
                    />
                ))}
            </div>

            {/* Phase text */}
            <div className="h-8 mb-4">
                <p className="text-lg text-slate-600 animate-pulse transition-all duration-500">
                    {PHASES[phaseIndex]}
                </p>
            </div>

            {/* Progress bar */}
            <div className="w-64 h-1 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-400 transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Decorative text */}
            <p className="mt-8 text-sm text-slate-500">
                Your Zone of Genius is being articulated...
            </p>
        </div>
    );
};

export default AppleseedRitualLoading;
