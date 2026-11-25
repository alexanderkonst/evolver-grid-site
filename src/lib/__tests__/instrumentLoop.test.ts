import { describe, expect, it } from "vitest";
import { MAX_FPS, STATIC_POSE } from "../airOctahedron";
import { createFrameLoop, glyphPose, ringSweep } from "../instrument/loop";

/** A manual rAF: callbacks run only when the test advances the clock, like a display refreshing. */
const clock = () => {
  let id = 0;
  let pending: { id: number; cb: (now: number) => void } | null = null;
  return {
    raf: (cb: (now: number) => void) => {
      pending = { id: ++id, cb };
      return id;
    },
    caf: (cancel: number) => {
      if (pending?.id === cancel) pending = null;
    },
    /** One display refresh at `now` ms. */
    step: (now: number) => {
      const p = pending;
      pending = null;
      p?.cb(now);
    },
    get scheduled() {
      return pending !== null;
    },
  };
};

/** Run `seconds` of 60 Hz refreshes starting at `from` ms; returns the last timestamp. */
const run = (c: ReturnType<typeof clock>, from: number, seconds: number) => {
  let now = from;
  const end = from + seconds * 1000;
  while (now < end) {
    now += 1000 / 60;
    c.step(now);
  }
  return now;
};

const make = (opts: { reduced?: boolean; hidden?: { v: boolean } } = {}) => {
  const c = clock();
  const hidden = opts.hidden ?? { v: false };
  const frames: number[] = [];
  const loop = createFrameLoop({
    reduced: opts.reduced ?? false,
    isHidden: () => hidden.v,
    draw: (spin) => frames.push(spin),
    raf: c.raf,
    caf: c.caf,
  });
  return { c, loop, frames, hidden };
};

describe("glyph frame loop", () => {
  it("DoD 5 · frame loop draws at most 30 frames a second on a 60 Hz display", () => {
    const { c, loop, frames } = make();
    loop.sync();
    run(c, 0, 2);
    // Two seconds at 60 Hz offered 120 ticks; the gate lets through about every second one.
    expect(frames.length).toBeLessThanOrEqual(MAX_FPS * 2 + 1);
    expect(frames.length).toBeGreaterThan(MAX_FPS * 2 - 4);
  });

  it("DoD 5 · frame loop draws no more often on a 144 Hz display", () => {
    const { c, loop, frames } = make();
    loop.sync();
    let now = 0;
    while (now < 2000) {
      now += 1000 / 144;
      c.step(now);
    }
    expect(frames.length).toBeLessThanOrEqual(MAX_FPS * 2 + 1);
  });

  it("DoD 5 · the loop stops when the tab is hidden and schedules nothing", () => {
    const { c, loop, frames, hidden } = make();
    loop.sync();
    run(c, 0, 1);
    expect(loop.running).toBe(true);
    hidden.v = true;
    loop.sync();
    expect(loop.running).toBe(false);
    expect(c.scheduled).toBe(false);
    const drawn = frames.length;
    run(c, 1000, 2);
    expect(frames.length - drawn).toBeLessThanOrEqual(1); // the one still frame painted on stop
  });

  it("DoD 5 · the loop resumes when the tab returns, with no jump in the turn", () => {
    const { c, loop, frames, hidden } = make();
    loop.sync();
    run(c, 0, 1);
    const spinBefore = loop.spin;
    hidden.v = true;
    loop.sync();
    hidden.v = false;
    loop.sync();
    expect(loop.running).toBe(true);
    // The tab was away for a long while; the first frame back adds no time.
    c.step(60_000);
    expect(loop.spin).toBe(spinBefore);
    run(c, 60_000, 1);
    expect(loop.spin).toBeGreaterThan(spinBefore);
    expect(frames.at(-1)).toBe(loop.spin);
  });

  it("DoD 5 · no rotation under reduced motion: the loop never runs and the turn never advances", () => {
    const { c, loop, frames } = make({ reduced: true });
    loop.sync();
    expect(loop.running).toBe(false);
    expect(c.scheduled).toBe(false);
    run(c, 0, 2);
    expect(loop.spin).toBe(0);
    expect(frames).toEqual([0]); // one still view
    expect(glyphPose(0, true)).toEqual(STATIC_POSE);
    expect(glyphPose(123.4, true)).toEqual(STATIC_POSE);
    expect(ringSweep(123.4, true)).toBe(0);
  });

  it("DoD 5 · the crystal and the ring do turn when motion is allowed", () => {
    expect(glyphPose(10, false)).not.toEqual(glyphPose(0, false));
    expect(ringSweep(10, false)).toBeGreaterThan(0);
  });

  it("DoD 5 · disposing stops the loop for good", () => {
    const { c, loop, frames } = make();
    loop.sync();
    run(c, 0, 0.5);
    loop.dispose();
    const drawn = frames.length;
    run(c, 500, 1);
    expect(frames.length).toBe(drawn);
    expect(c.scheduled).toBe(false);
  });

  it("DoD 5 · syncing twice does not start a second loop", () => {
    const { c, loop, frames } = make();
    loop.sync();
    loop.sync();
    run(c, 0, 1);
    expect(frames.length).toBeLessThanOrEqual(MAX_FPS + 1);
  });
});
