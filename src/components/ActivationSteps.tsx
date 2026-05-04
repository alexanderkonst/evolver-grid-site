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
import { ArrowRight, ArrowDown, Download } from "lucide-react";
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

            {/* Step 1 — See it. Day 61 (Sasha 2026-05-04 13:00):
                body tightened — "deep top talent view is now open"
                → "deep talent view is open" + dropped "now" since
                the user just unlocked it; second paragraph split
                into two short statements ("What excites you." +
                "What's been driving your best results all along.")
                so each lands on its own beat. CTA label changed
                from "Deep View of Your Top Talent" → "See you at
                your best" (Sasha's directive — more inviting,
                first-person register, less feature-y). Link target
                preserved (/game/me/zone-of-genius — Overview is the
                deep view). */}
            <section className="space-y-4 text-center">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                    style={eyebrowStyle}
                >
                    1 · See it
                </p>
                <div
                    className="space-y-4 max-w-md mx-auto text-base md:text-lg leading-relaxed"
                    style={inkPrimaryStyle}
                >
                    <p>
                        Your deep talent view is open —<br />
                        it shows how you naturally think, work, and create.
                    </p>
                    <p>
                        What excites you.
                        <br />
                        What's been driving your best results all along.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        to="/game/me/zone-of-genius"
                        className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={ctaButtonStyle}
                    >
                        <span style={{ letterSpacing: "0.02em" }}>See you at your best</span>
                        <ArrowRight
                            aria-hidden="true"
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                        />
                    </Link>
                </div>
            </section>

            {/* Step 2 — Activation. Day 61 (Sasha 2026-05-04 12:30):
                tightened from a 5-paragraph guidance block to two
                short lines per Sasha's copy. Eyebrow renamed from
                "Guided Meditation" → "Activation". The CTA "Begin
                the 6-min guided meditation" sits ABOVE the embedded
                player and smooth-scrolls to it on click — keeps
                Sasha's CTA shape (matches Step 1 + Step 3 visual
                rhythm: eyebrow → body → CTA pill) while preserving
                the player as the actual play surface below. */}
            <section className="space-y-5">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-center"
                    style={eyebrowStyle}
                >
                    2 · Activation
                </p>

                <div
                    className="space-y-4 max-w-md mx-auto text-center text-base md:text-lg leading-relaxed"
                    style={inkPrimaryStyle}
                >
                    <p>Before you press play—</p>
                    <p>Pick one sentence that felt most accurate.</p>
                </div>

                {/* Day 61 (Sasha 2026-05-04 13:00): demoted from
                    dark-glass CTA pill to plain italic text — Sasha:
                    "second CTA is redundant, make it into a text, not
                    button, and point down to the actual sound player."
                    Player is right below this line, so the pill was
                    competing visually with the play affordance. Now
                    renders as a soft italic anchor with ↓ pointing
                    down. Smooth-scroll behavior preserved (cheap, no
                    harm if player already in view). */}
                <div className="flex justify-center pt-1">
                    <a
                        href="#activation-meditation-player"
                        onClick={(e) => {
                            e.preventDefault();
                            const target = document.getElementById("activation-meditation-player");
                            if (target) {
                                target.scrollIntoView({ behavior: "smooth", block: "center" });
                            }
                        }}
                        className="group inline-flex items-center justify-center gap-1.5 text-base md:text-lg italic transition-opacity duration-200 hover:opacity-80"
                        style={inkSecondaryStyle}
                    >
                        <span>Begin the 6-min guided meditation</span>
                        <ArrowDown
                            aria-hidden="true"
                            className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-y-0.5"
                        />
                    </a>
                </div>

                <div id="activation-meditation-player">
                    <MeditationPlayer
                        src={AUDIO_SRC}
                        title="The Activation"
                    />
                </div>

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
            </section>

            {/* Step 3 — What's next? — Day 61 (Sasha 2026-05-04 12:00):
                long 5-paragraph "next step (optional)" body collapsed
                to two short lines per Sasha's pasted copy. The CTA
                shortened from "Turn your top talent into a business
                people buy" to "Turn it into a business" (the antecedent
                "it" reads cleanly given the line above frames it).
                Same target (/ignite#pricing-section) preserved. */}
            <section className="space-y-4 text-center">
                <p
                    className="text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase"
                    style={eyebrowStyle}
                >
                    3 · What's next?
                </p>
                <div
                    className="space-y-4 max-w-md mx-auto text-base md:text-lg leading-relaxed"
                    style={inkPrimaryStyle}
                >
                    <p>You're more in touch with your top talent.</p>
                    <p>
                        Use it in your work—<br />
                        or turn it into a business only you can build.
                    </p>
                </div>
                <div className="pt-2">
                    <Link
                        to="/ignite#pricing-section"
                        className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 sm:gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={ctaButtonStyle}
                    >
                        <span style={{ letterSpacing: "0.02em" }}>
                            Turn it into a business
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
