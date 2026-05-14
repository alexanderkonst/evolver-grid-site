import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Compass, Layers, MessageSquare } from "lucide-react";
// Day 54+ (Sasha 2026-04-28): hero medallion swapped from the legacy
// FYTT torus (logo.jpg) to the merkaba — same icon as the AI OS Space
// in the rail. Page-level visual coherence: AI OS = merkaba everywhere.
import logoImg from "@/assets/mc-merkaba.png";
import StarryBackground from "../components/StarryBackground";
import SEO from "@/components/SEO";

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

  return (
    <>
      <SEO
        title="Work With Us — AI OS"
        description="Holonic Commons. AI OS is free for everyone. The paid layer is Aleksandr's curatorship — work with us directly."
        path="/ai-os/work-with-us"
      />
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

          {/* Section intro — Day 55 (Sasha 2026-04-29): the previous
              "three paths" framing (Use / Tip / Work-with-us) conflated
              tipping with partnership and made the Productize Yourself
              Session look like the only real way to engage. Re-framed as
              three concrete partnership shapes — each with its own clear
              next step — so a visitor doesn't have to invent how to
              propose a partnership. "Use it free" + tip moved to a quiet
              footer (the main /ai-os page already carries the free-use
              story). */}
          <div className="text-center space-y-3 pt-4">
            <p className="text-[10px] tracking-[0.3em] uppercase font-medium" style={{ color: 'hsl(40 50% 75% / 0.7)' }}>Real ways to partner</p>
            <h2 className="text-2xl sm:text-3xl font-display italic font-normal" style={{ color: 'hsl(0 0% 100% / 0.94)' }}>
              Three concrete shapes.
            </h2>
            <p className="text-sm sm:text-base font-light max-w-xl mx-auto leading-relaxed" style={{ color: 'hsl(0 0% 100% / 0.72)' }}>
              Pick the one that fits. Or propose one we haven't named.
            </p>
          </div>

          <div className="grid gap-5">

            {/* Partnership I — Productize Yourself Session (1:1) */}
            <article
              className="rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01] relative"
              style={{
                background: 'linear-gradient(135deg, hsla(40, 50%, 50%, 0.12) 0%, hsla(40, 40%, 40%, 0.06) 100%)',
                border: '1px solid hsla(40, 60%, 60%, 0.3)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 32px -8px hsla(40, 60%, 50%, 0.2)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsla(40, 60%, 50%, 0.2)', border: '1px solid hsla(40, 60%, 60%, 0.3)' }}>
                  <Compass className="w-4 h-4" style={{ color: 'hsl(40 70% 75%)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] tracking-[0.25em] uppercase font-medium mb-1" style={{ color: 'hsl(40 50% 75% / 0.75)' }}>For individuals · 1:1</p>
                  <h3 className="text-lg sm:text-xl font-display italic font-normal mb-2" style={{ color: 'hsl(0 0% 100% / 0.95)' }}>
                    Productize Yourself Session
                  </h3>
                  <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'hsl(0 0% 100% / 0.78)' }}>
                    90 minutes, 1:1 with Aleksandr. Name your craft, find the business built on who you already are, leave with your first easy move. $555 with money-back guarantee.
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
                    Book a session
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>

            {/* Partnership II — Steward AI OS (commercial license + rev share) */}
            <article
              className="rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'linear-gradient(135deg, hsla(160, 40%, 40%, 0.12) 0%, hsla(170, 35%, 35%, 0.06) 100%)',
                border: '1px solid hsla(160, 45%, 55%, 0.28)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 32px -8px hsla(160, 45%, 45%, 0.18)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsla(160, 40%, 50%, 0.18)', border: '1px solid hsla(160, 45%, 60%, 0.28)' }}>
                  <Layers className="w-4 h-4" style={{ color: 'hsl(160 50% 75%)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] tracking-[0.25em] uppercase font-medium mb-1" style={{ color: 'hsl(160 40% 78% / 0.75)' }}>For builders · License + rev-share</p>
                  <h3 className="text-lg sm:text-xl font-display italic font-normal mb-2" style={{ color: 'hsl(0 0% 100% / 0.95)' }}>
                    Steward AI OS
                  </h3>
                  <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'hsl(0 0% 100% / 0.78)' }}>
                    Use AI OS commercially — embed it in your product, service, or platform. Per-deal license, no upfront fee, revenue share if you make money with it. Stewardship Agreement on request.
                  </p>
                  <a
                    href={ALEKSANDR_TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, hsla(160, 50%, 45%, 0.85) 0%, hsla(170, 45%, 38%, 0.85) 100%)',
                      color: 'hsl(160 40% 10%)',
                      boxShadow: '0 4px 16px -2px hsla(160, 50%, 40%, 0.35)',
                    }}
                  >
                    Start a license conversation
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>

            {/* Partnership III — Custom partnership (everything else, open door) */}
            <article
              className="rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:scale-[1.01]"
              style={{
                background: 'hsl(0 0% 100% / 0.04)',
                border: '1px solid hsl(0 0% 100% / 0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsla(242, 30%, 70%, 0.15)', border: '1px solid hsla(242, 30%, 70%, 0.22)' }}>
                  <MessageSquare className="w-4 h-4" style={{ color: 'hsl(242 40% 82%)' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] tracking-[0.25em] uppercase font-medium mb-1" style={{ color: 'hsl(242 30% 80% / 0.75)' }}>For everything else · Open door</p>
                  <h3 className="text-lg sm:text-xl font-display italic font-normal mb-2" style={{ color: 'hsl(0 0% 100% / 0.95)' }}>
                    Custom partnership
                  </h3>
                  <p className="text-sm font-light leading-relaxed mb-4" style={{ color: 'hsl(0 0% 100% / 0.78)' }}>
                    Co-builds, advisory, a partnership shape we haven't named yet — message us with what you have in mind. If it's a real fit we'll find it together.
                  </p>
                  <a
                    href={ALEKSANDR_TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'hsla(242, 30%, 70%, 0.18)',
                      border: '1px solid hsla(242, 30%, 70%, 0.32)',
                      color: 'hsl(242 40% 90%)',
                    }}
                  >
                    Message on Telegram
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>

          </div>

          {/* Quiet footer — free use + optional tip */}
          <div className="text-center space-y-3 pt-6 border-t" style={{ borderColor: 'hsl(0 0% 100% / 0.06)' }}>
            <p className="text-xs font-light leading-relaxed pt-6" style={{ color: 'hsl(0 0% 100% / 0.55)' }}>
              Or just use AI OS for free.{" "}
              <button
                onClick={() => navigate("/ai-os")}
                className="underline underline-offset-2 transition-colors hover:opacity-80"
                style={{ color: 'hsl(195 40% 85% / 0.85)' }}
              >
                Open the library
              </button>
              .
            </p>
            <p className="text-[11px] font-light leading-relaxed" style={{ color: 'hsl(0 0% 100% / 0.42)' }}>
              If it shifted something for you and you want to support its evolution,{" "}
              <a
                href={STRIPE_TIP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-colors hover:opacity-80"
                style={{ color: 'hsl(290 35% 80% / 0.7)' }}
              >
                leave a tip
              </a>
              {" "}— pay what feels true.
            </p>
          </div>

        </div>
      </main>
    </>
  );
};

export default Pricing;
