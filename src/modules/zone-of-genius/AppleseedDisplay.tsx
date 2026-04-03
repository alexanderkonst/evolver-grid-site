import { ArrowRight, Mail, ChevronDown, Share2 } from "lucide-react";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import ShareZoG from "@/components/sharing/ShareZoG";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { AppleseedData } from "./appleseedGenerator";
import { useState, useCallback, useEffect, useRef } from "react";
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
    const shareContentRef = useRef<HTMLDivElement>(null);

    // Delayed reveal of share section (4s after email unlock / save)
    useEffect(() => {
        if (emailUnlocked || isSaved) {
            const timer = setTimeout(() => setShareVisible(true), 4000);
            return () => clearTimeout(timer);
        }
    }, [emailUnlocked, isSaved]);

    return (
        <div className="space-y-6 pt-4 max-w-md mx-auto">

            {/* EMAIL GATE — "Don't lose this" */}
            {!emailUnlocked && !isSaved && (
                <div className="space-y-3 text-center">
                    <p className="text-sm font-semibold text-white/80">Save this and come back to it anytime</p>
                    <form onSubmit={handleEmailSubmit} className="flex flex-col items-center gap-3 p-5 rounded-xl liquid-glass ring-1 ring-white/10">
                        <p className="text-xs text-white/45 leading-relaxed">
                            Access your result later + build on it when you're ready
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
                <div className="text-center py-2">
                    <p className="text-sm text-white/50">✓ Saved. We sent your Zone of Genius to your inbox.</p>
                </div>
            )}

            {/* ─── SHARE (tertiary, delayed, minimal) ─── */}
            {shareVisible && (
                <div className="animate-in fade-in duration-700 opacity-50 hover:opacity-70 transition-opacity">
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
                    THE GAP — Sacred typographical journey
                    ═══════════════════════════════════════════════ */}
                <div className="py-12 max-w-lg mx-auto flex flex-col items-center justify-center text-center space-y-16" style={{ fontFamily: "'Source Serif 4', serif" }}>
                    
                    {/* Validation */}
                    <div className="space-y-4">
                        <p className="text-lg md:text-xl text-white font-light tracking-wide leading-relaxed">
                            You've been doing this for years.
                        </p>
                        <p className="text-base text-white/80 font-light tracking-wide leading-relaxed">
                            People already come to you for it. <br/>
                            You've delivered real results through this.
                        </p>
                    </div>

                    {/* Collapse Shift */}
                    <div className="space-y-6">
                        <p className="text-lg text-white/90 font-light tracking-wide leading-relaxed">
                            But this — by itself — doesn't become a business.
                        </p>
                        <div className="flex flex-col gap-2">
                            <p className="text-base text-white/70 italic">Because this is how you naturally think.</p>
                            <p className="text-base font-medium text-white tracking-wide">
                                It is not yet structured to be bought.
                            </p>
                        </div>
                    </div>

                    {/* Consequence Block */}
                    <div className="space-y-6">
                        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent mx-auto" />
                        
                        <div className="space-y-3">
                            <p className="text-base text-white/80 leading-loose">
                                Without turning this into something concrete:
                            </p>
                            <p className="text-sm text-white/65 leading-loose font-light">
                                you keep explaining it differently every time<br/>
                                people receive value — but do not always pay<br/>
                                you remain in the loop of "almost there"
                            </p>
                        </div>
                        
                        <div className="pt-4 space-y-2">
                            <p className="text-base text-white/85 tracking-wide">
                                Months pass. Nothing fundamentally changes.
                            </p>
                            <p className="text-sm text-white/65 italic">
                                And more time thinking about it cannot change it.
                            </p>
                        </div>
                    </div>

                    {/* Clarity Bridge */}
                    <div className="space-y-4 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] shadow-[0_0_40px_rgba(0,0,0,0.2)]">
                        <p className="text-lg text-white/80 uppercase tracking-[0.2em] font-sans mb-6">The Missing Bridge</p>
                        <p className="text-xl text-white italic leading-loose">
                            What exactly do I offer? <br/>
                            Who is it for? <br/>
                            Why would someone pay for this — consistently?
                        </p>
                    </div>

                    {/* Decision Line */}
                    <div className="space-y-5">
                        <p className="text-lg text-white/90 font-light tracking-wide leading-relaxed">
                            This is where most people stop.
                        </p>
                        <p className="text-base font-light text-white/75">
                            They recognize themselves…<br/>
                            <span className="text-white font-medium mt-2 block">but never make it real.</span>
                        </p>
                    </div>

                    {/* Readiness reframe */}
                    <div className="space-y-3 pb-8">
                        <div className="w-1 h-1 rounded-full bg-[#b8a4f8]/50 mx-auto mb-6" />
                        <p className="text-base text-white/80 tracking-wide font-light">
                            You don't need to be more ready.
                        </p>
                        <p className="text-lg font-medium text-white tracking-wide">
                            You simply need structure.
                        </p>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════
                    STATE 1: OWNERSHIP (save/email gate)
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

                {/* ═══════════════════════════════════════════════
                    STATE 2 & 3: PRIMARY + SECONDARY CTAs
                    Linear flow — one job per moment
                    ═══════════════════════════════════════════════ */}
                <div className="max-w-md mx-auto space-y-4">

                    {/* CTA 1 (PRIMARY): Quiz — diagnostic */}
                    <a
                        href="/quiz"
                        className="w-full flex items-center justify-between p-5 rounded-2xl
                                   liquid-glass-strong ring-1 ring-white/25
                                   shadow-[0_0_40px_rgba(240,194,127,0.2),0_0_80px_rgba(132,96,234,0.15)]
                                   hover:shadow-[0_0_60px_rgba(240,194,127,0.35),0_0_100px_rgba(132,96,234,0.25)]
                                   hover:scale-[1.02] active:scale-95
                                   transition-all duration-300 alive-card"
                    >
                        <div>
                            <p className="text-base font-bold text-white uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(240,194,127,0.3)' }}>
                                See exactly why this hasn't turned into income
                            </p>
                            <p className="text-xs text-white/50 mt-1">6-question diagnostic</p>
                        </div>
                        <span className="w-10 h-10 rounded-full bg-[#b8a4f8]/20 flex items-center justify-center flex-shrink-0 ml-4">
                            <ArrowRight className="w-5 h-5 text-[#b8a4f8]" />
                        </span>
                    </a>

                    {/* CTA 2 (SECONDARY): Build */}
                    <a
                        href="/ignite#pricing-section"
                        className="w-full flex items-center justify-center gap-3 p-4
                                   rounded-2xl liquid-glass ring-1 ring-white/15
                                   hover:ring-white/30 hover:bg-white/5
                                   transition-all duration-300 text-sm text-white/70
                                   hover:text-white uppercase tracking-wider font-medium"
                    >
                        I'm done circling this — let's make it real
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </>
    );
};

export default AppleseedDisplay;
