import { memo } from "react";
import { X, UserPlus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

interface MatchCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    archetype: string;
    tagline?: string | null;
  };
  matchReason: string;
  matchLabel?: string;
  secondaryReason?: string;
  secondaryLabel?: string;
  tertiaryReason?: string;
  tertiaryLabel?: string;
  matchTypeBadge?: string;
  connectLabel?: string;
  onPass: () => void;
  onConnect: () => void;
  /** Tinder-style navigation */
  currentIndex?: number;
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

/** Strip ✦ symbols from archetype strings */
const stripSymbols = (s: string) => s.replace(/[✦★☆✧⬥◇◆⟐]/g, "").trim();

// ─────────────────────────────────────────────────────────────────────
// Day 63 night (Sasha 2026-05-07) — Aurora register reskin + Strong
// cocktail legibility per docs/03-playbooks/ui_playbook.md Part VIII.
// Was: dark liquid-glass card with text-white + violet gradient CTA.
// Now: parchment cream card + Cormorant + ceremonial gold-rim CTAs.
// Behavior unchanged (props API + handlers identical).
// ─────────────────────────────────────────────────────────────────────

const cormorantTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 700,
  letterSpacing: "-0.005em",
  color: "var(--skin-text-primary, #0b2a5a)",
};

const sourceSerifBody: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontWeight: 600,
  color: "var(--skin-text-primary, #0b2a5a)",
};

const eyebrowGold: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10.5px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-accent-gold, #b8860b)",
};

// Day 65 (Sasha 2026-05-09) — parchment opacity bumped 0.68 → 0.92 because
// the underlying GameShellV2 video background hits bright sun-glare frames
// where 0.68α lets too much luminance bleed through, washing out navy text
// rendered ON the card. Per ui_playbook Part VIII: when the bg is variable-
// luminance, EITHER the cocktail levers compensate OR the card carries
// enough alpha to neutralize the bg behind text. Pulled the latter (the
// card IS now the surface, the video sits behind it) so text contrast is
// computed against parchment, not against bleeding sun-glare. Kept gold
// hairline + soft shadow so the card still reads as parchment, not as a
// flat opaque slab.
const parchmentCard: React.CSSProperties = {
  background: "var(--skin-card-bg, rgba(255, 252, 245, 0.92))",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow:
    "0 0 22px -8px rgba(212, 175, 55, 0.30), 0 16px 40px -20px rgba(10, 22, 40, 0.22)",
};

const ceremonialPrimary: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "12px",
  background:
    "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.92) 0%, rgba(18,28,56,0.85) 50%, rgba(10,22,40,0.92) 100%))",
  color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
  border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
  boxShadow:
    "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
};

// Day 65 (Sasha 2026-05-09) — bumped tertiary pill + nav button bg from
// 0.55 → 0.85 alpha + text from muted → primary. The buttons sit on the
// SAME variable-luminance bg as the card (above it in the JSX, no
// parchment behind), so without the surface alpha lift, "Don't show
// again" / "1/8" rendered as faded text on bright sun-glare patches.
const tertiaryPill: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "11px",
  color: "var(--skin-text-primary, #0b2a5a)",
  background: "rgba(255, 252, 245, 0.85)",
  border: "0.5px solid rgba(212, 175, 55, 0.45)",
  boxShadow: "0 4px 16px -8px rgba(10, 22, 40, 0.18)",
};

const navButton: React.CSSProperties = {
  background: "rgba(255, 252, 245, 0.85)",
  border: "0.5px solid rgba(212, 175, 55, 0.40)",
  color: "var(--skin-text-primary, #0b2a5a)",
  boxShadow: "0 4px 16px -8px rgba(10, 22, 40, 0.18)",
};

const MatchCard = ({
  user,
  matchReason,
  matchLabel,
  secondaryReason,
  secondaryLabel,
  tertiaryReason,
  tertiaryLabel,
  matchTypeBadge,
  connectLabel,
  onPass,
  onConnect,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
}: MatchCardProps) => {
  const cleanArchetype = stripSymbols(user.archetype);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* ─── Action Buttons (TOP) — Pass / Pager / Connect ─── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button
          onClick={onPass}
          className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:translate-y-[-0.5px]"
          style={tertiaryPill}
        >
          <X className="w-3.5 h-3.5" />
          Don't show again
        </button>

        {/* Navigation indicator */}
        {typeof currentIndex === "number" && typeof totalCount === "number" && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:translate-y-[-0.5px] disabled:opacity-30"
              style={navButton}
              aria-label="Previous match"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontVariantNumeric: "tabular-nums lining-nums",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--skin-text-primary, #0b2a5a)",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
              }}
            >
              {currentIndex + 1}/{totalCount}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex === totalCount - 1}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:translate-y-[-0.5px] disabled:opacity-30"
              style={navButton}
              aria-label="Next match"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <button
          onClick={onConnect}
          className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-1px]"
          style={ceremonialPrimary}
        >
          <UserPlus
            className="w-3.5 h-3.5"
            style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))" }}
          />
          {connectLabel || "Connect"}
        </button>
      </div>

      {/* ─── Profile Card — parchment surface, Aurora editorial ─── */}
      <div className="rounded-2xl overflow-hidden" style={parchmentCard}>
        {/* Photo + Identity */}
        <div className="flex flex-col items-center text-center p-6 pb-4">
          <div
            className="w-24 h-24 rounded-full overflow-hidden mb-4 flex items-center justify-center"
            style={{
              background: "rgba(212, 175, 55, 0.10)",
              border: "0.5px solid rgba(212, 175, 55, 0.55)",
              boxShadow: "0 0 18px -6px rgba(212, 175, 55, 0.40)",
            }}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sparkles
                className="w-8 h-8"
                style={{ color: "var(--skin-accent-gold, #b8860b)" }}
              />
            )}
          </div>

          {/* Day 65 (Sasha 2026-05-09) — name + archetype upgraded to
              halo-deep + Strong cocktail. Sasha's screenshot showed Val
              Bul / Architect of Coherent Worlds as washed-out white-on-
              gold. The card itself is now opaque (parchment 0.92), but
              text was using halo-soft which leaves bright sun-glare
              underneath unaccounted for. Halo-deep adds the navy under-
              stroke that grounds text on bright pixels. */}
          <h2
            style={{
              ...cormorantTitle,
              fontSize: "24px",
              fontWeight: 700,
              textShadow:
                "var(--skin-text-halo-deep, 0 0 28px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95), 0 0 1px rgba(11,42,90,0.65), 0 1px 0 rgba(11,42,90,0.45))",
            }}
            className="leading-[1.2]"
          >
            {user.firstName} {user.lastName}
          </h2>
          <p
            className="mt-1.5 italic"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontStyle: "italic",
              fontWeight: 700,
              letterSpacing: "0.005em",
              fontSize: "14.5px",
              color: "var(--skin-text-primary, #0b2a5a)",
              textShadow:
                "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
            }}
          >
            {cleanArchetype}
          </p>

          {matchTypeBadge && (
            <span
              className="mt-3 inline-block"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "10.5px",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: "999px",
                color: "rgba(20, 130, 70, 0.95)",
                background: "rgba(20, 130, 70, 0.08)",
                border: "0.5px solid rgba(20, 130, 70, 0.35)",
              }}
            >
              {matchTypeBadge}
            </span>
          )}
          {user.tagline && (
            <p
              className="mt-3 italic max-w-sm"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontWeight: 600,
                letterSpacing: "0.005em",
                fontSize: "14px",
                lineHeight: 1.55,
                color: "var(--skin-text-primary, #0b2a5a)",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
              }}
            >
              "{user.tagline}"
            </p>
          )}
        </div>

        {/* Collaboration Proposal blocks */}
        <div className="px-6 pb-5 space-y-4">
          <div
            className="pt-4"
            style={{
              borderTop: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
            }}
          >
            <p style={eyebrowGold} className="mb-2">
              {matchLabel || "Why you match"}
            </p>
            <p
              style={{
                ...sourceSerifBody,
                fontSize: "14.5px",
                lineHeight: 1.6,
                fontWeight: 600,
              }}
            >
              {matchReason}
            </p>
          </div>

          {secondaryReason && (
            <div
              className="pt-4"
              style={{
                borderTop: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
              }}
            >
              <p style={eyebrowGold} className="mb-2">
                {secondaryLabel || "Also relevant"}
              </p>
              <p
                style={{
                  ...sourceSerifBody,
                  fontSize: "14px",
                  lineHeight: 1.6,
                  fontWeight: 600,
                }}
              >
                {secondaryReason}
              </p>
            </div>
          )}

          {tertiaryReason && (
            <div
              className="pt-4"
              style={{
                borderTop: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
              }}
            >
              <p
                style={{
                  ...eyebrowGold,
                  color: "rgba(184, 92, 11, 0.95)",
                }}
                className="mb-2"
              >
                {tertiaryLabel || "Context"}
              </p>
              <p
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                {tertiaryReason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const areEqual = (prev: MatchCardProps, next: MatchCardProps) => (
  prev.user.id === next.user.id &&
  prev.user.avatarUrl === next.user.avatarUrl &&
  prev.user.archetype === next.user.archetype &&
  prev.user.tagline === next.user.tagline &&
  prev.matchReason === next.matchReason &&
  prev.matchLabel === next.matchLabel &&
  prev.secondaryReason === next.secondaryReason &&
  prev.secondaryLabel === next.secondaryLabel &&
  prev.tertiaryReason === next.tertiaryReason &&
  prev.connectLabel === next.connectLabel &&
  prev.matchTypeBadge === next.matchTypeBadge &&
  prev.currentIndex === next.currentIndex
);

export default memo(MatchCard, areEqual);
