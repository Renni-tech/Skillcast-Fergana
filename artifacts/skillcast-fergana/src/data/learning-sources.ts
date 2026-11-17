// ─── Learning sources: where to learn a skill ──────────────────────────────
// Providers and programmes (not individual courses) that cover SkillCast
// skills, so new sources can be added here without touching the UI.
//
// Rules for adding an entry:
// - Real providers and official URLs only. Never invent a course, provider,
//   certificate or availability.
// - `verification` is honest about what was checked:
//     'approved'  — from the separately researched approved source list
//     'curated'   — a well-known provider added by the team; the link and
//                   current offer have NOT been re-checked from this app.
//   `lastChecked` stays null until someone opens the link and records a date.
// - `languages` lists only languages confirmed for the provider's offer;
//   other languages may exist.
// - Descriptions live in i18n (key `ls.<id>.d`) in Uzbek, Russian and English.

import type { Lang } from '@/lib/types';

export type SourceRegion = 'uzbekistan' | 'international';
export type ProviderType = 'government' | 'university' | 'platform' | 'professional' | 'international';
export type SourceCost = 'free' | 'freemium' | 'paid';
export type AccessFeature = 'captions' | 'transcripts' | 'self-paced' | 'screen-reader' | 'text-first' | 'in-person-support';

export interface LearningSource {
  id: string;
  name: string;
  provider: string;
  url: string;
  region: SourceRegion;
  providerType: ProviderType;
  cost: SourceCost;
  languages: Lang[];
  skills: string[];
  access: AccessFeature[];
  verification: 'approved' | 'curated';
  lastChecked: string | null;
}

export const LEARNING_SOURCES: LearningSource[] = [
  // ── Uzbekistan ───────────────────────────────────────────────────────────
  {
    id: 'mehnat-vocational', name: 'Vocational training and employment programmes', provider: 'Ministry of Employment and Poverty Reduction',
    url: 'https://gov.uz/en/bv', region: 'uzbekistan', providerType: 'government', cost: 'free', languages: ['uz', 'ru'],
    skills: ['textile-production', 'electrical-maintenance', 'food-processing', 'tourism-hospitality', 'sales-negotiation', 'entrepreneurship', 'digital-literacy'],
    access: ['in-person-support'], verification: 'approved', lastChecked: null,
  },
  {
    id: 'itpark', name: 'IT Park Uzbekistan training and digital inclusion', provider: 'IT Park Uzbekistan',
    url: 'https://www.it-park.uz/en', region: 'uzbekistan', providerType: 'government', cost: 'freemium', languages: ['uz', 'ru', 'en'],
    skills: ['software-engineering', 'python', 'data-analysis', 'digital-literacy', 'cybersecurity'],
    access: ['in-person-support'], verification: 'approved', lastChecked: null,
  },
  // ── International: official and university providers ─────────────────────
  {
    id: 'elementsofai', name: 'Elements of AI', provider: 'University of Helsinki and MinnaLearn',
    url: 'https://www.elementsofai.com', region: 'international', providerType: 'university', cost: 'free', languages: ['en'],
    skills: ['responsible-ai', 'ai-augmented-ops', 'machine-learning'],
    access: ['self-paced', 'text-first'], verification: 'approved', lastChecked: null,
  },
  {
    id: 'w3c-wai', name: 'Digital Accessibility Foundations', provider: 'W3C Web Accessibility Initiative',
    url: 'https://www.w3.org/WAI/courses/foundations-course/', region: 'international', providerType: 'international', cost: 'free', languages: ['en'],
    skills: ['software-engineering', 'customer-experience', 'teaching-training', 'graphic-design'],
    access: ['self-paced', 'text-first', 'captions', 'transcripts'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'ms-learn', name: 'Microsoft Learn training paths', provider: 'Microsoft Learn',
    url: 'https://learn.microsoft.com/training/', region: 'international', providerType: 'professional', cost: 'free', languages: ['en', 'ru'],
    skills: ['machine-learning', 'responsible-ai', 'cloud', 'data-analysis', 'cybersecurity', 'digital-literacy'],
    access: ['self-paced', 'text-first', 'screen-reader'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'british-council', name: 'LearnEnglish', provider: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/', region: 'international', providerType: 'international', cost: 'free', languages: ['en'],
    skills: ['english-for-work', 'communication'],
    access: ['self-paced', 'transcripts'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'khan', name: 'Khan Academy', provider: 'Khan Academy',
    url: 'https://www.khanacademy.org/', region: 'international', providerType: 'platform', cost: 'free', languages: ['en'],
    skills: ['accounting-finance', 'data-analysis', 'python'],
    access: ['self-paced', 'captions', 'transcripts'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'gcfglobal', name: 'GCFGlobal digital skills tutorials', provider: 'GCFGlobal',
    url: 'https://edu.gcfglobal.org/', region: 'international', providerType: 'platform', cost: 'free', languages: ['en'],
    skills: ['digital-literacy', 'entrepreneurship', 'communication'],
    access: ['self-paced', 'text-first', 'captions'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'canva-design', name: 'Design School', provider: 'Canva',
    url: 'https://www.canva.com/designschool/', region: 'international', providerType: 'platform', cost: 'free', languages: ['en'],
    skills: ['graphic-design', 'digital-marketing'],
    access: ['self-paced', 'captions'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'cisco-netacad', name: 'Skills for All', provider: 'Cisco Networking Academy',
    url: 'https://skillsforall.com/', region: 'international', providerType: 'professional', cost: 'free', languages: ['en'],
    skills: ['cybersecurity', 'python', 'data-analysis'],
    access: ['self-paced', 'captions'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'freecodecamp', name: 'freeCodeCamp curriculum', provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/', region: 'international', providerType: 'platform', cost: 'free', languages: ['en'],
    skills: ['software-engineering', 'python', 'data-analysis', 'machine-learning'],
    access: ['self-paced', 'text-first'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'fao-elearning', name: 'FAO eLearning Academy', provider: 'Food and Agriculture Organization of the UN',
    url: 'https://elearning.fao.org/', region: 'international', providerType: 'international', cost: 'free', languages: ['en', 'ru'],
    skills: ['smart-agriculture', 'climate-data', 'food-processing'],
    access: ['self-paced', 'text-first'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'openwho', name: 'OpenWHO courses', provider: 'World Health Organization',
    url: 'https://openwho.org/', region: 'international', providerType: 'international', cost: 'free', languages: ['en', 'ru'],
    skills: ['telehealth', 'health-informatics', 'eldercare'],
    access: ['self-paced', 'transcripts'], verification: 'curated', lastChecked: null,
  },
  {
    id: 'coursera', name: 'Coursera (audit option on many courses)', provider: 'Coursera with universities',
    url: 'https://www.coursera.org/', region: 'international', providerType: 'university', cost: 'freemium', languages: ['en'],
    skills: ['data-analysis', 'business-analysis', 'product-management', 'supply-chain', 'project-management', 'machine-learning', 'responsible-ai', 'communication', 'entrepreneurship', 'accounting-finance'],
    access: ['self-paced', 'captions', 'transcripts'], verification: 'curated', lastChecked: null,
  },
];

export const LEARNING_SOURCE_MAP = Object.fromEntries(LEARNING_SOURCES.map((s) => [s.id, s]));
