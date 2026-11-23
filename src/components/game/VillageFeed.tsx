import { useCallback, useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/i18n/format";
import {
  checkDeedLine,
  fetchFeed,
  groupTaps,
  sendSeen,
  setSeenLine,
  type DeedEvent,
  type DeedTap,
} from "@/lib/villageFeed";

/**
 * VillageFeed: «What happened», below the open quests on the Quest Board (spec A16,
 * GoBY §24 #23). One chronological, finite list of real events, newest first, ending with
 * «You're up to date». No ranking, no filler, no infinite scroll, no counts.
 *
 * Each event has one tap, «I see you», and then an optional written line. On a deed of the
 * viewer's own, the people who tapped are listed by name (with their line): faces, never a
 * number. Nothing here counts anything.
 *
 * Renders nothing while the database part is missing (`available = false`), so the Quest
 * Board is unchanged until the migration is deployed (supabase/migrations/
 * 20261122230000_village_deeds_feed.sql). Mount it only for a signed-in player.
 * Not in Your House: this is the village square.
 */

type Props = { userId: string };

type State =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "ready"; events: DeedEvent[]; taps: DeedTap[] };

const VillageFeed = ({ userId }: Props) => {
  const { t } = useTranslation();
  const headingId = useId();
  const [state, setState] = useState<State>({ status: "loading" });
  const [lineFor, setLineFor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetchFeed().then((result) => {
      if (!live) return;
      setState(result.available ? { status: "ready", events: result.events, taps: result.taps } : { status: "unavailable" });
    });
    return () => {
      live = false;
    };
  }, [userId]);

  const upsertTap = useCallback((tap: DeedTap) => {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, taps: [...prev.taps.filter((x) => x.id !== tap.id), tap] }
        : prev,
    );
  }, []);

  const see = async (event: DeedEvent) => {
    if (busy) return;
    setBusy(event.event_key);
    setProblem(null);
    const result = await sendSeen(event.event_key, userId);
    setBusy(null);
    if (!result.ok) {
      setProblem(t("deeds.error.generic"));
      return;
    }
    upsertTap(result.tap);
  };

  const openLine = (tap: DeedTap) => {
    setLineFor(tap.event_key);
    setDraft(tap.line ?? "");
    setProblem(null);
  };

  const saveLine = async (tap: DeedTap) => {
    const checked = checkDeedLine(draft);
    if (checked.ok === false) {
      setProblem(t(`deeds.error.${checked.reason}`));
      return;
    }
    setBusy(tap.event_key);
    const result = await setSeenLine(tap.id, checked.line);
    setBusy(null);
    if (!result.ok) {
      setProblem(t("deeds.error.generic"));
      return;
    }
    upsertTap(result.tap);
    setLineFor(null);
    setProblem(null);
  };

  if (state.status !== "ready") return null;

  const taps = groupTaps(state.taps, userId);

  return (
    <section className="qb__group qb__feed" aria-labelledby={headingId}>
      <h2 id={headingId} className="qb__h">
        {t("deeds.heading")}
      </h2>
      <ol className="qb__list">
        {state.events.map((event) => {
          const entry = taps.get(event.event_key);
          const mine = entry?.mine ?? null;
          const from = entry?.from ?? [];
          const lineOpen = !!mine && lineFor === event.event_key;
          const fieldId = `${headingId}-${event.event_key}`;
          const sentence = t(event.is_own ? `deeds.own.${event.kind}` : `deeds.event.${event.kind}`, {
            name: event.doer_name,
          });
          return (
            <li key={event.event_key} className="qb__row qb__deed">
              <p className="qb__deed-line">{sentence}</p>
              {event.detail ? <p className="qb__deed-detail">{event.detail}</p> : null}
              <p className="qb__deed-when">{formatDate(event.occurred_at, { dateStyle: "medium" })}</p>

              {event.is_own ? (
                from.length > 0 ? (
                  <ul className="qb__seen" aria-label={t("deeds.seenBy")}>
                    {from.map((tap) => (
                      <li key={tap.id} className="qb__seen-row">
                        <span className="qb__seen-name">{tap.seer_name || t("deeds.someone")}</span>
                        {tap.line ? <span className="qb__seen-text">{tap.line}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : null
              ) : mine ? (
                <div className="qb__deed-actions">
                  <p className="qb__deed-sent" role="status">
                    {t("deeds.seenSent")}
                  </p>
                  {lineOpen ? (
                    <div className="qb__deed-line-form">
                      <label className="qb__done-when-label" htmlFor={fieldId}>
                        {t("deeds.lineLabel")}
                      </label>
                      <input
                        id={fieldId}
                        className="qb__deed-input"
                        type="text"
                        value={draft}
                        maxLength={200}
                        autoComplete="off"
                        placeholder={t("deeds.linePlaceholder")}
                        onChange={(e) => setDraft(e.target.value)}
                      />
                      <div className="qb__deed-buttons">
                        <button type="button" className="qb__close" disabled={busy === event.event_key} onClick={() => void saveLine(mine)}>
                          {t("deeds.lineSend")}
                        </button>
                        <button type="button" className="qb__deed-cancel" onClick={() => setLineFor(null)}>
                          {t("deeds.lineCancel")}
                        </button>
                      </div>
                    </div>
                  ) : mine.line ? (
                    <p className="qb__deed-yourline">
                      <span className="qb__done-when-label">{t("deeds.yourLine")}</span> {mine.line}
                    </p>
                  ) : (
                    <button type="button" className="qb__deed-cancel" onClick={() => openLine(mine)}>
                      {t("deeds.lineAdd")}
                    </button>
                  )}
                </div>
              ) : (
                <button type="button" className="qb__close" disabled={busy === event.event_key} onClick={() => void see(event)}>
                  {t("deeds.seeYou")}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      {problem ? (
        <p className="qb__deed-problem" role="alert">
          {problem}
        </p>
      ) : null}
      <p className="qb__upToDate">{t("deeds.upToDate")}</p>
    </section>
  );
};

export default VillageFeed;
