import { Fragment } from "react";

/**
 * Shared sections reused across /founders and /game/marketplace pages.
 *
 * `lightMode` (the default, what /game/marketplace renders inside the shell) is the village
 * register since issue #443 (Sasha's master-style approval, 2026-11-24): dark monochrome, mono
 * letter-spaced labels, serif uppercase headings, thin-border button, no gradient, no violet,
 * no glyph badge. It reads shell tokens (foreground, border), so every skin renders it. The
 * non-lightMode branch (the public /founders page) is unchanged.
 */

const VILLAGE_LABEL = "font-mono text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground";
const VILLAGE_HEADING = "font-serif font-medium uppercase tracking-[0.18em] text-foreground";

export const FoundersHero = ({ lightMode = true }: { lightMode?: boolean }) => (
  <div className="text-center space-y-5" id="showcase-header">
    <p className={lightMode ? VILLAGE_LABEL : "text-[11px] font-medium tracking-[0.4em] uppercase text-[#8460ea]/60"}>
      The Originals
    </p>

    {lightMode ? (
      <h2 className={`${VILLAGE_HEADING} text-2xl md:text-3xl leading-[1.3]`}>
        Founders Who Found
        <br />
        Their Genius
      </h2>
    ) : (
      <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight leading-[1.1]">
        <span className="bg-gradient-to-r from-[#8460ea] via-[#5eaf8b] to-[#d49a5e] bg-clip-text text-transparent">
          Founders Who Found
        </span>
        <br />
        <span className="text-white/85">Their Genius</span>
      </h2>
    )}

    <p className={`text-sm max-w-md mx-auto leading-relaxed ${lightMode ? 'text-muted-foreground' : 'text-white/30'}`}>
      Each person went through the Unique Business Canvas process.
      Their myth was discovered. Their business was designed
      around who they already are.
    </p>

    {/* Stats ribbon */}
    <div className={`flex justify-center gap-6 text-[11px] pt-2 ${lightMode ? 'font-mono font-light uppercase tracking-[0.2em] text-muted-foreground' : 'text-white/15'}`}>
      {[
        { val: "4", label: "canvases" },
        { val: "10", label: "days" },
        { val: "$0", label: "ad spend" },
        { val: "100%", label: "conversion" },
      ].map((s, i) => (
        <Fragment key={i}>
        {i > 0 && " "}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={lightMode ? 'text-sm text-foreground' : 'text-sm font-display font-medium bg-gradient-to-b bg-clip-text text-transparent from-white/40 to-white/15'}
          >
            {s.val}
          </span>{" "}
          <span>{s.label}</span>
        </div>
        </Fragment>
      ))}
    </div>
  </div>
);

export const FoundersCTA = ({ lightMode = true }: { lightMode?: boolean }) => (
  <div id="showcase-cta">
    {lightMode ? (
      <div className="rounded-md border border-border p-8 md:p-12 text-center space-y-4">
        <p className={VILLAGE_LABEL}>Ready to Find Your Genius?</p>
        <h3 className={`${VILLAGE_HEADING} text-xl md:text-2xl leading-[1.3]`}>
          Your Uniqueness IS
          <br />
          Your Business
        </h3>
        <p className="text-sm max-w-sm mx-auto text-muted-foreground">
          One session. Your myth discovered. Your canvas complete.
          The business you were always meant to build, revealed.
        </p>
        <a
          href="/ignite"
          className="inline-flex items-center min-h-[44px] px-6 rounded-md border border-foreground/60 font-mono text-xs font-light uppercase tracking-[0.2em] text-foreground hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground transition-colors"
          id="book-session-btn"
        >
          Book Your Private Founder-Market Fit Session — $555
        </a>
      </div>
    ) : (
    <>
    {/* Rotating border */}
    <div
      className="relative rounded-3xl p-[1px]"
      style={{
        background:
          "linear-gradient(135deg, #8460ea40, #5eaf8b30, #d49a5e30, #7eb8d430, #8460ea40)",
      }}
    >
      <div className="rounded-3xl p-10 md:p-14 text-center relative overflow-hidden bg-[#0e1528]">
        {/* Internal glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] bg-[#8460ea]/6" />
        </div>

        <div className="relative z-10">
          <p className="text-[11px] tracking-[0.4em] uppercase text-[#8460ea]/50 mb-4">
            Ready to Find Your Genius?
          </p>

          <h3 className="text-2xl md:text-4xl font-display font-medium mb-3">
            <span className="bg-gradient-to-r from-[#8460ea] via-[#5eaf8b] to-[#d49a5e] bg-clip-text text-transparent">
              Your Uniqueness IS
            </span>
            <br />
            <span className="text-white/80">Your Business</span>
          </h3>

          <p className="text-sm max-w-sm mx-auto mb-8 text-white/30">
            One session. Your myth discovered. Your canvas complete.
            The business you were always meant to build — revealed.
          </p>

          <a
            href="/ignite"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-semibold bg-gradient-to-r from-[#8460ea] to-[#6a4ecf] text-white hover:shadow-xl hover:shadow-[#8460ea]/25 transition-all duration-500 hover:scale-[1.03] active:scale-[0.98]"
            id="book-session-btn"
          >
            <span className="text-lg">◉</span>
            Book Your Private Founder-Market Fit Session — $555
          </a>
        </div>
      </div>
    </div>
    </>
    )}
  </div>
);
