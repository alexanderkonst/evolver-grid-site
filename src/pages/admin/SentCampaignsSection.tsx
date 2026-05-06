/**
 * SentCampaignsSection — Day 62 (Sasha 2026-05-05) Wave 2.
 *
 * Read-only audit log of bulk emails sent via admin-send-bulk-email.
 * Reads from email_send_log filtered to template_name='admin_bulk',
 * groups rows by metadata.campaign_id, summarizes per campaign.
 *
 * Admin RLS is granted via migration 20260505000001_admin_email_send_log_read.
 *
 * What you see:
 *   • Subject (from metadata.subject of the first row)
 *   • Sent / suppressed / failed counts
 *   • Sent at (most recent row in the campaign)
 *   • "Show recipients" expander — list of all recipient emails + status
 *
 * Limitations (v1):
 *   • Open / click tracking not wired (Resend webhooks → email_send_log
 *     is a separate piece).
 *   • Pagination not implemented; loads last 100 rows from the log.
 *     If campaign volume grows past that, swap in a server-side aggregate
 *     query.
 */

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type LogRow = {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: "pending" | "sent" | "suppressed" | "failed" | "bounced" | "complained" | "dlq";
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type Campaign = {
  campaign_id: string;
  subject: string;
  total: number;
  sent: number;
  suppressed: number;
  failed: number;
  first_sent_at: string;
  rows: LogRow[];
};

const cardSurface: React.CSSProperties = {
  background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
  border: "0.5px solid rgba(212, 175, 55, 0.45)",
  boxShadow:
    "0 0 22px -8px rgba(212, 175, 55, 0.25), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  fontSize: "22px",
  letterSpacing: "-0.005em",
  color: "var(--skin-text-primary, #0b2a5a)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "11px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
};

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return iso;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function SentCampaignsSection({
  refreshKey,
}: {
  /** Bumping this forces a reload — the composer increments after a send. */
  refreshKey: number;
}) {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await (supabase as any)
        .from("email_send_log")
        .select("*")
        .eq("template_name", "admin_bulk")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      setRows((data ?? []) as LogRow[]);
    } catch (e: any) {
      setError(e?.message || "Couldn't load campaigns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  const campaigns = useMemo(() => groupByCampaign(rows), [rows]);

  return (
    <section className="rounded-2xl px-6 py-6" style={cardSurface}>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 style={sectionTitle}>Sent campaigns</h2>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
          style={{
            ...labelStyle,
            color: "var(--skin-accent-gold, #b8860b)",
          }}
          title="Reload"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Refresh
        </button>
      </div>
      <p
        className="italic"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "13.5px",
          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
          marginBottom: "16px",
        }}
      >
        Bulk emails sent through the segment composer. Suppressed = recipient was on the opt-out list. Failed = Resend returned an error.
      </p>

      {error ? (
        <p
          className="italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            color: "rgba(140, 60, 60, 0.85)",
          }}
        >
          {error}
        </p>
      ) : campaigns.length === 0 && !loading ? (
        <p
          className="italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
          }}
        >
          No campaigns yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {campaigns.map((c) => {
            const isOpen = expanded.has(c.campaign_id);
            return (
              <li
                key={c.campaign_id}
                className="rounded-xl px-4 py-3"
                style={{
                  background: "rgba(255, 255, 255, 0.55)",
                  border:
                    "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
                }}
              >
                <button
                  onClick={() => {
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.campaign_id)) next.delete(c.campaign_id);
                      else next.add(c.campaign_id);
                      return next;
                    });
                  }}
                  className="w-full text-left"
                >
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex items-baseline gap-2 flex-1">
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span
                        className="truncate"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontWeight: 600,
                          fontSize: "16px",
                          color: "var(--skin-text-primary, #0b2a5a)",
                        }}
                      >
                        {c.subject || "(no subject)"}
                      </span>
                    </div>
                    <div
                      className="flex items-baseline gap-3 flex-shrink-0"
                      style={{
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        fontSize: "12px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      <span style={{ color: "rgba(20, 130, 70, 0.95)" }}>
                        {c.sent} sent
                      </span>
                      {c.suppressed > 0 && (
                        <span style={{ color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))" }}>
                          {c.suppressed} suppressed
                        </span>
                      )}
                      {c.failed > 0 && (
                        <span style={{ color: "rgba(184, 92, 11, 0.95)" }}>
                          {c.failed} failed
                        </span>
                      )}
                      <span style={{ color: "var(--skin-text-muted, rgba(11, 42, 90, 0.50))" }}>
                        {relTime(c.first_sent_at)}
                      </span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="mt-3 space-y-1 max-h-[240px] overflow-y-auto pr-1">
                    {c.rows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-baseline justify-between gap-2 py-1 px-2 rounded"
                        style={{
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontSize: "12px",
                        }}
                      >
                        <span
                          className="truncate"
                          style={{
                            color: "var(--skin-text-primary, #0b2a5a)",
                          }}
                        >
                          {row.recipient_email}
                        </span>
                        <span
                          className="flex-shrink-0"
                          style={{
                            color:
                              row.status === "sent"
                                ? "rgba(20, 130, 70, 0.95)"
                                : row.status === "suppressed"
                                ? "var(--skin-text-muted, rgba(11, 42, 90, 0.55))"
                                : "rgba(184, 92, 11, 0.95)",
                            fontSize: "11px",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                          title={row.error_message ?? undefined}
                        >
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function groupByCampaign(rows: LogRow[]): Campaign[] {
  const map = new Map<string, Campaign>();
  for (const row of rows) {
    const meta = (row.metadata ?? {}) as { campaign_id?: string; subject?: string };
    const campaignId = meta.campaign_id || "_no_campaign";
    if (!map.has(campaignId)) {
      map.set(campaignId, {
        campaign_id: campaignId,
        subject: meta.subject ?? "",
        total: 0,
        sent: 0,
        suppressed: 0,
        failed: 0,
        first_sent_at: row.created_at,
        rows: [],
      });
    }
    const c = map.get(campaignId)!;
    c.rows.push(row);
    c.total += 1;
    if (row.status === "sent") c.sent += 1;
    else if (row.status === "suppressed") c.suppressed += 1;
    else c.failed += 1;
    // Keep most-recent created_at as the campaign's "first_sent_at"
    // (rows are already sorted DESC, so the first row visited is newest).
    if (new Date(row.created_at).getTime() > new Date(c.first_sent_at).getTime()) {
      c.first_sent_at = row.created_at;
    }
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.first_sent_at).getTime() - new Date(a.first_sent_at).getTime(),
  );
}
