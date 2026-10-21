import { afterEach, describe, expect, it, vi } from "vitest";
import { TimeoutError, withTimeout } from "../withTimeout";

describe("withTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves when the promise settles in time", async () => {
    await expect(withTimeout(Promise.resolve(7), 100)).resolves.toBe(7);
  });

  it("rejects with TimeoutError when the promise hangs", async () => {
    vi.useFakeTimers();
    const pending = withTimeout(new Promise(() => {}), 50, "matches");
    const assertion = expect(pending).rejects.toBeInstanceOf(TimeoutError);
    await vi.advanceTimersByTimeAsync(60);
    await assertion;
  });

  it("propagates the original rejection", async () => {
    await expect(withTimeout(Promise.reject(new Error("boom")), 100)).rejects.toThrow("boom");
  });
});
