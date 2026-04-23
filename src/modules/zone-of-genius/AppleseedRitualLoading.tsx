import { useEffect, useState } from "react";

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
        <>
            {/* Day 47 late pass (Sasha): own fixed dark bg removed. The
                loader now sits directly on GameShellV2's ambient Panel 3 —
                same light treatment as the rest of the journey. */}

            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
                {/* Sacred Geometry Animation — Day 48 iter 7 (Sasha):
                    violet (#8460ea) + periwinkle (#a4a3d0) + dusty blue
                    (#6894d0) migrated to the signature antique-gold
                    palette. Ring intensities preserved relatively. */}
                <div className="relative w-32 h-32 mb-8">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-2 rounded-full animate-spin"
                        style={{ animationDuration: '8s', borderColor: 'rgba(26,30,58,0.18)' }} />

                    {/* Middle ring */}
                    <div className="absolute inset-4 border-2 border-[#a06d08]/45 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />

                    {/* Inner ring */}
                    <div className="absolute inset-8 border-2 border-[#7a5108]/60 rounded-full animate-spin" style={{ animationDuration: '4s' }} />

                    {/* Center glow with dodecahedron */}
                    <div className="absolute inset-10 bg-gradient-to-br from-[#f4d472]/30 to-[#a06d08]/25 backdrop-blur-sm rounded-full animate-pulse flex items-center justify-center">
                        <img
                            src="/dodecahedron.png"
                            alt="Soul"
                            className="w-12 h-12 object-contain"
                        />
                    </div>

                    {/* Floating particles */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-[#a06d08]/55 rounded-full animate-ping"
                            style={{
                                top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 40}%`,
                                left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: '2s'
                            }}
                        />
                    ))}
                </div>

                {/* Phase text — dark navy for light Panel 3 */}
                <div className="h-8 mb-4">
                    <p
                        className="text-lg animate-pulse transition-all duration-500"
                        style={{
                            color: "var(--skin-text-primary, #0a1628)",
                            textShadow: "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.6), 0 1px 2px rgba(255,255,255,0.75))",
                        }}
                    >
                        {PHASES[phaseIndex]}
                    </p>
                </div>

                {/* Progress bar — glass treatment. Gold gradient in
                    place of the prior violet/blue. */}
                <div className="w-64 h-1.5 liquid-glass rounded-full overflow-hidden">
                    <div
                        className="h-full transition-all duration-100 ease-out rounded-full"
                        style={{
                            width: `${progress}%`,
                            backgroundImage:
                                "linear-gradient(90deg, rgba(160,109,8,0.80) 0%, rgba(212,175,55,0.65) 100%)",
                        }}
                    />
                </div>

                {/* Decorative text */}
                <p
                    className="mt-8 text-sm"
                    style={{
                        color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                        textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                    }}
                >
                    Your Top Talent is being articulated...
                </p>
            </div>
        </>
    );
};

export default AppleseedRitualLoading;
