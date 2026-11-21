/**
 * Village radio: pure helpers (route rule, remembered state). The engine is
 * src/components/audio/RadioProvider.tsx; stations are src/data/radioStations.ts.
 */

export const RADIO_ON_KEY = "radio:on-v1";
export const RADIO_VOLUME_KEY = "radio:volume-v1";
export const DEFAULT_RADIO_VOLUME = 0.7;

/**
 * Where the radio lives: the village and every game screen. Not the title screen (`/`), the
 * intro, the Top Talent reveal or any marketing / checkout page. Leaving these routes stops the
 * radio (see RadioProvider).
 */
export const isRadioRoute = (pathname: string): boolean =>
  pathname === "/village" ||
  pathname.startsWith("/village/") ||
  pathname === "/game" ||
  pathname.startsWith("/game/") ||
  pathname === "/ubb" ||
  pathname.startsWith("/ubb/") ||
  pathname === "/build/mastermind";

export const clampVolume = (value: number): number =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_RADIO_VOLUME;

const storage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // storage blocked
  }
};

/** Off unless the player turned it on. */
export const readRadioOn = (): boolean => storage()?.getItem(RADIO_ON_KEY) === "1";

export const writeRadioOn = (on: boolean): void => {
  try {
    storage()?.setItem(RADIO_ON_KEY, on ? "1" : "0");
  } catch {
    // Private mode / quota: the radio still works, it just forgets.
  }
};

export const readRadioVolume = (): number => {
  const raw = storage()?.getItem(RADIO_VOLUME_KEY);
  if (raw === null || raw === undefined || raw === "") return DEFAULT_RADIO_VOLUME;
  return clampVolume(Number(raw));
};

export const writeRadioVolume = (volume: number): void => {
  try {
    storage()?.setItem(RADIO_VOLUME_KEY, String(clampVolume(volume)));
  } catch {
    // see writeRadioOn
  }
};
