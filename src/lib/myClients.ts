import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatDate, formatNumber } from "@/i18n/format";

/**
 * myClients — who bought from the signed-in player (spec row A7, clients part).
 * Design: docs/02-strategy/game_launch_spec.md row A7.
 *
 * Source: `sales_events`. RLS lets a seller read only their own rows ("Sellers read their own
 * sales"); the query also filters on the seller's id, so the screen never depends on RLS alone.
 * The client only reads: `sales_events` is written by the service role.
 */

/** The columns the Clients list reads. */
export type SaleRow = {
  id: string;
  buyer_first_name: string | null;
  offer_ref: string | null;
  amount_cents: number | null;
  currency: string | null;
  occurred_at: string;
};

/** One line of the Clients list, ready to draw. `buyer: null` means «A client» (a translated label). */
export type Client = {
  id: string;
  buyer: string | null;
  offer: string | null;
  /** Formatted amount (with currency when present), or null when the sale has no amount. */
  amount: string | null;
  /** Formatted date. */
  date: string;
  /** For sorting and tests. */
  occurredAt: number;
};

/** The rows one request reads. The list is for a single seller; this is a generous ceiling. */
const ROW_CAP = 200;

const text = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

/** The first word of the buyer's name. The column holds a first name; this keeps a stray surname off the screen. */
const firstName = (value: string | null | undefined): string | null => {
  const trimmed = text(value);
  return trimmed ? trimmed.split(/\s+/)[0] : null;
};

/** «$250» with a currency, «250» without one, null when the sale has no amount. */
export const saleAmountText = (
  amountCents: number | null,
  currency: string | null,
): string | null => {
  if (typeof amountCents !== "number" || !Number.isFinite(amountCents)) return null;
  const units = amountCents / 100;
  const fraction = { maximumFractionDigits: Number.isInteger(units) ? 0 : 2 };
  const code = text(currency)?.toUpperCase();
  if (!code) return formatNumber(units, fraction);
  try {
    return formatCurrency(units, code, fraction);
  } catch {
    return `${formatNumber(units, fraction)} ${code}`;
  }
};

/** Rows → Clients list, newest first. */
export const toClients = (rows: readonly SaleRow[]): Client[] =>
  rows
    .map((r) => {
      const occurredAt = new Date(r.occurred_at).getTime();
      return {
        id: r.id,
        buyer: firstName(r.buyer_first_name),
        offer: text(r.offer_ref),
        amount: saleAmountText(r.amount_cents, r.currency),
        date: Number.isNaN(occurredAt) ? "" : formatDate(occurredAt),
        occurredAt: Number.isNaN(occurredAt) ? 0 : occurredAt,
      };
    })
    .sort((a, b) => b.occurredAt - a.occurredAt);

/** Read the seller's own sales. Throws on a failed read, so the screen can tell «none» from «could not load». */
export const loadMyClients = async (sellerUserId: string): Promise<Client[]> => {
  const { data, error } = await supabase
    .from("sales_events")
    .select("id, buyer_first_name, offer_ref, amount_cents, currency, occurred_at")
    .eq("seller_user_id", sellerUserId)
    .order("occurred_at", { ascending: false })
    .limit(ROW_CAP);
  if (error) throw error;
  return toClients(data ?? []);
};

export type MyClientsState = {
  loading: boolean;
  /** No signed-in player: the section is not drawn. */
  signedIn: boolean;
  failed: boolean;
  clients: Client[];
};

/** The Clients list for the signed-in player. */
export const useMyClients = (): MyClientsState => {
  const [state, setState] = useState<MyClientsState>({
    loading: true,
    signedIn: true,
    failed: false,
    clients: [],
  });
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id;
        if (!userId) {
          if (!cancelled) setState({ loading: false, signedIn: false, failed: false, clients: [] });
          return;
        }
        const clients = await loadMyClients(userId);
        if (!cancelled) setState({ loading: false, signedIn: true, failed: false, clients });
      } catch {
        if (!cancelled) setState({ loading: false, signedIn: true, failed: true, clients: [] });
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);
  return state;
};
