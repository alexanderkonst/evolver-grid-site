import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ThreadMessage } from "@/lib/miniTraining/mirrorAi";

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const speechCtor = (): (new () => SpeechRec) | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/** Dialog cards (rung 1 #5, #8; rung 2 #2, #4, #5, #6b): the AI asks back, the player answers here by voice or text. */
const Conversation = ({
  messages,
  canReply,
  sending,
  onReply,
}: {
  messages: ThreadMessage[];
  canReply: boolean;
  sending: boolean;
  onReply: (text: string) => void | Promise<void>;
}) => {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const Ctor = speechCtor();

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = (typeof navigator !== "undefined" && navigator.language) || "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    const base = text.trim();
    rec.onresult = (e) => {
      let spoken = "";
      for (let i = 0; i < e.results.length; i++) spoken += e.results[i][0].transcript;
      setText([base, spoken.trim()].filter(Boolean).join(" "));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  };

  const submit = async () => {
    const value = text.trim();
    if (!value) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
    }
    setText("");
    await onReply(value);
  };

  return (
    <div className="mt-3 space-y-2" data-testid="conversation">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`rounded-md border p-3 text-sm leading-relaxed ${m.role === "ai" ? "border-border bg-background" : "border-transparent bg-muted/60"}`}
        >
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{m.role === "ai" ? "AI" : "You"}</p>
          <p className="whitespace-pre-wrap text-foreground">{m.text}</p>
        </div>
      ))}
      {canReply ? (
        <div className="space-y-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Answer it here, or press the microphone and say it."
            aria-label="Your answer to AI"
            className="text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={submit} disabled={sending || text.trim().length === 0}>
              {sending ? "Sending" : "Answer"}
            </Button>
            <Button type="button" size="sm" variant={listening ? "default" : "outline"} onClick={toggleMic} disabled={!Ctor} aria-pressed={listening}>
              {listening ? "Stop" : "Microphone"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Conversation;
