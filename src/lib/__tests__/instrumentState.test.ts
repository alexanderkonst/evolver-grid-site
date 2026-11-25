import { describe, expect, it } from "vitest";
import {
  LIT_SEEN_STORAGE_KEY,
  emptyLitSeen,
  AI_OS_VISITED_KEY,
  hasSeen,
  instrumentGate,
  instrumentModel,
  instrumentReduce,
  isRaised,
  litSeenFromActions,
  litSeenStorageKey,
  litSeenToActions,
  markLitSeen,
  mergeLitSeen,
  parseLitSeen,
  readAiOsVisited,
  readLitSeen,
  unseenLit,
  writeLitSeen,
  type InstrumentEvent,
  type InstrumentModel,
} from "../instrument/state";

const closed: InstrumentModel = { state: "closed", face: null };
const open: InstrumentModel = { state: "open", face: null };
const face: InstrumentModel = { state: "face", face: "air" };
const hidden: InstrumentModel = { state: "hidden", face: null };

const store = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), raw: m };
};

describe("DoD 1 · state machine", () => {
  it("DoD 1 · starts hidden without a profile and closed with one", () => {
    expect(instrumentModel(false)).toEqual(hidden);
    expect(instrumentModel(true)).toEqual(closed);
  });

  it("DoD 1 · hidden ignores everything except the gate opening", () => {
    const events: InstrumentEvent[] = [{ type: "open" }, { type: "close" }, { type: "toggle" }, { type: "back" }, { type: "face", element: "air" }];
    for (const e of events) expect(instrumentReduce(hidden, e)).toBe(hidden);
    expect(instrumentReduce(hidden, { type: "gate", enabled: true })).toEqual(closed);
    expect(instrumentReduce(hidden, { type: "gate", enabled: false })).toBe(hidden);
  });

  it("DoD 1 · closed opens on open or toggle, and ignores the rest", () => {
    expect(instrumentReduce(closed, { type: "open" })).toEqual(open);
    expect(instrumentReduce(closed, { type: "toggle" })).toEqual(open);
    expect(instrumentReduce(closed, { type: "close" })).toBe(closed);
    expect(instrumentReduce(closed, { type: "back" })).toBe(closed);
    // A face is reached only through the open arc.
    expect(instrumentReduce(closed, { type: "face", element: "air" })).toBe(closed);
    expect(instrumentReduce(closed, { type: "gate", enabled: true })).toBe(closed);
  });

  it("DoD 1 · open closes on close or toggle, turns a face on face, and ignores open and back", () => {
    expect(instrumentReduce(open, { type: "close" })).toEqual(closed);
    expect(instrumentReduce(open, { type: "toggle" })).toEqual(closed);
    expect(instrumentReduce(open, { type: "face", element: "air" })).toEqual(face);
    expect(instrumentReduce(open, { type: "open" })).toBe(open);
    expect(instrumentReduce(open, { type: "back" })).toBe(open);
  });

  it("DoD 1 · a face goes back to open, closes straight to closed, and can turn to another face", () => {
    expect(instrumentReduce(face, { type: "back" })).toEqual(open);
    expect(instrumentReduce(face, { type: "close" })).toEqual(closed);
    expect(instrumentReduce(face, { type: "toggle" })).toEqual(closed);
    expect(instrumentReduce(face, { type: "face", element: "air" })).toBe(face);
    expect(instrumentReduce(face, { type: "face", element: "water" })).toEqual({ state: "face", face: "water" });
    expect(instrumentReduce(face, { type: "open" })).toBe(face);
  });

  it("DoD 1 · losing the gate from any state hides the instrument and drops the face", () => {
    for (const m of [closed, open, face]) expect(instrumentReduce(m, { type: "gate", enabled: false })).toEqual(hidden);
  });

  it("DoD 1 · only open and face count as raised", () => {
    expect([hidden, closed, open, face].map(isRaised)).toEqual([false, false, true, true]);
  });

  it("DoD 1 · the same gesture twice returns to where it started", () => {
    expect(instrumentReduce(instrumentReduce(closed, { type: "toggle" }), { type: "toggle" })).toEqual(closed);
  });
});

describe("DoD 1 · litSeen persistence", () => {
  it("DoD 1 · parses only known elements with a true value", () => {
    expect(parseLitSeen({ fire: true, air: false, mars: true, water: "yes" })).toEqual({ fire: true });
    expect(parseLitSeen(null)).toEqual({});
    expect(parseLitSeen("fire")).toEqual({});
  });

  it("DoD 1 · marking a body seen is idempotent and does not touch the others", () => {
    const a = markLitSeen(emptyLitSeen(), "fire");
    expect(a).toEqual({ fire: true });
    expect(markLitSeen(a, "fire")).toBe(a);
    expect(markLitSeen(a, "earth")).toEqual({ fire: true, earth: true });
    expect(hasSeen(a, "fire")).toBe(true);
    expect(hasSeen(a, "water")).toBe(false);
  });

  it("DoD 1 · signed out, litSeen round-trips through localStorage under the guest key", () => {
    const s = store();
    writeLitSeen(null, { fire: true, earth: true }, s);
    expect(s.raw.has(`${LIT_SEEN_STORAGE_KEY}:guest`)).toBe(true);
    expect(readLitSeen(null, s)).toEqual({ fire: true, earth: true });
  });

  it("DoD 1 · each player has their own record", () => {
    const s = store();
    writeLitSeen("u1", { fire: true }, s);
    expect(readLitSeen("u1", s)).toEqual({ fire: true });
    expect(readLitSeen("u2", s)).toEqual({});
    expect(readLitSeen(null, s)).toEqual({});
    expect(litSeenStorageKey("u1")).not.toBe(litSeenStorageKey(null));
  });

  it("DoD 1 · a missing, broken or unavailable store reads as empty and never throws", () => {
    expect(readLitSeen(null, null)).toEqual({});
    const s = store();
    s.raw.set(litSeenStorageKey(null), "{not json");
    expect(readLitSeen(null, s)).toEqual({});
    expect(() => writeLitSeen(null, { fire: true }, null)).not.toThrow();
    expect(() => writeLitSeen(null, { fire: true }, { setItem: () => { throw new Error("full"); } })).not.toThrow();
  });

  it("DoD 1 · signed in, litSeen maps to and from the first_time_actions record without dropping other actions", () => {
    expect(litSeenToActions({ fire: true, water: true })).toEqual({ instrument_lit_water: true, instrument_lit_fire: true });
    const actions = { first_zog_complete: true, instrument_lit_fire: true, instrument_lit_mars: true, instrument_lit_earth: false };
    expect(litSeenFromActions(actions)).toEqual({ fire: true });
    expect(litSeenFromActions(null)).toEqual({});
    expect({ ...actions, ...litSeenToActions({ water: true }) }.first_zog_complete).toBe(true);
  });

  it("DoD 1 · the local and the saved record merge as a union", () => {
    expect(mergeLitSeen({ fire: true }, { earth: true })).toEqual({ fire: true, earth: true });
    expect(mergeLitSeen({}, {})).toEqual({});
  });

  it("DoD 1 · unseenLit queues lit bodies not yet seen, in village order, never air", () => {
    const lit = { ether: true, air: true, water: false, fire: true, earth: true };
    expect(unseenLit(lit, {})).toEqual(["ether", "fire", "earth"]);
    expect(unseenLit(lit, { fire: true })).toEqual(["ether", "earth"]);
    expect(unseenLit(lit, { ether: true, fire: true, earth: true })).toEqual([]);
  });
});

describe("the gate (visibility rule from #458, unchanged)", () => {
  const none = { ever: false, topTalent: false, mission: false, assets: false };
  it("is hidden until top talent, mission and assets are all done, or the AI OS was visited", () => {
    expect(instrumentGate(none)).toBe(false);
    expect(instrumentGate({ ...none, topTalent: true })).toBe(false);
    expect(instrumentGate({ ...none, topTalent: true, mission: true })).toBe(false);
    expect(instrumentGate({ ever: false, topTalent: true, mission: true, assets: true })).toBe(true);
    expect(instrumentGate({ ...none, ever: true })).toBe(true);
  });
  it("reads the AI OS latch the shell already writes", () => {
    expect(readAiOsVisited(store())).toBe(false);
    const s = store();
    s.setItem(AI_OS_VISITED_KEY, "true");
    expect(readAiOsVisited(s)).toBe(true);
    expect(readAiOsVisited(null)).toBe(false);
  });
});
