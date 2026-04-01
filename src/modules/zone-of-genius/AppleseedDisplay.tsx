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
        <div className="max-w-2xl mx-auto px-4 py-2 space-y-6">
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
                    <p className="text-sm font-semibold text-[#2c3150]">
                        This is you.
                    </p>
                    <p className="text-xs text-[#2c3150]/55 leading-relaxed">
                        You've been doing this for years.<br/>
                        People come to you for it. You've delivered results through it.
                    </p>
                    <p className="text-xs text-[#2c3150]/55 leading-relaxed italic">
                        And yet… you've never been able to clearly say what it is.
                    </p>
                </div>

                {/* The break */}
                <div className="text-center space-y-2">
                    <p className="text-sm font-semibold text-[#2c3150]">
                        This is your pattern.
                        <span className="text-[#2c3150]/40"> Not your business.</span>
                    </p>
                    <p className="text-xs text-[#2c3150]/45 leading-relaxed">
                        That's why nothing has fully clicked.
                    </p>
                </div>

                {/* The three unanswered questions */}
                <div className="text-center space-y-1">
                    <p className="text-[11px] text-[#2c3150]/40">Because knowing this doesn't answer:</p>
                    <div className="flex flex-col items-center gap-0.5">
                        <p className="text-xs text-[#2c3150]/60 italic">What do I offer?</p>
                        <p className="text-xs text-[#2c3150]/60 italic">Who is it for?</p>
                        <p className="text-xs text-[#2c3150]/60 italic">Why would someone pay?</p>
                    </div>
                </div>

                {/* The blade */}
                <div className="text-center">
                    <p className="text-xs text-[#2c3150]/50 leading-relaxed">
                        You've seen this before. You knew it was true.
                    </p>
                    <p className="text-xs font-medium text-[#2c3150]/70 mt-1">
                        And still nothing changed.
                    </p>
                </div>

                {/* CTA 1 (PRIMARY): Watch the video — glass card */}
                <a
                    href="/ignite#hero-video"
                    className="w-full flex items-center justify-between p-4 rounded-xl
                               bg-white/60 backdrop-blur-md border border-white/50
                               hover:bg-white/80 hover:border-[#8460ea]/25
                               hover:shadow-lg hover:shadow-[#8460ea]/8
                               transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                    <div>
                        <p className="text-sm font-semibold text-[#2c3150]">Watch this — 4 minutes</p>
                        <p className="text-xs text-[#2c3150]/50 mt-0.5">See why this gap exists — and what resolves it</p>
                    </div>
                    <span className="w-8 h-8 rounded-full bg-[#8460ea]/10 flex items-center justify-center flex-shrink-0 ml-3">
                        <ArrowRight className="w-4 h-4 text-[#8460ea]" />
                    </span>
                </a>

                {/* CTA 2 (FAST): I already know — skip to booking */}
                <a
                    href="/ignite#pricing-section"
                    className="w-full flex items-center justify-center gap-2 p-3
                               rounded-xl border border-[#2c3150]/10
                               hover:border-[#8460ea]/30 hover:bg-[#8460ea]/5
                               transition-all duration-200 text-sm text-[#2c3150]/60
                               hover:text-[#8460ea]"
                >
                    I already know — let's go
                    <ArrowRight className="w-3.5 h-3.5" />
                </a>

                {/* CTA 3 (CIRCLER): Not sure — take the quiz */}
                <a
                    href="/quiz"
                    className="text-xs text-[#2c3150]/40 hover:text-[#8460ea]/60
                               transition-colors text-center block"
                >
                    Not sure? See the pattern behind why this has been so hard
                </a>
            </div>

            {/* ═══════════════════════════════════════════════
                Save/Share (email gate) — secondary path
                ═══════════════════════════════════════════════ */}
            <div className="space-y-3 pt-2 max-w-md mx-auto">

                {/* PATH 2: Save / Share (email-gated) */}
                {!emailUnlocked && !isSaved ? (
                    <form onSubmit={handleEmailSubmit} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/50 bg-white/50 backdrop-blur-md">
                        <p className="text-xs text-[#2c3150]/60 text-center">Enter your email to save and share your result</p>
                        <div className="flex w-full gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#2c3150]/30" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/80 backdrop-blur-sm border border-white/50 text-sm text-[#2c3150] placeholder:text-[#2c3150]/25 focus:outline-none focus:border-[#8460ea]/40 transition-colors"
                                    required
                                />
                            </div>
                            <PremiumButton
                                type="submit"
                                size="sm"
                                loading={emailSaving}
                                disabled={emailSaving || !email.trim()}
                            >
                                {emailSaving ? '...' : 'Unlock'}
                            </PremiumButton>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-3">
                        {/* Save to Profile CTA */}
                        {!isSaved && onSave && (
                            <PremiumButton
                                size="lg"
                                className="w-full"
                                onClick={onSave}
                                loading={isSaving}
                                disabled={isSaving}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save to My Profile'}
                            </PremiumButton>
                        )}

                        {/* Share dropdown — already w-full max-w-md internally */}
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
                    <PremiumButton
                        size="lg"
                        className="px-8"
                        onClick={onContinue}
                    >
                        {continueLabel}
                        <Sparkles className="w-4 h-4 ml-2" />
                    </PremiumButton>
                </div>
            )}
        </div>
    );
};

export default AppleseedDisplay;
