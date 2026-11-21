/**
 * authErrors: Supabase auth failures as plain one-liners (issue #375, same pattern as #370 / PR #374).
 * The raw Supabase / HTTP text ("Invalid login credentials", "Failed to fetch", a status code)
 * is never shown to a player. Pure: the caller passes `t`.
 */

export type AuthErrorLike = { message?: string; code?: string; status?: number } | null | undefined;

type Translate = (key: string) => string;

const errorText = (error: AuthErrorLike) => `${error?.code ?? ""} ${error?.message ?? ""}`.toLowerCase();

export const isRateLimitError = (error: AuthErrorLike) =>
  error?.status === 429 ||
  /rate_limit|rate limit|for security purposes|only request this after/.test(errorText(error));

export const isUnconfirmedError = (error: AuthErrorLike) => /email_not_confirmed|not confirmed/.test(errorText(error));

export const isWeakPasswordError = (error: AuthErrorLike) =>
  /weak_password|password should be|known to be weak|pwned|breach/.test(errorText(error));

export const isInvalidCredentialsError = (error: AuthErrorLike) =>
  /invalid_credentials|invalid login credentials/.test(errorText(error));

/** The one line for a failed sign-up (or a failed save of an account). */
export const signUpErrorLine = (error: AuthErrorLike, t: Translate): string =>
  isRateLimitError(error)
    ? t("auth.signUpRateLimit")
    : isWeakPasswordError(error)
      ? t("auth.signUpWeakPassword")
      : isUnconfirmedError(error)
        ? t("auth.signUpUnconfirmed")
        : t("auth.signUpGenericError");

/** The one line for a failed log-in. */
export const loginErrorLine = (error: AuthErrorLike, t: Translate): string =>
  isRateLimitError(error)
    ? t("auth.signUpRateLimit")
    : isUnconfirmedError(error)
      ? t("auth.loginUnconfirmed")
      : isInvalidCredentialsError(error)
        ? t("auth.loginInvalid")
        : t("auth.loginGenericError");

/** The one line for a magic link or a reset email that did not go out. */
export const emailSendErrorLine = (error: AuthErrorLike, t: Translate, genericKey: string): string =>
  isRateLimitError(error) ? t("auth.signUpRateLimit") : t(genericKey);
