import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import ruCommon from "@/locales/ru/common.json";
import esCommon from "@/locales/es/common.json";

/**
 * i18n engine — Phase 0 (2026-06-13). Russian-first, then Spanish.
 *
 * Scope of work: docs/specs/i18n/scope_of_work.md
 *
 * This file owns the single i18next instance. Resources are bundled
 * statically for now (one `common` namespace). When bundles grow, split
 * per-route namespaces and switch to lazy loading via i18next-http-backend
 * (see README in this folder). Detection is localStorage -> navigator; the
 * URL-prefix locale (/ru, /es) composed with the skin-scope basename lands
 * in a later Phase 0 increment.
 */

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "es", label: "Spanish", native: "Español" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "en";
export const LOCALE_STORAGE_KEY = "app-language";

export const resources = {
  en: { common: enCommon },
  ru: { common: ruCommon },
  es: { common: esCommon },
} as const;

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
      defaultNS: "common",
      ns: ["common"],
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: LOCALE_STORAGE_KEY,
        caches: ["localStorage"],
      },
      interpolation: { escapeValue: false },
      returnNull: false,
      react: { useSuspense: false },
    });
}

// Keep the document's lang attribute in sync with the active locale —
// matters for screen readers, browser translation prompts, and SEO.
const syncHtmlLang = (lng: string) => {
  if (typeof document !== "undefined" && lng) {
    document.documentElement.lang = lng;
  }
};
syncHtmlLang(i18n.resolvedLanguage || DEFAULT_LANGUAGE);
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
