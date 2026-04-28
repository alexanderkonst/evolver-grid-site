/**
 * EntitlementBadge — small editorial badge surfacing the user's tier.
 *
 * Day 53 night iter 4 (Sasha 2026-04-27): when a user has been gifted
 * Builder / Locked-in / Founders 50 / Ignition tier, this badge appears
 * in their profile/settings/dashboard surfaces so they know what they
 * have without needing to check Stripe. Brand-coherent (Cormorant +
 * gold) and silent on the default `tasting` tier (most users).
 *
 * Usage:
 *   <EntitlementBadge />              // reads from useEntitlement()
 *   <EntitlementBadge tier="builder" /> // override (admin/preview)
 */

import { useEntitlement, tierLabel, type EntitlementTier } from "@/hooks/useEntitlement";

type Props = {
  /** Override the displayed tier. When omitted, reads from useEntitlement(). */
  tier?: EntitlementTier;
  /** Show "· gifted by Sasha" subtext on gifted_* tiers. Default: true. */
  showGiftCredit?: boolean;
  /** When true, show even on `tasting` (default: hide so most users see nothing). */
  showOnTasting?: boolean;
};

export function EntitlementBadge({ tier: tierOverride, showGiftCredit = true, showOnTasting = false }: Props) {
  const fromHook = useEntitlement();
  const tier = tierOverride ?? fromHook.tier;
  const isGifted = tierOverride
    ? tierOverride === "gifted_builder" || tierOverride === "gifted_locked_in"
    : fromHook.isGifted;
  const isLoading = !tierOverride && fromHook.isLoading;

  if (isLoading) return null;
  if (tier === "tasting" && !showOnTasting) return null;

  const labelText = tierLabel(tier);

  return (
    <span
      className="inline-flex items-baseline gap-1.5"
      title={
        isGifted
          ? `${labelText} access — gifted access. No subscription required.`
          : `${labelText} tier`
      }
    >
      <span
        aria-hidden="true"
        style={{
          color: "var(--skin-accent-gold, #b8860b)",
          textShadow: "var(--skin-accent-gold-glow, 0 0 6px rgba(240,194,127,0.55))",
          fontSize: "10px",
        }}
      >
        ✦
      </span>
      <span
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
          fontSize: "11.5px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--skin-accent-gold, #b8860b)",
        }}
      >
        {labelText}
      </span>
      {isGifted && showGiftCredit && (
        <span
          className="italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: "11px",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
          }}
        >
          · gifted by Sasha
        </span>
      )}
    </span>
  );
}
