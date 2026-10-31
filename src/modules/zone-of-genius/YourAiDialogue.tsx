/**
 * YourAiDialogue — the conversation with Your AI that opens the top talent reveal.
 * State (messages, notes) lives in the parent so a failed reveal returns here intact.
 */
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronDown, Send } from "lucide-react";
import { CTA_SMALL_CAPS_STYLE, igniteLogo } from "@/lib/landingDesign";
import { ACTION_REVEAL, type YourAiButton } from "@/data/yourAiCatalog";
import { supabase } from "@/integrations/supabase/client";
import { getCachedZogSnapshot } from "@/lib/zogSnapshotCache";
import {
  askYourAi,
  countAnswers,
  MIN_ANSWERS_TO_REVEAL,
  SUGGESTED_ANSWERS,
  type DialogueMessage,
} from "./yourAiDialogue";
import { buildPlayerCard, readTraces, writeTrace } from "./yourAiCard";

type Props = {
  messages: DialogueMessage[];
  setMessages: (next: DialogueMessage[]) => void;
  ownAiNotes: string;
  setOwnAiNotes: (next: string) => void;
  ready: boolean;
  setReady: (next: boolean) => void;
  onReveal: () => void;
  revealError: string | null;
  onGuided: () => void;
  onOwnAiPrompt: () => void;
};

const HALO = "var(--skin-text-halo-deep, 0 0 22px rgba(255,255,255,0.85), 0 1px 2px rgba(255,255,255,0.95))";

const YourAiDialogue = ({
  messages,
  setMessages,
  ownAiNotes,
  setOwnAiNotes,
  ready,
  setReady,
  onReveal,
  revealError,
  onGuided,
  onOwnAiPrompt,
}: Props) => {
  const { t, i18n } = useTranslation();
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [turnError, setTurnError] = useState(false);
  const [notesOpen, setNotesOpen] = useState(Boolean(ownAiNotes));
  const [notesDraft, setNotesDraft] = useState(ownAiNotes);
  // Issue #270: the side doors sit in a "More options" expander; saved notes keep it open.
  const [moreOpen, setMoreOpen] = useState(Boolean(ownAiNotes));
  const moreId = useId();
  const sendHintId = useId();
  const endRef = useRef<HTMLDivElement>(null);
  // Signed-in player id, if any. Scopes traces and the saved-snapshot read; guests use "guest".
  const ownerRef = useRef<string | null>(null);
  const answers = countAnswers(messages);
  const canReveal = answers >= MIN_ANSWERS_TO_REVEAL || (Boolean(ownAiNotes.trim()) && answers >= 1);
  const revealRecommended = ready || answers >= SUGGESTED_ANSWERS;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, thinking]);

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) ownerRef.current = data.session?.user?.id ?? null;
      })
      .catch(() => {
        /* guest: no owner */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /** Player card for the turn prompt: saved ZoG snapshot (session cache) + local traces. */
  const currentCard = () => {
    const owner = ownerRef.current;
    const snapshot = owner ? getCachedZogSnapshot(owner) : null;
    return buildPlayerCard(snapshot, readTraces(owner));
  };

  const runTurn = async (history: DialogueMessage[], notes: string) => {
    setThinking(true);
    setTurnError(false);
    try {
      const turn = await askYourAi(history, notes, i18n.resolvedLanguage, currentCard());
      setMessages([...history, { role: "ai", text: turn.reply, buttons: turn.buttons }]);
      if (turn.ready) setReady(true);
    } catch (err) {
      console.error("[YourAiDialogue] turn failed", err);
      setMessages(history);
      setTurnError(true);
    } finally {
      setThinking(false);
    }
  };

  const send = () => {
    const text = draft.trim();
    if (!text || thinking) return;
    setDraft("");
    void runTurn([...messages, { role: "player", text }], ownAiNotes);
  };

  const retryTurn = () => {
    if (thinking) return;
    void runTurn(messages, ownAiNotes);
  };

  const saveNotes = () => {
    const notes = notesDraft.trim();
    setOwnAiNotes(notes);
    setNotesOpen(false);
    if (notes && !thinking) void runTurn(messages, notes);
  };

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
  const lastIsPlayer = lastMessage?.role === "player";

  // Buttons first: the latest AI message's validated buttons. The reveal stays locked until
  // there is enough material, whatever the model proposes. First = the one next move.
  const offered: YourAiButton[] =
    !thinking && lastMessage?.role === "ai"
      ? (lastMessage.buttons ?? []).filter((b) => b.id !== ACTION_REVEAL || canReveal)
      : [];

  const recordTap = (button: YourAiButton) => {
    writeTrace({ kind: button.kind, payload_id: button.id, outcome: "tapped" }, ownerRef.current);
  };

  const tapAction = (button: YourAiButton) => {
    recordTap(button);
    if (button.id === ACTION_REVEAL) onReveal();
  };

  const buttonClass =
    "inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-white/40";
  const buttonStyle = (primary: boolean) =>
    primary
      ? {
          fontWeight: 600,
          color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
          backgroundImage: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(26,30,58,0.72) 100%))",
        }
      : {
          color: "var(--skin-text-primary, #0a1628)",
          backgroundColor: "rgba(255,255,255,0.55)",
          border: "1px solid var(--skin-hairline, rgba(26,30,58,0.18))",
        };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="text-center space-y-1">
        <h2
          className="text-2xl tracking-[-0.005em]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            color: "var(--skin-text-primary, #0a1628)",
            textShadow: HALO,
          }}
        >
          {t("zogEntry.yourAiHeading")}
        </h2>
        <p
          className="text-xs"
          style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.75))", fontFamily: "'Source Serif 4', serif", textShadow: HALO }}
        >
          {t("zogEntry.yourAiSubtitle")}
        </p>
      </div>

      <div
        className="rounded-2xl p-3 sm:p-4 space-y-3 max-h-[52dvh] overflow-y-auto"
        role="log"
        aria-live="polite"
        style={{
          backgroundColor: "var(--skin-input-fill, rgba(255,255,255,0.40))",
          border: "1px solid var(--skin-hairline, rgba(26,30,58,0.14))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} className={m.role === "player" ? "flex justify-end" : "flex justify-start"}>
            <div
              className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap break-words"
              style={
                m.role === "player"
                  ? {
                      backgroundColor: "rgba(var(--accent-rgb, 201,150,60), 0.16)",
                      border: "1px solid rgba(var(--accent-rgb, 201,150,60), 0.28)",
                      color: "var(--skin-text-primary, #0a1628)",
                    }
                  : {
                      backgroundColor: "rgba(255,255,255,0.72)",
                      border: "1px solid var(--skin-hairline, rgba(26,30,58,0.12))",
                      color: "var(--skin-text-primary, #0a1628)",
                      fontFamily: "'Source Serif 4', Georgia, serif",
                    }
              }
            >
              {m.role === "ai" && (
                <span className="block text-[11px] uppercase tracking-wider mb-0.5 opacity-60">{t("zogEntry.yourAiName")}</span>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3.5 py-2.5 text-sm italic opacity-70" style={{ color: "var(--skin-text-primary, #0a1628)" }}>
              {t("zogEntry.yourAiThinking")}
            </div>
          </div>
        )}
        {turnError && (
          <div className="text-sm text-center space-x-3" role="alert" style={{ color: "var(--skin-text-primary, #0a1628)" }}>
            <span>{t("zogEntry.yourAiTurnError")}</span>
            {lastIsPlayer && (
              <button type="button" onClick={retryTurn} className="font-semibold underline underline-offset-4" style={{ color: "var(--accent-text, #7a5108)" }}>
                {t("zogEntry.revealRetry")}
              </button>
            )}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {offered.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Suggested next steps">
          {offered.map((b, i) => {
            const primary = i === 0;
            const content = (
              <>
                <span>{b.label}</span>
                {primary && <ArrowRight aria-hidden="true" className="w-3.5 h-3.5" />}
              </>
            );
            // Links open in a new tab so the conversation (held in the parent) survives.
            return b.to ? (
              <a
                key={b.id}
                href={b.to}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordTap(b)}
                className={buttonClass}
                style={buttonStyle(primary)}
              >
                {content}
              </a>
            ) : (
              <button key={b.id} type="button" onClick={() => tapAction(b)} className={buttonClass} style={buttonStyle(primary)}>
                {content}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder={t("zogEntry.yourAiPlaceholder")}
          aria-label={t("zogEntry.yourAiPlaceholder")}
          className="flex-1 min-w-0 resize-none rounded-2xl px-3.5 py-2.5 text-[16px] outline-none focus:ring-1"
          style={{
            backgroundColor: "var(--skin-input-fill, rgba(255,255,255,0.55))",
            border: "1px solid var(--skin-hairline, rgba(26,30,58,0.18))",
            color: "var(--skin-text-primary, #0a1628)",
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || thinking}
          aria-describedby={!draft.trim() && !thinking ? sendHintId : undefined}
          aria-label={t("zogEntry.yourAiSend")}
          className="shrink-0 h-11 w-11 rounded-full inline-flex items-center justify-center transition-opacity disabled:opacity-40"
          style={{
            backgroundImage: "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(26,30,58,0.72) 100%))",
            color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
          }}
        >
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {!draft.trim() && !thinking && (
        <p id={sendHintId} className="text-xs text-center -mt-2" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))", textShadow: HALO }}>
          {t("zogEntry.yourAiSendHint", { defaultValue: "Write your answer to send it." })}
        </p>
      )}

      {revealError && (
        <div
          role="alert"
          className="rounded-2xl px-5 py-3 text-sm text-center"
          style={{ color: "var(--skin-text-primary, #0a1628)", backgroundColor: "rgba(255,255,255,0.6)", border: "1px solid rgba(160,109,8,0.30)" }}
        >
          {revealError}
        </div>
      )}

      <div className="flex flex-col items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onReveal}
          disabled={!canReveal || thinking}
          className={`group liquid-glass-dark rounded-full inline-flex items-center justify-center gap-2 px-6 py-3 max-w-full text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-45 disabled:hover:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${revealRecommended && canReveal ? "cta-breath" : ""}`}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--skin-cta-text, rgba(245,245,250,0.98))",
            backgroundImage:
              "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.72) 0%, rgba(26,30,58,0.62) 50%, rgba(10,22,40,0.72) 100%))",
            boxShadow: "var(--skin-cta-shadow, 0 0 18px -4px rgba(240,194,127,0.45), 0 10px 24px -10px rgba(10,22,40,0.5))",
          }}
        >
          <img src={igniteLogo} alt="" aria-hidden="true" className="h-4 w-auto opacity-80" draggable={false} />
          <span style={CTA_SMALL_CAPS_STYLE}>{t("zogEntry.ctaRevealTopTalent")}</span>
          <ArrowRight aria-hidden="true" className="w-4 h-4" />
        </button>
        {!canReveal && (
          <p className="text-xs" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))", textShadow: HALO }}>
            {t("zogEntry.yourAiRevealHint")}
          </p>
        )}

        {/* Issue #270: Send + textarea + REVEAL are the spine. The three side doors wait here. */}
        <div className="w-full pt-2 text-center">
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            aria-expanded={moreOpen}
            aria-controls={moreId}
            className="inline-flex min-h-11 items-center gap-1 text-[13px] underline underline-offset-4 hover:opacity-80"
            style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))", textShadow: HALO }}
          >
            {t("zogEntry.moreOptions", { defaultValue: "More options" })}
            <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
          </button>
          {moreOpen && (
            <div id={moreId} className="mt-2 space-y-4">
              {/* Optional: what the player's own AI already knows, pasted INSIDE our dialogue. */}
              {notesOpen ? (
                <div className="space-y-2 text-left">
                  <p className="text-xs" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.75))", textShadow: HALO }}>
                    {t("zogEntry.yourAiNotesHint")}
                  </p>
                  <textarea
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    rows={4}
                    placeholder={t("zogEntry.yourAiNotesPlaceholder")}
                    className="w-full resize-y rounded-2xl px-3.5 py-2.5 text-[15px] outline-none focus:ring-1"
                    style={{
                      backgroundColor: "var(--skin-input-fill, rgba(255,255,255,0.55))",
                      border: "1px solid var(--skin-hairline, rgba(26,30,58,0.18))",
                      color: "var(--skin-text-primary, #0a1628)",
                    }}
                  />
                  <div className="flex justify-end gap-4 text-sm">
                    <button type="button" onClick={() => setNotesOpen(false)} className="underline underline-offset-4" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.75))" }}>
                      {t("zogEntry.yourAiNotesCancel")}
                    </button>
                    <button type="button" onClick={saveNotes} disabled={thinking} className="font-semibold underline underline-offset-4 disabled:opacity-50" style={{ color: "var(--accent-text, #7a5108)" }}>
                      {t("zogEntry.yourAiNotesSave")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setNotesOpen(true)}
                  className="block w-full text-[13px] underline underline-offset-4 hover:opacity-80"
                  style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))", textShadow: HALO }}
                >
                  {ownAiNotes ? t("zogEntry.yourAiNotesEdit") : t("zogEntry.yourAiNotesOpen")}
                </button>
              )}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                <button type="button" onClick={onGuided} className="text-[12px] tracking-wide hover:underline" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))", textShadow: HALO }}>
                  {t("zogEntry.guidedAssessmentLink")}
                </button>
                <button type="button" onClick={onOwnAiPrompt} className="text-[12px] tracking-wide hover:underline" style={{ color: "var(--skin-text-muted, rgba(26,30,58,0.7))", textShadow: HALO }}>
                  {t("zogEntry.ownAiPromptLink")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourAiDialogue;
