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

      {/* Promise Section - Deep Charcoal */}
      <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center text-white">
            <BoldText>WHAT WE BUILD: A MINIMALLY VIABLE GENIUS BUSINESS</BoldText>
          </h2>
          
          <div className="space-y-6 text-lg text-white/80 max-w-3xl mx-auto">
            <p className="text-xl">
              I don't help you "find your purpose." You already hear it — that's why the old world hurts so much.
            </p>
            
            <p className="text-xl">
              What I do is help you turn that loud inner knowing into one simple, grounded business model that:
            </p>
            
            <div className="space-y-4 pl-6 border-l-2" style={{ borderColor: 'hsl(45, 100%, 65%)' }}>
              <p>• Is built around your true genius, not a trendy niche</p>
              <p>• Speaks to a real, conscious pain in people you deeply understand</p>
              <p>• Lives in a doable container (usually 1:1 or small-group deep work)</p>
              <p>• Has realistic potential to generate thousands per month without burning you out</p>
            </div>
            
            <p className="text-xl font-semibold text-center pt-6" style={{ color: 'hsl(45, 100%, 65%)' }}>
              Think of it as Destiny, implemented: not as a fantasy, but as a business.
            </p>
          </div>
        </div>
      </section>

      {/* Excalibur Method Section - Warm Off-White */}
      <section className="py-24 px-6" style={{ backgroundColor: 'hsl(30, 25%, 94%)' }}>
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-center">
            <BoldText>THE EXCALIBUR METHOD</BoldText>
          </h2>
          
          <p className="text-xl text-center mb-16 text-muted-foreground">
            We don't manifest. We get radically honest, then build.
          </p>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
                style={{ backgroundColor: 'hsl(45, 100%, 65%)', color: 'hsl(220, 30%, 12%)' }}
              >
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  <BoldText>NAME THE TRUTH</BoldText>
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  We start with a real look at your life: projects, money, responsibilities, energy, partner dynamics.
                  You keep what feeds you. We're not here to blow up your life — we're here to give your genius a viable lane.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
                style={{ backgroundColor: 'hsl(45, 100%, 65%)', color: 'hsl(220, 30%, 12%)' }}
              >
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  <BoldText>MAP YOUR GENIUS (APPLESEED)</BoldText>
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  We map your zone of genius: what you actually do when you're at your best, who you're naturally built to serve, and the archetypal roles you play.
                  This becomes your Genius Map — the compass for everything that follows.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
                style={{ backgroundColor: 'hsl(45, 100%, 65%)', color: 'hsl(220, 30%, 12%)' }}
              >
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  <BoldText>FORGE YOUR EXCALIBUR SENTENCE</BoldText>
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  Together we craft a one-sentence unique genius offer that names your ideal person, their real, felt problem, the role you play, and the tangible shift you help create.
                  Most people feel a mix of relief and "oh shit, that's actually it."
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl"
                style={{ backgroundColor: 'hsl(45, 100%, 65%)', color: 'hsl(220, 30%, 12%)' }}
              >
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-bold mb-3">
                  <BoldText>DESIGN & TEST YOUR MVGB</BoldText>
                </h3>
                <p className="text-lg text-foreground/80 leading-relaxed">
                  From that sentence, we design your Minimally Viable Genius Business: clear offer and outcome, container, price point, and simple, human outreach.
                  Then you test it in real conversations, and we refine based on what lands, what doesn't, and what your body says yes to.
                </p>
              </div>
            </div>
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
