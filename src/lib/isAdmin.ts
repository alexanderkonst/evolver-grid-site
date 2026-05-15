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
// Day 64 (Sasha, 2026-05-07): three emails — main account + MIT alum
// alias + Sloan alias. Mirrored exactly in the SQL function
// `public.has_role()` and trigger `grant_admin_on_magic_email_signup()`
// (migration: 20260515170100_admin_email_lock.sql). To add an email,
// edit BOTH sources: this constant AND the migration's two array
// literals, then ship a follow-up migration.
export const ADMIN_EMAILS: readonly string[] = [
  "alexanderkonst@gmail.com",
  "konst@alum.mit.edu",
  "me@sloan.mit.edu",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
