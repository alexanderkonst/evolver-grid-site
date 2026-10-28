import { useId } from "react";
import { Link } from "react-router-dom";
import PlaceState from "@/components/game/PlaceState";
import { JOURNEY_MAIN } from "@/data/journeySequence";
import { getJourneyModule } from "@/data/journeyModules";
import { getVillagePlace, sceneObjectPosition } from "@/data/villagePlaces";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { placeSaveFromSheet } from "@/lib/placeState";
import { journeyRows, nextQuest, questRows } from "@/lib/questBoard";
import "./ModuleForm.css";
import "./QuestBoard.css";

/**
 * QuestBoard — the one Quest Board at `/game/journey` (WP-11).
 * Design: docs/02-strategy/game_of_being_you.md §14.2, §14.3, §14.8 row WP-11.
 *
 *   the Quest Board scene · the one next quest · the Journey (J1–J7) · in the world (J10–J12)
 *
 * It replaces the next-move hub and Today (`/game/next-move*` and `/today` redirect here).
 * Every row is a real event in the save in one of the five states of `placeState`; no points,
 * no XP, no streak. A guest reads the whole board (their save is empty, so the Journey starts
 * at the first step); recording a victory asks for the account at that moment (QuestModule).
 */

const QuestBoard = () => {
  const sheet = useCharacterSheet();
  const place = getVillagePlace("quest-board");
  const headingId = useId();
  const journeyId = useId();
  const worldId = useId();

  const save = placeSaveFromSheet(sheet);
  const journey = journeyRows(save);
  const quests = questRows(save);
  const next = nextQuest(save);
  const nextItem = next?.kind === "journey" ? JOURNEY_MAIN.find((i) => i.id === next.row.id) : undefined;

  return (
    <section className="mf qb" aria-labelledby={headingId} aria-busy={sheet.isLoading || undefined}>
      <Link className="mf__back" to="/village">
        ← Village
      </Link>
      {place ? (
        <div className="qb__scene">
          <img
            className="mf__img"
            src={place.image}
            alt={place.alt}
            decoding="async"
            style={{ objectPosition: sceneObjectPosition(place) }}
          />
        </div>
      ) : null}

      <div className="qb__body">
        <header className="qb__head">
          <p className="mf__eyebrow">Quest Board</p>
          <h1 id={headingId} className="mf__headline">
            Your next quest
          </h1>
          {sheet.isLoading ? null : next ? (
            <>
              <p className="mf__silhouette">
                {next.kind === "journey"
                  ? `${next.row.label}${nextItem?.result ? ` — ${nextItem.result}` : ""}`
                  : `${next.row.title} — ${next.row.line}`}
              </p>
              <Link className="mf__go" to={next.row.to}>
                {next.kind === "quest" ? (getJourneyModule(next.row.id)?.verb ?? "Enter") : "Enter"}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <p className="mf__silhouette">Nothing is waiting. Go and live the next thing.</p>
          )}
        </header>

        {sheet.isLoading ? null : (
          <>
            <section className="qb__group" aria-labelledby={journeyId}>
              <h2 id={journeyId} className="qb__h">
                The Journey
              </h2>
              <ol className="qb__list">
                {journey.map((r) => (
                  <PlaceState key={r.id} as="li" state={r.state} className="qb__row" line={r.line || undefined}>
                    {r.state === "closed" ? (
                      <span className="qb__name">{`${r.no}. ${r.label}`}</span>
                    ) : (
                      <Link className="qb__name" to={r.to}>
                        {`${r.no}. ${r.label}`}
                        {r.optional ? " (optional)" : ""}
                      </Link>
                    )}
                  </PlaceState>
                ))}
              </ol>
            </section>

            <section className="qb__group" aria-labelledby={worldId}>
              <h2 id={worldId} className="qb__h">
                In the world
              </h2>
              <ol className="qb__list">
                {quests.map((q) => (
                  <PlaceState key={q.id} as="li" state={q.state} className="qb__row" line={q.state === "closed" ? q.line : undefined}>
                    {q.state === "closed" ? (
                      <span className="qb__name">{`${q.journey} · ${q.title}`}</span>
                    ) : (
                      <Link className="qb__name" to={q.to}>
                        {`${q.journey} · ${q.title}`}
                      </Link>
                    )}
                  </PlaceState>
                ))}
              </ol>
            </section>
          </>
        )}
      </div>
    </section>
  );
};

export default QuestBoard;
