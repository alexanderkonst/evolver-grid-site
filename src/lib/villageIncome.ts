import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * villageIncome — the village's one public number: the income of its residents (WP-12).
 * Design: docs/02-strategy/game_of_being_you.md §14.1 (economy first, governance after) and
 * §14.8 row WP-12. Town Hall and the Investor Room read it through this file and nowhere else,
 * so the two screens can never show different figures.
 *
 * Source: `sales_events`. It is written only by the service role; today its RLS lets a seller
 * read only their own rows, so the client cannot read a village-wide total (no RPC, no
 * migration here). The figure is therefore trusted only when the rows come from more than one
 * seller, which can happen only if RLS really exposes an aggregate. Until then the answer is
 * `null` and both screens say «No sales recorded yet». Nothing is invented, estimated or
 * summed from a single player's rows.
 */

export const VILLAGE_INCOME_LABEL = "Income of the village's residents";
export const VILLAGE_INCOME_EMPTY = "No sales recorded yet";

/** The rows one request reads. Past this, the figure would be partial, so it is not shown. */
const ROW_CAP = 1000;

export type VillageIncome = {
  /** Total in whole currency units. */
  total: number;
  /** ISO 4217 code shared by every counted sale. */
  currency: string;
};

type SaleRow = {
  seller_user_id: string;
  amount_cents: number | null;
  currency: string | null;
};

/**
 * The total of a set of rows, or null when it cannot honestly be called the village's:
 * fewer than two sellers, no amounts, mixed currencies, or a truncated read.
 */
export const summarizeVillageIncome = (rows: readonly SaleRow[]): VillageIncome | null => {
  if (rows.length >= ROW_CAP) return null;
  const sellers = new Set(rows.map((r) => r.seller_user_id));
  if (sellers.size < 2) return null;
  const paid = rows.filter(
    (r): r is SaleRow & { amount_cents: number; currency: string } =>
      typeof r.amount_cents === "number" && !!r.currency,
  );
  if (paid.length === 0) return null;
  const currencies = new Set(paid.map((r) => r.currency.toUpperCase()));
  if (currencies.size !== 1) return null;
  const cents = paid.reduce((sum, r) => sum + r.amount_cents, 0);
  return { total: cents / 100, currency: Array.from(currencies)[0] };
};

/** «$1,250» — whole units, no fraction unless there is one. */
export const formatVillageIncome = ({ total, currency }: VillageIncome): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: Number.isInteger(total) ? 0 : 2,
    }).format(total);
  } catch {
    return `${total.toLocaleString("en-US")} ${currency}`;
  }
};

/** Read the figure through the existing client. Null on any error, no rows, or an unreadable aggregate. */
export const loadVillageIncome = async (): Promise<VillageIncome | null> => {
  try {
    const { data, error } = await supabase
      .from("sales_events")
      .select("seller_user_id, amount_cents, currency")
      .limit(ROW_CAP);
    if (error || !data) return null;
    return summarizeVillageIncome(data);
  } catch {
    return null;
  }
};

export type VillageIncomeState = {
  loading: boolean;
  income: VillageIncome | null;
};

/** The figure for a screen: `loading` until the read settles, then the income or null (the empty state). */
export const useVillageIncome = (): VillageIncomeState => {
  const [state, setState] = useState<VillageIncomeState>({ loading: true, income: null });
  useEffect(() => {
    let cancelled = false;
    loadVillageIncome().then((income) => {
      if (!cancelled) setState({ loading: false, income });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
};

/** The text under the label: the formatted figure, or the empty state. */
export const villageIncomeText = (income: VillageIncome | null): string =>
  income ? formatVillageIncome(income) : VILLAGE_INCOME_EMPTY;
