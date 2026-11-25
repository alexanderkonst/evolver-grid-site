import type { TFunction } from "i18next";
import { PLACE_ROOMS } from "@/data/placeRooms";
import type { VillagePlace } from "@/data/villagePlaces";
import { QUEST_STEP_IDS, getJourneyModule, questTaskText } from "@/data/journeyModules";
import { journeyResultText, journeyRows, questRows, type JourneyRow, type QuestRow } from "@/lib/questBoard";
import { closedLine, closedRoomLine, placeState, type PlaceSave, type PlaceStateName } from "@/lib/placeState";
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

/** Every room of a place, or the quest order for the Quest Board, in the reader's language when `t` is given. */
export const placeRooms = (
  place: Pick<VillagePlace, "key" | "rule" | "name" | "line" | "to">,
  save: PlaceSave,
  opts: { t?: TFunction; signedIn?: boolean } = {},
): PlaceRoomsView => {
  const { t, signedIn = false } = opts;
  if (place.key === QUEST_BOARD_KEY) {
    return { rooms: [], order: { journey: journeyRows(save, t), world: questRows(save, t) } };
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
      rooms.push({ id: qr.id, name: qr.title, line: placeClosed ? lockOf(questTaskText(getJourneyModule(qr.id), t), `village.room.${qr.id}.closed`) : qr.line, state: placeClosed ? "closed" : qr.state, to: qr.to });
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

  return { rooms, order: null };
};
