import { z } from 'zod';
import type { SignalsPayload } from './types';

const timestamp = z.string().refine((value) => Number.isFinite(Date.parse(value)));
const source = z.object({
  id: z.enum(['siat', 'worldbank', 'remotive']),
  status: z.enum(['periodic', 'cached', 'unavailable']),
  checkedAt: timestamp, fetchedAt: timestamp.nullable(), sourceUpdatedAt: timestamp.nullable(),
  nextCheckAt: timestamp, period: z.string().nullable().optional(),
  observations: z.array(z.object({
    id: z.enum(['employment-fergana', 'employment-uzbekistan', 'participation-uzbekistan']),
    scope: z.enum(['region', 'national', 'global']), period: z.string(),
    value: z.number().finite(), unit: z.string(), sourceUrl: z.string().url(),
  })).default([]),
});
const score = z.number().finite().min(0).max(100);
const count = z.number().int().nonnegative();
const payload = z.object({
  runId: z.string(), fetchedAt: timestamp, live: z.literal(false),
  totalPostings: count, confidence: z.enum(['ok', 'low']),
  sources: z.array(z.object({
    name: z.literal('Remotive'), url: z.literal('https://remotive.com/remote-jobs/api'),
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
        id: z.enum(['siat', 'worldbank', 'remotive']),
        outcome: z.enum(['refreshed', 'rate-limited', 'failed']),
        nextAllowedAt: timestamp, error: z.string().optional(),
      })),
    }).optional(),
  }),
  changelog: z.array(z.object({
    id: z.string(), createdAt: timestamp, version: z.string(), live: z.literal(false),
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
        ...item, status: item.fetchedAt ? 'cached' : 'unavailable',
      })),
    } : undefined,
  };
}
