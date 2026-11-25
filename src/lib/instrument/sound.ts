/**
 * The instrument's sound (docs/specs/navigation-instrument/architecture.md §5.4): five tones from one
 * pentatonic scale, one per element, plus a soft noise "breath" for open and close. Generated in the
 * browser with WebAudio: no files, no dependencies.
 *
 * Rules, all testable without a browser (the audio context is injected):
 *  - Nothing is created or played before a trusted user gesture (the browser rule, kept on purpose):
 *    `play` returns false and no AudioContext exists until the player has tapped, clicked or pressed a key.
 *  - Quiet: the loudest tone peaks at `TONE_PEAK` of full scale.
 *  - One mute, remembered in localStorage (`SOUND_MUTED_KEY`). Default is sound on, quiet.
 *
 * Pitch follows the quarter's weight: ether is the highest and longest, earth the lowest and shortest.
 */
import type { ElementKey } from "@/data/villagePlaces";

export type SoundCue = ElementKey | "breath";

/** C major pentatonic, one octave up from middle C so a phone speaker can carry it. `seconds` is the ring-out. */
export const TONE_VOICES: Record<ElementKey, { hz: number; seconds: number }> = {
  earth: { hz: 523.25, seconds: 0.9 }, // C5
  fire: { hz: 587.33, seconds: 1.1 }, // D5
  water: { hz: 659.25, seconds: 1.3 }, // E5
  air: { hz: 783.99, seconds: 1.5 }, // G5
  ether: { hz: 880, seconds: 1.9 }, // A5
};

/** Loudest a single tone gets (0..1 of full scale). Quiet by default. */
export const TONE_PEAK = 0.05;
/** The breath is a little softer than the tones. */
export const BREATH_PEAK = 0.03;
export const BREATH_SECONDS = 0.45;

export const SOUND_MUTED_KEY = "fytt:instrument-sound-muted";

type StorageRead = Pick<Storage, "getItem">;
type StorageWrite = Pick<Storage, "setItem">;

const safeStorage = (): Storage | null => {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
};

/** Muted only when the player said so; anything else (nothing stored, private mode) is sound on. */
export const readMuted = (storage: StorageRead | null = safeStorage()): boolean => {
  try {
    return storage?.getItem(SOUND_MUTED_KEY) === "true";
  } catch {
    return false;
  }
};

export const writeMuted = (muted: boolean, storage: StorageWrite | null = safeStorage()): void => {
  try {
    storage?.setItem(SOUND_MUTED_KEY, muted ? "true" : "false");
  } catch {
    // Private mode or a full disk: the choice holds for this visit only. Non-blocking.
  }
};

type AudioContextCtor = new () => AudioContext;

const defaultContextFactory = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  return Ctor ? new Ctor() : null;
};

/** Events that count as a user gesture for the browser's autoplay rule. */
export const GESTURE_EVENTS = ["pointerdown", "touchend", "keydown", "click"] as const;

export type SoundOptions = {
  /** Creates the audio context; called at most once, and only after a gesture. Tests pass a fake. */
  createContext?: () => AudioContext | null;
  storage?: (StorageRead & StorageWrite) | null;
};

export type Sound = {
  /** A trusted gesture happened: audio may now start. Idempotent. */
  noteGesture: () => void;
  /** Listen on `target` for the first trusted gesture. Returns the remover. */
  watchGestures: (target: Pick<EventTarget, "addEventListener" | "removeEventListener">) => () => void;
  /** Play one cue. False when nothing was started (no gesture yet, muted, or no WebAudio). */
  play: (cue: SoundCue) => boolean;
  setMuted: (muted: boolean) => void;
  subscribe: (listener: () => void) => () => void;
  readonly muted: boolean;
  readonly unlocked: boolean;
  /** An audio context exists (it never does before a gesture). */
  readonly started: boolean;
};

export const createSound = ({ createContext = defaultContextFactory, storage }: SoundOptions = {}): Sound => {
  const store = storage === undefined ? safeStorage() : storage;
  let muted = readMuted(store);
  let unlocked = false;
  let ctx: AudioContext | null = null;
  let noise: AudioBuffer | null = null;
  const listeners = new Set<() => void>();

  // Created on the gesture (not on the first play) so iOS Safari, which only resumes a context inside
  // a gesture handler, can start it. Skipped while muted: nothing is made for a player who said no.
  const ensureContext = (): AudioContext | null => {
    if (ctx) return ctx;
    if (!unlocked || muted) return null;
    try {
      ctx = createContext();
    } catch {
      ctx = null;
    }
    if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  };

  const tone = (c: AudioContext, element: ElementKey) => {
    const { hz, seconds } = TONE_VOICES[element];
    const t0 = c.currentTime;
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.linearRampToValueAtTime(TONE_PEAK, t0 + 0.03);
    out.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    out.connect(c.destination);
    // The note and a quiet octave above it: a small bell, not a beep.
    [
      { mul: 1, level: 1 },
      { mul: 2, level: 0.22 },
    ].forEach(({ mul, level }) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(hz * mul, t0);
      g.gain.setValueAtTime(level, t0);
      osc.connect(g);
      g.connect(out);
      osc.start(t0);
      osc.stop(t0 + seconds + 0.05);
    });
  };

  const breath = (c: AudioContext) => {
    const t0 = c.currentTime;
    if (!noise) {
      noise = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * BREATH_SECONDS)), c.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource();
    src.buffer = noise;
    const band = c.createBiquadFilter();
    band.type = "bandpass";
    band.Q.setValueAtTime(0.7, t0);
    band.frequency.setValueAtTime(900, t0);
    band.frequency.linearRampToValueAtTime(1800, t0 + BREATH_SECONDS);
    const out = c.createGain();
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.linearRampToValueAtTime(BREATH_PEAK, t0 + BREATH_SECONDS * 0.4);
    out.gain.exponentialRampToValueAtTime(0.0001, t0 + BREATH_SECONDS);
    src.connect(band);
    band.connect(out);
    out.connect(c.destination);
    src.start(t0);
    src.stop(t0 + BREATH_SECONDS + 0.05);
  };

  const noteGesture = () => {
    unlocked = true;
    const c = ensureContext();
    if (c && c.state === "suspended") void c.resume().catch(() => {});
  };

  return {
    noteGesture,
    watchGestures: (target) => {
      // `isTrusted` is false for script-made events: only the player's own input unlocks sound.
      const onGesture = (e: Event) => {
        if (e.isTrusted) noteGesture();
      };
      GESTURE_EVENTS.forEach((name) => target.addEventListener(name, onGesture, { capture: true, passive: true } as AddEventListenerOptions));
      return () => GESTURE_EVENTS.forEach((name) => target.removeEventListener(name, onGesture, { capture: true } as EventListenerOptions));
    },
    play: (cue) => {
      if (muted || !unlocked) return false;
      const c = ensureContext();
      if (!c) return false;
      if (c.state === "suspended") void c.resume().catch(() => {});
      try {
        if (cue === "breath") breath(c);
        else tone(c, cue);
        return true;
      } catch {
        return false;
      }
    },
    setMuted: (next) => {
      if (next === muted) return;
      muted = next;
      writeMuted(next, store);
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get muted() {
      return muted;
    },
    get unlocked() {
      return unlocked;
    },
    get started() {
      return ctx !== null;
    },
  };
};

let shared: Sound | null = null;
let stopWatching: (() => void) | null = null;

/** The one sound of the page. Created on first use; it starts listening for the first gesture at once. */
export const instrumentSound = (): Sound => {
  if (!shared) {
    shared = createSound();
    if (typeof window !== "undefined") stopWatching = shared.watchGestures(window);
  }
  return shared;
};

/** Test hook: drop the shared sound (and its listeners) so the next `instrumentSound()` starts fresh. */
export const resetInstrumentSound = (): void => {
  stopWatching?.();
  stopWatching = null;
  shared = null;
};
