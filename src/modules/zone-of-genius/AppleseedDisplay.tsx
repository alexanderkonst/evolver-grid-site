import { PremiumButton } from "@/components/ui/PremiumButton";
import { Sparkles, ArrowRight, Mail } from "lucide-react";
import RevelatoryHero from "@/components/game/RevelatoryHero";
import ShareZoG from "@/components/sharing/ShareZoG";
import ResonanceRating from "@/components/ui/ResonanceRating";
import { AppleseedData } from "./appleseedGenerator";
import { useState, useCallback } from "react";
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
    onContinue?: () => void;
    continueLabel?: string;
}

/**
 * AppleseedDisplay — ZoG result screen (light-surface glass)
 * Flow: Genius reveal → Email gate → Save/Share + Build a business CTA
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
    onContinue,
    continueLabel = "Continue"
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
            await (supabase as any).from('divine_timing_leads').insert({
                email: email.trim(),
                source: 'zog_quiz_result',
                created_at: new Date().toISOString(),
            });
        } catch {
            // Silently continue
        }
        setEmailUnlocked(true);
        setEmailSaving(false);
        toast({
            title: "Saved!",
            description: "You can now save and share your genius.",
        });
    }, [email, toast]);

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
                    Save/Share (email gate) — secondary path
                    ═══════════════════════════════════════════════ */}
                <div className="space-y-3 pt-2 max-w-md mx-auto">

                    {/* PATH 2: Save / Share (email-gated) */}
                    {!emailUnlocked && !isSaved ? (
                        <form onSubmit={handleEmailSubmit} className="flex flex-col items-center gap-2 p-4 rounded-xl liquid-glass ring-1 ring-white/10">
                            <p className="text-xs text-white/50 text-center">Enter your email to save and share your result</p>
                            <div className="flex w-full gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#8460ea]/40 transition-colors"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={emailSaving || !email.trim()}
                                    className="liquid-glass-strong rounded-lg px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                                >
                                    {emailSaving ? '...' : 'Unlock'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            {/* Save to Profile CTA */}
                            {!isSaved && onSave && (
                                <button
                                    className="w-full liquid-glass-strong rounded-full px-6 py-3 text-white font-semibold ring-1 ring-white/20 shadow-[0_0_20px_rgba(132,96,234,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                    onClick={onSave}
                                    disabled={isSaving}
                                >
                                    <Sparkles className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save to My Profile'}
                                </button>
                            )}

                            {/* Share dropdown */}
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

                {/* Continue - Shows after save (primary onboarding action) */}
                {isSaved && onContinue && (
                    <div className="flex justify-center">
                        <button
                            className="liquid-glass-strong rounded-full px-8 py-3 text-white font-semibold ring-1 ring-white/20 shadow-[0_0_20px_rgba(132,96,234,0.15)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            onClick={onContinue}
                        >
                            {continueLabel}
                            <Sparkles className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default AppleseedDisplay;
