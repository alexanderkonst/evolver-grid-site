import { ArrowRight, Mail } from "lucide-react";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import ShareZoG from "@/components/sharing/ShareZoG";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { AppleseedData } from "./appleseedGenerator";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSkin } from "@/contexts/SkinContext";
// Day 48 iter 15 (Sasha): the "Turn My Top Talent into a Growing
// Business" primary CTA migrated from the white-glass card to the
// landing CTA signature (glass-dark pill + ignite emblem + small-caps
// label + breath) so every primary action across the funnel reads
// as the same voice.
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";
import mcCrossStar from "@/assets/mc-cross-star.png";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9B6dR9bME6i71TP7r2dEs0A";

interface AppleseedDisplayProps {
    appleseed: AppleseedData;
    profileUrl?: string;
    profileId?: string;
    onCreateBusiness?: () => void;
    isSaved?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
    onResonanceRating?: (rating: number) => void;
}

/**
 * OwnershipSection — ONE intention per moment
 * Step 1: Save (dominant). Step 2: Share (collapsed, delayed).
 * Sequence: See self → Own it → Then share it.
 */
/**
 * OwnershipSection — compact inline save (Sasha, 2026-04-21).
 *
 * No longer a blocking gate above the CTAs. Lives in the footer row next
 * to share — subtle, click to expand inline, single-field. The anonymous
 * profile is already persisted; this just links an email to it.
 */
const OwnershipSection = ({
    emailUnlocked,
    isSaved,
    email,
    setEmail,
    emailSaving,
    handleEmailSubmit,
}: {
    emailUnlocked: boolean;
    isSaved: boolean;
    email: string;
    setEmail: (v: string) => void;
    emailSaving: boolean;
    handleEmailSubmit: (e: React.FormEvent) => void;
}) => {
    const [expanded, setExpanded] = useState(false);

    // Success state — quiet confirmation, no form.
    if (emailUnlocked || isSaved) {
        return (
            <div className="text-center py-2">
                <p className="text-xs" style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))" }}>
                    ✓ Saved. We sent your top talent to your inbox so you can come back to it.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            {!expanded ? (
                <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="w-full flex items-center justify-center gap-2 p-3
                               rounded-full liquid-glass
                               hover:scale-[1.015] active:scale-[0.985]
                               transition-all duration-300 text-xs"
                    style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }}
                >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Save my top talent result for later</span>
                </button>
            ) : (
                <form
                    onSubmit={handleEmailSubmit}
                    className="flex items-center gap-2 p-2 rounded-full liquid-glass"
                >
                    <Mail className="w-3.5 h-3.5 ml-2 flex-shrink-0" style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.45))" }} />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        autoFocus
                        className="flex-1 bg-transparent border-0 text-sm focus:outline-none min-w-0"
                        style={{ color: "var(--skin-text-primary, #0a1628)" }}
                        required
                    />
                    {/* Day 48 iter 7 (Sasha): save-email button migrated
                        from violet (#8460ea) to the signature gold so
                        it reads as the same family as the primary CTA. */}
                    <button
                        type="submit"
                        disabled={emailSaving || !email.trim()}
                        className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white
                                   disabled:opacity-40 transition-colors"
                        style={{
                            backgroundImage:
                                "linear-gradient(135deg, #a06d08 0%, #7a5108 45%, #6b4208 100%)",
                        }}
                    >
                        {emailSaving ? "Saving…" : "Send it"}
                    </button>
                </form>
            )}
        </div>
    );
};

/**
 * DelayedShare — appears 800ms after page load, below CTAs
 */
const DelayedShare = ({
    appleseed,
    profileId,
    profileUrl,
}: {
    appleseed: AppleseedData;
    profileId?: string;
    profileUrl?: string;
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="animate-in fade-in duration-700 opacity-50 hover:opacity-70 transition-opacity max-w-md mx-auto">
            <ShareZoG
                archetypeName={appleseed.vibrationalKey.name}
                tagline={appleseed.bullseyeSentence}
                primeDriver={appleseed.threeLenses.primeDriver}
                talents={appleseed.threeLenses.actions}
                archetype={appleseed.threeLenses.archetype}
                profileId={profileId}
                profileUrl={profileUrl}
            />
        </div>
    );
};

/**
 * AppleseedDisplay — ZoG result screen (dark liquid glass)
 * Flow: Genius reveal → Email gate → Own (save) → Amplify (share, delayed)
 */
const AppleseedDisplay = ({
    appleseed,
    profileUrl,
    profileId,
    onCreateBusiness,
    isSaved = true,
    onSave,
    isSaving = false,
    onResonanceRating,
}: AppleseedDisplayProps) => {
    const { toast } = useToast();
    const { skin } = useSkin();
    // On Navy+Gold the light-cream reveal card reads as a bright slab on
    // dark panel. Use the hero's built-in `darkMode` palette (liquid-glass
    // body + cream text) so the card stays in the skin's family.
    const useDarkHero = skin === "navy-gold";

    // Email gate state
    const [email, setEmail] = useState('');
    const [emailUnlocked, setEmailUnlocked] = useState(false);
    const [emailSaving, setEmailSaving] = useState(false);

    // Day 47 late pass (Sasha): result page was opening mid-scroll (the
    // generation flow's scroll position carried over). Force top on mount.
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []);

    const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) return;
        setEmailSaving(true);
        try {
            // Call edge function for silent account creation + result persistence
            const { data, error } = await supabase.functions.invoke('save-zog-result', {
                body: {
                    email: email.trim(),
                    appleseedData: appleseed,
                    source: 'zog_ownership_save',
                },
            });

            if (error) {
                console.error('[save-zog-result] Edge function error:', error);
                // Fallback: save to divine_timing_leads directly
                await (supabase as any).from('divine_timing_leads').insert({
                    email: email.trim(),
                    source: 'zog_save_fallback',
                    created_at: new Date().toISOString(),
                });
            } else {
                console.log('[save-zog-result] Success:', data);
            }
        } catch {
            // Silently continue — UI should never break on save failure
        }
        setEmailUnlocked(true);
        setEmailSaving(false);
        toast({
            title: "✓ Saved",
            description: "You can come back to this anytime.",
        });
    }, [email, toast, appleseed]);

    return (
        <>
            {/*
              Day 47 (Sasha): Background equalized with the rest of the journey.
              The old full-viewport dark gradient (bg-[#0a0a1a] + /65 overlay)
              blacked out GameShellV2's ambient Panel 3 tone and made the result
              page feel like a different product from the ZoG entry page. Now we
              let Panel 3's native background show through — same palette as
              /zone-of-genius, /playbook, /path.
            */}

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-2 space-y-6">
                {/* Epic Revelatory Hero - The core genius reveal.
                    Day 47 late pass (Sasha): dropped `darkMode` so the hero uses
                    the light palette (dark slate text on soft white gradient) —
                    consistent with the now-light Panel 3. */}
                <RevelatoryHero
                    type="appleseed"
                    title={appleseed.vibrationalKey.name}
                    tagline="My genius is to be a"
                    actionStatement={appleseed.bullseyeSentence}
                    threeLenses={{
                        actions: appleseed.threeLenses.actions,
                        primeDriver: appleseed.threeLenses.primeDriver,
                        archetype: appleseed.threeLenses.archetype,
                    }}
                    darkMode={useDarkHero}
                />

                {/* THE BRIDGE — Day 51 (Sasha): macro-bridge between
                    "this is you" (the card above) and "this is a business"
                    (the gap + CTAs below). Lands as a seed-question right
                    after the card so everything that follows is read
                    through it. */}
                <div
                    className="pt-8 pb-4 max-w-2xl mx-auto text-center"
                    style={{
                        fontFamily: "'Source Serif 4', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                    }}
                >
                    <p
                        className="leading-[1.2] tracking-tight"
                        style={{
                            fontSize: 'clamp(1.6rem, 4.5vw, 2.5rem)',
                            fontWeight: 500,
                        }}
                    >
                        What if your shining this top talent bright{' '}
                        <em
                            className="not-italic"
                            style={{
                                fontWeight: 700,
                                fontStyle: 'italic',
                            }}
                        >
                            IS
                        </em>{' '}
                        your business?
                    </p>
                </div>

                {/* Resonance Rating */}
                {onResonanceRating && (
                    <ResonanceRating
                        question="From 1 to 10, how well does this match how you see yourself at your brightest?"
                        onRate={onResonanceRating}
                    />
                )}

                {/* ═══════════════════════════════════════════════
                    THE GAP — Day 47 iter 10 (Sasha + GFOA v2.0):
                    full copy replacement. Tighter. Named chain. Same
                    visual container, fewer words, sharper bite. Preserves
                    placement (post-archetype reveal), preserves text-only
                    shape (no new visual structure).
                    ═══════════════════════════════════════════════ */}
                <div
                    className="py-12 max-w-lg mx-auto flex flex-col items-center justify-center text-center space-y-6"
                    style={{
                        fontFamily: "'Source Serif 4', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                    }}
                >
                    <p
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ color: "var(--skin-text-primary, #0a1628)", fontWeight: 500 }}
                    >
                        Right now, you don't have a clear way to say what you do.
                    </p>

                    <ul
                        className="text-base leading-relaxed space-y-3 list-none text-left max-w-md mx-auto"
                        style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.85))" }}
                    >
                        <li className="flex gap-3 items-start">
                            <img
                                src={mcCrossStar}
                                alt=""
                                aria-hidden="true"
                                className="w-5 h-5 mt-0.5 flex-shrink-0 object-contain opacity-90"
                            />
                            <span>If you can't explain it clearly → people don't understand it.</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <img
                                src={mcCrossStar}
                                alt=""
                                aria-hidden="true"
                                className="w-5 h-5 mt-0.5 flex-shrink-0 object-contain opacity-90"
                            />
                            <span>If people don't understand it → they don't buy.</span>
                        </li>
                    </ul>

                    <div className="space-y-2 pt-4">
                        <p
                            className="text-base leading-relaxed"
                            style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.85))" }}
                        >
                            This isn't about trying harder.
                        </p>
                        <p
                            className="text-lg leading-relaxed"
                            style={{ color: "var(--skin-text-primary, #0a1628)", fontWeight: 500 }}
                        >
                            It's about saying what you do in a way people buy.
                        </p>
                    </div>
                </div>

                {/* Social proof — Day 47 late pass (Sasha): ONE testimonial, inserted
                    between "The Gap" and the primary CTA. Sergey's quote is the most
                    on-theme because "I was applying force, but the vector was wrong"
                    IS the reframe the whole Gap section just delivered. */}
                <figure
                    className="liquid-glass rounded-2xl p-6 max-w-lg mx-auto text-center"
                    style={{ fontFamily: "'Source Serif 4', serif" }}
                >
                    <blockquote
                        className="text-base md:text-lg leading-relaxed italic"
                        style={{
                            color: "var(--skin-text-primary, #0a1628)",
                            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                        }}
                    >
                        "I was applying force, but the vector was wrong.
                        The structure is genius. Absolutely everything clicks."
                    </blockquote>
                    <figcaption
                        className="mt-4 text-xs"
                        style={{
                            color: "var(--skin-text-muted-soft, rgba(26,30,58,0.65))",
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        — <strong style={{ color: "var(--skin-text-primary, #0a1628)" }}>Sergey Jay Makarov</strong>, Serial Founder &amp; System Architect
                    </figcaption>
                </figure>

                {/* OwnershipSection used to sit here as a blocking email gate.
                    Moved to the footer row below the CTAs (Sasha, 2026-04-21)
                    as a quiet save-to-inbox option, not a barrier. */}

                {/* ═══════════════════════════════════════════════
                    CTAs — primary/secondary (Sasha, 2026-04-21):
                    "Turn My Top Talent into a Growing Business" is the main
                    action. The diagnostic quiz is the secondary learn-more.
                    ═══════════════════════════════════════════════ */}
                <div className="max-w-md mx-auto space-y-4">

                    {/* Framing line above primary CTA — Day 47 iter 10 (GFOA v2.0) */}
                    <p
                        className="text-center text-sm sm:text-base mb-1"
                        style={{
                            fontFamily: "'Source Serif 4', serif",
                            color: "var(--skin-text-primary, #0a1628)",
                            fontWeight: 500,
                            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                        }}
                    >
                        We fix this in 2 hours.
                    </p>
                    <p
                        className="text-center text-sm sm:text-base mb-4"
                        style={{
                            fontFamily: "'Source Serif 4', serif",
                            color: "var(--skin-text-primary, #0a1628)",
                            fontWeight: 500,
                            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                        }}
                    >
                        Or you don't pay.
                    </p>

                    {/* CTA 1 (PRIMARY) — Day 48 iter 15 (Sasha):
                        migrated from the white-glass card with arrow
                        disc to the full landing CTA signature: dark
                        glass pill + ignite emblem + small-caps label
                        + breath animation. Now rhymes with the landing
                        hero CTA and every other primary across the
                        funnel. */}
                    <a
                        href="/ignite#pricing-section"
                        className="group liquid-glass-dark cta-breath w-full rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 sm:py-3.5 max-w-full text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                            backgroundImage:
                                "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                            boxShadow:
                                "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                            textShadow:
                                "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
                        }}
                    >
                        <img
                            src={igniteLogo}
                            alt=""
                            aria-hidden="true"
                            className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100 flex-shrink-0"
                            style={{
                                filter: "drop-shadow(0 0 6px rgba(244, 212, 114, 0.45))",
                                animation: "gentle-spin 60s linear infinite",
                                willChange: "transform",
                                transformOrigin: "center",
                            }}
                            draggable={false}
                        />
                        <span style={CTA_SMALL_CAPS_STYLE} className="text-center">
                            Turn my top talent into a growing business
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                        />
                    </a>

                    {/* Mini bridge line */}
                    <p
                        className="text-center text-xs italic"
                        style={{ color: "var(--skin-text-muted-soft, rgba(26,30,58,0.62))" }}
                    >
                        Want to learn more before acting?
                    </p>

                    {/* CTA 2 (SECONDARY): Diagnostic quiz */}
                    <a
                        href="/quiz"
                        className="w-full flex items-center justify-center gap-3 p-4
                                   rounded-2xl liquid-glass
                                   hover:scale-[1.015] active:scale-[0.985]
                                   transition-all duration-300 text-sm tracking-wide font-medium"
                        style={{ color: "var(--skin-text-body, rgba(26,30,58,0.82))" }}
                    >
                        <span>
                            See exactly why this hasn't turned into income
                            <span
                                className="block tracking-normal text-[10px] mt-0.5"
                                style={{ color: "var(--skin-text-faint, rgba(26,30,58,0.55))" }}
                            >
                                6-question diagnostic
                            </span>
                        </span>
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>

                {/* ═══════════════════════════════════════════════
                    FOOTER ROW — save + share, both de-emphasized
                    (Sasha, 2026-04-21). Primary decision already lived
                    in the CTAs above; this is the escape hatch for
                    "not ready right now."
                    ═══════════════════════════════════════════════ */}
                <div className="max-w-md mx-auto space-y-3 pt-6">
                    <OwnershipSection
                        emailUnlocked={emailUnlocked}
                        isSaved={isSaved}
                        email={email}
                        setEmail={setEmail}
                        emailSaving={emailSaving}
                        handleEmailSubmit={handleEmailSubmit}
                    />
                    <DelayedShare
                        appleseed={appleseed}
                        profileId={profileId}
                        profileUrl={profileUrl}
                    />
                </div>

                {/* Bottom signature removed 2026-04-21 per Sasha — it was
                    clipping into the open share dropdown and reading as a
                    glitch. The identical signature still appears in
                    RevelatoryHero above the page, so nothing is lost. */}
            </div>
        </>
    );
};

export default AppleseedDisplay;
