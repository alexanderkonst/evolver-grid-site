import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRestConnector } from './src/connectors.js';
import { canonicalPerson, conversationState, advanceStage, suggestOutcome, learningRows } from './src/domain.js';

const config = JSON.parse(await fs.readFile(new URL('./config.json', import.meta.url)));

test('config-driven scoring uses live open-to-work penalty', () => {
  const strong = canonicalPerson({ profileUrn: 'one', firstName: 'Ada', headline: 'Former Founder · Next chapter', connectionDegree: '2nd', location: 'London' }, 'post_exit_founders', 'former founder', config);
  const penalized = canonicalPerson({ profileUrn: 'two', firstName: 'R', headline: 'Recruiter', isOpenToWork: true, connectionDegree: '1st' }, 'post_exit_founders', 'founder', config);
  assert.ok(strong.score > penalized.score);
  assert.equal(penalized.breakdown.penalty, -15);
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
