export const STORAGE_KEY = "evolver_outreach_radar_v1";
export const SCORE_RECOMMENDED = 60;

const normalize = (value = "") => String(value).toLowerCase().replace(/\s+/g, " ").trim();

export function profileIdFromUrl(url = "") {
  const match = String(url).match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match?.[1] || "";
}

export function ownerIdFromConversationUrn(urn = "") {
  return String(urn).match(/msg_conversation:\(urn:li:fsd_profile:([^,]+)/)?.[1] || "";
}

export function conversationState(messages = [], ownerId, now = Date.now()) {
  const ordered = [...messages].sort((a, b) => new Date(a.createdAt || a.sentAt || a.timestamp) - new Date(b.createdAt || b.sentAt || b.timestamp));
  const last = ordered.at(-1);
  if (!last) return { verified: true, messageCount: 0, direction: "none", lastActivityAt: null, daysAgo: null };
  const sender = String(last.senderId || "");
  const mine = sender === ownerId || sender.endsWith(`:${ownerId}`);
  const ts = last.createdAt || last.sentAt || last.timestamp;
  return {
    verified: true,
    messageCount: ordered.length,
    direction: mine ? "mine" : "theirs",
    lastActivityAt: ts,
    daysAgo: Math.max(0, Math.floor((now - new Date(ts).getTime()) / 86400000)),
    lastText: last.text || last.body || last.content || ""
  };
}

export function canonicalLinkedInPerson(raw, source = "connection") {
  const profileUrn = raw.profileUrn || raw.participantUrn || raw.profileId || raw.profileUrl;
  if (!profileUrn) throw new Error("LinkedIn person has no stable identity");
  return {
    id: `linkedin:${profileUrn}`,
    profileUrn,
    profileId: raw.profileId || profileIdFromUrl(raw.profileUrl),
    name: raw.name || [raw.firstName, raw.lastName].filter(Boolean).join(" ") || "Unknown",
    firstName: raw.firstName || "",
    lastName: raw.lastName || "",
    headline: raw.headline || raw.currentPosition || "",
    location: raw.location || "",
    profileUrl: raw.profileUrl || "",
    score: Number(raw.score || 0),
    icpId: raw.icpId || "unclassified",
    icpName: raw.icpName || "Unclassified",
    reason: raw.reason || "Imported LinkedIn relationship",
    source: raw.source || { channel: "linkedin", mechanism: source, capturedAt: new Date().toISOString() },
    commercial: raw.commercial || { stage: "prospect", repliedAt: null, callAt: null, offerAt: null, paymentAt: null, deliveredAt: null, expansionAt: null },
    conversation: raw.conversation || { verified: false, direction: "unknown", messageCount: 0, lastActivityAt: null },
    conversationUrn: raw.conversationUrn || "",
    draft: raw.draft || "",
    sentAt: raw.sentAt || null,
    done: Boolean(raw.done)
  };
}

export function mergePeople(...lists) {
  const map = new Map();
  for (const raw of lists.flat()) {
    const person = canonicalLinkedInPerson(raw, raw.source?.mechanism);
    const old = map.get(person.profileUrn);
    if (!old) { map.set(person.profileUrn, person); continue; }
    const oldConversation = old.conversation || {};
    const newConversation = person.conversation || {};
    const conversation = new Date(newConversation.lastActivityAt || 0) >= new Date(oldConversation.lastActivityAt || 0) ? newConversation : oldConversation;
    map.set(person.profileUrn, {
      ...old,
      ...person,
      score: Math.max(old.score || 0, person.score || 0),
      source: old.source,
      commercial: { ...old.commercial, ...person.commercial },
      conversation,
      draft: person.draft || old.draft,
      done: person.done || old.done
    });
  }
  return [...map.values()];
}

export function advanceCommercial(person) {
  const p = structuredClone(person);
  if (p.commercial?.paymentAt) p.commercial.stage = "paid";
  else if (p.commercial?.offerAt) p.commercial.stage = "offered";
  else if (p.commercial?.callAt) p.commercial.stage = "call";
  else if (p.conversation?.direction === "theirs") {
    p.commercial.stage = "replied";
    p.commercial.repliedAt ||= p.conversation.lastActivityAt;
  } else if (p.sentAt || (p.conversation?.direction === "mine" && p.conversation.messageCount)) p.commercial.stage = "contacted";
  return p;
}

export function tabFor(person, now = Date.now()) {
  const c = person.conversation || {};
  const days = c.lastActivityAt ? Math.floor((now - new Date(c.lastActivityAt).getTime()) / 86400000) : null;
  return {
    recommended: person.score >= SCORE_RECOMMENDED && !person.done,
    high_priority: person.score >= SCORE_RECOMMENDED && c.messageCount > 0 && !person.done,
    never_messaged: c.verified && c.messageCount === 0 && !person.sentAt && !person.done,
    all_conversations: c.messageCount > 0 && !person.done,
    owe_reply: c.direction === "theirs" && !person.done,
    waiting: c.direction === "mine" && days >= 5 && !person.done,
    drafts: Boolean(person.draft) && !person.done,
    sent: Boolean(person.sentAt) && !person.done,
    done: Boolean(person.done)
  };
}

export function renderTemplate(template, person) {
  const company = person.company || "";
  return String(template)
    .replace(/\[\[company:\s*([\s\S]*?)\]\]/g, company ? (_, text) => text.replaceAll("{company}", company) : "")
    .replaceAll("{first}", person.firstName || person.name?.split(" ")[0] || "there")
    .replaceAll("{name}", person.name || "")
    .replaceAll("{company}", company);
}

export function parseCompany(headline = "") {
  const direct = String(headline).match(/(?:\bat\b|@)\s+([^|·,—]+?)(?=\s*[|·,—]|$)/i);
  if (direct) return direct[1].trim();
  const role = String(headline).match(/(?:founder|co-founder|owner|ceo|principal)\s+(?:of\s+)?([^|·,—]+?)(?=\s*[|·,—]|$)/i);
  return role?.[1]?.trim() || "";
}

export function updateTemplateFromDraft(person, draft){
  let t = String(draft);
  const company=(person.company||'').trim(), name=(person.name||'').trim(), first=(person.firstName||name.split(' ')[0]||'').trim();
  const subs=[];
  const rep=(val,tok)=>{ if(val&&val.length>1){ const re=new RegExp(val.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'); if(re.test(t)){ t=t.replace(re,tok); subs.push(val+' → '+tok);} } };
  rep(company,'{company}'); rep(name,'{name}'); rep(first,'{first}');
  return { template:t, subs };
}
