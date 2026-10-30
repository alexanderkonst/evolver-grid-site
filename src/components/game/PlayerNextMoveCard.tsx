import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { usePlayerNextMove } from "@/hooks/usePlayerNextMove";
import { tr } from "@/lib/villageCopy";

/**
 * The player's one next move, read from the same source as the map card (usePlayerNextMove).
 * Shared by `/next-move` and `/next-move-v2` so neither keeps a recommender of its own.
 */
export default function PlayerNextMoveCard() {
  const { t } = useTranslation();
  const { move, copy } = usePlayerNextMove();
  if (!move || !copy) return null;

  const showTitle = copy.title.toLowerCase() !== copy.place.toLowerCase();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-[#2c3150]">{tr(t, "village.nextMove", "Your next move")}</h2>
      <div className="rounded-xl border-2 border-[#c8b7d8] bg-[#c8b7d8]/10 p-6">
        <h3 className="text-lg font-semibold text-[#2c3150] mb-1">
          {copy.place}
          {showTitle ? `: ${copy.title}` : null}
        </h3>
        {move.kind === "step" ? <p className="text-sm text-[rgba(44,49,80,0.7)] mb-4">{copy.result}</p> : null}
        <Button asChild className="w-full" size="lg">
          <Link to={move.to}>{t("playerNextMove.go")}</Link>
        </Button>
      </div>
    </section>
  );
}
