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
    // For now, just show confirmation - will add backend later
    setFormSubmitted(true);
    toast({
      title: "Application received",
      description: "I'll review your answers and reply within 24 hours.",
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
                <BoldText>YOUR GENIUS OFFER, CRYSTAL-CLEAR IN 48 HOURS</BoldText>
              </h1>
              <p className="text-xl text-muted-foreground">
                For multi-talented founders, coaches, and creators who struggle to put their magic into one simple offer people actually understand and buy.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You're good at many things, but when someone asks "So what do you actually offer?", your answer gets long, fuzzy, or abstract. This service gives you one sharp, grounded offer that fits you perfectly—and is easy to say, share, and sell.
              </p>
              <div className="space-y-3">
                <Button size="lg" onClick={scrollToApply} className="text-lg px-8">
                  <BoldText>CLAIM YOUR GENIUS OFFER</BoldText>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground">
                  Founding circle pricing for the first 5 people.
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
                  Your Genius Offer Snapshot (PDF)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Is This You Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-8 text-center">
            <BoldText>YOU'RE SMART, CAPABLE… AND ODDLY HARD TO EXPLAIN</BoldText>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "You're great at many things—but your offer feels scattered or vague.",
              "People say \"wow\" in conversations, but don't know what to buy from you.",
              "Your website or bio doesn't really capture what you do best.",
              "You've tried to niche down, but every version feels too small or not quite you.",
              "You sense there is one powerful, simple offer in you—you just can't quite see it.",
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0"></div>
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Promise Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-4 text-center">
            <BoldText>WHAT YOU GET</BoldText>
          </h2>
          <p className="text-center text-lg text-muted-foreground mb-12">
            In 48 hours, you receive a one-page "Genius Offer Snapshot" that turns your complexity into one clear, concrete offer.
          </p>

          <div className="space-y-6">
            {[
              {
                from: '"I do a lot of things, it\'s hard to explain…"',
                to: '"I help [specific people] go from [starting point] to [clear outcome] with [your unique method]."',
              },
              {
                from: "having ideas and half-written notes",
                to: "one sharp offer you can put on a landing page, in your bio, and in DMs.",
              },
              {
                from: "vague next steps",
                to: "3 grounded, revenue-focused moves to start getting paid for this offer.",
              },
            ].map((item, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <span className="text-xs uppercase text-destructive/70 font-medium">From</span>
                  <p className="mt-1 text-muted-foreground">{item.from}</p>
                </div>
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <span className="text-xs uppercase text-green-600 font-medium">To</span>
                  <p className="mt-1 text-foreground">{item.to}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">
            <BoldText>EXACTLY WHAT YOU'LL RECEIVE</BoldText>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Your Genius Offer Sentence",
                description: "A single, human sentence that captures who you serve, what result you help them achieve, and what makes you different.",
              },
              {
                title: "Offer Snapshot One-Pager (PDF)",
                description: "A clean one-page document you can share with collaborators, use as the basis for a landing page, and anchor your outreach around.",
              },
              {
                title: "3 Revenue-Focused Next Moves",
                description: "Three specific actions to start turning this offer into income (e.g. who to message, what to test, and how to phrase it).",
              },
              {
                title: "Optional Integration Call (45 min)",
                description: "For founding circle clients, the option to book a 45-minute call to walk through your Genius Offer and refine it together.",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-card border border-border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <h3 className="font-serif font-semibold text-lg">{item.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works + Apply Section */}
      <section id="apply" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">
            <BoldText>HOW IT WORKS (SIMPLE AND FAST)</BoldText>
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "1",
                title: "Quick Intake (10–15 minutes)",
                description: "You answer a few focused questions about you, your work, and who you'd love to help. (If you already have your Zone of Genius written somewhere, you can just paste it.)",
              },
              {
                step: "2",
                title: "Deep Synthesis (my work)",
                description: "I map your genius, your past wins, and your ideal client into one coherent offer. I use my Zone of Genius framework plus AI-assisted refinement to distill the clearest, most truthful offer I can see for you.",
              },
              {
                step: "3",
                title: "Delivery in 48 Hours",
                description: "You receive your Genius Offer Snapshot PDF via email within 48 hours, plus an option to book a 45-minute integration call if you'd like live refinement.",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-serif font-bold text-xl flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-serif font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Apply Form */}
          <div className="bg-card border border-border rounded-lg p-8 max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-lg font-serif mb-2">
                <BoldText>FOUNDING CIRCLE PRICE FOR THE FIRST 5 PEOPLE: $111</BoldText>
              </p>
              <p className="text-sm text-muted-foreground">(USD or EUR)</p>
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
                  I'll review your answers and reply with next steps and payment details within 24 hours.
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
                  <BoldText>APPLY FOR FOUNDING CIRCLE</BoldText>
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Who This Is For Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif mb-6">
                <BoldText>WHO THIS IS FOR</BoldText>
              </h2>
              <ul className="space-y-3">
                {[
                  "Founders, coaches, and creators who are good at many things and want one clear offer to lead with.",
                  "People who already have some experience, skills, or clients—but whose positioning is fuzzy.",
                  "Humans who want an honest, grounded reflection, not hype or fake niching.",
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
                <BoldText>WHO THIS IS NOT FOR</BoldText>
              </h2>
              <ul className="space-y-3">
                {[
                  "If you're not willing to take action on the offer once it's clear.",
                  "If you want a full business build-out, website, and funnel in one go.",
                  "If you're looking for generic templates instead of a personalized synthesis.",
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

      {/* Why Me Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            <BoldText>WHY I BUILT THIS</BoldText>
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            For years I've helped founders, social innovators, and creators articulate their Zone of Genius and turn it into offers, ventures, and movements. Again and again, I saw the same bottleneck: incredibly gifted people who couldn't answer "So what do you actually offer?" in a way that leads to a yes. This service is the sharpest, simplest slice of my work: one clear offer that fits your genius and can start moving money and opportunities toward you.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif mb-12 text-center">
            <BoldText>FREQUENTLY ASKED QUESTIONS</BoldText>
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Is this a full business strategy?",
                a: "No. This is the first, sharpest piece: one clear offer + 3 concrete next moves. You can absolutely build more around it later, but this is about getting out of the fog and into focused action.",
              },
              {
                q: "What if I don't like the offer you propose?",
                a: "Then we refine. The point is not to impose a clever sentence on you, but to find language that feels true in your body and is clear in the market. Founding circle clients can use the integration call exactly for this.",
              },
              {
                q: "Do I need to have a business already?",
                a: "You don't need a full business, but you do need some real skills, experience, or ways you've already helped people. This works best if there's at least some raw material to work with.",
              },
              {
                q: "Why $111 for the founding circle?",
                a: "Because I want this to be a no-brainer for the first wave of people while I refine the process even further. In exchange, I'll likely ask for honest feedback and (if it truly helped) a short testimonial.",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-card border border-border rounded-lg">
                <h3 className="font-serif font-semibold mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">
            <BoldText>READY TO GET CLEAR?</BoldText>
          </h2>
          <p className="text-muted-foreground mb-8">
            Stop explaining yourself in circles. Get one sharp offer that fits your genius.
          </p>
          <Button size="lg" onClick={scrollToApply} className="text-lg px-8">
            <BoldText>CLAIM YOUR GENIUS OFFER</BoldText>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GeniusOffer;
