import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LOAD_TIMEOUT_MS, REQUEST_TIMEOUT_MS, TimeoutError, withTimeout } from "../withTimeout";

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

  it("keeps the caps above a slow-but-working load (10–15 s seen live, #263)", () => {
    expect(REQUEST_TIMEOUT_MS).toBeGreaterThanOrEqual(12000);
    expect(LOAD_TIMEOUT_MS).toBeGreaterThan(REQUEST_TIMEOUT_MS);
    expect(LOAD_TIMEOUT_MS).toBe(20000);
  });

  it("defaults to the per-request cap", async () => {
    const result = withTimeout(new Promise<never>(() => {}));
    const settled = expect(result).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
    await settled;
  });
});
