import { describe, expect, it } from "vitest";
import {
  YOUR_AI_DAILY_FREE_TURNS,
  getTurnsUsedToday,
  isDailyLimitReached,
  localDayKey,
  recordTurn,
} from "../yourAiDailyLimit";

const memoryStorage = () => {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
};

const day1 = new Date(2026, 9, 31, 10, 0, 0);
const day1Late = new Date(2026, 9, 31, 23, 59, 0);
const day2 = new Date(2026, 10, 1, 0, 1, 0);

describe("yourAiDailyLimit", () => {
  it("defaults to 20 free turns", () => {
    expect(YOUR_AI_DAILY_FREE_TURNS).toBe(20);
  });

  it("uses the local calendar day, zero-padded", () => {
    expect(localDayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("increments per turn", () => {
    const s = memoryStorage();
    expect(getTurnsUsedToday(null, s, day1)).toBe(0);
    expect(recordTurn(null, s, day1)).toBe(1);
    expect(recordTurn(null, s, day1Late)).toBe(2);
    expect(getTurnsUsedToday(null, s, day1)).toBe(2);
  });

  it("resets on day rollover", () => {
    const s = memoryStorage();
    for (let i = 0; i < 5; i++) recordTurn(null, s, day1);
    expect(getTurnsUsedToday(null, s, day2)).toBe(0);
    expect(recordTurn(null, s, day2)).toBe(1);
  });

  it("reports the cap reached at exactly the limit, and resets the next day", () => {
    const s = memoryStorage();
    for (let i = 0; i < YOUR_AI_DAILY_FREE_TURNS - 1; i++) recordTurn("u1", s, day1);
    expect(isDailyLimitReached("u1", s, day1)).toBe(false);
    recordTurn("u1", s, day1);
    expect(isDailyLimitReached("u1", s, day1)).toBe(true);
    expect(isDailyLimitReached("u1", s, day2)).toBe(false);
  });

  it("honours a custom limit", () => {
    const s = memoryStorage();
    recordTurn(null, s, day1);
    recordTurn(null, s, day1);
    expect(isDailyLimitReached(null, s, day1, 2)).toBe(true);
    expect(isDailyLimitReached(null, s, day1, 3)).toBe(false);
  });

  it("scopes the count per player", () => {
    const s = memoryStorage();
    recordTurn("u1", s, day1);
    recordTurn("u1", s, day1);
    expect(getTurnsUsedToday("u1", s, day1)).toBe(2);
    expect(getTurnsUsedToday("u2", s, day1)).toBe(0);
    expect(getTurnsUsedToday(null, s, day1)).toBe(0);
  });

  it("survives corrupted and missing storage", () => {
    const s = memoryStorage();
    s.setItem("fytt:your-ai-daily-turns:v1:guest", "{not json");
    expect(getTurnsUsedToday(null, s, day1)).toBe(0);
    s.setItem("fytt:your-ai-daily-turns:v1:guest", JSON.stringify({ day: localDayKey(day1), count: "abc" }));
    expect(getTurnsUsedToday(null, s, day1)).toBe(0);
    expect(getTurnsUsedToday(null, null, day1)).toBe(0);
    expect(() => recordTurn(null, null, day1)).not.toThrow();
    const throwing = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(getTurnsUsedToday(null, throwing, day1)).toBe(0);
    expect(() => recordTurn(null, throwing, day1)).not.toThrow();
  });
});
