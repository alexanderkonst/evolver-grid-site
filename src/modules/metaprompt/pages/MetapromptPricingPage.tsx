import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Zap, Building2, Crown, Loader2, Settings } from "lucide-react";
import logoImg from "../assets/logo.jpg";
import StarryBackground from "../components/StarryBackground";
import { useMetapromptAuth as useAuth } from "../hooks/useMetapromptAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const PLANS = [
  {
    id: "personal-monthly",
    name: "Personal",
    period: "Monthly",
    price: "$12",
    interval: "/mo",
    description: "For individual use — supercharge your own AI sessions.",
    badge: null,
    features: [
      "All Fusion prompts (one-paste suite activations)",
      "Ultimate AI Upgrade",
      "Early access to new releases",
      "Community chat & introductions",
      "AI-powered collaborative platform access",
    ],
    cta: "Start Personal Monthly",
    accent: "hsl(242 40% 70%)",
    planType: "personal",
  },
  {
    id: "personal-yearly",
    name: "Personal",
    period: "Yearly",
    price: "$99",
    interval: "/yr",
    description: "Same power, two months free.",
    badge: "Save $45",
    features: [
      "Everything in Personal Monthly",
      "2 months free (vs monthly)",
      "Priority access to new prompts",
      "Community chat & introductions",
      "AI-powered collaborative platform access",
    ],
    cta: "Start Personal Yearly",
    accent: "hsl(242 40% 70%)",
    planType: "personal",
  },
  {
    id: "commercial-monthly",
    name: "Commercial",
    period: "Monthly",
    price: "$39",
    interval: "/mo",
    description: "Licensed for client work, teams, and commercial projects.",
    badge: null,
    features: [
      "Everything in Personal",
      "Commercial use license",
      "Use in client deliverables",
      "Team onboarding support",
      "Priority support",
    ],
    cta: "Start Commercial Monthly",
    accent: "hsl(290 30% 70%)",
    planType: "commercial",
  },
  {
    id: "commercial-yearly",
    name: "Commercial",
    period: "Yearly",
    price: "$349",
    interval: "/yr",
    description: "Full commercial power, best value.",
    badge: "Save $119",
    features: [
      "Everything in Commercial Monthly",
      "2+ months free (vs monthly)",
      "Dedicated onboarding call",
      "Early beta access to platform features",
      "Priority support",
    ],
    cta: "Start Commercial Yearly",
    accent: "hsl(290 30% 70%)",
    planType: "commercial",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const { user, subscription, subscriptionLoading } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async (planId: string) => {
    if (!user) {
      navigate("/ai-os/auth");
      return;
    }
    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to open subscription management", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const isCurrentPlan = (plan: typeof PLANS[0]) => {
    if (!subscription?.subscribed) return false;
    const periodMatch = plan.period.toLowerCase() === subscription.period;
    return subscription.plan_type === plan.planType && periodMatch;
  };

  return (
    <>
      <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(180deg, rgba(30,67,116,0.35) 0%, rgba(44,49,80,0.55) 50%, rgba(0,0,0,0.85) 100%)' }} />
      <StarryBackground />

      <main className="relative z-10 min-h-screen w-full flex justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-5xl space-y-12">

          {/* Header */}
          <header className="text-center space-y-4">
            <button
              onClick={() => navigate("/ai-os")}
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 mb-6"
              style={{
                background: 'hsl(0 0% 100% / 0.06)',
                border: '1px solid hsl(0 0% 100% / 0.1)',
                color: 'hsl(0 0% 100% / 0.6)',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to prompts
            </button>
            <div className="flex justify-center mb-4">
              <img
                src={logoImg}
                alt="Metaprompts logo"
                className="w-14 h-14 rounded-full object-cover"
                style={{
                  boxShadow: '0 0 30px rgba(132,96,234,0.3)',
                  border: '1px solid hsl(0 0% 100% / 0.12)',
                }}
              />
            </div>
            <h1
              className="font-display italic font-normal tracking-[-0.04em]"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(242 40% 90%) 50%, hsl(290 30% 88%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Unlock the full stack
            </h1>
            <p className="text-sm font-light max-w-md mx-auto" style={{ color: 'hsl(0 0% 100% / 0.6)' }}>
              Fusion prompts, Ultimate AI Upgrade, early access, and a community of people who actually use AI well.
            </p>
            <p className="text-[11px] font-light" style={{ color: 'hsl(0 0% 100% / 0.4)' }}>
              Personal = your own use only · Commercial = client work & teams
            </p>

            {/* Subscription status bar */}
            {subscription?.subscribed && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{
                  background: 'hsl(142 40% 40% / 0.2)',
                  border: '1px solid hsl(142 40% 50% / 0.3)',
                  color: 'hsl(142 40% 75%)',
                }}>
                  ✓ Active {subscription.plan_type === 'commercial' ? 'Commercial' : 'Personal'} plan
                </span>
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'hsl(0 0% 100% / 0.06)',
                    border: '1px solid hsl(0 0% 100% / 0.12)',
                    color: 'hsl(0 0% 100% / 0.7)',
                  }}
                >
                  {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Settings className="w-3 h-3" />}
                  Manage
                </button>
              </div>
            )}
          </header>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => {
              const current = isCurrentPlan(plan);
              return (
                <div
                  key={plan.id}
                  className="relative rounded-2xl p-6 flex flex-col transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: current ? 'hsl(142 30% 20% / 0.15)' : 'hsl(0 0% 100% / 0.04)',
                    border: current ? '1px solid hsl(142 40% 50% / 0.3)' : '1px solid hsl(0 0% 100% / 0.08)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {current && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
                      style={{
                        background: 'hsl(142 40% 45%)',
                        color: 'hsl(0 0% 100%)',
                      }}
                    >
                      Your Plan
                    </span>
                  )}
                  {!current && plan.badge && (
                    <span
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full"
                      style={{
                        background: plan.accent,
                        color: 'hsl(0 0% 8%)',
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      {plan.name === "Commercial" ? (
                        <Building2 className="w-4 h-4" style={{ color: plan.accent }} />
                      ) : (
                        <Crown className="w-4 h-4" style={{ color: plan.accent }} />
                      )}
                      <span className="text-xs font-medium tracking-wider uppercase" style={{ color: plan.accent }}>
                        {plan.name}
                      </span>
                    </div>
                    <p className="text-[10px] font-light uppercase tracking-widest" style={{ color: 'hsl(0 0% 100% / 0.4)' }}>
                      {plan.period}
                    </p>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-light" style={{ color: 'hsl(0 0% 100% / 0.9)' }}>
                      {plan.price}
                    </span>
                    <span className="text-sm font-light" style={{ color: 'hsl(0 0% 100% / 0.4)' }}>
                      {plan.interval}
                    </span>
                  </div>

                  <p className="text-xs font-light leading-relaxed mb-6" style={{ color: 'hsl(0 0% 100% / 0.55)' }}>
                    {plan.description}
                  </p>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.accent }} />
                        <span className="text-xs font-light leading-snug" style={{ color: 'hsl(0 0% 100% / 0.7)' }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => current ? handleManageSubscription() : handleCheckout(plan.id)}
                    disabled={loadingPlan === plan.id || (current && portalLoading)}
                    className="w-full text-center text-xs font-medium tracking-wide px-4 py-3 rounded-full transition-all duration-300 hover:scale-105 block disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: current
                        ? 'linear-gradient(135deg, hsl(142 30% 30% / 0.2) 0%, hsl(142 30% 20% / 0.1) 100%)'
                        : 'linear-gradient(135deg, hsl(0 0% 100% / 0.08) 0%, hsl(0 0% 100% / 0.03) 100%)',
                      border: current
                        ? '1px solid hsl(142 40% 50% / 0.3)'
                        : '1px solid hsl(0 0% 100% / 0.12)',
                      backdropFilter: 'blur(16px) saturate(1.4)',
                      WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
                      color: current ? 'hsl(142 40% 75%)' : plan.accent,
                      boxShadow: current
                        ? 'none'
                        : `0 4px 24px -4px ${plan.accent}25, inset 0 1px 0 hsl(0 0% 100% / 0.1)`,
                    }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {(loadingPlan === plan.id || (current && portalLoading)) ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : current ? (
                        <Settings className="w-3.5 h-3.5" />
                      ) : (
                        <Zap className="w-3.5 h-3.5" />
                      )}
                      {current ? "Manage Subscription" : plan.cta}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* FAQ / Fine print */}
          <div className="text-center space-y-3 pt-4">
            <p className="text-[11px] font-light" style={{ color: 'hsl(0 0% 100% / 0.4)' }}>
              All plans include instant access after payment · Cancel anytime · Payments via Stripe
            </p>
            <p className="text-[11px] font-light" style={{ color: 'hsl(0 0% 100% / 0.35)' }}>
              Questions? <a href="https://t.me/IntegralEvolution" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">Reach out on Telegram</a>
            </p>
          </div>

        </div>
      </main>
    </>
  );
};

export default Pricing;
