import { expect, test } from 'bun:test';
import { cachedFerganaSignals, parseFerganaSignals } from '../src/lib/fergana-evidence';
import { makeSourceT, relativeAgo } from '../src/lib/signal-source-i18n';

const T = '2026-11-24T10:00:00.000Z';
const legacySource = (id: string, status: string, fetchedAt: string | null) => ({
  id, status, checkedAt: T, fetchedAt, sourceUpdatedAt: null, nextCheckAt: T, observations: [],
});
const payload = (sources: unknown[], live = false) => ({
  runId: 'r1', fetchedAt: T, live, totalPostings: 0, confidence: 'low', sources: [], snapshots: [], changelog: [],
  provenance: { mode: 'periodic', calculatedAt: T, refreshLimited: false, skillSourceIds: [], sources },
});

test('copies saved before the freshness fields existed get honest derived states', () => {
  const parsed = parseFerganaSignals(payload([
    legacySource('siat', 'periodic', T), legacySource('worldbank', 'cached', T), legacySource('remotive', 'unavailable', null),
  ]));
  const by = Object.fromEntries(parsed.provenance!.sources.map((s) => [s.id, s]));
  expect(by.siat.state).toBe('live');
  expect(by.worldbank.state).toBe('fallback');
  expect(by.remotive.state).toBe('error');
  expect(by.siat.scopes).toEqual(['region', 'national']);
  expect(by.remotive.scopes).toEqual(['remote']);
  expect(by.remotive.refreshMinutes).toBe(360);
  expect(by.siat.kind).toBe('statistics');
});

test('new fields and live payloads are accepted; a browser copy is never shown as live', () => {
  const parsed = parseFerganaSignals(payload([{
    ...legacySource('greenhouse', 'periodic', T), state: 'live', kind: 'postings', scopes: ['global'],
    recordCount: 900, confidence: 'high', refreshMinutes: 15, error: null,
  }], true));
  expect(parsed.live).toBe(true);
  expect(parsed.provenance!.sources[0].recordCount).toBe(900);
  const saved = cachedFerganaSignals(parsed);
  expect(saved.live).toBe(false);
  expect(saved.provenance!.mode).toBe('cached');
  expect(saved.provenance!.sources[0].state).toBe('fallback');
  expect(saved.provenance!.sources[0].fetchedAt).toBe(T); // the real last-success time is kept, not renewed
});

test('unknown source ids and bad timestamps are rejected', () => {
  expect(() => parseFerganaSignals(payload([legacySource('invented', 'periodic', T)]))).toThrow();
  expect(() => parseFerganaSignals(payload([legacySource('siat', 'periodic', 'yesterday')]))).toThrow();
});

test('relative times in every language', () => {
  const now = Date.parse(T);
  const en = makeSourceT('en');
  expect(relativeAgo(en, T, now + 20_000)).toBe('just now');
  expect(relativeAgo(en, T, now + 2 * 60_000)).toBe('2 min ago');
  expect(relativeAgo(en, T, now + 3 * 3_600_000)).toBe('3 h ago');
  expect(relativeAgo(en, T, now + 72 * 3_600_000)).toBe('3 d ago');
  expect(relativeAgo(en, null, now)).toBeNull();
  expect(relativeAgo(makeSourceT('uz'), T, now + 18 * 60_000)).toBe('18 daqiqa oldin');
  expect(relativeAgo(makeSourceT('ru'), T, now + 18 * 60_000)).toBe('18 мин назад');
  expect(relativeAgo(makeSourceT('uz-cyrl'), T, now + 18 * 60_000)).toMatch(/^18 [А-Яа-яЎўҚқҒғҲҳ]+/);
  expect(en('rs.lastGood', { ago: '18 min ago' })).toBe('Last successful update: 18 min ago');
});
