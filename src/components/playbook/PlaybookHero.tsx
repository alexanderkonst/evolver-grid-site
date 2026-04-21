import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * PlaybookHero — the CTAs below the landing's headline.
 *
 * As of 2026-04-21 (Sasha): the 7-step circle infographic was retired.
 * The landing is now hero headline + two buttons. The step-in-line
 * navigation lives at the top of /playbook (PlaybookShell), not here.
 *
 * Layout:
 *   [ Find your top talent → ]         ← primary (was "Claim your gift")
 *     ↑ Claim your gift · Takes two minutes  ← meta, small, arrow up
 *
 *   [ See the exact playbook →  ]       ← secondary
 */

const PlaybookHero = () => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 sm:mb-10">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        {/* Primary CTA — the button now names the outcome, not the gift */}
        <button
          type="button"
          onClick={() => navigate("/auth?claim=true&next=/zone-of-genius")}
          className={cn(
            "group relative px-8 sm:px-10 py-4 rounded-full",
            "text-sm sm:text-base font-semibold uppercase tracking-[0.18em]",
            "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
          )}
          style={{
            color: "rgba(231,233,229,0.98)",
            backgroundImage:
              "linear-gradient(135deg, rgba(132,96,234,0.85), rgba(41,84,159,0.85))",
            border: "1px solid rgba(231,233,229,0.35)",
            boxShadow:
              "0 20px 60px -16px rgba(132,96,234,0.75), inset 0 1px 1px rgba(255,255,255,0.25)",
          }}
        >
          <span className="inline-flex items-center gap-3">
            Find your top talent
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </button>

        {/* Meta line — BELOW the button now, with an up-arrow pointing to it */}
        <div
          className="text-[10px] uppercase tracking-[0.28em] inline-flex items-center gap-2"
          style={{ color: "rgba(231,233,229,0.55)" }}
        >
          <span aria-hidden="true">↑</span>
          <span>Claim your gift · Takes two minutes</span>
        </div>

        {/* Secondary — unchanged */}
        <button
          type="button"
          onClick={() => navigate("/playbook")}
          className={cn(
            "group relative px-8 sm:px-10 py-3.5 rounded-full mt-4",
            "text-sm sm:text-base font-semibold uppercase tracking-[0.18em]",
            "transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]",
            "focus-visible:ring-2 focus-visible:ring-white/40 outline-none",
          )}
          style={{
            color: "rgba(231,233,229,0.92)",
            background: "rgba(231,233,229,0.06)",
            border: "1px solid rgba(231,233,229,0.25)",
            boxShadow: "0 12px 40px -14px rgba(132,96,234,0.35)",
          }}
        >
          <span className="inline-flex items-center gap-3">
            See the exact playbook
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default PlaybookHero;
