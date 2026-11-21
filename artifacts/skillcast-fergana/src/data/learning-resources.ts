// ─── Learning resources by place and topic ─────────────────────────────────
// Where to learn, from Fergana outward: Fergana region, the rest of
// Uzbekistan, Central Asia, and online worldwide. Each entry was checked on
// the date in `checked` against the page in `evidence`.
//
// Honesty rules:
// - Real organisations and official links only. Nothing is invented.
// - An address is shown only with its source and how sure it is:
//     'official'    — published by the organisation or a government register
//     'directory'   — from a business or university directory, not confirmed
//                     by the organisation
//     'approximate' — the locality is known, the street address is not
//   No address at all when none could be found: learners are told to ask.
// - `cost` is left out when the price could not be confirmed.
// - `beginner` only when the provider itself says the offer suits beginners.
// - Names and descriptions live in i18n (`lr.<id>.name`, `lr.<id>.d`).

import type { Lang } from '@/lib/types';
import { LEARNING_SOURCES } from './learning-sources';

export type ResourceTopic =
  | 'programming' | 'ai' | 'digital' | 'business' | 'languages' | 'design' | 'crafts'
  | 'embroidery' | 'knitting' | 'sewing' | 'painting' | 'agriculture' | 'vocational';
export const RESOURCE_TOPICS: ResourceTopic[] = [
  'programming', 'ai', 'digital', 'business', 'languages', 'design', 'crafts',
  'embroidery', 'knitting', 'sewing', 'painting', 'agriculture', 'vocational',
];

export type ResourceArea = 'fergana' | 'uzbekistan' | 'central-asia' | 'global';
export const RESOURCE_AREAS: ResourceArea[] = ['fergana', 'uzbekistan', 'central-asia', 'global'];

export type ResourceFormat = 'online' | 'in-person' | 'both';

export interface ResourceAddress {
  line: string;
  confidence: 'official' | 'directory' | 'approximate';
  source: string;
}

export interface LearningResource {
  id: string;
  /** i18n prefix: `lr` for entries here, `ls` for the provider list reused below. */
  copy: 'lr' | 'ls';
  provider: string;
  url: string;
  area: ResourceArea;
  /** Town for in-person learning, in Latin script. */
  city?: string;
  format: ResourceFormat;
  topics: ResourceTopic[];
  /** SkillCast skill slugs this resource helps with. */
  skills: string[];
  languages: Lang[];
  cost?: 'free' | 'freemium' | 'paid';
  beginner?: boolean;
  address?: ResourceAddress;
  contact?: { phone?: string; email?: string };
  checked: string;
  evidence: string;
}

const CHECKED = '2026-11-21';

const LOCAL: LearningResource[] = [
  // ── Fergana region ───────────────────────────────────────────────────────
  {
    id: 'fdu', copy: 'lr', provider: 'Fergana State University', url: 'https://www.fdu.uz',
    area: 'fergana', city: 'Fergana', format: 'in-person', topics: ['languages'], skills: ['english-for-work', 'teaching-training'],
    languages: ['uz', 'ru'], cost: 'paid',
    address: { line: '19 Murabbiylar St, Fergana 150100', confidence: 'official', source: 'https://nqaae.uz/en/higher/201133366' },
    contact: { phone: '+998 73 244-44-02' }, checked: CHECKED, evidence: 'https://nqaae.uz/en/higher/201133366',
  },
  {
    id: 'tuit-fergana', copy: 'lr', provider: 'Fergana branch of TUIT', url: 'https://tuit.uz/en/fargona-filiali',
    area: 'fergana', city: 'Fergana', format: 'in-person', topics: ['programming', 'digital'],
    skills: ['software-engineering', 'cybersecurity', 'digital-literacy'], languages: ['uz', 'ru'], cost: 'paid',
    address: { line: '185 Mustaqillik St, Fergana', confidence: 'directory', source: 'https://www.uni2study.com/universities/uzbekistan/tashkent-university-of-information-technologiesfergana-branch-of-tashkent-university-of-information-technologies' },
    contact: { phone: '+998 73 222-20-30', email: 'tuitff@tuit.uz' }, checked: CHECKED, evidence: 'https://tuit.uz/en/fargona-filiali',
  },
  {
    id: 'itpark-fergana', copy: 'lr', provider: 'IT Park Uzbekistan', url: 'https://it-park.uz/en',
    area: 'fergana', city: 'Fergana', format: 'in-person', topics: ['programming', 'ai', 'business'],
    skills: ['software-engineering', 'python', 'entrepreneurship', 'digital-literacy'], languages: ['uz', 'ru'],
    checked: CHECKED, evidence: 'https://outsource.gov.uz/media/it-park-to-establish-new-branches-in-fergana',
  },
  {
    id: 'ishga-marhamat-fergana', copy: 'lr', provider: 'Ministry of Employment and Poverty Reduction', url: 'https://gov.uz/en/bv',
    area: 'fergana', city: 'Fergana', format: 'in-person', topics: ['vocational', 'sewing', 'digital', 'languages', 'business'],
    skills: ['textile-production', 'electrical-maintenance', 'digital-literacy', 'entrepreneurship'], languages: ['uz', 'ru'],
    checked: CHECKED, evidence: 'https://gov.uz/en/yoshlar/news/view/138836',
  },
  {
    id: 'margilan-crafts', copy: 'lr', provider: 'Margilan Crafts Development Centre', url: 'https://uzbekistan.travel/en/o/margilan-craft-centers',
    area: 'fergana', city: 'Margilan', format: 'in-person', topics: ['crafts', 'embroidery', 'sewing'],
    skills: ['textile-production', 'entrepreneurship'], languages: ['uz', 'ru'],
    address: { line: 'Sayid Ahmad Khoja madrasa, Margilan', confidence: 'approximate', source: 'https://ikatuzcenter.blogspot.com/2017/02/margilan-crafts-development-center.html' },
    checked: CHECKED, evidence: 'https://uzbekistan.travel/en/o/margilan-craft-centers',
  },
  {
    id: 'rishton-ceramics', copy: 'lr', provider: 'Rustam Usmanov ceramics workshop', url: 'https://www.lonelyplanet.com/uzbekistan/attractions/rishton-ceramic-museum/a/poi-sig/1384103/357826',
    area: 'fergana', city: 'Rishton', format: 'in-person', topics: ['crafts', 'painting'], skills: ['entrepreneurship'],
    languages: ['uz', 'ru'],
    address: { line: 'Rishton, about 1 km west of the centre on the road to Kokand', confidence: 'approximate', source: 'https://www.lonelyplanet.com/uzbekistan/attractions/rishton-ceramic-museum/a/poi-sig/1384103/357826' },
    checked: CHECKED, evidence: 'https://www.lonelyplanet.com/points-of-interest/rishton-ceramic-museum/1384103',
  },
  // ── Uzbekistan ───────────────────────────────────────────────────────────
  {
    id: 'uzbekcoders', copy: 'lr', provider: 'IT Park / Ministry of Digital Technologies', url: 'https://uzbekcoders.uz',
    area: 'uzbekistan', format: 'online', topics: ['programming', 'ai', 'digital'],
    skills: ['software-engineering', 'python', 'data-analysis', 'prompt-engineering', 'digital-literacy'],
    languages: ['uz', 'en'], cost: 'free', beginner: true, checked: CHECKED, evidence: 'https://it-park.uz/en/itpark/news/programming-education-in-uzbekistan-is-becoming-more-and-more-accessible',
  },
  {
    id: 'mohirdev', copy: 'lr', provider: 'Mohirdev', url: 'https://mohirdev.uz',
    area: 'uzbekistan', format: 'online', topics: ['programming', 'digital'], skills: ['software-engineering', 'python', 'data-analysis'],
    languages: ['uz'], cost: 'paid', checked: CHECKED, evidence: 'https://techbullion.com/uzbekistans-edtech-boom-6-platforms-building-the-workforce-behind-its-it-export-surge/',
  },
  {
    id: 'goethe-tashkent', copy: 'lr', provider: 'Goethe-Institut Uzbekistan', url: 'https://www.goethe.de/ins/uz/de/spr/kur.html',
    area: 'uzbekistan', city: 'Tashkent', format: 'in-person', topics: ['languages'], skills: ['communication'],
    languages: ['uz', 'ru'], cost: 'paid',
    address: { line: '42 Amir Temur St, Tashkent 100000', confidence: 'official', source: 'https://www.goethe.de/ins/uz/de/ueb.html' },
    contact: { phone: '+998 78 140 14 70', email: 'info-taschkent@goethe.de' }, checked: CHECKED, evidence: 'https://www.goethe.de/ins/uz/de/ueb.html',
  },
  {
    id: 'hunarmand', copy: 'lr', provider: '“Hunarmand” Association of Uzbekistan', url: 'https://hunar.uz/?lang=en',
    area: 'uzbekistan', format: 'in-person', topics: ['crafts', 'embroidery', 'sewing'], skills: ['textile-production', 'entrepreneurship'],
    languages: ['uz', 'ru'], checked: CHECKED, evidence: 'https://handicraftman.uz/en/a-press-conference-by-the-association-hunarmand-of-the-republic-of-uzbekistan/',
  },
  {
    id: 'andijan-agri', copy: 'lr', provider: 'Andijan Institute of Agriculture and Agrotechnologies', url: 'https://andqxai.uz',
    area: 'uzbekistan', city: 'Andijan', format: 'in-person', topics: ['agriculture'], skills: ['smart-agriculture', 'food-processing'],
    languages: ['uz', 'ru'], cost: 'paid',
    address: { line: '1 Oliygoh St, Kuyganyor, Andijan region', confidence: 'directory', source: 'https://www.goldenpages.uz/en/rubrics/?Id=104419' },
    contact: { phone: '+998 74 373-17-90' }, checked: CHECKED, evidence: 'https://nqaae.uz/en/higher/200258091',
  },
  // ── Central Asia ─────────────────────────────────────────────────────────
  {
    id: 'uca-spce', copy: 'lr', provider: 'University of Central Asia', url: 'https://ucentralasia.org/schools/school-of-professional-and-continuing-education/about-spce',
    area: 'central-asia', format: 'both', topics: ['business', 'languages', 'programming', 'vocational'],
    skills: ['accounting-finance', 'english-for-work', 'digital-literacy', 'cybersecurity'], languages: ['ru', 'en'],
    checked: CHECKED, evidence: 'https://ucentralasia.org/schools/school-of-professional-and-continuing-education/about-spce',
  },
  {
    id: 'carec', copy: 'lr', provider: 'CAREC Institute', url: 'https://elearning.carecinstitute.org',
    area: 'central-asia', format: 'online', topics: ['business'], skills: ['supply-chain', 'business-analysis'],
    languages: ['en'], checked: CHECKED, evidence: 'https://elearning.carecinstitute.org/learning-modules/page/5',
  },
  // ── Online, worldwide ────────────────────────────────────────────────────
  {
    id: 'kaggle-learn', copy: 'lr', provider: 'Kaggle', url: 'https://www.kaggle.com/learn',
    area: 'global', format: 'online', topics: ['programming', 'ai'], skills: ['python', 'machine-learning', 'data-analysis'],
    languages: ['en'], cost: 'free', beginner: true, checked: CHECKED, evidence: 'https://support.access-ci.org/knowledge-base/resources/5308',
  },
  {
    id: 'alison', copy: 'lr', provider: 'Alison', url: 'https://alison.com/tag/sewing',
    area: 'global', format: 'online', topics: ['sewing', 'business', 'vocational'], skills: ['textile-production', 'entrepreneurship'],
    languages: ['en'], cost: 'freemium', beginner: true, checked: CHECKED, evidence: 'https://alison.com/course/basics-of-sewing',
  },
  {
    id: 'rsn', copy: 'lr', provider: 'Royal School of Needlework', url: 'https://royal-needlework.org.uk/courses/online-tuition/',
    area: 'global', format: 'both', topics: ['embroidery'], skills: ['textile-production'], languages: ['en'], cost: 'paid', beginner: true,
    address: { line: 'Apartment 12a, Hampton Court Palace, Surrey KT8 9AU, United Kingdom', confidence: 'official', source: 'https://royal-needlework.org.uk/product-tag/leisure-classes/page/2' },
    contact: { phone: '+44 20 3166 6932' }, checked: CHECKED, evidence: 'https://royal-needlework.org.uk/courses/online-tuition/',
  },
  {
    id: 'domestika', copy: 'lr', provider: 'Domestika', url: 'https://www.domestika.org/en/courses/area/237-knitting',
    area: 'global', format: 'online', topics: ['knitting', 'embroidery', 'painting', 'design', 'crafts'], skills: ['graphic-design', 'textile-production'],
    languages: ['en', 'ru'], cost: 'paid', beginner: true, checked: CHECKED, evidence: 'https://www.domestika.org/en/courses/3403-the-secrets-of-flat-and-circular-knitting',
  },
  {
    id: 'ilo-siyb', copy: 'lr', provider: 'International Labour Organization', url: 'https://www.ilo.org/start-and-improve-your-business-siyb',
    area: 'global', format: 'both', topics: ['business'], skills: ['entrepreneurship', 'accounting-finance'], languages: ['en', 'ru'],
    checked: CHECKED, evidence: 'https://www.ilo.org/start-and-improve-your-business-siyb',
  },
];

// The existing provider list joins the same search, so nothing is duplicated.
const TOPICS_FOR_SKILL: Record<string, ResourceTopic[]> = {
  'prompt-engineering': ['ai'], 'machine-learning': ['ai'], 'responsible-ai': ['ai'], 'ai-augmented-ops': ['ai'], 'ai-agents': ['ai'],
  python: ['programming'], 'software-engineering': ['programming'], 'data-analysis': ['programming'], cybersecurity: ['digital'],
  'digital-literacy': ['digital'], 'english-for-work': ['languages'], 'graphic-design': ['design'], entrepreneurship: ['business'],
  'project-management': ['business'], 'smart-agriculture': ['agriculture'], 'textile-production': ['vocational', 'sewing'],
  'electrical-maintenance': ['vocational'], 'food-processing': ['vocational'], 'tourism-hospitality': ['vocational', 'languages'],
  'sales-negotiation': ['business'], 'telehealth': ['digital'], 'health-informatics': ['digital'],
};
const FROM_PROVIDERS: LearningResource[] = LEARNING_SOURCES.map((s) => ({
  id: s.id, copy: 'ls', provider: s.provider, url: s.url,
  area: s.region === 'uzbekistan' ? 'uzbekistan' : 'global',
  format: s.access.includes('in-person-support') ? 'both' : 'online',
  topics: [...new Set(s.skills.flatMap((k) => TOPICS_FOR_SKILL[k] ?? []))],
  skills: s.skills, languages: s.languages, cost: s.cost, beginner: s.level === 'beginner',
  checked: s.lastChecked ?? '', evidence: s.url,
}));

export const LEARNING_RESOURCES: LearningResource[] = [...LOCAL, ...FROM_PROVIDERS];
export const LOCAL_RESOURCE_IDS = LOCAL.map((r) => r.id);
