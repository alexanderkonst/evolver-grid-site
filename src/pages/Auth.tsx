import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
// Day 47 late pass (Sasha): legacy Navigation + Footer retired — Auth now
// renders inside GameShellV2 like every other public surface.
import GameShellV2 from "@/components/game/GameShellV2";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import { captureReferralIdFromUrl } from "@/lib/gameProfile";
// Day 51 night v2 (Sasha 2026-04-26): editorial v2 of the auth surface
// reuses the landing's gold-text gradient + ornament rule so the auth
// page reads as part of the same brand register, not a generic shadcn
// settings screen.
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";

// Key used by ZoneOfGeniusEntry to detect that the anonymous result should be
// POSTed to save-anonymous-zog with this email (so it can be claimed after the
// magic-link sign-in completes).
const PENDING_CLAIM_EMAIL_KEY = "pending_claim_email";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Claim mode: the landing-page "Claim your gift" CTA lands the user here
  // with ?claim=true so they can enter just an email and carry on to their
  // Top Talent result without picking a password first.
  const claimMode = searchParams.get("claim") === "true";
  const mode = searchParams.get("mode"); // signup, login, or null
  const isOnboardingFlow = mode === "signup" || claimMode; // tinted UI
  const defaultTab = mode === "signup" ? "signup" : "login";
  // Day 58+ (Sasha 2026-05-03): Tabs converted from uncontrolled to
  // controlled so the cross-device email-confirmation flow can flip
  // the user from Sign Up → Log In automatically when we detect they
  // already have an account (Karime walkthrough hit this — confirmed
  // on mobile, came to desktop, hit Sign Up, got a destructive
  // "already registered" toast with no path forward).
  const [tab, setTab] = useState<string>(defaultTab);

  // Read both ?next= (spec) and ?redirect= (legacy). Default depends on flow.
  const queryNext = searchParams.get("next") || searchParams.get("redirect");
  const defaultNext = claimMode ? "/zone-of-genius" : "/playbook/discover";
  const nextPath = queryNext || defaultNext;

  useEffect(() => {
    captureReferralIdFromUrl();
  }, []);

  // Shared magic-link sender. stashForClaim=true also pockets the email in
  // sessionStorage so ZoneOfGeniusEntry can POST the result under the same key.
  const sendMagicLink = async (
    submittedEmail: string,
    postLinkRedirect: string,
    stashForClaim: boolean,
  ) => {
    const trimmed = submittedEmail.trim();
    if (!trimmed) {
      toast({ title: "Email required", description: "Please enter your email.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(postLinkRedirect)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo },
      });
      if (error) throw error;

      if (stashForClaim && typeof window !== "undefined") {
        window.sessionStorage.setItem(PENDING_CLAIM_EMAIL_KEY, trimmed.toLowerCase());
      }

      toast({
        title: "Magic link sent",
        description: `Check ${trimmed} for a sign-in link.`,
      });

      // Claim flow: send the user straight to their (still anonymous) result
      // while the link sits in their inbox.
      if (stashForClaim) {
        setTimeout(() => navigate(postLinkRedirect), 800);
      }
    } catch (error: any) {
      toast({
        title: "Couldn't send magic link",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMagicLink(email, nextPath, true);
  };

  const handleMagicLinkFromLogin = () => {
    sendMagicLink(email, nextPath, false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Day 51 night (Sasha 2026-04-25): the previous code assumed
      // auto-confirm was always on and redirected immediately. Two
      // failure modes that produced the "Login failed: Invalid login
      // credentials" report after signup:
      //
      //   1. Email confirmation required → signUp creates a user but
      //      data.session is null. Old code redirected anyway; the user
      //      then hit /auth and tried to log in with a not-yet-confirmed
      //      account → "Invalid login credentials".
      //
      //   2. Email already exists in auth.users → Supabase returns
      //      success with no session AND data.user.identities is
      //      empty (security feature: don't leak whether an email is
      //      registered). The password just typed was never saved;
      //      logging in with it fails against the OLD stored password.
      //
      // Fix: branch on what signUp actually returned.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${nextPath}`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          },
        },
      });

      if (error) throw error;

      // Case 2: existing email — identities array empty.
      // Day 58+ (Sasha 2026-05-03): Karime walkthrough — she confirmed
      // her email on her PHONE (where she received the confirmation
      // link), then came back to the DESKTOP browser to keep using the
      // site. On desktop she had no session (different device storage),
      // so she clicked "Sign Up" again with the same email — Supabase
      // returns success with empty `identities` (security feature: don't
      // leak whether an email exists). Old toast copy "This email is
      // already registered" felt accusatory and gave her no path
      // forward.
      // Two improvements:
      //   1. Empathetic copy that names the cross-device case explicitly
      //   2. Auto-flip to the Log In tab so the email she just typed is
      //      preserved and she lands directly on the form she needs
      //      (the "Forgot password?" link is now prominent — Item 6 —
      //      so if she doesn't remember her password the path is clear)
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setTab("login");
        toast({
          title: "Looks like you already have an account",
          description:
            "If you just confirmed your email on another device, log in here. Forgot your password? Use the link above.",
        });
        return;
      }

      // Case 3: auto-confirm ON, session created → log in immediately
      if (data.session) {
        toast({
          title: "Welcome.",
          description: "Account created. Redirecting…",
        });
        setTimeout(() => navigate(nextPath), 800);
        return;
      }

      // Case 1: email confirmation required — no session yet
      toast({
        title: "Check your inbox",
        description: `We sent a confirmation link to ${email}. Click it to finish signing up.`,
      });
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Redirecting...",
      });

      setTimeout(() => navigate(nextPath), 500);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: "test@evolvergrid.test",
        password: "testpassword123",
      });

      if (error) throw error;

      navigate("/start");
    } catch (error: any) {
      toast({
        title: "Test login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password View ────────────────────────────────────────────
  if (showForgotPassword) {
    return (
      <GameShellV2 hideLogo>
        <main className="min-h-dvh flex items-center justify-center px-4 py-24">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
              <CardDescription>
                {resetEmailSent
                  ? "Check your email for reset instructions."
                  : "Enter your email and we'll send you a reset link."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetEmailSent ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    If an account with that email exists, you'll receive a password reset link shortly.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetEmailSent(false);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </main>
      </GameShellV2>
    );
  }

  // ── Claim-your-gift View (?claim=true) ─────────────────────────────
  // Day 48 (Sasha): Aurora-specific class overrides (bg-white/90, text-[#2c3150],
  // text-[#8460ea], border-[#a4a3d0], bg-[#8460ea]) removed. Card, Input, Label,
  // and Button now use shadcn's `bg-card` / `text-foreground` / `border-input` /
  // `bg-primary` tokens — which respect the skin via the [data-skin="navy-gold"]
  // CSS-var block. Aurora renders via the default :root values, Navy+Gold
  // renders via the navy-gold override. No per-page branches.
  if (claimMode) {
    return (
      <GameShellV2 hideLogo>
        <div className="min-h-dvh relative">
        <main className="flex-grow flex items-center justify-center px-4 py-24 relative z-10">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Enter your email — your free result stays safe there.
              </CardTitle>
              <CardDescription>
                We'll email you a one-click magic link. You can dive into your Top Talent now; the link just keeps your result waiting when you're ready to come back.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claim-email">Email</Label>
                  <Input
                    id="claim-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send me the magic link"}
                </Button>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  No password to pick. No spam. Just your result, ready when you are.
                </p>
                </form>
            </CardContent>
          </Card>
        </main>
        </div>
      </GameShellV2>
    );
  }

  // ── Normal Auth View (login / signup tabs) ─────────────────────────
  // Day 51 night v2 (Sasha 2026-04-26): editorial v2 of the auth surface.
  // Old version was a generic shadcn Card that rendered as a flat grey
  // box and titled itself "Welcome to Genius Business" (legacy brand
  // name — site brand is "Find Your Top Talent"). The submit Button
  // also had invisible white-on-white text on the Aurora skin (fixed
  // globally in components/ui/button.tsx — default variant now uses
  // bg-primary). This rewrite:
  //   • drops the wrong brand name; the rail's wordmark already brands
  //     the page, the H1 simply welcomes
  //   • Cormorant Garamond title with gold accent on the operative word
  //   • italic subtitle keyed to the flow (login vs onboarding)
  //   • Ornament rule between header and tabs (matches landing rhythm)
  //   • liquid-glass-strong card with rounded-3xl + generous padding
  //   • subtle gold focus ring on the active tab + form inputs
  //   • primary CTA renders via the (now-fixed) shadcn Button default
  //     so it picks up bg-primary / text-primary-foreground
  const titleNode = isOnboardingFlow ? (
    <>
      Create your{" "}
      <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
        account
      </span>
    </>
  ) : (
    <>
      <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
        Welcome
      </span>
      .
    </>
  );

  const subtitleText = isOnboardingFlow
    ? "Save your Top Talent. Unlock your unique business."
    : "Pick up where you left off — your Top Talent and progress are waiting.";

  return (
    <GameShellV2 hideLogo>
      <main className="min-h-dvh flex items-center justify-center px-4 py-16 sm:py-24 relative z-10">
        <article
          className="w-full max-w-md liquid-glass-strong rounded-3xl px-6 sm:px-9 py-10 sm:py-12"
          style={{
            boxShadow:
              "0 8px 24px -10px rgba(10, 22, 40, 0.18), 0 24px 60px -24px rgba(10, 22, 40, 0.22), 0 0 0 1px rgba(212, 175, 55, 0.10)",
          }}
        >
          {/* Header — Cormorant title + italic subtitle */}
          <header className="text-center mb-2">
            <h1
              className="text-3xl sm:text-4xl font-semibold leading-[1.1] tracking-[-0.018em]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--skin-text-primary, #0a1628)",
                textShadow:
                  "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8))",
              }}
            >
              {titleNode}
            </h1>
            <p
              className="mt-3 text-base sm:text-lg italic leading-snug"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 500,
                color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
              }}
            >
              {subtitleText}
            </p>
          </header>

          {/* Ornament rule */}
          <Ornament className="my-6" />

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList
              className="grid w-full grid-cols-2 mb-6 rounded-full p-1"
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.08)",
                border: "1px solid rgba(212, 175, 55, 0.18)",
              }}
            >
              <TabsTrigger
                value="login"
                className="rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold data-[state=active]:bg-[rgba(212,175,55,0.18)] data-[state=active]:text-[#0a1628] data-[state=active]:shadow-[0_0_14px_-4px_rgba(244,212,114,0.45)]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Log In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold data-[state=active]:bg-[rgba(212,175,55,0.18)] data-[state=active]:text-[#0a1628] data-[state=active]:shadow-[0_0_14px_-4px_rgba(244,212,114,0.45)]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ─── LOG IN ─── */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="login-email"
                    className="text-[10px] uppercase tracking-[0.22em] font-medium"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                    }}
                  >
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <Label
                      htmlFor="login-password"
                      className="text-[10px] uppercase tracking-[0.22em] font-medium"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                      }}
                    >
                      Password
                    </Label>
                    {/* Day 58+ (Sasha 2026-05-03): bumped from 11px italic-
                        muted-no-underline to 12.5px non-italic underlined-
                        always. Karime walkthrough: she literally could not
                        find this link — the previous styling read as a
                        Label sub-decoration, not as a clickable affordance.
                        Now reads unmistakably as a link without competing
                        with the "Log In" button below. */}
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[12.5px] underline underline-offset-4 decoration-[1px] hover:decoration-[1.5px] transition-all"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: 500,
                        color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-full" disabled={loading}>
                  {loading ? "Logging in…" : "Log In"}
                </Button>

                <div className="flex items-center gap-3 py-1">
                  <span className="flex-1 h-px" style={{ backgroundColor: "var(--skin-rule-medium, rgba(26,30,58,0.12))" }} />
                  <span
                    className="text-[10px] uppercase tracking-[0.22em]"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "var(--skin-text-muted-soft, rgba(26,30,58,0.5))",
                    }}
                  >
                    or
                  </span>
                  <span className="flex-1 h-px" style={{ backgroundColor: "var(--skin-rule-medium, rgba(26,30,58,0.12))" }} />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMagicLinkFromLogin}
                  className="w-full h-12 rounded-full"
                  disabled={loading || !email}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Send me a magic link
                </Button>
                {/* Day 51 night v2 (Sasha 2026-04-26): "Test Login (Dev Only)"
                    button removed. It was gated behind import.meta.env.DEV
                    but the lovable.app preview build was apparently treating
                    that as truthy and shipping it to mobile users — Sasha
                    saw it in the public funnel. Cleaner to delete than to
                    re-gate. The handleTestLogin handler stays in the file
                    in case it's wanted back behind a stricter gate later. */}
              </form>
            </TabsContent>

            {/* ─── SIGN UP ─── */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-firstname"
                      className="text-[10px] uppercase tracking-[0.22em] font-medium"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                      }}
                    >
                      First Name
                    </Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="signup-lastname"
                      className="text-[10px] uppercase tracking-[0.22em] font-medium"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                      }}
                    >
                      Last Name
                    </Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-email"
                    className="text-[10px] uppercase tracking-[0.22em] font-medium"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                    }}
                  >
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="signup-password"
                    className="text-[10px] uppercase tracking-[0.22em] font-medium"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "var(--skin-text-muted, rgba(26,30,58,0.7))",
                    }}
                  >
                    Password
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="rounded-xl"
                  />
                  <p
                    className="text-[11px] italic mt-1.5"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      color: "var(--skin-text-muted-soft, rgba(26,30,58,0.55))",
                    }}
                  >
                    At least 6 characters.
                  </p>
                </div>
                <Button type="submit" className="w-full h-12 rounded-full" disabled={loading}>
                  {loading ? "Creating account…" : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </article>
      </main>
    </GameShellV2>
  );
};

export default Auth;
