/**
 * Screen 1 · Hand-over, the one screen of the place: the player takes their AI into the chat app
 * they already use. Eyebrow, one line, the three gifts, the chat-app picker, one primary button.
 * «Take your AI» copies the personal prompt and opens a new chat (AskMyAiButton); after the copy a
 * «Next →» leads to the Outro. No test and no rating: the place hands the AI over and nothing more.
 * Spec: docs/specs/ai-familiar/ai-familiar_tracker.md §1.3.
 */
import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AskMyAiButton from "../AskMyAiButton";
import ChatAppPicker from "../ChatAppPicker";
import GiftChips from "../GiftChips";
import { getChatApp, setChatApp } from "../storage";
import type { ChatApp, FamiliarState } from "../types";
import "@/components/game/ModuleForm.css";

type Props = {
  state: FamiliarState;
  onNext: () => void;
};

const FamiliarHandOverScreen = ({ state, onNext }: Props) => {
  const { t } = useTranslation();
  const headingId = useId();
  const [app, setApp] = useState<ChatApp>(() => getChatApp());
  const [copied, setCopied] = useState(false);

  const pick = (next: ChatApp) => {
    setApp(next);
    setChatApp(next);
  };

  return (
    <section className="mf mf--outro mf--fill" aria-labelledby={headingId}>
      <Link className="mf__back" to="/village">
        {t("village.backVillage", { defaultValue: "← Village" })}
      </Link>
      <div className="mf__stage" data-place-state="open">
        <p className="mf__eyebrow">{t("familiar.handover.eyebrow", { defaultValue: "Your AI" })}</p>
        <h1 id={headingId} className="mf__result" style={{ maxWidth: "24ch" }}>
          {t("familiar.handover.line", {
            defaultValue: "Your AI: your prompt, carried into the chat you already use.",
          })}
        </h1>

        <div className="mt-6 flex w-full justify-center">
          <GiftChips gifts={state.gifts} />
        </div>

        <ChatAppPicker value={app} onChange={pick} />

        <AskMyAiButton state={state} app={app} onCopied={() => setCopied(true)} />

        {copied && (
          <button type="button" className="mf__go" onClick={onNext}>
            {t("familiar.handover.next", { defaultValue: "Next" })} <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default FamiliarHandOverScreen;
