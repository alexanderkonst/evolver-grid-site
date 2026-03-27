import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface TestimonialData {
  shortQuote: string;
  fullQuote: string;
  name: string;
  /** Subtitle shown above quote on Ignite page */
  before?: string;
}

/**
 * Glass-style expandable testimonial card.
 * variant="light" → LandingPage (light bg)
 * variant="dark"  → IgniteSession (dark / glass bg)
 */
export const ExpandableTestimonial = ({
  t,
  variant = "dark",
}: {
  t: TestimonialData;
  variant?: "light" | "dark";
}) => {
  const [open, setOpen] = useState(false);

  const isLight = variant === "light";

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
