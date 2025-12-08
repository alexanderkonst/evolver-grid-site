import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp, LogIn } from "lucide-react";
import { useAIBoostPurchase } from "@/hooks/use-ai-boost-purchase";
import { useAIUpgradeAccess } from "@/hooks/use-promo-access";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/5kQdR93g8dKz7e9eTudEs0s";

const AIUpgrade = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const { user, hasPurchased, isLoading, recordPurchase } = useAIBoostPurchase();
  const { hasAccess: hasPromoAccess, isLoading: promoLoading, validateAndGrantAccess } = useAIUpgradeAccess();
  
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [purchaseRecorded, setPurchaseRecorded] = useState(false);

  // Handle Stripe success redirect
  useEffect(() => {
    const handleStripeSuccess = async () => {
      const status = searchParams.get('status');
      const sessionId = searchParams.get('session_id');
      
      if (status === 'success' && user && !purchaseRecorded) {
        const success = await recordPurchase('stripe_checkout', sessionId ?? undefined);
        if (success) {
          setPurchaseRecorded(true);
          toast({
            title: "🎉 Your AI Upgrade is now active.",
            description: "Enjoy your enhanced AI experience!",
          });
          // Clean up URL params
          setSearchParams({});
        }
      }
    };

    if (!isLoading && user) {
      handleStripeSuccess();
    }
  }, [isLoading, user, searchParams, recordPurchase, purchaseRecorded, toast, setSearchParams]);

  // Redirect to install page if user has access (purchased or promo)
  useEffect(() => {
    if (!isLoading && !promoLoading && (hasPurchased || hasPromoAccess)) {
      navigate("/ai-upgrade/install");
    }
  }, [hasPurchased, hasPromoAccess, isLoading, promoLoading, navigate]);

  const handleApplyPromo = async () => {
    setPromoError("");
    
    if (!promoCode.trim()) {
      setPromoError("Please enter a promo code.");
      return;
    }

    setIsValidating(true);
    try {
      const isValid = await validateAndGrantAccess(promoCode);
      if (isValid) {
        setShowSuccessModal(true);
      } else {
        setPromoError("Invalid or expired promo code.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleModalContinue = () => {
    setShowSuccessModal(false);
    navigate("/ai-upgrade/install");
  };

  const handleGetUpgrade = () => {
    if (!user) {
      // Redirect to auth with return URL
      navigate("/auth?redirect=/ai-upgrade");
    } else {
      // Open Stripe checkout in same tab with success redirect
      window.location.href = STRIPE_CHECKOUT_URL;
    }
  };

  // Loading state
  if (isLoading || promoLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2342] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth gate - user not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
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

        <div className="pt-32 pb-20 px-6 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#0A2342' }}
            >
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 
              className="text-3xl font-bold mb-4"
              style={{ color: '#0A2342' }}
            >
              Sign in to access your AI Upgrade
            </h1>
            <p className="text-gray-600 mb-8">
              Create a free account or log in so we can remember your upgrade.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/auth?redirect=/ai-upgrade")}
                size="lg"
                className="w-full text-lg py-6 rounded-full text-white"
                style={{ backgroundColor: '#0A2342' }}
              >
                Log in / Sign up
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Locked state - user is logged in but hasn't purchased
  if (!hasPurchased && !hasPromoAccess) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
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

        {/* Hero Section - Sales Page */}
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
            <Button 
              onClick={handleGetUpgrade}
              size="lg"
              className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
              style={{ backgroundColor: '#0A2342' }}
            >
              Get the Upgrade — $33
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-600 mt-4">One-time payment · Instant access</p>

            {/* Promo Code Section */}
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
                      disabled={isValidating}
                    >
                      {isValidating ? "Validating..." : "Apply"}
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
                <Button 
                  onClick={handleGetUpgrade}
                  size="lg"
                  className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
                  style={{ backgroundColor: '#0A2342' }}
                >
                  Get the Upgrade — $33
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
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
              <Button 
                onClick={handleGetUpgrade}
                size="lg"
                className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
                style={{ backgroundColor: '#0A2342' }}
              >
                Get the Upgrade — $33
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
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
            <Button 
              onClick={handleGetUpgrade}
              size="lg"
              className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
              style={{ backgroundColor: '#0A2342' }}
            >
              Get the Upgrade — $33
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 mb-16">
          <div className="container mx-auto max-w-4xl text-center">
            <Button 
              onClick={handleGetUpgrade}
              size="lg"
              className="text-lg px-12 py-6 rounded-full shadow-lg hover:shadow-xl transition-all text-white"
              style={{ backgroundColor: '#0A2342' }}
            >
              Get the Upgrade — $33
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // User has access - redirect handled by useEffect above
  return null;
};

export default AIUpgrade;
