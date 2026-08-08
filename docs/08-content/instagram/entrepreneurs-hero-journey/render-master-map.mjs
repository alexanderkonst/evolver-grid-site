import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = path.resolve('docs/08-content/instagram/entrepreneurs-hero-journey');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(path.join(dir, '01-master-map.html')).href, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(dir, '01-master-map.png'), fullPage: false });
await browser.close();
