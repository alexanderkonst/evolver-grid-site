/**
 * GiftChips — the three things the player's AI has, lit or dim (§1.2, §1.5).
 * A lit gift glows and says what the AI now holds; a dim one says what opens it. Never a
 * score or a level: the chips show only real things (fidelity rule), and dim is a line of
 * text as well as a colour, so it is not colour-only.
 */
import { useTranslation } from "react-i18next";
import type { GiftState } from "./types";

/** `row` lays the three chips side by side from tablet width up, so the hand-over keeps its button on one screen. */
const GiftChips = ({ gifts, row = false }: { gifts: GiftState[]; row?: boolean }) => {
  const { t } = useTranslation();
  return (
    <ul className={`m-0 flex w-full list-none flex-col gap-2 p-0 text-left ${row ? "max-w-md md:max-w-3xl md:flex-row md:items-stretch" : "max-w-md"}`} aria-label={t("familiar.gifts.aria", { defaultValue: "What your AI has" })}>
      {gifts.map((g) => (
        <li
          key={g.key}
          data-gift={g.key}
          data-lit={g.lit}
          className={`rounded-sm border px-4 py-3 transition-opacity ${row ? "md:flex-1" : ""}`}
          style={{
            borderColor: g.lit ? "var(--open-accent)" : "var(--vl-hair)",
            opacity: g.lit ? 1 : 0.62,
            boxShadow: g.lit ? "0 0 28px -8px var(--open-accent)" : undefined,
          }}
        >
          <p className="m-0 text-base" style={{ color: "var(--vl-ink)" }}>
            <span aria-hidden="true">{g.lit ? "● " : "○ "}</span>
            {t(`familiar.gift.${g.key}`, { defaultValue: g.label })}
            {" "}
            <span className="sr-only">{g.lit ? t("familiar.gifts.lit", { defaultValue: "(has it)" }) : t("familiar.gifts.dim", { defaultValue: "(not yet)" })}</span>
          </p>
          {g.lit && g.detail ? (
            <p className="m-0 mt-1 text-sm italic" style={{ color: "var(--vl-ink-2)" }}>
              {g.detailKey ? t(`familiar.giftText.${g.detailKey}`, { ...g.params, defaultValue: g.detail }) : g.detail}
            </p>
          ) : null}
          {!g.lit && g.opensWhen ? (
            <p className="m-0 mt-1 text-sm italic" style={{ color: "var(--vl-ink-2)" }}>
              {g.opensWhenKey ? t(`familiar.giftText.${g.opensWhenKey}`, { defaultValue: g.opensWhen }) : g.opensWhen}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default GiftChips;
