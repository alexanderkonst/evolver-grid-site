import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/locales/en/common.json";
import ruCommon from "@/locales/ru/common.json";
import esCommon from "@/locales/es/common.json";

import {
  DEFAULT_LANGUAGE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LNGS,
  initialLocaleScope,
  isSupportedLng,
} from "./localeScope";

/**
 * i18n engine — Phase 0 / Increment 1 (2026-06-13). Russian-first, then Spanish.
 * Scope of work: docs/specs/i18n/scope_of_work.md
 *
 * Language resolution, in priority order:
 *   1. URL locale prefix (/ru, /es) — set once at module load (initialLocaleScope),
 *      composed with the skin-scope basename so /ru/aurum/… works.
 *   2. localStorage — the visitor's explicit prior switcher choice.
 *   3. English — the default for fresh funnel traffic. Browser auto-detection is
 *      intentionally OFF until the locale experience is reviewed live; turning it
 *      on later is one line (add navigator language to resolveInitialLanguage).
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "es", label: "Spanish", native: "Español" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export { DEFAULT_LANGUAGE, LOCALE_STORAGE_KEY } from "./localeScope";

export const resources = {
  en: { common: enCommon },
  ru: { common: ruCommon },
  es: { common: esCommon },
} as const;

const resolveInitialLanguage = (): string => {
  if (initialLocaleScope) return initialLocaleScope.lng;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSupportedLng(stored)) return stored as string;
  } catch {
    /* localStorage unavailable (private mode) — fall through to default */
  }
  return DEFAULT_LANGUAGE;
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: resolveInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LNGS],
    defaultNS: "common",
    ns: ["common"],
    interpolation: { escapeValue: false },
    returnNull: false,
    react: { useSuspense: false },
  });
}

// Persist the active locale and keep <html lang> in sync (a11y, SEO, browser
// translate prompts). Persisting on change makes the switcher's choice sticky
// even when navigating back to a non-prefixed (English-default) URL.
i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined" && lng) {
    document.documentElement.lang = lng;
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.resolvedLanguage || DEFAULT_LANGUAGE;
}

export default i18n;
