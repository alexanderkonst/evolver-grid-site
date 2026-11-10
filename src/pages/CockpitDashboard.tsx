import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/isAdmin";
import { calculateOffersBoardMetrics } from "@/lib/offersBoard";
import { useRuntimeOffers } from "@/hooks/useRuntimeOffers";
import OperationsTools from "@/components/cockpit/OperationsTools";
import ReturnChart, { type ReturnPoint } from "@/components/cockpit/ReturnChart";
import { crmSnapshot, pulseSnapshot } from "@/components/cockpit/data";
import {
  accentTint,
  Card,
  ctaStyle,
  fmtAsOf,
  fmtCount,
  fmtUsd,
  inset,
  LAYERS,
  LayerCard,
  type LayerId,
  pillButton,
  text,
  Tile,
} from "@/components/cockpit/ui";

/**
 * Founder Cockpit: one loop (Identity, Flow, Delivery, Return, Operations) read from one
 * source. A summary strip plus five layer cards, inside pane 3 of the persistent game shell
 * (the shell paints the sky; this page paints no background of its own).
 *
 * Every figure comes from the committed snapshots or the offer ledger. A value the data does
 * not carry shows "—" with a "not yet wired" note; nothing is estimated.
 * Founder-only data renders only when `isFounder` is true; everyone else sees empty states.
 */

const NOT_WIRED = "not yet wired";
const EMPTY_FOR_PLAYER = "Fills in as you build your venture.";

type LayerFilter = "all" | LayerId;

const StripCard = ({
  label,
  value,
  note,
  glow = false,
}: {
  label: string;
  value: string;
  note: string;
  glow?: boolean;
}) => (
  <Card as="div" className="!p-4">
    <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em]" style={text.muted}>
      {label}
    </div>
    <div
      className="mt-1.5 font-serif text-3xl"
      style={glow ? { ...text.accent, textShadow: `0 0 22px ${accentTint(0.45)}` } : text.primary}
    >
      {value}
    </div>
    <div className="mt-1 text-[11.5px]" style={text.faint}>
      {note}
    </div>
  </Card>
);

export default function CockpitDashboard() {
  // Founder-only data (build-time CRM/pulse snapshots, offer ledger, AI tools) is gated behind
  // this flag. Signed-in non-founders see the same layers with empty states.
  const [isFounder, setIsFounder] = useState(false);
  const [layer, setLayer] = useState<LayerFilter>("all");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      setIsFounder(isAdminEmail(data.user?.email));
    })();
  }, []);

  const offerRuntime = useRuntimeOffers(isFounder);
  // The hook starts from the bundled ledger; never let it reach a non-founder's screen.
  const offers = useMemo(() => (isFounder ? offerRuntime.offers : []), [isFounder, offerRuntime.offers]);
  const offerMetrics = useMemo(() => calculateOffersBoardMetrics(offers), [offers]);

  const figures = useMemo(() => {
    if (!isFounder) return null;
    const offersTotal = offers.reduce((sum, offer) => sum + offer.quantity, 0);
    const offersPaid = offers.filter((offer) => offer.status === "paid").reduce((sum, offer) => sum + offer.quantity, 0);
    const funnel = crmSnapshot.funnel?.find((row) => row.cohort === "All")?.metrics;
    const num = (value: unknown) => (typeof value === "number" ? value : undefined);
    const accepted = num(funnel?.accepted);
    const messaged = num(funnel?.messaged);
    const history: ReturnPoint[] = (crmSnapshot.metricsHistory ?? [])
      .filter((row) => typeof row.usd_paid === "number" && row.date)
      .map((row) => ({ date: row.date as string, usd: row.usd_paid as number }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return {
      offersTotal,
      offersPaid,
      hasOffers: offers.length > 0,
      accepted,
      messaged,
      replied: num(funnel?.replied),
      call: num(funnel?.["call-done"]),
      noFirstMessage: accepted !== undefined && messaged !== undefined ? Math.max(accepted - messaged, 0) : undefined,
      history,
      waiting: pulseSnapshot.openNextActions?.length,
      cash: crmSnapshot.cashReceivedUsd,
    };
  }, [isFounder, offers]);

  const crmAsOf = fmtAsOf(crmSnapshot.generated_at);
  const pulseAsOf = fmtAsOf(pulseSnapshot.generated_at);
  const ledgerAsOf = fmtAsOf(offerRuntime.generatedAt);
  const show = (id: LayerId) => layer === "all" || layer === id;
  const overdue = offerMetrics.overdueOfferKeys.size;
  const paidShare =
    figures && figures.offersTotal > 0 ? Math.round((figures.offersPaid / figures.offersTotal) * 100) : undefined;

  return (
    <main className="w-full text-[color:var(--text-body)]">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={text.accent}>
            Build · Founder Cockpit
          </p>
          <h1 className="mb-2 mt-2 font-serif text-4xl font-medium leading-[1.05] md:text-5xl" style={text.primary}>
            Your business as one living system
          </h1>
          <p className="text-[13.5px]" style={text.muted}>
            {isFounder
              ? `Read from your private ledger · CRM as of ${crmAsOf} · Pulse as of ${pulseAsOf}`
              : EMPTY_FOR_PLAYER}
          </p>
        </header>

        {/* Summary strip: three figures, each bound to data or "—". */}
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <StripCard
            glow
            label="Cash received (strict)"
            value={fmtUsd(figures?.cash)}
            note={
              !figures
                ? EMPTY_FOR_PLAYER
                : figures.cash === undefined
                  ? `Ledger field ${NOT_WIRED}`
                  : `Paid and confirmed only · as of ${crmAsOf}`
            }
          />
          <StripCard
            label="Offers paid"
            value={figures?.hasOffers ? `${figures.offersPaid} of ${figures.offersTotal}` : "—"}
            note={
              !figures
                ? EMPTY_FOR_PLAYER
                : !figures.hasOffers
                  ? `Offer ledger ${NOT_WIRED}`
                  : `${paidShare ?? 0}% of offers made · all channels · as of ${ledgerAsOf}`
            }
          />
          <StripCard
            label="Waiting on you"
            value={fmtCount(figures?.waiting)}
            note={!figures ? EMPTY_FOR_PLAYER : `Open next actions in Pulse · as of ${pulseAsOf}`}
          />
        </div>

        {/* Layer filter: client-side only, no route change. */}
        <nav aria-label="Cockpit layers" className="mb-5 flex flex-wrap gap-2">
          {[{ id: "all" as const, label: "All layers", question: "" }, ...LAYERS].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLayer(item.id)}
              aria-pressed={layer === item.id}
              className="rounded-full px-3.5 py-2 text-[12.5px] transition"
              style={pillButton(layer === item.id)}
            >
              {item.label}
              {item.id === "delivery" && (
                <span
                  className="ml-2 rounded-md px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.14em]"
                  style={{ background: accentTint(0.16), color: "var(--accent-text)" }}
                >
                  New
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className={`grid gap-4 ${layer === "all" ? "lg:grid-cols-2" : ""}`}>
          {show("identity") && (
            <LayerCard layer="identity" tag="Unique Business" className="lg:col-span-2">
              <p className="text-sm leading-6" style={text.muted}>
                Your Unique Business canvas holds who you are and what you sell. It changes by version, not by day.
              </p>
              <Link
                to="/ubb"
                className="mt-4 inline-flex rounded-xl px-5 py-2.5 text-[13.5px] font-semibold transition hover:opacity-90"
                style={ctaStyle}
              >
                Open my Unique Business
              </Link>
            </LayerCard>
          )}

          {show("flow") && (
            <LayerCard layer="flow" tag="One ladder · all channels" className="lg:col-span-2">
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                <Tile value={fmtCount(figures?.accepted)} label="Accepted" />
                <Tile value={fmtCount(figures?.messaged)} label="Messaged" />
                <Tile value={fmtCount(figures?.replied)} label="Replied" />
                <Tile value={fmtCount(figures?.call)} label="Call" />
                <Tile value={figures?.hasOffers ? String(figures.offersTotal) : "—"} label="Offers" />
                <Tile value={figures?.hasOffers ? String(figures.offersPaid) : "—"} label="Paid" hot />
              </div>
              {figures ? (
                <>
                  {figures.noFirstMessage !== undefined && figures.noFirstMessage > 0 && (
                    <p className="mt-3 flex items-center gap-2 text-[12.5px]" style={text.accent}>
                      <span
                        aria-hidden="true"
                        className="h-[7px] w-[7px] rounded-full"
                        style={{ background: "var(--accent-gold)" }}
                      />
                      Bottleneck: {figures.noFirstMessage} accepted connections have no first message yet
                    </p>
                  )}
                  <p className="mt-2 text-[11.5px]" style={text.faint}>
                    Accepted to Call: CRM funnel, all cohorts, as of {crmAsOf}. Offers and Paid: offer ledger, as of{" "}
                    {ledgerAsOf}. “—” means {NOT_WIRED}.
                  </p>
                </>
              ) : (
                <p className="mt-3 text-[12.5px]" style={text.faint}>
                  {EMPTY_FOR_PLAYER}
                </p>
              )}
            </LayerCard>
          )}

          {show("delivery") && (
            <LayerCard layer="delivery" tag="Between Paid and Cash">
              <p className="rounded-xl p-4 text-sm leading-6" style={inset}>
                <span style={text.primary}>No active engagements recorded yet</span>
                <span className="mt-1 block text-[12px]" style={text.faint}>
                  Engagements will appear here once the ledger carries them · {NOT_WIRED}.
                </span>
              </p>
            </LayerCard>
          )}

          {show("return") && (
            <LayerCard layer="return" tag="Fact">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.16em]" style={text.muted}>
                Received
              </div>
              <div className="mb-2 font-serif text-3xl" style={text.primary}>
                {fmtUsd(figures?.cash)}
              </div>
              {figures && figures.history.length >= 2 ? (
                <ReturnChart points={figures.history} />
              ) : (
                <p className="text-[12px]" style={text.faint}>
                  {figures ? `Cash over time ${NOT_WIRED}. Fact only, no projection.` : EMPTY_FOR_PLAYER}
                </p>
              )}
              {figures && <p className="mt-2 text-[11.5px]" style={text.faint}>Strictly received, as of {crmAsOf}.</p>}
            </LayerCard>
          )}

          {show("operations") && (
            <LayerCard layer="operations" tag="Pulse + AI work queue" className="lg:col-span-2">
              <div className="grid grid-cols-3 gap-1.5">
                <Tile value={fmtCount(figures?.waiting)} label="Waiting on you" hot />
                <Tile value="—" label="In progress" />
                <Tile value="—" label="Done" />
              </div>
              <p className="mt-2 text-[11.5px]" style={text.faint}>
                {figures
                  ? `Waiting on you counts open next actions in Pulse. In progress and Done are ${NOT_WIRED}.`
                  : EMPTY_FOR_PLAYER}
              </p>

              {figures && (
                <div className="mt-3 divide-y text-[13px]" style={{ borderColor: "var(--surface-card-border)" }}>
                  <div className="flex items-center justify-between gap-3 py-2.5" style={text.body}>
                    <span>
                      {overdue === 0
                        ? "No offer follow-ups are past their date"
                        : `${overdue} offer follow-up${overdue === 1 ? " is" : "s are"} past their date`}
                    </span>
                    {overdue > 0 && (
                      <Link to="/build/cockpit/offers" className="underline-offset-4 hover:underline" style={text.accent}>
                        Review on offers board
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 py-2.5" style={text.body}>
                    <span>Self-Organize</span>
                    <span className="text-[12px]" style={text.faint}>
                      One entry point, here only · {NOT_WIRED}
                    </span>
                  </div>
                </div>
              )}

              {isFounder && <OperationsTools />}
            </LayerCard>
          )}
        </div>

        <p className="mt-5 text-[11px]" style={text.faint}>
          One source: private ledger and canvas. “—” means {NOT_WIRED}.
        </p>
      </div>
    </main>
  );
}
