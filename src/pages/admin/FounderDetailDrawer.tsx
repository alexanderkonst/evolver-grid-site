/**
 * FounderDetailDrawer — Day 62 (Sasha 2026-05-05) Wave 1b.
 *
 * Per-founder deep-dive surface that slides in from the right when an
 * operator clicks a row in /admin's Recent Founders table. Lives inside
 * /admin so we never touch /founders/:slug (out of scope per Sasha
 * 2026-05-05).
 *
 * What it shows:
 *   1. Header — name, email, joined date, archetype if present
 *   2. Top Talent block — resonance rating, archetype, raw appleseed
 *      JSON viewer (collapsible — for inspection / debugging)
 *   3. Lifecycle block — onboarding stage, current step, has_paid,
 *      days_to_first_paid, has_ignition / has_build flags
 *   4. Nurture block — status pill, per-email-type rows (day1, day2,
 *      day8) with sent_at / scheduled_for / status
 *   5. Action row — Send link (existing edge fn) · Copy email · close
 *
 * Data flow: takes a FounderState (from /admin's useFounderStates) plus
 * lazy-loads the rich extras (zog_snapshot row, nurture queue rows) via
 * a one-shot fetch on open. No N+1 — only fetches when the drawer is
 * actually opened.
 */

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, ChevronDown, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { FounderState } from "./useFounderStates";

// ─────────────────────────────────────────────────────────────────────
// Types — narrow shapes for the lazy-loaded extras
// ─────────────────────────────────────────────────────────────────────

type ZogSnapshotRow = {
  id: string;
  profile_id: string;
  archetype_title: string;
  core_pattern: string;
  resonance_rating: number | null;
  appleseed_data: unknown;
  created_at: string;
};

type NurtureRow = {
  id: string;
  email_type: "day1" | "day2" | "day8";
  scheduled_for: string;
  sent_at: string | null;
  status: "pending" | "sent" | "failed" | "cancelled";
  attempts: number;
  last_error: string | null;
};

type DeepData = {
  loading: boolean;
  error: string | null;
  zogSnapshot: ZogSnapshotRow | null;
  nurtureRows: NurtureRow[];
};

// ─────────────────────────────────────────────────────────────────────
// Style helpers (Aurora register — match Admin.tsx)
// ─────────────────────────────────────────────────────────────────────

const blockTitle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  fontSize: "13px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "var(--skin-accent-gold, #b8860b)",
  marginBottom: "10px",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "10.5px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
};

const valueStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "13.5px",
  color: "var(--skin-text-primary, #0b2a5a)",
  fontVariantNumeric: "tabular-nums lining-nums",
};

const proseStyle: React.CSSProperties = {
  fontFamily: "'Source Serif 4', serif",
  fontSize: "14px",
  lineHeight: 1.55,
  color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
};

const cardSurface: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.55)",
  border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.10))",
  borderRadius: "12px",
};

const ceremonialPill: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "11px",
  background: "rgba(255, 255, 255, 0.72)",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
  boxShadow: "0 0 12px -4px rgba(212, 175, 55, 0.25)",
  color: "var(--skin-text-primary, #0b2a5a)",
};

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function fmtRelative(iso: string | null): string {
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

const NURTURE_TYPE_LABEL: Record<string, string> = {
  day1: "Day 1 — deeper layer + activation CTA",
  day2: "Day 2 — minimalist check-in",
  day8: "Day 8 — last-reminder CTA",
};

// ─────────────────────────────────────────────────────────────────────
// Lazy data loader
// ─────────────────────────────────────────────────────────────────────

function useDeepData(userId: string | null, isOpen: boolean): DeepData {
  const [state, setState] = useState<DeepData>({
    loading: false,
    error: null,
    zogSnapshot: null,
    nurtureRows: [],
  });

  useEffect(() => {
    if (!isOpen || !userId) return;
    let cancelled = false;

    (async () => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        // Look up profile_id (zog_snapshots and nurture_email_queue both
        // key off it, not user_id).
        const { data: profile } = await (supabase as any)
          .from("game_profiles")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        const profileId = profile?.id ?? null;

        if (!profileId) {
          if (!cancelled) {
            setState({
              loading: false,
              error: null,
              zogSnapshot: null,
              nurtureRows: [],
            });
          }
          return;
        }

        // Fetch latest zog snapshot and all nurture queue rows in
        // parallel — both are profile-scoped, so neither blocks the other.
        const [zogRes, nurtureRes] = await Promise.all([
          (supabase as any)
            .from("zog_snapshots")
            .select(
              "id, profile_id, archetype_title, core_pattern, resonance_rating, appleseed_data, created_at",
            )
            .eq("profile_id", profileId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          (supabase as any)
            .from("nurture_email_queue")
            .select(
              "id, email_type, scheduled_for, sent_at, status, attempts, last_error",
            )
            .eq("profile_id", profileId)
            .order("scheduled_for", { ascending: true }),
        ]);

        if (cancelled) return;

        setState({
          loading: false,
          error: zogRes.error?.message || nurtureRes.error?.message || null,
          zogSnapshot: (zogRes.data as ZogSnapshotRow | null) ?? null,
          nurtureRows: (nurtureRes.data as NurtureRow[]) ?? [],
        });
      } catch (e: any) {
        if (cancelled) return;
        setState({
          loading: false,
          error: e?.message || "Failed to load deep data",
          zogSnapshot: null,
          nurtureRows: [],
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, isOpen]);

  return state;
}

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

export function FounderDetailDrawer({
  founder,
  open,
  onOpenChange,
  onSendMagicLink,
}: {
  founder: FounderState | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called when the operator clicks "Send link" inside the drawer.
   * Mirrors the existing /admin Recent-row Send-link button so the
   * action lives in one place.
   */
  onSendMagicLink: (founder: FounderState) => Promise<void> | void;
}) {
  const userId = founder?.user_id ?? null;
  const data = useDeepData(userId, open);
  const [showRawJson, setShowRawJson] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  // Reset raw-json toggle when switching founders so a previous founder's
  // expanded state doesn't bleed into the next one.
  useEffect(() => {
    setShowRawJson(false);
  }, [userId]);

  const handleCopyEmail = () => {
    if (!founder?.email) return;
    navigator.clipboard.writeText(founder.email);
    toast.success("Email copied.");
  };

  const handleSend = async () => {
    if (!founder) return;
    setSendingLink(true);
    try {
      await onSendMagicLink(founder);
    } finally {
      setSendingLink(false);
    }
  };

  if (!founder) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
        style={{
          background:
            "var(--skin-page-bg, linear-gradient(180deg, rgba(252,248,238,0.98) 0%, rgba(248,242,224,0.98) 100%))",
          borderLeft: "0.5px solid rgba(212, 175, 55, 0.45)",
        }}
      >
        <SheetHeader>
          <SheetTitle
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              fontSize: "26px",
              letterSpacing: "-0.005em",
              color: "var(--skin-text-primary, #0b2a5a)",
              textShadow:
                "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
            }}
          >
            {founder.display_name}
          </SheetTitle>
          <p
            style={{
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontSize: "13px",
              color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
            }}
          >
            {founder.email}
            {" · "}
            <span title="Joined">{fmtDate(founder.joined_at)}</span>
          </p>
          {founder.latest_zog_top_talent && (
            <p
              className="italic mt-1"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "14px",
                color: "var(--skin-accent-gold, #b8860b)",
              }}
            >
              {founder.latest_zog_top_talent}
            </p>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-7 pb-12">
          {data.loading && (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--skin-accent-gold, #b8860b)" }} />
              <span style={{ ...proseStyle, fontStyle: "italic" }}>Loading deep data…</span>
            </div>
          )}
          {data.error && (
            <div
              className="rounded-lg p-3"
              style={{
                background: "rgba(184, 60, 60, 0.06)",
                border: "0.5px solid rgba(184, 60, 60, 0.30)",
              }}
            >
              <p style={{ ...proseStyle, color: "rgba(140, 60, 60, 0.85)" }}>
                {data.error}
              </p>
            </div>
          )}

          {/* ═══════ Top Talent ═══════ */}
          <section>
            <h3 style={blockTitle}>Top Talent</h3>
            <div style={cardSurface} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <div style={labelStyle}>Has TT</div>
                  <div style={valueStyle}>{founder.has_top_talent ? "Yes" : "No"}</div>
                </div>
                <div>
                  <div style={labelStyle}>Resonance</div>
                  <div style={valueStyle}>
                    {founder.top_talent_resonance !== null
                      ? `${founder.top_talent_resonance} / 10`
                      : "Not rated"}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Snapshot at</div>
                  <div style={valueStyle}>
                    {fmtRelative(founder.latest_zog_snapshot_at)}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Archetype</div>
                  <div style={valueStyle}>
                    {founder.latest_zog_top_talent ?? "—"}
                  </div>
                </div>
              </div>

              {data.zogSnapshot?.core_pattern && (
                <div>
                  <div style={labelStyle}>Core pattern</div>
                  <p
                    className="mt-1 whitespace-pre-wrap"
                    style={proseStyle}
                  >
                    {data.zogSnapshot.core_pattern}
                  </p>
                </div>
              )}

              {data.zogSnapshot?.appleseed_data && (
                <div>
                  <button
                    onClick={() => setShowRawJson((v) => !v)}
                    className="inline-flex items-center gap-1.5 mt-1"
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: "11.5px",
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                    }}
                  >
                    {showRawJson ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    Raw appleseed JSON
                  </button>
                  {showRawJson && (
                    <pre
                      className="mt-2 overflow-x-auto rounded-md p-3"
                      style={{
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                        fontSize: "11px",
                        lineHeight: 1.45,
                        background: "rgba(11, 42, 90, 0.06)",
                        color: "var(--skin-text-primary, #0b2a5a)",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      {JSON.stringify(data.zogSnapshot.appleseed_data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ═══════ Lifecycle ═══════ */}
          <section>
            <h3 style={blockTitle}>Lifecycle</h3>
            <div style={cardSurface} className="p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <div style={labelStyle}>Joined</div>
                  <div style={valueStyle}>{fmtRelative(founder.joined_at)}</div>
                </div>
                <div>
                  <div style={labelStyle}>Last touch</div>
                  <div style={valueStyle}>{fmtRelative(founder.last_touch_at)}</div>
                </div>
                <div>
                  <div style={labelStyle}>Onboarding stage</div>
                  <div style={valueStyle}>{founder.onboarding_stage}</div>
                </div>
                <div>
                  <div style={labelStyle}>Current step</div>
                  <div style={valueStyle}>{founder.current_step} / 7</div>
                </div>
                <div>
                  <div style={labelStyle}>Paid</div>
                  <div style={valueStyle}>
                    {founder.has_paid ? (
                      <span style={{ color: "var(--skin-accent-gold, #b8860b)" }}>Yes</span>
                    ) : (
                      "No"
                    )}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Days to first paid</div>
                  <div style={valueStyle}>
                    {founder.days_to_first_paid !== null
                      ? `${founder.days_to_first_paid}d`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div style={labelStyle}>Ignition delivered</div>
                  <div style={valueStyle}>{founder.has_ignition ? "Yes" : "No"}</div>
                </div>
                <div>
                  <div style={labelStyle}>Build delivered</div>
                  <div style={valueStyle}>{founder.has_build ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ Nurture ═══════ */}
          <section>
            <h3 style={blockTitle}>Nurture sequence</h3>
            <div style={cardSurface} className="p-4 space-y-2.5">
              <div>
                <div style={labelStyle}>Status</div>
                <div style={valueStyle}>
                  {founder.nurture_status === "opted_out" ? (
                    <span style={{ color: "rgba(140, 60, 60, 0.85)" }}>
                      Opted out
                    </span>
                  ) : founder.nurture_status === "all_sent" ? (
                    "All 3 sent"
                  ) : founder.nurture_status === "partial" ? (
                    "Partial — some sent, some pending"
                  ) : founder.nurture_status === "queued" ? (
                    "Queued — none sent yet"
                  ) : (
                    "Never queued"
                  )}
                </div>
              </div>

              {data.nurtureRows.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {data.nurtureRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-md px-3 py-2"
                      style={{
                        background: "rgba(255, 255, 255, 0.50)",
                        border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
                      }}
                    >
                      <span
                        style={{
                          ...labelStyle,
                          color: "var(--skin-text-primary, #0b2a5a)",
                        }}
                      >
                        {row.email_type}
                      </span>
                      <span
                        style={{
                          ...valueStyle,
                          fontSize: "12px",
                          color:
                            row.status === "sent"
                              ? "rgba(20, 130, 70, 0.95)"
                              : row.status === "failed"
                              ? "rgba(184, 92, 11, 0.95)"
                              : "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                        }}
                      >
                        {row.status}
                        {row.attempts > 0 && row.status !== "sent" && (
                          <> · {row.attempts} attempts</>
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontSize: "11.5px",
                          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                        }}
                      >
                        {row.sent_at
                          ? `sent ${fmtRelative(row.sent_at)}`
                          : `due ${fmtRelative(row.scheduled_for)}`}
                      </span>
                      <span
                        className="italic"
                        style={{
                          fontFamily: "'Source Serif 4', serif",
                          fontSize: "11.5px",
                          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.50))",
                          width: "100%",
                        }}
                      >
                        {NURTURE_TYPE_LABEL[row.email_type] ?? ""}
                      </span>
                      {row.last_error && (
                        <span
                          style={{
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                            fontSize: "11px",
                            color: "rgba(140, 60, 60, 0.85)",
                            width: "100%",
                          }}
                        >
                          {row.last_error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ═══════ Action row ═══════ */}
          <section>
            <h3 style={blockTitle}>Actions</h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSend}
                disabled={sendingLink || !founder.email}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={ceremonialPill}
              >
                {sendingLink ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span aria-hidden="true" style={{ color: "var(--skin-accent-gold, #b8860b)" }}>✦</span>
                )}
                {sendingLink ? "Sending…" : "Send magic link"}
              </button>

              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                style={{
                  ...ceremonialPill,
                  border: "0.5px solid rgba(26, 30, 58, 0.15)",
                  background: "rgba(255, 255, 255, 0.55)",
                  boxShadow: "none",
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy email
              </button>

              {founder.has_top_talent && (
                <a
                  href={`/zone-of-genius`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 transition-all duration-200 hover:translate-y-[-0.5px]"
                  style={{
                    ...ceremonialPill,
                    border: "0.5px solid rgba(26, 30, 58, 0.15)",
                    background: "rgba(255, 255, 255, 0.55)",
                    boxShadow: "none",
                  }}
                  title="Open the public reveal page (their content is on /game/me/zone-of-genius after auth)"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Reveal page
                </a>
              )}
            </div>
            <p
              className="mt-3 italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "12px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.50))",
              }}
            >
              Bulk email composer ships with Wave 2 — when it lands, this row gains a
              <em> Send custom email </em> action.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
