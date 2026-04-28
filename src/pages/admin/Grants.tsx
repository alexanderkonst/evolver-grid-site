/**
 * Admin Grants — Builder gifting / entitlement-tier management.
 *
 * Day 53 night iter 4 (Sasha 2026-04-27): the admin surface for
 * granting Builder, Locked-in, or Founders 50 access to specific users
 * without going through Stripe. Used for:
 *   - 1:1 client gifts (Sasha works with someone, gives them Builder free)
 *   - Founder-friend access (impact founder collective members)
 *   - Beta tester / contributor comp
 *
 * Wires up to:
 *   - profiles.entitlement_tier (DB column added by Lovable migration)
 *   - public.set_entitlement_tier(email, tier, expires_at, note) RPC
 *   - entitlement_grants audit log table (auto-written by the RPC)
 *
 * Admin-gated via AdminGate (matches the rest of /admin/*).
 */

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AdminGate } from "./AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import GameShellV2 from "@/components/game/GameShellV2";

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
  profile_id: string;
  granted_by: string | null;
  previous_tier: EntitlementTier | null;
  new_tier: EntitlementTier;
  expires_at: string | null;
  note: string | null;
  created_at: string;
  /** Joined: target user's email — fetched separately. */
  target_email?: string | null;
};

function GrantsPage() {
  // Form state
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<EntitlementTier>("gifted_builder");
  const [expiresAt, setExpiresAt] = useState<string>(""); // ISO date or empty
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Lookup state
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupResult, setLookupResult] = useState<{
    email: string;
    tier: EntitlementTier;
    granted_at: string | null;
    expires_at: string | null;
    note: string | null;
  } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Recent grants
  const [recent, setRecent] = useState<GrantRow[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const loadRecent = async () => {
    setLoadingRecent(true);
    const { data, error } = await (supabase as any)
      .from("entitlement_grants")
      .select("id, profile_id, granted_by, previous_tier, new_tier, expires_at, note, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      console.error("Failed to load recent grants:", error);
      toast.error("Couldn't load recent grants.");
      setLoadingRecent(false);
      return;
    }
    // Resolve emails for the profile_ids (best-effort, falls back to UUID).
    const ids = Array.from(new Set((data ?? []).map((r: GrantRow) => r.profile_id)));
    let emailMap: Record<string, string> = {};
    if (ids.length > 0) {
      const { data: users } = await (supabase as any)
        .from("profiles")
        .select("id, email")
        .in("id", ids);
      if (users) {
        for (const u of users as Array<{ id: string; email: string }>) {
          emailMap[u.id] = u.email;
        }
      }
    }
    setRecent(
      (data ?? []).map((r: GrantRow) => ({
        ...r,
        target_email: emailMap[r.profile_id] ?? null,
      })),
    );
    setLoadingRecent(false);
  };

  useEffect(() => {
    loadRecent();
  }, []);

  const handleGrant = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await (supabase as any).rpc("set_entitlement_tier", {
        p_target_email: email.trim().toLowerCase(),
        p_new_tier: tier,
        p_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        p_note: note.trim() || null,
      });
      if (error) {
        toast.error(error.message || "Grant failed.");
        return;
      }
      toast.success(
        `${TIER_OPTIONS.find((t) => t.value === tier)?.label ?? tier} granted to ${email.trim()}.`,
      );
      setEmail("");
      setNote("");
      setExpiresAt("");
      await loadRecent();
    } catch (e: any) {
      toast.error(e?.message || "Grant failed unexpectedly.");
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
      // Fetch profile entitlement by email
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("email, entitlement_tier, entitlement_granted_at, entitlement_expires_at, entitlement_note")
        .eq("email", target)
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!data) {
        toast.error(`No profile found for ${target}`);
        return;
      }
      setLookupResult({
        email: data.email,
        tier: data.entitlement_tier as EntitlementTier,
        granted_at: data.entitlement_granted_at,
        expires_at: data.entitlement_expires_at,
        note: data.entitlement_note,
      });
    } finally {
      setLookingUp(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-5 py-10">
      {/* Header */}
      <header className="space-y-2">
        <Link
          to="/admin/dashboard"
          style={{
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--skin-text-muted, rgba(11, 42, 90, 0.62))",
          }}
        >
          ← Admin
        </Link>
        <h1
          className="leading-[1.05]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "clamp(28px, 4vw, 40px)",
            letterSpacing: "-0.005em",
            color: "var(--skin-text-primary, #0b2a5a)",
            textShadow: "var(--skin-text-halo-soft, 0 1px 2px rgba(255,255,255,0.7))",
          }}
        >
          Entitlement Grants
        </h1>
        <p
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontStyle: "italic",
            fontSize: "15px",
            lineHeight: 1.55,
            color: "var(--skin-text-body, rgba(11, 42, 90, 0.85))",
          }}
        >
          Grant Builder / Locked-in / Founders 50 / Ignition tier to any user by email — bypassing Stripe. Use for 1:1 client gifts, founder-collective access, and contributor comp. Every change is audited.
        </p>
      </header>

      {/* ═══ Grant form ═══ */}
      <section
        className="rounded-2xl px-6 py-6"
        style={{
          background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
          border: "0.5px solid rgba(212, 175, 55, 0.45)",
          boxShadow: "0 0 22px -8px rgba(212, 175, 55, 0.25), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
        }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "20px",
            letterSpacing: "-0.005em",
            color: "var(--skin-text-primary, #0b2a5a)",
          }}
        >
          Grant a tier
        </h2>

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
                border: "0.5px solid var(--skin-cta-border, rgba(255, 255, 255, 0.14))",
                boxShadow:
                  "var(--skin-cta-shadow, 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 18px -4px rgba(240, 194, 127, 0.45), 0 0 40px -8px rgba(212, 175, 55, 0.28))",
              }}
            >
              <span aria-hidden="true" style={ceremonialIcon}>✦</span>
              <span style={ceremonialLabel}>{submitting ? "Granting…" : "Grant"}</span>
            </button>
          </div>
        </form>
      </section>

      {/* ═══ Lookup ═══ */}
      <section className="space-y-3">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "20px",
            letterSpacing: "-0.005em",
            color: "var(--skin-text-primary, #0b2a5a)",
          }}
        >
          Look up current tier
        </h2>
        <form onSubmit={handleLookup} className="flex gap-2">
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
            className="rounded-xl px-4 py-3.5"
            style={{
              background: "var(--skin-card-bg, rgba(255, 255, 255, 0.65))",
              border: "0.5px solid var(--skin-card-border, rgba(26, 30, 58, 0.08))",
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
                {TIER_OPTIONS.find((t) => t.value === lookupResult.tier)?.label || lookupResult.tier}
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
      </section>

      {/* ═══ Recent grants (audit log tail) ═══ */}
      <section className="space-y-3">
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontSize: "20px",
            letterSpacing: "-0.005em",
            color: "var(--skin-text-primary, #0b2a5a)",
          }}
        >
          Recent grants
        </h2>
        {loadingRecent ? (
          <p className="italic" style={{ fontFamily: "'Source Serif 4', serif", color: "var(--skin-text-muted)" }}>
            Loading…
          </p>
        ) : recent.length === 0 ? (
          <p className="italic" style={{ fontFamily: "'Source Serif 4', serif", color: "var(--skin-text-muted)" }}>
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
                  border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
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
                    {r.target_email || `(${r.profile_id.slice(0, 8)}…)`}
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
      </section>
    </div>
  );
}

function tierLabel(t: EntitlementTier): string {
  return TIER_OPTIONS.find((opt) => opt.value === t)?.label ?? t;
}

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

/** Default export wraps in AdminGate + GameShellV2. */
export default function AdminGrantsPage() {
  return (
    <AdminGate>
      <GameShellV2>
        <GrantsPage />
      </GameShellV2>
    </AdminGate>
  );
}
