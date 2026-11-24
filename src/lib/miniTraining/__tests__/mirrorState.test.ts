import { describe, expect, it } from "vitest";
import {
  emptyMirrorState,
  isModuleDone,
  lastAnswer,
  loadMirrorState,
  mirrorStateKey,
  modulesDone,
  saveMirrorState,
} from "../mirrorState";
import { videoEmbedUrl } from "../video";

const memory = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

describe("progress", () => {
  it("a micro-module is done once every button on its card was sent", () => {
    expect(isModuleDone(1, [])).toBe(false);
    expect(isModuleDone(1, ["1"])).toBe(true);
    expect(isModuleDone(7, ["7a"])).toBe(false);
    expect(isModuleDone(7, ["7a", "7b"])).toBe(true);
    expect(modulesDone(["1", "2", "7a", "7b"])).toBe(3);
  });

  it("finds the latest answer to a button", () => {
    const thread = [
      { role: "player" as const, text: "q", stepId: "1" },
      { role: "ai" as const, text: "first", stepId: "1" },
      { role: "ai" as const, text: "second", stepId: "1" },
      { role: "ai" as const, text: "other", stepId: "2" },
    ];
    expect(lastAnswer(thread, "1")).toBe("second");
    expect(lastAnswer(thread, "3")).toBeNull();
  });
});

describe("local state", () => {
  it("round-trips, per player", () => {
    const storage = memory();
    const state = {
      ...emptyMirrorState(),
      sent: ["1"],
      thread: [{ role: "ai" as const, text: "hi", stepId: "1" }],
      plan: { text: "plan", stepId: "5", savedAt: "2026-11-22T00:00:00Z" },
      lineTaps: 2,
    };
    saveMirrorState("u1", state, storage, false);
    expect(loadMirrorState("u1", storage, false)).toEqual(state);
    expect(loadMirrorState("u2", storage, false)).toEqual(emptyMirrorState());
  });

  it("keeps stub answers apart from live ones", () => {
    expect(mirrorStateKey("u1", true)).not.toBe(mirrorStateKey("u1", false));
  });

  it("survives garbage and caps #6 taps", () => {
    const storage = memory();
    storage.setItem(mirrorStateKey("u1", false), "{not json");
    expect(loadMirrorState("u1", storage, false)).toEqual(emptyMirrorState());
    storage.setItem(mirrorStateKey("u1", false), JSON.stringify({ thread: [{ bad: 1 }], sent: [1, "2"], plan: { text: 1 }, lineTaps: 99 }));
    expect(loadMirrorState("u1", storage, false)).toEqual({ thread: [], sent: ["2"], plan: null, lineTaps: 3 });
  });
});

describe("video slot", () => {
  const cfg = { "ai-as-a-mirror": { 1: "dQw4w9WgXcQ", 2: "", 3: "  ", 4: "not an id" } };
  it("returns an embed only for a valid id", () => {
    expect(videoEmbedUrl("ai-as-a-mirror", 1, cfg)).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0");
    expect(videoEmbedUrl("ai-as-a-mirror", 2, cfg)).toBeNull();
    expect(videoEmbedUrl("ai-as-a-mirror", 3, cfg)).toBeNull();
    expect(videoEmbedUrl("ai-as-a-mirror", 4, cfg)).toBeNull();
    expect(videoEmbedUrl("ai-as-a-mirror", 5, cfg)).toBeNull();
    expect(videoEmbedUrl("other", 1, cfg)).toBeNull();
  });

  it("ships with a valid video in every slot", () => {
    for (let n = 1; n <= 8; n++) expect(videoEmbedUrl("ai-as-a-mirror", n)).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}\?rel=0$/);
  });
});
