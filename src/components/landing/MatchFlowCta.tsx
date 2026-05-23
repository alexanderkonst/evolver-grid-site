import { useNavigate } from "react-router-dom";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { useEntryPath } from "@/contexts/EntryPathContext";

/**
 * MatchFlowCta — Funnel v2 (Day 77, Sasha 2026-05-20).
 *
 * Renders the match-path forward CTAs on each completion surface
 * (Top Talent reveal → Mission → Assets → QoL). Returns null when the
 * user did not enter via `?path=match`, so build-path users see their
 * existing CTAs untouched.
 *
 * Placement on each surface follows §4.4b: below the main result
 * content, above any tertiary info/links, with generous vertical
 * padding so the next step is the natural attention landing.
 *
 * Day 79 (Sasha 2026-05-22) — unlock-banner upgrade. The mission step
 * now carries a full inline unlock banner (eyebrow + two body lines +
 * "Continue your journey" link sitting above the primary CTA). This
 * replaces the celebration MODAL that previously popped after mission
 * save, which violated funnel monogamy (modal CTA stacked on top of
 * the page's existing CTA) and interrupted the recognition moment.
 *
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.4.
 */
type Step = "top-talent" | "mission" | "assets" | "qol";

type Config = {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Legacy single-line unlock message (kept for assets step). */
  unlockMessage?: string;
  /** Day 79: richer inline-unlock-banner shape. When present, renders
   *  eyebrow + body lines + an above-CTA "Continue your journey →"
   *  text link. The lines render as separate paragraphs. */
  unlockBanner?: {
    eyebrow: string;
    lines: string[];
    continueJourney?: boolean;
  };
};

const CONFIG: Record<Step, Config> = {
  // §4.4.1 — After Top Talent reveal.
  // Day 79 (Sasha 2026-05-22): dropped "in 1 minute" suffix. Label was
  // both visually long and stylistically loud next to the calm
  // celebration card above it. The action verb stands alone.
  "top-talent": {
    primaryLabel: "Discover your mission",
    primaryHref: "/mission-discovery",
  },
  // §4.4.2 — After Mission Discovery completion.
  // Day 79 (Sasha 2026-05-22): unlock banner copy locked by Sasha to
  // replace the killed celebration modal. Two body lines name what
  // mission did for matches, and what asset-mapping will add. The
  // "Continue your journey" link gives a quiet escape hatch above the
  // primary CTA so the homebase is always one click away.
  mission: {
    primaryLabel: "Map your assets",
    primaryHref: "/asset-mapping",
    unlockBanner: {
      eyebrow: "Asset Mapping unlocked",
      lines: [
        "Your mission reveals matches who are going in the same direction.",
        'Mapping assets reveals the matching "LEGO blocks" each person is bringing.',
      ],
      continueJourney: true,
    },
  },
  // §4.4.3 — After Asset Mapping completion. The unlock moment — make it
  // visually clear that collaboration matches are now available.
  assets: {
    primaryLabel: "See your matches",
    primaryHref: "/game/collaborate/matches",
    secondaryLabel: "Assess your quality of life",
    secondaryHref: "/quality-of-life-map/assessment",
    unlockMessage:
      "You've unlocked collaboration matches. Your people are now visible to you.",
  },
  // §4.4.4 — After Quality of Life completion.
  qol: {
    primaryLabel: "See your refined matches",
    primaryHref: "/game/collaborate/matches",
  },
};

export const MatchFlowCta = ({ step }: { step: Step }) => {
  const { path } = useEntryPath();
  const navigate = useNavigate();

  if (path !== "match") return null;

  const cfg = CONFIG[step];

  // Day 79 (Sasha 2026-05-22): on the Top Talent reveal screen the
  // celebration card sits directly above this CTA. The generic
  // py-10/12 wrapper was stacking with AppleseedDisplay's bottom
  // padding into a giant empty gap. Tighter top padding on that one
  // step pulls the CTA up to the celebration card without disturbing
  // the rhythm on mission/assets/qol completion surfaces.
  const isTopTalent = step === "top-talent";

  return (
    <div
      className={
        isTopTalent
          ? "w-full max-w-2xl mx-auto px-5 pt-4 pb-10 sm:pt-5 sm:pb-12"
          : "w-full max-w-2xl mx-auto px-5 py-10 sm:py-12"
      }
    >
      {/* Day 79 unlock banner — eyebrow + body lines + Continue link. */}
      {cfg.unlockBanner && (
        <div className="text-center mb-6 sm:mb-7 mx-auto max-w-[52ch]">
          <p
            className="mb-3"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--skin-accent-gold, #b8860b)",
            }}
          >
            {cfg.unlockBanner.eyebrow}
          </p>
          {cfg.unlockBanner.lines.map((line, i) => (
            <p
              key={i}
              className="italic"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "clamp(1.05rem, 2vw, 1.28rem)",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
                color: "var(--skin-text-primary, #0a1628)",
                textShadow:
                  "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
                marginBottom: i < cfg.unlockBanner!.lines.length - 1 ? "0.6rem" : 0,
              }}
            >
              {line}
            </p>
          ))}
        </div>
      )}

      {/* Legacy single-line unlock message — kept for the assets step. */}
      {cfg.unlockMessage && (
        <div className="text-center mb-7 sm:mb-8">
          <p
            className="mb-2"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "11px",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--skin-accent-gold, #b8860b)",
            }}
          >
            Unlocked
          </p>
          <p
            className="italic mx-auto max-w-[44ch]"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "clamp(1.18rem, 2.4vw, 1.5rem)",
              lineHeight: 1.35,
              letterSpacing: "0.01em",
              color: "var(--skin-text-primary, #0a1628)",
              textShadow:
                "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
            }}
          >
            {cfg.unlockMessage}
          </p>
        </div>
      )}

      {/* "Continue your journey →" text link sits ABOVE the primary CTA
          when the unlock banner is present. Quieter than the CTA itself
          so the user's eye lands on the primary action by default, but
          the escape hatch back to JOURNEY is always one click away. */}
      {cfg.unlockBanner?.continueJourney && (
        <div className="flex justify-center mb-3">
          <button
            type="button"
            onClick={() => navigate("/game/journey")}
            className="italic transition-opacity duration-200 hover:opacity-80"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontWeight: 500,
              fontSize: "13px",
              color: "var(--skin-text-muted, rgba(11,42,90,0.62))",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              background: "transparent",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Continue your journey →
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-4">
        <EditorialCta
          label={cfg.primaryLabel}
          onClick={() => navigate(cfg.primaryHref)}
        />

        {cfg.secondaryLabel && cfg.secondaryHref && (
          <EditorialCta
            variant="secondary"
            label={cfg.secondaryLabel}
            onClick={() => navigate(cfg.secondaryHref!)}
            icon={null}
          />
        )}
      </div>
    </div>
  );
};

export default MatchFlowCta;
