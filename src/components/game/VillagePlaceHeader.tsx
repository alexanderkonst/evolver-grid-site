import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * The «← Village» link of a place page (WP-15): the same mono label, the same 44px target, on
 * every place. Café, Co-working, Workshop and Market all read this one class list.
 */
export const PLACE_BACK_LINK_CLASS =
  "inline-flex items-center min-h-[44px] pr-3 font-mono text-xs font-light uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none transition-colors";

/** The village register for a place's heading: letter-spaced serif caps (issue #443). */
const PLACE_TITLE_CLASS = "font-serif text-xl font-medium uppercase tracking-[0.18em] text-foreground";

/**
 * `titleAs="label"` is for a place whose own screens carry the page's h1 (the Workshop's
 * artifact screens in /ubb): the place name becomes a mono label, so the page has one h1,
 * not two stacked ones.
 */
export default function VillagePlaceHeader({
  place,
  titleAs = "heading",
}: {
  place: "workshop" | "market";
  titleAs?: "heading" | "label";
}) {
  const { t } = useTranslation();
  return (
    <header className="mb-6 space-y-2">
      {/* /village, not /game: /game is retired and lands on the Quest Board. */}
      <Link to="/village" className={PLACE_BACK_LINK_CLASS}>{t("village.backVillage")}</Link>
      {titleAs === "label" ? (
        <p className="font-mono text-xs font-light uppercase tracking-[0.2em] text-foreground">{t(`villagePlaces.${place}.title`)}</p>
      ) : (
        <>
          <h1 className={PLACE_TITLE_CLASS}>{t(`villagePlaces.${place}.title`)}</h1>
          <p className="text-sm text-muted-foreground">{t(`villagePlaces.${place}.description`)}</p>
        </>
      )}
    </header>
  );
}
