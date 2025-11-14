import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import logoImage from "@/assets/logo.png";
import founderPhoto from "@/assets/founder-photo.png";

const Index = () => {
  const heroAnimation = useScrollAnimation();
  const problemAnimation = useScrollAnimation();
  const upgradeAnimation = useScrollAnimation();
  const whoAnimation = useScrollAnimation();
  const beforeAfterAnimation = useScrollAnimation();
  const standardAnimation = useScrollAnimation();
  const promiseAnimation = useScrollAnimation();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="pt-12 pb-8 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <img 
            src={logoImage} 
            alt="Logo" 
            className="h-16 mx-auto"
          />
        </div>
      </header>

      {/* Hero Section */}
      <section 
        ref={heroAnimation.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          heroAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight">
                Your AI model can't think as fast as you and is slowing you down.
              </h1>
              <p className="text-xl sm:text-2xl font-serif leading-relaxed">
                Upgrade its thinking to match yours.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                This instant AI upgrade removes the bottleneck — giving your AI the speed, clarity, and reasoning your work demands.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img 
                src={founderPhoto} 
                alt="Founder" 
                className="w-full max-w-md rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section 
        ref={problemAnimation.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          problemAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold">THE PROBLEM</h2>
          <p className="text-2xl font-serif leading-relaxed">
            Your mind moves fast.<br />
            Your AI doesn't.
          </p>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">Instead, it:</p>
            <ul className="space-y-3 text-lg">
              <li>• over-explains</li>
              <li>• loses nuance</li>
              <li>• breaks coherence</li>
              <li>• gives junior-level insights</li>
              <li>• interrupts your flow</li>
              <li>• dilutes your clarity</li>
            </ul>
          </div>
          <p className="text-lg leading-relaxed">
            For high-level operators, this isn't noise —<br />
            it's friction you feel every day.
          </p>
          <p className="text-lg font-medium leading-relaxed">
            If your work depends on clarity, synthesis, or precision, default AI becomes a bottleneck.
          </p>
        </div>
      </section>

      {/* The Upgrade */}
      <section 
        ref={upgradeAnimation.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 transition-all duration-1000 ${
          upgradeAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold">THE UPGRADE</h2>
          <p className="text-xl leading-relaxed">
            This upgrade installs the thinking layer your AI has been missing.
          </p>
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">It becomes:</p>
            <ul className="space-y-3 text-lg">
              <li>• fast</li>
              <li>• structured</li>
              <li>• precise</li>
              <li>• context-aware</li>
              <li>• concise</li>
              <li>• coherent</li>
              <li>• reliable</li>
            </ul>
          </div>
          <p className="text-lg leading-relaxed">
            Instead of dragging behind you, it starts moving with you.
          </p>
          <p className="text-xl font-serif leading-relaxed mt-8">
            Not a chatbot.<br />
            A cognitive instrument.
          </p>
        </div>
      </section>

      {/* Who It's For */}
      <section 
        ref={whoAnimation.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          whoAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold">WHO IT'S FOR</h2>
          <p className="text-lg leading-relaxed">
            Built for the top 20% of operators who don't just use AI —<br />
            they think with it.
          </p>
          <ul className="space-y-3 text-lg">
            <li>• Strategic founders & CEOs</li>
            <li>• High-end consultants</li>
            <li>• Executive & performance coaches</li>
            <li>• Systems thinkers & polymaths</li>
          </ul>
          <p className="text-lg font-medium leading-relaxed">
            If clarity is your competitive advantage, this upgrade protects it and amplifies it.
          </p>
        </div>
      </section>

      {/* Before → After */}
      <section 
        ref={beforeAfterAnimation.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 transition-all duration-1000 ${
          beforeAfterAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold">BEFORE → AFTER</h2>
          <div className="space-y-6">
            <div>
              <p className="text-xl font-serif mb-2">Before:</p>
              <p className="text-lg text-muted-foreground">Slow. Verbose. Shallow. Cleanup required.</p>
            </div>
            <div>
              <p className="text-xl font-serif mb-2">After:</p>
              <p className="text-lg">Fast. Sharp. Insightful. Senior-level output.</p>
            </div>
          </div>
        </div>
      </section>

      {/* A New Standard */}
      <section 
        ref={standardAnimation.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          standardAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold">A NEW STANDARD OF INTELLIGENCE</h2>
          <p className="text-lg leading-relaxed">
            Your work deserves responses that match your pace, your depth, and your precision.
          </p>
          <p className="text-lg leading-relaxed">
            This upgrade brings your AI up to the level your mind already operates at — instantly.
          </p>
        </div>
      </section>

      {/* The Promise */}
      <section 
        ref={promiseAnimation.ref}
        className={`py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30 transition-all duration-1000 ${
          promiseAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto max-w-3xl space-y-8">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold">THE PROMISE</h2>
          <div className="space-y-4 text-xl font-serif">
            <p>Upgrade your AI.</p>
            <p>Upgrade your thinking.</p>
            <p>Eliminate the drag.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl text-center">
          <Button 
            size="lg"
            className="bg-[#0A2342] hover:bg-[#0A2342]/90 text-white px-12 py-6 text-lg rounded-lg shadow-lg"
            asChild
          >
            <Link to="/ai-upgrade/install">Get the Upgrade →</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
