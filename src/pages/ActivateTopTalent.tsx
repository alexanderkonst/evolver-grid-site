/**
 * ActivateTopTalent — Day 80 Wave 2.4 (Sasha 2026-05-22).
 *
 * Standalone page for the $37 Top Talent Activation product.
 * Extracted from AppleseedDisplay's "OPTION 2 — Activate" card so
 * the JOURNEY 1.5 sidequest row has a clean landing surface — no
 * surrounding $555 funnel or playbook CTAs competing for attention.
 *
 * Anatomy (matches the existing AppleseedDisplay card verbatim so
 * the visual language stays consistent across both surfaces):
 *   - Eyebrow: "If you don't want to build your business yet:"
 *   - Headline: "Find Out How to Use & Monetize Your Top Talent"
 *   - Primary CTA: "Leverage your top talent — $37" → Stripe
 *   - Tagline: "7 min ... + 6 min ..."
 *   - "Have a code?" coupon expander
 *
 * Route: /activate-top-talent (public).
 * The coupon path converges with the Stripe path on the
 * /game/me/zone-of-genius/start-here?payment=success bridge.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";
import GameShellV2 from "@/components/game/GameShellV2";
import { CTA_SMALL_CAPS_STYLE } from "@/lib/landingDesign";
import { trackCTAClick } from "@/lib/funnelAnalytics";

const STRIPE_ACTIVATE_LINK = "https://buy.stripe.com/00w6oH7wo21R41XaDedEs0H";

const ACTIVATION_COUPON_CODES = new Set([
    "guerishenko",
    "appleseed",
]);

const ActivateTopTalent = () => {
    const navigate = useNavigate();
    const [couponOpen, setCouponOpen] = useState(false);
    const [couponInput, setCouponInput] = useState("");
    const [couponError, setCouponError] = useState(false);

    const handleCouponSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const entered = couponInput.trim().toLowerCase();
        if (ACTIVATION_COUPON_CODES.has(entered)) {
            trackCTAClick("activate_coupon_redeemed", "activate_top_talent_page");
            navigate("/game/me/zone-of-genius/start-here?payment=success");
        } else {
            setCouponError(true);
        }
    };

    return (
        <GameShellV2>
            <div className="min-h-dvh flex items-center justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-2xl">
                    {/* Back affordance — quiet, top-left of the card */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="mb-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] transition-opacity duration-200 hover:opacity-100"
                        style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 600,
                            color: "var(--skin-text-muted, rgba(11,42,90,0.65))",
                            opacity: 0.8,
                        }}
                        aria-label="Back"
                    >
                        <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                        Back
                    </button>

                    {/* The card — verbatim styling pulled from
                        AppleseedDisplay's OPTION 2. Liquid-glass on
                        parchment, no border accent, generous padding. */}
                    <div
                        className="liquid-glass rounded-3xl p-6 sm:p-10 space-y-5 text-center"
                        style={{
                            border: "1px solid rgba(26,30,58,0.06)",
                        }}
                    >
                        {/* Day 80 Wave 2.5 (Sasha 2026-05-22): "If you don't
                            want to build your business yet:" eyebrow
                            removed — that framing belongs on AppleseedDisplay
                            (where the $37 sits below the $555 as an
                            alternative). On this dedicated page the user
                            is here specifically for the $37 offer; the
                            "alternative-to-something-else" frame is
                            irrelevant noise. The headline stands on its own. */}
                        <h1
                            className="leading-[1.15] tracking-[-0.005em]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                                fontWeight: 600,
                                color: "var(--skin-text-primary, #0a1628)",
                            }}
                        >
                            Find Out How to Use &amp; Monetize Your Top Talent
                        </h1>

                        <a
                            href={STRIPE_ACTIVATE_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                                trackCTAClick(
                                    "activate_click",
                                    "activate_top_talent_page",
                                )
                            }
                            className="group liquid-glass relative w-full rounded-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-base sm:text-lg font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: "var(--skin-text-primary, #0a1628)",
                                border: "1.5px solid rgba(11,42,90,0.32)",
                                textShadow:
                                    "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
                            }}
                        >
                            <span style={CTA_SMALL_CAPS_STYLE}>
                                Leverage your top talent — $37
                            </span>
                            <ArrowRight
                                aria-hidden="true"
                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 flex-shrink-0"
                            />
                        </a>

                        <p
                            className="text-xs sm:text-sm font-semibold uppercase leading-relaxed pt-1"
                            style={{
                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                letterSpacing: "0.18em",
                                color: "rgba(122, 81, 8, 0.95)",
                            }}
                        >
                            7 min of understanding the value you bring + 6 min of guided meditation to connect with your talent somatically
                        </p>

                        {/* Coupon bypass — same exceptional / testing path
                            as on AppleseedDisplay. Converges on the same
                            post-payment bridge so coupon redeemers create
                            a real account (return path). */}
                        {!couponOpen ? (
                            <button
                                type="button"
                                onClick={() => setCouponOpen(true)}
                                className="text-sm underline underline-offset-4 transition-opacity duration-200 hover:opacity-100"
                                style={{
                                    fontFamily: "'Source Serif 4', serif",
                                    fontWeight: 500,
                                    color: "var(--skin-text-muted, rgba(11,42,90,0.86))",
                                    textDecorationColor:
                                        "rgba(11,42,90,0.35)",
                                    opacity: 0.95,
                                }}
                            >
                                Have a code?
                            </button>
                        ) : (
                            <form
                                onSubmit={handleCouponSubmit}
                                className="space-y-1.5 pt-1 max-w-sm mx-auto"
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={(e) => {
                                            setCouponInput(e.target.value);
                                            if (couponError)
                                                setCouponError(false);
                                        }}
                                        autoFocus
                                        placeholder="Code"
                                        aria-label="Activation code"
                                        className="flex-1 min-w-0 rounded-full px-3.5 py-2 text-xs bg-white/70 border outline-none focus:ring-2 focus:ring-[hsla(40,70%,55%,0.45)]"
                                        style={{
                                            fontFamily: "'Source Serif 4', serif",
                                            color: "var(--skin-text-primary, #0a1628)",
                                            borderColor: couponError
                                                ? "rgba(180, 50, 50, 0.55)"
                                                : "rgba(26,30,58,0.18)",
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!couponInput.trim()}
                                        className="rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            background:
                                                "linear-gradient(135deg, hsla(40, 75%, 60%, 0.32) 0%, hsla(40, 65%, 50%, 0.18) 100%)",
                                            border: "1px solid hsla(40, 70%, 55%, 0.50)",
                                            color: "#5d4307",
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && (
                                    <p
                                        className="text-[10.5px] text-left pl-1"
                                        style={{
                                            fontFamily: "'Source Serif 4', serif",
                                            color: "rgba(180, 50, 50, 0.85)",
                                        }}
                                    >
                                        Invalid code.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </GameShellV2>
    );
};

export default ActivateTopTalent;
