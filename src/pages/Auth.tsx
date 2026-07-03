import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { localizedOrigin } from "@/i18n/localeScope";
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
  const { t } = useTranslation();

  // Claim mode: the landing-page "Claim your gift" CTA lands the user here
  // with ?claim=true so they can enter just an email and carry on to their
  // Top Talent result without picking a password first.
  const claimMode = searchParams.get("claim") === "true";
  const mode = searchParams.get("mode"); // signup, login, or null
  // Read both ?next= (spec) and ?redirect= (legacy). Default depends on flow.
  const queryNext = searchParams.get("next") || searchParams.get("redirect");
  const defaultNext = claimMode ? "/zone-of-genius" : "/playbook/discover";
  const nextPath = queryNext || defaultNext;
  const isCockpitRedirect =
    nextPath.startsWith("/build/cockpit") || nextPath.startsWith("/cockpit");
  // Day 79 (Sasha 2026-05-22): match-path entry detection. When the user
  // came in via `?path=match`, completed Top Talent, and clicked
  // "Discover your mission", RequireAuth on /mission-discovery bounces
  // them here at /auth?redirect=/mission-discovery (no `?claim=true`,
  // no `?mode=signup`). The default subtitle "Pick up where you left
  // off" reads as nonsense to a first-time user who just minted their
  // Top Talent five seconds ago. We read EntryPathContext's
  // sessionStorage key directly so the branch flips before the
  // context provider hydrates.
  // Day 79: entry path is now persisted in localStorage (was
  // sessionStorage). We check both — localStorage is canonical going
  // forward; sessionStorage is the legacy key kept as a safety net for
  // users mid-flow when this ships.
  // 2026-06-10 default flip: the match funnel is the default, so every
  // visitor without an explicit `?path=build` entry counts as a funnel
  // newcomer (net-new → Sign Up default). Returning founders get
  // auto-flipped to Log In by the existing already-registered detection.
  const isMatchPathEntry =
    typeof window !== "undefined" &&
    (window.localStorage?.getItem("ftt_entry_path") ||
      window.sessionStorage?.getItem("ftt_entry_path")) !== "build";
  const isOnboardingFlow =
    !isCockpitRedirect && (mode === "signup" || claimMode || isMatchPathEntry); // tinted UI
  // Match-path users are net-new — default them to Sign Up, not Log In.
  const defaultTab =
    mode === "signup" || (!isCockpitRedirect && isMatchPathEntry) ? "signup" : "login";
  // Day 58+ (Sasha 2026-05-03): Tabs converted from uncontrolled to
  // controlled so the cross-device email-confirmation flow can flip
  // the user from Sign Up → Log In automatically when we detect they
  // already have an account (Karime walkthrough hit this — confirmed
  // on mobile, came to desktop, hit Sign Up, got a destructive
  // "already registered" toast with no path forward).
  const [tab, setTab] = useState<string>(defaultTab);

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
      toast({ title: t('auth.emailRequiredTitle'), description: t('auth.emailRequiredDesc'), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const emailRedirectTo = `${localizedOrigin()}/auth/callback?next=${encodeURIComponent(postLinkRedirect)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo },
      });
      if (error) throw error;

      if (stashForClaim && typeof window !== "undefined") {
        window.sessionStorage.setItem(PENDING_CLAIM_EMAIL_KEY, trimmed.toLowerCase());
      }

      toast({
        title: t('auth.magicLinkSentTitle'),
        description: t('auth.magicLinkSentDesc', { email: trimmed }),
      });

      // Claim flow: send the user straight to their (still anonymous) result
      // while the link sits in their inbox.
      if (stashForClaim) {
        setTimeout(() => navigate(postLinkRedirect), 800);
      }
    } catch (error: any) {
      toast({
        title: t('auth.magicLinkErrorTitle'),
        description: error?.message ?? t('auth.tryAgain'),
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
          emailRedirectTo: `${localizedOrigin()}${nextPath}`,
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
          title: t('auth.alreadyHaveAccountTitle'),
          description: t('auth.alreadyHaveAccountDesc'),
        });
        return;
      }

      // Case 3: auto-confirm ON, session created → log in immediately
      if (data.session) {
        toast({
          title: t('auth.welcomeTitle'),
          description: t('auth.accountCreatedDesc'),
        });
        setTimeout(() => navigate(nextPath), 800);
        return;
      }

      // Case 1: email confirmation required — no session yet
      toast({
        title: t('auth.checkInboxTitle'),
        description: t('auth.checkInboxDesc', { email }),
      });
    } catch (error: any) {
      toast({
        title: t('auth.signUpFailedTitle'),
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
        title: t('auth.welcomeBackTitle'),
        description: t('auth.redirecting'),
      });

      setTimeout(() => navigate(nextPath), 500);
    } catch (error: any) {
      toast({
        title: t('auth.loginFailedTitle'),
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
        title: t('auth.testLoginFailedTitle'),
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
        title: t('auth.emailRequiredTitle'),
        description: t('auth.emailAddressRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${localizedOrigin()}/auth/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: t('auth.resetEmailSentTitle'),
        description: t('auth.resetEmailSentDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.resetEmailFailedTitle'),
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
              <CardTitle className="text-2xl font-bold">{t('auth.resetPasswordTitle')}</CardTitle>
              <CardDescription>
                {resetEmailSent
                  ? t('auth.resetCheckEmailDesc')
                  : t('auth.resetEnterEmailDesc')
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
                    {t('auth.resetIfAccountExists')}
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
                    {t('auth.backToLogin')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">{t('auth.emailLabel')}</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth.sending') : t('auth.sendResetLink')}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('auth.backToLogin')}
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
  // Day 79 (Sasha 2026-05-22): match-path claim copy. Same email-and-
  // magic-link flow; different framing. Match-path users land here
  // after their Top Talent reveal when they click "Discover your
  // mission in 1 minute". They're not waiting to come back later;
  // they're moving forward into the next step. The copy reflects
  // that: "save your data so you don't lose it" plus the forward
  // promise instead of the "come back when ready" promise.
  // Read from storage directly (not EntryPathContext) so the copy
  // switches even before the context hydrates. Day 79: localStorage is
  // canonical (survives magic-link cross-tab hop); sessionStorage is
  // the legacy fallback for users mid-flow at ship time. Key matches
  // EntryPathContext.STORAGE_KEY ("ftt_entry_path").
  // 2026-06-10 default flip: match-funnel copy is the default; only an
  // explicit `?path=build` entry gets the legacy claim line.
  const claimIsMatchPath =
    typeof window !== "undefined" &&
    (window.localStorage?.getItem("ftt_entry_path") ||
      window.sessionStorage?.getItem("ftt_entry_path")) !== "build";

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
                {claimIsMatchPath
                  ? t('auth.claimMatchTitle')
                  : t('auth.claimBuildTitle')}
              </CardTitle>
              <CardDescription>
                {claimIsMatchPath
                  ? t('auth.claimMatchDesc')
                  : t('auth.claimBuildDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claim-email">{t('auth.emailLabel')}</Label>
                  <Input
                    id="claim-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.sending') : t('auth.claimSendMagicLink')}
                </Button>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  {t('auth.claimReassurance')}
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
      {t('auth.createAccountTitlePrefix')}{" "}
      <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
        {t('auth.createAccountTitleGold')}
      </span>
    </>
  ) : (
    <>
      <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
        {t('auth.welcomeTitleGold')}
      </span>
      {t('auth.welcomeTitleSuffix')}
    </>
  );

  // Day 65 (Sasha 2026-05-08): contextual subtitle based on the
  // redirect target. When a user lands on /auth from QoL (/quality-of-
  // life-map/* OR /game/me/quality-of-life), they're hitting the auth
  // wall having tried to access their Quality of Life Map. The subtitle
  // tells them WHY they need to sign in — saving + retaking + tracking
  // over time. Without this contextual cue, they see the generic Top
  // Talent messaging and may bounce, not realizing the assessment
  // requires an account to save. Pattern can be extended for other
  // gated surfaces.
  const isQolRedirect =
    nextPath.startsWith("/quality-of-life-map") ||
    nextPath.startsWith("/game/me/quality-of-life");
  // Day 79 (Sasha 2026-05-22): match-path subtitle. The user just
  // saw their Top Talent reveal and clicked "Discover your mission".
  // They land here because /mission-discovery is auth-walled. The
  // honest framing is "save your data so you don't lose it" plus the
  // forward promise into mission discovery. The generic onboarding
  // line ("Unlock your unique business") was built for build-path
  // users heading toward Ignite — wrong direction for this user.
  const subtitleText = isQolRedirect
    ? t('auth.subtitleQol')
    : isCockpitRedirect
      ? t('auth.subtitleCockpit')
      : isMatchPathEntry
      ? t('auth.subtitleMatch')
      : isOnboardingFlow
        ? t('auth.subtitleOnboarding')
        : t('auth.subtitleReturning');

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
          {/* Header — Cormorant title + italic subtitle.
              Day 80 (Sasha 2026-05-23): legibility upgraded per
              ui_playbook.md Part VIII "Strong" cocktail. The match-path
              Mux video sits behind this card (the card is liquid-glass,
              not opaque) so the title + subtitle render against the
              variable-luminance video pixels. Halo-strong → halo-deep
              on the title (white lift + navy stroke); halo-soft →
              halo-deep on the subtitle plus weight 500 → 700 + full
              text-primary color (was muted) so the supporting line
              holds its own next to the headline. */}
          <header className="text-center mb-2">
            <h1
              className="text-3xl sm:text-4xl font-bold leading-[1.1] tracking-[-0.018em]"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                color: "var(--skin-text-primary, #0a1628)",
                textShadow:
                  "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
              }}
            >
              {titleNode}
            </h1>
            <p
              className="mt-3 text-base sm:text-lg italic leading-snug"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: "var(--skin-text-primary, #0a1628)",
                textShadow:
                  "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
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
                {t('auth.tabLogIn')}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold data-[state=active]:bg-[rgba(212,175,55,0.18)] data-[state=active]:text-[#0a1628] data-[state=active]:shadow-[0_0_14px_-4px_rgba(244,212,114,0.45)]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {t('auth.tabSignUp')}
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
                      color: "var(--skin-text-muted, rgba(11,42,90,0.93))",
                    }}
                  >
                    {t('auth.emailLabel')}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
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
                        color: "var(--skin-text-muted, rgba(11,42,90,0.93))",
                      }}
                    >
                      {t('auth.passwordLabel')}
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
                      {t('auth.forgotPassword')}
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
                  {loading ? t('auth.loggingIn') : t('auth.logInButton')}
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
                    {t('auth.or')}
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
                  {t('auth.sendMagicLink')}
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
                        color: "var(--skin-text-muted, rgba(11,42,90,0.93))",
                      }}
                    >
                      {t('auth.firstNameLabel')}
                    </Label>
                    <Input
                      id="signup-firstname"
                      type="text"
                      placeholder={t('auth.firstNamePlaceholder')}
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
                        color: "var(--skin-text-muted, rgba(11,42,90,0.93))",
                      }}
                    >
                      {t('auth.lastNameLabel')}
                    </Label>
                    <Input
                      id="signup-lastname"
                      type="text"
                      placeholder={t('auth.lastNamePlaceholder')}
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
                      color: "var(--skin-text-muted, rgba(11,42,90,0.93))",
                    }}
                  >
                    {t('auth.emailLabel')}
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
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
                      color: "var(--skin-text-muted, rgba(11,42,90,0.93))",
                    }}
                  >
                    {t('auth.passwordLabel')}
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
                    {t('auth.passwordHint')}
                  </p>
                </div>
                <Button type="submit" className="w-full h-12 rounded-full" disabled={loading}>
                  {loading ? t('auth.creatingAccount') : t('auth.signUpButton')}
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
