import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GameShellV2 from "@/components/game/GameShellV2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateGameProfileId } from "@/lib/gameProfile";
import { migrateGuestDataToProfile } from "@/modules/zone-of-genius/saveToDatabase";
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
 *
 * Post-auth side effects (claim-anonymous-zog → promote anonymous
 * snapshot to a real zog_snapshots row, plus snapshot-cache
 * invalidation) are NOT handled here. They live in the global
 * SIGNED_IN listener at `src/lib/postAuthSideEffects.ts`, which
 * fires for any auth entry point (this component, AuthCallback's
 * magic-link flow, future paths) so the same side effects can't
 * drift between forms. See that file for the architectural rationale.
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

    // Day 61 (Sasha 2026-05-04 17:30): MeGate retired as a signup gate.
    //
    // The whole inline "Save Your Profile" form below has been the
    // source of repeated regressions all day (missing migration call,
    // password rejection collision, silent-account password collision,
    // race conditions). It also contradicts the funnel-monogamy
    // principle: free users should never enter `/game/me/*`. The
    // canonical save surface is now the editorial save block on the
    // reveal page (AppleseedDisplay → OwnershipSection, after the
    // resonance check). The canonical platform-entry surface is
    // post-purchase (verbal magic-link activation at end of paid
    // session, or immediate post-checkout for the $37 activation).
    //
    // Behavior change: guest visitors to `/game/me/*` now redirect
    // to `/zone-of-genius` (the public reveal). They've come to a
    // door that shouldn't be open to them yet. Send them where the
    // value lives + the offer cards live, instead of a signup form
    // that lets them sneak in for free.
    //
    // The SaveProfileCard component below is now DEAD CODE. Kept in
    // the file for a single follow-up cleanup pass — removing it now
    // would mean ripping out a chunk of mixed imports + types that
    // adds risk for no behavioral gain. Future sweep: delete
    // SaveProfileCard + its imports + clean unused-warnings.
    //
    // Reference: docs/02-strategy/unique-businesses/alexanders_unique_business.md
    // → "Lived User Journey — Reveal-Anchored Funnel" (no MeGate intent).
    void location;
    return <Navigate to="/zone-of-genius" replace />;

    // ── EVERYTHING BELOW THIS POINT IS LEGACY DEAD CODE ─────────────
    // Preserved for safe future deletion. Not reachable from runtime.
    // eslint-disable-next-line no-unreachable
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
                    // Day 61 (Sasha 2026-05-04 12:30): THE BUG FIX.
                    //
                    // Anonymous users take the ZoG quiz and the appleseed
                    // payload lives ONLY in localStorage as
                    // `guest_appleseed_data` (no DB row anywhere — no
                    // `zog_snapshots`, no `game_profiles` row, no
                    // `anonymous_genius_results` row, because guests don't
                    // hit any of the save paths until they explicitly type
                    // an email). When such a user signs up via this gate,
                    // their localStorage data MUST be promoted into a
                    // real `zog_snapshots` row tied to the new account —
                    // otherwise the destination page reads
                    // `last_zog_snapshot_id` → NULL → renders "Take the
                    // assessment" instead of their result.
                    //
                    // `migrateGuestDataToProfile()` does exactly this. It
                    // existed in `saveToDatabase.ts` and was wired into
                    // the OLD `SignupModal.tsx`. When this MeGate replaced
                    // SignupModal as the primary signup gate, the migration
                    // call was never ported — that's the regression.
                    //
                    // The previous "fix" (just calling claim-anonymous-zog)
                    // only works for users who came via /auth?claim=true
                    // and entered their email DURING the anonymous flow
                    // (which writes anonymous_genius_results). For users
                    // who just took the quiz, viewed the reveal, and hit
                    // ME → that table has nothing to claim. Hence this
                    // localStorage-side migration is the actual fix.
                    try {
                        await migrateGuestDataToProfile();
                    } catch (err) {
                        console.warn("[MeGate] migrateGuestDataToProfile failed", err);
                    }
                    // Backup path: claim-anonymous-zog handles the OTHER
                    // pathway (user arrived via /auth?claim=true with
                    // email captured server-side via save-anonymous-zog).
                    // Idempotent + no-op when there's nothing to claim, so
                    // safe to call regardless of which path the user took.
                    try {
                        const { error } = await supabase.functions.invoke("claim-anonymous-zog");
                        if (error) {
                            console.warn("[MeGate] claim-anonymous-zog returned error", error);
                        }
                    } catch (err) {
                        console.warn("[MeGate] claim-anonymous-zog threw", err);
                    }
                    // Day 61 (Sasha 2026-05-04): always navigate to the
                    // canonical Start Here activation home (was: back to
                    // wherever the user hit the gate, which often
                    // resolved to Overview). First-time users land in
                    // the right place; returning users can navigate
                    // anywhere from there.
                    void location;
                    navigate("/game/me/zone-of-genius/start-here", { replace: true });
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
                    // Day 61 (Sasha 2026-05-04): redirect target changed
                    // from /game/me (which routes to Overview by default
                    // and confused first-time users who landed in the
                    // middle of the ME shell) to the canonical Start Here
                    // activation home. New users always begin there.
                    emailRedirectTo: `${window.location.origin}/game/me/zone-of-genius/start-here`,
                    data: { first_name: firstName.trim() || null },
                },
            });
            if (error) throw error;
            // Edge case: signup with an already-registered email returns no
            // error but a fake user with empty identities[] and no session.
            //
            // Day 61 (Sasha 2026-05-04 13:00): the OLD message ("Use the
            // 'Coming back' tab with your password") was misleading for
            // users whose existing account was created SILENTLY by
            // save-zog-result (random UUID password the user never saw).
            // Telling them to use a password they don't have was a dead
            // end. New behavior: send a magic link so they can get into
            // their existing account without needing a password they were
            // never given. Lands them on /start-here just like fresh
            // signup. AuthCallback's claim-anonymous-zog then attaches
            // any pending data as a backstop.
            const identities = (data.user as any)?.identities;
            if (data.user && Array.isArray(identities) && identities.length === 0) {
                try {
                    const { error: otpError } = await supabase.auth.signInWithOtp({
                        email: email.trim(),
                        options: {
                            emailRedirectTo: `${window.location.origin}/game/me/zone-of-genius/start-here`,
                        },
                    });
                    if (otpError) throw otpError;
                    toast({
                        title: "Welcome back — check your email",
                        description: "We sent a one-click sign-in link to your inbox.",
                    });
                } catch (otpErr) {
                    console.warn("[MeGate] magic-link recovery failed", otpErr);
                    toast({
                        title: "Looks like you've been here before",
                        description: "Try the 'Coming back' tab — or check your email for a previous sign-in link.",
                    });
                }
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
            // Day 61 (Sasha 2026-05-04 12:00): friendly error mapping.
            // Supabase's HIBP "weak_password" rejection used to show as
            // "Couldn't save / Password is known to be weak and easy to
            // guess" — alarmist and unactionable (the user reads it as
            // "the system broke"). Map it to a calm, specific instruction
            // and keep the field state intact so they can just edit.
            // The HIBP toggle SHOULD be off project-wide, but if the
            // setting hasn't propagated or somehow re-enables itself,
            // this keeps users moving.
            const raw = String(err?.message || "");
            const code = String(err?.code || err?.error_code || "");
            const isWeakPassword =
                code === "weak_password" ||
                /known to be weak|pwned|breach/i.test(raw);
            if (isWeakPassword) {
                toast({
                    title: "That password's been seen in a public breach somewhere",
                    description:
                        "Add a number or symbol to make it unique to you, then try again.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Couldn't save",
                    description: raw,
                    variant: "destructive",
                });
            }
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
            toast({ title: "You're in." });
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
    // Day 61 (Sasha 2026-05-04 11:30): legibility hard-push.
    // Inputs: bumped border opacity 0.18 → 0.32 (the field edge was
    // washed out on cream), placeholder opacity 0.40 → 0.55, text size
    // bumped to text-base + medium weight so typed input reads
    // substantial.
    const editorialInputClass =
        "bg-white/90 border-[1.5px] border-[hsla(228,30%,18%,0.32)] text-[#0a1628] text-base font-medium placeholder:text-[hsla(228,30%,18%,0.55)] focus-visible:ring-2 focus-visible:ring-[hsla(40,70%,55%,0.55)] focus-visible:border-[hsla(40,70%,55%,0.65)]";
    // Form labels — bumped weight 500 → 600 so the italic Cormorant
    // labels don't blend into the surrounding cream.
    const editorialLabelStyle = {
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: 600,
        color: "var(--skin-text-primary, #0b2a5a)",
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

                {/* Day 61 (Sasha 2026-05-04 11:30): real legibility
                    push — body paragraph bumped from text-[15px]/base
                    weight-500 to text-base/text-lg weight-600. Now
                    actually substantial against the cream wash, not
                    just nominally darker. */}
                <p
                    className="text-base sm:text-lg leading-relaxed max-w-[480px] mx-auto mb-6 sm:mb-8"
                    style={{
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontWeight: 600,
                        color: "var(--skin-text-primary, #0b2a5a)",
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
            {/* Day 61 (Sasha 2026-05-04 11:30): tabs lifted out of
                the muted register — text-sm weight-default at 0.6
                opacity was pale on cream. Now text-base weight-600 at
                full primary navy. Container border bumped from 0.10
                to 0.20 so the pill itself reads as a structural
                element. */}
            <Tabs defaultValue="save" className="w-full">
                <TabsList
                    className="grid w-full grid-cols-2 p-1.5 rounded-full"
                    style={{
                        background: "hsla(228, 30%, 18%, 0.08)",
                        border: "1px solid hsla(228, 30%, 18%, 0.20)",
                    }}
                >
                    <TabsTrigger
                        value="save"
                        className="rounded-full min-h-[44px] text-base font-semibold data-[state=active]:shadow-sm transition-all"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            color: "var(--skin-text-primary, #0b2a5a)",
                        }}
                    >
                        First time
                    </TabsTrigger>
                    <TabsTrigger
                        value="return"
                        className="rounded-full min-h-[44px] text-base font-semibold data-[state=active]:shadow-sm transition-all"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            color: "var(--skin-text-primary, #0b2a5a)",
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
                                className="text-lg italic"
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
                                className="text-lg italic"
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
                                className="text-lg italic"
                                style={editorialLabelStyle}
                            >
                                Password
                            </Label>
                            <Input
                                id="me-password"
                                type="password"
                                placeholder="Make one up"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className={editorialInputClass}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-3 rounded-full py-6 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
                                className="text-lg italic"
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
                                className="text-lg italic"
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
                            className="w-full mt-3 rounded-full py-6 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
