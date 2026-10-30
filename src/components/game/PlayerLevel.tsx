import { useTranslation } from "react-i18next";

type PlayerLevelProps = {
  /** The QoL average, 1–10; null when not measured yet. */
  level: number | null | undefined;
  className?: string;
};

/**
 * The player's own level (mean of the 8 QoL domains, issue #241), shown only on the player's own
 * screens. Other players see nothing about it: no number, no lock, no badge (Sasha, 2026-10-30).
 * Never render this on a surface another person can open, and never sort, filter or rank by it.
 */
export default function PlayerLevel({ level, className }: PlayerLevelProps) {
  const { t } = useTranslation();
  if (typeof level !== "number") return <span className={className}>{t("playerLevel.empty")}</span>;
  return <span className={className}>{t("playerLevel.value", { level })}</span>;
}
