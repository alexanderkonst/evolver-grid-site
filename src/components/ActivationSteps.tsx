/**
 * ActivationSteps — the shared body of the activation flow.
 *
 * Day 58 (Sasha 2026-05-02 evening): copy fully rewritten per Sasha's
 * new spec. The flow is now THREE MOVES:
 *   1 · Read    — open the profile
 *   2 · Listen  — sit with the meditation, anchored to the one
 *                 sentence the user already paused on
 *   3 · Next step (optional) — soft sales CTA toward the
 *                 "Build a business" Top Talent Business Session
 *
 * Used in two surfaces:
 *   • /game/me/zone-of-genius/start-here — the in-shell home the
 *     user can return to anytime. Wraps with the perspective-view
 *     header (title + subtitle + ornament).
 *   • /activate/welcome — legacy post-payment redirect target;
 *     redirects to /start-here per Sasha's Day-58 routing change.
 *     The page itself is no longer rendered standalone, but the
 *     shared component remains the source of truth in case we
 *     restore a standalone page later.
 */
import { ArrowRight, Download } from "lucide-react";
import { Link } from "react-router-dom";
import MeditationPlayer from "@/components/MeditationPlayer";

const AUDIO_SRC = "/audio/activation-meditation.mp3";

const eyebrowStyle: React.CSSProperties = {
    color: "rgba(122, 81, 8, 0.85)",
};

const inkPrimaryStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    color: "var(--skin-text-primary, #0a1628)",
    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
};

const inkSecondaryStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', serif",
    color: "var(--skin-link-secondary, rgba(26,30,58,0.82))",
    textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
};

const ctaButtonStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
    backgroundImage:
        "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
    boxShadow:
        "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
    textShadow:
        "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
};

interface ActivationStepsProps {
    /** Show "Let's begin." preface above the steps. Defaults true. */
    showHeading?: boolean;
}

export default function ActivationSteps({ showHeading = true }: ActivationStepsProps) {
    return (
        <div className="space-y-12 sm:space-y-14">
            {showHeading && (
                <div className="text-center space-y-3">
                    <p
                        className="text-2xl sm:text-3xl font-medium leading-tight"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--skin-text-primary, #0a1628)",
                            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                        }}
                    >
                        Let's begin.
                    </p>
                    <p
                        className="text-base md:text-lg leading-relaxed"
                        style={inkSecondaryStyle}
                    >
                        Three moves.
                    </p>
                </div>
            )}

            {/* Step 1 — Read */}
            <section className="space-y-4 text-center">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                    style={eyebrowStyle}
                >
                    1 · Read
                </p>
                <p
                    className="text-base md:text-lg leading-relaxed max-w-md mx-auto"
                    style={inkPrimaryStyle}
                >
                    Your full profile is open —<br />
                    pattern, language, edges, the way you actually work.
                </p>
                <div className="pt-2">
                    <Link
                        to="/game/me/zone-of-genius"
                        className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={ctaButtonStyle}
                    >
                        <span style={{ letterSpacing: "0.02em" }}>Read your profile</span>
                        <ArrowRight
                            aria-hidden="true"
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                        />
                    </Link>
                </div>
            </section>

            {/* Step 2 — Guided Meditation. Day 58 (Sasha 2026-05-02
                late): renamed from "Listen" to "Guided Meditation" so
                the user knows exactly what they're sitting with — no
                ambiguity about whether this is music, a podcast, or
                something else. Removes a small but real friction. */}
            <section className="space-y-5">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-center"
                    style={eyebrowStyle}
                >
                    2 · Guided Meditation
                </p>

                <MeditationPlayer
                    src={AUDIO_SRC}
                    title="The Activation"
                />

                {/* Download button — Day 58 (Sasha 2026-05-02 late):
                    let people take the meditation with them. Native
                    <a download> attribute triggers a download instead
                    of in-tab playback. Subtle, sits right under the
                    player so the path is obvious without competing
                    with the play affordance above. */}
                <div className="flex justify-center pt-1">
                    <a
                        href={AUDIO_SRC}
                        download="activation-meditation.mp3"
                        className="group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] uppercase tracking-[0.18em] font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            color: "rgba(122, 81, 8, 0.85)",
                            background: "rgba(244, 212, 114, 0.10)",
                            border: "0.5px solid rgba(212, 175, 55, 0.35)",
                        }}
                    >
                        <Download className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                        <span>Download audio</span>
                    </a>
                </div>

                <div
                    className="space-y-4 max-w-md mx-auto text-center pt-2 text-sm md:text-base leading-relaxed"
                    style={inkPrimaryStyle}
                >
                    <p>Before you press play, go back to your profile.</p>
                    <p>
                        Find the one sentence that made you pause —<br />
                        the one that felt like <em>"that's me."</em>
                    </p>
                    <p>Bring that sentence with you into the audio.</p>
                    <p>
                        During the activation, you'll return to it —<br />
                        and step into the feeling of what it's like to live it.
                    </p>
                    <p style={inkSecondaryStyle} className="italic pt-1">
                        No need to analyze anything. Just follow it.
                    </p>
                </div>
            </section>

            {/* Step 3 — Next step (optional) */}
            <section className="space-y-4 text-center">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                    style={eyebrowStyle}
                >
                    3 · Next step (optional)
                </p>
                <div
                    className="space-y-4 max-w-md mx-auto text-base md:text-lg leading-relaxed"
                    style={inkPrimaryStyle}
                >
                    <p>
                        If that sentence felt true, you now have something most people never get:
                    </p>
                    <p style={{ fontWeight: 500 }}>
                        A clear articulation of what you do — in a way people recognize.
                    </p>
                    <p style={inkSecondaryStyle}>That's what people pay for.</p>
                    <p style={inkSecondaryStyle} className="italic pt-1">
                        If you want to take the next step:
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        to="/ignite#pricing-section"
                        className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={ctaButtonStyle}
                    >
                        <span style={{ letterSpacing: "0.02em" }}>
                            Turn your top talent into a business people buy
                        </span>
                        <ArrowRight
                            aria-hidden="true"
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                        />
                    </Link>
                </div>
            </section>
        </div>
    );
}
