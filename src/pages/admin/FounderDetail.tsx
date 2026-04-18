import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminGate } from "./AdminGate";
import { useFounderStates, type FounderState } from "./useFounderStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import BackButton from "@/components/BackButton";

// Built via Vite so we can probe whether a founder's canvas file ships with
// the bundle. `import.meta.glob` is evaluated at build time; the returned
// object's keys are the matching paths. If a canvas file lands later, a
// redeploy picks it up.
const CANVAS_FILES = import.meta.glob(
  "/docs/02-strategy/unique-businesses/*_unique_business.md",
  { query: "?url", import: "default", eager: true },
) as Record<string, string>;

function canvasPathFor(slug: string): string | null {
  const key = Object.keys(CANVAS_FILES).find((k) =>
    k.endsWith(`/${slug}s_unique_business.md`) ||
    k.endsWith(`/${slug}_unique_business.md`),
  );
  return key ?? null;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function FounderDetail() {
  return (
    <AdminGate>
      <FounderDetailInner />
    </AdminGate>
  );
}

function FounderDetailInner() {
  const { slug = "" } = useParams();
  const { loading, error, founders } = useFounderStates();

  const founder: FounderState | undefined = useMemo(
    () => founders.find((f) => f.slug === slug),
    [founders, slug],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PremiumLoader />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen px-4 py-8">
        <p className="text-sm text-red-400">Error: {error}</p>
      </div>
    );
  }
  if (!founder) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <BackButton />
          <p className="mt-6 text-sm text-white/60">
            No founder with slug <code>{slug}</code>.
          </p>
          <Link to="/founders">
            <Button variant="outline" size="sm" className="mt-4">
              Back to founders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canvasPath = canvasPathFor(slug);

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <Link to="/founders">
            <Button variant="outline" size="sm">
              All founders
            </Button>
          </Link>
        </div>

        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            {founder.display_name}
          </h1>
          <p className="text-sm text-white/60">{founder.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">Step {founder.current_step}</Badge>
            <Badge variant="outline">{founder.onboarding_stage}</Badge>
            {founder.has_ignition && <Badge variant="secondary">Ignition ✓</Badge>}
            {founder.has_build && <Badge variant="default">Build ✓</Badge>}
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="liquid-glass ring-1 ring-white/10">
            <CardHeader>
              <CardTitle className="text-base">Latest ZoG snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-white/80">
                {founder.latest_zog_top_talent ?? "No snapshot yet."}
              </p>
              <p className="text-xs text-white/50">
                {fmtDate(founder.latest_zog_snapshot_at)}
              </p>
            </CardContent>
          </Card>

          <Card className="liquid-glass ring-1 ring-white/10">
            <CardHeader>
              <CardTitle className="text-base">Latest QoL snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              {founder.latest_qol_snapshot_at ? (
                <p className="text-xs text-white/60">
                  Snapshot on {fmtDate(founder.latest_qol_snapshot_at)}
                </p>
              ) : (
                <p className="text-xs text-white/60">No QoL snapshot yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="liquid-glass ring-1 ring-white/10">
            <CardHeader>
              <CardTitle className="text-base">Container flags</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-white/80 space-y-1">
              <div>
                Ignition:{" "}
                <span className="text-white/60">
                  {founder.has_ignition ? "✓ delivered" : "—"}
                </span>
              </div>
              <div>
                Build:{" "}
                <span className="text-white/60">
                  {founder.has_build ? "✓ delivered" : "—"}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/40">
                Flags derive from <code>onboarding_stage</code>, not Stripe.
              </p>
            </CardContent>
          </Card>

          <Card className="liquid-glass ring-1 ring-white/10">
            <CardHeader>
              <CardTitle className="text-base">Revenue timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm text-white/80">
              <div>
                Total: <span className="tabular-nums">${Number(founder.revenue_total_usd).toFixed(2)}</span>
              </div>
              <p className="text-xs text-white/40">
                Stripe ledger not yet persisted in DB — see migration TODO.
              </p>
            </CardContent>
          </Card>

          {canvasPath && (
            <Card className="liquid-glass ring-1 ring-white/10 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Canvas file</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <code className="text-white/70">{canvasPath}</code>
                <p className="mt-2 text-xs text-white/40">
                  Open in your editor — the corpus stays in markdown for v1.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="liquid-glass ring-1 ring-white/10 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Next action</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-white/60">
              Not wired yet. The directive engine (Phase 5) will populate this.
            </CardContent>
          </Card>
        </div>

        <p className="text-xs text-white/40">
          Last touch: {fmtDate(founder.last_touch_at)}
        </p>
      </div>
    </div>
  );
}
