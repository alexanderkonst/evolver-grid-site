import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isGameRoute, trackGameOpen, trackRevealSeen } from "@/lib/returnMetric";

/**
 * Fires `reveal_seen` when the top-talent reveal card mounts. One call inside the card
 * (RevelatoryHero); the per-device dedupe lives in `trackRevealSeen`.
 */
export function useRevealSeen(talent: string): void {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current || !talent) return;
    sent.current = true;
    trackRevealSeen(talent);
  }, [talent]);
}

/**
 * Fires `game_open` when a game route is on screen, at most once per local day per device.
 * Mounted once at App level (inside the router), so it covers `/`, `/village`, `/game/*`
 * and the `/es` `/ru` prefixes without touching any route.
 */
export function useGameOpen(): void {
  const { pathname, search } = useLocation();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? "en";
  useEffect(() => {
    if (isGameRoute(pathname, search)) trackGameOpen(locale);
  }, [pathname, search, locale]);
}
