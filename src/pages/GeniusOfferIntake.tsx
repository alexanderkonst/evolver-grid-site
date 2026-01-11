import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Copy, Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import BoldText from "@/components/BoldText";
import { User } from "@supabase/supabase-js";
import { GENIUS_OFFER_PROMPT_FULL, GENIUS_OFFER_PROMPT_SHORT } from "@/prompts";

type WizardStep = 
  | "auth"
  | "name"
  | "email"
  | "ai_branch"
  | "ai_knows_offers"
  | "ai_prompt"
  | "zog_redirect"
  | "mi_redirect"
  | "products_sold"
  | "best_clients"
  | "submit";

interface WizardProgress {
  current_step: number;
  name: string;
  email: string;
  has_ai_assistant: boolean | null;
  ai_knows_offers: boolean | null;
  ai_summary: string;
  zone_of_genius_completed: boolean;
  multiple_intelligences_completed: boolean;
  products_sold: string;
  best_clients: string;
}

const GeniusOfferIntake = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<WizardStep>("auth");
  const [progress, setProgress] = useState<WizardProgress>({
    current_step: 1,
    name: "",
    email: "",
    has_ai_assistant: null,
    ai_knows_offers: null,
    ai_summary: "",
    zone_of_genius_completed: false,
    multiple_intelligences_completed: false,
    products_sold: "",
    best_clients: "",
  });

  // Check auth and load progress
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Pre-fill email from auth
        setProgress(prev => ({
          ...prev,
          email: session.user.email || prev.email,
        }));
        
        // Load wizard progress
        const savedProgress = await loadProgress(session.user.id);
        
        // Check if returning from ZoG or MI
        const from = searchParams.get("from");
        if (from === "zog") {
          // Check if ZoG was completed
          const { data: zogData } = await supabase
            .from("zog_snapshots")
            .select("id")
            .eq("profile_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1);
          
          if (zogData && zogData.length > 0) {
            setProgress(prev => ({ ...prev, zone_of_genius_completed: true }));
            await updateProgressDb(session.user.id, { zone_of_genius_completed: true });
            setCurrentStep("zog_redirect"); // Show completion indicator
          }
        } else if (from === "mi") {
          // Check if MI was completed
          const { data: miData } = await supabase
            .from("multiple_intelligences_results")
            .select("id")
            .eq("user_id", session.user.id)
            .limit(1);
          
          if (miData && miData.length > 0) {
            setProgress(prev => ({ ...prev, multiple_intelligences_completed: true }));
            await updateProgressDb(session.user.id, { multiple_intelligences_completed: true });
            setCurrentStep("mi_redirect"); // Show completion indicator
          }
        } else if (savedProgress) {
          // Determine initial step from saved progress
          const initialStep = determineInitialStep(savedProgress);
          setCurrentStep(initialStep);
        } else {
          // New user with no progress - start at name
          setCurrentStep("name");
        }
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setProgress(prev => ({
          ...prev,
          email: session.user.email || prev.email,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  // Determine current step only on initial load
  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      setCurrentStep("auth");
      return;
    }
    // Step is set in the auth useEffect above based on saved progress
  }, [user, loading]);

  const determineInitialStep = (data: WizardProgress): WizardStep => {
    if (!data.name) return "name";
    if (!data.email) return "email";
    if (data.has_ai_assistant === null) return "ai_branch";
    
    if (data.has_ai_assistant) {
      if (data.ai_knows_offers === null) return "ai_knows_offers";
      if (!data.ai_summary) return "ai_prompt";
      // If AI knows offers, skip manual questions
      if (data.ai_knows_offers) return "submit";
      return "products_sold";
    } else {
      if (!data.zone_of_genius_completed) return "zog_redirect";
      if (!data.multiple_intelligences_completed) return "mi_redirect";
      return "products_sold";
    }
  };

  const loadProgress = async (userId: string): Promise<WizardProgress | null> => {
    const { data } = await supabase
      .from("genius_offer_wizard_progress")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (data) {
      const progressData: WizardProgress = {
        current_step: data.current_step || 1,
        name: data.name || "",
        email: data.email || "",
        has_ai_assistant: data.has_ai_assistant,
        ai_knows_offers: data.ai_knows_offers,
        ai_summary: data.ai_summary || "",
        zone_of_genius_completed: data.zone_of_genius_completed || false,
        multiple_intelligences_completed: data.multiple_intelligences_completed || false,
        products_sold: data.products_sold || "",
        best_clients: data.best_clients || "",
      };
      setProgress(progressData);
      return progressData;
    }
    return null;
  };

  const updateProgressDb = async (userId: string, updates: Partial<WizardProgress>) => {
    await supabase
      .from("genius_offer_wizard_progress")
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
  };

  const updateProgress = async (updates: Partial<WizardProgress>) => {
    if (!user) return;
    
    const newProgress = { ...progress, ...updates };
    setProgress(newProgress);
    
    await supabase
      .from("genius_offer_wizard_progress")
      .upsert({
        user_id: user.id,
        ...newProgress,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
  };

  const copyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Insert the request
      const { error } = await supabase.from("genius_offer_requests").insert({
        user_id: user.id,
        name: progress.name,
        email: progress.email,
        has_ai_assistant: progress.has_ai_assistant || false,
        source_branch: progress.has_ai_assistant ? "ai" : "tests",
        ai_summary_raw: progress.ai_summary || null,
        products_sold: progress.products_sold || null,
        best_clients: progress.best_clients || null,
        status: "intake_received",
      });

      if (error) throw error;

      // Trigger email notification
      await supabase.functions.invoke("send-genius-offer-notification", {
        body: {
          name: progress.name,
          email: progress.email,
          sourceBranch: progress.has_ai_assistant ? "ai" : "tests",
        },
      });

      // Clear wizard progress
      await supabase
        .from("genius_offer_wizard_progress")
        .delete()
        .eq("user_id", user.id);

      setCurrentStep("submit");
    } catch (error) {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getStepNumber = () => {
    const steps: WizardStep[] = progress.has_ai_assistant
      ? ["name", "email", "ai_branch", "ai_knows_offers", "ai_prompt", "products_sold", "best_clients"]
      : ["name", "email", "ai_branch", "zog_redirect", "mi_redirect", "products_sold", "best_clients"];
    
    const idx = steps.indexOf(currentStep);
    return idx >= 0 ? idx + 1 : 1;
  };

  const getTotalSteps = () => {
    return progress.has_ai_assistant ? 7 : 7;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Auth required screen
  if (currentStep === "auth") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-md mx-auto text-center space-y-6">
            <h1 className="text-3xl font-serif">
              <BoldText>GENIUS OFFER CREATION</BoldText>
            </h1>
            <p className="text-muted-foreground">
              Please log in or create a free account to continue your Genius Offer.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?redirect=/genius-offer-intake")}
              className="w-full"
            >
              <BoldText>LOG IN OR SIGN UP</BoldText>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Submission complete
  if (currentStep === "submit") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-xl mx-auto text-center space-y-8">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif">
              <BoldText>THANK YOU – I&apos;VE GOT EVERYTHING I NEED.</BoldText>
            </h1>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed text-left">
              <p>I&apos;ve received your info and will now craft your Genius Offer.</p>
              <p>Within 48 hours you&apos;ll receive:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>A beautifully designed PDF of your Genius Offer</li>
                <li>A short Loom video where I walk through what stands out and suggested next steps</li>
              </ul>
              <p>You&apos;ll also be able to find your Genius Offer inside your profile once it&apos;s ready.</p>
            </div>
            <div className="pt-4 space-y-4">
              <Button 
                size="lg" 
                onClick={() => window.open("https://t.me/integralevolution", "_blank")}
                className="w-full"
              >
                <BoldText>MESSAGE ME ON TELEGRAM</BoldText>
              </Button>
              <Button variant="outline" onClick={() => navigate("/game")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-xl mx-auto">
          {/* Step indicator */}
          <p className="text-xs text-center text-muted-foreground mb-8 uppercase tracking-wide">
            Step {getStepNumber()} of {getTotalSteps()}
          </p>

          {/* STEP: Name */}
          {currentStep === "name" && (
            <div className="space-y-8 text-center">
              <h1 className="text-2xl md:text-3xl font-serif">
                <BoldText>WHAT&apos;S YOUR NAME?</BoldText>
              </h1>
              <Input
                value={progress.name}
                onChange={(e) => setProgress(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                className="text-center text-lg py-6"
                autoFocus
              />
              <Button
                size="lg"
                onClick={() => {
                  if (progress.name.trim()) {
                    updateProgress({ name: progress.name.trim() });
                    setCurrentStep("email");
                  } else {
                    toast({ title: "Please enter your name", variant: "destructive" });
                  }
                }}
                className="w-full"
                disabled={!progress.name.trim()}
              >
                <BoldText>NEXT</BoldText>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP: Email */}
          {currentStep === "email" && (
            <div className="space-y-8 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("name")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-2xl md:text-3xl font-serif">
                <BoldText>WHAT&apos;S YOUR BEST EMAIL?</BoldText>
              </h1>
              <Input
                type="email"
                value={progress.email}
                onChange={(e) => setProgress(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
                className="text-center text-lg py-6"
                autoFocus
              />
              <Button
                size="lg"
                onClick={() => {
                  if (progress.email.trim() && progress.email.includes("@")) {
                    updateProgress({ email: progress.email.trim() });
                    setCurrentStep("ai_branch");
                  } else {
                    toast({ title: "Please enter a valid email", variant: "destructive" });
                  }
                }}
                className="w-full"
                disabled={!progress.email.trim()}
              >
                <BoldText>NEXT</BoldText>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* STEP: AI Branch */}
          {currentStep === "ai_branch" && (
            <div className="space-y-8 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("email")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-serif leading-relaxed">
                <BoldText>DO YOU HAVE AN AI ASSISTANT</BoldText>
                <br />
                <span className="text-muted-foreground text-lg font-normal">
                  (like ChatGPT, Claude, etc.) that knows you well, because you&apos;ve already shared your background, work and clients with it?
                </span>
              </h1>
              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    updateProgress({ has_ai_assistant: true });
                    setCurrentStep("ai_knows_offers");
                  }}
                  className="w-full py-6"
                >
                  <BoldText>YES</BoldText>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    updateProgress({ has_ai_assistant: false });
                    setCurrentStep("zog_redirect");
                  }}
                  className="w-full py-6"
                >
                  <BoldText>NO</BoldText>
                </Button>
              </div>
            </div>
          )}

          {/* STEP: AI Knows Offers */}
          {currentStep === "ai_knows_offers" && (
            <div className="space-y-8 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("ai_branch")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-serif leading-relaxed">
                <BoldText>HAVE YOU SOLD PRODUCTS OR SERVICES TO CLIENTS,</BoldText>
                <br />
                <span className="text-muted-foreground text-lg font-normal">
                  and has your AI assistant already &quot;seen&quot; or &quot;heard&quot; about what you sold and to whom?
                </span>
              </h1>
              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    updateProgress({ ai_knows_offers: true });
                    setCurrentStep("ai_prompt");
                  }}
                  className="w-full py-6"
                >
                  <BoldText>YES</BoldText>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    updateProgress({ ai_knows_offers: false });
                    setCurrentStep("ai_prompt");
                  }}
                  className="w-full py-6"
                >
                  <BoldText>NO</BoldText>
                </Button>
              </div>
            </div>
          )}

          {/* STEP: AI Prompt */}
          {currentStep === "ai_prompt" && (
            <div className="space-y-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("ai_knows_offers")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-serif text-center">
                <BoldText>ASK YOUR AI THIS PROMPT</BoldText>
              </h1>
              <p className="text-sm text-muted-foreground text-center">
                {progress.ai_knows_offers
                  ? "Great. We'll let your AI model summarize your genius and past offers."
                  : "No problem. We'll just use your AI to capture your genius signal."}
              </p>
              
              <div className="p-4 bg-secondary/30 rounded-xl border border-border relative">
                <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {progress.ai_knows_offers ? GENIUS_OFFER_PROMPT_FULL : GENIUS_OFFER_PROMPT_SHORT}
                </pre>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyPrompt(progress.ai_knows_offers ? GENIUS_OFFER_PROMPT_FULL : GENIUS_OFFER_PROMPT_SHORT)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Paste your AI&apos;s response here *</Label>
                <Textarea
                  value={progress.ai_summary}
                  onChange={(e) => setProgress(prev => ({ ...prev, ai_summary: e.target.value }))}
                  placeholder="Paste your AI's response here..."
                  className="min-h-[200px]"
                />
              </div>

              <Button
                size="lg"
                onClick={() => {
                  if (progress.ai_summary.trim()) {
                    updateProgress({ ai_summary: progress.ai_summary.trim() });
                    // If AI knows offers, skip manual questions and go to submit
                    if (progress.ai_knows_offers) {
                      handleSubmit();
                    } else {
                      setCurrentStep("products_sold");
                    }
                  } else {
                    toast({ title: "Please paste your AI's response", variant: "destructive" });
                  }
                }}
                className="w-full"
                disabled={!progress.ai_summary.trim()}
              >
                <BoldText>{progress.ai_knows_offers ? "SUBMIT" : "NEXT"}</BoldText>
                {progress.ai_knows_offers ? <Check className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* STEP: ZoG Redirect */}
          {currentStep === "zog_redirect" && (
            <div className="space-y-8 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("ai_branch")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-serif">
                <BoldText>LET&apos;S MAP YOUR ZONE OF GENIUS</BoldText>
              </h1>
              <p className="text-muted-foreground">
                You&apos;ll take a short assessment, and when you&apos;re done we&apos;ll bring you back here.
              </p>
              
              {progress.zone_of_genius_completed ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-accent">
                    <Check className="h-5 w-5" />
                    <span>Zone of Genius completed!</span>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep("mi_redirect")}
                    className="w-full"
                  >
                    <BoldText>CONTINUE</BoldText>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => navigate("/zone-of-genius/assessment/step-0?return=genius-offer")}
                  className="w-full"
                >
                  <BoldText>TAKE THE ZONE OF GENIUS ASSESSMENT</BoldText>
                </Button>
              )}
            </div>
          )}

          {/* STEP: MI Redirect */}
          {currentStep === "mi_redirect" && (
            <div className="space-y-8 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("zog_redirect")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-serif">
                <BoldText>NOW LET&apos;S MAP HOW YOU NATURALLY THINK</BoldText>
              </h1>
              <p className="text-muted-foreground">
                This takes 2–3 minutes and is a simple drag-and-drop ranking.
              </p>
              
              {progress.multiple_intelligences_completed ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-accent">
                    <Check className="h-5 w-5" />
                    <span>Multiple Intelligences completed!</span>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep("products_sold")}
                    className="w-full"
                  >
                    <BoldText>CONTINUE</BoldText>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={() => navigate("/intelligences?return=genius-offer")}
                  className="w-full"
                >
                  <BoldText>TAKE THE MULTIPLE INTELLIGENCES TEST</BoldText>
                </Button>
              )}
            </div>
          )}

          {/* STEP: Products Sold */}
          {currentStep === "products_sold" && (
            <div className="space-y-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (progress.has_ai_assistant) {
                    setCurrentStep("ai_prompt");
                  } else {
                    setCurrentStep("mi_redirect");
                  }
                }}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-serif text-center">
                <BoldText>WHAT PRODUCTS OR SERVICES HAVE YOU ALREADY SOLD?</BoldText>
              </h1>
              <p className="text-sm text-muted-foreground text-center">
                If you&apos;ve sold your own offers before, describe them here. If not, you can skip this.
              </p>
              <Textarea
                value={progress.products_sold}
                onChange={(e) => setProgress(prev => ({ ...prev, products_sold: e.target.value }))}
                placeholder="I've sold..."
                className="min-h-[150px]"
              />
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    updateProgress({ products_sold: "" });
                    setCurrentStep("best_clients");
                  }}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    updateProgress({ products_sold: progress.products_sold.trim() });
                    setCurrentStep("best_clients");
                  }}
                  className="flex-1"
                >
                  <BoldText>NEXT</BoldText>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: Best Clients */}
          {currentStep === "best_clients" && (
            <div className="space-y-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep("products_sold")}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl md:text-2xl font-serif text-center">
                <BoldText>DESCRIBE 1–2 REAL CLIENTS YOU&apos;VE HELPED THE MOST</BoldText>
              </h1>
              <p className="text-sm text-muted-foreground text-center">
                Think of your most satisfying or impactful client experiences. If you&apos;re just starting, you can skip this.
              </p>
              <Textarea
                value={progress.best_clients}
                onChange={(e) => setProgress(prev => ({ ...prev, best_clients: e.target.value }))}
                placeholder="My best client transformation was..."
                className="min-h-[150px]"
              />
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    updateProgress({ best_clients: "" });
                    handleSubmit();
                  }}
                  className="flex-1"
                  disabled={saving}
                >
                  Skip & Submit
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    updateProgress({ best_clients: progress.best_clients.trim() });
                    handleSubmit();
                  }}
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <BoldText>SUBMIT</BoldText>
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GeniusOfferIntake;
