import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AI_PROMPT = `Based on everything you know about me, please answer concisely:

What is my current Zone of Genius? (1–3 sentences)

Who have I helped the most so far? Describe 1–2 real clients and what changed for them.

What products or services have I already sold, and to whom?

What patterns do you see in where I create the most value?

Please format your answer under these headings:

Zone of Genius

Best Fit Clients

Offers Sold

Value Pattern`;

const GeniusOfferIntake = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasAiAssistant, setHasAiAssistant] = useState<string | null>(null);

  // YES branch
  const [aiSummary, setAiSummary] = useState("");
  const [aiExtraNotes, setAiExtraNotes] = useState("");

  // NO branch
  const [geniusDescription, setGeniusDescription] = useState("");
  const [offersSold, setOffersSold] = useState("");
  const [bestClientStory, setBestClientStory] = useState("");
  const [noExtraNotes, setNoExtraNotes] = useState("");

  // Shared
  const [intelligencesNote, setIntelligencesNote] = useState("");

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(AI_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !email.trim()) {
      toast({ title: "Please fill in your name and email.", variant: "destructive" });
      return;
    }

    if (!hasAiAssistant) {
      toast({ title: "Please select whether you have an AI assistant.", variant: "destructive" });
      return;
    }

    if (hasAiAssistant === "yes" && !aiSummary.trim()) {
      toast({ title: "Please paste your AI's answer.", variant: "destructive" });
      return;
    }

    if (hasAiAssistant === "no" && (!geniusDescription.trim() || !offersSold.trim() || !bestClientStory.trim())) {
      toast({ title: "Please fill in the required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("genius_offer_requests").insert({
        name: name.trim(),
        email: email.trim(),
        has_ai_assistant: hasAiAssistant === "yes",
        ai_summary_raw: hasAiAssistant === "yes" ? aiSummary.trim() : null,
        no_ai_genius_description: hasAiAssistant === "no" ? geniusDescription.trim() : null,
        offers_sold: hasAiAssistant === "no" ? offersSold.trim() : null,
        best_client_story: hasAiAssistant === "no" ? bestClientStory.trim() : null,
        extra_notes: hasAiAssistant === "yes" ? aiExtraNotes.trim() || null : noExtraNotes.trim() || null,
        intelligences_note: intelligencesNote.trim() || null,
        status: "intake_received",
      });

      if (error) throw error;

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting intake:", error);
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <ScrollToTop />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif">
              <BoldText>THANK YOU</BoldText>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Your intake has been received. I&apos;ll craft your Genius Offer and send it to you within 48 hours.
            </p>
            <Link to="/">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <ScrollToTop />

      {/* Back Button */}
      <div className="pt-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <Link to="/genius-offer" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <BoldText>BACK</BoldText>
          </Link>
        </div>
      </div>

      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-serif text-center mb-4">
            <BoldText>GENIUS OFFER INTAKE</BoldText>
          </h1>
          <p className="text-muted-foreground text-center mb-10">
            This intake gives me enough signal to craft your Genius Offer. Take 5–10 minutes and keep it simple and honest.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Your best email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1"
                />
              </div>
            </div>

            {/* AI Assistant Question */}
            <div className="space-y-3">
              <Label>Do you have an AI assistant (ChatGPT, Claude, etc.) that knows you well through past conversations? *</Label>
              <RadioGroup value={hasAiAssistant || ""} onValueChange={setHasAiAssistant}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="ai-yes" />
                  <Label htmlFor="ai-yes" className="cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="ai-no" />
                  <Label htmlFor="ai-no" className="cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* YES Branch */}
            {hasAiAssistant === "yes" && (
              <div className="space-y-6 p-6 bg-secondary/30 rounded-xl">
                <div>
                  <Label className="text-base font-semibold">Step 1 — Ask your AI this:</Label>
                  <div className="mt-3 p-4 bg-background rounded-lg border border-border relative">
                    <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{AI_PROMPT}</pre>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={copyPrompt}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="ai-summary">Paste your AI&apos;s answer here *</Label>
                  <Textarea
                    id="ai-summary"
                    value={aiSummary}
                    onChange={(e) => setAiSummary(e.target.value)}
                    placeholder="Paste your AI's response here..."
                    className="mt-1 min-h-[200px]"
                  />
                </div>

                <div>
                  <Label htmlFor="ai-extra">Anything else you want me to know about your work or dreams for your offer? (optional)</Label>
                  <Textarea
                    id="ai-extra"
                    value={aiExtraNotes}
                    onChange={(e) => setAiExtraNotes(e.target.value)}
                    placeholder="Any additional context..."
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
            )}

            {/* NO Branch */}
            {hasAiAssistant === "no" && (
              <div className="space-y-6 p-6 bg-secondary/30 rounded-xl">
                <p className="text-muted-foreground text-sm">
                  No problem. We&apos;ll do this with a simple form. If you later take the Zone of Genius and Multiple Intelligences tests, that will further refine your Genius Offer — but this intake is enough for now.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  If you haven&apos;t yet, you can also take the{" "}
                  <Link to="/zone-of-genius" className="underline hover:text-foreground">Zone of Genius Test</Link>{" "}
                  and the{" "}
                  <Link to="/intelligences" className="underline hover:text-foreground">Multiple Intelligences Quick Self-Check</Link>{" "}
                  from the main page. Later, I may ask you for your top results to further refine your Genius Offer.
                </p>

                <div>
                  <Label htmlFor="genius-desc">Describe the kind of work you love doing when you feel most "in your element." *</Label>
                  <p className="text-xs text-muted-foreground mt-1">A few sentences are enough. What do you actually do, and what do people thank you for?</p>
                  <Textarea
                    id="genius-desc"
                    value={geniusDescription}
                    onChange={(e) => setGeniusDescription(e.target.value)}
                    placeholder="When I'm in my element, I..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="offers-sold">What products or services of your own have you already sold? *</Label>
                  <p className="text-xs text-muted-foreground mt-1">List 1–3 examples — what it was, who you sold it to, and what happened.</p>
                  <Textarea
                    id="offers-sold"
                    value={offersSold}
                    onChange={(e) => setOffersSold(e.target.value)}
                    placeholder="I've sold..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="client-story">Describe one client (or person) who got the biggest transformation from working with you. *</Label>
                  <p className="text-xs text-muted-foreground mt-1">Who were they, what situation were they in, and what changed for them?</p>
                  <Textarea
                    id="client-story"
                    value={bestClientStory}
                    onChange={(e) => setBestClientStory(e.target.value)}
                    placeholder="My best client transformation was..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>

                <div>
                  <Label htmlFor="no-extra">Anything else you want me to know? (optional)</Label>
                  <Textarea
                    id="no-extra"
                    value={noExtraNotes}
                    onChange={(e) => setNoExtraNotes(e.target.value)}
                    placeholder="Any additional context..."
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>
            )}

            {/* Shared Intelligences Note */}
            {hasAiAssistant && (
              <div>
                <Label htmlFor="intelligences">If you know your top 2–3 &quot;intelligences&quot; (e.g. verbal, interpersonal, systemic, creative, somatic), list them here. (optional)</Label>
                <p className="text-xs text-muted-foreground mt-1">This is optional and can be refined later.</p>
                <Input
                  id="intelligences"
                  value={intelligencesNote}
                  onChange={(e) => setIntelligencesNote(e.target.value)}
                  placeholder="e.g. Verbal, Interpersonal, Systemic"
                  className="mt-2"
                />
              </div>
            )}

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              <BoldText>{isSubmitting ? "SUBMITTING..." : "SUBMIT INTAKE"}</BoldText>
            </Button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GeniusOfferIntake;