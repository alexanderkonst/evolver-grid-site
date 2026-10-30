import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GameShellV2 from "@/components/game/GameShellV2";
import PlaceState from "@/components/game/PlaceState";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { getVillagePlace, sceneObjectPosition } from "@/data/villagePlaces";
import { placeLine, placeSaveFromSheet, placeState, type PlaceStateName } from "@/lib/placeState";
import { VILLAGE_INCOME_LABEL, useVillageIncome, villageIncomeText } from "@/lib/villageIncome";
import "@/components/game/ModuleForm.css";

/**
 * CoopSpace — Town Hall v0 (`/game/coop`, J13). WP-12.
 * Design: docs/02-strategy/game_of_being_you.md §14.1 (economy first, governance after),
 * §14.3 (the lock rule), §14.8 row WP-12, §17.1 J13.
 *
 *   closed  the faded scene and «Opens when your first sale is recorded. Inside: …»
 *           (`placeState` on the `town-hall` place; it opens on the J12 victory)
 *   open    the village's one public number, «Income of the village's residents»
 *           (src/lib/villageIncome.ts, the same figure the Investor Room shows), and one
 *           quiet line: «Your voice opens here next.» No voting yet.
 *
 * Module form: an Intro with one button, back to /village. A guest sees the closed state;
 * there is no redirect and no auth wall here.
 */

const VOICE_LINE = "Your voice opens here next";

/** The open Town Hall: the one number and the one quiet line. Reads the figure only once open. */
const TownHallNumber = () => {
  const { loading, income } = useVillageIncome();
  return (
    <>
      <p className="mf__number-label">{VILLAGE_INCOME_LABEL}</p>
      <p className="mf__number" aria-live="polite" aria-busy={loading || undefined}>
        {loading ? " " : villageIncomeText(income)}
      </p>
      <p className="mf__silhouette">{VOICE_LINE}</p>
    </>
  );
};

/** How long the door reads as open while the save loads, before it is read as an empty save (closed). */
const SHEET_WAIT_MS = 4000;

const TownHall = () => {
  const sheet = useCharacterSheet();
  const place = getVillagePlace("town-hall");
  const [gaveUp, setGaveUp] = useState(false);

  // A save that never answers (a slow or failed read) must not leave the closed line unsaid.
  useEffect(() => {
    if (!sheet.isLoading) return;
    const id = window.setTimeout(() => setGaveUp(true), SHEET_WAIT_MS);
    return () => window.clearTimeout(id);
  }, [sheet.isLoading]);

  if (!place) return null;

  // Until the save has loaded the door reads as open (as ModuleIntro does), never as a flash of closed.
  // If it has not loaded after SHEET_WAIT_MS, nothing in the save proves it open: closed.
  const state: PlaceStateName =
    sheet.isLoading && !gaveUp ? "open" : placeState(place, placeSaveFromSheet(sheet));
  const closed = state === "closed";

  return (
    <section className="mf mf--intro" aria-label="Town Hall">
      <Link className="mf__back" to="/village">
        ← Village
      </Link>
      <PlaceState
        state={state}
        className="mf__state"
        bodyClassName="mf__copy"
        scene={
          <img
            className="mf__img"
            src={place.image}
            alt={place.alt}
            decoding="async"
            style={{ objectPosition: sceneObjectPosition(place) }}
          />
        }
        line={closed ? placeLine(place, "closed") : undefined}
        action={
          <Link className="mf__go" to="/village">
            Back to the village <span aria-hidden="true">→</span>
          </Link>
        }
      >
        <p className="mf__eyebrow">Digital Village</p>
        <h1 className="mf__headline">Town Hall</h1>
        {(sheet.isLoading && !gaveUp) || closed ? null : <TownHallNumber />}
      </PlaceState>
    </section>
  );
};

const CoopSpace = () => (
  <GameShellV2>
    <ErrorBoundary>
      <div className="p-4 lg:p-8">
        <TownHall />
      </div>
    </ErrorBoundary>
  </GameShellV2>
);

export default CoopSpace;
