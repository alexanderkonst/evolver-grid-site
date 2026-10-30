/**
 * PossibilityMap — the outro's map of what the player can do in the village now.
 * The top talent sits in the centre, a ray runs to every house. A lit house says what you can do
 * there and links to it; a dim house says what opens it. Dim is a line of text as well as a
 * colour. Client only: it reads the character sheet the game already loads, writes nothing.
 * The primary button is the first open next step (`nextMove`).
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCharacterSheet } from "@/hooks/useCharacterSheet";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import { hasGuestTopTalentResult } from "@/lib/firstVisit";
import { closedLine, nextMoveCopy, placeSaveFromSheet } from "@/lib/placeState";
import { placeName, tr } from "@/lib/villageCopy";
import { buildPossibilityMap } from "./possibilityMap";

const PossibilityMap = () => {
  const { t } = useTranslation();
  const sheet = useCharacterSheet();
  const userId = useSessionUserId();
  const ready = !sheet.isLoading && userId !== undefined;

  // A finished test on this device counts for a guest, as on the village map.
  const map = ready
    ? buildPossibilityMap(placeSaveFromSheet(sheet, new Date(), { "guest-result": userId === null && hasGuestTopTalentResult() }))
    : null;

  if (!map) {
    return (
      <p className="mf__rate-note" role="status">
        {t("familiar.map.loading", { defaultValue: "Reading your village." })}
      </p>
    );
  }

  const talent = sheet.topTalent?.trim();
  const move = map.next ? nextMoveCopy(map.next, t) : null;

  return (
    <section className="mt-8 flex w-full max-w-md flex-col items-center" aria-label={t("familiar.map.aria", { defaultValue: "What you can do in the village now" })}>
      <h2 className="mf__badge-name" style={{ margin: 0 }}>
        {t("familiar.map.title", { defaultValue: "What you can do now" })}
      </h2>

      <svg viewBox="0 0 100 100" className="mt-4 w-full max-w-[340px]" role="img" aria-hidden="true" focusable="false">
        {map.houses.map((h) => (
          <line
            key={`ray-${h.place.key}`}
            x1={50}
            y1={50}
            x2={h.x}
            y2={h.y}
            stroke={h.lit ? "var(--open-accent)" : "var(--vl-hair)"}
            strokeWidth={h.lit ? 0.5 : 0.3}
            strokeDasharray={h.lit ? undefined : "1.2 1.2"}
          />
        ))}
        {map.houses.map((h) => (
          <g key={`node-${h.place.key}`} data-house={h.place.key} data-lit={h.lit} opacity={h.lit ? 1 : 0.55}>
            <circle
              cx={h.x}
              cy={h.y}
              r={h.lit ? 2.6 : 2}
              fill={h.lit ? "var(--open-accent)" : "none"}
              stroke={h.lit ? "var(--open-accent)" : "var(--vl-ink-3)"}
              strokeWidth={0.5}
            />
            <text
              x={h.x}
              y={h.y + (h.y > 50 ? 6.4 : -4)}
              textAnchor="middle"
              fontSize={3.6}
              fill="var(--vl-ink)"
            >
              {placeName(h.place, t)}
            </text>
          </g>
        ))}
        <circle cx={50} cy={50} r={11} fill="rgba(var(--scene-bg-rgb), 0.6)" stroke="var(--open-accent)" strokeWidth={0.6} />
        <text x={50} y={talent ? 51 : 47.6} textAnchor="middle" fontSize={talent ? 3.4 : 2.7} fill="var(--vl-ink)">
          {talent ? (
            talent
          ) : (
            <>
              <tspan x={50}>{t("familiar.map.talentPlaceholder1", { defaultValue: "Your top talent" })}</tspan>
              <tspan x={50} dy={3.4}>{t("familiar.map.talentPlaceholder2", { defaultValue: "appears here" })}</tspan>
              <tspan x={50} dy={3.4}>{t("familiar.map.talentPlaceholder3", { defaultValue: "after the Zone of Genius" })}</tspan>
            </>
          )}
        </text>
      </svg>

      <ul className="m-0 mt-4 flex w-full list-none flex-col gap-2 p-0 text-left">
        {map.houses.map((h) => {
          const name = placeName(h.place, t);
          const line = !h.lit
            ? closedLine(h.place, t)
            : h.state === "live" && h.place.rule.live
              ? tr(t, h.place.rule.live.key, h.place.rule.live.line)
              : t(`familiar.map.do.${h.place.key}`, { defaultValue: h.line });
          const body = (
            <>
              <span className="block text-base" style={{ color: "var(--vl-ink)" }}>
                <span aria-hidden="true">{h.lit ? "● " : "○ "}</span>
                {name}
                <span className="sr-only">
                  {h.lit ? t("familiar.map.open", { defaultValue: " (open)" }) : t("familiar.map.closed", { defaultValue: " (not open yet)" })}
                </span>
              </span>
              <span className="mt-1 block text-sm italic" style={{ color: "var(--vl-ink-2)" }}>
                {line}
              </span>
            </>
          );
          return (
            <li
              key={h.place.key}
              data-house={h.place.key}
              data-lit={h.lit}
              className="rounded-sm border"
              style={{
                borderColor: h.lit ? "var(--open-accent)" : "var(--vl-hair)",
                opacity: h.lit ? 1 : 0.62,
              }}
            >
              {h.lit ? (
                <Link className="block px-4 py-3" to={h.place.to}>
                  {body}
                </Link>
              ) : (
                <div className="px-4 py-3">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-col items-center">
        {map.next && move ? (
          <Link className="mf__go" to={map.next.to}>
            {move.place}
            {move.title.toLowerCase() !== move.place.toLowerCase() ? ` · ${move.title}` : ""} <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link className="mf__go" to="/village">
            {t("familiar.outro.back", { defaultValue: "Back to the village" })} <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </section>
  );
};

export default PossibilityMap;
