/**
 * YourAiInstrument — the navigation instrument's host (docs/specs/navigation-instrument/architecture.md
 * §4–§5.1, GoBY §25.10) and the air face, Your AI (docs/specs/your-ai-instrument/sow.md, #458).
 *
 * Closed: the glyph in the corner (`InstrumentGlyph`). One gesture (click, Enter, the `I` key, a swipe
 * up on touch) raises the instrument over the living world: the crystal rises to the centre and turns
 * a face, the world dims to about 0.9 brightness and stays mounted and live, the bodies unfold in an
 * arc with their labels (lit ones drawn, unlit ones outlines that say "Opens on your path"). The same
 * gesture, Esc, or a tap outside lowers it, playing the same motion backwards, and focus goes back to
 * where it was. Opening never changes the route. Reduced motion: a 150 ms crossfade, no rise, no turn.
 *
 * A face is one body turned forward (`src/lib/instrument/faces.ts`). Only air has one today: the Your
 * AI panel below (header, conversation, Console, power-ups, first-open tour). The other slots are
 * empty, and an empty body is shown but not offered as a door.
 *
 * The machine is `src/lib/instrument/state.ts`. Design law (GoBY §5): near-black, one accent ice blue,
 * physical materials, no glow rings. AiOsPage is deliberately not imported: its backgrounds are the
 * documented OOM / stacking-context hazard (see SpacesRail.tsx), and this component lives in the shell
 * on every screen.
 */
import { useCallback, useEffect, useId, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronLeft, Lock, RotateCcw, Send, X } from "lucide-react";
import AirOctahedron from "@/components/game/AirOctahedron";
import InstrumentGlyph from "@/components/game/InstrumentGlyph";
import { QuarterSign } from "@/components/game/QuarterSign";
import { type YourAiButton } from "@/data/yourAiCatalog";
import { VILLAGE_ELEMENTS, type ElementKey } from "@/data/villagePlaces";
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
import { getFace, hasFace, registerFace, type FaceProps } from "@/lib/instrument/faces";
import { instrumentModel, instrumentReduce, isRaised } from "@/lib/instrument/state";

/** The crystal raised in the middle of the screen, CSS px. */
const AIR_PX = 128;
/** Where the raised crystal sits, as a share of the viewport height. */
const STAGE_Y = 0.46;
/** The bodies' arc, degrees from the +x axis (canvas y points down, so negative is up), one per body that is not air. */
const ARC_DEG = [-165, -118, -62, -15];
const ARC_RADIUS_MAX = 140;
/** Open: about 600 ms; reduced motion: a 150 ms crossfade. */
const OPEN_MS = 600;
const OPEN_REDUCED_MS = 150;
/** The world under the instrument: about 0.9 brightness, still live. */
const DIM = "rgba(0,0,0,0.1)";

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

/** Conversations survive the instrument closing and opening again, for as long as the page lives. */
const conversations = new Map<string, DialogueMessage[]>();

/** The air face: Your AI (#458). It registers itself in the faces registry below. */
const AirFace = ({ ownerId, reduced, closeMs, active, onBack, onClose, onNavigate }: FaceProps) => {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const convoKey = ownerId ?? "guest";

  const [beat, setBeat] = useState<number | null>(null);
  const [messages, setMessagesState] = useState<DialogueMessage[]>(() => conversations.get(convoKey) ?? []);
  const setMessages = (next: DialogueMessage[]) => {
    conversations.set(convoKey, next);
    setMessagesState(next);
  };
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [turnError, setTurnError] = useState(false);
  const [turnsUsed, setTurnsUsed] = useState(() => getTurnsUsedToday(ownerId));
  const limitReached = turnsUsed >= YOUR_AI_DAILY_FREE_TURNS;

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ y: number; atTop: boolean } | null>(null);

  const tourActive = beat !== null;

  // Once the face is forward: focus moves in; the first time ever, the tour starts.
  useEffect(() => {
    if (!active) return;
    setTurnsUsed(getTurnsUsedToday(ownerId));
    panelRef.current?.focus();
    if (readTourSeen()) return;
    const timer = window.setTimeout(() => setBeat(0), reduced ? 200 : 520);
    return () => window.clearTimeout(timer);
  }, [active, reduced, ownerId]);

  // The tour: lean into one group, by scale and light. Reduced motion: light only (fades).
  const endTour = useCallback(() => {
    writeTourSeen();
    setBeat(null);
  }, []);
  useEffect(() => {
    if (!active && beat !== null) {
      writeTourSeen();
      setBeat(null);
    }
  }, [active, beat]);
  useEffect(() => {
    contentRef.current?.toggleAttribute("inert", tourActive);
  }, [tourActive]);
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
    onNavigate(to);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    swipeRef.current = { y: e.touches[0].clientY, atTop: (logRef.current?.scrollTop ?? 0) <= 0 || !logRef.current?.contains(e.target as Node) };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (start?.atTop && e.changedTouches[0].clientY - start.y >= SWIPE_CLOSE_PX) onClose();
  };

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

  return (
    <div
      ref={panelRef}
      role="region"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-face-root="air"
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
        opacity: active ? 1 : 0,
        transform: active || reduced ? "none" : "translateY(28px) scale(0.9)",
        transition: `opacity ${closeMs}ms ${EASE}, transform ${closeMs}ms ${EASE}`,
      }}
    >
              <div
                ref={contentRef}
                className="relative flex min-h-0 flex-1 flex-col gap-3 p-4"
              >
                {/* Group 1 · header */}
                <header className="flex items-center gap-3" style={lit("header")}>
                  <button type="button" onClick={onBack} aria-label={t("instrument.back")} className={`${pill} !px-0 w-11`} style={{ color: MUTED }}>
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                  </button>
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
                  <button type="button" onClick={onClose} aria-label={t("yourAiInstrument.close")} className={`${pill} !px-0 w-11`} style={{ color: MUTED }}>
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
  );
};

registerFace("air", AirFace);

/** `inert` is not in React 18's DOM typings; the attribute itself is what browsers read. */
const inertProps = (on: boolean): Record<string, string> => (on ? { inert: "" } : {});

type Props = {
  /** The existing gate: T+M+A complete, or the AI OS was ever visited. */
  enabled: boolean;
  /** Signed-in player id, for the daily cap and traces; null for a guest. */
  ownerId: string | null;
  /** `litQuarters` for this player: which bodies are lit. */
  lit: Record<ElementKey, boolean>;
  /** CSS selector of what the glyph must never cover on this screen (the village's next-move card). */
  avoid?: string;
};

const YourAiInstrument = ({ enabled, ownerId, lit, avoid }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [model, dispatch] = useReducer(instrumentReduce, enabled, instrumentModel);
  const raised = isRaised(model);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [rise, setRise] = useState({ dx: 0, dy: 0 });
  const [announce, setAnnounce] = useState("");
  const [arcRadius, setArcRadius] = useState(ARC_RADIUS_MAX);

  const glyphRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const lastFaceRef = useRef<ElementKey>("air");
  const wasRaisedRef = useRef(false);

  const moveMs = reduced ? OPEN_REDUCED_MS : OPEN_MS;
  if (model.face) lastFaceRef.current = model.face;

  // The same gate #458 has (anyone with a profile) decides who carries it.
  useEffect(() => {
    dispatch({ type: "gate", enabled });
  }, [enabled]);

  const openInstrument = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // The crystal rises from where the glyph is to the middle of the screen.
    const g = glyphRef.current?.getBoundingClientRect();
    if (g) setRise({ dx: g.left + g.width / 2 - window.innerWidth / 2, dy: g.top + g.height / 2 - window.innerHeight * STAGE_Y });
    setArcRadius(Math.max(96, Math.min(ARC_RADIUS_MAX, (window.innerWidth - 84) / 2)));
    dispatch({ type: "open" });
  }, []);
  const closeInstrument = useCallback(() => dispatch({ type: "close" }), []);
  const toggle = useCallback(() => (raised ? closeInstrument() : openInstrument()), [raised, openInstrument, closeInstrument]);

  // `I` (or the period), from anywhere in the shell, never while typing.
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
    if (raised) {
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    if (!mounted) return;
    setShown(false);
    const back = returnFocusRef.current;
    (back && back.isConnected ? back : glyphRef.current)?.focus();
    const timer = window.setTimeout(() => setMounted(false), moveMs);
    return () => window.clearTimeout(timer);
  }, [raised, mounted, moveMs]);

  // One short line for screen readers on open and on close.
  useEffect(() => {
    if (raised === wasRaisedRef.current) return;
    wasRaisedRef.current = raised;
    setAnnounce(raised ? t("instrument.announceOpen") : t("instrument.announceClose"));
  }, [raised, t]);

  // Focus moves into the dialog when it is up, and back to the dialog from a face.
  useEffect(() => {
    if (shown && model.state === "open") dialogRef.current?.focus();
  }, [shown, model.state]);

  // Esc closes; Tab stays inside the dialog while it is up.
  useEffect(() => {
    if (!mounted) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeInstrument();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => !n.closest("[inert]"));
      if (nodes.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const atStart = active === first || active === dialogRef.current || !!active?.hasAttribute("data-face-root");
      if (e.shiftKey && atStart) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [mounted, closeInstrument]);

  const goTo = useCallback(
    (to: string) => {
      closeInstrument();
      navigate(to);
    },
    [closeInstrument, navigate],
  );

  if (!enabled || model.state === "hidden" || typeof document === "undefined") return null;

  const bodies = VILLAGE_ELEMENTS.filter((e) => e.key !== "air");
  const FaceComponent = getFace(model.face ?? lastFaceRef.current);
  const inFace = model.state === "face";
  const bodyStyle = (i: number): React.CSSProperties => {
    const a = (ARC_DEG[i] * Math.PI) / 180;
    const x = Math.cos(a) * arcRadius;
    const y = Math.sin(a) * arcRadius;
    return {
      // Unfold from the crystal like petals; reduced motion fades in place.
      transform: shown && !inFace ? `translate(${x}px, ${y}px)` : reduced ? `translate(${x}px, ${y}px)` : "translate(0px, 0px) scale(0.3)",
      opacity: shown && !inFace ? 1 : 0,
      transition: `transform ${reduced ? 0 : 480}ms ${EASE}, opacity ${reduced ? OPEN_REDUCED_MS : 400}ms ${EASE}`,
      transitionDelay: shown && !reduced ? `${i * 40}ms` : "0ms",
    };
  };
  const label =
    "rounded-full px-2.5 py-0.5 text-[12px] leading-tight whitespace-nowrap";
  const labelStyle: React.CSSProperties = { backgroundColor: "rgba(11,14,19,0.9)", border: `1px solid ${HAIRLINE}`, color: INK };

  return createPortal(
    <>
      <InstrumentGlyph
        ref={glyphRef}
        lit={lit}
        carried={!mounted}
        open={raised}
        reduced={reduced}
        label={raised ? t("instrument.close") : t("instrument.open")}
        avoid={avoid}
        onToggle={toggle}
        onSwipeUp={() => {
          if (!raised) openInstrument();
        }}
      />
      {/* One short line on open and on close, for screen readers. */}
      <p role="status" aria-live="polite" className="sr-only" data-testid="instrument-announce">
        {announce}
      </p>

      {mounted && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={t("instrument.label")}
          tabIndex={-1}
          data-testid="your-ai-overlay"
          data-state={model.state}
          className="fixed inset-0 z-[80] outline-none"
        >
          {/* The world stays mounted and visible behind: dimmed to about 0.9, not paused. Tapping it lowers the instrument. */}
          <div
            aria-hidden="true"
            data-testid="instrument-scrim"
            onClick={closeInstrument}
            className="absolute inset-0"
            style={{ backgroundColor: DIM, opacity: shown ? 1 : 0, transition: `opacity ${moveMs}ms ${EASE}` }}
          />

          {/* The stage: the crystal at the middle of the screen, the bodies in an arc above it. */}
          <div
            className="pointer-events-none absolute left-1/2"
            style={{ top: `${STAGE_Y * 100}%`, width: 0, height: 0 }}
            {...inertProps(inFace)}
          >
            <button
              type="button"
              disabled={!hasFace("air")}
              onClick={() => dispatch({ type: "face", element: "air" })}
              aria-label={`${t("instrument.body.air")}: ${t("instrument.face.air")}`}
              data-testid="instrument-body-air"
              className="pointer-events-auto absolute flex flex-col items-center gap-1.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
              style={{
                left: -AIR_PX / 2,
                top: -AIR_PX / 2,
                width: AIR_PX,
                opacity: inFace ? 0 : 1,
                transformOrigin: "center",
                // The crystal rises from the glyph and turns one face to the player.
                transform: shown || reduced ? "none" : `translate(${rise.dx}px, ${rise.dy}px) scale(0.78) rotate(-40deg)`,
                transition: `transform ${reduced ? 0 : moveMs}ms ${EASE}, opacity ${reduced ? OPEN_REDUCED_MS : 300}ms ${EASE}`,
              }}
            >
              <AirOctahedron size={AIR_PX} still reduced={reduced} />
              <span className={label} style={{ ...labelStyle, marginTop: -6 }}>
                {t("instrument.body.air")} · {t("instrument.face.air")}
              </span>
            </button>

            <ul aria-label={t("instrument.bodies")} className="m-0 list-none p-0">
              {bodies.map((b, i) => {
                const isLit = !!lit[b.key];
                const openable = isLit && hasFace(b.key);
                const content = (
                  <>
                    <span aria-hidden="true" className="block">
                      <QuarterSign element={b.key} lit={isLit} size={40} />
                    </span>
                    <span className={label} style={labelStyle}>{t(`instrument.body.${b.key}`)}</span>
                    {!isLit && (
                      <span className="max-w-[5.5rem] rounded-lg px-1.5 py-0.5 text-center text-[11px] leading-snug" style={{ ...labelStyle, color: MUTED }}>
                        {t("instrument.opensOnPath")}
                      </span>
                    )}
                  </>
                );
                const place: React.CSSProperties = { left: -44, top: -24, width: 88, ...bodyStyle(i) };
                return (
                  <li key={b.key} className="absolute" style={place} data-testid={`instrument-body-${b.key}`} data-lit={isLit ? "true" : "false"}>
                    {openable ? (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "face", element: b.key })}
                        className="pointer-events-auto flex w-full flex-col items-center gap-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]"
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="pointer-events-none flex w-full flex-col items-center gap-1">{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* The face turned forward. The air face stays mounted once opened so a conversation is not lost on Back. */}
          {FaceComponent && (
            <div
              className="pointer-events-none absolute inset-x-3 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+10.25rem)] top-3 flex items-end justify-end sm:inset-x-6 sm:bottom-[12.25rem]"
              {...inertProps(!inFace)}
            >
              <FaceComponent
                ownerId={ownerId}
                reduced={reduced}
                closeMs={moveMs}
                active={shown && inFace}
                onBack={() => dispatch({ type: "back" })}
                onClose={closeInstrument}
                onNavigate={goTo}
              />
            </div>
          )}
        </div>
      )}
    </>,
    document.body,
  );
};

export default YourAiInstrument;
