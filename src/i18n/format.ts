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
