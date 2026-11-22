// ─── Which learning resources fit this learner ─────────────────────────────
// Deterministic ranking over src/data/learning-resources.ts using what the
// learner has told us: the skills their pathway still needs, the field and
// professions they chose, where they live, how they prefer to learn, their
// languages and their weekly hours. Every point added has a reason that the
// UI shows, so a recommendation can always be explained.

import type { LearningResource, ResourceArea, ResourceTopic } from '@/data/learning-resources';
import { CATALOG, asLearningResource } from './resource-catalog';
import { OCCUPATION_MAP, SECTOR_MAP, fold, type SectorId } from '@/data/occupations';
import { normalizeProfile } from './profile';
import type { Lang, Profile } from './types';

export type ResourceReason = 'skill' | 'topic' | 'near' | 'format' | 'language' | 'free' | 'beginner' | 'flexible';

export interface RankedResource {
  resource: LearningResource;
  score: number;
  reasons: ResourceReason[];
  /** Skills from the learner's pathway that this resource covers. */
  skills: string[];
}

const SECTOR_TOPICS: Record<SectorId, ResourceTopic[]> = {
  it: ['programming', 'ai', 'digital', 'data', 'cybersecurity'], engineering: ['vocational', 'digital', 'engineering', 'robotics'],
  business: ['business', 'entrepreneurship', 'accounting'], health: ['digital', 'healthcare'],
  education: ['languages', 'digital', 'education'], agriculture: ['agriculture', 'green'], construction: ['vocational', 'design', 'construction'],
  creative: ['design', 'painting'], tourism: ['languages', 'business', 'tourism', 'hospitality', 'culinary'],
  trades: ['vocational', 'electrical', 'plumbing', 'construction', 'beauty'],
  crafts: ['crafts', 'embroidery', 'sewing', 'textile', 'ceramics', 'calligraphy'], transport: ['vocational', 'driving', 'automotive'],
  public: ['business', 'languages'], social: ['languages'], media: ['design', 'digital'], energy: ['vocational', 'green', 'electrical'],
  retail: ['business', 'digital', 'ecommerce'],
};
const OCCUPATION_TOPICS: Record<string, ResourceTopic[]> = {
  embroiderer: ['embroidery', 'crafts'], tailor: ['sewing', 'textile', 'fashion'], 'sewing-machine-operator': ['sewing', 'vocational'],
  knitter: ['knitting', 'crafts'], 'silk-weaver': ['crafts', 'textile'], 'carpet-weaver': ['crafts', 'textile'], potter: ['crafts', 'painting', 'ceramics'],
  'miniature-painter': ['painting', 'crafts'], 'visual-artist': ['painting', 'design'], 'fashion-designer': ['sewing', 'design'],
  'graphic-designer': ['design'], 'language-teacher': ['languages'], translator: ['languages'], 'tour-guide': ['languages'],
  sericulturist: ['agriculture', 'crafts'], 'data-scientist': ['ai', 'programming'], 'data-analyst-occ': ['programming', 'ai'],
  plumber: ['plumbing', 'construction'], electrician: ['electrical', 'green'], chef: ['culinary', 'hospitality'],
  cook: ['culinary'], baker: ['culinary'], 'auto-mechanic': ['automotive'], hairdresser: ['beauty'],
  driver: ['driving', 'automotive'], 'truck-driver': ['driving', 'automotive'], 'mechanical-engineer': ['engineering', 'robotics'],
};

/** Topics implied by the field and the current and target professions. */
export function profileTopics(profileInput: Profile | Partial<Profile>): ResourceTopic[] {
  const extended = normalizeProfile(profileInput).extended ?? {};
  const out: ResourceTopic[] = [];
  for (const id of [extended.targetOccupationId, extended.professionId]) {
    const occ = id ? OCCUPATION_MAP[id] : undefined;
    if (!occ) continue;
    out.push(...(OCCUPATION_TOPICS[occ.id] ?? []), ...SECTOR_TOPICS[occ.sector]);
  }
  const sector = extended.fieldId ? SECTOR_MAP[extended.fieldId as SectorId] : undefined;
  if (sector) out.push(...SECTOR_TOPICS[sector.id]);
  return [...new Set(out)];
}

const FERGANA_TOWNS = ['fergana', 'fargona', 'фергана', 'margilan', 'margilon', 'маргилан', 'kokand', 'qoqon', 'коканд', 'kuvasoy', 'quvasoy', 'kuva', 'quva', 'rishton', 'rishtan', 'риштан', 'beshariq', 'oltiariq', 'toshloq', 'yaypan', 'buvayda', 'dangara', 'furqat', 'uchkoprik', 'sox', 'sokh'];

/** Where the learner is, from the city and country they gave. */
export function homeArea(profileInput: Profile | Partial<Profile>): ResourceArea {
  const extended = normalizeProfile(profileInput).extended ?? {};
  const city = fold(extended.city ?? '').replace(/[^a-zа-я]/g, '');
  if (city && FERGANA_TOWNS.some((town) => city.includes(fold(town).replace(/[^a-zа-я]/g, '')))) return 'fergana';
  const country = fold(extended.country ?? '').replace(/'/g, '');
  if (/uzbek|ozbek|узбек/.test(country)) return 'uzbekistan';
  if (/kazakh|kyrgyz|tajik|turkmen|казах|кыргыз|киргиз|таджик|туркмен|qozog|qirg|tojik/.test(country)) return 'central-asia';
  return 'global';
}

const NEAR: Record<ResourceArea, Record<ResourceArea, number>> = {
  fergana: { fergana: 3, uzbekistan: 1.5, 'central-asia': 0.5, global: 0 },
  uzbekistan: { fergana: 1, uzbekistan: 2.5, 'central-asia': 0.5, global: 0 },
  'central-asia': { fergana: 0, uzbekistan: 0.5, 'central-asia': 2.5, global: 0 },
  global: { fergana: 0, uzbekistan: 0, 'central-asia': 0, global: 1 },
};

/** Profile languages may be codes ("uz") or names ("Uzbek", "Русский"). */
function langCode(entry: unknown): Lang | null {
  const raw = typeof entry === 'string' ? entry : (entry as { language?: string } | null)?.language ?? '';
  const v = fold(raw).replace(/'/g, '');
  if (/^(uz|ozbek|uzbek|узбек)/.test(v)) return 'uz';
  if (/^(ru|rus|русск)/.test(v)) return 'ru';
  if (/^(en|eng|англ|ingliz)/.test(v)) return 'en';
  return null;
}

export interface ResourceQuery {
  lang: Lang;
  /** Pathway skills still to build, most important first. */
  gaps: string[];
  topic?: ResourceTopic | 'all';
  area?: ResourceArea | 'all';
}

/** Every catalogue entry in the shape the ranking reads. */
export const RANKABLE: LearningResource[] = CATALOG.map(asLearningResource);

export function rankResources(profileInput: Profile | Partial<Profile>, query: ResourceQuery, resources: LearningResource[] = RANKABLE): RankedResource[] {
  const profile = normalizeProfile(profileInput);
  const home = homeArea(profile);
  const topics = profileTopics(profile);
  const ext = profile.extended ?? {};
  const format = ext.learningFormat ?? 'any';
  const speaks = new Set<Lang>([query.lang, ...((ext.languages ?? []).map(langCode).filter((l): l is Lang => l !== null))]);
  const beginner = Object.values(profile.skills).filter((v) => v >= 3).length < 2;
  const gapSet = new Set(query.gaps);

  const out: RankedResource[] = [];
  for (const r of resources) {
    if (query.area && query.area !== 'all' && r.area !== query.area) continue;
    if (query.topic && query.topic !== 'all' && !r.topics.includes(query.topic)) continue;
    const reasons: ResourceReason[] = [];
    const skills = r.skills.filter((s) => gapSet.has(s));
    const topicHits = r.topics.filter((tp) => topics.includes(tp));
    // Without a skill or topic link, only an explicit topic filter keeps it.
    if (!skills.length && !topicHits.length && !(query.topic && query.topic !== 'all')) continue;
    let score = 0;
    if (skills.length) { score += 4 * Math.min(2, skills.length) - query.gaps.indexOf(skills[0]) * 0.2; reasons.push('skill'); }
    if (topicHits.length) { score += 3 * Math.min(2, topicHits.length); reasons.push('topic'); }
    const near = NEAR[home][r.area];
    const inPerson = r.format === 'in-person';
    const reachable = r.area === home || (home === 'fergana' && r.area === 'uzbekistan');
    // An in-person place far away is not useful, however relevant.
    if (inPerson && !reachable) score -= 2;
    else if (near > 0) { score += near; if (r.area !== 'global') reasons.push('near'); }
    if (format !== 'any') {
      // "In person" only counts where the learner can actually go.
      const fits = format === 'online' ? r.format !== 'in-person' : r.format !== 'online' && reachable;
      score += fits ? 2 : -3;
      if (fits) reasons.push('format');
    }
    if (r.languages.includes(query.lang)) { score += 1.5; reasons.push('language'); }
    else if (!r.languages.some((l) => speaks.has(l))) score -= 2;
    if (r.cost === 'free') { score += 1; reasons.push('free'); }
    if (beginner && r.beginner) { score += 1; reasons.push('beginner'); }
    if (profile.budget <= 5 && r.format !== 'in-person') { score += 1; reasons.push('flexible'); }
    // Catalogue facts: a multi-year degree is a big step for one skill gap,
    // and finished, announced-only or unconfirmed offers rank lower.
    const cat = (r as { catalog?: { kind: string; availability: string; verification: string } }).catalog;
    if (cat) {
      if (cat.kind === 'degree') score -= 1.5;
      if (cat.availability === 'closed') score -= 3;
      else if (cat.availability === 'upcoming') score -= 1.5;
      else if (cat.availability === 'unknown') score -= 0.5;
      if (cat.verification === 'provider') score -= 0.5;
    }
    out.push({ resource: r, score: Math.round(score * 10) / 10, reasons, skills });
  }
  return out.sort((a, b) => b.score - a.score || a.resource.id.localeCompare(b.resource.id));
}

/** Best single resource for one pathway skill, for the roadmap steps. */
export function bestForSkill(profile: Profile | Partial<Profile>, skill: string, lang: Lang): RankedResource | null {
  // Finished programmes are not suggested as a next step.
  const open = RANKABLE.filter((r) => (r as { catalog?: { availability: string } }).catalog?.availability !== 'closed');
  return rankResources(profile, { lang, gaps: [skill] }, open).find((r) => r.skills.includes(skill)) ?? null;
}
