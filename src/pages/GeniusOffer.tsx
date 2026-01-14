import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import BoldText from "@/components/BoldText";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";

const GeniusOffer = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-dvh bg-background text-foreground">
      <Navigation />
      <ScrollToTop />

      {/* Back Button */}
      <div className="pt-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <BackButton
            to="/"
            label={<BoldText>BACK</BoldText>}
            className="text-muted-foreground hover:text-foreground transition-colors font-semibold"
          />
        </div>
      </div>

      {/* Hero Section - Centered */}
      <section className="pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight">
            <BoldText>TURN YOUR GENIUS INTO ONE CLEAR OFFER</BoldText>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            In 48 hours, I'll turn your core talents and real client wins into <strong>one simple, sellable offer</strong> you can start using immediately.
          </p>
          
          {/* Prominent Price */}
          <div className="py-4">
            <span className="text-4xl md:text-5xl font-serif font-bold text-accent">$111</span>
            <span className="text-muted-foreground ml-2">USD · one-time</span>
          </div>

          <div className="space-y-3">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => window.open('https://buy.stripe.com/dRm9ATbMEayn8id5iUdEs0t', '_blank')}
            >
              <BoldText>GET YOUR GENIUS OFFER</BoldText>
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              <Link to="/genius-offer-intake" className="underline hover:text-foreground transition-colors">
                Already paid? Start the intake here →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-10 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-6 text-center">
            <BoldText>WHO THIS IS FOR</BoldText>
          </h2>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {[
              "Founders and guides who already help people transform something in their life or work",
              "People who feel \"I do many things\" and struggle to explain it in one clear sentence",
              "Those who want a single concrete offer they can confidently share on calls, pages, and DMs",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-6 text-center">
            <BoldText>WHAT YOU GET</BoldText>
          </h2>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {[
              "One clear Genius Offer sentence (what you do, for whom, to what result)",
              "A short description of the ideal client this offer is for",
              "A one-to-two paragraph offer description you can reuse on a page, email, or DM",
              "Delivered within 48 hours after you submit your intake",
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 px-4 bg-secondary/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-serif mb-8 text-center">
            <BoldText>HOW IT WORKS</BoldText>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Pay $111",
                description: "Click the button above to pay securely via Stripe.",
              },
              {
                step: "2",
                title: "Answer a few questions",
                description: "After payment, complete a short intake about your work and clients.",
              },
              {
                step: "3",
                title: "Receive your Genius Offer",
                description: "Within 48 hours, I'll send you your clear offer as a formatted document.",
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-serif font-bold text-lg flex items-center justify-center mx-auto">
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

      {/* Testimonials */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs uppercase  text-primary/70 text-center mb-4">
            What people say about this work
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border bg-card/60 shadow-sm"
              >
                <p className="text-sm text-foreground mb-2">
                  <span className="font-semibold">"{testimonial.boldLine}"</span> {testimonial.rest}
                </p>
                <p className="text-xs font-semibold text-primary mt-3">
                  — {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 bg-secondary/30">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-2xl md:text-3xl font-serif">
            <BoldText>READY TO CLARIFY YOUR OFFER?</BoldText>
          </h2>
          
          <div className="py-2">
            <span className="text-3xl font-serif font-bold text-accent">$111</span>
            <span className="text-muted-foreground ml-2">USD · one-time</span>
          </div>

          <Button 
            size="lg" 
            className="text-lg px-8"
            onClick={() => window.open('https://buy.stripe.com/dRm9ATbMEayn8id5iUdEs0t', '_blank')}
          >
            <BoldText>GET YOUR GENIUS OFFER</BoldText>
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            <Link to="/genius-offer-intake" className="underline hover:text-foreground transition-colors">
              Already paid? Start the intake here →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GeniusOffer;
