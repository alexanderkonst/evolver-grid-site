/**
 * /activate/welcome — post-payment landing for the $37 Activation product.
 *
 * Stripe redirects customers here after successful checkout. Wraps the
 * shared <ActivationSteps /> component (one source of truth for the
 * three-step body) with a "You're in." hero. The same steps also live
 * inside the ME shell at /game/me/zone-of-genius/start-here so the user
 * can return to them anytime.
 *
 * Day 58 (Sasha 2026-05-02): refactored from inline body to use the
 * shared component; framing unified from "two beats" to "three steps."
 */
import { useEffect } from "react";
import GameShellV2 from "@/components/game/GameShellV2";
import ActivationSteps from "@/components/ActivationSteps";
import { trackPageView } from "@/lib/funnelAnalytics";

export default function ActivateWelcome() {
  useEffect(() => {
    document.title = "You're in — Activation unlocked";
    trackPageView('activate_welcome');
  }, []);

  return (
    <GameShellV2 hideLogo>
      <div className="relative z-10 max-w-xl mx-auto px-4 py-12 sm:py-20 space-y-12 sm:space-y-14">
        {/* Hero — unique to /activate/welcome (the post-payment moment) */}
        <div className="text-center space-y-8">
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
            className="space-y-4 max-w-md mx-auto"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
            }}
          >
            <p className="text-lg md:text-xl leading-relaxed" style={{ fontWeight: 500 }}>
              Three steps. Read your profile. Sit with the guided meditation. Live from it.
            </p>
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.82))" }}
            >
              Take them at your own pace.
            </p>
          </div>
        </div>

        <ActivationSteps showFooter={false} />
      </div>
    </GameShellV2>
  );
}
