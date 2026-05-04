import { ArrowRight, Mail } from "lucide-react";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { AppleseedData } from "./appleseedGenerator";
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSkin } from "@/contexts/SkinContext";
// Day 48 iter 15 (Sasha): the "Turn My Top Talent into a Growing
// Business" primary CTA migrated from the white-glass card to the
// landing CTA signature (glass-dark pill + ignite emblem + small-caps
// label + breath) so every primary action across the funnel reads
// as the same voice.
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";
import { trackCTAClick } from "@/lib/funnelAnalytics";
// Day 58+ (Sasha 2026-05-03): legacy snapshots shipped top_shadow_one_sentence
// in second-person reflexive ("yourself") which reads broken under the
// "MY TOP SHADOW IS" eyebrow. Render-time band-aid flips to first-person
// reflexive ("myself") so existing users see the correct register without
// re-running the assessment. New snapshots come out correct natively.
import { flipToFirstPersonReflexive } from "@/lib/zogProfileVoice";

// Stripe checkout link for the $37 Activation product. Day 57 (Sasha
// 2026-05-01). Stripe redirects customers to /activate/welcome on
// successful payment.
const STRIPE_ACTIVATE_LINK = "https://buy.stripe.com/00w6oH7wo21R41XaDedEs0H";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/9B6dR9bME6i71TP7r2dEs0A";

// Activation coupons — exceptional cases / testing only. Day 58 (Sasha
// 2026-05-02). Refactored to a Set on Day 60 (Sasha 2026-05-04) so
// multiple codes can coexist without the comparison branching.
// Comparison is case-insensitive (entries below MUST be lowercase).
// No backend validation: these are frontend bypasses that skip the
// Stripe checkout and land the user directly on
// /game/me/zone-of-genius/start-here — the activation home.
//
// To revoke a code: remove its entry. To rotate: replace the string.
// To add: append another string. Code names are memorable English /
// methodology references chosen so a holder can type them quickly:
//   • guerishenko — original code, personal handle
//   • appleseed   — the methodology artifact this activation unlocks
//                   (the Appleseed → Top Talent reveal)
const ACTIVATION_COUPON_CODES = new Set([
    "guerishenko",
    "appleseed",
]);

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
    // Success state — quiet confirmation, no form.
    // Day 61 (Sasha 2026-05-04): legibility — text-xs → text-sm and
    // muted-soft → muted so the saved-confirmation reads after Sasha
    // pointed out the reveal arc was too thin/pale.
    if (emailUnlocked || isSaved) {
        return (
            <div className="text-center py-2">
                <p
                    className="text-sm"
                    style={{
                        color: "var(--skin-text-muted, rgba(11,42,90,0.86))",
                        fontFamily: "'Source Serif 4', serif",
                        fontWeight: 500,
                    }}
                >
                    ✓ Saved. We sent your top talent to your inbox so you can come back to it.
                </p>
            </div>
        );
    }

    // Day 58+ (Sasha 2026-05-03): expand-on-click pill retired. The form
    // now renders directly so the layout matches Sasha's "[email field]
    // [Save it]" pattern — one less click, one less moment of decision.
    // The framing line above ("Email it to yourself, so you don't lose
    // it.") is rendered by the parent.
    return (
        <div className="max-w-md mx-auto">
            <form
                onSubmit={handleEmailSubmit}
                className="flex items-center gap-2 p-2 rounded-full liquid-glass"
            >
                <Mail
                    className="w-3.5 h-3.5 ml-2 flex-shrink-0"
                    style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.45))" }}
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 bg-transparent border-0 text-sm focus:outline-none min-w-0"
                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                    required
                />
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
                    {emailSaving ? "Saving…" : "Save it"}
                </button>
            </form>
        </div>
    );
};

/**
 * AppleseedDisplay — ZoG result screen (dark liquid glass)
 * Flow: Genius reveal → Email gate → Own (save)
 *
 * Day 51 night (Sasha): the standalone delayed-share strip
 * (formerly "Optional: Get perspective from others") was retired.
 * Save + Share now live in-card via CardActions inside RevelatoryHero
 * — one-click, always visible, no delay, no second component to discover.
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
    const navigate = useNavigate();
    // On Navy+Gold the light-cream reveal card reads as a bright slab on
    // dark panel. Use the hero's built-in `darkMode` palette (liquid-glass
    // body + cream text) so the card stays in the skin's family.
    const useDarkHero = skin === "navy-gold";

    // Email gate state
    const [email, setEmail] = useState('');
    const [emailUnlocked, setEmailUnlocked] = useState(false);
    const [emailSaving, setEmailSaving] = useState(false);

    // Activation coupon bypass — exceptional / testing path. Subtle
    // collapsed link below the $37 CTA; click to reveal a single input;
    // valid code skips Stripe and routes straight to /activate/welcome.
    const [couponOpen, setCouponOpen] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [couponError, setCouponError] = useState(false);
    const handleCouponSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const entered = couponInput.trim().toLowerCase();
        if (ACTIVATION_COUPON_CODES.has(entered)) {
            trackCTAClick('activate_coupon_redeemed', 'appleseed_option2');
            navigate('/game/me/zone-of-genius/start-here');
        } else {
            setCouponError(true);
        }
    };

    // Day 57 (Sasha 2026-05-01): post-reveal page upgrade — recognition →
    // three options layout, fade-in timing, scroll bar.
    // Day 60 (Sasha 2026-05-03): exit-intent modal removed — Sasha:
    // "this pop-up was a bad idea, almost impossible to time it
    // properly." Mouseleave trigger, modal JSX, handleModalSubmit, and
    // all modal-only state (showExitModal/modalEmail/modalSubmitting/
    // exitShownRef) removed wholesale. The page-resident CTAs (save +
    // activate at the bottom of the reveal) carry the same job without
    // the interruption.
    const [ctasVisible, setCtasVisible] = useState(false);
    const [floatBarVisible, setFloatBarVisible] = useState(false);
    // Captured at mount: if isSaved was already true, this is a return visit.
    // Drives the "Your pattern is still here." top greeting.
    const [isReturning] = useState(() => isSaved);

    // Day 47 late pass (Sasha): result page was opening mid-scroll (the
    // generation flow's scroll position carried over). Force top on mount.
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }, []);

    // Fade in the three options ~1.2s after the snapshot lands.
    // Recognition block visible immediately; options arrive after the user
    // has had a beat with their pattern.
    useEffect(() => {
        const t = setTimeout(() => setCtasVisible(true), 1200);
        return () => clearTimeout(t);
    }, []);

    // Floating Activate pill appears once the user has scrolled ~halfway
    // through the page. Disappears near the very bottom so it doesn't
    // double up with the inline footer.
    //
    // Day 58 (Sasha 2026-05-02): GameShellV2 uses an inner scroll
    // container (.mobile-content-scroll on phones, .ai-os-desktop-content-scroll
    // on desktop) — listening to `window` alone misses those events. We
    // hook both window AND the actual scroller so the pill behaves on
    // every layout.
    useEffect(() => {
        const findScroller = (): HTMLElement | null => {
            return (
                document.querySelector<HTMLElement>(
                    '.mobile-content-scroll, .ai-os-desktop-content-scroll'
                ) ||
                (document.scrollingElement as HTMLElement | null) ||
                document.documentElement
            );
        };
        const handleScroll = () => {
            const scroller = findScroller();
            const scrolled = scroller?.scrollTop ?? window.scrollY;
            const total =
                (scroller?.scrollHeight ?? document.documentElement.scrollHeight) -
                (scroller?.clientHeight ?? window.innerHeight);
            if (total <= 0) {
                setFloatBarVisible(false);
                return;
            }
            const ratio = scrolled / total;
            setFloatBarVisible(ratio >= 0.45 && ratio < 0.95);
        };
        const scroller = findScroller();
        const isInnerScroller =
            scroller && scroller !== document.documentElement && scroller !== document.body;
        if (isInnerScroller) {
            scroller!.addEventListener('scroll', handleScroll, { passive: true });
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => {
            if (isInnerScroller) {
                scroller!.removeEventListener('scroll', handleScroll);
            }
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Day 60 (Sasha 2026-05-03): exit-intent mouseleave handler +
    // handleModalSubmit removed alongside the modal. See note above on
    // ctasVisible state for context.

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

            <div className="relative z-10 max-w-2xl mx-auto px-4 pt-2 pb-32 sm:pb-40 space-y-6">
                {/* Return-state greeting — Day 57 (Sasha 2026-05-01).
                    Shown only when the user is coming back to a previously
                    saved appleseed (isReturning captured at mount). */}
                {isReturning && (
                    <div className="text-center pt-1 -mb-2">
                        {/* Day 61 (Sasha 2026-05-04): legibility — bumped
                            from text-xs italic to text-sm italic + explicit
                            weight 500 + lifted muted alpha so the return-
                            visit greeting actually reads. */}
                        <p
                            className="text-sm italic"
                            style={{
                                color: "var(--skin-text-muted, rgba(11,42,90,0.86))",
                                fontFamily: "'Source Serif 4', serif",
                                fontWeight: 500,
                            }}
                        >
                            Your pattern is still here.
                        </p>
                    </div>
                )}

                {/* Epic Revelatory Hero — the core recognition moment.
                    Day 58 (Sasha 2026-05-02) restructure:
                    • "My genius is to be a [Forger]" → "My top talent is
                      [Forging]" (gerund form — reads grammatically
                      clean, brandable as identity).
                    • Three-Lenses inner-card retired. Replaced with the
                      Top Shadow paragraph (the highest-leverage emotional
                      payload — Sasha: "this is the one that hits hardest").
                    • Stronger ambient halo + subtle gold border on the
                      card itself. Dodecahedron rotates + glows.
                    The halo extends past the card's own borders so the
                    glow reads as light *coming off* the artifact. */}
                <div
                    style={{
                        borderRadius: '24px',
                        boxShadow:
                            '0 0 50px rgba(240, 194, 127, 0.32), 0 0 100px rgba(212, 175, 55, 0.16)',
                    }}
                >
                    <RevelatoryHero
                        type="appleseed"
                        title={appleseed.vibrationalKey.name}
                        tagline="My top talent is"
                        actionStatement={appleseed.bullseyeSentence}
                        topThreeTalents={appleseed.topTalentProfile?.top_three_talents_compact}
                        topShadow={flipToFirstPersonReflexive(appleseed.topTalentProfile?.top_shadow_one_sentence)}
                        darkMode={useDarkHero}
                    />
                </div>

                {/* Resonance Rating — Day 58 (Sasha 2026-05-02): placed
                    directly under the reveal box so "How much does this
                    sound like you?" lands right next to the thing being
                    rated. Was previously below the three options. */}
                {onResonanceRating && (
                    <ResonanceRating
                        step="appleseed"
                        onRate={onResonanceRating}
                    />
                )}

                {/* BRIDGE LINE — Day 58+ (Sasha 2026-05-03).
                    The 9-line poetic recognition block was replaced with
                    a single bridge that hands the user directly to the
                    two action paths below. The artifact box above carries
                    the confirmation; this line carries the agency. */}
                <div
                    className="py-10 max-w-lg mx-auto text-center"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                    }}
                >
                    <p
                        className="text-xl md:text-2xl leading-relaxed"
                        style={{ fontWeight: 500 }}
                    >
                        Now the question becomes: what do you want to do with your top talent knowledge?
                    </p>
                </div>

                {/* THREE OPTIONS — Day 57 (Sasha 2026-05-01).
                    Visual hierarchy is natural gravity, not pressure.
                    Primary = calm-solid dark glass. Secondary = soft outline.
                    Tertiary = text link. Fades in ~1.2s after the snapshot
                    so the recognition lands first; choice arrives second. */}
                <div
                    className="space-y-8 max-w-lg mx-auto transition-all duration-700 ease-out"
                    style={{
                        opacity: ctasVisible ? 1 : 0,
                        transform: ctasVisible ? 'translateY(0)' : 'translateY(12px)',
                    }}
                >
                    {/* OPTION 1 — Build a business ($555, primary, large)
                        Day 58 (Sasha 2026-05-02): numbered eyebrow retired
                        in favor of an italic lead-in ("If you're ready to
                        act:") + Cormorant title-case header. */}
                    <div
                        className="liquid-glass-strong rounded-3xl p-6 sm:p-7 space-y-4 text-center"
                        style={{
                            boxShadow: '0 10px 32px -12px rgba(10,22,40,0.18), inset 0 1px 0 rgba(255,255,255,0.15)',
                            border: '1px solid rgba(26,30,58,0.08)',
                        }}
                    >
                        <p
                            className="text-sm sm:text-base italic leading-snug"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                            }}
                        >
                            If you're ready to act:
                        </p>
                        <h3
                            className="leading-[1.15] tracking-[-0.005em]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: "clamp(1.5rem, 4vw, 1.85rem)",
                                fontWeight: 600,
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            Build a Business From It
                        </h3>
                        <p
                            className="text-base sm:text-lg leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                fontWeight: 500,
                            }}
                        >
                            Turn your top talent into a clear and sellable business offer.
                        </p>
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                            }}
                        >
                            We do it together in 2 hours.
                        </p>
                        <blockquote
                            className="text-sm italic leading-relaxed pt-1"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            "Everything clicks." — <strong className="not-italic">Sergey Jay Makarov</strong>
                        </blockquote>

                        {/* Primary CTA — hover swaps idle label for action label.
                            Idle: "Build a business from your top talent — $555"
                            Hover: "Turn this into an offer" */}
                        <a
                            href="/ignite#pricing-section"
                            className="group liquid-glass-dark cta-breath relative w-full rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
                            <span className="relative inline-block">
                                <span
                                    style={CTA_SMALL_CAPS_STYLE}
                                    className="block transition-opacity duration-300 group-hover:opacity-0"
                                >
                                    Build a business from your top talent — $555
                                </span>
                                <span
                                    style={CTA_SMALL_CAPS_STYLE}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap"
                                >
                                    Turn this into an offer
                                </span>
                            </span>
                            <ArrowRight
                                aria-hidden="true"
                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                            />
                        </a>
                    </div>

                    {/* OPTION 2 — Activate ($44, secondary, medium).
                        Day 58 (Sasha 2026-05-02): now wrapped in a
                        liquid-glass card so it reads as a sibling of
                        Option 1's box — same shape, lighter weight. */}
                    <div
                        className="liquid-glass rounded-3xl p-6 sm:p-7 space-y-4 text-center"
                        style={{
                            border: '1px solid rgba(26,30,58,0.06)',
                        }}
                    >
                        {/* Day 58+ (Sasha 2026-05-03): Card B simplified
                            per the "transformational result" pattern —
                            italic eyebrow lead-in (parallel to Card A's
                            "If you're ready to act:") + a result-named
                            title; body paragraphs retired (the title is
                            the value statement, no further setup needed);
                            CTA uses CTA_SMALL_CAPS_STYLE in uppercase
                            tracked register matching Card A; "Most people
                            start here" footer line retired. */}
                        <p
                            className="text-sm sm:text-base italic leading-snug"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                            }}
                        >
                            If you don't want to build your business yet:
                        </p>
                        <h3
                            className="leading-[1.15] tracking-[-0.005em]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: "clamp(1.5rem, 4vw, 1.85rem)",
                                fontWeight: 600,
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            Find Out How to Use &amp; Monetize Your Top Talent
                        </h3>

                        <a
                            href={STRIPE_ACTIVATE_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackCTAClick('activate_click', 'appleseed_option2')}
                            className="group liquid-glass relative w-full rounded-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                border: '1px solid rgba(26,30,58,0.2)',
                                textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                            }}
                        >
                            <span style={CTA_SMALL_CAPS_STYLE}>
                                Leverage your top talent — $37
                            </span>
                            <ArrowRight
                                aria-hidden="true"
                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                            />
                        </a>

                        <p
                            className="text-[10px] sm:text-[11px] font-semibold uppercase leading-relaxed pt-1"
                            style={{
                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                letterSpacing: "0.18em",
                                color: "rgba(122, 81, 8, 0.85)",
                            }}
                        >
                            7 min of understanding the value you bring + 6 min of guided meditation to connect with your talent somatically
                        </p>

                        {/* Coupon bypass — Day 58 (Sasha 2026-05-02).
                            Subtle inline expander; collapsed by default.
                            For exceptional access / internal testing. */}
                        {!couponOpen ? (
                            <button
                                type="button"
                                onClick={() => setCouponOpen(true)}
                                className="text-[11px] underline-offset-2 hover:underline transition-opacity duration-200 opacity-60 hover:opacity-90"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))",
                                }}
                            >
                                Have a code?
                            </button>
                        ) : (
                            <form onSubmit={handleCouponSubmit} className="space-y-1.5 pt-1">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => {
                                            setCouponInput(e.target.value);
                                            if (couponError) setCouponError(false);
                                        }}
                                        autoFocus
                                        placeholder="Code"
                                        aria-label="Activation code"
                                        className="flex-1 min-w-0 rounded-full px-3.5 py-2 text-xs bg-white/70 border outline-none focus:ring-2 focus:ring-[hsla(40,70%,55%,0.45)]"
                                        style={{
                                            fontFamily: "'Source Serif 4', serif",
                                            color: "var(--skin-text-primary, #0a1628)",
                                            borderColor: couponError
                                                ? 'rgba(180, 50, 50, 0.55)'
                                                : 'rgba(26,30,58,0.18)',
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!couponInput.trim()}
                                        className="rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            background: "linear-gradient(135deg, hsla(40, 75%, 60%, 0.32) 0%, hsla(40, 65%, 50%, 0.18) 100%)",
                                            border: "1px solid hsla(40, 70%, 55%, 0.50)",
                                            color: "#5d4307",
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && (
                                    <p
                                        className="text-[10.5px] text-left pl-1"
                                        style={{
                                            fontFamily: "'Source Serif 4', serif",
                                            color: "rgba(180, 50, 50, 0.85)",
                                        }}
                                    >
                                        Invalid code.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>

                </div>

                {/* QUIET FOOTER — Day 58+ (Sasha 2026-05-03):
                    consolidated email-save + secondary playbook link
                    into one calm footer block. The full liquid-glass
                    playbook card (formerly Option 3) collapsed into a
                    single text link here — kept available, no longer
                    visually competing with the two action paths above. */}
                <div className="max-w-md mx-auto space-y-4 pt-6">
                    {/* Day 61 (Sasha 2026-05-04): legibility — both
                        footer micro-lines (the email-save framing and
                        the playbook bridge) bumped from text-xs to
                        text-sm + Source Serif weight 500 + lifted to
                        muted (was muted-soft). */}
                    <p
                        className="text-center text-sm italic"
                        style={{
                            color: "var(--skin-text-muted, rgba(11,42,90,0.86))",
                            fontFamily: "'Source Serif 4', serif",
                            fontWeight: 500,
                        }}
                    >
                        Email it to yourself, so you don't lose it.
                    </p>
                    <OwnershipSection
                        emailUnlocked={emailUnlocked}
                        isSaved={isSaved}
                        email={email}
                        setEmail={setEmail}
                        emailSaving={emailSaving}
                        handleEmailSubmit={handleEmailSubmit}
                    />
                    <p
                        className="text-center text-sm"
                        style={{
                            fontFamily: "'Source Serif 4', serif",
                            fontWeight: 500,
                            color: "var(--skin-text-muted, rgba(11,42,90,0.86))",
                        }}
                    >
                        Or read the exact playbook first →{" "}
                        <a
                            href="/playbook"
                            className="underline underline-offset-2 transition-colors hover:opacity-80"
                            style={{
                                color: "var(--skin-text-primary, rgba(10,22,40,0.85))",
                                textDecorationColor: "rgba(26,30,58,0.3)",
                            }}
                        >
                            the playbook
                        </a>
                    </p>
                </div>
            </div>

            {/* FLOATING ACTIVATE PILL — Day 58 (Sasha 2026-05-02).
                Was a full-width translucent bar with redundant left text;
                replaced with a compact right-anchored glass pill so it
                reads as a quiet shortcut, not a banner. Appears at ~50%
                scroll, hides near the very bottom (where the inline CTAs
                already cover the same offer). */}
            <div
                className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-500 ${
                    floatBarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                aria-hidden={!floatBarVisible}
            >
                <a
                    href={STRIPE_ACTIVATE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick('activate_click', 'appleseed_floating_bar')}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-300 hover:scale-[1.04] active:scale-[0.97]"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.90))',
                        border: '1px solid rgba(122, 81, 8, 0.32)',
                        boxShadow:
                            '0 10px 28px -10px rgba(10,22,40,0.22), 0 0 18px -2px rgba(244,212,114,0.45), inset 0 1px 0 rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                    }}
                >
                    Activate — $37 →
                </a>
            </div>

            {/* Day 60 (Sasha 2026-05-03): exit-intent modal removed.
                The page-resident CTAs above (save by email + activate)
                carry the same job without the interruption. */}
        </>
    );
};

export default AppleseedDisplay;
