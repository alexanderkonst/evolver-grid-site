import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
// Day 67 (Sasha 2026-05-10): primary CTA extracted to shared
// `<EditorialCta>` component (src/components/ui/editorial-cta.tsx).
// Same pattern — rotating ignite-logo emblem, small-caps tracked label,
// → arrow, dark glass pill with breathing gold halo — sourced from one
// place so back-of-funnel surfaces (QoL empty state, etc.) inherit
// instead of inventing. Visual output identical to the previous inline
// button. Roast P22 (Scaffold Engineering as Standard).
import { EditorialCta } from "@/components/ui/editorial-cta";

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
        <EditorialCta
          label="Find your top talent"
          onClick={() => navigate("/zone-of-genius")}
        />

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
