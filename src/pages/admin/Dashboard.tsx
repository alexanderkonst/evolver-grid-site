import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AdminGate } from "./AdminGate";
import { useFounderStates, type FounderState } from "./useFounderStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import BackButton from "@/components/BackButton";
// CRM snapshot is generated at build time by scripts/emit-crm-snapshot.mjs
// (npm prebuild hook), which uses scripts/sources/broadcast-tracker.mjs —
// the canonical parser. The UI never reimplements the parser (hard
// constraint from the Phase-1 brief).
import crmSnapshot from "@/generated/crm-snapshot.json";

type CrmSnapshot = {
  generated_at: string;
  version: string | null;
  contactsCount: number;
  stageDistribution: Record<string, number>;
  segmentDistribution: Record<string, number>;
  energyLeakCount: number;
  cashReceivedUsd: number | null;
  revShareContractsUsd: number | null;
  upcomingEvents: Array<{
    date: string;
    event: string;
    participants?: string;
    notes?: string;
  }>;
  openItemsCount: number;
  error?: string;
};

const crm = crmSnapshot as unknown as CrmSnapshot;

const DAY_MS = 24 * 60 * 60 * 1000;

function aggregate(founders: FounderState[]) {
  const now = Date.now();
  const stepDist = Array.from({ length: 7 }, (_, i) => ({
    step: `Step ${i + 1}`,
    n: 0,
  }));
  let revenueTotal = 0;
  let newLast7d = 0;
  const ignitionNoBuild: FounderState[] = [];
  const stale14d: FounderState[] = [];

  for (const f of founders) {
    const step = Math.max(1, Math.min(7, f.current_step));
    stepDist[step - 1].n += 1;
    revenueTotal += Number(f.revenue_total_usd) || 0;

    // "new" ≈ last_touch_at inside 7d; the view's last_touch_at includes
    // the profile's updated_at, so for the cold-start case it tracks the
    // first write. Good enough for v1.
    if (now - new Date(f.last_touch_at).getTime() < 7 * DAY_MS) {
      newLast7d += 1;
    }
    if (f.has_ignition && !f.has_build) {
      ignitionNoBuild.push(f);
    }
    if (now - new Date(f.last_touch_at).getTime() > 14 * DAY_MS) {
      stale14d.push(f);
    }
  }

  return { stepDist, revenueTotal, newLast7d, ignitionNoBuild, stale14d };
}

export default function Dashboard() {
  return (
    <AdminGate>
      <DashboardInner />
    </AdminGate>
  );
}

function DashboardInner() {
  const { loading, error, founders } = useFounderStates();
  const agg = useMemo(() => aggregate(founders), [founders]);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <Link to="/founders">
            <Button variant="outline" size="sm">
              Founders list
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/60">
            Roll-up of <code>founder_state_v1</code>. Revenue will become real
            once a Stripe ledger lands in DB.
          </p>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <PremiumLoader />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400">Error: {error}</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Metric label="Total founders" value={`${founders.length}`} />
              <Metric
                label="New (7d)"
                value={`${agg.newLast7d}`}
                sub="by last_touch_at"
              />
              <Metric
                label="Revenue (CRM)"
                value={
                  crm.cashReceivedUsd != null
                    ? `$${crm.cashReceivedUsd.toLocaleString()}`
                    : "—"
                }
                sub={
                  crm.revShareContractsUsd != null
                    ? `+$${crm.revShareContractsUsd.toLocaleString()} rev share`
                    : "cash received"
                }
              />
              <Metric
                label="Stale (14d+)"
                value={`${agg.stale14d.length}`}
                sub="no touch in 14 days"
              />
            </div>

            <Card className="liquid-glass ring-1 ring-white/10">
              <CardHeader>
                <CardTitle className="text-base">Founders per step</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agg.stepDist}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="step" stroke="rgba(255,255,255,0.5)" />
                    <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(20,20,24,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                      }}
                    />
                    <Bar dataKey="n" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <ActionList
                title="Ignition done, Build pending"
                empty="Nobody in this slice."
                items={agg.ignitionNoBuild}
              />
              <ActionList
                title="Stale — no touch in 14+ days"
                empty="No stale founders."
                items={agg.stale14d}
              />
            </div>

            <CrmOverlay />
          </>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <Card className="liquid-glass ring-1 ring-white/10">
      <CardContent className="py-4">
        <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function CrmOverlay() {
  const stageRows = Object.entries(crm.stageDistribution).sort(
    (a, b) => b[1] - a[1],
  );
  const segRows = Object.entries(crm.segmentDistribution).sort(
    (a, b) => b[1] - a[1],
  );
  const generated = new Date(crm.generated_at).toLocaleString();

  return (
    <Card className="liquid-glass ring-1 ring-white/10">
      <CardHeader>
        <CardTitle className="text-base">
          CRM snapshot{" "}
          <span className="text-xs text-white/50">
            {crm.version ? `(${crm.version})` : ""} · {crm.contactsCount} contacts
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {crm.error ? (
          <p className="text-xs text-red-400">
            Parser error at build time: {crm.error}. Run{" "}
            <code>npm run crm:snapshot</code>.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">
              Pipeline by stage
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-white/80">
              {stageRows.slice(0, 8).map(([stage, n]) => (
                <li key={stage} className="flex justify-between">
                  <span>{stage}</span>
                  <span className="tabular-nums text-white/60">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">
              By segment
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-white/80">
              {segRows.slice(0, 8).map(([seg, n]) => (
                <li key={seg} className="flex justify-between">
                  <span>{seg}</span>
                  <span className="tabular-nums text-white/60">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">
              Signals
            </p>
            <ul className="mt-1 space-y-0.5 text-xs text-white/80">
              <li className="flex justify-between">
                <span>Energy leaks</span>
                <span className="tabular-nums text-white/60">
                  {crm.energyLeakCount}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Open items</span>
                <span className="tabular-nums text-white/60">
                  {crm.openItemsCount}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Upcoming events</span>
                <span className="tabular-nums text-white/60">
                  {crm.upcomingEvents.length}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {crm.upcomingEvents.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50 mb-1">
              Upcoming
            </p>
            <ul className="space-y-1 text-xs text-white/80">
              {crm.upcomingEvents.map((e, i) => (
                <li key={i}>
                  <span className="text-white/60">{e.date}</span> — {e.event}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-[10px] text-white/40">
          Snapshot from <code>docs/09-logs/broadcast_tracker.md</code>,
          generated {generated}. Refresh with{" "}
          <code>npm run crm:snapshot</code>.
        </p>
      </CardContent>
    </Card>
  );
}

function ActionList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: FounderState[];
}) {
  return (
    <Card className="liquid-glass ring-1 ring-white/10">
      <CardHeader>
        <CardTitle className="text-base">
          {title} <span className="text-xs text-white/50">({items.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-white/60">{empty}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {items.slice(0, 10).map((f) => (
              <li key={f.user_id} className="flex justify-between">
                <Link
                  to={`/founders/${f.slug}`}
                  className="hover:underline"
                >
                  {f.display_name}
                </Link>
                <span className="text-white/50 text-xs">{f.email}</span>
              </li>
            ))}
            {items.length > 10 && (
              <li className="text-xs text-white/40">
                …and {items.length - 10} more
              </li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
