import { memo, useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
// Day 80 Wave 2.19 (Sasha 2026-05-22): button + container restyled
// to match the landing-CTA register per ui_playbook.md + glassmorphism
// _blueprint.md. CTA_SMALL_CAPS_STYLE = Cormorant tracked uppercase;
// igniteLogo = the ✦ emblem used on every primary CTA.
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";

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

/**
 * Day 79 (Sasha 2026-05-22): explainer state lifted into a shared hook
 * so the page can render the explainer in a "slot" pattern:
 *   - First-visit (seenAt === null) → top of page, auto-expanded
 *   - Already dismissed (seenAt is a string) → bottom of page, collapsed
 * Both slots subscribe to the same state, so clicking "Got it" in the
 * top instance triggers the bottom instance to mount on the next render.
 */
export const useMatchExplainerState = () => {
  const [seenAt, setSeenAt] = useState<string | null | undefined>(undefined);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSeenAt(null); // anon/unauth gets the first-visit treatment
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
    };
    load();
  }, []);

  const dismiss = useCallback(async () => {
    setDismissing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const now = new Date().toISOString();
        await supabase
          .from("game_profiles")
          .update({ match_explainer_seen_at: now } as never)
          .eq("user_id", user.id);
        setSeenAt(now);
      } else {
        // Anonymous fallback — mark as dismissed locally so the
        // accordion behaves the same way for unauth users (the call to
        // game_profiles requires auth so we can't persist for them).
        setSeenAt(new Date().toISOString());
      }
    } catch (err) {
      console.warn("[MatchExplainer] failed to persist dismissal:", err);
    } finally {
      setDismissing(false);
    }
  }, []);

  return { seenAt, dismiss, dismissing };
};

interface MatchExplainerProps {
  seenAt: string | null | undefined;
  onDismiss: () => Promise<void>;
  dismissing?: boolean;
}

const MatchExplainerInner = ({
  seenAt,
  onDismiss,
  dismissing = false,
}: MatchExplainerProps) => {
  // First-visit instances auto-expand; dismissed instances stay collapsed.
  const [expanded, setExpanded] = useState(() => seenAt === null);

  const toggle = () => setExpanded((v) => !v);

  // While loading, render an invisible placeholder to avoid layout shift
  if (seenAt === undefined) {
    return <div className="h-12 mb-6" aria-hidden="true" />;
  }

  return (
    /* Day 80 Wave 2.19 (Sasha 2026-05-22): container moved to
       `liquid-glass-strong` (Apple iOS 26 Liquid Glass — heavy
       backdrop blur + saturate + asymmetric edge lighting + layered
       drop shadow). Per glassmorphism_blueprint.md, strong glass is
       the canon for prominent panels carrying instructional value.
       Custom parchment background retired. */
    <section
      aria-label="How introductions work"
      className="liquid-glass-strong mb-6 sm:mb-8 rounded-3xl overflow-hidden"
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
                <strong style={{ fontWeight: 600 }}>AI suggests optimal matches.</strong>{" "}
                <span style={{ color: "rgba(11, 42, 90, 0.78)" }}>
                  Click "I'd like to meet." whenever you'd like to get in touch.
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
                <strong style={{ fontWeight: 600 }}>We send them a heads-up email</strong>{" "}
                <span style={{ color: "rgba(11, 42, 90, 0.78)" }}>
                  explaining who you are and why we paired you. They can say "yes" or "not now".
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
                  we send you both an intro email. You take it from there. If they don't respond, we leave it at that.
                </span>
              </span>
            </li>
          </ol>

          {/* Got it button — only show when this is the first visit.
              Day 80 Wave 2.19 (Sasha 2026-05-22): restyled to match the
              canonical landing CTA voice — liquid-glass-dark pill +
              cta-breath animation + ignite emblem + CTA_SMALL_CAPS_STYLE.
              Same family as the "FIND YOUR TOP TALENT →" button on /. */}
          {seenAt === null && (
            <div className="mt-4 sm:mt-5 flex justify-end">
              <button
                type="button"
                onClick={onDismiss}
                disabled={dismissing}
                className="group liquid-glass-dark cta-breath rounded-full inline-flex items-center justify-center gap-2 px-5 py-2.5 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-white/40 outline-none"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
                  backgroundImage:
                    "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
                  boxShadow:
                    "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
                  textShadow:
                    "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.25), 0 1px 2px rgba(0,0,0,0.35))",
                }}
              >
                <img
                  src={igniteLogo}
                  alt=""
                  aria-hidden="true"
                  className="h-3.5 w-auto opacity-80 transition-opacity group-hover:opacity-100 flex-shrink-0"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(244, 212, 114, 0.45))",
                  }}
                  draggable={false}
                />
                <span style={CTA_SMALL_CAPS_STYLE} className="text-xs sm:text-sm">
                  Got it
                </span>
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
