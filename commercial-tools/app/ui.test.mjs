import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.COMMERCIAL_OS_URL;

test('mobile shell contains horizontal overflow', { skip: !url }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
  } finally { await browser.close(); }
});
