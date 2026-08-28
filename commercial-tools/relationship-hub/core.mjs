export const STATE_KEY = "evolver_relationship_hub_v1";
export const WINDOWS = { lead: 4, client: 7, investor: 6, personal: 14, unlabeled: 5, promotional: Infinity };
export const normalize = (s = "") => String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
export const normalizeEmail = (s = "") => String(s).trim().toLowerCase();

export function stableKey(contact) {
  const name = normalize(contact.name);
  if (name.split(" ").filter(Boolean).length >= 2) return "nm:" + name;
  if (contact.email) return "em:" + normalizeEmail(contact.email);
  if (contact.profileUrn || contact.profileId) return "li:" + (contact.profileUrn || contact.profileId);
  throw new Error("Contact has no stable identity");
}
export function sourceKeys(contact) {
  return [contact.email && "em:" + normalizeEmail(contact.email), (contact.profileUrn || contact.profileId) && "li:" + (contact.profileUrn || contact.profileId)].filter(Boolean);
}
function newer(a, b) {
  if (!a) return b;
  if (!b) return a;
  return new Date(b.ts || 0) >= new Date(a.ts || 0) ? b : a;
}
export function mergeContacts(...lists) {
  const map = new Map();
  for (const raw of lists.flat()) {
    const key = raw.key || stableKey(raw), old = map.get(key);
    if (!old) {
      map.set(key, { ...raw, key, sourceKeys: sourceKeys(raw), channels: [...new Set([...(raw.channels || []), raw.channel, (raw.profileUrn || raw.profileId) && "linkedin", raw.email && "email"].filter(Boolean))] });
      continue;
    }
    map.set(key, {
      ...old, ...raw, key,
      sourceKeys: [...new Set([...(old.sourceKeys || []), ...sourceKeys(raw), ...(raw.sourceKeys || [])])],
      channels: [...new Set([...(old.channels || []), ...(raw.channels || []), raw.channel, (raw.profileUrn || raw.profileId) && "linkedin", raw.email && "email"].filter(Boolean))],
      emailActivity: newer(old.emailActivity, raw.emailActivity),
      linkedinActivity: newer(old.linkedinActivity, raw.linkedinActivity),
      commercial: { ...old.commercial, ...raw.commercial },
      state: { ...old.state, ...raw.state }
    });
  }
  return [...map.values()];
}
export function latestActivity(contact) {
  return newer(contact.emailActivity, contact.linkedinActivity) || { ts: null, lastMine: false, thread: [] };
}
export function structuralStatus(contact, now = Date.now()) {
  const activity = latestActivity(contact);
  if (!activity.ts) return { status: "ok", days: null, due: false };
  const days = Math.max(0, Math.floor((now - new Date(activity.ts).getTime()) / 86400000));
  const category = contact.state?.category || "unlabeled";
  const window = activity.lastMine ? (WINDOWS[category] ?? WINDOWS.unlabeled) : 2;
  return { status: activity.lastMine ? "wait" : "turn", days, due: days >= window };
}
const bookingRe = /\b(booked|calendly|cal\.com|calendar invite|invite sent|scheduled|confirmed for|looking forward to (our|the) (call|chat|meeting)|see you (then|on|tuesday|wednesday|thursday|friday|monday))\b/i;
const closedRe = /\b(not (a fit|interested|right now)|pass for now|no thanks|will not proceed|closed the loop)\b/i;
export function deterministicTriage(contact) {
  const activity = latestActivity(contact), messages = activity.thread || [];
  const joined = messages.slice(-8).map(m => m.text || m.body || m.content || "").join("\n");
  if (closedRe.test(joined)) return { state: "closed", reason: "Explicit close language" };
  if (bookingRe.test(joined)) {
    const marks = messages.map(m => bookingRe.test(m.text || m.body || m.content || ""));
    const lastBookingIndex = marks.lastIndexOf(true);
    const freshQuestion = messages.slice(lastBookingIndex + 1).some(m => m.mine && /\?/.test(m.text || m.body || m.content || ""));
    if (!freshQuestion) return { state: "meeting_scheduled", reason: "Deterministic booking signal" };
  }
  const structural = structuralStatus(contact);
  if (!structural.due) return { state: activity.lastMine ? "awaiting_them" : "active", reason: "Inside follow-up window" };
  return { state: "needs_followup", reason: structural.status === "turn" ? "Their reply is waiting" : "Follow-up window elapsed" };
}
export function applyBookedSnooze(contact, triage, now = Date.now()) {
  if (triage.state !== "meeting_scheduled" || contact.state?.closed) return contact;
  const current = new Date(contact.state?.snoozeUntil || 0).getTime(), proposed = now + 14 * 86400000;
  if (current >= proposed) return contact;
  return { ...contact, state: { ...contact.state, snoozeUntil: new Date(proposed).toISOString(), autoSnoozed: true, autoSnoozeTs: latestActivity(contact).ts } };
}
export function followupScore(contact, now = Date.now()) {
  const s = structuralStatus(contact, now), triage = contact.triage || deterministicTriage(contact);
  if (contact.state?.closed || triage.state === "closed" || triage.state === "meeting_scheduled") return -10000;
  const category = { investor: 35, lead: 30, client: 25, personal: 5, promotional: -100, unlabeled: 10 }[contact.state?.category || "unlabeled"];
  const back = contact.state?.snoozeUntil && new Date(contact.state.snoozeUntil) <= now ? 50 : 0;
  return (s.days || 0) * 3 + (s.status === "turn" ? 35 : 0) + (triage.state === "needs_followup" ? 60 : 0) + category + back;
}
export function adoptSavedState(contact, saved = {}) {
  if (saved[contact.key]) return { ...contact, state: { ...contact.state, ...saved[contact.key] } };
  for (const key of contact.sourceKeys || []) if (saved[key]) return { ...contact, state: { ...contact.state, ...saved[key] } };
  return contact;
}
