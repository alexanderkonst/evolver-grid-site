/**
 * Sasha-only admin gate.
 *
 * Mirrors the inline ADMIN_EMAILS list already used by AdminMissionParticipants,
 * AdminGeniusOffers, and AdminContentManager. Extracted here so the Phase-1
 * founder-state pages (FoundersIndex, FounderDetail, Dashboard) share one
 * source of truth without forcing a refactor of the existing admin pages.
 *
 * If the project later adopts a `profiles.role = 'admin'` column or an
 * OWNER_USER_IDS env array, update this module only.
 */
export const ADMIN_EMAILS: readonly string[] = [
  "alexanderkonst@gmail.com",
  "alex@evolvergrid.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
