/**
 * RadioProvider — the village radio engine (spec row A8, docs/02-strategy/game_launch_spec.md).
 *
 * One HTMLAudioElement, mounted ONCE at App root, so the station keeps playing while the player
 * moves between village places and game screens (those are route changes; the element never
 * unmounts). The UI is RadioControl, a thin consumer of this context.
 *
 * Rules (issue #371):
 *  • Off by default. The stream is requested only when the player presses Play; the element is
 *    created with no source and `preload="none"`, so a visitor who never presses Play loads nothing.
 *  • On/off and volume are remembered in localStorage (src/lib/radio.ts). On a reload inside the
 *    game the radio tries to pick up where the player left it; a browser that refuses (autoplay
 *    policy) simply leaves the control on Play. It never resumes on later navigation.
 *  • Leaving the game (any route outside `isRadioRoute`) stops the stream and clears «on».
 *  • A stream that cannot load shows «Radio is offline right now» and the control stays usable:
 *    Play tries again. Nothing is logged to the console.
 *  • Pause stops the download too (the source is dropped), so a live stream does not keep
 *    buffering in the background and resumes at the live edge.
 *  • iOS Safari ignores `audio.volume` (always 1): `volumeSettable` is false there and the control
 *    hides the slider; the system volume buttons do the job.
 *
 * One station per village: `villageId` picks it from src/data/radioStations.ts.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_VILLAGE_ID, getVillageRadio, type RadioStation } from "@/data/radioStations";
import {
  clampVolume,
  isRadioRoute,
  readRadioOn,
  readRadioVolume,
  writeRadioOn,
  writeRadioVolume,
} from "@/lib/radio";

export type RadioStatus = "idle" | "loading" | "playing" | "offline";

/** A stream that has neither started nor failed after this long counts as offline. */
const CONNECT_TIMEOUT_MS = 15_000;

interface RadioContextValue {
  station: RadioStation | null;
  status: RadioStatus;
  /** 0–1. */
  volume: number;
  /** False where the browser ignores `audio.volume` (iOS Safari). */
  volumeSettable: boolean;
  /** Play when stopped (or offline: a retry), Pause otherwise. */
  toggle: () => void;
  setVolume: (volume: number) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({
  villageId = DEFAULT_VILLAGE_ID,
  children,
}: {
  villageId?: string;
  children: ReactNode;
}) {
  const station = getVillageRadio(villageId);
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  // Bumped on every start and halt. A play() promise that settles after a newer action is stale
  // (Safari rejects an interrupted play() with NotSupportedError, not AbortError).
  const attemptRef = useRef(0);
  const [status, setStatus] = useState<RadioStatus>("idle");
  const [volume, setVolumeState] = useState<number>(readRadioVolume);
  const volumeRef = useRef(volume);
  const [volumeSettable, setVolumeSettable] = useState(true);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** Stop the sound and drop the source, so nothing keeps downloading. */
  const halt = useCallback(() => {
    attemptRef.current += 1;
    clearTimer();
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (audio.hasAttribute("src")) {
      audio.removeAttribute("src");
      audio.load();
    }
  }, [clearTimer]);

  const goOffline = useCallback(() => {
    halt();
    setStatus("offline");
    writeRadioOn(false);
  }, [halt]);

  const armTimeout = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(goOffline, CONNECT_TIMEOUT_MS);
  }, [clearTimer, goOffline]);

  const start = useCallback(
    (resume: boolean) => {
      const audio = audioRef.current;
      if (!audio || !station) return;
      halt();
      const attempt = attemptRef.current;
      // A fresh source each time: a live stream resumes at the live edge, not where it paused.
      audio.src = station.streamUrl;
      setStatus("loading");
      armTimeout();
      let started: Promise<void> | undefined;
      try {
        started = audio.play();
      } catch {
        goOffline();
        return;
      }
      if (!resume) writeRadioOn(true);
      started?.catch((err: unknown) => {
        if (attempt !== attemptRef.current) return; // paused or replaced meanwhile
        if ((err as { name?: string } | null)?.name === "NotAllowedError") {
          // The browser refused to start without a gesture (a resume after reload): wait on Play.
          halt();
          setStatus("idle");
          return;
        }
        goOffline();
      });
    },
    [station, halt, armTimeout, goOffline],
  );

  // The audio element: created empty, no network until Play.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;
    try {
      audio.volume = 0.5;
      const settable = audio.volume === 0.5;
      setVolumeSettable(settable);
      if (settable) audio.volume = volumeRef.current;
    } catch {
      setVolumeSettable(false);
    }
    const onPlaying = () => {
      clearTimer();
      setStatus("playing");
    };
    const onWaiting = () => {
      if (!audio.hasAttribute("src")) return;
      setStatus("loading");
      armTimeout();
    };
    const onError = () => {
      if (audio.hasAttribute("src")) goOffline();
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      halt();
      audioRef.current = null;
    };
  }, [clearTimer, armTimeout, goOffline, halt]);

  // After a reload inside the game, pick up where the player left it (once). A browser that
  // refuses leaves the control on Play.
  useEffect(() => {
    if (!station || !isRadioRoute(window.location.pathname) || !readRadioOn()) return;
    start(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  // Leaving the game stops the radio and forgets «on».
  useEffect(() => {
    if (isRadioRoute(location.pathname)) return;
    halt();
    setStatus("idle");
    writeRadioOn(false);
  }, [location.pathname, halt]);

  const toggle = useCallback(() => {
    if (status === "idle" || status === "offline") {
      start(false);
    } else {
      halt();
      setStatus("idle");
      writeRadioOn(false);
    }
  }, [status, start, halt]);

  const setVolume = useCallback((next: number) => {
    const v = clampVolume(next);
    volumeRef.current = v;
    setVolumeState(v);
    writeRadioVolume(v);
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.volume = v;
      } catch {
        // ignored: the control hides the slider where this fails
      }
    }
  }, []);

  const value = useMemo<RadioContextValue>(
    () => ({ station, status, volume, volumeSettable, toggle, setVolume }),
    [station, status, volume, volumeSettable, toggle, setVolume],
  );

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio(): RadioContextValue | null {
  return useContext(RadioContext);
}
