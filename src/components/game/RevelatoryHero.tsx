import { ReactNode, useRef } from "react";
import CardActions from "@/components/sharing/CardActions";
import { QRCodeCanvas } from "qrcode.react";
import { Ornament } from "@/lib/landingDesign";
// Day 61 (Sasha 2026-05-04 12:45): brand torus mark used in the
// in-card footer so the saved/shared image carries identifiable
// branding + the source URL. The torus IS the brand mark; we use
// it without the wordmark so the footer reads as a glyph + tagline,
// not a heavy lockup.
import brandTorus from "@/assets/find-your-top-talent-torus.png";

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
    /**
     * Day 61 (Sasha 2026-05-04): the three top talents in compact
     * gerund + concrete object form (e.g., "Sensing the unspoken",
     * "Softening the wound", "Blessing the threshold"). Sourced from
     * `topTalentProfile.top_three_talents_compact`. Rendered between
     * the bullseye and the top-shadow block as a stacked triplet
     * under a "MY THREE TALENTS" eyebrow. Optional — when absent
     * (pre-Day-61 snapshots), the section hides cleanly.
     */
    topThreeTalents?: string[];
    tagline?: string;
    children?: ReactNode;
    darkMode?: boolean;
    // Legacy prop kept for back-compat with any caller that still uses
    // the older subtitle path; new callers should use actionStatement.
    subtitle?: string;
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
// Day 61 (Sasha 2026-05-04 14:00) — three share-text fixes shipped together:
//
// (1) URL is now `https://findyourtoptalent.com` (with protocol) so platforms
//     auto-linkify it. The previous `→ FindYourTopTalent.Com` was plaintext —
//     readers had to manually type it into a browser. Auto-link = one click.
//
// (2) UTM params attached so analytics can attribute traffic to social shares
//     specifically. Invisible to the clicker (they just see the same page),
//     visible to us in GA / any analytics tool: utm_source=share,
//     utm_medium=social, utm_campaign=top_talent_reveal. Per-platform source
//     could come later (utm_source=whatsapp/twitter/etc) if we want to A/B
//     channels — for now a single attribution bucket.
//
// (3) Length safeguard for X (Twitter, 280-char cap). If the full message
//     would overflow ~260 chars, we drop the three-talents line first
//     (least-essential of the three content blocks) so the URL — the thing
//     we MUST keep — stays. Bullseye + archetype are core; talents are
//     specificity bonus. Threshold is 260 not 280 to leave a few chars of
//     headroom for the user's potential added comment.
const SHARE_URL = "https://findyourtoptalent.com?utm_source=share&utm_medium=social&utm_campaign=top_talent_reveal";
const TWITTER_SOFT_CAP = 260;

const buildShareTextFor = (
    title: string,
    actionStatement: string | undefined,
    topThreeTalents: string[] | undefined,
): string => {
    const titleLine = `My top talent is ${stripDecorativeGlyphs(title)}.\n\n`;
    const bullseyeLine = actionStatement
        ? `I ${formatBullseye(actionStatement)}.\n\n`
        : "";
    const talentsLine =
        topThreeTalents && topThreeTalents.length > 0
            ? `My three talents: ${topThreeTalents.join(" · ")}.\n\n`
            : "";
    const closingLine = `Curious what you see.\n\n→ ${SHARE_URL}`;

    const fullText = `${titleLine}${bullseyeLine}${talentsLine}${closingLine}`;

    // If we'd overflow the soft cap, drop the talents line — the bullseye
    // and the URL are non-negotiable.
    if (fullText.length > TWITTER_SOFT_CAP && talentsLine) {
        return `${titleLine}${bullseyeLine}${closingLine}`;
    }
    return fullText;
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
    topThreeTalents,
    tagline,
    children,
    darkMode = false,
    subtitle,
}: RevelatoryHeroProps) => {
    const isAppleseed = type === "appleseed";

    // Day 58 (Sasha 2026-05-02): icon/iconBg/iconColor/divider fields
    // pruned — were dead code after the Three-Lenses inner-card retired
    // and the inline ornament was replaced with <Ornament />. Palette
    // now carries only what the rendered surface actually consumes.
    const palette = darkMode
        ? {
            gradient: "from-transparent to-transparent",
            textPrimary: "text-white/90",
            textMuted: "text-[#f4d472]",
            shadowText: "text-white/75",
            glowColor: "rgba(212,175,55,0.22)",
            cardBorder: "1px solid rgba(244, 212, 114, 0.32)",
        }
        : isAppleseed
        ? {
            gradient: "from-white/70 via-[#fdf6e3]/80 to-white/60",
            textPrimary: "text-[#2c3150]",
            textMuted: "text-[#7a5108]",
            shadowText: "text-[#2c3150]/80",
            glowColor: "rgba(212,175,55,0.14)",
            cardBorder: "1px solid rgba(212, 175, 55, 0.32)",
        }
        : {
            gradient: "from-[#8c6410] via-[#7a5108] to-[#6b4208]",
            textPrimary: "text-white",
            textMuted: "text-[#f5e6b0]/65",
            shadowText: "text-[#f5e6b0]/85",
            glowColor: "rgba(244,212,114,0.3)",
            cardBorder: "1px solid rgba(244, 212, 114, 0.30)",
        };

    // The card ref captures the outer wrapper so html2canvas can
    // serialize what the user sees, including the breathing-card glow
    // and the gradient backdrop.
    const cardRef = useRef<HTMLDivElement>(null);
    const shareText = buildShareTextFor(title, actionStatement, topThreeTalents);

    // Day 61 (Sasha 2026-05-04): defensive filter — drop empty strings,
    // limit to 3 entries (in case the model over-generates) so the
    // reveal block always renders predictably.
    const compactTalents = topThreeTalents
        ?.map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter(Boolean)
        .slice(0, 3);

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

                {/* Legacy subtitle support — uses shadowText shade
                    (closest match to the retired textSecondary). */}
                {!actionStatement && subtitle && (
                    <p
                        className={`text-lg sm:text-xl ${palette.shadowText} italic max-w-xl mx-auto mb-6`}
                    >
                        "{subtitle}"
                    </p>
                )}

                {/* My Three Talents — Day 61 (Sasha 2026-05-04).
                    Compact gerund-+-concrete-object form (e.g.,
                    "Sensing the unspoken / Softening the wound /
                    Blessing the threshold"), three lines stacked.
                    Sourced from `topTalentProfile.top_three_talents_compact`.
                    Sits between the bullseye and the top-shadow block —
                    the natural narrative arc is: identity (top talent
                    name) → action (bullseye) → three facets → inversion
                    (shadow). Each line gets a subtle gold pip so the
                    triplet reads as a sacred-pattern signal without
                    competing with the headline. Hides cleanly when the
                    field is absent (pre-Day-61 snapshots). */}
                {compactTalents && compactTalents.length > 0 && (
                    <>
                        <Ornament className="mt-6 mb-4" />

                        <p
                            className={`text-[10px] sm:text-xs uppercase tracking-[0.28em] ${palette.textMuted} mb-3`}
                        >
                            My three talents
                        </p>

                        {/* Day 61 (Sasha 2026-05-04 11:30 update):
                            ✦ glyphs replaced with numerals 1/2/3 — the
                            triplet now reads as an ordered list, easier
                            to reference ("my second talent is..."). The
                            numerals carry the same gold-eyebrow color
                            so they read as part of the editorial
                            register, not as ordinary digits. */}
                        <ol className="max-w-2xl mx-auto space-y-1.5">
                            {compactTalents.map((talent, i) => (
                                <li
                                    key={i}
                                    className={`font-display text-base sm:text-lg md:text-xl italic ${palette.textPrimary} leading-snug`}
                                    style={{
                                        textShadow: `0 0 32px ${palette.glowColor}, 0 0 10px rgba(255,255,255,0.10)`,
                                        fontWeight: 500,
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`mr-2 not-italic ${palette.textMuted}`}
                                        style={{
                                            fontSize: "0.85em",
                                            fontVariantNumeric: "tabular-nums lining-nums",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {i + 1}.
                                    </span>
                                    {talent}
                                </li>
                            ))}
                        </ol>
                    </>
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
                            My top shadow
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

                {/* Brand footer — Day 61 (Sasha 2026-05-04 12:45).
                    The saved/shared PNG was rendering naked (no source
                    URL, no brand mark), so the recipient had no path
                    back. Footer sits INSIDE cardRef → it gets captured
                    by html2canvas and travels with the image.
                    Position: above Save · Share so the saved image
                    reads sensibly: content → brand → actions.
                    Composition: subtle ornament rule → small torus
                    glyph → "→ get yours · findyourtoptalent.com" line
                    in italic Cormorant. The torus alone (no wordmark)
                    so the footer reads as a glyph + tagline, not a
                    heavy lockup. */}
                <Ornament className="mt-6 mb-4" />
                <div className="flex flex-col items-center gap-2.5 mt-1 mb-2">
                    {/* Day 61 (Sasha 2026-05-04 18:00): brand torus
                        DROPPED from the footer composition. The QR
                        code + URL line below already do the brand-mark
                        + way-back jobs the torus was carrying — three
                        brand elements in one footer felt busy. The
                        torus image import + its drop-shadow filter
                        (which was the suspected html2canvas trigger)
                        are now both gone from the captured tree. */}
                    <p
                        className={`font-display text-sm sm:text-base italic ${palette.textPrimary} leading-snug`}
                        style={{
                            fontWeight: 500,
                            textShadow: `0 0 24px ${palette.glowColor}`,
                        }}
                    >
                        → get yours · <span style={{ fontWeight: 600 }}>findyourtoptalent.com</span>
                    </p>

                    {/* QR code — Day 61 (Sasha 2026-05-04 17:45).
                        Friction-killer for word-of-mouth: people who see
                        the shared/saved PNG can SCAN to take the quiz
                        themselves, no typing required. White bg + dark
                        fg = universal scannability standard (works in
                        both Aurora light and Navy+Gold dark skins
                        without color contortions). 60px is the sweet
                        spot — readable by phone cameras at typical
                        social-feed image sizes (~1080px wide), small
                        enough not to compete with the brand torus +
                        URL composition above. UTM tags so we can
                        attribute QR-driven traffic separately from
                        link-clicks in analytics. */}
                    <div
                        className="mt-2 p-1.5 rounded-md"
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        <QRCodeCanvas
                            value="https://findyourtoptalent.com?utm_source=qr&utm_medium=image&utm_campaign=top_talent_reveal"
                            size={60}
                            bgColor="#ffffff"
                            fgColor="#0a1628"
                            level="M"
                            includeMargin={false}
                        />
                    </div>
                </div>

                {/* Save · Share — kept; one-click PNG capture + socials
                    popover. Share text now drops the retired Three-Lenses
                    block; carries archetype + bullseye + invite.
                    Day 61 (Sasha 2026-05-04 17:45): captureWidth=480
                    forces vertical 9:16-ish PNG output suitable for
                    Stories / Reels / TikTok. */}
                <div className="mt-5 text-center">
                    <CardActions
                        captureRef={cardRef}
                        fileName={`${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "my-top-talent"}-find-your-top-talent`}
                        shareText={shareText}
                        darkMode={darkMode}
                        captureWidth={480}
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
