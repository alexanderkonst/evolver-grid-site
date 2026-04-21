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
      const { error } = await supabase.auth.signUp({
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

      toast({
        title: "Success!",
        description: "Your account has been created. Redirecting...",
      });

      // Redirect immediately since auto-confirm is enabled
      setTimeout(() => navigate(nextPath), 1000);
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
  if (claimMode) {
    return (
      <GameShellV2 hideLogo>
        <div className="min-h-dvh relative">
        <main className="flex-grow flex items-center justify-center px-4 py-24 relative z-10">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-[#a4a3d0]/30 shadow-[0_8px_32px_rgba(132,96,234,0.15)]">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#8460ea]/10 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-[#8460ea]" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#2c3150]">
                Enter your email — your free result stays safe there.
              </CardTitle>
              <CardDescription className="text-[#4a4a6d]">
                We'll email you a one-click magic link. You can dive into your Top Talent now; the link just keeps your result waiting when you're ready to come back.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="claim-email" className="text-[#2c3150]">Email</Label>
                  <Input
                    id="claim-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="border-[#a4a3d0]/40 focus:border-[#8460ea] focus:ring-[#8460ea]/20"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#8460ea] hover:bg-[#6894d0] text-white"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send me the magic link"}
                </Button>
                <p className="text-xs text-[#6b6a8a] text-center pt-2">
                  No password to pick. No spam. Just your result, ready when you are.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </GameShellV2>
    );
  }

  // ── Normal Auth View (login / signup tabs) ─────────────────────────
  return (
    <GameShellV2 hideLogo>
      <main className="min-h-dvh flex items-center justify-center px-4 py-24 relative z-10">
        <Card className={`w-full max-w-md ${isOnboardingFlow
          ? 'bg-white/90 backdrop-blur-sm border-[#a4a3d0]/30 shadow-[0_8px_32px_rgba(132,96,234,0.15)]'
          : ''}`}>
          <CardHeader className="text-center">
            <CardTitle className={`text-2xl font-bold ${isOnboardingFlow ? 'text-[#2c3150]' : ''}`}>
              {isOnboardingFlow ? "Create Your Account" : "Welcome to Genius Business"}
            </CardTitle>
            <CardDescription className={isOnboardingFlow ? 'text-[#a4a3d0]' : ''}>
              {isOnboardingFlow
                ? "Save your Top Talent and unlock your genius business."
                : "Create an account or log in to save your character progress across devices."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className={`grid w-full grid-cols-2 ${isOnboardingFlow ? 'bg-[#a4a3d0]/20' : ''}`}>
                <TabsTrigger value="login" className={isOnboardingFlow ? 'data-[state=active]:bg-white data-[state=active]:text-[#8460ea]' : ''}>Log In</TabsTrigger>
                <TabsTrigger value="signup" className={isOnboardingFlow ? 'data-[state=active]:bg-white data-[state=active]:text-[#8460ea]' : ''}>Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className={isOnboardingFlow ? 'text-[#2c3150]' : ''}>Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={isOnboardingFlow ? 'border-[#a4a3d0]/40 focus:border-[#8460ea] focus:ring-[#8460ea]/20' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className={isOnboardingFlow ? 'text-[#2c3150]' : ''}>Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className={`text-xs hover:underline ${isOnboardingFlow ? 'text-[#8460ea]' : 'text-primary'}`}
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
                      className={isOnboardingFlow ? 'border-[#a4a3d0]/40 focus:border-[#8460ea] focus:ring-[#8460ea]/20' : ''}
                    />
                  </div>
                  <Button
                    type="submit"
                    className={`w-full ${isOnboardingFlow ? 'bg-[#8460ea] hover:bg-[#6894d0] text-white' : ''}`}
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Log In"}
                  </Button>

                  {/* Magic-link alternative — same OTP flow as claim mode, but
                      without the pending-claim email stash. */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleMagicLinkFromLogin}
                    className="w-full"
                    disabled={loading || !email}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Or send me a magic link instead
                  </Button>

                  {import.meta.env.DEV && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestLogin}
                      className="w-full"
                      disabled={loading}
                    >
                      Test Login (Dev Only)
                    </Button>
                  )}
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="signup-firstname" className={isOnboardingFlow ? 'text-[#2c3150]' : ''}>First Name</Label>
                      <Input
                        id="signup-firstname"
                        type="text"
                        placeholder="Jane"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className={isOnboardingFlow ? 'border-[#a4a3d0]/40 focus:border-[#8460ea] focus:ring-[#8460ea]/20' : ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname" className={isOnboardingFlow ? 'text-[#2c3150]' : ''}>Last Name</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className={isOnboardingFlow ? 'border-[#a4a3d0]/40 focus:border-[#8460ea] focus:ring-[#8460ea]/20' : ''}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className={isOnboardingFlow ? 'text-[#2c3150]' : ''}>Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={isOnboardingFlow ? 'border-[#a4a3d0]/40 focus:border-[#8460ea] focus:ring-[#8460ea]/20' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className={isOnboardingFlow ? 'text-[#2c3150]' : ''}>Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className={isOnboardingFlow ? 'border-[#a4a3d0]/40 focus:border-[#8460ea] focus:ring-[#8460ea]/20' : ''}
                    />
                    <p className={`text-xs ${isOnboardingFlow ? 'text-[#a4a3d0]' : 'text-muted-foreground'}`}>
                      Password must be at least 6 characters
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className={`w-full ${isOnboardingFlow ? 'bg-[#8460ea] hover:bg-[#6894d0] text-white' : ''}`}
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </GameShellV2>
  );
};

export default Auth;
