/**
 * ChatAppPicker — «Where will your AI live?» ChatGPT · Claude · Gemini (module-form §5, the real
 * choice). The pick is stored on this device and read by «Ask my AI».
 */
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { CHAT_APPS } from "./chatApps";
import type { ChatApp } from "./types";
import "@/components/game/ModuleForm.css";

type Props = {
  value: ChatApp;
  onChange: (app: ChatApp) => void;
  /** The question above the buttons; default «Where will your AI live?». */
  legend?: string;
};

const ChatAppPicker = ({ value, onChange, legend }: Props) => {
  const { t } = useTranslation();
  const labelId = useId();
  return (
    <fieldset className="mf__rate" style={{ marginTop: 22 }}>
      <legend className="mf__rate-q" id={labelId}>
        {legend ?? t("familiar.whereLive", { defaultValue: "Where will your AI live?" })}
      </legend>
      <div className="mf__rate-row" role="group" aria-labelledby={labelId}>
        {CHAT_APPS.map((a) => (
          <button
            key={a.id}
            type="button"
            className="mf__rate-btn"
            style={{ padding: "0 16px" }}
            aria-pressed={value === a.id}
            onClick={() => onChange(a.id)}
          >
            {a.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
};

export default ChatAppPicker;
