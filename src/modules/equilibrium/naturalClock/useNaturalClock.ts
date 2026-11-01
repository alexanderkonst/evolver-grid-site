import { useCallback, useEffect, useMemo, useState } from "react";
import { computeNaturalClock, type NaturalClockState } from "./naturalClock";
import { timezoneGeo, type GeoPoint } from "./sunLight";

export type LocationStatus = "idle" | "asking" | "denied" | "unavailable";

export interface NaturalClockOverrides {
  /** Freeze the clock at this moment (preview / screenshots). */
  now?: Date;
  /** Use this place instead of the device's. */
  geo?: GeoPoint;
}

export interface UseNaturalClock {
  clock: NaturalClockState;
  locationStatus: LocationStatus;
  /** Asks the browser for the player's location (prompts once if not yet granted). */
  requestLocation: () => void;
}

const TICK_MS = 60_000;

/**
 * Live Natural Clock for the device.
 *
 * Location is read only when the player has ALREADY granted it, or when they
 * press "Use my location". Otherwise the sun is placed from the timezone and
 * the UI says so. Coordinates live in this hook's state; they are never
 * stored or sent.
 */
export function useNaturalClock(
  birthday: string | null,
  overrides: NaturalClockOverrides = {},
): UseNaturalClock {
  const frozenMs = overrides.now?.getTime();
  const [tickMs, setTickMs] = useState(() => frozenMs ?? Date.now());
  const [deviceGeo, setDeviceGeo] = useState<GeoPoint | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");

  // Minute tick, paused while the tab is hidden, refreshed when it returns.
  useEffect(() => {
    if (frozenMs !== undefined) {
      setTickMs(frozenMs);
      return;
    }
    const refresh = () => {
      if (!document.hidden) setTickMs(Date.now());
    };
    refresh();
    const id = window.setInterval(refresh, TICK_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [frozenMs]);

  const readPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDeviceGeo({ lat: pos.coords.latitude, lon: pos.coords.longitude, source: "device" });
        setLocationStatus("idle");
      },
      (err) => setLocationStatus(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      // A one-hour-old fix is plenty for a sun label.
      { maximumAge: 3_600_000, timeout: 8_000, enableHighAccuracy: false },
    );
  }, []);

  // Use location silently if the player already said yes in the past.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (!cancelled && status.state === "granted") readPosition();
      })
      .catch(() => {
        /* Permissions API unsupported for geolocation: stay on timezone. */
      });
    return () => {
      cancelled = true;
    };
  }, [readPosition]);

  const requestLocation = useCallback(() => {
    setLocationStatus("asking");
    readPosition();
  }, [readPosition]);

  const offsetMinutes = new Date(tickMs).getTimezoneOffset();
  const fallbackGeo = useMemo(() => {
    let tz: string | undefined;
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      tz = undefined;
    }
    return timezoneGeo(tz, offsetMinutes);
  }, [offsetMinutes]);

  const geo = overrides.geo ?? deviceGeo ?? fallbackGeo;

  const clock = useMemo(
    () => computeNaturalClock({ now: new Date(tickMs), geo, birthday }),
    [tickMs, geo, birthday],
  );

  return { clock, locationStatus, requestLocation };
}
