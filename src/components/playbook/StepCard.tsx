import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAYBOOK_STEPS, PlaybookStep, Substep } from "@/data/playbookSteps";
import { getBuildLinksForStep } from "@/data/playbookArtifactMap";
import { UBB_ROOT } from "@/modules/unique-business-builder/constants";

/**
 * Feature gate for the Playbook → UBB cross-link section.
 * Day 51 evening (Sasha 2026-04-25): UBB module isn't tested for public
 * yet — hide the "Build these in your Builder →" block on Playbook step
 * cards until UBB is solid. Flip back to `true` to re-enable. The data
 * and the BuildTheseInBuilder component stay shipped; this is just the
 * surface visibility switch.
 */
const SHOW_UBB_BRIDGE = false;
// useStepCheckout was used by the per-step CTA block that was removed
// 2026-04-21. The commercial flow now lives at /path + /game/settings.

// Render a substep's prose with inline markdown-style links: [label](href).
// Internal hrefs (starting with /) become react-router <Link>; external
// links open in a new tab. Keeps the data layer plain strings — no JSX
// inside playbookSteps.ts.
const INLINE_LINK_RE = /(\[[^\]]+\]\([^)]+\))/g;
const SINGLE_LINK_RE = /^\[([^\]]+)\]\(([^)]+)\)$/;
const renderInlineLinks = (text: string): React.ReactNode => {
  const parts = text.split(INLINE_LINK_RE);
  return parts.map((part, i) => {
    const match = part.match(SINGLE_LINK_RE);
    if (!match) return part;
    const [, label, href] = match;
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link
          key={i}
          to={href}
          className="underline underline-offset-4 decoration-current/40 hover:decoration-current transition-colors"
        >
          {label}
        </Link>
      );
    }
    return (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 decoration-current/40 hover:decoration-current transition-colors"
      >
        {label}
      </a>
    );
  });
};

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
        <div className="flex-1 space-y-3">
          {/* ══ Substep name — skin-aware text + halo.
              Day 48 (Sasha): line-height locked to the circle's h-8 (32px)
              on the title's first line so the number badge and title baseline
              visually align across every substep. Removed the stale `pt-1`
              that was nudging the title ~1px below the circle center. */}
          <h3
            className="text-base sm:text-lg font-semibold leading-8"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
            }}
          >
            {substep.name}
          </h3>

          {/* ══ Description — skin-aware muted body.
              Day 48 (Sasha): descriptions can now carry structured text
              (intro paragraph + numbered list) by using `\n\n` as
              paragraph separators. Each paragraph renders independently. */}
          {substep.description && (
            <div
              className="text-sm sm:text-[15px] leading-relaxed space-y-2"
              style={{ color: "var(--skin-text-body, rgba(26,30,58,0.78))" }}
            >
              {substep.description.split("\n\n").map((para, i) => (
                <p key={i} style={{ whiteSpace: "pre-line" }}>
                  {para}
                </p>
              ))}
            </div>
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
                // Day 48 (Sasha, mobile polish): deeper tint + darker text
                // for contrast at small scale. Was pastel-washed on cream.
                backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.35), rgba(${neonRgb},0.14))`,
                border: `1px solid rgba(${neonRgb},0.6)`,
                color: `color-mix(in srgb, ${neonHsl} 35%, var(--skin-text-primary, #0a1628) 65%)`,
                boxShadow: open ? `0 0 18px -4px ${neonHsl}` : "none",
              }}
              aria-expanded={open}
            >
              <Triangle open={open} neonHsl={neonHsl} neonRgb={neonRgb} />
              {/* Day 51 night (Sasha 2026-04-25): label aligned to the
                  data field name. "Recommended How-To" was generic. "One
                  Proven Strategy" is what's actually behind the disclosure —
                  matches the prose register inside the reveal too. */}
              <span>One Proven Strategy</span>
            </button>
          </div>

          {/* ══ One Proven Strategy reveal — strategy prose uses skin
              body text so it reads cream on Navy+Gold and dark navy
              on Aurora. Container tint is step-colored (rainbow intact). */}
          <div
            className={cn(
              "overflow-hidden transition-[max-height,opacity] duration-500 ease-out",
              // 1600px room for the longer multi-paragraph How-Tos
              // in Steps 5 + 6 (no example cards to accommodate anymore).
              open ? "max-h-[1600px] opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div
              className="rounded-2xl p-4 sm:p-5"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(${neonRgb},0.1), rgba(${neonRgb},0.03))`,
                border: `1px solid rgba(${neonRgb},0.25)`,
              }}
            >
              <div
                className="text-sm sm:text-[15px] leading-relaxed space-y-2"
                style={{ color: "var(--skin-text-strong, rgba(26,30,58,0.88))" }}
              >
                {substep.oneProvenStrategy.split("\n\n").map((para, i) => (
                  <p key={i} style={{ whiteSpace: "pre-line" }}>
                    {renderInlineLinks(para)}
                  </p>
                ))}
              </div>
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
      <p>Startup influencers say "Productize yourself".</p>

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
        This level of clarity turned into copy specificity pulls in highly aligned clients, and repels others.
      </p>

      <p>So how do YOU get YOUR top talent to that level of specificity?</p>

      <p>Here is the secret hidden in plain sight.</p>

      {/* Day 48 (Sasha): the fluffy vs specific contrast rendered as a
          two-line structured block so the arrows read as a quick "before
          vs after" rather than two running paragraphs. */}
      <div
        className="my-1 space-y-1.5 pl-4 border-l"
        style={{
          borderColor: "var(--skin-rule-strong, rgba(26,30,58,0.25))",
        }}
      >
        <p>Fluffy self-description → fluffy target audience, and fluffy copy.</p>
        <p>Highly specific self-description → magnetizing pull.</p>
      </div>

      <p>The top talent reveal on this page gets you to ~7/10.</p>

      <p>
        In my experience of having led in transformational containers for hundreds of entrepreneurs:
      </p>

      {/* Day 48 (Sasha): THIS IS GOLD — the single most load-bearing claim
          in the essay. Rendered as a standalone callout with gold left-rule
          + elevated weight so it can't be missed. */}
      <blockquote
        className="my-2 pl-4 py-2 border-l-[3px]"
        style={{
          borderColor: "var(--skin-accent-gold, #b8860b)",
          fontSize: "1.08em",
          fontWeight: 600,
          color: "var(--skin-text-primary, #0a1628)",
        }}
      >
        people that productize themselves successfully reach 9+/10 specificity before things click.
      </blockquote>

      <p>Let this sit for a second. Does it feel true?</p>

      <p>How do people get there?</p>

      <p>
        Years of focused introspection, iterations on the wording, authentic / artistic self-expression, sudden awakenings, plant medicine, purpose coaching, years of founder journey.
      </p>

      <p>Is there a shortcut?</p>

      <p>Yes indeed.</p>

      <p>I know two.</p>

      <ol className="list-decimal list-outside ml-6 space-y-2">
        <li>You get guidance from someone who has reached 9.9+ precision for themselves and shares it with others.</li>
        <li>You use a high-precision purpose-discovery tool. Or both.</li>
      </ol>

      <p>
        Truth is, such guides or tools are still very rare as of 2026.
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
          href="https://wa.me/13018733135?text=Hi%20Paul%2C%20Aleksandr%20Konstantinov%20at%20www.FindYourTopTalent.com%20recommended%20you%20as%20a%20purpose%20coach%20I%20can%20work%20with.%20What%27s%20the%20best%20way%20to%20engage%20with%20you%3F"
          target="_blank"
          rel="noreferrer noopener"
          style={linkStyle}
        >
          1
        </a>
        ,{" "}
        <a
          href="https://wa.me/447771911220?text=Hi%20John%2C%20Aleksandr%20Konstantinov%20at%20www.FindYourTopTalent.com%20recommended%20you%20as%20a%20purpose%20coach%20I%20can%20work%20with.%20What%27s%20the%20best%20way%20to%20engage%20with%20you%3F"
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

      {/* Day 48 (Sasha): new closing that repositions the 6-year method
          after the tools+coaches list and seats the commercial ask
          naturally at the very end. "Book a session" routes to the
          pricing block on /ignite. */}
      <p>
        The method I developed and refined over the last six years gets you to a 9+/10 in about 40 minutes.
      </p>

      <p>
        Then we spend the next 160 mins turning it into a highly specific business using custom-made AI skills and templates of other founders that saw theirs.
      </p>

      <p>
        A business that has always been uniquely yours, and obvious in hindsight.
      </p>

      <p>
        <a href="/ignite#pricing-section" style={linkStyle}>
          Book a session
        </a>{" "}
        if you'd like to take the shortcut.
      </p>
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
  // Day 51 night (Sasha 2026-04-25): on initial visit (no hash), substep 1
  // auto-opens so a first-time DIY reader sees the actual prompt / method
  // immediately instead of a row of empty pills. The Open Blueprint
  // Paradox: prove the method is real in the first 5 seconds of reading.
  // Hash #how-N still wins (deep links land on the requested substep).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { substep } = parseHash(window.location.hash);
    setSeeHowOpen(true);
    setOpenSubsteps(
      substep !== null && step.substeps.some((s) => s.number === substep)
        ? new Set([substep])
        : new Set([1]),
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
      {/* ══ STEP HEADER — Day 48 (Sasha): FLIPPED emphasis. Previously
          "Step N." carried the neon step color and the name was plain
          ink. That put the weight on the ordinal (which is just scaffolding)
          instead of the name of the step (which is the substance). Now
          "Step N:" renders in plain skin-text-primary (functionally black
          on light skins) and the subtitle carries the step's neon color
          + glow. Colon instead of period per Sasha. */}
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
          Step {step.number}:{" "}
          <span
            style={{
              // Step color blended with skin-text-primary so it stays
              // readable on either light (Aurora) or dark (Navy+Gold) panel.
              color: `color-mix(in srgb, ${step.neonHsl} 55%, var(--skin-text-primary, #0a1628) 45%)`,
              textShadow: `0 0 14px rgba(${step.neonRgb}, 0.45), 0 0 3px rgba(${step.neonRgb}, 0.55), var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))`,
            }}
          >
            {step.subtitle}
          </span>
        </h1>

        {/* ══ Day 51 night (Sasha 2026-04-25): outcome-before-route.
            transformationalResult was sitting in the data unused. Now
            it renders right under the step title as the user-voice
            promise — italic, step-tinted left rule, modest size so it
            reads as a quiet "this is what you'll be able to say after"
            rather than a CTA-shouting block. */}
        <p
          className="mt-3 sm:mt-4 pl-4 italic text-base sm:text-lg leading-snug"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            color: "var(--skin-text-strong, rgba(26,30,58,0.88))",
            borderLeft: `2px solid ${step.neonHsl}`,
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
          }}
        >
          By the end:{" "}
          <span style={{ color: "var(--skin-text-primary, #0a1628)" }}>
            &ldquo;{step.transformationalResult}&rdquo;
          </span>
        </p>
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

      {/* ══ BUILD THESE — Day 51 (Sasha 2026-04-25): bridge from Playbook
          step to UBB artifacts. The Playbook tells you WHAT to build at
          this stage; UBB is WHERE you build it. Steps with no mapped
          artifacts (DISCOVER/PACKAGE/TEST/SCALE) skip this block entirely
          — that's intentional, not an omission.

          Day 51 evening (Sasha 2026-04-25): GATED OFF for now. UBB
          module isn't beta-tested for public yet — Sasha doesn't want
          people discovering it from Playbook until it's solid. Flip
          SHOW_UBB_BRIDGE to true when UBB is ready to launch. The
          reverse chips on /ubb Canvas (STEP N · APPNAME → Playbook)
          are intentionally LEFT visible — they only render for users
          who already found UBB, so they don't expose anything. */}
      {SHOW_UBB_BRIDGE && <BuildTheseInBuilder step={step} />}

      {/* ══ UP NEXT — Day 51 night (Sasha 2026-04-25): pulls the reader
          through the playbook. For step N < 7, teases step N+1. For step 7,
          loops back to "Now go walk it" → /zone-of-genius. Subtle, not a
          shouting CTA — the page has its own forkability footer below. */}
      <UpNext step={step} />

      {/* The "Here's your result" + CTA + "Pay as you progress" block was
          removed 2026-04-21 per Sasha — every step's substeps stand alone.
          Commercial layer lives on /path, not inside each step card. */}
    </article>
  );
};

// ───── Up Next teaser ────────────────────────────────────────────
//
// Quiet pull at the bottom of every step card. On steps 1–6, points to
// the next step's slug + subtitle. On step 7, points to /zone-of-genius
// — the actual doing surface — closing the loop on the playbook.
const UpNext = ({ step }: { step: PlaybookStep }) => {
  const isLast = step.number === PLAYBOOK_STEPS.length;
  const nextStep = isLast
    ? null
    : PLAYBOOK_STEPS.find((s) => s.number === step.number + 1) ?? null;

  if (isLast) {
    return (
      <div className="mt-8 pt-6 text-center"
        style={{
          borderTop: `1px solid rgba(${step.neonRgb}, 0.22)`,
        }}
      >
        <p
          className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-semibold mb-2"
          style={{
            color: `color-mix(in srgb, ${step.neonHsl} 40%, var(--skin-text-primary, #0a1628) 60%)`,
          }}
        >
          You've seen the method
        </p>
        <Link
          to="/zone-of-genius"
          className="inline-flex items-center gap-2 text-base sm:text-lg font-semibold transition-all hover:translate-x-0.5"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
          }}
        >
          Now go walk it →
        </Link>
      </div>
    );
  }

  if (!nextStep) return null;

  return (
    <div className="mt-8 pt-6"
      style={{
        borderTop: `1px solid rgba(${step.neonRgb}, 0.22)`,
      }}
    >
      <Link
        to={`/playbook/${nextStep.slug}`}
        className="group inline-flex items-baseline gap-3 transition-all hover:translate-x-0.5"
      >
        <span
          className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-semibold"
          style={{
            color: `color-mix(in srgb, ${nextStep.neonHsl} 45%, var(--skin-text-primary, #0a1628) 55%)`,
          }}
        >
          Up next · Step {nextStep.number}
        </span>
        <span
          className="text-base sm:text-lg font-semibold"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
          }}
        >
          {nextStep.subtitle}{" "}
          <span
            aria-hidden="true"
            className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </Link>
    </div>
  );
};

// ───── Bridge to UBB ─────────────────────────────────────────────
//
// Step → UBB artifact links. Lives at the bottom of the step card so
// the methodology reads first, the tooling appears as the natural
// "ok where do I do this?" answer.
const BuildTheseInBuilder = ({ step }: { step: PlaybookStep }) => {
  const links = getBuildLinksForStep(step.slug);
  if (links.length === 0) return null;

  return (
    <section
      aria-label="Build these in the Unique Business Builder"
      className="mt-2 rounded-2xl p-5 sm:p-6"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(${step.neonRgb},0.10), rgba(${step.neonRgb},0.03))`,
        border: `1px solid rgba(${step.neonRgb},0.30)`,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Wrench
          className="h-4 w-4"
          style={{ color: `color-mix(in srgb, ${step.neonHsl} 60%, var(--skin-text-primary, #0a1628) 40%)` }}
          aria-hidden="true"
        />
        <h3
          className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-semibold"
          style={{ color: `color-mix(in srgb, ${step.neonHsl} 35%, var(--skin-text-primary, #0a1628) 65%)` }}
        >
          Build these in your Builder
        </h3>
      </div>
      <p
        className="mb-4 text-sm leading-relaxed"
        style={{ color: "var(--skin-text-body, rgba(26,30,58,0.78))" }}
      >
        The artifacts that crystallize this step into a working part of your business.
        Each one is improvable — generate, then iterate to 9+/10 specificity.
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.slug}
            to={`${UBB_ROOT}/${link.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.02]"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(${step.neonRgb},0.20), rgba(${step.neonRgb},0.08))`,
              border: `1px solid rgba(${step.neonRgb},0.40)`,
              color: "var(--skin-text-strong, rgba(26,30,58,0.88))",
            }}
          >
            {link.label}
            <ChevronRight className="h-3 w-3 opacity-70" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default StepCard;
