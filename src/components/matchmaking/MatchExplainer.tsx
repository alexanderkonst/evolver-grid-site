import { memo, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GOLD_TEXT_STYLE } from "@/lib/landingDesign";

/**
 * MatchExplainer — Day 67 §8.6 (Sasha 2026-05-19).
 *
 * Three-sentence "how introductions work" accordion rendered at the
 * top of the Genius Matches page. Auto-expands on first visit
 * (game_profiles.match_explainer_seen_at IS NULL). Returning users
 * see it collapsed by default; one click expands. Clicking "Got it"
 * dismisses the panel and writes the timestamp so it stays collapsed
 * across devices.
 *
 * Aurora register: parchment background, gold hairline, Cormorant
 * titles, Source Serif body, DM Sans for the numbered bullets +
 * eyebrows.
 *
 * Privacy + brand layer for the matchmaking mechanic — before the
 * user clicks "I'd like to meet" they understand:
 *   1. What happens to them
 *   2. What happens to the other person
 *   3. The system isn't going to surprise either of them
 */

const MatchExplainerInner = () => {
  const [seenAt, setSeenAt] = useState<string | null | undefined>(undefined);
  // undefined = loading, null = first-visit (auto-expand), string = seen
  const [expanded, setExpanded] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  // Load match_explainer_seen_at for the current user
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSeenAt(null); // anon/unauth gets the first-visit treatment
        setExpanded(true);
        return;
      }
      const { data } = await supabase
        .from("game_profiles")
        .select("match_explainer_seen_at")
        .eq("user_id", user.id)
        .maybeSingle();
      const seen = (data as { match_explainer_seen_at?: string | null } | null)
        ?.match_explainer_seen_at ?? null;
      setSeenAt(seen);
      setExpanded(seen === null);
    };
    load();
  }, []);

  const handleDismiss = async () => {
    setDismissing(true);
    setExpanded(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const now = new Date().toISOString();
        await supabase
          .from("game_profiles")
          .update({ match_explainer_seen_at: now } as never)
          .eq("user_id", user.id);
        setSeenAt(now);
      }
    } catch (err) {
      console.warn("[MatchExplainer] failed to persist dismissal:", err);
    } finally {
      setDismissing(false);
    }
  };

  const toggle = () => setExpanded((v) => !v);

  // While loading, render an invisible placeholder to avoid layout shift
  if (seenAt === undefined) {
    return <div className="h-12 mb-6" aria-hidden="true" />;
  }

  return (
    <section
      aria-label="How introductions work"
      className="mb-6 sm:mb-8 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255, 252, 245, 0.92)",
        border: "0.5px solid rgba(212, 175, 55, 0.55)",
        boxShadow:
          "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
      }}
    >
      {/* Header — clickable to toggle */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls="match-explainer-body"
        className="w-full flex items-center justify-between gap-3 px-5 sm:px-6 py-3.5 sm:py-4 transition-colors hover:bg-[rgba(212,175,55,0.04)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40"
      >
        <span className="inline-flex items-center gap-3">
          <Sparkles
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#b8860b" }}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "17px",
              letterSpacing: "-0.005em",
              color: "var(--skin-text-primary, #0b2a5a)",
            }}
          >
            How introductions work
          </span>
        </span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(11, 42, 90, 0.55)" }} aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(11, 42, 90, 0.55)" }} aria-hidden="true" />
        )}
      </button>

      {/* Body — expanded */}
      {expanded && (
        <div
          id="match-explainer-body"
          className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: "var(--skin-text-primary, #0b2a5a)",
          }}
        >
          <ol className="space-y-3.5 sm:space-y-4 mt-2">
            <li className="flex gap-3">
              <span
                className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full inline-flex items-center justify-center"
                style={{
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "0.5px solid rgba(212, 175, 55, 0.42)",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#7a5108",
                }}
                aria-hidden="true"
              >
                1
              </span>
              <span className="flex-1 text-[15px] sm:text-base leading-relaxed">
                <strong style={{ fontWeight: 600 }}>You click "I'd like to meet."</strong>{" "}
                <span style={{ color: "rgba(11, 42, 90, 0.78)" }}>
                  Your interest stays private. They don't see it in the platform.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full inline-flex items-center justify-center"
                style={{
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "0.5px solid rgba(212, 175, 55, 0.42)",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#7a5108",
                }}
                aria-hidden="true"
              >
                2
              </span>
              <span className="flex-1 text-[15px] sm:text-base leading-relaxed">
                <strong style={{ fontWeight: 600 }}>We send them a heads-up email.</strong>{" "}
                <span style={{ color: "rgba(11, 42, 90, 0.78)" }}>
                  Explaining who you are and why we paired you. They can say yes or not now in one click.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full inline-flex items-center justify-center"
                style={{
                  background: "rgba(212, 175, 55, 0.12)",
                  border: "0.5px solid rgba(212, 175, 55, 0.42)",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#7a5108",
                }}
                aria-hidden="true"
              >
                3
              </span>
              <span className="flex-1 text-[15px] sm:text-base leading-relaxed">
                <strong style={{ fontWeight: 600 }}>If they say yes,</strong>{" "}
                <span style={{ color: "rgba(11, 42, 90, 0.78)" }}>
                  we send you both an intro email in the same thread. You take it from there.
                </span>
              </span>
            </li>
          </ol>

          <p
            className="mt-4 sm:mt-5 text-[13.5px] sm:text-sm leading-relaxed italic"
            style={{
              color: "rgba(11, 42, 90, 0.62)",
              fontFamily: "'Source Serif 4', Georgia, serif",
            }}
          >
            If they don't respond, we leave it at that. You can withdraw your interest anytime from your Connections page.
          </p>

          {/* Got it button — only show when this is the first visit */}
          {seenAt === null && (
            <div className="mt-4 sm:mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={dismissing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]/40"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  background: "linear-gradient(135deg, #b8860b, #7a5108)",
                  color: "#fffdf6",
                  boxShadow: "0 4px 12px -4px rgba(122, 81, 8, 0.4)",
                }}
              >
                <span style={GOLD_TEXT_STYLE}>✦</span>
                Got it
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export const MatchExplainer = memo(MatchExplainerInner);
export default MatchExplainer;
