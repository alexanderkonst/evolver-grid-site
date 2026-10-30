import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PlaceState from "@/components/game/PlaceState";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import {
  moduleClosedLine,
  moduleHasRequirements,
  moduleIntroState,
  moduleText,
  type JourneyModuleDef,
} from "@/data/journeyModules";
import { getVillagePlace, sceneObjectPosition } from "@/data/villagePlaces";
import { placeSaveFromSheet, type PlaceStateName } from "@/lib/placeState";
import { placeAlt, tr } from "@/lib/villageCopy";
import { useLeave } from "@/lib/motion";
import "./ModuleForm.css";

/**
 * ModuleIntro — the Before screen of a Journey module (WP-5).
 * Design: docs/02-strategy/game_of_being_you.md §14.4.
 *
 *   place scene · eyebrow · headline = the module's Master Result · 1–2 line
 *   silhouette · ONE button whose label is the result as a verb.
 *
 * While the step is not open yet the screen is faded (`closed` via placeState()) and shows
 * its «Opens when… Inside:…» line in place of the button. Copy lives in `JOURNEY_MODULES`
 * (src/data/journeyModules.ts); the state is read from the save.
 *
 * `state` is for previews and tests; by default it is read from the player's save, and the
 * button waits (disabled, never «closed») until the save has loaded.
 *
 * Motion (WP-15, src/lib/motion.ts): the scene settles in when the screen arrives; the one
 * button fades and pushes the scene in, then calls `onStart`. Reduced motion: `onStart` at once.
 */

type Props = {
  module: JourneyModuleDef;
  /** The one button. */
  onStart: () => void;
  /** Override the state read from the save (previews, tests). */
  state?: PlaceStateName;
  /** A shareable module (e.g. the QoL test a coach sends a client) is never shown as closed. */
  neverClosed?: boolean;
  /**
   * The page already holds this module's saved result (the QoL page has loaded its snapshot).
   * The button then no longer waits on the character sheet.
   */
  ready?: boolean;
  className?: string;
};

/** How long the button waits on the character sheet before it gives up and enables itself. */
const SHEET_WAIT_MS = 4000;

const ModuleIntro = ({ module, onStart, state: forced, ready = false, neverClosed = false, className }: Props) => {
  const { t } = useTranslation();
  const sheet = useCharacterSheet();
  const headingId = useId();
  const place = getVillagePlace(module.place);
  const { leaving, leave } = useLeave("fast");
  const [gaveUp, setGaveUp] = useState(false);

  // A sheet that never answers (a slow or failed read) must not leave the one button disabled.
  useEffect(() => {
    if (!sheet.isLoading) return;
    const id = window.setTimeout(() => setGaveUp(true), SHEET_WAIT_MS);
    return () => window.clearTimeout(id);
  }, [sheet.isLoading]);

  // A step with no requirement is never closed, so its button never waits for the save.
  const loading = forced === undefined && !ready && !gaveUp && sheet.isLoading && moduleHasRequirements(module.id);
  const read: PlaceStateName =
    forced ?? (loading ? "open" : moduleIntroState(module.id, placeSaveFromSheet(sheet)));
  const state: PlaceStateName = neverClosed && read === "closed" ? "open" : read;
  const closed = state === "closed";

  return (
    <section className={`mf mf--intro${leaving ? " is-leaving" : ""}${className ? ` ${className}` : ""}`} aria-labelledby={headingId}>
      <Link className="mf__back" to="/village">
        {tr(t, "village.backVillage", "← Village")}
      </Link>
      <PlaceState
        state={state}
        className="mf__state"
        bodyClassName="mf__copy"
        scene={
          place ? (
            <img
              className="mf__img"
              src={place.image}
              alt={placeAlt(place, t)}
              decoding="async"
              style={{ objectPosition: sceneObjectPosition(place) }}
            />
          ) : undefined
        }
        line={closed ? moduleClosedLine(module.id, t) : undefined}
        action={
          <button type="button" className="mf__go" onClick={(e) => leave(onStart, e)} disabled={loading} aria-busy={loading || undefined}>
            {moduleText(module, "verb", t)} <span aria-hidden="true">→</span>
          </button>
        }
      >
        <p className="mf__eyebrow">{moduleText(module, "eyebrow", t)}</p>
        <h1 id={headingId} className="mf__headline">
          {moduleText(module, "headline", t)}
        </h1>
        <p className="mf__silhouette">{moduleText(module, "silhouette", t)}</p>
      </PlaceState>
    </section>
  );
};

export default ModuleIntro;
