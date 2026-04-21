import { ArrowRight, Mail } from "lucide-react";
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
                <p className="text-xs text-white/50">
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
                               rounded-full liquid-glass ring-1 ring-white/15
                               hover:ring-white/30 hover:bg-white/5
                               transition-all duration-300 text-xs text-white/60
                               hover:text-white/85"
                >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Save this to my inbox</span>
                </button>
            ) : (
                <form
                    onSubmit={handleEmailSubmit}
                    className="flex items-center gap-2 p-2 rounded-full liquid-glass ring-1 ring-white/15"
                >
                    <Mail className="w-3.5 h-3.5 ml-2 text-white/40 flex-shrink-0" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        autoFocus
                        className="flex-1 bg-transparent border-0 text-sm text-white/85 placeholder:text-white/25 focus:outline-none min-w-0"
                        required
                    />
                    <button
                        type="submit"
                        disabled={emailSaving || !email.trim()}
                        className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold text-white
                                   bg-[#8460ea]/90 hover:bg-[#8460ea]
                                   disabled:opacity-40 transition-colors"
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
            {/* Gradient background — matches ZoG entry page */}
            <div className="fixed inset-0 z-0 bg-[#0a0a1a]">
                <img 
                    src="/gradient.jpg" 
                    alt="" 
                    className="w-full h-full object-cover" 
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-[#0a0a1a]/65 backdrop-blur-[2px]" />
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
                    THE GAP — tightened copy (Sasha, 2026-04-21)
                    ═══════════════════════════════════════════════ */}
                <div
                    className="py-12 max-w-lg mx-auto flex flex-col items-center justify-center text-center space-y-10"
                    style={{ fontFamily: "'Source Serif 4', serif" }}
                >
                    {/* Recognition */}
                    <div className="space-y-4">
                        <p className="text-lg md:text-xl text-white font-light tracking-wide leading-relaxed">
                            You've been doing this for years, haven't you?
                        </p>
                        <p className="text-base text-white/80 font-light tracking-wide leading-relaxed">
                            Delivered real results through this.<br />
                            People already come to you for it.
                        </p>
                    </div>

                    {/* The Pivot */}
                    <div className="space-y-4">
                        <p className="text-lg text-white/95 font-light tracking-wide leading-relaxed">
                            But haven't made it into a{" "}
                            <span className="text-white font-medium uppercase tracking-wider">
                                Growing Business
                            </span>
                            .
                        </p>
                        <p className="text-base text-white/75 italic">Why?</p>
                        <p className="text-base text-white/85 leading-relaxed">
                            Because this is how{" "}
                            <span className="text-white font-medium uppercase tracking-wider">
                                You Naturally Operate
                            </span>
                            .
                        </p>
                        <p className="text-base text-white/85 leading-relaxed">
                            <span className="text-white font-medium uppercase tracking-wider">
                                Not Yet
                            </span>{" "}
                            a built, packaged, and distributed product people can buy.
                        </p>
                    </div>

                    {/* Consequence */}
                    <div className="space-y-3">
                        <p className="text-base text-white/80 leading-loose">So:</p>
                        <ul className="text-sm text-white/70 leading-loose font-light space-y-1 list-none">
                            <li>you keep explaining it differently every time</li>
                            <li>people receive value but do not pay</li>
                            <li>you are stuck at &ldquo;seeing the light at the end of the tunnel&rdquo;</li>
                        </ul>
                    </div>

                    {/* The Missing Bridge */}
                    <div className="space-y-5 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                        <p className="text-sm text-white/70 uppercase tracking-[0.2em] font-sans">
                            Let's be clear
                        </p>
                        <p className="text-lg md:text-xl text-white leading-relaxed">
                            The Missing Bridge to Money is Clarity on:
                        </p>
                        <ul className="text-base text-white/90 italic leading-loose space-y-2 list-none">
                            <li>What exactly do I offer?</li>
                            <li>Who is it for?</li>
                            <li>Why would these people queue to pay?</li>
                        </ul>
                    </div>

                    {/* Reframe */}
                    <div className="space-y-3">
                        <p className="text-base text-white/80 tracking-wide font-light">
                            You don't need to be more ready.
                        </p>
                        <p className="text-base text-white/80 tracking-wide font-light">
                            You don't need business education or gimmicks.
                        </p>
                        <p className="text-lg font-medium text-white tracking-wide mt-2">
                            You simply need solid business structure.
                        </p>
                    </div>

                    {/* Pre-CTA line */}
                    <div className="pb-4">
                        <p className="text-base text-white/85 italic">
                            If you're done circling this — click below and let's make it real.
                        </p>
                    </div>
                </div>

                {/* OwnershipSection used to sit here as a blocking email gate.
                    Moved to the footer row below the CTAs (Sasha, 2026-04-21)
                    as a quiet save-to-inbox option, not a barrier. */}

                {/* ═══════════════════════════════════════════════
                    CTAs — primary/secondary (Sasha, 2026-04-21):
                    "Turn My Top Talent into a Growing Business" is the main
                    action. The diagnostic quiz is the secondary learn-more.
                    ═══════════════════════════════════════════════ */}
                <div className="max-w-md mx-auto space-y-4">

                    {/* CTA 1 (PRIMARY): Turn Top Talent into a Growing Business */}
                    <a
                        href="/ignite#pricing-section"
                        className="w-full flex items-center justify-between p-5 rounded-2xl
                                   liquid-glass-strong ring-1 ring-white/25
                                   shadow-[0_0_40px_rgba(240,194,127,0.2),0_0_80px_rgba(132,96,234,0.15)]
                                   hover:shadow-[0_0_60px_rgba(240,194,127,0.35),0_0_100px_rgba(132,96,234,0.25)]
                                   hover:scale-[1.02] active:scale-95
                                   transition-all duration-300 alive-card"
                    >
                        <div>
                            <p
                                className="text-base font-bold text-white uppercase tracking-wider"
                                style={{ textShadow: "0 0 20px rgba(240,194,127,0.3)" }}
                            >
                                Turn My Top Talent into a Growing Business
                            </p>
                            <p className="text-xs text-white/50 mt-1 italic">
                                I'm done circling this — let's make it real
                            </p>
                        </div>
                        <span className="w-10 h-10 rounded-full bg-[#b8a4f8]/20 flex items-center justify-center flex-shrink-0 ml-4">
                            <ArrowRight className="w-5 h-5 text-[#b8a4f8]" />
                        </span>
                    </a>

                    {/* Mini bridge line */}
                    <p className="text-center text-xs text-white/55 italic">
                        Want to learn more before acting?
                    </p>

                    {/* CTA 2 (SECONDARY): Diagnostic quiz */}
                    <a
                        href="/quiz"
                        className="w-full flex items-center justify-center gap-3 p-4
                                   rounded-2xl liquid-glass ring-1 ring-white/15
                                   hover:ring-white/30 hover:bg-white/5
                                   transition-all duration-300 text-sm text-white/70
                                   hover:text-white uppercase tracking-wider font-medium"
                    >
                        <span>
                            See exactly why this hasn't turned into income
                            <span className="block normal-case tracking-normal text-[10px] text-white/40 mt-0.5">
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
