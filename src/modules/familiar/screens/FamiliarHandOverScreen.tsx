/**
 * Screen 1 · Hand-over, the one screen of the place: the player takes their AI into the chat app
 * they already use. Eyebrow, one line, the benefit (what the AI will know and do), the three gifts,
 * the chat-app picker, one primary button, then «What your AI receives» (PromptReceives).
 * «Take your AI» copies the personal prompt and opens a new chat (AskMyAiButton); after the copy a
 * «Next →» appears beside the button, scrolled into view, and leads to the Outro.
 * No test and no rating: the place hands the AI over and nothing more.
 * Spec: docs/specs/ai-familiar/ai-familiar_tracker.md §1.3.
 */
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AskMyAiButton from "../AskMyAiButton";
import ChatAppPicker from "../ChatAppPicker";
import GiftChips from "../GiftChips";
import PromptReceives from "../PromptReceives";
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
  const nextRef = useRef<HTMLButtonElement>(null);

  // AI-04: once the player holds the text, NEXT is on screen without a scroll, on a short phone too.
  useEffect(() => {
    const el = nextRef.current;
    if (!copied || !el) return;
    // Already well inside the window (a desktop screen): leave the page where it is.
    const { top, bottom } = el.getBoundingClientRect();
    if (top < 0 || bottom > window.innerHeight - 96) el.scrollIntoView({ block: "center" });
  }, [copied]);

  const pick = (next: ChatApp) => {
    setApp(next);
    setChatApp(next);
  };

  return (
    <section className="mf mf--outro" aria-labelledby={headingId}>
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

        <p className="mf__fact mt-4" style={{ maxWidth: "60ch" }}>
          {t("familiar.handover.benefit", {
            defaultValue:
              "Your AI will know your talent, mission and work, and answer as your co-pilot. The difference is how well it knows you.",
          })}
        </p>

        <div className="mt-6 flex w-full justify-center">
          <GiftChips gifts={state.gifts} row />
        </div>

        <ChatAppPicker value={app} onChange={pick} />

        <AskMyAiButton
          state={state}
          app={app}
          onCopied={() => setCopied(true)}
          after={
            <button ref={nextRef} type="button" className="mf__go" onClick={onNext}>
              {t("familiar.handover.next", { defaultValue: "Next" })} <span aria-hidden="true">→</span>
            </button>
          }
        />

        <PromptReceives state={state} />
      </div>
    </section>
  );
};

export default FamiliarHandOverScreen;
