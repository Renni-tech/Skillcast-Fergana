// bun test src/skillcast/lib/fergana-sources.test.ts
// The six-source Fergana signal pipeline: live data, malformed and slow
// sources, partial failure, fallback, automatic and manual refresh, freshness
// metadata and geographic scope. All network calls are mocked.
import { expect, test } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { activeSourceIds, createFerganaSignalsService, SOURCE_CONFIG, SOURCE_IDS } from './fergana-signals';
import { computeMomentum, momentumFromTagged, tagPostings, type Posting } from './momentum';

const NOW = Date.parse('2026-11-22T08:00:00Z');
const day = (n: number) => new Date(NOW - n * 86400000).toISOString();
const SIAT_META = { file: 'https://api.siat.stat.uz/media/uploads/x.json', updated_at: '2026-06-01T00:00:00Z' };
const SIAT_DATA = [{ data: [
  { Klassifikator_en: 'Republic of Uzbekistan', Code: '1700', '2025': 70.1 },
  { Klassifikator_en: 'Fergana region', Code: '1730', '2025': 68.4 },
] }];
const WB = [{ lastupdated: '2026-07-01' }, [{ countryiso3code: 'UZB', value: 61.2, date: '2025', indicator: { id: 'SL.TLF.CACT.ZS' } }]];
const REMOTIVE = { jobs: [{ title: 'Data analyst', url: 'https://remotive.com/remote-jobs/data/1', publication_date: day(2), description: 'SQL python' }] };
const ARBEITNOW = { data: [
  { title: 'Python developer', company_name: 'A', description: 'python sql', created_at: Math.floor((NOW - 3 * 86400000) / 1000) },
  { title: 'Marketing lead', company_name: 'B', description: 'digital marketing', created_at: Math.floor((NOW - 40 * 86400000) / 1000) },
] };
const BOARD = (title: string) => ({ jobs: [{ title, content: 'machine learning python', updated_at: day(1), updatedAt: day(1), descriptionPlain: 'machine learning python' }] });

type Behaviour = Partial<Record<'siat' | 'worldbank' | 'remotive' | 'arbeitnow' | 'greenhouse' | 'ashby', 'ok' | 'down' | 'malformed' | 'invalid' | 'timeout'>>;

function setup(behaviour: Behaviour = {}, opts: { sources?: typeof SOURCE_IDS } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'fergana-src-'));
  let now = NOW;
  const calls: string[] = [];
  const sourceOf = (url: string) => url.includes('siat') ? 'siat' : url.includes('worldbank') ? 'worldbank' : url.includes('remotive') ? 'remotive'
    : url.includes('arbeitnow') ? 'arbeitnow' : url.includes('greenhouse') ? 'greenhouse' : 'ashby';
  const fetcher = (async (url: string, init?: RequestInit) => {
    calls.push(url);
    const id = sourceOf(url);
    const how = behaviour[id] ?? 'ok';
    if (how === 'down') return new Response('unavailable', { status: 503 });
    if (how === 'malformed') return new Response('<html>maintenance</html>', { status: 200 });
    if (how === 'invalid') return new Response(JSON.stringify({ unexpected: true }), { status: 200 });
    if (how === 'timeout') {
      return new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason)));
    }
    if (id === 'arbeitnow' && url.includes('page=')) return new Response(JSON.stringify({ data: [] }), { status: 200 });
    const body = id === 'siat' ? (url.includes('/media/') ? SIAT_DATA : SIAT_META) : id === 'worldbank' ? WB : id === 'remotive' ? REMOTIVE
      : id === 'arbeitnow' ? ARBEITNOW : BOARD(`${id} job`);
    return new Response(JSON.stringify(body), { status: 200 });
  }) as unknown as typeof fetch;
  const service = createFerganaSignalsService({ path: path.join(dir, 'c.json'), fetcher, clock: () => now, timeoutMs: 30, retryDelayMs: 1, sources: opts.sources ?? SOURCE_IDS });
  return { service, calls, tick: (ms: number) => { now += ms; }, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}
const byId = (res: Awaited<ReturnType<ReturnType<typeof createFerganaSignalsService>['get']>>) =>
  Object.fromEntries(res.provenance.sources.map((s) => [s.id, s]));

test('successful live response: all six sources live with freshness metadata', async () => {
  const { service, cleanup } = setup();
  const res = await service.get();
  const s = byId(res);
  expect(Object.keys(s).sort()).toEqual([...SOURCE_IDS].sort());
  for (const id of SOURCE_IDS) {
    expect(s[id].state).toBe('live');
    expect(s[id].status).toBe('periodic');
    expect(s[id].fetchedAt).toBe(new Date(NOW).toISOString());
    expect(s[id].checkedAt).toBe(s[id].fetchedAt);
    expect(s[id].error).toBeNull();
    expect(s[id].recordCount).toBeGreaterThan(0);
    expect(s[id].refreshMinutes).toBe(SOURCE_CONFIG[id].refreshMinutes);
    expect(['high', 'medium', 'low']).toContain(s[id].confidence);
  }
  expect(s.siat.confidence).toBe('high');
  expect(res.live).toBe(true);
  expect(res.provenance.mode).toBe('periodic');
  expect(res.totalPostings).toBe(1 + 2 + 10 + 5); // remotive + arbeitnow + one job per board
  expect(res.provenance.skillSourceIds).toEqual(['remotive', 'arbeitnow', 'greenhouse', 'ashby', 'wef']);
  // Internal compact postings never leak into the response.
  expect(JSON.stringify(res)).not.toContain('"tagged"');
  cleanup();
});

test('geographic scope is explicit: region, national, remote, global', async () => {
  const { service, cleanup } = setup();
  const s = byId(await service.get());
  expect(s.siat.scopes).toEqual(['region', 'national']);
  expect(s.siat.observations.map((o) => o.scope).sort()).toEqual(['national', 'region']);
  expect(s.worldbank.scopes).toEqual(['national']);
  expect(s.remotive.scopes).toEqual(['remote']);
  for (const id of ['arbeitnow', 'greenhouse', 'ashby'] as const) expect(s[id].scopes).toEqual(['global']);
  expect(s.siat.kind).toBe('statistics');
  expect(s.greenhouse.kind).toBe('postings');
  cleanup();
});

test('malformed and invalid responses become errors without affecting other sources', async () => {
  const { service, cleanup } = setup({ worldbank: 'malformed', arbeitnow: 'invalid' });
  const s = byId(await service.get());
  expect(s.worldbank.state).toBe('error');
  expect(s.worldbank.error).toContain('malformed');
  expect(s.arbeitnow.state).toBe('error');
  expect(s.arbeitnow.error).toContain('data array missing');
  for (const id of ['siat', 'remotive', 'greenhouse', 'ashby'] as const) expect(s[id].state).toBe('live');
  cleanup();
});

test('a timeout is retried once, then reported as an error', async () => {
  const { service, calls, cleanup } = setup({ greenhouse: 'timeout' }, { sources: ['greenhouse', 'siat'] });
  const s = byId(await service.get());
  expect(s.greenhouse.state).toBe('error');
  expect(s.greenhouse.error).toContain('all 10 Greenhouse boards failed');
  expect(calls.filter((u) => u.includes('greenhouse/') || u.includes('greenhouse.io')).length).toBe(20); // 10 boards × (1 + 1 retry)
  expect(s.siat.state).toBe('live');
  cleanup();
});

test('an unavailable API (HTTP 503) is retried once, then reported', async () => {
  const { service, calls, cleanup } = setup({ siat: 'down' }, { sources: ['siat'] });
  const s = byId(await service.get());
  expect(s.siat.state).toBe('error');
  expect(s.siat.error).toBe('HTTP 503');
  expect(calls.length).toBe(2);
  cleanup();
});

test('fallback: a later failure keeps the last good data, marked as fallback', async () => {
  const behaviour: Behaviour = {};
  const { service, tick, cleanup } = setup(behaviour, { sources: ['arbeitnow', 'worldbank'] });
  const first = byId(await service.get());
  expect(first.arbeitnow.state).toBe('live');
  tick(16 * 60 * 1000);
  behaviour.arbeitnow = 'down';
  behaviour.worldbank = 'down';
  const res = await service.get();
  const s = byId(res);
  expect(s.arbeitnow.state).toBe('fallback');
  expect(s.arbeitnow.status).toBe('cached');
  expect(s.arbeitnow.fetchedAt).toBe(first.arbeitnow.fetchedAt); // last success, not now
  expect(s.arbeitnow.checkedAt).not.toBe(s.arbeitnow.fetchedAt);
  expect(s.arbeitnow.error).toBe('HTTP 503');
  expect(s.arbeitnow.recordCount).toBe(2);
  expect(s.worldbank.state).toBe('fallback');
  expect(s.worldbank.observations[0].value).toBe(61.2);
  expect(res.provenance.mode).toBe('cached'); // postings exist, but none live now
  expect(res.live).toBe(false);
  expect(res.totalPostings).toBe(2);
  cleanup();
});

test('automatic refresh: within the interval nothing is re-fetched; after it, only due sources are', async () => {
  const { service, calls, tick, cleanup } = setup({}, { sources: ['siat', 'worldbank', 'remotive'] });
  await service.get();
  const n = calls.length;
  tick(5 * 60 * 1000);
  const cached = await service.get();
  expect(calls.length).toBe(n);
  expect(cached.provenance.refreshLimited).toBe(true);
  tick(11 * 60 * 1000); // 16 min: statistics due, Remotive (6 h, provider limit) not
  const res = await service.get();
  const fetched = calls.slice(n);
  expect(fetched.some((u) => u.includes('siat'))).toBe(true);
  expect(fetched.some((u) => u.includes('worldbank'))).toBe(true);
  expect(fetched.some((u) => u.includes('remotive'))).toBe(false);
  const s = byId(res);
  expect(Date.parse(s.siat.fetchedAt!)).toBe(NOW + 16 * 60 * 1000); // timestamp moved
  expect(Date.parse(s.remotive.fetchedAt!)).toBe(NOW);              // still the earlier fetch
  cleanup();
});

test('manual refresh: fresh timestamps, per-source limits, no duplicate concurrent runs', async () => {
  const { service, calls, tick, cleanup } = setup({}, { sources: ['siat', 'remotive'] });
  await service.get();
  tick(3 * 60 * 1000);
  const n = calls.length;
  const [a, b] = await Promise.all([service.refresh(), service.refresh()]);
  expect(a).toBe(b); // same in-flight run
  expect(a.provenance.refresh?.results.map((r) => `${r.id}:${r.outcome}`)).toEqual(['siat:refreshed', 'remotive:rate-limited']);
  expect(calls.slice(n).filter((u) => u.includes('siat')).length).toBe(2); // metadata + file, once
  expect(Date.parse(byId(a).siat.fetchedAt!)).toBe(NOW + 3 * 60 * 1000);
  cleanup();
});

test('concurrent GETs share one fetch', async () => {
  const { service, calls, cleanup } = setup({}, { sources: ['worldbank'] });
  await Promise.all([service.get(), service.get(), service.get()]);
  expect(calls.length).toBe(1);
  cleanup();
});

test('no posting source available: labelled demo baseline, never called live', async () => {
  const { service, cleanup } = setup({ remotive: 'down', arbeitnow: 'down', greenhouse: 'down', ashby: 'down' });
  const res = await service.get();
  expect(res.provenance.mode).toBe('demo');
  expect(res.live).toBe(false);
  expect(res.totalPostings).toBe(0);
  expect(byId(res).siat.state).toBe('live'); // statistics are independent
  cleanup();
});

test('compact tagged postings give exactly the same momentum as full postings', () => {
  const now = Date.now();
  const postings: Posting[] = [
    { title: 'Data analyst', company: 'x', description: 'SQL, Python and Excel dashboards', source: 't', date: new Date(now - 2 * 86400000) },
    { title: 'ML engineer', company: 'y', description: 'machine learning, python, prompt engineering', source: 't', date: new Date(now - 40 * 86400000) },
    { title: 'Solar technician', company: 'z', description: 'solar PV installation', source: 't', date: new Date(now - 10 * 86400000) },
  ];
  const full = computeMomentum(postings).map(({ samples: _s, ...rest }) => rest);
  expect(momentumFromTagged(tagPostings(postings), now)).toEqual(full);
});

test('production runs only the approved sources unless extra job boards are opted in', () => {
  expect(activeSourceIds({})).toEqual(['siat', 'worldbank', 'remotive']);
  expect(activeSourceIds({ FERGANA_EXTRA_SOURCES: 'greenhouse, Ashby' })).toEqual(['siat', 'worldbank', 'remotive', 'greenhouse', 'ashby']);
  expect(activeSourceIds({ FERGANA_EXTRA_SOURCES: 'all' })).toEqual([...SOURCE_IDS]);
  expect(activeSourceIds({ FERGANA_EXTRA_SOURCES: 'unknown' })).toEqual(['siat', 'worldbank', 'remotive']);
});
