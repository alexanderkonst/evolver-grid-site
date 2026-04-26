/**
 * Top Talent reveal — share-slug generation.
 *
 * Day 52 (Sasha 2026-04-26): each `zog_snapshots` row gets a short,
 * URL-safe slug used in the public reveal route /reveal/<slug>. The
 * slug is generated client-side and persisted on first save; collision
 * is statistically negligible at 6 alphanumeric chars (~2.18e9 space)
 * for the expected user volume, and the unique index in Postgres will
 * surface any rare collision so we can retry.
 *
 * Pattern matches the UBB dossier slug helper:
 *   `Math.random().toString(36).slice(2, 8)` → 6 chars [a-z0-9]
 *
 * Reserved prefix `r-` marks the namespace as "reveal" so we can grow
 * other public namespaces (dossier, landing page, etc.) without
 * crossing wires. Final shape: `r-8x4f2a`.
 */

const SLUG_PREFIX = "r-";

/** Generate a fresh 6-char short id with the reveal prefix. */
export const generateRevealSlug = (): string => {
  const tail = Math.random().toString(36).slice(2, 8).padEnd(6, "0");
  return `${SLUG_PREFIX}${tail}`;
};

/**
 * Sanitize a user-supplied slug (when we expose username override later).
 * Lowercase, alphanumeric + hyphen, max 32 chars, no leading/trailing
 * hyphen. Returns empty string if the result would be invalid — caller
 * decides whether to fall back to the auto-generated id.
 */
export const sanitizeUserSlug = (raw: string): string => {
  if (!raw) return "";
  const cleaned = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  // Must contain at least one alphanumeric char
  if (!/[a-z0-9]/.test(cleaned)) return "";
  return cleaned;
};
