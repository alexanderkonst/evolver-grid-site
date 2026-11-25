/**
 * YourAiInstrument — Your AI as an instrument the player carries (docs/specs/your-ai-instrument/sow.md,
 * Phase 1; GoBY §25.10–25.12).
 *
 * A clear octahedron sits in the corner of every shell screen. One gesture (tap, or the period key)
 * raises the instrument over the living world; the world stays mounted and visible, dimmed. The same
 * gesture, Esc, or a swipe down lowers it and the player is exactly where they were: opening never
 * changes the route, and focus returns to where it was.
 *
 * Inside, three groups plus one closed row: header, conversation (reuses the zone-of-genius
 * dialogue modules and the deployed `library-advisor`), Console (the AI OS suites as app buttons)
 * and «Power-ups for business» in the §25.5 form. The first time it opens, a micro-onboarding zooms
 * by scale and light onto each group in turn, one line each.
 *
 * Design law (GoBY §5): near-black, one accent ice blue, physical materials, no glow rings.
 * AiOsPage is deliberately not imported: its backgrounds are the documented OOM / stacking-context
 * hazard (see SpacesRail.tsx), and this component lives in the shell on every screen.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Lock, RotateCcw, Send, X } from "lucide-react";
import AirOctahedron from "@/components/game/AirOctahedron";
import { type YourAiButton } from "@/data/yourAiCatalog";
import { getCachedZogSnapshot } from "@/lib/zogSnapshotCache";
import { askYourAi, type DialogueMessage } from "@/modules/zone-of-genius/yourAiDialogue";
import { buildPlayerCard, readTraces, writeTrace } from "@/modules/zone-of-genius/yourAiCard";
import {
  YOUR_AI_DAILY_FREE_TURNS,
  getTurnsUsedToday,
  recordTurn,
} from "@/modules/zone-of-genius/yourAiDailyLimit";
import {
  CONSOLE_SUITES,
  SWIPE_CLOSE_PX,
  TOUR_GROUPS,
  isToggleKey,
  readTourSeen,
  writeTourSeen,
  type TourGroup,
} from "@/lib/yourAiInstrument";

/** The corner object, CSS px: about 2x the first preview (48). Fits a 375px phone beside the chat pill's column. */
const CORNER_PX = 96;

const ACCENT = "#bcd7e6";
const INK = "#e8eef2";
const MUTED = "#9fb2bd";
const PANEL = "#0b0e13";
const RAISED = "#121820";
const HAIRLINE = "rgba(188,215,230,0.18)";
const SERIF = "'Cormorant Garamond', serif";
const EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";

/** Tour zoom, by scale and light: the lit group grows a little, the rest recede and dim. Groups span the
 *  panel width, so growing one past ~1.06 would clip it; the contrast between the two does the zooming. */
const TOUR_SCALE_IN = 1.06;
const TOUR_SCALE_OUT = 0.92;

const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState<boolean>(
    () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
};

const FOCUSABLE =
  "a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";

type Props = {
  /** The existing gate: T+M+A complete, or the AI OS was ever visited. */
  enabled: boolean;
  /** Signed-in player id, for the daily cap and traces; null for a guest. */
  ownerId: string | null;
};

const YourAiInstrument = ({ enabled, ownerId }: Props) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [beat, setBeat] = useState<number | null>(null);

  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [turnError, setTurnError] = useState(false);
  const [turnsUsed, setTurnsUsed] = useState(() => getTurnsUsedToday(ownerId));
  const limitReached = turnsUsed >= YOUR_AI_DAILY_FREE_TURNS;

  const objectRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const swipeRef = useRef<{ y: number; atTop: boolean } | null>(null);

  const tourActive = beat !== null;
  const closeMs = reduced ? 120 : 280;

  const openPanel = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setMounted(true);
    setOpen(true);
  }, []);
  const closePanel = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => (open ? closePanel() : openPanel()), [open, openPanel, closePanel]);

  // The period key, from anywhere in the shell (not while typing).
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isToggleKey(e)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, toggle]);

  // Rise and lower. The world is never touched: this only mounts and unmounts the overlay.
  useEffect(() => {
    if (open) {
      setTurnsUsed(getTurnsUsedToday(ownerId));
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    if (!mounted) return;
    setShown(false);
    setBeat(null);
    const back = returnFocusRef.current;
    (back && back.isConnected ? back : objectRef.current)?.focus();
    const timer = window.setTimeout(() => setMounted(false), closeMs);
    return () => window.clearTimeout(timer);
  }, [open, mounted, ownerId, closeMs]);

  // Once the panel is up: focus moves in; the first time ever, the tour starts.
  useEffect(() => {
    if (!shown) return;
    panelRef.current?.focus();
    if (readTourSeen()) return;
    const timer = window.setTimeout(() => setBeat(0), reduced ? 200 : 520);
    return () => window.clearTimeout(timer);
  }, [shown, reduced]);

  // A player who loses the gate mid-session (sign-out) gets the instrument lowered.
  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  // Esc closes; Tab stays inside the panel while it is open.
  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closePanel();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => !n.closest("[inert]"));
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [mounted, closePanel]);

  // The tour: lean into one group, by scale and light. Reduced motion: light only (fades).
  const endTour = useCallback(() => {
    writeTourSeen();
    setBeat(null);
  }, []);
  useEffect(() => {
    if (!open && beat !== null) writeTourSeen();
  }, [open, beat]);
  useEffect(() => {
    contentRef.current?.toggleAttribute("inert", tourActive);
  }, [tourActive, mounted]);
  const nextBeat = () => (beat !== null && beat < TOUR_GROUPS.length - 1 ? setBeat(beat + 1) : endTour());

  useEffect(() => {
    logRef.current?.scrollTo?.({ top: logRef.current.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages.length, thinking, reduced]);

  // Conversation: the existing dialogue modules, the deployed function, the daily cap.
  const runTurn = async (history: DialogueMessage[]) => {
    const used = getTurnsUsedToday(ownerId);
    setTurnsUsed(used);
    if (used >= YOUR_AI_DAILY_FREE_TURNS) return;
    setThinking(true);
    setTurnError(false);
    try {
      const snapshot = ownerId ? getCachedZogSnapshot(ownerId) : null;
      const card = buildPlayerCard(snapshot, readTraces(ownerId));
      const turn = await askYourAi(history, "", i18n.resolvedLanguage, card);
      setTurnsUsed(recordTurn(ownerId));
      setMessages([...history, { role: "ai", text: turn.reply, buttons: turn.buttons }]);
    } catch (err) {
      console.error("[YourAiInstrument] turn failed", err);
      setMessages(history);
      setTurnError(true);
    } finally {
      setThinking(false);
    }
  };
  const send = () => {
    const text = draft.trim();
    if (!text || thinking || limitReached) return;
    setDraft("");
    void runTurn([...messages, { role: "player", text }]);
  };
  const lastMessage = messages[messages.length - 1];
  // Host-handled actions (the ZoG reveal) have no meaning here: only buttons that go somewhere.
  const offered: YourAiButton[] =
    !thinking && lastMessage?.role === "ai" ? (lastMessage.buttons ?? []).filter((b) => b.kind !== "action" && b.to) : [];

  const goTo = (to: string, trace?: YourAiButton) => {
    if (trace) writeTrace({ kind: trace.kind, payload_id: trace.id, outcome: "tapped" }, ownerId);
    closePanel();
    navigate(to);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    swipeRef.current = { y: e.touches[0].clientY, atTop: (logRef.current?.scrollTop ?? 0) <= 0 || !logRef.current?.contains(e.target as Node) };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (start?.atTop && e.changedTouches[0].clientY - start.y >= SWIPE_CLOSE_PX) closePanel();
  };

  if (!enabled || typeof document === "undefined") return null;

  const focusedGroup = beat === null ? null : TOUR_GROUPS[beat];
  const lit = (g: TourGroup): React.CSSProperties => ({
    opacity: focusedGroup && focusedGroup !== g ? 0.22 : 1,
    // Reduced motion: light only, no scale.
    transform: !focusedGroup || reduced ? "none" : focusedGroup === g ? `scale(${TOUR_SCALE_IN})` : `scale(${TOUR_SCALE_OUT})`,
    transition: `opacity ${reduced ? 200 : 700}ms ${EASE}, transform 700ms ${EASE}`,
  });
  const bubble = "max-w-[88%] rounded-2xl px-3 py-2 text-[14px] leading-relaxed whitespace-pre-wrap break-words";
  const pill =
    "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]";

  return createPortal(
    <>
      <button
        ref={objectRef}
        type="button"
        onClick={toggle}
        aria-label={open ? t("yourAiInstrument.close") : t("yourAiInstrument.open")}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-keyshortcuts="."
        data-testid="your-ai-object"
        className="fixed right-2 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+3.75rem)] z-[81] grid h-24 w-24 place-items-center rounded-full outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-[#bcd7e6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0e13] motion-safe:hover:scale-105 motion-safe:active:scale-95 sm:bottom-[5.5rem] sm:right-5"
      >
        {/* Drawn once per tick by one small canvas; the loop stops while the panel is open. */}
        <AirOctahedron size={CORNER_PX} still={open} reduced={reduced} />
      </button>

      {mounted && (
        <div className="fixed inset-0 z-[80]" data-testid="your-ai-overlay">
          {/* The world stays mounted and visible behind: dimmed, not paused. Tapping it lowers the instrument. */}
          <div
            aria-hidden="true"
            onClick={closePanel}
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(4,6,9,0.62)", opacity: shown ? 1 : 0, transition: `opacity ${closeMs}ms ${EASE}` }}
          />
          <div className="pointer-events-none absolute inset-x-3 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+10.25rem)] top-3 flex items-end justify-end sm:inset-x-6 sm:bottom-[12.25rem]">
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="pointer-events-auto relative flex max-h-full w-full flex-col overflow-hidden rounded-2xl outline-none sm:w-[26rem]"
              style={{
                height: "min(40rem, 100%)",
                backgroundColor: PANEL,
                border: `1px solid ${HAIRLINE}`,
                boxShadow: "0 28px 60px -14px rgba(0,0,0,0.75)",
                color: INK,
                transformOrigin: "bottom right",
                opacity: shown ? 1 : 0,
                transform: shown || reduced ? "none" : "translateY(28px) scale(0.9)",
                transition: `opacity ${closeMs}ms ${EASE}, transform ${closeMs}ms ${EASE}`,
              }}
            >
              <div
                ref={contentRef}
                className="relative flex min-h-0 flex-1 flex-col gap-3 p-4"
              >
                {/* Group 1 · header */}
                <header className="flex items-center gap-3" style={lit("header")}>
                  <AirOctahedron size={40} still reduced={reduced} />
                  <div className="min-w-0 flex-1">
                    <h2 id={titleId} className="text-xl leading-tight" style={{ fontFamily: SERIF, fontWeight: 600, color: INK }}>
                      {t("yourAiInstrument.title")}
                    </h2>
                    <p className="text-[12px]" style={{ color: MUTED }}>{t("yourAiInstrument.powered")}</p>
                  </div>
                  <button type="button" onClick={() => setBeat(0)} aria-label={t("yourAiInstrument.replay")} className={`${pill} !px-0 w-11`} style={{ color: MUTED }}>
                    <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={closePanel} aria-label={t("yourAiInstrument.close")} className={`${pill} !px-0 w-11`} style={{ color: MUTED }}>
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </header>

                {/* Group 2 · conversation */}
                <section className="flex min-h-0 flex-1 flex-col gap-2" style={lit("conversation")}>
                  <div
                    ref={logRef}
                    role="log"
                    aria-live="polite"
                    className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-xl p-3"
                    style={{ backgroundColor: RAISED, border: `1px solid ${HAIRLINE}` }}
                  >
                    <div className={bubble} style={{ color: INK, border: `1px solid ${HAIRLINE}` }}>
                      {t("yourAiInstrument.greeting")}
                    </div>
                    {messages.map((m, i) => (
                      <div key={i} className={m.role === "player" ? "flex justify-end" : "flex justify-start"}>
                        <div
                          className={bubble}
                          style={
                            m.role === "player"
                              ? { backgroundColor: "rgba(188,215,230,0.14)", color: INK }
                              : { border: `1px solid ${HAIRLINE}`, color: INK }
                          }
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {thinking && <p className="text-[13px] italic" style={{ color: MUTED }}>{t("yourAiInstrument.thinking")}</p>}
                    {turnError && (
                      <p role="alert" className="text-[13px]" style={{ color: INK }}>
                        {t("yourAiInstrument.turnError")}{" "}
                        {lastMessage?.role === "player" && (
                          <button type="button" onClick={() => void runTurn(messages)} className="underline underline-offset-4" style={{ color: ACCENT }}>
                            {t("yourAiInstrument.retry")}
                          </button>
                        )}
                      </p>
                    )}
                  </div>

                  {offered.length > 0 && (
                    <div className="flex flex-wrap gap-2" role="group" aria-label={t("yourAiInstrument.nextSteps")}>
                      {offered.map((b, i) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => goTo(b.to as string, b)}
                          className={pill}
                          style={i === 0 ? { backgroundColor: ACCENT, color: PANEL, fontWeight: 600 } : { border: `1px solid ${HAIRLINE}`, color: INK }}
                        >
                          {b.label}
                          {i === 0 && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />}
                        </button>
                      ))}
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
                      disabled={limitReached}
                      aria-label={t("yourAiInstrument.placeholder")}
                      placeholder={limitReached ? t("yourAiInstrument.limitPlaceholder") : t("yourAiInstrument.placeholder")}
                      className="min-w-0 flex-1 resize-none rounded-xl px-3 py-2 text-[16px] outline-none placeholder:text-[#8497a3] focus-visible:ring-2 focus-visible:ring-[#bcd7e6] disabled:opacity-60"
                      style={{ backgroundColor: RAISED, border: `1px solid ${HAIRLINE}`, color: INK }}
                    />
                    <button
                      type="button"
                      onClick={send}
                      disabled={!draft.trim() || thinking || limitReached}
                      aria-label={t("yourAiInstrument.send")}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6] disabled:opacity-40"
                      style={{ backgroundColor: ACCENT, color: PANEL }}
                    >
                      <Send aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                  {limitReached && (
                    <p role="status" className="text-[12px]" style={{ color: MUTED }}>{t("yourAiInstrument.limitNote")}</p>
                  )}
                </section>

                {/* Group 3 · Console of AI Apps: each suite is a button that opens its existing route */}
                <section aria-label={t("yourAiInstrument.console")} style={lit("console")}>
                  <h3 className="mb-1.5 text-[11px] uppercase tracking-[0.14em]" style={{ color: MUTED }}>{t("yourAiInstrument.console")}</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {CONSOLE_SUITES.map((s) => (
                      <li key={s.category}>
                        <button
                          type="button"
                          onClick={() => goTo(s.to)}
                          className={`${pill} w-full justify-between rounded-xl`}
                          style={{ backgroundColor: RAISED, border: `1px solid ${HAIRLINE}`, color: INK }}
                        >
                          <span>{t(`aiOsPage.suites.${s.category}`)}</span>
                          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" style={{ color: ACCENT }} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Group 4 · Power-ups: one closed row, GoBY §25.5 form */}
                <section
                  role="group"
                  aria-label={t("yourAiInstrument.powerUpsTitle")}
                  className="rounded-xl px-3 py-2.5"
                  style={{ ...lit("powerUps"), border: `1px dashed ${HAIRLINE}`, color: MUTED }}
                >
                  <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: INK }}>
                    <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                    {t("yourAiInstrument.powerUpsTitle")}
                    <span className="sr-only">{t("yourAiInstrument.locked")}</span>
                  </p>
                  <p className="text-[12px] leading-relaxed">{t("yourAiInstrument.powerUpsLine")}</p>
                </section>
              </div>

              {/* The tour caption: one line per beat, skippable, shown once, replayable from the header. */}
              {tourActive && (
                <div className="shrink-0 space-y-2 p-4 pt-3" style={{ backgroundColor: PANEL, borderTop: `1px solid ${HAIRLINE}` }} role="region" aria-label={t("yourAiInstrument.tourLabel")}>
                  <p key={beat} aria-live="polite" className="animate-in fade-in duration-500 text-[14px] leading-snug" style={{ color: INK }}>
                    {t(`yourAiInstrument.tour.${TOUR_GROUPS[beat as number]}`)}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ color: MUTED }}>
                      {t("yourAiInstrument.tourStep", { n: (beat as number) + 1, total: TOUR_GROUPS.length })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={endTour} className={pill} style={{ color: MUTED }}>
                        {t("yourAiInstrument.tourSkip")}
                      </button>
                      <button type="button" onClick={nextBeat} className={pill} style={{ backgroundColor: ACCENT, color: PANEL, fontWeight: 600 }}>
                        {beat === TOUR_GROUPS.length - 1 ? t("yourAiInstrument.tourDone") : t("yourAiInstrument.tourNext")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
};

export default YourAiInstrument;
