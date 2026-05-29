import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Monetization — public explainer for how Find Your Top Talent / Planetary OS
 * is paid for. Route: /monetization.
 *
 * Standalone (NOT inside GameShellV2): a clean, public transparency surface in
 * the same Liquid Glass editorial register as /1-pager (navy + gold, Cormorant
 * headlines, DM Sans body). Radical-transparency framing per the brand ("built
 * in the open, paid in the open"). Phase discipline respected: the free entry
 * + the use-it model are stated plainly; the venture-share and teaching-license
 * layers are framed as the model's shape/trajectory, not as live priced offers,
 * and no exact prices are pinned on this surface. Canonical detail lives in
 * docs/02-strategy/monetization_strategies.md. Copy is a v1 draft for Sasha to vet.
 */

const NAVY = "#0a1628";

const WAYS: Array<{ n: string; title: string; desc: string }> = [
  {
    n: "1",
    title: "People and groups pay to use it",
    desc: "A person can go deeper for a small fee, then book a session, then get help building. A community can pay a regular fee to run the whole thing for its members, under its own name. And anyone can run their own copy and send back a small share once they are truly earning from it.",
  },
  {
    n: "2",
    title: "We share in what it helps build",
    desc: "Where the platform is genuinely part of building a venture, it keeps a small, lasting share. We only earn when you do. This is invitation-based and only where we are truly in the loop, never a tax on every introduction.",
  },
  {
    n: "3",
    title: "Others pay to teach it",
    desc: "In time, schools and programs can be certified to teach the method themselves, the way a coaching or yoga certification works.",
  },
];

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <p className="text-[11px] uppercase tracking-[0.28em] mb-3" style={{ color: "rgba(26,30,58,0.5)" }}>
    {children}
  </p>
);

const GradientInk = ({ children }: { children: ReactNode }) => (
  <span
    className="bg-clip-text text-transparent"
    style={{
      backgroundImage:
        "linear-gradient(135deg, hsl(265, 90%, 30%) 0%, hsl(245, 95%, 26%) 55%, hsl(28, 90%, 32%) 100%)",
      filter:
        "drop-shadow(0 0 12px hsl(260 100% 55% / 0.35)) drop-shadow(0 0 3px hsl(255 95% 50% / 0.4))",
      textShadow: "none",
    }}
  >
    {children}
  </span>
);

const Panel = ({ eyebrow, children }: { eyebrow: string; children: ReactNode }) => (
  <section className="liquid-glass rounded-3xl p-7 sm:p-9">
    <Eyebrow>{eyebrow}</Eyebrow>
    {children}
  </section>
);

const bodyStyle = { color: "rgba(26,30,58,0.8)" } as const;

const Monetization = () => {
  const headlineHalo = "0 0 26px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.85)";
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        color: NAVY,
        background: "linear-gradient(160deg, #f6f5f1 0%, #eef0f6 55%, #f1ecf6 100%)",
      }}
    >
      {/* Ambient glows — give the glass something to frost over. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-[680px] h-[680px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(265 80% 60% / 0.10) 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[620px] h-[620px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(212 85% 55% / 0.10) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(35 90% 55% / 0.08) 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 max-w-[820px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* HERO */}
        <header className="text-center mb-14 sm:mb-20">
          <p className="text-[11px] uppercase tracking-[0.30em] mb-5" style={{ color: "rgba(26,30,58,0.5)" }}>
            Built in the open · paid in the open
          </p>
          <h1
            className="font-bold leading-[1.04] tracking-[-0.01em]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.6rem, 8vw, 4.75rem)",
              color: NAVY,
              textShadow: headlineHalo,
            }}
          >
            How this is paid for
          </h1>
          <p
            className="mt-5 italic mx-auto max-w-[44ch]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.7rem)",
              color: "rgba(26,30,58,0.72)",
              lineHeight: 1.35,
            }}
          >
            No hidden model. Here is exactly how the work sustains itself, and why it only earns{" "}
            <GradientInk>when you do</GradientInk>.
          </p>
          <p className="mt-8 mx-auto max-w-[58ch] text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
            The seed is free on purpose: a short profile that shows you what you are naturally great at, given
            away so it can spread. Nobody pays for the seed. The money comes from what grows around it, and
            every form of it is designed so the platform stays small while the people using it grow.
          </p>
        </header>

        {/* BODY */}
        <div className="space-y-5">
          <Panel eyebrow="The seed is free">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              A two-minute talent profile, free for anyone. It is the front door, not a sample held back to
              upsell. The more people who hold a clear picture of what they uniquely bring, the better the
              whole thing works, so the front door stays open and free.
            </p>
          </Panel>

          <Panel eyebrow="Three ways it is paid for">
            <ol className="space-y-4">
              {WAYS.map((w) => (
                <li key={w.n} className="flex gap-4 items-baseline">
                  <span
                    className="font-semibold tabular-nums shrink-0"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", color: "rgba(26,30,58,0.45)" }}
                  >
                    {w.n}
                  </span>
                  <p className="text-[15px] sm:text-base leading-snug" style={{ color: "rgba(26,30,58,0.82)" }}>
                    <span className="font-semibold" style={{ color: NAVY }}>{w.title}.</span> {w.desc}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel eyebrow="The order it grows">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              These turn on in sequence, not all at once. People first, you can use it today. Communities next,
              running it for their own members. Sharing in the ventures it helps build comes later, and only
              where we are genuinely part of the building. Licensing others to teach it comes last. Each step
              proves and funds the next.
            </p>
          </Panel>

          <Panel eyebrow="The principle">
            <p className="text-[15px] sm:text-base leading-relaxed" style={bodyStyle}>
              Three commitments hold it together. We stay small while the thing underneath grows. The code is
              open-source and forkable, meant to be owned by the people who use it, not locked behind a wall.
              And a fair share of what the network earns funds a shared commons, not a private fortune. The one
              number all of it serves is simple: <GradientInk>how many people find their people and start
              building together</GradientInk>.
            </p>
            <Link
              to="/"
              className="liquid-glass-strong mt-6 inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{ color: NAVY, textShadow: "0 1px 2px rgba(255,255,255,0.7)" }}
            >
              Find your top talent
              <ArrowRight className="w-4 h-4 opacity-70" />
            </Link>
          </Panel>
        </div>

        {/* CLOSE */}
        <section className="text-center mt-16 sm:mt-20 max-w-[52ch] mx-auto">
          <p className="text-[11px] uppercase tracking-[0.28em] mb-3" style={{ color: "rgba(26,30,58,0.5)" }}>
            The whole idea
          </p>
          <p
            className="italic"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(1.25rem, 3vw, 1.7rem)",
              color: "rgba(26,30,58,0.8)",
              lineHeight: 1.4,
            }}
          >
            A business that earns by helping people succeed, and takes a fair slice for making it happen. Never
            by trapping anyone.
          </p>
        </section>

        <footer className="text-center mt-20">
          <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: "rgba(26,30,58,0.4)" }}>
            Find Your Top Talent · findyourtoptalent.com
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Monetization;
