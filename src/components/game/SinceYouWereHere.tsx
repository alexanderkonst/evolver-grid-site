import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { HouseChange } from "@/lib/instrument/glint";

/**
 * "Since you were here" in Your House (WP6, #451): at most three lines, one per place that opened since
 * the last visit, each a link to the place. Renders nothing when nothing changed (no filler). This is
 * where changes are written in; the instrument only glints (`src/lib/instrument/glint.ts`).
 */
const SinceYouWereHere = ({ changes }: { changes: readonly HouseChange[] }) => {
  const { t } = useTranslation();
  if (changes.length === 0) return null;
  return (
    <section className="cs-since" aria-labelledby="cs-since-title" data-testid="since-you-were-here">
      <h2 id="cs-since-title" className="cs-mono cs-since__title">
        {t("characterSheet.since.title")}
      </h2>
      <ul className="cs-since__list">
        {changes.map((c) => (
          <li key={c.key} className="cs-since__item">
            <Link className="cs-since__link" to={c.to}>
              {c.line}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SinceYouWereHere;
