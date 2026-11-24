import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import type { FerganaEvidence, FerganaObservation, FerganaRefreshResult, FerganaSourceState, SkillSnapshot } from '@workspace/api-zod';
import { computeMomentum, type Posting } from './momentum';
import { SKILLS } from '../data/skills';
import { logger } from '../../lib/logger';

const HOUR = 60 * 60 * 1000;
export const FERGANA_ENDPOINTS = {
  siat: 'https://api.siat.stat.uz/sdmx/1311/table/download/?download_format=json',
  worldbank: 'https://api.worldbank.org/v2/country/UZB/indicator/SL.TLF.CACT.ZS?format=json&mrnev=1',
  remotive: 'https://remotive.com/api/remote-jobs',
} as const;
type SourceId = keyof typeof FERGANA_ENDPOINTS;
// Minimum time between manual refreshes of one source. Remotive's API terms
// allow at most four requests a day, so it keeps six hours even when a
// learner presses "Refresh". SIAT and the World Bank publish rarely; ten
// minutes stops repeated clicks from hammering them.
export const MANUAL_MIN_INTERVAL: Record<SourceId, number> = { siat: 10 * 60 * 1000, worldbank: 10 * 60 * 1000, remotive: 6 * 60 * 60 * 1000 };
type History = {
  id: string; createdAt: string; version: string; live: boolean; summary: string;
  details: { movers: Array<{ skill: string; delta: number; momentum: number }>; postings: number; sources: FerganaSourceState[]; mode: FerganaEvidence['mode'] };
};
type Cache = {
  version: 1; sources: Partial<Record<SourceId, FerganaSourceState>>;
  snapshots: SkillSnapshot[]; count: number; calculatedAt: string; history: History[];
};
const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const iso = (value: unknown): string | null => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null;

export function parseSiat(value: unknown, updatedAt: unknown): FerganaObservation[] {
  const rows = record(Array.isArray(value) ? value[0] : null).data;
  if (!Array.isArray(rows)) throw new Error('SIAT data array missing');
  const national = rows.map(record).find((row) => row.Klassifikator_en === 'Republic of Uzbekistan');
  const regional = rows.map(record).find((row) => String(row.Code) === '1730' && row.Klassifikator_en === 'Fergana region');
  if (!national || !regional || !iso(updatedAt)) throw new Error('SIAT geography or update metadata missing');
  const periods = Object.keys(national).filter((key) => /^\d{4}$/.test(key) && typeof national[key] === 'number' && typeof regional[key] === 'number').sort().reverse();
  const period = periods[0];
  if (!period) throw new Error('SIAT comparable annual period missing');
  return [
    { id: 'employment-fergana', scope: 'region', period, value: regional[period] as number, unit: '%', sourceUrl: 'https://siat.stat.uz/data/1311/?lang=en' },
    { id: 'employment-uzbekistan', scope: 'national', period, value: national[period] as number, unit: '%', sourceUrl: 'https://siat.stat.uz/data/1311/?lang=en' },
  ].filter((item) => Number.isFinite(item.value) && item.value >= 0 && item.value <= 100) as FerganaObservation[];
}

export function parseWorldBank(value: unknown): { observations: FerganaObservation[]; updated: string | null } {
  if (!Array.isArray(value) || !Array.isArray(value[1])) throw new Error('World Bank envelope missing');
  const row = value[1].map(record).find((item) => item.countryiso3code === 'UZB' && typeof item.value === 'number' && Number.isFinite(item.value) && /^\d{4}$/.test(String(item.date)));
  if (!row || record(row.indicator).id !== 'SL.TLF.CACT.ZS') throw new Error('World Bank Uzbekistan series missing');
  return {
    observations: [{ id: 'participation-uzbekistan', scope: 'national', value: row.value as number, period: String(row.date), unit: '%', sourceUrl: 'https://data.worldbank.org/indicator/SL.TLF.CACT.ZS?locations=UZ' }],
    updated: iso(record(value[0]).lastupdated),
  };
}

export function parseRemotive(value: unknown): Posting[] {
  const jobs = record(value).jobs;
  if (!Array.isArray(jobs)) throw new Error('Remotive jobs array missing');
  const unique = new Map<string, Posting>();
  for (const raw of jobs) {
    const job = record(raw);
    const date = iso(job.publication_date);
    if (typeof job.title !== 'string' || !date || typeof job.url !== 'string' || !job.url.startsWith('https://remotive.com/remote-jobs/')) continue;
    unique.set(job.url, {
      title: job.title, company: '', source: 'Remotive',
      description: String(job.description ?? '').replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' '),
      date: new Date(date), sourceDate: date, sourceDateKind: 'published',
      // Aggregation only: do not redistribute individual listings or snippets.
    });
  }
  if (jobs.length > 0 && unique.size === 0) throw new Error('Remotive has no valid dated records');
  return [...unique.values()];
}

/**
 * Where the rebuildable source cache lives. `FERGANA_SIGNALS_CACHE` wins; on
 * Vercel the deployed code is read-only and only /tmp is writable, so the cache
 * goes there; everywhere else it stays in the API's db/ folder as before.
 */
export function defaultFerganaCachePath(env: NodeJS.ProcessEnv = process.env): string {
  if (env.FERGANA_SIGNALS_CACHE) return env.FERGANA_SIGNALS_CACHE;
  if (env.VERCEL) return join(tmpdir(), 'skillcast', 'fergana-approved-signals.json');
  return resolve('db', 'fergana-approved-signals.json');
}

export function createFerganaSignalsService(options: {
  path?: string; fetcher?: typeof fetch; clock?: () => number;
} = {}) {
  const cachePath = options.path ?? defaultFerganaCachePath();
  const fetcher = options.fetcher ?? fetch;
  const clock = options.clock ?? Date.now;
  let cache: Cache | undefined;
  let pending: Promise<ReturnType<typeof payload>> | undefined;
  let pendingRefresh: Promise<ReturnType<typeof payload>> | undefined;
  const json = async (url: string) => {
    const response = await fetcher(url, { signal: AbortSignal.timeout(12000), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json() as Promise<unknown>;
  };
  const baseline = (): SkillSnapshot[] => SKILLS.map((skill) => ({
    skillSlug: skill.slug, momentum: skill.seedMomentum, frequency: 0,
    trend: 0, postings: 0, recentPostings: 0, earlierPostings: 0,
  }));
  const mode = (): FerganaEvidence['mode'] => !cache?.snapshots.length || !cache.count ? 'demo'
    : cache.sources.remotive?.status === 'cached' ? 'cached' : 'periodic';
  function payload(limited: boolean, refresh?: { requestedAt: string; results: FerganaRefreshResult[] }) {
    const state = cache!;
    const remote = state.sources.remotive;
    return {
      runId: `fergana-${state.calculatedAt}`, fetchedAt: remote?.fetchedAt ?? state.calculatedAt,
      live: false, totalPostings: state.count, confidence: 'low' as const,
      sources: remote ? [{ name: 'Remotive', url: 'https://remotive.com/remote-jobs/api', postings: state.count, ok: remote.status !== 'unavailable', kind: mode() }] : [],
      snapshots: state.snapshots.length && state.count ? state.snapshots : baseline(),
      changelog: state.history,
      provenance: {
        mode: mode(), calculatedAt: state.calculatedAt, refreshLimited: limited,
        skillSourceIds: mode() === 'demo' ? ['wef'] : ['remotive', 'wef'],
        sources: Object.values(state.sources),
        ...(refresh ? { refresh } : {}),
      } satisfies FerganaEvidence,
    };
  }
  async function run(force = false) {
    if (!cache) {
      try {
        const disk = JSON.parse(await readFile(cachePath, 'utf8')) as Cache;
        if (disk.version === 1 && disk.sources && Array.isArray(disk.history) && Array.isArray(disk.snapshots) && Number.isFinite(disk.count)) cache = disk;
      } catch { /* This is a rebuildable cache, never learner data. */ }
      cache ??= { version: 1, sources: {}, snapshots: [], count: 0, calculatedAt: new Date(clock()).toISOString(), history: [] };
    }
    const state = cache;
    const before = new Map(state.snapshots.map((item) => [item.skillSlug, item.momentum]));
    const ids: SourceId[] = ['siat', 'worldbank', 'remotive'];
    let attempted = false;
    const requestedAt = new Date(clock()).toISOString();
    const results: FerganaRefreshResult[] = [];
    await Promise.all(ids.map(async (id) => {
      const old = state.sources[id];
      if (force) {
        // After a failed attempt, official statistics may be retried after a
        // minute; Remotive's limit counts every request, so it never shortens.
        const failedLast = !!old && old.fetchedAt !== old.checkedAt;
        const wait = failedLast && id !== 'remotive' ? 60 * 1000 : MANUAL_MIN_INTERVAL[id];
        const allowedAt = old ? Date.parse(old.checkedAt) + wait : 0;
        if (allowedAt > clock()) { results.push({ id, outcome: 'rate-limited', nextAllowedAt: new Date(allowedAt).toISOString() }); return; }
      } else if (old && Date.parse(old.nextCheckAt) > clock()) return;
      attempted = true;
      const checkedAt = new Date(clock()).toISOString();
      // SIAT is annual; weekly checks suffice. Remotive explicitly permits
      // at most four checks/day; even failed attempts respect the six-hour TTL.
      const ttl = id === 'siat' ? 7 * 24 * HOUR : id === 'worldbank' ? 24 * HOUR : 6 * HOUR;
      const nextCheckAt = new Date(clock() + ttl).toISOString();
      try {
        const raw = await json(FERGANA_ENDPOINTS[id]);
        let observations: FerganaObservation[] = [];
        let sourceUpdatedAt: string | null = null;
        let period: string | null = null;
        if (id === 'siat') {
          const metadata = record(raw);
          const download = new URL(String(metadata.file));
          if (download.origin !== 'https://api.siat.stat.uz' || !download.pathname.startsWith('/media/uploads/')) throw new Error('Unexpected SIAT download host');
          observations = parseSiat(await json(download.href), metadata.updated_at);
          if (observations.length !== 2) throw new Error('SIAT values invalid');
          sourceUpdatedAt = iso(metadata.updated_at);
          period = observations[0].period;
        } else if (id === 'worldbank') {
          const parsed = parseWorldBank(raw);
          observations = parsed.observations;
          sourceUpdatedAt = parsed.updated;
          period = observations[0].period;
        } else {
          const postings = parseRemotive(raw);
          const dates = postings.map((posting) => posting.sourceDate!).sort();
          period = dates.length ? `${dates[0].slice(0, 10)} / ${dates.at(-1)!.slice(0, 10)}` : null;
          state.count = postings.length;
          state.snapshots = postings.length ? computeMomentum(postings).map(({ samples: _samples, ...snapshot }) => snapshot) : [];
        }
        state.sources[id] = { id, status: 'periodic', checkedAt, fetchedAt: checkedAt, sourceUpdatedAt, nextCheckAt, period, observations };
        if (force) results.push({ id, outcome: 'refreshed', nextAllowedAt: new Date(clock() + MANUAL_MIN_INTERVAL[id]).toISOString() });
      } catch (error) {
        if (force) results.push({ id, outcome: 'failed', nextAllowedAt: new Date(clock() + (id === 'remotive' ? MANUAL_MIN_INTERVAL[id] : 60 * 1000)).toISOString(), error: error instanceof Error ? error.message.slice(0, 120) : 'error' });
        logger.warn({ err: error, source: id }, 'Approved Fergana source unavailable');
        state.sources[id] = {
          id, status: old?.fetchedAt ? 'cached' : 'unavailable', checkedAt,
          fetchedAt: old?.fetchedAt ?? null, sourceUpdatedAt: old?.sourceUpdatedAt ?? null,
          nextCheckAt, period: old?.period ?? null, observations: old?.observations ?? [],
        };
      }
    }));
    if (attempted) {
      state.calculatedAt = new Date(clock()).toISOString();
      const movers = state.snapshots.filter((item) => before.has(item.skillSlug) && before.get(item.skillSlug) !== item.momentum)
        .map((item) => ({ skill: item.skillSlug, momentum: item.momentum, delta: item.momentum - before.get(item.skillSlug)! }));
      state.history.unshift({
        id: state.calculatedAt, createdAt: state.calculatedAt, version: 'approved-sources-v1', live: false,
        summary: 'evidence.history.summary', details: { movers, postings: state.count, mode: mode(), sources: structuredClone(Object.values(state.sources)) },
      });
      state.history = state.history.slice(0, 30);
      // The data is already fetched and held in memory; failing to save this
      // rebuildable cache (e.g. a read-only filesystem) must not fail the request.
      try {
        await mkdir(dirname(cachePath), { recursive: true });
        await writeFile(`${cachePath}.tmp`, JSON.stringify(state), 'utf8');
        await rename(`${cachePath}.tmp`, cachePath);
      } catch (error) {
        logger.warn({ err: error, cachePath }, 'Fergana signal cache could not be saved; serving from memory');
      }
    }
    const order = (a: FerganaRefreshResult) => ids.indexOf(a.id as SourceId);
    return payload(!attempted, force ? { requestedAt, results: results.sort((a, b) => order(a) - order(b)) } : undefined);
  }
  return {
    get: () => {
      pending ??= run().finally(() => { pending = undefined; });
      return pending;
    },
    /** Manual refresh: fetch every source whose minimum interval has passed. */
    refresh: () => {
      pendingRefresh ??= (pending ?? Promise.resolve()).then(() => run(true)).finally(() => { pendingRefresh = undefined; });
      return pendingRefresh;
    },
  };
}

export const ferganaSignals = createFerganaSignalsService();
