import { useEffect } from "react";
import type { SkyPalette } from "./sunLight";

/**
 * Lets the world follow the light. While `enabled`, writes the sky palette to
 * `--nc-sky-top` / `--nc-sky-bottom` on <html> and sets `data-natural-sky="on"`;
 * the Lunar skin's `[data-natural-sky="on"] body` rule in
 * `src/styles/lunar-world.css` paints the village sky from them. Removes
 * everything on cleanup or when disabled, so nothing changes for a player who
 * does not have the preview flag.
 */
export function useNaturalSky(sky: SkyPalette, enabled: boolean): void {
  const { top, bottom } = sky;
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--nc-sky-top", top);
    root.style.setProperty("--nc-sky-bottom", bottom);
    root.setAttribute("data-natural-sky", "on");
    return () => {
      root.style.removeProperty("--nc-sky-top");
      root.style.removeProperty("--nc-sky-bottom");
      root.removeAttribute("data-natural-sky");
    };
  }, [enabled, top, bottom]);
}
