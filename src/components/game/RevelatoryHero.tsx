import { ReactNode } from "react";
import { Sparkles, Sword } from "lucide-react";

interface ThreeLensesData {
    actions?: string[];
    primeDriver?: string;
    archetype?: string;
}

interface RevelatoryHeroProps {
    type: "appleseed" | "excalibur";
    title: string;
    actionStatement?: string; // "You architect coherent nested living optimal systems from complexity"
    threeLenses?: ThreeLensesData;
    tagline?: string;
    children?: ReactNode;
    // Legacy props for backward compatibility
    subtitle?: string;
    subtitlePlain?: string;
}

/**
 * Epic revelatory hero section for ZoG results
 * New format: "Your genius is to be a [Archetype]" + actionable statement + Three Lenses
 */
const RevelatoryHero = ({
    type,
    title,
    actionStatement,
    threeLenses,
    tagline,
    children,
    subtitle,
    subtitlePlain
}: RevelatoryHeroProps) => {
    const isAppleseed = type === "appleseed";

    const palette = isAppleseed
        ? {
            gradient: "from-[#f59e0b] via-[#d97706] to-[#b45309]",
            icon: Sparkles,
            iconBg: "bg-amber-200/20",
            iconColor: "text-amber-200",
            textPrimary: "text-white",
            textSecondary: "text-amber-100/80",
            textMuted: "text-amber-100/60",
            glowColor: "rgba(251,191,36,0.3)",
            divider: "bg-amber-200/30",
        }
        : {
            gradient: "from-[#7c3aed] via-[#6d28d9] to-[#5b21b6]",
            icon: Sword,
            iconBg: "bg-violet-200/20",
            iconColor: "text-violet-200",
            textPrimary: "text-white",
            textSecondary: "text-violet-100/80",
            textMuted: "text-violet-100/60",
            glowColor: "rgba(139,92,246,0.3)",
            divider: "bg-violet-200/30",
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
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${palette.iconBg} mb-6`}>
                    <IconComponent className={`w-8 h-8 ${palette.iconColor}`} />
                </div>

                {/* Tagline */}
                {tagline && (
                    <p className={`text-xs uppercase tracking-[0.2em] ${palette.textMuted} mb-3`}>
                        {tagline}
                    </p>
                )}

                {/* Main Title - Archetype Name */}
                <h1
                    className={`font-['Fraunces',serif] text-2xl sm:text-3xl md:text-4xl font-semibold ${palette.textPrimary} mb-6 leading-tight`}
                    style={{ textShadow: `0 0 80px ${palette.glowColor}` }}
                >
                    ✦ {title} ✦
                </h1>

                {/* Action Statement - the core "You [verb]..." statement */}
                {actionStatement && (
                    <p className={`text-lg sm:text-xl ${palette.textSecondary} max-w-xl mx-auto mb-8 leading-relaxed`}>
                        "{actionStatement}"
                    </p>
                )}

                {/* Legacy subtitle support */}
                {!actionStatement && subtitle && (
                    <p className={`text-lg sm:text-xl ${palette.textSecondary} italic max-w-xl mx-auto mb-6`}>
                        "{subtitle}"
                    </p>
                )}

                {/* Three Lenses - Integrated into main card */}
                {threeLenses && (
                    <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-lg mx-auto text-left">
                        {/* Top Talents */}
                        {threeLenses.actions && threeLenses.actions.length > 0 && (
                            <div className="mb-4">
                                <p className={`text-xs uppercase tracking-wider ${palette.textMuted} mb-1`}>Your Top Talents</p>
                                <p className={`text-base ${palette.textPrimary} font-medium`}>
                                    {threeLenses.actions.join(" • ")}
                                </p>
                            </div>
                        )}

                        {/* Prime Driver */}
                        {threeLenses.primeDriver && (
                            <div className="mb-4">
                                <p className={`text-xs uppercase tracking-wider ${palette.textMuted} mb-1`}>Your Prime Driver</p>
                                <p className={`text-base ${palette.textPrimary} font-medium`}>
                                    {threeLenses.primeDriver}
                                </p>
                            </div>
                        )}

                        {/* Archetype */}
                        {threeLenses.archetype && (
                            <div>
                                <p className={`text-xs uppercase tracking-wider ${palette.textMuted} mb-1`}>Your Archetype</p>
                                <p className={`text-base ${palette.textPrimary} font-medium`}>
                                    {threeLenses.archetype}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Children (optional extra content) */}
                {children && !threeLenses && (
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

