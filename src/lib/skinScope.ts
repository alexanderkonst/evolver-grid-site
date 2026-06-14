/**
 * skinScope — module-level route-prefix skin scope detection.
 *
 * Day 91 (Sasha 2026-06-09): extracted from App.tsx so BOTH App.tsx
 * (router basename + ScopeLock mounting) and GameShellV2 (full-rail
 * demo gating) can read the same truth without a circular import.
 *
 * Evaluated ONCE at module load, like the original App.tsx logic:
 * route-scoped skins require a full page load to enter/exit (the
 * router basename is fixed for the SPA session), so a static read of
 * window.location at load time is correct by construction.
 *
 * The distinction this module exists to preserve (toggle-era rule):
 *   route scope  = "visitor is on a demo/white-label URL prefix"
 *   skin value   = "whatever theme is currently painted"
 * Behavioral gates (e.g. showing the FULL rail to logged-out guests
 * on demo surfaces) must key on ROUTE SCOPE — a user who merely
 * persisted the Aurum dark theme is NOT on a demo surface.
 */

import { pathWithoutLocale } from "@/i18n/localeScope";

export interface SkinScope {
  prefix: string;
  skin: string;
}

export const SKIN_PREFIXES: SkinScope[] = [
  { prefix: "/ns", skin: "network-school" },
  { prefix: "/daouniverse", skin: "daouniverse" },
  { prefix: "/planetir", skin: "planetir" },
  // Day 91: the dark theme graduated to the first-class "aurum" skin
  // (sister to "lapis", the light default). /aurum is the canonical
  // demo prefix; /darktheme is kept as a back-compat alias so shared
  // links keep working.
  { prefix: "/aurum", skin: "aurum" },
  { prefix: "/darktheme", skin: "aurum" },
  { prefix: "/techstars", skin: "techstars" },
];

export const initialSkinScope: SkinScope | undefined =
  typeof window !== "undefined"
    ? (() => {
        // Detect the skin on the path with any locale prefix (/ru, /es) stripped,
        // so /ru/aurum still registers as the aurum demo scope.
        const path = pathWithoutLocale(window.location.pathname);
        return SKIN_PREFIXES.find(
          ({ prefix }) => path === prefix || path.startsWith(prefix + "/")
        );
      })()
    : undefined;
