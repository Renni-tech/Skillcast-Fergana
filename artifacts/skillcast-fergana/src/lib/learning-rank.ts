import { LEARNING_SOURCES, type LearningSource } from '@/data/learning-sources';
import type { Lang } from '@/lib/types';

// ─── Rank learning sources for a skill ─────────────────────────────────────
// Deterministic and explainable: every point maps to a reason the UI shows.
// Order of importance: covers the skill (required) → language the learner
// reads → accessibility needs → free first → local (Uzbekistan) relevance →
// approved / official publisher.

export type RankReason = 'language' | 'access' | 'free' | 'local' | 'official';

export interface RankedSource {
  source: LearningSource;
  score: number;
  reasons: RankReason[];
}

export interface RankOptions {
  lang: Lang;
  inclusion?: { dyslexia?: boolean; visual?: boolean; hearing?: boolean; mobility?: boolean };
}

export function rankSources(skill: string, { lang, inclusion = {} }: RankOptions, sources = LEARNING_SOURCES): RankedSource[] {
  return sources
    .filter((source) => source.skills.includes(skill))
    .map((source) => {
      let score = 0;
      const reasons: RankReason[] = [];
      if (source.languages.includes(lang)) { score += 3; reasons.push('language'); }
      const a = source.access;
      const accessFit = (inclusion.visual && (a.includes('screen-reader') || a.includes('text-first')))
        || (inclusion.hearing && (a.includes('captions') || a.includes('transcripts')))
        || (inclusion.dyslexia && (a.includes('captions') || a.includes('self-paced')))
        || (inclusion.mobility && (a.includes('self-paced')));
      if (accessFit) { score += 2.5; reasons.push('access'); }
      if (source.cost === 'free') { score += 2; reasons.push('free'); } else if (source.cost === 'freemium') score += 1;
      if (source.region === 'uzbekistan') { score += 2; reasons.push('local'); }
      if (source.verification === 'approved' || source.providerType === 'government' || source.providerType === 'international' || source.providerType === 'university') {
        score += 0.5;
        reasons.push('official');
      }
      return { source, score, reasons };
    })
    .sort((x, y) => y.score - x.score || x.source.name.localeCompare(y.source.name));
}
