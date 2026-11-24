import { z } from 'zod';
import type { SignalsPayload } from './types';

const timestamp = z.string().refine((value) => Number.isFinite(Date.parse(value)));
export const SIGNAL_SOURCE_IDS = ['siat', 'worldbank', 'remotive', 'arbeitnow', 'greenhouse', 'ashby'] as const;
const sourceId = z.enum(SIGNAL_SOURCE_IDS);
const STATS = new Set(['siat', 'worldbank']);
const SCOPES: Record<string, Array<'region' | 'national' | 'global' | 'remote'>> = {
  siat: ['region', 'national'], worldbank: ['national'], remotive: ['remote'], arbeitnow: ['global'], greenhouse: ['global'], ashby: ['global'],
};
const legacyState = { periodic: 'live', cached: 'fallback', unavailable: 'error' } as const;
// Freshness fields were added on 24 Nov 2026; copies saved in the browser before
// that lack them, so they are derived from the legacy `status` when missing.
const source = z.object({
  id: sourceId,
  status: z.enum(['periodic', 'cached', 'unavailable']),
  state: z.enum(['live', 'fallback', 'error']).optional(),
  kind: z.enum(['statistics', 'postings']).optional(),
  scopes: z.array(z.enum(['region', 'national', 'global', 'remote'])).optional(),
  recordCount: z.number().int().nonnegative().optional(),
  confidence: z.enum(['high', 'medium', 'low']).optional(),
  refreshMinutes: z.number().int().positive().optional(),
  error: z.string().nullable().optional(),
  checkedAt: timestamp, fetchedAt: timestamp.nullable(), sourceUpdatedAt: timestamp.nullable(),
  nextCheckAt: timestamp, period: z.string().nullable().optional(),
  observations: z.array(z.object({
    id: z.enum(['employment-fergana', 'employment-uzbekistan', 'participation-uzbekistan']),
    scope: z.enum(['region', 'national', 'global']), period: z.string(),
    value: z.number().finite(), unit: z.string(), sourceUrl: z.string().url(),
  })).default([]),
}).transform((s) => ({
  ...s,
  state: s.state ?? legacyState[s.status],
  kind: s.kind ?? (STATS.has(s.id) ? 'statistics' as const : 'postings' as const),
  scopes: s.scopes ?? SCOPES[s.id],
  recordCount: s.recordCount ?? (STATS.has(s.id) ? s.observations.length : 0),
  confidence: s.confidence ?? ('low' as const),
  refreshMinutes: s.refreshMinutes ?? (s.id === 'remotive' ? 360 : 15),
  error: s.error ?? null,
}));
const score = z.number().finite().min(0).max(100);
const count = z.number().int().nonnegative();
const payload = z.object({
  runId: z.string(), fetchedAt: timestamp, live: z.boolean(),
  totalPostings: count, confidence: z.enum(['ok', 'low']),
  sources: z.array(z.object({
    name: z.string(), url: z.string().url(),
    postings: count, ok: z.boolean(), kind: z.string(),
  })).default([]),
  snapshots: z.array(z.object({
    skillSlug: z.string(), postings: count, recentPostings: count, earlierPostings: count,
    frequency: score, trend: score, momentum: score,
  })).default([]),
  provenance: z.object({
    mode: z.enum(['periodic', 'cached', 'demo']), calculatedAt: timestamp,
    refreshLimited: z.boolean(), skillSourceIds: z.array(z.string()), sources: z.array(source),
    refresh: z.object({
      requestedAt: timestamp,
      results: z.array(z.object({
        id: sourceId,
        outcome: z.enum(['refreshed', 'rate-limited', 'failed']),
        nextAllowedAt: timestamp, error: z.string().optional(),
      })),
    }).optional(),
  }),
  changelog: z.array(z.object({
    id: z.string(), createdAt: timestamp, version: z.string(), live: z.boolean(),
    summary: z.literal('evidence.history.summary'),
    details: z.object({
      postings: count, mode: z.enum(['periodic', 'cached', 'demo']),
      sources: z.array(source),
      movers: z.array(z.object({ skill: z.string(), delta: z.number().finite(), momentum: score })).default([]),
    }),
  })).default([]),
});

export function parseFerganaSignals(value: unknown): SignalsPayload {
  return payload.parse(value);
}

export function cachedFerganaSignals(value: SignalsPayload): SignalsPayload {
  return {
    ...value,
    provenance: value.provenance ? {
      ...value.provenance,
      mode: value.provenance.mode === 'demo' ? 'demo' : 'cached',
      sources: value.provenance.sources.map((item) => ({
        ...item, status: item.fetchedAt ? 'cached' : 'unavailable', state: item.fetchedAt ? 'fallback' : 'error',
      })),
    } : undefined,
    // A copy kept in the browser is never presented as live.
    live: false,
  };
}
