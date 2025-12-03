import { useState } from "react";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GeniusOffer = () => {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    presenceLink: "",
    currentDescription: "",
    unclearPart: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToApply = () => {
    const applySection = document.getElementById("apply");
    if (applySection) {
      applySection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    toast({
      title: "Application received",
      description: "I'll review your application and reply within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <ScrollToTop />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight">
                <BoldText>ONE CLEAR GENIUS OFFER YOU CAN ACTUALLY SELL</BoldText>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                In 48 hours, we'll distill all your talents, ideas, and modalities into <strong>one sharp, test-ready offer</strong> you can start selling immediately – without burning down everything you've built so far.
              </p>
              <div className="space-y-3">
                <Button size="lg" onClick={scrollToApply} className="text-lg px-8">
                  <BoldText>APPLY FOR YOUR GENIUS OFFER</BoldText>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  For multi-talented founders, coaches, and creators ready to stop "being everything" and start <strong>selling one thing clearly</strong>.
                </p>
              </div>
            </div>

            {/* Mock One-Pager Visual */}
            <div className="hidden lg:block">
              <div className="bg-card border border-border rounded-lg p-8 shadow-lg relative">
                <div className="absolute top-4 right-4">
                  <FileText className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="h-3 bg-primary/20 rounded w-3/4"></div>
                    <div className="h-2 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent mt-1.5"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent mt-1.5"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-accent mt-1.5"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 bg-muted rounded w-full"></div>
                        <div className="h-2 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="h-2 bg-primary/30 rounded w-1/3"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  Your Genius Offer Sheet (PDF)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1 – The Pain */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">
            <BoldText>IF YOU'RE HONEST, THIS IS WHERE YOU ARE:</BoldText>
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              <>You're good at <strong>many things</strong>, so you keep trying to cram them all into one offer.</>,
              <>Your website, socials, or Notion are full of <strong>half-built offers</strong> and beautiful ideas that don't move money.</>,
              <>People say "wow, you're so talented" – but when they ask "so what do you <em>actually</em> do?" you still hesitate.</>,
              <>You've done the inner work, taken programs, maybe even hired strategists – and still don't have <strong>one offer that feels true <em>and</em> sellable.</strong></>,
              <>Deep down, you know: without a clear offer, you're <strong>stalling your own impact and income.</strong></>,
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0"></div>
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-lg italic text-foreground/80">
            This container exists to end that loop.
          </p>
        </div>
      </section>

      {/* Section 2 – The Promise */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">
            <BoldText>WHAT YOU WALK AWAY WITH (IN 48 HOURS)</BoldText>
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* The Artifact */}
            <div className="p-6 bg-card border border-border rounded-lg space-y-4">
              <h3 className="text-xl font-serif font-semibold">The Artifact</h3>
              <p className="text-muted-foreground">A <strong>one-page Genius Offer Sheet</strong> that includes:</p>
              <ul className="space-y-2">
                {[
                  <>Your <strong>core offer sentence</strong> (who it's for, the transformation, and how it works)</>,
                  <>A <strong>clear promise</strong> in plain language</>,
                  <>Ideal client snapshot (who you speak to first)</>,
                  <>Price point (or price range) that actually fits your reality</>,
                  <>One simple way to deliver it (session / sprint / container)</>,
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Action */}
            <div className="p-6 bg-card border border-border rounded-lg space-y-4">
              <h3 className="text-xl font-serif font-semibold">The Action</h3>
              <p className="text-muted-foreground">A <strong>ready-to-use test script</strong>, e.g.:</p>
              <ul className="space-y-2 mb-4">
                {[
                  "A short DM or email you can send to 5–10 people",
                  "Optional social post hook to announce or float the offer",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground">A list of <strong>3 immediate moves</strong> to test your offer in the next 7–14 days</p>
              <p className="text-muted-foreground text-sm">Simple criteria: "how to know if this offer is working" so you don't gaslight yourself.</p>
            </div>
          </div>

          <p className="text-center mt-10 text-muted-foreground italic">
            Not another 50-page PDF.<br />
            One sharp page + a simple plan you can actually act on.
          </p>
        </div>
      </section>

      {/* Section 3 – Who This Is For */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif mb-6">
                <BoldText>THIS IS FOR YOU IF…</BoldText>
              </h2>
              <ul className="space-y-3">
                {[
                  <>You're a <strong>founder, coach, guide, or creator</strong> with <em>too many</em> ideas and skills.</>,
                  <>You've already done inner work / training / certifications – you're not starting from zero.</>,
                  <>You're willing to <strong>talk to real humans</strong> about your offer in the next 2 weeks.</>,
                  <>You want something that is <strong>true to your soul <em>and</em></strong> legible to normal humans.</>,
                  <>You're ready to stop endlessly tweaking and <strong>actually ship something.</strong></>,
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif mb-6">
                <BoldText>THIS IS NOT FOR YOU IF…</BoldText>
              </h2>
              <ul className="space-y-3">
                {[
                  <>You just want a <strong>pretty sentence</strong> to admire, not an offer you'll test.</>,
                  <>You are not willing to reach out to potential clients in the next 2–4 weeks.</>,
                  <>You want a full "build my entire business for me" program (this is the <strong>first sharp cut</strong>, not the whole business).</>,
                  <>You're looking for generic templates you can copy-paste – this is <strong>deeply tailored</strong>.</>,
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="h-5 w-5 flex items-center justify-center mt-0.5 shrink-0">
                      <div className="h-0.5 w-4 bg-destructive/50"></div>
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 – How It Works */}
      <section id="apply" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">
            <BoldText>HOW IT WORKS</BoldText>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "1",
                title: "You share signal",
                description: (
                  <div className="space-y-2">
                    <p>After you apply and are accepted, you'll receive a short intake prompt / form.</p>
                    <p className="text-sm">You can either:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Paste a short "who I am & what I've done" blurb, <strong>or</strong></li>
                      <li>• Ask your own AI model to describe your genius and send that as raw material, plus any links.</li>
                    </ul>
                  </div>
                ),
              },
              {
                step: "2",
                title: "I distill your Genius Offer",
                description: (
                  <div className="space-y-2">
                    <p>I run your signal through a <strong>refined Excalibur-style process</strong> I've already used with multiple founders.</p>
                    <p className="text-sm">I combine: your data, my pattern-recognition, and tight iteration with AI to arrive at <strong>one clean, testable offer</strong> that rings true <em>and</em> makes sense.</p>
                  </div>
                ),
              },
              {
                step: "3",
                title: "We refine & lock it in",
                description: (
                  <div className="space-y-2">
                    <p>You receive your <strong>Genius Offer Sheet</strong> and action steps within <strong>48 hours</strong> of completing the intake.</p>
                    <p className="text-sm">We have a <strong>30-minute live or async refinement round</strong> (video or Loom + comments) to tweak language and ensure it <em>really</em> feels like you.</p>
                    <p className="text-sm font-medium">You leave with: one offer, one script, and a concrete next step.</p>
                  </div>
                ),
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-serif font-bold text-xl flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-serif font-semibold">{item.title}</h3>
                <div className="text-muted-foreground text-sm leading-relaxed text-left">
                  {item.description}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mb-12 text-muted-foreground italic">
            No overwhelm, no 12-week curriculum.<br />
            One focused pass. One clear offer.
          </p>

          {/* Apply Form */}
          <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-lg font-serif mb-2">
                <BoldText>LAUNCH RATE: $111 USD</BoldText>
              </p>
              <p className="text-sm text-muted-foreground">Price will increase as results and case studies accumulate.</p>
            </div>

            {formSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-serif">
                  <BoldText>THANK YOU!</BoldText>
                </h3>
                <p className="text-muted-foreground">
                  I'll review your application to confirm it's a fit.<br />
                  If it is, I'll send payment details and your intake in the next 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="presenceLink">Link to your website / LinkedIn / main online presence</Label>
                  <Input
                    id="presenceLink"
                    name="presenceLink"
                    value={formData.presenceLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentDescription">In one or two sentences, how do you currently describe what you do?</Label>
                  <Textarea
                    id="currentDescription"
                    name="currentDescription"
                    value={formData.currentDescription}
                    onChange={handleInputChange}
                    required
                    placeholder="I help people with..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unclearPart">What feels most unclear about your offer right now?</Label>
                  <Textarea
                    id="unclearPart"
                    name="unclearPart"
                    value={formData.unclearPart}
                    onChange={handleInputChange}
                    required
                    placeholder="The hardest part is..."
                    rows={3}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <BoldText>APPLY FOR YOUR GENIUS OFFER</BoldText>
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Section 5 – Why This Is Different */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">
            <BoldText>WHY THIS IS DIFFERENT FROM "JUST ANOTHER CLARITY SESSION"</BoldText>
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              <><strong>Not therapy, not vague coaching.</strong> This is a <strong>crafting process</strong> that outputs a concrete offer, not just insights.</>,
              <><strong>Not generic positioning.</strong> Your offer is grounded in your actual genius, not in whatever niche seems hot this month.</>,
              <><strong>Built to be tested.</strong> Everything is oriented toward: "Can I talk to real humans about this and see if they say yes?"</>,
              <><strong>Engine, not a one-off trick.</strong> The same pattern that shapes your first offer can later power future versions, products, and collaborations.</>,
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-muted-foreground italic">
            It's the bridge between "I'm good at many things" and "here's the one thing you can pay me for right now."
          </p>
        </div>
      </section>

      {/* Section 6 – Logistics & Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">
            <BoldText>LOGISTICS & PRICING</BoldText>
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              <><strong>Format:</strong> 100% online, async + one short live/async refinement touchpoint.</>,
              <><strong>Timeline:</strong> Delivery within <strong>48 hours</strong> of completed intake.</>,
              <><strong>Price (launch rate):</strong> <strong>$111 USD</strong> – This is the current launch rate as I focus my work on this offer. Price will increase as results and case studies accumulate.</>,
              <><strong>Slots:</strong> Limited per week to keep quality high.</>,
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0"></div>
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-muted-foreground">
            I've already used this pattern to craft Excalibur-style offers for multiple founders.<br />
            Now I'm making this the front door to my work.
          </p>
        </div>
      </section>

      {/* Section 7 – Final CTA */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            <BoldText>IF YOU WANT ONE CLEAR, TESTABLE OFFER – START HERE</BoldText>
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            If you're done spinning in your own complexity and want <strong>one offer you can actually put in front of people</strong>, this is the first step. No giant program, no reinvention of your entire life – just a precise cut that gives you something real to sell.
          </p>
          <Button size="lg" onClick={scrollToApply} className="text-lg px-8">
            <BoldText>APPLY FOR YOUR GENIUS OFFER</BoldText>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            I'll review your application to confirm it's a fit.<br />
            If it is, I'll send payment details and your intake in the next 24 hours.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GeniusOffer;
