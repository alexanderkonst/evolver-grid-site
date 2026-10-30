import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function VillagePlaceHeader({ place }: { place: "workshop" | "market" }) {
  const { t } = useTranslation();
  return (
    <header className="mb-6 space-y-2">
      <Link to="/village"className="text-sm text-muted-foreground hover:text-foreground">{t("village.backVillage")}</Link>
      <h1 className="text-2xl font-semibold text-foreground">{t(`villagePlaces.${place}.title`)}</h1>
      <p className="text-sm text-muted-foreground">{t(`villagePlaces.${place}.description`)}</p>
    </header>
  );
}
