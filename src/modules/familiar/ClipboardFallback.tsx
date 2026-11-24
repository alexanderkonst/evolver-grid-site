/**
 * ClipboardFallback — shown when the browser blocks the copy (AI-12). The whole prompt sits in a
 * selectable box, with a «Copy the text» button that tries again from a real tap on the box and a
 * «Download .txt» button, so the player is never left with an empty chat tab and nothing to paste.
 */
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { copyText } from "./copyText";
import { downloadText } from "./downloadText";
import "@/components/game/ModuleForm.css";

type Props = {
  text: string;
  /** Called once the player has the text by either way (copied from the box, or downloaded). */
  onTaken?: () => void;
};

const ClipboardFallback = ({ text, onTaken }: Props) => {
  const { t } = useTranslation();
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    boxRef.current?.select();
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      onTaken?.();
    }
  };

  const download = () => {
    if (downloadText(text, t("familiar.box.fileName", { defaultValue: "your-ai-prompt.txt" }))) onTaken?.();
  };

  return (
    <div className="mt-4 flex w-full max-w-md flex-col gap-3" data-clipboard-fallback>
      <textarea
        ref={boxRef}
        readOnly
        value={text}
        rows={6}
        aria-label={t("familiar.box.aria", { defaultValue: "Your AI prompt, ready to copy" })}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full resize-y rounded-sm border bg-transparent p-3 text-left font-mono text-xs"
        style={{ borderColor: "var(--vl-hair)", color: "var(--vl-ink)" }}
      />
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="mf__go" onClick={copy}>
          {t("familiar.box.copy", { defaultValue: "Copy the text" })}
        </button>
        <button type="button" className="mf__go" onClick={download}>
          {t("familiar.box.download", { defaultValue: "Download .txt" })}
        </button>
      </div>
      {copied && (
        <p className="mf__rate-note m-0" role="status">
          {t("familiar.box.copied", { defaultValue: "Copied. Paste it into the chat." })}
        </p>
      )}
    </div>
  );
};

export default ClipboardFallback;
