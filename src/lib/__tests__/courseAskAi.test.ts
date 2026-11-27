import { describe, expect, it } from "vitest";
import { ASK_ME_FALLBACK, fillAskPrompt, formatBirthday, timeOfDayOf } from "@/lib/courseAskAi";
import { NATURE_COURSE_MODULES } from "@/data/courses/nature";
import { flattenEpisodes } from "@/lib/coursePlayer";

// Friday 27 November 2026, 09:30 local time.
const NOW = new Date(2026, 10, 27, 9, 30);

describe("fillAskPrompt", () => {
  it("fills the clock tokens", () => {
    const out = fillAskPrompt("Today is {today} ({weekday}), {timeOfDay}.", {}, NOW);
    expect(out).toBe("Today is 27 November 2026 (Friday), morning.");
  });

  it("fills birthday, location and mission from the profile", () => {
    const out = fillAskPrompt(
      "My birthday is {birthday}. I live in {location}. Working on: {mission}.",
      { birthday: "1988-03-04", location: " Sayulita,  Mexico ", mission: "Help people see their gift." },
      NOW,
    );
    expect(out).toBe("My birthday is 4 March 1988. I live in Sayulita, Mexico. Working on: Help people see their gift.");
  });

  it("falls back to the «ask me» wording for what the platform lacks", () => {
    const out = fillAskPrompt("{birthday} | {location} | {mission}", {}, NOW);
    expect(out).toBe(`${ASK_ME_FALLBACK.birthday} | ${ASK_ME_FALLBACK.location} | ${ASK_ME_FALLBACK.mission}`);
    expect(ASK_ME_FALLBACK).toEqual({ birthday: "(ask me)", location: "(ask me where)", mission: "(ask me)" });
    // Empty and whitespace-only values count as missing.
    expect(fillAskPrompt("{mission}", { mission: "   " }, NOW)).toBe("(ask me)");
  });

  it("names the moon's current phase for {phase} and leaves unknown tokens alone", () => {
    const out = fillAskPrompt("We're in the {phase} phase. {nope}", {}, NOW);
    expect(out).toMatch(/^We're in the (Clearing|Gathering|Seeing|Leading|Harvesting|Celebrating|Planning|Planting) phase\. \{nope\}$/);
  });

  it("covers the four quarters of the day", () => {
    const at = (h: number) => timeOfDayOf(new Date(2026, 10, 27, h));
    expect([5, 6, 11, 12, 17, 18, 21, 22, 0].map(at)).toEqual([
      "night", "morning", "morning", "afternoon", "afternoon", "evening", "evening", "night", "night",
    ]);
  });

  it("formats birthdays, passing unreadable text through", () => {
    expect(formatBirthday("2000-12-01T00:00:00Z")).toBe("1 December 2000");
    expect(formatBirthday("third of May")).toBe("third of May");
    expect(formatBirthday("")).toBeNull();
    expect(formatBirthday(null)).toBeNull();
  });
});

describe("Nature Ask AI prompts", () => {
  const episodes = flattenEpisodes(NATURE_COURSE_MODULES);

  it("every episode's prompt fills with no raw token left, for a guest and for a known person", () => {
    for (const e of episodes) {
      for (const ctx of [{}, { birthday: "1988-03-04", location: "Lisbon", mission: "Teach." }]) {
        const out = fillAskPrompt(e.askPrompt!, ctx, NOW);
        expect(out, e.code).not.toMatch(/[{}]/);
        expect(out, e.code).toMatch(/\.$/);
      }
    }
  });

  it("Y01 reads the person's own today", () => {
    const y01 = episodes.find((e) => e.code === "Y01")!;
    expect(fillAskPrompt(y01.askPrompt!, { birthday: "1988-03-04" }, NOW)).toContain(
      "My birthday is 4 March 1988. Today is 27 November 2026.",
    );
  });
});
