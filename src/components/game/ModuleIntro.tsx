import { useId } from "react";
import { Link } from "react-router-dom";
import PlaceState from "@/components/game/PlaceState";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import {
  moduleClosedLine,
  moduleHasRequirements,
  moduleIntroState,
  type JourneyModuleDef,
} from "@/data/journeyModules";
import { getVillagePlace, sceneObjectPosition } from "@/data/villagePlaces";
import { placeSaveFromSheet, type PlaceStateName } from "@/lib/placeState";
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
 */

type Props = {
  module: JourneyModuleDef;
  /** The one button. */
  onStart: () => void;
  /** Override the state read from the save (previews, tests). */
  state?: PlaceStateName;
  className?: string;
};

const ModuleIntro = ({ module, onStart, state: forced, className }: Props) => {
  const sheet = useCharacterSheet();
  const headingId = useId();
  const place = getVillagePlace(module.place);

  // A step with no requirement is never closed, so its button never waits for the save.
  const loading = forced === undefined && sheet.isLoading && moduleHasRequirements(module.id);
  const state: PlaceStateName =
    forced ?? (loading ? "open" : moduleIntroState(module.id, placeSaveFromSheet(sheet)));
  const closed = state === "closed";

  return (
    <section className={`mf mf--intro${className ? ` ${className}` : ""}`} aria-labelledby={headingId}>
      <Link className="mf__back" to="/village">
        ← Village
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
              alt={place.alt}
              decoding="async"
              style={{ objectPosition: sceneObjectPosition(place) }}
            />
          ) : undefined
        }
        line={closed ? moduleClosedLine(module.id) : undefined}
        action={
          <button type="button" className="mf__go" onClick={onStart} disabled={loading} aria-busy={loading || undefined}>
            {module.verb} <span aria-hidden="true">→</span>
          </button>
        }
      >
        <p className="mf__eyebrow">{module.eyebrow}</p>
        <h1 id={headingId} className="mf__headline">
          {module.headline}
        </h1>
        <p className="mf__silhouette">{module.silhouette}</p>
      </PlaceState>
    </section>
  );
};

export default ModuleIntro;
