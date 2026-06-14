/**
 * localeScope — URL-prefix locale detection, sibling to `src/lib/skinScope.ts`.
 *
 * The locale lives as the OUTERMOST path segment and composes with the
 * skin-scope basename: `/ru`, `/ru/aurum`, `/es/planetir`, … English is the
 * default and carries no prefix. Like skinScope, this is read once at module
 * load (the router basename is fixed for the SPA session; switching locale is a
 * full navigation that re-reads the URL). See docs/specs/i18n/scope_of_work.md.
 */

export const DEFAULT_LANGUAGE = "en";
export const LOCALE_STORAGE_KEY = "app-language";

export const SUPPORTED_LNGS = ["en", "ru", "es"] as const;
export type SupportedLng = (typeof SUPPORTED_LNGS)[number];

export const isSupportedLng = (value: string | null | undefined): boolean =>
  !!value && (SUPPORTED_LNGS as readonly string[]).includes(value);

export interface LocaleScope {
  prefix: string;
  lng: string;
}

// English is the default and has no prefix, so it is intentionally not listed.
export const LOCALE_PREFIXES: LocaleScope[] = [
  { prefix: "/ru", lng: "ru" },
  { prefix: "/es", lng: "es" },
];

export const detectLocaleScope = (pathname: string): LocaleScope | undefined =>
  LOCALE_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );

export const initialLocaleScope: LocaleScope | undefined =
  typeof window !== "undefined"
    ? detectLocaleScope(window.location.pathname)
    : undefined;

/** The path with any leading locale prefix removed (always starts with "/"). */
export const pathWithoutLocale = (pathname: string): string => {
  const found = detectLocaleScope(pathname);
  if (!found) return pathname;
  const rest = pathname.slice(found.prefix.length);
  return rest.startsWith("/") ? rest : `/${rest}`;
};

/** Build the URL path for a target language, preserving the in-app path + skin scope. */
export const buildLocalePath = (lng: string, pathname: string): string => {
  const base = pathWithoutLocale(pathname); // always starts with "/"
  const prefix = lng === DEFAULT_LANGUAGE ? "" : `/${lng}`;
  if (base === "/") return prefix || "/";
  return `${prefix}${base}`;
};

/**
 * `window.location.origin` with the active locale prefix appended, for building
 * ABSOLUTE return/redirect URLs (magic links, OAuth, Stripe, share links) that
 * must bring the user back to the SAME locale they left from. `window.location.origin`
 * is scheme+host only and drops the /ru or /es prefix, which would silently boot
 * RU/ES users into the English site on return. Use this instead of bare origin.
 */
export const localizedOrigin = (): string => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${initialLocaleScope?.prefix ?? ""}`;
};
