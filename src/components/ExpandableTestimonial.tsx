import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface TestimonialData {
  shortQuote: string;
  fullQuote: string;
  name: string;
  /** Subtitle shown above quote on Ignite page */
  before?: string;
  /** One-sentence transformation shown below name */
  after?: string;
}

/**
 * Glass-style expandable testimonial card.
 * variant="light" → LandingPage (light bg)
 * variant="dark"  → IgniteSession (dark / glass bg)
 *
 * Day 61 (Sasha 2026-05-04): added `compact` prop. When true, renders
 * the testimonial as a single inline line (quote + name + chevron) by
 * default; click expands to the full quote. Used on /ignite where the
 * booking section needs a tight stack of all 6 testimonials without
 * the full card height per row.
 */
export const ExpandableTestimonial = ({
  t,
  variant = "dark",
  compact = false,
}: {
  t: TestimonialData;
  variant?: "light" | "dark";
  compact?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const isLight = variant === "light";

  // Day 61 (Sasha 2026-05-04): compact rendering — single-line default,
  // expand to full quote. Skips the "before" label and "after" line
  // (those belong to the heavier card variant).
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full text-left rounded-lg px-3 py-2 transition-all duration-200 cursor-pointer group ${
          isLight
            ? "hover:bg-white/40"
            : "hover:bg-white/[0.04]"
        } ${open ? (isLight ? "bg-white/40" : "bg-white/[0.04]") : ""}`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={`text-xs leading-snug italic flex-1 min-w-0 ${
              isLight ? "text-[#2c3150]/60" : "text-white/55"
            }`}
            style={
              !isLight
                ? { fontFamily: "'Source Serif 4', serif" }
                : undefined
            }
          >
            "{t.shortQuote}"{" "}
            <span
              className={`not-italic ${
                isLight ? "text-[#2c3150]/75" : "text-white/70"
              }`}
            >
              — {t.name}
            </span>
          </p>
          <ChevronDown
            className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            } ${isLight ? "text-[#2c3150]/35" : "text-white/30"}`}
            aria-hidden="true"
          />
        </div>

        {/* Full quote — conditionally rendered so closed rows reserve
            zero extra height. Day 65 (Sasha 2026-05-14): the previous
            grid-rows-[0fr]→[1fr] pattern was reserving the open height
            in the closed state on mobile (each compact row left a
            quote-sized empty band underneath). For compact mode we
            don't need the height transition — a clean conditional
            render gives a tight stack of single-line rows that only
            grow when explicitly opened. */}
        {open && (
          <div className="overflow-hidden mt-2">
            <p
              className={`text-xs leading-relaxed italic whitespace-pre-line pt-2 ${
                isLight
                  ? "border-t border-[#2c3150]/8 text-[#2c3150]/55"
                  : "border-t border-white/10 text-white/55"
              }`}
              style={
                !isLight
                  ? { fontFamily: "'Source Serif 4', serif" }
                  : undefined
              }
            >
              "{t.fullQuote}"
            </p>
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={`w-full text-left rounded-2xl p-4 md:p-5 transition-all duration-300 cursor-pointer group ${
        isLight
          ? "border border-[#2c3150]/8 bg-white/50 hover:bg-white/70 hover:border-[#8460ea]/20"
          : "liquid-glass hover:scale-[1.01]"
      } ${open ? (isLight ? "ring-1 ring-[#8460ea]/20" : "ring-1 ring-white/10") : ""}`}
    >
      {/* Before label (Ignite only) */}
      {t.before && !isLight && (
        <p
          className="text-[10px] text-white/20 mb-1.5"
          style={{ fontFamily: "'Source Serif 4', serif", fontStyle: "italic" }}
        >
          {t.before}
        </p>
      )}

      {/* Short quote — always visible */}
      <blockquote
        className={`text-sm leading-relaxed ${
          isLight
            ? "text-[#2c3150]/60 italic"
            : "text-white/60"
        }`}
        style={!isLight ? { fontFamily: "'Source Serif 4', serif", fontStyle: "italic" } : undefined}
      >
        "{t.shortQuote}"
      </blockquote>

      {/* Expand indicator */}
      <div className="flex items-center justify-between mt-2">
        <p className={`text-xs ${isLight ? "font-semibold text-[#8460ea]" : "text-white/40"}`}>
          — {t.name}
        </p>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          } ${isLight ? "text-[#8460ea]/40" : "text-white/20"}`}
        />
      </div>

      {/* After line — one-sentence transformation */}
      {t.after && (
        <p className={`text-[11px] mt-1 leading-relaxed ${
          isLight ? "text-[#2c3150]/40" : "text-white/35"
        }`}>
          Now: {t.after}
        </p>
      )}

      {/* Full quote — expandable */}
      <div
        className={`grid transition-all duration-300 ${
          open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`pt-3 border-t ${
              isLight ? "border-[#2c3150]/8" : "border-white/10"
            }`}
          >
            <p
              className={`text-sm leading-relaxed whitespace-pre-line ${
                isLight ? "text-[#2c3150]/50 italic" : "text-white/50"
              }`}
              style={!isLight ? { fontFamily: "'Source Serif 4', serif", fontStyle: "italic" } : undefined}
            >
              "{t.fullQuote}"
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};
