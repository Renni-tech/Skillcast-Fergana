// ─── Learning catalogue: one list of every place to learn ──────────────────
// Joins three sources into one shape the catalogue UI, the ranking and the
// assistant can read:
//   1. src/data/catalog/resources.json — the researched catalogue. Add new
//      entries there; no UI code changes are needed.
//   2. public/catalog/extra.json — optional entries loaded at runtime, so a
//      deployed site can gain entries without a rebuild (see useCatalog).
//   3. The older lists in src/data/learning-resources.ts, given the same
//      fields through LEGACY below.
//
// Honesty rules (also in src/data/catalog/README.md):
// - Real providers only. Every entry cites evidence links.
// - `availability` says what was confirmed on the check date: 'open' (taking
//   applications), 'ongoing' (running, no fixed intake), 'upcoming' (announced
//   for later), 'closed' (finished) or 'unknown' (not confirmed).
// - `cost` 'unknown' whenever the price was not confirmed. `duration` only
//   when a source states it.
// - `verification`: 'verified' (the offer itself was checked), 'partial'
//   (some details are third-party or dated) or 'provider' (only the provider
//   and its field are confirmed; ask it about courses).

import { useEffect, useState } from 'react';
import { z } from 'zod';
import raw from '@/data/catalog/resources.json';
import { LEARNING_RESOURCES, type LearningResource, type ResourceArea } from '@/data/learning-resources';
import { LEARNING_SOURCE_MAP } from '@/data/learning-sources';
import type { Lang } from './types';

export const CATALOG_TOPICS = [
  'ai', 'programming', 'data', 'cybersecurity', 'robotics', 'digital', 'design', 'ecommerce',
  'business', 'entrepreneurship', 'accounting', 'languages', 'education', 'engineering', 'green', 'agriculture',
  'construction', 'electrical', 'plumbing', 'automotive', 'driving', 'sewing', 'textile', 'fashion', 'embroidery',
  'knitting', 'calligraphy', 'ceramics', 'crafts', 'painting', 'culinary', 'hospitality', 'tourism', 'beauty',
  'healthcare', 'vocational',
] as const;
export type CatalogTopic = typeof CATALOG_TOPICS[number];

export const CATALOG_CATEGORIES = ['ai-digital', 'practical'] as const;
export type CatalogCategory = typeof CATALOG_CATEGORIES[number];
export const CATALOG_MODES = ['online', 'offline', 'hybrid'] as const;
export type CatalogMode = typeof CATALOG_MODES[number];
export const CATALOG_COSTS = ['free', 'freemium', 'grant', 'paid', 'unknown'] as const;
export type CatalogCost = typeof CATALOG_COSTS[number];
export const CATALOG_AVAILABILITY = ['open', 'ongoing', 'upcoming', 'closed', 'unknown'] as const;
export type CatalogAvailability = typeof CATALOG_AVAILABILITY[number];
export const CATALOG_KINDS = ['course', 'programme', 'degree', 'workshop', 'exam', 'provider'] as const;
export type CatalogKind = typeof CATALOG_KINDS[number];
export type CatalogVerification = 'verified' | 'partial' | 'provider';
type TextLang = 'en' | 'uz' | 'ru';

const l10n = z.object({ en: z.string().min(1), uz: z.string().min(1), ru: z.string().min(1) });
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const catalogEntrySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  provider: z.string().min(1),
  badge: z.string().min(1),
  url: z.string().url(),
  evidence: z.array(z.string().url()).min(1),
  category: z.enum(CATALOG_CATEGORIES),
  kind: z.enum(CATALOG_KINDS),
  topics: z.array(z.enum(CATALOG_TOPICS)).min(1),
  skills: z.array(z.string()),
  mode: z.enum(CATALOG_MODES),
  area: z.enum(['fergana', 'uzbekistan', 'central-asia', 'global']),
  city: z.string().optional(),
  address: z.object({ line: z.string(), confidence: z.enum(['official', 'directory', 'approximate']), source: z.string().url() }).optional(),
  contact: z.object({ phone: z.string().optional(), email: z.string().optional() }).optional(),
  cost: z.enum(CATALOG_COSTS),
  stateFunded: z.boolean(),
  availability: z.enum(CATALOG_AVAILABILITY),
  dates: z.object({ start: isoDate.optional(), end: isoDate.optional() }).optional(),
  duration: l10n.optional(),
  languages: z.array(z.string()).min(1),
  verification: z.enum(['verified', 'partial', 'provider']),
  beginner: z.boolean().optional(),
  text: z.object({ name: l10n, d: l10n, note: l10n.optional() }),
});

export type CatalogText = z.infer<typeof catalogEntrySchema>['text'];

export interface CatalogEntry {
  id: string;
  provider: string;
  /** Short provider/source label shown on the card. */
  badge: string;
  url: string;
  evidence: string[];
  checked: string;
  category: CatalogCategory;
  kind: CatalogKind;
  topics: CatalogTopic[];
  skills: string[];
  mode: CatalogMode;
  area: ResourceArea;
  city?: string;
  address?: LearningResource['address'];
  contact?: LearningResource['contact'];
  cost: CatalogCost;
  stateFunded: boolean;
  availability: CatalogAvailability;
  dates?: { start?: string; end?: string };
  duration?: Record<TextLang, string>;
  languages: string[];
  verification: CatalogVerification;
  beginner?: boolean;
  /** Inline text (catalogue JSON) or an i18n key prefix (older lists). */
  text?: CatalogText;
  copyKey?: string;
}

/** Parses a catalogue file; bad entries are dropped and reported, not fatal. */
export function parseCatalog(input: unknown, checkedFallback: string): { entries: CatalogEntry[]; errors: string[] } {
  const file = z.object({ checked: isoDate.optional(), entries: z.array(z.unknown()) }).safeParse(input);
  if (!file.success) return { entries: [], errors: ['catalogue file has no "entries" list'] };
  const checked = file.data.checked ?? checkedFallback;
  const entries: CatalogEntry[] = [];
  const errors: string[] = [];
  for (const item of file.data.entries) {
    const parsed = catalogEntrySchema.safeParse(item);
    if (parsed.success) entries.push({ ...parsed.data, checked });
    else errors.push(`${(item as { id?: string })?.id ?? '?'}: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
  }
  return { entries, errors };
}

// ─── Older lists, given catalogue fields ───────────────────────────────────
// category · kind · availability · cost · stateFunded · verification · badge
type Legacy = [CatalogCategory, CatalogKind, CatalogAvailability, CatalogCost | null, boolean, CatalogVerification, string, CatalogTopic[]?];
const LEGACY: Record<string, Legacy> = {
  fdu: ['practical', 'degree', 'ongoing', null, true, 'provider', 'Fergana State University'],
  'tuit-fergana': ['ai-digital', 'degree', 'ongoing', null, true, 'provider', 'TUIT Fergana', ['programming', 'cybersecurity', 'digital']],
  'itpark-fergana': ['ai-digital', 'provider', 'ongoing', 'unknown', true, 'provider', 'Uzbekcoders / IT Park'],
  'ishga-marhamat-fergana': ['practical', 'provider', 'ongoing', 'unknown', true, 'provider', 'Ishga Marhamat Monocenter', ['vocational', 'sewing', 'electrical', 'languages', 'entrepreneurship', 'digital']],
  'margilan-crafts': ['practical', 'workshop', 'ongoing', 'unknown', false, 'provider', 'Margilan silk', ['textile', 'embroidery', 'crafts']],
  'rishton-ceramics': ['practical', 'workshop', 'ongoing', 'unknown', false, 'provider', 'Rishtan ceramics', ['ceramics', 'crafts', 'painting']],
  uzbekcoders: ['ai-digital', 'programme', 'ongoing', null, true, 'verified', 'Uzbekcoders / IT Park', ['programming', 'ai', 'data', 'digital']],
  mohirdev: ['ai-digital', 'provider', 'ongoing', null, false, 'provider', 'Mohirdev', ['programming', 'data', 'ai']],
  'goethe-tashkent': ['practical', 'provider', 'ongoing', null, false, 'verified', 'Goethe-Institut'],
  hunarmand: ['practical', 'provider', 'ongoing', 'unknown', false, 'provider', 'Hunarmand', ['crafts', 'embroidery', 'sewing']],
  'andijan-agri': ['practical', 'degree', 'ongoing', null, true, 'provider', 'Andijan Agri Institute'],
  'uca-spce': ['practical', 'provider', 'ongoing', 'unknown', false, 'provider', 'UCA'],
  carec: ['practical', 'provider', 'ongoing', 'unknown', false, 'provider', 'CAREC Institute'],
  'kaggle-learn': ['ai-digital', 'course', 'ongoing', null, false, 'verified', 'Kaggle', ['ai', 'programming', 'data']],
  alison: ['practical', 'provider', 'ongoing', null, false, 'verified', 'Alison'],
  rsn: ['practical', 'provider', 'ongoing', null, false, 'verified', 'Royal School of Needlework'],
  domestika: ['practical', 'provider', 'ongoing', null, false, 'verified', 'Domestika'],
  'ilo-siyb': ['practical', 'programme', 'ongoing', 'unknown', false, 'provider', 'ILO', ['entrepreneurship', 'business']],
  'mehnat-vocational': ['practical', 'programme', 'ongoing', null, true, 'verified', 'Ishga Marhamat Monocenter'],
  itpark: ['ai-digital', 'programme', 'ongoing', null, true, 'verified', 'Uzbekcoders / IT Park'],
  elementsofai: ['ai-digital', 'course', 'ongoing', null, false, 'verified', 'Elements of AI', ['ai']],
  'w3c-wai': ['ai-digital', 'course', 'ongoing', null, false, 'verified', 'W3C WAI', ['digital', 'design']],
  'ms-learn': ['ai-digital', 'provider', 'ongoing', null, false, 'verified', 'Microsoft Learn', ['ai', 'programming', 'data', 'cybersecurity']],
  'british-council': ['practical', 'provider', 'ongoing', null, false, 'verified', 'British Council', ['languages']],
  khan: ['practical', 'provider', 'ongoing', null, false, 'verified', 'Khan Academy', ['education', 'programming']],
  gcfglobal: ['ai-digital', 'provider', 'ongoing', null, false, 'verified', 'GCFGlobal', ['digital']],
  'canva-design': ['ai-digital', 'course', 'ongoing', null, false, 'verified', 'Canva', ['design']],
  'cisco-netacad': ['ai-digital', 'provider', 'ongoing', null, false, 'verified', 'Cisco', ['cybersecurity', 'programming', 'digital']],
  freecodecamp: ['ai-digital', 'course', 'ongoing', null, false, 'verified', 'freeCodeCamp', ['programming']],
  'fao-elearning': ['practical', 'provider', 'ongoing', null, false, 'verified', 'FAO', ['agriculture', 'green']],
  openwho: ['practical', 'provider', 'ongoing', null, false, 'verified', 'WHO', ['healthcare']],
  coursera: ['ai-digital', 'provider', 'ongoing', null, false, 'verified', 'Coursera'],
};

const TOPIC_FROM_LEGACY: Record<string, CatalogTopic> = { vocational: 'vocational' };
const MODE: Record<LearningResource['format'], CatalogMode> = { online: 'online', 'in-person': 'offline', both: 'hybrid' };

function fromLegacy(r: LearningResource): CatalogEntry | null {
  const meta = LEGACY[r.id];
  if (!meta) return null;
  const [category, kind, availability, cost, stateFunded, verification, badge, topics] = meta;
  const legacyTopics = r.topics.map((tp) => TOPIC_FROM_LEGACY[tp] ?? (tp as CatalogTopic)).filter((tp) => (CATALOG_TOPICS as readonly string[]).includes(tp));
  const source = r.copy === 'ls' ? LEARNING_SOURCE_MAP[r.id] : undefined;
  return {
    id: r.id, provider: r.provider, badge, url: r.url, evidence: [r.evidence], checked: r.checked || '2026-11-21',
    category, kind, topics: [...new Set([...(topics ?? []), ...legacyTopics])], skills: r.skills,
    mode: r.id === 'goethe-tashkent' ? 'hybrid' : MODE[r.format], area: r.area, city: r.city, address: r.address, contact: r.contact,
    cost: cost ?? (r.cost ?? 'unknown'), stateFunded, availability, languages: r.languages,
    verification: source?.verification === 'curated' ? 'provider' : verification,
    beginner: r.beginner, copyKey: `${r.copy}.${r.id}`,
  };
}

const BUNDLED = parseCatalog(raw, '2026-11-22');
if (BUNDLED.errors.length && typeof console !== 'undefined') console.warn('[catalogue] skipped entries:', BUNDLED.errors);

export const CATALOG: CatalogEntry[] = [
  ...BUNDLED.entries,
  ...LEARNING_RESOURCES.map(fromLegacy).filter((e): e is CatalogEntry => e !== null),
];
export const CATALOG_MAP: Record<string, CatalogEntry> = Object.fromEntries(CATALOG.map((e) => [e.id, e]));

/** Bundled catalogue plus runtime extras from /catalog/extra.json, if any. */
export function useCatalog(): CatalogEntry[] {
  const [extra, setExtra] = useState<CatalogEntry[]>(extraCache ?? []);
  useEffect(() => {
    if (extraCache) return;
    let live = true;
    loadExtra().then((entries) => { if (live) setExtra(entries); });
    return () => { live = false; };
  }, []);
  return extra.length ? [...CATALOG, ...extra.filter((e) => !CATALOG_MAP[e.id])] : CATALOG;
}

let extraCache: CatalogEntry[] | null = null;
async function loadExtra(): Promise<CatalogEntry[]> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL ?? '/'}catalog/extra.json`, { cache: 'no-cache' });
    if (!res.ok) return (extraCache = []);
    const parsed = parseCatalog(await res.json(), new Date().toISOString().slice(0, 10));
    if (parsed.errors.length) console.warn('[catalogue] skipped extra entries:', parsed.errors);
    for (const e of parsed.entries) CATALOG_MAP[e.id] ??= e;
    return (extraCache = parsed.entries);
  } catch {
    return (extraCache = []);
  }
}

// ─── Reading entries ───────────────────────────────────────────────────────
type T = (key: string, vars?: Record<string, string | number>) => string;

/** Language used for inline text: Uzbek Cyrillic reads the Uzbek copy. */
export function textLang(lang: Lang): TextLang {
  return (lang === 'ru' || lang === 'en' ? lang : 'uz');
}
export function entryName(t: T, lang: Lang, e: CatalogEntry): string {
  return e.text ? e.text.name[textLang(lang)] : t(`${e.copyKey}.name`);
}
export function entryDesc(t: T, lang: Lang, e: CatalogEntry): string {
  return e.text ? e.text.d[textLang(lang)] : t(`${e.copyKey}.d`);
}
export function entryNote(lang: Lang, e: CatalogEntry): string | null {
  return e.text?.note?.[textLang(lang)] ?? null;
}
export function entryDuration(lang: Lang, e: CatalogEntry): string | null {
  return e.duration?.[textLang(lang)] ?? null;
}

/** Shape the existing ranking (lib/resource-match) understands. */
export function asLearningResource(e: CatalogEntry): LearningResource & { catalog: CatalogEntry } {
  return {
    id: e.id, copy: 'lr', provider: e.provider, url: e.url, area: e.area, city: e.city,
    format: e.mode === 'online' ? 'online' : e.mode === 'offline' ? 'in-person' : 'both',
    topics: e.topics as unknown as LearningResource['topics'], skills: e.skills,
    languages: e.languages.filter((l): l is Lang => l === 'uz' || l === 'ru' || l === 'en'),
    cost: e.cost === 'free' || e.cost === 'grant' ? 'free' : e.cost === 'freemium' ? 'freemium' : e.cost === 'paid' ? 'paid' : undefined,
    beginner: e.beginner, address: e.address, contact: e.contact, checked: e.checked, evidence: e.evidence[0], catalog: e,
  };
}

// ─── Filtering ─────────────────────────────────────────────────────────────
export type CatalogView = 'all' | 'ai-digital' | 'practical' | 'free' | 'state' | 'upcoming';
export const CATALOG_VIEWS: CatalogView[] = ['all', 'ai-digital', 'practical', 'free', 'state', 'upcoming'];

export interface CatalogFilter {
  view: CatalogView;
  query: string;
  topic: CatalogTopic | 'all';
  mode: CatalogMode | 'all';
  area: ResourceArea | 'all';
  /** Hide finished programmes unless asked. */
  showClosed: boolean;
}
export const DEFAULT_FILTER: CatalogFilter = { view: 'all', query: '', topic: 'all', mode: 'all', area: 'all', showClosed: true };

/** Lowercase, strip Uzbek apostrophes and accents, so “o‘quv”, “o'quv” and “oquv” match. */
export function foldText(s: string): string {
  return s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[‘’ʻʼ'`´]/g, '').replace(/ё/g, 'е');
}

export function matchesView(e: CatalogEntry, view: CatalogView): boolean {
  switch (view) {
    case 'ai-digital': return e.category === 'ai-digital';
    case 'practical': return e.category === 'practical';
    case 'free': return e.cost === 'free' || e.cost === 'grant' || e.cost === 'freemium';
    case 'state': return e.stateFunded;
    case 'upcoming': return e.availability === 'upcoming';
    default: return true;
  }
}

export function filterCatalog(entries: CatalogEntry[], f: CatalogFilter, haystack: (e: CatalogEntry) => string): CatalogEntry[] {
  const words = foldText(f.query).split(/\s+/).filter(Boolean);
  return entries.filter((e) => {
    if (!matchesView(e, f.view)) return false;
    if (f.topic !== 'all' && !e.topics.includes(f.topic)) return false;
    if (f.mode !== 'all' && e.mode !== f.mode && !(e.mode === 'hybrid')) return false;
    if (f.area !== 'all' && e.area !== f.area) return false;
    if (!f.showClosed && e.availability === 'closed') return false;
    if (words.length) {
      const hay = foldText(haystack(e));
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}

/** Counts per view, for the filter pills. */
export function viewCounts(entries: CatalogEntry[]): Record<CatalogView, number> {
  return Object.fromEntries(CATALOG_VIEWS.map((v) => [v, entries.filter((e) => matchesView(e, v)).length])) as Record<CatalogView, number>;
}

const AVAILABILITY_ORDER: Record<CatalogAvailability, number> = { open: 0, ongoing: 1, upcoming: 2, unknown: 3, closed: 4 };
/** Open first, finished last; then Fergana first. */
export function sortCatalog(entries: CatalogEntry[], home: ResourceArea, score?: Map<string, number>): CatalogEntry[] {
  const near: Record<ResourceArea, number> = { fergana: 0, uzbekistan: 1, 'central-asia': 2, global: 3 };
  return [...entries].sort((a, b) =>
    (score ? (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0) : 0)
    || AVAILABILITY_ORDER[a.availability] - AVAILABILITY_ORDER[b.availability]
    || (a.area === home ? -1 : 0) - (b.area === home ? -1 : 0)
    || near[a.area] - near[b.area]
    || a.id.localeCompare(b.id));
}
