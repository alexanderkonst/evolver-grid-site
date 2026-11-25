/**
 * WaterFace — the water body's lens: Time (architecture §6, SoW WP3, GoBY §25.14).
 *
 * At most three items (`buildWaterItems`): the moon with the day of the lunar cycle, the next FMF, and
 * either "this cycle" changes (when phase 6 writes any) or the next Café gathering. It is a lens, never a
 * map: each button hands the player back to a place (the Café or FMF) and closes the instrument. All
 * rules live in `src/lib/instrument/waterFace.ts`; this file only paints them.
 *
 * Registered in the water slot by `src/lib/instrument/faces.ts`. Imports only the `FaceProps` type from
 * there, so there is no runtime import cycle. Same design law as the air face: near-black, one ice-blue
 * accent, no glow rings.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowRight, ChevronLeft, X } from "lucide-react";
import type { FaceProps } from "@/lib/instrument/faces";
import { moonLitPolygon } from "@/lib/instrument/glyph";
import {
  buildWaterItems,
  itemRoute,
  nextGathering,
  readCycleChanges,
  type Gathering,
  type WaterItem,
} from "@/lib/instrument/waterFace";
import { zonedInstant } from "@/lib/circles";
import { getVillageElement } from "@/data/villagePlaces";

const ACCENT = "#bcd7e6";
const INK = "#e8eef2";
const MUTED = "#9fb2bd";
const PANEL = "#0b0e13";
const RAISED = "#121820";
const HAIRLINE = "rgba(188,215,230,0.18)";
const SERIF = "'Cormorant Garamond', serif";
const EASE = "cubic-bezier(0.22, 0.8, 0.24, 1)";

const pill =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full px-4 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[#bcd7e6]";

/** "YYYY-MM-DD" as a local calendar day (noon, so no zone can shift it). */
const civil = (ymd: string): Date => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12);
};

/** The moon: a dim disc with the lit part drawn over it, the same polygon the glyph's ring uses. */
const Moon = ({ cycle, color }: { cycle: number; color: string }) => {
  const r = 22;
  const lit = moonLitPolygon(cycle, r);
  return (
    <svg aria-hidden="true" focusable="false" viewBox="-26 -26 52 52" width={56} height={56} className="shrink-0">
      <circle r={r} fill="none" stroke={color} strokeOpacity={0.55} strokeWidth={1.2} />
      {lit.length > 0 && <polygon points={lit.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ")} fill={color} fillOpacity={0.9} />}
    </svg>
  );
};

const WaterFace = ({ ownerId, reduced, closeMs, active, onBack, onClose, onNavigate }: FaceProps) => {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const water = getVillageElement("water");

  // The clock is read when the face turns forward, so it is today's moon, not the one from when the page loaded.
  const now = useMemo(() => Date.now(), [active]); // eslint-disable-line react-hooks/exhaustive-deps
  const [gathering, setGathering] = useState<Gathering | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!active) return;
    panelRef.current?.focus();
    let cancelled = false;
    setLoaded(false);
    // Loaded on demand: the Supabase client needs the browser (localStorage) at import time, and the face is
    // registered in `faces.ts`, which tests and the shell import without a DOM.
    import("@/lib/circlesApi")
      .then(({ fetchCafeCircles }) => fetchCafeCircles(ownerId))
      .then(({ circles }) => {
        if (!cancelled) setGathering(nextGathering(circles, Date.now()));
      })
      .catch(() => {
        // No calendar to read (offline, guest without the table): the item says there is nothing yet.
        if (!cancelled) setGathering(null);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [active, ownerId]);

  const lang = i18n.resolvedLanguage || "en";
  const items = buildWaterItems({ now, gathering, changes: readCycleChanges() });

  const day = (ymd: string) => new Intl.DateTimeFormat(lang, { weekday: "short", month: "short", day: "numeric" }).format(civil(ymd));
  const gatheringWhen = (g: Gathering): string => {
    const at = zonedInstant(g.date, g.time, g.timezone);
    let time: string;
    try {
      time = new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit", timeZone: g.timezone || undefined }).format(at);
    } catch {
      time = new Intl.DateTimeFormat(lang, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(at);
    }
    return t("waterFace.gathering.when", { date: day(g.date), time });
  };

  const label = "text-[11px] uppercase tracking-[0.14em]";
  const card = "rounded-xl p-3";
  const cardStyle: React.CSSProperties = { backgroundColor: RAISED, border: `1px solid ${HAIRLINE}` };

  const go = (item: WaterItem, text: string, testId: string) => {
    const to = itemRoute(item);
    if (!to) return null;
    return (
      <button
        type="button"
        data-testid={testId}
        onClick={() => onNavigate(to)}
        className={`${pill} mt-2 w-full justify-between rounded-xl`}
        style={{ backgroundColor: ACCENT, color: PANEL, fontWeight: 600 }}
      >
        <span>{text}</span>
        <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
    );
  };

  const renderItem = (item: WaterItem) => {
    switch (item.kind) {
      case "moon":
        return (
          <div className={`${card} flex items-center gap-3`} style={cardStyle} data-testid="water-item-moon">
            <Moon cycle={item.cycle} color={water.color} />
            <div className="min-w-0">
              <h3 className={label} style={{ color: MUTED }}>{t("waterFace.moon.label")}</h3>
              <p className="text-lg leading-tight" style={{ fontFamily: SERIF, fontWeight: 600, color: INK }}>
                {t(`waterFace.phase.${item.segmentIndex}`)}
              </p>
              <p className="text-[13px]" style={{ color: MUTED }}>{t("waterFace.moon.day", { day: item.day })}</p>
            </div>
          </div>
        );
      case "fmf":
        return (
          <div className={card} style={cardStyle} data-testid="water-item-fmf">
            <h3 className={label} style={{ color: MUTED }}>{item.live ? t("waterFace.fmf.live") : t("waterFace.fmf.label")}</h3>
            <p className="text-[15px]" style={{ color: INK }}>{`${day(item.monday)} – ${day(item.wednesday)}`}</p>
            {go(item, t("waterFace.fmf.go"), "water-go-fmf")}
          </div>
        );
      case "gathering":
        return (
          <div className={card} style={cardStyle} data-testid="water-item-gathering">
            <h3 className={label} style={{ color: MUTED }}>{t("waterFace.gathering.label")}</h3>
            <p className="text-[15px]" style={{ color: INK }}>
              {item.gathering ? item.gathering.title : loaded ? t("waterFace.gathering.none") : t("waterFace.gathering.loading")}
            </p>
            {item.gathering && <p className="text-[13px]" style={{ color: MUTED }}>{gatheringWhen(item.gathering)}</p>}
            {go(item, t("waterFace.gathering.go"), "water-go-cafe")}
          </div>
        );
      case "changes":
        return (
          <div className={card} style={cardStyle} data-testid="water-item-changes">
            <h3 className={label} style={{ color: MUTED }}>{t("waterFace.changes.label")}</h3>
            <ul className="m-0 list-none space-y-1 p-0">
              {item.lines.map((line) => (
                <li key={line} className="text-[14px]" style={{ color: INK }}>{line}</li>
              ))}
            </ul>
          </div>
        );
    }
  };

  return (
    <div
      ref={panelRef}
      role="region"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-face-root="water"
      data-testid="water-face"
      className="pointer-events-auto relative flex max-h-full w-full flex-col overflow-hidden rounded-2xl outline-none sm:w-[26rem]"
      style={{
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
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <header className="flex items-center gap-3">
          <button type="button" onClick={onBack} aria-label={t("instrument.back")} className={`${pill} w-11 !px-0`} style={{ color: MUTED }}>
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <h2 id={titleId} className="min-w-0 flex-1 text-xl leading-tight" style={{ fontFamily: SERIF, fontWeight: 600, color: INK }}>
            {t("waterFace.title")}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("waterFace.close")} className={`${pill} w-11 !px-0`} style={{ color: MUTED }}>
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>
        <ul className="m-0 flex list-none flex-col gap-3 p-0" data-testid="water-items">
          {items.map((item) => (
            <li key={item.kind}>{renderItem(item)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WaterFace;
