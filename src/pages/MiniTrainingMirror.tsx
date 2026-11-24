import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import PromptButtonCard from "@/components/mini-training/PromptButtonCard";
import { useMirrorProfile } from "@/hooks/useMirrorProfile";
import { ZOG_ENTRY_PATH } from "@/lib/shellRoutes";

/** Where the conversation continues after the mini-training: Your AI. */
const YOUR_AI_PATH = "/game/your-ai";
import { MIRROR_CLOSING, MIRROR_MODULE_COPY, MIRROR_OPENING } from "@/lib/miniTraining/mirrorCopy";
import {
  MAX_LINE_TAPS,
  answerLines,
  prepareForCopy,
  stepsOfModule,
  type MirrorProfile,
  type PromptStep,
} from "@/lib/miniTraining/mirrorPrompts";
import {
  askMirrorAi,
  MIRROR_AI_IS_STUB,
  type ThreadMessage,
} from "@/lib/miniTraining/mirrorAi";
import {
  emptyMirrorState,
  isModuleDone,
  lastAnswer,
  loadMirrorState,
  modulesDone,
  saveMirrorState,
  type MirrorState,
} from "@/lib/miniTraining/mirrorState";
import { videoEmbedUrl } from "@/lib/miniTraining/video";

/**
 * Mini-training 1 · AI as a Mirror (issue #392). Route only: /mini-trainings/ai-as-a-mirror,
 * linked from nowhere public until the owner announces it.
 *
 * Spec: docs/02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror.md (v0.6).
 * Copy: docs/02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror-texts.md (via lib/miniTraining/mirrorCopy.ts).
 * Template followed: module-form (screen) + spec-handoff.
 */

const TRAINING = "ai-as-a-mirror";

/** `*word*` in the copy marks an italic. */
const Rich = ({ text }: { text: string }) => (
  <>
    {text.split(/\*([^*]+)\*/g).map((part, i) => (i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>))}
  </>
);

const Paragraphs = ({ items }: { items: string[] }) => (
  <div className="space-y-3 text-base leading-relaxed text-foreground">
    {items.map((p, i) => (
      <p key={i}>
        <Rich text={p} />
      </p>
    ))}
  </div>
);

const MiniTrainingMirror = () => {
  const loaded = useMirrorProfile();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12" data-testid="mini-training-mirror">
      <header className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Mini-training 1</p>
        <h1 className="text-3xl font-semibold text-foreground">AI as a Mirror</h1>
      </header>

      {loaded.status === "loading" ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading your profile…
        </p>
      ) : null}

      {loaded.status === "error" ? (
        <p className="text-sm text-muted-foreground" role="alert">
          We could not read your profile. Please refresh the page.
        </p>
      ) : null}

      {loaded.status === "guest" || loaded.status === "no-talent" ? (
        <>
          <Paragraphs items={MIRROR_OPENING} />
          <p className="mt-8 rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground" data-testid="mirror-gate">
            This mini-training starts from your Top Talent profile.{" "}
            <Link to={ZOG_ENTRY_PATH} className="font-medium underline">
              Do the reveal first
            </Link>
            , then come back.
          </p>
        </>
      ) : null}

      {loaded.status === "ready" ? <Training userId={loaded.userId} profile={loaded.profile} /> : null}
    </main>
  );
};

const Training = ({ userId, profile }: { userId: string; profile: MirrorProfile }) => {
  const [state, setState] = useState<MirrorState>(emptyMirrorState);
  const [hydrated, setHydrated] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pickedLine, setPickedLine] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const restored = loadMirrorState(userId);
    stateRef.current = restored;
    setState(restored);
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (hydrated) saveMirrorState(userId, state);
  }, [userId, state, hydrated]);

  const send = useCallback(async (step: PromptStep, text: string) => {
    if (!text) return;
    setErrors((e) => ({ ...e, [step.id]: "" }));
    setSendingId(step.id);
    // One chat thread per player across all buttons: the whole thread goes with every send,
    // except an isolated card (#7a), which goes alone like a brand-new chat.
    const playerMessage: ThreadMessage = { role: "player", text, stepId: step.id };
    const withPlayer: ThreadMessage[] = [...stateRef.current.thread, playerMessage];
    try {
      const reply = await askMirrorAi(step.isolated ? [playerMessage] : withPlayer);
      setState((s) => ({
        ...s,
        thread: [...withPlayer, { role: "ai", text: reply, stepId: step.id }],
        sent: s.sent.includes(step.id) ? s.sent : [...s.sent, step.id],
        lineTaps: step.needsLine ? Math.min(s.lineTaps + 1, MAX_LINE_TAPS) : s.lineTaps,
      }));
    } catch {
      setErrors((e) => ({ ...e, [step.id]: "The answer did not come. Please try again." }));
    } finally {
      setSendingId(null);
    }
  }, []);

  const savePlan = (step: PromptStep, answer: string) =>
    setState((s) => ({ ...s, plan: { text: answer, stepId: step.id, savedAt: new Date().toISOString() } }));

  const done = modulesDone(state.sent);
  const sentParts = (n: number) => stepsOfModule(n).filter((s) => state.sent.includes(s.id)).length;
  const lines = useMemo(() => answerLines(lastAnswer(state.thread, "1")), [state.thread]);
  const mission = profile.mission;

  return (
    <>
      <Paragraphs items={MIRROR_OPENING} />

      {MIRROR_AI_IS_STUB ? (
        <p className="mt-6 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground" data-testid="stub-notice">
          Test build: the AI call is a stub, so answers are placeholders. Everything else works as it will.
        </p>
      ) : null}

      <p className="mt-6 text-sm text-muted-foreground" data-testid="mirror-progress">
        {done} of 8 steps done
      </p>

      <div className="mt-6 space-y-12">
        {MIRROR_MODULE_COPY.map((module) => {
          const steps = stepsOfModule(module.n);
          const embed = videoEmbedUrl(TRAINING, module.n);
          const moduleDone = isModuleDone(module.n, state.sent);
          return (
            <section key={module.n} id={`module-${module.n}`} aria-labelledby={`module-${module.n}-title`} className="scroll-mt-20">
              <h2 id={`module-${module.n}-title`} className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                <span className="text-muted-foreground">{module.n} ·</span> {module.title}
                {moduleDone ? (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs font-normal text-emerald-600" data-testid={`module-${module.n}-done`}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Done
                  </span>
                ) : steps.length > 1 && sentParts(module.n) > 0 ? (
                  <span className="ml-auto text-xs font-normal text-muted-foreground" data-testid={`module-${module.n}-partial`}>
                    {sentParts(module.n)} of {steps.length}: now the next card
                  </span>
                ) : null}
              </h2>

              <div className="space-y-3">
                {module.n === 6 ? (
                  <LinePicker lines={lines} picked={pickedLine} onPick={setPickedLine} taps={state.lineTaps} />
                ) : null}
                {steps.map((step) => {
                  const exchange = state.thread.filter((m) => m.stepId === step.id);
                  const firstAnswer = exchange.find((m) => m.role === "ai")?.text ?? null;
                  const followUps = firstAnswer ? exchange.slice(exchange.findIndex((m) => m.role === "ai") + 1) : [];
                  const answer = lastAnswer(state.thread, step.id);
                  const repliesUsed = followUps.filter((m) => m.role === "player").length;
                  const tapsLeft = MAX_LINE_TAPS - state.lineTaps;
                  const reason = step.needsLine
                    ? lines.length === 0
                      ? "Press the button in step 1 first: this step works on what AI said there."
                      : !pickedLine
                        ? "Tap a line above first."
                        : tapsLeft <= 0
                          ? "You have used this step three times."
                          : null
                    : null;
                  const built = step.build(profile, { line: pickedLine });
                  return (
                    <div key={step.id}>
                      <PromptButtonCard
                        testId={`card-${step.id}`}
                        title={step.title}
                        prompt={built}
                        copyText={(text) => prepareForCopy(text, profile.weakestArea)}
                        onSend={(text) => send(step, text)}
                        sending={sendingId === step.id}
                        sendDisabledReason={reason}
                        answer={firstAnswer}
                        micHint={
                          !mission && (step.id === "1" || step.id === "5")
                            ? "No mission saved yet: press the microphone and say it in your own words."
                            : null
                        }
                      >
                        {step.replies && firstAnswer ? (
                          <Conversation
                            messages={followUps}
                            canReply={repliesUsed < step.replies}
                            sending={sendingId === step.id}
                            onReply={(text) => send(step, text)}
                          />
                        ) : null}
                        {step.savePlan && answer ? (
                          <SavePlan
                            saved={state.plan?.text === answer}
                            hasOther={!!state.plan && state.plan.text !== answer}
                            onSave={() => savePlan(step, answer)}
                          />
                        ) : null}
                      </PromptButtonCard>
                      {errors[step.id] ? (
                        <p role="alert" className="mt-2 text-xs text-destructive">
                          {errors[step.id]}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {embed ? (
                <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-border" data-testid={`video-${module.n}`}>
                  <iframe
                    src={embed}
                    title={`${module.title}, short video`}
                    className="h-full w-full"
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}

              <Collapsible className="mt-4">
                <CollapsibleTrigger className="group inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-2 hover:underline">
                  Read instead
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <Paragraphs items={module.paragraphs} />
                </CollapsibleContent>
              </Collapsible>
            </section>
          );
        })}
      </div>

      <section className="mt-14 border-t border-border pt-8" aria-label="Closing">
        <Paragraphs items={MIRROR_CLOSING} />
        {state.plan ? (
          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4" data-testid="saved-plan">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Your saved plan</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{state.plan.text}</p>
          </div>
        ) : null}
        <div className="mt-6">
          <Button asChild data-testid="mirror-next">
            <Link to={YOUR_AI_PATH}>Keep talking in Your AI</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

const LinePicker = ({
  lines,
  picked,
  onPick,
  taps,
}: {
  lines: string[];
  picked: string | null;
  onPick: (line: string) => void;
  taps: number;
}) => (
  <div className="rounded-xl border border-border bg-card p-4" data-testid="line-picker">
    <h3 className="mb-1 text-sm font-semibold text-foreground">What AI said about you in step 1</h3>
    <p className="mb-3 text-sm text-muted-foreground">Which line would fit almost anyone? Tap it.</p>
    {lines.length === 0 ? (
      <p className="text-xs text-muted-foreground">Nothing yet. Press the button in step 1 first.</p>
    ) : (
      <ul className="space-y-2">
        {lines.map((line, i) => (
          <li key={`${i}-${line}`}>
            <button
              type="button"
              onClick={() => onPick(line)}
              aria-pressed={picked === line}
              disabled={taps >= MAX_LINE_TAPS}
              className={`w-full rounded-md border p-2 text-left text-sm transition-colors ${
                picked === line ? "border-foreground bg-muted" : "border-border hover:bg-muted/50"
              } disabled:opacity-60`}
            >
              {line}
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const SavePlan = ({ saved, hasOther, onSave }: { saved: boolean; hasOther: boolean; onSave: () => void }) => (
  <div className="mt-3 flex flex-wrap items-center gap-3">
    <Button type="button" size="sm" variant={saved ? "outline" : "default"} onClick={onSave} disabled={saved}>
      {saved ? "Plan saved" : hasOther ? "Save plan (replaces the saved one)" : "Save plan"}
    </Button>
    <span className="text-xs text-muted-foreground">
      {saved ? "Saved on this device. You'll find it at the end of the page." : "It will be kept on this device and shown at the end of the page."}
    </span>
  </div>
);

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

/** #5 and #8: the AI asks back, the player answers here by voice or text. */
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

export default MiniTrainingMirror;
