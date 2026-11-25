/**
 * The Console tab of the air face: the Phoenix chain (docs/specs/your-ai-console/console-v1.md).
 * Five buttons, each label the result it gives. Button N opens when card N-1 exists; before that it
 * shows the «Opens when… Inside…» line. Each result is a card; button 5 hands its survivor to button 1
 * and the next lap starts. Nothing here sends anything outward.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Copy, Lock, RotateCcw } from "lucide-react";
import type { PlayerCard } from "@/modules/zone-of-genius/yourAiCard";
import type { DialogueMessage } from "@/modules/zone-of-genius/yourAiTurn";
import { runConsoleButton } from "@/lib/console/consoleClient";
import { runStep, type Problem as StepProblem } from "@/lib/console/runStep";
import {
  BUTTON_IDS,
  CONSOLE_BUTTONS,
  GOAL_QUESTION,
  buttonOf,
  cardPlainText,
  isUnlocked,
  normalizeLocale,
  readChain,
  startNextLap,
  writeChain,
  type ButtonId,
  type ChainState,
} from "@/lib/console/phoenixChain";
import ConsoleCardView from "./ConsoleCardView";
import { ACCENT, HAIRLINE, INK, MUTED, PANEL, PILL, RAISED, SERIF } from "./consoleTheme";

type Problem = { button: ButtonId; kind: StepProblem };

type Props = {
  /** Signed-in player id; null for a guest (a guest cannot call the model). */
  ownerId: string | null;
  /** Language of the answers: the player's locale. */
  language: string | undefined;
  /** The conversation so far, and the player card the conversation already builds. */
  messages: DialogueMessage[];
  getPlayerCard: () => PlayerCard | null;
  /** Button 1 with no goal: put the one question into the conversation. */
  onAskGoal: (question: string) => void;
  onOpenConversation: () => void;
};

const ConsolePanel = ({ ownerId, language, messages, getPlayerCard, onAskGoal, onOpenConversation }: Props) => {
  const { t } = useTranslation();
  const locale = normalizeLocale(language);
  const [chain, setChainState] = useState<ChainState>(() => readChain(ownerId));
  const chainRef = useRef(chain);
  const [running, setRunning] = useState<ButtonId | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [waiting, setWaiting] = useState(false);
  const [copied, setCopied] = useState<ButtonId | null>(null);
  const runningRef = useRef(false);

  const commit = useCallback(
    (next: ChainState) => {
      chainRef.current = next;
      setChainState(next);
      writeChain(ownerId, next);
    },
    [ownerId],
  );

  useEffect(() => {
    if (copied === null) return;
    const timer = window.setTimeout(() => setCopied(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const askGoal = () => {
    onAskGoal(GOAL_QUESTION[locale]);
    setWaiting(true);
  };

  const run = async (id: ButtonId, from: ChainState = chainRef.current) => {
    if (runningRef.current) return;
    setProblem(null);
    setWaiting(false);
    runningRef.current = true;
    setRunning(id);
    try {
      const out = await runStep({
        chain: from,
        id,
        ownerId,
        playerCard: getPlayerCard(),
        messages,
        locale,
        call: (request) => runConsoleButton(request, !!ownerId),
      });
      commit(out.chain);
      if (out.kind === "ask-goal") askGoal();
      else if (out.kind === "problem") setProblem({ button: id, kind: out.problem });
    } finally {
      runningRef.current = false;
      setRunning(null);
    }
  };

  const goNext = (id: ButtonId) => {
    if (id === 5) {
      // Button 5 feeds button 1: the survivor starts the next lap.
      const next = startNextLap(chainRef.current);
      commit(next);
      void run(1, next);
    } else {
      void run((id + 1) as ButtonId);
    }
  };

  const copy = async (id: ButtonId) => {
    const rec = chain.cards[id];
    if (!rec) return;
    try {
      await navigator.clipboard.writeText(cardPlainText(id, rec.data));
      setCopied(id);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };

  const problemLine = (id: ButtonId) => {
    if (!problem || problem.button !== id) return null;
    const text =
      problem.kind === "malformed" ? t("yourAiConsole.retryLine")
      : problem.kind === "cap" ? t("yourAiConsole.capLine")
      : problem.kind === "signin" ? t("yourAiConsole.signInLine")
      : t("yourAiConsole.failedLine");
    return (
      <p role="alert" className="text-[13px]" style={{ color: INK }}>
        {text}{" "}
        {(problem.kind === "malformed" || problem.kind === "failed") && (
          <button type="button" onClick={() => void run(id)} className="underline underline-offset-4" style={{ color: ACCENT }}>
            {t("yourAiConsole.retry")}
          </button>
        )}
      </p>
    );
  };

  const action = `${PILL} !min-h-11`;

  return (
    <section aria-label={t("yourAiInstrument.console")} className="flex min-h-0 flex-1 flex-col gap-2" data-testid="console-panel">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[13px] leading-snug" style={{ color: MUTED }}>{t("yourAiConsole.intro")}</p>
        <span className="shrink-0 text-[12px]" style={{ color: MUTED }} data-testid="console-lap">{t("yourAiConsole.lap", { n: chain.lap })}</span>
      </div>

      <ol className="m-0 min-h-0 flex-1 list-none space-y-2 overflow-y-auto p-0" aria-label={t("yourAiInstrument.console")}>
        {BUTTON_IDS.map((id) => {
          const b = buttonOf(id);
          const label = b.label[locale];
          const rec = chain.cards[id];
          const open = isUnlocked(chain, id);
          const busy = running === id;
          if (!open) {
            return (
              <li key={id} data-testid={`console-button-${id}`} data-state="locked">
                <div role="group" aria-label={label} className="rounded-xl px-3 py-2.5" style={{ border: `1px dashed ${HAIRLINE}`, color: MUTED }}>
                  <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: INK }}>
                    <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                    {label}
                    <span className="sr-only">{t("yourAiConsole.closed")}</span>
                  </p>
                  <p className="text-[12px] leading-relaxed">{t(`yourAiConsole.locked.${id}`)}</p>
                </div>
              </li>
            );
          }
          return (
            <li key={id} data-testid={`console-button-${id}`} data-state={rec ? "done" : "open"} className="space-y-2">
              {rec ? (
                <div className="space-y-3 rounded-xl p-3" style={{ backgroundColor: RAISED, border: `1px solid ${HAIRLINE}` }}>
                  <h4 className="text-[17px] leading-tight" style={{ fontFamily: SERIF, fontWeight: 600, color: INK }}>{label}</h4>
                  <ConsoleCardView id={id} record={rec} />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => void copy(id)} className={action} style={{ border: `1px solid ${HAIRLINE}`, color: INK }}>
                      {copied === id ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : <Copy aria-hidden="true" className="h-3.5 w-3.5" />}
                      {copied === id ? t("yourAiConsole.copied") : t("yourAiConsole.copy")}
                    </button>
                    <button type="button" onClick={() => void run(id)} disabled={running !== null} className={`${action} disabled:opacity-50`} style={{ border: `1px solid ${HAIRLINE}`, color: INK }}>
                      <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                      {t("yourAiConsole.again")}
                    </button>
                    <button
                      type="button"
                      onClick={() => goNext(id)}
                      disabled={running !== null}
                      className={`${action} disabled:opacity-50`}
                      style={{ backgroundColor: ACCENT, color: PANEL, fontWeight: 600 }}
                    >
                      {t("yourAiConsole.next", { label: CONSOLE_BUTTONS[id === 5 ? 0 : id].label[locale] })}
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void run(id)}
                  disabled={running !== null}
                  aria-busy={busy}
                  className={`${PILL} w-full justify-between rounded-xl !px-3 py-2 text-left disabled:opacity-60`}
                  style={{ backgroundColor: RAISED, border: `1px solid ${HAIRLINE}`, color: INK, fontWeight: 600 }}
                >
                  <span>{busy ? t("yourAiConsole.working") : label}</span>
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0" style={{ color: ACCENT }} />
                </button>
              )}
              {id === 1 && waiting && !rec && (
                <p role="status" className="text-[13px]" style={{ color: INK }}>
                  {t("yourAiConsole.waitingLine")}{" "}
                  <button type="button" onClick={onOpenConversation} className="underline underline-offset-4" style={{ color: ACCENT }}>
                    {t("yourAiConsole.openConversation")}
                  </button>
                </p>
              )}
              {busy && rec && <p role="status" className="text-[13px] italic" style={{ color: MUTED }}>{t("yourAiConsole.working")}</p>}
              {problemLine(id)}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default ConsolePanel;
