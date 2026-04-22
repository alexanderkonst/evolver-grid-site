import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaybookStep, Substep } from "@/data/playbookSteps";
// useStepCheckout was used by the per-step CTA block that was removed
// 2026-04-21. The commercial flow now lives at /path + /game/settings.

/**
 * StepCard — renders one of the 7 playbook steps.
 *
 * Disclosure hierarchy (per Sasha's 2026-04-16 sketch):
 *
 *   ┌─ STEP HEADER ───────────────────────────────────┐
 *   │ Step N of 7 · APPNAME                           │
 *   │ {subtitle}                                      │
 *   │                                                 │
 *   │   [ See how ▼ ]       ← step-level disclosure   │
 *   │                                                 │
 *   │   ↓ (when open) ↓                               │
 *   │                                                 │
 *   │   1 · {substep.name}                            │
 *   │       {substep.description}                     │
 *   │       [ See one proven strategy ▶ ]             │
 *   │       ↓ (when open)                             │
 *   │       ONE PROVEN STRATEGY                       │
 *   │       {substep.oneProvenStrategy}               │
 *   │                                                 │
 *   │   2 · ...                                       │
 *   │   3 · ...                                       │
 *   │                                                 │
 *   │ Transformational result · phase shift           │
 *   │ ["{step.transformationalResult}"]               │
 *   └─────────────────────────────────────────────────┘
 *
 * URL hash deep-linking (shareable links):
 *   /playbook/discover                 → all collapsed
 *   /playbook/discover#how             → "See how" open, substeps collapsed
 *   /playbook/discover#how-2           → "See how" open, substep 2 strategy open
 *
 * Opening any substep's strategy auto-opens "See how" so the deep link lands
 * on visible content.
 */

export type StepCardProps = {
  step: PlaybookStep;
};

/** Triangle button adornment with soft radial glow per step color.
 *  Chevron color uses color-mix against skin-text-primary so it lands
 *  ~40% lightness on both Aurora (mixed with deep navy) and Navy+Gold
 *  (mixed with cream — still readable on the colored tint). */
const Triangle = ({
  open,
  neonHsl,
  neonRgb,
}: {
  open: boolean;
  neonHsl: string;
  neonRgb: string;
}) => (
  <span
    aria-hidden="true"
    className="inline-flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300"
    style={{
      backgroundImage: `radial-gradient(circle at 30% 30%, rgba(${neonRgb},0.45), rgba(${neonRgb},0.08))`,
      boxShadow: open
        ? `0 0 14px -2px ${neonHsl}, 0 0 26px -6px rgba(${neonRgb},0.5)`
        : `0 0 6px -2px rgba(${neonRgb},0.4)`,
    }}
  >
    <ChevronRight
      className={cn(
        "w-3 h-3 transition-transform duration-300",
        open && "rotate-90",
      )}
      style={{
        color: `color-mix(in srgb, ${neonHsl} 55%, var(--skin-text-primary, #0a1628) 45%)`,
      }}
    />
  </span>
);

/** Substep row — number + name + description always visible (once "See how" is
 *  open). The "See one proven strategy" button reveals the short paragraph. */
const SubstepRow = ({
  substep,
  neonHsl,
  neonRgb,
  open,
  onToggle,
}: {
  substep: Substep;
  neonHsl: string;
  neonRgb: string;
  open: boolean;
  onToggle: () => void;
}) => {
  return (
    // Consistent vertical rhythm — every substep block gets the same
    // top/bottom breathing regardless of whether it has a description
    // (Sasha, 2026-04-21).
    <div className="py-4">
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.28), rgba(${neonRgb},0.08))`,
            border: `1px solid rgba(${neonRgb},0.5)`,
            // color-mix against skin-text-primary so the digit reads on
            // both light (Aurora) and dark (Navy+Gold) panels.
            color: `color-mix(in srgb, ${neonHsl} 55%, var(--skin-text-primary, #0a1628) 45%)`,
            boxShadow: `0 0 10px -4px rgba(${neonRgb},0.5)`,
          }}
        >
          {substep.number}
        </div>
        <div className="flex-1 pt-1 space-y-3">
          {/* ══ Substep name — skin-aware text + halo */}
          <h3
            className="text-base sm:text-lg font-semibold leading-snug"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
            }}
          >
            {substep.name}
          </h3>

          {/* ══ Description — skin-aware muted body */}
          {substep.description && (
            <p
              className="text-sm sm:text-[15px] leading-relaxed"
              style={{ color: "var(--skin-text-body, rgba(26,30,58,0.78))" }}
            >
              {substep.description}
            </p>
          )}

          {/* ══ Recommended How-To button — keeps the step's rainbow
              neon hue in BOTH skins (methodological signature per Sasha's
              rule: "the seven round steps keep the colors they have").
              Text color uses color-mix with skin text-primary so it
              stays readable on either light or dark panel. */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "inline-flex items-center gap-2 py-2 px-4 rounded-full",
                "text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-semibold",
                "transition-all duration-300 hover:scale-[1.02]",
                "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
              )}
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.22), rgba(${neonRgb},0.08))`,
                border: `1px solid rgba(${neonRgb},0.45)`,
                color: `color-mix(in srgb, ${neonHsl} 55%, var(--skin-text-primary, #0a1628) 45%)`,
                boxShadow: open ? `0 0 18px -4px ${neonHsl}` : "none",
              }}
              aria-expanded={open}
            >
              <Triangle open={open} neonHsl={neonHsl} neonRgb={neonRgb} />
              <span>Recommended How-To</span>
            </button>
          </div>

          {/* ══ One Proven Strategy reveal — strategy prose uses skin
              body text so it reads cream on Navy+Gold and dark navy
              on Aurora. Container tint is step-colored (rainbow intact). */}
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity] duration-500 ease-out",
              open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.1), rgba(${neonRgb},0.03))`,
                border: `1px solid rgba(${neonRgb},0.25)`,
              }}
            >
              <p
                className="text-sm sm:text-[15px] leading-relaxed"
                style={{ color: "var(--skin-text-strong, rgba(26,30,58,0.88))" }}
              >
                {substep.oneProvenStrategy}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Separator lines between substeps removed 2026-04-21 per Sasha —
          vertical rhythm alone carries the structure. */}
    </div>
  );
};

// ───── Step 2 Essay — "The Secret to Productizing Yourself" ─────
// Day 47 iter 8 (Sasha): editorial pass. Previous version played with the
// font too much — jumping sizes, weights, italics, colors, and line-heights
// across paragraphs. Replaced with one consistent editorial voice:
//   • one font for body (Source Serif 4)
//   • one color (#0a1628, dark navy)
//   • one size (text-base sm:text-[17px])
//   • one line-height (leading-relaxed)
//   • no italics on paragraphs
//   • no colored inline emphasis — Sasha's natural uppercase (HOW, CRISP
//     SPECIFICITY, YOU, PRECISE, RARE) carries the emphasis in the language
//     itself, doesn't need CSS on top
// The only visual offset is the example (left-rule) and the numbered list.
// Links reduced to "1" and "2" — the tool names are not promoted. Third
// tool (Kawtar) removed entirely per Sasha.
const Step2Essay = (_: { neonHsl: string; neonRgb: string }) => {
  const bodyStyle: React.CSSProperties = {
    color: "var(--skin-text-primary, #0a1628)",
    fontFamily: "'Source Serif 4', Georgia, serif",
  };

  const linkStyle: React.CSSProperties = {
    color: "var(--skin-link-color, #0a1628)",
    textDecoration: "underline",
    textDecorationThickness: "1px",
    textUnderlineOffset: "3px",
    fontWeight: 600,
  };

  // Day 47 very-late-night (Sasha): Two CRITICAL fixes for this essay.
  // (1) Restored the missing sentences — "Startup Influencers say
  //     'Productize yourself'." and "Social media influencers say
  //     'monetize who you are', 'build your authentic brand'." — which
  //     had been silently cut in an earlier revision. They are the two
  //     bookends of the "nobody tells you HOW" opener alongside
  //     personality tests. Without them the essay opens on personality
  //     tests alone, which misrepresents the field.
  // (2) Spacing unified with `space-y-5` on the parent. Previous version
  //     mixed mb-3 / mb-5 / mb-8 per paragraph, which read as jumpy
  //     rhythm. Now every paragraph has the same vertical breathing —
  //     the blockquote example, the list, and the links all inherit the
  //     same 1.25rem (~20px) gap between blocks.
  return (
    <section
      id="step-2-essay"
      aria-label="The Secret to Productizing Yourself"
      className="mb-10 max-w-2xl mx-auto text-base sm:text-[17px] leading-relaxed space-y-5"
      style={bodyStyle}
    >
      {/* ── Title ── */}
      <h2
        className="text-xl sm:text-2xl md:text-3xl font-semibold leading-[1.25] text-center"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "var(--skin-text-primary, #0a1628)",
          textShadow:
            "var(--skin-text-halo-subtle, 0 1px 2px rgba(255,255,255,0.7))",
        }}
      >
        The Secret to Productizing Yourself
      </h2>

      {/* Three "they don't tell us HOW" bookends — startup influencers,
          personality tests, social media influencers. All three restored. */}
      <p>Startup Influencers say "Productize yourself".</p>

      <p>
        Personality tests give you unmonetizable "too long didn't read" reports. You go "so now what?" and archive it in your inbox foreva.
      </p>

      <p>
        Social media influencers say "monetize who you are", "build your authentic brand".
      </p>

      <p>They don't tell us HOW. They hand us frustrating fluff.</p>

      <p>
        The catch is that there is a looong way from the vague "I help people to get better results in life and business" to a 9/10 CRISP SPECIFICITY of what you do.
      </p>

      {/* Example — minimal left-rule offset, no font change.
          Rule color skin-aware: dark-navy on Aurora, warm gold on Navy+Gold. */}
      <p
        className="pl-4 border-l"
        style={{
          borderColor: "var(--skin-rule-strong, rgba(26,30,58,0.25))",
        }}
      >
        Let me share my example at ~10/10 precision: I assist conscious aspiring impact founders turn their top talent into a growing scalable business in flow.
      </p>

      <p>
        It is sufficiently SPECIFIC, which then makes my entire business offer a laser beam that has this same specificity.
      </p>

      <p>
        This level of clarity pulls in highly aligned clients, and repels others.
      </p>

      <p>So how do YOU get YOUR top talent to sufficient PRECISION?</p>

      <p>Here is the secret.</p>

      <p>The top talent reveal on this page gets you to ~7/10.</p>

      <p>
        You must reach 9/10 resonance (or higher) to productize yourself.
      </p>

      <p>How do people get there?</p>

      <p>They do years of focused introspection, and iteration on the wording.</p>

      <p>That's what I did.</p>

      <p>Is there a shortcut?</p>

      <p>Yes indeed.</p>

      <p>I know two.</p>

      <ol className="list-decimal list-outside ml-6 space-y-2">
        <li>You get guidance from someone who has reached 9.9+ precision for themselves and shares it with others.</li>
        <li>You use a high-precision purpose-discovery tool. Or both.</li>
      </ol>

      <p>
        Truth is, such guides or tools are still EXTREMELY RARE as of 2026.
      </p>

      <p>
        The method I developed and refined over the last six years gets you there in about 40 minutes.
      </p>

      <p>
        I only know a couple of other tools that I dare recommend:{" "}
        <a href="https://talentq.me/" target="_blank" rel="noreferrer noopener" style={linkStyle}>1</a>
        ,{" "}
        <a href="https://www.evolution.life/" target="_blank" rel="noreferrer noopener" style={linkStyle}>2</a>
        .
      </p>

      {/* Day 48 (Sasha): three purpose coaches to work with. Paul + John
          links open WhatsApp with a pre-composed intro message; Kawtar
          goes straight to LinkedIn. No names surfaced — consistent with
          how the tools above are rendered as anonymous numbered links. */}
      <p>
        You could work with a purpose coach too, I'd recommend:{" "}
        <a
          href="https://wa.me/13018733135?text=Hi%20Paul%2C%20Aleksandr%20recommended%20you%20as%20a%20purpose%20coach%20I%20can%20work%20with.%20What%27s%20the%20best%20way%20to%20engage%20with%20you%3F"
          target="_blank"
          rel="noreferrer noopener"
          style={linkStyle}
        >
          1
        </a>
        ,{" "}
        <a
          href="https://wa.me/447771911220?text=Hi%20John%2C%20Aleksandr%20recommended%20you%20as%20a%20purpose%20coach%20I%20can%20work%20with.%20What%27s%20the%20best%20way%20to%20engage%20with%20you%3F"
          target="_blank"
          rel="noreferrer noopener"
          style={linkStyle}
        >
          2
        </a>
        ,{" "}
        <a
          href="https://www.linkedin.com/in/kawtar-mahdaoui-a3337810a/"
          target="_blank"
          rel="noreferrer noopener"
          style={linkStyle}
        >
          3
        </a>
        .
      </p>

      <p>I wish these were commonplace but they are not.</p>
    </section>
  );
};

// ───── Hash parsing (deep-link support) ─────
// #how             → see-how open
// #how-1 / #how-2 / #how-3  → see-how open + that substep's strategy open
const HASH_RE = /^#how(?:-(\d+))?$/;
const parseHash = (raw: string): { seeHow: boolean; substep: number | null } => {
  const m = HASH_RE.exec(raw);
  if (!m) return { seeHow: false, substep: null };
  const n = m[1] ? Number.parseInt(m[1], 10) : null;
  return { seeHow: true, substep: n };
};

const StepCard = ({ step }: StepCardProps) => {
  // Step-level "See how" is gone (Sasha, 2026-04-21) but seeHowOpen is kept
  // as a compat flag — always true — in case hash-based deep links reference it.
  const [seeHowOpen, setSeeHowOpen] = useState(true);
  // Substep-level "Recommended How-To" — all CLOSED by default so the three
  // substeps read cleanly first. User opens what they want to explore.
  const [openSubsteps, setOpenSubsteps] = useState<Set<number>>(new Set());

  // Re-seed state whenever the step slug changes (navigating 1 → 2 → …)
  // Default: all substep strategies closed. Hash #how-N opens that one.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { substep } = parseHash(window.location.hash);
    setSeeHowOpen(true);
    setOpenSubsteps(
      substep !== null && step.substeps.some((s) => s.number === substep)
        ? new Set([substep])
        : new Set(),
    );

    const onHashChange = () => {
      const { substep: ss } = parseHash(window.location.hash);
      if (ss !== null && step.substeps.some((s) => s.number === ss)) {
        setOpenSubsteps((prev) => {
          const next = new Set(prev);
          next.add(ss);
          return next;
        });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [step.slug, step.substeps]);

  const writeHash = (seeHow: boolean, lastOpenSubstep: number | null) => {
    if (typeof window === "undefined") return;
    const bare = `${window.location.pathname}${window.location.search}`;
    if (!seeHow) {
      window.history.replaceState(null, "", bare);
    } else if (lastOpenSubstep !== null) {
      window.history.replaceState(null, "", `${bare}#how-${lastOpenSubstep}`);
    } else {
      window.history.replaceState(null, "", `${bare}#how`);
    }
  };

  const toggleSeeHow = () => {
    setSeeHowOpen((prev) => {
      const next = !prev;
      // Closing "See how" also collapses every substep.
      if (!next) setOpenSubsteps(new Set());
      writeHash(
        next,
        next && openSubsteps.size ? Math.max(...openSubsteps) : null,
      );
      return next;
    });
  };

  const toggleSubstep = (substepNumber: number) => {
    // Opening any substep auto-opens "See how" so the content is visible.
    setOpenSubsteps((prev) => {
      const next = new Set(prev);
      if (next.has(substepNumber)) next.delete(substepNumber);
      else next.add(substepNumber);
      const seeHowNext = seeHowOpen || next.size > 0;
      setSeeHowOpen(seeHowNext);
      writeHash(
        seeHowNext,
        next.size ? Math.max(...next) : null,
      );
      return next;
    });
  };

  return (
    <article
      className="relative rounded-3xl p-6 sm:p-10 transition-all duration-500 liquid-glass-strong"
    >
      {/* ══ STEP HEADER — Day 47 iter 5 (Sasha): "purple too faint" fix.
          Previous approach used a `neonHsl → #0a1628 → neonHsl` gradient
          bg-clipped to the text. At small sizes the navy center dominated
          and the step color barely read. New approach: SOLID darkened
          step color (via color-mix with navy) + neon text-shadow glow in
          the step's hue. Letter fills with readable ink, glow provides
          the neon aura. No more bg-clip gymnastics. */}
      <header className="mb-8">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-[1.15]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow:
              "var(--skin-text-halo-subtle, 0 0 18px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.75))",
          }}
        >
          <span
            style={{
              // Step color blended with skin-text-primary so it stays
              // readable on either light (Aurora) or dark (Navy+Gold) panel.
              color: `color-mix(in srgb, ${step.neonHsl} 55%, var(--skin-text-primary, #0a1628) 45%)`,
              textShadow: `0 0 14px rgba(${step.neonRgb}, 0.45), 0 0 3px rgba(${step.neonRgb}, 0.55), var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))`,
            }}
          >
            Step {step.number}.
          </span>{" "}
          {step.subtitle}
        </h1>
      </header>

      {/* ══ CONTENT — Day 47 iter 6 (Sasha): Step 2 is special. Instead of
          three substeps + dropdowns, it renders a single long-form essay
          ("The Secret to Productizing Yourself"). All other steps keep the
          three-substep structure. */}
      {step.number === 2 ? (
        <Step2Essay neonHsl={step.neonHsl} neonRgb={step.neonRgb} />
      ) : (
        <section
          id={`step-${step.number}-substeps`}
          aria-label="Substeps"
          className="mb-10"
        >
          {step.substeps.map((ss) => (
            <SubstepRow
              key={ss.number}
              substep={ss}
              neonHsl={step.neonHsl}
              neonRgb={step.neonRgb}
              open={openSubsteps.has(ss.number)}
              onToggle={() => toggleSubstep(ss.number)}
            />
          ))}
        </section>
      )}

      {/* The "Here's your result" + CTA + "Pay as you progress" block was
          removed 2026-04-21 per Sasha — every step's substeps stand alone.
          Commercial layer lives on /path, not inside each step card. */}
    </article>
  );
};

export default StepCard;
