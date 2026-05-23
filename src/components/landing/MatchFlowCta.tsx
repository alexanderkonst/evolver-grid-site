import { useNavigate } from "react-router-dom";
import { EditorialCta } from "@/components/ui/editorial-cta";
import { useEntryPath } from "@/contexts/EntryPathContext";
import { Ornament } from "@/lib/landingDesign";

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
 * Day 79 (Sasha 2026-05-22) — unlock-banner upgrade. The mission and
 * assets steps now carry full inline unlock banners (eyebrow + body
 * lines + "Continue your journey" link above the primary CTA). This
 * replaces the celebration MODAL that previously popped after each
 * primitive save, which violated funnel monogamy (modal CTA stacked
 * on top of the page's existing CTA) and interrupted the recognition
 * moment.
 *
 * Day 79 (Sasha 2026-05-22) — graduation variant. The assets step is
 * the onboarding-complete moment (T+M+A all named, collaboration
 * profile crystallized). Its banner uses a larger eyebrow flanked by
 * ✦ glyphs + an editorial Ornament rule + extra breathing room, so
 * the arrival reads as ceremonial without going modal.
 *
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.4.
 */
type Step = "top-talent" | "mission" | "assets" | "qol";

type UnlockBanner = {
  eyebrow: string;
  /** Optional small caps glyph rendered on either side of the eyebrow.
   *  Used for the graduation step to give it ceremonial weight. */
  eyebrowGlyph?: string;
  lines: string[];
  /** Optional softer tertiary line (rendered italic, muted, after lines). */
  psLine?: string;
  continueJourney?: boolean;
  /** Graduation flag — bumps the eyebrow size, adds an Ornament rule
   *  between eyebrow and body lines, increases vertical breathing. */
  isGraduation?: boolean;
};

type Config = {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  /** Legacy single-line unlock message. Currently unused (was on the
   *  assets step; superseded by the full unlockBanner). Kept on the
   *  type so future quiet-unlock moments have the option. */
  unlockMessage?: string;
  /** Day 79: richer inline-unlock-banner shape. */
  unlockBanner?: UnlockBanner;
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
  // §4.4.3 — After Asset Mapping completion. The GRADUATION moment:
  // top talent + mission + assets all named, collaboration profile
  // complete. Day 79 (Sasha 2026-05-22) copy + graduation flag locked.
  // The richer styling (✦ glyphs flanking the eyebrow, Ornament rule,
  // extra padding) is what differentiates this from a regular step
  // transition without going back to a modal.
  assets: {
    primaryLabel: "Find collaborators",
    primaryHref: "/game/collaborate/matches",
    secondaryLabel: "Assess your quality of life",
    secondaryHref: "/quality-of-life-map/assessment",
    // Day 79 (Sasha 2026-05-22, second pass): ✦ glyphs removed per
    // Sasha — read as "cliffs" / magic-shop ornament. The graduation
    // ceremony comes from the eyebrow size + Ornament rule + extra
    // breathing room alone; no decorative glyphs needed.
    unlockBanner: {
      eyebrow: "Collaboration profile complete",
      lines: [
        "Your top talent, mission, and assets are all named.",
        "Your collaborators are now visible to you.",
      ],
      psLine:
        "Optional: the Quality of Life assessment refines match quality.",
      continueJourney: true,
      isGraduation: true,
    },
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
  const banner = cfg.unlockBanner;
  const isGraduation = banner?.isGraduation === true;

  // Eyebrow font sizes — graduation reads bigger so the arrival lands
  // as a moment, not a checkpoint. Letter-spacing widens slightly too.
  const eyebrowFontSize = isGraduation ? "13.5px" : "11px";
  const eyebrowTracking = isGraduation ? "0.32em" : "0.28em";

  return (
    <div
      className={
        isTopTalent
          ? "w-full max-w-2xl mx-auto px-5 pt-4 pb-10 sm:pt-5 sm:pb-12"
          : isGraduation
            ? "w-full max-w-2xl mx-auto px-5 py-12 sm:py-16"
            : "w-full max-w-2xl mx-auto px-5 py-10 sm:py-12"
      }
    >
      {banner && (
        <div
          className={`text-center mx-auto ${
            isGraduation ? "mb-8 sm:mb-9 max-w-[56ch]" : "mb-6 sm:mb-7 max-w-[52ch]"
          }`}
        >
          {/* Eyebrow — flanking glyphs on graduation for ceremonial weight. */}
          <p
            className={isGraduation ? "mb-4" : "mb-3"}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: eyebrowFontSize,
              letterSpacing: eyebrowTracking,
              textTransform: "uppercase",
              color: "var(--skin-accent-gold, #b8860b)",
            }}
          >
            {banner.eyebrowGlyph && (
              <span
                aria-hidden="true"
                style={{ marginRight: "0.6em", opacity: 0.85 }}
              >
                {banner.eyebrowGlyph}
              </span>
            )}
            {banner.eyebrow}
            {banner.eyebrowGlyph && (
              <span
                aria-hidden="true"
                style={{ marginLeft: "0.6em", opacity: 0.85 }}
              >
                {banner.eyebrowGlyph}
              </span>
            )}
          </p>

          {/* Editorial Ornament rule — graduation only. Visually
              separates the milestone label from the body so the
              moment reads as arrival, not transition. */}
          {isGraduation && <Ornament className="my-4 sm:my-5" />}

          {banner.lines.map((line, i) => (
            <p
              key={i}
              className="italic"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: isGraduation
                  ? "clamp(1.12rem, 2.2vw, 1.38rem)"
                  : "clamp(1.05rem, 2vw, 1.28rem)",
                lineHeight: 1.4,
                letterSpacing: "0.01em",
                color: "var(--skin-text-primary, #0a1628)",
                textShadow:
                  "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.7), 0 1px 2px rgba(255,255,255,0.9), 0 0 1px rgba(11,42,90,0.45), 0 1px 0 rgba(11,42,90,0.25))",
                marginBottom: i < banner.lines.length - 1 ? "0.6rem" : 0,
              }}
            >
              {line}
            </p>
          ))}

          {/* Softer tertiary PS line — sits below the body lines,
              muted register so it reads as a footnote, not a sibling
              of the main message. */}
          {banner.psLine && (
            <p
              className="italic mx-auto"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontWeight: 500,
                fontSize: "13.5px",
                lineHeight: 1.55,
                color: "var(--skin-text-muted, rgba(11,42,90,0.62))",
                marginTop: "1rem",
                maxWidth: "44ch",
              }}
            >
              {banner.psLine}
            </p>
          )}
        </div>
      )}

      {/* Legacy single-line unlock message — kept for any future step
          that wants the quiet treatment. None currently use it; the
          assets step migrated to the full unlockBanner above. */}
      {cfg.unlockMessage && !banner && (
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
      {banner?.continueJourney && (
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
