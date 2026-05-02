import { ArrowRight, Mail, X } from "lucide-react";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { AppleseedData } from "./appleseedGenerator";
import { useState, useCallback, useEffect, useRef } from "react";
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

// Stripe checkout link for the $37 Activation product. Day 57 (Sasha
// 2026-05-01). Stripe redirects customers to /activate/welcome on
// successful payment.
const STRIPE_ACTIVATE_LINK = "https://buy.stripe.com/00w6oH7wo21R41XaDedEs0H";

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
        <div className="max-w-md mx-auto space-y-2">
            {/* Day 53 (Sasha): "Activate your full Genius Profile" CTA
                temporarily hidden — /game/me surface is being polished.
                Users still receive the magic-link email to enter later. */}
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
                    <span>Or just email me my result</span>
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
    // On Navy+Gold the light-cream reveal card reads as a bright slab on
    // dark panel. Use the hero's built-in `darkMode` palette (liquid-glass
    // body + cream text) so the card stays in the skin's family.
    const useDarkHero = skin === "navy-gold";

    // Email gate state
    const [email, setEmail] = useState('');
    const [emailUnlocked, setEmailUnlocked] = useState(false);
    const [emailSaving, setEmailSaving] = useState(false);

    // Day 57 (Sasha 2026-05-01): post-reveal page upgrade — recognition →
    // three options layout, fade-in timing, scroll bar, exit-intent modal.
    const [ctasVisible, setCtasVisible] = useState(false);
    const [floatBarVisible, setFloatBarVisible] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const [modalEmail, setModalEmail] = useState('');
    const [modalSubmitting, setModalSubmitting] = useState(false);
    const exitShownRef = useRef(false);
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

    // Floating "you can come back to this anytime / activate" bar appears
    // once the user has scrolled ~halfway through the page. Disappears near
    // the very bottom so it doesn't double up with the inline footer.
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            if (total <= 0) {
                setFloatBarVisible(false);
                return;
            }
            const ratio = scrolled / total;
            setFloatBarVisible(ratio >= 0.45 && ratio < 0.95);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Exit-intent — desktop mouseleave from top of viewport, fires once per
    // session, suppressed if the user has already saved.
    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (exitShownRef.current) return;
            if (emailUnlocked || isSaved) return;
            if (e.clientY <= 0 && (e.relatedTarget === null || (e.relatedTarget as Element)?.nodeName === 'HTML')) {
                exitShownRef.current = true;
                setShowExitModal(true);
            }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, [emailUnlocked, isSaved]);

    const handleModalSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modalEmail.trim() || !modalEmail.includes('@')) return;
        setModalSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke('save-zog-result', {
                body: {
                    email: modalEmail.trim(),
                    appleseedData: appleseed,
                    source: 'zog_exit_intent_save',
                },
            });
            if (error) {
                console.error('[modal save] Edge function error:', error);
                await (supabase as any).from('divine_timing_leads').insert({
                    email: modalEmail.trim(),
                    source: 'zog_exit_intent_fallback',
                    created_at: new Date().toISOString(),
                });
            } else {
                console.log('[modal save] Success:', data);
            }
        } catch {
            // Silently continue — UI should never break on save failure
        }
        setEmailUnlocked(true);
        setModalSubmitting(false);
        setShowExitModal(false);
        toast({
            title: "✓ Saved",
            description: "You can come back to this anytime.",
        });
    }, [modalEmail, appleseed, toast]);

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
                        <p
                            className="text-xs italic"
                            style={{
                                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                                fontFamily: "'Source Serif 4', serif",
                            }}
                        >
                            Your pattern is still here.
                        </p>
                    </div>
                )}

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

                {/* RECOGNITION BLOCK — Day 57 (Sasha 2026-05-01).
                    Replaces the prior Bridge ("What if shining...") and the
                    Gap pain-chain. Holds the moment steady; no coercion;
                    true → clear → usable. */}
                <div
                    className="py-10 max-w-lg mx-auto text-center space-y-7"
                    style={{
                        fontFamily: "'Source Serif 4', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                    }}
                >
                    <div className="space-y-2">
                        <p className="text-lg md:text-xl leading-relaxed" style={{ fontWeight: 600 }}>
                            You felt that.
                        </p>
                        <p className="text-lg md:text-xl leading-relaxed" style={{ fontWeight: 500 }}>
                            That's your pattern.
                        </p>
                        <p
                            className="text-base leading-relaxed pt-1"
                            style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.78))" }}
                        >
                            Not something added.
                        </p>
                        <p
                            className="text-base leading-relaxed"
                            style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.78))" }}
                        >
                            Something that's already been there.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-base md:text-lg leading-relaxed" style={{ fontWeight: 500 }}>
                            Right now, you can see it.
                        </p>
                        <p
                            className="text-base leading-relaxed"
                            style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.78))" }}
                        >
                            And usually, this is where people pause.
                        </p>
                        <p
                            className="text-base leading-relaxed italic"
                            style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.78))" }}
                        >
                            They recognize it…
                            <br />
                            and then drift back into working the same way as before.
                        </p>
                    </div>

                    <div className="space-y-1 pt-2">
                        <p
                            className="text-base leading-relaxed"
                            style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.78))" }}
                        >
                            So the question is simple:
                        </p>
                        <p className="text-xl md:text-2xl leading-relaxed" style={{ fontWeight: 600 }}>
                            What do you want to do with it?
                        </p>
                    </div>
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
                    {/* OPTION 1 — Build a business ($555, primary, large) */}
                    <div
                        className="liquid-glass-strong rounded-3xl p-6 sm:p-7 space-y-4 text-center"
                        style={{
                            boxShadow: '0 10px 32px -12px rgba(10,22,40,0.18), inset 0 1px 0 rgba(255,255,255,0.15)',
                            border: '1px solid rgba(26,30,58,0.08)',
                        }}
                    >
                        <p
                            className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase"
                            style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.65))" }}
                        >
                            1 — Build a business from it
                        </p>
                        <p
                            className="text-base sm:text-lg leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                fontWeight: 500,
                            }}
                        >
                            Take this exact pattern and shape it into something clear and sellable.
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
                        TODO: wire /activate to the real Stripe link or new
                        landing page once the Activation product is live.
                        Until then this href will 404 — replace before launch. */}
                    <div className="space-y-4 text-center px-2">
                        <p
                            className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase"
                            style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.65))" }}
                        >
                            2 — Activate it
                        </p>
                        <div className="space-y-2">
                            <p
                                className="text-base leading-relaxed"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    color: "var(--skin-link-secondary, rgba(26,30,58,0.78))",
                                }}
                            >
                                Right now, you can recognize it.
                            </p>
                            <p
                                className="text-base sm:text-lg leading-relaxed"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    color: "var(--skin-text-primary, #0a1628)",
                                    fontWeight: 500,
                                }}
                            >
                                Activation is where you start working from it.
                            </p>
                            <p
                                className="text-sm leading-relaxed"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
                                }}
                            >
                                You see how it actually moves — in decisions, in output, in real situations.
                            </p>
                        </div>

                        {/* Secondary CTA — hover swaps idle label for action label.
                            Idle: "Let it become usable — $37"
                            Hover: "Activate your Genius" */}
                        <a
                            href={STRIPE_ACTIVATE_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackCTAClick('activate_click', 'appleseed_option2')}
                            className="group liquid-glass relative w-full rounded-full inline-flex items-center justify-center px-5 py-3 text-sm sm:text-base font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                border: '1px solid rgba(26,30,58,0.2)',
                                textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                            }}
                        >
                            <span className="relative inline-block">
                                <span className="block transition-opacity duration-300 group-hover:opacity-0">
                                    Let it become usable — $37
                                </span>
                                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap">
                                    Activate your Genius
                                </span>
                            </span>
                        </a>
                        <p
                            className="text-xs italic"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                            }}
                        >
                            Most people start here.
                        </p>
                    </div>

                    {/* OPTION 3 — Playbook (tertiary text link, free) */}
                    <div className="space-y-3 text-center px-2 pt-2">
                        <p
                            className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase"
                            style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.65))" }}
                        >
                            3 — See the playbook
                        </p>
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-link-secondary, rgba(26,30,58,0.78))",
                            }}
                        >
                            If you want to understand the structure behind this:
                        </p>
                        <p
                            className="text-sm italic leading-relaxed"
                            style={{
                                fontFamily: "'Source Serif 4', serif",
                                color: "var(--skin-text-muted, rgba(26,30,58,0.72))",
                            }}
                        >
                            Pattern → clarity → business.
                        </p>
                        <a
                            href="/playbook"
                            className="inline-block text-sm underline underline-offset-4 transition-colors hover:opacity-80"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                textDecorationColor: "rgba(26,30,58,0.3)",
                            }}
                        >
                            Monetize Your Top Talent Playbook → See the playbook
                        </a>
                    </div>
                </div>

                {/* Resonance Rating — quiet analytics widget, moved below the
                    three options so it doesn't disrupt the recognition flow. */}
                {onResonanceRating && (
                    <div className="pt-4">
                        <ResonanceRating
                            step="appleseed"
                            onRate={onResonanceRating}
                        />
                    </div>
                )}

                {/* SAVE LINE + OwnershipSection — quiet escape hatch.
                    Day 57 (Sasha 2026-05-01): added the framing line above
                    the email pill. */}
                <div className="max-w-md mx-auto space-y-3 pt-6">
                    <p
                        className="text-center text-xs italic"
                        style={{
                            color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
                            fontFamily: "'Source Serif 4', serif",
                        }}
                    >
                        Or just send this to yourself and come back to it.
                    </p>
                    <OwnershipSection
                        emailUnlocked={emailUnlocked}
                        isSaved={isSaved}
                        email={email}
                        setEmail={setEmail}
                        emailSaving={emailSaving}
                        handleEmailSubmit={handleEmailSubmit}
                    />
                </div>
            </div>

            {/* FLOATING SCROLL BAR — Day 57 (Sasha 2026-05-01).
                Appears at ~50% scroll. Not urgency — continuity. */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 transition-all duration-500 ${
                    floatBarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
                }`}
                aria-hidden={!floatBarVisible}
            >
                <div
                    className="mx-auto max-w-2xl rounded-2xl"
                    style={{
                        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,255,255,0.86))',
                        border: '1px solid rgba(26,30,58,0.10)',
                        boxShadow: '0 -8px 24px -12px rgba(10,22,40,0.18)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                    }}
                >
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                        <p
                            className="text-xs italic"
                            style={{
                                color: "var(--skin-text-muted-soft, rgba(26,30,58,0.65))",
                                fontFamily: "'Source Serif 4', serif",
                            }}
                        >
                            You can come back to this anytime.
                        </p>
                        <a
                            href={STRIPE_ACTIVATE_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackCTAClick('activate_click', 'appleseed_floating_bar')}
                            className="text-sm font-medium whitespace-nowrap transition-opacity hover:opacity-80"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            Activate — $37 →
                        </a>
                    </div>
                </div>
            </div>

            {/* EXIT INTENT MODAL — Day 57 (Sasha 2026-05-01).
                Desktop mouseleave-from-top, fires once per session, suppressed
                if the user has already saved. No guilt — just preservation. */}
            {showExitModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(10,22,40,0.42)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
                    onClick={() => setShowExitModal(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="rounded-3xl max-w-sm w-full p-6 sm:p-7 space-y-4 relative animate-in zoom-in-95 fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(255,255,255,0.90))',
                            boxShadow: '0 30px 60px -20px rgba(10,22,40,0.35), 0 1px 0 rgba(255,255,255,0.6) inset',
                            border: '1px solid rgba(26,30,58,0.10)',
                        }}
                    >
                        <button
                            type="button"
                            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 transition-colors"
                            onClick={() => setShowExitModal(false)}
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))" }} />
                        </button>
                        <p
                            className="text-[10px] sm:text-xs font-semibold tracking-[0.22em] uppercase"
                            style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.65))" }}
                        >
                            Before you go—
                        </p>
                        <p
                            className="text-xl sm:text-2xl font-medium leading-snug"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            Do you want to keep this?
                        </p>
                        <form onSubmit={handleModalSubmit} className="space-y-3 pt-1">
                            <div
                                className="flex items-center gap-2 p-2 rounded-full"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.5)",
                                    border: '1px solid rgba(26,30,58,0.16)',
                                }}
                            >
                                <Mail
                                    className="w-3.5 h-3.5 ml-2 flex-shrink-0"
                                    style={{ color: "var(--skin-text-hint, rgba(26,30,58,0.45))" }}
                                />
                                <input
                                    type="email"
                                    value={modalEmail}
                                    onChange={(e) => setModalEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    autoFocus
                                    className="flex-1 bg-transparent border-0 text-sm focus:outline-none min-w-0"
                                    style={{ color: "var(--skin-text-primary, #0a1628)" }}
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={modalSubmitting || !modalEmail.trim()}
                                    className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40 transition-colors"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(135deg, #a06d08 0%, #7a5108 45%, #6b4208 100%)",
                                    }}
                                >
                                    {modalSubmitting ? "Saving…" : "Email my result"}
                                </button>
                            </div>
                            <p
                                className="text-center text-[11px] italic"
                                style={{
                                    color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))",
                                    fontFamily: "'Source Serif 4', serif",
                                }}
                            >
                                — or —
                            </p>
                            <a
                                href={STRIPE_ACTIVATE_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    trackCTAClick('activate_click', 'appleseed_exit_modal');
                                    setShowExitModal(false);
                                }}
                                className="w-full liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center px-5 py-3 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                                    backgroundImage:
                                        "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                                    textShadow: "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25))",
                                }}
                            >
                                Activate it — $37
                            </a>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default AppleseedDisplay;
