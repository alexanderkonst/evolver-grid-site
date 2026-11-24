import { Fragment } from "react";

/**
 * Shared sections reused across /founders and /game/marketplace pages.
 * Light-mode styling by default (for in-platform use).
 *
 * Day 91 (Sasha 2026-06-09): tokenized for Aurum — the lightMode branch
 * (what /game/marketplace actually renders) reads skin tokens with the
 * original literals as fallbacks, so Lapis stays pixel-identical while
 * the dark skins re-tone the white CTA panel + navy gradient text. The
 * non-lightMode branch already renders white-on-dark and is untouched.
 */

export const FoundersHero = ({ lightMode = true }: { lightMode?: boolean }) => (
  <div className="text-center space-y-5" id="showcase-header">
    <p className="mp-label tracking-[0.3em] text-muted-foreground">
      The Originals
    </p>

    {/* L-05: the village's title voice, one solid ink, no gradient text. */}
    <h2 className="mp-title mx-auto" style={{ fontSize: "clamp(24px, 3.2vw, 36px)" }}>
      Founders Who Found Their Genius
    </h2>

    <p className={`text-sm max-w-md mx-auto leading-relaxed ${lightMode ? 'text-[#2c3150]/40' : 'text-muted-foreground'}`}>
      Each person went through the Unique Business Canvas process.
      Their myth was discovered. Their business was designed
      around who they already are.
    </p>

    {/* Stats ribbon */}
    <div className={`flex justify-center gap-6 text-[11px] pt-2 ${lightMode ? 'text-[#2c3150]/25' : 'text-muted-foreground'}`}>
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
            className={`text-sm font-display font-medium ${lightMode ? 'text-[color:var(--skin-ink-body,rgba(44,49,80,0.6))]' : 'text-foreground'}`}
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
    {/* L-02: a dark card on the village's paper token, one hairline border, no gradient edge. */}
    <div
      className={`border p-10 md:p-14 text-center ${lightMode ? 'bg-[var(--skin-card-fill,#fff)] border-[#8460ea]/20' : 'border-[rgba(var(--scene-ink-rgb),0.14)]'}`}
      style={lightMode ? undefined : { background: "var(--scene-paper, #0e0d0b)" }}
    >
      <p className="mp-label tracking-[0.3em] text-muted-foreground mb-4">
        Ready to Find Your Genius?
      </p>

      <h3 className="mp-title mx-auto mb-3" style={{ fontSize: "clamp(24px, 3.2vw, 36px)" }}>
        Your Uniqueness IS Your Business
      </h3>

      <p className={`text-sm max-w-sm mx-auto mb-8 ${lightMode ? 'text-[#2c3150]/40' : 'text-muted-foreground'}`}>
        One session. Your myth discovered. Your canvas complete.
        The business you were always meant to build — revealed.
      </p>

      {/* The village's one button (.mp-btn = .mf__go), not a coloured pill. */}
      <a href="/ignite" className="mp-btn" id="book-session-btn">
        Book Your Private Founder-Market Fit Session — $555
      </a>
    </div>
  </div>
);
