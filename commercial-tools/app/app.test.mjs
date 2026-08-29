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
