import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import BoldText from "@/components/BoldText";

const Destiny = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Sticky Top Nav */}
      <nav className="fixed top-20 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-6 py-4">
            {[
              { label: "HOME", id: "hero" },
              { label: "IS THIS YOU?", id: "is-this-you" },
              { label: "HOW IT WORKS", id: "how-it-works" },
              { label: "ABOUT", id: "about" },
              { label: "START", id: "start" }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <BoldText>{link.label}</BoldText>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section - Deep Charcoal/Midnight Indigo */}
      <section 
        id="hero" 
        className="min-h-screen flex items-center justify-center pt-40 pb-20 px-6"
        style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          {/* Central Orb / Spotlight Visual */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-32 h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(45, 100%, 65%) 0%, hsl(45, 100%, 50%) 30%, transparent 70%)',
                boxShadow: '0 0 80px hsla(45, 100%, 65%, 0.4)'
              }}
            />
          </div>

          {/* Offer Name Overline */}
          <p className="text-sm uppercase tracking-widest mb-6 text-white/60">
            <BoldText>DESTINY: YOUR UNIQUE GENIUS BUSINESS</BoldText>
          </p>

          {/* Hero Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-6 text-white">
            <BoldText>YOUR OLD LIFE IS COLLAPSING. YOUR GENIUS ISN'T.</BoldText>
          </h1>
          
          {/* Hero Subheadline */}
          <p className="text-xl sm:text-2xl mb-8 text-white/80 max-w-3xl mx-auto leading-relaxed">
            For founders and visionaries stuck in the in-between — too awake to go back, not yet clear how to go forward — I help you design one Minimally Viable <span style={{ color: 'hsl(45, 100%, 65%)' }}>Genius</span> Business that can actually pay your bills and honor your destiny.
          </p>
          
          {/* Hero Bullets */}
          <div className="space-y-3 mb-12 max-w-2xl mx-auto">
            {[
              "Turn your soul work into one clear, sellable offer",
              "Aim for a sane target (e.g. 5–10k/month on ~15–20 hours)",
              "Stop scattering energy across 7 half-projects and build one true lane"
            ].map((bullet, i) => (
              <div key={i} className="flex items-start gap-3 text-left">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(45, 100%, 65%)' }} />
                <p className="text-white/70 text-base">{bullet}</p>
              </div>
            ))}
          </div>

          {/* Primary CTA */}
          <Button 
            size="lg"
            onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
            className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all mb-4"
            style={{ 
              backgroundColor: 'hsl(45, 100%, 65%)', 
              color: 'hsl(220, 30%, 12%)',
            }}
          >
            <BoldText>BOOK AN EXCALIBUR CALL</BoldText>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {/* Subtext under button */}
          <p className="text-sm text-white/50">
            Or learn how this works ↓
          </p>
        </div>
      </section>

      {/* Is This You? Section - Warm Off-White */}
      <section id="is-this-you" className="py-24 px-6" style={{ backgroundColor: 'hsl(30, 25%, 94%)' }}>
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center">
            <BoldText>YOU'RE IN THE FORGE, NOT JUST IN A PIVOT</BoldText>
          </h2>
          
          <div className="space-y-6 text-lg text-foreground/80 max-w-3xl mx-auto">
            <p className="text-xl font-medium">
              You're not "just changing careers." You're standing between worlds:
            </p>
            
            <div className="space-y-4 pl-6 border-l-2" style={{ borderColor: 'hsl(45, 100%, 65%)' }}>
              <p>
                • The old way of working is dead or dying — your body and soul won't tolerate it anymore.
              </p>
              <p>
                • You're receiving real visions — land, projects, communities, products — but they mostly live in your head, voice notes, or ceremony.
              </p>
              <p>
                • Savings are melting, and your partner / family is shifting from "I support you" to "I'm scared."
              </p>
              <p>
                • You're highly capable (founder/leader energy), but right now your power is spread across too many ideas.
              </p>
              <p>
                • If someone asked, "So what exactly do you do?" — you'd hesitate or give three different answers.
              </p>
            </div>
            
            <p className="text-xl font-semibold text-center pt-6" style={{ color: 'hsl(45, 100%, 50%)' }}>
              If this feels uncomfortably accurate, this work is for you.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section - Deep Charcoal */}
      <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center text-white">
            <BoldText>HOW IT WORKS</BoldText>
          </h2>
          
          <div className="space-y-6 text-lg text-white/80">
            <p><strong>Placeholder:</strong> Brief overview of the process/method</p>
            <p>Step 1: Excavate your unique genius pattern</p>
            <p>Step 2: Design your MVGB (Minimally Viable Genius Business)</p>
            <p>Step 3: Launch with clarity and confidence</p>
            <p>This section will explain the transformation journey from scattered to crystallized.</p>
          </div>
        </div>
      </section>

      {/* About Section - Warm Off-White */}
      <section id="about" className="py-24 px-6" style={{ backgroundColor: 'hsl(30, 25%, 94%)' }}>
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center">
            <BoldText>ABOUT THIS PROCESS</BoldText>
          </h2>
          
          <div className="space-y-4 text-lg text-foreground/80">
            <p><strong>Placeholder:</strong> Origin story / credibility / why this matters</p>
            <p>Born from working with visionary founders who were stuck at the threshold.</p>
            <p>Not a formula. Not a template. A process to discover YOUR unique pattern.</p>
            <p>This is about finding your <span style={{ color: 'hsl(45, 100%, 50%)' }}>Excalibur</span>—the business only you can build.</p>
          </div>
        </div>
      </section>

      {/* Start Section - Deep Charcoal with CTA */}
      <section id="start" className="py-24 px-6" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-white">
            <span className="text-white">Ready to Claim Your </span>
            <span style={{ color: 'hsl(45, 100%, 65%)' }}>
              <BoldText>DESTINY</BoldText>
            </span>
            <span className="text-white">?</span>
          </h2>
          
          <p className="text-xl mb-12 text-white/60 max-w-2xl mx-auto">
            <strong>Placeholder:</strong> Final invitation / what happens on the call
          </p>

          <Button 
            size="lg"
            onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
            className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{ 
              backgroundColor: 'hsl(45, 100%, 65%)', 
              color: 'hsl(220, 30%, 12%)',
            }}
          >
            <BoldText>BOOK AN EXCALIBUR CALL</BoldText>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Destiny;
