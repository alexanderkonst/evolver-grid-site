import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { VILLAGE_PLACES, getVillagePlace } from "@/data/villagePlaces";
import { emptyPlaceSave, placeSaveFromSheet, type PlaceSave } from "@/lib/placeState";
import { placeRooms } from "@/lib/placeRooms";
import { JOURNEY_MAIN } from "@/data/journeySequence";
import { PLACE_ROOMS } from "@/data/placeRooms";

/** GoBY §25.3: the second pane lists every room of the place at once, and the quest order on the Quest Board. */
const at = (key: string) => getVillagePlace(key)!;
const guest = (): PlaceSave => emptyPlaceSave(new Date("2026-11-25T12:00:00Z"));
const everythingDone = (): PlaceSave =>
  placeSaveFromSheet({
    chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: true })),
    offerSaved: true,
    victories: ["webinar", "mastermind", "mastery-practice", "first-price", "first-sale"],
  });

describe("placeRooms", () => {
  it("the Quest Board has the quest order, no rooms: the Journey J1–J7 then the world's J8–J12", () => {
    const view = placeRooms(at("quest-board"), guest());
    expect(view.rooms).toEqual([]);
    expect(view.order?.journey.map((r) => r.id)).toEqual(JOURNEY_MAIN.map((i) => i.id));
    expect(view.order?.world).toHaveLength(5);
  });

  it("no other place has a quest order", () => {
    for (const p of VILLAGE_PLACES.filter((x) => x.key !== "quest-board")) {
      expect(placeRooms(p, guest()).order).toBeNull();
    }
  });

  it("every other place lists at least one room, each with a name and a route", () => {
    for (const p of VILLAGE_PLACES.filter((x) => x.key !== "quest-board")) {
      const { rooms } = placeRooms(p, everythingDone(), { signedIn: true });
      expect(rooms.length, p.key).toBeGreaterThan(0);
      for (const r of rooms) {
        expect(r.name, `${p.key}/${r.id}`).not.toBe("");
        expect(r.to.startsWith("/"), `${p.key}/${r.id}`).toBe(true);
      }
    }
  });

  it("room ids and routes are unique inside a place", () => {
    for (const p of VILLAGE_PLACES) {
      const { rooms } = placeRooms(p, everythingDone(), { signedIn: true });
      expect(new Set(rooms.map((r) => r.id)).size, p.key).toBe(rooms.length);
      expect(new Set(rooms.map((r) => r.to)).size, p.key).toBe(rooms.length);
    }
  });

  it("rooms that are Journey steps take name and result from the Journey, not from this module", () => {
    const { rooms } = placeRooms(at("reception"), guest());
    const step = JOURNEY_MAIN.find((i) => i.id === "find-top-talent")!;
    expect(rooms[0].id).toBe("find-top-talent");
    expect(rooms[0].line).toBe(step.result ?? "");
  });

  it("a closed place closes all its rooms; each says «Opens when <place event>. Inside: <its own result>.»", () => {
    const { rooms } = placeRooms(at("workshop"), guest());
    expect(rooms.length).toBeGreaterThan(1);
    for (const r of rooms) {
      expect(r.state).toBe("closed");
      expect(r.line).toMatch(/^Opens when your mission is saved\. Inside: .+\.$/);
    }
    const canvas = rooms.find((r) => r.id === "ubb-landing-page")!;
    expect(canvas.line).toBe("Opens when your mission is saved. Inside: a landing page that carries your offer.");
  });

  it("no two rooms of a closed place repeat the same line (§25.5)", () => {
    for (const p of VILLAGE_PLACES.filter((x) => x.rule.closed && x.key !== "quest-board")) {
      const { rooms } = placeRooms(p, guest(), { signedIn: true });
      if (placeRooms(p, guest()).rooms.every((r) => r.state !== "closed")) continue;
      const lines = rooms.map((r) => r.line);
      expect(new Set(lines).size, `${p.key}: ${lines.join(" | ")}`).toBe(lines.length);
      for (const l of lines) expect(l, p.key).toMatch(/^Opens when .+\. Inside: .+\.$/);
    }
  });

  it("every static room has its own result", () => {
    for (const [key, list] of Object.entries(PLACE_ROOMS)) {
      for (const room of list ?? []) expect(room.result.trim(), `${key}/${room.id}`).not.toBe("");
    }
  });

  it("an open place's rooms are open", () => {
    const { rooms } = placeRooms(at("workshop"), everythingDone());
    expect(rooms.some((r) => r.state === "closed")).toBe(false);
  });

  it("a guest is not shown the Café rooms that ask to sign in", () => {
    const names = (signedIn: boolean) => placeRooms(at("cafe"), guest(), { signedIn }).rooms.map((r) => r.id);
    expect(names(false)).toEqual(["browse"]);
    expect(names(true)).toEqual(["browse", "my-rsvps", "create"]);
  });
});

describe("second pane contracts (source pins)", () => {
  const read = (p: string) => readFileSync(resolve(__dirname, "../../..", p), "utf8");

  it("the scene mounts the pane keyed by place, so every entry opens it afresh", () => {
    expect(read("src/pages/Village.tsx")).toMatch(/<PlaceRoomsPane key=\{lastPlace\.key\}/);
  });

  it("the pane starts open on a wide screen and on the quest order, closed on a phone otherwise", () => {
    expect(read("src/components/game/PlaceRoomsPane.tsx")).toMatch(/useState\(!mobile \|\| questOrder\)/);
  });

  it("a closed pane is inert and the closed rows are aria-disabled, never links", () => {
    const src = read("src/components/game/PlaceRoomsPane.tsx");
    expect(src).toMatch(/setAttribute\("inert", ""\)/);
    expect(src).toMatch(/aria-disabled="true"/);
  });

  it("motion respects prefers-reduced-motion", () => {
    const css = read("src/pages/Village.css");
    const tail = css.slice(css.indexOf("Second pane of a place"));
    expect(tail).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.vl-rooms, \.vl-place__copy \{ transition: none; \}/);
  });

  it("a closed place gives one enabled «Your next move» that leads where the map's card leads (§25.4)", () => {
    const src = read("src/pages/Village.tsx");
    expect(src).toMatch(/<ClosedNextMove[\s\S]*?to=\{move\.to\}/);
    expect(src).toMatch(/lastState === "closed" && !lastPending && move && moveCopy/);
    expect(src).not.toMatch(/NewcomerPath/);
  });

  it("the pane ends above the «Chat with us» pill, on a wide screen and on a phone", () => {
    const css = read("src/pages/Village.css");
    const tail = css.slice(css.indexOf("Second pane of a place"));
    expect(tail).toMatch(/\.vl-rooms \{[\s\S]*?bottom: var\(--chat-clearance, 72px\)/);
    expect(tail).toMatch(/max-width: 767px\) \{\s*\.vl-rooms \{[\s\S]*?bottom: var\(--chat-clearance, 72px\)/);
  });

  it("«optional» follows the room name in one text item, so there is a real space", () => {
    expect(read("src/components/game/PlaceRoomsPane.tsx")).toMatch(/\{" "\}<span className="vl-rooms__opt">/);
  });

  it("the shell opens pane 2 only when the player moves from one place to another", () => {
    const shell = read("src/components/game/GameShellV2.tsx");
    expect(shell).toMatch(/if \(activePlace && activePlace !== stoodInPlace\) \{/);
    expect(shell).toMatch(/if \(stoodInPlace && !isAuthRoute\) setSectionsPanelOpen\(true\)/);
  });
});
