/**
 * YourAiHouseLine — the mark Your AI leaves in Home (AI-08). Once the player has taken their AI
 * (the version they last copied is on this device), Home carries a «Your AI» badge with one line.
 * When the prompt has changed since that take (they saved more of themselves or their work), the
 * line says so and offers «Update my AI», which leads back to the hand-over where the button reads
 * the same. It reuses `useFamiliar` for the current version and writes nothing.
 * A player who never took their AI sees nothing here.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getCopiedVersion } from "./storage";
import { useFamiliar } from "./useFamiliar";

const TakenLine = ({ taken }: { taken: string }) => {
  const { t } = useTranslation();
  const state = useFamiliar();
  const behind = !state.loading && state.version !== taken;
  return (
    <section className="cs-yourai" aria-label={t("familiar.house.badge", { defaultValue: "Your AI" })} data-your-ai-house>
      <p className="cs-mono cs-yourai__badge">{t("familiar.house.badge", { defaultValue: "Your AI" })}</p>
      <p className="cs-yourai__line">
        {behind
          ? t("familiar.house.behind", { defaultValue: "Your AI is behind: the game now holds more of you." })
          : t("familiar.house.line", { defaultValue: "Your AI is in your chat." })}
      </p>
      <Link className="cs-link" to="/game/your-ai">
        {behind ? t("familiar.updateMyAi", { defaultValue: "Update my AI" }) : t("familiar.handover.eyebrow", { defaultValue: "Your AI" })}{" "}
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
};

const YourAiHouseLine = () => {
  // Read at render: a take on this device. Nothing is loaded for a player who has not taken it.
  const taken = getCopiedVersion();
  return taken ? <TakenLine taken={taken} /> : null;
};

export default YourAiHouseLine;
