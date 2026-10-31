import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOAD_TIMEOUT_MS, TimeoutError, withTimeout } from "../withTimeout";

describe("withTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes through a value that arrives in time", async () => {
    await expect(withTimeout(Promise.resolve(7), 1000)).resolves.toBe(7);
  });

  it("passes through the original error", async () => {
    await expect(withTimeout(Promise.reject(new Error("boom")), 1000)).rejects.toThrow("boom");
  });

  it("rejects with TimeoutError when the work never settles", async () => {
    const result = withTimeout(new Promise<never>(() => {}), 1000, "probe");
    const settled = expect(result).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(1000);
    await settled;
  });

  it("defaults to the 8 s budget from issue #263", () => {
    expect(LOAD_TIMEOUT_MS).toBe(8000);
  });
});
