import { STAGES, emptyCommercial, normalizeRecord, profileIdFromUrl, renderTemplate, updateTemplateFromDraft, deterministicTriage, applyBookedSnooze, followupScore } from './ported-core.js';

const norm = value => String(value || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const roleRules = [
  [/(founder|co-?founder|owner|chief executive|\bceo\b|managing director|managing partner|principal)/i, 'decisionMaker', 'decision-maker'],
  [/(venture studio|startup studio|accelerator|community (founder|builder|director)|partnerships?|business development|alliances?|ecosystem lead)/i, 'partnerships', 'holds a room of founders'],
  [/(independent|self-?employed|fractional|portfolio career|solopreneur|freelance|own practice)/i, 'ownName', 'income on their own name'],
  [/(general manager|\bgm\b|director|head of|\bvp\b|vice president)/i, 'seniorLeader', 'senior leader']
];
const penaltyRe = /(open\s*to\s*work|student|intern(ship)?|recruiter|talent acquisition)/i;
const transitionRe = /(career break|sabbatical|next chapter|in transition|between ventures|between chapters|exploring|reinventing|pivoting|former|ex-founder|post-exit|what'?s next|what is next|figuring out|stepping back|stepped back|wound down|shutting down|shut down|rebuilding|on pause)/i;
// "Three or four real things going and cannot say what makes them one thing" — the deficit, read off a headline.
const severalThings = (headline = '') => (String(headline).match(/[·|•]|\s\+\s|\s&\s/g) || []).length >= 2;
// Mirror fidelity, read off the person's own vocabulary (Tribe v6.1).
// Not a measure of consciousness. A measure of whether an MF-raising offer is perceivable at all.
export function mfRead(text, config) {
  const lex = config.mfLexicon || { tiers: [] };
  const hits = [];
  let points = 0, best = 0;
  for (const tier of lex.tiers || []) {
    for (const term of tier.terms) {
      if (norm(text).includes(norm(term))) { hits.push(term); points = Math.max(points, tier.weight); best = best ? Math.min(best, tier.tier) : tier.tier; }
    }
  }
  const octave = (lex.streamMarkers?.terms || []).find(term => norm(text).includes(norm(term))) || null;
  return { points, tier: best || null, hits, octave };
}

// The cross. Three factors, multiplied, mirroring the gate structure of Technology 123:
// a zero on any one of them is not compensated by pushing harder on another.
//   MF         - can they perceive an offer of this kind at all
//   Identity   - does income already run on their own name
//   Transition - is the form that carried them actually ending
export function crossRead({ mf, identity, transition, octave }) {
  const band = value => value >= 2 ? 2 : value >= 1 ? 1 : 0;
  const m = band(mf), i = band(identity), t = band(transition);
  if (octave && m) return { klass: 'operator', register: 'myth', label: 'next octave · studio or collective' };
  if (m && i && t) return { klass: 'bullseye', register: 'myth', label: 'MF x own name x transition' };
  if (m && i && !t) return { klass: 'peer_partner', register: 'myth', label: 'faculty present, form still working' };
  if (m && !i) return { klass: 'peer', register: 'myth', label: 'resonance only, returns a peer' };
  if (!m && i && t) return { klass: 'not_yet', register: 'plain', label: 'real pain, no faculty to perceive the offer' };
  return { klass: 'cold', register: 'plain', label: 'no read' };
}

// Brief v3.0: exclusions are config data, not code, so a new one is a config edit and not a deploy.
const excludedBy = (text, config) => (config.exclusions || []).find(rule => new RegExp(rule.pattern, 'i').test(text));
const marketRe = /(united states|\busa\b|canada|united kingdom|\buk\b|australia|singapore|dubai|new york|san francisco|london|toronto|sydney|melbourne)/i;
export const OUTCOMES = ['awaiting', 'replied', 'positive', 'negative', 'no_reply'];

export function scorePerson(person, foundByIcpId, config, region = 'Global') {
  const w = config.scoreWeights, text = [person.headline, person.currentPosition, person.location].filter(Boolean).join(' · ');
  const best = config.icps.map(icp => {
    const strong = icp.strong.find(x => norm(text).includes(norm(x))), weak = icp.weak.find(x => norm(text).includes(norm(x)));
    return { icp, points: strong ? w.strongKeyword : weak ? w.weakKeyword : icp.id === foundByIcpId ? w.searchSource : 0, match: strong || weak || 'search-source only' };
  }).sort((a, b) => b.points - a.points)[0];
  const role = roleRules.find(([re]) => re.test(text));
  const degree = norm(person.connectionDegree), reach = degree.includes('2nd') ? w.reach2nd : degree.includes('1st') ? w.reach1st : w.reachOther;
  const regionPoints = region === 'Global' ? w.globalRegion : norm(person.location).includes(norm(region)) ? w.regionMatch : w.regionMiss;
  const transition = transitionRe.test(text) ? w.transition : 0, market = region === 'Global' && marketRe.test(person.location || '') ? w.topMarket : 0;
  const several = severalThings(person.headline || person.currentPosition || '') ? (w.severalThings || 0) : 0;
  const penalty = (person.isOpenToWork || penaltyRe.test(text)) ? w.penalty : 0;
  const mf = mfRead(text, config);
  const identityStrength = /(founder|co-?founder|owner|chief executive|\bceo\b|managing partner)/i.test(text) ? 2 : /(independent|self-?employed|fractional|portfolio career|solopreneur|freelance|own practice|consultant)/i.test(text) ? 1 : 0;
  const cross = crossRead({ mf: mf.tier ? (mf.tier <= 2 ? 2 : 1) : 0, identity: identityStrength, transition: transition ? 2 : 0, octave: mf.octave });
  const watch = (config.watchlist?.terms || []).find(term => norm(text).includes(norm(term))) || null;
  const rule = excludedBy(text, config);
  const exclusion = rule ? (w.exclusion || -45) : 0;
  const rolePoints = role ? w[role[1]] : w.roleUnclear;
  return { score: Math.max(0, Math.min(100, best.points + rolePoints + reach + regionPoints + transition + several + market + mf.points + penalty + exclusion)), icpId: best.icp.id, icpName: best.icp.name, streamRole: best.icp.relationship || 'client', excluded: Boolean(rule), watch, mf: { points: mf.points, tier: mf.tier, hits: mf.hits, octave: mf.octave }, klass: cross.klass, register: cross.register, crossLabel: cross.label, reason: [rule ? `EXCLUDED · ${rule.label}` : '', best.match, role?.[2] || 'role unclear', transition ? 'visible transition' : '', mf.hits.length ? `MF: ${mf.hits.slice(0,3).join(', ')}` : '', watch ? `WATCH · says "${watch}" in public` : '', cross.label, several ? 'several things going' : ''].filter(Boolean).join(' · '), breakdown: { keyword: best.points, role: rolePoints, reach, region: regionPoints, transition, several, market, mf: mf.points, penalty, exclusion } };
}

export function canonicalPerson(raw, foundByIcpId, searchTerm, config, region = 'Global', mechanism = 'icp_search') {
  const profileUrn = raw.profileUrn || raw.participantUrn || raw.profileId || raw.profileUrl;
  if (!profileUrn) throw new Error('LinkedIn person has no stable identity');
  const scored = raw.score != null && raw.icpId ? raw : scorePerson(raw, foundByIcpId, config, region);
  return normalizeRecord({ ...raw, id: `linkedin:${profileUrn}`, profileUrn, profileId: raw.profileId || profileIdFromUrl(raw.profileUrl), name: raw.name || [raw.firstName, raw.lastName].filter(Boolean).join(' ') || 'Unknown', firstName: raw.firstName || '', lastName: raw.lastName || '', headline: raw.headline || raw.currentPosition || '', company: raw.company || parseCompany(raw.headline), ...scored, source: raw.source || { channel: 'linkedin', mechanism, searchTerm: searchTerm || null, foundByIcpId: foundByIcpId || scored.icpId, capturedAt: new Date().toISOString() }, commercial: { ...emptyCommercial(), ...(raw.commercial || {}) }, conversation: raw.conversation || { verified: false, direction: 'unknown', messageCount: 0, messages: [] }, relationship: { category: 'unlabeled', note: '', snoozeUntil: null, closed: false, ...(raw.relationship || {}) } });
}

export function parseCompany(headline = '') { const match = String(headline).match(/(?:\bat\b|@)\s+([^|·,—]+?)(?=\s*[|·,—]|$)/i) || String(headline).match(/(?:founder|co-founder|owner|ceo|principal)\s+(?:of\s+)?([^|·,—]+?)(?=\s*[|·,—]|$)/i); return match?.[1]?.trim() || ''; }
export function ownerIdFromConversationUrn(urn = '') { return String(urn).match(/msg_conversation:\(urn:li:fsd_profile:([^,]+)/)?.[1] || ''; }
export function messageDirection(message, ownerId, ownerName) { const senderId = String(message.senderId || message.sender?.id || ''); if (senderId) return senderId === ownerId || senderId.endsWith(`:${ownerId}`) ? 'mine' : 'theirs'; const senderName = norm(message.senderName || message.sender?.name); if (senderName) return senderName === norm(ownerName) ? 'mine' : 'theirs'; return 'unknown'; }
export function conversationState(messages, ownerId, ownerName) { const ordered = [...messages].sort((a, b) => +new Date(a.createdAt || a.sentAt || a.timestamp) - +new Date(b.createdAt || b.sentAt || b.timestamp)); const last = ordered.at(-1); if (!last) return { verified: true, direction: 'none', messageCount: 0, lastActivityAt: null, messages: [] }; return { verified: true, direction: messageDirection(last, ownerId, ownerName), messageCount: ordered.length, lastActivityAt: last.createdAt || last.sentAt || last.timestamp, lastText: last.text || last.body || last.content || '', messages: ordered.slice(-20).map(m => ({ dir: messageDirection(m, ownerId, ownerName), text: m.text || m.body || m.content || '', ts: m.createdAt || m.sentAt || m.timestamp })) }; }

export function advanceStage(person, stage, timestamp = new Date().toISOString()) { const current = STAGES.indexOf(person.commercial.stage), next = STAGES.indexOf(stage); if (next > current) person.commercial.stage = stage; const fields = { connection_requested: 'connectionRequestedAt', connected: 'connectedAt', contacted: 'contactedAt', replied: 'repliedAt', call: 'callAt', offered: 'offerAt', paid: 'paymentAt', delivered: 'deliveredAt', expanded: 'expansionAt' }; if (fields[stage]) person.commercial[fields[stage]] ||= timestamp; return person; }
export function hydrateRelationship(person) { const contact = { ...person, state: person.relationship, linkedinActivity: person.conversation?.lastActivityAt ? { ts: person.conversation.lastActivityAt, lastMine: person.conversation.direction === 'mine', thread: (person.conversation.messages || []).map(m => ({ mine: m.dir === 'mine', text: m.text })) } : null }; const triage = deterministicTriage(contact); const snoozed = applyBookedSnooze(contact, triage); person.relationship = snoozed.state; person.triage = triage; person.followupScore = followupScore(snoozed); return person; }

const interestRe = /\b(interested|sounds useful|would be useful|tell me more|let'?s talk|open to it|yes,? please|booked|calendly|cal\.com|scheduled|confirmed for)\b/i;
const negativeRe = /\b(not (a fit|interested|right now)|pass for now|no thanks|will not proceed|closed the loop)\b/i;
export function suggestOutcome(person, now = Date.now()) { if (person.outcomeManual) return null; const sentAt = +new Date(person.outreach?.sentAt || person.sentAt || 0); if (!sentAt) return null; const inbound = (person.conversation?.messages || []).filter(m => m.dir === 'theirs' && +new Date(m.ts) > sentAt); const text = inbound.map(m => m.text).join('\n'); if (negativeRe.test(text)) return 'negative'; if (interestRe.test(text)) return 'positive'; if (inbound.length) return 'replied'; if (now - sentAt > 14 * 86400000) return 'no_reply'; return 'awaiting'; }
export function learningRows(people, groupBy = 'template') { const map = new Map(); for (const p of people) { if (!p.outreach) continue; const key = groupBy === 'icp' ? p.outreach.icpId : groupBy === 'term' ? p.outreach.searchTerm || 'unknown' : p.outreach.templateId; const row = map.get(key) || { key, sent: 0, replied: 0, positive: 0 }; row.sent++; if (['replied', 'positive'].includes(p.outcome)) row.replied++; if (p.outcome === 'positive') row.positive++; map.set(key, row); } return [...map.values()].map(r => ({ ...r, replyRate: r.sent ? r.replied / r.sent : 0, positiveRate: r.sent ? r.positive / r.sent : 0 })).sort((a, b) => b.positiveRate - a.positiveRate || b.replyRate - a.replyRate); }
export { renderTemplate, updateTemplateFromDraft };
