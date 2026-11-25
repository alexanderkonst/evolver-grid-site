/**
 * /admin → «Collective members» (WP1).
 * Search a player, grant or revoke core membership. Writes the `collective_member` role and
 * the `collective_members` row together (src/lib/collectiveMembership.ts). Admin-only because
 * it sits inside AdminGate and RLS refuses anyone else.
 *
 * Players come from the founders list the page already loaded (admin_founder_states), so no
 * new query exposes emails.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast as sonnerToast } from "sonner";
import { collectiveAdminText } from "@/data/collectiveAdminCopy";
import {
  COLLECTIVE_SEARCH_MIN_QUERY as MIN_QUERY,
  grantCollectiveMembership,
  listCollectiveMemberIds,
  revokeCollectiveMembership,
  searchPlayers,
} from "@/lib/collectiveMembership";
import type { FounderState } from "./useFounderStates";

const titleStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  fontSize: "22px",
  letterSpacing: "-0.005em",
  color: "var(--skin-text-primary, #0b2a5a)",
};

const mutedStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "12px",
  color: "var(--skin-text-muted, rgba(11, 42, 90, 0.55))",
};

const cardStyle: React.CSSProperties = {
  background: "var(--skin-card-fill, rgba(255, 255, 255, 0.65))",
  border: "0.5px solid rgba(212, 175, 55, 0.45)",
  boxShadow: "0 0 22px -8px rgba(212, 175, 55, 0.25), 0 16px 40px -20px rgba(10, 22, 40, 0.18)",
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  fontSize: "14px",
  color: "var(--skin-text-primary, #0b2a5a)",
  background: "var(--skin-input-fill, rgba(255, 255, 255, 0.85))",
  border: "0.5px solid var(--skin-rule-medium, rgba(26, 30, 58, 0.15))",
};

const rowStyle: React.CSSProperties = {
  background: "var(--skin-card-fill, rgba(255, 255, 255, 0.55))",
  border: "0.5px solid var(--skin-rule-hairline, rgba(26, 30, 58, 0.08))",
};

const pillStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontSize: "10.5px",
  color: "var(--skin-text-primary, #0b2a5a)",
  background: "var(--skin-card-fill, rgba(255, 255, 255, 0.72))",
  border: "0.5px solid rgba(212, 175, 55, 0.55)",
};

export function CollectiveMembersSection({ players }: { players: FounderState[] }) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "en";
  const text = useCallback((key: Parameters<typeof collectiveAdminText>[0]) => collectiveAdminText(key, lang), [lang]);

  const [query, setQuery] = useState("");
  const [memberIds, setMemberIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMemberIds(new Set(await listCollectiveMemberIds()));
      setLoadError(false);
    } catch (e) {
      console.error("collective members load failed:", e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const results = useMemo(() => searchPlayers(players, query), [players, query]);
  const members = useMemo(() => players.filter((p) => memberIds.has(p.user_id)), [players, memberIds]);

  const toggle = async (player: FounderState, makeMember: boolean) => {
    setBusyId(player.user_id);
    try {
      if (makeMember) await grantCollectiveMembership(player.user_id);
      else await revokeCollectiveMembership(player.user_id);
      sonnerToast.success(text(makeMember ? "granted" : "revoked"));
      await load();
    } catch (e) {
      console.error("collective membership update failed:", e);
      sonnerToast.error(text("actionFailed"));
    } finally {
      setBusyId(null);
    }
  };

  const renderRow = (player: FounderState) => {
    const isMember = memberIds.has(player.user_id);
    const busy = busyId === player.user_id;
    return (
      <li key={player.user_id} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5" style={rowStyle}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span
              className="truncate"
              style={{ ...inputStyle, background: "none", border: "none", fontWeight: 500, fontSize: "13.5px" }}
            >
              {player.display_name}
            </span>
            {isMember && (
              <span style={{ ...mutedStyle, color: "var(--skin-accent-gold, #b8860b)" }}>{text("isMember")}</span>
            )}
          </div>
          <div className="truncate" style={mutedStyle}>
            {player.email}
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void toggle(player, !isMember)}
          className="flex-shrink-0 rounded-full px-3.5 py-1.5 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          style={pillStyle}
        >
          {busy ? text("working") : isMember ? text("revoke") : text("grant")}
        </button>
      </li>
    );
  };

  return (
    <section className="rounded-2xl px-6 py-6" style={cardStyle} aria-label={text("title")}>
      <h2 style={titleStyle}>{text("title")}</h2>
      <p className="mt-1.5 italic" style={{ ...mutedStyle, fontSize: "13.5px" }}>
        {text("intro")}
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={text("searchPlaceholder")}
        aria-label={text("searchPlaceholder")}
        className="mt-4 w-full rounded-lg px-4 py-2.5 outline-none transition-shadow focus:ring-2 focus:ring-[#d4af37]/40"
        style={inputStyle}
      />

      <div className="mt-3">
        {query.trim().length === 0 ? null : query.trim().length < MIN_QUERY ? (
          <p className="italic" style={mutedStyle}>
            {text("typeToSearch")}
          </p>
        ) : results.length === 0 ? (
          <p className="italic" style={mutedStyle}>
            {text("noMatches")}
          </p>
        ) : (
          <ul className="space-y-1.5">{results.map(renderRow)}</ul>
        )}
      </div>

      <h3 className="mt-6" style={{ ...titleStyle, fontSize: "18px" }}>
        {text("membersHeading")} ({members.length})
      </h3>
      <div className="mt-2">
        {loading ? (
          <p className="italic" style={mutedStyle}>
            {text("loading")}
          </p>
        ) : loadError ? (
          <p className="italic" style={{ ...mutedStyle, color: "rgba(176, 60, 60, 0.85)" }}>
            {text("loadFailed")}
          </p>
        ) : members.length === 0 ? (
          <p className="italic" style={mutedStyle}>
            {text("noMembers")}
          </p>
        ) : (
          <ul className="space-y-1.5">{members.map(renderRow)}</ul>
        )}
      </div>
    </section>
  );
}
