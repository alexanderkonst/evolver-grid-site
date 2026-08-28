import { STAGES, emptyCommercial, normalizeRecord, profileIdFromUrl, renderTemplate, updateTemplateFromDraft, deterministicTriage, applyBookedSnooze, followupScore } from './ported-core.js';

const norm = value => String(value || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const roleRules = [
  [/(founder|co-?founder|owner|chief executive|\bceo\b|managing director|principal)/i, 'decisionMaker', 'decision-maker'],
  [/(partnerships?|business development|alliances?|ecosystem lead)/i, 'partnerships', 'partnership owner'],
  [/(general manager|\bgm\b|director|head of|\bvp\b|vice president)/i, 'seniorLeader', 'senior leader']
];
const penaltyRe = /(open\s*to\s*work|student|intern(ship)?|recruiter|talent acquisition)/i;
const transitionRe = /(career break|sabbatical|next chapter|in transition|exploring|reinventing|pivoting|former|ex-founder|post-exit)/i;
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
  const penalty = (person.isOpenToWork || penaltyRe.test(text)) ? w.penalty : 0;
  const rolePoints = role ? w[role[1]] : w.roleUnclear;
  return { score: Math.max(0, Math.min(100, best.points + rolePoints + reach + regionPoints + transition + market + penalty)), icpId: best.icp.id, icpName: best.icp.name, reason: [best.match, role?.[2] || 'role unclear', transition ? 'visible transition' : ''].filter(Boolean).join(' · '), breakdown: { keyword: best.points, role: rolePoints, reach, region: regionPoints, transition, market, penalty } };
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
