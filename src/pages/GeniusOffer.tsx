import { useState } from "react";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BoldText from "@/components/BoldText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GeniusOffer = () => {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    toast({
      title: "You're in!",
      description: "Check your email for your intake link.",
    });
  };

  const testimonials = [
    {
      boldLine: "This is a miracle of miracles.",
      rest: "I'm re-reading it—brilliant! Totally badass. Other tools come at this half-baked and shallow; they've got no depth. Your approach, though, I love it. A tool that just plain works!",
      name: "Alexey"
    },
    {
      boldLine: "I finally had language for something I'd felt my whole life.",
      rest: "This is very valuable. I resonate with all of this. Inspires & informs BRILLIANTLY!!",
      name: "Laura"
    },
    {
      boldLine: "I got into my Zone of Genius and launched my blockchain wellness education project.",
      rest: "I am also grateful for this training. Obrigado!",
      name: "Simba"
    },
    {
      boldLine: "It inspires and informs brilliantly.",
      rest: "This was an outstanding training! I am so grateful to know my zone of genius now (and why!). Truly profound.",
      name: "Tshatiqua"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <ScrollToTop />

      {/* Hero Section - Centered */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight">
            <BoldText>ONE CLEAR GENIUS OFFER YOU CAN ACTUALLY SELL</BoldText>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            In 48 hours, we'll turn your real skills and ideas into <strong>one sharp, test-ready offer</strong> you can put in front of people right away.
          </p>
          <div className="space-y-3 pt-4">
            <Button size="lg" onClick={scrollToApply} className="text-lg px-8">
              <BoldText>CREATE YOUR GENIUS OFFER</BoldText>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              For multi-talented founders, coaches, and creators who are done being "everything" and ready to sell <strong>one thing clearly</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1 – Who This Is For */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-8 text-center">
            <BoldText>THIS IS FOR YOU IF…</BoldText>
          </h2>
          <ul className="space-y-4 max-w-2xl mx-auto">
            {[
              <>You're good at <strong>many things</strong>, but struggle to explain what you actually offer.</>,
              <>You've tried to build offers before, but they feel either <strong>too vague</strong> or <strong>too complex</strong>.</>,
              <>People respect you, but you don't yet have <strong>one clear offer</strong> they can easily say yes to.</>,
              <>You're ready to talk to real humans about your work in the next 1–2 weeks.</>,
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 2 – What You Get */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-8 text-center">
            <BoldText>WHAT YOU WALK AWAY WITH</BoldText>
          </h2>
          <ul className="space-y-4 max-w-2xl mx-auto">
            {[
              <>A <strong>one-page Genius Offer</strong>: who it's for, the transformation, and how it works – in plain language.</>,
              <>A <strong>simple test script</strong> (DM / email / short post) to float the offer with 5–10 people.</>,
              <><strong>3 concrete next steps</strong> to test it in the next 7–14 days.</>,
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-center mt-8 text-muted-foreground italic">
            Not a course. Not a 50-page PDF.<br />
            One clean offer + a simple plan to test it.
          </p>
        </div>
      </section>

      {/* Section 3 – How It Works */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-10 text-center">
            <BoldText>HOW IT WORKS</BoldText>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "You say yes",
                description: "Click the button, pay, and confirm your spot. You'll get a short, simple intake link.",
              },
              {
                step: "2",
                title: "You send signal",
                description: "You share a brief description of who you are and what you've done (or an AI summary + relevant links).",
              },
              {
                step: "3",
                title: "I craft your Genius Offer",
                description: "Within 48 hours, you receive your one-page offer, test script, and next steps. We do one short refinement round so it fully feels like you.",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 text-accent font-serif font-bold text-xl flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h3 className="font-serif font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 – Testimonials */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase tracking-wider text-primary/70 text-center mb-4">
            What people say about this work
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-card/60 shadow-sm"
              >
                <p className="text-sm text-foreground mb-2">
                  <span className="font-semibold">"{testimonial.boldLine}"</span> {testimonial.rest}
                </p>
                <p className="text-xs font-semibold text-primary mt-4">
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 – Details */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-8 text-center">
            <BoldText>DETAILS</BoldText>
          </h2>
          <ul className="space-y-3 max-w-lg mx-auto">
            {[
              <><strong>Format:</strong> Online, async + one short refinement touchpoint.</>,
              <><strong>Timeline:</strong> Delivered within <strong>48 hours</strong> after completing the short intake.</>,
              <><strong>Price:</strong> <strong>$111 USD</strong></>,
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-accent mt-2 shrink-0"></div>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 6 – Final CTA */}
      <section id="apply" className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-serif mb-6">
            <BoldText>IF YOU WANT ONE CLEAR, TESTABLE OFFER YOU CAN ACTUALLY TALK ABOUT THIS WEEK, START HERE</BoldText>
          </h2>
          
          <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-auto mt-8">
            {formSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-serif">
                  <BoldText>YOU'RE IN!</BoldText>
                </h3>
                <p className="text-muted-foreground">
                  Check your email for payment details and your intake link.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <Button type="submit" size="lg" className="w-full">
                  <BoldText>CREATE YOUR GENIUS OFFER</BoldText>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <p className="text-xs text-muted-foreground text-center pt-2">
                  $111 USD · You'll receive payment details and your intake link by email.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GeniusOffer;
