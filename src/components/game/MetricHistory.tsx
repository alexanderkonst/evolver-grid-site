import { useTranslation } from "react-i18next";
import { PLAYER_METRICS, changeFromPrevious, type MetricPoint, type PlayerMetricKey } from "@/lib/playerMetrics";

type MetricHistoryProps = {
  metric: PlayerMetricKey;
  series: MetricPoint[];
  className?: string;
};

/**
 * The player's own month-by-month history of one metric (issue #241): this month first, then the
 * months before, with the change against the previous measured month. Owner-only screen.
 */
export default function MetricHistory({ metric, series, className }: MetricHistoryProps) {
  const { t, i18n } = useTranslation();
  const def = PLAYER_METRICS[metric];
  if (series.length === 0) return null;
  const fmt = new Intl.DateTimeFormat(i18n.language || "en", { month: "long", year: "numeric" });
  const monthName = (m: string) => {
    const [y, mo] = m.split("-").map(Number);
    return fmt.format(new Date(y, mo - 1, 1));
  };
  const change = changeFromPrevious(series);

  return (
    <div className={className}>
      <p className="cs-mono">{t("playerMetrics.history.title")}</p>
      {change !== null ? (
        <p className="cs-level__why">
          {change === 0
            ? t("playerMetrics.history.same")
            : t(change > 0 ? "playerMetrics.history.up" : "playerMetrics.history.down", { change: Math.abs(change) })}
        </p>
      ) : null}
      <ul className="cs-history" aria-label={t("playerMetrics.history.title")}>
        {series.map((p) => (
          <li key={p.month}>
            <span>{monthName(p.month)}</span>{" "}
            <span>{t("playerMetrics.history.value", { value: p.value, max: def.max })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
