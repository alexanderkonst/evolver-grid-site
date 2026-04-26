import { ReactNode, useRef } from "react";
import { Sparkles, Sword } from "lucide-react";
import CardActions from "@/components/sharing/CardActions";

interface ThreeLensesData {
    actions?: string[];
    primeDriver?: string;
    archetype?: string;
}

interface RevelatoryHeroProps {
    type: "appleseed" | "excalibur";
    title: string;
    actionStatement?: string;
    threeLenses?: ThreeLensesData;
    tagline?: string;
    children?: ReactNode;
    darkMode?: boolean;
    // Legacy props for backward compatibility
    subtitle?: string;
    subtitlePlain?: string;
}

/**
 * Build the share text used by the in-card Save · Share affordance.
 */
const buildShareTextFor = (
    title: string,
    actionStatement: string | undefined,
    threeLenses: ThreeLensesData | undefined,
): string => {
    let text = `This is how I naturally create value:\n\n`;
    text += `${title}\n`;
    if (actionStatement) text += `"${actionStatement}"\n\n`;
    if (threeLenses?.actions?.length) {
        text += `${threeLenses.actions.join(" · ")}\n`;
    }
    if (threeLenses?.primeDriver) {
        text += `What drives it: ${threeLenses.primeDriver}\n\n`;
    }
    text += `Curious what you see.\n\n→ FindYourTopTalent.Com`;
    return text;
};

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
    darkMode = false,
    subtitle,
    subtitlePlain
}: RevelatoryHeroProps) => {
    const isAppleseed = type === "appleseed";

    // Day 48 iter 7 (Sasha): all three palette variants migrated from the
    // violet/indigo family to the signature antique-gold language shared
    // with the landing. Excalibur variant retains the deepest contrast
    // (warm gold on cream) so it still reads distinctly from Appleseed.
    const palette = darkMode
        ? {
            gradient: "from-transparent to-transparent",
            icon: Sparkles,
            iconBg: "bg-[#d4af37]/20",
            iconColor: "text-[#f4d472]",
            textPrimary: "text-white/90",
            textSecondary: "text-white/60",
            textMuted: "text-[#f4d472]",
            glowColor: "rgba(212,175,55,0.22)",
            divider: "bg-white/10",
        }
        : isAppleseed
        ? {
            gradient: "from-white/70 via-[#fdf6e3]/80 to-white/60",
            icon: Sparkles,
            iconBg: "bg-[#d4af37]/12",
            iconColor: "text-[#7a5108]",
            textPrimary: "text-[#2c3150]",
            textSecondary: "text-[#2c3150]/70",
            textMuted: "text-[#7a5108]",
            glowColor: "rgba(212,175,55,0.14)",
            divider: "bg-[#d4af37]/22",
        }
        : {
            // Excalibur: rich warm-gold wash with cream text. Was a deep
            // violet-purple gradient — now a single gold-family gradient
            // that still sits apart from Appleseed via higher saturation.
            gradient: "from-[#8c6410] via-[#7a5108] to-[#6b4208]",
            icon: Sword,
            iconBg: "bg-[#f4d472]/22",
            iconColor: "text-[#f4d472]",
            textPrimary: "text-white",
            textSecondary: "text-[#f5e6b0]/85",
            textMuted: "text-[#f5e6b0]/65",
            glowColor: "rgba(244,212,114,0.3)",
            divider: "bg-[#f4d472]/30",
        };

    const IconComponent = palette.icon;

    // Day 51 night (Sasha): replaces the old "Screenshot this. get yours →"
    // prompt with an in-card Save (PNG) + Share (socials) affordance.
    // The ref captures the card's outer wrapper so html2canvas can
    // serialize what the user sees, including the breathing-card glow
    // and the gradient backdrop.
    const cardRef = useRef<HTMLDivElement>(null);
    const shareText = buildShareTextFor(title, actionStatement, threeLenses);

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden rounded-3xl mb-4 breathing-card backdrop-blur-md ${darkMode ? 'liquid-glass ring-1 ring-white/10' : 'border border-white/40'}`}
        >
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
                        alt="Top Talent"
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

                {/* Action Statement — THE main information on the person's
                    genius. Emphasized UI treatment (Sasha, 2026-04-21):
                    larger, italic serif, glowy, centered in its own field. */}
                {actionStatement && (
                    <p
                        className={`font-display text-lg sm:text-xl md:text-2xl italic ${palette.textPrimary} max-w-2xl mx-auto mt-2 mb-6 leading-snug`}
                        style={{
                            textShadow: `0 0 40px ${palette.glowColor}, 0 0 12px rgba(255,255,255,0.12)`,
                        }}
                    >
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

                {/* Day 51 night (Sasha): in-card Save (PNG) + Share affordance.
                    Replaces the old "Screenshot this. get yours →" prompt with
                    one-click actions. Save downloads a PNG of this very card;
                    Share opens a popover with WhatsApp / Telegram / LinkedIn
                    / X / Copy Text options. Sized small + low-opacity by
                    default so it sits inside the card without competing with
                    the genius reveal above. */}
                <div className="mt-4 text-center">
                    <CardActions
                        captureRef={cardRef}
                        fileName={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-top-talent"}-find-your-top-talent`}
                        shareText={shareText}
                        darkMode={darkMode}
                    />
                </div>
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

