import { ROLE_MAP } from '@/data/roles';
import { SKILL_MAP } from '@/data/skills';
import type { Profile } from '@/lib/types';

// ─── Wind Rose: the learner's career direction map ─────────────────────────
// Three readings per skill, all on a 0–100 scale:
//   you     — the learner's self-rated level (0–5) × 20
//   market  — indicative momentum: the latest signal value, or the skill's
//             designer-set baseline when the skill is not signal-tracked
//   target  — the level the chosen pathway requires (minLevel × 20), if any
// Deterministic and indicative; not a validated forecast.

export interface WindRosePoint {
  slug: string;
  you: number;
  market: number;
  target: number | null;
  /** true when `market` came from the signal feed, false for a baseline value. */
  tracked: boolean;
  /** How far the market or pathway target is ahead of the learner (0 when not behind). */
  gap: number;
  inPathway: boolean;
}

export interface WindRose {
  points: WindRosePoint[];
  /** Largest gaps first: what to improve next. */
  priorities: WindRosePoint[];
  /** Where the learner is at or ahead of market direction. */
  strengths: WindRosePoint[];
}

export function computeWindRose(profile: Pick<Profile, 'skills'>, momentum: Record<string, number>, roleSlug: string | null, max = 10): WindRose {
  const role = roleSlug ? ROLE_MAP[roleSlug] : null;
  const required = new Map((role?.skills ?? []).map((req) => [req.skill, req.minLevel]));
  const own = Object.entries(profile.skills ?? {})
    .filter(([slug, level]) => SKILL_MAP[slug] && level > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([slug]) => slug);
  const marketValue = (slug: string) => momentum[slug] ?? SKILL_MAP[slug]?.seedMomentum ?? 50;
  const topMarket = Object.keys(SKILL_MAP).sort((a, b) => marketValue(b) - marketValue(a));

  // Pathway skills first (career direction), then the learner's own skills,
  // then the strongest market skills to fill the rose.
  const slugs = [...new Set([...required.keys(), ...own, ...topMarket])].slice(0, Math.max(3, max));
  const points = slugs.map((slug) => {
    const you = Math.round((profile.skills?.[slug] ?? 0) * 20);
    const market = Math.round(marketValue(slug));
    const target = required.has(slug) ? (required.get(slug) ?? 0) * 20 : null;
    const ahead = Math.max(market, target ?? 0);
    return { slug, you, market, target, tracked: slug in momentum, gap: Math.max(0, ahead - you), inPathway: required.has(slug) };
  });

  const priorities = points
    .filter((p) => p.gap >= 20)
    .sort((a, b) => Number(b.inPathway) - Number(a.inPathway) || b.gap - a.gap)
    .slice(0, 3);
  // Strengths: solid levels (3/5 or more) or at/above market direction,
  // never the same skills as the priorities.
  const prioritySlugs = new Set(priorities.map((p) => p.slug));
  const strengths = points
    .filter((p) => !prioritySlugs.has(p.slug) && p.you > 0 && (p.you >= 60 || (p.you >= p.market && (p.target === null || p.you >= p.target))))
    .sort((a, b) => b.you - a.you)
    .slice(0, 3);
  return { points, priorities, strengths };
}
