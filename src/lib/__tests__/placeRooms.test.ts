import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PlaceState } from "@/components/game/PlaceState";
import { VILLAGE_PLACES, getVillagePlace } from "@/data/villagePlaces";
import { emptyPlaceSave, nextMove, oneNextStates, placeSaveFromSheet, placeState, type PlaceSave, type PlaceStateName } from "@/lib/placeState";
import { placeRooms } from "@/lib/placeRooms";
import { JOURNEY_MAIN } from "@/data/journeySequence";
import en from "@/locales/en/common.json";
import es from "@/locales/es/common.json";
import ru from "@/locales/ru/common.json";
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

/** GoBY §25.4 step 1: one glowing next move, from one selector, the same in the map, the rail and the pane row. */
describe("one glowing next move", () => {
  const sheetWith = (done: string[]): PlaceSave =>
    placeSaveFromSheet({ chain: JOURNEY_MAIN.map((i) => ({ id: i.id, done: done.includes(i.id) })) }, new Date("2026-11-25T12:00:00Z"));
  const raw = (save: PlaceSave): PlaceStateName[] => VILLAGE_PLACES.map((p) => placeState(p, save));

  it("only the place of the next move reads `next`, on the map and the rail alike", () => {
    const save = sheetWith(["find-top-talent"]);
    const move = nextMove(VILLAGE_PLACES, save)!;
    const states = oneNextStates(VILLAGE_PLACES, raw(save), move);
    const lit = VILLAGE_PLACES.filter((_, i) => states[i] === "next").map((p) => p.key);
    expect(lit).toEqual([move.place.key]);
  });

  it("a guest who must save first has no `next` place: the move's own place is closed, and Reception no longer glows", () => {
    const save: PlaceSave = { ...emptyPlaceSave(new Date("2026-11-25T12:00:00Z")), met: { "guest-result": true } };
    const move = nextMove(VILLAGE_PLACES, save)!;
    expect(move.place.key).toBe("house");
    const states = oneNextStates(VILLAGE_PLACES, raw(save), move);
    expect(states.filter((s) => s === "next")).toHaveLength(0);
    expect(states[VILLAGE_PLACES.findIndex((p) => p.key === "house")]).toBe("closed");
  });

  it("never opens a closed place, never demotes done or live", () => {
    const states: PlaceStateName[] = ["closed", "done", "live", "open", "next"];
    const places = VILLAGE_PLACES.slice(0, 5);
    for (let i = 0; i < 5; i++) {
      const out = oneNextStates(places, states, { place: places[i] });
      expect(out[i] === "next", `${i}`).toBe(states[i] === "open" || states[i] === "next");
      if (states[i] === "closed" || states[i] === "done" || states[i] === "live") expect(out[i]).toBe(states[i]);
    }
  });

  it("the pane row of the next move reads `next`; every other row reads open", () => {
    const save = sheetWith(["find-top-talent"]);
    const move = nextMove(VILLAGE_PLACES, save)!;
    const view = placeRooms(at(move.place.key), save, { move });
    const nexts = view.rooms.filter((r) => r.state === "next").map((r) => r.id);
    expect(nexts).toEqual([move.step]);
  });

  it("on the Quest Board, the quest order glows only the move's row", () => {
    const save = sheetWith(["find-top-talent"]);
    const move = nextMove(VILLAGE_PLACES, save)!;
    const board = placeRooms(at("quest-board"), save, { move });
    const glowing = [...(board.order?.journey ?? []), ...(board.order?.world ?? [])].filter((r) => r.state === "next");
    expect(glowing.length).toBeLessThanOrEqual(1);
  });

  it("a move at another place lights no row in this pane", () => {
    const save = sheetWith([]);
    const move = nextMove(VILLAGE_PLACES, save)!;
    expect(move.place.key).toBe("reception");
    for (const p of VILLAGE_PLACES.filter((x) => x.key !== "reception")) {
      const v = placeRooms(p, save, { move, signedIn: true });
      expect([...v.rooms, ...(v.order?.journey ?? []), ...(v.order?.world ?? [])].some((r) => r.state === "next"), p.key).toBe(false);
    }
  });

  it("the rail, the top bar and the pane read the one selector (source pins)", () => {
    const read = (p: string) => readFileSync(resolve(__dirname, "../../..", p), "utf8");
    expect(read("src/hooks/usePlaceStates.ts")).toMatch(/oneNextStates\(VILLAGE_PLACES, raw, move\)/);
    expect(read("src/hooks/usePlayerNextMove.ts")).toMatch(/nextMove\(VILLAGE_PLACES, save\)/);
    expect(read("src/pages/Village.tsx")).toMatch(/oneNextStates\(VILLAGE_PLACES,/);
    expect(read("src/pages/Village.tsx")).toMatch(/<PlaceRoomsPane[^>]*move=\{move\}/);
  });

  it("the rail's glow holds still under prefers-reduced-motion", () => {
    const css = readFileSync(resolve(__dirname, "../../..", "src/index.css"), "utf8");
    expect(css).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.rail-next-glow \{ animation: none; \}/);
    const village = readFileSync(resolve(__dirname, "../../..", "src/pages/Village.css"), "utf8");
    expect(village).toMatch(/\.vl-rooms__row\[data-room-state="next"\] a \{ animation: none; \}/);
  });
});

/** Hark pass on #457. */
describe("pane and scene fixes from the Hark pass", () => {
  const read = (p: string) => readFileSync(resolve(__dirname, "../../..", p), "utf8");

  it("(a) the Hide control sits in the pane's fixed header, not over the scrolling rows", () => {
    const pane = read("src/components/game/PlaceRoomsPane.tsx");
    expect(pane).toMatch(/className="vl-rooms__head"[\s\S]*?vl-rooms__hide[\s\S]*?<\/div>\s*<div className="vl-rooms__body">/);
    // The floating toggle exists only while the pane is closed, when no text is under it.
    expect(pane).toMatch(/\{open \? null : \(\s*<button[\s\S]*?vl-rooms__toggle/);
    const css = read("src/pages/Village.css");
    const tail = css.slice(css.indexOf("Second pane of a place"));
    expect(tail).toMatch(/\.vl-rooms__body \{[^}]*overflow-y: auto/);
    expect(tail).not.toMatch(/\.vl-rooms \{[^}]*overflow-y: auto/);
  });

  it("(b) the closed place's «Your next move» sits outside the aria-disabled group", () => {
    const html = renderToStaticMarkup(
      createElement(PlaceState, {
        state: "closed",
        bodyClassName: "copy",
        line: "Opens when your mission is saved. Inside: your offer.",
        afterEnabled: createElement("a", { href: "/next" }, "Your next move: Find your top talent"),
      }),
    );
    expect(html).toContain('aria-disabled="true"');
    const group = html.slice(html.indexOf('role="group"'), html.indexOf("</div>", html.indexOf('role="group"')));
    expect(group).toContain("Opens when your mission is saved");
    expect(group).not.toContain("Your next move");
    const disabledAt = html.indexOf('aria-disabled="true"');
    expect(html.indexOf("Your next move")).toBeGreaterThan(disabledAt);
    // The root itself is not disabled, so the link inherits nothing.
    expect(html.match(/aria-disabled/g)).toHaveLength(1);
    expect(read("src/pages/Village.tsx")).toMatch(/afterEnabled=\{[\s\S]*?<ClosedNextMove/);
  });

  it("(c) the scene's «Your next move» says what it gives: the same result line as the quest row", () => {
    const village = read("src/pages/Village.tsx");
    expect(village).toMatch(/gives=\{moveCopy\.result\}/);
    expect(village).toMatch(/className="vl-newcomer__gives"/);
    expect(village).toMatch(/aria-describedby=\{gives \? givesId : undefined\}/);
  });
});

describe("room lines are translated (es, ru)", () => {
  const rooms = (d: unknown) => (d as { village: { room: Record<string, Record<string, string>> } }).village.room;
  const ids = Object.values(PLACE_ROOMS).flatMap((l) => (l ?? []).map((r) => r.id));

  it("every static room has a name and a result in en, es and ru", () => {
    for (const [lang, d] of [["en", en], ["es", es], ["ru", ru]] as const) {
      for (const id of ids) {
        expect(rooms(d)[id]?.name, `${lang}/${id}.name`).toBeTruthy();
        expect(rooms(d)[id]?.result, `${lang}/${id}.result`).toBeTruthy();
      }
    }
  });

  it("every room of a closed place has its own closed line, in the reader's language", () => {
    const closedIds = ["me-overview", "equilibrium", "my-artifacts", "settings", "genius-match", "connections", "people", "messages", "ubb-canvas", "ubb-session", "ubb-marketing", "ubb-distribution", "ubb-communications", "ubb-landing-page", "overview", "my-products", "discover-mission", "assess-qol", "map-assets", "build-business"];
    for (const id of closedIds) {
      expect(rooms(en)[id]?.closed, `en/${id}`).toMatch(/^Opens when .+\. Inside: .+\.$/);
      expect(rooms(es)[id]?.closed, `es/${id}`).toMatch(/^Se abre cuando .+\. Dentro: .+\.$/);
      expect(rooms(ru)[id]?.closed, `ru/${id}`).toMatch(/^Откроется, когда .+\. Внутри: .+\.$/);
    }
  });

  it("the pane's own words (Rooms, Quest order, Hide, The Journey, In the world) are translated", () => {
    for (const d of [en, es, ru]) {
      const r = (d as { village: { rooms: Record<string, string> } }).village.rooms;
      for (const k of ["title", "order", "hide", "journey", "world"]) expect(r[k], k).toBeTruthy();
    }
  });

  it("with a translator in es, a closed room reads the es line", () => {
    // The English default and the en catalog agree line for line.
    const view = placeRooms(at("workshop"), guest());
    const canvas = view.rooms.find((r) => r.id === "ubb-landing-page")!;
    expect(canvas.line).toBe(rooms(en)["ubb-landing-page"].closed);
  });
});
