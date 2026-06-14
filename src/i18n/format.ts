import i18n from "./config";

/**
 * Locale-aware formatting via the Intl API. Replaces hardcoded en-US
 * `toLocaleDateString`/`toLocaleString` calls. The active locale follows
 * i18next, so dates/numbers/currency reformat when the user switches
 * language. Phase 1 sweeps the existing en-US call sites onto these.
 */

const activeLocale = (): string => i18n.resolvedLanguage || i18n.language || "en";

export const formatDate = (
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string => new Intl.DateTimeFormat(activeLocale(), options).format(new Date(value));

export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(activeLocale(), options).format(value);

export const formatCurrency = (
  value: number,
  currency = "USD",
  options?: Intl.NumberFormatOptions,
): string =>
  new Intl.NumberFormat(activeLocale(), {
    style: "currency",
    currency,
    ...options,
  }).format(value);

/**
 * Locale-aware clock. The 12h/24h convention follows the active locale by
 * default (en → 12h with AM/PM, ru/es → 24h), so RU/ES users stop seeing a
 * hardcoded English "3:00 PM". Pass hour12 to force a convention.
 */
export const formatTime = (
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" },
): string => new Intl.DateTimeFormat(activeLocale(), options).format(new Date(value));

/**
 * Compact number ("12.5K", "1,2 тыс.") in the active locale — replaces
 * hand-rolled `$${(v/1000).toFixed(1)}K` builders that hardcode the English
 * abbreviation.
 */
export const formatCompact = (
  value: number,
  options?: Intl.NumberFormatOptions,
): string =>
  new Intl.NumberFormat(activeLocale(), { notation: "compact", ...options }).format(value);
