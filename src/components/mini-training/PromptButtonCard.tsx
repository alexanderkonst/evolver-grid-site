import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Mic, MicOff, Pencil, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

/**
 * PromptButtonCard (issue #392, spec: 01-ai-as-a-mirror.md «The Ask AI button»).
 *
 * A card with a ready prompt. The person presses Send; one tap. The prompt is editable
 * (Edit, or the microphone to say it their own way) and can be copied into any outside AI.
 * The card knows nothing about profiles or the AI: the page hands it the filled prompt,
 * what Copy should write, and what Send does.
 */

type RecognitionResult = { 0: { transcript: string }; isFinal: boolean; length: number };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionCtor = new () => Recognition;

const recognitionCtor = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export type PromptButtonCardProps = {
  /** The prompt as built from the profile. Shown until the person edits it. */
  prompt: string;
  /** What Copy writes for the current text (masks private fields). */
  copyText: (text: string) => string;
  /** Called with the text on the card when Send is pressed. */
  onSend: (text: string) => void | Promise<void>;
  /** The AI's latest answer to this button, shown under the card. */
  answer?: string | null;
  /** True while the AI is answering. */
  sending?: boolean;
  /** Send is blocked (with the reason shown as a hint). */
  sendDisabledReason?: string | null;
  /** The card's heading. */
  title: string;
  /** Extra controls under the answer (Save plan). */
  children?: ReactNode;
  /** The prompt asks the person to say something themselves (an empty mission): shown beside the mic. */
  micHint?: string | null;
  testId?: string;
};

const PromptButtonCard = ({
  prompt,
  copyText,
  onSend,
  answer,
  sending = false,
  sendDisabledReason = null,
  title,
  children,
  micHint = null,
  testId,
}: PromptButtonCardProps) => {
  const [text, setText] = useState(prompt);
  const [edited, setEdited] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);
  const baseRef = useRef("");
  const micSupported = recognitionCtor() !== null;

  // The prompt follows the profile (and #6's tapped line) until the person has edited it.
  useEffect(() => {
    if (!edited) setText(prompt);
  }, [prompt, edited]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const changeText = (value: string) => {
    setText(value);
    setEdited(true);
  };

  const resetPrompt = () => {
    setEdited(false);
    setText(prompt);
  };

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const toggleMic = () => {
    if (listening) {
      stopListening();
      return;
    }
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    baseRef.current = text.trim();
    setEditing(true);
    rec.onresult = (e) => {
      let spoken = "";
      for (let i = 0; i < e.results.length; i++) spoken += e.results[i][0].transcript;
      const joined = [baseRef.current, spoken.trim()].filter(Boolean).join(" ");
      setText(joined);
      setEdited(true);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const copy = async () => {
    const out = copyText(text);
    try {
      await navigator.clipboard.writeText(out);
    } catch {
      // Older browsers / blocked clipboard: fall back to a hidden textarea.
      const area = document.createElement("textarea");
      area.value = out;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(area);
      }
    }
    setCopied(true);
    toast("Copied. Paste it into any AI.");
    window.setTimeout(() => setCopied(false), 2000);
  };

  const send = () => {
    if (listening) stopListening();
    void onSend(text.trim());
  };

  const blocked = sending || !!sendDisabledReason || text.trim().length === 0;

  return (
    <section
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      aria-label={title}
      data-testid={testId}
    >
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>

      {editing ? (
        <Textarea
          value={text}
          onChange={(e) => changeText(e.target.value)}
          rows={Math.min(10, Math.max(4, Math.ceil(text.length / 60)))}
          aria-label="Prompt, editable"
          className="text-sm"
        />
      ) : (
        <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm leading-relaxed text-foreground">{text}</p>
      )}

      {micHint ? <p className="mt-2 text-xs text-muted-foreground">{micHint}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={send} disabled={blocked}>
          {sending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
          {sending ? "Sending" : "Send"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setEditing((v) => !v)} aria-pressed={editing}>
          <Pencil className="mr-1.5 h-4 w-4" />
          {editing ? "Done editing" : "Edit"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={listening ? "default" : "outline"}
          onClick={toggleMic}
          disabled={!micSupported}
          aria-pressed={listening}
          title={micSupported ? "Say it your own way" : "Voice input is not available in this browser"}
        >
          {listening ? <MicOff className="mr-1.5 h-4 w-4" /> : <Mic className="mr-1.5 h-4 w-4" />}
          {listening ? "Stop" : "Microphone"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        {edited ? (
          <button type="button" onClick={resetPrompt} className="text-xs text-muted-foreground underline">
            Reset to the original
          </button>
        ) : null}
      </div>

      {sendDisabledReason ? <p className="mt-2 text-xs text-muted-foreground">{sendDisabledReason}</p> : null}

      {answer ? (
        <div className="mt-4 rounded-md border border-border bg-background p-3" aria-live="polite">
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Answer</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{answer}</p>
        </div>
      ) : null}

      {children}
    </section>
  );
};

export default PromptButtonCard;
