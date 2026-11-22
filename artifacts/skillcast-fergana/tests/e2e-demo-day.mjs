// Demo-day browser check: clicks through what judges will try.
//
//   1. Start the app (pnpm dev, or a production preview).
//   2. node artifacts/skillcast-fergana/tests/e2e-demo-day.mjs
//
// Needs Playwright (npm i -g playwright && npx playwright install chromium),
// or set CHROME_PATH to an installed Chrome. TEST_BASE_URL defaults to
// http://127.0.0.1:5173/. Exits non-zero on the first failed check.

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* try the global install */ }
  const root = execSync('npm root -g').toString().trim();
  return createRequire(`${root}/`)('playwright');
}
const { chromium } = await loadPlaywright();
const BASE = process.env.TEST_BASE_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), args: ['--no-sandbox'] });
const results = [];
const apiMisses = [];
const check = async (name, fn) => {
  try { await fn(); results.push(`PASS ${name}`); } catch (e) { results.push(`FAIL ${name}: ${e.message}`); console.log(results.join('\n')); await browser.close(); process.exit(1); }
};

async function newPage({ width = 1366, lang = 'en' } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // Failed requests are reported with their URL (the console only says "404").
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text()); });
  // Without the API server (a static preview) /api calls fail and the app uses its
  // documented fallbacks; those are noted, not failed.
  page.on('response', (r) => {
    if (r.status() < 400) return;
    const line = `${r.status()} ${r.request().method()} ${r.url()}`;
    (new URL(r.url()).pathname.startsWith('/api/') ? apiMisses : errors).push(line);
  });
  await page.addInitScript((l) => {
    if (sessionStorage.getItem('__e2e')) return;
    sessionStorage.setItem('__e2e', '1');
    localStorage.clear();
    localStorage.setItem('skillcast-poc', JSON.stringify({ state: { lang: l }, version: 0 }));
  }, lang);
  await page.goto(`${BASE}#/start`);
  await page.waitForTimeout(600);
  return { page, errors };
}
async function closeDialogs(page) {
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(700);
    if (await page.locator('[role="dialog"], [role="alertdialog"]').count()) await page.keyboard.press('Escape');
  }
}
async function loadDemo(page) {
  await page.getByTestId('try-demo-profile').first().click();
  await closeDialogs(page);
}
const state = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('skillcast-poc')).state);

await check('favicon is the Cloud & Sun SVG', async () => {
  const { page } = await newPage();
  const href = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute('href');
  const res = await page.request.get(new URL(href, BASE).href);
  assert.equal(res.status(), 200);
  assert.match(await res.text(), /M13 22H7a5 5 0 1 1 4\.9-6H13a3 3 0 0 1 0 6Z/);
  await page.close();
});

const { page, errors } = await newPage();

await check('Try Demo Profile loads a part-way synthetic learner', async () => {
  await loadDemo(page);
  await page.getByTestId('demo-banner').waitFor();
  const s = await state(page);
  assert.equal(s.demoMode, true);
  assert.ok(s.completedCourses.length > 0);
  const earned = Object.keys(s.badges).length;
  assert.ok(earned > 3 && earned < 24, `badges earned: ${earned}`);
  assert.match(page.url(), /#\/forecast\/overview$/);
});

await check('Wind Rose expanders open independently', async () => {
  await page.evaluate(() => { location.hash = '#/forecast/radar'; });
  await page.waitForTimeout(600);
  const why = page.locator('#wr-explain-why'), what = page.locator('#wr-explain-meaning');
  await why.locator('summary').click();
  assert.equal(await why.evaluate((d) => d.open), true);
  assert.equal(await what.evaluate((d) => d.open), false);
  const h = await what.evaluate((d) => d.getBoundingClientRect().height);
  assert.ok(h < 60, `closed section stretched to ${h}px`);
  await what.locator('summary').click();
  await why.locator('summary').click();
  assert.equal(await what.evaluate((d) => d.open), true);
  assert.equal(await why.evaluate((d) => d.open), false);
  assert.match(page.url(), /#\/forecast\/radar$/);
});

await check('tapping a skill on the chart opens its details', async () => {
  const spoke = page.locator('#wind-rose [data-spoke]').first();
  await spoke.click();
  const name = await page.locator('#wind-rose section[aria-live] h3').innerText();
  assert.ok(name.length > 2);
});

await check('Find courses uses the target-line colour', async () => {
  const [btn, line] = await page.evaluate(() => [
    getComputedStyle(document.querySelector('[data-testid="wr-find-courses"]')).backgroundColor,
    getComputedStyle(document.documentElement).getPropertyValue('--wr-target').trim(),
  ]);
  const hex = (rgb) => '#' + rgb.match(/\d+/g).slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
  assert.equal(hex(btn), line.toLowerCase());
});

await check('voice assistant explains the displayed Wind Rose', async () => {
  await page.getByTestId('wr-voice').click();
  await page.waitForTimeout(1200);
  const answer = (await page.locator('[role="dialog"] ol li').allInnerTexts()).pop();
  assert.match(answer, /\d+ skills on one map/);
  assert.match(answer, /you \d+, needed \d+, market \d+/);
  await page.keyboard.press('Escape');
});

await check('every badge opens its own preview without unlocking it', async () => {
  const before = JSON.stringify((await state(page)).badges);
  await page.locator('#badge-collection-target').click();
  const ids = await page.locator('[data-preview]').evaluateAll((b) => b.map((x) => x.getAttribute('data-preview')));
  assert.equal(ids.length, 24);
  for (const id of ids) {
    await page.locator(`[data-preview="${id}"]`).click();
    assert.equal(await page.locator('[data-badge-preview]').getAttribute('data-badge-preview'), id);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);
  }
  await page.keyboard.press('Escape');
  assert.equal(JSON.stringify((await state(page)).badges), before);
});

await check('Back button moves between tabs', async () => {
  await page.evaluate(() => { location.hash = '#/forecast/harada'; });
  await page.waitForTimeout(400);
  await page.goBack();
  await page.waitForTimeout(400);
  assert.match(page.url(), /#\/forecast\/radar$/);
});

await check('Leave demo restores a clean start', async () => {
  await page.getByTestId('exit-demo').click();
  await page.waitForTimeout(600);
  assert.equal((await state(page)).demoMode, false);
});

await check('no console errors during the journey', async () => {
  assert.deepEqual(errors, []);
});

for (const lang of ['en', 'ru', 'uz', 'uz-cyrl']) {
  for (const width of [1366, 390]) {
    await check(`no horizontal overflow: ${lang} @ ${width}px`, async () => {
      const { page: p } = await newPage({ width, lang });
      await loadDemo(p);
      for (const tab of ['overview', 'matches', 'radar', 'pathway', 'harada', 'progress', 'sdg', 'demand']) {
        await p.evaluate((h) => { location.hash = h; }, `#/forecast/${tab}`);
        await p.waitForTimeout(500);
        const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(over <= 0, `${tab} overflows by ${over}px`);
      }
      await p.close();
    });
  }
}

console.log(results.join('\n'));
if (apiMisses.length) console.log(`NOTE API unavailable, fallbacks used: ${[...new Set(apiMisses)].join(', ')}`);
await browser.close();
