/**
 * Auth-link error parsing.
 *
 * When an email link (signup confirmation, magic link) is expired or already
 * used, Supabase redirects back with the failure in the URL fragment, e.g.
 *   /game/settings#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
 * (PKCE flows put the same params in the query string instead).
 */

export interface AuthLinkError {
    /** Supabase `error_code`, e.g. "otp_expired". */
    code: string | null;
    /** OAuth-style `error`, e.g. "access_denied". */
    error: string | null;
    /** Human-readable `error_description` (already URL-decoded). */
    description: string | null;
    /** True when the link is simply expired / already used — resendable. */
    expired: boolean;
}

/**
 * Parse a `location.hash` or `location.search` string. Returns null when the
 * string carries no auth-link error.
 */
export function parseAuthLinkError(hashOrSearch: string | null | undefined): AuthLinkError | null {
    if (!hashOrSearch) return null;
    const params = new URLSearchParams(hashOrSearch.replace(/^[#?]/, ""));
    const error = params.get("error");
    const code = params.get("error_code");
    if (!error && !code) return null;
    return {
        code,
        error,
        description: params.get("error_description"),
        expired: code === "otp_expired",
    };
}
