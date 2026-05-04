import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";

/**
 * MeGate — entry guard for /game/me.
 *
 * Auth = render the children inside the standard shell.
 * Anonymous = render the shell, but replace pane 3 with a small card
 * that explains, in plain language, why we need an email + password:
 * without them, the next time the user opens the site we can't find
 * their profile and the data is gone. No "create account", no
 * "sign up", no jargon. Just the consequence stated as fact.
 *
 * On success the existing anonymous profile (localStorage
 * `game_profile_id`) is attached to the new user via
 * getOrCreateGameProfileId() — no data lost.
 */
// Temporary lock — Sasha is polishing the Me space. Flip to `false`
// (or delete this block + the early return below) to unlock.
const ME_SPACE_LOCKED = false;

const ComingSoonCard = () => (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
        <div className="rounded-2xl liquid-glass ring-1 ring-white/10 p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#8460ea]/15 flex items-center justify-center ring-1 ring-white/10 mb-4">
                <Sparkles className="w-7 h-7 text-[#8460ea]" />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">
                Your Genius Profile is being polished
            </h1>
            <p className="text-sm text-white/60 leading-relaxed">
                We're putting the final touches on this space. It opens
                tomorrow. Your results are safe — come back soon.
            </p>
        </div>
    </div>
);

const MeGate = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<"loading" | "authed" | "guest">("loading");
    const location = useLocation();
    const navigate = useNavigate();

    if (ME_SPACE_LOCKED) {
        return (
            <GameShellV2>
                <ComingSoonCard />
            </GameShellV2>
        );
    }

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (mounted) setStatus(session ? "authed" : "guest");
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
            if (mounted) setStatus(session ? "authed" : "guest");
        });
        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    if (status === "loading") {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0a0a1a]">
                <div className="animate-spin w-8 h-8 border-2 border-white/30 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (status === "authed") return <>{children}</>;

    return (
        <GameShellV2>
            <SaveProfileCard
                onSuccess={async () => {
                    // Attach anonymous profile to new user
                    try {
                        await getOrCreateGameProfileId();
                    } catch {
                        // non-fatal — shell will reload profile via auth listener
                    }
                    // Stay on the route they were trying to reach
                    navigate(location.pathname + location.search, { replace: true });
                }}
            />
        </GameShellV2>
    );
};

const SaveProfileCard = ({ onSuccess }: { onSuccess: () => void }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/game/me`,
                    data: { first_name: firstName.trim() || null },
                },
            });
            if (error) throw error;
            // Edge case: signup with an already-registered email returns no
            // error but a fake user with empty identities[] and no session.
            // Tell the user plainly and switch them toward the return tab.
            const identities = (data.user as any)?.identities;
            if (data.user && Array.isArray(identities) && identities.length === 0) {
                toast({
                    title: "Looks like you've been here before",
                    description: "Use the 'Coming back' tab with your password to open your profile.",
                });
                return;
            }
            if (!data.session) {
                toast({
                    title: "Almost there",
                    description: "Check your email for a confirmation link, then come back.",
                });
                return;
            }
            toast({
                title: "Saved.",
                description: "Your profile is now yours to come back to.",
            });
            onSuccess();
        } catch (err: any) {
            toast({
                title: "Couldn't save",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });
            if (error) throw error;
            toast({ title: "Welcome back." });
            onSuccess();
        } catch (err: any) {
            toast({
                title: "Couldn't open your profile",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Day 56 (Sasha 2026-05-01): MeGate redesigned to match the main
    // landing page register — Cormorant Garamond serif, dark navy on
    // cream wash, ornament divider, gold-accented CTAs. Was previously
    // a violet/dark-glass card that read as a different product. Now
    // uses the same `@/lib/landingDesign` tokens as
    // MethodologyLandingPage and the AppleseedDisplay reveal.
    const editorialInputClass =
        "bg-white/85 border border-[hsla(228,30%,18%,0.18)] text-[#0a1628] placeholder:text-[hsla(228,30%,18%,0.40)] focus-visible:ring-2 focus-visible:ring-[hsla(40,70%,55%,0.50)] focus-visible:border-[hsla(40,70%,55%,0.55)]";
    // Day 58 (Sasha 2026-05-03): label contrast + size bumped — was
    // 0.7 opacity at text-sm, reading as washed out on the cream
    // background. Now 0.92 opacity, weight 500, base size — readable.
    const editorialLabelStyle = {
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 500,
        color: "var(--skin-text-primary, rgba(10,22,40,0.92))",
        textShadow:
            "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
    } as const;
    const ctaButtonStyle = {
        fontFamily: "'Cormorant Garamond', serif",
        color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
        backgroundImage:
            "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(26,30,58,0.85) 50%, rgba(10,22,40,0.92) 100%))",
        boxShadow:
            "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
        textShadow:
            "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
    } as const;

    return (
        <div className="max-w-[640px] mx-auto px-5 py-8 sm:py-10 md:py-12">
            {/* ═══════ HEADER — editorial register ═══════ */}
            {/* Day 58 (Sasha 2026-05-03):
                – Sparkle icon medallion retired (visual noise, doesn't add
                  meaning at this stage of the funnel).
                – Headline reframed: "Save your profile" → "Save Your
                  Results"; gold accent removed (all caps-y emphasis
                  unnecessary here — this is a utility moment, not a
                  brand moment).
                – Headline + echo flow as one continuous statement, no
                  full stop between them.
                – Body copy contrast bumped (0.72 → 0.92 opacity, weight
                  500) so the explanation actually reads on the cream
                  wash. Same for the italic echo (0.7 → 0.92 + weight
                  500). */}
            <header className="text-center">
                <h1
                    className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold leading-[1.15] tracking-[-0.018em] mb-3 sm:mb-4"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        textShadow:
                            "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8), 0 2px 12px rgba(26,30,58,0.15))",
                    }}
                >
                    Save Your Results
                </h1>

                <p
                    className="text-base sm:text-lg md:text-xl leading-[1.4] tracking-[-0.005em] italic max-w-[480px] mx-auto"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                        color: "var(--skin-text-primary, rgba(10,22,40,0.92))",
                        textShadow:
                            "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
                    }}
                >
                    so they're here when you come back
                </p>

                <Ornament className="my-6 sm:my-7" />

                <p
                    className="text-[15px] sm:text-base leading-relaxed max-w-[460px] mx-auto mb-6 sm:mb-8"
                    style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontWeight: 500,
                        color: "var(--skin-text-primary, rgba(10,22,40,0.92))",
                        textShadow:
                            "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                    }}
                >
                    Right now your result lives only on this device. Give us
                    an email and a password — that's how we know it's you next
                    time. Without them, the next visit starts from zero.
                </p>
            </header>

            {/* ═══════ FORM — editorial Tabs + inputs ═══════ */}
            <Tabs defaultValue="save" className="w-full">
                <TabsList
                    className="grid w-full grid-cols-2 p-1 rounded-full"
                    style={{
                        background: "hsla(228, 30%, 18%, 0.06)",
                        border: "1px solid hsla(228, 30%, 18%, 0.10)",
                    }}
                >
                    <TabsTrigger
                        value="save"
                        className="rounded-full min-h-[44px] text-sm data-[state=active]:shadow-sm transition-all"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-text-muted, rgba(26,30,58,0.6))",
                        }}
                    >
                        First time
                    </TabsTrigger>
                    <TabsTrigger
                        value="return"
                        className="rounded-full min-h-[44px] text-sm data-[state=active]:shadow-sm transition-all"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-text-muted, rgba(26,30,58,0.6))",
                        }}
                    >
                        Coming back
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="save" className="mt-6">
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="me-firstname"
                                className="text-base italic"
                                style={editorialLabelStyle}
                            >
                                Your name
                            </Label>
                            <Input
                                id="me-firstname"
                                type="text"
                                placeholder="What should we call you?"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={editorialInputClass}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="me-email"
                                className="text-base italic"
                                style={editorialLabelStyle}
                            >
                                Email
                            </Label>
                            <Input
                                id="me-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={editorialInputClass}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="me-password"
                                className="text-base italic"
                                style={editorialLabelStyle}
                            >
                                A password (so only you can open it)
                            </Label>
                            <Input
                                id="me-password"
                                type="password"
                                placeholder="At least 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className={editorialInputClass}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-3 rounded-full py-6 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={ctaButtonStyle}
                        >
                            {loading ? "Saving…" : "Save my profile"}
                        </Button>
                    </form>
                </TabsContent>

                <TabsContent value="return" className="mt-6">
                    <form onSubmit={handleReturn} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="me-email-r"
                                className="text-base italic"
                                style={editorialLabelStyle}
                            >
                                Email
                            </Label>
                            <Input
                                id="me-email-r"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={editorialInputClass}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="me-password-r"
                                className="text-base italic"
                                style={editorialLabelStyle}
                            >
                                Password
                            </Label>
                            <Input
                                id="me-password-r"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={editorialInputClass}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-3 rounded-full py-6 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={ctaButtonStyle}
                        >
                            {loading ? "Opening…" : "Open my profile"}
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MeGate;
