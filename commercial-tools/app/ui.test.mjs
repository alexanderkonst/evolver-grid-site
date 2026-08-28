import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = process.env.COMMERCIAL_OS_URL;
const siteUrl = process.env.COMMERCIAL_OS_SITE_URL;

test('mobile shell contains horizontal overflow', { skip: !url }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true);
  } finally { await browser.close(); }
});

test('Built by You loads only one live Commercial OS frame', { skip: !siteUrl }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => sessionStorage.setItem('coupon_activated', 'true'));
    let loads = 0;
    page.on('request', request => { if (request.url().endsWith('/commercial-os/')) loads++; });
    await page.goto(siteUrl, { waitUntil: 'networkidle' });
    assert.equal(loads, 1, 'responsive shell must not initialize the connector app twice');
    assert.equal(await page.locator('body').innerText().then(text => text.includes('Commercial OS')), true);
  } finally { await browser.close(); }
});
