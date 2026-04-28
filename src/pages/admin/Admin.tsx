/**
 * /admin — the fused admin home.
 *
 * Day 54 (Sasha 2026-04-28): merger of the previously-separate
 * /admin/dashboard (founder KPIs + charts + action lists + CRM overlay) and
 * /admin/grants (entitlement-tier gifting form, lookup, audit log) into
 * one page. Old URLs redirect to /admin so any bookmarks/links keep
 * working.
 *
 * Section order is priority-driven for the end-of-session workflow:
 *   1. Recent founders + Send link  ← the just-finished session sits at top
 *   2. Entitlement Grants           ← gift Builder access to a paid client
 *   3. Funnel KPIs + per-step chart
 *   4. Action lists (Ignition-done-no-Build, Stale 14d+)
 *   5. CRM snapshot
 *   6. Specialized admin shortcuts (content, genius-offers, mission-sync)
 *
 * Visual register: editorial Aurora (Cormorant + skin tokens + cream/gold)
 * — matches the Grants surface and the platform's landing register. The
 * older Dashboard sections (KPIs, chart, action lists) still carry their
 * legacy flat-dark utility styling for now; Phase 2 = harmonize those to
 * Aurora editorial. Logged in roadmap.md.
 *
 * White-label note: the data this page surfaces is per-user (one row per
 * founder via `founder_state_v1`); the admin gate is per-email
 * (ADMIN_EMAILS in src/lib/isAdmin.ts). When the project moves to
 * per-coach admin scoping, this page is the canonical surface to evolve.
 */

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { toast as sonnerToast } from "sonner";

import { AdminGate } from "./AdminGate";
import { useFounderStates, type FounderState } from "./useFounderStates";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useToast } from "@/hooks/use-toast";
import GameShellV2 from "@/components/game/GameShellV2";
import { supabase } from "@/integrations/supabase/client";
import { GOLD_TEXT_STYLE, Ornament } from "@/lib/landingDesign";
import crmSnapshot from "@/generated/crm-snapshot.json";

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

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

type EntitlementTier =
  | "tasting"
  | "builder"
  | "locked_in"
  | "gifted_builder"
  | "gifted_locked_in"
  | "founders_50"
  | "ignition";

const TIER_OPTIONS: { value: EntitlementTier; label: string; hint: string }[] = [
  { value: "tasting", label: "Tasting", hint: "Free trial · 25 generations · no save" },
  { value: "builder", label: "Builder", hint: "$22/mo · personal use · 1 founder" },
  { value: "locked_in", label: "Locked-in", hint: "$99/mo · commercial license · build for clients" },
  { value: "gifted_builder", label: "Gifted Builder", hint: "Builder access on the house" },
  { value: "gifted_locked_in", label: "Gifted Locked-in", hint: "Commercial access on the house" },
  { value: "founders_50", label: "Founders 50", hint: "$555 lifetime · first 50 buyers" },
  { value: "ignition", label: "Ignition", hint: "$5,555 · commercial + 1:1 coaching with Sasha" },
];

type GrantRow = {
  id: string;
  target_email: string | null;
  granted_by_email: string | null;
  previous_tier: EntitlementTier | null;
  new_tier: EntitlementTier;
  expires_at: string | null;
  note: string | null;
  created_at: string;
};

// ─────────────────────────────────────────────────────────────────────
// Shared style helpers (Aurora editorial register — matches Grants/landing)
// ─────────────────────────────────────────────────────────────────────

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  fontSize: "22px",
  letterSpacing: "-0.005em",
  color: "var(--skin-text-primary, #0b2a5a)",
};

const fieldLabel: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontWeight: 500,
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "14px",
  color: "var(--skin-text-primary, #0b2a5a)",
  background: "rgba(255, 255, 255, 0.85)",
  border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
};

const cardSurface: React.CSSProperties = {
  background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
  border: "0.5px solid rgba(212, 175, 55, 0.45)",
  boxShadow:
    "0 0 22px -8px rgba(212, 175, 55, 0.25), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
};

const ceremonialLabel: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "13px",
  textShadow: "var(--skin-cta-text-shadow, 0 0 16px rgba(240,194,127,0.28))",
};

const ceremonialIcon: React.CSSProperties = {
  color: "var(--skin-cta-icon, rgba(244, 212, 114, 0.98))",
  textShadow: "var(--skin-cta-icon-shadow, 0 0 12px rgba(244,212,114,0.8))",
  fontSize: "16px",
};

// ─────────────────────────────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
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

function tierLabel(t: EntitlementTier): string {
  return TIER_OPTIONS.find((opt) => opt.value === t)?.label ?? t;
}

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
    if (now - new Date(f.last_touch_at).getTime() < 7 * DAY_MS) newLast7d += 1;
    if (f.has_ignition && !f.has_build) ignitionNoBuild.push(f);
    if (now - new Date(f.last_touch_at).getTime() > 14 * DAY_MS) stale14d.push(f);
  }
  return { stepDist, revenueTotal, newLast7d, ignitionNoBuild, stale14d };
}

// ─────────────────────────────────────────────────────────────────────
// Section: Recent founders + Send link (the end-of-session priority surface)
// ─────────────────────────────────────────────────────────────────────

/**
 * SendLinkButton — ceremonial-restrained.
 *
 * Day 54 (Sasha 2026-04-28): polished from a generic shadcn Button to a
 * compact gold-hairline pill in the same brand family as the Grant CTA
 * below — ✦ glyph + Cormorant uppercase + skin-tokened gold border.
 * Smaller scale than the Grant CTA so 8 of these in a list don't feel
 * heavy. Honors the post-session-delivery moment: this click sends the
 * founder back into the platform with their Canvas pre-populated.
 */
function SendLinkButton({ founder }: { founder: FounderState }) {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [sentAt, setSentAt] = useState<number | null>(null);

  const send = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-send-magic-link", {
        body: { user_id: founder.user_id, redirect_path: "/game/me" },
      });
      if (error) throw error;
      const sentTo = (data as { sent_to?: string } | null)?.sent_to ?? founder.email;
      setSentAt(Date.now());
      toast({
        title: "Magic link sent",
        description: `Sent to ${sentTo}. Link expires in ~1 hour.`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("admin-send-magic-link failed:", error);
      toast({
        title: "Couldn't send magic link",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const justSent = sentAt !== null && Date.now() - sentAt < 8000;
  const isDisabled = sending || !founder.email;

  return (
    <button
      onClick={send}
      disabled={isDisabled}
      title={
        !founder.email
          ? "No email on record for this founder"
          : "Email a fresh sign-in link — they land on /game/me"
      }
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      style={{
        background: justSent
          ? "linear-gradient(135deg, rgba(244,212,114,0.22) 0%, rgba(184,134,11,0.12) 100%)"
          : "rgba(255, 255, 255, 0.7)",
        border: `0.5px solid ${justSent ? "rgba(212,175,55,0.85)" : "rgba(212,175,55,0.5)"}`,
        boxShadow: justSent
          ? "0 0 14px -3px rgba(244,212,114,0.5), 0 0 0 1px rgba(212,175,55,0.18)"
          : "0 0 8px -3px rgba(212,175,55,0.18)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          ...ceremonialIcon,
          fontSize: "12px",
          textShadow: justSent
            ? "0 0 10px rgba(244,212,114,0.95)"
            : "0 0 8px rgba(244,212,114,0.7)",
        }}
      >
        ✦
      </span>
      <span
        style={{
          ...ceremonialLabel,
          fontSize: "10.5px",
          letterSpacing: "0.16em",
          textShadow: "none",
          color: "var(--skin-text-primary, #0b2a5a)",
        }}
      >
        {sending ? "Sending…" : justSent ? "Sent" : "Send link"}
      </span>
    </button>
  );
}

function RecentFoundersSection({ founders }: { founders: FounderState[] }) {
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...founders];
    copy.sort(
      (a, b) =>
        new Date(b.last_touch_at).getTime() - new Date(a.last_touch_at).getTime(),
    );
    return copy;
  }, [founders]);

  const visible = showAll ? sorted : sorted.slice(0, 8);

  return (
    <section className="rounded-2xl px-6 py-6" style={cardSurface}>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 style={sectionTitleStyle}>Recent founders</h2>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
          }}
        >
          sorted by last touch · {sorted.length}
        </span>
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
        End-of-session: tap <em>Send link</em> on the founder you just had a session with — fresh magic link to their inbox, lands them on <code>/game/me</code> with their Canvas pre-populated.
      </p>

      {sorted.length === 0 ? (
        <p
          className="italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            color: "var(--skin-text-muted)",
          }}
        >
          No founders yet.
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            {visible.map((f) => (
              <div
                key={f.user_id}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors"
                style={{
                  background: "rgba(255, 255, 255, 0.55)",
                  border:
                    "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      style={{
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        fontSize: "13.5px",
                        fontWeight: 500,
                        color: "var(--skin-text-primary, #0b2a5a)",
                      }}
                      className="truncate"
                    >
                      {f.display_name}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        fontSize: "12px",
                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                      }}
                      className="truncate"
                    >
                      {f.email}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontSize: "11px",
                      color: "var(--skin-text-muted, rgba(11, 42, 90, 0.5))",
                    }}
                  >
                    Step {f.current_step} · {relativeTime(f.last_touch_at)}
                  </div>
                </div>
                <SendLinkButton founder={f} />
              </div>
            ))}
          </div>
          {sorted.length > 8 && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 transition-colors hover:opacity-80"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "11.5px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
              }}
            >
              {showAll ? "Show fewer" : `Show all ${sorted.length}`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section: Entitlement Grants (form + lookup + audit log)
// ─────────────────────────────────────────────────────────────────────

function EntitlementGrantsSection() {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<EntitlementTier>("gifted_builder");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState<{
    email: string;
    tier: EntitlementTier;
    granted_at: string | null;
    expires_at: string | null;
    note: string | null;
  } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const [recent, setRecent] = useState<GrantRow[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const loadRecent = async () => {
    setLoadingRecent(true);
    const { data, error } = await (supabase as any).rpc("admin_recent_grants", {
      p_limit: 20,
    });
    if (error) {
      console.error("Failed to load recent grants:", error);
      sonnerToast.error("Couldn't load recent grants.");
      setLoadingRecent(false);
      return;
    }
    setRecent((data ?? []) as GrantRow[]);
    setLoadingRecent(false);
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleGrant = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      sonnerToast.error("Email is required.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await (supabase as any).rpc("set_entitlement_tier", {
        p_target_email: email.trim().toLowerCase(),
        p_new_tier: tier,
        p_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        p_note: note.trim() || null,
      });
      if (error) {
        sonnerToast.error(error.message || "Grant failed.");
        return;
      }
      sonnerToast.success(
        `${TIER_OPTIONS.find((t) => t.value === tier)?.label ?? tier} granted to ${email.trim()}.`,
      );
      setEmail("");
      setNote("");
      setExpiresAt("");
      await loadRecent();
    } catch (e: any) {
      sonnerToast.error(e?.message || "Grant failed unexpectedly.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;
    setLookingUp(true);
    setLookupResult(null);
    try {
      const target = lookupEmail.trim().toLowerCase();
      const { data, error } = await (supabase as any).rpc("admin_lookup_entitlement", {
        p_email: target,
      });
      if (error) {
        sonnerToast.error(error.message);
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) {
        sonnerToast.error(`No profile found for ${target}`);
        return;
      }
      setLookupResult({
        email: row.email,
        tier: row.tier as EntitlementTier,
        granted_at: row.granted_at,
        expires_at: row.expires_at,
        note: row.note,
      });
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl px-6 py-6" style={cardSurface}>
        <h2 style={sectionTitleStyle}>Entitlement grants</h2>
        <p
          className="italic mt-1.5"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: "13.5px",
            lineHeight: 1.55,
            color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
          }}
        >
          Grant Builder / Locked-in / Founders 50 / Ignition tier to any user by email — bypassing Stripe. Use for 1:1 client gifts, founder-collective access, contributor comp. Every change is audited.
        </p>

        <form onSubmit={handleGrant} className="mt-5 space-y-4">
          <div>
            <label style={fieldLabel}>Recipient email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@example.com"
              className="mt-1 w-full rounded-lg px-4 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-[#d4af37]/40"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={fieldLabel}>Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as EntitlementTier)}
              className="mt-1 w-full rounded-lg px-4 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-[#d4af37]/40"
              style={inputStyle}
            >
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.hint}
                </option>
              ))}
            </select>
            <p
              className="mt-1.5 italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "12.5px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
              }}
            >
              {TIER_OPTIONS.find((t) => t.value === tier)?.hint}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label style={fieldLabel}>Expires (optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 w-full rounded-lg px-4 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-[#d4af37]/40"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={fieldLabel}>Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why this gift?"
                className="mt-1 w-full rounded-lg px-4 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-[#d4af37]/40"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 transition-all duration-300 hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background:
                  "var(--skin-cta-bg, linear-gradient(135deg, rgba(10,22,40,0.82) 0%, rgba(18,28,56,0.72) 50%, rgba(10,22,40,0.82) 100%))",
                color: "var(--skin-cta-text, rgba(245, 245, 250, 0.98))",
                border:
                  "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
                boxShadow:
                  "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
              }}
            >
              <span aria-hidden="true" style={ceremonialIcon}>
                ✦
              </span>
              <span style={ceremonialLabel}>
                {submitting ? "Granting…" : "Grant"}
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl px-6 py-6" style={cardSurface}>
        <h2 style={sectionTitleStyle}>Look up current tier</h2>
        <form onSubmit={handleLookup} className="mt-4 flex gap-2">
          <input
            type="email"
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
            placeholder="founder@example.com"
            className="flex-1 rounded-lg px-4 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-[#d4af37]/40"
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={lookingUp || !lookupEmail.trim()}
            className="rounded-full px-5 py-2.5 transition-all duration-200 hover:translate-y-[-0.5px] disabled:opacity-50"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontSize: "11.5px",
              color: "var(--skin-text-primary, #0b2a5a)",
              background: "rgba(255, 255, 255, 0.68)",
              border: "0.5px solid rgba(212, 175, 55, 0.45)",
            }}
          >
            {lookingUp ? "Looking…" : "Look up"}
          </button>
        </form>
        {lookupResult && (
          <div
            className="mt-3 rounded-xl px-4 py-3.5"
            style={{
              background: "var(--skin-card-bg, rgba(255, 255, 255, 0.55))",
              border:
                "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
            }}
          >
            <div
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
                color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
              }}
            >
              <strong>{lookupResult.email}</strong> ·{" "}
              <span style={{ color: "var(--skin-accent-gold, #b8860b)" }}>
                {tierLabel(lookupResult.tier)}
              </span>
              {lookupResult.granted_at && (
                <span style={{ color: "var(--skin-text-muted)" }}>
                  {" · granted "}
                  {new Date(lookupResult.granted_at).toLocaleDateString()}
                </span>
              )}
              {lookupResult.expires_at && (
                <span style={{ color: "var(--skin-text-muted)" }}>
                  {" · expires "}
                  {new Date(lookupResult.expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
            {lookupResult.note && (
              <div
                className="mt-1 italic"
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: "13px",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                }}
              >
                {lookupResult.note}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl px-6 py-6" style={cardSurface}>
        <h2 style={sectionTitleStyle}>Recent grants</h2>
        <div className="mt-3">
          {loadingRecent ? (
            <p
              className="italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                color: "var(--skin-text-muted)",
              }}
            >
              Loading…
            </p>
          ) : recent.length === 0 ? (
            <p
              className="italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                color: "var(--skin-text-muted)",
              }}
            >
              No grants yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="rounded-lg px-3.5 py-2.5"
                  style={{
                    background: "rgba(255, 255, 255, 0.55)",
                    border:
                      "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
                  }}
                >
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span
                      style={{
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "var(--skin-text-primary, #0b2a5a)",
                      }}
                    >
                      {r.target_email ?? "(unknown)"}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "11.5px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        color: "var(--skin-accent-gold, #b8860b)",
                      }}
                    >
                      {r.previous_tier ? `${tierLabel(r.previous_tier)} → ` : ""}
                      {tierLabel(r.new_tier)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                        fontSize: "11px",
                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  {r.note && (
                    <div
                      className="mt-0.5 italic"
                      style={{
                        fontFamily: "'Source Serif 4', serif",
                        fontSize: "12.5px",
                        color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
                      }}
                    >
                      {r.note}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section: Funnel KPIs + per-step chart + action lists + CRM overlay
// (legacy Dashboard sections — kept in their utility styling for now,
// will be harmonized to Aurora editorial in Phase 2)
// ─────────────────────────────────────────────────────────────────────

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
    <div className="rounded-2xl px-5 py-4" style={cardSurface}>
      <p style={fieldLabel}>{label}</p>
      <p
        className="mt-1.5"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
          fontSize: "30px",
          letterSpacing: "-0.012em",
          color: "var(--skin-text-primary, #0b2a5a)",
          fontVariantNumeric: "tabular-nums lining-nums",
          fontFeatureSettings: '"tnum" 1, "lnum" 1',
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="mt-1 italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: "12px",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
          }}
        >
          {sub}
        </p>
      )}
    </div>
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
    <div className="rounded-2xl px-6 py-5" style={cardSurface}>
      <div className="flex items-baseline gap-2 mb-3">
        <h3 style={{ ...sectionTitleStyle, fontSize: "18px" }}>{title}</h3>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--skin-accent-gold, #b8860b)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ({items.length})
        </span>
      </div>
      {items.length === 0 ? (
        <p
          className="italic"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: "13.5px",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
          }}
        >
          {empty}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.slice(0, 10).map((f) => (
            <li
              key={f.user_id}
              className="flex items-baseline justify-between gap-3"
              style={{
                fontFamily: "'DM Sans', system-ui, sans-serif",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  fontWeight: 500,
                  color: "var(--skin-text-primary, #0b2a5a)",
                }}
              >
                {f.display_name}
              </span>
              <span
                style={{
                  fontSize: "11.5px",
                  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
                }}
                className="truncate"
              >
                {f.email}
              </span>
            </li>
          ))}
          {items.length > 10 && (
            <li
              className="italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "12px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.5))",
              }}
            >
              …and {items.length - 10} more
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function FunnelKpisSection({ founders }: { founders: FounderState[] }) {
  const agg = useMemo(() => aggregate(founders), [founders]);

  return (
    <section className="space-y-5">
      <h2 style={sectionTitleStyle}>Funnel KPIs</h2>

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

      <div className="rounded-2xl px-6 py-5" style={cardSurface}>
        <h3 style={{ ...sectionTitleStyle, fontSize: "18px" }} className="mb-3">
          Founders per step
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agg.stepDist}>
              <defs>
                <linearGradient id="adminGoldBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(244, 212, 114, 0.95)" />
                  <stop offset="100%" stopColor="rgba(184, 134, 11, 0.85)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(11,42,90,0.08)" />
              <XAxis
                dataKey="step"
                stroke="rgba(11,42,90,0.55)"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "11.5px",
                }}
              />
              <YAxis
                allowDecimals={false}
                stroke="rgba(11,42,90,0.55)"
                style={{
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "11.5px",
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(255, 255, 255, 0.95)",
                  border: "0.5px solid rgba(212, 175, 55, 0.45)",
                  borderRadius: 10,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: "12.5px",
                  color: "var(--skin-text-primary, #0b2a5a)",
                  boxShadow: "0 8px 24px -10px rgba(10, 22, 40, 0.18)",
                }}
                cursor={{ fill: "rgba(212, 175, 55, 0.08)" }}
              />
              <Bar dataKey="n" fill="url(#adminGoldBar)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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
    </section>
  );
}

function CrmOverlaySection() {
  const stageRows = Object.entries(crm.stageDistribution).sort(
    (a, b) => b[1] - a[1],
  );
  const segRows = Object.entries(crm.segmentDistribution).sort(
    (a, b) => b[1] - a[1],
  );
  const generated = new Date(crm.generated_at).toLocaleString();

  // Aurora editorial styles for CRM rows + columns
  const colHeaderStyle: React.CSSProperties = {
    ...fieldLabel,
    marginBottom: "8px",
  };
  const rowStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "12.5px",
    color: "var(--skin-text-primary, #0b2a5a)",
  };
  const numStyle: React.CSSProperties = {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "12.5px",
    color: "var(--skin-accent-gold, #b8860b)",
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <div className="rounded-2xl px-6 py-6" style={cardSurface}>
      <div className="flex items-baseline gap-2 mb-1">
        <h2 style={sectionTitleStyle}>CRM snapshot</h2>
        <span
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
          }}
        >
          {crm.version ? `${crm.version} · ` : ""}{crm.contactsCount} contacts
        </span>
      </div>

      {crm.error ? (
        <p
          className="italic mb-3"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: "12.5px",
            color: "rgba(176, 60, 60, 0.85)",
          }}
        >
          Parser error at build time: {crm.error}. Run <code>npm run crm:snapshot</code>.
        </p>
      ) : null}

      <div className="mt-4 grid gap-5 md:grid-cols-3">
        <div>
          <p style={colHeaderStyle}>Pipeline by stage</p>
          <ul className="space-y-1">
            {stageRows.slice(0, 8).map(([stage, n]) => (
              <li
                key={stage}
                className="flex justify-between"
                style={rowStyle}
              >
                <span>{stage}</span>
                <span style={numStyle}>{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={colHeaderStyle}>By segment</p>
          <ul className="space-y-1">
            {segRows.slice(0, 8).map(([seg, n]) => (
              <li key={seg} className="flex justify-between" style={rowStyle}>
                <span>{seg}</span>
                <span style={numStyle}>{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={colHeaderStyle}>Signals</p>
          <ul className="space-y-1">
            <li className="flex justify-between" style={rowStyle}>
              <span>Energy leaks</span>
              <span style={numStyle}>{crm.energyLeakCount}</span>
            </li>
            <li className="flex justify-between" style={rowStyle}>
              <span>Open items</span>
              <span style={numStyle}>{crm.openItemsCount}</span>
            </li>
            <li className="flex justify-between" style={rowStyle}>
              <span>Upcoming events</span>
              <span style={numStyle}>{crm.upcomingEvents.length}</span>
            </li>
          </ul>
        </div>
      </div>

      {crm.upcomingEvents.length > 0 && (
        <div className="mt-5">
          <p style={colHeaderStyle}>Upcoming</p>
          <ul className="space-y-1">
            {crm.upcomingEvents.map((e, i) => (
              <li key={i} style={rowStyle}>
                <span
                  style={{
                    color: "var(--skin-accent-gold, #b8860b)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {e.date}
                </span>{" "}
                — {e.event}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p
        className="mt-5 italic"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "11px",
          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.5))",
        }}
      >
        Snapshot from <code>docs/09-logs/broadcast_tracker.md</code>, generated {generated}. Refresh with <code>npm run crm:snapshot</code>.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Section: Specialized admin shortcuts
// ─────────────────────────────────────────────────────────────────────

const SPECIALIZED_ADMINS: { path: string; label: string; hint: string }[] = [
  { path: "/admin/content", label: "Content", hint: "Founder canvases & testimonials" },
  { path: "/admin/genius-offers", label: "Genius offers", hint: "Founder offer review" },
  { path: "/admin/mission-participants", label: "Mission participants", hint: "Mission roster" },
  { path: "/admin/mission-sync", label: "Mission sync", hint: "Sync mission data" },
];

function SpecializedAdminLinksSection() {
  return (
    <section className="rounded-2xl px-6 py-6" style={cardSurface}>
      <h2 style={sectionTitleStyle}>Specialized admin tools</h2>
      <p
        className="italic mt-1.5 mb-4"
        style={{
          fontFamily: "'Source Serif 4', serif",
          fontSize: "13.5px",
          color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
        }}
      >
        Niche surfaces kept on dedicated routes. Open them from here.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {SPECIALIZED_ADMINS.map((s) => (
          <Link
            key={s.path}
            to={s.path}
            className="rounded-xl px-4 py-3 transition-all duration-200 hover:translate-y-[-1px]"
            style={{
              background: "rgba(255, 255, 255, 0.55)",
              border:
                "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--skin-text-primary, #0b2a5a)",
              }}
            >
              {s.label}
            </div>
            <div
              className="italic"
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: "12.5px",
                color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
              }}
            >
              {s.hint}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

function AdminPageInner() {
  const { loading, error, founders } = useFounderStates();

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-5 py-10 md:py-14">
      {/* ═══════ HEADER ═══════ */}
      <header className="text-center">
        {/* Live-pulse eyebrow — matches /dashboard signature */}
        <div
          className="inline-flex items-center justify-center gap-2 mb-4"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 500,
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.72))",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "var(--skin-accent-gold, #b8860b)" }}
          />
          <span>Live · Operator console</span>
        </div>

        {/* H1 — gold accent on the operative word, matches landing's
            "Top Talent" / "Productize it." / dashboard's "Growth Dashboard". */}
        <h1
          className="leading-[1.05] tracking-[-0.01em] mb-3"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "clamp(34px, 5vw, 56px)",
            color: "var(--skin-text-primary, #0b2a5a)",
            textShadow:
              "var(--skin-text-halo-strong, 0 0 22px rgba(255,255,255,0.55), 0 1px 2px rgba(255,255,255,0.8))",
          }}
        >
          The{" "}
          <span className="bg-clip-text text-transparent" style={GOLD_TEXT_STYLE}>
            Admin
          </span>
        </h1>

        <p
          className="italic max-w-xl mx-auto"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "clamp(15px, 1.6vw, 19px)",
            lineHeight: 1.5,
            fontWeight: 400,
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.78))",
            textShadow:
              "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.6))",
          }}
        >
          End-of-session lookup, entitlement grants, funnel signal — one console for everything operator-side.
        </p>

        <Ornament className="my-6 sm:my-8" />
      </header>

      {loading ? (
        <div className="py-16 flex justify-center">
          <PremiumLoader />
        </div>
      ) : error ? (
        <p
          className="italic text-center"
          style={{
            fontFamily: "'Source Serif 4', serif",
            color: "rgba(176, 60, 60, 0.85)",
          }}
        >
          Error: {error}
        </p>
      ) : (
        <>
          <RecentFoundersSection founders={founders} />
          <Ornament className="my-2" />
          <EntitlementGrantsSection />
          <Ornament className="my-2" />
          <FunnelKpisSection founders={founders} />
          <Ornament className="my-2" />
          <CrmOverlaySection />
          <Ornament className="my-2" />
          <SpecializedAdminLinksSection />
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGate>
      <GameShellV2>
        <AdminPageInner />
      </GameShellV2>
    </AdminGate>
  );
}
