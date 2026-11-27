/**
 * YourAiInstrument — the navigation instrument's host (docs/specs/navigation-instrument/architecture.md
 * §4–§5.1, GoBY §25.10) and the air face, Your AI (docs/specs/your-ai-instrument/sow.md, #458).
 *
 * Closed: the glyph in the corner (`InstrumentGlyph`) opens Your AI over the living world. The Back
 * button shows the raised crystal and quarter arc. The live world stays mounted under the scrim.
 * Esc, the close button, and a tap on the scrim restore focus to the opener.
 * Reduced motion uses a 150 ms crossfade in place of the rise.
 *
 * A face is one body turned forward (`src/lib/instrument/faces.ts`). Only air has one today: the Your
 * AI panel below (header, conversation, Console, first-open tour). The other slots are
 * empty, and an empty body is shown but not offered as a door.
 *
 * The machine is `src/lib/instrument/state.ts`. Design law (GoBY §5): near-black, one accent ice blue,
 * physical materials, no glow rings. AiOsPage is deliberately not imported: its backgrounds are the
 * documented OOM / stacking-context hazard (see SpacesRail.tsx), and this component lives in the shell
 * on every screen.
 */
import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronLeft, RotateCcw, Send, X } from "lucide-react";
import AirOctahedron from "@/components/game/AirOctahedron";
import InstrumentGlyph from "@/components/game/InstrumentGlyph";
import InkGuide, { nextInkNonce, type InkRequest } from "@/components/game/InkLine";
import InstrumentRitual from "@/components/game/InstrumentRitual";
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
import { readConversation, writeConversation } from "@/lib/instrument/conversation";
import { ConversationSuggestion } from "@/components/game/console/ConversationSuggestion";
import ConsolePanel from "@/components/game/console/ConsolePanel";
import { getFace, hasFace, registerFace, type FaceProps } from "@/lib/instrument/faces";
import { hasGlint, parseGlints, type Glints } from "@/lib/instrument/glint";
import { instrumentModel, instrumentReduce, isRaised } from "@/lib/instrument/state";
import { useGlints } from "@/hooks/useGlints";

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
const DIM = "rgba(0,0,0,0.55)";

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

/** The air face: Your AI (#458). It registers itself in the faces registry below. */
const AirFace = ({ ownerId, reduced, closeMs, active, onBack, onClose, onNavigate }: FaceProps) => {
  const { t, i18n } = useTranslation();
  const titleId = useId();

  const [beat, setBeat] = useState<number | null>(null);
  // The air face has two tabs beside each other: the conversation and the Console (Phoenix chain).
  const [tab, setTab] = useState<"conversation" | "console">("conversation");
  const [messages, setMessagesState] = useState<DialogueMessage[]>(() => readConversation(ownerId));
  const setMessages = (next: DialogueMessage[]) => {
    writeConversation(ownerId, next);
    setMessagesState(next);
  };
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [turnError, setTurnError] = useState(() => messages[messages.length - 1]?.role === "player");
  const [turnsUsed, setTurnsUsed] = useState(() => getTurnsUsedToday(ownerId));
  const limitReached = turnsUsed >= YOUR_AI_DAILY_FREE_TURNS;

  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<{ y: number; atTop: boolean } | null>(null);

  const tourActive = beat !== null;
  // The tour walks the conversation view, so it brings that tab forward.
  useEffect(() => {
    if (tourActive) setTab("conversation");
  }, [tourActive]);

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
    setMessages(history);
    setThinking(true);
    setTurnError(false);
    try {
      const snapshot = ownerId ? getCachedZogSnapshot(ownerId) : null;
      const card = buildPlayerCard(snapshot, readTraces(ownerId));
      const turn = await askYourAi(history, "", i18n.resolvedLanguage, card, "instrument");
      setTurnsUsed(recordTurn(ownerId));
      setMessages([...history, { role: "ai", text: turn.reply, buttons: turn.buttons }]);
    } catch (err) {
      console.error("[YourAiInstrument] turn failed", err);
      setTurnError(true);
    } finally {
      setThinking(false);
    }
  };
  const send = (reply = draft) => {
    const text = reply.trim();
    if (!text || thinking || limitReached) return;
    if (reply === draft) setDraft("");
    void runTurn([...messages, { role: "player", text }]);
  };
  const lastMessage = messages[messages.length - 1];
  // The reveal action belongs to the entry dialogue.
  const offered: YourAiButton[] =
    !thinking && lastMessage?.role === "ai" ? (lastMessage.buttons ?? []).filter((b) => b.kind !== "action") : [];

  const playerCard = () => (ownerId ? buildPlayerCard(getCachedZogSnapshot(ownerId), readTraces(ownerId)) : null);
  const onTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = tab === "conversation" ? "console" : "conversation";
    setTab(next);
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>(`[data-tab="${next}"]`)?.focus());
  };

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
      className="pointer-events-auto relative flex h-dvh w-full min-h-0 flex-col overflow-hidden outline-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] sm:h-[calc(100dvh-4rem)] sm:w-[min(72rem,calc(100vw-4rem))] sm:rounded-2xl sm:p-0"
      style={{
        backgroundColor: PANEL,
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "0 28px 60px -14px rgba(0,0,0,0.75)",
        color: INK,
        transformOrigin: "center",
        opacity: active ? 1 : 0,
        transform: active || reduced ? "none" : "translate(var(--your-ai-rise-x), var(--your-ai-rise-y)) scale(0.12)",
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
                    <p className="text-[12px]" style={{ color: MUTED }} aria-live="polite">
                      {t("yourAiInstrument.turnsRemaining", { count: Math.max(0, YOUR_AI_DAILY_FREE_TURNS - turnsUsed) })}
                    </p>
                  </div>
                  <button type="button" onClick={() => setBeat(0)} aria-label={t("yourAiInstrument.replay")} className={`${pill} !px-0 w-11`} style={{ color: MUTED }}>
                    <RotateCcw aria-hidden="true" className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={onClose} aria-label={t("yourAiInstrument.close")} className={`${pill} !px-0 w-11`} style={{ color: MUTED }}>
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </header>

                {/* Tabs: the conversation, and the Console (the Phoenix chain, docs/specs/your-ai-console/console-v1.md) */}
                <div role="tablist" aria-label={t("yourAiConsole.tablist")} className="flex gap-1" onKeyDown={onTabKeyDown} style={lit("conversation")}>
                  {(["conversation", "console"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      id={`${titleId}-tab-${k}`}
                      data-tab={k}
                      aria-selected={tab === k}
                      aria-controls={`${titleId}-panel-${k}`}
                      tabIndex={tab === k ? 0 : -1}
                      onClick={() => setTab(k)}
                      className={`${pill} flex-1`}
                      style={tab === k ? { backgroundColor: "rgba(188,215,230,0.14)", color: INK, fontWeight: 600 } : { color: MUTED, border: `1px solid ${HAIRLINE}` }}
                    >
                      {k === "conversation" ? t("yourAiConsole.tabConversation") : t("yourAiConsole.tab")}
                    </button>
                  ))}
                </div>

                <div
                  role="tabpanel"
                  id={`${titleId}-panel-console`}
                  aria-labelledby={`${titleId}-tab-console`}
                  className={tab === "console" ? "mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col" : "hidden"}
                  {...inertProps(tab !== "console")}
                >
                  <ConsolePanel
                    key={ownerId ?? "guest"}
                    ownerId={ownerId}
                    language={i18n.resolvedLanguage}
                    messages={messages}
                    getPlayerCard={playerCard}
                  />
                </div>

                <div
                  role="tabpanel"
                  id={`${titleId}-panel-conversation`}
                  aria-labelledby={`${titleId}-tab-conversation`}
                  className={tab === "conversation" ? "mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col gap-3 overflow-y-auto" : "hidden"}
                  {...inertProps(tab !== "conversation")}
                >
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
                        <ConversationSuggestion
                          key={b.id}
                          suggestion={b}
                          onReply={send}
                          onGo={goTo}
                          goLabel={t("yourAiInstrument.go")}
                          disabled={limitReached}
                          className={pill}
                          style={i === 0 ? { backgroundColor: ACCENT, color: PANEL, fontWeight: 600 } : { border: `1px solid ${HAIRLINE}`, color: INK }}
                          accent={ACCENT}
                        />
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
                      onClick={() => send()}
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
                          <span className="inline-flex items-center gap-1" style={{ color: ACCENT }}>
                            {t("yourAiInstrument.go")}
                            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>

                </div>
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
  /** Location key of a direct visit to Your AI. */
  openAt?: string;
  /** Signed-in player id, for the daily cap and traces; null for a guest. */
  ownerId: string | null;
  /** `litQuarters` for this player: which bodies are lit. */
  lit: Record<ElementKey, boolean>;
  /** CSS selector of what the glyph must never cover on this screen (the village's next-move card). */
  avoid?: string;
};

const YourAiInstrument = ({ enabled, openAt, ownerId, lit, avoid }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [model, dispatch] = useReducer(instrumentReduce, enabled, instrumentModel);
  const raised = isRaised(model);
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [rise, setRise] = useState({ dx: 0, dy: 0, panelDy: 0 });
  const [announce, setAnnounce] = useState("");
  const [arcRadius, setArcRadius] = useState(ARC_RADIUS_MAX);
  const [inkRequest, setInkRequest] = useState<InkRequest | null>(null);

  const glyphRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const lastFaceRef = useRef<ElementKey>("air");
  const wasRaisedRef = useRef(false);

  const moveMs = reduced ? OPEN_REDUCED_MS : OPEN_MS;

  // WP6: a glint marks a body whose face changed (written in Your House); opening that face clears it.
  // Only a body the player can open shows one, and never air (its face is Your AI).
  const [storedGlints, clearGlintOf] = useGlints(ownerId);
  const glintKey = VILLAGE_ELEMENTS.filter((e) => e.key !== "air" && lit[e.key] && hasFace(e.key) && hasGlint(storedGlints, e.key))
    .map((e) => e.key)
    .join(",");
  // Stable between renders, so the glyph repaints only when a glint actually appears or goes.
  const glints = useMemo<Glints>(() => parseGlints(Object.fromEntries(glintKey.split(",").filter(Boolean).map((k) => [k, true]))), [glintKey]);
  useEffect(() => {
    if (model.state === "face" && model.face) clearGlintOf(model.face);
  }, [model.state, model.face, clearGlintOf]);
  if (model.face) lastFaceRef.current = model.face;

  // The same gate #458 has (anyone with a profile) decides who carries it.
  useEffect(() => {
    dispatch({ type: "gate", enabled });
  }, [enabled]);

  const openInstrument = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement : null;
    // The crystal rises from where the glyph is to the middle of the screen.
    const g = glyphRef.current?.getBoundingClientRect();
    if (g) {
      const y = g.top + g.height / 2;
      setRise({
        dx: g.left + g.width / 2 - window.innerWidth / 2,
        dy: y - window.innerHeight * STAGE_Y,
        panelDy: y - window.innerHeight / 2,
      });
    }
    setArcRadius(Math.max(96, Math.min(ARC_RADIUS_MAX, (window.innerWidth - 84) / 2)));
    dispatch({ type: "open" });
    dispatch({ type: "face", element: "air" });
  }, []);
  useEffect(() => {
    if (openAt !== undefined) openInstrument();
  }, [openAt, openInstrument]);

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
      let showFrame = 0;
      const mountFrame = requestAnimationFrame(() => {
        showFrame = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(mountFrame);
        cancelAnimationFrame(showFrame);
      };
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
    if (!raised) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeInstrument();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.tabIndex >= 0 && !n.closest("[inert]") && n.getClientRects().length > 0);
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
  }, [raised, closeInstrument]);

  const goTo = useCallback(
    (to: string) => {
      closeInstrument();
      navigate(to);
    },
    [closeInstrument, navigate],
  );

  // The ether face: close the instrument, then one ink line to the glowing place (`InkLine.tsx`).
  const showWay = useCallback(() => {
    closeInstrument();
    setInkRequest({ nonce: nextInkNonce() });
  }, [closeInstrument]);

  if (!enabled || model.state === "hidden" || typeof document === "undefined") return null;

  const bodies = VILLAGE_ELEMENTS.filter((e) => e.key !== "air");
  const FaceComponent = getFace(model.face ?? lastFaceRef.current);
  const inFace = model.state === "face";
  const airFace = (model.face ?? lastFaceRef.current) === "air";
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
        glints={glints}
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
      {/* The ink line (WP5): never shown by default; drawn on the ether face's choice, offered when the player seems lost. */}
      <InkGuide raised={raised} reduced={reduced} request={inkRequest} />
      {/* The body-lit ritual (WP2) and the breath on open and close: queued, plays at a calm moment, never over a module form. */}
      <InstrumentRitual enabled={enabled} ownerId={ownerId} lit={lit} raised={raised} />
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
          className="fixed inset-0 z-[82] outline-none"
          {...inertProps(!raised)}
        >
          {/* The live world stays visible through the scrim. Layers are explicit: scrim 0 (haze on the world only), stage 10, face panel 20 (full brightness). */}
          <div
            aria-hidden="true"
            data-testid="instrument-scrim"
            onClick={closeInstrument}
            className="absolute inset-0 z-0"
            style={{ backgroundColor: DIM, backdropFilter: "blur(6px)", opacity: shown ? 1 : 0, transition: `opacity ${moveMs}ms ${EASE}` }}
          />

          {/* The stage: the crystal at the middle of the screen, the bodies in an arc above it. */}
          <div
            className="pointer-events-none absolute left-1/2 z-10"
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
                    <span aria-hidden="true" className="relative block">
                      <QuarterSign element={b.key} lit={isLit} size={40} />
                      {glints[b.key] && (
                        // A static marker; it only breathes when motion is allowed. No text, never a feed.
                        <span
                          data-testid={`instrument-glint-${b.key}`}
                          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full motion-safe:animate-pulse"
                          style={{ backgroundColor: ACCENT, boxShadow: `0 0 0 2px ${PANEL}` }}
                        />
                      )}
                    </span>
                    <span className={label} style={labelStyle}>
                      {t(`instrument.body.${b.key}`)}
                      {glints[b.key] && <span className="sr-only">{`: ${t("instrument.glint.label")}`}</span>}
                    </span>
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
              className={airFace
                ? "pointer-events-none absolute inset-0 z-20 grid place-items-center"
                : "pointer-events-none absolute inset-x-3 bottom-[calc(max(1rem,env(safe-area-inset-bottom))+10.25rem)] top-3 z-20 flex items-end justify-end sm:inset-x-6 sm:bottom-[12.25rem]"}
              style={airFace ? {
                "--your-ai-rise-x": `${rise.dx}px`,
                "--your-ai-rise-y": `${rise.panelDy}px`,
                visibility: inFace || !raised ? "visible" : "hidden",
              } as React.CSSProperties : undefined}
              {...inertProps(!inFace || !shown)}
            >
              <FaceComponent
                key={ownerId ?? "guest"}
                ownerId={ownerId}
                reduced={reduced}
                closeMs={moveMs}
                active={shown && inFace}
                onBack={() => dispatch({ type: "back" })}
                onClose={closeInstrument}
                onShowWay={showWay}
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
