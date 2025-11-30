import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useAIUpgradeAccess, validatePromoCode } from "@/hooks/use-promo-access";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const AIUpgrade = () => {
  const navigate = useNavigate();
  const { hasAccess, grantAccess } = useAIUpgradeAccess();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  useEffect(() => {
    if (hasAccess) {
      navigate("/ai-upgrade/install");
    }
  }, [hasAccess, navigate]);

  const handleApplyPromo = () => {
    setPromoError("");
    
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code.");
      return;
    }

    if (validatePromoCode(promoCode)) {
      grantAccess();
      setShowSuccessModal(true);
    } else {
      setPromoError("Invalid or expired promo code.");
    }
  };

  const handleModalContinue = () => {
    setShowSuccessModal(false);
    navigate("/ai-upgrade/install");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Simple back link */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <Link 
            to="/" 
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#0A2342' }}
          >
            ← Back
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 animate-fade-in">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 leading-tight transition-all duration-700"
            style={{ color: '#0A2342' }}
          >
            Your AI model can't think as fast as you and is slowing you down.
          </h1>
          <p 
            className="text-2xl sm:text-3xl font-light mb-8"
            style={{ color: '#0A2342' }}
          >
            Upgrade its thinking to match yours.
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            This instant AI upgrade removes the bottleneck — giving your AI the speed, clarity, and reasoning your work demands.
          </p>
          <a href="https://buy.stripe.com/5kQdR93g8dKz7e9eTudEs0s" target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg"
              className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
              style={{ backgroundColor: '#0A2342' }}
            >
              Get the Upgrade — $33
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
          <p className="text-sm text-gray-600 mt-4">One-time payment · Instant access</p>

          {/* Subtle Promo Code Section */}
          <div className="mt-8 pt-6">
            <div className="text-center">
              <button
                onClick={() => setShowPromoInput(!showPromoInput)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1"
              >
                Have a promo code?
                {showPromoInput ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </div>
            
            {showPromoInput && (
              <div className="mt-4 max-w-sm mx-auto animate-in slide-in-from-top-2 duration-200">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoError("");
                    }}
                    className="flex-1 text-sm h-9"
                  />
                  <Button
                    onClick={handleApplyPromo}
                    variant="outline"
                    size="sm"
                    className="text-sm"
                    style={{ borderColor: '#0A2342', color: '#0A2342' }}
                  >
                    Apply
                  </Button>
                </div>
                {promoError && (
                  <p className="text-xs text-red-500 mt-1">{promoError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ color: '#0A2342' }}>
              Gift Unlocked! 🌐
            </DialogTitle>
            <DialogDescription className="text-base pt-4 leading-relaxed">
              Your promo code unlocks this product as a gift for you.
              <br />
              Enjoy, and may it serve you. 🌐
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleModalContinue}
              className="rounded-full px-8 text-white"
              style={{ backgroundColor: '#0A2342' }}
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gray-50 transition-all duration-700">
        <div className="container mx-auto max-w-4xl">
          <h2 
            className="text-4xl sm:text-5xl font-bold mb-12 text-center"
            style={{ color: '#0A2342' }}
          >
            The Problem
          </h2>
          <div className="space-y-8">
            <p className="text-2xl font-light text-gray-800 leading-relaxed">
              Your mind moves fast.<br />
              Your AI doesn't.
            </p>
            <p className="text-xl text-gray-600 leading-relaxed">
              Instead, it:
            </p>
            <ul className="space-y-3 text-xl text-gray-700">
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>over-explains</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>loses nuance</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>breaks coherence</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>gives junior-level insights</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>interrupts your flow</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>dilutes your clarity</span>
              </li>
            </ul>
            <p className="text-xl text-gray-700 leading-relaxed mt-8">
              For high-level operators, this isn't noise —<br />
              it's friction you feel every day.
            </p>
            <p className="text-xl text-gray-700 leading-relaxed">
              If your work depends on clarity, synthesis, or precision, default AI becomes a bottleneck.
            </p>
          </div>
        </div>
      </section>

      {/* Upgrade Section */}
      <section className="py-20 px-6 transition-all duration-700">
        <div className="container mx-auto max-w-4xl">
          <h2 
            className="text-4xl sm:text-5xl font-bold mb-12 text-center"
            style={{ color: '#0A2342' }}
          >
            The Upgrade
          </h2>
          <div className="space-y-8">
            <p className="text-xl text-gray-700 leading-relaxed">
              This upgrade installs the thinking layer your AI has been missing.
            </p>
            <p className="text-xl text-gray-600 leading-relaxed">
              It becomes:
            </p>
            <ul className="space-y-3 text-xl text-gray-700">
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>fast</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>structured</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>precise</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>context-aware</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>concise</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>coherent</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>reliable</span>
              </li>
            </ul>
            <p className="text-xl text-gray-700 leading-relaxed mt-8">
              Instead of dragging behind you, it starts moving with you.
            </p>
            <p className="text-2xl font-light text-gray-800 leading-relaxed mt-8">
              Not a chatbot.<br />
              A cognitive instrument.
            </p>
            <div className="mt-12 text-center">
              <a href="https://buy.stripe.com/5kQdR93g8dKz7e9eTudEs0s" target="_blank" rel="noopener noreferrer">
                <Button 
                  size="lg"
                  className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
                  style={{ backgroundColor: '#0A2342' }}
                >
                  Get the Upgrade — $33
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-20 px-6 bg-gray-50 transition-all duration-700">
        <div className="container mx-auto max-w-4xl">
          <h2 
            className="text-4xl sm:text-5xl font-bold mb-12 text-center"
            style={{ color: '#0A2342' }}
          >
            Who It's For
          </h2>
          <div className="space-y-8">
            <p className="text-xl text-gray-700 leading-relaxed">
              Built for the top 20% of operators who don't just use AI —<br />
              they think with it.
            </p>
            <ul className="space-y-3 text-xl text-gray-700 mt-6">
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>Strategic founders & CEOs</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>High-end consultants</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>Executive & performance coaches</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#0A2342' }}>•</span>
                <span>Systems thinkers & polymaths</span>
              </li>
            </ul>
            <p className="text-xl text-gray-700 leading-relaxed mt-8">
              If clarity is your competitive advantage, this upgrade protects it and amplifies it.
            </p>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-20 px-6 transition-all duration-700">
        <div className="container mx-auto max-w-4xl">
          <h2 
            className="text-4xl sm:text-5xl font-bold mb-12 text-center"
            style={{ color: '#0A2342' }}
          >
            Before → After
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl border border-gray-200">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">Before</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Slow. Verbose. Shallow. Cleanup required.
              </p>
            </div>
            <div 
              className="p-8 rounded-2xl text-white"
              style={{ backgroundColor: '#0A2342' }}
            >
              <h3 className="text-2xl font-semibold mb-4">After</h3>
              <p className="text-lg leading-relaxed opacity-90">
                Fast. Sharp. Insightful. Senior-level output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Standard Section */}
      <section className="py-20 px-6 bg-gray-50 transition-all duration-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 
            className="text-4xl sm:text-5xl font-bold mb-8"
            style={{ color: '#0A2342' }}
          >
            A New Standard of Intelligence
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Your work deserves responses that match your pace, your depth, and your precision.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mt-6">
            This upgrade brings your AI up to the level your mind already operates at — instantly.
          </p>
          <div className="mt-12">
            <a href="https://buy.stripe.com/5kQdR93g8dKz7e9eTudEs0s" target="_blank" rel="noopener noreferrer">
              <Button 
                size="lg"
                className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
                style={{ backgroundColor: '#0A2342' }}
              >
                Get the Upgrade — $33
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Promise Section */}
      <section className="py-20 px-6 transition-all duration-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 
            className="text-4xl sm:text-5xl font-bold mb-8"
            style={{ color: '#0A2342' }}
          >
            The Promise
          </h2>
          <p className="text-2xl font-light text-gray-800 leading-relaxed mb-12">
            Upgrade your AI.<br />
            Upgrade your thinking.<br />
            Eliminate the drag.
          </p>
          <a href="https://buy.stripe.com/5kQdR93g8dKz7e9eTudEs0s" target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg"
              className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
              style={{ backgroundColor: '#0A2342' }}
            >
              Get the Upgrade — $33
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 mb-16">
        <div className="container mx-auto max-w-4xl text-center">
          <a href="https://buy.stripe.com/5kQdR93g8dKz7e9eTudEs0s" target="_blank" rel="noopener noreferrer">
            <Button 
              size="lg"
              className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
              style={{ backgroundColor: '#0A2342' }}
            >
              Get the Upgrade — $33
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default AIUpgrade;
