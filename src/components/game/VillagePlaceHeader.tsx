import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { tr } from "@/lib/villageCopy";
import "./ModulePage.css";

/**
 * The «← Village» control of a module page (WP-15, Seam 2/4): the same mono label, the same
 * 44px target, the same position on every module. Café, Co-working, Workshop, Market, People
 * Directory, Mastermind and Your AI all read this one class.
 */
export const PLACE_BACK_LINK_CLASS = "mp-back";

/**
 * The control, in a full-width bar that is left-aligned to the pane (not to a centred column),
 * so it does not move when pane 2 opens or collapses. Render it before the page's own column.
 */
export function PlaceBackLink({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <div className={`mp-bar${className ? ` ${className}` : ""}`}>
      {/* /village, not /game: /game is retired and lands on the Quest Board. */}
      <Link to="/village" className={PLACE_BACK_LINK_CLASS}>
        {tr(t, "village.backVillage", "← Village")}
      </Link>
    </div>
  );
}

/**
 * The one header of a module page: one place name in the village title voice, one line, and an
 * optional action. The sub-sidebar already carries the place name as navigation, so a page adds
 * no second title, icon or eyebrow of its own.
 */
export function ModulePageHeader({
  title,
  line,
  action,
  titleId,
}: {
  title: ReactNode;
  line?: ReactNode;
  action?: ReactNode;
  titleId?: string;
}) {
  return (
    <header className="mp-head">
      <div className="mp-head__text">
        <h1 id={titleId} className="mp-title">{title}</h1>
        {line ? <p className="mp-line">{line}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

export default function VillagePlaceHeader({ place }: { place: "workshop" | "market" }) {
  const { t } = useTranslation();
  return (
    <ModulePageHeader
      title={t(`villagePlaces.${place}.title`)}
      line={t(`villagePlaces.${place}.description`)}
    />
  );
}
