import { describe, expect, it } from "vitest";
import { JOURNEY_MAIN, type JourneyItemId } from "@/data/journeySequence";
import { badgeResult, houseBadges, houseRooms, lockedRoomFold, nextHouseRoom, type HouseRoomId } from "../houseRooms";
import { placeSaveFromSheet } from "../placeState";

const NOW = new Date("2026-10-28T18:00:00Z");

/** A save in which exactly these Journey steps are done. */
const saveWith = (done: JourneyItemId[], offerSaved = false) =>
  placeSaveFromSheet(
    { chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: done.includes(i.id) })), offerSaved },
    NOW,
  );

const stateOf = (rooms: ReturnType<typeof houseRooms>, id: HouseRoomId) =>
  rooms.find((r) => r.id === id)?.state;

describe("houseRooms", () => {
  it("lists the rooms in Journey order (§14.7 q2)", () => {
    expect(houseRooms(saveWith([])).map((r) => r.id)).toEqual([
      "talent",
      "mission",
      "colors",
      "level",
      "assets",
      "offer",
      "victories",
    ]);
  });

  it("a new resident's house: the next room glows, the rest are faded with their line (§14.7 q6)", () => {
    const rooms = houseRooms(saveWith([]));
    expect(stateOf(rooms, "talent")).toBe("next");
    for (const id of ["mission", "colors", "level", "assets", "offer"] as const) {
      const room = rooms.find((r) => r.id === id);
      expect(room?.state).toBe("closed");
      expect(room?.line).toMatch(/^Opens when .+\. Inside: .+\.$/);
    }
    expect(stateOf(rooms, "victories")).toBe("open");
    expect(rooms.filter((r) => r.state === "next")).toHaveLength(1);
  });

  it("the soul-colors room waits for Spectrum Reading and stays faded with its line (§14.7 q7)", () => {
    const allDone = saveWith(
      JOURNEY_MAIN.map((i) => i.id),
      true,
    );
    const colors = houseRooms(allDone).find((r) => r.id === "colors");
    expect(colors?.state).toBe("closed");
    expect(colors?.line).toBe("Opens when your Spectrum Reading is ready. Inside: your soul colors.");
  });

  it("saving the top talent lights the mission room as the one next move", () => {
    const rooms = houseRooms(saveWith(["find-top-talent"]));
    expect(stateOf(rooms, "talent")).toBe("done");
    expect(stateOf(rooms, "mission")).toBe("next");
    expect(stateOf(rooms, "level")).toBe("closed");
    expect(nextHouseRoom(rooms)?.id).toBe("mission");
  });

  it("a saved mission opens the level and the assets rooms", () => {
    const rooms = houseRooms(saveWith(["find-top-talent", "discover-mission"]));
    expect(stateOf(rooms, "mission")).toBe("done");
    expect(stateOf(rooms, "level")).not.toBe("closed");
    expect(stateOf(rooms, "assets")).not.toBe("closed");
    expect(stateOf(rooms, "offer")).toBe("closed");
  });

  it("a saved offer finishes the offer room", () => {
    const rooms = houseRooms(saveWith(["find-top-talent", "discover-mission", "assess-qol", "map-assets"], true));
    expect(stateOf(rooms, "offer")).toBe("done");
    expect(nextHouseRoom(rooms)).toBeUndefined();
  });

  it("a finished QoL shows the level room done even while the mission is not saved (issue #414)", () => {
    const rooms = houseRooms(saveWith(["find-top-talent", "assess-qol"]));
    expect(stateOf(rooms, "level")).toBe("done");
    expect(rooms.find((r) => r.id === "level")?.line).toBe("");
  });

  it("only a closed room carries a line", () => {
    for (const room of houseRooms(saveWith([]))) {
      if (room.state === "closed") expect(room.line).not.toBe("");
      else expect(room.line).toBe("");
    }
  });

  it("marks only the level room private", () => {
    expect(houseRooms(saveWith([])).filter((r) => r.private).map((r) => r.id)).toEqual(["level"]);
  });
});

describe("houseBadges", () => {
  it("has one badge per Journey step, in Journey order, no extras", () => {
    expect(houseBadges(saveWith([])).map((b) => b.step)).toEqual(JOURNEY_MAIN.map((i) => i.id));
  });

  it("a badge is earned exactly when its step is done; the rest are faint", () => {
    const badges = houseBadges(saveWith(["find-top-talent", "discover-mission"]));
    expect(badges.filter((b) => b.state === "done").map((b) => b.step)).toEqual([
      "find-top-talent",
      "discover-mission",
    ]);
    expect(badges.filter((b) => b.state !== "done")).toHaveLength(JOURNEY_MAIN.length - 2);
  });

  it("an unearned badge behind an unmet step carries its «Opens when…» line", () => {
    const badges = houseBadges(saveWith([]));
    const mission = badges.find((b) => b.step === "discover-mission");
    expect(mission?.state).toBe("closed");
    expect(mission?.line).toMatch(/^Opens when .+\. Inside: .+\.$/);
    expect(badges.find((b) => b.step === "find-top-talent")?.line).toBe("");
  });

  it("the Real Level badge is earned once QoL is done, even while the mission is not saved (issue #414)", () => {
    const badges = houseBadges(saveWith(["find-top-talent", "assess-qol"]));
    const level = badges.find((b) => b.step === "assess-qol");
    expect(level?.state).toBe("done");
    expect(level?.line).toBe("");
  });

  it("the offer badge is earned by a saved offer", () => {
    const badges = houseBadges(saveWith(["find-top-talent", "discover-mission", "map-assets"], true));
    expect(badges.find((b) => b.step === "build-business")?.state).toBe("done");
  });
});

describe("badgeResult", () => {
  const sheet = { topTalent: " The Alchemist ", missionTitle: "Help founders ship" };

  it("carries the talent and the mission in the player's own words", () => {
    expect(badgeResult("find-top-talent", sheet)).toBe("The Alchemist");
    expect(badgeResult("discover-mission", sheet)).toBe("Help founders ship");
  });

  it("is empty until there are words", () => {
    expect(badgeResult("find-top-talent", { topTalent: null, missionTitle: null })).toBeNull();
    expect(badgeResult("discover-mission", { topTalent: null, missionTitle: "  " })).toBeNull();
  });

  it("never carries the private level, the asset details or the offer (§14.7 q5)", () => {
    expect(badgeResult("assess-qol", sheet)).toBeNull();
    expect(badgeResult("map-assets", sheet)).toBeNull();
    expect(badgeResult("build-business", sheet)).toBeNull();
  });
});

describe("lockedRoomFold (issue #375)", () => {
  const closedOf = (rooms: ReturnType<typeof houseRooms>) => rooms.filter((r) => r.state === "closed");

  it("a fresh player sees one locked block and one fold line, not four blocks", () => {
    const rooms = houseRooms(saveWith(["find-top-talent"]));
    const { shown, folded } = lockedRoomFold(rooms);
    expect(closedOf(rooms).length).toBeGreaterThan(2);
    expect(shown).toBeDefined();
    expect(shown?.line).toMatch(/^Opens when .+\. Inside: .+\.$/);
    expect([shown, ...folded].map((r) => r?.id).sort()).toEqual(closedOf(rooms).map((r) => r.id).sort());
  });

  it("never leads with the soul-colors room: it waits on Spectrum Reading, not on a step", () => {
    const { shown, folded } = lockedRoomFold(houseRooms(saveWith(["find-top-talent"])));
    expect(shown?.id).not.toBe("colors");
    expect(folded.map((r) => r.id)).toContain("colors");
  });

  it("shows nothing when no room is locked", () => {
    const rooms = houseRooms(saveWith(JOURNEY_MAIN.map((i) => i.id), true)).map((r) => ({ ...r, state: "done" as const }));
    expect(lockedRoomFold(rooms)).toEqual({ shown: undefined, folded: [] });
  });
});
