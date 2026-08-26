export const SCHEMA = "evolver-commercial-ledger";
export const VERSION = 1;
export const STAGES = ["prospect", "connection_requested", "connected", "contacted", "replied", "call", "offered", "paid", "delivered", "expanded"];

export function emptyCommercial() {
  return {
    stage: "prospect",
    connectionRequestedAt: null,
    connectedAt: null,
    contactedAt: null,
    repliedAt: null,
    callAt: null,
    offerAt: null,
    paymentAt: null,
    deliveredAt: null,
    expansionAt: null,
    amountUsd: 0,
    offerType: null
  };
}

export function normalizeRecord(raw) {
  const profileUrn = raw.profileUrn || raw.linkedin?.profileUrn || "";
  const email = String(raw.email || raw.primaryEmail || "").toLowerCase();
  const identity = raw.id || raw.key || (profileUrn ? "linkedin:" + profileUrn : email ? "email:" + email : "");
  if (!identity) throw new Error("Ledger record has no stable identity");
  return {
    ...raw,
    id: identity,
    profileUrn,
    email,
    channels: [...new Set([...(raw.channels || []), profileUrn && "linkedin", email && "email"].filter(Boolean))],
    source: {
      channel: raw.source?.channel || (profileUrn ? "linkedin" : "email"),
      mechanism: raw.source?.mechanism || "unknown",
      searchTerm: raw.source?.searchTerm || null,
      foundByIcpId: raw.source?.foundByIcpId || raw.icpId || null,
      capturedAt: raw.source?.capturedAt || null
    },
    commercial: { ...emptyCommercial(), ...(raw.commercial || {}) },
    relationship: raw.relationship || raw.state || {},
    conversation: raw.conversation || {},
    lineage: [...new Set([...(raw.lineage || []), raw.source?.mechanism].filter(Boolean))]
  };
}

export function envelope(records, meta = {}) {
  return {
    schema: SCHEMA,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    producer: meta.producer || "unknown",
    records: records.map(normalizeRecord),
    outcomes: meta.outcomes || aggregateOutcomes(records)
  };
}

export function readEnvelope(input) {
  const rows = Array.isArray(input) ? input : input.records || input.people || input.contacts || [];
  if (!Array.isArray(rows)) throw new Error("Ledger payload contains no record array");
  if (input.schema && input.schema !== SCHEMA) throw new Error("Unsupported ledger schema: " + input.schema);
  if (input.version && input.version > VERSION) throw new Error("Ledger version is newer than this tool");
  return { records: rows.map(normalizeRecord), outcomes: input.outcomes || aggregateOutcomes(rows) };
}

export function aggregateOutcomes(records) {
  const byOrigin = {};
  for (const raw of records) {
    const r = normalizeRecord(raw);
    const key = [r.source.foundByIcpId || "unknown", r.source.searchTerm || "unknown"].join("::");
    const bucket = byOrigin[key] ||= {
      icpId: r.source.foundByIcpId || "unknown",
      searchTerm: r.source.searchTerm || "unknown",
      found: 0, connectionRequested: 0, contacted: 0, replied: 0, calls: 0, offers: 0, paid: 0, cashUsd: 0, delivered: 0, expanded: 0
    };
    bucket.found++;
    if (r.commercial.connectionRequestedAt || STAGES.indexOf(r.commercial.stage) >= STAGES.indexOf("connection_requested")) bucket.connectionRequested++;
    if (r.commercial.contactedAt || STAGES.indexOf(r.commercial.stage) >= STAGES.indexOf("contacted")) bucket.contacted++;
    if (r.commercial.repliedAt || STAGES.indexOf(r.commercial.stage) >= STAGES.indexOf("replied")) bucket.replied++;
    if (r.commercial.callAt || STAGES.indexOf(r.commercial.stage) >= STAGES.indexOf("call")) bucket.calls++;
    if (r.commercial.offerAt || STAGES.indexOf(r.commercial.stage) >= STAGES.indexOf("offered")) bucket.offers++;
    if (r.commercial.paymentAt || STAGES.indexOf(r.commercial.stage) >= STAGES.indexOf("paid")) bucket.paid++;
    bucket.cashUsd += Number(r.commercial.amountUsd || 0);
    if (r.commercial.deliveredAt || STAGES.indexOf(r.commercial.stage) >= STAGES.indexOf("delivered")) bucket.delivered++;
    if (r.commercial.expansionAt || STAGES.indexOf(r.commercial.stage) >= STAGES.indexOf("expanded")) bucket.expanded++;
  }
  return Object.values(byOrigin);
}

export function mergeLedgerRecords(...lists) {
  const map = new Map();
  for (const raw of lists.flat()) {
    const r = normalizeRecord(raw), key = r.profileUrn ? "li:" + r.profileUrn : r.email ? "em:" + r.email : r.id;
    const old = map.get(key);
    if (!old) { map.set(key, r); continue; }
    const stage = STAGES.indexOf(r.commercial.stage) > STAGES.indexOf(old.commercial.stage) ? r.commercial.stage : old.commercial.stage;
    map.set(key, {
      ...old, ...r,
      source: old.source.mechanism !== "unknown" ? old.source : r.source,
      channels: [...new Set([...old.channels, ...r.channels])],
      commercial: { ...old.commercial, ...r.commercial, stage },
      relationship: { ...old.relationship, ...r.relationship },
      lineage: [...new Set([...old.lineage, ...r.lineage])]
    });
  }
  return [...map.values()];
}
