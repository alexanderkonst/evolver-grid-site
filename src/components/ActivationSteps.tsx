/**
 * ActivationSteps — the shared body of the activation flow.
 *
 * Day 58 (Sasha 2026-05-02). Used in two surfaces:
 *   1. /activate/welcome — post-payment (or post-coupon) landing.
 *      Wraps these steps with a "You're in." hero + orientation.
 *   2. /game/me/zone-of-genius/start-here — the in-shell "home"
 *      the user can return to anytime to complete their activation.
 *
 * Three steps:
 *   1 · Read your full profile
 *   2 · Sit with the guided meditation
 *   3 · Live from it
 *
 * One source of truth for the copy + structure. Tweak here, both
 * surfaces update.
 */
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import MeditationPlayer from "@/components/MeditationPlayer";

const eyebrowStyle: React.CSSProperties = {
    color: "rgba(122, 81, 8, 0.85)",
};

interface ActivationStepsProps {
    /** Show the closing italic line. Defaults true. */
    showFooter?: boolean;
}

export default function ActivationSteps({ showFooter = true }: ActivationStepsProps) {
    return (
        <div className="space-y-12 sm:space-y-14">
            {/* Step 1 — Read */}
            <section className="space-y-4 text-center">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                    style={eyebrowStyle}
                >
                    Step One · Read
                </p>
                <p
                    className="text-base md:text-lg leading-relaxed max-w-md mx-auto"
                    style={{
                        fontFamily: "'Source Serif 4', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        textShadow:
                            "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
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
                        <span style={{ letterSpacing: "0.02em" }}>Read your full profile</span>
                        <ArrowRight
                            aria-hidden="true"
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                        />
                    </Link>
                </div>
            </section>

            {/* Step 2 — Listen */}
            <section className="space-y-4">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-center"
                    style={eyebrowStyle}
                >
                    Step Two · Guided Meditation
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
                        textShadow:
                            "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                    }}
                >
                    As you sit with the audio, one phrase from your profile will pull at you.
                    That's the one.
                </p>
            </section>

            {/* Step 3 — Live from it */}
            <section className="space-y-3 text-center">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                    style={eyebrowStyle}
                >
                    Step Three · Live From It
                </p>
                <p
                    className="text-base md:text-lg leading-relaxed max-w-md mx-auto"
                    style={{
                        fontFamily: "'Source Serif 4', serif",
                        color: "var(--skin-text-primary, #0a1628)",
                        textShadow:
                            "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                    }}
                >
                    There's nothing to do after this. Just live from it.
                </p>
            </section>

            {showFooter && (
                <p
                    className="text-center text-sm italic leading-relaxed max-w-md mx-auto pt-2"
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: "var(--skin-link-secondary, rgba(26,30,58,0.62))",
                        textShadow:
                            "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                    }}
                >
                    Come back to these steps anytime — they're always here for you.
                </p>
            )}
        </div>
    );
}
