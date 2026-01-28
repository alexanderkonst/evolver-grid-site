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
            gradient: "from-[#c8b7d8] via-[#d4d1e8] to-[#e7e9f5]",
            icon: Sparkles,
            iconBg: "bg-[#8460ea]/20",
            iconColor: "text-[#8460ea]",
            textPrimary: "text-[#2c3150]",
            textSecondary: "text-[#2c3150]/80",
            textMuted: "text-[#8460ea]",
            glowColor: "rgba(132,96,234,0.15)",
            divider: "bg-[#a4a3d0]/30",
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
        <div className="relative overflow-hidden rounded-3xl mb-4">
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

            {/* Content - Compact for one-screen */}
            <div className="relative px-4 py-4 sm:px-5 sm:py-5 text-center">
                {/* Custom ZoG Logo */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full overflow-hidden mb-3">
                    <img
                        src="/zone-of-genius-logo.png"
                        alt="Zone of Genius"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Tagline */}
                {tagline && (
                    <p className={`text-xs uppercase tracking-[0.2em] ${palette.textMuted} mb-1`}>
                        My genius is to be a
                    </p>
                )}

                {/* Main Title - Archetype Name - Smaller */}
                <h1
                    className={`font-display text-xl sm:text-2xl md:text-3xl font-semibold ${palette.textPrimary} mb-3 leading-tight`}
                    style={{ textShadow: `0 0 80px ${palette.glowColor}` }}
                >
                    {title.replace(/✦/g, '').trim()}
                </h1>

                {/* Action Statement - Compact */}
                {actionStatement && (
                    <p className={`text-sm sm:text-base ${palette.textSecondary} max-w-xl mx-auto mb-2 leading-relaxed`}>
                        I {actionStatement}
                    </p>
                )}

                {/* Legacy subtitle support */}
                {!actionStatement && subtitle && (
                    <p className={`text-lg sm:text-xl ${palette.textSecondary} italic max-w-xl mx-auto mb-6`}>
                        "{subtitle}"
                    </p>
                )}

                {/* Three Lenses - Compact */}
                {threeLenses && (
                    <div className="mt-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 max-w-md mx-auto text-center">
                        {/* Top Talents */}
                        {threeLenses.actions && threeLenses.actions.length > 0 && (
                            <div className="mb-2">
                                <p className={`text-[10px] uppercase tracking-wider ${palette.textMuted} mb-0.5`}>My Top Talents</p>
                                <p className={`text-sm ${palette.textPrimary} font-medium`}>
                                    {threeLenses.actions.join(" • ")}
                                </p>
                            </div>
                        )}

                        {/* Prime Driver */}
                        {threeLenses.primeDriver && (
                            <div className="mb-2">
                                <p className={`text-[10px] uppercase tracking-wider ${palette.textMuted} mb-0.5`}>My Prime Driver</p>
                                <p className={`text-sm ${palette.textPrimary} font-medium`}>
                                    {threeLenses.primeDriver}
                                </p>
                            </div>
                        )}

                        {/* Archetype */}
                        {threeLenses.archetype && (
                            <div>
                                <p className={`text-[10px] uppercase tracking-wider ${palette.textMuted} mb-0.5`}>My Archetype</p>
                                <p className={`text-sm ${palette.textPrimary} font-medium`}>
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

