import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatVillageIncome } from "@/lib/villageIncome";

/**
 * houseStats — the stats cards on Your House (spec row A5, issue #357; Sasha 2026-11-21:
 * «Статы! люди любят статс!», «статс будем показывать только те, что имеет смысл»).
 *
 * Each card exists only when the player has a real value: no empty card, no «0», no placeholder.
 * Three cards: QoL (the one player level), U (how much the uniqueness statement resonates), $ (income
 * the unique business has brought).
 *
 * PRIVACY: owner-only. Render these on the player's own House and nowhere else: never on a public
 * profile, the share card, or to another player. The reads below are keyed to the signed-in
 * player's own rows (RLS enforces it).
 */

export type StatId = "qol" | "uniqueness" | "income";

/** One reading of a stat, with the moment it was taken. */
export type StatReading = { value: number; at: string };

export type HouseStat = {
  id: StatId;
  /** The number as shown, e.g. «6.3», «9», «$1,250». */
  value: string;
  /** «/ 10» for the scored stats; absent for money. */
  max?: string;
  /** Change against the previous reading; absent when there is no previous one. */
  change?: { delta: number; since: string };
};

export type HouseStatsInput = {
  /** The current QoL level (mean of the 8 domains), or null when not measured. */
  qolLevel: number | null;
  /** The measurement before the current one, if any. */
  qolPrevious: StatReading | null;
  /** Non-null resonance ratings (1–10), newest first. */
  resonance: readonly StatReading[];
  /** The player's own income, already formatted; null when there is none. */
  income: string | null;
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** «Q3», or «Q3 2025» when the quarter is not in the current year. */
export function quarterLabel(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const q = `Q${Math.floor(d.getMonth() / 3) + 1}`;
  return d.getFullYear() === now.getFullYear() ? q : `${q} ${d.getFullYear()}`;
}

const isScore = (n: unknown, min: number, max: number): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;

/** The cards the player has earned, in fixed order. An empty list means no stats block at all. */
export function buildHouseStats(input: HouseStatsInput, now: Date = new Date()): HouseStat[] {
  const stats: HouseStat[] = [];

  if (isScore(input.qolLevel, 1, 10)) {
    const prev = input.qolPrevious;
    stats.push({
      id: "qol",
      value: String(input.qolLevel),
      max: "/ 10",
      change:
        prev && isScore(prev.value, 1, 10)
          ? { delta: round1(input.qolLevel - prev.value), since: quarterLabel(prev.at, now) }
          : undefined,
    });
  }

  const [latest, before] = input.resonance.filter((r) => isScore(r.value, 1, 10));
  if (latest) {
    stats.push({
      id: "uniqueness",
      value: String(latest.value),
      max: "/ 10",
      change: before ? { delta: latest.value - before.value, since: quarterLabel(before.at, now) } : undefined,
    });
  }

  if (input.income) stats.push({ id: "income", value: input.income });

  return stats;
}

type SaleRow = { amount_cents: number | null; currency: string | null };

/**
 * The player's income from their own sales, formatted. Null when there is nothing to show:
 * no amounts, or a total of zero. Sales in different currencies are listed side by side, never
 * converted or summed across currencies.
 */
export function formatOwnIncome(rows: readonly SaleRow[]): string | null {
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (typeof r.amount_cents !== "number" || !r.currency) continue;
    const cur = r.currency.toUpperCase();
    totals.set(cur, (totals.get(cur) ?? 0) + r.amount_cents);
  }
  const parts = [...totals.entries()]
    .filter(([, cents]) => cents > 0)
    .map(([currency, cents]) => formatVillageIncome({ total: cents / 100, currency }));
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Two newest non-null resonance ratings of this profile, newest first. [] on any error. */
async function loadResonance(profileId: string): Promise<StatReading[]> {
  try {
    const { data, error } = await supabase
      .from("zog_snapshots")
      .select("resonance_rating, created_at")
      .eq("profile_id", profileId)
      .not("resonance_rating", "is", null)
      .order("created_at", { ascending: false })
      .limit(2);
    if (error || !data) return [];
    return data.flatMap((r) =>
      typeof r.resonance_rating === "number" ? [{ value: r.resonance_rating, at: r.created_at }] : [],
    );
  } catch {
    return [];
  }
}

/** The signed-in seller's own sales (RLS: a seller reads only their own rows). null on any error. */
async function loadOwnIncome(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("sales_events")
      .select("amount_cents, currency")
      .eq("seller_user_id", userId)
      .limit(1000);
    if (error || !data) return null;
    return formatOwnIncome(data);
  } catch {
    return null;
  }
}

/**
 * The extra reads behind the U and $ cards, for the owner's House only. Nothing is shown until
 * both settle; a failed read counts as «no value», so a card never appears from a guess.
 */
export function useHouseStatsData(userId: string | null, profileId: string | null) {
  const [state, setState] = useState<{ resonance: StatReading[]; income: string | null } | null>(null);

  useEffect(() => {
    if (!userId) {
      setState(null);
      return;
    }
    let live = true;
    Promise.all([profileId ? loadResonance(profileId) : Promise.resolve([]), loadOwnIncome(userId)]).then(
      ([resonance, income]) => {
        if (live) setState({ resonance, income });
      },
    );
    return () => {
      live = false;
    };
  }, [userId, profileId]);

  return state;
}
