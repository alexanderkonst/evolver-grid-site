import { useId, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { PARTICLE_MAX } from "@/lib/particleGuard";
import {
  REFLECTION_ANSWERS,
  type PlayerReflectionsApi,
  type ReflectionAnswer,
} from "@/hooks/usePlayerReflections";
import "./ShareCard.css";

/**
 * ShareCardAnswer: the visitor side of the card (share card, slice 2).
 * Three answers to «Do you see me this way too?», one optional line «What do you see?»,
 * a first-name field for guests only. After sending: «Sent to {{name}}.»
 * Design: docs/02-strategy/game_of_being_you.md §14.12a («What the visitor does»).
 *
 * Renders nothing when the backend is not there yet (`available=false`) or when the
 * viewer is the player. No anonymity, no counts, no public list of answers.
 */

type Props = {
  /** The page's username (the RPC finds the player by it). */
  username: string;
  /** The player's name, for «Sent to {{name}}.» */
  playerName: string;
  /** The viewer is the owner of this page. */
  isOwner: boolean;
  /** The hook result from the parent, so one probe serves the whole page. */
  api: Pick<PlayerReflectionsApi, "available" | "userId" | "leave">;
};

const ShareCardAnswer = ({ username, playerName, isOwner, api }: Props) => {
  const { t } = useTranslation();
  const { available, userId, leave } = api;
  const [answer, setAnswer] = useState<ReflectionAnswer | null>(null);
  const [line, setLine] = useState("");
  const [name, setName] = useState("");
  // A signed-in visitor with no profile name is asked for one after the server says so.
  const [askName, setAskName] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const lineId = useId();
  const nameId = useId();

  if (!available || isOwner) return null;

  if (sent) {
    return (
      <div className="sc" data-variant="answer">
        <p className="sc__sent" role="status">
          {t("shareCard.answer.sent", { name: playerName })}
        </p>
      </div>
    );
  }

  const showName = !userId || askName;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || !answer) return;
    setBusy(true);
    const res = await leave({ username, answer, line, visitorName: name });
    setBusy(false);
    if (res.ok === false) {
      if (res.key === "needsName") setAskName(true);
      setNote(res.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="sc" data-variant="answer">
    <form className="sc__answer" onSubmit={submit} noValidate>
      <div className="sc__choices" role="group" aria-label={t("shareCard.answer.label")}>
        {REFLECTION_ANSWERS.map((key) => (
          <button
            key={key}
            type="button"
            className="sc__choice"
            aria-pressed={answer === key}
            onClick={() => {
              setAnswer(key);
              if (note) setNote(null);
            }}
          >
            {t(`shareCard.answer.${key}`)}
          </button>
        ))}
      </div>

      {answer && (
        <>
          <label className="sc__field-label" htmlFor={lineId}>
            {t("shareCard.answer.line")}
          </label>
          <input
            id={lineId}
            className="sc__input"
            type="text"
            value={line}
            maxLength={PARTICLE_MAX}
            autoComplete="off"
            onChange={(e) => {
              setLine(e.target.value);
              if (note) setNote(null);
            }}
          />
          {showName && (
            <>
              <label className="sc__field-label" htmlFor={nameId}>
                {t("shareCard.answer.name")}
              </label>
              <input
                id={nameId}
                className="sc__input"
                type="text"
                value={name}
                maxLength={60}
                autoComplete="given-name"
                onChange={(e) => {
                  setName(e.target.value);
                  if (note) setNote(null);
                }}
              />
            </>
          )}
          {note && (
            <p className="sc__note" role="alert">
              {note}
            </p>
          )}
          <button type="submit" className="sc__btn" disabled={busy}>
            {t("shareCard.answer.send")}
          </button>
        </>
      )}
    </form>
    </div>
  );
};

export default ShareCardAnswer;
