import { ReactNode, useRef } from "react";
import { Sparkles, Sword } from "lucide-react";
import CardActions from "@/components/sharing/CardActions";
import { Ornament } from "@/lib/landingDesign";

interface RevelatoryHeroProps {
    type: "appleseed" | "excalibur";
    title: string;
    actionStatement?: string;
    /**
     * Day 58 (Sasha 2026-05-02): Top Shadow — synthesized one-sentence
     * form (`topTalentProfile.top_shadow_one_sentence`). Rendered below
     * the bullseye, behind a `<Ornament />` rule and a `MY TOP SHADOW
     * IS` eyebrow that mirrors the `MY TOP TALENT IS` styling. The
     * full paragraph (`edge_and_traps`) lives on the deep-profile
     * "Top Shadow" subpage. The reveal card stays compact — one
     * sentence, sharp.
     */
    topShadow?: string;
    tagline?: string;
    children?: ReactNode;
    darkMode?: boolean;
    // Legacy props for backward compatibility
    subtitle?: string;
    subtitlePlain?: string;
}

/**
 * Strip decorative glyphs (✦ ✧ ◆ ◇ ❖ ✱ ★ ☆) some AI generators wrap
 * archetype names in. We render the name unflanked.
 */
const stripDecorativeGlyphs = (name: string): string =>
    name.replace(/[✦✧◆◇❖✱★☆]/g, "").trim();

/**
 * Format the bullseye sentence in editorial sentence case, no trailing
 * period — matches the platform register. Day 58 (Sasha 2026-05-02).
 */
const formatBullseye = (sentence: string): string =>
    sentence.toLowerCase().replace(/\.\s*$/, "").trim();

/**
 * Build the share text used by the in-card Save · Share affordance.
 * Day 58 (Sasha): the inner Three-Lenses block was retired, so the
 * share text drops actions + prime driver. Top Shadow is intentionally
 * NOT shared — it's heavy/private; people share what looks good, not
 * what confesses. Keep the share light: archetype + bullseye + invite.
 */
const buildShareTextFor = (
    title: string,
    actionStatement: string | undefined,
): string => {
    let text = `My top talent is ${stripDecorativeGlyphs(title)}.\n\n`;
    if (actionStatement) {
        text += `I ${formatBullseye(actionStatement)}.\n\n`;
    }
    text += `Curious what you see.\n\n→ FindYourTopTalent.Com`;
    return text;
};

/**
 * Epic revelatory hero — the FIRST RECOGNITION moment in the funnel.
 *
 * Day 58 (Sasha 2026-05-02) restructure:
 *   • Removed the Three-Lenses inner-card (Top Talents / Prime Driver /
 *     Archetype). Each phrase was already a packed thought form;
 *     stacking three of them next to each other diluted the recognition.
 *   • Added Top Shadow paragraph below the bullseye — the highest-
 *     leverage emotional payload (per Sasha: "this is the one that hits
 *     hardest"). Sourced from `topTalentProfile.edge_and_traps`.
 *   • Tagline eyebrow: "My top talent is" (was "My genius is to be a";
 *     archetype shifted from action-noun "Forger" to gerund "Forging"
 *     so it reads grammatically clean as a complement of "is").
 *   • Dodecahedron: golden glow halo + slow rotation (60s) — signals
 *     the artifact as living/alive without shouting.
 *   • Subtle gold border around the card itself + slightly stronger
 *     ambient halo (handled by the wrapper in AppleseedDisplay).
 */
const RevelatoryHero = ({
    type,
    title,
    actionStatement,
    topShadow,
    tagline,
    children,
    darkMode = false,
    subtitle,
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
            shadowText: "text-white/75",
            glowColor: "rgba(212,175,55,0.22)",
            divider: "rgba(244,212,114,0.32)",
            cardBorder: "1px solid rgba(244, 212, 114, 0.32)",
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
            shadowText: "text-[#2c3150]/80",
            glowColor: "rgba(212,175,55,0.14)",
            divider: "rgba(212, 175, 55, 0.45)",
            cardBorder: "1px solid rgba(212, 175, 55, 0.32)",
        }
        : {
            gradient: "from-[#8c6410] via-[#7a5108] to-[#6b4208]",
            icon: Sword,
            iconBg: "bg-[#f4d472]/22",
            iconColor: "text-[#f4d472]",
            textPrimary: "text-white",
            textSecondary: "text-[#f5e6b0]/85",
            textMuted: "text-[#f5e6b0]/65",
            shadowText: "text-[#f5e6b0]/85",
            glowColor: "rgba(244,212,114,0.3)",
            divider: "rgba(244,212,114,0.45)",
            cardBorder: "1px solid rgba(244, 212, 114, 0.30)",
        };

    // The card ref captures the outer wrapper so html2canvas can
    // serialize what the user sees, including the breathing-card glow
    // and the gradient backdrop.
    const cardRef = useRef<HTMLDivElement>(null);
    const shareText = buildShareTextFor(title, actionStatement);

    const cleanTitle = stripDecorativeGlyphs(title);

    return (
        <div
            ref={cardRef}
            className={`relative overflow-hidden rounded-3xl mb-4 breathing-card backdrop-blur-md ${
                darkMode ? "liquid-glass ring-1 ring-white/10" : ""
            }`}
            style={!darkMode ? { border: palette.cardBorder } : undefined}
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

            {/* Content — Day 58 (Sasha 2026-05-02): vertical padding
                tightened (was py-6 sm:py-8) so the rebuilt card with
                Top Shadow eyebrow + sentence still fits a single
                viewport on common screen sizes. */}
            <div className="relative px-5 py-5 sm:px-7 sm:py-6 text-center">
                {/* Dodecahedron — Day 58 (Sasha 2026-05-02): now wears
                    its own gold halo + slow rotation. The icon reads as
                    a living artifact instead of a static badge. */}
                <div
                    className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-4 mx-auto"
                    style={{
                        boxShadow:
                            "0 0 24px 4px rgba(244, 212, 114, 0.50), 0 0 56px 12px rgba(212, 175, 55, 0.22)",
                    }}
                >
                    <img
                        src="/zone-of-genius-logo.png"
                        alt="Top Talent"
                        className="w-full h-full object-cover"
                        draggable={false}
                        style={{
                            animation: "rh-gentle-spin 60s linear infinite",
                            willChange: "transform",
                            transformOrigin: "center",
                        }}
                    />
                </div>

                {/* Tagline — eyebrow above the archetype */}
                {tagline && (
                    <p
                        className={`text-[10px] sm:text-xs uppercase tracking-[0.28em] ${palette.textMuted} mb-2`}
                    >
                        {tagline}
                    </p>
                )}

                {/* Archetype Title — gerund form (e.g. "Signal-to-Form
                    Forging"). Decorative glyphs already stripped. */}
                <h1
                    className={`font-display text-2xl sm:text-3xl md:text-[2.2rem] font-semibold ${palette.textPrimary} mb-3 leading-[1.1] tracking-[-0.005em]`}
                    style={{ textShadow: `0 0 80px ${palette.glowColor}` }}
                >
                    {cleanTitle}
                </h1>

                {/* Bullseye / Action Statement — italic Cormorant, sentence
                    case (no period, no quotes), centered in its own field. */}
                {actionStatement && (
                    <p
                        className={`font-display text-lg sm:text-xl md:text-[1.4rem] italic ${palette.textPrimary} max-w-2xl mx-auto mt-2 leading-snug`}
                        style={{
                            textShadow: `0 0 40px ${palette.glowColor}, 0 0 12px rgba(255,255,255,0.12)`,
                        }}
                    >
                        I {formatBullseye(actionStatement)}
                    </p>
                )}

                {/* Legacy subtitle support */}
                {!actionStatement && subtitle && (
                    <p
                        className={`text-lg sm:text-xl ${palette.textSecondary} italic max-w-xl mx-auto mb-6`}
                    >
                        "{subtitle}"
                    </p>
                )}

                {/* Top Shadow — Day 58 (Sasha 2026-05-02). Synthesized
                    one-sentence form (the FIRST REVEAL surface stays
                    compact). Full paragraph lives on the deep-profile
                    "Top Shadow" subpage. Visual structure mirrors the
                    archetype block above: ornament rule → small gold
                    eyebrow ("MY TOP SHADOW IS") → the punchy sentence
                    in italic Cormorant. The shadow IS the gift inverted
                    — naming it grammatically as a noun phrase (per
                    prompt instruction) so it reads as identity. */}
                {topShadow && (
                    <>
                        <Ornament className="mt-6 mb-4" />

                        <p
                            className={`text-[10px] sm:text-xs uppercase tracking-[0.28em] ${palette.textMuted} mb-2`}
                        >
                            My top shadow is
                        </p>

                        <p
                            className={`font-display text-lg sm:text-xl md:text-[1.4rem] italic ${palette.textPrimary} max-w-2xl mx-auto leading-snug`}
                            style={{
                                textShadow: `0 0 40px ${palette.glowColor}, 0 0 12px rgba(255,255,255,0.10)`,
                            }}
                        >
                            {topShadow}
                        </p>
                    </>
                )}

                {/* Children (optional extra content) */}
                {children && (
                    <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-2xl mx-auto">
                        <div className={`text-lg ${palette.textPrimary} leading-relaxed`}>
                            {children}
                        </div>
                    </div>
                )}

                {/* Save · Share — kept; one-click PNG capture + socials
                    popover. Share text now drops the retired Three-Lenses
                    block; carries archetype + bullseye + invite. */}
                <div className="mt-7 text-center">
                    <CardActions
                        captureRef={cardRef}
                        fileName={`${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-top-talent"}-find-your-top-talent`}
                        shareText={shareText}
                        darkMode={darkMode}
                    />
                </div>
            </div>

            <style>{`
                @keyframes float-particle {
                    0%, 100% { transform: translate(0, 0); opacity: 0.5; }
                    50%      { transform: translate(12px, -18px); opacity: 0.2; }
                }
                @keyframes rh-gentle-spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default RevelatoryHero;
