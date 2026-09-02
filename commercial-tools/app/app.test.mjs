import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRestConnector } from './src/connectors.js';
import { canonicalPerson, conversationState, advanceStage, suggestOutcome, learningRows } from './src/domain.js';

const config = JSON.parse(await fs.readFile(new URL('./config.json', import.meta.url)));

test('config-driven scoring uses live open-to-work penalty', () => {
  const strong = canonicalPerson({ profileUrn: 'one', firstName: 'Ada', headline: 'Former Founder · Next chapter', connectionDegree: '2nd', location: 'London' }, 'client_founder_in_transition', 'former founder', config);
  const penalized = canonicalPerson({ profileUrn: 'two', firstName: 'R', headline: 'Recruiter', isOpenToWork: true, connectionDegree: '1st' }, 'client_founder_in_transition', 'founder', config);
  assert.ok(strong.score > penalized.score);
  assert.equal(penalized.breakdown.penalty, -15);
});

test('brief v3.0 · deficit signals score up and the typology exclusion sinks a topic-perfect match', () => {
  const inTransition = canonicalPerson({ profileUrn: 'd1', firstName: 'Ava', headline: "Former Founder · Fractional COO · Exploring what's next", connectionDegree: '2nd', location: 'London' }, 'client_founder_in_transition', 'founder next chapter', config);
  assert.equal(inTransition.streamRole, 'client');
  assert.equal(inTransition.breakdown.several, 6);
  assert.equal(inTransition.breakdown.transition, 12);

  const typologyBuilder = canonicalPerson({ profileUrn: 'd2', firstName: 'Y', headline: 'Founder · building a personality assessment system for teams', connectionDegree: '2nd', location: 'London' }, 'client_founder_in_transition', 'founder', config);
  assert.equal(typologyBuilder.excluded, true);
  assert.equal(typologyBuilder.breakdown.exclusion, -45);
  assert.match(typologyBuilder.reason, /^EXCLUDED/);
  assert.ok(typologyBuilder.score < inTransition.score);
});

test('every stream has a template and the client template routes to the quiz instead of pitching', () => {
  for (const icp of config.icps) assert.ok(config.templates[icp.id], `missing template for ${icp.id}`);
  const client = config.templates.client_founder_in_transition;
  assert.match(client, /findyourtoptalent\.com\/quiz/);
  assert.doesNotMatch(client, /Direction Call/);
  assert.match(config.templates.practitioner_partners, /what do you uniquely bring/i);
});

test('the cross: MF x identity x transition routes to a class, and one zero is not compensated', () => {
  const mk = (headline, degree='2nd') => canonicalPerson({ profileUrn: headline.slice(0,8), firstName: 'X', headline, connectionDegree: degree, location: 'London' }, 'client_founder_in_transition', 't', config);

  const bullseye = mk('Integral entrepreneur · former founder · exploring what is next');
  assert.equal(bullseye.klass, 'bullseye');
  assert.equal(bullseye.register, 'myth');

  const peer = mk('Holonic systems thinker and writer on consciousness');
  assert.equal(peer.klass, 'peer');

  const partner = mk('Conscious leadership coach · founder of Northline');
  assert.equal(partner.klass, 'peer_partner');

  const octave = mk('Managing partner · conscious venture studio');
  assert.equal(octave.klass, 'operator');

  // The class Sasha has been losing time to: real pain, no faculty to perceive the offer.
  const notYet = mk('Founder · stepping back after shutting the company · figuring out what is next');
  assert.equal(notYet.klass, 'not_yet');
  assert.equal(notYet.register, 'plain');

  // MF alone must not outrank the full cross — resonance-only returns peers.
  assert.ok(bullseye.score > peer.score);
});

test('lexicon tiers are ordered by precision and the octave markers never read as client', () => {
  const t1 = config.mfLexicon.tiers.find(t => t.tier === 1);
  const t3 = config.mfLexicon.tiers.find(t => t.tier === 3);
  assert.ok(t1.weight > t3.weight, 'tier 1 must outweigh the under-test tier');
  assert.ok(t3.caution, 'the under-test tier must carry its caution');
  assert.ok(config.mfLexicon.streamMarkers.terms.includes('venture studio'));
});

test('the watchlist surfaces for human review and never opens a cold door', () => {
  const p = canonicalPerson({ profileUrn: 'w1', firstName: 'K', headline: 'Founder · cannabis and integrative wellness', connectionDegree: '2nd', location: 'Denver' }, 'client_founder_in_transition', 't', config);
  assert.equal(p.watch, 'cannabis');
  assert.match(p.reason, /WATCH/);
  assert.ok(config.watchlist.action.includes('manual'));
});

test('app.js only reads state fields that initialState actually defines', async () => {
  const source = await fs.readFile(new URL('./src/app.js', import.meta.url), 'utf8');
  const { initialState } = await import('./src/store.js');
  const keys = new Set(Object.keys(initialState({})));
  const read = [...source.matchAll(/store\.state\.([a-zA-Z_$][\w$]*)/g)].map(m => m[1]);
  const missing = [...new Set(read)].filter(k => !keys.has(k));
  assert.deepEqual(missing, [], `app.js reads state fields that do not exist: ${missing.join(', ')}`);
});

test('one vocabulary, one current brief, everything else derived', async () => {
  const { currentBrief, deriveQueries } = await import('../../scripts/sync-brief-to-tool.mjs');
  const briefsDir = new URL('../../docs/02-strategy/briefs', import.meta.url).pathname;
  const brief = currentBrief(briefsDir);

  // the tool holds a projection of the current brief file, never its own copy
  assert.equal(config.brief?.sendableText, brief.text, 'stale — run: node scripts/sync-brief-to-tool.mjs');
  assert.equal(config.brief.version, `v${brief.version}`);
  assert.doesNotMatch(brief.text, /last brief|last time|previous brief|One update/i, 'the sendable brief must stand alone');
  assert.match(brief.text, /findyourtoptalent\.com\/quiz/);

  // search surfaces are generated from the lexicon, so the words cannot disagree
  const derived = deriveQueries({ ...config.mfLexicon, watchTerms: config.watchlist?.terms });
  assert.deepEqual(config.xrayQueries, derived.xrayQueries, 'xrayQueries drifted from mfLexicon');
  assert.deepEqual(config.apiSearchTerms, derived.apiSearchTerms, 'apiSearchTerms drifted from mfLexicon');

  // every insider phrase the brief tells Boardy to look for must exist in the lexicon
  const lexTerms = config.mfLexicon.tiers.flatMap(t => t.terms.map(x => x.toLowerCase()));
  // Markers are 2-3 words. Longer quoted strings are prose examples ("an integral part of
  // the team"), not vocabulary, so they are not checked.
  for (const quoted of [...brief.text.matchAll(/"([a-z][a-z ]{4,30})"/g)].map(m => m[1].toLowerCase())) {
    const words = quoted.split(' ');
    if (words.length < 2 || words.length > 3) continue;
    if (lexTerms.some(t => t.includes(words[0]))) {
      assert.ok(lexTerms.includes(quoted), `brief names "${quoted}" but mfLexicon does not carry it`);
    }
  }
});

test('direction falls back to owner name and stage never downgrades', () => {
  const c = conversationState([{ senderName: 'Sasha K', text: 'Hello', sentAt: '2026-01-01' }], '', 'Sasha K');
  assert.equal(c.direction, 'mine');
  const person = { commercial: { stage: 'paid' } };
  advanceStage(person, 'contacted');
  assert.equal(person.commercial.stage, 'paid');
});

test('reply learning suggests but aggregate reads confirmed outcomes', () => {
  const p = { outreach: { templateId: 't1', icpId: 'i1', searchTerm: 'term', sentAt: '2026-01-01' }, conversation: { messages: [{ dir: 'theirs', ts: '2026-01-02', text: 'Interested, let us talk' }] }, outcome: 'positive' };
  assert.equal(suggestOutcome(p, +new Date('2026-01-03')), 'positive');
  assert.deepEqual(learningRows([p])[0], { key: 't1', sent: 1, replied: 1, positive: 1, replyRate: 1, positiveRate: 1 });
});

test('REST connector maps methods, auth and payload', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url: String(url), init }); return new Response(JSON.stringify({ people: [{ profileUrn: 'x' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } }); };
  const connector = createRestConnector({ baseUrl: 'https://proxy.test/api/', apiKey: 'secret', fetchImpl });
  const result = await connector.searchPeople({ keywords: 'founder', count: 5 });
  assert.equal(result.people[0].profileUrn, 'x');
  assert.equal(calls[0].url, 'https://proxy.test/api/search/people');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer secret');
  assert.deepEqual(JSON.parse(calls[0].init.body), { keywords: 'founder', count: 5 });
});

test('every network call gets one retry', async () => {
  let attempts = 0;
  const connector = createRestConnector({ baseUrl: 'https://proxy.test', fetchImpl: async () => { attempts++; if (attempts === 1) throw new TypeError('fetch failed'); return new Response('{}'); } });
  await connector.listAccounts();
  assert.equal(attempts, 2);
});
