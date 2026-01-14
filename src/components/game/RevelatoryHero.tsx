import { ReactNode } from "react";
import { Sparkles, Sword } from "lucide-react";

interface RevelatoryHeroProps {
    type: "appleseed" | "excalibur";
    title: string;
    subtitle?: string;
    subtitlePlain?: string;
    tagline?: string;
    children?: ReactNode;
}

/**
 * Epic revelatory hero section for ZoG results
 * Makes the moment of seeing your genius feel special
 */
const RevelatoryHero = ({ type, title, subtitle, subtitlePlain, tagline, children }: RevelatoryHeroProps) => {
    const isAppleseed = type === "appleseed";

    const palette = isAppleseed
        ? {
            gradient: "from-[#f59e0b] via-[#d97706] to-[#b45309]",
            icon: Sparkles,
            iconBg: "bg-amber-200/20",
            iconColor: "text-amber-200",
            textPrimary: "text-white",
            textSecondary: "text-amber-100/80",
            glowColor: "rgba(251,191,36,0.3)",
        }
        : {
            gradient: "from-[#7c3aed] via-[#6d28d9] to-[#5b21b6]",
            icon: Sword,
            iconBg: "bg-violet-200/20",
            iconColor: "text-violet-200",
            textPrimary: "text-white",
            textSecondary: "text-violet-100/80",
            glowColor: "rgba(139,92,246,0.3)",
        };

    const IconComponent = palette.icon;

    return (
        <div className="relative overflow-hidden rounded-3xl mb-8">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${palette.gradient}`} />

            {/* Bokeh overlays */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15)_0%,transparent_50%)]" />

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white/10"
                        style={{
                            width: `${5 + (i % 3) * 3}px`,
                            height: `${5 + (i % 3) * 3}px`,
                            left: `${10 + i * 12}%`,
                            top: `${15 + (i % 4) * 20}%`,
                            animation: `float-particle ${14 + i * 2}s ease-in-out infinite`,
                        }}
                    />
                ))}
            </div>

            {/* Content */}
            <div className="relative px-6 py-12 sm:px-10 sm:py-16 text-center">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${palette.iconBg} mb-6 animate-pulse`}>
                    <IconComponent className={`w-10 h-10 ${palette.iconColor}`} />
                </div>

                {/* Tagline */}
                {tagline && (
                    <p className={`text-sm uppercase tracking-widest ${palette.textSecondary} mb-4`}>
                        {tagline}
                    </p>
                )}

                {/* Main Title */}
                <h1
                    className={`font-['Fraunces',serif] text-3xl sm:text-4xl md:text-5xl font-semibold ${palette.textPrimary} mb-4 leading-tight`}
                    style={{ textShadow: `0 0 80px ${palette.glowColor}` }}
                >
                    ✦ {title} ✦
                </h1>

                {/* Subtitle */}
                {subtitle && (
                    <p className={`text-lg sm:text-xl ${palette.textSecondary} italic max-w-xl mx-auto mb-6`}>
                        "{subtitle}"
                    </p>
                )}
                {subtitlePlain && (
                    <p className={`text-sm sm:text-base ${palette.textSecondary} italic max-w-xl mx-auto`}>
                        ({subtitlePlain})
                    </p>
                )}

                {/* Children (optional bullseye/pitch text) */}
                {children && (
                    <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-2xl mx-auto">
                        <div className={`text-lg ${palette.textPrimary} leading-relaxed`}>
                            {children}
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.5; }
          50% { transform: translate(12px, -18px); opacity: 0.2; }
        }
      `}</style>
        </div>
    );
};

export default RevelatoryHero;
