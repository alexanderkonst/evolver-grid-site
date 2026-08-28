import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

test('Vercel leaves the standalone Commercial OS path out of the SPA rewrite', async () => {
  const config = JSON.parse(await fs.readFile(new URL('../../vercel.json', import.meta.url)));
  assert.match(config.rewrites[0].source, /commercial-os/);
  assert.match(config.headers[1].source, /commercial-os/);
});
