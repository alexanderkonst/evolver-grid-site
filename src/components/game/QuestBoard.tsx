import { useId } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PlaceState from "@/components/game/PlaceState";
import ReflectionQuests from "@/components/game/ReflectionQuests";
import SaveCharacterCta from "@/components/game/SaveCharacterCta";
import VillageFeed from "@/components/game/VillageFeed";
import { getJourneyModule, moduleText } from "@/data/journeyModules";
import { getVillagePlace, sceneObjectPosition } from "@/data/villagePlaces";
import { useAcceptedMicroQuest } from "@/hooks/useAcceptedMicroQuest";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlayerMetricHistory } from "@/hooks/usePlayerMetricHistory";
import { measureMonthQuest } from "@/lib/playerMetrics";
import { hasGuestTopTalentResult, readGuestTalentName } from "@/lib/firstVisit";
import { journeyOptionalWord } from "@/lib/journeyLabels";
import { awaitingSave, placeSaveFromSheet } from "@/lib/placeState";
import { journeyResultText, journeyRows, nextQuest, questRows } from "@/lib/questBoard";
import { placeAlt, tr } from "@/lib/villageCopy";
import "./ModuleForm.css";
import "./QuestBoard.css";

/**
 * QuestBoard — the one Quest Board at `/game/journey` (WP-11).
 * Design: docs/02-strategy/game_of_being_you.md §14.2, §14.3, §14.8 row WP-11.
 *
 *   the Quest Board scene · the one next quest · the Journey (J1–J7) · in the world (J8–J12)
 *   · «What happened» (A16: the feed of real deeds, signed-in players)
 *
 * It replaces the next-move hub and Today (`/game/next-move*` and `/today` redirect here).
 * Every row is a real event in the save in one of the five states of `placeState`; no points,
 * no XP, no streak. A guest reads the whole board (their save is empty, so the Journey starts
 * at the first step); recording a victory asks for the account at that moment (QuestModule).
 */

const QuestBoard = () => {
  const { t } = useTranslation();
  const sheet = useCharacterSheet();
  const metrics = usePlayerMetricHistory();
  const place = getVillagePlace("quest-board");
  const headingId = useId();
  const journeyId = useId();
  const worldId = useId();
  const monthId = useId();
  const microId = useId();
  const microQuest = useAcceptedMicroQuest();

  // A guest who has finished the test holds the reading on this device: the next move is to
  // save it, the same «Save your character» that Home shows (WP-7b).
  const guestResult = !sheet.isLoading && !sheet.userId && hasGuestTopTalentResult();
  const guestTalent = guestResult ? readGuestTalentName() : null;
  const save = placeSaveFromSheet(sheet, new Date(), { "guest-result": guestResult });
  const saveFirst = awaitingSave(save);
  const journey = journeyRows(save, t);
  const quests = questRows(save, t);
  const next = nextQuest(save, t);
  const doneWhenLabel = tr(t, "village.doneWhen.label", "Done when");
  const nextResult = next?.kind === "journey" ? journeyResultText(next.row.id, t) : "";
  // #241: a signed-in player with no measurement this calendar month gets «Measure your month».
  const monthQuest = measureMonthQuest(metrics);

  return (
    <section className="mf qb" aria-labelledby={headingId} aria-busy={sheet.isLoading || undefined}>
      <Link className="mf__back" to="/village">
        {tr(t, "village.backVillage", "← Village")}
      </Link>
      {place ? (
        <div className="qb__scene">
          <img
            className="mf__img"
            src={place.image}
            alt={placeAlt(place, t)}
            decoding="async"
            style={{ objectPosition: sceneObjectPosition(place) }}
          />
        </div>
      ) : null}

      <div className="qb__body">
        <header className="qb__head">
          <p className="mf__eyebrow">{tr(t, "village.place.quest-board.name", "Quest Board")}</p>
          <h1 id={headingId} className="mf__headline">
            {tr(t, "village.quest.heading", "Your next quest")}
          </h1>
          {sheet.isLoading ? null : saveFirst ? (
            <>
              {guestTalent ? (
                <p className="mf__silhouette">
                  {String(t("village.yourTalent", { name: guestTalent, defaultValue: "Your top talent: {{name}}" }))}
                </p>
              ) : null}
              <p className="mf__silhouette">
                {tr(t, "village.saveResult", "you'll keep your character, and Home opens.")}
              </p>
              <SaveCharacterCta buttonClassName="mf__go" />
            </>
          ) : next ? (
            <>
              <p className="mf__silhouette">
                {next.kind === "journey"
                  ? `${next.row.label}${nextResult ? ` — ${nextResult}` : ""}`
                  : `${next.row.title} — ${next.row.line}`}
              </p>
              <Link className="mf__go" to={next.row.to}>
                {next.kind === "quest" && getJourneyModule(next.row.id)
                  ? moduleText(getJourneyModule(next.row.id)!, "verb", t)
                  : tr(t, "village.enterWord", "Enter")}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <p className="mf__silhouette">{tr(t, "village.quest.empty", "Nothing is waiting. Go and live the next thing.")}</p>
          )}
        </header>

        {sheet.isLoading ? (
          // #438: the lists wait for the save, so say so in their own shape instead of leaving the
          // scene and heading alone on the page for seconds.
          <section className="qb__group" aria-hidden="true">
            <ol className="qb__list">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="qb__row">
                  <Skeleton className="h-5 w-2/3" />
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <>
            {monthQuest ? (
              <section className="qb__group qb__group--month" aria-labelledby={monthId}>
                <h2 id={monthId} className="qb__h">
                  {tr(t, "playerMetrics.quest.group", "This month")}
                </h2>
                <ol className="qb__list">
                  <PlaceState as="li" state="open" className="qb__row">
                    <Link className="qb__name" to={monthQuest.to}>
                      {tr(t, "playerMetrics.quest.title", "Measure your month")}
                    </Link>
                    <p className="qb__done-when">
                      <span className="qb__done-when-label">{doneWhenLabel}</span>{" "}
                      {tr(t, "playerMetrics.quest.doneWhen", "this month's level shows on your Home.")}
                    </p>
                  </PlaceState>
                </ol>
              </section>
            ) : null}

            {/* Share card slice 2: a visitor's answer comes back as a quest. Renders nothing
                while the database part is missing or nothing is unread, so the board is unchanged. */}
            {sheet.userId ? <ReflectionQuests /> : null}

            {/* A4: the micro-quest accepted after the reveal. Renders nothing until one is accepted. */}
            {microQuest ? (
              <section className="qb__group" aria-labelledby={microId}>
                <h2 id={microId} className="qb__h">
                  {t("zogEntry.microQuestBoardGroup")}
                </h2>
                <ol className="qb__list">
                  <PlaceState as="li" state="open" className="qb__row">
                    <span className="qb__name">{microQuest.quest}</span>
                    {microQuest.potential ? (
                      <p className="qb__done-when">{t("zogEntry.microQuestBoardFor", { title: microQuest.potential })}</p>
                    ) : null}
                  </PlaceState>
                </ol>
              </section>
            ) : null}

            <section className="qb__group" aria-labelledby={journeyId}>
              <h2 id={journeyId} className="qb__h">
                {tr(t, "village.quest.journey", "The Journey")}
              </h2>
              <ol className="qb__list">
                {journey.map((r) => (
                  <PlaceState key={r.id} as="li" state={r.state} className="qb__row" line={r.line || undefined}>
                    {r.state === "closed" ? (
                      <span className="qb__name">{`${r.no}. ${r.label}`}</span>
                    ) : (
                      <Link className="qb__name" to={r.to}>
                        {`${r.no}. ${r.label}`}
                        {r.optional ? ` (${journeyOptionalWord(t)})` : ""}
                      </Link>
                    )}
                    {r.doneWhen ? (
                      <p className="qb__done-when">
                        <span className="qb__done-when-label">{doneWhenLabel}</span> {r.doneWhen}
                      </p>
                    ) : null}
                  </PlaceState>
                ))}
              </ol>
            </section>

            <section className="qb__group" aria-labelledby={worldId}>
              <h2 id={worldId} className="qb__h">
                {tr(t, "village.quest.world", "In the world")}
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
                    {q.doneWhen ? (
                      <p className="qb__done-when">
                        <span className="qb__done-when-label">{doneWhenLabel}</span> {q.doneWhen}
                      </p>
                    ) : null}
                  </PlaceState>
                ))}
              </ol>
            </section>

            {/* A16: «What happened», below the open quests. Renders nothing while the database part
                is missing, so the board is unchanged until the migration is deployed. */}
            {sheet.userId ? <VillageFeed userId={sheet.userId} /> : null}
          </>
        )}
      </div>
    </section>
  );
};

export default QuestBoard;
