import bundledSnapshotRaw from "@/generated/crm-snapshot.json";
import { normalizeOffers, type OutreachOffer } from "@/lib/offersBoard";

export const RUNTIME_CRM_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/alexanderkonst/evolver-grid-site/main/src/generated/crm-snapshot.json";

export interface OffersSnapshot {
  generated_at?: string;
  offers?: OutreachOffer[];
}

export interface RuntimeOffersResult {
  offers: OutreachOffer[];
  generatedAt: string | null;
  source: "runtime" | "bundled";
}

const bundledSnapshot = bundledSnapshotRaw as OffersSnapshot;

const readSnapshot = (payload: unknown, source: RuntimeOffersResult["source"]): RuntimeOffersResult => {
  if (!payload || typeof payload !== "object") throw new Error("CRM snapshot is not an object.");
  const snapshot = payload as OffersSnapshot;
  if (!Array.isArray(snapshot.offers)) throw new Error("CRM snapshot has no offers array.");

  const offers = normalizeOffers(snapshot.offers);
  if (offers.length !== snapshot.offers.length) {
    throw new Error("CRM snapshot contains an invalid offer row.");
  }

  return {
    offers,
    generatedAt: typeof snapshot.generated_at === "string" ? snapshot.generated_at : null,
    source,
  };
};

export const getBundledOffers = () => readSnapshot(bundledSnapshot, "bundled");

export const fetchRuntimeOffers = async (
  fetcher: typeof fetch = fetch,
  cacheBuster = Date.now(),
): Promise<RuntimeOffersResult> => {
  const url = `${RUNTIME_CRM_SNAPSHOT_URL}?runtime=${cacheBuster}`;
  const response = await fetcher(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Runtime CRM request failed (${response.status}).`);
  return readSnapshot(await response.json(), "runtime");
};
