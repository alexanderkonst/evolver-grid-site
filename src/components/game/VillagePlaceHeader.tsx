import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * The «← Village» link of a place page (WP-15): the same mono label, the same 44px target, on
 * every place. Café, Co-working, Workshop and Market all read this one class list.
 */
export const PLACE_BACK_LINK_CLASS =
  "inline-flex items-center min-h-[44px] pr-3 font-mono text-xs font-light uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none transition-colors";

export default function VillagePlaceHeader({ place }: { place: "workshop" | "market" }) {
  const { t } = useTranslation();
  return (
    <header className="mb-6 space-y-2">
      {/* /village, not /game: /game is retired and lands on the Quest Board. */}
      <Link to="/village" className={PLACE_BACK_LINK_CLASS}>{t("village.backVillage")}</Link>
      <h1 className="text-2xl font-semibold text-foreground">{t(`villagePlaces.${place}.title`)}</h1>
      <p className="text-sm text-muted-foreground">{t(`villagePlaces.${place}.description`)}</p>
    </header>
  );
}
