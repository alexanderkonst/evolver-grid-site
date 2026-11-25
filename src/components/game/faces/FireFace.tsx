/**
 * The fire face of the navigation instrument: Growth (docs/specs/navigation-instrument/architecture.md §6,
 * GoBY §25.14: fire = Academy and FMF). A lens, never a map: at most three items, each a place of the fire
 * quarter that is not closed, each handing the player back to that place in the village.
 *
 * It reads `placeState` and stores nothing. A closed place is left out whole (no name, no line, no lock
 * line), so the face never shows what the player has not reached. Fire's two places have no lock today,
 * and the same rule holds if one ever gets one. EarthFace.tsx is the same lens over the earth quarter;
 * the two are kept as separate files on purpose (one writer per file, sow.md).
 */
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronLeft, X } from "lucide-react";
import { QuarterSign } from "@/components/game/QuarterSign";
import { getVillageElement, VILLAGE_PLACES, type ElementKey, type VillagePlace } from "@/data/villagePlaces";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import type { FaceProps } from "@/lib/instrument/faces";
import { nextMove, oneNextStates, placeLine, placeSaveFromSheet, placeState, type PlaceSave, type PlaceStateName } from "@/lib/placeState";
import { placeName, stateWordText, tr } from "@/lib/villageCopy";

const ELEMENT: ElementKey = "fire";
const MAX_ITEMS = 3;

export type FireItem = {
  place: VillagePlace;
  state: Exclude<PlaceStateName, "closed">;
  /** The place in the village, `/village/<key>`: the same door the map and the rail use. */
  to: string;
};

/** What is live or next first, then what is only open, then what is done; the village order inside a group. */
const RANK: Record<PlaceStateName, number> = { live: 0, next: 1, open: 2, done: 3, closed: 4 };

/** The fire quarter's items for a save: no closed place, at most three. `places` is the village unless a test passes its own. */
export const fireFaceItems = (save: PlaceSave, places: readonly VillagePlace[] = VILLAGE_PLACES): FireItem[] => {
  // The same one-glow rule as the map and the rail (§25.4): only the next move's place reads `next`.
  const states = oneNextStates(places, places.map((p) => placeState(p, save)), nextMove(places, save));
  const items: FireItem[] = [];
  places.forEach((place, i) => {
    const state = states[i];
    if (place.element === ELEMENT && state !== "closed") items.push({ place, state, to: `/village/${place.key}` });
  });
  return items.map((item, i) => ({ item, i })).sort((a, b) => RANK[a.item.state] - RANK[b.item.state] || a.i - b.i).map(({ item }) => item).slice(0, MAX_ITEMS);
};

const ACCENT = "#bcd7e6";
const INK = "#e8eef2";
const MUTED = "#9fb2bd";
const PANEL = "#0b0e13";
const RAISED = "#121820";
const HAIRLINE = "rgba(188,215,230,0.18)";
const SERIF = "'Cormorant Garamond', serif";
const EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";

type ViewProps = Omit<FaceProps, "ownerId"> & {
  save: PlaceSave;
  /** The save has loaded; until then the list waits instead of showing «nothing yet». */
  ready?: boolean;
  places?: readonly VillagePlace[];
};

/** The face itself, from a save. `FireFace` below feeds it the player's own. */
export const FireFaceView = ({ save, ready = true, places = VILLAGE_PLACES, reduced, closeMs, active, onBack, onClose, onNavigate }: ViewProps) => {
  const { t } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const element = getVillageElement(ELEMENT);
  const items = fireFaceItems(save, places);

  // Once the face is forward, focus moves in.
  useEffect(() => {
    if (active) panelRef.current?.focus();
  }, [active]);

  return (
    <div
      ref={panelRef}
      role="region"
      aria-labelledby={titleId}
      aria-busy={!ready}
      tabIndex={-1}
      data-face-root={ELEMENT}
      className="pointer-events-auto relative flex max-h-full w-full flex-col gap-3 overflow-y-auto rounded-2xl p-4 outline-none sm:w-[26rem]"
      style={{
        backgroundColor: PANEL,
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "0 28px 60px -14px rgba(0,0,0,0.75)",
        color: INK,
        transformOrigin: "bottom right",
        opacity: active ? 1 : 0,
        transform: active || reduced ? "none" : "translateY(28px) scale(0.9)",
        transition: `opacity ${closeMs}ms ${EASE}, transform ${closeMs}ms ${EASE}`,
      }}
    >
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label={t("instrument.back")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
          style={{ color: MUTED }}
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
        <span aria-hidden="true" className="block">
          <QuarterSign element={ELEMENT} lit size={40} />
        </span>
        <h2 id={titleId} className="min-w-0 flex-1 text-xl leading-tight" style={{ fontFamily: SERIF, fontWeight: 600, color: INK }}>
          {tr(t, "instrument.face.fire", "Growth")}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("instrument.close")}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
          style={{ color: MUTED }}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      {ready && items.length === 0 && (
        <p className="rounded-xl p-3 text-[13px]" style={{ backgroundColor: RAISED, color: MUTED }}>
          {tr(t, "instrument.opensOnPath", "Opens on your path")}
        </p>
      )}

      {items.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {items.map(({ place, state, to }) => {
            const word = stateWordText(state, t);
            return (
              <li key={place.key}>
                <button
                  type="button"
                  data-place={place.key}
                  data-state={state}
                  onClick={() => onNavigate(to)}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
                  style={{ backgroundColor: RAISED, border: `1px solid ${HAIRLINE}`, color: INK }}
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-[15px] font-semibold leading-tight">{placeName(place, t)}</span>
                      {word && (
                        <span className="text-[12px]" style={{ color: element.color }}>
                          {word}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug" style={{ color: MUTED }}>
                      {placeLine(place, state, t)}
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" style={{ color: ACCENT }} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

/** The face registered in the fire slot (`src/lib/instrument/faces.ts`): the view over the player's own save. */
const FireFace = (face: FaceProps) => {
  const sheet = useCharacterSheet();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return <FireFaceView save={placeSaveFromSheet(sheet, now)} ready={!sheet.isLoading} {...face} />;
};

export default FireFace;
