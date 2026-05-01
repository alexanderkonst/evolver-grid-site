import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
// Day 48 (Sasha): primary CTA icon switched from the ✦ glyph to the
// ignite-logo asset. Rendered small + light-opacity so it reads as a
// subtle emblem rather than dominating the pill.
import igniteLogo from "@/assets/ignite-logo.png";

/**
 * PlaybookHero — the CTAs below the landing's headline.
 *
 * Day 47 very-late-night (Sasha): THREE critical corrections.
 *
 * 1. GLASSMORPHISM ON BOTH buttons. Primary was a solid dark navy
 *    gradient pill (no glass). Now primary uses the new
 *    `liquid-glass-dark` variant — same backdrop-blur + rim as light
 *    glass, just on a dark-tinted body. Secondary keeps `liquid-glass`.
 *    Both buttons now read as "glass from the same family," primary
 *    just tinted dark.
 *
 * 2. PRIMARY CTA SHRUNK. It was `w-full` inside a `max-w-[380px]`
 *    wrapper with large padding, so the icon + label + arrow wrapped
 *    to two lines and the button felt enormous. Now auto-width,
 *    inline-flex, smaller padding, whitespace-nowrap so the label
 *    stays on one line regardless of viewport. Compact pill, matches
 *    the ChatGPT editorial mockup proportions.
 *
 * 3. Secondary also shrunk and made auto-width for visual parity
 *    with the compact primary. Still de-ranked via `font-medium` +
 *    dimmer text color (hierarchy not scale).
 *
 *   [ ✦ Find your top talent →  ]  ← primary  (liquid-glass-dark)
 *          Takes 3 minutes. No signup.
 *   [ See the exact playbook    ]  ← secondary (liquid-glass)
 */

const PlaybookHero = () => {
  const navigate = useNavigate();

  return (
    /* Day 54 (Sasha 2026-04-28): inner stack opened up to match the
       landing's breath pass. gap-2.5 → gap-4 so primary CTA, meta
       line, and secondary CTA each sit as their own beat instead of
       reading as a single tight cluster. Outer mb 3/5 → 5/7. */
    <div className="mb-5 sm:mb-7">
      <div className="flex flex-col items-center gap-4 px-4 text-center">
        {/* Primary CTA — compact glass pill. Auto-width via
            `inline-flex` + `whitespace-nowrap`. Padding reduced
            `px-6 py-4` → `px-5 py-2.5` so the button feels precise
            rather than shouting. */}
        {/* Day 48 iter 2 (Sasha, premium pass):
            - CTA label now renders in small-caps with tracked-out
              letter-spacing so "FIND YOUR TOP TALENT" reads as a
              chiseled editorial call rather than a sentence-case button.
              The serif + small-caps combination rhymes with the
              gold-embossed wordmark.
            - `cta-breath` animation class added. Subtle 3.2s gold-halo
              breath — signals "alive, waiting" without shouting. Pauses
              on hover / focus (so the button's own hover feedback is
              read cleanly). Respects prefers-reduced-motion. */}
        <button
          type="button"
          onClick={() => navigate("/zone-of-genius")}
          className={cn(
            "group liquid-glass-dark cta-breath rounded-full",
            "inline-flex items-center justify-center gap-2 sm:gap-2.5",
            // Day 48 iter 15 (Sasha): `whitespace-nowrap` retired so the
            // label can wrap cleanly on very narrow viewports if needed.
            // Padding tightened on mobile (px-4 → px-6 at sm+) so the
            // pill hugs the label without overflowing.
            "px-4 sm:px-6 py-3 max-w-full",
            "text-sm sm:text-base font-semibold",
            "transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
          )}
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
          {/* Day 48 iter 14 (Sasha): CTA emblem rotation applied as
              inline style so the cascade can't strip it. 60s linear
              infinite — the site-wide tempo. */}
          <img
            src={igniteLogo}
            alt=""
            aria-hidden="true"
            className="h-4 w-auto opacity-80 transition-opacity group-hover:opacity-100"
            style={{
              filter:
                "drop-shadow(0 0 6px rgba(244, 212, 114, 0.45))",
              animation: "gentle-spin 60s linear infinite",
              willChange: "transform",
              transformOrigin: "center",
            }}
            draggable={false}
          />
          <span
            style={{
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontSize: "0.88em",
            }}
          >
            Find your top talent
          </span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5 text-[0.95em]"
          >
            →
          </span>
        </button>

        {/* Meta line — Day 48 iter 2: small-caps editorial eyebrow.
            "TAKES 3 MINUTES · NO SIGNUP" with tracked letter-spacing
            reads as a printed dateline sitting under the CTA rather
            than as a caption. The middle dot replaces the period to
            echo the gold ornament above. */}
        <div
          className="inline-flex items-center justify-center gap-2 max-w-[460px] mt-1"
          style={{
            color: "var(--skin-text-muted-soft, rgba(26,30,58,0.6))",
            textShadow:
              "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
            fontSize: "0.68rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          <span>Free · Takes 3 minutes · No signup</span>
        </div>

        {/* Secondary — also compact glass pill, de-ranked via
            font-weight + muted text color. Auto-width so it reads as
            visually parallel to the primary rather than as a sidebar
            or full-width banner. */}
        <button
          type="button"
          onClick={() => navigate("/playbook")}
          className={cn(
            "liquid-glass rounded-full",
            "inline-flex items-center justify-center",
            "px-6 py-3 whitespace-nowrap",
            "text-base font-medium tracking-[0.01em]",
            "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-[#0a1628]/30 outline-none mt-1",
          )}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-link-secondary, rgba(26,30,58,0.85))",
            textShadow:
              "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
          }}
        >
          See the exact playbook
        </button>
      </div>
    </div>
  );
};

export default PlaybookHero;
