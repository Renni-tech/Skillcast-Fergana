// bun test src/skillcast/lib/fergana-signals.test.ts
// Manual refresh: fetches sources whose minimum interval has passed, reports
// what happened to each, and never exceeds Remotive's six-hour limit.
import { expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createFerganaSignalsService, defaultFerganaCachePath, MANUAL_MIN_INTERVAL } from './fergana-signals';

const SIAT_META = { file: 'https://api.siat.stat.uz/media/uploads/x.json', updated_at: '2026-06-01T00:00:00Z' };
const SIAT_DATA = [{ data: [
  { Klassifikator_en: 'Republic of Uzbekistan', Code: '1700', '2025': 70.1 },
  { Klassifikator_en: 'Fergana region', Code: '1730', '2025': 68.4 },
] }];
const WB = [{ lastupdated: '2026-07-01' }, [{ countryiso3code: 'UZB', value: 61.2, date: '2025', indicator: { id: 'SL.TLF.CACT.ZS' } }]];
const REMOTIVE = { jobs: [{ title: 'Data analyst', url: 'https://remotive.com/remote-jobs/data/1', publication_date: '2026-11-20T10:00:00', description: 'SQL python' }] };

function setup(fail = false) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'fergana-'));
  let now = Date.parse('2026-11-22T08:00:00Z');
  const calls: string[] = [];
  const fetcher = (async (url: string) => {
    calls.push(url);
    if (fail) return new Response('no', { status: 503 });
    const body = url.includes('siat') ? (url.includes('/media/') ? SIAT_DATA : SIAT_META) : url.includes('worldbank') ? WB : REMOTIVE;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  const service = createFerganaSignalsService({ path: path.join(dir, 'c.json'), fetcher, clock: () => now });
  return { service, calls, tick: (ms: number) => { now += ms; }, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

test('refresh fetches all sources, then respects minimum intervals', async () => {
  const { service, calls, tick, cleanup } = setup();
  const first = await service.refresh();
  expect(first.provenance.refresh?.results.map((r) => `${r.id}:${r.outcome}`)).toEqual(['siat:refreshed', 'worldbank:refreshed', 'remotive:refreshed']);
  expect(first.totalPostings).toBe(1);
  const n = calls.length;
  const again = await service.refresh();
  expect(again.provenance.refresh?.results.every((r) => r.outcome === 'rate-limited')).toBe(true);
  expect(calls.length).toBe(n);
  tick(MANUAL_MIN_INTERVAL.siat + 1000);
  const later = await service.refresh();
  expect(later.provenance.refresh?.results.map((r) => `${r.id}:${r.outcome}`)).toEqual(['siat:refreshed', 'worldbank:refreshed', 'remotive:rate-limited']);
  // GET never carries a refresh report.
  expect((await service.get()).provenance.refresh).toBeUndefined();
  cleanup();
});

test('failed refresh is reported and keeps nothing it does not have', async () => {
  const { service, cleanup } = setup(true);
  const res = await service.refresh();
  expect(res.provenance.refresh?.results.every((r) => r.outcome === 'failed' && r.error)).toBe(true);
  expect(res.provenance.mode).toBe('demo');
  expect(res.provenance.sources.every((s) => s.status === 'unavailable')).toBe(true);
  cleanup();
});

test('failed official statistics can be retried after a minute; Remotive cannot', async () => {
  const { service, tick, cleanup } = setup(true);
  await service.refresh();
  tick(61 * 1000);
  const retry = await service.refresh();
  expect(retry.provenance.refresh?.results.map((r) => `${r.id}:${r.outcome}`)).toEqual(['siat:failed', 'worldbank:failed', 'remotive:rate-limited']);
  cleanup();
});

// ── Serverless (Vercel) behaviour ─────────────────────────────────────────
// On Vercel the deployed code is read-only and only /tmp is writable.

test('cache path: explicit override, /tmp on Vercel, db/ elsewhere', () => {
  expect(defaultFerganaCachePath({ FERGANA_SIGNALS_CACHE: '/data/x.json' })).toBe('/data/x.json');
  expect(defaultFerganaCachePath({ VERCEL: '1' })).toBe(path.join(os.tmpdir(), 'skillcast', 'fergana-approved-signals.json'));
  expect(defaultFerganaCachePath({})).toBe(path.resolve('db', 'fergana-approved-signals.json'));
});

test('a cache that cannot be written does not fail the request', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'fergana-ro-'));
  const blocker = path.join(dir, 'not-a-dir');
  await Bun.write(blocker, 'file'); // a file where a directory is needed: every write fails
  const fetcher = (async (url: string) => {
    const body = url.includes('siat') ? (url.includes('/media/') ? SIAT_DATA : SIAT_META) : url.includes('worldbank') ? WB : REMOTIVE;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  const service = createFerganaSignalsService({ path: path.join(blocker, 'cache', 'c.json'), fetcher });
  const result = await service.get();
  expect(result.provenance.mode).toBe('periodic');
  expect(result.provenance.sources.map((s) => `${s.id}:${s.status}`).sort()).toEqual(['remotive:periodic', 'siat:periodic', 'worldbank:periodic']);
  rmSync(dir, { recursive: true, force: true });
});

test('one failing source keeps the others live', async () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'fergana-one-'));
  const fetcher = (async (url: string) => {
    if (url.includes('siat')) return new Response('down', { status: 502 });
    const body = url.includes('worldbank') ? WB : REMOTIVE;
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  const service = createFerganaSignalsService({ path: path.join(dir, 'c.json'), fetcher });
  const result = await service.get();
  const status = Object.fromEntries(result.provenance.sources.map((s) => [s.id, s.status]));
  expect(status).toEqual({ siat: 'unavailable', worldbank: 'periodic', remotive: 'periodic' });
  expect(result.provenance.mode).toBe('periodic');
  expect(result.totalPostings).toBe(1);
  rmSync(dir, { recursive: true, force: true });
});
