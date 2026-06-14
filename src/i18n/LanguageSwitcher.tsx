import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
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
 * The chip carries its own translucent background, so it stays legible on both
 * the dark funnel header and the light marketing pages. This is the reusable
 * control; placement/visibility is decided by the caller (the guest-only global
 * mount below, or the Settings "Language" row for logged-in users).
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

/**
 * Global mount: the language choice is a cold-traffic decision, so the floating
 * switcher shows ONLY to logged-out visitors (the people actually picking a
 * language). Once signed in, the choice has persisted and the chrome stays
 * clean — logged-in users change language from the Settings → Profile "Language"
 * row instead. Renders nothing until the session is confirmed absent, so there
 * is no flash for authenticated users.
 */
export const GlobalLanguageSwitcher = () => {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsGuest(!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (mounted) setIsGuest(!session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isGuest) return null;
  return <LanguageSwitcher className="fixed top-3 right-3 z-50" />;
};

export default LanguageSwitcher;
