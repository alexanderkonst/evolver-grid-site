import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";

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
              { label: "home", id: "hero" },
              { label: "is this you?", id: "is-this-you" },
              { label: "how it works", id: "how-it-works" },
              { label: "about", id: "about" },
              { label: "start", id: "start" }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase"
              >
                {link.label}
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
          {/* Central Orb / Spotlight Visual Placeholder */}
          <div className="mb-8 flex justify-center">
            <div 
              className="w-32 h-32 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(45, 100%, 65%) 0%, hsl(45, 100%, 50%) 30%, transparent 70%)',
                boxShadow: '0 0 80px hsla(45, 100%, 65%, 0.4)'
              }}
            />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-6 text-white">
            <span style={{ color: 'hsl(45, 100%, 65%)' }}>Destiny</span>: Your Unique Genius Business
          </h1>
          
          <p className="text-xl sm:text-2xl mb-4 text-white/80">
            Transform your scattered vision into a Minimally Viable <span style={{ color: 'hsl(45, 100%, 65%)' }}>Genius</span> Business
          </p>
          
          <p className="text-lg mb-12 text-white/60 max-w-2xl mx-auto">
            For founders at the threshold: capable but scattered. Savings melting. Partner worried. The old way has collapsed—something deeper is calling.
          </p>

          <Button 
            size="lg"
            onClick={() => window.open('https://calendly.com/your-link', '_blank')}
            className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{ 
              backgroundColor: 'hsl(45, 100%, 65%)', 
              color: 'hsl(220, 30%, 12%)',
            }}
          >
            Book an <span style={{ fontWeight: 700 }}>Excalibur</span> Call
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Is This You? Section - Warm Off-White */}
      <section id="is-this-you" className="py-24 px-6" style={{ backgroundColor: 'hsl(30, 25%, 94%)' }}>
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center">
            Is This You?
          </h2>
          
          <div className="space-y-4 text-lg text-foreground/80">
            <p><strong>Placeholder:</strong> You've built things. Led teams. Launched projects. But now...</p>
            <p>The old structure has collapsed or is dying. Your savings are melting. Your partner is getting worried.</p>
            <p>You're highly capable—but scattered across too many ideas. You know something deeper is calling, but you can't quite name it yet.</p>
            <p>This is the description of someone at a sacred threshold—capable but uncrystallized.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section - Deep Charcoal */}
      <section id="how-it-works" className="py-24 px-6" style={{ backgroundColor: 'hsl(220, 30%, 12%)' }}>
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-8 text-center text-white">
            How It Works
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
            About This Process
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
            Ready to Claim Your <span style={{ color: 'hsl(45, 100%, 65%)' }}>Destiny</span>?
          </h2>
          
          <p className="text-xl mb-12 text-white/60 max-w-2xl mx-auto">
            <strong>Placeholder:</strong> Final invitation / what happens on the call
          </p>

          <Button 
            size="lg"
            onClick={() => window.open('https://calendly.com/your-link', '_blank')}
            className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            style={{ 
              backgroundColor: 'hsl(45, 100%, 65%)', 
              color: 'hsl(220, 30%, 12%)',
            }}
          >
            Book an <span style={{ fontWeight: 700 }}>Excalibur</span> Call
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Destiny;
