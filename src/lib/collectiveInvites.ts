import { supabase } from "@/integrations/supabase/client";
import { localizedOrigin } from "@/i18n/localeScope";

/**
 * Collective invite links (WP2). The rules (single use, 30 days, who becomes a member) live
 * in two SQL functions, `check_collective_invite` and `redeem_collective_invite`; this file
 * only asks them and tidies their one-word answers. Admin helpers write `collective_invites`
 * directly (RLS: admin only).
 *
 * Spec: docs/specs/collective/build_spec.md (v0.2) → WP2.
 */

export type InviteStatus = "ok" | "used" | "expired" | "invalid" | "already_member";

/** What the redeem page shows when the link cannot be used. */
export type InviteFailure = "used" | "expired" | "invalid";

const KNOWN_STATUSES: readonly InviteStatus[] = ["ok", "used", "expired", "invalid", "already_member"];

/** Anything the database does not say plainly is «invalid»: the calm screen is the safe default. */
export function normalizeInviteStatus(value: unknown): InviteStatus {
  return typeof value === "string" && (KNOWN_STATUSES as readonly string[]).includes(value)
    ? (value as InviteStatus)
    : "invalid";
}

/** ok and already_member both lead to the profile screen; the rest are a dead link. */
export function inviteFailure(status: InviteStatus): InviteFailure | null {
  return status === "ok" || status === "already_member" ? null : status;
}

export const COLLECTIVE_INVITE_PREFIX = "/join/collective";

/** Route params arrive URL-decoded; keep only what the code alphabet allows before asking the database. */
const CODE_SHAPE = /^[A-Za-z0-9_-]{12,64}$/;
export const looksLikeInviteCode = (code: string | undefined): code is string => !!code && CODE_SHAPE.test(code);

export const invitePath = (code: string): string => `${COLLECTIVE_INVITE_PREFIX}/${code}`;

/** The full link an admin copies: current origin (and locale prefix) plus the path. */
export const inviteUrl = (code: string): string => `${localizedOrigin()}${invitePath(code)}`;

/** Where a signed-out visitor goes to sign up or sign in, and how they come back: the same `?redirect=` RequireAuth uses. */
export const authPathForInvite = (code: string): string => `/auth?redirect=${encodeURIComponent(invitePath(code))}`;

/**
 * Where a new member lands. The members' space (`/game/collective`) arrives with WP3; until
 * that route exists a link there is a 404, so this stays false and the member goes to `/game`.
 * WP3 flips it to true.
 */
export const COLLECTIVE_SPACE_LIVE = false;
export const COLLECTIVE_HOME_PATH = "/game/collective";
export const collectiveLandingPath = (): string => (COLLECTIVE_SPACE_LIVE ? COLLECTIVE_HOME_PATH : "/game");

/** Anyone, signed in or not: is this link still good? Never throws. */
export async function checkCollectiveInvite(code: string): Promise<InviteStatus> {
  const { data, error } = await supabase.rpc("check_collective_invite", { p_code: code });
  if (error) return "invalid";
  const status = normalizeInviteStatus(data);
  return status === "already_member" ? "invalid" : status;
}

/** Signed-in players only. Throws on a transport error so the page can say «try again» instead of «expired». */
export async function redeemCollectiveInvite(code: string): Promise<InviteStatus> {
  const { data, error } = await supabase.rpc("redeem_collective_invite", { p_code: code });
  if (error) throw error;
  return normalizeInviteStatus(data);
}

/* ------------------------------------------------------------------------------------------ */
/* The four-field profile                                                                      */
/* ------------------------------------------------------------------------------------------ */

export interface CollectiveProfileInput {
  uniquenessLine: string;
  offers: string;
  seeks: string;
  siteUrl: string;
}

export const PROFILE_LIMITS = { uniquenessLine: 200, offers: 500, seeks: 500, siteUrl: 300 } as const;

export type ProfileError = "uniquenessRequired" | "siteInvalid";

export interface ProfileRow {
  uniqueness_line: string;
  offers: string | null;
  seeks: string | null;
  site_url: string | null;
}

/**
 * The site link, made safe to show later as a link: http(s) only. «mysite.com» becomes
 * «https://mysite.com». Returns null for empty, undefined for something that is not a web address.
 */
export function normalizeSiteUrl(raw: string): string | null | undefined {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (!url.hostname.includes(".")) return undefined;
    return url.toString().slice(0, PROFILE_LIMITS.siteUrl);
  } catch {
    return undefined;
  }
}

/** Pure: trims, bounds, and says what is wrong. Only the uniqueness line is required. */
export function buildProfileRow(input: CollectiveProfileInput): { row: ProfileRow } | { error: ProfileError } {
  const uniqueness = input.uniquenessLine.trim().slice(0, PROFILE_LIMITS.uniquenessLine);
  if (!uniqueness) return { error: "uniquenessRequired" };
  const site = normalizeSiteUrl(input.siteUrl);
  if (site === undefined) return { error: "siteInvalid" };
  const optional = (text: string, max: number) => text.trim().slice(0, max) || null;
  return {
    row: {
      uniqueness_line: uniqueness,
      offers: optional(input.offers, PROFILE_LIMITS.offers),
      seeks: optional(input.seeks, PROFILE_LIMITS.seeks),
      site_url: site,
    },
  };
}

/** The member's own row (RLS: a member updates only their own; column grant limits it to these four). */
export async function saveCollectiveProfile(userId: string, row: ProfileRow): Promise<void> {
  const { error } = await supabase.from("collective_members").update(row).eq("user_id", userId);
  if (error) throw error;
}

export async function loadOwnCollectiveProfile(userId: string): Promise<CollectiveProfileInput> {
  const { data, error } = await supabase
    .from("collective_members")
    .select("uniqueness_line, offers, seeks, site_url")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return {
    uniquenessLine: data?.uniqueness_line ?? "",
    offers: data?.offers ?? "",
    seeks: data?.seeks ?? "",
    siteUrl: data?.site_url ?? "",
  };
}

/* ------------------------------------------------------------------------------------------ */
/* Admin: create and list invites                                                              */
/* ------------------------------------------------------------------------------------------ */

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"; // 64 symbols: no modulo bias on a byte
export const INVITE_CODE_LENGTH = 16;

/** 16 random URL-safe characters (96 bits) from the browser's crypto source. */
export function generateInviteCode(length: number = INVITE_CODE_LENGTH): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export interface OpenInvite {
  code: string;
  created_at: string;
  expires_at: string;
}

export async function createCollectiveInvite(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const adminId = data.session?.user.id;
  if (!adminId) throw new Error("not signed in");
  const code = generateInviteCode();
  const { error } = await supabase.from("collective_invites").insert({ code, created_by: adminId });
  if (error) throw error;
  return code;
}

/** Unused, unexpired invites, newest first. */
export async function listOpenInvites(limit = 10): Promise<OpenInvite[]> {
  const { data, error } = await supabase
    .from("collective_invites")
    .select("code, created_at, expires_at")
    .is("used_by", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function deleteCollectiveInvite(code: string): Promise<void> {
  const { error } = await supabase.from("collective_invites").delete().eq("code", code);
  if (error) throw error;
}

/** Whole days left, rounded up; 0 when already past. Pure, for the list and tests. */
export function daysLeft(expiresAt: string, now: Date = new Date()): number {
  const ms = new Date(expiresAt).getTime() - now.getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000);
}

/* ------------------------------------------------------------------------------------------ */
/* The entry-guard exception                                                                   */
/* ------------------------------------------------------------------------------------------ */

/**
 * The one place the onboarding redirect (GameShellV2) may step aside: the members' space. Exact
 * `/game/collective` or anything under `/game/collective/`; a look-alike such as
 * `/game/collectivefoo` does not count. `/join/collective/*` is not under `/game`, so that guard
 * never reaches it. The shell still requires the `collective_member` role before it steps aside.
 */
export function isCollectiveEntryPath(pathname: string): boolean {
  return pathname === COLLECTIVE_HOME_PATH || pathname.startsWith(`${COLLECTIVE_HOME_PATH}/`);
}
