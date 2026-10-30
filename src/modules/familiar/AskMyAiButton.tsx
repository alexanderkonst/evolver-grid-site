/**
 * AskMyAiButton — copy the personal prompt and open a new chat in the player's app (Task A, §9).
 *
 * «Ask my AI →». When the prompt has changed since the player last copied it (they saved more of
 * themselves or their work), it reads «Update my AI →» instead. The prompt is far too long for a
 * URL, so it always goes by clipboard and the chat opens empty, ready to paste into.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { chatAppName, chatAppUrl } from "./chatApps";
import { copyText } from "./copyText";
import { getCopiedVersion, setCopiedVersion } from "./storage";
import type { ChatApp, FamiliarState } from "./types";
import "@/components/game/ModuleForm.css";

type Props = {
  state: FamiliarState;
  app: ChatApp;
  /** Called after a successful copy (the screen may want to note it). */
  onCopied?: () => void;
  className?: string;
};

type Outcome = "idle" | "copied" | "failed";

const AskMyAiButton = ({ state, app, onCopied, className }: Props) => {
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState<Outcome>("idle");
  // Read at render: a version stored by an earlier visit, or by a click just now.
  const [copiedVersion, setCopied] = useState<string | null>(() => getCopiedVersion());
  const stale = copiedVersion !== null && copiedVersion !== state.version;
  const name = chatAppName(app);

  const onClick = async () => {
    // Copy first and open second, both before the first await: iOS Safari ties both to the tap.
    const copying = copyText(state.prompt);
    window.open(chatAppUrl(app), "_blank", "noopener,noreferrer");
    const ok = await copying;
    if (ok) {
      setCopiedVersion(state.version);
      setCopied(state.version);
      onCopied?.();
    }
    setOutcome(ok ? "copied" : "failed");
  };

  return (
    <div className={className}>
      <button type="button" className="mf__go" onClick={onClick} disabled={state.loading} aria-busy={state.loading || undefined}>
        {stale
          ? t("familiar.updateMyAi", { defaultValue: "Update my AI" })
          : t("familiar.askMyAi", { defaultValue: "Ask my AI" })}{" "}
        <span aria-hidden="true">→</span>
      </button>
      <p className="mf__rate-note" role="status">
        {outcome === "copied"
          ? t("familiar.pasteNote", {
              app: name,
              defaultValue: "Copied. Paste it into the new {{app}} chat, then ask it anything.",
            })
          : outcome === "failed"
            ? t("familiar.copyFailed", {
                defaultValue: "Your browser blocked the copy. Press the button again, or try another browser.",
              })
            : ""}
      </p>
    </div>
  );
};

export default AskMyAiButton;
