import { useTranslation } from "react-i18next";

import { SUPPORTED_LANGUAGES } from "./config";
import { buildLocalePath, LOCALE_STORAGE_KEY } from "./localeScope";

interface LanguageSwitcherProps {
  className?: string;
}

/**
 * Phase 0 i18n pilot switcher. Soft (in-place) language switch via i18next,
 * persisted to localStorage by the detector cache. URL-prefix / SEO routing
 * and the final placement (global menu / Settings) land in later increments.
 */
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div className={className} role="group" aria-label={t("language.label", "Language")}>
      {SUPPORTED_LANGUAGES.map((lng) => {
        const active = current === lng.code;
        return (
          <button
            key={lng.code}
            type="button"
            onClick={() => {
              // Locale is a URL prefix (/ru, /es), so switching is a full
              // navigation that re-reads the basename. Persist first so the
              // choice sticks even when returning to a non-prefixed URL.
              try {
                localStorage.setItem(LOCALE_STORAGE_KEY, lng.code);
              } catch {
                /* ignore */
              }
              window.location.assign(
                buildLocalePath(lng.code, window.location.pathname) +
                  window.location.search +
                  window.location.hash,
              );
            }}
            aria-pressed={active}
            className={[
              "rounded-full px-3 py-1 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {lng.native}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
