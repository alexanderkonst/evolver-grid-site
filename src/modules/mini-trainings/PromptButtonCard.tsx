/**
 * PromptButtonCard: one «Ask AI» button as a card. A ready prompt, filled from the player's
 * profile and editable before sending. Controls: Send · Edit · Microphone · Copy.
 *
 *  - Send: hands the (possibly edited) text to `onSend`.
 *  - Edit: turns the prompt into a text field. Typing, or dictating with the microphone, marks it
 *    edited; a changed `prompt` prop (the profile loaded, a line was tapped) only replaces the
 *    text while the player has not edited it.
 *  - Microphone: browser speech-to-text, appended into the text field. Hidden where unsupported.
 *  - Copy: the text for any outside AI; `maskCopy` lets the caller redact private fields.
 *
 * Spec: docs/02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror.md, «How it works».
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Mic, MicOff, Pencil, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyText } from "@/modules/familiar/copyText";
import { appendSpoken, useSpeechToText } from "./mirror/useSpeechToText";

export type PromptAnswer = { id: string; text: string };

type Props = {
  /** Used for test ids and labels. */
  stepKey: string;
  /** Small label above the prompt, e.g. «Button» or «First, the vague one». */
  label?: string;
  /** The ready prompt. */
  prompt: string;
  onSend: (text: string) => void | Promise<void>;
  sending?: boolean;
  sendLabel?: string;
  /** When set, Send and Copy are off and this says why. */
  blockedReason?: string | null;
  /** A gentle note under the prompt; does not block. */
  hint?: string | null;
  /** Redacts the text before Copy (privacy rule). */
  maskCopy?: (text: string) => string;
  /** Shown above the prompt (e.g. the line picker in #6). */
  children?: ReactNode;
  /** Answers to this button, oldest first. */
  answers?: PromptAnswer[];
  error?: string | null;
  /** Shown under the answers (e.g. «Save plan»). */
  footer?: ReactNode;
  /** True while the AI call is the marked stub. */
  stub?: boolean;
};

const PromptButtonCard = ({
  stepKey,
  label,
  prompt,
  onSend,
  sending = false,
  sendLabel = "Send",
  blockedReason = null,
  hint = null,
  maskCopy,
  children,
  answers = [],
  error = null,
  footer,
  stub = false,
}: Props) => {
  const [text, setText] = useState(prompt);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState<"idle" | "ok" | "failed">("idle");
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!dirty) setText(prompt);
  }, [prompt, dirty]);

  const speech = useSpeechToText((spoken) => {
    setText((current) => appendSpoken(current, spoken));
    setDirty(true);
    setEditing(true);
  });

  useEffect(() => {
    if (editing) fieldRef.current?.focus();
  }, [editing]);

  const blocked = blockedReason !== null;
  const empty = text.trim().length === 0;

  const onCopy = async () => {
    const ok = await copyText(maskCopy ? maskCopy(text) : text);
    setCopied(ok ? "ok" : "failed");
    window.setTimeout(() => setCopied("idle"), 2000);
  };

  return (
    <div
      className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm"
      data-testid={`prompt-card-${stepKey}`}
    >
      {label && <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">{label}</p>}
      {children}

      {editing ? (
        <Textarea
          ref={fieldRef}
          value={text}
          rows={Math.min(10, Math.max(4, text.split("\n").length + 1))}
          aria-label="Your prompt (editable)"
          onChange={(e) => {
            setText(e.target.value);
            setDirty(true);
          }}
          data-testid={`prompt-field-${stepKey}`}
        />
      ) : (
        <pre
          className="whitespace-pre-wrap break-words rounded-xl bg-muted/50 p-3 font-sans text-sm"
          data-testid={`prompt-text-${stepKey}`}
        >
          {text}
        </pre>
      )}

      {blocked && (
        <p className="mt-2 text-sm text-muted-foreground" data-testid={`prompt-blocked-${stepKey}`}>
          {blockedReason}
        </p>
      )}
      {hint && !blocked && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
      {speech.error && <p className="mt-2 text-sm text-destructive">{speech.error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={() => void onSend(text)}
          disabled={blocked || empty || sending}
          aria-busy={sending || undefined}
          data-testid={`prompt-send-${stepKey}`}
        >
          <Send className="mr-2 h-4 w-4" aria-hidden="true" />
          {sending ? "Sending…" : sendLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing((v) => !v)}
          aria-pressed={editing}
          data-testid={`prompt-edit-${stepKey}`}
        >
          <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
          {editing ? "Done" : "Edit"}
        </Button>
        {speech.supported && (
          <Button
            type="button"
            variant="outline"
            onClick={speech.toggle}
            aria-pressed={speech.listening}
            aria-label={speech.listening ? "Stop the microphone" : "Speak your prompt"}
            data-testid={`prompt-mic-${stepKey}`}
          >
            {speech.listening ? (
              <MicOff className="mr-2 h-4 w-4" aria-hidden="true" />
            ) : (
              <Mic className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {speech.listening ? "Listening…" : "Speak"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => void onCopy()}
          disabled={blocked || empty}
          data-testid={`prompt-copy-${stepKey}`}
        >
          {copied === "ok" ? (
            <Check className="mr-2 h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {copied === "ok" ? "Copied" : copied === "failed" ? "Copy failed" : "Copy"}
        </Button>
        {dirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDirty(false);
              setText(prompt);
            }}
          >
            Reset to ready prompt
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {answers.length > 0 && (
        <div className="mt-4 space-y-2" aria-live="polite">
          {stub && (
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300" data-testid={`prompt-stub-${stepKey}`}>
              Stub answer: the AI call is not connected yet.
            </p>
          )}
          {answers.map((a) => (
            <p
              key={a.id}
              className="whitespace-pre-wrap rounded-xl border border-border p-3 text-sm"
              data-testid={`prompt-answer-${stepKey}`}
            >
              {a.text}
            </p>
          ))}
        </div>
      )}
      {footer}
    </div>
  );
};

export default PromptButtonCard;
