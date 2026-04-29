import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, Heart, ExternalLink, Sparkles } from "lucide-react";
// Day 54+ (Sasha 2026-04-28): hero medallion swapped from the legacy
// FYTT torus (logo.jpg) to the merkaba — same icon as the AI OS Space
// in the rail. Page-level visual coherence: AI OS = merkaba everywhere.
import logoImg from "@/assets/mc-merkaba.png";
import StarryBackground from "../components/StarryBackground";

// Holonic Commons pricing page — Day 51 (Sasha 2026-04-24).
// Replaces the prior 4-tier SaaS pricing (Personal/Commercial × Monthly/Yearly).
// AI OS is now free, forever, for everyone. Aleksandr's curatorship is the paid
// layer (via FindYourTopTalent.Com session). Tip is optional (Wikipedia-style).
// Contribution rights to core are earned through trust, not money.

const STRIPE_TIP_URL = "https://buy.stripe.com/3cI00j5og8qf1TPdPqdEs0G";
// Day 51 (Sasha 2026-04-25): "Work with us" CTA (was "Work with Aleksandr"
// — Day 54+ rename) points directly to Telegram, not the FindYourTopTalent.Com
// landing. Aligned with Holonic Commons — proximity to source happens through
// real conversation.
const ALEKSANDR_TELEGRAM_URL = "https://t.me/integralevolution";

const Pricing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const prev = document.title;
    document.title = "Work with us — AI OS";
    return () => { document.title = prev; };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(180deg, rgba(30,67,116,0.35) 0%, rgba(44,49,80,0.55) 50%, rgba(0,0,0,0.85) 100%)' }} />
      <StarryBackground />

      <main className="relative z-10 min-h-screen w-full flex justify-center px-4 py-12 sm:px-6 sm:py-16">
        <div className="w-full max-w-3xl space-y-12">

          {/* Header */}
          <header className="text-center space-y-5">
            <button
              onClick={() => navigate("/ai-os")}
              className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: 'hsl(0 0% 100% / 0.06)',
                border: '1px solid hsl(0 0% 100% / 0.1)',
                color: 'hsl(0 0% 100% / 0.6)',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to AI OS
            </button>

            <div className="flex justify-center mb-3">
              {/* Day 54+ (Sasha 2026-04-28 evening): hero medallion gets the
                  same gentle-spin rotation + gold drop-shadow halo as the
                  SpacesRail icon — page-level visual coherence (the icon
                  reads as the same mark across surfaces), brand-aligned
                  glow color, and the rotation gives the medallion the
                  same "breathing object" tempo as every other ceremonial
                  geometric image on the site. Subtle: 8px @ 0.4 + 2px @
                  0.55 — present but not blasted. */}
              <img
                src={logoImg}
                alt="AI OS"
                className="w-14 h-14 rounded-full object-cover gentle-spin-always"
                style={{
                  filter:
                    'drop-shadow(0 0 8px rgba(244, 212, 114, 0.4)) drop-shadow(0 0 2px rgba(212, 175, 55, 0.55))',
                  border: '1px solid hsl(0 0% 100% / 0.12)',
                  animation: 'gentle-spin 60s linear infinite',
                  willChange: 'transform',
                  transformOrigin: 'center',
                }}
              />
            </div>

            <h1
              className="font-display italic font-normal tracking-[-0.04em] leading-[1.1]"
              style={{
                fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                background: 'linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(195 40% 90%) 50%, hsl(242 40% 88%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI OS is free.
              <br />
              Forever. For everyone.
            </h1>

          </header>

          {/* Three paths */}
          <div className="grid gap-5">

            {/* Path I — Use */}
            <article
              className="rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'hsl(0 0% 100% / 0.04)',
                border: '1px solid hsl(0 0% 100% / 0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsla(195, 35%, 70%, 0.15)' }}>
                  <Sparkles className="w-4 h-4" style={{ color: 'hsl(195 50% 80%)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] tracking-[0.25em] uppercase font-medium mb-1" style={{ color: 'hsl(195 35% 80% / 0.7)' }}>Path I · Free</p>
                  <h2 className="text-lg sm:text-xl font-display italic font-normal mb-2" style={{ color: 'hsl(0 0% 100% / 0.95)' }}>
                    Use AI OS
                  </h2>
                  <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'hsl(0 0% 100% / 0.7)' }}>
                    The OS layer for any AI. A different kind of cognition. No signup wall, no gates, no tiers — open as Wikipedia, free as Linux.
                  </p>
                  <button
                    onClick={() => navigate("/ai-os")}
                    className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'hsla(195, 35%, 70%, 0.15)',
                      border: '1px solid hsla(195, 35%, 70%, 0.25)',
                      color: 'hsl(195 50% 90%)',
                    }}
                  >
                    Open the library
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>

            {/* Path II — Tip */}
            <article
              className="rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'hsl(0 0% 100% / 0.04)',
                border: '1px solid hsl(0 0% 100% / 0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsla(290, 35%, 70%, 0.15)' }}>
                  <Heart className="w-4 h-4" style={{ color: 'hsl(290 50% 82%)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] tracking-[0.25em] uppercase font-medium mb-1" style={{ color: 'hsl(290 35% 80% / 0.7)' }}>Path II · Optional</p>
                  <h2 className="text-lg sm:text-xl font-display italic font-normal mb-2" style={{ color: 'hsl(0 0% 100% / 0.95)' }}>
                    Tip / Patronage
                  </h2>
                  <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'hsl(0 0% 100% / 0.7)' }}>
                    If AI OS shifted something for you and you want to support its evolution — leave a tip. Pay what feels true. No tier, no return obligation.
                  </p>
                  <a
                    href={STRIPE_TIP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'hsla(290, 30%, 70%, 0.15)',
                      border: '1px solid hsla(290, 30%, 70%, 0.25)',
                      color: 'hsl(290 50% 88%)',
                    }}
                  >
                    Send a tip
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>

            {/* Path III — Go Deep (the only paid path — proximity to source) */}
            <article
              className="rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01] relative"
              style={{
                background: 'linear-gradient(135deg, hsla(40, 50%, 50%, 0.12) 0%, hsla(40, 40%, 40%, 0.06) 100%)',
                border: '1px solid hsla(40, 60%, 60%, 0.3)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 32px -8px hsla(40, 60%, 50%, 0.2)',
              }}
            >
              <span
                className="absolute -top-3 left-6 text-[10px] font-semibold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, hsl(40 70% 55%) 0%, hsl(40 60% 45%) 100%)',
                  color: 'hsl(40 30% 12%)',
                }}
              >
                Go Deep
              </span>
              <div className="flex items-start gap-4 pt-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsla(40, 60%, 50%, 0.2)', border: '1px solid hsla(40, 60%, 60%, 0.3)' }}>
                  <ArrowRight className="w-4 h-4" style={{ color: 'hsl(40 70% 75%)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] tracking-[0.25em] uppercase font-medium mb-1" style={{ color: 'hsl(40 50% 75% / 0.75)' }}>Path III · Work with us</p>
                  <h2 className="text-lg sm:text-xl font-display italic font-normal mb-2" style={{ color: 'hsl(0 0% 100% / 0.95)' }}>
                    Productize Yourself Session
                  </h2>
                  <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'hsl(0 0% 100% / 0.78)' }}>
                    A consulting session inside the Find Your Top Talent path. 90 minutes to name your craft, find the business built on who you already are, and get your first easy move. The path into the first holon — where AI OS is actively shaped.
                  </p>
                  <a
                    href={ALEKSANDR_TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, hsl(40 70% 55%) 0%, hsl(40 60% 42%) 100%)',
                      color: 'hsl(40 30% 12%)',
                      boxShadow: '0 4px 16px -2px hsla(40, 70%, 50%, 0.4)',
                    }}
                  >
                    Work with us
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>

          </div>

          {/* Footer note about contribution */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-[11px] font-light max-w-md mx-auto leading-relaxed" style={{ color: 'hsl(0 0% 100% / 0.42)' }}>
              Want to contribute prompts or modules to the core of AI OS itself? Trust is earned through working with us first — that's how the holon stays coherent.
            </p>
          </div>

        </div>
      </main>
    </>
  );
};

export default Pricing;
