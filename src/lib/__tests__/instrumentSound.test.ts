import { describe, expect, it } from "vitest";
import { VILLAGE_ELEMENTS, type ElementKey } from "@/data/villagePlaces";
import {
  BREATH_PEAK,
  GESTURE_EVENTS,
  SOUND_MUTED_KEY,
  TONE_PEAK,
  TONE_VOICES,
  createSound,
  readMuted,
  writeMuted,
} from "../instrument/sound";

const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), raw: m };
};

/** A param that remembers every value it was told to hold or ramp to. */
class FakeParam {
  values: number[] = [];
  setValueAtTime(v: number) {
    this.values.push(v);
    return this;
  }
  linearRampToValueAtTime(v: number) {
    this.values.push(v);
    return this;
  }
  exponentialRampToValueAtTime(v: number) {
    this.values.push(v);
    return this;
  }
}
class FakeNode {
  connections: unknown[] = [];
  gain = new FakeParam();
  frequency = new FakeParam();
  Q = new FakeParam();
  type = "";
  buffer: unknown = null;
  started = 0;
  connect(to: unknown) {
    this.connections.push(to);
    return to;
  }
  start() {
    this.started += 1;
  }
  stop() {}
}

/** A stand-in for AudioContext: enough surface for the tones and the breath, and a log of what was built. */
const fakeAudio = (initial: "running" | "suspended" = "suspended") => {
  const log = { created: 0, resumed: 0, oscillators: [] as FakeNode[], gains: [] as FakeNode[], sources: [] as FakeNode[] };
  const destination = { name: "destination" };
  const ctx = {
    state: initial,
    currentTime: 0,
    sampleRate: 8000,
    destination,
    resume() {
      log.resumed += 1;
      ctx.state = "running";
      return Promise.resolve();
    },
    createGain() {
      const n = new FakeNode();
      log.gains.push(n);
      return n;
    },
    createOscillator() {
      const n = new FakeNode();
      log.oscillators.push(n);
      return n;
    },
    createBiquadFilter: () => new FakeNode(),
    createBufferSource() {
      const n = new FakeNode();
      log.sources.push(n);
      return n;
    },
    createBuffer: (_ch: number, length: number) => ({ getChannelData: () => new Float32Array(length) }),
  };
  const createContext = () => {
    log.created += 1;
    return ctx as unknown as AudioContext;
  };
  /** The loudest value of any gain that feeds the speakers directly. */
  const peak = () => Math.max(...log.gains.filter((g) => g.connections.includes(destination)).flatMap((g) => g.gain.values));
  return { log, createContext, peak };
};

const trusted = { isTrusted: true } as Event;
const scripted = { isTrusted: false } as Event;

/** An event target that hands its listeners back, so a test can fire a trusted or a scripted event. */
const fakeTarget = () => {
  const listeners = new Map<string, (e: Event) => void>();
  return {
    listeners,
    addEventListener: (name: string, fn: EventListenerOrEventListenerObject) => void listeners.set(name, fn as (e: Event) => void),
    removeEventListener: (name: string) => void listeners.delete(name),
  };
};

describe("instrument sound", () => {
  it("DoD 5 · no audio before a gesture", () => {
    const audio = fakeAudio();
    const sound = createSound({ createContext: audio.createContext, storage: store() });
    const target = fakeTarget();
    sound.watchGestures(target);

    // Nothing plays and no audio context exists, for any cue.
    for (const cue of [...VILLAGE_ELEMENTS.map((e) => e.key), "breath" as const]) expect(sound.play(cue), cue).toBe(false);
    expect(audio.log.created).toBe(0);
    expect(sound.started).toBe(false);
    expect(sound.unlocked).toBe(false);

    // A script-made event is not the player: it does not unlock sound.
    for (const name of GESTURE_EVENTS) target.listeners.get(name)!(scripted);
    expect(sound.unlocked).toBe(false);
    expect(sound.play("fire")).toBe(false);
    expect(audio.log.created).toBe(0);

    // The player's own tap does.
    target.listeners.get("pointerdown")!(trusted);
    expect(sound.unlocked).toBe(true);
    expect(sound.play("fire")).toBe(true);
    expect(audio.log.created).toBe(1);
    expect(audio.log.oscillators.length).toBeGreaterThan(0);
  });

  it("DoD 5 · every kind of gesture the page listens for unlocks, and the listeners come off again", () => {
    expect([...GESTURE_EVENTS].sort()).toEqual(["click", "keydown", "pointerdown", "touchend"]);
    for (const name of GESTURE_EVENTS) {
      const sound = createSound({ createContext: fakeAudio().createContext, storage: store() });
      const target = fakeTarget();
      const off = sound.watchGestures(target);
      target.listeners.get(name)!(trusted);
      expect(sound.unlocked, name).toBe(true);
      off();
      expect(target.listeners.size).toBe(0);
    }
  });

  it("DoD 5 · mute is remembered", () => {
    const s = store();
    expect(readMuted(s)).toBe(false); // sound on by default, quiet
    const a = createSound({ createContext: fakeAudio().createContext, storage: s });
    expect(a.muted).toBe(false);
    a.setMuted(true);
    expect(s.raw.get(SOUND_MUTED_KEY)).toBe("true");

    // A new page load: still muted, and no audio context is even made for a player who said no.
    const audio = fakeAudio();
    const b = createSound({ createContext: audio.createContext, storage: s });
    expect(b.muted).toBe(true);
    b.noteGesture();
    expect(b.play("ether")).toBe(false);
    expect(audio.log.created).toBe(0);

    // Unmuting is remembered too, and plays at once (the toggle itself was a gesture).
    b.setMuted(false);
    expect(s.raw.get(SOUND_MUTED_KEY)).toBe("false");
    expect(createSound({ createContext: audio.createContext, storage: s }).muted).toBe(false);
    expect(b.play("ether")).toBe(true);
  });

  it("DoD 5 · muting after a gesture silences the next cue, and listeners hear the change", () => {
    const audio = fakeAudio();
    const sound = createSound({ createContext: audio.createContext, storage: store() });
    const heard: boolean[] = [];
    const off = sound.subscribe(() => heard.push(sound.muted));
    sound.noteGesture();
    expect(sound.play("water")).toBe(true);
    const before = audio.log.oscillators.length;
    sound.setMuted(true);
    sound.setMuted(true); // no change, no second notice
    expect(sound.play("water")).toBe(false);
    expect(audio.log.oscillators.length).toBe(before);
    off();
    sound.setMuted(false);
    expect(heard).toEqual([true]);
  });

  it("an unreadable or full store never breaks the choice", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("full");
      },
    };
    expect(readMuted(broken)).toBe(false);
    expect(() => writeMuted(true, broken)).not.toThrow();
    const sound = createSound({ createContext: fakeAudio().createContext, storage: broken });
    expect(() => sound.setMuted(true)).not.toThrow();
    expect(sound.muted).toBe(true);
  });

  it("five tones from one pentatonic scale: ether highest and longest, earth lowest and shortest", () => {
    const order: ElementKey[] = ["earth", "fire", "water", "air", "ether"];
    const hz = order.map((e) => TONE_VOICES[e].hz);
    const seconds = order.map((e) => TONE_VOICES[e].seconds);
    expect([...hz].sort((a, b) => a - b)).toEqual(hz);
    expect([...seconds].sort((a, b) => a - b)).toEqual(seconds);
    expect(new Set(hz).size).toBe(5);
    // Major pentatonic from C (1, 9/8, 5/4, 3/2, 5/3), equal-tempered, within half a percent.
    const ratios = [1, 2 ** (2 / 12), 2 ** (4 / 12), 2 ** (7 / 12), 2 ** (9 / 12)];
    hz.forEach((f, i) => expect(Math.abs(f / hz[0] / ratios[i] - 1)).toBeLessThan(0.005));
  });

  it("each element sounds its own pitch, quietly", () => {
    for (const { key } of VILLAGE_ELEMENTS) {
      const audio = fakeAudio("running");
      const sound = createSound({ createContext: audio.createContext, storage: store() });
      sound.noteGesture();
      expect(sound.play(key), key).toBe(true);
      const pitches = audio.log.oscillators.map((o) => o.frequency.values[0]);
      expect(pitches[0], key).toBe(TONE_VOICES[key].hz);
      expect(audio.peak(), key).toBeLessThanOrEqual(TONE_PEAK);
      expect(audio.peak(), key).toBeGreaterThan(0);
      expect(TONE_PEAK).toBeLessThanOrEqual(0.1);
      expect(audio.log.oscillators.every((o) => o.started === 1)).toBe(true);
    }
  });

  it("the breath is soft noise, quieter than a tone", () => {
    const audio = fakeAudio("running");
    const sound = createSound({ createContext: audio.createContext, storage: store() });
    sound.noteGesture();
    expect(sound.play("breath")).toBe(true);
    expect(audio.log.sources).toHaveLength(1);
    expect(audio.log.sources[0].started).toBe(1);
    expect(audio.log.oscillators).toHaveLength(0);
    expect(audio.peak()).toBeLessThanOrEqual(BREATH_PEAK);
    expect(BREATH_PEAK).toBeLessThan(TONE_PEAK);
  });

  it("a suspended context is resumed from the gesture, and one context serves every cue", () => {
    const audio = fakeAudio("suspended");
    const sound = createSound({ createContext: audio.createContext, storage: store() });
    sound.noteGesture();
    expect(audio.log.created).toBe(1);
    expect(audio.log.resumed).toBe(1);
    sound.play("fire");
    sound.play("breath");
    expect(audio.log.created).toBe(1);
  });

  it("no WebAudio in the browser: nothing plays and nothing throws", () => {
    const sound = createSound({ createContext: () => null, storage: store() });
    sound.noteGesture();
    expect(sound.play("fire")).toBe(false);
    const throwing = createSound({
      createContext: () => {
        throw new Error("no audio device");
      },
      storage: store(),
    });
    expect(() => throwing.noteGesture()).not.toThrow();
    expect(throwing.play("fire")).toBe(false);
  });
});
