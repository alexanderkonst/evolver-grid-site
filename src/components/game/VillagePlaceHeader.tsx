import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * The «← Village» link of a place page (WP-15): the same mono label, the same 44px target, on
 * every place. Café, Co-working, Workshop and Market all read this one class list.
 */
export const PLACE_BACK_LINK_CLASS =
  "inline-flex items-center min-h-[44px] pr-3 font-mono text-xs font-light uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none transition-colors";

/** The village register for a place's heading: letter-spaced serif caps (issue #443). */
export const PLACE_TITLE_CLASS = "font-serif text-xl font-medium uppercase tracking-[0.18em] text-foreground";

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

/**
 * The header of a module page that is not a Village place card (Café, Co-working, People
 * Directory): the shared back control, one h1 in the village register, one line, and an
 * optional action. No icon beside the title, no second title (Seam 2/4).
 */
export function ModulePageHeader({
  title,
  line,
  action,
}: {
  title: ReactNode;
  line?: ReactNode;
  action?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <header className="mb-6 space-y-2">
      <Link to="/village" className={PLACE_BACK_LINK_CLASS}>{t("village.backVillage")}</Link>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className={PLACE_TITLE_CLASS}>{title}</h1>
          {line ? <p className="text-sm text-muted-foreground">{line}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
