import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminGate } from "./AdminGate";
import { useFounderStates, type FounderState } from "./useFounderStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import BackButton from "@/components/BackButton";

type SortKey = "last_touch_at" | "current_step" | "revenue_total_usd";

function relative(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return "—";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function StepBar({ step }: { step: number }) {
  const clamped = Math.max(1, Math.min(7, step));
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-3 rounded-sm ${
              i < clamped ? "bg-primary" : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-white/60">Step {clamped}</span>
    </div>
  );
}

function truncate(s: string | null, n = 72): string {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function FoundersIndex() {
  return (
    <AdminGate>
      <FoundersIndexInner />
    </AdminGate>
  );
}

function FoundersIndexInner() {
  const { loading, error, founders } = useFounderStates();
  const [sortKey, setSortKey] = useState<SortKey>("last_touch_at");

  const sorted = useMemo(() => {
    const copy = [...founders];
    copy.sort((a, b) => {
      if (sortKey === "last_touch_at") {
        return (
          new Date(b.last_touch_at).getTime() -
          new Date(a.last_touch_at).getTime()
        );
      }
      if (sortKey === "current_step") {
        return b.current_step - a.current_step;
      }
      return Number(b.revenue_total_usd) - Number(a.revenue_total_usd);
    });
    return copy;
  }, [founders, sortKey]);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex gap-2">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Founders</h1>
          <p className="text-sm text-white/60">
            One row per user. Source: <code>founder_state_v1</code>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/50">Sort:</span>
          {(
            [
              ["last_touch_at", "Last touch"],
              ["current_step", "Step"],
              ["revenue_total_usd", "Revenue"],
            ] as Array<[SortKey, string]>
          ).map(([k, label]) => (
            <Button
              key={k}
              size="sm"
              variant={sortKey === k ? "default" : "outline"}
              onClick={() => setSortKey(k)}
            >
              {label}
            </Button>
          ))}
        </div>

        <Card className="liquid-glass ring-1 ring-white/10">
          <CardHeader>
            <CardTitle>
              {loading ? "Loading…" : `${sorted.length} founders`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 flex justify-center">
                <PremiumLoader />
              </div>
            ) : error ? (
              <p className="text-sm text-red-400">Error: {error}</p>
            ) : sorted.length === 0 ? (
              <p className="text-sm text-white/60">No founders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Step</TableHead>
                    <TableHead>Latest ZoG</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Last touch</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((f) => (
                    <FounderRow key={f.user_id} founder={f} />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FounderRow({ founder: f }: { founder: FounderState }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{f.display_name}</span>
          <span className="text-xs text-white/50">{f.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <StepBar step={f.current_step} />
        <div className="mt-1 flex gap-1">
          {f.has_ignition && (
            <Badge variant="secondary" className="text-[10px]">
              Ignition
            </Badge>
          )}
          {f.has_build && (
            <Badge variant="default" className="text-[10px]">
              Build
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-[260px] text-sm text-white/80">
        {truncate(f.latest_zog_top_talent)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        ${Number(f.revenue_total_usd).toFixed(0)}
      </TableCell>
      <TableCell className="text-right text-sm text-white/60">
        {relative(f.last_touch_at)}
      </TableCell>
      <TableCell className="text-right">
        <Link to={`/founders/${f.slug}`}>
          <Button size="sm" variant="outline">
            Open
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}
