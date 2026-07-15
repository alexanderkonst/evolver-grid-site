import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CircleDollarSign,
  Gift,
  Handshake,
  Send,
} from "lucide-react";
import outreachTrackerRaw from "../../docs/02-strategy/outreach_tracker.csv?raw";
import {
  calculateOffersBoardMetrics,
  getOfferKey,
  parseOutreachCsv,
  type OfferTypeCounts,
  type OutreachOffer,
} from "@/lib/offersBoard";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatDate = (value: string) => {
  if (!value) return "Not scheduled";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(year, month - 1, day),
  );
};

const typeMeta = {
  paid: { label: "Paid", icon: CircleDollarSign },
  free: { label: "Free", icon: Gift },
  partnership: { label: "Partnership", icon: Handshake },
} as const;

function WeekBreakdown({ counts }: { counts: OfferTypeCounts & { total: number } }) {
  return (
    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#9ea7b3]">
      {Object.entries(typeMeta).map(([type, meta]) => (
        <span key={type} className="inline-flex items-center gap-1.5">
          <meta.icon className="h-3.5 w-3.5" />
          {meta.label} {counts[type as keyof OfferTypeCounts]}
        </span>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: OutreachOffer["status"] }) {
  return (
    <span className="inline-flex rounded-full border border-[#d6a84d]/25 bg-[#15100a] px-2.5 py-1 text-[11px] font-medium capitalize text-[#f6d58a]">
      {status}
    </span>
  );
}

export default function CockpitOffersBoard() {
  const board = useMemo(() => {
    try {
      const offers = parseOutreachCsv(outreachTrackerRaw);
      return { offers, metrics: calculateOffersBoardMetrics(offers), error: null };
    } catch (error) {
      return {
        offers: [] as OutreachOffer[],
        metrics: calculateOffersBoardMetrics([]),
        error: error instanceof Error ? error.message : "The outreach tracker could not be read.",
      };
    }
  }, []);

  const isOverdue = (offer: OutreachOffer) => board.metrics.overdueOfferKeys.has(getOfferKey(offer));

  return (
    <main className="min-h-screen bg-[#07090d] text-[#f6efe3]">
      <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-5 flex flex-col gap-4 border-b border-[#d6a84d]/20 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <Link
              to="/build/cockpit/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d] transition hover:text-[#f6d58a]"
            >
              <ArrowLeft className="h-4 w-4" />
              Founder Cockpit
            </Link>
            <h1 className="font-serif text-4xl leading-none text-[#fff7e8] md:text-6xl">Offers in the field.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#cfc4b5]">
              What is out, who has it, what is waiting, and where the next human move is due.
            </p>
          </div>
          <p className="w-fit border-l-2 border-[#d6a84d] pl-3 text-sm leading-6 text-[#9ea7b3]">
            Source: outreach_tracker.csv
            <br />
            Refreshes on deploy
          </p>
        </header>

        {board.error && (
          <section className="mb-5 border border-[#f0a37a]/45 bg-[#24100d] p-4 text-sm text-[#ffc0a5]">
            <p className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" /> Tracker needs attention
            </p>
            <p className="mt-2">{board.error}</p>
          </section>
        )}

        <section aria-label="Offer metrics" className="mb-5 grid gap-px overflow-hidden border border-[#d6a84d]/25 bg-[#d6a84d]/20 sm:grid-cols-2 xl:grid-cols-3">
          <article className="bg-[#0d1117] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#d6a84d]">Offers sent this week</p>
            <p className="mt-2 text-5xl font-semibold text-[#fff7e8]">{board.metrics.thisWeek.total}</p>
            <WeekBreakdown counts={board.metrics.thisWeek} />
          </article>
          <article className="bg-[#0d1117] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[#9ea7b3]">Offers sent last week</p>
            <p className="mt-2 text-5xl font-semibold text-[#cfc4b5]">{board.metrics.lastWeek.total}</p>
            <WeekBreakdown counts={board.metrics.lastWeek} />
          </article>
          <article className="bg-[#0d1117] p-5 sm:col-span-2 xl:col-span-1">
            <p className="text-xs uppercase tracking-[0.16em] text-[#93f0e8]">Total pending</p>
            <p className="mt-2 text-5xl font-semibold text-[#93f0e8]">
              {currency.format(board.metrics.pendingAmountUsd)}
            </p>
            <p className="mt-3 text-xs text-[#9ea7b3]">Waiting offers only</p>
          </article>
        </section>

        <section className="mb-5 border border-[#f0a37a]/30 bg-[#140d0a] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#ffc0a5]">
              <CalendarClock className="h-4 w-4" /> Follow-ups due today or overdue
            </p>
            <span className="text-sm text-[#cfc4b5]">{board.metrics.followupsDue.length} due</span>
          </div>
          {board.metrics.followupsDue.length === 0 ? (
            <p className="text-sm leading-6 text-[#9ea7b3]">No follow-ups are due. The field is clear.</p>
          ) : (
            <ul className="divide-y divide-white/10">
              {board.metrics.followupsDue.map((offer) => (
                <li key={getOfferKey(offer)} className="grid gap-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-medium text-[#fff7e8]">{offer.name}</p>
                    <p className="mt-1 text-sm text-[#cfc4b5]">{offer.segmentOrCampaign || typeMeta[offer.offerType].label}</p>
                  </div>
                  <p className={isOverdue(offer) ? "text-sm font-medium text-[#ffc0a5]" : "text-sm text-[#f6d58a]"}>
                    {isOverdue(offer) ? "Overdue" : "Due today"} · {formatDate(offer.nextFollowupDate)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-[#d6a84d]/25 bg-[#0d1117]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d6a84d]">
              <Send className="h-4 w-4" /> Waiting board
            </p>
            <span className="text-sm text-[#9ea7b3]">{board.metrics.waitingOffers.length} open</span>
          </div>

          {board.metrics.waitingOffers.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-serif text-2xl text-[#fff7e8]">No offers are waiting.</p>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#9ea7b3]">
                Add the next offer to docs/02-strategy/outreach_tracker.csv, commit, and deploy. It will appear here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[820px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-[#9ea7b3]">
                      <th className="px-5 py-3 font-medium">Who</th>
                      <th className="px-5 py-3 font-medium">Offer</th>
                      <th className="px-5 py-3 font-medium">$</th>
                      <th className="px-5 py-3 font-medium">Sent</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium">Next follow-up</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {board.metrics.waitingOffers.map((offer) => (
                      <tr key={getOfferKey(offer)} className={isOverdue(offer) ? "bg-[#3a1712]/55" : "bg-[#0d1117]"}>
                        <td className="px-5 py-4 font-medium text-[#fff7e8]">{offer.name}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-[#f6efe3]">{offer.segmentOrCampaign || typeMeta[offer.offerType].label}</p>
                          <p className="mt-1 text-xs capitalize text-[#9ea7b3]">{offer.offerType}{offer.channel ? ` · ${offer.channel}` : ""}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#cfc4b5]">{offer.amountUsd ? currency.format(offer.amountUsd) : "—"}</td>
                        <td className="px-5 py-4 text-sm text-[#cfc4b5]">{formatDate(offer.dateSent)}</td>
                        <td className="px-5 py-4"><StatusPill status={offer.status} /></td>
                        <td className={`px-5 py-4 text-sm ${isOverdue(offer) ? "font-medium text-[#ffc0a5]" : "text-[#cfc4b5]"}`}>
                          {formatDate(offer.nextFollowupDate)}{isOverdue(offer) ? " · overdue" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-white/10 md:hidden">
                {board.metrics.waitingOffers.map((offer) => (
                  <article key={getOfferKey(offer)} className={`p-5 ${isOverdue(offer) ? "bg-[#3a1712]/55" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-medium text-[#fff7e8]">{offer.name}</h2>
                        <p className="mt-1 text-sm text-[#cfc4b5]">{offer.segmentOrCampaign || typeMeta[offer.offerType].label}</p>
                      </div>
                      <StatusPill status={offer.status} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div><dt className="text-xs text-[#9ea7b3]">Amount</dt><dd className="mt-1 text-[#f6efe3]">{offer.amountUsd ? currency.format(offer.amountUsd) : "—"}</dd></div>
                      <div><dt className="text-xs text-[#9ea7b3]">Sent</dt><dd className="mt-1 text-[#f6efe3]">{formatDate(offer.dateSent)}</dd></div>
                      <div className="col-span-2"><dt className="text-xs text-[#9ea7b3]">Next follow-up</dt><dd className={`mt-1 ${isOverdue(offer) ? "font-medium text-[#ffc0a5]" : "text-[#f6efe3]"}`}>{formatDate(offer.nextFollowupDate)}{isOverdue(offer) ? " · overdue" : ""}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
