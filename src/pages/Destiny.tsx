import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import BoldText from "@/components/BoldText";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import profilePhoto from "@/assets/profile-photo.png";
import BackButton from "@/components/BackButton";

const Destiny = () => {
  const sectionIds = ['hero', 'is-this-you', 'how-it-works', 'about', 'start'];
  const activeSection = useScrollSpy(sectionIds);
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll animations for sections
  const isThisYouAnimation = useScrollAnimation(0.2);
  const promiseAnimation = useScrollAnimation(0.2);
  const methodAnimation = useScrollAnimation(0.2);
  const qualificationAnimation = useScrollAnimation(0.2);
  const containerAnimation = useScrollAnimation(0.2);
  const aboutAnimation = useScrollAnimation(0.2);
  const finalCtaAnimation = useScrollAnimation(0.2);

  return (
    <div className="min-h-dvh">
      <Navigation />
      
      {/* Back Button - Left Aligned */}
      <div className="pt-24 pb-4 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <BackButton
            to="/"
            label={<BoldText>BACK</BoldText>}
            className="text-white/60 hover:text-white transition-colors font-semibold"
          />
        </div>
      </div>
      
      {/* Sticky Top Nav */}
      <nav className="fixed top-20 left-0 right-0 z-overlay bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-3 sm:gap-6 py-4 overflow-x-auto scrollbar-hide">
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
                className={`text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${
                  activeSection === link.id 
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                style={activeSection === link.id ? { color: 'hsl(var(--destiny-gold-dark))' } : {}}
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
        className="min-h-dvh flex items-center justify-center pt-32 pb-20 px-6"
        style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          {/* Central Orb / Spotlight Visual */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-32 h-32 rounded-full orb-pulse"
              style={{
                backgroundColor: 'hsl(var(--destiny-gold))',
              }}
            />
          </div>

          {/* Offer Name Overline */}
          <p className="text-sm uppercase  mb-6 text-white/60">
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
            className="destiny-cta-button text-lg px-12 py-6 rounded-full shadow-lg mb-4"
            style={{ 
              backgroundColor: 'hsl(var(--destiny-gold))', 
              color: 'hsl(var(--destiny-dark))',
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
      <section 
        id="is-this-you" 
        ref={isThisYouAnimation.ref}
        className={`py-24 px-6 ${isThisYouAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
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
            
            <p className="text-xl font-semibold text-center pt-6" style={{ color: 'hsl(var(--destiny-gold-dark))' }}>
              If this feels uncomfortably accurate, this work is for you.
            </p>

            {/* Mid-Page CTA */}
            <div className="flex justify-center mt-12">
              <Button 
                size="lg"
                onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
                className="destiny-cta-button text-lg px-12 py-6 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: 'hsl(var(--destiny-gold))', 
                  color: 'hsl(var(--destiny-dark))',
                }}
              >
                <BoldText>BOOK AN EXCALIBUR CALL</BoldText>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Promise Section - Deep Charcoal */}
      <section 
        id="how-it-works" 
        ref={promiseAnimation.ref}
        className={`py-24 px-6 ${promiseAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
      >
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
            
            <div className="space-y-4 pl-6 border-l-2" style={{ borderColor: 'hsl(var(--destiny-gold))' }}>
              <p>• Is built around your true genius, not a trendy niche</p>
              <p>• Speaks to a real, conscious pain in people you deeply understand</p>
              <p>• Lives in a doable container (usually 1:1 or small-group deep work)</p>
              <p>• Has realistic potential to generate thousands per month without burning you out</p>
            </div>
            
            <p className="text-xl font-semibold text-center pt-6" style={{ color: 'hsl(var(--destiny-gold))' }}>
              Think of it as Destiny, implemented: not as a fantasy, but as a business.
            </p>
          </div>
        </div>
      </section>

      {/* Excalibur Method Section - Warm Off-White */}
      <section 
        ref={methodAnimation.ref}
        className={`py-24 px-6 ${methodAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-4 text-center">
            <BoldText>THE EXCALIBUR METHOD</BoldText>
          </h2>
          
          <p className="text-xl text-center mb-16 text-muted-foreground">
            We don't manifest. We get radically honest, then build.
          </p>
          
          <div className="relative space-y-12">
            {/* Connecting Line */}
            <div 
              className="absolute left-8 top-16 bottom-16 w-0.5 z-underlay"
              style={{ backgroundColor: 'hsl(var(--destiny-gold))' }}
            />

            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg z-above"
                style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
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
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg z-above"
                style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
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
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg z-above"
                style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
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
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 hover:scale-110 hover:shadow-lg z-above"
                style={{ backgroundColor: 'hsl(var(--destiny-gold))', color: 'hsl(var(--destiny-dark))' }}
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

      {/* Who This Is For / Not For Section - Deep Charcoal */}
      <section 
        ref={qualificationAnimation.ref}
        className={`py-24 px-6 ${qualificationAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Who This Is For */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-white">
                <BoldText>WHO THIS IS FOR</BoldText>
              </h2>
              <div className="space-y-4">
                {[
                  "Founders, ex-founders, and creative leaders who know they're here to change something real, not just make decent money.",
                  "People whose old professional identity has cracked, and pretending it still works feels like self-betrayal.",
                  "Those willing to tell the truth about money, fear, and desire — and then do focused work from there.",
                  "People ready to commit to one primary lane (for now) and give it a genuine chance."
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(var(--destiny-gold))' }} />
                    <p className="text-white/70 text-base leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Who This Is Not For */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-white">
                <BoldText>WHO THIS IS NOT FOR</BoldText>
              </h2>
              <div className="space-y-4">
                {[
                  "Anyone looking for \"10k in 10 days\" hacks or copy-paste funnels.",
                  "People who want AI and automation to do the work instead of real conversations.",
                  "Folks unwilling to be seen more deeply than their current bio or brand.",
                  "Anyone who wants a guarantee without taking any risk or responsibility."
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 flex-shrink-0 mt-0.5 text-white/40">✕</div>
                    <p className="text-white/70 text-base leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work Together Section - Warm Off-White */}
      <section 
        ref={containerAnimation.ref}
        className={`py-24 px-6 ${containerAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center">
            <BoldText>HOW WE WORK TOGETHER</BoldText>
          </h2>
          
          <div className="space-y-6 text-lg text-foreground/80 max-w-3xl mx-auto">
            <p>
              We work in a focused, time-bound container (for example, 6–10 weeks), using:
            </p>
            <ul className="list-none space-y-2 pl-6">
              <li>– Deep 1:1 sessions (Zoom or in-person when possible)</li>
              <li>– Voice / text between sessions for integration and tweaks</li>
              <li>– Shared living documents (your Genius Map, Excalibur sentence, MVGB spec)</li>
            </ul>
            
            <p className="pt-4">
              I don't sell endless months of "support." We aim for a clear before/after: you enter in limbo, you leave with one working path.
            </p>
            
            <div className="pt-8 border-t border-border">
              <h3 className="text-2xl font-serif font-bold mb-4">
                <BoldText>VALUE EXCHANGE</BoldText>
              </h3>
              <ul className="list-none space-y-2">
                <li>– We agree on a base fee for the container (discussed live).</li>
                <li>– Plus a small share of revenue from your new MVGB only,</li>
                <li>– Capped at a fixed amount, so it stays fair and non-extractive.</li>
              </ul>
              <p className="pt-4 text-xl font-semibold" style={{ color: 'hsl(var(--destiny-gold-dark))' }}>
                I win when your genius starts feeding you. That's the point.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Deep Charcoal */}
      <section 
        id="about" 
        ref={aboutAnimation.ref}
        className={`py-24 px-6 ${aboutAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-dark))' }}
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-12 text-center text-white">
            <BoldText>WHO'S HOLDING THIS WORK</BoldText>
          </h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center max-w-3xl mx-auto">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <img 
                src={profilePhoto} 
                alt="Aleksandr Konstantinov"
                loading="lazy"
                className="w-48 h-48 rounded-full object-cover"
                style={{ 
                  border: '3px solid hsl(var(--destiny-gold))',
                  boxShadow: '0 0 30px hsla(var(--destiny-gold), 0.3)'
                }}
              />
            </div>
            
            {/* Bio Text */}
            <div className="space-y-6 text-lg text-white/80 flex-1">
              <p>
                I'm Aleksandr — a systems architect, venture builder, and teacher of integral evolution.
              </p>
              
              <p>
                My life's work is helping people and projects move from myth-level vision to real-world structure. I've built and advised ventures at the intersection of tech, consciousness, and new systems, and helped founders name their true lane and design businesses around it.
              </p>
              
              <p>
                This offer — Destiny: Your Unique Genius Business — is my own MVGB. It's how my genius plugs straight into yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Warm Off-White */}
      <section 
        id="start" 
        ref={finalCtaAnimation.ref}
        className={`py-24 px-6 ${finalCtaAnimation.isVisible ? 'fade-in-section' : 'opacity-0'}`}
        style={{ backgroundColor: 'hsl(var(--destiny-light))' }}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8">
            <BoldText>READY TO STOP HOVERING BETWEEN WORLDS?</BoldText>
          </h2>
          
          <div className="space-y-6 text-lg text-foreground/80 max-w-3xl mx-auto mb-12">
            <p>
              If you feel the gap between who you are and how you make a living getting more painful, that's not a bug — it's a summons.
            </p>
            
            <p>
              This call is not a sales trap. It's a space to look honestly at where you are, name what's really trying to be born through you, and see whether this container is the right forge.
            </p>
          </div>

          <Button 
            size="lg"
            onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
            className="destiny-cta-button text-lg px-12 py-6 rounded-full shadow-lg mb-4"
            style={{ 
              backgroundColor: 'hsl(var(--destiny-gold))', 
              color: 'hsl(var(--destiny-dark))',
            }}
          >
            <BoldText>BOOK AN EXCALIBUR CALL</BoldText>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            One conversation. Full honesty. No pressure. If it's not the right time or fit, we'll both say so.
          </p>
        </div>
      </section>

      <Footer />

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Sticky Mobile CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-3 pb-safe-4 shadow-lg z-modal">
        <button
          onClick={() => window.open('https://www.calendly.com/konstantinov', '_blank')}
          className="w-full py-3 rounded-full font-bold transition-all text-sm shadow-[0_0_20px_rgba(45,100,165,0.4)]"
          style={{ 
            backgroundColor: 'hsl(var(--destiny-gold))', 
            color: 'hsl(var(--destiny-dark))',
          }}
        >
          <BoldText>BOOK EXCALIBUR CALL</BoldText>
        </button>
      </div>
    </div>
  );
};

export default Destiny;
