/**
 * Mini-training 1 · AI as a Mirror, at /mini-trainings/ai-as-a-mirror.
 * Spec (single source): docs/02-strategy/ai-suite/mini-trainings/01-ai-as-a-mirror.md (v0.6).
 *
 * Eight micro-modules, one card each (module 7 has two buttons). Each card is the ready prompt
 * filled from the signed-in player's profile; all buttons go into ONE chat thread, so later
 * buttons can refer to earlier answers. `?demo=1` shows a test profile with some empty fields
 * (no sign-in, nothing stored), to check the cards and the dropped labels.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSessionUserId } from "@/hooks/useSessionUserId";
import PromptButtonCard from "./PromptButtonCard";
import {
  MIRROR_CHAT_LIVE,
  MirrorChatError,
  loadPlan,
  loadThread,
  savePlan,
  saveThread,
  sendToMirrorAI,
  type ChatMessage,
  type SavedPlan,
} from "./mirror/mirrorChat";
import { DEMO_MIRROR_PROFILE } from "./mirror/mirrorProfile";
import {
  LINE_PLACEHOLDER,
  MAX_SHADOW_TAPS,
  MIRROR_MODULES,
  answerLines,
  maskForCopy,
  type MirrorStep,
} from "./mirror/mirrorPrompts";
import { useMirrorProfile } from "./mirror/useMirrorProfile";

let counter = 0;
const messageId = () => `m${Date.now().toString(36)}${(counter += 1)}`;

const AiAsAMirrorPage = () => {
  const [params] = useSearchParams();
  const demo = params.get("demo") === "1";
  const sessionUserId = useSessionUserId();
  const real = useMirrorProfile(demo ? null : sessionUserId);

  const profile = demo ? DEMO_MIRROR_PROFILE : real.profile;
  const loading = !demo && real.loading;
  const storageOwner = demo ? null : (sessionUserId ?? null);
  const canSend = demo || !!sessionUserId;

  const [thread, setThread] = useState<ChatMessage[]>([]);
  const threadRef = useRef<ChatMessage[]>([]);
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [line, setLine] = useState<string | null>(null);

  // One thread per player: read it back whenever the player is known.
  useEffect(() => {
    const restored = storageOwner ? loadThread(storageOwner) : [];
    threadRef.current = restored;
    setThread(restored);
    setPlan(storageOwner ? loadPlan(storageOwner) : null);
  }, [storageOwner]);

  const commit = (next: ChatMessage[]) => {
    threadRef.current = next;
    setThread(next);
    if (storageOwner) saveThread(storageOwner, next);
  };

  const send = async (step: MirrorStep, text: string) => {
    if (!canSend || sendingKey) return;
    setErrors((e) => ({ ...e, [step.key]: null }));
    setSendingKey(step.key);
    const withPrompt: ChatMessage[] = [
      ...threadRef.current,
      { id: messageId(), stepKey: step.key, role: "player", text },
    ];
    try {
      const reply = await sendToMirrorAI(withPrompt);
      commit([...withPrompt, { id: messageId(), stepKey: step.key, role: "ai", text: reply }]);
      if (step.key === "6") setLine(null);
    } catch (err) {
      const message = err instanceof MirrorChatError ? err.message : "Your AI could not answer. Try again in a moment.";
      setErrors((e) => ({ ...e, [step.key]: message }));
    } finally {
      setSendingKey(null);
    }
  };

  const answersOf = (key: string) => thread.filter((m) => m.stepKey === key && m.role === "ai");
  const lastAnswer = (key: string) => answersOf(key).at(-1);

  // #6: the lines of the latest answer to #1, and how many times #6 has been used.
  const mirrorLines = useMemo(() => {
    const first = thread.filter((m) => m.stepKey === "1" && m.role === "ai").at(-1);
    return first ? answerLines(first.text) : [];
  }, [thread]);
  const shadowUses = thread.filter((m) => m.stepKey === "6" && m.role === "player").length;

  const blockedReason = (step: MirrorStep, promptText: string): string | null => {
    if (!canSend) return sessionUserId === undefined ? "Loading…" : "Sign in to send this to your AI.";
    if (loading) return "Loading your profile…";
    const own = step.blockedReason?.(profile) ?? null;
    if (own) return own;
    if (step.key === "7b" && !lastAnswer("7a")) return "Send the first button first, then this one.";
    if (step.key === "6") {
      if (shadowUses >= MAX_SHADOW_TAPS) return "That is three. Your chat keeps all three answers.";
      if (promptText.includes(LINE_PLACEHOLDER)) return "Tap a line above first.";
    }
    return null;
  };

  const onSavePlan = (step: MirrorStep) => {
    const answer = lastAnswer(step.key);
    if (answer) setPlan(savePlan(storageOwner, answer.text, step.key));
  };

  const needsReveal = !loading && canSend && !profile.top_talents;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 text-foreground">
      <header className="mb-6">
        <p className="text-sm font-medium uppercase text-muted-foreground">Mini-training 1</p>
        <h1 className="mt-1 text-3xl font-semibold">AI as a Mirror</h1>
        <p className="mt-3">
          In about 30 minutes AI turns from a random helper into your partner: it knows your talents and mission, and
          you know how to talk to it and when not to believe it.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Each step is one button. The prompt is built from your profile, so you see exactly what goes in before you
          press Send. Edit it, or speak it. All eight go into one chat with your AI.
        </p>
      </header>

      {demo && (
        <p className="mb-4 rounded-xl border border-border p-3 text-sm" data-testid="demo-banner">
          Demo profile: a few fields are empty on purpose, so you can see their lines drop. Nothing is saved.
        </p>
      )}
      {!MIRROR_CHAT_LIVE && (
        <p
          className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
          data-testid="stub-banner"
        >
          Preview: the AI call is not connected yet, so Send returns a marked placeholder answer. Copy works with any AI.
        </p>
      )}
      {!demo && sessionUserId === null && (
        <p className="mb-4 rounded-xl border border-border p-3 text-sm" data-testid="signin-banner">
          This mini-training uses your profile. <Link className="underline" to="/auth">Sign in</Link> to begin.
        </p>
      )}
      {needsReveal && (
        <p className="mb-4 rounded-xl border border-border p-3 text-sm" data-testid="reveal-banner">
          This mini-training is for players who have done the Top Talent reveal.{" "}
          <Link className="underline" to="/zone-of-genius/entry">Do the reveal first</Link>.
        </p>
      )}

      <div className="space-y-8">
        {MIRROR_MODULES.map((module) => (
          <section
            key={module.id}
            aria-labelledby={`mirror-module-${module.id}`}
            className="space-y-3"
            data-testid={`mirror-module-${module.id}`}
          >
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Step {module.id} of 8</p>
              <h2 id={`mirror-module-${module.id}`} className="text-xl font-semibold">
                {module.title}
              </h2>
              <p className="mt-1 text-sm">{module.idea}</p>
              <p className="text-sm text-muted-foreground">{module.promise}</p>
            </div>

            {module.steps.map((step, index) => {
              const ctx = { line: line ?? undefined };
              const promptText = step.prompt(profile, ctx);
              const showLabel = module.steps.length > 1 ? (index === 0 ? "First, the plain one" : "Then, in your own words") : undefined;
              const answers = answersOf(step.key);
              const last = lastAnswer(step.key);
              const saved = !!plan && !!last && plan.fromStep === step.key && plan.text === last.text;
              return (
                <PromptButtonCard
                  // #6: tapping a new line replaces the prompt, edits included.
                  key={step.key === "6" ? `6-${line ?? ""}` : step.key}
                  stepKey={step.key}
                  label={showLabel}
                  prompt={promptText}
                  onSend={(text) => send(step, text)}
                  sending={sendingKey === step.key}
                  blockedReason={blockedReason(step, promptText)}
                  hint={step.hint?.(profile) ?? null}
                  maskCopy={(text) => maskForCopy(text, profile)}
                  answers={answers.map((a) => ({ id: a.id, text: a.text }))}
                  error={errors[step.key] ?? null}
                  stub={!MIRROR_CHAT_LIVE}
                  footer={
                    step.savesPlan && last ? (
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => onSavePlan(step)}
                          disabled={saved}
                          data-testid={`save-plan-${step.key}`}
                        >
                          {saved ? "Plan saved" : "Save plan"}
                        </Button>
                        {saved && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Saved in this browser for now.
                          </p>
                        )}
                      </div>
                    ) : undefined
                  }
                >
                  {step.key === "6" && (
                    <div className="mb-3" data-testid="shadow-picker">
                      <p className="text-sm font-medium">Which line would fit almost anyone? Tap it.</p>
                      {mirrorLines.length === 0 ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Send the first button to see what AI said about you.
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {mirrorLines.map((l, i) => (
                            <li key={`${i}-${l}`}>
                              <button
                                type="button"
                                className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm aria-pressed:border-primary aria-pressed:bg-primary/10"
                                aria-pressed={line === l}
                                onClick={() => setLine(l)}
                                disabled={shadowUses >= MAX_SHADOW_TAPS}
                                data-testid="shadow-line"
                              >
                                {l}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {Math.min(shadowUses, MAX_SHADOW_TAPS)} of {MAX_SHADOW_TAPS} used.
                      </p>
                    </div>
                  )}
                </PromptButtonCard>
              );
            })}

            {module.id === 8 && (
              <p className="rounded-xl border border-border p-3 text-sm" data-testid="closing-card">
                This chat is yours; it remembers your plan.
              </p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
};

export default AiAsAMirrorPage;
