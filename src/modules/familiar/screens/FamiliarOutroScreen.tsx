/**
 * Screen 4 · Outro (the after-screen, the deliverable). A stable screen, never a toast: it stays
 * until the player leaves. The naming line, the three gifts as the result, the chat app the AI
 * will live in, and the one button, «Ask my AI →».
 * Spec: docs/specs/ai-familiar/ai-familiar_tracker.md §1.3.
 */
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AskMyAiButton from "../AskMyAiButton";
import ChatAppPicker from "../ChatAppPicker";
import GiftChips from "../GiftChips";
import type { ChatApp, FamiliarState } from "../types";
import "@/components/game/ModuleForm.css";

type Props = {
  state: FamiliarState;
  app: ChatApp;
  onApp: (app: ChatApp) => void;
  /** Whether the player has a profile to read: decides which privacy line is true. */
  signedIn: boolean;
};

const FamiliarOutroScreen = ({ state, app, onApp, signedIn }: Props) => {
  const { t } = useTranslation();
  const hasPersonal = state.gifts.some((g) => g.key !== "activated" && g.lit);

  return (
    <section className="mf mf--outro" aria-label={t("familiar.outro.aria", { defaultValue: "Your AI is ready" })}>
      <Link className="mf__back" to="/village">
        {t("village.backVillage", { defaultValue: "← Village" })}
      </Link>
      <div className="mf__stage" data-place-state="done">
        <p className="mf__eyebrow">{t("familiar.outro.eyebrow", { defaultValue: "Done · Your AI is ready" })}</p>

        <figure className="mf__badge">
          <figcaption className="mf__badge-name">{t("familiar.outro.badge", { defaultValue: "Your AI" })}</figcaption>
          <h1 className="mf__result">
            {t("familiar.outro.naming", {
              defaultValue: "Models have become alike. The difference is how well your AI knows you.",
            })}
          </h1>
        </figure>

        <div className="mf__facts">
          <p className="mf__fact">
            <Link to="/ai-os/benchmark">{t("familiar.outro.why", { defaultValue: "Why this works" })}</Link>
          </p>
        </div>

        <div className="mt-6 flex w-full justify-center">
          <GiftChips gifts={state.gifts} />
        </div>

        <div className="mf__facts">
          <p className="mf__fact">
            {t("familiar.outro.lives", { defaultValue: "Always here, in the village, at Your AI. It grows as you play." })}
          </p>
          <p className="mf__fact">
            {t("familiar.outro.unlocks", { defaultValue: "Take it into the chat app you already use." })}
          </p>
        </div>

        <ChatAppPicker value={app} onChange={onApp} />

        <div className="mf__after">
          <AskMyAiButton state={state} app={app} />
          <p className="mf__rate-note m-0 mt-2 max-w-md text-sm" style={{ color: "var(--vl-ink-2)" }}>
            {hasPersonal && signedIn
              ? t("familiar.outro.privacy", {
                  defaultValue:
                    "This copies your profile and Workshop work so you can paste it into your own AI. Nothing is sent anywhere until you paste.",
                })
              : t("familiar.outro.privacyGuest", {
                  defaultValue:
                    "This copies the AI OS prompt so you can paste it into your own AI. Nothing is sent anywhere until you paste.",
                })}
          </p>
          <p className="mf__fact mt-6">
            <Link to="/village">{t("familiar.outro.back", { defaultValue: "Back to the village" })}</Link>
            {" · "}
            <Link to="/ai-os">{t("familiar.outro.skills", { defaultValue: "Skills for your AI" })}</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FamiliarOutroScreen;
