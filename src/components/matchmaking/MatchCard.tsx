import { memo, useState } from "react";
import { X, UserPlus, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Day 66 wave §8 (Sasha 2026-05-16): match-mechanic interaction state.
 *
 *   "default"            — user has not yet expressed interest in this
 *                          person. Show Pass + "I'd like to meet" CTAs.
 *   "interest-expressed" — user has clicked "I'd like to meet" and the
 *                          other side hasn't reciprocated yet. Show a
 *                          calm "Your interest is recorded — we'll
 *                          introduce you if they agree" status.
 *   "mutual"             — both sides have opted in; the intro email
 *                          has fired. Show a celebratory banner +
 *                          "Check your inbox" affordance.
 *
 * Optional callback `onWithdraw` for the interest-expressed state:
 * letting the user un-express interest. v1 of the page may not pass
 * this — in which case the Pass button stays hidden in that state.
 */
export type MatchInteractionState = "default" | "interest-expressed" | "mutual";

/**
 * Day 80 (Sasha 2026-05-23): each match now carries up to 3 distinct
 * collaboration proposals from different taxonomy roots (Co-Build,
 * Co-Learn, Co-Distribute, Co-Resource, Co-Steward). Surfaced
 * one-after-another on the card so the user has real choice.
 */
export interface MatchProposal {
  type: string;
  proposal: string;
  evolutionLine?: string;
}

interface MatchCardProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    archetype: string;
    tagline?: string | null;
  };
  /** Day 80 — preferred shape. When present, renders the proposals
   *  list. Legacy single-proposal callers can still pass `matchReason`
   *  (used as a fallback when `proposals` is empty). */
  proposals?: MatchProposal[];
  matchReason?: string;
  matchLabel?: string;
  secondaryReason?: string;
  secondaryLabel?: string;
  tertiaryReason?: string;
  tertiaryLabel?: string;
  matchTypeBadge?: string;
  /** Day 80 (Sasha 2026-05-23): composite resonance score 0-100 from
   *  the matching engine. When present, renders as a small gold-pill
   *  next to the matchTypeBadge so the user sees the engine's
   *  confidence at a glance. Tiered tint: ≥ 70 emerald-gold (strong),
   *  50-69 gold (steady), < 50 muted-gold (borderline). */
  resonanceScore?: number;
  connectLabel?: string;
  onPass: () => void;
  onConnect: () => void;
  /** Tinder-style navigation */
  currentIndex?: number;
  totalCount?: number;
  onPrev?: () => void;
  onNext?: () => void;
  /** Day 66 §8: which interaction state this card is in. Default
   * "default" — backward-compatible for callers that haven't wired
   * the mutual-opt-in mechanic. */
  interactionState?: MatchInteractionState;
  /** Day 66 §8: optional un-express-interest callback. Only meaningful
   * in the "interest-expressed" state. */
  onWithdraw?: () => void;
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

// Day 87 (Sasha 2026-05-29) — applied the Strong cocktail (ui_playbook
// Part VIII) to match-card body copy. Previous values (weight 600, no
// halo, no letter-spacing) sat below Strong-default; Sasha caught the
// proposals + heads-up callout reading washed-out against bright video
// frames bleeding through the parchment-card at 0.92α. Bumped to:
//   • weight 700 (lever 1)
//   • halo-strong (lever 3 — card is mostly solid parchment, so
//     halo-strong is the right floor; halo-deep is reserved for
//     headlines that need maximum lift)
//   • +0.003em letter-spacing (lever 4 micro)
// Color was already at skin-text-primary (full alpha) per lever 2.
const sourceSerifBody: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontWeight: 700,
  letterSpacing: "0.003em",
  color: "var(--skin-text-primary, #0b2a5a)",
  textShadow:
    "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
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
  proposals,
  matchReason,
  matchLabel,
  secondaryReason,
  secondaryLabel,
  tertiaryReason,
  tertiaryLabel,
  matchTypeBadge,
  resonanceScore,
  connectLabel,
  onPass,
  onConnect,
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  interactionState = "default",
  onWithdraw,
}: MatchCardProps) => {
  const cleanArchetype = stripSymbols(user.archetype);

  // Day 79 (Sasha 2026-05-22): "Don't show again" is destructive
  // (permanently hides this profile from the user's match queue), so
  // it gets a confirmation step. Pattern: same as Mission Discovery
  // "Change your mission?" AlertDialog. Softer copy than the literal
  // "Do you really want to never see this profile again?" Sasha's
  // draft suggested — active verb, no double-negative.
  const [confirmHideOpen, setConfirmHideOpen] = useState(false);
  const handleHideClick = () => setConfirmHideOpen(true);
  const handleConfirmHide = () => {
    setConfirmHideOpen(false);
    onPass();
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* ─── Action Buttons (TOP) — varies by interactionState ─── */}
      {/* Day 79 (Sasha 2026-05-22): CTA positions swapped. Was:
          [Don't show again]  [< N/M >]  [I'd like to meet]
          Now: [I'd like to meet]  [< N/M >]  [Don't show again]
          The primary action lands first in the left-to-right reading
          order so the user's eye finds the forward move before the
          dismissal. Nav arrows also enlarged from 32×32 to 44×44
          with stronger borders + shadows so the prev/next path is
          unmissable. */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {/* Left affordance: Primary "I'd like to meet" / interest pill / mutual banner */}
        {interactionState === "default" ? (
          <button
            onClick={onConnect}
            className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:translate-y-[-1px]"
            style={ceremonialPrimary}
            aria-label="Express interest in meeting this person"
          >
            <UserPlus
              className="w-3.5 h-3.5"
              style={{ color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))" }}
            />
            {connectLabel || "I'd like to meet"}
          </button>
        ) : interactionState === "interest-expressed" ? (
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "var(--skin-accent-gold, #b8860b)",
              background: "rgba(212, 175, 55, 0.10)",
              border: "0.5px solid rgba(212, 175, 55, 0.40)",
            }}
            role="status"
            aria-live="polite"
          >
            <Mail className="w-3.5 h-3.5" />
            Heads-up email sent
          </div>
        ) : (
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(20, 130, 70, 0.98)",
              background: "rgba(20, 130, 70, 0.10)",
              border: "0.5px solid rgba(20, 130, 70, 0.45)",
              boxShadow: "0 0 16px -4px rgba(20, 130, 70, 0.32)",
            }}
            role="status"
            aria-live="polite"
          >
            <Mail className="w-3.5 h-3.5" />
            Introduction sent
          </div>
        )}

        {/* Navigation indicator (same in all states) — bigger + clearer */}
        {typeof currentIndex === "number" && typeof totalCount === "number" && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={currentIndex === 0}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:translate-y-[-1px] hover:scale-[1.05] active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                ...navButton,
                borderWidth: "1px",
                boxShadow: "0 6px 20px -8px rgba(10, 22, 40, 0.28), 0 0 0 1px rgba(212, 175, 55, 0.18)",
              }}
              aria-label="Previous match"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.25} />
            </button>
            <span
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontVariantNumeric: "tabular-nums lining-nums",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--skin-text-primary, #0b2a5a)",
                textShadow:
                  "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
                minWidth: "2.5rem",
                textAlign: "center",
              }}
            >
              {currentIndex + 1}/{totalCount}
            </span>
            <button
              onClick={onNext}
              disabled={currentIndex === totalCount - 1}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:translate-y-[-1px] hover:scale-[1.05] active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                ...navButton,
                borderWidth: "1px",
                boxShadow: "0 6px 20px -8px rgba(10, 22, 40, 0.28), 0 0 0 1px rgba(212, 175, 55, 0.18)",
              }}
              aria-label="Next match"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.25} />
            </button>
          </div>
        )}

        {/* Right affordance: secondary "Don't show again" / Withdraw / hidden depending on state */}
        {interactionState === "default" ? (
          <button
            onClick={handleHideClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:translate-y-[-0.5px]"
            style={tertiaryPill}
          >
            <X className="w-3.5 h-3.5" />
            Don't show again
          </button>
        ) : interactionState === "interest-expressed" && onWithdraw ? (
          <button
            onClick={onWithdraw}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:translate-y-[-0.5px]"
            style={tertiaryPill}
            aria-label="Withdraw interest"
          >
            <X className="w-3.5 h-3.5" />
            Withdraw
          </button>
        ) : (
          // Reserve the slot so the pager stays centered.
          <span aria-hidden="true" className="w-[1px]" />
        )}

        {/* Confirmation dialog for the destructive "Don't show again". */}
        <AlertDialog open={confirmHideOpen} onOpenChange={setConfirmHideOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: 700,
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                Hide {user.firstName} from your matches?
              </AlertDialogTitle>
              {/* Day 87 (Sasha 2026-05-29) — confirmation strengthened.
                  Was weight 500 + muted color, which made a "permanent"
                  warning read as a footnote. Bumped to weight 600 +
                  full primary color so the consequence registers. No
                  halo needed (dialog bg is uniform popover surface
                  per ui_playbook). */}
              <AlertDialogDescription
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontWeight: 600,
                  color: "var(--skin-text-primary, #0a1628)",
                }}
              >
                You won't see this profile again. The change is permanent.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep showing</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmHide}>
                Hide forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* ─── State banner (above the profile card) for interest/mutual ─── */}
      {interactionState === "interest-expressed" && (
        <div
          className="rounded-xl px-4 py-3 mb-4"
          style={{
            background: "rgba(212, 175, 55, 0.08)",
            border: "0.5px solid rgba(212, 175, 55, 0.35)",
          }}
          role="status"
        >
          {/* Day 87 (Sasha 2026-05-29) — Strong cocktail applied.
              Was weight 600 + no halo + em-dash. Bumped to 700 + halo-
              strong + letter-spacing 0.01em (italic at body size needs
              breathing room per ui_playbook). Em-dash replaced with
              comma per Sasha's non-negotiable em-dash ban. */}
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontWeight: 700,
              fontSize: "13.5px",
              lineHeight: 1.55,
              letterSpacing: "0.01em",
              color: "var(--skin-text-primary, #0b2a5a)",
              fontStyle: "italic",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
            }}
          >
            A heads-up email is on its way to {user.firstName}. We'll send you both an intro the moment they say yes, and leave it quiet if they don't.
          </p>
        </div>
      )}
      {interactionState === "mutual" && (
        <div
          className="rounded-xl px-4 py-3 mb-4"
          style={{
            background: "rgba(20, 130, 70, 0.06)",
            border: "0.5px solid rgba(20, 130, 70, 0.40)",
            boxShadow: "0 0 24px -8px rgba(20, 130, 70, 0.35)",
          }}
          role="status"
        >
          {/* Day 87 (Sasha 2026-05-29) — Strong cocktail. Headline got
              halo-strong added; sub-line bumped weight 500 → 700 with
              halo-strong + 0.01em italic letter-spacing. The mutual
              moment is the most emotionally important state on the
              page; can't read as faint flavor text. */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: 1.4,
              color: "var(--skin-text-primary, #0b2a5a)",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
            }}
            className="mb-1"
          >
            ✦ Mutual interest. You both said yes.
          </p>
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontWeight: 700,
              fontSize: "13.5px",
              lineHeight: 1.55,
              letterSpacing: "0.01em",
              color: "var(--skin-text-primary, #0b2a5a)",
              fontStyle: "italic",
              textShadow:
                "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
            }}
          >
            We sent the introduction to both of your inboxes. Take it from there.
          </p>
        </div>
      )}

      {/* ─── Profile Card — parchment surface, Aurora editorial ─── */}
      <div className="rounded-2xl overflow-hidden" style={parchmentCard}>
        {/* Photo + Identity. Day 79 (Sasha 2026-05-22): the avatar slot
            no longer renders a Sparkles placeholder when the user
            hasn't uploaded a photo. Sasha: "the photo with this ugly
            space holder just doesn't look good." Empty avatar →
            entire circle hidden; the name + archetype now lead the
            card directly. */}
        <div className="flex flex-col items-center text-center p-6 pb-4">
          {user.avatarUrl && (
            <div
              className="w-24 h-24 rounded-full overflow-hidden mb-4 flex items-center justify-center"
              style={{
                background: "rgba(212, 175, 55, 0.10)",
                border: "0.5px solid rgba(212, 175, 55, 0.55)",
                boxShadow: "0 0 18px -6px rgba(212, 175, 55, 0.40)",
              }}
            >
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
            </div>
          )}

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

          {/* Day 80 (Sasha 2026-05-23): resonance score pill PARKED.
              "Resonance" wasn't grokable without a scale + explanation;
              shipping a number nobody understands is worse than no
              number. The `resonanceScore` prop stays wired through the
              component so reviving this with a real label + scale (or
              a visualisation like a ring) is a one-line render swap.
              Until then, only the matchType badge renders here. */}
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
          {/* Day 87 (Sasha 2026-05-29) — Strong cocktail.
              Was weight 600 + halo-soft. Bumped weight to 700 and
              halo-soft → halo-strong; the tagline is a one-line italic
              quote that needs to read as the card's emotional anchor,
              not faint flavor text. Letter-spacing kept at 0.005em
              (italic body Strong floor). */}
          {user.tagline && (
            <p
              className="mt-3 italic max-w-sm"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: "0.005em",
                fontSize: "14px",
                lineHeight: 1.55,
                color: "var(--skin-text-primary, #0b2a5a)",
                textShadow:
                  "var(--skin-text-halo-strong, 0 0 12px rgba(255,255,255,0.55), 0 1px 1px rgba(255,255,255,0.85))",
              }}
            >
              "{user.tagline}"
            </p>
          )}
        </div>

        {/* Day 80 (Sasha 2026-05-23): three collaboration proposals
            stacked one after another. Each carries its taxonomy root
            (Co-Build, Co-Learn, etc.) as a small label, then the
            bilateral proposal prose. Legacy single-proposal callers
            (the old matchReason / matchLabel API) still render
            correctly via the fallback below. */}
        <div className="px-6 pb-5 space-y-4">
          {proposals && proposals.length > 0 ? (
            <>
              {/* Section header above the proposals list */}
              <div
                className="pt-4"
                style={{
                  borderTop: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
                }}
              >
                <p style={eyebrowGold} className="mb-3">
                  Ways you could collaborate
                </p>
                <div className="space-y-4">
                  {proposals.map((p, i) => (
                    <div
                      key={i}
                      className={i > 0 ? "pt-4" : ""}
                      style={
                        i > 0
                          ? {
                              borderTop:
                                "0.5px dashed var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
                            }
                          : undefined
                      }
                    >
                      <p
                        style={{
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontWeight: 600,
                          fontSize: "10px",
                          letterSpacing: "0.18em",
                          textTransform: "uppercase",
                          color: "var(--skin-goldDeep, #5d4307)",
                          marginBottom: "6px",
                        }}
                      >
                        {p.type}
                      </p>
                      <p
                        style={{
                          ...sourceSerifBody,
                          fontSize: "14.5px",
                          lineHeight: 1.6,
                        }}
                      >
                        {p.proposal}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why this works (secondary signal, kept) */}
              {secondaryReason && (
                <div
                  className="pt-4"
                  style={{
                    borderTop:
                      "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
                  }}
                >
                  <p style={eyebrowGold} className="mb-2">
                    {secondaryLabel || "Why this works"}
                  </p>
                  <p
                    style={{
                      ...sourceSerifBody,
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {secondaryReason}
                  </p>
                </div>
              )}

              {/* Friction line (kept) */}
              {tertiaryReason && (
                <div
                  className="pt-4"
                  style={{
                    borderTop:
                      "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
                  }}
                >
                  <p
                    style={{
                      ...eyebrowGold,
                      color: "rgba(184, 92, 11, 0.95)",
                    }}
                    className="mb-2"
                  >
                    {tertiaryLabel || "Watch out for"}
                  </p>
                  <p
                    style={{
                      ...sourceSerifBody,
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {tertiaryReason}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Legacy single-proposal render path (no proposals[] passed). */}
              {matchReason && (
                <div
                  className="pt-4"
                  style={{
                    borderTop:
                      "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
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
                    }}
                  >
                    {matchReason}
                  </p>
                </div>
              )}

              {secondaryReason && (
                <div
                  className="pt-4"
                  style={{
                    borderTop:
                      "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
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
                    borderTop:
                      "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
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
                      ...sourceSerifBody,
                      fontSize: "14px",
                      lineHeight: 1.6,
                    }}
                  >
                    {tertiaryReason}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const areEqual = (prev: MatchCardProps, next: MatchCardProps) => {
  // Day 80 (Sasha 2026-05-23): proposals array comparison via length +
  // first-proposal stable key. Same-user-id matches usually carry the
  // same proposal set; if proposal contents differ between renders
  // (rare — only after a re-fetch) the user.id check above already
  // catches the new candidate.
  const prevProposalsLen = prev.proposals?.length ?? 0;
  const nextProposalsLen = next.proposals?.length ?? 0;
  if (prevProposalsLen !== nextProposalsLen) return false;
  if (
    prevProposalsLen > 0 &&
    prev.proposals![0]?.proposal !== next.proposals![0]?.proposal
  ) {
    return false;
  }
  return (
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
    prev.resonanceScore === next.resonanceScore &&
    prev.currentIndex === next.currentIndex &&
    prev.interactionState === next.interactionState
  );
};

export default memo(MatchCard, areEqual);
