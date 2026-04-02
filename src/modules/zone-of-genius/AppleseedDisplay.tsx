import { ArrowRight, Mail, ChevronDown } from "lucide-react";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import ShareZoG from "@/components/sharing/ShareZoG";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { AppleseedData } from "./appleseedGenerator";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
const OwnershipSection = ({
    emailUnlocked,
    isSaved,
    email,
    setEmail,
    emailSaving,
    handleEmailSubmit,
    onSave,
    isSaving,
    appleseed,
    profileId,
    profileUrl,
}: {
    emailUnlocked: boolean;
    isSaved: boolean;
    email: string;
    setEmail: (v: string) => void;
    emailSaving: boolean;
    handleEmailSubmit: (e: React.FormEvent) => void;
    onSave?: () => void;
    isSaving: boolean;
    appleseed: AppleseedData;
    profileId?: string;
    profileUrl?: string;
}) => {
    const [shareVisible, setShareVisible] = useState(false);
    const [shareExpanded, setShareExpanded] = useState(false);

    // Delayed reveal of share section (500ms after email unlock / save)
    useEffect(() => {
        if (emailUnlocked || isSaved) {
            const timer = setTimeout(() => setShareVisible(true), 500);
            return () => clearTimeout(timer);
        }
    }, [emailUnlocked, isSaved]);

    return (
        <div className="space-y-6 pt-4 max-w-md mx-auto">

            {/* EMAIL GATE — "Don't lose this" */}
            {!emailUnlocked && !isSaved && (
                <div className="space-y-3 text-center">
                    <p className="text-sm font-semibold text-white/80">Don't lose this</p>
                    <form onSubmit={handleEmailSubmit} className="flex flex-col items-center gap-3 p-5 rounded-xl liquid-glass ring-1 ring-white/10">
                        <p className="text-xs text-white/45 leading-relaxed">
                            Enter your email to save your result<br/>
                            and come back to it anytime
                        </p>
                        <div className="relative w-full">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full pl-9 pr-3 py-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#8460ea]/40 transition-colors"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={emailSaving || !email.trim()}
                            className="w-full liquid-glass-strong rounded-full px-6 py-3.5 text-white font-semibold text-base
                                       ring-1 ring-white/20
                                       shadow-[0_0_30px_rgba(132,96,234,0.2)]
                                       hover:shadow-[0_0_40px_rgba(132,96,234,0.35)]
                                       hover:scale-105 active:scale-95
                                       transition-all duration-300 ease-out
                                       disabled:opacity-40"
                        >
                            {emailSaving ? 'Saving...' : 'Save my result'}
                        </button>
                    </form>
                </div>
            )}

            {/* ─── SUCCESS STATE: after save ─── */}
            {(emailUnlocked || isSaved) && (
                <div className="space-y-2 text-center">
                    <p className="text-sm text-white/60">✓ Saved</p>
                    <p className="text-xs text-white/30">You can come back to this anytime.</p>
                    <p className="text-[10px] text-white/20 italic">We'll send you a link to access this anytime.</p>

                    <button
                        className="w-full mt-3 liquid-glass-strong rounded-full px-6 py-4 text-white font-semibold text-base
                                   ring-1 ring-white/20
                                   shadow-[0_0_30px_rgba(132,96,234,0.2)]
                                   hover:shadow-[0_0_40px_rgba(132,96,234,0.35)]
                                   hover:scale-105 active:scale-95
                                   transition-all duration-300 ease-out
                                   flex items-center justify-center gap-2"
                        onClick={() => {
                            // Stay in ONE continuous reality — scroll to the video CTA, NOT to a platform
                            const videoCta = document.querySelector('a[href="/ignite#hero-video"]');
                            if (videoCta) {
                                videoCta.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }}
                    >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ─── STEP 2: AMPLIFY (delayed, collapsed) ─── */}
            {shareVisible && (
                <div
                    className="transition-all duration-500 ease-out"
                    style={{ opacity: shareExpanded ? 1 : 0.45 }}
                >
                    <button
                        onClick={() => setShareExpanded(!shareExpanded)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                        <span>Optional: Get perspective from others</span>
                        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${shareExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {shareExpanded && (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-xs text-white/35 text-center leading-relaxed" style={{ fontFamily: "'Source Serif 4', serif" }}>
                                Ask 2–3 people who know you well:<br/>
                                <span className="italic text-white/50">Does this actually sound like me?</span>
                            </p>

                            <ShareZoG
                                archetypeName={appleseed.vibrationalKey.name}
                                tagline={appleseed.bullseyeSentence}
                                primeDriver={appleseed.threeLenses.primeDriver}
                                talents={appleseed.threeLenses.actions}
                                archetype={appleseed.threeLenses.archetype}
                                profileId={profileId}
                                profileUrl={profileUrl}
                            />

                            <p className="text-[10px] text-white/20 text-center italic">
                                Clarity gets stronger when it's reflected back.
                            </p>
                        </div>
                    )}
                </div>
            )}
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

    // Email gate state
    const [email, setEmail] = useState('');
    const [emailUnlocked, setEmailUnlocked] = useState(false);
    const [emailSaving, setEmailSaving] = useState(false);

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
            {/* Dark liquid glass background */}
            <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #0a0a1a, #0f172a, #1a1035)' }}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(132,96,234,0.12)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(104,148,208,0.08)_0%,transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(164,163,208,0.05)_0%,transparent_40%)]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-2 space-y-6">
                {/* Epic Revelatory Hero - The core genius reveal */}
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
                    darkMode
                />

                {/* Resonance Rating */}
                {onResonanceRating && (
                    <ResonanceRating
                        question="From 1 to 10, how well does this match how you see yourself at your brightest?"
                        onRate={onResonanceRating}
                    />
                )}

                {/* ═══════════════════════════════════════════════
                    THE GAP — controlled incomplete transformation
                    ═══════════════════════════════════════════════ */}
                <div className="space-y-5 pt-6 max-w-md mx-auto">
                    {/* Validation first */}
                    <div className="text-center space-y-3">
                        <p className="text-sm font-semibold text-white/90">
                            This is real.
                        </p>
                        <p className="text-xs text-white/50 leading-relaxed">
                            You've been doing this for years.<br/>
                            People already come to you for it.
                        </p>
                        <p className="text-xs text-white/40 leading-relaxed italic" style={{ fontFamily: "'Source Serif 4', serif" }}>
                            And it's exactly why this has been so hard to turn into something that works.
                        </p>
                    </div>

                    {/* The break */}
                    <div className="text-center space-y-2">
                        <p className="text-xs text-white/45 leading-relaxed">
                            Because this is the way you naturally think and create.
                        </p>
                        <p className="text-sm font-semibold text-white/85">
                            Not a business.
                        </p>
                        <p className="text-xs text-white/35 leading-relaxed">
                            Patterns don't get paid.<br/>
                            Business structure does.
                        </p>
                    </div>

                    {/* The blade */}
                    <div className="text-center space-y-2">
                        <p className="text-xs text-white/40 leading-relaxed">
                            You've seen this before. You knew it was true.
                        </p>
                        <p className="text-xs font-medium text-white/60">
                            And still nothing changed.
                        </p>
                    </div>

                    {/* The three unanswered questions */}
                    <div className="text-center space-y-1">
                        <p className="text-[11px] text-white/30">Because knowing this doesn't answer:</p>
                        <div className="flex flex-col items-center gap-0.5">
                            <p className="text-xs text-white/50 italic">What do I offer?</p>
                            <p className="text-xs text-white/50 italic">Who is it for?</p>
                            <p className="text-xs text-white/50 italic">Why would someone pay?</p>
                        </div>
                    </div>

                    {/* CTA 1 (PRIMARY): Watch the video — liquid glass */}
                    <a
                        href="/ignite#hero-video"
                        className="w-full flex items-center justify-between p-4 rounded-xl
                                   liquid-glass ring-1 ring-[#8460ea]/30
                                   hover:ring-[#8460ea]/60
                                   hover:shadow-[0_0_25px_rgba(132,96,234,0.2)]
                                   transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    >
                        <div>
                            <p className="text-sm font-semibold text-white/85">See why this hasn't turned into income — and what changes it (6 min)</p>
                        </div>
                        <span className="w-8 h-8 rounded-full bg-[#8460ea]/20 flex items-center justify-center flex-shrink-0 ml-3">
                            <ArrowRight className="w-4 h-4 text-[#8460ea]" />
                        </span>
                    </a>

                    {/* CTA 2 (FAST): I see it — let's build it */}
                    <a
                        href="/ignite#pricing-section"
                        className="w-full flex items-center justify-center gap-2 p-3
                                   rounded-xl ring-1 ring-white/10
                                   hover:ring-[#8460ea]/30 hover:bg-white/5
                                   transition-all duration-200 text-sm text-white/45
                                   hover:text-white/80"
                    >
                        I see it — let's build it
                        <ArrowRight className="w-3.5 h-3.5" />
                    </a>

                    {/* CTA 3 (CIRCLER): Not sure — take the quiz */}
                    <a
                        href="/quiz"
                        className="text-xs text-white/25 hover:text-white/50
                                   transition-colors text-center block"
                    >
                        Not sure? See exactly why this has been so hard (6-question diagnostic)
                    </a>
                </div>

                {/* ═══════════════════════════════════════════════
                    OWNERSHIP SECTION — ONE intention per moment
                    Step 1: Own it (save). Step 2: Amplify (share, collapsed).
                    ═══════════════════════════════════════════════ */}
                <OwnershipSection
                    emailUnlocked={emailUnlocked}
                    isSaved={isSaved}
                    email={email}
                    setEmail={setEmail}
                    emailSaving={emailSaving}
                    handleEmailSubmit={handleEmailSubmit}
                    onSave={onSave}
                    isSaving={isSaving}
                    appleseed={appleseed}
                    profileId={profileId}
                    profileUrl={profileUrl}
                />
            </div>
        </>
    );
};

export default AppleseedDisplay;
