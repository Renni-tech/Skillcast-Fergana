import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import type { FerganaEvidence, FerganaObservation, FerganaRefreshResult, FerganaSourceState, SkillSnapshot } from '@workspace/api-zod';
import { ARBEITNOW_URL, ASHBY_ORGS, GREENHOUSE_BOARDS, momentumFromTagged, stripHtml, tagPostings, type Posting, type TaggedPosting } from './momentum';
import { SKILLS } from '../data/skills';
import { logger } from '../../lib/logger';

const MIN = 60 * 1000;

// ─── Sources ────────────────────────────────────────────────────────────────
// Every external source of the Fergana signal pipeline. Statistics give the
// regional/national context; postings feed the Skill Momentum Index.
export const FERGANA_ENDPOINTS = {
  siat: 'https://api.siat.stat.uz/sdmx/1311/table/download/?download_format=json',
  worldbank: 'https://api.worldbank.org/v2/country/UZB/indicator/SL.TLF.CACT.ZS?format=json&mrnev=1',
  remotive: 'https://remotive.com/api/remote-jobs',
  arbeitnow: ARBEITNOW_URL,
  greenhouse: 'https://boards-api.greenhouse.io/v1/boards/{board}/jobs?content=true',
  ashby: 'https://api.ashbyhq.com/posting-api/job-board/{org}',
} as const;
export type SourceId = keyof typeof FERGANA_ENDPOINTS;
export const SOURCE_IDS: SourceId[] = ['siat', 'worldbank', 'remotive', 'arbeitnow', 'greenhouse', 'ashby'];
type Scope = FerganaSourceState['scopes'][number];

/**
 * Per-source refresh policy, set by each provider's own limits:
 * - refreshMinutes: how old a successful result may get before the next page
 *   view re-checks the source (the frontend re-requests every 10 minutes).
 * - manualMinMinutes: minimum gap between "Refresh signals" checks.
 * - failRetryMinutes: wait after a failed automatic check.
 * Remotive's API notice asks for at most four requests a day (its data is also
 * delayed 24 h), so it stays at six hours. Arbeitnow updates hourly; SIAT and
 * the World Bank publish rarely, so 15-minute checks are cheap and polite.
 */
export const SOURCE_CONFIG: Record<SourceId, { kind: 'statistics' | 'postings'; scopes: Scope[]; refreshMinutes: number; manualMinMinutes: number; failRetryMinutes: number }> = {
  siat: { kind: 'statistics', scopes: ['region', 'national'], refreshMinutes: 15, manualMinMinutes: 2, failRetryMinutes: 2 },
  worldbank: { kind: 'statistics', scopes: ['national'], refreshMinutes: 15, manualMinMinutes: 2, failRetryMinutes: 2 },
  remotive: { kind: 'postings', scopes: ['remote'], refreshMinutes: 360, manualMinMinutes: 360, failRetryMinutes: 360 },
  arbeitnow: { kind: 'postings', scopes: ['global'], refreshMinutes: 15, manualMinMinutes: 5, failRetryMinutes: 5 },
  greenhouse: { kind: 'postings', scopes: ['global'], refreshMinutes: 15, manualMinMinutes: 5, failRetryMinutes: 5 },
  ashby: { kind: 'postings', scopes: ['global'], refreshMinutes: 15, manualMinMinutes: 5, failRetryMinutes: 5 },
};
/** Sources on the approved Fergana list; these run by default. */
export const APPROVED_SOURCE_IDS: SourceId[] = ['siat', 'worldbank', 'remotive'];
const OPTIONAL_SOURCE_IDS: SourceId[] = ['arbeitnow', 'greenhouse', 'ashby'];

/**
 * Arbeitnow, Greenhouse and Ashby are not on the approved Fergana source list,
 * so they run only when FERGANA_EXTRA_SOURCES names them, comma-separated
 * (for example "arbeitnow,greenhouse,ashby", or "all").
 */
export function activeSourceIds(env: Record<string, string | undefined> = process.env): SourceId[] {
  const raw = (env.FERGANA_EXTRA_SOURCES ?? '').toLowerCase().split(',').map((v) => v.trim()).filter(Boolean);
  const extra = raw.includes('all') ? OPTIONAL_SOURCE_IDS : OPTIONAL_SOURCE_IDS.filter((id) => raw.includes(id));
  return [...APPROVED_SOURCE_IDS, ...extra];
}

export const MANUAL_MIN_INTERVAL = Object.fromEntries(SOURCE_IDS.map((id) => [id, SOURCE_CONFIG[id].manualMinMinutes * MIN])) as Record<SourceId, number>;

type StoredSource = FerganaSourceState & { tagged?: TaggedPosting[] };
type History = {
  id: string; createdAt: string; version: string; live: boolean; summary: string;
  details: { movers: Array<{ skill: string; delta: number; momentum: number }>; postings: number; sources: FerganaSourceState[]; mode: FerganaEvidence['mode'] };
};
type Cache = {
  version: 2; sources: Partial<Record<SourceId, StoredSource>>;
  snapshots: SkillSnapshot[]; count: number; calculatedAt: string; history: History[];
};
/** What an adapter returns after fetching, validating and normalising one source. */
type Fetched = { observations: FerganaObservation[]; tagged?: TaggedPosting[]; sourceUpdatedAt: string | null; period: string | null; recordCount: number };
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


const dateRange = (tagged: TaggedPosting[]): string | null => {
  if (!tagged.length) return null;
  const times = tagged.map((p) => p.t).sort((a, b) => a - b);
  return `${new Date(times[0]).toISOString().slice(0, 10)} / ${new Date(times.at(-1)!).toISOString().slice(0, 10)}`;
};

export function parseArbeitnow(value: unknown): Posting[] {
  const data = record(value).data;
  if (!Array.isArray(data)) throw new Error('Arbeitnow data array missing');
  return data.map(record).filter((j) => typeof j.title === 'string' && typeof j.created_at === 'number').map((j) => ({
    title: j.title as string, company: String(j.company_name ?? ''), source: 'Arbeitnow',
    description: stripHtml(String(j.description ?? '')), date: new Date((j.created_at as number) * 1000),
  }));
}

/** Greenhouse and Ashby boards share a shape: a jobs array with a title, text and a date. */
export function parseBoard(value: unknown, source: 'Greenhouse' | 'Ashby', board: string): Posting[] {
  const jobs = record(value).jobs;
  if (!Array.isArray(jobs)) throw new Error(`${source} ${board}: jobs array missing`);
  const out: Posting[] = [];
  for (const raw of jobs.slice(0, 150)) {
    const j = record(raw);
    const date = iso(source === 'Greenhouse' ? j.updated_at : j.updatedAt ?? j.createdAt);
    if (typeof j.title !== 'string' || !date) continue;
    const text = source === 'Greenhouse' ? j.content : j.descriptionHtml ?? j.descriptionPlain;
    out.push({ title: j.title, company: board, source, description: `[${board}] ${stripHtml(String(text ?? ''))}`, date: new Date(date) });
  }
  return out;
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
  /** Which sources to use (default: approved list plus FERGANA_EXTRA_SOURCES). */
  sources?: SourceId[];
  /** Per-request timeout and the pause before the single retry. */
  timeoutMs?: number; retryDelayMs?: number;
} = {}) {
  const cachePath = options.path ?? defaultFerganaCachePath();
  const fetcher = options.fetcher ?? fetch;
  const clock = options.clock ?? Date.now;
  const ids = options.sources ?? activeSourceIds();
  const timeoutMs = options.timeoutMs ?? 10_000;
  const retryDelayMs = options.retryDelayMs ?? 400;
  let cache: Cache | undefined;
  let pending: Promise<ReturnType<typeof payload>> | undefined;
  let pendingRefresh: Promise<ReturnType<typeof payload>> | undefined;

  /**
   * GET JSON with a timeout. Retries once after a short pause on network
   * errors, timeouts and 5xx; never on 4xx/429 (a refusal is final) or on a
   * malformed body.
   */
  const json = async (url: string): Promise<unknown> => {
    for (let attempt = 0; ; attempt++) {
      let response: Response;
      try {
        response = await fetcher(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json', 'User-Agent': 'SkillCast-Fergana/1.0 (skills research; aggregate counts only)' } });
      } catch (error) {
        const timedOut = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
        if (attempt === 0) { await new Promise((r) => setTimeout(r, retryDelayMs)); continue; }
        throw new Error(timedOut ? `timeout after ${timeoutMs} ms` : `network error: ${error instanceof Error ? error.message : 'unknown'}`);
      }
      if (!response.ok) {
        if (response.status >= 500 && attempt === 0) { await new Promise((r) => setTimeout(r, retryDelayMs)); continue; }
        throw new Error(`HTTP ${response.status}`);
      }
      try { return await response.json() as unknown; } catch { throw new Error('malformed response (not JSON)'); }
    }
  };

  /** Fetches the boards a few at a time; partial board failures are tolerated. */
  const boards = async (source: 'Greenhouse' | 'Ashby', names: readonly string[], url: (b: string) => string) => {
    const postings: Posting[] = [];
    const failed: string[] = [];
    for (let i = 0; i < names.length; i += 4) {
      await Promise.all(names.slice(i, i + 4).map(async (b) => {
        try { postings.push(...parseBoard(await json(url(b)), source, b)); } catch (error) {
          failed.push(b);
          logger.warn({ err: error, board: b, source }, 'Job board unavailable');
        }
      }));
    }
    if (failed.length === names.length) throw new Error(`all ${names.length} ${source} boards failed`);
    return postings;
  };

  // ─── Adapters: fetch → validate → normalise ──────────────────────────────
  const adapters: Record<SourceId, () => Promise<Fetched>> = {
    siat: async () => {
      const metadata = record(await json(FERGANA_ENDPOINTS.siat));
      const download = new URL(String(metadata.file));
      if (download.origin !== 'https://api.siat.stat.uz' || !download.pathname.startsWith('/media/uploads/')) throw new Error('Unexpected SIAT download host');
      const observations = parseSiat(await json(download.href), metadata.updated_at);
      if (observations.length !== 2) throw new Error('SIAT values invalid');
      return { observations, sourceUpdatedAt: iso(metadata.updated_at), period: observations[0].period, recordCount: observations.length };
    },
    worldbank: async () => {
      const parsed = parseWorldBank(await json(FERGANA_ENDPOINTS.worldbank));
      return { observations: parsed.observations, sourceUpdatedAt: parsed.updated, period: parsed.observations[0].period, recordCount: parsed.observations.length };
    },
    remotive: async () => {
      const tagged = tagPostings(parseRemotive(await json(FERGANA_ENDPOINTS.remotive)));
      return { observations: [], tagged, sourceUpdatedAt: null, period: dateRange(tagged), recordCount: tagged.length };
    },
    arbeitnow: async () => {
      const postings = parseArbeitnow(await json(FERGANA_ENDPOINTS.arbeitnow));
      // Pages 2–3 add depth but are optional: keep page 1 if they fail.
      for (const page of [2, 3]) {
        try {
          const more = parseArbeitnow(await json(`${FERGANA_ENDPOINTS.arbeitnow}?page=${page}`));
          if (!more.length) break;
          postings.push(...more);
        } catch { break; }
      }
      const tagged = tagPostings(postings);
      return { observations: [], tagged, sourceUpdatedAt: null, period: dateRange(tagged), recordCount: tagged.length };
    },
    greenhouse: async () => {
      const tagged = tagPostings(await boards('Greenhouse', GREENHOUSE_BOARDS, (b) => FERGANA_ENDPOINTS.greenhouse.replace('{board}', b)));
      return { observations: [], tagged, sourceUpdatedAt: null, period: dateRange(tagged), recordCount: tagged.length };
    },
    ashby: async () => {
      const tagged = tagPostings(await boards('Ashby', ASHBY_ORGS, (b) => FERGANA_ENDPOINTS.ashby.replace('{org}', b)));
      return { observations: [], tagged, sourceUpdatedAt: null, period: dateRange(tagged), recordCount: tagged.length };
    },
  };

  const confidenceOf = (id: SourceId, state: FerganaSourceState['state'], count: number): FerganaSourceState['confidence'] => {
    if (state === 'error') return 'low';
    const level = SOURCE_CONFIG[id].kind === 'statistics' ? 'high' : count >= 300 ? 'high' : count >= 50 ? 'medium' : 'low';
    return state === 'fallback' && level === 'high' ? 'medium' : level;
  };
  const postingSources = () => ids.filter((id) => SOURCE_CONFIG[id].kind === 'postings');
  const withData = (state: Cache) => postingSources().filter((id) => state.sources[id]?.tagged?.length);
  const mode = (state: Cache): FerganaEvidence['mode'] => {
    if (!state.snapshots.length || !state.count) return 'demo';
    return withData(state).some((id) => state.sources[id]!.state === 'live') ? 'periodic' : 'cached';
  };
  const publicState = ({ tagged: _tagged, ...rest }: StoredSource): FerganaSourceState => rest;
  const baseline = (): SkillSnapshot[] => SKILLS.map((skill) => ({
    skillSlug: skill.slug, momentum: skill.seedMomentum, frequency: 0,
    trend: 0, postings: 0, recentPostings: 0, earlierPostings: 0,
  }));

  function payload(limited: boolean, refresh?: { requestedAt: string; results: FerganaRefreshResult[] }) {
    const state = cache!;
    const sources = ids.map((id) => state.sources[id]).filter((s): s is StoredSource => !!s);
    const posting = sources.filter((s) => SOURCE_CONFIG[s.id as SourceId].kind === 'postings');
    const fetched = posting.map((s) => s.fetchedAt).filter((x): x is string => !!x).sort();
    return {
      runId: `fergana-${state.calculatedAt}`, fetchedAt: fetched.at(-1) ?? state.calculatedAt,
      live: posting.some((s) => s.state === 'live'), totalPostings: state.count,
      confidence: (state.count >= 200 ? 'ok' : 'low') as 'ok' | 'low',
      sources: posting.map((s) => ({ name: s.id, url: FERGANA_ENDPOINTS[s.id as SourceId], postings: s.recordCount, ok: s.state !== 'error', kind: s.state })),
      snapshots: state.snapshots.length && state.count ? state.snapshots : baseline(),
      changelog: state.history,
      provenance: {
        mode: mode(state), calculatedAt: state.calculatedAt, refreshLimited: limited,
        skillSourceIds: mode(state) === 'demo' ? ['wef'] : [...withData(state), 'wef'],
        sources: sources.map(publicState),
        ...(refresh ? { refresh } : {}),
      } satisfies FerganaEvidence,
    };
  }

  async function run(force = false) {
    if (!cache) {
      try {
        const disk = JSON.parse(await readFile(cachePath, 'utf8')) as Cache;
        if (disk.version === 2 && disk.sources && Array.isArray(disk.history) && Array.isArray(disk.snapshots) && Number.isFinite(disk.count)) cache = disk;
      } catch { /* This is a rebuildable cache, never learner data. */ }
      cache ??= { version: 2, sources: {}, snapshots: [], count: 0, calculatedAt: new Date(clock()).toISOString(), history: [] };
    }
    const state = cache;
    const before = new Map(state.snapshots.map((item) => [item.skillSlug, item.momentum]));
    let attempted = false;
    const requestedAt = new Date(clock()).toISOString();
    const results: FerganaRefreshResult[] = [];
    await Promise.all(ids.map(async (id) => {
      const cfg = SOURCE_CONFIG[id];
      const old = state.sources[id];
      if (force) {
        // After a failed attempt, official statistics may be retried after a
        // minute; Remotive's limit counts every request, so it never shortens.
        const failedLast = !!old && old.state !== 'live';
        const wait = failedLast && id !== 'remotive' ? 60 * 1000 : MANUAL_MIN_INTERVAL[id];
        const allowedAt = old ? Date.parse(old.checkedAt) + wait : 0;
        if (allowedAt > clock()) { results.push({ id, outcome: 'rate-limited', nextAllowedAt: new Date(allowedAt).toISOString() }); return; }
      } else if (old && Date.parse(old.nextCheckAt) > clock()) return;
      attempted = true;
      const checkedAt = new Date(clock()).toISOString();
      try {
        const got = await adapters[id]();
        state.sources[id] = {
          id, status: 'periodic', state: 'live', kind: cfg.kind, scopes: cfg.scopes, recordCount: got.recordCount,
          confidence: confidenceOf(id, 'live', got.recordCount), refreshMinutes: cfg.refreshMinutes, error: null,
          checkedAt, fetchedAt: checkedAt, sourceUpdatedAt: got.sourceUpdatedAt,
          nextCheckAt: new Date(clock() + cfg.refreshMinutes * MIN).toISOString(),
          period: got.period, observations: got.observations, ...(got.tagged ? { tagged: got.tagged } : {}),
        };
        if (force) results.push({ id, outcome: 'refreshed', nextAllowedAt: new Date(clock() + MANUAL_MIN_INTERVAL[id]).toISOString() });
      } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, 160) : 'error';
        if (force) results.push({ id, outcome: 'failed', nextAllowedAt: new Date(clock() + (id === 'remotive' ? MANUAL_MIN_INTERVAL[id] : 60 * 1000)).toISOString(), error: message });
        logger.warn({ err: error, source: id }, 'Signal source unavailable');
        // Keep the last successful result, clearly marked as a fallback.
        const has = !!old?.fetchedAt;
        state.sources[id] = {
          id, status: has ? 'cached' : 'unavailable', state: has ? 'fallback' : 'error', kind: cfg.kind, scopes: cfg.scopes,
          recordCount: has ? old!.recordCount : 0, confidence: confidenceOf(id, has ? 'fallback' : 'error', old?.recordCount ?? 0),
          refreshMinutes: cfg.refreshMinutes, error: message, checkedAt,
          fetchedAt: old?.fetchedAt ?? null, sourceUpdatedAt: old?.sourceUpdatedAt ?? null,
          nextCheckAt: new Date(clock() + cfg.failRetryMinutes * MIN).toISOString(),
          period: old?.period ?? null, observations: old?.observations ?? [], ...(old?.tagged ? { tagged: old.tagged } : {}),
        };
      }
    }));
    if (attempted) {
      state.calculatedAt = new Date(clock()).toISOString();
      const all = withData(state).flatMap((id) => state.sources[id]!.tagged!);
      try { state.snapshots = all.length ? momentumFromTagged(all, clock()) : []; } catch { state.snapshots = []; }
      state.count = state.snapshots.length ? all.filter((p) => p.t >= clock() - 60 * 24 * 60 * MIN).length : 0;
      const movers = state.snapshots.filter((item) => before.has(item.skillSlug) && before.get(item.skillSlug) !== item.momentum)
        .map((item) => ({ skill: item.skillSlug, momentum: item.momentum, delta: item.momentum - before.get(item.skillSlug)! }));
      state.history.unshift({
        id: state.calculatedAt, createdAt: state.calculatedAt, version: 'approved-sources-v2', live: postingSources().some((id) => state.sources[id]?.state === 'live'),
        summary: 'evidence.history.summary', details: { movers, postings: state.count, mode: mode(state), sources: ids.map((id) => state.sources[id]).filter((s): s is StoredSource => !!s).map((s) => structuredClone(publicState(s))) },
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
