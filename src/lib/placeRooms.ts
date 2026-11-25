import type { TFunction } from "i18next";
import { PLACE_ROOMS } from "@/data/placeRooms";
import type { VillagePlace } from "@/data/villagePlaces";
import { QUEST_STEP_IDS, moduleClosedLine } from "@/data/journeyModules";
import { journeyResultText, journeyRows, questRows, type JourneyRow, type QuestRow } from "@/lib/questBoard";
import { closedLine, closedRoomLine, placeState, type NextMove, type PlaceSave, type PlaceStateName } from "@/lib/placeState";
import { tr } from "@/lib/villageCopy";

/**
 * What the second pane shows for a place (GoBY §25.3): every room of the place at once, and,
 * on the Quest Board, the order of quests. Pure and synchronous, like `placeState`; the scene
 * (src/pages/Village.tsx) loads the save and passes it in.
 */

export type PlaceRoomRow = {
  id: string;
  name: string;
  /** What the room gives (open) or its own closed line (closed). Empty when there is nothing to say. */
  line: string;
  state: PlaceStateName;
  to: string;
};

export type QuestOrder = { journey: JourneyRow[]; world: QuestRow[] };

export type PlaceRoomsView = {
  /** The place's rooms, steps first. Empty on the Quest Board. */
  rooms: PlaceRoomRow[];
  /** The order of quests: only the Quest Board has one. */
  order: QuestOrder | null;
};

export const QUEST_BOARD_KEY = "quest-board";

/**
 * One glow in the pane (§25.4 step 1): of all the rows of a place, only the one the player's
 * next move leads to reads `next`; any other row the save calls `next` reads `open`. The move's row
 * is the Journey step (`move.step`) or the quest the board offers; a live or quests move lights the
 * row whose route is `move.to`. A move at another place lights nothing here. Closed rows stay closed.
 */
const oneNextRow = <R extends { id: string; state: PlaceStateName; to: string }>(
  rows: R[],
  place: Pick<VillagePlace, "key">,
  move: Pick<NextMove, "kind" | "place" | "step" | "to"> | null | undefined,
  questId: string | null = null,
): R[] => {
  if (!move) return rows;
  const here = move.place.key === place.key;
  const isMove = (r: R) =>
    here && (move.kind === "step" ? r.id === move.step : questId ? r.id === questId : r.to === move.to);
  return rows.map((r) => {
    if (r.state === "closed" || r.state === "done") return r;
    if (isMove(r)) return r.state === "open" ? { ...r, state: "next" as const } : r;
    return r.state === "next" ? { ...r, state: "open" as const } : r;
  });
};

/** Every room of a place, or the quest order for the Quest Board, in the reader's language when `t` is given. */
export const placeRooms = (
  place: Pick<VillagePlace, "key" | "rule" | "name" | "line" | "to">,
  save: PlaceSave,
  opts: { t?: TFunction; signedIn?: boolean; move?: NextMove | null } = {},
): PlaceRoomsView => {
  const { t, signedIn = false, move = null } = opts;
  if (place.key === QUEST_BOARD_KEY) {
    // On the board a «quests» move is the first open real-world quest.
    const world = questRows(save, t);
    const firstQuest = move?.kind === "quests" ? world.find((r) => r.state === "open" || r.state === "next")?.id ?? null : null;
    return {
      rooms: [],
      order: { journey: oneNextRow(journeyRows(save, t), place, move), world: oneNextRow(world, place, move, firstQuest) },
    };
  }

  // A room is closed when its place is: «Opens when <what opens the place>. Inside: <that room's own result>.» (§25.5).
  const placeClosed = placeState({ line: "", rule: place.rule }, save) === "closed";
  const lockOf = (inside: string, key?: string) =>
    placeClosed ? closedRoomLine({ line: "", rule: place.rule }, inside, t, key) : "";

  const journey = journeyRows(save, t);
  const quests = questRows(save, t);
  const rooms: PlaceRoomRow[] = [];

  // Rooms the place holds as Journey steps or quests: read, not restated.
  for (const req of place.rule.steps ?? []) {
    const jr = journey.find((r) => r.id === req);
    if (jr) {
      rooms.push({
        id: jr.id,
        name: jr.label,
        line: placeClosed ? lockOf(journeyResultText(jr.id, t), `village.room.${jr.id}.closed`) : journeyResultText(jr.id, t),
        state: placeClosed ? "closed" : jr.state,
        to: jr.to,
      });
      continue;
    }
    const qr = (QUEST_STEP_IDS as readonly string[]).includes(req) ? quests.find((r) => r.id === req) : undefined;
    if (qr) {
      // A closed place's quest says what the quest itself says when closed (its module line, translated), not its long task.
      rooms.push({ id: qr.id, name: qr.title, line: placeClosed ? moduleClosedLine(qr.id, t) || lockOf(qr.line, `village.room.${qr.id}.closed`) : qr.line, state: placeClosed ? "closed" : qr.state, to: qr.to });
    }
  }

  // The routes the place already opens. One route is one room, whoever lists it first.
  const seen = new Set(rooms.map((r) => r.to));
  for (const room of PLACE_ROOMS[place.key] ?? []) {
    if (room.signedInOnly && !signedIn) continue;
    if (seen.has(room.to)) continue;
    seen.add(room.to);
    rooms.push({
      id: room.id,
      name: tr(t, `village.room.${room.id}.name`, room.name),
      line: placeClosed
        ? lockOf(tr(t, `village.room.${room.id}.result`, room.result), `village.room.${room.id}.closed`)
        : tr(t, `village.room.${room.id}.result`, room.result),
      state: placeClosed ? "closed" : "open",
      to: room.to,
    });
  }

  // A place with a single door (Your AI, FMF, Town Hall) is one room: the module behind its ENTER.
  if (rooms.length === 0) {
    rooms.push({
      id: place.key,
      name: tr(t, `village.place.${place.key}.name`, place.name),
      line: placeClosed ? closedLine({ line: "", rule: place.rule }, t) : tr(t, `village.place.${place.key}.line`, place.line),
      state: placeClosed ? "closed" : "open",
      to: place.to,
    });
  }

  return { rooms: oneNextRow(rooms, place, move), order: null };
};
