import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, CheckCircle2, ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import PromptButtonCard from "@/components/mini-training/PromptButtonCard";
import Conversation from "@/components/mini-training/Conversation";
import Paragraphs from "@/components/mini-training/Paragraphs";
import { useMirrorProfile } from "@/hooks/useMirrorProfile";
import { ZOG_ENTRY_PATH } from "@/lib/shellRoutes";
import { KNOWS_YOU_CLOSING, KNOWS_YOU_MODULE_COPY, KNOWS_YOU_OPENING } from "@/lib/miniTraining/knowsYouCopy";
import {
  KNOWS_YOU_STEPS,
  anywhereText,
  knowsYouStepsOfModule,
  type KnowsYouProfile,
  type KnowsYouStep,
} from "@/lib/miniTraining/knowsYouPrompts";
import {
  ANYWHERE_STEP_ID,
  KNOWS_YOU_MODULES,
  emptyKnowsYouState,
  isKnowsYouModuleDone,
  knowsYouModulesDone,
  loadKnowsYouState,
  saveKnowsYouState,
  type KnowsYouState,
} from "@/lib/miniTraining/knowsYouState";
import { askMirrorAi, MIRROR_AI_IS_STUB, type ThreadMessage } from "@/lib/miniTraining/mirrorAi";
import { lastAnswer, loadMirrorState } from "@/lib/miniTraining/mirrorState";
import type { MirrorProfile } from "@/lib/miniTraining/mirrorPrompts";
import { videoEmbedUrl } from "@/lib/miniTraining/video";

/**
 * Mini-training 2 · AI That Knows You. Route only: /mini-trainings/ai-that-knows-you; the one link
 * to it is the «Next» line at the end of rung 1.
 *
 * Spec: docs/02-strategy/ai-suite/mini-trainings/02-ai-that-knows-you.md (v0.1).
 * Copy: docs/02-strategy/ai-suite/mini-trainings/02-ai-that-knows-you-texts.md (via lib/miniTraining/knowsYouCopy.ts).
 * Reuses rung 1's profile hook, card, dialog box and the `mini-training-chat` edge function as is.
 */

const TRAINING = "ai-that-knows-you";
const YOUR_AI_PATH = "/game/your-ai";

/** Steps whose messages stay out of the thread for later buttons (#1a: the stranger's answer). */
const ISOLATED_IDS = new Set(KNOWS_YOU_STEPS.filter((s) => s.isolated).map((s) => s.id));

const copyToClipboard = async (out: string) => {
  try {
    await navigator.clipboard.writeText(out);
  } catch {
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
};

const MiniTrainingKnowsYou = () => {
  const loaded = useMirrorProfile();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12" data-testid="mini-training-knows-you">
      <header className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Mini-training 2</p>
        <h1 className="text-3xl font-semibold text-foreground">AI That Knows You</h1>
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
          <Paragraphs items={KNOWS_YOU_OPENING} />
          <p className="mt-8 rounded-lg border border-border bg-muted/50 p-4 text-sm text-foreground" data-testid="knows-you-gate">
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

const Training = ({ userId, profile: baseProfile }: { userId: string; profile: MirrorProfile }) => {
  const [state, setState] = useState<KnowsYouState>(emptyKnowsYouState);
  const [hydrated, setHydrated] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const restored = loadKnowsYouState(userId);
    stateRef.current = restored;
    setState(restored);
    // Read-only: the plan the person saved in rung 1 becomes a line of the profile prompt (#3).
    setPlan(loadMirrorState(userId).plan?.text ?? null);
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (hydrated) saveKnowsYouState(userId, state);
  }, [userId, state, hydrated]);

  const profile: KnowsYouProfile = { ...baseProfile, plan };

  const send = useCallback(async (step: KnowsYouStep, text: string) => {
    if (!text) return;
    setErrors((e) => ({ ...e, [step.id]: "" }));
    setSendingId(step.id);
    const playerMessage: ThreadMessage = { role: "player", text, stepId: step.id };
    const withPlayer: ThreadMessage[] = [...stateRef.current.thread, playerMessage];
    // One chat for all buttons, except #1a: it goes alone and stays out of later sends.
    const outgoing = step.isolated ? [playerMessage] : withPlayer.filter((m) => !ISOLATED_IDS.has(m.stepId));
    try {
      const reply = await askMirrorAi(outgoing);
      setState((s) => ({
        ...s,
        thread: [...withPlayer, { role: "ai", text: reply, stepId: step.id }],
        sent: s.sent.includes(step.id) ? s.sent : [...s.sent, step.id],
      }));
    } catch {
      setErrors((e) => ({ ...e, [step.id]: "The answer did not come. Please try again." }));
    } finally {
      setSendingId(null);
    }
  }, []);

  const saveProfile = (step: KnowsYouStep, answer: string) =>
    setState((s) => ({ ...s, profile: { text: answer, stepId: step.id, savedAt: new Date().toISOString() } }));

  const markAnywhere = () =>
    setState((s) => ({
      ...s,
      anywhereDone: true,
      sent: s.sent.includes(ANYWHERE_STEP_ID) ? s.sent : [...s.sent, ANYWHERE_STEP_ID],
    }));

  const done = knowsYouModulesDone(state);
  const sentParts = (n: number) => knowsYouStepsOfModule(n).filter((s) => state.sent.includes(s.id)).length;

  return (
    <>
      <Paragraphs items={KNOWS_YOU_OPENING} />

      {MIRROR_AI_IS_STUB ? (
        <p className="mt-6 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground" data-testid="stub-notice">
          Test build: the AI call is a stub, so answers are placeholders. Everything else works as it will.
        </p>
      ) : null}

      <p className="mt-6 text-sm text-muted-foreground" data-testid="knows-you-progress">
        {done} of {KNOWS_YOU_MODULES} steps done
      </p>

      <div className="mt-6 space-y-12">
        {KNOWS_YOU_MODULE_COPY.map((module) => {
          const steps = knowsYouStepsOfModule(module.n);
          const embed = videoEmbedUrl(TRAINING, module.n);
          const moduleDone = isKnowsYouModuleDone(module.n, state);
          return (
            <section key={module.n} id={`module-${module.n}`} aria-labelledby={`module-${module.n}-title`} className="scroll-mt-20">
              <h2 id={`module-${module.n}-title`} className="mb-1 flex items-center gap-2 text-xl font-semibold text-foreground">
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
              <p className="mb-4 text-sm text-muted-foreground">{module.promise}</p>

              {/* Video first, then the button. No video id yet: show nothing. */}
              {embed ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-border" data-testid={`video-${module.n}`}>
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

              <Collapsible className="mt-3 mb-6">
                <CollapsibleTrigger className="group inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-2 hover:underline">
                  Read instead
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  <Paragraphs items={module.paragraphs} />
                </CollapsibleContent>
              </Collapsible>

              <div className="space-y-3">
                {module.n === 7 ? (
                  <AnywhereCard saved={state.profile?.text ?? null} done={state.anywhereDone} onDone={markAnywhere} />
                ) : null}
                {steps.map((step) => {
                  const exchange = state.thread.filter((m) => m.stepId === step.id);
                  const firstIndex = exchange.findIndex((m) => m.role === "ai");
                  const firstAnswer = firstIndex >= 0 ? exchange[firstIndex].text : null;
                  const followUps = firstIndex >= 0 ? exchange.slice(firstIndex + 1) : [];
                  const answer = lastAnswer(state.thread, step.id);
                  const repliesUsed = followUps.filter((m) => m.role === "player").length;
                  const reason =
                    step.id === "6a" && !state.profile
                      ? "Save your profile in step 3 first: this step works on it."
                      : step.id === "6b" && !state.sent.includes("6a")
                        ? "Send the roast first."
                        : null;
                  return (
                    <div key={step.id}>
                      <PromptButtonCard
                        testId={`card-${step.id}`}
                        title={step.title}
                        prompt={step.build(profile)}
                        copyText={(text) => text}
                        onSend={(text) => send(step, text)}
                        sending={sendingId === step.id}
                        sendDisabledReason={reason}
                        answer={firstAnswer}
                        fillToken={step.fillToken ?? null}
                        fillReason="Press the microphone and say what you want, or Edit and write it in place of «(say it)»."
                        micHint={
                          !profile.mission && step.id === "1b"
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
                        {step.saveProfile && answer && repliesUsed >= (step.saveAfterReplies ?? 0) && exchange[exchange.length - 1]?.role === "ai" ? (
                          <SaveProfile
                            saved={state.profile?.text === answer}
                            hasOther={!!state.profile && state.profile.text !== answer}
                            onSave={() => saveProfile(step, answer)}
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
            </section>
          );
        })}
      </div>

      <section className="mt-14 border-t border-border pt-8" aria-label="Closing">
        <Paragraphs items={KNOWS_YOU_CLOSING} />
        {state.profile ? (
          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4" data-testid="saved-profile">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Your one-page AI profile</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{state.profile.text}</p>
            <div className="mt-3">
              <CopyButton text={state.profile.text} label="Copy profile" testId="copy-profile" />
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground" data-testid="no-profile-yet">
            Your profile appears here once you save it (step 3).
          </p>
        )}
        <div className="mt-6">
          <Button asChild data-testid="knows-you-next">
            <Link to={YOUR_AI_PATH}>Keep talking in Your AI</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

const CopyButton = ({ text, label, testId }: { text: string; label: string; testId?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    toast("Copied. Paste it into any AI.");
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button type="button" size="sm" variant="outline" onClick={copy} data-testid={testId}>
      {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
      {copied ? "Copied" : label}
    </Button>
  );
};

/** #7: no call to Your AI. Copy the profile into another AI, then mark it. */
const AnywhereCard = ({ saved, done, onDone }: { saved: string | null; done: boolean; onDone: () => void }) => (
  <section className="rounded-xl border border-border bg-card p-4 shadow-sm" aria-label="Take it to another AI" data-testid="card-7">
    <h3 className="mb-2 text-sm font-semibold text-foreground">Take it to another AI</h3>
    {saved ? (
      <>
        <p className="mb-2 text-sm text-muted-foreground">
          Copy gives your saved profile and one line under it. Paste it into ChatGPT, Claude or Gemini, and read the answer.
        </p>
        <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm leading-relaxed text-foreground">{anywhereText(saved)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={anywhereText(saved)} label="Copy" testId="copy-anywhere" />
          <Button type="button" size="sm" variant={done ? "outline" : "default"} onClick={onDone} disabled={done} data-testid="anywhere-done">
            {done ? "Marked: it knew me" : "It knew me"}
          </Button>
        </div>
      </>
    ) : (
      <p className="text-sm text-muted-foreground">Save your profile in step 3 first: this step copies it.</p>
    )}
  </section>
);

const SaveProfile = ({ saved, hasOther, onSave }: { saved: boolean; hasOther: boolean; onSave: () => void }) => (
  <div className="mt-3 flex flex-wrap items-center gap-3">
    <Button type="button" size="sm" variant={saved ? "outline" : "default"} onClick={onSave} disabled={saved}>
      {saved ? "Profile saved" : hasOther ? "Save profile (replaces the saved one)" : "Save profile"}
    </Button>
    <span className="text-xs text-muted-foreground">
      {saved ? "Saved on this device. You'll find it at the end of the page." : "It will be kept on this device and shown at the end of the page."}
    </span>
  </div>
);

export default MiniTrainingKnowsYou;
