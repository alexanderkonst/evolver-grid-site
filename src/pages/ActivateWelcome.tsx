/**
 * /activate/welcome — post-payment landing for the $37 Activation product.
 *
 * Stripe redirects customers here after successful checkout. Two beats:
 * Beat 1 — Read your full profile. Beat 2 — Sit with the guided activation.
 * Calm tone, no celebration confetti. Just: you're in, take it at your pace.
 *
 * Day 58 (Sasha 2026-05-02). Replaces the single-CTA version from Day 57.
 */
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import GameShellV2 from "@/components/game/GameShellV2";
import MeditationPlayer from "@/components/MeditationPlayer";
import { trackPageView } from "@/lib/funnelAnalytics";

export default function ActivateWelcome() {
  useEffect(() => {
    document.title = "You're in — Activation unlocked";
    trackPageView('activate_welcome');
  }, []);

  return (
    <GameShellV2 hideLogo>
      <div className="relative z-10 max-w-xl mx-auto px-4 py-12 sm:py-20 space-y-12 sm:space-y-14">
        {/* Hero */}
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
              Two beats. Read your profile. Then sit with the guided activation.
            </p>
            <p
              className="text-base md:text-lg leading-relaxed"
              style={{ color: "var(--skin-link-secondary, rgba(26,30,58,0.82))" }}
            >
              Take both at your own pace.
            </p>
          </div>
        </div>

        {/* Beat 1 — Read */}
        <section className="space-y-4 text-center">
          <p
            className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
            style={{ color: "rgba(122, 81, 8, 0.85)" }}
          >
            Beat One · Read
          </p>
          <p
            className="text-base md:text-lg leading-relaxed max-w-md mx-auto"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
            }}
          >
            Your full profile is open — pattern, language, edges, the way you actually work.
          </p>
          <div className="pt-2">
            <Link
              to="/game/me/zone-of-genius"
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
              <span style={{ letterSpacing: '0.02em' }}>Read your full profile</span>
              <ArrowRight
                aria-hidden="true"
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
              />
            </Link>
          </div>
        </section>

        {/* Beat 2 — Listen. Day 58 (Sasha 2026-05-02): eyebrow renamed
            from "Beat Two · Listen" to "Beat Two · Guided Meditation" so
            the user knows exactly what they're about to sit with — no
            ambiguity about whether this is music, a podcast, or
            something else. Removes a small but real friction. */}
        <section className="space-y-4">
          <p
            className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-center"
            style={{ color: "rgba(122, 81, 8, 0.85)" }}
          >
            Beat Two · Guided Meditation
          </p>

          <MeditationPlayer
            src="/audio/activation-meditation.mp3"
            title="The Activation"
          />

          <p
            className="text-sm md:text-base leading-relaxed max-w-md mx-auto text-center pt-2"
            style={{
              fontFamily: "'Source Serif 4', serif",
              color: "var(--skin-link-secondary, rgba(26,30,58,0.82))",
              textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
            }}
          >
            As you sit with the audio, one phrase from your profile will pull at you.
            That's the one.
          </p>
        </section>

        {/* Footer */}
        <p
          className="text-center text-base md:text-lg leading-relaxed max-w-md mx-auto pt-2"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            color: "var(--skin-link-secondary, rgba(26,30,58,0.78))",
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
          }}
        >
          There's nothing to do after this. Just live from it.
        </p>
      </div>
    </GameShellV2>
  );
}
