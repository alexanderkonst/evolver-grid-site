import { isAdminEmail } from "@/lib/isAdmin";

/**
 * BUILD rail rows whose destination is admin-only (RequireAdmin route /
 * admin-role API). Hidden for everyone else instead of dead-ending in a
 * silent redirect or a "Forbidden" banner.
 */
export const ADMIN_ONLY_ROW_IDS: ReadonlySet<string> = new Set([
  "commercial-os",
  "founder-cockpit-dashboard",
]);

export function filterAdminOnlyRows<T extends { id: string }>(
  sections: T[],
  email: string | null | undefined,
): T[] {
  if (isAdminEmail(email)) return sections;
  return sections.filter((s) => !ADMIN_ONLY_ROW_IDS.has(s.id));
}
