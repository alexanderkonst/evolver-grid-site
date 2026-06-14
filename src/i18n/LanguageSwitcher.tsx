import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";

import { SUPPORTED_LANGUAGES } from "./config";
import { buildLocalePath, LOCALE_STORAGE_KEY } from "./localeScope";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  /** Positioning / sizing classes applied to the trigger pill. */
  className?: string;
}

/**
 * Global language switcher. A compact glassy globe pill (current locale code)
 * that opens a menu of all supported languages in their own script. Selecting
 * one persists the choice to localStorage and navigates to the locale-prefixed
 * URL (locale is a URL prefix: /ru, /es), preserving path + query + hash and
 * composing correctly with the white-label skin basename via buildLocalePath.
 *
 * Mounted once at App root (fixed top-right) so it is discoverable on every
 * surface — the funnel landing, the in-app shell, and the marketing pages.
 * The chip carries its own translucent background, so it stays legible on both
 * the dark funnel header and the light marketing pages.
 */
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const active =
    SUPPORTED_LANGUAGES.find((l) => l.code === current) ?? SUPPORTED_LANGUAGES[0];

  const switchTo = (code: string) => {
    if (code === current) return;
    // Persist first so the choice sticks even when the user later returns to a
    // non-prefixed URL. Then full-navigate so the router re-reads the basename.
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
    window.location.assign(
      buildLocalePath(code, window.location.pathname) +
        window.location.search +
        window.location.hash,
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language.label", "Language")}
        className={[
          "inline-flex items-center gap-1.5 rounded-full border border-border/50",
          "bg-background/70 px-3 py-1.5 text-sm font-medium text-foreground/80 shadow-sm",
          "backdrop-blur-md transition-colors hover:text-foreground hover:border-border",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className ?? "",
        ].join(" ")}
      >
        <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="uppercase tracking-wide">{active.code}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {SUPPORTED_LANGUAGES.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => switchTo(l.code)}
            className="flex cursor-pointer items-center justify-between gap-3"
            aria-current={l.code === current}
          >
            <span>{l.native}</span>
            {l.code === current && (
              <Check className="h-4 w-4 opacity-70" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
