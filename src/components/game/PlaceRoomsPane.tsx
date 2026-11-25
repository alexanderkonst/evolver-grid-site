import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { VillagePlace } from "@/data/villagePlaces";
import { journeyOptionalWord } from "@/lib/journeyLabels";
import { placeRooms, QUEST_BOARD_KEY, type PlaceRoomRow } from "@/lib/placeRooms";
import type { PlaceSave, PlaceStateName } from "@/lib/placeState";
import { placeName, stateWordText, tr } from "@/lib/villageCopy";

/**
 * The second pane of a place scene (GoBY §25.3): the scene and this pane stand together, and
 * the pane lists every room of the place at once, so a player takes in all options in one
 * glance. On the Quest Board it lists the order of quests instead (Journey J1–J7, then the
 * real-world quests J8–J12).
 *
 * It opens when the player enters a place (the parent keys it by place, so every entry starts
 * open on a wide screen) and when the player is looking at the quest order (also open on a
 * phone). A phone otherwise starts it closed behind one visible «Rooms» control.
 * Closed rooms are not links: `aria-disabled`, with the one line that says what opens them.
 */

type Props = {
  place: VillagePlace;
  save: PlaceSave;
  signedIn: boolean;
  /** Phone width: the pane is a bottom sheet and starts closed (except on the Quest Board). */
  mobile: boolean;
};

type Row = { id: string; name: string; line: string; state: PlaceStateName; to: string; no?: number; optional?: boolean };

const RoomRow = ({ row, t }: { row: Row; t: ReturnType<typeof useTranslation>["t"] }) => {
  const word = row.state === "closed" ? null : stateWordText(row.state, t);
  const body = (
    <>
      <span className="vl-rooms__name">
        {row.no ? <span className="vl-rooms__no" aria-hidden="true">{row.no}</span> : null}
        {/* One text item, so the space before «(optional)» is a real space, not flex gap. */}
        <span className="vl-rooms__label">
          {row.name}
          {row.optional ? <>{" "}<span className="vl-rooms__opt">({journeyOptionalWord(t)})</span></> : null}
        </span>
        {word ? <span className="vl-rooms__state">{word}</span> : null}
      </span>
      {row.line ? <span className="vl-rooms__line">{row.line}</span> : null}
    </>
  );
  return row.state === "closed" ? (
    <li className="vl-rooms__row is-closed" data-room-state="closed">
      <a role="link" aria-disabled="true" tabIndex={0}>{body}</a>
    </li>
  ) : (
    <li className="vl-rooms__row" data-room-state={row.state}>
      <Link to={row.to}>{body}</Link>
    </li>
  );
};

const PlaceRoomsPane = ({ place, save, signedIn, mobile }: Props) => {
  const { t } = useTranslation();
  const questOrder = place.key === QUEST_BOARD_KEY;
  const [open, setOpen] = useState(!mobile || questOrder);
  const view = placeRooms(place, save, { t, signedIn });

  const rooms: Row[] = view.rooms.map((r: PlaceRoomRow) => ({ ...r }));
  const journey: Row[] = (view.order?.journey ?? []).map((r) => ({
    id: r.id,
    name: r.label,
    line: r.state === "closed" ? r.line : r.doneWhen,
    state: r.state,
    to: r.to,
    no: r.no,
    optional: r.optional,
  }));
  const world: Row[] = (view.order?.world ?? []).map((r) => ({
    id: r.id,
    name: r.title,
    line: r.line,
    state: r.state,
    to: r.to,
  }));

  if (rooms.length === 0 && journey.length === 0) return null;

  const title = questOrder ? tr(t, "village.rooms.order", "Quest order") : tr(t, "village.rooms.title", "Rooms");
  return (
    <>
      <button
        type="button"
        className="vl-mono vl-rooms__toggle"
        aria-expanded={open}
        aria-controls="vl-rooms"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? tr(t, "village.rooms.hide", "Hide") : title}
      </button>
      <aside
        id="vl-rooms"
        className={`vl-rooms${open ? " is-open" : ""}`}
        aria-label={`${placeName(place, t)}: ${title}`}
        aria-hidden={open ? undefined : true}
        // `inert` keeps focus and taps out of a closed pane (React 18 has no prop for it).
        ref={(el) => {
          if (!el) return;
          if (open) el.removeAttribute("inert");
          else el.setAttribute("inert", "");
        }}
      >
        <p className="vl-mono vl-rooms__title">{title}</p>
        {rooms.length > 0 ? (
          <ul className="vl-rooms__list">
            {rooms.map((r) => <RoomRow key={r.id} row={r} t={t} />)}
          </ul>
        ) : null}
        {journey.length > 0 ? (
          <>
            <p className="vl-mono vl-rooms__group">{tr(t, "village.rooms.journey", "The Journey")}</p>
            <ol className="vl-rooms__list">
              {journey.map((r) => <RoomRow key={r.id} row={r} t={t} />)}
            </ol>
            <p className="vl-mono vl-rooms__group">{tr(t, "village.rooms.world", "In the world")}</p>
            <ul className="vl-rooms__list">
              {world.map((r) => <RoomRow key={r.id} row={r} t={t} />)}
            </ul>
          </>
        ) : null}
      </aside>
    </>
  );
};

export default PlaceRoomsPane;
