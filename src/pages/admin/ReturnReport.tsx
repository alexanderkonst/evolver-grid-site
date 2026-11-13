import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import BackButton from "@/components/BackButton";
import { computeReturnReport, type ReportEvent, type ReturnReport } from "@/lib/returnReport";

/**
 * /admin/return-report — read-only readout of return metric v0 (#287, #328): players who saw
 * the top-talent reveal, how many came back on another calendar day, and the share.
 * Reads public.funnel_events (authenticated SELECT). No writes, no migration.
 * Definitions and blind spots: docs/specs/metrics/README.md.
 */

const PAGE = 1000; // PostgREST returns at most 1000 rows per request.
const MAX_PAGES = 50; // 50 000 rows per query: a guard, not an expected limit.

interface Loaded {
  report: ReturnReport;
  truncated: boolean;
}

// The generated types do not carry metadata paths, so the table is read untyped (as funnelAnalytics does).
type Query = (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>;

async function readAll(query: Query): Promise<{ rows: unknown[]; truncated: boolean }> {
  const rows: unknown[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error } = await query(page * PAGE, page * PAGE + PAGE - 1);
    if (error) throw new Error(error.message);
    const batch = data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE) return { rows, truncated: false };
  }
  return { rows, truncated: true };
}

async function load(): Promise<Loaded> {
  const table = () => (supabase as any).from("funnel_events");

  const [events, links] = await Promise.all([
    readAll((from, to) =>
      table()
        .select("step, metadata, timestamp")
        .in("step", ["reveal_seen", "game_open"])
        .order("timestamp", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to),
    ),
    // Any other event signed in on a device ties that device to the account.
    readAll((from, to) =>
      table()
        .select("metadata")
        .not("metadata->>user_id", "is", null)
        .order("id", { ascending: true })
        .range(from, to),
    ),
  ]);

  return {
    report: computeReturnReport(
      events.rows as ReportEvent[],
      (links.rows as { metadata: unknown }[]).map((r) => r.metadata),
    ),
    truncated: events.truncated || links.truncated,
  };
}

const pct = (v: number | null) => (v === null ? "—" : `${v.toLocaleString("ru-RU")}%`);

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-4">
      <div className="text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function ReturnReportPage() {
  const [state, setState] = useState<
    { status: "loading" } | { status: "error"; message: string } | ({ status: "ready" } & Loaded)
  >({ status: "loading" });

  useEffect(() => {
    let live = true;
    load()
      .then((loaded) => live && setState({ status: "ready", ...loaded }))
      .catch((err) =>
        live &&
        setState({ status: "error", message: err instanceof Error ? err.message : "Не удалось прочитать данные" }),
      );
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background p-6 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <BackButton />
        <div>
          <h1 className="text-3xl font-bold">Возврат игроков</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Раскрыли талант и вернулись в игру в другой календарный день. Считаются люди, не визиты; анонимный id и
            аккаунт одного человека считаются одним игроком, если они связаны в событиях.
          </p>
        </div>

        {state.status === "loading" && (
          <div className="flex justify-center py-12">
            <PremiumLoader />
          </div>
        )}

        {state.status === "error" && (
          <Card>
            <CardContent className="pt-6 text-sm text-destructive">
              Не удалось прочитать funnel_events: {state.message}
            </CardContent>
          </Card>
        )}

        {state.status === "ready" && state.report.total.revealed === 0 && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Данных пока нет: ни одного события <span className="font-mono">reveal_seen</span>.
            </CardContent>
          </Card>
        )}

        {state.status === "ready" && state.report.total.revealed > 0 && (
          <>
            {state.truncated && (
              <div className="rounded-lg border border-destructive p-3 text-sm text-destructive">
                Прочитана только часть событий (лимит страниц). Цифры занижены.
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>За всё время</CardTitle>
                <CardDescription>Возврат считается от первого раскрытия игрока.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Figure label="Раскрыли талант" value={String(state.report.total.revealed)} />
                  <Figure label="Вернулись в другой день" value={String(state.report.total.returned)} />
                  <Figure label="Доля вернувшихся" value={pct(state.report.total.ratePct)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>По дням</CardTitle>
                <CardDescription>День первого раскрытия (локальный день игрока), новые сверху.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>День</TableHead>
                      <TableHead className="text-right">Раскрыли</TableHead>
                      <TableHead className="text-right">Вернулись</TableHead>
                      <TableHead className="text-right">Доля</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...state.report.days].reverse().map((d) => (
                      <TableRow key={d.day}>
                        <TableCell className="font-mono">{d.day}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.revealed}</TableCell>
                        <TableCell className="text-right tabular-nums">{d.returned}</TableCell>
                        <TableCell className="text-right tabular-nums">{pct(d.ratePct)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
