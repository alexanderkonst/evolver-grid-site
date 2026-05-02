/**
 * /activate/welcome — post-payment landing for the $37 Activation product.
 *
 * Stripe redirects customers here after successful checkout. Calm tone,
 * no celebration confetti, no "Welcome to the family!" energy. Just:
 * you're in, your profile is open, take it at your own pace.
 *
 * Day 57 (Sasha 2026-05-01).
 */
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import GameShellV2 from "@/components/game/GameShellV2";
import { trackPageView } from "@/lib/funnelAnalytics";

export default function ActivateWelcome() {
  useEffect(() => {
    document.title = "You're in — Activation unlocked";
    trackPageView('activate_welcome');
  }, []);

  return (
    <GameShellV2 hideLogo>
      <div className="relative z-10 max-w-xl mx-auto px-4 py-12 sm:py-20 text-center space-y-10">
        <h1
          className="font-medium leading-[1.1] tracking-tight"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2.4rem, 7vw, 3.5rem)',
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
          }}
        >
          You're in.
        </h1>

        <div
          className="space-y-5 max-w-md mx-auto"
          style={{
            fontFamily: "'Source Serif 4', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
          }}
        >
          <p className="text-lg md:text-xl leading-relaxed" style={{ fontWeight: 500 }}>
            Your full profile is open.
          </p>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.82))" }}
          >
            This is where your pattern starts to show itself more clearly —
            not just in how you think, but in how you actually work.
          </p>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.82))" }}
          >
            Take it at your own pace.
          </p>
        </div>

        <div className="pt-4">
          <Link
            to="/game/me"
            className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
              backgroundImage:
                "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
              boxShadow:
                "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
              textShadow:
                "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
            }}
          >
            <span style={{ letterSpacing: '0.02em' }}>See your profile</span>
            <ArrowRight
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
            />
          </Link>
        </div>
      </div>
    </GameShellV2>
  );
}
