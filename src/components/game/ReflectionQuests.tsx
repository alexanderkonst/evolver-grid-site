import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import PlaceState from "@/components/game/PlaceState";
import { usePlayerReflections, type PlayerReflection } from "@/hooks/usePlayerReflections";

/**
 * ReflectionQuests: the return loop on the Quest Board (share card, slice 2).
 * Each unread reflection is one quest: «{{name}} answered: Do you see me this way too?»
 * Opening it shows who, which of the three answers, and their line; closing marks it read.
 * For «partly» and «differently» it adds the real-life choice: «Ask them what they see.»
 * Design: docs/02-strategy/game_of_being_you.md §14.12a («What comes back»).
 *
 * Renders nothing while the database part is missing (`available=false`) or when there is
 * nothing unread, so the Quest Board is unchanged. No counts, no points: a row is a person.
 * Mount it only for a signed-in player (it asks the database who the player is).
 */

const ReflectionQuests = () => {
  const { t } = useTranslation();
  const { available, unread, markRead } = usePlayerReflections({ loadUnread: true });
  const headingId = useId();
  const panelId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  if (!available || unread.length === 0) return null;

  const toggle = (id: string) => {
    if (openId === id) {
      setOpenId(null);
      void markRead(id);
      return;
    }
    // Moving to another reflection closes (and so reads) the one that was open.
    if (openId) void markRead(openId);
    setOpenId(id);
  };

  const close = (id: string) => {
    setOpenId(null);
    void markRead(id);
  };

  const askThem = (r: PlayerReflection) => r.answer === "partly" || r.answer === "differently";

  return (
    <section className="qb__group" aria-labelledby={headingId}>
      <h2 id={headingId} className="qb__h">
        {t("shareCard.reflection.group")}
      </h2>
      <ol className="qb__list">
        {unread.map((r) => {
          const open = openId === r.id;
          const id = `${panelId}-${r.id}`;
          return (
            <PlaceState key={r.id} as="li" state="open" tag={false} className="qb__row">
              <button
                type="button"
                className="qb__name qb__toggle"
                aria-expanded={open}
                aria-controls={id}
                onClick={() => toggle(r.id)}
              >
                {t("shareCard.reflection.questTitle", { name: r.visitor_name })}
              </button>
              {open && (
                <div id={id} className="qb__reflection">
                  <p className="qb__done-when">
                    <span className="qb__done-when-label">{t("shareCard.reflection.from")}</span> {r.visitor_name}
                  </p>
                  <p className="qb__done-when">
                    <span className="qb__done-when-label">{t("shareCard.reflection.theirAnswer")}</span>{" "}
                    {t(`shareCard.answer.${r.answer}`)}
                  </p>
                  {r.line && (
                    <p className="qb__done-when">
                      <span className="qb__done-when-label">{t("shareCard.reflection.theirLine")}</span> {r.line}
                    </p>
                  )}
                  {askThem(r) && <p className="ps-line">{t("shareCard.reflection.ask")}</p>}
                  <button type="button" className="qb__close" onClick={() => close(r.id)}>
                    {t("shareCard.reflection.close")}
                  </button>
                </div>
              )}
            </PlaceState>
          );
        })}
      </ol>
    </section>
  );
};

export default ReflectionQuests;
