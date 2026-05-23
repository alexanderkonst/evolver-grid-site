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
 * Spec: docs/specs/funnel-v2/funnel-v2_product_spec.md §4.4.
 */
type Step = "top-talent" | "mission" | "assets" | "qol";

type Config = {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  unlockMessage?: string;
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
  mission: {
    primaryLabel: "Map your assets",
    primaryHref: "/asset-mapping",
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

  return (
    <div className="w-full max-w-2xl mx-auto px-5 py-10 sm:py-12">
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
