/**
 * AskMyAiButton — copy the personal prompt and open a new chat in the player's app (Task A, §9).
 *
 * «Take your AI →». When the prompt has changed since the player last copied it (they saved more of
 * themselves or their work), it reads «Update my AI →» instead. While the player's saves are still
 * loading it says «Reading your village…», so the wait has a name. The prompt is far too long for a
 * URL, so it always goes by clipboard and the chat opens empty, ready to paste into. If the browser
 * blocks the clipboard, the text appears in a selectable box with copy and download buttons.
 */
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { chatAppUrl } from "./chatApps";
import ClipboardFallback from "./ClipboardFallback";
import { copyText } from "./copyText";
import { getCopiedVersion, setCopiedVersion } from "./storage";
import type { ChatApp, FamiliarState } from "./types";
import "@/components/game/ModuleForm.css";

type Props = {
  state: FamiliarState;
  app: ChatApp;
  /** Called once the player holds the text (copied, or taken from the fallback box). */
  onCopied?: () => void;
  /** Shown beside the button once the player holds the text (the screen's «Next →»). */
  after?: ReactNode;
  className?: string;
};

type Outcome = "idle" | "copied" | "failed";

const AskMyAiButton = ({ state, app, onCopied, after, className }: Props) => {
  const { t } = useTranslation();
  const [outcome, setOutcome] = useState<Outcome>("idle");
  // The player holds the text: copied by the button, or taken from the fallback box.
  const [held, setHeld] = useState(false);
  // Read at render: a version stored by an earlier visit, or by a click just now.
  const [copiedVersion, setCopied] = useState<string | null>(() => getCopiedVersion());
  const stale = copiedVersion !== null && copiedVersion !== state.version;

  const taken = () => {
    setCopiedVersion(state.version);
    setCopied(state.version);
    setHeld(true);
    onCopied?.();
  };

  const onClick = async () => {
    // Copy first and open second, both before the first await: iOS Safari ties both to the tap.
    const copying = copyText(state.prompt);
    window.open(chatAppUrl(app), "_blank", "noopener,noreferrer");
    const ok = await copying;
    if (ok) taken();
    setOutcome(ok ? "copied" : "failed");
  };

  const label = state.loading
    ? t("familiar.handover.reading", { defaultValue: "Reading your village…" })
    : stale
      ? t("familiar.updateMyAi", { defaultValue: "Update my AI" })
      : t("familiar.takeYourAi", { defaultValue: "Take your AI" });

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-center gap-x-6">
        <button
          type="button"
          className="mf__go"
          onClick={onClick}
          disabled={state.loading}
          aria-busy={state.loading || undefined}
        >
          {label} {state.loading ? null : <span aria-hidden="true">→</span>}
        </button>
        {held ? after : null}
      </div>
      <p className="mf__rate-note" role="status">
        {outcome === "copied"
          ? t("familiar.pasteNote", { defaultValue: "Copied. Paste it into the new chat." })
          : outcome === "failed"
            ? t("familiar.copyFailed", {
                defaultValue: "Your browser blocked the copy. Copy the text from the box below, or download it.",
              })
            : ""}
      </p>
      {outcome === "failed" && (
        <ClipboardFallback
          text={state.prompt}
          onTaken={taken}
        />
      )}
    </div>
  );
};

export default AskMyAiButton;
